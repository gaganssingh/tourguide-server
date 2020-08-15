const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name            : {
		type     : String,
		required : [ true, "A user must have a name" ],
		trim     : true
	},
	email           : {
		type      : String,
		required  : [ true, "A user must have an email" ],
		unique    : true,
		lowercase : true,
		trim      : true,
		validate  : [ validator.isEmail, "Invalid email id" ]
	},
	photo           : String,
	password        : {
		type      : String,
		required  : [ true, "Please provide a password" ],
		minlength : [ 8, "Password must be atleast 8 characters" ]
	},
	passwordConfirm : {
		type     : String,
		required : [ true, "Please confirm your password" ],
		validate : {
			// Custom validator
			// Only works on the create() and save() operations
			validator : function (el) {
				return el === this.password; // returns true or false
			},
			message   : "Passwords are not the same"
		}
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

// Mongo Model
const User = mongoose.model("User", userSchema);

module.exports = User;
