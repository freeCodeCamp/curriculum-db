import { describe, it, expect } from 'vitest';
import { setStartTime, getUptimeSeconds } from '../uptime.js';

describe('Uptime Tracking', () => {
  describe('getUptimeSeconds()', () => {
    it('should return 0 when start time is not set', () => {
      // Get uptime before setting start time
      const uptime = getUptimeSeconds();
      expect(uptime).toBe(0);
    });

    it('should return uptime in seconds after start time is set', () => {
      const now = Date.now();
      setStartTime(now);

      // Small delay to ensure some time passes
      const uptime = getUptimeSeconds();
      expect(uptime).toBeGreaterThanOrEqual(0);
      expect(typeof uptime).toBe('number');
    });

    it('should calculate correct uptime', () => {
      const fiveSecondsAgo = Date.now() - 5000;
      setStartTime(fiveSecondsAgo);

      const uptime = getUptimeSeconds();
      expect(uptime).toBeGreaterThanOrEqual(5);
      expect(uptime).toBeLessThan(10); // Should be close to 5 seconds
    });

    it('should return integer seconds', () => {
      const now = Date.now();
      setStartTime(now - 1500); // 1.5 seconds ago

      const uptime = getUptimeSeconds();
      expect(Number.isInteger(uptime)).toBe(true);
      expect(uptime).toBeGreaterThanOrEqual(1);
      expect(uptime).toBeLessThanOrEqual(2);
    });

    it('should handle multiple calls correctly', () => {
      const startTime = Date.now() - 3000;
      setStartTime(startTime);

      const uptime1 = getUptimeSeconds();
      const uptime2 = getUptimeSeconds();

      expect(uptime1).toBeGreaterThanOrEqual(3);
      expect(uptime2).toBeGreaterThanOrEqual(uptime1);
    });
  });

  describe('setStartTime()', () => {
    it('should set start time successfully', () => {
      const now = Date.now();
      setStartTime(now);

      const uptime = getUptimeSeconds();
      expect(uptime).toBeGreaterThanOrEqual(0);
    });

    it('should allow updating start time', () => {
      const tenSecondsAgo = Date.now() - 10000;
      setStartTime(tenSecondsAgo);

      let uptime = getUptimeSeconds();
      expect(uptime).toBeGreaterThanOrEqual(10);

      // Reset to now
      const now = Date.now();
      setStartTime(now);

      uptime = getUptimeSeconds();
      expect(uptime).toBeLessThan(1);
    });

    it('should handle precise timestamps', () => {
      const preciseTime = 1609459200000; // 2021-01-01 00:00:00 UTC
      setStartTime(preciseTime);

      const uptime = getUptimeSeconds();
      // Should be many years of uptime in seconds
      expect(uptime).toBeGreaterThan(100000000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle start time equal to current time', () => {
      const now = Date.now();
      setStartTime(now);

      const uptime = getUptimeSeconds();
      expect(uptime).toBe(0);
    });

    it('should handle very recent start time', () => {
      const almostNow = Date.now() - 100; // 100ms ago
      setStartTime(almostNow);

      const uptime = getUptimeSeconds();
      expect(uptime).toBe(0); // Should floor to 0 seconds
    });

    it('should handle very old start time', () => {
      const veryOld = Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
      setStartTime(veryOld);

      const uptime = getUptimeSeconds();
      expect(uptime).toBeGreaterThan(31000000); // ~1 year in seconds
    });
  });
});
