require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

const app = require("./app");

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

// MONGODB
// Mongo Schema
const tourSchema = new mongoose.Schema({
	name   : {
		type     : String,
		required : [ true, "A tour must have a name" ],
		unique   : true
	},
	rating : {
		type    : Number,
		default : 4.5
	},
	price  : {
		type     : Number,
		required : [ true, "A tour must have a price" ]
	}
});

// Mongo Model
const Tour = mongoose.model("Tour", tourSchema);

// Creating a test document
const testTour = new Tour({
	name  : "The Park Camper",
	price : 997
});
testTour
	.save()
	.then((doc) => console.log("[doc]:", doc))
	.catch((err) => console.log("ERROR 💥:", err));

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
	console.log(`Server running at http://localhost:${PORT}`)
);
