import { Request, Response, NextFunction } from "express";
import Service from "../../Models/Service";
import Category from "../../Models/Category";
import Vendor from "../../Models/Vendor";

/**
 * Create a new service
 */
export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const image = req.file?.filename;

    const { name, price, vendor, categories, description, type, time } =
      req.body;
    // if (!name || !vendor || price == null || !image) {
    //   return next({
    //     status: 400,
    //     message: "Name, vendor, image and price are required",
    //   });
    // }
    if (!name || !String(name).trim()) {
      return next({ status: 400, message: "name is required" });
    }
    if (price == null || Number.isNaN(Number(price))) {
      return next({ status: 400, message: "price must be a number" });
    }
    if (!vendor) {
      return next({ status: 400, message: "vendor is required" });
    }
    if (!req.file?.filename) {
      return next({
        status: 400,
        message: "Image is required. Upload a file with field name 'image'.",
      });
    }
    // if (req.user?.role !== "Vendor") {
    //   return next({ status: 403, message: "Only Vendors can create services" });
    // }
    // const ownsVendor =
    //   Array.isArray(req.user.vendors) && req.user?.vendors.includes(vendor);
    // if (!ownsVendor) {
    //   return next({ status: 403, message: "You don’t own this vendor" });
    // }

    const newService = await Service.create({
      name: name.trim(),
      price,
      image,
      vendor,
      categories,
      description,
      type,
      time,
    });
    if (newService.categories?.length) {
      await Category.updateMany(
        { _id: { $in: newService.categories } },
        { $addToSet: { services: newService._id } }
      );
    }
    await Vendor.findByIdAndUpdate(vendor, {
      $push: { services: newService._id },
    });

    return res.status(201).json({
      message: "Service created successfully",
      service: newService,
    });
  } catch (err) {
    console.error("createService error:", err);
    return next({
      status: 500,
      message: "Something went wrong while creating service",
    });
  }
};

/**
 * Get all services
 */
export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const services = await Service.find()
      .populate("vendor")
      .populate("categories");

    return res.status(200).json(services);
  } catch (err) {
    console.error("getAllServices error:", err);
    return next({
      status: 500,
      message: "Something went wrong while fetching services",
    });
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("vendor")
      .populate("categories");

    if (!service) {
      return next({ status: 404, message: "Service not found" });
    }

    return res.status(200).json(service);
  } catch (err) {
    console.error("getServiceById error:", err);
    return next({
      status: 500,
      message: "Something went wrong while fetching service",
    });
  }
};

/**
 * Update service
 */
export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, price, vendor, categories } = req.body;
    const updateData: any = { name, price, vendor, categories };

    if (req.file) {
      updateData.image = req.file?.filename;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedService) {
      return next({ status: 404, message: "Service not found" });
    }

    return res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (err) {
    console.error("updateService error:", err);
    return next({
      status: 500,
      message: "Something went wrong while updating service",
    });
  }
};

/**
 * Delete service
 */
export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return next({ status: 404, message: "Service not found" });
    }

    return res.status(200).json({
      message: "Service deleted successfully",
      service: deletedService,
    });
  } catch (err) {
    console.error("deleteService error:", err);
    return next({
      status: 500,
      message: "Something went wrong while deleting service",
    });
  }
};
export const deleteAllservices = async (req: Request, res: Response) => {
  try {
    const result = await Service.deleteMany({ role: { $ne: "Admin" } });

    res.json({
      message: `${result.deletedCount} services deleted successfully`,
    });
  } catch (err) {
    console.log("🚀 ~ deleteAllcategories ~ err:", err);
    res.status(500).json({ message: "Error deleting all services" });
  }
};
