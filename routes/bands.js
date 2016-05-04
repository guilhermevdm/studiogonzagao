var express = require('express');
var router = express.Router();
var Band = require("../models/band-model");
var auth = require('../middlewares/auth');

router.get('/', auth, function(req, res) {
	Band.find({
			user: req.session.user._id
		}, function (err, bands) {
			res.locals.bands = bands;
			res.render('bands/index');
		});
});

router.get('/add', auth, function(req, res) {
	res.render('bands/new');
});

router.post('/add', auth, function(req, res) {
	var band = new Band({
		name: req.body["band.name"],
		user: req.session.user
	});

	band.save(function (err, band) {
		if (err) {
			req.flash("error", err);
		} else {
			req.flash("success", req.__("bands.added", {name: band.name })); 
		}
		res.redirect('/bands');
	});
});

router.post('/delete', auth, function(req, res) {
	var query = Band.where({
		_id: req.body["band.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, band) {
		band.remove();
		if (err) {
			req.flash("error", err.message);
		} else {
			req.flash("success", res.__("bands.deleted"));
		}
		res.redirect('/bands');
	});
});

router.post('/edit', auth, function(req, res) {
	var query = Band.where({ 
		_id: req.body["band.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, band) {
		if (err) {
			req.flash("error", err.message);
			res.redirect('/bands');
		} else {
			res.locals.band = band;
			res.render('bands/edit');
		}
	});
});

router.post('/edit/save', auth, function(req, res) {
	var query = Band.where({ 
		_id: req.body["band.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, band) {
		if (err) {
			req.flash("error", err.message);
			res.redirect('/bands');
		} else {
			band.name = req.body["band.name"];
			band.save(function (err, band) {
				if (err) {
					req.flash("error", err.message);
				} else {
					req.flash("success", res.__("bands.updated", { name: band.name }));
				}
				res.redirect('/bands');
			});	
		}
	});
});

router.get('/search', auth,function (req, res) {
	Band.find({
			name: { "$regex": req.query["band.name"], "$options": "ig" } ,
			user: req.session.user._id
		}, function (err, bands) {
			if (bands.length == 0) {
				res.locals.error = [res.__("bands.notfound", { query : req.query["band.name"] })];
			}
			res.locals.bands = bands;
			res.render('bands/index');
		});
});

module.exports = router;
