const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

// Use mergeParams to get access to params
// e.g. the tourId from /:tourId/reviews
// when mounting the reviewRouter in tourRoutes file
const router = express.Router({ mergeParams: true });

router.use(authController.protect); // Only logged in users can access these routes

// /api/v1/reviews/
router.route("/").get(reviewController.getAllReviews).post(
	// POST /tour/:id/reviews
	authController.restrictTo("user"), // Only users with "role" of user can post review
	reviewController.setTourUserIds, // Middleware to set some properties
	reviewController.createReview
);

// /api/v1/reviews/:id
router
	.route("/:id")
	.get(reviewController.getReview)
	.patch(
		authController.restrictTo("user", "admin"),
		reviewController.updateReview
	)
	.delete(
		authController.restrictTo("user", "admin"),
		reviewController.deleteReview
	);

module.exports = router;
