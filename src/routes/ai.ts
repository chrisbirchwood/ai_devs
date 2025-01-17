import { Router, RequestHandler } from "express";
import { openai } from "../config/openai";

const router = Router();

const generateText: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    console.log("Otrzymano request:", req.body);
    const { instruction } = req.body;

    if (!instruction) {
      console.log("Brak instrukcji w requeście");
      res.status(400).json({ error: "Instruction is required" });
      return;
    }

    console.log("Wysyłam request do OpenAI z instrukcją:", instruction);
    console.log("API Key present:", !!process.env.OPENAI_API_KEY);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: instruction }],
      model: "gpt-4o",
    });

    console.log(
      "Otrzymano odpowiedź od OpenAI:",
      completion.choices[0].message
    );

    res.json({
      message: completion.choices[0].message.content,
    });
  } catch (error: any) {
    next(error);
  }
};

router.post("/generate", generateText);

export { router as aiRouter };
