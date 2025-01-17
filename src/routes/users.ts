import { Router, RequestHandler } from "express";
import { UserController } from "../controllers/userController";

const router = Router();
const userController = new UserController();

const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    await userController.getAllUsers(req, res);
  } catch (error) {
    next(error);
  }
};

const getUserById: RequestHandler = async (req, res, next) => {
  try {
    await userController.getUserById(req, res);
  } catch (error) {
    next(error);
  }
};

const createUser: RequestHandler = async (req, res, next) => {
  try {
    await userController.createUser(req, res);
  } catch (error) {
    next(error);
  }
};

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);

export { router as userRouter };
