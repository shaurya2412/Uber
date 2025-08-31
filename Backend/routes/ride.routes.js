const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/available', authMiddleware.authCaptain, rideController.getAvailableRides);
router.post('/:rideId/accept', authMiddleware.authCaptain, rideController.acceptRide);
router.post('/:rideId/start', authMiddleware.authCaptain, rideController.startRide);
router.post('/:rideId/complete', authMiddleware.authCaptain, rideController.completeRide);
router.get('/current', authMiddleware.authCaptain, rideController.getCurrentRide);
router.get('/history', authMiddleware.authCaptain, rideController.getRideHistory);
router.put('/:rideId/location', 
    authMiddleware.authCaptain,
    [
        body('lat').isNumeric().withMessage('Latitude must be a number'),
        body('lng').isNumeric().withMessage('Longitude must be a number')
    ],
    rideController.updateRideLocation
);

router.post('/book', 
    authMiddleware.authUser,
    [
        body('pickup.address').notEmpty().withMessage('Pickup address is required'),
        body('pickup.coordinates.lat').isNumeric().withMessage('Pickup latitude is required'),
        body('pickup.coordinates.lng').isNumeric().withMessage('Pickup longitude is required'),
        body('destination.address').notEmpty().withMessage('Destination address is required'),
        body('destination.coordinates.lat').isNumeric().withMessage('Destination latitude is required'),
        body('destination.coordinates.lng').isNumeric().withMessage('Destination longitude is required'),
        body('fare').isNumeric().withMessage('Fare must be a number')
    ],
    rideController.bookRide
);
router.get('/user-current', authMiddleware.authUser, rideController.getUserCurrentRide);
router.get('/user-history', authMiddleware.authUser, rideController.getUserRideHistory);
router.post('/:rideId/cancel', authMiddleware.authUser, rideController.cancelUserRide);

module.exports = router;
