import { describe, expect, it } from "vitest";
import { OpenJaneChatApi } from "./client.js";

describe("OpenJaneChatApi", () => {
  it("sends outbound text to the OpenJane events endpoint", async () => {
    const calls: Array<[string, RequestInit]> = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push([String(url), init ?? {}]);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          eventId: "evt_123",
          acceptedAt: "2026-04-24T18:10:01.000Z",
          status: "accepted",
        }),
      } as Response;
    };

    const api = new OpenJaneChatApi({
      baseUrl: "https://openjane.test/",
      token: "test-token",
      fetchImpl: fetchImpl as typeof fetch,
    });

    const result = await api.sendMessage("jane-or-channel-target", "hello");

    expect(result).toEqual({ id: "evt_123" });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("https://openjane.test/events");
    expect(calls[0][1]).toMatchObject({
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
    });
    expect(
      (calls[0][1].headers as Record<string, string>)["idempotency-key"],
    ).toMatch(/^evt_/);

    const body = JSON.parse(String(calls[0][1].body));
    expect(body).toMatchObject({
      schemaVersion: "openjane.bridge.v1",
      eventType: "assistant.message",
      source: { system: "openclaw", instanceId: "local" },
      target: { system: "openjane", channel: "OpenJaneChat" },
      conversation: { id: "jane-or-channel-target", type: "direct" },
      actor: { id: "openclaw", role: "agent" },
      content: [{ type: "text", text: "hello" }],
      intent: { kind: "chat" },
    });
  });

  it("keeps the legacy messages endpoint available explicitly", async () => {
    const calls: Array<[string, RequestInit]> = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push([String(url), init ?? {}]);
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: "msg_123" }),
      } as Response;
    };

    const api = new OpenJaneChatApi({
      baseUrl: "https://openjane.test/",
      token: "test-token",
      fetchImpl: fetchImpl as typeof fetch,
    });

    const result = await api.sendLegacyMessage("target", "hello");

    expect(result).toEqual({ id: "msg_123" });
    expect(calls[0][0]).toBe("https://openjane.test/messages");
  });
});
