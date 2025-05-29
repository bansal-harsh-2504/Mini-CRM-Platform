import { Router } from "express";
import {
  previewAudienceSize,
  createSegmentAndCampaign,
} from "../controllers/segment.controller.js";

const segmentRouter = Router();

segmentRouter.post("/", createSegmentAndCampaign);
segmentRouter.post("/preview", previewAudienceSize);

export default segmentRouter;
