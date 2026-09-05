const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const { generateRecommendations } = require('../services/recommendationEngine');

exports.getRecommendations = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    let query = { studentId: req.user._id };

    // If filtering by opportunity type, we need to populate and filter
    // For pagination, if we filter on populated fields, we should ideally aggregate.
    // For simplicity in this iteration, if type is provided, we filter after population or use aggregation
    
    // Aggregation pipeline to allow filtering by Opportunity type and sorting by matchScore
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
    
    // Pagination
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
