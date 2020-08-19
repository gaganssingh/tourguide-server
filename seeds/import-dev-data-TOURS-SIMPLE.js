require("dotenv").config({ path: "./config.env" });
const fs = require("fs");
const mongoose = require("mongoose");

const Tour = require("../models/tourModel");

// MONGODB CONNECTION
const DB = process.env.DATABASE.replace(
	"<PASSWORD>",
	process.env.DATABASE_PASSWORD
);
mongoose
	.connect(DB, {
		useNewUrlParser    : true,
		useCreateIndex     : true,
		useFindAndModify   : false,
		useUnifiedTopology : true
	})
	.then((con) => console.log(`DB connection successfull`));

// READ JSON FILE
const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")
);

// IMPORT DATA INTO DB
const importData = async () => {
	try {
		await Tour.create(tours);
		console.log("DATA SUCCESSFULLY LOADED TO MONGODB");
	} catch (err) {
		console.log(err);
	}
	process.exit();
};

// DELETE ALL EXISTING DATA FROM DB
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		console.log("DATA SUCCESSFULLY DELETED FROM MONGODB");
	} catch (err) {
		console.log(err);
	}
	process.exit();
};

if (process.argv[2] === "--import") {
	importData();
} else if (process.argv[2] === "--delete") {
	deleteData();
}

// TO RUN THESE COMMANDS:
// Import command: node seeds/import-dev-data-TOURS-SIMPLE.js --import
// Delete command: node seeds/import-dev-data-TOURS-SIMPLE.js --delete
