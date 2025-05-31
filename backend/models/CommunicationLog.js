import { model, Schema } from "mongoose";

const communicationLogSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    message: { type: String, required: true },
    delivery_status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      required: true,
    },
    vender_reference: { type: String, required: true },
  },
  { timestamps: true }
);

const CommunicationLog = model("CommunicationLog", communicationLogSchema);

export default CommunicationLog;
