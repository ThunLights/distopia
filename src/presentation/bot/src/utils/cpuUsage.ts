// process.cpuUsage() alone only reports cumulative CPU time since process start, not a
// live rate -- sample it across a short interval to get an actual instantaneous percentage
// (of a single core; can exceed 100% on multi-core work).
export async function getCpuUsagePercent(sampleMs = 200): Promise<string> {
  const startUsage = process.cpuUsage();
  const startTime = process.hrtime.bigint();

  await new Promise((resolve) => setTimeout(resolve, sampleMs));

  const { user, system } = process.cpuUsage(startUsage);
  const elapsedUs = Number(process.hrtime.bigint() - startTime) / 1000;

  return (((user + system) / elapsedUs) * 100).toFixed(1);
}
