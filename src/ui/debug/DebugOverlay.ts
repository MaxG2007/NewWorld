/**
 * DebugOverlay - Отладочное меню
 * Этап 33: UI/UX
 * 
 * Отображает техническую информацию о состоянии симуляции
 */

import { DebugScreenData } from '../types/UITypes';

export interface DebugOverlayConfig {
  visible: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  refreshRate: number; // мс
  showFPS: boolean;
  showMemory: boolean;
  showEntities: boolean;
  showSimulation: boolean;
}

export class DebugOverlay {
  private config: DebugOverlayConfig = {
    visible: false,
    position: 'top-left',
    refreshRate: 1000,
    showFPS: true,
    showMemory: true,
    showEntities: true,
    showSimulation: true,
  };

  private debugData: DebugScreenData = {
    gameTime: 0,
    seed: '',
    currentChunk: { x: 0, y: 0 },
    npcCount: 0,
    loadedEntities: 0,
    simulationTier: 0,
    memoryEstimate: 0,
    eventQueueSize: 0,
    fps: 0,
    tickRate: 0,
    activeSystems: [],
  };

  private lastUpdate: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<DebugOverlayConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  toggle(): void {
    this.config.visible = !this.config.visible;
    
    if (this.config.visible) {
      this.startUpdates();
    } else {
      this.stopUpdates();
    }

    console.log(`[Debug] Overlay ${this.config.visible ? 'enabled' : 'disabled'}`);
  }

  setVisible(visible: boolean): void {
    if (this.config.visible !== visible) {
      this.toggle();
    }
  }

  isVisible(): boolean {
    return this.config.visible;
  }

  updateDebugData(data: Partial<DebugScreenData>): void {
    this.debugData = { ...this.debugData, ...data };
  }

  setGameTime(time: number): void {
    this.debugData.gameTime = time;
  }

  setSeed(seed: string): void {
    this.debugData.seed = seed;
  }

  setCurrentChunk(x: number, y: number): void {
    this.debugData.currentChunk = { x, y };
  }

  setNPCCount(count: number): void {
    this.debugData.npcCount = count;
  }

  setLoadedEntities(count: number): void {
    this.debugData.loadedEntities = count;
  }

  setSimulationTier(tier: number): void {
    this.debugData.simulationTier = tier;
  }

  setMemoryEstimate(mb: number): void {
    this.debugData.memoryEstimate = mb;
  }

  setEventQueueSize(size: number): void {
    this.debugData.eventQueueSize = size;
  }

  setActiveSystems(systems: string[]): void {
    this.debugData.activeSystems = systems;
  }

  private startUpdates(): void {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    
    this.updateInterval = setInterval(() => {
      this.updateFPS();
      this.updateMemory();
    }, this.config.refreshRate);
  }

  private stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private updateFPS(): void {
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    if (elapsed >= 1000) {
      this.debugData.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFrameTime = now;
    } else {
      this.frameCount++;
    }
  }

  private updateMemory(): void {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.debugData.memoryEstimate = Math.round(memory.usedJSHeapSize / (1024 * 1024));
    }
  }

  getDebugData(): DebugScreenData {
    return { ...this.debugData };
  }

  getConfig(): DebugOverlayConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<DebugOverlayConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.visible && !this.updateInterval) {
      this.startUpdates();
    } else if (!this.config.visible && this.updateInterval) {
      this.stopUpdates();
    }
  }

  getPositionStyles(): Record<string, string> {
    const positions = {
      'top-left': { top: '10px', left: '10px', right: 'auto', bottom: 'auto' },
      'top-right': { top: '10px', right: '10px', left: 'auto', bottom: 'auto' },
      'bottom-left': { bottom: '10px', left: '10px', right: 'auto', top: 'auto' },
      'bottom-right': { bottom: '10px', right: '10px', left: 'auto', top: 'auto' },
    };

    return positions[this.config.position];
  }

  formatDebugOutput(): string {
    const d = this.debugData;
    const lines = [
      '=== DEBUG OVERLAY ===',
      `Time: ${d.gameTime}`,
      `Seed: ${d.seed}`,
      `Chunk: [${d.currentChunk.x}, ${d.currentChunk.y}]`,
      `NPCs: ${d.npcCount}`,
      `Entities: ${d.loadedEntities}`,
      `Sim Tier: ${d.simulationTier}`,
      `Memory: ${d.memoryEstimate} MB`,
      `Events: ${d.eventQueueSize}`,
      `FPS: ${d.fps}`,
      `Tick Rate: ${d.tickRate}`,
      `Systems: ${d.activeSystems.join(', ') || 'none'}`,
    ];

    return lines.join('\n');
  }

  recordFrame(): void {
    if (this.config.visible) {
      this.frameCount++;
    }
  }

  destroy(): void {
    this.stopUpdates();
  }
}

// Экспорт singleton экземпляра
export const debugOverlay = new DebugOverlay();
