import express from "express";
import { signin, signup } from "./auth.controllers";
import upload from "../../Middleware/multer";

const router = express.Router();

router.post("/signup", upload.single("image"), signup);
router.post("/signin", signin);

export default router;
