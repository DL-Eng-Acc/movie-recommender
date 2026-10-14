import { describe, expect, it } from "vitest";
import { User } from "./User.js";

describe("User model", () => {
  it("normalizes username and email", () => {
    const user = new User({
      username: "  Film_Fan  ",
      email: "  FILM@example.com  ",
      passwordHash: "hashed-password",
    });

    expect(user.username).toBe("film_fan");
    expect(user.email).toBe("film@example.com");
  });

  it("requires username, email, and password hash", async () => {
    const user = new User();

    await expect(user.validate()).rejects.toMatchObject({
      errors: {
        username: expect.anything(),
        email: expect.anything(),
        passwordHash: expect.anything(),
      },
    });
  });

  it("does not select password hashes by default", () => {
    expect(User.schema.path("passwordHash").options.select).toBe(false);
  });

  it("creates unique indexes for username and email", () => {
    const indexes = User.schema.indexes();

    expect(
      indexes.some(([fields, options]) => fields.username === 1 && options.unique),
    ).toBe(true);
    expect(
      indexes.some(([fields, options]) => fields.email === 1 && options.unique),
    ).toBe(true);
  });
});