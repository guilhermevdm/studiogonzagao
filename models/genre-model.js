var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var genreSchema = new Schema({
	name: { type: String, required: true },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

genreSchema.plugin(timestamps);

var Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;