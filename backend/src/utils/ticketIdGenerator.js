const Counter = require('../models/Counter');

async function nextTicketCode(prefix = 'INF') {
  const year = new Date().getFullYear();
  const key = `ticket_${year}`;

  const updated = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  ).lean();

  const seq = updated.seq || 1;
  const padded = String(seq).padStart(5, '0');
  return `${prefix}-${year}-${padded}`;
}

module.exports = { nextTicketCode };
