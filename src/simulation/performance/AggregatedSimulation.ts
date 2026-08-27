/**
 * Этап 36 — PERFORMANCE: Агрегированная симуляция для удалённых регионов
 * Реализует упрощённую симуляцию для Tier 2 и статистические события для Tier 3
 */

import {
  AggregatedRegionData,
  StatisticalEvent,
  SimulationTier,
} from '../../types/PerformanceTypes';

/**
 * Конфигурация агрегированной симуляции
 */
export interface AggregatedSimulationConfig {
  /** Интервал обновления для Tier 2 (мс) */
  tier2UpdateInterval: number;
  /** Интервал обновления для Tier 3 (мс) */
  tier3UpdateInterval: number;
  /** Вероятность события для региона */
  baseEventProbability: number;
  /** Максимальное количество событий в истории региона */
  maxEventsPerRegion: number;
}

/**
 * Данные региона для агрегированной симуляции
 */
interface SimulatedRegion {
  id: string;
  tier: SimulationTier.TIER_2 | SimulationTier.TIER_3;
  data: AggregatedRegionData;
  lastUpdate: number;
  eventHistory: StatisticalEvent[];
}

/**
 * Этап 36 — PERFORMANCE: Менеджер агрегированной симуляции
 */
export class AggregatedSimulation {
  /** Конфигурация */
  private config: AggregatedSimulationConfig;

  /** Симулируемые регионы */
  private regions: Map<string, SimulatedRegion> = new Map();

  /** Список доступных статистических событий */
  private availableEvents: StatisticalEvent[] = [];

  /** Callback для уведомлений о событиях */
  onEventOccurred?: (regionId: string, event: StatisticalEvent) => void;

  constructor(config?: Partial<AggregatedSimulationConfig>) {
    this.config = {
      tier2UpdateInterval: 1000, // 1 секунда для Tier 2
      tier3UpdateInterval: 5000, // 5 секунд для Tier 3
      baseEventProbability: 0.1,
      maxEventsPerRegion: 100,
      ...config,
    };

    this.initializeAvailableEvents();
  }

  /**
   * Инициализация списка доступных событий
   */
  private initializeAvailableEvents(): void {
    this.availableEvents = [
      { type: 'birth', probability: 0.25, impact: 0.05, description: 'Рождение жителя' },
      { type: 'death', probability: 0.20, impact: 0.08, description: 'Смерть жителя' },
      { type: 'marriage', probability: 0.15, impact: 0.03, description: 'Заключение брака' },
      { type: 'migration', probability: 0.15, impact: 0.1, description: 'Миграция населения' },
      { type: 'trade', probability: 0.15, impact: 0.05, description: 'Торговая сделка' },
      { type: 'conflict', probability: 0.05, impact: 0.3, description: 'Локальный конфликт' },
      { type: 'disaster', probability: 0.02, impact: 0.5, description: 'Природное бедствие' },
      { type: 'festival', probability: 0.03, impact: 0.02, description: 'Праздник' },
    ];
  }

  /**
   * Регистрация региона для агрегированной симуляции
   */
  registerRegion(
    regionId: string,
    tier: SimulationTier.TIER_2 | SimulationTier.TIER_3,
    initialData: Partial<AggregatedRegionData>
  ): void {
    const region: SimulatedRegion = {
      id: regionId,
      tier,
      data: {
        regionId,
        totalPopulation: initialData.totalPopulation || 1000,
        averageHappiness: initialData.averageHappiness ?? 0.5,
        crimeRate: initialData.crimeRate ?? 0,
        economicActivity: initialData.economicActivity ?? 0.5,
        birthsCount: 0,
        deathsCount: 0,
        migrationCount: 0,
        statisticalEvents: [],
      },
      lastUpdate: Date.now(),
      eventHistory: [],
    };

    this.regions.set(regionId, region);
  }

  /**
   * Обновление симуляции всех регионов
   */
  update(_currentTime: number): void {
    for (const region of this.regions.values()) {
      const interval =
        region.tier === SimulationTier.TIER_2
          ? this.config.tier2UpdateInterval
          : this.config.tier3UpdateInterval;

      if (_currentTime - region.lastUpdate >= interval) {
        this.updateRegion(region, _currentTime);
        region.lastUpdate = _currentTime;
      }
    }
  }

  /**
   * Обновление конкретного региона
   */
  private updateRegion(region: SimulatedRegion, _currentTime: number): void {
    // Для Tier 2 - более детальная симуляция
    if (region.tier === SimulationTier.TIER_2) {
      this.simulateTier2(region);
    }
    // Для Tier 3 - только статистические события
    else {
      this.simulateTier3(region);
    }
  }

  /**
   * Симуляция для Tier 2 (агрегированная)
   */
  private simulateTier2(region: SimulatedRegion): void {
    const data = region.data;

    // Естественный прирост населения
    const birthRate = 0.001 * data.economicActivity;
    const deathRate = 0.0008 * (1 + data.crimeRate);

    const births = Math.floor(data.totalPopulation * birthRate);
    const deaths = Math.floor(data.totalPopulation * deathRate);

    data.birthsCount += births;
    data.deathsCount += deaths;
    data.totalPopulation = Math.max(0, data.totalPopulation + births - deaths);

    // Изменение счастья в зависимости от условий
    const happinessChange = (births - deaths) / Math.max(1, data.totalPopulation) * 0.1;
    data.averageHappiness = Math.max(0, Math.min(1, data.averageHappiness + happinessChange));

    // Экономическая активность
    const economyChange = (Math.random() - 0.5) * 0.02;
    data.economicActivity = Math.max(0, Math.min(1, data.economicActivity + economyChange));

    // Возможность события
    if (Math.random() < this.config.baseEventProbability) {
      const event = this.generateEvent(region);
      if (event) {
        this.applyEventEffect(region, event);
      }
    }
  }

  /**
   * Симуляция для Tier 3 (статистическая)
   */
  private simulateTier3(region: SimulatedRegion): void {
    // Только генерация статистических событий
    if (Math.random() < this.config.baseEventProbability * 0.5) {
      const event = this.generateEvent(region);
      if (event) {
        this.applyEventEffect(region, event);
      }
    }
  }

  /**
   * Генерация события для региона
   */
  private generateEvent(region: SimulatedRegion): StatisticalEvent | null {
    const roll = Math.random();
    let cumulativeProbability = 0;

    for (const eventTemplate of this.availableEvents) {
      cumulativeProbability += eventTemplate.probability;
      if (roll <= cumulativeProbability) {
        const event: StatisticalEvent = {
          ...eventTemplate,
          lastOccurrence: Date.now(),
        };

        // Добавляем в историю
        region.eventHistory.push(event);
        region.data.statisticalEvents.push(event);

        // Ограничиваем размер истории
        if (region.eventHistory.length > this.config.maxEventsPerRegion) {
          region.eventHistory.shift();
        }
        if (region.data.statisticalEvents.length > this.config.maxEventsPerRegion) {
          region.data.statisticalEvents.shift();
        }

        return event;
      }
    }

    return null;
  }

  /**
   * Применение эффекта события к региону
   */
  private applyEventEffect(region: SimulatedRegion, event: StatisticalEvent): void {
    const data = region.data;

    switch (event.type) {
      case 'birth':
        data.totalPopulation += Math.floor(data.totalPopulation * 0.01);
        data.averageHappiness += 0.02;
        break;

      case 'death':
        data.totalPopulation -= Math.floor(data.totalPopulation * 0.01);
        data.averageHappiness -= 0.03;
        break;

      case 'marriage':
        data.averageHappiness += 0.01;
        break;

      case 'migration':
        const migration = Math.floor(data.totalPopulation * (Math.random() - 0.5) * 0.1);
        data.totalPopulation += migration;
        data.migrationCount += Math.abs(migration);
        break;

      case 'trade':
        data.economicActivity = Math.min(1, data.economicActivity + 0.05);
        break;

      case 'conflict':
        data.crimeRate = Math.min(1, data.crimeRate + 0.1);
        data.averageHappiness -= 0.1;
        data.totalPopulation -= Math.floor(data.totalPopulation * 0.02);
        break;

      case 'disaster':
        data.totalPopulation -= Math.floor(data.totalPopulation * 0.1);
        data.economicActivity *= 0.7;
        data.averageHappiness -= 0.2;
        break;

      case 'festival':
        data.averageHappiness += 0.05;
        data.economicActivity = Math.min(1, data.economicActivity + 0.03);
        break;
    }

    // Ограничиваем значения допустимыми пределами
    data.averageHappiness = Math.max(0, Math.min(1, data.averageHappiness));
    data.crimeRate = Math.max(0, Math.min(1, data.crimeRate));
    data.economicActivity = Math.max(0, Math.min(1, data.economicActivity));
    data.totalPopulation = Math.max(0, data.totalPopulation);

    // Уведомление
    if (this.onEventOccurred) {
      this.onEventOccurred(region.id, event);
    }
  }

  /**
   * Получение данных региона
   */
  getRegionData(regionId: string): AggregatedRegionData | null {
    const region = this.regions.get(regionId);
    return region ? { ...region.data } : null;
  }

  /**
   * Получение статистики по всем регионам
   */
  getAllRegionsStats(): AggregatedRegionData[] {
    return Array.from(this.regions.values()).map((r) => ({ ...r.data }));
  }

  /**
   * Получение количества регионов по уровням
   */
  getRegionCountByTier(): Record<SimulationTier, number> {
    const counts: Record<SimulationTier, number> = {
      [SimulationTier.TIER_0]: 0,
      [SimulationTier.TIER_1]: 0,
      [SimulationTier.TIER_2]: 0,
      [SimulationTier.TIER_3]: 0,
    };

    for (const region of this.regions.values()) {
      counts[region.tier]++;
    }

    return counts;
  }

  /**
   * Изменение уровня региона
   */
  changeRegionTier(regionId: string, newTier: SimulationTier.TIER_2 | SimulationTier.TIER_3): void {
    const region = this.regions.get(regionId);
    if (region) {
      region.tier = newTier;
      region.lastUpdate = Date.now();
    }
  }

  /**
   * Удаление региона
   */
  removeRegion(regionId: string): void {
    this.regions.delete(regionId);
  }

  /**
   * Получение истории событий региона
   */
  getRegionEventHistory(regionId: string, limit: number = 20): StatisticalEvent[] {
    const region = this.regions.get(regionId);
    if (!region) return [];

    return region.eventHistory.slice(-limit);
  }

  /**
   * Полный сброс
   */
  reset(): void {
    this.regions.clear();
  }

  /**
   * Экспорт состояния
   */
  exportState(): object {
    return {
      regions: Array.from(this.regions.entries()).map(([id, region]) => ({
        id,
        tier: region.tier,
        data: region.data,
        lastUpdate: region.lastUpdate,
        eventHistory: region.eventHistory,
      })),
    };
  }

  /**
   * Импорт состояния
   */
  importState(state: any): void {
    if (state.regions && Array.isArray(state.regions)) {
      this.regions.clear();
      for (const regionData of state.regions) {
        this.regions.set(regionData.id, {
          id: regionData.id,
          tier: regionData.tier,
          data: regionData.data,
          lastUpdate: regionData.lastUpdate,
          eventHistory: regionData.eventHistory || [],
        });
      }
    }
  }
}
