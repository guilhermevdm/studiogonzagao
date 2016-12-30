var express = require('express');
var router = express.Router();
var Track = require("../models/track-model");
var Records = require("../models/record-model");
var auth = require('../middlewares/auth');

router.get('/', auth, function(req, res) {
	var user = req.session.user;

	Track.find({
		user: req.session.user._id
	}, function (err, tracks) {
		if (err) {
			res.locals.error = [err.message];
			res.render('tracks/index');
		}
		res.locals.tracks = tracks;
		res.render('tracks/index');
	}).populate('record');
});

function getRecords(user) {
	return new Promise(function (resolve, reject) {
		Records.find({
			user: user._id
		}, function (err, records) {
			if (err) reject(err);
			resolve(records);
		});
	});
}

router.get('/add', auth, function(req, res) {
	var user = req.session.user;
	getRecords(user).then(function(records) {
		res.locals.records = records;
		res.render('tracks/new');
	}).catch(function (err) {
		res.locals.error = [err.message];
		res.render('tracks/index');
	});
	
});

router.post('/add', auth, function(req, res) {
	var track = new Track({
		name: req.body["track.name"],
		record: req.body["track.record"],
		user: req.session.user
	});

	track.save(function (err, track) {
		if (err) {
			req.flash("error", err);
		} else {
			req.flash("success", req.__("tracks.added", {name: track.name })); 
		}
		res.redirect('/tracks');
	});
});

router.post('/delete', auth, function(req, res) {
	var query = Track.where({
		_id: req.body["track.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, track) {
		track.remove();
		if (err) {
			req.flash("error", err.message);
		} else {
			req.flash("success", res.__("tracks.deleted"));
		}
		res.redirect('/tracks');
	});
});

router.get('/edit/:id', auth, function(req, res) {
	var query = Track.where({ 
		_id: req.params.id,
		user: req.session.user._id
	});

	var trackPromise = new Promise(function(resolve, reject) {
		query.findOne(function (err, track) {
			if (err) {
				console.log('oi')
				reject(err);
			} else {
				resolve(track);
			}
		});	
	});

	Promise.all([trackPromise, getRecords(req.session.user)]).then(function(values) {
		console.log(values)
		res.locals.track = values[0];
		res.locals.records = values[1];
		res.render('tracks/edit');
	}).catch(function (err) {
		res.locals.error = [err.message];
		res.render('tracks/edit');
	});

});

router.post('/edit/save', auth, function(req, res) {
	var query = Track.where({ 
		_id: req.body["track.id"],
		user: req.session.user._id
	});

	query.findOne(function (err, track) {
		if (err) {
			req.flash("error", err.message);
			res.redirect('/tracks');
		} else {
			track.name = req.body["track.name"];
			track.record = req.body["track.record"];
			track.save(function (err, track) {
				if (err) {
					req.flash("error", err.message);
				} else {
					req.flash("success", res.__("tracks.updated", { name: track.name }));
				}
				res.redirect('/tracks');
			});	
		}
	});
});

module.exports = router;
