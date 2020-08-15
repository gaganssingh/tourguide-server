const User = require("../models/userModel"); // MongoDB Schema Model
const catchAsync = require("../utils/catchAsync");

// *********************
// /api/v1/users
// *********************
// Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
	// EXECUTE QUERY
	const users = await User.find();

	// SEND RESPONSE
	res.status(200).json({
		status  : "success",
		results : users.length,
		data    : {
			users
		}
	});
});

// Create New User
exports.createUser = (req, res) => {
	res.status(500).json({
		status  : "error",
		message : "Route has not been defined"
	});
};

// *********************
// /api/v1/users/:id
// *********************
// Get User By Id
exports.getUser = (req, res) => {
	res.status(500).json({
		status  : "error",
		message : "Route has not been defined"
	});
};

// Update User By Id
exports.updateUser = (req, res) => {
	res.status(500).json({
		status  : "error",
		message : "Route has not been defined"
	});
};

// Delete User By Id
exports.deleteUser = (req, res) => {
	res.status(500).json({
		status  : "error",
		message : "Route has not been defined"
	});
};
