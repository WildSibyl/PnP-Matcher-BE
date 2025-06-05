import express from "express";
import { Router } from "express";
import fetch from "node-fetch"; // makes fetch requests possible in node.js
import dotenv from "dotenv";

const aiRouter = Router();

aiRouter.post("/suggest", async (req, res) => {
  const { prompt } = req.body;

  try {
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await openaiResponse.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim();

    res.json({ suggestion });
  } catch (error) {
    console.error("OpenAI-Fehler:", error);
    res.status(500).json({ error: "Fehler beim Vorschlagen" });
  }
});

export default aiRouter;
