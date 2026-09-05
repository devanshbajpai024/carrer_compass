const Opportunity = require('../models/Opportunity');

exports.getOpportunities = async (req, res) => {
  try {
    const { 
      page = 1, limit = 10, type, skill, career, 
      location, remote, status 
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (skill) query['skills.skill'] = new RegExp(skill, 'i');
    if (career) query.careerDomains = new RegExp(career, 'i');
    if (location) query.location = new RegExp(location, 'i');
    if (remote) query.remote = remote === 'true';
    
    // Only return active and unexpired opportunities unless specified otherwise
    if (status) {
      query.status = status;
    } else {
      query.status = 'ACTIVE';
      query.deadline = { $gte: new Date() };
    }

    const opportunities = await Opportunity.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Opportunity.countDocuments(query);

    res.json({
      success: true,
      data: opportunities,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create(req.body);
    res.status(201).json({ success: true, data: opportunity, message: 'Opportunity created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, data: opportunity, message: 'Opportunity updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
