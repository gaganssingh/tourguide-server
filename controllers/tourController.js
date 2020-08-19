const Tour = require("../models/tourModel"); // MongoDB Schema Model

const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

// MIDDLEWARES
// Aliasing
exports.aliasTopTours = (req, res, next) => {
	req.query.limit = "5";
	req.query.sort = "-ratingsAverage,price";
	req.query.fields = "name,price,ratingsAverage,summary,difficulty";
	next();
};

// *********************
// /api/v1/tours
// *********************
exports.getAllTours = factory.getAll(Tour); // Get all tours
exports.createTour = factory.createOne(Tour); // Create New Tour

// *********************
// /api/v1/tours/:id
// *********************
exports.getTour = factory.getOne(Tour, { path: "reviews" }); // Get Tour By Id
exports.updateTour = factory.updateOne(Tour); // Update a tour by id
exports.deleteTour = factory.deleteOne(Tour); // Delete a tour by id

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
