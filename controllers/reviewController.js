const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");

// *********************
// /api/v1/reviews
// *********************
// Get all reviews /api/v1/reviews
// Get all reviews for a tour id /api/v1/tours/5c88fa8cf4afda39709c2955/reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
	let filter = {};
	if (req.params.tourId) filter = { tour: req.params.tourId };

	const reviews = await Review.find(filter);
	// const reviews = await Review.find();

	res.status(200).json({
		status  : "success",
		results : reviews.length,
		data    : {
			reviews
		}
	});
});

// Create new review - Nested route
exports.createReview = catchAsync(async (req, res, next) => {
	// Automatically get the tour id and user id
	// so they can be inserted to the review model
	if (!req.body.tour) req.body.tour = req.params.tourId; // comes from /:tourId/reviews
	if (!req.body.user) req.body.user = req.user.id; // req.user from the protect middleware

	const newReview = await Review.create(req.body);

	res.status(201).json({
		status : "success",
		data   : {
			reviews : newReview
		}
	});
});
