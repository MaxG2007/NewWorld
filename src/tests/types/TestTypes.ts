/**
 * Типы данных для системы тестирования
 */

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passedCount: number;
  failedCount: number;
}

export interface SimulationTestConfig {
  years: number;
  daysPerYear: number;
  initialNPCCount: number;
  checkInterval: number;
}

export interface SimulationTestReport {
  config: SimulationTestConfig;
  finalStats: {
    totalDays: number;
    remainingCities: number;
    totalNPCs: number;
    economyStable: boolean;
    infiniteMoneyDetected: boolean;
    eventsLoopDetected: boolean;
    genealogyIntact: boolean;
  };
  issues: string[];
  warnings: string[];
  duration: number;
}

export type TestCategory = 
  | 'damage'
  | 'RNG'
  | 'pathfinding'
  | 'economy'
  | 'age'
  | 'genealogy'
  | 'crafting'
  | 'rumors'
  | 'law'
  | 'saveLoad'
  | 'simulation';

export interface TestRunnerConfig {
  stopOnFirstFailure: boolean;
  verbose: boolean;
  categories: TestCategory[];
}
