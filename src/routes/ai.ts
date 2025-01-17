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

    const systemMessage = `Jesteś asystentem, który pomaga interpretować ruchy drona na mapie 4x4. Dron zawsze startuje z pozycji "start" (1,1).

Mapa jest zorganizowana następująco:
- Wiersze numerowane są od 1 do 4 (z góry na dół)
- Kolumny numerowane są od 1 do 4 (od lewej do prawej)
- Pozycja zapisywana jest jako "wiersz,kolumna", np. "1,1" to lewy górny róg

Oto mapa:
${mapDescription.grid
  .map((item) => `[${item.position}] - ${item.description}`)
  .join("\n")}

WAŻNE ZASADY:
1. Jeśli w instrukcji pojawią się słowa takie jak "nie!", "czekaj!", "albo", "zacznijmy od nowa" - oznacza to, że dron wraca na pozycję startową (1,1) i wykonuje tylko instrukcje po tych słowach
2. Zawsze bierz pod uwagę tylko ostateczną instrukcję po wszystkich "nie" i "czekaj"
3. Słowa "maksymalnie", "do końca", "całkiem" w kontekście kierunku (np. "w prawo maksymalnie") oznaczają ruch do ostatniego pola w tym kierunku
4. Odpowiedz TYLKO nazwą pola, na którym dron ostatecznie wylądował (maksymalnie dwa słowa)

Przykłady:
- "Lecimy w dół, albo nie! nie! W prawo do końca" -> "dom" (bo po "nie!" lecimy w prawo do ostatniego pola)
- "W prawo i w dół. Nie, czekaj! Tylko w dół." -> "góry" (bo po "czekaj!" lecimy tylko w dół z pozycji startowej)
- "Maksymalnie w prawo" -> "dom" (lecimy do ostatniego pola w prawo)
- "Do końca w dół" -> "góry" (lecimy do ostatniego pola w dół)`;

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
      description: completion.choices[0].message.content,
    });
  } catch (error: any) {
    next(error);
  }
};

router.post("/generate", generateText);

export { router as aiRouter };
