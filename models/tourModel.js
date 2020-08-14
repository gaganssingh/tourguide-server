const mongoose = require("mongoose");

// Define Schema
const tourSchema = new mongoose.Schema(
	{
		name            : {
			type     : String,
			required : [ true, "A tour must have a name" ],
			unique   : true,
			trim     : true
		},
		duration        : {
			type     : Number,
			required : [ true, "A tour must have a duration" ]
		},
		maxGroupSize    : {
			type     : Number,
			required : [ true, "A tour must have a group size" ]
		},
		difficulty      : {
			type     : String,
			required : [ true, "A tour should have a difficulty" ]
		},
		ratingsAverage  : {
			type    : Number,
			default : 4.5
		},
		ratingsQuantity : {
			type    : Number,
			default : 0
		},
		price           : {
			type     : Number,
			required : [ true, "A tour must have a price" ]
		},
		priceDiscount   : Number,
		summary         : {
			type     : String,
			required : [ true, "A tour must have a summary" ],
			trim     : true // remove all white space from begining and end
		},
		description     : {
			type : String,
			trim : true
		},
		imageCover      : {
			type     : String,
			required : [ true, "A tour must have a cover image" ]
		},
		images          : [ String ], // An array of strings
		createdAt       : {
			type    : Date,
			default : Date.now(),
			select  : false // excludes this field from res objects sent to clients
		},
		startDates      : [ Date ] // An array of dates
	},
	{
		toJSON   : { virtuals: true }, // Send "durationWeeks" virtual property
		toObject : { virtuals: true } // in the response body
	}
);

// VIRTUAL PROPERTIES
// REMEMBER: Can't use virtuals to query the db
tourSchema.virtual("durationWeeks").get(function () {
	return this.duration / 7; // Converting days to weeks -> 7 days tour to 1 week tour
});

// Mongo Model
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
