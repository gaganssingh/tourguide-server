const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

// HELPER FUNCTIONS
const signToken = (userId) =>
	jwt.sign({ id: userId }, process.env.JWT_SECRET, {
		expiresIn : process.env.JWT_EXPIRES_IN
	});

// ROUTES
// NEW USER SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
	// Destructure variables received in request body
	const { name, email, password, passwordConfirm, role } = req.body;
	// NOTE: No need for manual validation, as validation
	// is handled in the userModel file by the schema

	// Create a new user on the db
	const newUser = await User.create({
		name,
		email,
		password,
		passwordConfirm,
		role
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

// Roles is an array, e.g. ["admin", "user"]
// If no role specified in the request body, role="user"
// as set as default in user model
exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			// req.user assigned in .protect() method above
			return next(
				new AppError(
					"You do not have sufficient permissions to perform this action",
					403
				)
			);
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on POSTed email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError("There is no user with email address.", 404));
	}

	// 2) Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// 3) Send it to user's email
	const resetURL = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/users/resetPassword/${resetToken}`;

	const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

	try {
		await sendEmail({
			email   : user.email,
			subject : "Your password reset token (valid for 10 min)",
			message
		});

		res.status(200).json({
			status  : "success",
			message : "Token sent to email!"
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new AppError("There was an error sending the email. Try again later!"),
			500
		);
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1. Hash the user token on the request params,
	// to compare to one token  stored in db
	const hashedToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	// 2. Use the hashedToken above to identify the user
	// and check id the token is expired or not
	const user = await User.findOne({
		passwordResetToken   : hashedToken,
		passwordResetExpires : { $gt: Date.now() }
	});

	if (!user) {
		return next(new AppError("Token isinvalid or has expired", 400));
	}

	// 3. If token is valid /not expired, and user
	// exists, set new password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;

	// Empty out:
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	// Save updated user (with new password) in database
	await user.save();

	// 3. Update changedPasswordAt property for current user
	// Runs automatically as a "pre" middleware function - defined in userModel

	// 4. Log the user in
	const token = signToken(user._id);

	res.status(200).json({
		status : "success",
		token
	});
});
