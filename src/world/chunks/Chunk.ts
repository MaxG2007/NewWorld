/**
 * Chunk - минимальная единица мира для потоковой загрузки
 */

import { BiomeType } from '../biomes/BiomeConfig';

export interface TileData {
  x: number;
  y: number;
  height: number;
  biome: BiomeType;
  temperature: number;
  humidity: number;
  resources: string[];
  structureId?: string;
}

export interface EntityRef {
  id: string;
  type: 'npc' | 'animal' | 'item' | 'building';
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

export interface StructureData {
  id: string;
  type: 'ruin' | 'dungeon' | 'settlement' | 'road' | 'bridge';
  tiles: Array<{ x: number; y: number }>;
  data: Record<string, unknown>;
}

export interface StateDelta {
  timestamp: number;
  changes: Array<{
    type: 'tile' | 'entity' | 'structure';
    action: 'create' | 'update' | 'delete';
    id: string;
    data?: unknown;
  }>;
}

export class Chunk {
  public readonly x: number;
  public readonly y: number;
  public readonly size: number;
  
  private terrain: Map<string, TileData> = new Map();
  private structures: Map<string, StructureData> = new Map();
  private entities: Map<string, EntityRef> = new Map();
  private stateDelta: StateDelta | null = null;
  
  private isLoaded: boolean = false;
  private lastAccessTime: number = 0;
  private isDirty: boolean = false;

  constructor(x: number, y: number, size: number = 16) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.lastAccessTime = Date.now();
  }

  /**
   * Получить ключ для тайла внутри чанка
   */
  private getTileKey(localX: number, localY: number): string {
    return `${localX},${localY}`;
  }

  /**
   * Получить глобальные координаты из локальных
   */
  public toGlobalX(localX: number): number {
    return this.x * this.size + localX;
  }

  public toGlobalY(localY: number): number {
    return this.y * this.size + localY;
  }

  /**
   * Получить локальные координаты из глобальных
   */
  public toLocalX(globalX: number): number {
    return globalX % this.size;
  }

  public toLocalY(globalY: number): number {
    return globalY % this.size;
  }

  /**
   * Инициализироватьterrain данные чанка
   */
  public setTerrain(tiles: TileData[]): void {
    this.terrain.clear();
    for (const tile of tiles) {
      const key = this.getTileKey(tile.x, tile.y);
      this.terrain.set(key, tile);
    }
    this.isLoaded = true;
    this.isDirty = false;
  }

  /**
   * Получить данные тайла
   */
  public getTile(localX: number, localY: number): TileData | undefined {
    const key = this.getTileKey(localX, localY);
    const tile = this.terrain.get(key);
    if (tile) {
      this.lastAccessTime = Date.now();
    }
    return tile;
  }

  /**
   * Обновить данные тайла
   */
  public setTile(localX: number, localY: number, data: Partial<TileData>): void {
    const key = this.getTileKey(localX, localY);
    const existing = this.terrain.get(key);
    
    if (existing) {
      this.terrain.set(key, { ...existing, ...data });
      this.isDirty = true;
    } else {
      this.terrain.set(key, {
        x: localX,
        y: localY,
        height: data.height ?? 0,
        biome: data.biome ?? 'ocean',
        temperature: data.temperature ?? 0,
        humidity: data.humidity ?? 0,
        resources: data.resources ?? [],
      });
      this.isDirty = true;
    }
    
    this.lastAccessTime = Date.now();
  }

  /**
   * Добавить структуру
   */
  public addStructure(structure: StructureData): void {
    this.structures.set(structure.id, structure);
    this.isDirty = true;
    this.lastAccessTime = Date.now();
  }

  /**
   * Получить структуру по ID
   */
  public getStructure(id: string): StructureData | undefined {
    return this.structures.get(id);
  }

  /**
   * Получить все структуры в чанке
   */
  public getStructures(): StructureData[] {
    return Array.from(this.structures.values());
  }

  /**
   * Удалить структуру
   */
  public removeStructure(id: string): boolean {
    const deleted = this.structures.delete(id);
    if (deleted) {
      this.isDirty = true;
    }
    return deleted;
  }

  /**
   * Добавить сущность
   */
  public addEntity(entity: EntityRef): void {
    this.entities.set(entity.id, entity);
    this.isDirty = true;
    this.lastAccessTime = Date.now();
  }

  /**
   * Получить сущность по ID
   */
  public getEntity(id: string): EntityRef | undefined {
    return this.entities.get(id);
  }

  /**
   * Получить все сущности в чанке
   */
  public getEntities(): EntityRef[] {
    return Array.from(this.entities.values());
  }

  /**
   * Удалить сущность
   */
  public removeEntity(id: string): boolean {
    const deleted = this.entities.delete(id);
    if (deleted) {
      this.isDirty = true;
    }
    return deleted;
  }

  /**
   * Записать delta изменений состояния
   */
  public setStateDelta(delta: StateDelta): void {
    this.stateDelta = delta;
    this.isDirty = true;
  }

  /**
   * Получить delta изменений
   */
  public getStateDelta(): StateDelta | null {
    return this.stateDelta;
  }

  /**
   * Сбросить delta после сохранения
   */
  public clearStateDelta(): void {
    this.stateDelta = null;
    this.isDirty = false;
  }

  /**
   * Проверить, загружен ли чанк
   */
  public getIsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Получить время последнего доступа
   */
  public getLastAccessTime(): number {
    return this.lastAccessTime;
  }

  /**
   * Проверить, есть ли несохраненные изменения
   */
  public getIsDirty(): boolean {
    return this.isDirty;
  }

  /**
   * Сериализовать чанк для сохранения
   */
  public serialize(): Record<string, unknown> {
    return {
      x: this.x,
      y: this.y,
      size: this.size,
      terrain: Array.from(this.terrain.values()),
      structures: Array.from(this.structures.values()),
      entities: Array.from(this.entities.values()),
      stateDelta: this.stateDelta,
    };
  }

  /**
   * Десериализовать чанк из данных
   */
  public static deserialize(data: Record<string, unknown>): Chunk {
    const chunk = new Chunk(
      data.x as number,
      data.y as number,
      data.size as number
    );
    
    const terrain = data.terrain as TileData[] | undefined;
    if (terrain) {
      chunk.setTerrain(terrain);
    }
    
    const structures = data.structures as StructureData[] | undefined;
    if (structures) {
      for (const structure of structures) {
        chunk.addStructure(structure);
      }
    }
    
    const entities = data.entities as EntityRef[] | undefined;
    if (entities) {
      for (const entity of entities) {
        chunk.addEntity(entity);
      }
    }
    
    const stateDelta = data.stateDelta as StateDelta | undefined;
    if (stateDelta) {
      chunk.setStateDelta(stateDelta);
    }
    
    return chunk;
  }

  /**
   * Очистить память чанка (для выгрузки)
   */
  public unload(): void {
    this.terrain.clear();
    this.structures.clear();
    this.entities.clear();
    this.stateDelta = null;
    this.isLoaded = false;
  }
}
