const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(1).padStart(7);

export function getMemoryUsageSummary(): string {
  const { rss, heapUsed, heapTotal } = process.memoryUsage();
  return [`RSS : ${toMB(rss)} MB`, `Heap: ${toMB(heapUsed)} / ${toMB(heapTotal)} MB`].join("\n");
}
