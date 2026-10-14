const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, roleController.getRoles);
router.post('/', authenticateToken, requireAdmin, roleController.createRole);
router.put('/:id', authenticateToken, requireAdmin, roleController.updateRole);
router.delete('/:id', authenticateToken, requireAdmin, roleController.deleteRole);

module.exports = router;
