import type { OpenClawConfig } from "openclaw/plugin-sdk/channel-core";

export const OPENJANECHAT_CHANNEL_ID = "OpenJaneChat";
export const OPENJANECHAT_BRIDGE_SCHEMA_VERSION = "openjane.bridge.v1";

const MAX_BODY_BYTES = 1024 * 1024;

export type OpenJaneChatInboundEvent = {
  channelId: string;
  userId: string;
  text: string;
  messageId?: string;
  threadId?: string;
};

export type OpenJaneChatContentPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "audio" | "video";
      mediaId?: string;
      mimeType?: string;
      url?: string;
      transcript?: string;
      caption?: string;
    };

export type OpenJaneChatBridgeEvent = {
  schemaVersion: typeof OPENJANECHAT_BRIDGE_SCHEMA_VERSION;
  eventId: string;
  eventType: string;
  sentAt: string;
  source: {
    system: string;
    instanceId?: string;
  };
  target: {
    system: string;
    channel?: string;
  };
  conversation: {
    id: string;
    type: "direct" | "group" | "channel";
    threadId?: string;
  };
  actor: {
    id: string;
    displayName?: string;
    role: "human" | "agent" | "system";
  };
  content: OpenJaneChatContentPart[];
  intent: {
    kind: string;
    command?: string;
    requiresApproval?: boolean;
  };
  correlation: {
    replyToEventId?: string;
    causationId?: string;
  };
  meta: Record<string, unknown>;
};

export type OpenJaneChatEventAck = {
  ok: true;
  eventId: string;
  acceptedAt: string;
  status: "accepted";
};

type HeaderMap = {
  get?: (name: string) => string | null;
  [key: string]: unknown;
};

type HttpRequestLike = AsyncIterable<Buffer | Uint8Array | string> & {
  method?: string;
  headers?: HeaderMap;
  body?: unknown;
};

type HttpResponseLike = {
  statusCode?: number;
  setHeader?: (name: string, value: string) => void;
  end: (body?: string) => void;
};

type RuntimeApiLike = {
  config?: OpenClawConfig;
  openclawConfig?: OpenClawConfig;
  getConfig?: () => OpenClawConfig | Promise<OpenClawConfig>;
  registerHttpRoute?: (route: {
    path: string;
    auth: "plugin";
    handler: (req: HttpRequestLike, res: HttpResponseLike) => Promise<boolean>;
  }) => void;
  runtime?: unknown;
};

export function createOpenJaneChatBridgeEvent(params: {
  eventId?: string;
  eventType: string;
  sourceSystem: string;
  sourceInstanceId?: string;
  targetSystem: string;
  conversationId: string;
  conversationType?: "direct" | "group" | "channel";
  threadId?: string | number | null;
  actorId: string;
  actorDisplayName?: string;
  actorRole: "human" | "agent" | "system";
  text: string;
  intentKind?: string;
  replyToEventId?: string | number | null;
  causationId?: string;
  meta?: Record<string, unknown>;
}): OpenJaneChatBridgeEvent {
  return {
    schemaVersion: OPENJANECHAT_BRIDGE_SCHEMA_VERSION,
    eventId: params.eventId || generateEventId(),
    eventType: params.eventType,
    sentAt: new Date().toISOString(),
    source: {
      system: params.sourceSystem,
      ...(params.sourceInstanceId
        ? { instanceId: params.sourceInstanceId }
        : {}),
    },
    target: {
      system: params.targetSystem,
      channel: OPENJANECHAT_CHANNEL_ID,
    },
    conversation: {
      id: params.conversationId,
      type: params.conversationType ?? "direct",
      ...(params.threadId !== undefined && params.threadId !== null
        ? { threadId: String(params.threadId) }
        : {}),
    },
    actor: {
      id: params.actorId,
      ...(params.actorDisplayName
        ? { displayName: params.actorDisplayName }
        : {}),
      role: params.actorRole,
    },
    content: [{ type: "text", text: params.text }],
    intent: { kind: params.intentKind ?? "chat" },
    correlation: {
      ...(params.replyToEventId !== undefined && params.replyToEventId !== null
        ? { replyToEventId: String(params.replyToEventId) }
        : {}),
      ...(params.causationId ? { causationId: params.causationId } : {}),
    },
    meta: params.meta ?? {},
  };
}

export function parseOpenJaneChatInboundPayload(
  payload: unknown,
): OpenJaneChatInboundEvent {
  return bridgeEventToInboundEvent(parseOpenJaneChatBridgeEvent(payload));
}

export function parseOpenJaneChatBridgeEvent(
  payload: unknown,
): OpenJaneChatBridgeEvent {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("OpenJaneChat: webhook payload must be a JSON object");
  }

  const record = payload as Record<string, unknown>;
  if (record.schemaVersion !== undefined || record.eventType !== undefined) {
    return parseBridgeEnvelope(record);
  }

  const channelId = requiredString(record.channelId, "channelId");
  const userId = requiredString(record.userId, "userId");
  const text = requiredString(record.text, "text");
  const messageId = optionalString(record.messageId, "messageId");
  const threadId = optionalString(record.threadId, "threadId");

  return createOpenJaneChatBridgeEvent({
    eventId: messageId,
    eventType: "user.message",
    sourceSystem: "openjane",
    targetSystem: "openclaw",
    conversationId: channelId,
    threadId,
    actorId: userId,
    actorRole: "human",
    text,
    intentKind: "chat",
  });
}

export function bridgeEventToInboundEvent(
  event: OpenJaneChatBridgeEvent,
): OpenJaneChatInboundEvent {
  const textPart = event.content.find(
    (part): part is Extract<OpenJaneChatContentPart, { type: "text" }> =>
      part.type === "text",
  );
  if (!textPart?.text.trim()) {
    throw new Error("OpenJaneChat: text content is required");
  }

  return {
    channelId: event.conversation.id,
    userId: event.actor.id,
    text: textPart.text,
    messageId: event.eventId,
    ...(event.conversation.threadId
      ? { threadId: event.conversation.threadId }
      : {}),
  };
}

export function isAuthorizedBearer(
  headers: HeaderMap | undefined,
  expectedToken: string,
): boolean {
  const value = getHeader(headers, "authorization");
  if (!value) return false;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return Boolean(match && match[1] === expectedToken);
}

export function registerOpenJaneChatRoutes(api: RuntimeApiLike): void {
  if (!api.registerHttpRoute) {
    throw new Error("OpenJaneChat: registerHttpRoute is not available");
  }

  api.registerHttpRoute({
    path: "/OpenJaneChat/events",
    auth: "plugin",
    handler: async (req, res) =>
      handleOpenJaneChatRoute(api, req, res, "json"),
  });

  api.registerHttpRoute({
    path: "/OpenJaneChat/webhook",
    auth: "plugin",
    handler: async (req, res) =>
      handleOpenJaneChatRoute(api, req, res, "text"),
  });
}

export async function handleOpenJaneChatInbound(
  api: RuntimeApiLike,
  event: OpenJaneChatInboundEvent,
): Promise<void> {
  const runtime = api.runtime as
    | {
        channel?: {
          inbound?: {
            dispatch?: (
              event: OpenJaneChatInboundEvent,
            ) => Promise<void> | void;
          };
        };
      }
    | undefined;
  const dispatch = runtime?.channel?.inbound?.dispatch;
  if (dispatch) {
    await dispatch(event);
    return;
  }

  // TODO: connect this boundary to OpenClaw's concrete inbound dispatch helper
  // when the plugin is installed in a full host SDK workspace.
  void event;
}

async function handleOpenJaneChatRoute(
  api: RuntimeApiLike,
  req: HttpRequestLike,
  res: HttpResponseLike,
  responseMode: "json" | "text",
): Promise<boolean> {
  if (req.method && req.method.toUpperCase() !== "POST") {
    writeErrorResponse(res, 405, "method not allowed", responseMode);
    return true;
  }

  const token = await resolveConfiguredToken(api);
  if (!token) {
    writeErrorResponse(
      res,
      500,
      "OpenJaneChat token is not configured",
      responseMode,
    );
    return true;
  }

  if (!isAuthorizedBearer(req.headers, token)) {
    writeErrorResponse(res, 401, "unauthorized", responseMode);
    return true;
  }

  try {
    const payload = await readJsonBody(req);
    const bridgeEvent = parseOpenJaneChatBridgeEvent(payload);
    const event = bridgeEventToInboundEvent(bridgeEvent);
    await handleOpenJaneChatInbound(api, event);
    writeAcceptedResponse(res, bridgeEvent.eventId, responseMode);
  } catch (error) {
    writeErrorResponse(
      res,
      400,
      error instanceof Error ? error.message : "invalid webhook payload",
      responseMode,
    );
  }

  return true;
}

async function resolveConfiguredToken(
  api: RuntimeApiLike,
): Promise<string | undefined> {
  const cfg =
    (await api.getConfig?.()) ?? api.config ?? api.openclawConfig ?? undefined;
  const section = (cfg?.channels as Record<string, any> | undefined)?.[
    OPENJANECHAT_CHANNEL_ID
  ];
  return typeof section?.token === "string" ? section.token : undefined;
}

async function readJsonBody(req: HttpRequestLike): Promise<unknown> {
  if (req.body !== undefined) return req.body;

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.byteLength;
    if (total > MAX_BODY_BYTES) {
      throw new Error("OpenJaneChat: webhook payload is too large");
    }
    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) throw new Error("OpenJaneChat: webhook payload is empty");
  return JSON.parse(raw);
}

function parseBridgeEnvelope(
  record: Record<string, unknown>,
): OpenJaneChatBridgeEvent {
  const schemaVersion = requiredString(record.schemaVersion, "schemaVersion");
  if (schemaVersion !== OPENJANECHAT_BRIDGE_SCHEMA_VERSION) {
    throw new Error("OpenJaneChat: unsupported schemaVersion");
  }

  const source = requiredRecord(record.source, "source");
  const target = requiredRecord(record.target, "target");
  const conversation = requiredRecord(record.conversation, "conversation");
  const actor = requiredRecord(record.actor, "actor");

  return {
    schemaVersion: OPENJANECHAT_BRIDGE_SCHEMA_VERSION,
    eventId: requiredString(record.eventId, "eventId"),
    eventType: requiredString(record.eventType, "eventType"),
    sentAt: requiredString(record.sentAt, "sentAt"),
    source: {
      system: requiredString(source.system, "source.system"),
      ...(optionalString(source.instanceId, "source.instanceId")
        ? { instanceId: optionalString(source.instanceId, "source.instanceId") }
        : {}),
    },
    target: {
      system: requiredString(target.system, "target.system"),
      ...(optionalString(target.channel, "target.channel")
        ? { channel: optionalString(target.channel, "target.channel") }
        : {}),
    },
    conversation: {
      id: requiredString(conversation.id, "conversation.id"),
      type: parseConversationType(conversation.type),
      ...(optionalString(conversation.threadId, "conversation.threadId")
        ? {
            threadId: optionalString(
              conversation.threadId,
              "conversation.threadId",
            ),
          }
        : {}),
    },
    actor: {
      id: requiredString(actor.id, "actor.id"),
      ...(optionalString(actor.displayName, "actor.displayName")
        ? {
            displayName: optionalString(
              actor.displayName,
              "actor.displayName",
            ),
          }
        : {}),
      role: parseActorRole(actor.role),
    },
    content: parseContent(record.content),
    intent: parseIntent(record.intent),
    correlation: parseCorrelation(record.correlation),
    meta: parseMeta(record.meta),
  };
}

function parseContent(value: unknown): OpenJaneChatContentPart[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("OpenJaneChat: content is required");
  }

  return value.map((part, index) => {
    const record = requiredRecord(part, `content[${index}]`);
    const type = requiredString(record.type, `content[${index}].type`);
    if (type === "text") {
      return {
        type,
        text: requiredString(record.text, `content[${index}].text`),
      };
    }
    if (type === "audio" || type === "video") {
      return {
        type,
        ...optionalProp(record.mediaId, "mediaId"),
        ...optionalProp(record.mimeType, "mimeType"),
        ...optionalProp(record.url, "url"),
        ...optionalProp(record.transcript, "transcript"),
        ...optionalProp(record.caption, "caption"),
      };
    }
    throw new Error(`OpenJaneChat: unsupported content type ${type}`);
  });
}

function parseIntent(value: unknown): OpenJaneChatBridgeEvent["intent"] {
  if (value === undefined || value === null) return { kind: "chat" };
  const record = requiredRecord(value, "intent");
  return {
    kind: requiredString(record.kind, "intent.kind"),
    ...optionalProp(record.command, "command"),
    ...(typeof record.requiresApproval === "boolean"
      ? { requiresApproval: record.requiresApproval }
      : {}),
  };
}

function parseCorrelation(
  value: unknown,
): OpenJaneChatBridgeEvent["correlation"] {
  if (value === undefined || value === null) return {};
  const record = requiredRecord(value, "correlation");
  return {
    ...optionalProp(record.replyToEventId, "replyToEventId"),
    ...optionalProp(record.causationId, "causationId"),
  };
}

function parseMeta(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) return {};
  return requiredRecord(value, "meta");
}

function parseConversationType(
  value: unknown,
): OpenJaneChatBridgeEvent["conversation"]["type"] {
  if (value === "direct" || value === "group" || value === "channel") {
    return value;
  }
  throw new Error("OpenJaneChat: conversation.type is required");
}

function parseActorRole(value: unknown): OpenJaneChatBridgeEvent["actor"]["role"] {
  if (value === "human" || value === "agent" || value === "system") {
    return value;
  }
  throw new Error("OpenJaneChat: actor.role is required");
}

function requiredRecord(
  value: unknown,
  field: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`OpenJaneChat: ${field} is required`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`OpenJaneChat: ${field} is required`);
  }
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new Error(`OpenJaneChat: ${field} must be a string`);
  }
  return value || undefined;
}

function optionalProp<K extends string>(
  value: unknown,
  key: K,
): Partial<Record<K, string>> {
  const parsed = optionalString(value, key);
  return parsed ? { [key]: parsed } as Partial<Record<K, string>> : {};
}

function getHeader(headers: HeaderMap | undefined, name: string): string | null {
  if (!headers) return null;
  const valueFromGetter = headers.get?.(name);
  if (valueFromGetter) return valueFromGetter;

  const directValue = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(directValue)) return String(directValue[0] ?? "");
  return typeof directValue === "string" ? directValue : null;
}

function writeAcceptedResponse(
  res: HttpResponseLike,
  eventId: string,
  responseMode: "json" | "text",
): void {
  if (responseMode === "text") {
    writeText(res, 200, "ok");
    return;
  }

  const ack: OpenJaneChatEventAck = {
    ok: true,
    eventId,
    acceptedAt: new Date().toISOString(),
    status: "accepted",
  };
  res.statusCode = 200;
  res.setHeader?.("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(ack));
}

function writeErrorResponse(
  res: HttpResponseLike,
  statusCode: number,
  body: string,
  responseMode: "json" | "text",
): void {
  if (responseMode === "text") {
    writeText(res, statusCode, body);
    return;
  }
  res.statusCode = statusCode;
  res.setHeader?.("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: body }));
}

function writeText(
  res: HttpResponseLike,
  statusCode: number,
  body: string,
): void {
  res.statusCode = statusCode;
  res.setHeader?.("content-type", "text/plain; charset=utf-8");
  res.end(body);
}

function generateEventId(): string {
  return `evt_${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}
