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

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
	console.log(`Server running at http://localhost:${PORT}`)
);
