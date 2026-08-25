import { DeterministicRNG } from '../../core/random/DeterministicRNG';
import { Season } from '../time/GameCalendar';
import { BiomeType } from '../biomes/BiomeConfig';
import {
  WeatherType,
  WeatherConditions,
  WeatherEffects,
  WeatherDatabase,
} from './WeatherTypes';

/**
 * Параметры для генерации погоды
 */
export interface WeatherGenerationParams {
  season: Season;
  biome: BiomeType;
  latitude: number;      // -1 до 1 (экватор = 0)
  longitude: number;     // -1 до 1
  totalMinutes: number;  // общее количество минут в игре
  weatherSeed: string;
}

/**
 * Система генерации и управления погодой
 */
export class WeatherSystem {
  private currentWeather: Map<string, WeatherConditions> = new Map();
  
  constructor() {
    // RNG создается локально для каждой генерации на основе seed
  }

  /**
   * Генерирует погоду для конкретной локации
   */
  generateWeather(params: WeatherGenerationParams): WeatherConditions {
    // Создаем уникальный seed для этой локации и времени
    const locationSeed = `${params.weatherSeed}-${params.latitude}-${params.longitude}-${params.totalMinutes}`;
    const localRng = new DeterministicRNG(locationSeed);

    // Определяем базовую температуру от сезона и широты
    const baseTemp = this.calculateBaseTemperature(params.season, params.latitude, params.biome);
    
    // Выбираем тип погоды на основе сезона и случайности
    const weatherType = this.selectWeatherType(
      params.season,
      params.biome,
      baseTemp,
      localRng
    );

    const config = WeatherDatabase[weatherType];
    
    // Генерируем конкретные значения в пределах диапазона конфигурации
    const conditions: WeatherConditions = {
      type: weatherType,
      temperature: this.clamp(
        baseTemp + localRng.nextFloat(-3, 3),
        config.baseTemperature - 10,
        config.baseTemperature + 10
      ),
      precipitation: localRng.nextFloat(...config.precipitationRange),
      windSpeed: localRng.nextFloat(...config.windSpeedRange),
      visibility: localRng.nextFloat(...config.visibilityRange),
      humidity: localRng.nextFloat(...config.humidityRange),
      cloudCover: localRng.nextFloat(...config.cloudCoverRange),
      intensity: localRng.nextFloat(0.3, 1.0),
    };

    return conditions;
  }

  /**
   * Рассчитывает базовую температуру на основе сезона, широты и биома
   */
  private calculateBaseTemperature(
    season: Season,
    latitude: number,
    biome: BiomeType
  ): number {
    // Базовая температура от широты (экватор жарче)
    const latFactor = Math.abs(latitude);
    let baseTemp = 25 - (latFactor * 30); // От 25°C на экваторе до -5°C на полюсах

    // Модификатор сезона
    const seasonModifiers: Record<Season, number> = {
      [Season.SPRING]: 5,
      [Season.SUMMER]: 15,
      [Season.AUTUMN]: -5,
      [Season.WINTER]: -20,
    };
    baseTemp += seasonModifiers[season];

    // Модификатор биома
    const biomeModifiers: Record<BiomeType, number> = {
      'ocean': 0,
      'forest': 2,
      'plains': 3,
      'desert': 10,
      'mountain': -10,
      'tundra': -15,
      'coast': 2,
      'swamp': 0,
      'jungle': 8,
      'savanna': 7,
      'taiga': -5,
      'underground': 5,
    };
    baseTemp += biomeModifiers[biome] || 0;

    return Math.round(baseTemp);
  }

  /**
   * Выбирает тип погоды на основе сезона, биома и температуры
   */
  private selectWeatherType(
    season: Season,
    biome: BiomeType,
    temperature: number,
    rng: DeterministicRNG
  ): WeatherType {
    // Шансы погоды в зависимости от сезона
    const seasonWeights: Record<Season, Record<WeatherType, number>> = {
      [Season.SPRING]: {
        [WeatherType.CLEAR]: 0.25,
        [WeatherType.RAIN]: 0.35,
        [WeatherType.FOG]: 0.15,
        [WeatherType.STORM]: 0.10,
        [WeatherType.WINDY]: 0.10,
        [WeatherType.SNOW]: 0.02,
        [WeatherType.HEATWAVE]: 0.01,
        [WeatherType.FREEZE]: 0.02,
      },
      [Season.SUMMER]: {
        [WeatherType.CLEAR]: 0.35,
        [WeatherType.RAIN]: 0.20,
        [WeatherType.HEATWAVE]: 0.15,
        [WeatherType.STORM]: 0.15,
        [WeatherType.WINDY]: 0.08,
        [WeatherType.FOG]: 0.04,
        [WeatherType.SNOW]: 0.0,
        [WeatherType.FREEZE]: 0.0,
      },
      [Season.AUTUMN]: {
        [WeatherType.CLEAR]: 0.20,
        [WeatherType.RAIN]: 0.30,
        [WeatherType.FOG]: 0.20,
        [WeatherType.WINDY]: 0.15,
        [WeatherType.STORM]: 0.08,
        [WeatherType.FREEZE]: 0.05,
        [WeatherType.SNOW]: 0.02,
        [WeatherType.HEATWAVE]: 0.0,
      },
      [Season.WINTER]: {
        [WeatherType.SNOW]: 0.35,
        [WeatherType.FREEZE]: 0.25,
        [WeatherType.CLEAR]: 0.15,
        [WeatherType.FOG]: 0.10,
        [WeatherType.WINDY]: 0.10,
        [WeatherType.STORM]: 0.03,
        [WeatherType.RAIN]: 0.02,
        [WeatherType.HEATWAVE]: 0.0,
      },
    };

    const weights = seasonWeights[season];
    
    // Корректировка для биома
    if (biome === 'desert') {
      weights[WeatherType.RAIN] *= 0.2;
      weights[WeatherType.HEATWAVE] *= 2;
    } else if (biome === 'tundra' || biome === 'mountain') {
      weights[WeatherType.SNOW] *= 1.5;
      weights[WeatherType.FREEZE] *= 1.3;
    } else if (biome === 'jungle') {
      weights[WeatherType.RAIN] *= 1.5;
      weights[WeatherType.STORM] *= 1.3;
    }

    // Корректировка по температуре
    if (temperature > 30) {
      weights[WeatherType.HEATWAVE] *= 2;
      weights[WeatherType.SNOW] = 0;
      weights[WeatherType.FREEZE] = 0;
    } else if (temperature < 0) {
      weights[WeatherType.SNOW] *= 2;
      weights[WeatherType.FREEZE] *= 1.5;
      weights[WeatherType.HEATWAVE] = 0;
      weights[WeatherType.RAIN] *= 0.3;
    }

    // Нормализация весов
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const normalizedWeights = Object.entries(weights).map(([type, weight]) => ({
      type: type as WeatherType,
      weight: weight / totalWeight,
    }));

    // Выбор типа погоды
    const roll = rng.nextFloat(0, 1);
    let cumulative = 0;
    
    for (const { type, weight } of normalizedWeights) {
      cumulative += weight;
      if (roll <= cumulative) {
        return type;
      }
    }

    return WeatherType.CLEAR;
  }

  /**
   * Получает эффекты погоды для текущих условий
   */
  getWeatherEffects(conditions: WeatherConditions): WeatherEffects {
    const config = WeatherDatabase[conditions.type];
    const baseEffects = config.effects;

    // Применяем интенсивность погоды к эффектам
    const intensity = conditions.intensity;
    
    return {
      speedModifier: this.lerp(1.0, baseEffects.speedModifier || 1.0, intensity),
      visibilityModifier: this.lerp(1.0, baseEffects.visibilityModifier || 1.0, intensity),
      combatModifier: this.lerp(1.0, baseEffects.combatModifier || 1.0, intensity),
      tradeModifier: this.lerp(1.0, baseEffects.tradeModifier || 1.0, intensity),
      cropModifier: this.lerp(1.0, baseEffects.cropModifier || 1.0, intensity),
      huntingModifier: this.lerp(1.0, baseEffects.huntingModifier || 1.0, intensity),
      eventChance: (baseEffects.eventChance || 0.1) * intensity,
      roadAccessibility: this.lerp(1.0, baseEffects.roadAccessibility || 1.0, intensity),
      npcActivityModifier: this.lerp(1.0, baseEffects.npcActivityModifier || 1.0, intensity),
    };
  }

  /**
   * Проверяет, влияет ли погода на доступность дороги
   */
  isRoadAccessible(conditions: WeatherConditions): boolean {
    const effects = this.getWeatherEffects(conditions);
    return effects.roadAccessibility >= 0.5;
  }

  /**
   * Обновляет погоду для локации
   */
  updateWeather(locationId: string, conditions: WeatherConditions): void {
    this.currentWeather.set(locationId, conditions);
  }

  /**
   * Получает текущую погоду для локации
   */
  getCurrentWeather(locationId: string): WeatherConditions | undefined {
    return this.currentWeather.get(locationId);
  }

  /**
   * Очищает кэш погоды
   */
  clearCache(): void {
    this.currentWeather.clear();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }
}

export const weatherSystem = new WeatherSystem();
