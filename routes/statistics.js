var express = require('express');
var router = express.Router();
var Records = require("../models/record-model");
var Bands = require("../models/band-model");
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
		var promises = [];
		result.forEach(function (band, index) {
			promises.push(Bands.findOne({
				_id: band._id
			}, function (e, fullband) {
				result[index].name = fullband.name
			}));
		});
		Promise.all(promises).then(function () {
			res.json(result);
		});
	});
});

module.exports = router;
