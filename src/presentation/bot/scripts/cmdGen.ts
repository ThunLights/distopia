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
    ...commands
      .map((command) => path.basename(command, ".ts"))
      .map((command) => `import { ${command} } from "./ChatInputCommand/${command}";`),
    `export const commands = [${commands.map((command) => path.basename(command, ".ts")).join(", ")}];`,
  ].join("\n"),
);
