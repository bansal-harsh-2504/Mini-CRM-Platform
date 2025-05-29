import { Router } from "express";
import { createOrder, getOrders, getOrdersByCustomerId, getOrderById } from "../controllers/order.controller"

const orderRouter = Router();

// Create a new order
orderRouter.post("/", createOrder);

// Get all orders
orderRouter.get("/", getOrders);

// Get orders by customer ID
orderRouter.get("/customer/:customerId", getOrdersByCustomerId);

// Get an order by order ID
orderRouter.get("/:id", getOrderById);

export default orderRouter;
