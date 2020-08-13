const fs = require("fs");
const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

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

// Get Tour By Id
exports.getTour = (req, res) => {
	const id = Number(req.params.id);

	const tour = tours.find((tour) => tour.id === id);
	if (!tour)
		return res.status(404).json({
			status  : "fail",
			message : "Invalid ID"
		});

	res.status(200).json({
		status : "success",
		data   : {
			tour
		}
	});
};

// Post New Tour
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

// Update a tour by id
exports.updateTour = (req, res) => {
	const id = Number(req.params.id);

	if (id > tours.length)
		return res.status(404).json({
			status  : "fail",
			message : "Invalid ID"
		});

	res.status(200).json({
		status : "success",
		data   : {
			tour : "<UPDATED TOUR HERE>"
		}
	});
};

// Delete a tour by id
exports.deleteTour = (req, res) => {
	const id = Number(req.params.id);

	if (id > tours.length)
		return res.status(404).json({
			status  : "fail",
			message : "Invalid ID"
		});

	res.status(204).json({
		status : "success",
		data   : null
	});
};