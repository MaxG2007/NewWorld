/**
 * ChunkManager - управляет потоковой загрузкой и выгрузкой чанков
 * 
 * Загружает только:
 * - текущий chunk игрока
 * - ближайшие chunks
 * - необходимые соседние данные
 * 
 * Автоматически выгружает дальние чанки для экономии RAM
 */

import { Chunk } from './Chunk';
import { Region } from '../regions/Region';
import { WorldGenerator } from '../generation/WorldGenerator';

export interface ChunkManagerConfig {
  viewDistance: number;        // Радиус видимости в чанках
  maxLoadedChunks: number;     // Максимальное количество загруженных чанков
  unloadDelay: number;         // Задержка перед выгрузкой (мс)
}

const DEFAULT_CONFIG: ChunkManagerConfig = {
  viewDistance: 3,
  maxLoadedChunks: 100,
  unloadDelay: 5000,
};

export class ChunkManager {
  private regions: Map<string, Region> = new Map();
  private generator: WorldGenerator;
  private config: ChunkManagerConfig;
  
  private currentChunkX: number = 0;
  private currentChunkY: number = 0;
  
  private loadQueue: Array<{ x: number; y: number; priority: number }> = [];
  private isProcessing: boolean = false;

  constructor(generator: WorldGenerator, config: Partial<ChunkManagerConfig> = {}) {
    this.generator = generator;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Получить ключ региона
   */
  private getRegionKey(regionX: number, regionY: number): string {
    return `${regionX},${regionY}`;
  }

  /**
   * Получить ключ чанка
   */
  private getChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }

  /**
   * Получить или создать регион
   */
  private getOrCreateRegion(chunkX: number, chunkY: number): Region {
    const regionSize = 4; // 4x4 чанка в регионе
    const regionX = Math.floor(chunkX / regionSize);
    const regionY = Math.floor(chunkY / regionSize);
    
    const key = this.getRegionKey(regionX, regionY);
    let region = this.regions.get(key);
    
    if (!region) {
      region = new Region(`Region_${regionX}_${regionY}`, regionX, regionY, regionSize);
      this.regions.set(key, region);
    }
    
    return region;
  }

  /**
   * Обновить позицию игрока и управлять загрузкой чанков
   */
  public updatePlayerPosition(globalX: number, globalY: number): void {
    const chunkSize = 16;
    const newChunkX = Math.floor(globalX / chunkSize);
    const newChunkY = Math.floor(globalY / chunkSize);
    
    // Если игрок переместился в новый чанк
    if (newChunkX !== this.currentChunkX || newChunkY !== this.currentChunkY) {
      this.currentChunkX = newChunkX;
      this.currentChunkY = newChunkY;
      
      this.updateLoadedChunks();
    }
  }

  /**
   * Обновить набор загруженных чанков
   */
  private updateLoadedChunks(): void {
    const { viewDistance, maxLoadedChunks } = this.config;
    
    // Собрать чанки в радиусе видимости
    const neededChunks: Array<{ x: number; y: number; distance: number }> = [];
    
    for (let dx = -viewDistance; dx <= viewDistance; dx++) {
      for (let dy = -viewDistance; dy <= viewDistance; dy++) {
        const distance = Math.abs(dx) + Math.abs(dy);
        if (distance <= viewDistance) {
          neededChunks.push({
            x: this.currentChunkX + dx,
            y: this.currentChunkY + dy,
            distance,
          });
        }
      }
    }
    
    // Отсортировать по приоритету (ближние сначала)
    neededChunks.sort((a, b) => a.distance - b.distance);
    
    // Получить все загруженные чанки
    const loadedChunks = this.getAllLoadedChunks();
    const loadedKeys = new Set(loadedChunks.map(c => this.getChunkKey(c.x, c.y)));
    
    // Определить чанки для выгрузки (далекие и старые)
    const chunksToUnload: Chunk[] = [];
    
    // Выгрузить чанки, которые вышли из радиуса видимости
    for (const chunk of loadedChunks) {
      const isInView = neededChunks.some(
        nc => nc.x === chunk.x && nc.y === chunk.y
      );
      
      if (!isInView) {
        chunksToUnload.push(chunk);
      }
    }
    
    // Если превышен лимит чанков, выгрузить самые старые
    if (loadedChunks.length - chunksToUnload.length > maxLoadedChunks) {
      const remaining = loadedChunks.filter(
        c => !chunksToUnload.includes(c)
      );
      
      // Сортировать по времени последнего доступа
      remaining.sort((a, b) => a.getLastAccessTime() - b.getLastAccessTime());
      
      // Добавить самые старые в список на выгрузку
      const excessCount = remaining.length - maxLoadedChunks;
      for (let i = 0; i < excessCount; i++) {
        chunksToUnload.push(remaining[i]);
      }
    }
    
    // Выгрузить чанки
    for (const chunk of chunksToUnload) {
      this.unloadChunk(chunk.x, chunk.y);
    }
    
    // Загрузить нужные чанки
    for (const { x, y } of neededChunks) {
      if (!loadedKeys.has(this.getChunkKey(x, y))) {
        this.queueChunkLoad(x, y, viewDistance - Math.abs(x - this.currentChunkX));
      }
    }
    
    // Обработать очередь загрузки
    this.processLoadQueue();
  }

  /**
   * Поставить чанк в очередь загрузки
   */
  private queueChunkLoad(x: number, y: number, priority: number): void {
    this.loadQueue.push({ x, y, priority });
    this.loadQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Обработать очередь загрузки
   */
  private processLoadQueue(): void {
    if (this.isProcessing || this.loadQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    // Загружать чанки асинхронно, чтобы не блокировать основной поток
    const loadNext = () => {
      if (this.loadQueue.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      const { x, y } = this.loadQueue.shift()!;
      this.loadChunk(x, y);
      
      // Небольшая задержка между загрузками
      setTimeout(loadNext, 0);
    };
    
    loadNext();
  }

  /**
   * Загрузить чанк
   */
  private loadChunk(chunkX: number, chunkY: number): void {
    const region = this.getOrCreateRegion(chunkX, chunkY);
    
    // Проверить, уже ли загружен
    if (region.hasChunk(chunkX, chunkY)) {
      return;
    }
    
    // Сгенерировать данные чанка
    const chunk = new Chunk(chunkX, chunkY);
    
    // Получить глобальные координаты начала чанка
    const globalStartX = chunkX * chunk.size;
    const globalStartY = chunkY * chunk.size;
    
    // Сгенерировать тайлы
    const tiles = this.generator.generateChunkTiles(
      globalStartX,
      globalStartY,
      chunk.size
    );
    
    chunk.setTerrain(tiles);
    
    // TODO: Добавить генерацию структур и сущностей
    // const structures = this.generator.generateChunkStructures(...);
    // const entities = this.generator.generateChunkEntities(...);
    
    region.loadChunk(chunk);
  }

  /**
   * Выгрузить чанк
   */
  private unloadChunk(chunkX: number, chunkY: number): void {
    const region = this.getOrCreateRegion(chunkX, chunkY);
    region.unloadChunk(chunkX, chunkY);
    
    // Очистить пустые регионы
    if (region.getLoadedChunkCount() === 0) {
      const key = this.getRegionKey(region.x, region.y);
      this.regions.delete(key);
    }
  }

  /**
   * Получить чанк по глобальным координатам
   */
  public getChunkAt(globalX: number, globalY: number): Chunk | undefined {
    const chunkSize = 16;
    const chunkX = Math.floor(globalX / chunkSize);
    const chunkY = Math.floor(globalY / chunkSize);
    
    const region = this.getOrCreateRegion(chunkX, chunkY);
    return region.getChunk(chunkX, chunkY);
  }

  /**
   * Получить чанк по координатам чанка
   */
  public getChunk(chunkX: number, chunkY: number): Chunk | undefined {
    const region = this.getOrCreateRegion(chunkX, chunkY);
    return region.getChunk(chunkX, chunkY);
  }

  /**
   * Получить все загруженные чанки
   */
  public getAllLoadedChunks(): Chunk[] {
    const allChunks: Chunk[] = [];
    
    for (const region of this.regions.values()) {
      allChunks.push(...region.getLoadedChunks());
    }
    
    return allChunks;
  }

  /**
   * Получить количество загруженных чанков
   */
  public getLoadedChunkCount(): number {
    let count = 0;
    for (const region of this.regions.values()) {
      count += region.getLoadedChunkCount();
    }
    return count;
  }

  /**
   * Получить использование памяти (приблизительно)
   */
  public getMemoryUsage(): { chunks: number; regions: number } {
    return {
      chunks: this.getLoadedChunkCount(),
      regions: this.regions.size,
    };
  }

  /**
   * Принудительно выгрузить все чанки
   */
  public unloadAll(): void {
    for (const region of this.regions.values()) {
      region.unloadAll();
    }
    this.regions.clear();
    this.loadQueue = [];
    this.isProcessing = false;
  }

  /**
   * Сохранить все грязные чанки
   */
  public saveDirtyChunks(): Record<string, unknown>[] {
    const dirtyChunks: Record<string, unknown>[] = [];
    
    for (const chunk of this.getAllLoadedChunks()) {
      if (chunk.getIsDirty()) {
        dirtyChunks.push(chunk.serialize());
        chunk.clearStateDelta();
      }
    }
    
    return dirtyChunks;
  }
}
