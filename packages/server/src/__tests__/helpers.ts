import type { ExecutionResult } from 'graphql';

/**
 * Assert that a GraphQL response is valid (no errors, has data)
 * Narrows TypeScript type to exclude errors after assertion
 */
export function expectValidGraphQLResponse<TData>(
  result: ExecutionResult<TData>
): asserts result is ExecutionResult<TData> & {
  data: TData;
  errors: undefined;
} {
  if (result.errors) {
    throw new Error(
      `Expected GraphQL response to have no errors, but found: ${JSON.stringify(result.errors, null, 2)}`
    );
  }
  if (result.data === undefined) {
    throw new Error(
      'Expected GraphQL response to have data, but data was undefined'
    );
  }
}

/**
 * Assert that a nullable GraphQL field behaves correctly
 * @param value - The field value to check
 * @param options - Assertion options
 * @throws Error if value is undefined or doesn't match expectations
 */
export function expectNullableField<T>(
  value: T | null | undefined,
  options?: { expectNull?: boolean }
): void {
  // GraphQL nullable fields should be null, never undefined
  if (value === undefined) {
    throw new Error('Expected nullable field to be null, not undefined');
  }

  if (options?.expectNull === true && value !== null) {
    throw new Error(
      `Expected nullable field to be null, but was: ${JSON.stringify(value)}`
    );
  }

  if (options?.expectNull === false && value === null) {
    throw new Error('Expected nullable field to have a value, but was null');
  }
}

/**
 * Performance measurement structure
 */
export interface PerformanceMeasurement {
  startupTimeMs?: number;
  memoryUsageMB?: number;
  queryLatencyMs?: number;
}

/**
 * Performance thresholds
 */
export interface PerformanceThresholds {
  startupTimeMs: number;
  memoryUsageMB: number;
  queryLatencyMs: number;
}

/**
 * Default performance thresholds from spec.md
 */
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  startupTimeMs: 1000, // <1 second
  memoryUsageMB: 50, // <50MB for metadata
  queryLatencyMs: 50, // <50ms per query
};

/**
 * Assert that performance measurements meet thresholds
 * @param measurement - Actual measured values
 * @param thresholds - Expected threshold values
 * @throws Error with detailed message if any threshold is exceeded
 */
export function expectPerformanceWithinThreshold(
  measurement: PerformanceMeasurement,
  thresholds: PerformanceThresholds = PERFORMANCE_THRESHOLDS
): void {
  const errors: string[] = [];

  if (measurement.startupTimeMs !== undefined) {
    if (measurement.startupTimeMs > thresholds.startupTimeMs) {
      errors.push(
        `Startup time ${measurement.startupTimeMs.toFixed(2)}ms exceeds threshold ${thresholds.startupTimeMs}ms`
      );
    }
  }

  if (measurement.memoryUsageMB !== undefined) {
    if (measurement.memoryUsageMB > thresholds.memoryUsageMB) {
      errors.push(
        `Memory usage ${measurement.memoryUsageMB.toFixed(2)}MB exceeds threshold ${thresholds.memoryUsageMB}MB`
      );
    }
  }

  if (measurement.queryLatencyMs !== undefined) {
    if (measurement.queryLatencyMs > thresholds.queryLatencyMs) {
      errors.push(
        `Query latency ${measurement.queryLatencyMs.toFixed(2)}ms exceeds threshold ${thresholds.queryLatencyMs}ms`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Performance thresholds exceeded:\n  - ${errors.join('\n  - ')}`
    );
  }
}

/**
 * Validate that all items in array are unique
 */
export function expectUniqueItems<T>(items: T[], message?: string): void {
  const seen = new Set<T>();
  const duplicates: T[] = [];

  for (const item of items) {
    if (seen.has(item)) {
      duplicates.push(item);
    }
    seen.add(item);
  }

  if (duplicates.length > 0) {
    throw new Error(
      message ||
        `Expected all items to be unique, but found duplicates: ${JSON.stringify(duplicates)}`
    );
  }
}
