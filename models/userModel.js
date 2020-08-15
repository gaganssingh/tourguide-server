const mongoose = require("mongoose");
const validator = require("validator");

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
		required : [ true, "Please confirm your password" ]
	}
});

// Mongo Model
const User = mongoose.model("User", userSchema);

module.exports = User;
