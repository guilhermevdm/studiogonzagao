var express = require('express');
var router = express.Router();
var Records = require("../models/record-model");
var Bands = require("../models/band-model");
var Genres = require("../models/genre-model");
var mongoose = require ("mongoose");

router.get('/', function(req, res, next) {
	res.locals.statistics = true;
	res.render('statistics/index');
});

router.get('/bands', function (req, res) {
	Records.aggregate([
		{ $match: { user: mongoose.Types.ObjectId(req.session.user._id) } },
		{ $group: { 
				_id: '$band',
				count: {$sum: 1}
			} 
		},
	], function (err, result) {
		var bands = result.map(function (band) {
			return band._id;
		});
		Bands.find({
			_id: { $in: bands }
		}, function (e, bands) {
			if (e) return res.status(500).json(e);
			var response = [];
			bands.forEach(function (band) {

				response.push({
					name: band.name,
					count: result.filter(function (r) {
						return r._id == band.id;
					})[0].count
				});

			});
			res.json(response);
		});
	});
});

router.get('/genres', function (req, res) {
	Records.aggregate([
		{ $match: { user: mongoose.Types.ObjectId(req.session.user._id) } },
		{ $group: { 
				_id: '$genre',
				count: {$sum: 1}
			} 
		},
	], function (err, result) {
		var genres = result.map(function (genre) {
			return genre._id;
		});
		Genres.find({
			_id: { $in: genres }
		}, function (e, genres) {
			if (e) return res.status(500).json(e);
			var response = [];
			genres.forEach(function (genre) {

				response.push({
					name: genre.name,
					count: result.filter(function (r) {
						return r._id == genre.id;
					})[0].count
				});

			});
			res.json(response);
		});
	});
});

module.exports = router;
