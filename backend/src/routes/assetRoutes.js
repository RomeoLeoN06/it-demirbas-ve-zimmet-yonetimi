const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, assetController.getAssets);
router.get('/:id', authenticateToken, assetController.getAssetById);
router.post('/', authenticateToken, requireAdmin, assetController.createAsset);
router.put('/:id', authenticateToken, requireAdmin, assetController.updateAsset);
router.delete('/:id', authenticateToken, requireAdmin, assetController.deleteAsset);
router.post('/:id/report-fault', authenticateToken, assetController.reportFault);

module.exports = router;
