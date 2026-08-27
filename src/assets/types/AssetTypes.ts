/**
 * Asset Pipeline Types for Mega Pixel World
 * Этап 35 — Pixel Art + Asset Pipeline
 */

// ============================================
// БАЗОВЫЕ ТИПЫ АССЕТОВ
// ============================================

export type AssetCategory = 
  | 'sprites'
  | 'tiles'
  | 'characters'
  | 'items'
  | 'buildings'
  | 'effects'
  | 'ui'
  | 'animations';

export type AssetFormat = 'png' | 'gif' | 'webp' | 'svg' | 'json';

export interface BaseAsset {
  id: string;
  name: string;
  category: AssetCategory;
  format: AssetFormat;
  path: string;
  width: number;
  height: number;
  tags: string[];
  version: number;
}

// ============================================
// СПРАЙТЫ ПЕРСОНАЖЕЙ
// ============================================

export type RaceType = 'human' | 'elf' | 'dwarf' | 'orc' | 'halfling';

export type CharacterLayer = 
  | 'body'
  | 'head'
  | 'hair'
  | 'eyes'
  | 'mouth'
  | 'torso'
  | 'legs'
  | 'feet'
  | 'hands'
  | 'accessories';

export interface CharacterSprite extends BaseAsset {
  category: 'characters';
  race: RaceType;
  gender: 'male' | 'female' | 'other';
  layers: CharacterLayer[];
  animationFrames?: number;
  directions?: 4 | 8;
}

// ============================================
// НАБОРЫ ОДЕЖДЫ
// ============================================

export type ClothingType = 
  | 'casual'
  | 'formal'
  | 'work'
  | 'combat'
  | 'ceremonial'
  | 'magical';

export interface ClothingSet extends BaseAsset {
  category: 'characters';
  clothingType: ClothingType;
  compatibleRaces: RaceType[];
  layers: {
    head?: string;
    torso: string;
    legs?: string;
    feet?: string;
    accessories?: string[];
  };
  colorVariants?: string[];
}

// ============================================
// TERRAIN TILES
// ============================================

export type TerrainType = 
  | 'grass'
  | 'forest'
  | 'desert'
  | 'snow'
  | 'water'
  | 'mountain'
  | 'swamp'
  | 'cliff'
  | 'sand'
  | 'rock';

export interface TerrainTile extends BaseAsset {
  category: 'tiles';
  terrainType: TerrainType;
  variant: number;
  animated?: boolean;
  walkable: boolean;
  connectsTo?: TerrainType[];
}

// ============================================
// ДЕРЕВЬЯ И РАСТИТЕЛЬНОСТЬ
// ============================================

export type VegetationType = 
  | 'tree'
  | 'bush'
  | 'flower'
  | 'grass'
  | 'mushroom'
  | 'crop';

export interface VegetationSprite extends BaseAsset {
  category: 'tiles';
  vegetationType: VegetationType;
  biome: string;
  seasonalVariants?: {
    spring?: string;
    summer?: string;
    autumn?: string;
    winter?: string;
  };
  size: 'small' | 'medium' | 'large';
}

// ============================================
// ЗДАНИЯ
// ============================================

export type BuildingType = 
  | 'house'
  | 'shop'
  | 'tavern'
  | 'barracks'
  | 'temple'
  | 'forge'
  | 'farm'
  | 'mine'
  | 'tower'
  | 'wall'
  | 'gate';

export interface BuildingSprite extends BaseAsset {
  category: 'buildings';
  buildingType: BuildingType;
  style: string; // например: "medieval", "oriental", "dwarven"
  size: {
    width: number;
    height: number;
  };
  interiors?: boolean;
  damaged?: boolean;
}

// ============================================
// ОРУЖИЕ И ПРЕДМЕТЫ
// ============================================

export type WeaponType = 
  | 'sword'
  | 'axe'
  | 'spear'
  | 'bow'
  | 'staff'
  | 'dagger'
  | 'mace'
  | 'crossbow';

export type ItemType = 
  | 'weapon'
  | 'armor'
  | 'consumable'
  | 'material'
  | 'tool'
  | 'key'
  | 'book'
  | 'artifact';

export interface ItemSprite extends BaseAsset {
  category: 'items';
  itemType: ItemType;
  weaponType?: WeaponType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stackable: boolean;
  iconSize: number;
}

// ============================================
// NPC PLACEHOLDERS
// ============================================

export interface NPCPlaceholder extends BaseAsset {
  category: 'characters';
  profession: string;
  simpleColor: string;
  silhouette: boolean;
}

// ============================================
// АНИМАЦИИ
// ============================================

export type AnimationType = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'attack'
  | 'hit'
  | 'death'
  | 'cast'
  | 'craft'
  | 'talk'
  | 'emote';

export interface AnimationClip {
  id: string;
  name: string;
  type: AnimationType;
  frames: number;
  fps: number;
  loop: boolean;
  assetIds: string[];
}

// ============================================
// ЭФФЕКТЫ
// ============================================

export type EffectType = 
  | 'magic'
  | 'weather'
  | 'combat'
  | 'environment'
  | 'ui';

export interface EffectSprite extends BaseAsset {
  category: 'effects';
  effectType: EffectType;
  duration: number;
  particleCount?: number;
  colors: string[];
}

// ============================================
// UI ЭЛЕМЕНТЫ
// ============================================

export type UIElementType = 
  | 'button'
  | 'panel'
  | 'icon'
  | 'border'
  | 'background'
  | 'cursor'
  | 'font';

export interface UISprite extends BaseAsset {
  category: 'ui';
  uiType: UIElementType;
  scalable: boolean;
  nineSlice?: boolean;
}

// ============================================
// МОНСТРЫ
// ============================================

export type MonsterType = 
  | 'beast'
  | 'undead'
  | 'demon'
  | 'construct'
  | 'dragon'
  | 'humanoid';

export interface MonsterSprite extends BaseAsset {
  category: 'characters';
  monsterType: MonsterType;
  threatLevel: 1 | 2 | 3 | 4 | 5;
  specialEffects?: string[];
}

// ============================================
// ИНТЕРЬЕРЫ
// ============================================

export type InteriorObjectType = 
  | 'furniture'
  | 'decoration'
  | 'container'
  | 'lighting'
  | 'door'
  | 'window';

export interface InteriorObjectSprite extends BaseAsset {
  category: 'buildings';
  interiorType: InteriorObjectType;
  roomType?: string;
  interactive: boolean;
}

// ============================================
// КОНФИГУРАЦИЯ PIPELINE
// ============================================

export interface AssetPipelineConfig {
  basePath: string;
  categories: AssetCategory[];
  defaultFormat: AssetFormat;
  compressionEnabled: boolean;
  spriteSheetEnabled: boolean;
  maxTextureSize: number;
  generateMipmaps: boolean;
}

// ============================================
// МЕТАДАННЫЕ ПАКЕТА АССЕТОВ
// ============================================

export interface AssetPack {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  assets: BaseAsset[];
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// СТАТУС ЗАГРУЗКИ
// ============================================

export type LoadStatus = 'pending' | 'loading' | 'loaded' | 'error';

export interface AssetLoadState {
  assetId: string;
  status: LoadStatus;
  progress: number;
  error?: string;
}

// ============================================
// МИНИМАЛЬНЫЙ НАБОР (Этап 35)
// ============================================

export const MINIMAL_ASSET_PACK: AssetPack = {
  id: 'minimal-v1',
  name: 'Minimal Asset Pack',
  description: 'Базовый набор ассетов для начала разработки',
  version: '1.0.0',
  author: 'Mega Pixel World Team',
  license: 'MIT',
  assets: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Типы рас для минимального набора
export const BASE_RACES: RaceType[] = ['human', 'elf', 'dwarf', 'orc', 'halfling'];

// Базовые типы местности
export const BASE_TERRAIN: TerrainType[] = [
  'grass', 'forest', 'desert', 'snow', 'water', 'mountain'
];

// Базовое оружие
export const BASE_WEAPONS: WeaponType[] = [
  'sword', 'axe', 'spear', 'bow', 'staff', 'dagger'
];
