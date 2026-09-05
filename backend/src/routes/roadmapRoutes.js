const express = require('express');
const router = express.Router();
const {
  getRoadmap,
  generateRoadmap,
  updateProgress
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRoadmap);
router.post('/generate', protect, generateRoadmap);
router.put('/progress', protect, updateProgress);

module.exports = router;
