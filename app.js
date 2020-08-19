const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError"); // Global error handler class
const globalErrorHandler = require("./controllers/errorController");

// IMPORT ROUTES
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const app = express(); // INIT SERVER

// Rate limiter helper function
const limiter = rateLimit({
	max      : 100,
	windowMs : 60 * 60 * 1000, // milliseconds
	message  : "Too many requests from this IP, please again in an hour!"
});

// MIDDLEWARES
app.use(helmet()); // set secure HTTP headers
app.use(express.json({ limit: "10kb" })); // Body parser limited to an incoming request body size of 10kb
app.use(express.static(`${__dirname}/public`)); // Serving static files
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev")); //logging
}
app.use("/api", limiter); // Apply rate limiting to all routes starting with "/api"

app.use((req, res, next) => {
	// Test middleware (Can be deleted safely)
	req.requestTime = new Date().toISOString();
	next();
});
app.use(
	hpp({
		whitelist : [
			"duration",
			"ratingsQuantity",
			"ratingsAverage",
			"maxGroupSize",
			"difficulty",
			"price"
		]
	})
); // Prevent parameter pollution

// DATA SANITIZATION MIDDLEWARES
app.use(xss()); // Against XSS attacks
app.use(mongoSanitize()); // Against NoSQL Query Injection. Removes all "$" characters from the query
// e.g. logging in using just a filter and correct password "email": {"$gt": ""}

// MOUNT ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

// ERROR HANDLING MIDDLEWARE
app.all("*", (req, res, next) => {
	next(new AppError(`Invalid url: ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
