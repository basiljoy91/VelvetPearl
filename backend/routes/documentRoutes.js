const express = require('express');
const { downloadByToken } = require('../controllers/documentController');

const router = express.Router();

router.get('/:token', downloadByToken);

module.exports = router;
