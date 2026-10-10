import { describe, expect, it, vi } from "vitest";
import { startServer } from "./startServer.js";

describe("startServer", () => {
  it("waits for MongoDB before creating and listening on the app", async () => {
    let finishConnection;
    const databaseConnector = vi.fn(
      () => new Promise((resolve) => {
        finishConnection = resolve;
      }),
    );
    const server = {};
    const listen = vi.fn(() => server);
    const appFactory = vi.fn(() => ({ listen }));
    const logger = { log: vi.fn() };

    const startup = startServer({
      databaseConnector,
      appFactory,
      port: 5001,
      frontendOrigin: "http://localhost:5173",
      logger,
    });

    expect(databaseConnector).toHaveBeenCalledOnce();
    expect(appFactory).not.toHaveBeenCalled();
    expect(listen).not.toHaveBeenCalled();

    finishConnection();
    await expect(startup).resolves.toBe(server);

    expect(appFactory).toHaveBeenCalledWith("http://localhost:5173");
    expect(listen).toHaveBeenCalledWith(5001, expect.any(Function));
  });

  it("does not create or listen on the app when MongoDB connection fails", async () => {
    const databaseError = new Error("Database unavailable");
    const databaseConnector = vi.fn().mockRejectedValue(databaseError);
    const appFactory = vi.fn();

    await expect(
      startServer({ databaseConnector, appFactory }),
    ).rejects.toBe(databaseError);

    expect(appFactory).not.toHaveBeenCalled();
  });
});