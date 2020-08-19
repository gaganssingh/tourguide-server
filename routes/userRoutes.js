const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// These routes don't follow the MVC pattern
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword); // When user forgets password
router.patch("/resetPassword/:token", authController.resetPassword); // When user forgets password

// ALL routes after this middleware will be protected
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword); // When user wants to simply update their password
router.get("/me", userController.getMe, userController.getUser); // /api/v1/users/me
router.patch("/updateMe", userController.updateMe); // /api/v1/users/updateMe User wants to update their info
router.delete("/deleteMe", userController.deleteMe); // /api/v1/users/deleteMe User wants to Delete/Deactivate their account

// ALL routes after this middleware can only be used by admins
router.use(authController.restrictTo("admin"));

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
