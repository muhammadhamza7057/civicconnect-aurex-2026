const axios = require('axios');
let Generative; // lazily require

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/gemini-1.5-mini';

function fallbackAnalysis(description = '') {
  const text = String(description).toLowerCase();
  const isEmergency = /burst|fire|flood|leak|gas|injury|danger|explosion|collapsed|electrocution/.test(text);

  let category = 'General';
  if (/water|pipe|road|electric|sewer|drain|street|infrastructure/.test(text)) category = 'Infrastructure';
  else if (/permit|license|event/.test(text)) category = 'Permits';
  else if (/trash|garbage|sanitation/.test(text)) category = 'Sanitation';

  let priority = 'medium';
  if (isEmergency) priority = 'emergency';
  else if (/urgent|asap|immediately|major/.test(text)) priority = 'high';
  else if (/minor|small|low/.test(text)) priority = 'low';

  return {
    category,
    priority,
    summary: description.slice(0, 240),
    isEmergency,
    confidence: 0.6
  };
}

async function analyzeWithGenerative(description) {
  try {
    if (!Generative) {
      try {
        Generative = require('@google/generative-ai').v1beta2;
      } catch (e) {
        // package not available
        Generative = null;
      }
    }

    if (!Generative || !GEMINI_API_KEY) throw new Error('Generative client not available');

    const client = new Generative.TextServiceClient({ apiKey: GEMINI_API_KEY });
    const prompt = `Classify the ticket and return only JSON object with keys: category, priority, isEmergency (boolean), summary (short), confidence (0-1).\nTicket:\n${description}`;

    const [result] = await client.generateText({ model: GEMINI_MODEL, prompt: { text: prompt }, maxOutputTokens: 300 });
    const text = (result?.candidates?.[0]?.output?.[0]?.content || '') || '';
    const jsonText = text.trim();
    try {
      const parsed = JSON.parse(jsonText);
      return {
        category: parsed.category || 'General',
        priority: parsed.priority || 'medium',
        isEmergency: Boolean(parsed.isEmergency),
        summary: parsed.summary || description.slice(0, 240),
        confidence: Number(parsed.confidence) || 0.7
      };
    } catch (err) {
      // fallback when model returned text
      return fallbackAnalysis(description);
    }
  } catch (err) {
    console.warn('Generative client failed or unavailable, falling back to HTTP call or heuristics.');
    // fallback to HTTP REST call to generative API if key present
    if (GEMINI_API_KEY) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = `Classify the ticket and return only JSON object with keys: category, priority, isEmergency (boolean), summary (short), confidence (0-1).\nTicket:\n${description}`;
        const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 300, responseMimeType: 'application/json' } }, { timeout: 15000 });
        const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(text);
        return {
          category: parsed.category || 'General',
          priority: parsed.priority || 'medium',
          isEmergency: Boolean(parsed.isEmergency),
          summary: parsed.summary || description.slice(0, 240),
          confidence: Number(parsed.confidence) || 0.7
        };
      } catch (err) {
        console.error('HTTP Gemini call failed:', err.message);
        return fallbackAnalysis(description);
      }
    }
    return fallbackAnalysis(description);
  }
}

async function analyzeTicket(description) {
  if (!description) return { category: 'General', priority: 'medium', isEmergency: false, summary: '', confidence: 0 };
  return analyzeWithGenerative(description);
}

module.exports = { analyzeTicket };
