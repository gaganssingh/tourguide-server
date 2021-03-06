const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");

// GET /tour/:tourId/reviews/:reviewId
// POST /tour/:id/reviews
router.use("/:tourId/reviews", reviewRouter); // Mounting the reviewRouter in tourRouter

// Alias Route
router
	.route("/top-5-cheap")
	.get(tourController.aliasTopTours, tourController.getAllTours);

// Aggretation Route
router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(
	authController.protect, // For protected route
	authController.restrictTo("admin", "lead-guide", "guides"), // Authorized to certain user types
	tourController.getMonthlyPlan
);

// Find tours within a specific distance
// /tours-within/150/center/-40,45/unit/km
router
	.route("/tours-within/:distance/center/:latlng/unit/:unit")
	.get(tourController.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router.route("/").get(tourController.getAllTours).post(
	authController.protect, // For protected route
	authController.restrictTo("admin", "lead-guide"), // Authorized to certain user types
	tourController.createTour
);

router
	.route("/:id")
	.get(tourController.getTour)
	.patch(
		authController.protect, // For protected route
		authController.restrictTo("admin", "lead-guide"), // Authorized to certain user types
		tourController.updateTour
	)
	.delete(
		authController.protect, // For protected route
		authController.restrictTo("admin", "lead-guide"), // Authorized to certain user types
		tourController.deleteTour
	);

module.exports = router;
