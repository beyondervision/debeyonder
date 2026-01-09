export default async function handler(req, res) {
  // 1. Alleen POST toestaan
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { query, manualPersona } = req.body;
  if (!query) return res.status(400).json({ error: 'Geen input' });

  // 2. BEPAAL DE GENERAAL (Persona)
  const personas = {
    aetron: {
      role: "Strategisch Architect",
      basePrompt: "Jij bent AETRON. Strategisch, zakelijk en visionair. Focus op Validatie en SDG-doelen (9, 16, 35). Je hebt live toegang tot internetdata via Tavily."
    },
    z3ro: {
      role: "Security & Audit",
      basePrompt: "Jij bent Z3RO. Technisch, kortaf en gefocust op security/audit. Gebruik termen als 'Log', 'Shield' en 'Protocol'. Je verifieert feiten via live data."
    },
    luxen: {
      role: "Creatieve Narratief",
      basePrompt: "Jij bent LUXEN. Creatief, vloeiend en inspirerend. Focus op design en beleving. Je gebruikt actuele trends uit de live data."
    }
  };

  let activeID = 'aetron';
  if (manualPersona && personas[manualPersona]) {
    activeID = manualPersona;
  } else {
    const q = query.toLowerCase();
    if (q.includes('code') || q.includes('bug') || q.includes('api')) activeID = 'z3ro';
    else if (q.includes('design') || q.includes('tekst') || q.includes('logo')) activeID = 'luxen';
  }

  try {
    // 3. LIVE SEARCH + IMAGES (TAVILY)
    console.log(`[Aetron] Searching Tavily for: ${query}`);
    
    const searchResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "basic",
        include_answer: true,
        include_images: true, // Haal afbeeldingen op
        max_results: 3
      })
    });

    const searchData = await searchResponse.json();
    
    // Context bouwen voor de AI
    const searchContext = searchData.results 
      ? searchData.results.map(r => `- ${r.title} (${r.url}): ${r.content}`).join('\n') 
      : "Geen live data gevonden.";

    // 4. AI SYNTHESE (OPENAI)
    const systemMessage = `
      ${personas[activeID].basePrompt}
      
      ### LIVE CONTEXT (DATUM: ${new Date().toLocaleDateString()}):
      ${searchContext}
      
      INSTRUCTIE: Gebruik bovenstaande live context om de vraag te beantwoorden. Als de gebruiker om een afbeelding vraagt, verwijs dan naar de visuele data stream onder je antwoord.
    `;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: query }
        ],
        max_tokens: 350,
        temperature: 0.7
      })
    });

    const aiData = await aiResponse.json();
    if (aiData.error) throw new Error(aiData.error.message);

    // 5. RESULTAAT (Inclusief Images array)
    res.status(200).json({
      resonance: true,
      persona: activeID,
      role: personas[activeID].role,
      output: aiData.choices[0].message.content,
      images: searchData.images || [], // Stuur de plaatjes mee naar de frontend
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Omniscience Error:", error);
    res.status(500).json({ resonance: false, output: "⚠️ Live Link Failed. System Offline." });
  }
}