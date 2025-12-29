// =============================================================================
// SEEDED RANDOM UTILITIES
// =============================================================================
// Provides deterministic random number generation for reproducible demo data.
// Uses a seeded PRNG (Mulberry32) for consistent results across runs.
// =============================================================================

/**
 * Random number generator function type
 * Returns a number between 0 (inclusive) and 1 (exclusive)
 */
export type RandomFn = () => number;

/**
 * Creates a seeded random number generator using the Mulberry32 algorithm.
 * This allows for reproducible random sequences - same seed = same sequence.
 *
 * @param seed - The seed value for the random number generator
 * @returns A function that returns random numbers between 0 and 1
 */
export function createSeededRandom(seed: number): RandomFn {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @param random - Random function to use
 * @returns Random number in range [min, max)
 */
export function randomBetween(min: number, max: number, random: RandomFn): number {
  return min + random() * (max - min);
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param random - Random function to use
 * @returns Random integer in range [min, max]
 */
export function randomInt(min: number, max: number, random: RandomFn): number {
  return Math.floor(randomBetween(min, max + 1, random));
}

/**
 * Picks a random element from an array
 *
 * @param array - Array to pick from
 * @param random - Random function to use
 * @returns Random element from the array
 */
export function randomChoice<T>(array: readonly T[], random: RandomFn): T {
  const index = Math.floor(random() * array.length);
  return array[index];
}

/**
 * Picks multiple unique random elements from an array
 *
 * @param array - Array to pick from
 * @param count - Number of elements to pick
 * @param random - Random function to use
 * @returns Array of unique random elements
 */
export function randomSample<T>(array: readonly T[], count: number, random: RandomFn): T[] {
  const shuffled = [...array];
  const result: T[] = [];

  const n = Math.min(count, array.length);
  for (let i = 0; i < n; i++) {
    const j = Math.floor(random() * (shuffled.length - i)) + i;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    result.push(shuffled[i]);
  }

  return result;
}

/**
 * Option with a weight for weighted random selection
 */
export interface WeightedOption<T> {
  value: T;
  weight: number;
}

/**
 * Picks a random element from weighted options
 * Higher weight = higher probability of selection
 *
 * @param options - Array of weighted options
 * @param random - Random function to use
 * @returns The selected value
 */
export function weightedChoice<T>(options: readonly WeightedOption<T>[], random: RandomFn): T {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let remaining = random() * totalWeight;

  for (const option of options) {
    remaining -= option.weight;
    if (remaining <= 0) {
      return option.value;
    }
  }

  // Fallback to last option (shouldn't happen with valid weights)
  return options[options.length - 1].value;
}

/**
 * Generates a random number from a normal (Gaussian) distribution
 * Uses the Box-Muller transform
 *
 * @param mean - Mean of the distribution
 * @param stdDev - Standard deviation of the distribution
 * @param random - Random function to use
 * @returns Random number from the normal distribution
 */
export function gaussianRandom(mean: number, stdDev: number, random: RandomFn): number {
  // Box-Muller transform
  const u1 = random();
  const u2 = random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Clamps a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generates a random number from a normal distribution, clamped to a range
 * Useful for metrics that should be within certain bounds
 *
 * @param mean - Mean of the distribution
 * @param stdDev - Standard deviation
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param random - Random function to use
 * @returns Random number from clamped normal distribution
 */
export function clampedGaussian(
  mean: number,
  stdDev: number,
  min: number,
  max: number,
  random: RandomFn
): number {
  return clamp(gaussianRandom(mean, stdDev, random), min, max);
}

/**
 * Returns true with the given probability
 *
 * @param probability - Probability of returning true (0-1)
 * @param random - Random function to use
 * @returns Boolean result
 */
export function chance(probability: number, random: RandomFn): boolean {
  return random() < probability;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 *
 * @param array - Array to shuffle
 * @param random - Random function to use
 * @returns The shuffled array (same reference)
 */
export function shuffle<T>(array: T[], random: RandomFn): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates a random hex string of specified length
 * Useful for generating unique IDs
 *
 * @param length - Length of hex string to generate
 * @param random - Random function to use
 * @returns Random hex string
 */
export function randomHex(length: number, random: RandomFn): string {
  let result = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(random() * 16)];
  }
  return result;
}

/**
 * Generates a random UUID-like string
 *
 * @param random - Random function to use
 * @returns UUID-like string
 */
export function randomUUID(random: RandomFn): string {
  return `${randomHex(8, random)}-${randomHex(4, random)}-${randomHex(4, random)}-${randomHex(4, random)}-${randomHex(12, random)}`;
}

/**
 * Applies random variation to a base value
 *
 * @param base - Base value
 * @param variationPercent - Maximum variation as a percentage (0-1)
 * @param random - Random function to use
 * @returns Value with random variation applied
 */
export function varyValue(base: number, variationPercent: number, random: RandomFn): number {
  const variation = base * variationPercent;
  return base + randomBetween(-variation, variation, random);
}

/**
 * Creates a random generator with a default seed based on current timestamp
 * Useful for development when you don't need reproducibility
 *
 * @returns Random function
 */
export function createDefaultRandom(): RandomFn {
  return createSeededRandom(Date.now());
}
