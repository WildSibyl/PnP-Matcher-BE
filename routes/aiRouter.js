import express from "express";
import { Router } from "express";
import fetch from "node-fetch"; // makes fetch requests possible in node.js
import ErrorResponse from "../utils/ErrorResponse.js";
import User from "../models/User.js";
import verifyToken from "../middlewares/verifyToken.js";

const aiRouter = Router();

aiRouter.post("/suggest", verifyToken, async (req, res, next) => {
  const { prompt } = req.body;

  try {
    const userId = req.userId;

    // Load user profile
    const user = await User.findById(userId)
      .populate("playstyles")
      .populate("systems")
      .populate("likes");
    if (!user) return res.status(404).json({ error: "User not found" });

    //Turn into strings
    const playstylesStr = user.playstyles
      .map((p) => p.label || p.value)
      .join(", ");

    const systemsStr = user.systems.map((s) => s.label || s.value).join(", ");

    const likesStr = user.likes.map((l) => l.label || l.value).join(", ");

    // Create dynamic chatGPT prompt
    const aiPrompt = `Give me a very short creative ${prompt} based on this input:
- username: ${user.userName}
- tagline: ${user.tagline || "I like natural 20s"}
- description: ${user.description || "No description"}
- playstyles: ${playstylesStr || ""}
- systems: ${systemsStr || ""}
- likes: ${
      likesStr || ""
    }. only use Numbers, Letters and Spaces - don't use special characters like !"§$%&/()=?-_'#+*, don't put it in quotation marks`;

    // OpenAI fetch
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
          messages: [{ role: "user", content: aiPrompt }],
        }),
      }
    );

    const data = await openaiResponse.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim();

    res.json({ suggestion });
  } catch (error) {
    console.error("OpenAI-Error:", error);
    throw new ErrorResponse("Could not generate AI suggestion", 500);
  }
});

export default aiRouter;
