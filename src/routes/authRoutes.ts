import { Router } from "express";
import {
  login,
  signup,
  changePassword,
  editProfile,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/edit-profile", editProfile);

export default router;
