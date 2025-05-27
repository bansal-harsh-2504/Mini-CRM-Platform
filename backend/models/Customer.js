import { Schema, Model } from "mongoose";

const customerSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    totalSpend: Number,
    visits: Number,
    lastActive: Date,
  },
  { timestamps: true }
);

const Customer = Model("Customer", customerSchema);

export default Customer;
