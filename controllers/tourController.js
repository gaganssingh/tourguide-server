const fs = require("fs");

const Tour = require("../models/tourModel"); // MongoDB Schema Model

// HANDLER FUNCTIONS
// *********************
// /api/v1/tours
// *********************
// Get all tours
exports.getAllTours = async (req, res) => {
	console.log(req.query);
	try {
		// BUILD QUERY
		// 1. Fintering
		const queryObj = { ...req.query };
		// Fields that need to be excluded from the req.query object
		const excludedFields = [ "page", "sort", "limit", "fields" ];
		excludedFields.forEach((el) => delete queryObj[el]);

		// 2. Advanced Filtering
		let queryString = JSON.stringify(queryObj);
		// {difficulty: "easy", duration: {$gre: 5}}
		// replace {gte, gt, lte, ls} with {$gte, $gt, $lte, $ls}
		queryString = queryString.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`
		);
		console.log("[queryString]", JSON.parse(queryString));

		// Query the database
		const query = Tour.find(JSON.parse(queryString));

		// Alternate way to query the db by
		// chaining methods provided by mongoose
		// const query = await Tour.find()
		// 	.where("duration")
		// 	.equals(5)
		// 	.where("difficulty")
		// 	.equals("easy");

		// EXECUTE QUERY
		const tours = await query;

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
