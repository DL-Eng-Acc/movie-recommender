import mongoose from "mongoose";
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectDatabase } from "./config.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("connectDatabase", () => {
  it("rejects when the MongoDB URI is missing", async () => {
    const connectSpy = vi.spyOn(mongoose, "connect");

    await expect(connectDatabase("")).rejects.toThrow("MONGODB_URI is required");
    expect(connectSpy).not.toHaveBeenCalled();
  });

  it("connects Mongoose using the provided URI", async () => {
    const connectSpy = vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose);

    await connectDatabase("mongodb://localhost/movie-recommender-test");

    expect(connectSpy).toHaveBeenCalledWith("mongodb://localhost/movie-recommender-test");
  });
});