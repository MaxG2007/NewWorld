/**
 * Test Runner - единая точка запуска всех тестов
 * Собирает результаты unit и simulation тестов
 */

import { TestResult, TestSuite, TestRunnerConfig } from './types/TestTypes';

// Unit tests
import { DamageTest } from './unit/DamageTest';
import { RNGTest } from './unit/RNGTest';
import { PathfindingTest } from './unit/PathfindingTest';
import { EconomyTest } from './unit/EconomyTest';
import { AgeTest } from './unit/AgeTest';
import { GenealogyTest } from './unit/GenealogyTest';
import { CraftingTest } from './unit/CraftingTest';
import { RumorsTest } from './unit/RumorsTest';
import { LawTest } from './unit/LawTest';
import { SaveLoadTest } from './unit/SaveLoadTest';

// Simulation tests
import { WorldSimulationTest } from './simulation/WorldSimulationTest';

export class TestRunner {
  private config: TestRunnerConfig;
  private allSuites: TestSuite[] = [];

  constructor(config?: Partial<TestRunnerConfig>) {
    this.config = {
      stopOnFirstFailure: false,
      verbose: true,
      categories: ['damage', 'RNG', 'pathfinding', 'economy', 'age', 'genealogy', 'crafting', 'rumors', 'law', 'saveLoad', 'simulation'],
      ...config
    };
  }

  runAll(): void {
    console.log('='.repeat(60));
    console.log('STARTING TEST RUNNER');
    console.log('='.repeat(60));
    console.log();

    const startTime = Date.now();

    // Запуск unit тестов
    if (this.config.categories.includes('damage')) {
      this.runSuite(new DamageTest().runAll());
    }
    if (this.config.categories.includes('RNG')) {
      this.runSuite(new RNGTest().runAll());
    }
    if (this.config.categories.includes('pathfinding')) {
      this.runSuite(new PathfindingTest().runAll());
    }
    if (this.config.categories.includes('economy')) {
      this.runSuite(new EconomyTest().runAll());
    }
    if (this.config.categories.includes('age')) {
      this.runSuite(new AgeTest().runAll());
    }
    if (this.config.categories.includes('genealogy')) {
      this.runSuite(new GenealogyTest().runAll());
    }
    if (this.config.categories.includes('crafting')) {
      this.runSuite(new CraftingTest().runAll());
    }
    if (this.config.categories.includes('rumors')) {
      this.runSuite(new RumorsTest().runAll());
    }
    if (this.config.categories.includes('law')) {
      this.runSuite(new LawTest().runAll());
    }
    if (this.config.categories.includes('saveLoad')) {
      this.runSuite(new SaveLoadTest().runAll());
    }

    // Запуск simulation тестов
    if (this.config.categories.includes('simulation')) {
      this.runSuite(new WorldSimulationTest().runAll());
    }

    const totalTime = Date.now() - startTime;

    // Вывод итогов
    this.printSummary(totalTime);
  }

  private runSuite(suite: TestSuite): void {
    this.allSuites.push(suite);

    if (this.config.verbose) {
      console.log(`\n[${suite.name}]`);
      console.log('-'.repeat(40));
      
      for (const test of suite.tests) {
        const status = test.passed ? '✓' : '✗';
        console.log(`  ${status} ${test.name} (${test.duration}ms)`);
        
        if (!test.passed && test.error) {
          console.log(`    Error: ${test.error}`);
          
          if (this.config.stopOnFirstFailure) {
            return;
          }
        }
      }
      
      console.log();
    }
  }

  private printSummary(totalTime: number): void {
    console.log('='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of this.allSuites) {
      totalTests += suite.tests.length;
      totalPassed += suite.passedCount;
      totalFailed += suite.failedCount;
      
      const passRate = suite.tests.length > 0 
        ? ((suite.passedCount / suite.tests.length) * 100).toFixed(1)
        : 0;
      
      console.log(`${suite.name}: ${suite.passedCount}/${suite.tests.length} passed (${passRate}%)`);
    }

    console.log();
    console.log('-'.repeat(40));
    console.log(`Total: ${totalPassed}/${totalTests} tests passed`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Total time: ${totalTime}ms`);
    console.log();

    if (totalFailed === 0) {
      console.log('✓ All tests passed!');
    } else {
      console.log(`✗ ${totalFailed} test(s) failed`);
    }
    console.log('='.repeat(60));
  }

  getResults(): { suites: TestSuite[]; totalPassed: number; totalFailed: number } {
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of this.allSuites) {
      totalPassed += suite.passedCount;
      totalFailed += suite.failedCount;
    }

    return {
      suites: this.allSuites,
      totalPassed,
      totalFailed
    };
  }
}

// Экспорт для использования в других модулях
export function runTests(config?: Partial<TestRunnerConfig>): void {
  const runner = new TestRunner(config);
  runner.runAll();
}

// Автозапуск при импорте в Node.js среде
if (typeof process !== 'undefined' && process.argv[1]?.includes('TestRunner')) {
  runTests({ verbose: true });
}
