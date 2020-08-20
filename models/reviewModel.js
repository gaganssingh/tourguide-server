const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
	{
		review    : {
			type     : String,
			required : [ true, "Review cannot be empty" ]
		},
		rating    : {
			type     : Number,
			required : [ true, "A review must have a rating" ],
			min      : [ 1, "Rating must be between 1 and 5" ],
			max      : [ 5, "Rating must be between 1 and 5" ]
		},
		createdAt : {
			type    : Date,
			default : Date.now()
		},
		// Referencing the tours collection
		tour      : {
			type     : mongoose.Schema.ObjectId,
			ref      : "Tour",
			required : [ true, "Review must belong to a tour" ]
		},
		// Referencing the user collection
		user      : {
			type     : mongoose.Schema.ObjectId,
			ref      : "User",
			required : [ true, "Review must belong to a user" ]
		}
	},
	{
		toJSON   : { virtuals: true },
		toObject : { virtuals: true }
	}
);

// MIDDLEWARES
// QUERY MIDDLEWARE
// /^find/ is a Reg Exp to make the callback run for all methods
// that start with find (e.g: find, findById etc)
reviewSchema.pre(/^find/, function (next) {
	// To populate both the associated tour and user in the review
	// this.populate({
	// 	path   : "tour",
	// 	select : "name"
	// }).populate({
	// 	path   : "user", // .populate() to fill the user collection and return user data in the tour collection
	// 	select : "name photo"
	// });

	this.populate({
		path   : "user", // .populate() to fill the user collection and return user data in the tour collection
		select : "name photo"
	});

	next();
});

// STATIC METHOD
// Calculate average ratings and update the tourModel
reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match : { tour: tourId }
		},
		{
			$group : {
				_id       : "$tour", // Grouping all reviews by the tour
				nRating   : { $sum: 1 }, // Add 1 for each matched tour
				avgRating : { $avg: "$rating" } // Calculate average from the rating field in schema
			}
		}
	]);

	// Update the Tour model with correct info
	await Tour.findByIdAndUpdate(tourId, {
		ratingsQuantity : stats[0].nRating,
		ratingsAverage  : stats[0].avgRating
	});
};

reviewSchema.post("save", function () {
	// Points to the current review
	// Cann't use Review.calcAvera... here as Review
	// has not yet been defined
	this.constructor.calcAverageRatings(this.tour);
});

// Mongo model
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
