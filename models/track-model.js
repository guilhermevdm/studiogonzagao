var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var trackSchema = new Schema({
	name: { type: String, required: true },
	record: { type: Schema.Types.ObjectId, ref: 'Record', required: true  },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true  }
});

trackSchema.plugin(timestamps);

var Track = mongoose.model('Track', trackSchema);

module.exports = Track;