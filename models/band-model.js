var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var bandSchema = new Schema({
	name: { type: String, required: true },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

bandSchema.plugin(timestamps);

var Band = mongoose.model('Band', bandSchema);

module.exports = Band;