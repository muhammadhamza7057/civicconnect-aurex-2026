const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { analyzeTicket } = require('../ai/geminiService');
const { queue } = require('./queue');
const { getIO } = require('../lib/socket');
const { aiLog, errorLog } = require('../middleware/logger');

function normalizePriority(priority) {
  const allowed = ['low', 'medium', 'high', 'critical', 'emergency'];
  return allowed.includes(priority) ? priority : 'medium';
}

function detectDuplicates(ticket, candidates = []) {
  const text = `${ticket.title || ''} ${ticket.description || ''}`.toLowerCase();
  const ticketTokens = new Set(text.split(/\W+/).filter(Boolean));

  const matches = [];
  for (const existing of candidates) {
    const existingText = `${existing.title || ''} ${existing.description || ''}`.toLowerCase();
    const existingTokens = new Set(existingText.split(/\W+/).filter(Boolean));

    let common = 0;
    ticketTokens.forEach(token => {
      if (existingTokens.has(token)) common += 1;
    });

    const titleSimilarity = ticket.title && existing.title
      ? similarity(ticket.title, existing.title)
      : 0;

    const locationMatch = JSON.stringify(ticket.metadata?.location || {}) === JSON.stringify(existing.metadata?.location || {});
    const score = Math.min(1, (common / Math.max(ticketTokens.size, 1)) * 0.45 + titleSimilarity * 0.4 + (locationMatch ? 0.15 : 0));

    if (score >= 0.55) {
      matches.push({ ticketId: existing._id, confidence: Number(score.toFixed(2)) });
    }
  }
  return matches.sort((a, b) => b.confidence - a.confidence);
}

function similarity(a, b) {
  const s1 = String(a).toLowerCase();
  const s2 = String(b).toLowerCase();
  if (!s1.length || !s2.length) return 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLen = longer.length;
  if (!longerLen) return 0;
  const editDistance = levenshtein(s1, s2);
  return (longerLen - editDistance) / longerLen;
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

async function processTicketAI({ ticketId }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return;

  const io = getIO();
  aiLog('AI job started', { ticketId });
  io && io.emit('ticket:aiProcessingStarted', { ticketId });

  try {
    const analysis = await analyzeTicket(ticket.description || ticket.title || '');

    // Basic duplicate search within same department and recent tickets
    const recentTickets = await Ticket.find({
      _id: { $ne: ticket._id },
      department: ticket.department || null
    })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    const duplicateCandidates = detectDuplicates(ticket, recentTickets);
    const duplicateIds = duplicateCandidates.map(c => c.ticketId);
    const duplicateFound = duplicateCandidates.length > 0;

    ticket.ai_category = analysis.category;
    ticket.ai_priority = normalizePriority(analysis.priority);
    ticket.ai_summary = analysis.summary;
    ticket.is_emergency = Boolean(analysis.isEmergency);
    ticket.ai_duplicate_candidates = duplicateIds;

    if (duplicateFound) {
      ticket.is_duplicate = true;
      io && io.emit('ticket:duplicateFound', { ticketId, duplicates: duplicateCandidates });
    }

    await ticket.save();

    await AuditLog.create({
      resourceType: 'ticket',
      resourceId: ticket._id,
      action: 'ai_processed',
      actor: ticket.reporter,
      payload: {
        ai_category: ticket.ai_category,
        ai_priority: ticket.ai_priority,
        is_emergency: ticket.is_emergency,
        duplicateCandidates: duplicateCandidates.slice(0, 10)
      }
    });
    aiLog('AI job finished', { ticketId, ai_category: ticket.ai_category, ai_priority: ticket.ai_priority });
    io && io.emit('ticket:aiUpdated', {
      ticketId,
      ai_category: ticket.ai_category,
      ai_priority: ticket.ai_priority,
      ai_summary: ticket.ai_summary,
      duplicateCandidates,
      isEmergency: ticket.is_emergency
    });
  } catch (error) {
    errorLog('processTicketAI failed', error && error.message ? error.message : error);
    await AuditLog.create({
      resourceType: 'ticket',
      resourceId: ticket._id,
      action: 'ai_failed',
      actor: ticket.reporter,
      payload: { message: error.message }
    }).catch(() => {});
  }
}

queue.on('processTicketAI', processTicketAI);

module.exports = { processTicketAI };
