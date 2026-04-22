const clients = {
  "cafe-bliss": {
    name: "Cafe Bliss",
    hours: "9AM - 11PM",
    apiKey: "key_12345",
    active: true
  }
};

export default async function handler(req, res) {
  const { message, clientId, apiKey } = req.body;

  const client = clients[clientId];

  if (!client) {
    return res.status(404).json({ reply: "Client not found" });
  }

  if (client.apiKey !== apiKey) {
    return res.status(403).json({ reply: "Invalid API key" });
  }

  if (!client.active) {
    return res.status(403).json({
      reply: "Service disabled. Please contact support."
    });
  }

  // 🧠 Build prompt
  const prompt = `
You are an assistant for ${client.name}.

Business hours: ${client.hours}

User question:
${message}
`;

  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await aiRes.json();

    const reply = data.choices?.[0]?.message?.content || "No response";

    return res.json({ reply });

  } catch (err) {
    return res.status(500).json({
      reply: "Error talking to AI"
    });
  }
}
