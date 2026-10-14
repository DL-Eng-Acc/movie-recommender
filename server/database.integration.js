import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "./config/config.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

before(async () => {
  assert.ok(process.env.MONGODB_URI, "MONGODB_URI must be configured in the root .env file");
  await connectDatabase();
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test("connects to MongoDB", () => {
  assert.equal(mongoose.connection.readyState, 1);
  assert.ok(mongoose.connection.db);
});

test("MongoDB responds to an admin ping", async () => {
  const response = await mongoose.connection.db.admin().ping();

  assert.equal(response.ok, 1);
});