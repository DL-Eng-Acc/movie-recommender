import { Router } from "express";
import mongoose from "mongoose";
import { getCurrentUser, logIn, logOut, signUp } from "../controllers/auth.controller.js";

const router = Router();

function requireDatabase(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Account service is unavailable" });
  }
  return next();
}

router.post("/signup", requireDatabase, signUp);
router.post("/login", requireDatabase, logIn);
router.post("/logout", logOut);
router.get("/me", requireDatabase, getCurrentUser);

export default router;