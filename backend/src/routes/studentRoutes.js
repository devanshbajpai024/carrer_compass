const express = require('express');
const router = express.Router();
const { 
  getProfile, updateProfile, 
  getSkills, updateSkills, 
  getInterests, updateInterests,
  getGoals, updateGoals
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.route('/skills').get(protect, getSkills).put(protect, updateSkills);
router.route('/interests').get(protect, getInterests).put(protect, updateInterests);
router.route('/goals').get(protect, getGoals).put(protect, updateGoals);

module.exports = router;
