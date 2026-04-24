import {
  createChatChannelPlugin,
  createChannelPluginBase,
} from "openclaw/plugin-sdk/channel-core";
import type { OpenClawConfig } from "openclaw/plugin-sdk/channel-core";
import { createOpenJaneChatApi } from "./client.js";
import { OPENJANECHAT_CHANNEL_ID } from "./runtime.js";

export type ResolvedAccount = {
  accountId: string | null;
  token: string;
  baseUrl: string;
  allowFrom: string[];
  dmPolicy: string | undefined;
};

function resolveAccount(
  cfg: OpenClawConfig,
  accountId?: string | null,
): ResolvedAccount {
  const section = (cfg.channels as Record<string, any>)?.[
    OPENJANECHAT_CHANNEL_ID
  ];
  const token = section?.token;
  const baseUrl = section?.baseUrl;
  if (!token) throw new Error("OpenJaneChat: token is required");
  if (!baseUrl) throw new Error("OpenJaneChat: baseUrl is required");
  return {
    accountId: accountId ?? null,
    token,
    baseUrl,
    allowFrom: section?.allowFrom ?? [],
    dmPolicy: section?.dmSecurity,
  };
}

function inspectAccount(cfg: OpenClawConfig, accountId?: string | null) {
  const section = (cfg.channels as Record<string, any>)?.[
    OPENJANECHAT_CHANNEL_ID
  ];
  return {
    enabled: Boolean(section?.token && section?.baseUrl),
    configured: Boolean(section?.token && section?.baseUrl),
    tokenStatus: section?.token ? "available" : "missing",
    baseUrlStatus: section?.baseUrl ? "available" : "missing",
    accountId: accountId ?? null,
  };
}

function createApiForAccount(account: ResolvedAccount) {
  return createOpenJaneChatApi({
    baseUrl: account.baseUrl,
    token: account.token,
  });
}

function applyAccountConfig(params: {
  cfg: OpenClawConfig;
  accountId: string;
  input: Record<string, unknown>;
}): OpenClawConfig {
  const input = params.input;
  const previousChannels = (params.cfg.channels ?? {}) as Record<string, any>;
  const previousSection = previousChannels[OPENJANECHAT_CHANNEL_ID] ?? {};
  const nextSection = {
    ...previousSection,
    ...(typeof input.token === "string" ? { token: input.token } : {}),
    ...(typeof input.baseUrl === "string" ? { baseUrl: input.baseUrl } : {}),
    ...(Array.isArray(input.allowFrom) ? { allowFrom: input.allowFrom } : {}),
  };

  return {
    ...params.cfg,
    channels: {
      ...previousChannels,
      [OPENJANECHAT_CHANNEL_ID]: nextSection,
    },
  } as OpenClawConfig;
}

const openJaneChatConfig = {
  listAccountIds(cfg: OpenClawConfig): string[] {
    const section = (cfg.channels as Record<string, any> | undefined)?.[
      OPENJANECHAT_CHANNEL_ID
    ];
    return section?.token || section?.baseUrl ? ["default"] : [];
  },
  resolveAccount,
  inspectAccount,
  isConfigured: (account: ResolvedAccount) =>
    Boolean(account.token && account.baseUrl),
  isEnabled: (account: ResolvedAccount) =>
    Boolean(account.token && account.baseUrl),
  resolveAllowFrom: ({ cfg, accountId }: any) =>
    resolveAccount(cfg, accountId).allowFrom,
};

const openJaneChatSetup = {
  resolveAccountId: () => "default",
  applyAccountConfig,
  validateInput: ({ input }: any) => {
    if (input.token !== undefined && typeof input.token !== "string") {
      return "OpenJaneChat token must be a string";
    }
    if (input.baseUrl !== undefined && typeof input.baseUrl !== "string") {
      return "OpenJaneChat baseUrl must be a string";
    }
    return null;
  },
};

export const OpenJaneChatPlugin = createChatChannelPlugin<ResolvedAccount>({
  base: {
    ...createChannelPluginBase({
      id: OPENJANECHAT_CHANNEL_ID,
      capabilities: {
        chatTypes: ["direct", "group", "channel"],
        media: false,
        reply: true,
      },
      config: openJaneChatConfig,
      setup: openJaneChatSetup,
    }),
    capabilities: {
      chatTypes: ["direct", "group", "channel"],
      media: false,
      reply: true,
    },
    config: openJaneChatConfig,
  },

  // DM security: who can message the bot
  security: {
    dm: {
      channelKey: OPENJANECHAT_CHANNEL_ID,
      resolvePolicy: (account) => account.dmPolicy,
      resolveAllowFrom: (account) => account.allowFrom,
      defaultPolicy: "allowlist",
    },
  },

  // Pairing: approval flow for new DM contacts
  pairing: {
    text: {
      idLabel: "JetsenLab LoginID",
      message: "Send this code to verify your identity:",
      notify: async (params) => {
        const account = resolveAccount(params.cfg, params.accountId);
        const api = createApiForAccount(account);
        await api.sendDm(params.id, params.message);
      },
    },
  },

  // Threading: how replies are delivered
  threading: { topLevelReplyToMode: "reply" },

  // Outbound: send messages to the platform
  outbound: {
    attachedResults: {
      channel: OPENJANECHAT_CHANNEL_ID,
      sendText: async (params) => {
        const account = resolveAccount(params.cfg, params.accountId);
        const api = createApiForAccount(account);
        const result = await api.sendMessage({
          to: params.to,
          text: params.text,
          replyToId: params.replyToId,
          threadId: params.threadId,
        });
        return { messageId: result.id };
      },
      sendMedia: async (params) => {
        const account = resolveAccount(params.cfg, params.accountId);
        const api = createApiForAccount(account);
        await api.sendFile(params.to, params.mediaUrl ?? "");
        return { messageId: "" };
      },
    },
    base: {
      deliveryMode: "direct" as const,
    },
  },
});
