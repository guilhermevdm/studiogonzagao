var mongoose = require ("mongoose");
var mongooseCachebox = require("mongoose-cachebox");

var uristring =
    process.env.DATABASE_URI ||
    "mongodb://172.31.31.0/sgonzagao";

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. \n' + err);
  }
});

var options = {
  cache: true, // start caching
  ttl: 30 // 30 seconds
};

// adding mongoose cachebox
mongooseCachebox(mongoose, options);

mongoose.set('debug', true);