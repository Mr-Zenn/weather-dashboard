const axios = require('axios');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const handleApiError = (err) => {
  if (err.response?.status === 404) throw { status: 404, message: 'City not found' };
  if (err.response?.status === 401) throw { status: 401, message: 'Invalid API key' };
  throw { status: 500, message: 'Weather service unavailable' };
};

const fetchCurrentWeather = async (city) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' },
    });
    return data;
  } catch (err) {
    handleApiError(err);
  }
};

const fetchForecast = async (city) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/forecast`, {
      params: { q: city, appid: process.env.OPENWEATHER_API_KEY, units: 'metric', cnt: 40 },
    });
    return data;
  } catch (err) {
    handleApiError(err);
  }
};

module.exports = { fetchCurrentWeather, fetchForecast };
