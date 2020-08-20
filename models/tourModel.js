const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");

// const User = require("./userModel"); // Req'd for creating embedded "guides"

// Define Schema
const tourSchema = new mongoose.Schema(
	{
		name            : {
			type      : String,
			required  : [ true, "A tour must have a name" ],
			unique    : true,
			trim      : true,
			maxlength : [
				40,
				"A tour name must have less or equal then 40 characters"
			],
			minlength : [
				10,
				"A tour name must have more or equal then 10 characters"
			]
			// validate: [validator.isAlpha, 'Tour name must only contain characters']
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
			required : [ true, "A tour must have a difficulty" ],
			enum     : {
				values  : [ "easy", "medium", "difficult" ],
				message : "Difficulty is either: easy, medium, difficult"
			}
		},
		ratingsAverage  : {
			type    : Number,
			default : 4.5,
			min     : [ 1, "Rating must be above 1.0" ],
			max     : [ 5, "Rating must be below 5.0" ],
			set     : (val) => Math.round(val * 10) / 10 // Runs each time. E.g. (4.6666 * 10) => Roundup 46.66 => Divide 47 by 10 = 4.7
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
			validate : {
				// CUSTOM VALIDATOR
				validator : function (val) {
					// this only points to current doc on NEW document creation
					// DOESNOT work with update due to "this"
					return val < this.price;
				},
				message   : "Discount price ({VALUE}) should be below regular price"
			}
		},
		summary         : {
			type     : String,
			required : [ true, "A tour must have a description" ],
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
			select  : false // exclude from response object sent to client
		},
		startDates      : [ Date ], // An array of dates
		secretTour      : {
			type    : Boolean,
			default : false
		},
		startLocation   : {
			// Location where the tour starts
			// Geospatial data (GeoJSON)
			type        : {
				type    : String,
				default : "Point",
				enum    : [ "Point" ]
			},
			coordinates : [ Number ], // Array of coordinates: [long, lat]
			address     : String,
			description : String
		},
		locations       : [
			// All locations where this tour goes to
			{
				type        : {
					type    : String,
					default : "Point",
					enum    : [ "Point" ]
				},
				coordinates : [ Number ],
				address     : String,
				description : String,
				day         : Number
			}
		],
		// Referencing the users collection
		guides          : [
			{
				type : mongoose.Schema.ObjectId,
				ref  : "User" // mongoose automatically knows what schema we are refering to
			}
		]
		// For embedding the user info the tours collection
		// RUN ALONG WITH THE "EMBEDDING LOGIC BELOW"
		// guides          : Array
	},
	{
		toJSON   : { virtuals: true }, // Send "durationWeeks" virtual property
		toObject : { virtuals: true } // in the response body
	}
);

// INDEX
// tourSchema.index({ price: 1 }); // 1 for ASC order and -1 for DESC
tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 for ASC order and -1 for DESC
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" }); // For geospatial search

// VIRTUAL PROPERTIES
// REMEMBER: Can't use virtuals to query the db
tourSchema.virtual("durationWeeks").get(function () {
	// Converting days to weeks -> 7 days tour to 1 week tour
	return this.duration / 7;
});

// VIRTUAL POPULATE - To show all the reviews associated with a tour
tourSchema.virtual("reviews", {
	ref          : "Review",
	foreignField : "tour",
	localField   : "_id"
});

// MIDDLEWARES
// DATABASE MIDDLEWARES
// Pre middleware
tourSchema.pre("save", function (next) {
	//  "save": Runs before .save() and .create() ONLY
	this.slug = slugify(this.name, { lower: true });
	next();
});

// Need to get the user information from the Users collections in db
// to then store it under guides for that tour in an array
// i.e. a tour could have multiple guides (users) assigned to it
// EMBEDDING LOGIC
// tourSchema.pre("save", async function (next) {
// 	const guidesPromises = this.guides.map(
// 		async (id) => await User.findById(id)
// 	);
// 	this.guides = await Promise.all(guidesPromises);

// 	next();
// });

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

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path   : "guides", // .populate() to fill the user collection and return user data in the tour collection
		select : "-__v -passwordChangedAt"
	});

	next();
});

tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds!`);
	next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre("aggregate", function (next) {
// 	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

// 	console.log(this.pipeline());
// 	next();
// });

// Mongo Model
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
