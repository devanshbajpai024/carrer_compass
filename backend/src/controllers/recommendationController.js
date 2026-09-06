const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const { generateRecommendations, calculateMatch } = require('../services/recommendationEngine');
const { generateGroqResponse } = require('../services/aiService');


exports.getRecommendations = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    let query = { studentId: req.user._id };
    const pipeline = [
      { $match: { studentId: req.user._id } },
      { 
        $lookup: {
          from: 'opportunities',
          localField: 'opportunityId',
          foreignField: '_id',
          as: 'opportunity'
        }
      },
      { $unwind: '$opportunity' }
    ];

    if (type) {
      pipeline.push({ $match: { 'opportunity.type': type } });
    }

    pipeline.push({ $sort: { matchScore: -1 } });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: parseInt(limit) });

    const recommendations = await Recommendation.aggregate(pipeline);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({ 
      _id: req.params.id, 
      studentId: req.user._id 
    }).populate('opportunityId');
    
    if (!recommendation) return res.status(404).json({ success: false, message: 'Recommendation not found' });
    res.json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.refreshRecommendations = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    await generateRecommendations(student);
    res.json({ success: true, message: 'Recommendations refreshed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.evaluateRecommendation = async (req, res) => {
  try {
    const { student, opportunity } = req.body;
    if (!student || !opportunity) {
      return res.status(400).json({ success: false, message: 'student and opportunity objects are required' });
    }

    // 1. Rule-based Engine
    const ruleMatch = calculateMatch(student, opportunity);
    const matchScore = ruleMatch.matchScore;

    // 2. Python ML Server Integration
    let mlPrediction = null;
    let mlLabel = 'ML Unavailable';
    try {
      const mlPayload = {
        student: {
          student_skills: student.skills ? student.skills.map(s => s.name || s.skill).join(';') : '',
          student_interests: student.interests ? student.interests.join(';') : '',
          career_goal: (student.careerGoals && student.careerGoals.length) ? student.careerGoals[0] : 'Unknown',
          eligibility: student.education ? student.education.degree : 'Open',
          location_preference: (student.preferences && student.preferences.remote) ? 'Remote' : 'Office',
          experience: student.experience ? String(student.experience.length) : "0"
        },
        opportunity: {
          id: opportunity._id || 'opp1',
          requiredSkills: opportunity.skills ? opportunity.skills.map(s => s.skill) : [],
          interests: opportunity.tags || [],
          careerField: (opportunity.careerDomains && opportunity.careerDomains.length) ? opportunity.careerDomains[0] : 'Unknown',
          category: opportunity.type || 'INTERNSHIP',
          location: opportunity.remote ? 'Remote' : (opportunity.location || 'Unknown'),
          experienceRequired: "0",
          eligibility: opportunity.eligibility && opportunity.eligibility.degrees ? opportunity.eligibility.degrees[0] : 'Open'
        }
      };

      const mlResponse = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload)
      });
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        mlPrediction = mlData.prediction;
        mlLabel = mlData.recommendation;
      } else {
        console.warn('ML Server returned non-ok status:', mlResponse.status);
      }
    } catch (mlErr) {
      console.warn('ML Server unavailable:', mlErr.message);
    }

    // 3. Groq AI Explanation
    let explanation = 'AI explanation unavailable';
    try {
      const systemPrompt = `You are an expert Career Coach Assistant for the Student Opportunity Engine. 
You are evaluating a potential match between a student and an opportunity.
Rule-Based Score: ${matchScore}%
ML Prediction (0-4): ${mlPrediction} (${mlLabel})
Analyze why this is a good or bad fit based on their skills and the opportunity requirements. Keep it under 3 sentences and be highly personalized.`;
      
      const userMessage = `Student Skills: ${student.skills ? student.skills.map(s => s.name || s.skill).join(', ') : student.student_skills || 'None'}
Opportunity Requirements: ${opportunity.skills ? opportunity.skills.map(s => s.skill).join(', ') : opportunity.requiredSkills ? opportunity.requiredSkills.join(', ') : 'None'}`;
      
      explanation = await generateGroqResponse(systemPrompt, userMessage);
    } catch (groqErr) {
      explanation = `Error: ${groqErr.message} | Stack: ${groqErr.stack}`;
      console.warn('Groq AI unavailable:', groqErr);
    }

    // 4. Combined Response
    res.json({
      success: true,
      data: {
        matchScore,
        mlPrediction,
        mlLabel,
        explanation,
        reasons: ruleMatch.reasons,
        missingSkills: ruleMatch.missingSkills
      }
    });

  } catch (error) {
    console.error('Evaluate Recommendation Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
