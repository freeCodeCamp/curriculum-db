import { describe, it, expect, beforeEach } from 'vitest';
import { setReady, isReady } from '../readiness.js';

describe('Readiness State Tracking', () => {
  beforeEach(() => {
    // Reset to default state
    setReady(false);
  });

  describe('isReady()', () => {
    it('should return false when readiness is not set', () => {
      const ready = isReady();
      expect(ready).toBe(false);
    });

    it('should return true after readiness is set to true', () => {
      setReady(true);
      const ready = isReady();
      expect(ready).toBe(true);
    });

    it('should return false after readiness is set to false', () => {
      setReady(false);
      const ready = isReady();
      expect(ready).toBe(false);
    });

    it('should handle multiple calls correctly', () => {
      setReady(true);
      expect(isReady()).toBe(true);
      expect(isReady()).toBe(true);
      expect(isReady()).toBe(true);
    });
  });

  describe('setReady()', () => {
    it('should set readiness to true', () => {
      setReady(true);
      expect(isReady()).toBe(true);
    });

    it('should set readiness to false', () => {
      setReady(false);
      expect(isReady()).toBe(false);
    });

    it('should allow toggling readiness state', () => {
      setReady(true);
      expect(isReady()).toBe(true);

      setReady(false);
      expect(isReady()).toBe(false);

      setReady(true);
      expect(isReady()).toBe(true);
    });

    it('should handle setting same state multiple times', () => {
      setReady(true);
      setReady(true);
      setReady(true);
      expect(isReady()).toBe(true);

      setReady(false);
      setReady(false);
      expect(isReady()).toBe(false);
    });
  });

  describe('State Transitions', () => {
    it('should transition from false to true', () => {
      expect(isReady()).toBe(false);
      setReady(true);
      expect(isReady()).toBe(true);
    });

    it('should transition from true to false', () => {
      setReady(true);
      expect(isReady()).toBe(true);
      setReady(false);
      expect(isReady()).toBe(false);
    });

    it('should maintain state between checks', () => {
      setReady(true);
      expect(isReady()).toBe(true);

      // Simulate time passing
      expect(isReady()).toBe(true);
      expect(isReady()).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should simulate server initialization flow', () => {
      // Before data loading
      expect(isReady()).toBe(false);

      // Data loading happens...
      // After successful data load
      setReady(true);
      expect(isReady()).toBe(true);
    });

    it('should simulate server shutdown flow', () => {
      // Server running
      setReady(true);
      expect(isReady()).toBe(true);

      // Server shutting down
      setReady(false);
      expect(isReady()).toBe(false);
    });

    it('should handle data reload scenario', () => {
      // Initial load
      setReady(true);
      expect(isReady()).toBe(true);

      // Start reload (mark not ready)
      setReady(false);
      expect(isReady()).toBe(false);

      // Reload complete
      setReady(true);
      expect(isReady()).toBe(true);
    });
  });
});
