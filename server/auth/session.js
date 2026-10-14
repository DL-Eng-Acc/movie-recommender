import MongoStore from "connect-mongo";
import session from "express-session";
import mongoose from "mongoose";

export const SESSION_COOKIE_NAME = "movie.sid";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DEVELOPMENT_SECRET = "movie-recommender-development-session-secret";

export function createSessionMiddleware() {
  const isProduction = process.env.NODE_ENV === "production";
  const secret = process.env.SESSION_SECRET;

  if (isProduction && !secret) {
    throw new Error("SESSION_SECRET is required in production");
  }

  const store = mongoose.connection.readyState === 1
    ? MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: "sessions",
        ttl: SESSION_MAX_AGE_MS / 1000,
      })
    : undefined;

  return session({
    name: SESSION_COOKIE_NAME,
    secret: secret || DEVELOPMENT_SECRET,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_MS,
    },
  });
}