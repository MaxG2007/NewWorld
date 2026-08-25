import type { BiomeConfig } from '../world/biomes/BiomeConfig';
import { BiomeDatabase } from '../world/biomes/BiomeDatabase';
import { describe, it, expect } from 'vitest';

describe('BiomeDatabase', () => {
  it('должен содержать все требуемые биомы', () => {
    const requiredBiomes = [
      'plains',      // поля
      'forest',      // леса
      'swamp',       // болота
      'desert',      // пустыни
      'mountain',    // горы
      'tundra',      // тундру
      'coast',       // побережье
      'river',       // реки
      'lake',        // озёра
      'underground', // подземные зоны
    ];

    requiredBiomes.forEach(biomeId => {
      expect(BiomeDatabase.hasBiome(biomeId)).toBe(true);
    });
  });

  it('каждый биом должен иметь растительность', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.vegetation).toBeDefined();
      expect(Array.isArray(biome.vegetation)).toBe(true);
      expect(biome.vegetation.length).toBeGreaterThan(0);
    });
  });

  it('каждый биом должен иметь животных', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.fauna).toBeDefined();
      expect(Array.isArray(biome.fauna)).toBe(true);
      expect(biome.fauna.length).toBeGreaterThan(0);
    });
  });

  it('каждый биом должен иметь ресурсы', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.resources).toBeDefined();
      expect(Array.isArray(biome.resources)).toBe(true);
      expect(biome.resources.length).toBeGreaterThan(0);
    });
  });

  it('каждый биом должен иметь тип почвы', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.soilType).toBeDefined();
      expect(typeof biome.soilType).toBe('string');
    });
  });

  it('каждый биом должен иметь климат', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.climate).toBeDefined();
      expect(biome.climate.temperatureRange).toBeDefined();
      expect(biome.climate.humidityRange).toBeDefined();
      expect(biome.climate.precipitationLevel).toBeDefined();
      expect(biome.climate.seasonalVariation).toBeDefined();
    });
  });

  it('каждый биом должен иметь шанс событий', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.eventChance).toBeDefined();
      expect(typeof biome.eventChance).toBe('number');
      expect(biome.eventChance).toBeGreaterThanOrEqual(0);
      expect(biome.eventChance).toBeLessThanOrEqual(1);
    });
  });

  it('каждый биом должен иметь характерных NPC', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.characteristicNPCs).toBeDefined();
      expect(Array.isArray(biome.characteristicNPCs)).toBe(true);
      expect(biome.characteristicNPCs.length).toBeGreaterThan(0);
    });
  });

  it('каждый биом должен иметь опасности', () => {
    const allBiomes = BiomeDatabase.getAllBiomes();
    
    allBiomes.forEach((biome: BiomeConfig) => {
      expect(biome.hazards).toBeDefined();
      expect(Array.isArray(biome.hazards)).toBe(true);
      expect(biome.hazards.length).toBeGreaterThan(0);
      
      // Проверяем структуру каждой опасности
      biome.hazards.forEach((hazard: { id: string; name: string; type: string; severity: string; description: string }) => {
        expect(hazard.id).toBeDefined();
        expect(hazard.name).toBeDefined();
        expect(hazard.type).toBeDefined();
        expect(hazard.severity).toBeDefined();
        expect(hazard.description).toBeDefined();
      });
    });
  });

  it('должен определять биом по параметрам среды', () => {
    // Горы - высокая высота
    expect(BiomeDatabase.determineBiome(0.85, 0.3, 0.4)).toBe('mountain');
    
    // Пустыня - высокая температура, низкая влажность
    expect(BiomeDatabase.determineBiome(0.3, 0.8, 0.1)).toBe('desert');
    
    // Тундра - низкая температура
    expect(BiomeDatabase.determineBiome(0.2, 0.1, 0.4)).toBe('tundra');
    
    // Побережье - очень низкая высота (но не слишком высокая влажность чтобы не было болотом)
    expect(BiomeDatabase.determineBiome(0.05, 0.5, 0.6)).toBe('coast');
  });

  it('должен возвращать конфигурацию биома по ID', () => {
    const forest = BiomeDatabase.getBiome('forest');
    expect(forest).toBeDefined();
    expect(forest!.id).toBe('forest');
    expect(forest!.name).toBe('Лес');
  });

  it('должен возвращать undefined для несуществующего биома', () => {
    const nonexistent = BiomeDatabase.getBiome('nonexistent_biome');
    expect(nonexistent).toBeUndefined();
  });
});
