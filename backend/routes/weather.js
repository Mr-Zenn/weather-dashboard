const express = require('express');
const router = express.Router();
const { getCurrentWeather, getForecast } = require('../controllers/weatherController');

router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);

module.exports = router;
