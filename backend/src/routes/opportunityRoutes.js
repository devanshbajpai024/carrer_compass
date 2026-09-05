const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getOpportunities)
  .post(protect, createOpportunity);

router.route('/:id')
  .get(getOpportunityById)
  .put(protect, updateOpportunity)
  .delete(protect, deleteOpportunity);

module.exports = router;
