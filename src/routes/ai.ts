import { Router, RequestHandler } from "express";
import { openai } from "../config/openai";
import { mapDescription } from "../data/map";

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

    const systemMessage = `Jesteś asystentem, który pomaga interpretować ruchy drona na mapie 4x4. Dron startuje z pozycji "start" (1,1).

Mapa jest zorganizowana następująco:
- Wiersze numerowane są od 1 do 4 (z góry na dół)
- Kolumny numerowane są od 1 do 4 (od lewej do prawej)
- Pozycja zapisywana jest jako "wiersz,kolumna", np. "1,1" to lewy górny róg

Oto mapa:
${mapDescription.grid
  .map((item) => `[${item.position}] - ${item.description}`)
  .join("\n")}

Twoim zadaniem jest:
1. Zinterpretować instrukcję w języku naturalnym (np. "dwa pola w prawo i na sam dół")
2. Prześledzić ruch drona zgodnie z instrukcją
3. Opisać gdzie dron się znalazł i co tam jest

Przykłady:
- "dwa w przód i na sam dół" -> dron leci z (1,1) dwa pola w prawo do (1,3), a potem w dół do (4,3), gdzie jest samochód
- "jedno pole w prawo, a później na sam dół" -> dron leci z (1,1) jedno pole w prawo do (1,2), a potem w dół do (4,2), gdzie są góry

Odpowiedz w formie: "Dron poleciał [opis ruchu] i wylądował na polu [opis pola]".`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: instruction },
      ],
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
