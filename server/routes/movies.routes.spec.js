import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../app.js";

const app = createApp();

describe("api/random route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("get request on /api/random returns a json entry", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
            results: [{ name: "this" }],
        }),
        }
    );

    const res = await request(app).get("/api/movies/random/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({name: "this"});
  });

  it("returns 500 on tmdb error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
        Response.json({ error: "Service Unavailable" }, { status: 503 })
    );

    const res = await request(app).get("/api/movies/random/");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({message:"TMDB request failed with status code: 503"});
  });

  it("gracefully addresses the fetch call being thrown", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network Error."));

    const res = await request(app).get("/api/movies/random/");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({message:"Network Error."});
  });
});

describe("api/health route", () => {
  const initialReadyState = mongoose.connection.readyState;

  afterEach(() => {
    mongoose.connection.readyState = initialReadyState;
  });

  it("reports unavailable until MongoDB is connected", async () => {
    mongoose.connection.readyState = 0;

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "unavailable", database: "disconnected" });
  });

  it("reports healthy when MongoDB is connected", async () => {
    mongoose.connection.readyState = 1;

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", database: "connected" });
  });
});