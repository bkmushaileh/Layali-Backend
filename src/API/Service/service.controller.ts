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
    const { name, price, vendor, categories } = req.body;

    const newService = await Service.create({
      name: name.trim(),
      price,
      image: req.file?.filename,
      vendor,
      categories,
    });
    //update category m-m realtionship//
    const newS = new Service(newService);
    const saved = await newS.save();
    if (saved.categories?.length) {
      await Category.updateMany(
        { _id: { $in: saved.categories } },
        { $push: { services: saved._id } }
      );
    }
    // update the vendor 1-m realtionship
    await Vendor.findByIdAndUpdate(saved.vendor, {
      $push: { services: saved._id },
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
