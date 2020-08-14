const fs = require("fs");

const Tour = require("../models/tourModel"); // MongoDB Schema Model
const APIFeatures = require("../utils/apiFeatures");

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
exports.getAllTours = async (req, res) => {
	try {
		// BUILD QUERY
		const features = new APIFeatures(Tour.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		// EXECUTE QUERY
		const tours = await features.query;

		res.status(200).json({
			status  : "success",
			results : tours.length,
			data    : {
				tours
			}
		});
	} catch (err) {
		res.status(404).json({
			status  : "fail",
			message : err
		});
	}
};

// Create New Tour
exports.createTour = async (req, res) => {
	// const newTour = new Tour({})
	// newTour.save()
	try {
		const newTour = await Tour.create(req.body);

		res.status(201).json({
			status : "success",
			data   : {
				tour : newTour
			}
		});
	} catch (err) {
		res.status(400).json({
			status  : "fail",
			message : err
		});
	}
};

// *********************
// /api/v1/tours/:id
// *********************
// Get Tour By Id
exports.getTour = async (req, res) => {
	try {
		const tour = await Tour.findById(req.params.id);
		res.status(200).json({
			status : "success",
			data   : {
				tour
			}
		});
	} catch (err) {
		res.status(404).json({
			status  : "fail",
			message : err
		});
	}
};

// Update a tour by id
exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new : true
		});

		res.status(200).json({
			status : "success",
			data   : {
				tour
			}
		});
	} catch (err) {
		res.status(404).json({
			status  : "fail",
			message : err
		});
	}
};

// Delete a tour by id
exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndRemove(req.params.id);
		res.status(204).json({
			status : "success",
			data   : null
		});
	} catch (err) {
		res.status(404).json({
			status  : "fail",
			message : err
		});
	}
};

// AGGREGATION PIPELINE
// Like "joins" and "group by" in SQL dbs
exports.getTourStats = async (req, res) => {
	try {
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
					num        : { $sum: 1 }, // For each db entry, add 1 to num
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
	} catch (err) {
		res.status(404).json({
			status  : "fail",
			message : err
		});
	}
};

// Unwinding and projecting
exports.getMonthlyPlan = async (req, res) => {
	try {
		const year = Number(req.params.year);

		const plan = await Tour.aggregate([
			{ $unwind: "$startDates" },
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
	} catch (err) {
		res.status(404).json({
			status  : "fail",
			message : err
		});
	}
};
