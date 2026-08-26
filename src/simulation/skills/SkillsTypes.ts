/**
 * Этап 21 — SKILLS + ARCHETYPES
 * Система навыков, специализаций, талантов и архетипов
 * 
 * Жёстких классов нет. Архетип старта — это не класс, а набор контекста жизни.
 */

import { EntityRef, BaseEntity } from '../../data/BaseTypes';

/**
 * Категория навыка
 */
export type SkillCategory =
  | 'combat'           // боевые навыки
  | 'magic'            // магические навыки
  | 'crafting'         // ремесленные навыки
  | 'social'           // социальные навыки
  | 'knowledge'        // знания
  | 'survival'         // выживание
  | 'athletic'         // атлетика
  | 'stealth'          // скрытность
  | 'perception';      // восприятие

/**
 * Тип навыка
 */
export type SkillType = 
  | 'weapon'           // оружие
  | 'armor'            // броня
  | 'spell'            // заклинания
  | 'trade'            // торговля
  | 'persuasion'       // убеждение
  | 'deception'        // обман
  | 'intimidation'     // запугивание
  | 'medicine'         // медицина
  | 'alchemy'          // алхимия
  | 'blacksmithing'    // кузнечное дело
  | 'cooking'          // кулинария
  | 'tailoring'        // портняжное дело
  | 'carpentry'        // плотничество
  | 'jewelry'          // ювелирное дело
  | 'construction'     // строительство
  | 'weaponcrafting'   // изготовление оружия
  | 'armorsmithing'    // изготовление брони
  | 'history'          // история
  | 'lore'             // легенды
  | 'nature'           // природа
  | 'arcana'           // магия
  | 'religion'         // религия
  | 'hunting'          // охота
  | 'fishing'          // рыбалка
  | 'foraging'         // собирательство
  | 'climbing'         // лазание
  | 'swimming'         // плавание
  | 'running'          // бег
  | 'strength'         // сила
  | 'sneaking'         // кража
  | 'lockpicking'      // взлом
  | 'observation'      // наблюдение
  | 'listening'        // слушание
  | 'tracking';        // следопытство

/**
 * Базовый навык
 */
export interface Skill extends BaseEntity {
  name: string;
  type: SkillType;
  category: SkillCategory;
  level: number; // 0-100
  experience: number;
  experienceToNextLevel: number;
  
  // Модификаторы
  baseValue: number; // базовое значение (от расы, происхождения)
  equipmentBonus: number; // бонус от экипировки
  temporaryBonus: number; // временный бонус (зелья, баффы)
  
  // Специализации внутри навыка
  specializations: Specialization[];
  
  // История использования
  timesUsed: number;
  lastUsed?: number;
  
  // Связанные таланты
  relatedTalents: EntityRef<'Talent'>[];
}

/**
 * Специализация внутри навыка
 */
export interface Specialization {
  id: string;
  name: string;
  description: string;
  level: number; // 0-100
  bonus: number; // бонус к основному навыку
  unlockRequirements: {
    skillLevel: number;
    prerequisites: string[]; // ID других специализаций
  };
}

/**
 * Талант - особая способность или преимущество
 */
export interface Talent extends BaseEntity {
  name: string;
  description: string;
  
  // Тип таланта
  type: 'passive' | 'active' | 'perk' | 'ability';
  category: SkillCategory;
  
  // Требования для получения
  requirements: {
    minSkills: Array<{
      skillType: SkillType;
      minLevel: number;
    }>;
    minAttributes?: Array<{
      attribute: string;
      minValue: number;
    }>;
    origin?: EntityRef<'Origin'>;
    specialization?: string;
  };
  
  // Эффекты таланта
  effects: TalentEffect[];
  
  // Ранг таланта (если многоуровневый)
  maxRank: number;
  currentRank: number;
  
  // Можно ли комбинировать с другими талантами
  mutuallyExclusiveWith: EntityRef<'Talent'>[];
  requiresTalents: EntityRef<'Talent'>[];
}

/**
 * Эффект таланта
 */
export interface TalentEffect {
  type: 'stat_bonus' | 'skill_bonus' | 'unlock_action' | 'resistance' | 'special_ability';
  target: string; // какой параметр изменяется
  value: number; // значение изменения
  condition?: string; // условие активации
  duration?: number; // длительность в минутах (для активных)
}

/**
 * Привычка - долгосрочное поведение персонажа
 */
export interface Habit extends BaseEntity {
  name: string;
  description: string;
  
  // Тип привычки
  type: 'positive' | 'negative' | 'neutral';
  
  // Влияние на навыки
  skillEffects: Array<{
    skillType: SkillType;
    bonus: number; // может быть отрицательным
    frequency: 'daily' | 'weekly' | 'monthly';
  }>;
  
  // Влияние на атрибуты
  attributeEffects: Array<{
    attribute: string;
    bonus: number;
  }>;
  
  // Как формируется привычка
  formationRequirement: {
    actionType: string;
    repetitions: number;
    timeSpan: number; // дней
  };
  
  // Можно ли избавиться
  canBreak: boolean;
  breakingDifficulty: number; // 0-100
}

/**
 * Происхождение - контекст жизни персонажа до начала игры
 * Это НЕ класс, а набор стартовых условий
 */
export interface Origin extends BaseEntity {
  name: string;
  description: string;
  
  // Социальный контекст
  socialContext: {
    socialClass: string;
    typicalProfessions: string[];
    reputation: Array<{
      group: string;
      bonus: number;
    }>;
  };
  
  // Стартовые бонусы
  startingBonuses: {
    skills: Array<{
      skillType: SkillType;
      baseLevel: number;
    }>;
    attributes: Array<{
      attribute: string;
      bonus: number;
    }>;
    items: EntityRef<'Item'>[];
    relationships: Array<{
      type: 'family' | 'friend' | 'mentor' | 'contact';
      description: string;
    }>;
  };
  
  // Ограничения (не жёсткие, а скорее вероятностные)
  tendencies: {
    likelyRegions: string[];
    unlikelyRegions: string[];
    culturalAffinity: EntityRef<'Culture'>[];
  };
  
  // Уникальные возможности
  uniqueOpportunities: string[];
  
  // Семейные секреты
  familySecrets: Array<{
    name: string;
    description: string;
    revealed: boolean;
  }>;
}

/**
 * Профиль развития персонажа
 */
export interface CharacterProgression {
  // Текущие навыки
  skills: Map<string, Skill>;
  
  // Изученные таланты
  talents: EntityRef<'Talent'>[];
  
  // Привычки
  habits: EntityRef<'Habit'>[];
  
  // Происхождение
  origin?: EntityRef<'Origin'>;
  
  // Специализации
  primarySpecialization?: string;
  secondarySpecialization?: string;
  
  // Уровень персонажа (общий)
  characterLevel: number;
  totalExperience: number;
  experienceToNextLevel: number;
  
  // Очки развития (если используются)
  developmentPoints: number;
  
  // История развития
  progressionHistory: Array<{
    timestamp: number;
    eventType: 'skill_increase' | 'talent_gained' | 'habit_formed' | 'specialization_changed';
    description: string;
  }>;
}

/**
 * Архетип старта - предустановленный набор происхождения и начальных бонусов
 * Это НЕ класс, а удобный пресет для генерации персонажа
 */
export interface StartArchetype {
  id: string;
  name: string;
  description: string;
  
  // Связанное происхождение
  originId: string;
  
  // Рекомендуемые пути развития
  recommendedSkills: SkillType[];
  recommendedTalents: EntityRef<'Talent'>[];
  
  // Стартовый контекст
  startingContext: {
    location: string;
    situation: string;
    initialGoal?: string;
  };
  
  // Бонусы к обучению
  learningBonuses: Array<{
    skillCategory: SkillCategory;
    bonus: number; // процентный бонус к получаемому опыту
  }>;
}

/**
 * Контекст экипировки для расчёта бонусов
 */
export interface EquipmentContext {
  items: EntityRef<'Item'>[];
  bonuses: {
    skills: Map<SkillType, number>;
    attributes: Map<string, number>;
  };
}
