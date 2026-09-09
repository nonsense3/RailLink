import axios from 'axios'
import { config } from '../config/env.js'

/**
 * Call Google Gemini API
 * Uses gemini-2.0-flash — stable, widely available model.
 */
async function callGemini(prompt, systemInstruction = '') {
  const apiKey = config.gemini.apiKey
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured in server/.env')
  }

  // gemini-2.0-flash is the current stable model
  const model = 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096
      // NOTE: Do NOT set responseMimeType:'application/json' — it causes
      // "model output must contain either output text or tool calls" errors
      // when the model can't guarantee strict JSON. We parse manually below.
    }
  }

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    }
  }

  const res = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000
  })

  // Check for finish reason errors
  const candidate = res.data?.candidates?.[0]
  if (!candidate) {
    const blockReason = res.data?.promptFeedback?.blockReason
    throw new Error(`Gemini returned no candidates. Block reason: ${blockReason || 'unknown'}`)
  }

  const text = candidate?.content?.parts?.[0]?.text
  if (!text) {
    const finishReason = candidate?.finishReason
    throw new Error(`Empty Gemini response. Finish reason: ${finishReason || 'unknown'}`)
  }

  // Try to parse as JSON, handling markdown code fences
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Return raw text wrapped so callers can detect it
    return { rawResponse: text }
  }
}

/**
 * Generate AI-Optimized Block Schedule
 */
export async function generateOptimizedSchedule(requests = [], corridors = []) {
  const apiKey = config.gemini.apiKey

  if (!apiKey) {
    // Intelligent local fallback
    return {
      confidence: 93.4,
      totalBlocks: 24,
      conflictsResolved: 6,
      uptimeImprovement: '+4.1%',
      source: 'RailLink AI Engine (Fallback - Configure GEMINI_API_KEY for live Google Gemini AI)',
      schedule: [
        { id: 1, corridor: 'Delhi-Agra Sec 1', dept: 'Engineering', task: 'Rail Renewal', start: '02:00', end: '05:30', priority: 5, reason: 'Rail fracture detected — safety critical' },
        { id: 2, corridor: 'Delhi-Agra Sec 1', dept: 'Signal & Telecom', task: 'Signal Testing', start: '06:00', end: '08:00', priority: 3, reason: 'Post-renewal signal verification required' },
        { id: 3, corridor: 'Mumbai-Pune Main', dept: 'Traction Distribution', task: 'OHE Inspection', start: '01:00', end: '03:30', priority: 4, reason: 'Insulator damage reported — 12 days overdue' },
        { id: 4, corridor: 'Mumbai-Pune Main', dept: 'Engineering', task: 'Sleeper Replacement', start: '04:00', end: '07:00', priority: 3, reason: 'Scheduled preventive maintenance' },
        { id: 5, corridor: 'Howrah-Kharagpur', dept: 'Multi-Department', task: 'Combined Joint Block', start: '01:30', end: '06:00', priority: 5, reason: 'AI merged 3 separate requests to reduce total downtime by 2.5hrs' }
      ]
    }
  }

  const prompt = `You are RailLink AI, an Indian Railways maintenance scheduling expert.
Analyze the following maintenance block requests and generate an optimal, synchronized block schedule that minimizes passenger train delays.
Available Night Curfew Windows: 01:00 to 05:00.

Requests to optimize:
${JSON.stringify(requests.slice(0, 10), null, 2)}

Return a strict JSON object with this exact schema:
{
  "confidence": 95.8,
  "totalBlocks": number,
  "conflictsResolved": number,
  "uptimeImprovement": "+4.2%",
  "summary": "Brief executive summary of coordination strategy",
  "schedule": [
    {
      "id": 1,
      "corridor": "string corridor name",
      "dept": "Engineering | Signal & Telecom | Traction Distribution | Multi-Department",
      "task": "task title",
      "start": "HH:MM",
      "end": "HH:MM",
      "priority": 1-5,
      "reason": "AI optimization justification"
    }
  ]
}`

  try {
    const result = await callGemini(prompt, 'You are an advanced railway scheduling and optimization AI. Always respond with valid JSON only, no extra commentary.')
    result.source = 'Google Gemini 2.0 Flash (Live AI)'
    return result
  } catch (err) {
    console.warn('[Gemini AI Error]:', err.message, 'Falling back to local planner.')
    return {
      confidence: 91.0,
      totalBlocks: 20,
      conflictsResolved: 4,
      uptimeImprovement: '+3.5%',
      source: `RailLink Engine (Gemini fallback: ${err.message})`,
      schedule: [
        { id: 1, corridor: 'Delhi-Agra Sec 1', dept: 'Engineering', task: 'Rail Renewal', start: '02:00', end: '05:30', priority: 5, reason: 'Emergency rail renewal window' },
        { id: 2, corridor: 'Mumbai-Pune Main', dept: 'Multi-Department', task: 'Joint OHE + Track Block', start: '01:30', end: '05:00', priority: 5, reason: 'Merged Engineering and Traction block to save 2h track possession' }
      ]
    }
  }
}

/**
 * Check Gemini API status
 */
export function getAiStatus() {
  const hasKey = Boolean(config.gemini.apiKey && config.gemini.apiKey.trim().length > 0)
  return {
    configured: hasKey,
    model: 'gemini-2.0-flash',
    provider: 'Google AI Studio',
    status: hasKey ? 'Ready' : 'API Key required'
  }
}
