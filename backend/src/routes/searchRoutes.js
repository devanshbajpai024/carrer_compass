const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');

// Simple keyword search across opportunities
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const results = await Opportunity.find({
      status: 'ACTIVE',
      $or: [
        { title: regex },
        { description: regex },
        { organization: regex },
        { tags: regex },
        { careerDomains: regex },
        { 'skills.skill': regex }
      ]
    }).limit(20);

    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
