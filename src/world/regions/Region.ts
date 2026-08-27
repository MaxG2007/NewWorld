/**
 * Region - контейнер для группы чанков
 */

import { Chunk } from '../chunks/Chunk';

export interface RegionData {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
}

export class Region {
  public readonly id: string;
  public name: string;
  public readonly x: number;
  public readonly y: number;
  public readonly size: number;
  
  private chunks: Map<string, Chunk> = new Map();

  constructor(name: string, x: number, y: number, regionSize: number = 4) {
    this.id = `region_${x}_${y}`;
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = regionSize; // Количество чанков в регионе (regionSize x regionSize)
  }

  /**
   * Получить ключ для чанка
   */
  private getChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }

  /**
   * Получить или создать чанк в регионе
   */
  public getOrCreateChunk(chunkX: number, chunkY: number): Chunk {
    const key = this.getChunkKey(chunkX, chunkY);
    let chunk = this.chunks.get(key);
    
    if (!chunk) {
      chunk = new Chunk(chunkX, chunkY);
      this.chunks.set(key, chunk);
    }
    
    return chunk;
  }

  /**
   * Получить чанк по координатам
   */
  public getChunk(chunkX: number, chunkY: number): Chunk | undefined {
    const key = this.getChunkKey(chunkX, chunkY);
    return this.chunks.get(key);
  }

  /**
   * Загрузить чанк в регион
   */
  public loadChunk(chunk: Chunk): void {
    const key = this.getChunkKey(chunk.x, chunk.y);
    this.chunks.set(key, chunk);
  }

  /**
   * Выгрузить чанк из региона
   */
  public unloadChunk(chunkX: number, chunkY: number): boolean {
    const key = this.getChunkKey(chunkX, chunkY);
    const chunk = this.chunks.get(key);
    
    if (chunk) {
      chunk.unload();
      return this.chunks.delete(key);
    }
    
    return false;
  }

  /**
   * Получить все загруженные чанки
   */
  public getLoadedChunks(): Chunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * Проверить, содержит ли регион чанк
   */
  public hasChunk(chunkX: number, chunkY: number): boolean {
    const key = this.getChunkKey(chunkX, chunkY);
    return this.chunks.has(key);
  }

  /**
   * Получить количество загруженных чанков
   */
  public getLoadedChunkCount(): number {
    return this.chunks.size;
  }

  /**
   * Очистить все чанки в регионе
   */
  public unloadAll(): void {
    for (const chunk of this.chunks.values()) {
      chunk.unload();
    }
    this.chunks.clear();
  }

  /**
   * Сериализовать регион
   */
  public serialize(): Record<string, unknown> {
    return {
      x: this.x,
      y: this.y,
      size: this.size,
      chunks: Array.from(this.chunks.values()).map(chunk => chunk.serialize()),
    };
  }

  /**
   * Десериализовать регион
   */
  public static deserialize(data: Record<string, unknown>): Region {
    const region = new Region(
      (data.name as string) || `Region_${data.x}_${data.y}`,
      data.x as number,
      data.y as number,
      data.size as number
    );
    
    const chunks = data.chunks as Array<Record<string, unknown>> | undefined;
    if (chunks) {
      for (const chunkData of chunks) {
        const chunk = Chunk.deserialize(chunkData);
        region.loadChunk(chunk);
      }
    }
    
    return region;
  }
}
