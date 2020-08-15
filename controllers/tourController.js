const Tour = require("../models/tourModel"); // MongoDB Schema Model
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// MIDDLEWARES
// Aliasing
exports.aliasTopTours = (req, res, next) => {
	req.query.limit = "5";
	req.query.sort = "-ratingsAverage,price";
	req.query.fields = "name,price,ratingsAverage,summary,difficulty";
	next();
};

// HANDLER FUNCTIONS
// *********************
// /api/v1/tours
// *********************
// Get all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
	// BUILD QUERY
	const features = new APIFeatures(Tour.find(), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();

	// EXECUTE QUERY
	const tours = await features.query;

	// SEND RESPONSE
	res.status(200).json({
		status  : "success",
		results : tours.length,
		data    : {
			tours
		}
	});
});

// Create New Tour
exports.createTour = catchAsync(async (req, res, next) => {
	const newTour = await Tour.create(req.body);

	res.status(201).json({
		status : "success",
		data   : {
			tour : newTour
		}
	});
});

// *********************
// /api/v1/tours/:id
// *********************
// Get Tour By Id
exports.getTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findById(req.params.id);
	// Tour.findOne({ _id: req.params.id })

	if (!tour) {
		return next(new AppError("No tour found with that ID", 404));
	}

	res.status(200).json({
		status : "success",
		data   : {
			tour
		}
	});
});

// Update a tour by id
exports.updateTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
		new           : true,
		runValidators : true
	});

	if (!tour) {
		return next(new AppError(`Tour with id ${req.params.id} not found`, 404));
	}

	res.status(200).json({
		status : "success",
		data   : {
			tour
		}
	});
});

// Delete a tour by id
exports.deleteTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndDelete(req.params.id);

	if (!tour) {
		return next(new AppError(`Tour with id ${req.params.id} not found`, 404));
	}

	res.status(204).json({
		status : "success",
		data   : null
	});
});

// AGGREGATION PIPELINE
// Like "joins" and "group by" in SQL dbs
exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match : { ratingsAverage: { $gte: 4.5 } }
		},
		{
			$group : {
				// _id        : null,
				// _id        : "$difficulty",
				// _id        : "$ratingsAverage",
				_id        : { $toUpper: "$difficulty" },
				numTours   : { $sum: 1 },
				numRatings : { $sum: "$ratingsQuantity" },
				avgRating  : { $avg: "$ratingsAverage" },
				avgPrice   : { $avg: "$price" },
				minPrice   : { $min: "$price" },
				maxPrice   : { $max: "$price" }
			}
		},
		{
			$sort : { avgPrice: 1 } // 1 for ascending sort
		}
		// {
		// 	// With _id set to difficulty above,
		// 	// Math all NOT EQUAL to easy:
		// 	$match : { _id: { $ne: "EASY" } }
		// }
	]);

	res.status(200).json({
		status : "success",
		data   : {
			stats
		}
	});
});

// Unwinding and projecting
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = req.params.year * 1; // 2021

	const plan = await Tour.aggregate([
		{
			$unwind : "$startDates"
		},
		{
			$match : {
				startDates : {
					$gte : new Date(`${year}-01-01`),
					$lte : new Date(`${year}-12-31`)
				}
			}
		},
		{
			$group : {
				_id           : { $month: "$startDates" },
				numTourStarts : { $sum: 1 }, // add 1 to numTourStarts for each count
				tours         : { $push: "$name" } // Push names of tours in array
			}
		},
		{
			$addFields : { month: "$_id" }
		},
		{
			$project : {
				_id : 0 // To not show the _id in response. Use 1 to show
			}
		},
		{
			$sort : { numTourStarts: -1 }
		},
		{
			$limit : 12 // Set the number of results to show
		}
	]);

	res.status(200).json({
		status : "success",
		data   : {
			plan
		}
	});
});
