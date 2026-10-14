const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, departmentController.getDepartments);
router.post('/', authenticateToken, requireAdmin, departmentController.createDepartment);
router.put('/:id', authenticateToken, requireAdmin, departmentController.updateDepartment);
router.delete('/:id', authenticateToken, requireAdmin, departmentController.deleteDepartment);

module.exports = router;
