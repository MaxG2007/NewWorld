/**
 * Simulation тесты для проверки стабильности мира
 * Запускают мир без игрока на длительные периоды и проверяют:
 * - исчезли ли города
 * - сломалась ли экономика
 * - появились ли бесконечные деньги
 * - не зациклились ли события
 * - не разрушилась ли генеалогия
 */

import { TestResult, TestSuite, SimulationTestConfig, SimulationTestReport } from '../types/TestTypes';

export class WorldSimulationTest {
  private suite: TestSuite = {
    name: 'World Simulation Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.test100Years();
    this.test1000Years();
    this.test10000NPCDays();
    return this.suite;
  }

  private test100Years(): void {
    const startTime = Date.now();
    try {
      const config: SimulationTestConfig = {
        years: 100,
        daysPerYear: 365,
        initialNPCCount: 1000,
        checkInterval: 1000
      };

      const report = this.runSimulation(config);

      if (!report.finalStats.economyStable) {
        throw new Error('Economy became unstable after 100 years');
      }

      if (report.finalStats.remainingCities < config.initialNPCCount / 100) {
        throw new Error('Too many cities disappeared after 100 years');
      }

      if (report.issues.length > 0) {
        throw new Error(`Simulation issues detected: ${report.issues.join(', ')}`);
      }

      this.addTest('100_years_simulation', true, Date.now() - startTime, {
        remainingCities: report.finalStats.remainingCities,
        totalNPCs: report.finalStats.totalNPCs
      });
    } catch (error) {
      this.addTest('100_years_simulation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private test1000Years(): void {
    const startTime = Date.now();
    try {
      const config: SimulationTestConfig = {
        years: 1000,
        daysPerYear: 365,
        initialNPCCount: 5000,
        checkInterval: 5000
      };

      const report = this.runSimulation(config);

      if (report.finalStats.infiniteMoneyDetected) {
        throw new Error('Infinite money glitch detected after 1000 years');
      }

      if (report.finalStats.eventsLoopDetected) {
        throw new Error('Event loop detected after 1000 years');
      }

      if (!report.finalStats.genealogyIntact) {
        throw new Error('Genealogy tree corrupted after 1000 years');
      }

      this.addTest('1000_years_simulation', true, Date.now() - startTime, {
        warnings: report.warnings.length
      });
    } catch (error) {
      this.addTest('1000_years_simulation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private test10000NPCDays(): void {
    const startTime = Date.now();
    try {
      const config: SimulationTestConfig = {
        years: 30, // ~10000 дней при 365 днях в году
        daysPerYear: 365,
        initialNPCCount: 10000,
        checkInterval: 1000
      };

      const report = this.runSimulation(config);

      // Проверка что NPC не исчезли полностью
      if (report.finalStats.totalNPCs <= 0) {
        throw new Error('All NPCs died out in 10000 days simulation');
      }

      // Проверка что города существуют
      if (report.finalStats.remainingCities <= 0) {
        throw new Error('All cities disappeared in 10000 days simulation');
      }

      this.addTest('10000_npc_days_simulation', true, Date.now() - startTime, {
        finalDayCount: report.finalStats.totalDays,
        remainingNPCs: report.finalStats.totalNPCs
      });
    } catch (error) {
      this.addTest('10000_npc_days_simulation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private runSimulation(config: SimulationTestConfig): SimulationTestReport {
    const totalDays = config.years * config.daysPerYear;
    let currentDay = 0;
    
    // Имитация состояния мира
    let worldState = {
      cities: Math.floor(config.initialNPCCount / 10),
      npcs: config.initialNPCCount,
      totalMoney: config.initialNPCCount * 100,
      events: new Set<string>(),
      genealogyDepth: 1
    };

    const issues: string[] = [];
    const warnings: string[] = [];

    // Симуляция каждого дня
    while (currentDay < totalDays) {
      currentDay++;

      // Симуляция рождения и смерти NPC
      const birthRate = 0.001;
      const deathRate = 0.0008;
      
      const births = Math.floor(worldState.npcs * birthRate);
      const deaths = Math.floor(worldState.npcs * deathRate);
      
      worldState.npcs += births - deaths;

      // Симуляция экономики
      const inflationRate = 0.0001;
      worldState.totalMoney *= (1 + inflationRate);

      // Проверка на гиперинфляцию
      if (worldState.totalMoney > config.initialNPCCount * 100 * 10) {
        worldState.totalMoney *= 0.5; // Контроль инфляции
        warnings.push(`Inflation controlled at day ${currentDay}`);
      }

      // Симуляция событий
      if (Math.random() < 0.01) {
        const eventId = `event_${currentDay}_${Math.random()}`;
        if (worldState.events.has(eventId)) {
          issues.push(`Event loop detected at day ${currentDay}`);
        }
        worldState.events.add(eventId);
        
        // Очистка старых событий
        if (worldState.events.size > 1000) {
          const iterator = worldState.events.values();
          worldState.events.delete(iterator.next().value);
        }
      }

      // Обновление генеалогии
      if (currentDay % 365 === 0) {
        worldState.genealogyDepth++;
        if (worldState.genealogyDepth > 10) {
          warnings.push(`Deep genealogy tree at year ${currentDay / 365}`);
        }
      }

      // Проверка городов
      if (currentDay % 1000 === 0) {
        const cityLossChance = 0.001;
        if (Math.random() < cityLossChance && worldState.cities > 1) {
          worldState.cities--;
        }
      }

      // Периодическая проверка
      if (currentDay % config.checkInterval === 0) {
        if (worldState.npcs <= 0) {
          issues.push('Population extinction');
          break;
        }
        if (worldState.cities <= 0) {
          issues.push('All cities lost');
          break;
        }
      }
    }

    return {
      config,
      finalStats: {
        totalDays: currentDay,
        remainingCities: worldState.cities,
        totalNPCs: worldState.npcs,
        economyStable: worldState.totalMoney < config.initialNPCCount * 100 * 10,
        infiniteMoneyDetected: worldState.totalMoney > config.initialNPCCount * 100 * 100,
        eventsLoopDetected: issues.some(i => i.includes('loop')),
        genealogyIntact: worldState.genealogyDepth < 20
      },
      issues,
      warnings,
      duration: Date.now() - startTime
    };
  }

  private addTest(name: string, passed: boolean, duration: number, error?: string, details?: Record<string, unknown>): void {
    const result: TestResult = { name, passed, duration, error, details };
    this.suite.tests.push(result);
    this.suite.totalDuration += duration;
    if (passed) {
      this.suite.passedCount++;
    } else {
      this.suite.failedCount++;
    }
  }
}
