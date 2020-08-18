const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// These routes don't follow the MVC pattern
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword); // When user forgets password
router.patch("/resetPassword/:token", authController.resetPassword); // When user forgets password

router.patch("/updateMe", authController.protect, userController.updateMe); // User want to update info

router.patch(
	"/updateMyPassword",
	authController.protect,
	authController.updatePassword
); // When user wants to simply update their password

// These routes follow the MVC pattern
router
	.route("/")
	.get(userController.getAllUsers)
	.post(userController.createUser);

router
	.route("/:id")
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
