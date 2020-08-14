const { __esModule } = require("validator/lib/isPostalCode");

module.exports = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};
