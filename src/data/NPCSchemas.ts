import { BaseEntity, EntityRef } from './BaseTypes';

/**
 * Память о событии
 */
export interface Memory extends BaseEntity {
  event: string;
  importance: number; // 0-10
  emotionalWeight: number; // -10 до +10
  source: EntityRef<'NPC' | 'Event'> | null;
  timestamp: number; // игровое время
  confidence: number; // 0-1 насколько уверен NPC в памяти
  details: Record<string, unknown>;
}

/**
 * Отношение между NPC
 */
export interface Relationship extends BaseEntity {
  npcA: EntityRef<'NPC'>;
  npcB: EntityRef<'NPC'>;
  type: 'family' | 'friend' | 'rival' | 'enemy' | 'lover' | 'acquaintance' | 'colleague';
  strength: number; // -1 до +1
  trust: number; // 0-1
  history: EntityRef<'Memory'>[];
  lastInteraction: number;
}

/**
 * Личность NPC
 */
export interface Personality extends BaseEntity {
  temperament: 'sanguine' | 'choleric' | 'melancholic' | 'phlegmatic';
  traits: string[];
  fears: string[];
  likes: string[];
  dislikes: string[];
  values: string[];
  habits: string[];
  moralAlignment: 'lawful-good' | 'neutral-good' | 'chaotic-good' | 'lawful-neutral' | 'true-neutral' | 'chaotic-neutral' | 'lawful-evil' | 'neutral-evil' | 'chaotic-evil';
}

/**
 * Расписание NPC
 */
export interface ScheduleBlock {
  startTime: string; // "08:00"
  endTime: string; // "12:00"
  activity: 'sleep' | 'wake' | 'eat' | 'work' | 'travel' | 'socialize' | 'shop' | 'pray' | 'leisure' | 'guard';
  location?: EntityRef<'Building' | 'District' | 'Settlement'>;
  priority: number; // 0-10
}

/**
 * NPC (Non-Player Character)
 */
export interface NPC extends BaseEntity {
  name: string;
  age: number;
  race: EntityRef<'Race'>;
  culture: EntityRef<'Culture'>;
  family: EntityRef<'Family'> | null;
  profession: EntityRef<'Profession'> | null;
  location: EntityRef<'Settlement' | 'Chunk'>;
  health: number; // 0-100
  needs: {
    hunger: number; // 0-100
    sleep: number; // 0-100
    social: number; // 0-100
  };
  personality: EntityRef<'Personality'>;
  memories: EntityRef<'Memory'>[];
  relationships: EntityRef<'Relationship'>[];
  knowledge: EntityRef<'Rumor' | 'Skill'>[];
  inventory: EntityRef<'Item'>[];
  schedule: ScheduleBlock[];
  legalStatus: 'free' | 'wanted' | 'imprisoned' | 'enslaved';
  reputation: number; // -100 до +100
  isAlive: boolean;
  gender: 'male' | 'female' | 'other';
}

/**
 * Семья
 */
export interface Family extends BaseEntity {
  name: string;
  members: EntityRef<'NPC'>[];
  parents: EntityRef<'NPC'>[];
  children: EntityRef<'NPC'>[];
  spouses: [EntityRef<'NPC'>, EntityRef<'NPC'>][];
  residence: EntityRef<'Building'>;
  assets: EntityRef<'Item'>[];
  socialStatus: number; // 0-10
  debts: number;
  secrets: string[];
  history: string[];
  traditions: string[];
}

/**
 * Родословная
 */
export interface Genealogy extends BaseEntity {
  root: EntityRef<'NPC'>;
  ancestors: EntityRef<'NPC'>[];
  descendants: EntityRef<'NPC'>[];
  marriages: EntityRef<'Family'>[];
  familyTree: Record<string, EntityRef<'NPC'>[]>; // parentId -> children
}
