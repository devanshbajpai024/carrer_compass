const Opportunity = require('../models/Opportunity');
const Recommendation = require('../models/Recommendation');

// Weights
const WEIGHTS = {
  SKILLS: 0.35,
  CAREER: 0.20,
  INTERESTS: 0.15,
  EDUCATION: 0.15,
  EXPERIENCE: 0.10,
  PREFERENCES: 0.05
};

const calculateMatch = (student, opportunity) => {
  const breakdown = {
    skillsScore: 0,
    careerScore: 0,
    interestsScore: 0,
    educationScore: 0,
    experienceScore: 0,
    preferencesScore: 0
  };
  const matchedSkills = [];
  const missingSkills = [];
  const reasons = [];

  // 1. Skills Matching (35%)
  if (opportunity.skills && opportunity.skills.length > 0) {
    let skillMatch = 0;
    const totalRequired = opportunity.skills.length;
    
    opportunity.skills.forEach(reqSkill => {
      const studentSkill = student.skills.find(s => s.name.toLowerCase() === reqSkill.skill.toLowerCase());
      if (studentSkill && studentSkill.level >= 20) { // basic threshold
        skillMatch += 1;
        matchedSkills.push(reqSkill.skill);
      } else {
        missingSkills.push(reqSkill.skill);
      }
    });

    breakdown.skillsScore = (skillMatch / totalRequired) * 100;
    if (skillMatch > 0) reasons.push(`${skillMatch} of ${totalRequired} required skills match your profile`);
    else reasons.push('You are missing some key skills for this opportunity');
  } else {
    breakdown.skillsScore = 100; // No skills required = full match
  }

  // 2. Career Goal Matching (20%)
  if (student.careerGoals && student.careerGoals.length > 0 && opportunity.careerDomains && opportunity.careerDomains.length > 0) {
    const hasCareerMatch = student.careerGoals.some(goal => 
      opportunity.careerDomains.some(domain => domain.toLowerCase().includes(goal.toLowerCase()) || goal.toLowerCase().includes(domain.toLowerCase()))
    );
    if (hasCareerMatch) {
      breakdown.careerScore = 100;
      reasons.push('This opportunity aligns with your career goals');
    }
  } else {
    breakdown.careerScore = 50; // Neutral
  }

  // 3. Interests Matching (15%)
  if (student.interests && student.interests.length > 0 && opportunity.tags && opportunity.tags.length > 0) {
    const hasInterestMatch = student.interests.some(interest => 
      opportunity.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(tag.toLowerCase()))
    );
    if (hasInterestMatch) {
      breakdown.interestsScore = 100;
      reasons.push('Matches your indicated interests');
    }
  } else {
    breakdown.interestsScore = 50; // Neutral
  }

  // 4. Education/Eligibility (15%)
  if (opportunity.eligibility) {
    let eligible = true;
    const ed = student.education || {};
    
    if (opportunity.eligibility.minimumCGPA && ed.cgpa < opportunity.eligibility.minimumCGPA) eligible = false;
    if (opportunity.eligibility.minimumYear && ed.year < opportunity.eligibility.minimumYear) eligible = false;
    
    if (eligible) {
      breakdown.educationScore = 100;
      reasons.push('You meet the education and eligibility criteria');
    } else {
      breakdown.educationScore = 0;
      reasons.push('You may not meet all education eligibility criteria');
    }
  } else {
    breakdown.educationScore = 100; // No strict criteria
  }

  // 5. Experience (10%)
  if (student.experience && student.experience.length > 0) {
    breakdown.experienceScore = 100; // Has some experience
  } else {
    breakdown.experienceScore = 50; // Beginner
  }

  // 6. Preferences (5%)
  if (student.preferences) {
    let prefScore = 50;
    if (opportunity.remote && student.preferences.remote) {
      prefScore = 100;
      reasons.push('Matches your remote work preference');
    }
    if (student.preferences.preferredOpportunityTypes && student.preferences.preferredOpportunityTypes.includes(opportunity.type)) {
      prefScore = 100;
    }
    breakdown.preferencesScore = prefScore;
  } else {
    breakdown.preferencesScore = 50;
  }

  // Calculate final score
  const matchScore = Math.round(
    (breakdown.skillsScore * WEIGHTS.SKILLS) +
    (breakdown.careerScore * WEIGHTS.CAREER) +
    (breakdown.interestsScore * WEIGHTS.INTERESTS) +
    (breakdown.educationScore * WEIGHTS.EDUCATION) +
    (breakdown.experienceScore * WEIGHTS.EXPERIENCE) +
    (breakdown.preferencesScore * WEIGHTS.PREFERENCES)
  );

  return {
    matchScore,
    breakdown,
    matchedSkills,
    missingSkills,
    reasons
  };
};

const generateRecommendations = async (student) => {
  // Clear old recommendations
  await Recommendation.deleteMany({ studentId: student._id });

  // Fetch active opportunities
  const opportunities = await Opportunity.find({ status: 'ACTIVE', deadline: { $gte: new Date() } });
  
  const recommendations = [];

  for (const opp of opportunities) {
    const match = calculateMatch(student, opp);
    
    recommendations.push({
      studentId: student._id,
      opportunityId: opp._id,
      matchScore: match.matchScore,
      breakdown: match.breakdown,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      reasons: match.reasons
    });
  }

  // Bulk insert
  if (recommendations.length > 0) {
    await Recommendation.insertMany(recommendations);
  }
};

module.exports = {
  calculateMatch,
  generateRecommendations
};
