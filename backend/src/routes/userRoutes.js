const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, requireAdmin, userController.getUsers);
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);
router.post('/', authenticateToken, requireAdmin, userController.createUser);
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);
router.put('/:id/reset-password', authenticateToken, requireAdmin, userController.resetUserPassword);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;
