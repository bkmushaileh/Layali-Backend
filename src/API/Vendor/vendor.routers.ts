import { Router } from "express";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  deleteAllVendors,
} from "../Vendor/vendor.controllers";
import upload from "../../Middleware/multer";
import { authorization } from "../../Middleware/authorization";

const router = Router();

router.post("/", authorization, upload.single("logo"), createVendor); // Create
router.get("/", getVendors); // Get all
router.get("/:id", getVendorById); // Get one
router.put("/:id", authorization, upload.single("logo"), updateVendor); // Update
router.delete("/:id", deleteVendor); // Delete one
router.delete("/", deleteAllVendors); // Delete all (optional)

export default router;
