const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/ask', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in query." });
    }

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mindbot",
        prompt: prompt,
        stream: true
      })
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    ollamaRes.body.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (let line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              res.write(`data: ${json.response}\n\n`);
            }
          } catch (err) {
            console.error('Stream JSON error:', err);
          }
        }
      }
    });

    ollamaRes.body.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

  } catch (err) {
    console.error("Server crashed:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.listen(5000, () => {
  console.log("🧠 MindBot backend running on http://localhost:5000");
});
