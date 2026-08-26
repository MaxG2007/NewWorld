import { BaseEntity, EntityRef } from './BaseTypes';
import { CraftingCategory, RecipeSource } from '../simulation/crafting/CraftingTypes';

/**
 * Предмет
 */
export interface Item extends BaseEntity {
  name: string;
  type:
    | 'weapon'
    | 'armor'
    | 'clothing'
    | 'food'
    | 'tool'
    | 'alchemy'
    | 'ore'
    | 'wood'
    | 'book'
    | 'map'
    | 'key'
    | 'artifact'
    | 'decoration'
    | 'material'
    | 'container';
  quality: number; // 0-100
  condition: number; // 0-100
  origin: string | null; // место создания
  owner: EntityRef<'NPC' | 'Family'> | null;
  history: string[]; // описание важных событий
  value: number; // цена в монетах
  properties: Record<string, unknown>;
  weight: number; // кг
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stackable: boolean;
  maxStack: number;
  craftingCategory?: CraftingCategory; // категория крафта если предмет создан через крафт
  recipeUsed?: EntityRef<'CraftingRecipe'>; // рецепт использованный для создания
}

/**
 * Рецепт крафта (дублируется для совместимости)
 */
export interface Recipe extends BaseEntity {
  name: string;
  category: CraftingCategory;
  result: EntityRef<'Item'>;
  quantity: number;
  ingredients: Array<{
    item: EntityRef<'Item'>;
    quantity: number;
  }>;
  tools: EntityRef<'Item'>[]; // необходимые инструменты
  skill: EntityRef<'Skill'> | null; // требуемый навык
  minSkillLevel: number;
  time: number; // время крафта в минутах
  isDiscovered: boolean;
  source: RecipeSource;
  region: EntityRef<'Culture'> | null; // региональные рецепты
}

/**
 * Заклинание
 */
export interface Spell extends BaseEntity {
  name: string;
  school: 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'nature' | 'arcane' | 'divine';
  cost: number; // мана/выносливость
  castTime: number; // секунды
  range: number; // метры
  area: 'single' | 'line' | 'cone' | 'circle' | 'global';
  element: string;
  effect: string;
  duration: number; // секунды
  resistance: string | null; // тип сопротивления
  level: number; // уровень заклинания
  components: string[]; // компоненты для каста
  isRitual: boolean;
}

/**
 * Квест
 */
export interface Quest extends BaseEntity {
  name: string;
  description: string;
  giver: EntityRef<'NPC'> | null;
  objectives: Array<{
    description: string;
    type: 'kill' | 'collect' | 'deliver' | 'explore' | 'talk' | 'build';
    target: EntityRef<'NPC' | 'Item' | 'Settlement'> | null;
    required: number;
    current: number;
    isCompleted: boolean;
  }>;
  rewards: EntityRef<'Item'>[];
  experience: number;
  reputation: number;
  status: 'available' | 'active' | 'completed' | 'failed';
  prerequisites: EntityRef<'Quest'>[];
  timeLimit: number | null; // игровые дни
}

/**
 * Событие мира
 */
export interface Event extends BaseEntity {
  name: string;
  description: string;
  type: 'natural' | 'social' | 'political' | 'economic' | 'military' | 'religious' | 'personal';
  location: EntityRef<'Settlement' | 'Chunk'> | null;
  startTime: number;
  endTime: number | null;
  participants: EntityRef<'NPC'>[];
  consequences: string[];
  isHistorical: boolean; // событие из прошлого мира
  impact: number; // 0-10 влияние на мир
}

/**
 * Слух
 */
export interface Rumor extends BaseEntity {
  content: string;
  topic: string;
  source: EntityRef<'NPC' | 'Event'> | null;
  reliability: number; // 0-1
  spread: number; // сколько NPC знают
  distortion: number; // насколько искажён от оригинала
  emotionalTone: 'positive' | 'negative' | 'neutral' | 'fear' | 'hope';
  relatedEvent: EntityRef<'Event'> | null;
  expirationTime: number | null; // когда устареет
}
