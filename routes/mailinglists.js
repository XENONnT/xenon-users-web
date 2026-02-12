var express = require("express");
var router = express.Router();
var base = process.env.BASE_URL;

const MAILINGLISTS_ARRAY = [['xe-all'], ['xe-analysis'], ['xe-calibration'], ['xe-clean'],
			    ['xe-commissioning'], ['xe-computing'], ['xe-cryogenics'],
			    ['xe-cryostat'], ['xe-daq'], ['xe-detector'], ['xe-infrastructure'],
			    ['xe-montecarlo'], ['xe-muonveto'], ['xe-nveto'], ['xe-operations'],
			    ['xe-pmts'], ['xe-purity'], ['xe-purification'], ['xe-restox'],
			    ['xe-screening'], ['xe-slowcontrol'], ['xe-tpc'], ['xe-watertank'],
			    ['xe-dist'], ['xe-planb'], ['xe-junior']]


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.returnTo = req.originalUrl;
  return res.redirect(base + '/auth/login');
}

// GET Institutes List page.
router.get('/', ensureAuthenticated, async function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');

  var users = await collection.find({'active': 'true'}).toArray();

  var mailing_lists = {};  
  for (let i = 0; i < MAILINGLISTS_ARRAY.length; i++) {
    mailing_lists[MAILINGLISTS_ARRAY[i]] = new Set([]);
  }

  for (let iuser = 0; iuser < users.length; iuser++) {
    if (!('mailing_lists' in users[iuser]) || !('first_name' in users[iuser]) || !('last_name' in users[iuser])) {
      continue
    }
    for (let i = 0; i < users[iuser]['mailing_lists'].length; i++) {
      mailing_lists[users[iuser]['mailing_lists'][i]].add(users[iuser]['first_name'] + " " + users[iuser]['last_name']);
    }
  }
  res.render('mailinglists', 
    { page: 'Mailing lists', 
      menuId: 'home',
      institutes: req.array_of_institutes, 
      user: req.user,
      base_url: base,
      users: users,
      mailing_lists: mailing_lists
    }
  );
});

module.exports = router
