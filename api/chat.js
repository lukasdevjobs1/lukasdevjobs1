export default async function handler(req, res) {
  // CORS para GitHub Pages e Vercel
  const origin = req.headers.origin;
  if (origin && (origin.includes('lukasdevjobs1.github.io') || origin.includes('lukasdevjobs1') && origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  // Debug logs
  console.log('Environment variables:', Object.keys(process.env));
  console.log('GROQ_API_KEY exists:', !!GROQ_API_KEY);
  
  if (!GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured',
      debug: {
        envKeys: Object.keys(process.env).filter(k => k.includes('GROQ')),
        hasGroqKey: !!process.env.GROQ_API_KEY
      }
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}