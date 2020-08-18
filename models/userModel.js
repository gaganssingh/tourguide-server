const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name                 : {
		type     : String,
		required : [ true, "A user must have a name" ],
		trim     : true
	},
	email                : {
		type      : String,
		required  : [ true, "A user must have an email" ],
		unique    : true,
		lowercase : true,
		trim      : true,
		validate  : [ validator.isEmail, "Invalid email id" ]
	},
	photo                : String,
	role                 : {
		type    : String,
		enum    : [ "user", "guide", "lead-guide", "admin" ],
		default : "user"
	},
	password             : {
		type      : String,
		required  : [ true, "Please provide a password" ],
		minlength : [ 8, "Password must be atleast 8 characters" ],
		select    : false // Flag that tells mongoose to not send this field back in response
	},
	passwordConfirm      : {
		type     : String,
		required : [ true, "Please confirm your password" ],
		validate : {
			// Custom validator
			// Only works on the create() and save() operations
			validator : function (el) {
				return el === this.password; // returns true or false
			},
			message   : "Passwords are not the same",
			select    : false // Flag that tells mongoose to not send this field back in response
		}
	},
	passwordChangedAt    : Date,
	passwordResetToken   : String,
	passwordResetExpires : Date, // How long before the passwordResetToken expires
	active               : {
		// Marks if the user is active or not
		// When user "deletes"/"deactivates" their account
		// set active to false
		type    : Boolean,
		default : true,
		select  : false // Flag that tells mongoose to not send this field back in response
	}
});

// MIDDLEWARES
// Hash Password middleware
userSchema.pre("save", async function (next) {
	// if the password has not been modified,
	// just return and call next middleware
	if (!this.isModified("password")) return next();

	// Hash password
	this.password = await bcrypt.hash(this.password, 12);

	// passwordConfirm is only required for comparison
	// so no need to store it in the db
	this.passwordConfirm = undefined;

	next();
});

// RE: Reset password function
userSchema.pre("save", function (next) {
	// If the password was not modified, do nothing and return
	// .isModified() and .isNew() come from mongoose
	if (!this.isModified("password") || this.isNew) return next();

	// Actual time may be different. So use this "hack"
	// of subtracting 1 second
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// QUERY MIDDLEWARE
// /^find/ is a Reg Exp to make the callback run for all methods
// that start with find (e.g: find, findById etc)
// HOW THIS WORKS: Whenever a mongoose method that starts with "find"
// is run; like .find(), .findById() etc.; this will run before it
userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } }); // when quering the db, only "find" users where {active: true}
	next();
});

// INSTANCE METHOD - Available wherever this User model is imported
// Compare user supplied password to db stored password
// prettier-ignore
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword); // Returns true or false
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);

		// return true if password was changed after the token was issued
		return JWTTimestamp < changedTimestamp;
	}

	// DEFAULT: false
	return false;
};

// RE: Forgot password route
userSchema.methods.createPasswordResetToken = function () {
	// Generate reset token
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto
		.createHash("sha256") // Creates a hash for the resetToken
		.update(resetToken)
		.digest("hex");

	console.log({ resetToken }, { database: this.passwordResetToken });

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

	// encrypted token is stored in the db
	// but the unencrypted version is sent back to the user's email
	return resetToken;
};

// Mongo Model
const User = mongoose.model("User", userSchema);

module.exports = User;
