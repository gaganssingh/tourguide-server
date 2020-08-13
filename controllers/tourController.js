const fs = require("fs");
const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// MIDDLEWARES
// Verify "id" param is present
exports.checkID = (req, res, next, val) => {
	console.log(`Tour id is: ${val}`);
	const id = Number(req.params.id);
	if (id > tours.length)
		return res.status(404).json({
			status  : "fail",
			message : "Invalid ID"
		});

	next();
};

// Verify "name" and "price" is present in body
exports.checkBody = (req, res, next) => {
	if (!req.body.name || !req.body.price) {
		return res.status(400).json({
			status  : "fail",
			message : "Missing name or price"
		});
	}

	next();
};

// HANDLER FUNCTIONS
// *********************
// /api/v1/tours
// *********************
// Get all tours
exports.getAllTours = (req, res) => {
	res.status(200).json({
		status  : "success",
		results : tours.length,
		data    : {
			tours
		}
	});
};

// Create New Tour
exports.createTour = (req, res) => {
	const newId = tours[tours.length - 1].id + 1;
	const newTour = Object.assign({ id: newId }, req.body);

	tours.push(newTour);

	fs.writeFile(
		`${__dirname}/dev-data/data/tours-simple.json`,
		JSON.stringify(tours),
		(err) => {
			res.status(201).json({
				status : "success",
				data   : {
					tour : newTour
				}
			});
		}
	);
};

// *********************
// /api/v1/tours/:id
// *********************
// Get Tour By Id
exports.getTour = (req, res) => {
	const id = Number(req.params.id);
	const tour = tours.find((tour) => tour.id === id);

	res.status(200).json({
		status : "success",
		data   : {
			tour
		}
	});
};

// Update a tour by id
exports.updateTour = (req, res) => {
	res.status(200).json({
		status : "success",
		data   : {
			tour : "<UPDATED TOUR HERE>"
		}
	});
};

// Delete a tour by id
exports.deleteTour = (req, res) => {
	res.status(204).json({
		status : "success",
		data   : null
	});
};
