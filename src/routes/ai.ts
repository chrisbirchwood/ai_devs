import { Router, RequestHandler } from "express";
import { openai } from "../config/openai";

const router = Router();

const generateText: RequestHandler = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    res.json({
      message: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: "Error generating text",
      details: error.message,
    });
  }
};

router.post("/generate", generateText);

export { router as aiRouter };
