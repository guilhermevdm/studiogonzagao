var mongoose = require ("mongoose");

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL || 
    "mongodb://localhost/sgonzagao";

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  }
});

//mongoose.set('debug', true);