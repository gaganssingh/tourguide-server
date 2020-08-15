const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status  : err.status,
		error   : err,
		message : err.message,
		stack   : err.stack
	});
};

const sendErrorProd = (err, res) => {
	if (err.isOperational) {
		// Operational, trusted error: send message to client
		// refers to the this.isOperational property in the AppError class
		res.status(err.statusCode).json({
			status  : err.status,
			message : err.message
		});
	} else {
		// Programing or other unknown error
		// don't leak error details
		// 1. Log error
		console.error(`ERROR: `, err);

		// 2. Send generic response
		res.status(500).json({
			status  : "error",
			message : "Oops...something went very wrong!"
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === "production") {
		sendErrorProd(err, res);
	}

	next();
};
