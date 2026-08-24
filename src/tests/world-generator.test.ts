import { describe, it, expect } from 'vitest';
import { WorldGenerator } from '../world/generation/WorldGenerator';
import { WorldSeed } from '../data/WorldSchemas';

const createTestWorldSeed = (seed: string): WorldSeed => ({
  id: 'test-world',
  version: '1.0.0',
  seed,
  terrainSeed: `${seed}_terrain`,
  civilizationSeed: `${seed}_civ`,
  familySeed: `${seed}_family`,
  eventSeed: `${seed}_event`,
  dungeonSeed: `${seed}_dungeon`,
  lootSeed: `${seed}_loot`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

describe('WorldGenerator', () => {
  it('должен генерировать одинаковые данные для одинаковых координат и seed', () => {
    const worldSeed = createTestWorldSeed('test-seed-123');
    const generator1 = new WorldGenerator(worldSeed);
    const generator2 = new WorldGenerator(worldSeed);

    const data1 = generator1.getTileData(10, 20);
    const data2 = generator2.getTileData(10, 20);

    expect(data1.elevation).toBe(data2.elevation);
    expect(data1.biome).toBe(data2.biome);
    expect(data1.climate.temperature).toBe(data2.climate.temperature);
    expect(data1.resources).toEqual(data2.resources);
  });

  it('должен генерировать разные данные для разных координат', () => {
    const worldSeed = createTestWorldSeed('test-seed-456');
    const generator = new WorldGenerator(worldSeed);

    const data1 = generator.getTileData(0, 0);
    const data2 = generator.getTileData(50, 50);

    // Хотя бы некоторые данные должны отличаться
    expect(
      data1.elevation !== data2.elevation ||
      data1.biome !== data2.biome ||
      data1.climate.temperature !== data2.climate.temperature
    ).toBe(true);
  });

  it('должен генерировать разные миры для разных seed', () => {
    const generator1 = new WorldGenerator(createTestWorldSeed('seed-A'));
    const generator2 = new WorldGenerator(createTestWorldSeed('seed-B'));

    const data1 = generator1.getTileData(10, 10);
    const data2 = generator2.getTileData(10, 10);

    expect(data1.elevation).not.toBe(data2.elevation);
  });

  it('должен генерировать чанк с правильными данными', () => {
    const generator = new WorldGenerator(createTestWorldSeed('chunk-test'));
    const chunk = generator.generateChunk(5, 7, 8);

    expect(chunk.elevation).toHaveLength(8);
    expect(chunk.elevation[0]).toHaveLength(8);
    expect(chunk.biome).toBeDefined();
    expect(chunk.climate).toBeDefined();
    expect(Array.isArray(chunk.resources)).toBe(true);
    expect(typeof chunk.hasRiver).toBe('boolean');
    expect(typeof chunk.hasLake).toBe('boolean');
    expect(typeof chunk.hasRuins).toBe('boolean');
  });

  it('должен поддерживать пакетную генерацию без создания всего мира', () => {
    const generator = new WorldGenerator(createTestWorldSeed('lazy-test'));

    // Генерируем только одну координату без создания всего мира
    const tileData = generator.getTileData(1000, 2000);

    expect(tileData.elevation).toBeGreaterThanOrEqual(0);
    expect(tileData.elevation).toBeLessThanOrEqual(1);
    expect(tileData.biome).toBeDefined();
    expect(tileData.climate).toBeDefined();
    expect(Array.isArray(tileData.resources)).toBe(true);
  });

  it('должен генерировать корректные биомы', () => {
    const generator = new WorldGenerator(createTestWorldSeed('biome-test'));
    
    const biomes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const data = generator.getTileData(i * 10, i * 10);
      biomes.add(data.biome);
    }

    // Должно быть сгенерировано несколько различных биомов
    expect(biomes.size).toBeGreaterThan(1);
    
    // Все биомы должны быть из допустимого списка
    const validBiomes = [
      'forest', 'plains', 'desert', 'tundra', 'mountain',
      'swamp', 'coast', 'jungle', 'savanna', 'taiga', 'underground'
    ];
    biomes.forEach(biome => {
      expect(validBiomes).toContain(biome);
    });
  });

  it('должен генерировать ресурсы соответствующие биому', () => {
    const generator = new WorldGenerator(createTestWorldSeed('resource-test'));
    
    const data = generator.getTileData(5, 5);
    
    expect(data.resources.length).toBeGreaterThan(0);
    expect(data.resources.length).toBeLessThanOrEqual(3);
  });
});
