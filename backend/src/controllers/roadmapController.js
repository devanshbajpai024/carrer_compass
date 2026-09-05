const CareerRoadmap = require('../models/CareerRoadmap');
const User = require('../models/User');
const { generateRoadmapForCareer } = require('../services/roadmapEngine');

exports.getRoadmap = async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find({ studentId: req.user._id });
    res.json({ success: true, data: roadmaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateRoadmap = async (req, res) => {
  try {
    const { targetCareer } = req.body;
    if (!targetCareer) return res.status(400).json({ success: false, message: 'targetCareer is required' });

    const user = await User.findById(req.user._id);
    const roadmap = await generateRoadmapForCareer(user, targetCareer);

    res.json({ success: true, data: roadmap, message: 'Roadmap generated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { targetCareer, nodeTitle, status } = req.body;
    
    const roadmap = await CareerRoadmap.findOne({ studentId: req.user._id, targetCareer });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    const node = roadmap.nodes.find(n => n.title === nodeTitle);
    if (!node) return res.status(404).json({ success: false, message: 'Node not found in roadmap' });

    node.status = status;
    await roadmap.save();

    res.json({ success: true, data: roadmap, message: 'Roadmap progress updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
