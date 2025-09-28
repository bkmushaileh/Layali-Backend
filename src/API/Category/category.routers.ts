import { Router } from "express";

import upload from "../../Middleware/multer";
import { authorization } from "../../Middleware/authorization";
import {
  createCategory,
  deleteAllcategories,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "./category.controller";

const router = Router();

router.post("/", createCategory); // Create
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.delete("/deleteAll", deleteAllcategories);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

export default router;
