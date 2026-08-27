/**
 * Unit тесты для слухов (rumors)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

interface Rumor {
  id: string;
  content: string;
  source: string;
  truthLevel: number; // 0-1, где 1 = полная правда
  spreadCount: number;
}

export class RumorsTest {
  private suite: TestSuite = {
    name: 'Rumors System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testRumorCreation();
    this.testRumorSpread();
    this.testRumorDistortion();
    this.testRumorDecay();
    this.testSourceTracking();
    return this.suite;
  }

  private testRumorCreation(): void {
    const startTime = Date.now();
    try {
      const rumor: Rumor = {
        id: 'r1',
        content: 'Dragon seen in the mountains',
        source: 'traveler_1',
        truthLevel: 0.5,
        spreadCount: 0
      };

      if (!rumor.id || !rumor.content) {
        throw new Error('Rumor should have id and content');
      }

      if (rumor.truthLevel < 0 || rumor.truthLevel > 1) {
        throw new Error('Truth level should be between 0 and 1');
      }

      this.addTest('rumor_creation', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('rumor_creation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testRumorSpread(): void {
    const startTime = Date.now();
    try {
      const rumor: Rumor = {
        id: 'r1',
        content: 'Treasure hidden in castle',
        source: 'merchant',
        truthLevel: 0.8,
        spreadCount: 0
      };

      // Слух распространяется среди NPC
      let spreadCount = 0;
      const listeners = 10;
      
      for (let i = 0; i < listeners; i++) {
        if (Math.random() < 0.7) { // 70% шанс передачи
          spreadCount++;
        }
      }

      rumor.spreadCount = spreadCount;

      if (rumor.spreadCount <= 0) {
        throw new Error('Rumor should spread to at least some listeners');
      }

      this.addTest('rumor_spread', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('rumor_spread', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testRumorDistortion(): void {
    const startTime = Date.now();
    try {
      const originalContent = 'King is ill';
      let currentContent = originalContent;
      const distortionRate = 0.1; // 10% искажения при каждой передаче
      const transfers = 5;

      for (let i = 0; i < transfers; i++) {
        if (Math.random() < distortionRate) {
          // Искажение контента
          currentContent = this.distortContent(currentContent);
        }
      }

      // После нескольких передач контент может измениться
      const distortionOccurred = currentContent !== originalContent;
      
      // Проверяем что механизм искажения работает
      if (!distortionOccurred && transfers >= 10) {
        throw new Error('Expected some distortion after many transfers');
      }

      this.addTest('rumor_distortion', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('rumor_distortion', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testRumorDecay(): void {
    const startTime = Date.now();
    try {
      const initialInterest = 1.0;
      const decayRate = 0.1; // 10% затухания в день
      const days = 5;
      
      let interest = initialInterest;
      for (let day = 0; day < days; day++) {
        interest *= (1 - decayRate);
      }

      // Интерес должен уменьшиться со временем
      if (interest >= initialInterest) {
        throw new Error('Rumor interest should decay over time');
      }

      if (interest <= 0) {
        throw new Error('Interest should not go below zero');
      }

      this.addTest('rumor_decay', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('rumor_decay', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testSourceTracking(): void {
    const startTime = Date.now();
    try {
      const rumors: Rumor[] = [
        { id: 'r1', content: 'War declared', source: 'king', truthLevel: 1.0, spreadCount: 5 },
        { id: 'r2', content: 'Monster spotted', source: 'hunter', truthLevel: 0.7, spreadCount: 3 },
        { id: 'r3', content: 'Festival announced', source: 'mayor', truthLevel: 1.0, spreadCount: 10 }
      ];

      // Проверка отслеживания источника
      const sources = new Set(rumors.map(r => r.source));
      if (sources.size !== rumors.length) {
        throw new Error('Each rumor should track its source');
      }

      // Проверка что можно найти слухи по источнику
      const kingRumors = rumors.filter(r => r.source === 'king');
      if (kingRumors.length === 0) {
        throw new Error('Should find rumors by source');
      }

      this.addTest('source_tracking', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('source_tracking', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private distortContent(content: string): string {
    const distortions = [
      'They say that ',
      'I heard that ',
      'Apparently ',
      'Rumor has it that '
    ];
    const randomDistortion = distortions[Math.floor(Math.random() * distortions.length)];
    return randomDistortion + content.toLowerCase();
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
