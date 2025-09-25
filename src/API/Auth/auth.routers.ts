import express from "express";
import { getAllUsers, signin, signup } from "./auth.controllers";
import upload from "../../Middleware/multer";

const router = express.Router();

router.post("/signup", upload.single("image"), signup);
router.post("/signin", signin);
router.get("/getusers", getAllUsers);

export default router;
