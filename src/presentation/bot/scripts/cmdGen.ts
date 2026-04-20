import fs from "fs/promises";
import path from "path";

const __dirname = import.meta.dirname;

const interactionCreateHandlerDir = path.join(
  __dirname,
  "../src/EventHandler/InteractionCreateHandler",
);
const outputFilePath = path.join(
  __dirname,
  "../src/EventHandler/InteractionCreateHandler/commands.auto.ts",
);

const chatInputCommandDir = path.join(interactionCreateHandlerDir, "./ChatInputCommand");

const commands = [];

for (const fileName of await fs.readdir(chatInputCommandDir)) {
  const filePath = path.join(chatInputCommandDir, fileName);
  if ((await fs.stat(filePath)).isDirectory()) {
    continue;
  }
  commands.push(fileName);
}

await fs.writeFile(
  outputFilePath,
  [
    'import type { Client } from "shared-lib/discord.js";',
    'import type { AppData } from "../../model.ts";',
    'import { ChatInputCommandBase } from "./Base/ChatInputCommandBase";',
    ...commands.map(
      (command) =>
        `import { ${path.basename(command, ".ts")} } from "./ChatInputCommand/${command}";`,
    ),
    "export function getCommands(client: Client, appData: AppData) {",
    `const commands: ChatInputCommandBase[] = [${commands.map((command) => `new ${path.basename(command, ".ts")}(client, appData)`).join(", ")}];`,
    "return commands",
    "};",
  ].join("\n"),
);
