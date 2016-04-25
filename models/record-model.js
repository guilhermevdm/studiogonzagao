var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var recordSchema = new Schema({
	name: { type: String, required: true },
	band: { type: Schema.Types.ObjectId, ref: 'Band', required: true  },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true  },
	genre: { type: Schema.Types.ObjectId, ref: 'Genre', required: true },
	label: { type: String },
	year: Number,
	number: String
});

recordSchema.plugin(timestamps);

var Record = mongoose.model('Record', recordSchema);

module.exports = Record;