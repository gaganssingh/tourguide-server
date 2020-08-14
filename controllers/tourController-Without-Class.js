const fs = require("fs");

const Tour = require("../models/tourModel"); // MongoDB Schema Model

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
	console.log(req.query);
	try {
		// BUILD QUERY
		// 1a. Fintering
		const queryObj = { ...req.query };
		// Fields that need to be excluded from the req.query object
		const excludedFields = [ "page", "sort", "limit", "fields" ];
		excludedFields.forEach((el) => delete queryObj[el]);

		// 1b. Advanced Filtering
		let queryString = JSON.stringify(queryObj);
		// {difficulty: "easy", duration: {$gre: 5}}
		// replace {gte, gt, lte, ls} with {$gte, $gt, $lte, $ls}
		queryString = queryString.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`
		);
		console.log("[queryString]", JSON.parse(queryString));

		// Query the database
		let query = Tour.find(JSON.parse(queryString));

		// 2. Sorting
		if (req.query.sort) {
			const sortBy = req.query.sort.split(",").join(" ");
			// Using default mongoose ".sort" method
			query = query.sort(sortBy); // sort("price ratingsAverage")
		} else {
			// default
			// sort by creation date -> newest one first
			query = query.sort("-createdAt");
		}

		// 3. Field Limiting
		if (req.query.fields) {
			const fields = req.query.fields.split(",").join(" ");
			// Using default mongoose ".select" method
			query = query.select(fields); // select("name duration difficulty")
		} else {
			// default
			// receive every field except __v
			query = query.select("-__v");
		}

		// 4. Pagination & Limiting
		// ?page=2&limit=10
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 100;
		const skip = (page - 1) * limit; // For page 3 -> need to skip 200 results

		query = query.skip(skip).limit(limit);

		if (req.query.page) {
			const numTours = await Tour.countDocuments();
			if (skip >= numTours) throw new Error("This page does not exist");
		}

		// EXECUTE QUERY
		const tours = await query;
		// At this point, the query looks something like
		// query.sort().select().skip().limit()

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
