var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var SolveAttempt = mongoose.model('SolveAttempt', new mongoose.Schema({
  experiment: mongoose.Schema.Types.Mixed,
  history: mongoose.Schema.Types.Mixed,
  setup: mongoose.Schema.Types.Mixed,
  userID: String,
  id: String
}));

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/', function (req, res, next) {

  let approvedAdmins = [
    'OqLM9xonsBTlsCiUPeIW7qtBCdv1',
    'QpP4ihjNfYMm58H13FkItMT1HWI2',
    'Sn2C2FTvDbUPpOMvp543EQ4XCnO2',
    'W6Rjn2AosDcVNHNm11lzKxQVhWt2',
    'rIcKbKyf7fWuRJjEKGwIO4sSvfh2',
    't8kelOBGC3auBA4cFzWMhvSQJuY2'
  ];

  if (approvedAdmins.indexOf(req.body.userID) > -1) {
    SolveAttempt.find({}).then(function (solveAttempts) {
      res.send(solveAttempts);
    })
    return;
  }

  if (req.body.id) {

    SolveAttempt.findOneAndUpdate({
      _id: req.body.id //mongoose.Types.ObjectId
    }, req.body, { upsert: true }, function (err, returnedSolveAttempt) {
      // Deal with the response data/error
      if (err) return console.error(err);
        res.send(returnedSolveAttempt._id.toString());
    });

  } else {

    var solveAttempt = new SolveAttempt(req.body);
    solveAttempt.save(function (err, solveAttempt) {
      if (err) return console.error(err);
      res.send(solveAttempt._id.toString());
    });
    
  }

});






module.exports = router;
