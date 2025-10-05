import { Request, Response } from "express";
import GiftCard from "../../Models/GiftCard";

import User from "../../Models/User";

export const createGiftCard = async (req: Request, res: Response) => {
  try {
    const { senderEmail, coupleEmail, event, amount, expirationDate } =
      req.body;

    const sender = await User.findOne({ email: senderEmail });
    if (!sender) return res.status(404).json({ message: "Sender not found" });

    const couple = await User.findOne({ email: coupleEmail });
    if (!couple) return res.status(404).json({ message: "Couple not found" });

    const giftCard = await GiftCard.create({
      sender: sender._id,
      couple: couple._id,
      event,
      amount,
      expirationDate,
    });

    res.status(201).json(giftCard);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllGiftCards = async (req: Request, res: Response) => {
  try {
    const cards = await GiftCard.find()
      .populate("sender", "name email")
      .populate("couple", "name email")
      .populate("event", "title date");

    res.status(200).json(cards);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getGiftCardById = async (req: Request, res: Response) => {
  try {
    const card = await GiftCard.findById(req.params.id)
      .populate("sender", "name email")
      .populate("couple", "name email")
      .populate("event", "title date");

    if (!card) return res.status(404).json({ message: "Gift card not found" });

    res.status(200).json(card);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGiftCard = async (req: Request, res: Response) => {
  try {
    const card = await GiftCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!card) return res.status(404).json({ message: "Gift card not found" });

    res.status(200).json(card);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteGiftCard = async (req: Request, res: Response) => {
  try {
    const card = await GiftCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ message: "Gift card not found" });

    res.status(200).json({ message: "Gift card deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const redeemGiftCard = async (req: Request, res: Response) => {
  try {
    const card = await GiftCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Gift card not found" });

    if (card.status !== "active")
      return res.status(400).json({ message: `Gift card is ${card.status}` });

    if (card.expirationDate && card.expirationDate < new Date()) {
      card.status = "expired";
      await card.save();
      return res.status(400).json({ message: "Gift card expired" });
    }

    card.status = "redeemed";
    card.redeemedAt = new Date();
    card.redeemedBy = req.body.redeemedBy;
    await card.save();

    res.status(200).json({ message: "Gift card redeemed", card });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getGiftCardsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cards = await GiftCard.find({ couple: userId })
      .populate("sender", "name email")
      .populate("event", "title date");

    if (!cards.length)
      return res
        .status(404)
        .json({ message: "No gift cards found for this user" });

    res.status(200).json(cards);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
