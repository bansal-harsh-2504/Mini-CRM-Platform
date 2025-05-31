import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      index: true,
      required: true,
    },
    phone: String,
    totalSpend: Number,
    visits: Number,
    lastPurchasedDate: Date,
  },
  { timestamps: true }
);

const Customer = model("Customer", customerSchema);

export default Customer;
