import os from "os";

let lastIdle = 0;
let lastTotal = 0;

export function getCpuUsage() {
  const cpus = os.cpus();

  let idle = 0;
  let total = 0;

  cpus.forEach((core) => {
    Object.values(core.times).forEach((value) => {
      total += value;
    });

    idle += core.times.idle;
  });

  const idleDiff = idle - lastIdle;
  const totalDiff = total - lastTotal;

  lastIdle = idle;
  lastTotal = total;

  if (totalDiff <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(100 - (idleDiff / totalDiff) * 100)));
}

export function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    total,
    free,
    used,
    usage: Math.round((used / total) * 100)
  };
}

export function getLoadAverage() {
  const [load1, load5, load15] = os.loadavg();
  return { load1, load5, load15 };
}

export function getSystemSnapshot() {
  return {
    cpuUsage: getCpuUsage(),
    memory: getMemoryUsage(),
    load: getLoadAverage()
  };
}
