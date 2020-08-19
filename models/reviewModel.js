const mongoose = require("mongoose");

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
	this.populate({
		path   : "tour",
		select : "name"
	}).populate({
		path   : "user", // .populate() to fill the user collection and return user data in the tour collection
		select : "name photo"
	});

	next();
});

// reviewSchema.pre(/^find/, function (next) {
// 	this.populate({
// 		path   : "tour", // .populate() to fill the user collection and return user data in the tour collection
// 		select : "name"
// 	});

// 	next();
// });

// Mongo model
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
