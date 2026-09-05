const User = require('../models/User');
const { getSkillGapsForCareer, CAREER_SKILLS_MAP } = require('../services/skillEngine');

exports.getAllSkills = async (req, res) => {
  try {
    // Return a combined list of all known skills from our mock map
    const allSkills = new Set();
    Object.values(CAREER_SKILLS_MAP).forEach(skills => {
      skills.forEach(s => allSkills.add(s.name));
    });
    res.json({ success: true, data: Array.from(allSkills) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSkillAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const gaps = getSkillGapsForCareer(user);
    res.json({ success: true, data: gaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSkillGaps = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const gaps = getSkillGapsForCareer(user);
    
    // Flatten and filter only gaps
    const justGaps = [];
    gaps.forEach(g => {
      g.skills.filter(s => s.status === 'GAP').forEach(s => justGaps.push(s));
    });
    
    res.json({ success: true, data: justGaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
