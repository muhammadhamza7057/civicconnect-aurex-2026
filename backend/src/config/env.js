const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '..', '.env');

function generateSecret(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}

function buildMongoUriFromEnv() {
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const cluster = process.env.MONGO_CLUSTER || 'CivicConnectCluster';
  if (!user || !pass) return null;
  const encodedPass = encodeURIComponent(pass);
  return `mongodb+srv://${user}:${encodedPass}@${cluster}.mongodb.net/civicconnect?retryWrites=true&w=majority`;
}

// Create .env if missing using available env vars or placeholders
if (!fs.existsSync(envPath)) {
  const lines = [];
  // Use provided env variables when present, otherwise placeholders
  const mongoUri = process.env.MONGO_URI || buildMongoUriFromEnv() || 'mongodb+srv://<MONGO_USER>:<MONGO_PASS>@CivicConnectCluster.mongodb.net/civicconnect?retryWrites=true&w=majority';
  const jwtSecret = process.env.JWT_SECRET || generateSecret();
  const jwtRefresh = process.env.JWT_REFRESH_SECRET || generateSecret();
  const gemini = process.env.GEMINI_API_KEY || '<GEMINI_API_KEY_HERE>';

  lines.push(`# Auto-generated .env for CivicConnect — keep this file out of version control`);
  lines.push(`PORT=5000`);
  lines.push(`MONGO_URI=${mongoUri}`);
  lines.push(`JWT_SECRET=${jwtSecret}`);
  lines.push(`JWT_REFRESH_SECRET=${jwtRefresh}`);
  lines.push(`GEMINI_API_KEY=${gemini}`);
  lines.push(`CLOUDINARY_CLOUD_NAME=`);
  lines.push(`CLOUDINARY_API_KEY=`);
  lines.push(`CLOUDINARY_API_SECRET=`);

  try {
    fs.writeFileSync(envPath, lines.join('\n'), { mode: 0o600 });
    // load into process.env immediately
    dotenv.config({ path: envPath });
  } catch (err) {
    console.error('Failed to create .env file — please create it manually', err.message);
    process.exit(1);
  }
} else {
  dotenv.config({ path: envPath });
}

// Validate required envs (Gemini is optional — fallback heuristics available)
const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter(k => !process.env[k] || process.env[k].startsWith('<'));
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('Please update the .env file at the project root with proper values.');
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('<')) {
  console.warn('GEMINI_API_KEY not configured — AI will run in heuristic fallback mode.');
}

module.exports = process.env;
