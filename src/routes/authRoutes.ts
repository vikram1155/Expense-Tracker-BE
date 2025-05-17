import { Router } from "express";
import {
  signup,
  login,
  editProfile,
  changePassword,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/edit-profile", editProfile);
router.post("/change-password", changePassword);

export default router;
