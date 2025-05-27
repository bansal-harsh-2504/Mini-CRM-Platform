import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post("/", createOrder);

export default orderRouter;
