const Project = require('../models/Project');
const User = require('../models/User');
const { getSkillGapsForCareer } = require('../services/skillEngine');
const { getRecommendedProjects } = require('../services/projectEngine');

exports.getRecommended = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get skill gaps
    const gaps = getSkillGapsForCareer(user);
    const justGaps = [];
    gaps.forEach(g => {
      g.skills.filter(s => s.status === 'GAP').forEach(s => justGaps.push(s));
    });

    const recommended = await getRecommendedProjects(user, justGaps);
    res.json({ success: true, data: recommended });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
