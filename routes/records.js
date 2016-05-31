var express = require('express');
var router = express.Router();
var Records = require("../models/record-model");
var Bands = require("../models/band-model");
var Genres = require("../models/genre-model");
var User = require('../models/user-model');
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

function getBandsNGenres(req, res, user) {
	var user = user || req.session.user;
	var genresPromise = new Promise(function (resolve, reject) {
		Genres.find({
			user: user._id
		}, function (err, genres) {
			if (err) reject(err);
			resolve(genres);
		});
	});

	var bandsPromise = new Promise(function (resolve, reject) {
		Bands.find({
			user: user._id
		}, function (err, bands) {
			if (err) reject(err);
			resolve(bands);
		});
	});

	return Promise.all([bandsPromise, genresPromise]);
}

router.get('/', auth, function(req, res) {
	var user = req.session.user;
	var recordsPromise = new Promise(function (resolve, reject) {
		Records.find({
			user: user._id
		}, function (err, bands) {
			if (err) reject(err);
			resolve(bands);
		}).populate('band').sort( { band: 1, year: 1, name: 1 });
	});

	Promise.all([getBandsNGenres(req, res, user), recordsPromise]).then(function (values) {
		res.locals.rbands = values[0][0];
		res.locals.rgenres = values[0][1];
		res.locals.records = values[1];
		res.render('records/index');
	}).catch(function (err) {
		res.locals.error = [err.message];
		res.render('records/index');
	});
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

router.get('/user/:id', function (req, res) {
	User.findOne({ _id: req.params.id }, function (err, user) {
		if (user) {
			res.locals.user = user;
			var recordsPromise = new Promise(function (resolve, reject) {
				Records.find({
					user: user._id
				}, function (err, bands) {
					if (err) reject(err);
					resolve(bands);
				}).populate('band').sort( { band: 1, year: 1, name: 1 });
			});

			Promise.all([getBandsNGenres(req, res, user), recordsPromise]).then(function (values) {
				res.locals.rbands = values[0][0];
				res.locals.rgenres = values[0][1];
				res.locals.records = values[1];
				res.render('records/profile');
			}).catch(function (err) {
				res.locals.error = [err.message];
				res.render('records/profile');
			});
		} else {
			res.locals.error =  [req.__("login.notfound")];
			res.redirect('/');
		}
	});
});

router.get('/batch', auth, function (req, res) {
	res.render('records/batch');
});

router.get('/batch/add', auth, function(req, res) {
	var records = JSON.parse(req.query['records']);

	function makeIterator(array){
		var nextIndex = 0;
		
		return {
			next: function(){
				return nextIndex < array.length ?
					{value: array[nextIndex++], done: false} :
					{done: true};
			}
		}
	}

	var iterator = makeIterator(records);

	addRecord(iterator.next(), iterator, req, res);
});

function addRecord(record, iterator, req, res) {
	if (record.done) return res.json(true);

	element = record.value;
	var pBand = fetchBand(req, element.band);
	var pGenre = fetchGenre(req, element.genre);

	Promise.all([pBand, pGenre]).then(function (bg) {
		record = new Records({
			name: element.name,
			band: bg[0],
			year: element.year,
			label: element.label,
			genre: bg[1],
			number: element.number,
			user: req.session.user._id
		});
		record.save(function (err, r) {
			if (err) console.log("ERROR:  --> ", err);
			return addRecord(iterator.next(), iterator, req, res);
		});
	});
}

function fetchBand(req, name) {
	var promise = new Promise(function (resolve, reject) {
		Bands.find({
			name: { "$regex": name, "$options": "ig" }
		}, function (err, band) {
			if (err) console.log("ERROR in Bands:  --> ", err);
			if (band.length) {
				resolve(band[0])
			} else {
				newBand = new Bands({
					name: name,
					user: req.session.user
				});
				newBand.save(function (err, b) {
					if (err) console.log("ERROR in new Bands:  --> ", err);
					resolve(b);
				});
			}
		});
	});
	return promise;
};

function fetchGenre(req, name) {
	var promise = new Promise(function (resolve, reject) {
		Genres.find({
			name: { "$regex": name, "$options": "ig" }
		}, function (err, genre) {
			if (err) console.log("ERROR in Genres:  --> ", err);
			if (genre.length) {
				resolve(genre[0])
			} else {
				newGenre = new Genres({
					name: name,
					user: req.session.user
				});
				newGenre.save(function (err, g) {
					if (err) console.log("ERROR in new Genres:  --> ", err);
					resolve(g);
				});
			}
		});

	});
	return promise;
};

module.exports = router;
