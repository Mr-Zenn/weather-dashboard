require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const weatherRoutes = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    /\.vercel\.app$/,
  ],
}));
app.use(express.json());
app.use('/api/', limiter);

// Routes
app.use('/api/weather', weatherRoutes);

// Health check
app.get('/', (req, res) => res.send('Weather API is running'));

app.listen(PORT, () => {
  if (!process.env.OPENWEATHER_API_KEY) {
    console.error('ERROR: OPENWEATHER_API_KEY is not set in .env');
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
