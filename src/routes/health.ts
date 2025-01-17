import { Router, RequestHandler } from "express";

const router = Router();

const healthCheck: RequestHandler = (req, res) => {
  res.json({
    status: "ok",
    message: "Hello World!",
    timestamp: new Date().toISOString(),
  });
};

router.get("/", healthCheck);

export { router as healthRouter };
