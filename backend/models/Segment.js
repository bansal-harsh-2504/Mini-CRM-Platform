import { Schema, Model } from "mongoose";

const segmentSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rules: { type: Schema.Types.Mixed, required: true },
    audienceSize: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Segment = Model("Segment", segmentSchema);

export default Segment;
