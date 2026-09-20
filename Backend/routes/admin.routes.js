const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Protect all admin endpoints with authAdmin
router.use(authMiddleware.authAdmin);

// Feature 17: Live map of all active rides city-wide (admin only)
router.get('/rides/active', adminController.getActiveCityRides);

// Feature 18: Revenue analytics — daily/weekly earnings & peak hours
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/peak-hours', adminController.getPeakHoursAnalytics);

// Feature 19: Driver management — list drivers, approve/suspend, view ride history
router.get('/captains', adminController.getAllDrivers);
router.put('/captains/:id/status', adminController.updateDriverApprovalStatus);
router.get('/captains/:id/rides', adminController.getDriverRideHistory);

module.exports = router;
