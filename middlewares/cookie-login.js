var User = require('../models/user-model');

module.exports = function (req, res, next) {
	if ( !req.session.user  && req.cookies["auth.email"] && req.cookies["auth.id"]) {
		var userCookie = {
			username: req.cookies["auth.email"],
			_id: req.cookies["auth.id"]
		};
		User.findOne(userCookie, function (err, user) {
			if (user) {
				req.session.user = user;
			}
			next();
		});
	} else {
		next();
	}
}