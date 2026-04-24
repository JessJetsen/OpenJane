import { defineSetupPluginEntry } from "openclaw/plugin-sdk/channel-core";
import { OpenJaneChatPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(OpenJaneChatPlugin);