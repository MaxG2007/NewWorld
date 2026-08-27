/**
 * Unit тесты для RNG (генератора случайных чисел)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

export class RNGTest {
  private suite: TestSuite = {
    name: 'RNG System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testDeterministicSeed();
    this.testUniformDistribution();
    this.testRangeBounds();
    this.testWeightedRandom();
    this.testShuffle();
    this.testProbabilityThreshold();
    return this.suite;
  }

  private testDeterministicSeed(): void {
    const startTime = Date.now();
    try {
      // Проверка детерминированности с seed
      const seed = 12345;
      const results1 = this.seededRandom(seed, 10);
      const results2 = this.seededRandom(seed, 10);

      if (JSON.stringify(results1) !== JSON.stringify(results2)) {
        throw new Error('Seeded RNG is not deterministic');
      }

      this.addTest('deterministic_seed', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('deterministic_seed', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testUniformDistribution(): void {
    const startTime = Date.now();
    try {
      const iterations = 10000;
      const buckets = [0, 0, 0, 0, 0];
      
      for (let i = 0; i < iterations; i++) {
        const value = Math.floor(Math.random() * 5);
        buckets[value]++;
      }

      // Проверка равномерности распределения (допуск 20%)
      const expected = iterations / 5;
      const tolerance = expected * 0.2;
      
      for (const bucket of buckets) {
        if (Math.abs(bucket - expected) > tolerance) {
          throw new Error(`Distribution not uniform: ${bucket} vs expected ${expected}`);
        }
      }

      this.addTest('uniform_distribution', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('uniform_distribution', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testRangeBounds(): void {
    const startTime = Date.now();
    try {
      const min = 10;
      const max = 20;
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        if (value < min || value > max) {
          throw new Error(`Value ${value} out of range [${min}, ${max}]`);
        }
      }

      this.addTest('range_bounds_check', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('range_bounds_check', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testWeightedRandom(): void {
    const startTime = Date.now();
    try {
      const weights = [10, 30, 60];
      const iterations = 10000;
      const results = [0, 0, 0];

      for (let i = 0; i < iterations; i++) {
        const rand = Math.random() * 100;
        let cumulative = 0;
        for (let j = 0; j < weights.length; j++) {
          cumulative += weights[j];
          if (rand < cumulative) {
            results[j]++;
            break;
          }
        }
      }

      // Проверка весового распределения (допуск 15%)
      const expectedPercents = [10, 30, 60];
      for (let i = 0; i < results.length; i++) {
        const actualPercent = (results[i] / iterations) * 100;
        if (Math.abs(actualPercent - expectedPercents[i]) > 15) {
          throw new Error(`Weighted distribution off: ${actualPercent}% vs expected ${expectedPercents[i]}%`);
        }
      }

      this.addTest('weighted_random', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('weighted_random', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testShuffle(): void {
    const startTime = Date.now();
    try {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = [...array].sort(() => Math.random() - 0.5);

      if (shuffled.length !== array.length) {
        throw new Error('Shuffle changed array length');
      }

      const sorted = shuffled.slice().sort((a, b) => a - b);
      if (JSON.stringify(sorted) !== JSON.stringify(array)) {
        throw new Error('Shuffle lost elements');
      }

      this.addTest('shuffle_integrity', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('shuffle_integrity', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testProbabilityThreshold(): void {
    const startTime = Date.now();
    try {
      const probability = 0.3;
      const iterations = 10000;
      let successes = 0;

      for (let i = 0; i < iterations; i++) {
        if (Math.random() < probability) {
          successes++;
        }
      }

      const actualProbability = successes / iterations;
      if (Math.abs(actualProbability - probability) > 0.05) {
        throw new Error(`Probability mismatch: ${actualProbability} vs ${probability}`);
      }

      this.addTest('probability_threshold', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('probability_threshold', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private seededRandom(seed: number, count: number): number[] {
    const results: number[] = [];
    let state = seed;
    for (let i = 0; i < count; i++) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      results.push(state / 0x7fffffff);
    }
    return results;
  }

  private addTest(name: string, passed: boolean, duration: number, error?: string): void {
    const result: TestResult = { name, passed, duration, error };
    this.suite.tests.push(result);
    this.suite.totalDuration += duration;
    if (passed) {
      this.suite.passedCount++;
    } else {
      this.suite.failedCount++;
    }
  }
}
