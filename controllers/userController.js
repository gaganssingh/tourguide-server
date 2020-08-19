const factory = require("./handlerFactory");
const User = require("../models/userModel"); // MongoDB Schema Model
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// HELPER FUNCTIONS
const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	// loop through all fields on the incoming request's body
	Object.keys(obj).forEach((el) => {
		// If the allowed field is in the request body
		if (allowedFields.includes(el)) {
			// assign the allowed field and its value to the new object
			newObj[el] = obj[el];
		}
	});
	return newObj;
};

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
// /api/v1/users/
// *********************
// Update user info - Used by the User to update their info
exports.updateMe = catchAsync(async (req, res, next) => {
	// Create error if user tries to update password
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError(
				"This route is not for password updates. Please use /updateMyPassword instead",
				400
			)
		);

	// Filter the info on incoming request body so
	// that it only contains the correct information
	// (filtering out unwanted fields, like: "role")
	const filteredBody = filterObj(req.body, "name", "email");

	// Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new           : true,
		runValidators : true
	});

	res.status(200).json({
		status : "success",
		user   : updatedUser
	});
});

// Delete/Deactivate USer Account - Used by the User to Delete/Deactivate their account
exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status : "success",
		data   : null
	});
});

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
// Used by the admin to update a User's info
exports.updateUser = (req, res) => {
	res.status(500).json({
		status  : "error",
		message : "Route has not been defined"
	});
};

// Delete User By Id
exports.deleteUser = factory.deleteOne(User);
