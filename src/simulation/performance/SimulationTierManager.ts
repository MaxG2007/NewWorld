import {
  SimulationTier,
  PerformanceMetrics,
  PerformanceThresholds,
  TierDistanceConfig,
  AggregatedRegionData,
  StatisticalEvent,
  TierTransitionEvent,
} from '../../types/PerformanceTypes';

/**
 * Этап 36 — PERFORMANCE: Менеджер иерархической симуляции
 * Управляет распределением NPC по уровням симуляции в зависимости от расстояния до игрока
 */
export class SimulationTierManager {
  /** Конфигурация расстояний для уровней */
  private distanceConfig: TierDistanceConfig;

  /** Пороги производительности */
  private thresholds: PerformanceThresholds;

  /** Текущее положение игрока */
  private playerPosition: { x: number; y: number } = { x: 0, y: 0 };

  /** Маппинг NPC по уровням */
  private npcTierMap: Map<string, SimulationTier> = new Map();

  /** Статистика по уровням */
  private tierStats: Record<SimulationTier, any> = {
    [SimulationTier.TIER_0]: this.createDefaultTierStats(),
    [SimulationTier.TIER_1]: this.createDefaultTierStats(),
    [SimulationTier.TIER_2]: this.createDefaultTierStats(),
    [SimulationTier.TIER_3]: this.createDefaultTierStats(),
  };

  /** История переходов между уровнями */
  private transitionHistory: TierTransitionEvent[] = [];

  /** Агрегированные данные по регионам */
  private aggregatedRegions: Map<string, AggregatedRegionData> = new Map();

  /** Статистические события для Tier 3 */
  private statisticalEvents: StatisticalEvent[] = [];

  /** Callback для уведомлений о переходе NPC между уровнями */
  onTierTransition?: (event: TierTransitionEvent) => void;

  constructor(
    distanceConfig?: Partial<TierDistanceConfig>,
    thresholds?: Partial<PerformanceThresholds>
  ) {
    this.distanceConfig = {
      tier0Radius: 50, // NPC рядом с игроком
      tier1Radius: 200, // NPC текущего региона
      tier2Radius: 1000, // Далёкие города
      ...distanceConfig,
    };

    this.thresholds = {
      minFPS: 30,
      maxRamMB: 512,
      maxCPUUsage: 80,
      maxChunkLoadTimeMs: 100,
      maxTier0NPCs: 100,
      maxSaveSizeKB: 10240,
      ...thresholds,
    };

    this.initializeStatisticalEvents();
  }

  /**
   * Создание стандартной статистики для уровня
   */
  private createDefaultTierStats(): any {
    return {
      npcCount: 0,
      processingTimeMs: 0,
      updateFrequency: 0,
      simulationDetail: 0,
      activeSystems: [],
    };
  }

  /**
   * Инициализация списка статистических событий
   */
  private initializeStatisticalEvents(): void {
    this.statisticalEvents = [
      {
        type: 'birth',
        probability: 0.001,
        impact: 0.1,
        description: 'Рождение нового жителя',
      },
      {
        type: 'death',
        probability: 0.0008,
        impact: 0.15,
        description: 'Смерть жителя',
      },
      {
        type: 'marriage',
        probability: 0.0005,
        impact: 0.05,
        description: 'Заключение брака',
      },
      {
        type: 'migration',
        probability: 0.002,
        impact: 0.2,
        description: 'Миграция населения',
      },
      {
        type: 'trade',
        probability: 0.01,
        impact: 0.1,
        description: 'Торговая сделка',
      },
      {
        type: 'conflict',
        probability: 0.0003,
        impact: 0.5,
        description: 'Локальный конфликт',
      },
      {
        type: 'disaster',
        probability: 0.0001,
        impact: 0.8,
        description: 'Природное бедствие',
      },
    ];
  }

  /**
   * Обновление позиции игрока
   */
  setPlayerPosition(x: number, y: number): void {
    this.playerPosition = { x, y };
    this.recalculateAllTiers();
  }

  /**
   * Расчёт расстояния между двумя точками
   */
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Определение уровня симуляции для NPC на основе расстояния
   */
  getTierForDistance(distance: number): SimulationTier {
    if (distance <= this.distanceConfig.tier0Radius) {
      return SimulationTier.TIER_0;
    } else if (distance <= this.distanceConfig.tier1Radius) {
      return SimulationTier.TIER_1;
    } else if (distance <= this.distanceConfig.tier2Radius) {
      return SimulationTier.TIER_2;
    } else {
      return SimulationTier.TIER_3;
    }
  }

  /**
   * Регистрация NPC в системе
   */
  registerNPC(npcId: string, x: number, y: number): void {
    const distance = this.calculateDistance(this.playerPosition.x, this.playerPosition.y, x, y);
    const tier = this.getTierForDistance(distance);
    this.npcTierMap.set(npcId, tier);
    this.updateTierStats();
  }

  /**
   * Обновление позиции NPC и возможная смена уровня
   */
  updateNPCPosition(npcId: string, x: number, y: number): void {
    const currentTier = this.npcTierMap.get(npcId);
    const distance = this.calculateDistance(this.playerPosition.x, this.playerPosition.y, x, y);
    const newTier = this.getTierForDistance(distance);

    if (currentTier !== undefined && currentTier !== newTier) {
      this.handleTierTransition(npcId, currentTier, newTier, x, y, distance);
    }

    this.npcTierMap.set(npcId, newTier);
    this.updateTierStats();
  }

  /**
   * Обработка перехода NPC между уровнями
   */
  private handleTierTransition(
    npcId: string,
    fromTier: SimulationTier,
    toTier: SimulationTier,
    x: number,
    y: number,
    distance: number
  ): void {
    const event: TierTransitionEvent = {
      npcId,
      fromTier,
      toTier,
      reason: 'distance_change',
      timestamp: Date.now(),
      position: { x, y },
      distanceToPlayer: distance,
    };

    this.transitionHistory.push(event);

    // Ограничиваем историю последними 100 событиями
    if (this.transitionHistory.length > 100) {
      this.transitionHistory.shift();
    }

    if (this.onTierTransition) {
      this.onTierTransition(event);
    }

    console.log(`[TierManager] NPC ${npcId}: Tier ${fromTier} -> ${toTier} (dist: ${distance.toFixed(1)})`);
  }

  /**
   * Пересчёт всех уровней после движения игрока
   */
  private recalculateAllTiers(): void {
    for (const [_npcId, _oldTier] of this.npcTierMap.entries()) {
      // В реальной реализации здесь были бы координаты NPC
      // Для демо просто обновляем статистику
    }
    this.updateTierStats();
  }

  /**
   * Обновление статистики по уровням
   */
  private updateTierStats(): void {
    // Сброс счётчиков
    for (const tier of Object.values(SimulationTier)) {
      if (typeof tier === 'number') {
        this.tierStats[tier] = this.createDefaultTierStats();
      }
    }

    // Подсчёт NPC по уровням
    for (const tier of this.npcTierMap.values()) {
      this.tierStats[tier].npcCount++;
    }

    // Установка детализации симуляции
    this.tierStats[SimulationTier.TIER_0].simulationDetail = 100;
    this.tierStats[SimulationTier.TIER_0].activeSystems = [
      'movement',
      'needs',
      'social',
      'work',
      'combat',
      'inventory',
    ];

    this.tierStats[SimulationTier.TIER_1].simulationDetail = 60;
    this.tierStats[SimulationTier.TIER_1].activeSystems = ['movement', 'needs', 'work'];

    this.tierStats[SimulationTier.TIER_2].simulationDetail = 20;
    this.tierStats[SimulationTier.TIER_2].activeSystems = ['aggregated_economy', 'population'];

    this.tierStats[SimulationTier.TIER_3].simulationDetail = 5;
    this.tierStats[SimulationTier.TIER_3].activeSystems = ['statistical_events'];

    // Частота обновлений
    this.tierStats[SimulationTier.TIER_0].updateFrequency = 60; // 60 Hz
    this.tierStats[SimulationTier.TIER_1].updateFrequency = 20; // 20 Hz
    this.tierStats[SimulationTier.TIER_2].updateFrequency = 5; // 5 Hz
    this.tierStats[SimulationTier.TIER_3].updateFrequency = 1; // 1 Hz
  }

  /**
   * Получение статистики по уровням
   */
  getTierStatistics(): Record<SimulationTier, any> {
    return { ...this.tierStats };
  }

  /**
   * Получение общего количества NPC
   */
  getTotalNPCCount(): number {
    return this.npcTierMap.size;
  }

  /**
   * Получение количества NPC по уровню
   */
  getNPCCountByTier(tier: SimulationTier): number {
    return this.tierStats[tier].npcCount;
  }

  /**
   * Обновление времени обработки для уровня
   */
  updateProcessingTime(tier: SimulationTier, timeMs: number): void {
    this.tierStats[tier].processingTimeMs = timeMs;
  }

  /**
   * Регистрация агрегированных данных региона
   */
  updateAggregatedRegion(regionId: string, data: Partial<AggregatedRegionData>): void {
    const existing = this.aggregatedRegions.get(regionId) || {
      regionId,
      totalPopulation: 0,
      averageHappiness: 0.5,
      crimeRate: 0,
      economicActivity: 0,
      birthsCount: 0,
      deathsCount: 0,
      migrationCount: 0,
      statisticalEvents: [],
    };

    this.aggregatedRegions.set(regionId, { ...existing, ...data });
  }

  /**
   * Генерация статистического события для удалённого региона
   */
  generateStatisticalEvent(regionId: string): StatisticalEvent | null {
    const roll = Math.random();
    let cumulativeProbability = 0;

    for (const event of this.statisticalEvents) {
      cumulativeProbability += event.probability;
      if (roll <= cumulativeProbability) {
        const eventData: StatisticalEvent = {
          ...event,
          lastOccurrence: Date.now(),
        };

        // Обновляем регион
        const region = this.aggregatedRegions.get(regionId);
        if (region) {
          region.statisticalEvents.push(eventData);
          if (region.statisticalEvents.length > 50) {
            region.statisticalEvents.shift();
          }
        }

        return eventData;
      }
    }

    return null;
  }

  /**
   * Принудительное изменение уровня для NPC (для оптимизации)
   */
  forceTierChange(npcId: string, newTier: SimulationTier, reason: 'performance_adjustment' | 'region_change'): void {
    const currentTier = this.npcTierMap.get(npcId);
    if (currentTier === undefined || currentTier === newTier) {
      return;
    }

    const event: TierTransitionEvent = {
      npcId,
      fromTier: currentTier,
      toTier: newTier,
      reason,
      timestamp: Date.now(),
      position: { x: 0, y: 0 }, // Координаты неизвестны при принудительном изменении
      distanceToPlayer: 0,
    };

    this.npcTierMap.set(npcId, newTier);
    this.transitionHistory.push(event);
    this.updateTierStats();

    if (this.onTierTransition) {
      this.onTierTransition(event);
    }
  }

  /**
   * Динамическая корректировка радиусов на основе производительности
   */
  adjustRadiiForPerformance(metrics: PerformanceMetrics): void {
    if (metrics.fps < this.thresholds.minFPS) {
      // Снижаем нагрузку - уменьшаем радиусы
      this.distanceConfig.tier0Radius = Math.max(10, this.distanceConfig.tier0Radius * 0.9);
      this.distanceConfig.tier1Radius = Math.max(50, this.distanceConfig.tier1Radius * 0.9);
      console.log(`[TierManager] Reduced radii due to low FPS: ${metrics.fps}`);
    } else if (metrics.fps > this.thresholds.minFPS + 20 && metrics.activeNPCCount < this.thresholds.maxTier0NPCs) {
      // Можно увеличить детализацию
      this.distanceConfig.tier0Radius = Math.min(100, this.distanceConfig.tier0Radius * 1.05);
      this.distanceConfig.tier1Radius = Math.min(400, this.distanceConfig.tier1Radius * 1.05);
      console.log(`[TierManager] Increased radii due to good FPS: ${metrics.fps}`);
    }
  }

  /**
   * Получение истории переходов
   */
  getTransitionHistory(limit: number = 50): TierTransitionEvent[] {
    return this.transitionHistory.slice(-limit);
  }

  /**
   * Очистка данных об удалённом NPC
   */
  removeNPC(npcId: string): void {
    this.npcTierMap.delete(npcId);
    this.updateTierStats();
  }

  /**
   * Полный сброс состояния
   */
  reset(): void {
    this.npcTierMap.clear();
    this.transitionHistory = [];
    this.aggregatedRegions.clear();

    for (const tier of Object.values(SimulationTier)) {
      if (typeof tier === 'number') {
        this.tierStats[tier] = this.createDefaultTierStats();
      }
    }
  }

  /**
   * Экспорт состояния для сохранения
   */
  exportState(): object {
    return {
      distanceConfig: this.distanceConfig,
      npcTierMap: Array.from(this.npcTierMap.entries()),
      tierStats: this.tierStats,
      aggregatedRegions: Array.from(this.aggregatedRegions.entries()),
    };
  }

  /**
   * Импорт состояния из сохранения
   */
  importState(state: any): void {
    if (state.distanceConfig) {
      this.distanceConfig = state.distanceConfig;
    }
    if (state.npcTierMap) {
      this.npcTierMap = new Map(state.npcTierMap);
    }
    if (state.tierStats) {
      this.tierStats = state.tierStats;
    }
    if (state.aggregatedRegions) {
      this.aggregatedRegions = new Map(state.aggregatedRegions);
    }
  }
}
