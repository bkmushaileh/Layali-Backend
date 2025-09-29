import { Router } from "express";
import {
  createInvite,
  deleteInvite,
  getAllInvites,
  getInviteById,
  getInviteByToken,
  getInvitesByEvent,
  updateInvite,
  updateRSVPStatus,
} from "./invite.controllers";

const router = Router();

router.post("/createInvite", createInvite);
router.post("/rsvp/:token", updateRSVPStatus);
router.get("/getAllInvites", getAllInvites);
router.get("/getInviteById/:id", getInviteById);
router.get("/getInvitesByEvent/:eventId", getInvitesByEvent);
router.put("/updateInvite/:id", updateInvite);
router.delete("/deleteInvite/:id", deleteInvite);
router.get("/token/:token", getInviteByToken);
export default router;
