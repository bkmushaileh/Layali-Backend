import { Request, Response, NextFunction } from "express";
import Category from "../../Models/Category";
import Service from "../../Models/Service";
import Vendor from "../../Models/Vendor";

/**
 * Create a new category
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, services, vendors } = req.body;

    if (!name) {
      return next({ status: 400, message: "Name is required." });
    }

    const newCategory = await Category.create({
      name,
      services,
      vendors,
    });
    const newC = new Category(newCategory);
    const saved = await newC.save();
    if (saved.services?.length) {
      await Service.updateMany(
        { _id: { $in: saved.services } },
        { $push: { categories: saved._id } }
      );
    }
    if (saved.vendors?.length) {
      await Vendor.updateMany(
        { _id: { $in: saved.vendors } },
        { $push: { categories: saved._id } }
      );
    }
    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (err) {
    console.error("createCategory error:", err);
    return next({
      status: 500,
      message: "Something went wrong while creating category",
    });
  }
};

/**
 * Get all categories
 */
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find()
      .populate("services")
      .populate("vendors");

    return res.status(200).json(categories);
  } catch (err) {
    console.error("getAllCategories error:", err);
    return next({
      status: 500,
      message: "Something went wrong while fetching categories",
    });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate("services")
      .populate("vendors");

    if (!category) {
      return next({ status: 404, message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (err) {
    console.error("getCategoryById error:", err);
    return next({
      status: 500,
      message: "Something went wrong while fetching category",
    });
  }
};

/**
 * Update category
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, services, vendors } = req.body;
    const updateData: any = { name, services, vendors };

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("services")
      .populate("vendors");

    if (!updatedCategory) {
      return next({ status: 404, message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (err) {
    console.error("updateCategory error:", err);
    return next({
      status: 500,
      message: "Something went wrong while updating category",
    });
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return next({ status: 404, message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (err) {
    console.error("deleteCategory error:", err);
    return next({
      status: 500,
      message: "Something went wrong while deleting category",
    });
  }
};
// delete all categories //

export const deleteAllcategories = async (req: Request, res: Response) => {
  try {
    const result = await Category.deleteMany({ role: { $ne: "Admin" } });

    res.json({
      message: `${result.deletedCount} categories deleted successfully`,
    });
  } catch (err) {
    console.log("🚀 ~ deleteAllcategories ~ err:", err);
    res.status(500).json({ message: "Error deleting all categories" });
  }
};
