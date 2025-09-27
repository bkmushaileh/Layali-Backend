import { NextFunction, Request, Response } from "express";
import User from "../../../Models/User";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("events")
      .populate("vendors");

    return res.status(200).json(users);
  } catch (error) {
    console.log("🚀 ~ getAllUsers ~ error:", error);
    return next({ status: 500, message: "Something went wrong " });
  }
};
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("events")
      .populate("vendors");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.log("🚀 ~ getUserById ~ err:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role } = req.body;

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (username && username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username must be at least 4 characters long" });
    }

    if (password && password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    if (role && !["Admin", "Vendor", "Normal"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    console.log("🚀 ~ updateUser ~ err:", err);
    res.status(400).json({ message: "Error updating user" });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "user not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
};
export const deleteAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await User.deleteMany({ role: { $ne: "Admin" } });

    res.json({
      message: `${result.deletedCount} users deleted successfully`,
    });
  } catch (err) {
    console.log("🚀 ~ deleteAllUsers ~ err:", err);
    res.status(500).json({ message: "Error deleting all users" });
  }
};
