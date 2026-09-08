const express = require('express');
const { reverse, search } = require('../controllers/locationController');

const router = express.Router();

router.get('/search', search);
router.get('/reverse', reverse);

module.exports = router;
