const authRoutes = require('./routes/authRoutes');
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

dotenv.config();

const pool = require('./config/db');
const setupTranscriptionSocket = require('./sockets/transcriptionSocket');
const transcriptionRoutes = require('./routes/transcriptionRoutes');
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie middleware
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/transcriptions', transcriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Procucev AI backend is running!',
  });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.status(200).json({
      success: true,
      message: 'Database connection successful!',
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database test failed:', error.message);

    res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

setupTranscriptionSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Procucev AI server running on port ${PORT}`);
});
