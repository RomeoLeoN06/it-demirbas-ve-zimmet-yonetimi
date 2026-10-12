const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, requireAdmin, assignmentController.assignAsset);
router.post('/return', authenticateToken, requireAdmin, assignmentController.returnAsset);
router.get('/my-assets', authenticateToken, assignmentController.getMyAssets);
router.get('/history', authenticateToken, requireAdmin, assignmentController.getAssignmentHistory);

module.exports = router;
