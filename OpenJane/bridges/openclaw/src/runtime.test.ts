import { describe, expect, it } from "vitest";
import {
  isAuthorizedBearer,
  parseOpenJaneChatBridgeEvent,
  parseOpenJaneChatInboundPayload,
} from "./runtime.js";

describe("OpenJaneChat runtime", () => {
  it("parses a minimal inbound webhook payload", () => {
    expect(
      parseOpenJaneChatInboundPayload({
        channelId: "lobster-control",
        userId: "jane",
        text: "approve this?",
        messageId: "msg_123",
        threadId: "thread_456",
      }),
    ).toEqual({
      channelId: "lobster-control",
      userId: "jane",
      text: "approve this?",
      messageId: "msg_123",
      threadId: "thread_456",
    });
  });

  it("parses an event envelope inbound payload", () => {
    const event = parseOpenJaneChatBridgeEvent({
      schemaVersion: "openjane.bridge.v1",
      eventId: "evt_01",
      eventType: "user.message",
      sentAt: "2026-04-24T18:10:00.000Z",
      source: { system: "openjane", instanceId: "openjane-local" },
      target: { system: "openclaw", channel: "OpenJaneChat" },
      conversation: {
        id: "lobster-control",
        type: "direct",
        threadId: "thread_456",
      },
      actor: { id: "jane", displayName: "Jane", role: "human" },
      content: [{ type: "text", text: "approve this?" }],
      intent: { kind: "chat" },
      correlation: {},
      meta: {},
    });

    expect(event).toMatchObject({
      schemaVersion: "openjane.bridge.v1",
      eventId: "evt_01",
      eventType: "user.message",
      conversation: { id: "lobster-control", type: "direct" },
      actor: { id: "jane", role: "human" },
      content: [{ type: "text", text: "approve this?" }],
    });
  });

  it("rejects payloads missing required fields", () => {
    expect(() =>
      parseOpenJaneChatInboundPayload({
        userId: "jane",
        text: "approve this?",
      }),
    ).toThrow("channelId is required");

    expect(() =>
      parseOpenJaneChatInboundPayload({
        channelId: "lobster-control",
        text: "approve this?",
      }),
    ).toThrow("userId is required");

    expect(() =>
      parseOpenJaneChatInboundPayload({
        channelId: "lobster-control",
        userId: "jane",
      }),
    ).toThrow("text is required");
  });

  it("checks bearer authorization", () => {
    expect(
      isAuthorizedBearer({ authorization: "Bearer test-token" }, "test-token"),
    ).toBe(true);
    expect(isAuthorizedBearer({}, "test-token")).toBe(false);
    expect(
      isAuthorizedBearer({ authorization: "Bearer wrong-token" }, "test-token"),
    ).toBe(false);
  });
});
