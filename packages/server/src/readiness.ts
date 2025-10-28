// Readiness state tracking
let ready = false;

export function setReady(state: boolean): void {
  ready = state;
}

export function isReady(): boolean {
  return ready;
}
