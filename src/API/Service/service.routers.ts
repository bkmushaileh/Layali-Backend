import { Router } from "express";

import upload from "../../Middleware/multer";
import { authorization } from "../../Middleware/authorization";
import {
  createService,
  deleteAllservices,
  deleteService,
  getAllServices,
} from "./service.controller";

const router = Router();

router.post("/", upload.single("image"), createService); // Create
router.get("/", getAllServices);
router.delete("/deleteAll", deleteAllservices);

export default router;
