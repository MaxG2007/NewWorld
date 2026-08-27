import {
  PerformanceMetrics,
  PerformanceThresholds,
  PerformanceCheckResult,
  PerformanceIssue,
  SimulationTier,
  PerformanceReport,
} from '../../types/PerformanceTypes';

/**
 * Этап 36 — PERFORMANCE: Монитор производительности
 * Отслеживает FPS, RAM, CPU, размер save, скорость загрузки chunk, количество активных NPC
 */
export class PerformanceMonitor {
  /** Пороговые значения */
  private thresholds: PerformanceThresholds;

  /** Текущие метрики */
  private metrics: PerformanceMetrics = this.createDefaultMetrics();

  /** История FPS за последнюю минуту */
  private fpsHistory: number[] = [];

  /** История RAM за последнюю минуту */
  private ramHistory: number[] = [];

  /** Время последнего обновления */
  private _lastUpdateTime: number = 0;

  /** Количество кадров с последнего замера FPS */
  private frameCount: number = 0;

  /** Время начала замера FPS */
  private fpsStartTime: number = 0;

  /** Максимальное использование RAM за сессию */
  private peakRamMB: number = 0;

  /** Callback для уведомлений о проблемах производительности */
  onPerformanceIssue?: (issue: PerformanceIssue) => void;

  /** Включён ли мониторинг */
  private enabled: boolean = true;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      minFPS: 30,
      maxRamMB: 512,
      maxCPUUsage: 80,
      maxChunkLoadTimeMs: 100,
      maxTier0NPCs: 100,
      maxSaveSizeKB: 10240,
      ...thresholds,
    };

    this.fpsStartTime = performance.now();
  }

  /**
   * Создание метрик по умолчанию
   */
  private createDefaultMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      ramMB: 0,
      cpuUsage: 0,
      saveSizeKB: 0,
      chunkLoadTimeMs: 0,
      activeNPCCount: 0,
      npcByTier: {
        [SimulationTier.TIER_0]: 0,
        [SimulationTier.TIER_1]: 0,
        [SimulationTier.TIER_2]: 0,
        [SimulationTier.TIER_3]: 0,
      },
      loadedChunks: 0,
      eventQueueSize: 0,
      lastUpdateTime: 0,
      avgFPS: 60,
      peakRamMB: 0,
    };
  }

  /**
   * Обновление счётчика кадров (вызывать каждый кадр)
   */
  tick(): void {
    if (!this.enabled) return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.fpsStartTime;

    // Замеряем FPS каждую секунду
    if (elapsed >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      this.updateFPS(fps);
      this.frameCount = 0;
      this.fpsStartTime = now;
    }

    this.metrics.lastUpdateTime = now;
  }

  /**
   * Обновление значения FPS
   */
  updateFPS(fps: number): void {
    this.metrics.fps = fps;
    this.fpsHistory.push(fps);

    // Храним историю за последнюю минуту (60 замеров)
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    // Вычисляем средний FPS
    this.metrics.avgFPS = Math.round(
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
    );

    // Проверяем на низкий FPS
    if (fps < this.thresholds.minFPS) {
      this.reportIssue({
        type: 'fps_low',
        severity: fps < this.thresholds.minFPS * 0.5 ? 'critical' : 'high',
        description: `Низкая частота кадров: ${fps} FPS`,
        currentValue: fps,
        thresholdValue: this.thresholds.minFPS,
        suggestedFix: 'Уменьшите количество активных NPC или детализацию симуляции',
      });
    }
  }

  /**
   * Обновление использования памяти
   */
  updateRAM(ramMB: number): void {
    this.metrics.ramMB = ramMB;

    if (ramMB > this.peakRamMB) {
      this.peakRamMB = ramMB;
      this.metrics.peakRamMB = this.peakRamMB;
    }

    this.ramHistory.push(ramMB);

    // Храним историю за последнюю минуту
    if (this.ramHistory.length > 60) {
      this.ramHistory.shift();
    }

    // Проверяем на высокое использование RAM
    if (ramMB > this.thresholds.maxRamMB) {
      this.reportIssue({
        type: 'ram_high',
        severity: ramMB > this.thresholds.maxRamMB * 1.5 ? 'critical' : 'high',
        description: `Высокое использование памяти: ${ramMB.toFixed(1)} MB`,
        currentValue: ramMB,
        thresholdValue: this.thresholds.maxRamMB,
        suggestedFix: 'Очистите кэш, уменьшите количество загруженных чанков',
      });
    }
  }

  /**
   * Обновление загрузки CPU
   */
  updateCPUUsage(cpuUsage: number): void {
    this.metrics.cpuUsage = cpuUsage;

    if (cpuUsage > this.thresholds.maxCPUUsage) {
      this.reportIssue({
        type: 'cpu_high',
        severity: cpuUsage > 95 ? 'critical' : 'high',
        description: `Высокая загрузка CPU: ${cpuUsage}%`,
        currentValue: cpuUsage,
        thresholdValue: this.thresholds.maxCPUUsage,
        suggestedFix: 'Оптимизируйте симуляцию, уменьшите частоту обновлений',
      });
    }
  }

  /**
   * Обновление размера save файла
   */
  updateSaveSize(sizeKB: number): void {
    this.metrics.saveSizeKB = sizeKB;

    if (sizeKB > this.thresholds.maxSaveSizeKB) {
      this.reportIssue({
        type: 'save_large',
        severity: 'medium',
        description: `Большой размер сохранения: ${(sizeKB / 1024).toFixed(2)} MB`,
        currentValue: sizeKB,
        thresholdValue: this.thresholds.maxSaveSizeKB,
        suggestedFix: 'Сократите историю событий, оптимизируйте структуру данных',
      });
    }
  }

  /**
   * Обновление времени загрузки чанка
   */
  updateChunkLoadTime(timeMs: number): void {
    this.metrics.chunkLoadTimeMs = timeMs;

    if (timeMs > this.thresholds.maxChunkLoadTimeMs) {
      this.reportIssue({
        type: 'chunk_slow',
        severity: timeMs > this.thresholds.maxChunkLoadTimeMs * 2 ? 'high' : 'medium',
        description: `Медленная загрузка чанка: ${timeMs} мс`,
        currentValue: timeMs,
        thresholdValue: this.thresholds.maxChunkLoadTimeMs,
        suggestedFix: 'Используйте асинхронную загрузку, оптимизируйте данные чанка',
      });
    }
  }

  /**
   * Обновление количества активных NPC
   */
  updateActiveNPCCount(count: number, byTier?: Record<SimulationTier, number>): void {
    this.metrics.activeNPCCount = count;

    if (byTier) {
      this.metrics.npcByTier = byTier;
    }

    if (count > this.thresholds.maxTier0NPCs) {
      this.reportIssue({
        type: 'npc_overflow',
        severity: 'medium',
        description: `Превышено количество NPC в Tier 0: ${count}`,
        currentValue: count,
        thresholdValue: this.thresholds.maxTier0NPCs,
        suggestedFix: 'Уменьшите радиус полной симуляции',
      });
    }
  }

  /**
   * Обновление количества загруженных чанков
   */
  updateLoadedChunks(count: number): void {
    this.metrics.loadedChunks = count;
  }

  /**
   * Обновление размера очереди событий
   */
  updateEventQueueSize(size: number): void {
    this.metrics.eventQueueSize = size;
  }

  /**
   * Регистрация проблемы производительности
   */
  private reportIssue(issue: PerformanceIssue): void {
    if (this.onPerformanceIssue) {
      this.onPerformanceIssue(issue);
    }
    console.warn(`[Performance] ${issue.severity.toUpperCase()}: ${issue.description}`);
  }

  /**
   * Проверка всех метрик и возврат результата
   */
  checkPerformance(): PerformanceCheckResult {
    const issues: PerformanceIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Проверка FPS
    if (this.metrics.fps < this.thresholds.minFPS) {
      const severity = this.metrics.fps < this.thresholds.minFPS * 0.5 ? 'critical' : 'high';
      issues.push({
        type: 'fps_low',
        severity,
        description: `Низкая частота кадров: ${this.metrics.fps} FPS`,
        currentValue: this.metrics.fps,
        thresholdValue: this.thresholds.minFPS,
        suggestedFix: 'Уменьшите детализацию симуляции или количество NPC',
      });
      score -= severity === 'critical' ? 30 : 15;
    }

    // Проверка RAM
    if (this.metrics.ramMB > this.thresholds.maxRamMB) {
      const severity = this.metrics.ramMB > this.thresholds.maxRamMB * 1.5 ? 'critical' : 'high';
      issues.push({
        type: 'ram_high',
        severity,
        description: `Высокое использование памяти: ${this.metrics.ramMB.toFixed(1)} MB`,
        currentValue: this.metrics.ramMB,
        thresholdValue: this.thresholds.maxRamMB,
        suggestedFix: 'Очистите кэш или уменьшите количество загруженных чанков',
      });
      score -= severity === 'critical' ? 25 : 15;
    }

    // Проверка CPU
    if (this.metrics.cpuUsage > this.thresholds.maxCPUUsage) {
      const severity = this.metrics.cpuUsage > 95 ? 'critical' : 'high';
      issues.push({
        type: 'cpu_high',
        severity,
        description: `Высокая загрузка CPU: ${this.metrics.cpuUsage}%`,
        currentValue: this.metrics.cpuUsage,
        thresholdValue: this.thresholds.maxCPUUsage,
        suggestedFix: 'Оптимизируйте циклы симуляции',
      });
      score -= severity === 'critical' ? 25 : 15;
    }

    // Проверка времени загрузки чанка
    if (this.metrics.chunkLoadTimeMs > this.thresholds.maxChunkLoadTimeMs) {
      issues.push({
        type: 'chunk_slow',
        severity: 'medium',
        description: `Медленная загрузка чанка: ${this.metrics.chunkLoadTimeMs} мс`,
        currentValue: this.metrics.chunkLoadTimeMs,
        thresholdValue: this.thresholds.maxChunkLoadTimeMs,
        suggestedFix: 'Используйте асинхронную загрузку и кэширование',
      });
      score -= 10;
    }

    // Генерация рекомендаций
    if (score < 50) {
      recommendations.push('Критическое снижение производительности! Требуется немедленная оптимизация.');
    }
    if (this.metrics.fps < 40) {
      recommendations.push('Рекомендуется уменьшить радиус полной симуляции (Tier 0).');
    }
    if (this.metrics.ramMB > 400) {
      recommendations.push('Рекомендуется включить агрессивную очистку неиспользуемых ресурсов.');
    }
    if (this.metrics.activeNPCCount > 200) {
      recommendations.push('Рассмотрите возможность агрегации удалённых NPC.');
    }

    return {
      passed: issues.length === 0,
      issues,
      recommendations,
      performanceScore: Math.max(0, score),
    };
  }

  /**
   * Получение текущих метрик
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Получение истории FPS
   */
  getFPSHistory(): number[] {
    return [...this.fpsHistory];
  }

  /**
   * Получение истории RAM
   */
  getRAMHistory(): number[] {
    return [...this.ramHistory];
  }

  /**
   * Генерация отчёта о производительности
   */
  generateReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      tierStatistics: {
        tiers: {
          [SimulationTier.TIER_0]: {
            npcCount: this.metrics.npcByTier[SimulationTier.TIER_0],
            processingTimeMs: 0,
            updateFrequency: 60,
            simulationDetail: 100,
            activeSystems: ['movement', 'needs', 'social', 'work', 'combat', 'inventory'],
          },
          [SimulationTier.TIER_1]: {
            npcCount: this.metrics.npcByTier[SimulationTier.TIER_1],
            processingTimeMs: 0,
            updateFrequency: 20,
            simulationDetail: 60,
            activeSystems: ['movement', 'needs', 'work'],
          },
          [SimulationTier.TIER_2]: {
            npcCount: this.metrics.npcByTier[SimulationTier.TIER_2],
            processingTimeMs: 0,
            updateFrequency: 5,
            simulationDetail: 20,
            activeSystems: ['aggregated_economy', 'population'],
          },
          [SimulationTier.TIER_3]: {
            npcCount: this.metrics.npcByTier[SimulationTier.TIER_3],
            processingTimeMs: 0,
            updateFrequency: 1,
            simulationDetail: 5,
            activeSystems: ['statistical_events'],
          },
        },
        totalNPCs: this.metrics.activeNPCCount,
        updatesPerSecond: 60,
        totalProcessingTimeMs: 0,
      },
      issues: this.checkPerformance().issues,
      fpsHistory: [...this.fpsHistory],
      ramHistory: [...this.ramHistory],
    };
  }

  /**
   * Включение/выключение мониторинга
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Сброс статистики
   */
  reset(): void {
    this.metrics = this.createDefaultMetrics();
    this.fpsHistory = [];
    this.ramHistory = [];
    this.peakRamMB = 0;
    this.frameCount = 0;
    this.fpsStartTime = performance.now();
  }

  /**
   * Экспорт состояния для сохранения
   */
  exportState(): object {
    return {
      peakRamMB: this.peakRamMB,
      thresholds: this.thresholds,
    };
  }

  /**
   * Импорт состояния из сохранения
   */
  importState(state: any): void {
    if (state.peakRamMB !== undefined) {
      this.peakRamMB = state.peakRamMB;
      this.metrics.peakRamMB = state.peakRamMB;
    }
    if (state.thresholds) {
      this.thresholds = { ...this.thresholds, ...state.thresholds };
    }
  }
}
