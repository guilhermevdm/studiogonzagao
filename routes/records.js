var express = require('express');
var router = express.Router();
var Records = require("../models/record-model");
var Bands = require("../models/band-model");
var Genres = require("../models/genre-model");
var auth = require('../middlewares/auth');

function saveImage(id, base64Data) {
	var base64Data = base64Data.replace(/^data:image\/png;base64,/, "")
								.replace(/^data:image\/jpeg;base64,/, "");
	var filename = "public/images/covers/" +id + ".jpg";
	require("fs").writeFile(filename, base64Data, 'base64', function(err) {
		console.error("ERROR: ", err);
	});
	return filename.replace('public', '');
};

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
		}).populate('band').sort( { 'band.name': 1, year: 1, name: 1 });
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
		cover: req.body['record.artwork'],
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

router.post('/edit', auth, function(req, res) {
	getBandsNGenres(req, res).then(function (values) {
		res.locals.rbands = values[0];
		res.locals.rgenres = values[1];
		var query = Records.where({ 
			_id: req.body["record.id"],
			user: req.session.user._id
		}).populate('band genre');
		query.findOne(function (err, record) {
			if (err) {
				req.flash("error", err.message);
				res.render('records/index');
			} else {
				res.locals.record = record;
				res.render('records/edit');
			}
		});
	}).catch(function (err) {
		res.locals.error = [err.message];
		res.render('records/index');
	});

});

router.post('/edit/save', auth, function(req, res) {

	var query = Records.where({ 
		_id: req.body["record.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, record) {
		if (err) {
			req.flash("error", err.message);
			res.redirect('/records');
		} else {
			record.name = req.body['record.name'];
			record.band = req.body['record.band'];
			record.year = req.body['record.year'];
			record.label = req.body['record.label'];
			record.genre = req.body['record.genre'];
			record.number = req.body['record.number'];
			record.cover = req.body['record.artwork'];
			record.save(function (err, record) {
				if (err) {
					req.flash("error", err.message);
				} else {
					req.flash("success", res.__("records.updated", { name: record.name }));
				}
				res.redirect('/records');
			});	
		}
	});
});

router.get('/search', auth,function (req, res) {
	var query = {
			name: { "$regex": req.query["record.name"], "$options": "ig" },
			user: req.session.user._id
		};
		if (req.query["record.band"].trim())
			query.band = req.query["record.band"];

		if (req.query["record.genre"].trim())
			query.genre = req.query["record.genre"];
	Records.find(query, function (err, records) {
			getBandsNGenres(req, res).then(function (values) {
				res.locals.rbands = values[0];
				res.locals.rgenres = values[1];
				if (records.length == 0) {
					res.locals.error = [res.__("record.notfound", { query : req.query["record.name"] })];
				}
				res.locals.query = query;
				res.locals.records = records;
				res.render('records/index');
			});
		}).populate('band');
});


module.exports = router;
