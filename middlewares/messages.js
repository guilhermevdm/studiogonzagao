module.exports = function(req, res, next) {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.info = req.flash('info');
	res.locals.warning = req.flash('warning');
	next();
};