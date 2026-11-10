// Collects every src/application/feature/* package into one registry per layer
// (src/<layer>.auto.ts), from whichever of them exports "./<layer>". Also keeps this
// package's own `dependencies` in sync with that folder, so every feature it imports is a
// declared dependency -- if that list changes, run `bun install` to link the new ones.
import fs from "fs/promises";
import path from "path";

const layers = {
  bot: { typeModule: "presentation-bot-kit/feature", typeName: "BotFeature" },
  schedule: { typeModule: "app-schedule/feature", typeName: "ScheduleFeature" },
};

const root = path.join(import.meta.dirname, "..");
const featureDir = path.join(root, "../feature");

type FeaturePackage = { name: string; exports?: Record<string, unknown> };

const features: FeaturePackage[] = [];
for (const dir of (await fs.readdir(featureDir)).toSorted()) {
  const pkg = await fs
    .readFile(path.join(featureDir, dir, "package.json"), "utf8")
    .then((text): FeaturePackage => JSON.parse(text))
    .catch(() => null);
  if (pkg) {
    features.push(pkg);
  }
}

const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
const deps: Record<string, string> = Object.fromEntries(
  Object.entries<string>(pkg.dependencies ?? {}).filter(([name]) => !name.startsWith("feature-")),
);
for (const { name } of features) {
  deps[name] = "workspace:*";
}
const sortedDeps = Object.fromEntries(
  Object.entries(deps).toSorted(([a], [b]) => a.localeCompare(b)),
);
if (JSON.stringify(sortedDeps) !== JSON.stringify(pkg.dependencies)) {
  pkg.dependencies = sortedDeps;
  await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.warn("[app-feature-loader] feature dependencies changed; run `bun install`.");
}

await fs.mkdir(path.join(root, "src"), { recursive: true });
for (const [layer, { typeModule, typeName }] of Object.entries(layers)) {
  const entries = features
    .filter(({ exports }) => exports?.[`./${layer}`])
    .map(({ name }) => ({
      name,
      id: name.replace(/^feature-/, "").replace(/-(.)/g, (_, c: string) => c.toUpperCase()),
    }));

  await fs.writeFile(
    path.join(root, "src", `${layer}.auto.ts`),
    [
      `import type { ${typeName} } from "${typeModule}";`,
      ...entries.map(({ name, id }) => `import ${id} from "${name}/${layer}";`),
      `export const features: ${typeName}[] = [${entries.map(({ id }) => id).join(", ")}];`,
      "",
    ].join("\n"),
  );
}
