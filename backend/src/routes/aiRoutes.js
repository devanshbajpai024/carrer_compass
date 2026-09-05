const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, chatWithAI);

module.exports = router;
