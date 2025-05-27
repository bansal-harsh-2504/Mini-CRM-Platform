import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./config/db.js";
import customerRoutes from "./routes/customer.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDB();

app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Mini CRM Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
