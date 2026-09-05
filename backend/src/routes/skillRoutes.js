const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  getSkillAnalysis,
  getSkillGaps
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.get('/', getAllSkills);
router.get('/student/skill-analysis', protect, getSkillAnalysis);
router.get('/student/skill-gaps', protect, getSkillGaps);

module.exports = router;
