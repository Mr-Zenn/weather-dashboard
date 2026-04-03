const { fetchCurrentWeather, fetchForecast } = require('../services/weatherService');

const CITY_REGEX = /^[a-zA-Z\u00C0-\u024F\s\-',.]{1,100}$/;

const getCurrentWeather = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City name is required' });
  if (!CITY_REGEX.test(city)) return res.status(400).json({ error: 'Invalid city name' });

  try {
    const data = await fetchCurrentWeather(city);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getForecast = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City name is required' });
  if (!CITY_REGEX.test(city)) return res.status(400).json({ error: 'Invalid city name' });

  try {
    const data = await fetchForecast(city);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { getCurrentWeather, getForecast };
