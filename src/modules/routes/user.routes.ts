import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.ts";
import { authorize } from "../../middleware/authorize.ts";
import { updateUserRole, updateUserStatus } from "../controllers/user.controller.ts";

const router = Router();

router.patch(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  updateUserRole
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  updateUserStatus
);

export default router;