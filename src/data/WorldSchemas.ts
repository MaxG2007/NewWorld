import { BaseEntity, EntityRef } from './BaseTypes';

/**
 * Seed для генерации мира
 */
export interface WorldSeed extends BaseEntity {
  seed: string;
  terrainSeed: string;
  civilizationSeed: string;
  familySeed: string;
  eventSeed: string;
  dungeonSeed: string;
  lootSeed: string;
  createdAt: number;
}

/**
 * Климатические условия
 */
export interface Climate extends BaseEntity {
  temperature: number; // средняя температура
  humidity: number; // влажность 0-1
  precipitation: number; // осадки мм/год
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  windSpeed: number;
  windDirection: number;
}

/**
 * Биом территории
 */
export interface Biome extends BaseEntity {
  name: string;
  type:
    | 'forest'
    | 'plains'
    | 'desert'
    | 'tundra'
    | 'mountain'
    | 'swamp'
    | 'coast'
    | 'jungle'
    | 'savanna'
    | 'taiga'
    | 'underground';
  vegetation: string[];
  resources: string[];
  soilType: string;
  climate: EntityRef<'Climate'>;
  fauna: string[];
  dangerLevel: number; // 0-10
  typicalNPCs: string[]; // ссылки на типы NPC
}

/**
 * Чанк мира
 */
export interface Chunk extends BaseEntity {
  x: number;
  y: number;
  size: number;
  biome: EntityRef<'Biome'>;
  elevation: number[][]; // карта высот
  terrain: number[][]; // тип местности
  structures: EntityRef<'Building' | 'Dungeon'>[];
  entities: EntityRef<'NPC' | 'Item'>[];
  stateDelta: Record<string, unknown>;
  isLoaded: boolean;
}
