const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getRecommendationById,
  refreshRecommendations,
  evaluateRecommendation
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getRecommendations);

router.route('/refresh')
  .post(protect, refreshRecommendations);

router.route('/evaluate')
  .post(evaluateRecommendation);

router.route('/:id')
  .get(protect, getRecommendationById);

module.exports = router;
