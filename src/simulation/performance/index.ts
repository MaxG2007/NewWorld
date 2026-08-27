/**
 * Этап 36 — PERFORMANCE: Экспорт всех модулей системы производительности
 */

export { SimulationTierManager } from './SimulationTierManager';
export { PerformanceMonitor } from './PerformanceMonitor';
export { AggregatedSimulation } from './AggregatedSimulation';

export type {
  SimulationTier,
  PerformanceMetrics,
  PerformanceThresholds,
  TierDistanceConfig,
  AggregatedRegionData,
  StatisticalEvent,
  PerformanceCheckResult,
  PerformanceIssue,
  TierStatistics,
  TierStats,
  TierTransitionEvent,
  PerformanceReport,
} from '../../types/PerformanceTypes';
