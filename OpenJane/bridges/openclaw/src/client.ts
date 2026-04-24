import {
  createOpenJaneChatBridgeEvent,
  type OpenJaneChatBridgeEvent,
  type OpenJaneChatEventAck,
} from "./runtime.js";

export type OpenJaneChatClientConfig = {
  baseUrl: string;
  token: string;
  fetchImpl?: typeof fetch;
};

export type OpenJaneChatSendMessageResult = {
  id: string;
};

type OpenJaneChatLegacySendMessageResponse = {
  id?: unknown;
  messageId?: unknown;
};

type SendBridgeEventParams = {
  event: OpenJaneChatBridgeEvent;
};

type SendMessageParams = {
  to: string;
  text: string;
  replyToId?: string | number | null;
  threadId?: string | number | null;
};

export class OpenJaneChatApi {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: OpenJaneChatClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.token;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async sendBridgeEvent(
    params: SendBridgeEventParams,
  ): Promise<OpenJaneChatEventAck> {
    const response = await this.fetchImpl(`${this.baseUrl}/events`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
        "idempotency-key": params.event.eventId,
      },
      body: JSON.stringify(params.event),
    });

    if (!response.ok) {
      throw new Error(
        `OpenJaneChat: outbound event failed with status ${response.status}`,
      );
    }

    const body = (await response.json().catch(() => ({}))) as
      | Partial<OpenJaneChatEventAck>
      | undefined;
    if (body?.ok !== true || typeof body.eventId !== "string") {
      throw new Error("OpenJaneChat: outbound event ack was invalid");
    }

    return {
      ok: true,
      eventId: body.eventId,
      acceptedAt:
        typeof body.acceptedAt === "string"
          ? body.acceptedAt
          : new Date().toISOString(),
      status: "accepted",
    };
  }

  async sendMessage(
    toOrParams: string | SendMessageParams,
    text?: string,
  ): Promise<OpenJaneChatSendMessageResult> {
    const params =
      typeof toOrParams === "string"
        ? { to: toOrParams, text: text ?? "" }
        : toOrParams;
    const event = createOpenJaneChatBridgeEvent({
      eventType: "assistant.message",
      sourceSystem: "openclaw",
      sourceInstanceId: "local",
      targetSystem: "openjane",
      conversationId: params.to,
      actorId: "openclaw",
      actorRole: "agent",
      text: params.text,
      intentKind: "chat",
      replyToEventId: params.replyToId,
      threadId: params.threadId,
    });
    const ack = await this.sendBridgeEvent({ event });
    return { id: ack.eventId };
  }

  async sendDm(
    target: string,
    text: string,
  ): Promise<OpenJaneChatSendMessageResult> {
    return this.sendMessage(target, text);
  }

  async sendLegacyMessage(
    to: string,
    text: string,
  ): Promise<OpenJaneChatSendMessageResult> {
    const response = await this.fetchImpl(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ to, text }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenJaneChat: outbound message failed with status ${response.status}`,
      );
    }

    const body = (await response.json().catch(() => ({}))) as
      | OpenJaneChatLegacySendMessageResponse
      | undefined;
    const id = body?.id ?? body?.messageId;

    return { id: typeof id === "string" && id ? id : "" };
  }

  async sendFile(_to: string, _filePath: string): Promise<never> {
    throw new Error("OpenJaneChat: file transport is not supported in v1");
  }
}

export function createOpenJaneChatApi(
  config: OpenJaneChatClientConfig,
): OpenJaneChatApi {
  return new OpenJaneChatApi(config);
}
