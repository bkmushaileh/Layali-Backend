import { NextFunction, Request, Response } from "express";
import Vendor from "../../Models/Vendor";
import { errorHandler } from "../../Middleware/errorHandler";
import User from "../../Models/User";

// CREATE Vendor
const createVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, business_name, bio, services } = req.body;
    const logo = req.file?.filename;

    if (!business_name) {
      return res.status(400).json({ error: "Business name is required!" });
    }

    const existingVendor = await Vendor.findOne({ business_name });
    if (existingVendor) {
      return res.status(409).json({ error: "Vendor already exists" });
    }

    const vendor = await Vendor.create({
      user,
      business_name,
      bio,
      logo: req.file?.filename,
      services,
    });
    const savedVendor = await vendor.save();
    await User.findByIdAndUpdate(savedVendor.user, {
      $push: { vendors: savedVendor._id },
    });
    return res.status(201).json(savedVendor);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET all Vendors (with populate)
const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendors = await Vendor.find()
      .populate("user", "-password")
      .populate("services")
      .populate("categories") // hide password if exists
      .populate("events");
    // .populate("giftCard");

    if (!vendors || vendors.length === 0) {
      return res.status(200).json({ message: "No vendors found", data: [] });
    }

    return res.status(200).json(vendors);
  } catch (error) {
    console.error(error);
    next(errorHandler);
  }
};

// GET single Vendor by ID (with populate)
const getVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("user", "-password")
      .populate("events")
      .populate("services")
      .populate("categories");
    // .populate("giftCard");

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    return res.status(200).json(vendor);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// UPDATE Vendor
const updateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { business_name, bio, logo, events, services, category, giftCard } =
      req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { business_name, bio, logo, events, services, category, giftCard },
      { new: true, runValidators: true }
    )
      .populate("user", "-password")
      .populate("events")
      .populate("services")
      .populate("categories");
    // .populate("giftCard");

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    return res.status(200).json(vendor);
  } catch (error) {
    console.error(error);
    next(errorHandler);
  }
};

// DELETE Vendor
const deleteVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    return res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error(error);
    next(errorHandler);
  }
};

// DELETE all Vendors (⚠️ optional - admin use)
const deleteAllVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Vendor.deleteMany({});
    return res
      .status(200)
      .json({ message: "All vendors deleted successfully" });
  } catch (error) {
    console.error(error);
    next(errorHandler);
  }
};

export {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  deleteAllVendors,
};
