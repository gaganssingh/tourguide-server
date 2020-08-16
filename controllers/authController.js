const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// HELPER FUNCTIONS
const signToken = (userId) =>
	jwt.sign({ id: userId }, process.env.JWT_SECRET, {
		expiresIn : process.env.JWT_EXPIRES_IN
	});

// ROUTES
// NEW USER SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
	// Destructure variables received in request body
	const { name, email, password, passwordConfirm } = req.body;
	// NOTE: No need for manual validation, as validation
	// is handled in the userModel file by the schema

	// Create a new user on the db
	const newUser = await User.create({
		name,
		email,
		password,
		passwordConfirm
	});

	// Create JWT token
	const token = signToken(newUser._id);

	// Send token to the cliend inside the response body
	res.status(201).json({
		status : "success",
		token,
		data   : {
			user : newUser
		}
	});
});

// EXISTING USER LOG IN
exports.login = catchAsync(async (req, res, next) => {
	// Destructure variables received in request body
	const { email, password } = req.body;

	// Check if email and password are present in the request body
	if (!email || !password)
		return next(new AppError("Please provide both email and password", 400));

	// Check if the email received is an existing email
	// And ENABLE the inclusion of the password field in the
	// response obj - By default, this is disabled in the userSchema
	const user = await User.findOne({ email }).select("+password");

	// Compare supplied password with db stored password
	// using the instance method created in userModel file
	// return true or false
	// await user.comparePassword(password, user.password);
	if (!user || !await user.comparePassword(password, user.password))
		return next(new AppError("Incorrect email or password", 401));

	// If everything checks out, create the auth token and
	// send in response body
	const token = signToken(user._id);

	res.status(200).json({
		status : "success",
		token
	});
});

// ROUTE PROTECTION BEHIND AUTHORIZATION
exports.protect = catchAsync(async (req, res, next) => {
	// 1. Check if token exists in the request body
	const auth = req.headers.authorization;

	let token;
	if (auth && auth.startsWith("Bearer")) {
		token = auth.split(" ")[1];
	}

	if (!token) {
		return next(
			new AppError("Unauthorized Access! Please log in first.", 401)
		);
	}

	// 2. Verify the incoming token using jwt
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3. Check if user exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError("The user associated with token no longer exists", 401)
		);
	}

	// 4. Check if the user's password was changed after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError(
				"Did you change your password recently? Please log in again.",
				401
			)
		);
	}

	// 5. if All of the above checks out, grant access to protected route
	req.user = currentUser;
	next();
});
