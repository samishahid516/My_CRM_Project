const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Email CRUD routes
router.get('/', emailController.getEmails);
router.get('/:id', emailController.getEmailById);
router.post('/', emailController.createEmail);
router.put('/:id', emailController.updateEmail);
router.delete('/:id', emailController.deleteEmail);

// Email actions
router.post('/:id/reply', emailController.replyToEmail);
router.post('/:id/analyze', emailController.analyzeEmail);
router.post('/:id/star', emailController.toggleStar);

module.exports = router;
