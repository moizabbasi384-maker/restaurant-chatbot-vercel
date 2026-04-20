export default async function handler(req, res) {
  // ===== CORS (IMPORTANT FOR WORDPRESS) =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const message = req.body?.message;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ reply: "Missing GEMINI_API_KEY in Vercel" });
    }

    // ===== CALL GEMINI =====
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        }),
      }
    );

    const data = await response.json();

    console.log("RAW GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    // ===== SAFE RESPONSE PARSING (VERY IMPORTANT) =====
    let reply = null;

    if (data?.candidates?.length > 0) {
      const c = data.candidates[0];

      reply =
        c?.content?.parts?.[0]?.text ||
        c?.output ||
        c?.text ||
        null;
    }

    if (!reply) {
      return res.status(500).json({
        reply: "AI returned empty response",
        debug: data
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("BACKEND ERROR:", error);

    return res.status(500).json({
      reply: "Server error",
      error: error.message
    });
  }
}
