import express from "express";
import {
  register,
  login,
  logout,
  getMe,
} from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validate,
  registerValidationRules,
  loginValidationRules,
} from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/register", validate(registerValidationRules), register);
router.post("/login", validate(loginValidationRules), login);
router.post("/logout", logout);

router.get("/me", protect, getMe);

export default router;
