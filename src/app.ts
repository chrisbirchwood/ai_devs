import express from "express";
import cors from "cors";
import { userRouter } from "./routes/users";
import { healthRouter } from "./routes/health";
import { aiRouter } from "./routes/ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/users", userRouter);
app.use("/api/ai", aiRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

export default app;
