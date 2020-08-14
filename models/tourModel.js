const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

// Define Schema
const tourSchema = new mongoose.Schema(
	{
		name            : {
			type      : String,
			required  : [ true, "A tour must have a name" ],
			unique    : true,
			trim      : true,
			maxlength : [ 40, "A tour name must have at most 40 characters" ],
			minlength : [ 10, "A tour name must have at least 10 characters" ]
		},
		slug            : String,
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
			required : [ true, "A tour should have a difficulty" ],
			enum     : {
				values  : [ "easy", "medium", "difficult" ],
				message :
					"Difficulty must be either one of: easy, medium, difficult"
			}
		},
		ratingsAverage  : {
			type    : Number,
			default : 4.5,
			max     : [ 5, "Rating must be between 1 and 5" ],
			min     : [ 1, "Rating must be between 1 and 5" ]
		},
		ratingsQuantity : {
			type    : Number,
			default : 0
		},
		price           : {
			type     : Number,
			required : [ true, "A tour must have a price" ]
		},
		priceDiscount   : {
			type     : Number,
			// CUSTOM VALIDATOR
			validate : {
				validator : function (val) {
					return val < this.price; // DOESNOT work with update due to "this"
				},
				message   : "priceDiscount ({VALUE}) must be smaller than price"
			}
		},
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
		startDates      : [ Date ], // An array of dates
		secretTour      : {
			type    : Boolean,
			default : false
		}
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

// MIDDLEWARES
// DATABASE MIDDLEWARES
// Pre middleware -> Runs before .save() and .create() ONLY
tourSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// tourSchema.pre("save", function (next) {
// 	console.log("Second Pre-Middleware: Will save document next.");
// 	next();
// });

// // Post middleware -> Runs after .save() and .create()
// tourSchema.post("save", function (doc, next) {
// 	console.log(doc);
// 	next();
// });

// QUERY MIDDLEWARE
// /^find/ is a Reg Exp to make the callback run for all methods
// that start with find (e.g: find, findById etc)
tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } }); // Find all where secretTour not equal true

	this.start = Date.now();
	next();
});

tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds`);
	next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

	console.log(this.pipeline());
	next();
});

// Mongo Model
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
