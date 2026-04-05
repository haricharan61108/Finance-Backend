import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.ts";
import { getCategoryTotals, getMonthlyTrends, getRecentActivity, getSummary } from "../controllers/analytics.controller.ts";


const router = Router();

router.get("/summary", authenticate, getSummary);
router.get("/category", authenticate, getCategoryTotals);
router.get("/recent", authenticate, getRecentActivity);
router.get("/trends", authenticate, getMonthlyTrends);

export default router;