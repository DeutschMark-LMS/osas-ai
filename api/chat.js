import { getSystemPrompt } from './lib/knowledge.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured. Please set your key in your .env file or Vercel Environment Variables.'
    });
  }

  try {
    const { message, mode = 'general', context = '' } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const systemInstruction = getSystemPrompt(mode);

    // Build user content with optional context
    let fullUserPrompt = message.trim();
    if (context && typeof context === 'string' && context.trim()) {
      fullUserPrompt = `[ADDITIONAL CONTEXT & DETAILS]\n${context.trim()}\n\n[TASK / PROMPT]\n${fullUserPrompt}`;
    }

    // Direct Google Gemini REST API call (Zero dependencies, native fetch)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: fullUserPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Gemini API returned an error';
      return res.status(response.status).json({
        error: errMsg,
        details: data.error
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return res.status(200).json({
      success: true,
      text: replyText,
      mode: mode
    });
  } catch (error) {
    console.error('Error in DMA MSI API handler:', error);
    return res.status(500).json({
      error: 'Failed to generate response from Gemini API',
      details: error.message
    });
  }
}

