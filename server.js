require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

// LAST RESORT ERROR HANDLER No. 1
// Catches Uncaught Exceptions, e.g. console.log(unknown)
process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN...");
	console.log(err.name, err.message);
	process.exit(1);
});

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
	.then(() => console.log(`DB connection successfull`));

// SERVER START
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
	console.log(`Server running at http://localhost:${PORT}`)
);

// LAST RESORT ERROR HANDLER No. 2
// Catches Unhandled Rejections, e.g. wrong DB password
process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
	console.log(err.name, err.message);
	server.close(() => process.exit(1));
});
