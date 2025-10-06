import { Request, Response } from "express";
import InviteTemplate from "../../Models/InviteTemplate";

const toTagsArray = (tags: unknown): string[] | undefined => {
  if (tags == null) return undefined;
  if (Array.isArray(tags))
    return tags
      .map(String)
      .map((t) => t.trim())
      .filter(Boolean);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return undefined;
};
export const createInviteTemplate = async (req: Request, res: Response) => {
  try {
    const { event, subtitle, tags } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Background image is required" });
    }
    const relativePath = `/uploads/${req.file.filename}`;

    const newTemplate = new InviteTemplate({
      background: relativePath,
      event: event || null,
      subtitle: subtitle || undefined,
      tags: toTagsArray(tags) || undefined,
    });
    await newTemplate.save();

    res.status(201).json(newTemplate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInviteTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await InviteTemplate.find().populate("invites");

    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInviteTemplateById = async (req: Request, res: Response) => {
  try {
    const template = await InviteTemplate.findById(req.params.id)
      .populate("invites")
      .populate("event");

    if (!template) {
      return res.status(404).json({ message: "InviteTemplate not found" });
    }

    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInviteTemplate = async (req: Request, res: Response) => {
  try {
    const { background, event, invites } = req.body;

    const updated = await InviteTemplate.findByIdAndUpdate(
      req.params.id,
      { background, event, invites },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "InviteTemplate not found" });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInviteTemplate = async (req: Request, res: Response) => {
  try {
    const deleted = await InviteTemplate.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "InviteTemplate not found" });
    }

    res.json({ message: "InviteTemplate deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
