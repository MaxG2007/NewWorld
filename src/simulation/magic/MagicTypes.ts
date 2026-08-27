/**
 * Этап 23 — MAGIC
 * 
 * Школы магии
 */
export enum MagicSchool {
  Fire = 'fire',
  Water = 'water',
  Air = 'air',
  Earth = 'earth',
  Light = 'light',
  Dark = 'dark',
  Nature = 'nature',
  Chaos = 'chaos',
}

/**
 * Типы эффектов заклинаний
 */
export enum SpellEffectType {
  Damage = 'damage',
  Healing = 'healing',
  Buff = 'buff',
  Debuff = 'debuff',
  Control = 'control',
  Summon = 'summon',
  Teleport = 'teleport',
  Transform = 'transform',
}

/**
 * Область действия заклинания
 */
export enum SpellAreaType {
  Single = 'single',      // Точечное
  Circle = 'circle',      // Круг
  Cone = 'cone',          // Конус
  Line = 'line',          // Линия
  Self = 'self',          // На себя
}

/**
 * Дальность действия заклинания
 */
export enum SpellRange {
  Self = 0,
  Melee = 5,
  Short = 15,
  Medium = 30,
  Long = 60,
}

/**
 * Время применения заклинания
 */
export enum CastingTime {
  Instant = 0,       // Мгновенно
  Quick = 1,         // Быстро (1 сек)
  Normal = 3,        // Нормально (3 сек)
  Long = 6,          // Долго (6 сек)
  Ritual = 30,       // Ритуал (30 сек)
}

/**
 * Тип урона от заклинания
 */
export enum SpellDamageType {
  Fire = 'fire',
  Cold = 'cold',
  Lightning = 'lightning',
  Arcane = 'arcane',
  Holy = 'holy',
  Shadow = 'shadow',
  Nature = 'nature',
  Force = 'force',
}

/**
 * Статус-эффект от заклинания
 */
export interface SpellStatusEffect {
  type: string;           // burn, freeze, stun, poison, etc.
  duration: number;       // длительность в секундах
  magnitude: number;      // сила эффекта
  tickInterval?: number;  // интервал срабатывания (для DoT/HoT)
}

/**
 * Параметры заклинания
 */
export interface SpellParams {
  id: string;
  name: string;
  description: string;
  school: MagicSchool;
  damageType?: SpellDamageType;
  
  // Стоимость
  manaCost: number;
  staminaCost?: number;
  healthCost?: number;
  
  // Применение
  castingTime: CastingTime;
  range: SpellRange;
  areaType: SpellAreaType;
  areaSize?: number;  // радиус/длина/ширина
  
  // Эффекты
  effectType: SpellEffectType;
  basePower: number;       // базовая сила
  scalingCoefficient?: number;  // коэффициент масштабирования
  statusEffects?: SpellStatusEffect[];
  
  // Сопротивление
  canResist: boolean;
  resistanceStat?: string;  // stat для сопротивления
  
  // Требования
  minSkillLevel?: number;
  requiredItems?: string[];
  
  // Мета
  isRitual: boolean;
  isChanneled: boolean;
  channelDuration?: number;
  cooldown: number;
}

/**
 * Результат применения заклинания
 */
export interface SpellCastResult {
  success: boolean;
  spellId: string;
  casterId: string;
  targets: string[];
  damageDealt?: number;
  healingDone?: number;
  effectsApplied: string[];
  resisted: boolean;
  criticalHit: boolean;
  message: string;
}

/**
 * Данные заклинания для использования
 */
export interface KnownSpell {
  spellId: string;
  skillLevel: number;
  timesCast: number;
  lastCastTime?: number;
}
