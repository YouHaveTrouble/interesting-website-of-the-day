const express = require('express');
const router = express.Router();


router.get('/', function(req, res, next) {

    res.render('info', {
      title: 'Interesting website of the day',
    });

});

module.exports = router;
