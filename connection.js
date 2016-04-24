var mongoose = require ("mongoose");

console.log("process.env.MONGOLAB_URI: ", process.env.MONGOLAB_URI);
console.log("process.env.MONGOHQ_URL: ", process.env.MONGOHQ_URL);

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL || 
    "mongodb://localhost/sgonzagao";

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. \n' + err);
  }
});