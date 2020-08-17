const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		host : process.env.EMAIL_HOST,
		port : process.env.EMAIL_PORT,
		auth : {
			user : process.env.EMAIL_USERNAME, // from mailtrap
			pass : process.env.EMAIL_PASSWORD // from mailtrap
		}
	});

	// 2) Define the email options
	const mailOptions = {
		from    : "Gagan Singh <hello@gagan.io>",
		to      : options.email,
		subject : options.subject,
		text    : options.message
	};

	// 3. Send email using nodemailer (await as it returns a promise)
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
