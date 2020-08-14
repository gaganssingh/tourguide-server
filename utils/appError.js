const { __esModule } = require("validator/lib/isPostalCode");

class AppError extends Error {
	constructor (message, statusCode) {
		// Sets the message properity to the incoming message
		//  Don't need to assign this.message = message
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

		// Check if error is operational or coming from external sources,
		//  like an npm package
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
