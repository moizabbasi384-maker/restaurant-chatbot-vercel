const model = "gemini-3.1-flash-lite-preview";

export default async function handler(req, res) {
  try {
    const message = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();

    return res.json({
      reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
    });

  } catch (err) {
    return res.status(500).json({ reply: "error" });
  }
}
