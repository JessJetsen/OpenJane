import { defineChannelPluginEntry } from "openclaw/plugin-sdk/channel-core";
import { OpenJaneChatPlugin } from "./src/channel.js";
import { registerOpenJaneChatRoutes } from "./src/runtime.js";

export default defineChannelPluginEntry({
  id: "OpenJaneChat",
  name: "OpenJaneChat",
  description: "OpenJaneChat channel plugin",
  plugin: OpenJaneChatPlugin,
  registerCliMetadata(api) {
    api.registerCli(
      ({ program }) => {
        program
          .command("OpenJaneChat")
          .description("OpenJaneChat management");
      },
      {
        descriptors: [
          {
            name: "OpenJaneChat",
            description: "OpenJaneChat management",
            hasSubcommands: false,
          },
        ],
      },
    );
  },
  registerFull(api) {
    registerOpenJaneChatRoutes(api);
  },
});
