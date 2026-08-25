/**
 * Типы погоды
 */
export enum WeatherType {
  CLEAR = 'clear',           // Ясно
  RAIN = 'rain',             // Дождь
  SNOW = 'snow',             // Снег
  FOG = 'fog',               // Туман
  STORM = 'storm',           // Гроза
  HEATWAVE = 'heatwave',     // Жара
  FREEZE = 'freeze',         // Холод
  WINDY = 'windy',           // Ветрено
}

/**
 * Параметры погоды
 */
export interface WeatherConditions {
  type: WeatherType;
  temperature: number;       // Температура в °C
  precipitation: number;     // Осадки (0-1)
  windSpeed: number;         // Скорость ветра (м/с)
  visibility: number;        // Видимость (0-1)
  humidity: number;          // Влажность (0-1)
  cloudCover: number;        // Облачность (0-1)
  intensity: number;         // Интенсивность (0-1)
}

/**
 * Эффекты погоды на игровой процесс
 */
export interface WeatherEffects {
  speedModifier: number;     // Модификатор скорости персонажа
  visibilityModifier: number;// Модификатор видимости
  combatModifier: number;    // Модификатор боя
  tradeModifier: number;     // Модификатор торговли
  cropModifier: number;      // Модификатор урожая
  huntingModifier: number;   // Модификатор охоты
  eventChance: number;       // Шанс событий
  roadAccessibility: number; // Доступность дорог (0-1)
  npcActivityModifier: number;// Модификатор активности NPC
}

/**
 * Конфигурация типа погоды
 */
export interface WeatherTypeConfig {
  type: WeatherType;
  baseTemperature: number;
  precipitationRange: [number, number];
  windSpeedRange: [number, number];
  visibilityRange: [number, number];
  humidityRange: [number, number];
  cloudCoverRange: [number, number];
  effects: Partial<WeatherEffects>;
  description: string;
}

/**
 * База данных конфигураций погоды
 */
export const WeatherDatabase: Record<WeatherType, WeatherTypeConfig> = {
  [WeatherType.CLEAR]: {
    type: WeatherType.CLEAR,
    baseTemperature: 20,
    precipitationRange: [0, 0.1],
    windSpeedRange: [0, 5],
    visibilityRange: [0.9, 1.0],
    humidityRange: [0.3, 0.6],
    cloudCoverRange: [0, 0.3],
    effects: {
      speedModifier: 1.0,
      visibilityModifier: 1.0,
      combatModifier: 1.0,
      tradeModifier: 1.0,
      cropModifier: 1.0,
      huntingModifier: 1.0,
      eventChance: 0.1,
      roadAccessibility: 1.0,
      npcActivityModifier: 1.0,
    },
    description: 'Ясная погода',
  },
  [WeatherType.RAIN]: {
    type: WeatherType.RAIN,
    baseTemperature: 15,
    precipitationRange: [0.5, 1.0],
    windSpeedRange: [5, 15],
    visibilityRange: [0.5, 0.8],
    humidityRange: [0.7, 1.0],
    cloudCoverRange: [0.7, 1.0],
    effects: {
      speedModifier: 0.8,
      visibilityModifier: 0.7,
      combatModifier: 0.9,
      tradeModifier: 0.9,
      cropModifier: 1.2,
      huntingModifier: 0.7,
      eventChance: 0.2,
      roadAccessibility: 0.8,
      npcActivityModifier: 0.8,
    },
    description: 'Дождь',
  },
  [WeatherType.SNOW]: {
    type: WeatherType.SNOW,
    baseTemperature: -5,
    precipitationRange: [0.5, 1.0],
    windSpeedRange: [5, 20],
    visibilityRange: [0.3, 0.6],
    humidityRange: [0.6, 0.9],
    cloudCoverRange: [0.8, 1.0],
    effects: {
      speedModifier: 0.6,
      visibilityModifier: 0.5,
      combatModifier: 0.8,
      tradeModifier: 0.7,
      cropModifier: 0.5,
      huntingModifier: 0.6,
      eventChance: 0.15,
      roadAccessibility: 0.4,
      npcActivityModifier: 0.5,
    },
    description: 'Снег',
  },
  [WeatherType.FOG]: {
    type: WeatherType.FOG,
    baseTemperature: 10,
    precipitationRange: [0, 0.2],
    windSpeedRange: [0, 3],
    visibilityRange: [0.1, 0.4],
    humidityRange: [0.8, 1.0],
    cloudCoverRange: [0.5, 0.9],
    effects: {
      speedModifier: 0.9,
      visibilityModifier: 0.3,
      combatModifier: 0.7,
      tradeModifier: 0.8,
      cropModifier: 1.0,
      huntingModifier: 0.5,
      eventChance: 0.25,
      roadAccessibility: 0.7,
      npcActivityModifier: 0.7,
    },
    description: 'Туман',
  },
  [WeatherType.STORM]: {
    type: WeatherType.STORM,
    baseTemperature: 18,
    precipitationRange: [0.8, 1.0],
    windSpeedRange: [20, 40],
    visibilityRange: [0.2, 0.5],
    humidityRange: [0.8, 1.0],
    cloudCoverRange: [0.9, 1.0],
    effects: {
      speedModifier: 0.5,
      visibilityModifier: 0.4,
      combatModifier: 0.6,
      tradeModifier: 0.5,
      cropModifier: 0.8,
      huntingModifier: 0.3,
      eventChance: 0.5,
      roadAccessibility: 0.3,
      npcActivityModifier: 0.3,
    },
    description: 'Гроза',
  },
  [WeatherType.HEATWAVE]: {
    type: WeatherType.HEATWAVE,
    baseTemperature: 35,
    precipitationRange: [0, 0.05],
    windSpeedRange: [0, 5],
    visibilityRange: [0.8, 1.0],
    humidityRange: [0.1, 0.3],
    cloudCoverRange: [0, 0.2],
    effects: {
      speedModifier: 0.8,
      visibilityModifier: 1.0,
      combatModifier: 0.8,
      tradeModifier: 0.9,
      cropModifier: 0.7,
      huntingModifier: 0.6,
      eventChance: 0.2,
      roadAccessibility: 1.0,
      npcActivityModifier: 0.6,
    },
    description: 'Жара',
  },
  [WeatherType.FREEZE]: {
    type: WeatherType.FREEZE,
    baseTemperature: -15,
    precipitationRange: [0, 0.3],
    windSpeedRange: [5, 15],
    visibilityRange: [0.7, 1.0],
    humidityRange: [0.3, 0.6],
    cloudCoverRange: [0.2, 0.5],
    effects: {
      speedModifier: 0.7,
      visibilityModifier: 0.9,
      combatModifier: 0.8,
      tradeModifier: 0.7,
      cropModifier: 0.4,
      huntingModifier: 0.7,
      eventChance: 0.15,
      roadAccessibility: 0.6,
      npcActivityModifier: 0.4,
    },
    description: 'Холод',
  },
  [WeatherType.WINDY]: {
    type: WeatherType.WINDY,
    baseTemperature: 15,
    precipitationRange: [0, 0.3],
    windSpeedRange: [15, 30],
    visibilityRange: [0.6, 0.9],
    humidityRange: [0.4, 0.7],
    cloudCoverRange: [0.4, 0.8],
    effects: {
      speedModifier: 0.85,
      visibilityModifier: 0.8,
      combatModifier: 0.85,
      tradeModifier: 0.9,
      cropModifier: 0.9,
      huntingModifier: 0.7,
      eventChance: 0.2,
      roadAccessibility: 0.8,
      npcActivityModifier: 0.8,
    },
    description: 'Ветрено',
  },
};
