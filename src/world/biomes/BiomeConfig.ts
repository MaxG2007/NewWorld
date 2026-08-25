/**
 * Конфигурация биома
 * Каждый биом содержит полную информацию о своей экосистеме
 */
export interface BiomeConfig {
  id: string;
  name: string;
  
  // Физические характеристики
  vegetation: VegetationType[];
  fauna: string[];
  resources: string[];
  soilType: SoilType;
  climate: BiomeClimate;
  
  // Игровые параметры
  eventChance: number; // 0-1, шанс случайного события
  characteristicNPCs: string[]; // типы NPC, характерные для биома
  hazards: Hazard[];
  
  // Генерация
  minElevation: number;
  maxElevation: number;
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
}

/**
 * Типы растительности
 */
export type VegetationType = 
  | 'grass'
  | 'shrubs'
  | 'deciduous_trees'
  | 'coniferous_trees'
  | 'tropical_trees'
  | 'cacti'
  | 'moss'
  | 'lichen'
  | 'reeds'
  | 'kelp'
  | 'none'
  | 'fungi'
  | 'vines'
  | 'ferns'
  | 'orchids'
  | 'acacia_trees'
  | 'berries';

/**
 * Типы почвы
 */
export type SoilType =
  | 'fertile_loam'
  | 'sandy'
  | 'clay'
  | 'rocky'
  | 'permafrost'
  | 'peat'
  | 'volcanic'
  | 'salt_flat'
  | 'alluvial'
  | 'stone';

/**
 * Климатические параметры биома
 */
export interface BiomeClimate {
  temperatureRange: [number, number]; // °C
  humidityRange: [number, number]; // 0-1
  precipitationLevel: 'none' | 'low' | 'medium' | 'high';
  seasonalVariation: 'none' | 'mild' | 'moderate' | 'extreme';
}

/**
 * Типы опасностей в биоме
 */
export interface Hazard {
  id: string;
  name: string;
  type: 'environmental' | 'predator' | 'disease' | 'terrain' | 'magical';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
}
