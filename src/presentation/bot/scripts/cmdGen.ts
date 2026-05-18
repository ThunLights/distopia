import fs from "fs/promises";
import path from "path";

const __dirname = import.meta.dirname;
const interactionCreateHandlerDir = path.join(
  __dirname,
  "../src/EventHandler/InteractionCreateHandler",
);
const dirs = [
  "ChatInputCommand",
  "Button",
  "Modal",
  "UserSelectMenu",
  "RoleSelectMenu",
  "StringSelectMenu",
];
const outputDirPath = path.join(__dirname, "../src/EventHandler/InteractionCreateHandler");

for (const dir of dirs) {
  const outputFilePath = path.join(outputDirPath, `${dir}s.auto.ts`);

  const commandDir = path.join(interactionCreateHandlerDir, dir);

  const commands = [];

  for (const fileName of await fs.readdir(commandDir)) {
    const filePath = path.join(commandDir, fileName);
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
        .map((command) => `import { ${command} } from "./${dir}/${command}";`),
      `export const commands = [${commands.map((command) => path.basename(command, ".ts")).join(", ")}];`,
    ].join("\n"),
  );
}
