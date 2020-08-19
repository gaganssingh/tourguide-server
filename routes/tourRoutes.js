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
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
	.route("/")
	.get(authController.protect, tourController.getAllTours)
	.post(tourController.createTour);

router
	.route("/:id")
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(
		authController.protect, // For protected route
		authController.restrictTo("admin", "lead-guide"), // Authorized to certain user types
		tourController.deleteTour
	);

module.exports = router;
