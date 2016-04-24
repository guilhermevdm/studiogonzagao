var express = require('express');
var router = express.Router();
var Genre = require("../models/genre-model");
var auth = require('../middlewares/auth');

router.get('/', auth, function(req, res) {
	Genre.find({
			user: req.session.user._id
		}, function (err, genres) {
			res.locals.genres = genres;
			res.render('genres/index');
		});
});

router.get('/add', auth, function(req, res) {
	res.render('genres/new');
});

router.post('/add', auth, function(req, res) {
	var genre = new Genre({
		name: req.body["genre.name"],
		user: req.session.user
	});

	genre.save(function (err, genre) {
		if (err) {
			req.flash("error", err);
		} else {
			req.flash("success", req.__("genres.added", {name: genre.name })); 
		}
		res.redirect('/genres');
	});
});

router.post('/delete', auth, function(req, res) {
	var genre = { 
		_id: req.body["genre.id"],
		user: req.session.user._id
	};

	Genre.remove(genre, function (err, genre) {
		if (err) {
			req.flash("error", err.message);
		} else {
			req.flash("success", res.__("genres.deleted"));
		}
		res.redirect('/genres');
	});
});

router.post('/edit', auth, function(req, res) {
	var query = Genre.where({ 
		_id: req.body["genre.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, genre) {
		if (err) {
			req.flash("error", err.message);
			res.redirect('/genres');
		} else {
			res.locals.genre = genre;
			res.render('genres/edit');
		}
	});
});

router.post('/edit/save', auth, function(req, res) {
	var query = Genre.where({ 
		_id: req.body["genre.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, genre) {
		if (err) {
			req.flash("error", err.message);
			res.redirect('/genres');
		} else {
			genre.name = req.body["genre.name"];
			genre.save(function (err, genre) {
				if (err) {
					req.flash("error", err.message);
				} else {
					req.flash("success", res.__("genres.updated", { name: genre.name }));
				}
				res.redirect('/genres');
			});	
		}
	});
});

router.get('/search', auth,function (req, res) {
	Genre.find({
			name: { "$regex": req.query["genre.name"], "$options": "ig" } ,
			user: req.session.user._id
		}, function (err, genres) {
			if (genres.length == 0) {
				res.locals.error = [res.__("genres.notfound", { query : req.query["genre.name"] })];
			}
			res.locals.genres = genres;
			res.render('genres/index');
		});
});

module.exports = router;
