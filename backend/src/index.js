// Load and validate environment (auto-creates .env if missing)
require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { createServer } = http;
const { Server } = require('socket.io');
const apiRouter = require('./routes/api');
const { connect, mongoose } = require('./lib/mongo');
const cookieParser = require('cookie-parser');
const { requestLogger } = require('./middleware/logger');
const geminiService = require('./ai/geminiService');
require('./jobs/aiWorker');

const app = express();

// Trust proxy (required for secure cookies behind proxies like Render/Vercel)
app.set('trust proxy', true);

// Security
app.use(helmet());

// CORS configuration - explicitly allow frontend + credentials
const FRONTEND_URLS = [
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

const uniqueOrigins = [...new Set(FRONTEND_URLS)];
// ensure known deployed frontend is allowed if not explicitly set
if (process.env.NODE_ENV === 'production' && !uniqueOrigins.length) {
  uniqueOrigins.push('https://civicconnect-aurex-2026.vercel.app');
}
console.log('CORS allowed origins:', uniqueOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (uniqueOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

// Apply CORS to all routes (CRITICAL: must come BEFORE routes)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// health endpoint (checks DB and AI readiness)
app.get('/api/v1/health', async (req, res) => {
  const uptime = process.uptime();
  const dbState = mongoose && mongoose.connection && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let aiStatus = 'unavailable';
  try {
    // quick lightweight call to AI service; timed to 3s in geminiService
    const result = await Promise.race([
      geminiService.analyzeTicket('health-check: is service available?'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
    ]);
    if (result && (result.category || result.summary)) aiStatus = 'ready';
  } catch (err) {
    aiStatus = process.env.GEMINI_API_KEY ? 'unreachable' : 'disabled';
  }

  res.json({ status: 'OK', database: dbState, ai: aiStatus, sockets: (global.__io_initialized ? 'active' : 'inactive'), uptime: Math.floor(uptime) });
});

// Root health check for Render / root URL (prevents 404 on service root)
app.get('/', (req, res) => {
  return res.json({ success: true, message: 'CivicConnect API is running successfully 🚀' });
});

app.use('/api/v1', apiRouter);

const PORT = Number(process.env.PORT || 5000);
const MAX_PORT_RETRIES = Number(process.env.PORT_RETRY_LIMIT || 5);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: uniqueOrigins.length ? uniqueOrigins : true,
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.once('disconnect', () => console.log('socket disconnected', socket.id));
});

const { setIO } = require('./lib/socket');

setIO(io);
global.__io_initialized = true;

function startServer(port, retriesLeft) {
  const onListening = () => {
    console.log(`CivicConnect backend running on port ${port}`);
  };

  const onError = (err) => {
    if (err && err.code === 'EADDRINUSE' && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, trying ${nextPort}`);
      server.removeListener('listening', onListening);
      server.removeListener('error', onError);
      server.close(() => startServer(nextPort, retriesLeft - 1));
      return;
    }

    console.error('Server failed to start:', err && err.message ? err.message : err);
    process.exit(1);
  };

  server.once('listening', onListening);
  server.once('error', onError);
  server.listen(port);
}

startServer(PORT, MAX_PORT_RETRIES);

module.exports = { app, io };

// Connect to MongoDB
connect();
