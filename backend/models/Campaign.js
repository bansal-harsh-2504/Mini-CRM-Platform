import { Model, Schema } from "mongoose";

const campaignSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    segmentId: { type: Schema.Types.ObjectId, ref: "Segment", required: true },
    name: { type: String, required: true },
    deliveryStats: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      audienceSize: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
    },
  },
  { timestamps: true }
);

const Campaign = Model("Campaign", campaignSchema);

export default Campaign;
