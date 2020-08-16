const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name              : {
		type     : String,
		required : [ true, "A user must have a name" ],
		trim     : true
	},
	email             : {
		type      : String,
		required  : [ true, "A user must have an email" ],
		unique    : true,
		lowercase : true,
		trim      : true,
		validate  : [ validator.isEmail, "Invalid email id" ]
	},
	photo             : String,
	role              : {
		type    : String,
		enum    : [ "user", "guide", "lead-guide", "admin" ],
		default : "user"
	},
	password          : {
		type      : String,
		required  : [ true, "Please provide a password" ],
		minlength : [ 8, "Password must be atleast 8 characters" ],
		select    : false // Flag that tells mongoose to not send this field back in response
	},
	passwordConfirm   : {
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
	passwordChangedAt : Date
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

// INSTANCE METHOD - Available wherever this User model is imported
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

// Mongo Model
const User = mongoose.model("User", userSchema);

module.exports = User;
