import { Router } from "express";
import {
  createInviteTemplate,
  getAllInviteTemplates,
  getInviteTemplateById,
  updateInviteTemplate,
  deleteInviteTemplate,
} from "./inviteTemplate.controllers";
import upload from "../../Middleware/multer";

const router = Router();

router.post(
  "/createInviteTemplate",
  upload.single("background"),
  createInviteTemplate
);
router.get("/getAllInviteTemplates", getAllInviteTemplates);
router.get("/getInviteTemplateById/:id", getInviteTemplateById);
router.put("/updateInviteTemplate/:id", updateInviteTemplate);
router.delete("/deleteInviteTemplate/:id", deleteInviteTemplate);

export default router;
