var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var Records = require("./record-model");
var findOrCreate = require('mongoose-findorcreate')

var bandSchema = new Schema({
	name: { type: String, required: true },
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

bandSchema.plugin(findOrCreate);
bandSchema.plugin(timestamps);

bandSchema.pre('remove', function (next) {
	Records.remove({ band: this.id }).exec();
	next();
});

var Band = mongoose.model('Band', bandSchema);

module.exports = Band;