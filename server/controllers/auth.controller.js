import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { SESSION_COOKIE_NAME } from "../auth/session.js";

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  };
}

function validateSignUp({ username, email, password }) {
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username.trim().toLowerCase())) {
    return "Username must be 3-30 characters using letters, numbers, dots, underscores, or hyphens";
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email.trim())) {
    return "A valid email address is required";
  }
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES
  ) {
    return "Password must be at least 8 characters and no more than 72 UTF-8 bytes";
  }
  return null;
}

function establishSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        reject(regenerateError);
        return;
      }

      req.session.userId = userId;
      req.session.save((saveError) => {
        if (saveError) {
          reject(saveError);
          return;
        }
        resolve();
      });
    });
  });
}

function handleAuthError(res, error) {
  if (error?.code === 11000) {
    return res.status(409).json({ message: "Username or email is already registered" });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: "Invalid account details" });
  }
  return res.status(500).json({ message: "Authentication request failed" });
}

export async function signUp(req, res) {
  const validationError = validateSignUp(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const username = req.body.username.trim().toLowerCase();
  const email = req.body.email.trim().toLowerCase();

  try {
    const passwordHash = await bcrypt.hash(req.body.password, BCRYPT_ROUNDS);
    const user = await User.create({ username, email, passwordHash });
    await establishSession(req, user._id.toString());

    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    return handleAuthError(res, error);
  }
}

export async function logIn(req, res) {
  const identifier = typeof req.body?.identifier === "string"
    ? req.body.identifier.trim().toLowerCase()
    : "";
  const password = req.body?.password;

  if (!identifier || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Username or email and password are required" });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    await establishSession(req, user._id.toString());
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return handleAuthError(res, error);
  }
}

export async function logOut(req, res) {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ message: "Could not log out" });
      return;
    }

    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.json({ message: "Logged out" });
  });
}

export async function getCurrentUser(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return handleAuthError(res, error);
  }
}