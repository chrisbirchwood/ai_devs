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
3. Odpowiedz TYLKO nazwą pola, na którym dron ostatecznie wylądował (maksymalnie dwa słowa)

Przykłady:
- "Lecimy w dół, albo nie! nie! W prawo do końca" -> "trawa" (bo po "nie!" lecimy tylko w prawo z pozycji startowej)
- "W prawo i w dół. Nie, czekaj! Tylko w dół." -> "góry" (bo po "czekaj!" lecimy tylko w dół z pozycji startowej)
- "Dwa kroki w prawo... nie, nie, trzy kroki w prawo" -> "trawa" (bierzemy pod uwagę tylko instrukcję po "nie, nie")`;

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
