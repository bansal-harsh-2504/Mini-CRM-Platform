import { Router } from "express";
import { authenticateUser } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/google", authenticateUser);

export default authRouter;
