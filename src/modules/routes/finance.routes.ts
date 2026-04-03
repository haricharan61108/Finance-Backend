import { Router } from "express";
import {
  createRecord,
  getRecordsWithFilters,
  updateRecord,
  deleteRecord,
} from "../controllers/finance.controller.ts";
import { authenticate } from "../../middleware/authenticate.ts";

const router = Router();

router.post("/", authenticate, createRecord);
router.get("/", authenticate, getRecordsWithFilters);
router.put("/:id", authenticate, updateRecord);
router.delete("/:id", authenticate, deleteRecord);

export default router;