const express = require('express');
const router = express.Router();
const {
  getRecommended,
  getProjectById
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.get('/recommended', protect, getRecommended);
router.get('/:id', getProjectById);

module.exports = router;
