export default async function handler(req, res) {
  // ===== CORS FIX (CRITICAL) =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const message = req.body?.message;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key in Vercel" });
    }

    // ===== GEMINI API CALL =====
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    // DEBUG SAFE EXTRACTION
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.log("Gemini raw response:", data);
      return res.status(500).json({
        error: "No response from AI",
        debug: data
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: "Server crashed", details: error.message });
  }
}
