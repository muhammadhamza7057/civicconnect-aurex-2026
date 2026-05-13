const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api/v1';

async function run() {
  console.log('Starting backend test flow against', API);

  // 1) Register resident
  const reg = await axios.post(`${API}/auth/register`, { full_name: 'Test Resident', email: 'test.resident@example.com', password: 'Password123!' }).catch(e => e.response || e);
  console.log('Register response:', reg.data || reg.status);

  // 2) Login
  const login = await axios.post(`${API}/auth/login`, { email: 'test.resident@example.com', password: 'Password123!' }).catch(e => e.response || e);
  const token = login.data && (login.data.accessToken || (login.data.data && login.data.data.accessToken));
  if (!token) {
    console.error('Login failed', login.data || login.status);
    process.exit(1);
  }
  console.log('Login OK, token length', token.length);

  // 3) Create ticket
  const ticketResp = await axios.post(`${API}/tickets`, { title: 'Test - Leaking pipe', description: 'Pipe leaking near park. Please inspect.', priority: 'high' }, { headers: { Authorization: `Bearer ${token}` } }).catch(e => e.response || e);
  console.log('Create ticket response:', ticketResp.data || ticketResp.status);
  const ticketId = ticketResp.data && ticketResp.data.data && ticketResp.data.data._id ? ticketResp.data.data._id : (ticketResp.data && ticketResp.data._id) || null;
  if (!ticketId) {
    console.error('Failed to obtain ticket id');
    process.exit(1);
  }

  console.log('Ticket created, id:', ticketId);

  // 4) Poll for AI processing (timeout 30s)
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const t = await axios.get(`${API}/tickets/${ticketId}`, { headers: { Authorization: `Bearer ${token}` } }).catch(e => e.response || e);
    const ticket = t.data && (t.data.data || t.data);
    if (ticket && (ticket.ai_summary || ticket.ai_category)) {
      console.log('AI processed ticket:', { ai_category: ticket.ai_category, ai_summary: ticket.ai_summary });
      console.log('Test flow complete');
      process.exit(0);
    }
    console.log('Waiting for AI...');
    await new Promise(r => setTimeout(r, 2000));
  }

  console.error('AI did not process ticket within timeout');
  process.exit(2);
}

run().catch(err => { console.error('Test flow failed', err && err.response ? err.response.data : err); process.exit(1); });
