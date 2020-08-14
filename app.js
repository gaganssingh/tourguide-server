const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError"); // Global error handler class
const globalErrorHandler = require("./controllers/errorController");

// IMPORT ROUTES
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express(); // INIT SERVER

// MIDDLEWARES
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev")); //logging
}
app.use(express.json()); // Body parser
app.use(express.static(`${__dirname}/public`)); // Serving static files

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// MOUNT ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// ERROR HANDLING MIDDLEWARE
app.all("*", (req, res, next) => {
	next(new AppError(`Invalid url: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
