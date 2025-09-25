import express from "express";
import {
  deleteAllUsers,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "./user.controller";
const router = express.Router();

router.get("/getusers", getAllUsers);
router.get("/getuser/:id", getUserById);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);
router.delete("/deleteAll", deleteAllUsers);
export default router;
