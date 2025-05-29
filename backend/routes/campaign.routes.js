import { Router } from "express";
import { getCampaignHistory } from "../controllers/campaign.controller.js";

const router = Router();

router.post("/history", getCampaignHistory);

export default router;
