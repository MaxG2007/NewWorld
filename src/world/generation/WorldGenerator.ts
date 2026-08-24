import { DeterministicRNG } from '../../core/random/DeterministicRNG';
import { RandomStreams } from '../../core/random/RandomStreams';
import { WorldSeed, Climate } from '../../data/WorldSchemas';

/**
 * Координата в мире
 */
export interface WorldCoord {
  x: number;
  y: number;
}

/**
 * Данные чанка для генерации
 */
export interface ChunkData {
  x: number;
  y: number;
  size: number;
}

/**
 * Результат генерации чанка
 */
export interface GeneratedChunk {
  elevation: number[][];
  biome: string;
  climate: Climate;
  resources: string[];
  hasRiver: boolean;
  hasLake: boolean;
  hasRuins: boolean;
}

/**
 * Генератор мира на основе seed
 * Генерирует данные пакетами (чанками) без создания всей карты в памяти
 */
export class WorldGenerator {
  private worldSeed: WorldSeed;
  private streams: RandomStreams;

  constructor(worldSeed: WorldSeed) {
    this.worldSeed = worldSeed;
    this.streams = new RandomStreams(worldSeed.seed);
  }

  /**
   * Генерирует высоту для конкретной координаты
   * Использует упрощенный шум Перлина на основе RNG
   */
  getElevation(x: number, y: number): number {
    // "Смешиваем" координаты с базовым seed мира для детерминированности
    const coordSeed = this.hashCoordinates(x, y);
    const localRng = new DeterministicRNG(coordSeed);
    
    // Базовая высота с "шумом"
    const baseHeight = localRng.nextFloat(0, 1);
    const noise = localRng.nextFloat(-0.3, 0.3);
    
    return Math.max(0, Math.min(1, baseHeight + noise));
  }

  /**
   * Хэширует координаты с учетом world seed
   */
  private hashCoordinates(x: number, y: number): number {
    // Используем FNV-1a подобный хэш с seed мира
    const seedHash = new DeterministicRNG(this.worldSeed.seed).nextInt(0, 0xFFFFFFFF);
    let hash = seedHash ^ (x * 73856093) ^ (y * 19349663);
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    return (hash ^ (hash >>> 16)) >>> 0;
  }

  /**
   * Определяет биом для координаты на основе высоты и климата
   */
  getBiome(x: number, y: number, elevation: number): string {
    const rng = this.streams.biome.derive(x * 1000 + y);
    
    const temperature = this.getTemperature(x, y);
    const humidity = this.getHumidity(x, y);
    
    // Определение биома по температуре и влажности
    if (elevation > 0.8) {
      return 'mountain';
    }
    
    if (temperature < 0.2) {
      return humidity > 0.5 ? 'tundra' : 'desert';
    }
    
    if (humidity > 0.7) {
      if (temperature > 0.7) return 'jungle';
      return 'forest';
    }
    
    if (humidity < 0.3) {
      if (temperature > 0.6) return 'desert';
      return 'savanna';
    }
    
    if (temperature > 0.5 && humidity > 0.4) {
      return 'plains';
    }
    
    return rng.nextArrayElement(['forest', 'plains', 'taiga']);
  }

  /**
   * Получает температуру для координаты
   */
  getTemperature(x: number, y: number): number {
    const rng = this.streams.climate.derive(x + y * 1000);
    // Имитация температурных зон (экватор теплее)
    const latFactor = 1 - Math.abs((y % 100) - 50) / 50;
    const baseTemp = latFactor * 0.5 + 0.25;
    const variation = rng.nextFloat(-0.2, 0.2);
    return Math.max(0, Math.min(1, baseTemp + variation));
  }

  /**
   * Получает влажность для координаты
   */
  getHumidity(x: number, y: number): number {
    const rng = this.streams.climate.derive(x * 1000 + y * 2);
    return rng.nextFloat(0, 1);
  }

  /**
   * Генерирует климат для координаты
   */
  getClimate(x: number, y: number): Climate {
    const rng = this.streams.climate.derive(x * 2000 + y * 3);
    const temperature = this.getTemperature(x, y);
    const humidity = this.getHumidity(x, y);
    
    const seasons: Climate['season'][] = ['spring', 'summer', 'autumn', 'winter'];
    
    return {
      id: `climate_${x}_${y}`,
      version: '1.0.0',
      temperature: temperature * 40 - 10, // от -10 до 30°C
      humidity,
      precipitation: humidity * rng.nextFloat(500, 2000),
      season: rng.nextArrayElement(seasons),
      windSpeed: rng.nextFloat(0, 30),
      windDirection: rng.nextInt(0, 360),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Генерирует ресурсы для координаты
   */
  getResources(x: number, y: number, biome: string): string[] {
    const rng = this.streams.resource.derive(x * 3000 + y * 4);
    
    const resourcePools: Record<string, string[]> = {
      forest: ['wood', 'herbs', 'game', 'mushrooms'],
      plains: ['grain', 'livestock', 'wool'],
      mountain: ['ore', 'gems', 'stone', 'metal'],
      desert: ['salt', 'oil', 'glass_sand'],
      tundra: ['fur', 'ice', 'fish'],
      jungle: ['exotic_wood', 'spices', 'rare_herbs'],
      savanna: ['ivory', 'gold', 'cattle'],
      taiga: ['pine_wood', 'fur', 'berries'],
      swamp: ['peat', 'reeds', 'fish'],
      coast: ['fish', 'salt', 'pearls'],
      underground: ['deep_ore', 'crystals', 'ancient_artifacts'],
    };
    
    const pool = resourcePools[biome] || resourcePools.plains;
    const resourceCount = rng.nextInt(1, 3);
    const resources: string[] = [];
    
    for (let i = 0; i < resourceCount; i++) {
      const resource = rng.nextArrayElement(pool);
      if (!resources.includes(resource)) {
        resources.push(resource);
      }
    }
    
    return resources;
  }

  /**
   * Проверяет наличие реки в чанке
   */
  hasRiver(x: number, y: number): boolean {
    const rng = this.streams.road.derive(x * 4000 + y * 5);
    // Реки чаще в низинах
    const elevation = this.getElevation(x, y);
    if (elevation > 0.6) return false;
    return rng.nextBoolean();
  }

  /**
   * Проверяет наличие озера в чанке
   */
  hasLake(x: number, y: number): boolean {
    const rng = this.streams.terrain.derive(x * 5000 + y * 6);
    const elevation = this.getElevation(x, y);
    if (elevation > 0.5) return false;
    return rng.nextFloat(0, 1) > 0.85;
  }

  /**
   * Проверяет наличие древних руин
   */
  hasRuins(x: number, y: number): boolean {
    const rng = this.streams.ruin.derive(x * 6000 + y * 7);
    return rng.nextFloat(0, 1) > 0.95;
  }

  /**
   * Генерирует чанк по координатам
   * Это основная функция пакетной генерации
   */
  generateChunk(chunkX: number, chunkY: number, chunkSize: number = 16): GeneratedChunk {
    const centerX = chunkX * chunkSize;
    const centerY = chunkY * chunkSize;
    
    // Генерируем карту высот для чанка
    const elevation: number[][] = [];
    for (let y = 0; y < chunkSize; y++) {
      const row: number[] = [];
      for (let x = 0; x < chunkSize; x++) {
        row.push(this.getElevation(centerX + x, centerY + y));
      }
      elevation.push(row);
    }
    
    // Средняя высота для определения биома
    const avgElevation = elevation.flat().reduce((a, b) => a + b, 0) / (chunkSize * chunkSize);
    const biome = this.getBiome(centerX, centerY, avgElevation);
    const climate = this.getClimate(centerX, centerY);
    const resources = this.getResources(centerX, centerY, biome);
    
    return {
      elevation,
      biome,
      climate,
      resources,
      hasRiver: this.hasRiver(centerX, centerY),
      hasLake: this.hasLake(centerX, centerY),
      hasRuins: this.hasRuins(centerX, centerY),
    };
  }

  /**
   * Получает данные для любой координаты без генерации всего мира
   * Ключевая функция для Definition of Done
   */
  getTileData(x: number, y: number): {
    elevation: number;
    biome: string;
    climate: Climate;
    resources: string[];
    hasRiver: boolean;
    hasLake: boolean;
    hasRuins: boolean;
  } {
    const elevation = this.getElevation(x, y);
    const biome = this.getBiome(x, y, elevation);
    const climate = this.getClimate(x, y);
    const resources = this.getResources(x, y, biome);
    
    return {
      elevation,
      biome,
      climate,
      resources,
      hasRiver: this.hasRiver(x, y),
      hasLake: this.hasLake(x, y),
      hasRuins: this.hasRuins(x, y),
    };
  }
}
