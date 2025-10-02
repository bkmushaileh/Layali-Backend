import { Router } from "express";

import upload from "../../Middleware/multer";
import { authorization } from "../../Middleware/authorization";
import {
  createService,
  deleteAllservices,
  deleteService,
  getAllServices,
  getServiceById,
  updateService,
} from "./service.controller";

const router = Router();

router.post("/", authorization, upload.single("image"), createService); // Create
router.get("/", getAllServices);
router.delete("/deleteAll", deleteAllservices);
router.get("/:id", getServiceById);
router.put("/update/:id", updateService);
router.delete("delete/:id", deleteService);

export default router;
