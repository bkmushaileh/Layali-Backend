import express from "express";
import {
  createGiftCard,
  deleteGiftCard,
  getAllGiftCards,
  getGiftCardById,
  getGiftCardsByUser,
  redeemGiftCard,
  updateGiftCard,
} from "./giftCard.controllers";

const router = express.Router();

router.post("/", createGiftCard);
router.get("/", getAllGiftCards);
router.get("/user/:userId", getGiftCardsByUser);
router.get("/:id", getGiftCardById);

router.put("/:id", updateGiftCard);
router.delete("/:id", deleteGiftCard);
router.post("/:id/redeem", redeemGiftCard);

export default router;
