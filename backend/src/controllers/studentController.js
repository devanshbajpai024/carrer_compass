const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, education, experience, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (education) user.education = education;
    if (experience) user.experience = experience;
    if (preferences) user.preferences = preferences;

    await user.save();
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('skills');
    res.json({ success: true, data: user.skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const user = await User.findById(req.user._id);
    user.skills = skills;
    await user.save();
    res.json({ success: true, data: user.skills, message: 'Skills updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('interests');
    res.json({ success: true, data: user.interests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    const user = await User.findById(req.user._id);
    user.interests = interests;
    await user.save();
    res.json({ success: true, data: user.interests, message: 'Interests updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('careerGoals');
    res.json({ success: true, data: user.careerGoals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGoals = async (req, res) => {
  try {
    const { careerGoals } = req.body;
    const user = await User.findById(req.user._id);
    user.careerGoals = careerGoals;
    await user.save();
    res.json({ success: true, data: user.careerGoals, message: 'Career goals updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
