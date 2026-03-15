const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Analytics route
router.get('/', emailController.getAnalytics);

module.exports = router;
