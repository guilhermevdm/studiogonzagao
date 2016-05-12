var express = require('express');
var router = express.Router();
var User = require('../models/user-model');
var auth = require('../middlewares/auth');
var security = require('../middlewares/security');

router.get('/', function(req, res) {
	res.locals.login = "active";
	if (req.session.user) {
		req.flash("warning", req.__("login.alreadylogged"));
		res.redirect("/");
	} else {
		res.render('login/login');
	}
});

router.get('/logout', auth, function(req, res) {
	delete req.session.user;
	res.cookie('auth.email', "", { maxAge: -1, httpOnly: true });
	res.cookie('auth.id', "", { maxAge: -1, httpOnly: true });
	req.flash("success", req.__("login.logout"));
	res.redirect('/');
});

router.post('/', function(req, res) {
	var user = { 
		username: req.body.username,
		password: security.encrypt(req.body.password)
	};

	findUser(req, res, user);
});

function findUser(req, res, user) {
	var ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

	User.findOne(user, function (err, user) {
		if (user) {
			req.session.user = user;
			res.cookie('auth.email', user.username, { maxAge: ONE_WEEK, httpOnly: true });
			res.cookie('auth.id', user.id, { maxAge: ONE_WEEK, httpOnly: true });
			req.flash("success", req.__("login.logged", {name: user.name }));
			res.redirect('/');
		} else {
			res.locals.error =  [req.__("login.notfound")];
			res.render('login/login');
		}
	});
}

module.exports = router;
