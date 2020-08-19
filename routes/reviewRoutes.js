const express = require("express");
const router = express.Router();

const routeController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

router.route("/").get(routeController.getAllReviews).post(
	authController.protect, // Only logged in users can post review
	authController.restrictTo("user"), // Only users with "role" of user can post review
	routeController.createReview
);

module.exports = router;
