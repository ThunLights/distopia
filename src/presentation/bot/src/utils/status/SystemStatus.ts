import os from "node:os";

const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(1).padStart(7);
const toPercent = (used: number, total: number) => ((used / total) * 100).toFixed(1);

// Bundles the bot process's own health metrics (used by /owner status) behind one
// namespace, instead of scattering each metric across its own single-function file.
export class SystemStatus {
  // process.cpuUsage() alone only reports cumulative CPU time since process start, not a
  // live rate -- sample it across a short interval to get an actual instantaneous percentage
  // (of a single core; can exceed 100% on multi-core work).
  public static async getCpuUsagePercent(sampleMs = 200): Promise<string> {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime.bigint();

    await new Promise((resolve) => setTimeout(resolve, sampleMs));

    const { user, system } = process.cpuUsage(startUsage);
    const elapsedUs = Number(process.hrtime.bigint() - startTime) / 1000;

    return (((user + system) / elapsedUs) * 100).toFixed(1);
  }

  public static getMemoryUsageSummary(): string {
    const { rss, heapUsed, heapTotal } = process.memoryUsage();
    const rssPercent = toPercent(rss, os.totalmem());
    const heapPercent = toPercent(heapUsed, heapTotal);

    return [
      `RSS : ${toMB(rss)} MB (${rssPercent}%)`,
      `Heap: ${toMB(heapUsed)} / ${toMB(heapTotal)} MB (${heapPercent}%)`,
    ].join("\n");
  }

  // Baked in at image-build time (docker/dockerfile.prod's GIT_SHA build arg, set by the
  // Argo Workflow's build-push step) -- "unknown" for local dev, since there's no build
  // pipeline setting it there.
  public static getDeployedCommitHash(): string {
    return process.env.GIT_SHA ?? "unknown";
  }
}
