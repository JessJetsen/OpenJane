import { describe, expect, it } from "vitest";
import { OpenJaneChatPlugin } from "./channel.js";

describe("OpenJaneChat plugin", () => {
  it("resolves account from config", () => {
    const cfg = {
      channels: {
        "OpenJaneChat": {
          token: "test-token",
          baseUrl: "https://openjane.test",
          allowFrom: ["user1"],
        },
      },
    } as any;
    const account = OpenJaneChatPlugin.config.resolveAccount(cfg, undefined);
    expect(account.token).toBe("test-token");
    expect(account.baseUrl).toBe("https://openjane.test");
    expect(account.allowFrom).toEqual(["user1"]);
  });

  it("requires a token", () => {
    const cfg = {
      channels: { "OpenJaneChat": { baseUrl: "https://openjane.test" } },
    } as any;
    expect(() =>
      OpenJaneChatPlugin.config.resolveAccount(cfg, undefined),
    ).toThrow("token is required");
  });

  it("requires a baseUrl", () => {
    const cfg = {
      channels: { "OpenJaneChat": { token: "test-token" } },
    } as any;
    expect(() =>
      OpenJaneChatPlugin.config.resolveAccount(cfg, undefined),
    ).toThrow("baseUrl is required");
  });

  it("inspects account without materializing secrets", () => {
    const cfg = {
      channels: {
        "OpenJaneChat": {
          token: "test-token",
          baseUrl: "https://openjane.test",
        },
      },
    } as any;
    const result = OpenJaneChatPlugin.config.inspectAccount!(
      cfg,
      undefined,
    ) as any;
    expect(result.configured).toBe(true);
    expect(result.tokenStatus).toBe("available");
    expect((result as any).baseUrlStatus).toBe("available");
  });

  it("reports missing config", () => {
    const cfg = { channels: {} } as any;
    const result = OpenJaneChatPlugin.config.inspectAccount!(
      cfg,
      undefined,
    ) as any;
    expect(result.configured).toBe(false);
  });
});
