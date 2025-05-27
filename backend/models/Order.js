import { Schema, Model } from "mongoose";

const orderSchema = new Schema(
  {
    customerId: Schema.Types.ObjectId,
    amount: Number,
    date: Date,
  },
  { timestamps: true }
);

const Order = Model("Order", orderSchema);

export default Order;
