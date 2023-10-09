var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var PublicUser = mongoose.model('PublicUser', new mongoose.Schema({
  userAgent: mongoose.Schema.Types.Mixed, // String
  questionaireDemographics: mongoose.Schema.Types.Mixed,
  questionaireStudy: mongoose.Schema.Types.Mixed
}));

/* GET public users listing. */
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
    PublicUser.find({}).then(function(users){
      
      // if (err) return console.error(err);
      res.send(users);
    })
    return;
  }

  if (req.body.id) {
    // var publicUser = new PublicUser(req.body);
    PublicUser.findOneAndUpdate({
      _id: req.body.id //mongoose.Types.ObjectId
    }, req.body, { upsert: true }, function (err, returnedPublicUser) {
      // Deal with the response data/error
      if (err) return console.error(err);
      res.send(returnedPublicUser._id);
    });
    
  } else {
    var publicUser = new PublicUser(req.body);
    publicUser.save(function (err, publicUser) {
      if (err) return console.error(err);
      console.log(publicUser._id.toString());
      res.send(publicUser._id.toString());
    });

  }


  // var publicUser = new PublicUser({ userAgent: req.body.userAgent });
  // publicUser.save(function (err, publicUser) {
  //   if (err) return console.error(err);
  //   res.send(publicUser._id);
  // });

});

module.exports = router;
