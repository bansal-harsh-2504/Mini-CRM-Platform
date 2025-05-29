import { Router } from "express";
import { createCustomer, getCustomers, getCustomerById } from "../controllers/customer.controller.js";

const customerRouter = Router();

// Create a new customer
customerRouter.post("/", createCustomer);

// Get all customers
customerRouter.get("/", getCustomers);

// Get a customer by ID
customerRouter.get("/:id", getCustomerById);

export default customerRouter;
