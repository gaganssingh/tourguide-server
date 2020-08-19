const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

// Use mergeParams to get access to params
// e.g. the tourId from /:tourId/reviews
// when mounting the reviewRouter in tourRoutes file
const router = express.Router({ mergeParams: true });

// /api/v1/reviews/
router
	.route("/")
	.get(reviewController.getAllReviews) // GET /tour/:tourId/reviews/:reviewId
	.post(
		// POST /tour/:id/reviews
		authController.protect, // Only logged in users can post review
		authController.restrictTo("user"), // Only users with "role" of user can post review
		reviewController.setTourUserIds, // Middleware to set some properties
		reviewController.createReview
	);

// /api/v1/reviews/:id
router
	.route("/:id")
	.get(reviewController.getReview)
	.patch(reviewController.updateReview)
	.delete(reviewController.deleteReview);

module.exports = router;
