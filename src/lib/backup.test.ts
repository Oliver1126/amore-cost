import { describe, expect, it } from "vitest";
import { parseBackup } from "./backup";

describe("parseBackup", () => {
  it("accepts a well-formed Calcost backup", () => {
    const text = JSON.stringify({
      app: "calcost",
      version: 1,
      exportedAt: "2026-08-18T00:00:00.000Z",
      data: { "calcost:v0:catalog": [] },
    });
    const backup = parseBackup(text);
    expect(backup.app).toBe("calcost");
    expect(backup.data).toEqual({ "calcost:v0:catalog": [] });
  });

  it("rejects invalid JSON", () => {
    expect(() => parseBackup("not json")).toThrow();
  });

  it("rejects JSON that isn't an Amore Cost backup", () => {
    expect(() => parseBackup(JSON.stringify({ hello: "world" }))).toThrow(
      /doesn't look like an Amore Cost backup/
    );
  });

  it("rejects a backup from a different app", () => {
    expect(() =>
      parseBackup(JSON.stringify({ app: "some-other-app", data: {} }))
    ).toThrow();
  });

  it("rejects a backup missing exportedAt, rather than letting a later .slice() crash on undefined", () => {
    expect(() =>
      parseBackup(JSON.stringify({ app: "calcost", data: {} }))
    ).toThrow(/doesn't look like an Amore Cost backup/);
  });
});
