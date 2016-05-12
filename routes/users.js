var express = require('express');
var router = express.Router();
var User = require('../models/user-model');
var security = require('../middlewares/security');

router.get('/register', function(req, res) {
	res.locals.register = "active";
	res.render('user/register', {title: "Studio Gonzagão"});
});

router.post('/register', function(req, res) {
	var user = new User({
		name: req.body.name,
		username: req.body.username,
		password: security.encrypt(req.body.password)
	});

	user.save(function (err) {
		if (err) {
			req.flash("error", err.code);
		} else {
			req.flash("success", req.__("login.registered")); 
		}
		res.redirect('/login');
	});
});

module.exports = router;
