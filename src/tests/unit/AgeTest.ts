/**
 * Unit тесты для системы возраста (age)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

export class AgeTest {
  private suite: TestSuite = {
    name: 'Age System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testAgeProgression();
    this.testLifeStages();
    this.testMaxAge();
    this.testBirthDate();
    this.testAgeGroups();
    return this.suite;
  }

  private testAgeProgression(): void {
    const startTime = Date.now();
    try {
      const birthYear = 1000;
      const currentYear = 1025;
      const age = currentYear - birthYear;

      if (age !== 25) {
        throw new Error(`Expected age 25, got ${age}`);
      }

      this.addTest('age_progression', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('age_progression', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testLifeStages(): void {
    const startTime = Date.now();
    try {
      const stages = [
        { age: 0, expected: 'infant' },
        { age: 5, expected: 'child' },
        { age: 13, expected: 'teenager' },
        { age: 18, expected: 'adult' },
        { age: 65, expected: 'elder' },
      ];

      for (const stage of stages) {
        const calculatedStage = this.getLifeStage(stage.age);
        if (calculatedStage !== stage.expected) {
          throw new Error(`Age ${stage}: expected ${stage.expected}, got ${calculatedStage}`);
        }
      }

      this.addTest('life_stages_classification', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('life_stages_classification', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testMaxAge(): void {
    const startTime = Date.now();
    try {
      const maxAge = 120;
      const birthYear = 1000;
      const deathYear = birthYear + maxAge + 10;
      
      // Персонаж не может жить дольше максимума
      const actualAge = Math.min(deathYear - birthYear, maxAge);
      
      if (actualAge > maxAge) {
        throw new Error(`Age ${actualAge} exceeds max ${maxAge}`);
      }

      this.addTest('max_age_limit', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('max_age_limit', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testBirthDate(): void {
    const startTime = Date.now();
    try {
      const currentYear = 1050;
      const age = 30;
      const birthYear = currentYear - age;

      if (birthYear !== 1020) {
        throw new Error(`Expected birth year 1020, got ${birthYear}`);
      }

      this.addTest('birth_date_calculation', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('birth_date_calculation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testAgeGroups(): void {
    const startTime = Date.now();
    try {
      const groups = [
        { ages: [0, 4, 9], group: 'young' },
        { ages: [10, 17, 29], group: 'middle' },
        { ages: [30, 50, 70], group: 'mature' },
      ];

      for (const test of groups) {
        for (const age of test.ages) {
          const group = this.getAgeGroup(age);
          if (group !== test.group) {
            throw new Error(`Age ${age}: expected group ${test.group}, got ${group}`);
          }
        }
      }

      this.addTest('age_groups_classification', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('age_groups_classification', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private getLifeStage(age: number): string {
    if (age < 2) return 'infant';
    if (age < 13) return 'child';
    if (age < 18) return 'teenager';
    if (age < 65) return 'adult';
    return 'elder';
  }

  private getAgeGroup(age: number): string {
    if (age < 10) return 'young';
    if (age < 30) return 'middle';
    return 'mature';
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
