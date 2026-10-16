import { http, HttpResponse } from "msw";
import { describe, it, expect } from "vitest";
import { server } from "../test/server";
import { apiFetch } from "./index";

const ENDPOINT = "http://localhost:5000/api/test";

describe("apiFetch", () => {
  it("returns the JSON body of a successful response", async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ id: 7 })));

    await expect(apiFetch<{ id: number }>("/test")).resolves.toEqual({ id: 7 });
  });

  it("sends a JSON content type and keeps headers the caller passes", async () => {
    let received: Headers | undefined;
    server.use(
      http.get(ENDPOINT, ({ request }) => {
        received = request.headers;
        return HttpResponse.json({});
      }),
    );

    await apiFetch("/test", { headers: new Headers({ "X-Request-Id": "abc" }) });

    expect(received?.get("Content-Type")).toBe("application/json");
    expect(received?.get("X-Request-Id")).toBe("abc");
  });

  it("throws the backend's error message", async () => {
    server.use(
      http.get(ENDPOINT, () => HttpResponse.json({ message: "Service down" }, { status: 503 })),
    );

    await expect(apiFetch("/test")).rejects.toThrow("Service down");
  });

  it("falls back to the status when the error body has no message", async () => {
    server.use(http.get(ENDPOINT, () => new HttpResponse("oops", { status: 500 })));

    await expect(apiFetch("/test")).rejects.toThrow("HTTP 500");
  });
});
