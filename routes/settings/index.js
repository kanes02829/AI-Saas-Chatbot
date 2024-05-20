const express = require('express');

let router = express.Router();

router.use('/invitation', require('./invitation'));
router.use('/organization', require('./organization'));

module.exports = router;
