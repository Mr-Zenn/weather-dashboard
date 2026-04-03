const IS_PROD = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE = IS_PROD
  ? 'https://weather-dashboard-api-i5z9.onrender.com/api/weather'
  : 'http://localhost:5000/api/weather';
const MAX_RECENT = 5;

// ── DOM refs ──
const cityInput     = document.getElementById('cityInput');
const searchBtn     = document.getElementById('searchBtn');
const errorMsg      = document.getElementById('errorMsg');
const errorText     = document.getElementById('errorText');
const spinner       = document.getElementById('spinner');
const weatherCard   = document.getElementById('weatherCard');
const forecastSection = document.getElementById('forecastSection');
const recentSection = document.getElementById('recentSection');
const recentTags    = document.getElementById('recentTags');
const themeToggle   = document.getElementById('themeToggle');
const emptyState    = document.getElementById('emptyState');
const clearRecentsBtn = document.getElementById('clearRecentsBtn');

// ── Theme ──
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeToggle.querySelector('i').className =
    theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

// ── Search triggers ──
searchBtn.addEventListener('click', () => search(cityInput.value.trim()));
cityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') search(cityInput.value.trim());
});

// ── Core search ──
async function search(city) {
  if (!city) return showError('Please enter a city name.');
  hideError();
  showSpinner(true);
  searchBtn.disabled = true;
  hide(weatherCard);
  hide(forecastSection);
  hide(emptyState);

  try {
    const [weather, forecast] = await Promise.all([
      fetchJSON(`${API_BASE}/current?city=${encodeURIComponent(city)}`),
      fetchJSON(`${API_BASE}/forecast?city=${encodeURIComponent(city)}`),
    ]);
    renderWeather(weather);
    renderForecast(forecast);
    saveRecent(city);
  } catch (err) {
    showError(err.message || 'Something went wrong.');
  } finally {
    showSpinner(false);
    searchBtn.disabled = false;
  }
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    if (err.name === 'TypeError') throw new Error('Cannot reach server. Is the backend running?');
    throw err;
  }
}

// ── Render current weather ──
function renderWeather(d) {
  document.getElementById('cityName').textContent =
    `${d.name}, ${d.sys.country}`;
  document.getElementById('dateTime').textContent = formatDate(new Date());
  document.getElementById('temperature').textContent = Math.round(d.main.temp);
  document.getElementById('condition').textContent = d.weather[0].description;
  document.getElementById('humidity').textContent = `${d.main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${d.wind.speed} m/s`;
  document.getElementById('visibility').textContent =
    `${(d.visibility / 1000).toFixed(1)} km`;
  document.getElementById('feelsLike').textContent =
    `${Math.round(d.main.feels_like)}°`;
  document.getElementById('weatherIcon').src =
    `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;
  document.getElementById('weatherIcon').alt = d.weather[0].description;
  document.getElementById('sunrise').textContent = formatTime(d.sys.sunrise);
  document.getElementById('sunset').textContent  = formatTime(d.sys.sunset);
  document.getElementById('pressure').textContent = `${d.main.pressure} hPa`;
  document.getElementById('clouds').textContent   = `${d.clouds.all}%`;

  show(weatherCard);
}

// ── Render 5-day forecast ──
function renderForecast(data) {
  // API returns readings every 3h — pick one per day (noon reading)
  const daily = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date] && item.dt_txt.includes('12:00:00')) daily[date] = item;
  });

  // Fallback: if no noon reading, take first of that day
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date]) daily[date] = item;
  });

  const days = Object.values(daily).slice(0, 5);
  const strip = document.getElementById('forecastStrip');
  strip.innerHTML = days.map(item => `
    <div class="forecast-card">
      <span class="forecast-day">${formatDay(item.dt_txt)}</span>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
           alt="${item.weather[0].description}"/>
      <span class="forecast-temp-high">${Math.round(item.main.temp_max)}°</span>
      <span class="forecast-temp-low">${Math.round(item.main.temp_min)}°</span>
    </div>
  `).join('');

  show(forecastSection);
}

// ── Recent searches ──
function saveRecent(city) {
  let recents = getRecents();
  recents = [city, ...recents.filter(c => c.toLowerCase() !== city.toLowerCase())]
    .slice(0, MAX_RECENT);
  localStorage.setItem('recentSearches', JSON.stringify(recents));
  renderRecents();
}

function getRecents() {
  return JSON.parse(localStorage.getItem('recentSearches') || '[]');
}

function renderRecents() {
  const recents = getRecents();
  if (!recents.length) { hide(recentSection); return; }
  recentTags.innerHTML = recents.map(city =>
    `<button class="tag" data-city="${city}">${city}</button>`
  ).join('');
  show(recentSection);
}

recentTags.addEventListener('click', e => {
  if (e.target.classList.contains('tag')) {
    const city = e.target.dataset.city;
    cityInput.value = city;
    search(city);
  }
});

// ── Helpers ──
function showError(msg) {
  errorText.textContent = msg;
  show(errorMsg);
}
function hideError() { hide(errorMsg); }
function showSpinner(on) { on ? show(spinner) : hide(spinner); }
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDay(dtTxt) {
  return new Date(dtTxt).toLocaleDateString('en-US', { weekday: 'short' });
}

// ── Clear recent searches ──
clearRecentsBtn.addEventListener('click', () => {
  localStorage.removeItem('recentSearches');
  renderRecents();
});

// ── Empty state suggestions ──
document.getElementById('emptyState').addEventListener('click', e => {
  if (e.target.classList.contains('tag')) {
    const city = e.target.dataset.city;
    cityInput.value = city;
    search(city);
  }
});

// ── Init: load recents on page load ──
renderRecents();
