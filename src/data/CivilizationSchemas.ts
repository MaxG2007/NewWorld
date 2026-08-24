import { BaseEntity, EntityRef } from './BaseTypes';

/**
 * Культура
 */
export interface Culture extends BaseEntity {
  name: string;
  language: string;
  traditions: string[];
  values: string[];
  artStyle: string;
  architecture: string;
  clothing: string;
  cuisine: string[];
  socialStructure: string;
  typicalProfessions: string[];
}

/**
 * Религия
 */
export interface Religion extends BaseEntity {
  name: string;
  deity: string | null; // может быть политеистической
  beliefs: string[];
  rituals: string[];
  holidays: string[];
  symbols: string[];
  moralCode: string[];
  organization: 'hierarchical' | 'tribal' | 'cult' | 'philosophy';
  influence: number; // 0-1
}

/**
 * Расы
 */
export interface Race extends BaseEntity {
  name: string;
  lifespan: number; // лет
  maturityAge: number; // возраст взросления
  agingRate: number; // множитель старения
  height: { min: number; max: number }; // см
  abilities: string[];
  resistances: Record<string, number>; // тип -> сопротивление %
  senses: string[]; // особенности органов чувств
  culturalTraditions: EntityRef<'Culture'>[];
  typicalProfessions: string[];
  familyStructure: string;
  religions: EntityRef<'Religion'>[];
  languages: string[];
}

/**
 * Профессия
 */
export interface Profession extends BaseEntity {
  name: string;
  category:
    | 'crafting'
    | 'trade'
    | 'military'
    | 'magic'
    | 'service'
    | 'farming'
    | 'nobility'
    | 'crime'
    | 'religious';
  skills: EntityRef<'Skill'>[];
  tools: EntityRef<'Item'>[];
  incomeLevel: number; // 0-10
  socialStatus: number; // 0-10
  description: string;
}

/**
 * Навык
 */
export interface Skill extends BaseEntity {
  name: string;
  category:
    | 'physical'
    | 'mental'
    | 'social'
    | 'crafting'
    | 'combat'
    | 'magic'
    | 'survival';
  level: number; // 0-100
  experience: number;
  description: string;
  prerequisites: EntityRef<'Skill'>[];
}
