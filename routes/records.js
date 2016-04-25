var express = require('express');
var router = express.Router();
var Records = require("../models/record-model");
var Bands = require("../models/band-model");
var Genres = require("../models/genre-model");
var auth = require('../middlewares/auth');

var cache = {
	genres: undefined,
	bands: undefined
};

function getFromCache(req, res) {
	var cachePromise = new Promise(function (resolve, reject) {

		if(! cache.bands) {
			var bandsPromise = new Promise(function (resolve, reject) {
				Bands.find({
				user: req.session.user._id
				}, function (err, bands) {
					if (err) reject(err);
					resolve(bands);
				});
			});
		} else {
			var bandsPromise = Promise.resolve(cache.bands);
		}


		var genresPromise;
		if(! cache.genres) {
			genresPromise = new Promise(function (resolve, reject) {
				Genres.find({
					user: req.session.user._id
				}, function (err, genres) {
					if (err) reject(err);
					resolve(genres);

				});
			});
		} else {
			genresPromise = Promise.resolve(cache.genres);
		}

		Promise.all([bandsPromise, genresPromise]).then(function (values) {
			cache.bands = values[0];
			cache.genres = values[1];
			resolve(cache);
		}).catch(function (err) {
			reject(err);
		});
	});
	return cachePromise;
}

router.get('/', auth, function(req, res) {
	Records.find({
		user: req.session.user._id
	}, function (err, records) {
		getFromCache(req, res).then(function (cache) {
			res.locals.rbands = cache.bands;
			res.locals.rgenres = cache.genres;
			res.locals.records = records;
			res.render('records/index');
		}).catch(function (err) {
			res.locals.error = [err];
			res.render('records/index');
		});
	});
});

router.get('/add', auth, function(req, res) {
	res.render('records/new');
});

module.exports = router;
