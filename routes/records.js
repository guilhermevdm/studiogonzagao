var express = require('express');
var router = express.Router();
var Records = require("../models/record-model");
var Bands = require("../models/band-model");
var Genres = require("../models/genre-model");
var auth = require('../middlewares/auth');

function getBandsNGenres(req, res) {
	var genresPromise = new Promise(function (resolve, reject) {
		Genres.find({
			user: req.session.user._id
		}, function (err, genres) {
			if (err) reject(err);
			resolve(genres);
		});
	});

	var bandsPromise = new Promise(function (resolve, reject) {
		Bands.find({
			user: req.session.user._id
		}, function (err, bands) {
			if (err) reject(err);
			resolve(bands);
		});
	});

	return Promise.all([bandsPromise, genresPromise]);
}

router.get('/', auth, function(req, res) {

	var recordsPromise = new Promise(function (resolve, reject) {
		Records.find({
			user: req.session.user._id
		}, function (err, bands) {
			if (err) reject(err);
			resolve(bands);
		}).populate('band');
	});

	Promise.all([getBandsNGenres(req, res), recordsPromise]).then(function (values) {
		res.locals.rbands = values[0][0];
		res.locals.rgenres = values[0][1];
		res.locals.records = values[1];
		res.render('records/index');
	}).catch(function (err) {
		res.locals.error = [err.message];
		res.render('records/index');
	});;
});

router.get('/add', auth, function(req, res) {
	getBandsNGenres(req, res).then(function (values) {
		res.locals.rbands = values[0];
		res.locals.rgenres = values[1];
		res.render('records/new');
	}).catch(function (err) {
		res.locals.error = [err.message];
		res.render('records/index');
	});
});

router.post('/add', auth, function (req, res) {
	var record = new Records({
		name: req.body['record.name'],
		band: req.body['record.band'],
		year: req.body['record.year'],
		label: req.body['record.label'],
		genre: req.body['record.genre'],
		number: req.body['record.number'],
		user: req.session.user._id
	});

	record.save(function (err, record) {
		if (err) {
			req.flash("error", err.message);
		} else {
			req.flash("success", req.__("record.added", {name: record.name })); 
		}
		res.redirect('/records');
	});

});

module.exports = router;
