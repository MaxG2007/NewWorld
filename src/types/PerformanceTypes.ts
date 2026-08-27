/**
 * Этап 36 — PERFORMANCE: Типы данных для системы производительности
 */

/**
 * Уровни иерархической симуляции
 */
export enum SimulationTier {
  /** NPC рядом с игроком - полная симуляция */
  TIER_0 = 0,
  /** NPC текущего региона - упрощённая симуляция */
  TIER_1 = 1,
  /** Далёкие города - агрегированная симуляция */
  TIER_2 = 2,
  /** Очень далёкий мир - статистические события */
  TIER_3 = 3,
}

/**
 * Метрики производительности
 */
export interface PerformanceMetrics {
  /** Кадры в секунду */
  fps: number;
  /** Использование оперативной памяти (MB) */
  ramMB: number;
  /** Загрузка CPU (%) */
  cpuUsage: number;
  /** Размер последнего save файла (KB) */
  saveSizeKB: number;
  /** Скорость загрузки чанка (мс) */
  chunkLoadTimeMs: number;
  /** Количество активных NPC */
  activeNPCCount: number;
  /** Количество NPC по уровням симуляции */
  npcByTier: Record<SimulationTier, number>;
  /** Количество загруженных чанков */
  loadedChunks: number;
  /** Количество событий в очереди */
  eventQueueSize: number;
  /** Время последнего обновления (мс) */
  lastUpdateTime: number;
  /** Средняя частота кадров за последнюю секунду */
  avgFPS: number;
  /** Пиковое использование памяти за сессию (MB) */
  peakRamMB: number;
}

/**
 * Конфигурация порогов производительности
 */
export interface PerformanceThresholds {
  /** Минимальный целевой FPS */
  minFPS: number;
  /** Максимальное использование RAM (MB) */
  maxRamMB: number;
  /** Максимальная загрузка CPU (%) */
  maxCPUUsage: number;
  /** Максимальное время загрузки чанка (мс) */
  maxChunkLoadTimeMs: number;
  /** Максимальное количество активных NPC для Tier 0 */
  maxTier0NPCs: number;
  /** Максимальный размер save файла (KB) */
  maxSaveSizeKB: number;
}

/**
 * Настройки расстояний для уровней симуляции
 */
export interface TierDistanceConfig {
  /** Расстояние для Tier 0 (полная симуляция) */
  tier0Radius: number;
  /** Расстояние для Tier 1 (упрощённая симуляция) */
  tier1Radius: number;
  /** Расстояние для Tier 2 (агрегированная симуляция) */
  tier2Radius: number;
  /** Всё что дальше - Tier 3 (статистика) */
}

/**
 * Данные для агрегированной симуляции региона
 */
export interface AggregatedRegionData {
  /** ID региона */
  regionId: string;
  /** Общее население */
  totalPopulation: number;
  /** Средний уровень счастья */
  averageHappiness: number;
  /** Уровень преступности */
  crimeRate: number;
  /** Экономическая активность */
  economicActivity: number;
  /** Количество рождений за период */
  birthsCount: number;
  /** Количество смертей за период */
  deathsCount: number;
  /** Количество миграций */
  migrationCount: number;
  /** Статистические события */
  statisticalEvents: StatisticalEvent[];
}

/**
 * Статистическое событие для удалённых регионов
 */
export interface StatisticalEvent {
  /** Тип события */
  type: 'birth' | 'death' | 'marriage' | 'migration' | 'trade' | 'conflict' | 'disaster' | 'festival';
  /** Вероятность возникновения */
  probability: number;
  /** Влияние на регион */
  impact: number;
  /** Описание события */
  description: string;
  /** Время последнего возникновения */
  lastOccurrence?: number;
}

/**
 * Результат проверки производительности
 */
export interface PerformanceCheckResult {
  /**_passed_ если все метрики в норме */
  passed: boolean;
  /** Список проблем */
  issues: PerformanceIssue[];
  /** Рекомендации по оптимизации */
  recommendations: string[];
  /** Общий балл производительности (0-100) */
  performanceScore: number;
}

/**
 * Проблема производительности
 */
export interface PerformanceIssue {
  /** Тип проблемы */
  type: 'fps_low' | 'ram_high' | 'cpu_high' | 'chunk_slow' | 'npc_overflow' | 'save_large';
  /** Серьёзность проблемы */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Описание проблемы */
  description: string;
  /** Текущее значение */
  currentValue: number;
  /** Пороговое значение */
  thresholdValue: number;
  /** Предлагаемое решение */
  suggestedFix: string;
}

/**
 * Статистика симуляции по уровням
 */
export interface TierStatistics {
  /** Статистика по каждому уровню */
  tiers: Record<SimulationTier, TierStats>;
  /** Общее количество NPC */
  totalNPCs: number;
  /** Количество обновлений в секунду */
  updatesPerSecond: number;
  /** Время обработки всех уровней (мс) */
  totalProcessingTimeMs: number;
}

/**
 * Статистика конкретного уровня симуляции
 */
export interface TierStats {
  /** Количество NPC на этом уровне */
  npcCount: number;
  /** Время обработки (мс) */
  processingTimeMs: number;
  /** Частота обновлений (Гц) */
  updateFrequency: number;
  /** Детализация симуляции (%) */
  simulationDetail: number;
  /** Список активных систем */
  activeSystems: string[];
}

/**
 * Событие изменения уровня симуляции NPC
 */
export interface TierTransitionEvent {
  /** ID NPC */
  npcId: string;
  /** Предыдущий уровень */
  fromTier: SimulationTier;
  /** Новый уровень */
  toTier: SimulationTier;
  /** Причина перехода */
  reason: 'distance_change' | 'performance_adjustment' | 'region_change';
  /** Время события */
  timestamp: number;
  /** Координаты NPC */
  position: { x: number; y: number };
  /** Расстояние до игрока */
  distanceToPlayer: number;
}

/**
 * Отчёт о производительности для сохранения
 */
export interface PerformanceReport {
  /** Время создания отчёта */
  timestamp: number;
  /** Текущие метрики */
  metrics: PerformanceMetrics;
  /** Статистика по уровням */
  tierStatistics: TierStatistics;
  /** Выявленные проблемы */
  issues: PerformanceIssue[];
  /** История изменений FPS за последнюю минуту */
  fpsHistory: number[];
  /** История использования памяти за последнюю минуту */
  ramHistory: number[];
}
