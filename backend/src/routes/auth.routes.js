import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteMe,
} from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validate,
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  deleteAccountValidationRules,
} from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/register", validate(registerValidationRules), register);
router.post("/login", validate(loginValidationRules), login);
router.post("/logout", logout);

router.post(
  "/forgot-password",
  validate(forgotPasswordValidationRules),
  forgotPassword
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordValidationRules),
  resetPassword
);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.delete("/me", protect, validate(deleteAccountValidationRules), deleteMe);

export default router;
