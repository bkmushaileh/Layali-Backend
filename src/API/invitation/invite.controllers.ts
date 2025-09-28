import { Request, Response } from "express";
import QRCode from "qrcode";
import Invite from "../../Models/Invite";
import InviteTemplate from "../../Models/InviteTemplate";
import { Event } from "../../Models/Event";

export const createInvite = async (req: Request, res: Response) => {
  try {
    const { event, guestName, guestEmail, inviteTemplate } = req.body;

    const existingInvite = await Invite.findOne({ event, guestEmail });
    if (existingInvite) {
      return res
        .status(400)
        .json({ message: "Guest already invited for this event" });
    }

    let templateToUse = inviteTemplate;
    if (!templateToUse) {
      const defaultTemplate = await InviteTemplate.findOne();
      if (defaultTemplate) {
        templateToUse = defaultTemplate._id;
      }
    }

    const newInvite = new Invite({
      event,
      guestName,
      guestEmail,
      inviteTemplate: templateToUse,
    });

    await newInvite.save();

    const qrImage = await QRCode.toDataURL(newInvite.qrCodeToken);
    newInvite.qrCodeImage = qrImage;

    await newInvite.save();

    await Event.findByIdAndUpdate(event, {
      $push: { invites: newInvite._id },
    });

    if (inviteTemplate) {
      await InviteTemplate.findByIdAndUpdate(inviteTemplate, {
        $push: { invites: newInvite._id },
      });
    }

    res.status(201).json(newInvite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating invite" });
  }
};
export const getAllInvites = async (req: Request, res: Response) => {
  try {
    const invites = await Invite.find()
      .populate("inviteTemplate")
      .populate("event");

    res.json(invites);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invites" });
  }
};

export const getInviteById = async (req: Request, res: Response) => {
  try {
    const invite = await Invite.findById(req.params.id)
      .populate("inviteTemplate")
      .populate({
        path: "event",
        populate: { path: "user", select: "username email" },
      });
    //here changes ^

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    res.json(invite);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invite" });
  }
};
export const getInvitesByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    console.log("Fetching invites for eventId:", eventId);
    const invites = await Invite.find({ event: eventId })
      .populate("inviteTemplate")
      .populate("event");

    console.log("Invites found:", invites);
    res.json({ invites });
  } catch (err) {
    res.status(500).json({ message: "Error fetching invites" });
  }
};
export const updateInvite = async (req: Request, res: Response) => {
  try {
    const { guestName, guestEmail, rsvpStatus, inviteTemplate } = req.body;

    const updatedInvite = await Invite.findByIdAndUpdate(
      req.params.id,
      { guestName, guestEmail, rsvpStatus, inviteTemplate },
      { new: true }
    )
      .populate("inviteTemplate")
      .populate("event");

    if (!updatedInvite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    res.json(updatedInvite);
  } catch (err) {
    res.status(500).json({ message: "Error updating invite" });
  }
};

export const updateRSVPStatus = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { rsvpStatus } = req.body;

    if (!["Attending", "NotAttending"].includes(rsvpStatus)) {
      return res.status(400).json({ message: "Invalid RSVP status" });
    }

    const invite = await Invite.findOneAndUpdate(
      { qrCodeToken: token },
      { rsvpStatus },
      { new: true }
    );

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    res.json(invite);
  } catch (err) {
    res.status(500).json({ message: "Error updating RSVP status" });
  }
};
export const deleteInvite = async (req: Request, res: Response) => {
  try {
    const deletedInvite = await Invite.findByIdAndDelete(req.params.id);

    if (!deletedInvite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    if (deletedInvite.inviteTemplate) {
      await InviteTemplate.findByIdAndUpdate(deletedInvite.inviteTemplate, {
        $pull: { invites: deletedInvite._id },
      });
    }

    res.json({ message: "Invite deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting invite" });
  }
};
