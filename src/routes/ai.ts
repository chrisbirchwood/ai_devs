import { Router, RequestHandler } from "express";
import { openai } from "../config/openai";

const router = Router();

const generateText: RequestHandler = async (req, res) => {
  try {
    console.log("Otrzymano request:", req.body);
    const { prompt } = req.body;

    if (!prompt) {
      console.log("Brak promptu w requeście");
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Wysyłam request do OpenAI z promptem:", prompt);
    console.log("API Key present:", !!process.env.OPENAI_API_KEY);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    console.log(
      "Otrzymano odpowiedź od OpenAI:",
      completion.choices[0].message
    );

    res.json({
      message: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Error generating text",
      details: error.message,
      stack: error.stack,
    });
  }
};

router.post("/generate", generateText);

export { router as aiRouter };
