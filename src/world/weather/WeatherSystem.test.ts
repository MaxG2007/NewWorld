import { describe, it, expect } from 'vitest';
import { WeatherType, WeatherDatabase } from './WeatherTypes';
import { weatherSystem, WeatherGenerationParams } from './WeatherSystem';
import { Season } from '../time/GameCalendar';
import { BiomeType } from '../biomes/BiomeConfig';

describe('WeatherSystem', () => {
  describe('Weather Types', () => {
    it('должен содержать все требуемые типы погоды', () => {
      const requiredTypes = [
        WeatherType.CLEAR,
        WeatherType.RAIN,
        WeatherType.SNOW,
        WeatherType.FOG,
        WeatherType.STORM,
        WeatherType.HEATWAVE,
        WeatherType.FREEZE,
        WeatherType.WINDY,
      ];

      requiredTypes.forEach(type => {
        expect(WeatherDatabase[type]).toBeDefined();
        expect(WeatherDatabase[type].type).toBe(type);
      });
    });

    it('каждый тип погоды должен иметь конфигурацию', () => {
      Object.values(WeatherDatabase).forEach(config => {
        expect(config).toHaveProperty('baseTemperature');
        expect(config).toHaveProperty('precipitationRange');
        expect(config).toHaveProperty('windSpeedRange');
        expect(config).toHaveProperty('visibilityRange');
        expect(config).toHaveProperty('humidityRange');
        expect(config).toHaveProperty('cloudCoverRange');
        expect(config).toHaveProperty('effects');
        expect(config).toHaveProperty('description');
      });
    });
  });

  describe('Weather Generation', () => {
    const baseParams: Omit<WeatherGenerationParams, 'season' | 'biome'> = {
      latitude: 0.5,
      longitude: 0.5,
      totalMinutes: 720,
      weatherSeed: 'test-seed-123',
    };

    it('должен генерировать погоду для разных сезонов', () => {
      const seasons: Season[] = [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER];
      
      seasons.forEach(season => {
        const params: WeatherGenerationParams = {
          ...baseParams,
          season,
          biome: 'plains',
        };
        
        const weather = weatherSystem.generateWeather(params);
        
        expect(weather).toBeDefined();
        expect(weather.type).toBeDefined();
        expect(weather.temperature).toBeDefined();
        expect(weather.visibility).toBeGreaterThanOrEqual(0);
        expect(weather.visibility).toBeLessThanOrEqual(1);
      });
    });

    it('должен генерировать разную погоду для разных биомов', () => {
      const biomes: BiomeType[] = ['desert', 'tundra', 'jungle', 'mountain'];
      
      const results = biomes.map(biome => {
        const params: WeatherGenerationParams = {
          ...baseParams,
          season: Season.SUMMER,
          biome,
        };
        return weatherSystem.generateWeather(params);
      });

      // Проверяем что погода сгенерировалась для всех биомов
      results.forEach(weather => {
        expect(weather).toBeDefined();
        expect(weather.type).toBeDefined();
      });
    });

    it('должен быть детерминированным при одинаковых параметрах', () => {
      const params: WeatherGenerationParams = {
        ...baseParams,
        season: Season.SPRING,
        biome: 'forest',
      };

      const weather1 = weatherSystem.generateWeather(params);
      const weather2 = weatherSystem.generateWeather(params);

      expect(weather1.type).toBe(weather2.type);
      expect(weather1.temperature).toBe(weather2.temperature);
      expect(weather1.visibility).toBe(weather2.visibility);
    });

    it('температура должна зависеть от сезона', () => {
      const summerParams: WeatherGenerationParams = {
        ...baseParams,
        season: Season.SUMMER,
        biome: 'plains',
      };
      
      const winterParams: WeatherGenerationParams = {
        ...baseParams,
        season: Season.WINTER,
        biome: 'plains',
      };

      const summerWeather = weatherSystem.generateWeather(summerParams);
      const winterWeather = weatherSystem.generateWeather(winterParams);

      expect(summerWeather.temperature).toBeGreaterThan(winterWeather.temperature);
    });

    it('в пустыне должно быть жарче чем в тундре', () => {
      const desertParams: WeatherGenerationParams = {
        ...baseParams,
        season: Season.SUMMER,
        biome: 'desert',
      };
      
      const tundraParams: WeatherGenerationParams = {
        ...baseParams,
        season: Season.SUMMER,
        biome: 'tundra',
      };

      const desertWeather = weatherSystem.generateWeather(desertParams);
      const tundraWeather = weatherSystem.generateWeather(tundraParams);

      expect(desertWeather.temperature).toBeGreaterThan(tundraWeather.temperature);
    });
  });

  describe('Weather Effects', () => {
    it('должен возвращать эффекты для ясной погоды', () => {
      const clearConditions = weatherSystem.generateWeather({
        season: Season.SUMMER,
        biome: 'plains',
        latitude: 0.5,
        longitude: 0.5,
        totalMinutes: 720,
        weatherSeed: 'clear-test',
      });

      const effects = weatherSystem.getWeatherEffects(clearConditions);

      expect(effects.speedModifier).toBeGreaterThan(0);
      expect(effects.visibilityModifier).toBeGreaterThan(0);
      expect(effects.combatModifier).toBeGreaterThan(0);
      expect(effects.tradeModifier).toBeGreaterThan(0);
      expect(effects.cropModifier).toBeGreaterThan(0);
      expect(effects.huntingModifier).toBeGreaterThan(0);
      expect(effects.roadAccessibility).toBeGreaterThanOrEqual(0);
      expect(effects.roadAccessibility).toBeLessThanOrEqual(1);
    });

    it('шторм должен снижать видимость и скорость', () => {
      const stormConfig = WeatherDatabase[WeatherType.STORM];
      const effects = weatherSystem.getWeatherEffects({
        type: WeatherType.STORM,
        temperature: stormConfig.baseTemperature,
        precipitation: 0.9,
        windSpeed: 30,
        visibility: 0.3,
        humidity: 0.9,
        cloudCover: 0.95,
        intensity: 1.0,
      });

      expect(effects.visibilityModifier).toBeLessThan(0.6);
      expect(effects.speedModifier).toBeLessThan(0.7);
      expect(effects.roadAccessibility).toBeLessThan(0.5);
    });

    it('снег должен снижать доступность дорог', () => {
      const snowConfig = WeatherDatabase[WeatherType.SNOW];
      const effects = weatherSystem.getWeatherEffects({
        type: WeatherType.SNOW,
        temperature: snowConfig.baseTemperature,
        precipitation: 0.8,
        windSpeed: 15,
        visibility: 0.4,
        humidity: 0.7,
        cloudCover: 0.9,
        intensity: 1.0,
      });

      expect(effects.roadAccessibility).toBeLessThan(0.6);
    });

    it('туман должен сильно снижать видимость', () => {
      const fogConfig = WeatherDatabase[WeatherType.FOG];
      const effects = weatherSystem.getWeatherEffects({
        type: WeatherType.FOG,
        temperature: fogConfig.baseTemperature,
        precipitation: 0.1,
        windSpeed: 2,
        visibility: 0.2,
        humidity: 0.9,
        cloudCover: 0.7,
        intensity: 1.0,
      });

      expect(effects.visibilityModifier).toBeLessThan(0.5);
    });
  });

  describe('Road Accessibility', () => {
    it('ясная погода не должна блокировать дороги', () => {
      const clearConditions = {
        type: WeatherType.CLEAR,
        temperature: 20,
        precipitation: 0,
        windSpeed: 3,
        visibility: 0.95,
        humidity: 0.5,
        cloudCover: 0.1,
        intensity: 0.5,
      };

      expect(weatherSystem.isRoadAccessible(clearConditions)).toBe(true);
    });

    it('сильный снегопад может блокировать дороги', () => {
      const heavySnowConditions = {
        type: WeatherType.SNOW,
        temperature: -10,
        precipitation: 1.0,
        windSpeed: 25,
        visibility: 0.2,
        humidity: 0.9,
        cloudCover: 1.0,
        intensity: 1.0,
      };

      expect(weatherSystem.isRoadAccessible(heavySnowConditions)).toBe(false);
    });
  });

  describe('Weather Cache', () => {
    it('должен сохранять и возвращать погоду для локации', () => {
      const locationId = 'test-location-1';
      const conditions = {
        type: WeatherType.RAIN,
        temperature: 15,
        precipitation: 0.7,
        windSpeed: 10,
        visibility: 0.6,
        humidity: 0.8,
        cloudCover: 0.8,
        intensity: 0.8,
      };

      weatherSystem.updateWeather(locationId, conditions);
      const retrieved = weatherSystem.getCurrentWeather(locationId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe(WeatherType.RAIN);
      expect(retrieved?.temperature).toBe(15);
    });

    it('должен очищать кэш', () => {
      const locationId = 'test-location-2';
      const conditions = {
        type: WeatherType.CLEAR,
        temperature: 25,
        precipitation: 0,
        windSpeed: 5,
        visibility: 1.0,
        humidity: 0.4,
        cloudCover: 0.1,
        intensity: 0.5,
      };

      weatherSystem.updateWeather(locationId, conditions);
      weatherSystem.clearCache();
      const retrieved = weatherSystem.getCurrentWeather(locationId);

      expect(retrieved).toBeUndefined();
    });
  });
});
