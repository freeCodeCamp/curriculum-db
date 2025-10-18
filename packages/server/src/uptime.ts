// Uptime tracking
let startTime: number | null = null;

export function setStartTime(time: number): void {
  startTime = time;
}

export function getUptimeSeconds(): number {
  if (startTime === null) return 0;
  return Math.floor((Date.now() - startTime) / 1000);
}
