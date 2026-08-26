/**
 * Этап 22: COMBAT - Боевая система
 * 
 * Минимальный бой:
 * 1. движение
 * 2. направление
 * 3. атака
 * 4. защита
 * 5. попадание
 * 6. получение урона
 * 7. смерть
 * 
 * Расширенные механики:
 * - зоны попадания
 * - типы урона
 * - броня
 * - выносливость
 * - блок
 * - уклонение
 * - парирование
 * - дальний бой
 * - позиционирование
 * - укрытия
 * - высота
 * - эффекты состояний
 */

/** Типы урона */
export type DamageType = 
  | 'physical'      // Физический
  | 'slashing'      // Рубящий
  | 'piercing'      // Колющий
  | 'blunt'         // Дробящий
  | 'fire'          // Огненный
  | 'ice'           // Ледяной
  | 'lightning'     // Молния
  | 'poison'        // Яд
  | 'magic'         // Магический
  | 'holy'          // Светлый
  | 'dark';         // Тёмный

/** Зоны попадания на теле */
export type HitZone = 
  | 'head'          // Голова
  | 'chest'         // Грудь
  | 'abdomen'       // Живот
  | 'leftArm'       // Левая рука
  | 'rightArm'      // Правая рука
  | 'leftLeg'       // Левая нога
  | 'rightLeg';     // Правая нога

/** Типы боевых действий */
export type CombatActionType = 
  | 'move'          // Перемещение
  | 'attack'        // Атака
  | 'defend'        // Защита
  | 'block'         // Блок
  | 'parry'         // Парирование
  | 'dodge'         // Уклонение
  | 'rangedAttack'  // Дальняя атака
  | 'useItem'       // Использование предмета
  | 'flee'          // Побег
  | 'wait';         // Выжидание

/** Эффекты состояний в бою */
export type CombatStatusEffect = 
  | 'stunned'       // Оглушен
  | 'bleeding'      // Кровотечение
  | 'poisoned'      // Отравлен
  | 'burning'       // Горит
  | 'frozen'        // Заморожен
  | 'slowed'        // Замедлен
  | 'weakened'      // Ослаблен
  | 'buffed'        // Усилен
  | 'criticalHit'   // Критический удар
  | 'missed'        // Промах;

/** Позиция в бою */
export interface CombatPosition {
  x: number;
  y: number;
  elevation: number;  // Высота (0 = уровень земли, +1 = возвышение)
  inCover: boolean;   // В укрытии
  coverDirection?: 'north' | 'south' | 'east' | 'west';
}

/** Боевое существо (участник боя) */
export interface Combatant {
  id: string;
  name: string;
  
  // Характеристики
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  mana?: number;
  maxMana?: number;
  
  // Боевые параметры
  level: number;
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
  
  // Защита
  armor: number;
  blockChance: number;
  dodgeChance: number;
  parryChance: number;
  
  // Позиция
  position: CombatPosition;
  facingDirection: 'north' | 'south' | 'east' | 'west';
  
  // Состояния
  statusEffects: CombatStatusEffect[];
  isDead: boolean;
  isExhausted: boolean;
  
  // Экипировка
  weapon?: Weapon;
  shield?: Shield;
  armor_equipped?: Armor;
  
  // Навыки
  combatSkills: string[];
}

/** Тип оружия */
export type WeaponType = 
  | 'sword'           // Меч
  | 'axe'             // Топор
  | 'mace'            // Булава
  | 'dagger'          // Кинжал
  | 'spear'           // Копье
  | 'bow'             // Лук
  | 'crossbow'        // Арбалет
  | 'staff'           // Посох
  | 'wand'            // Волшебная палочка
  | 'unarmed';        // Без оружия

/** Интерфейс оружия */
export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  damageMin: number;
  damageMax: number;
  damageType: DamageType;
  range: number;          // 0 = ближний бой, >0 = дистанция
  attackSpeed: number;    // Секунд между атаками
  staminaCost: number;    // Стоимость выносливости
  requiredStrength: number;
  requiredAgility: number;
  weight: number;
  durability: number;
  maxDurability: number;
  specialEffects?: string[];
}

/** Тип брони */
export type ArmorType = 
  | 'cloth'           // Ткань
  | 'leather'         // Кожа
  | 'chainmail'       // Кольчуга
  | 'plate'           // Латы
  | 'shield';         // Щит

/** Интерфейс брони */
export interface Armor {
  id: string;
  name: string;
  type: ArmorType;
  armorValue: number;
  weight: number;
  durability: number;
  maxDurability: number;
  protectedZones: HitZone[];
  requiredStrength?: number;
  mobilityPenalty: number;  // Штраф к подвижности
}

/** Интерфейс щита */
export interface Shield {
  id: string;
  name: string;
  armorValue: number;
  blockChance: number;
  weight: number;
  durability: number;
  maxDurability: number;
  requiredStrength: number;
}

/** Результат атаки */
export interface AttackResult {
  attackerId: string;
  targetId: string;
  hit: boolean;           // Попало ли
  critical: boolean;      // Критический ли удар
  damage: number;         // Итоговый урон
  damageType: DamageType;
  hitZone: HitZone;
  blocked: boolean;       // Заблокировано ли
  dodged: boolean;        // Уклонился ли
  parried: boolean;       // Парировано ли
  staminaUsed: number;
  message: string;
}

/** Результат движения */
export interface MoveResult {
  combatantId: string;
  from: CombatPosition;
  to: CombatPosition;
  success: boolean;
  staminaUsed: number;
  message: string;
}

/** Действие в бою */
export interface CombatAction {
  type: CombatActionType;
  actorId: string;
  targetId?: string;
  targetPosition?: CombatPosition;
  weapon?: Weapon;
  direction?: 'north' | 'south' | 'east' | 'west';
}

/** Настройки боя */
export interface CombatConfig {
  baseDamageMultiplier: number;
  criticalChance: number;
  criticalMultiplier: number;
  dodgeBaseChance: number;
  blockBaseChance: number;
  parryBaseChance: number;
  staminaRegenRate: number;
  exhaustionThreshold: number;
  zoneDamageMultipliers: Record<HitZone, number>;
}

/** Стандартные множители урона по зонам */
export const ZONE_DAMAGE_MULTIPLIERS: Record<HitZone, number> = {
  head: 2.0,      // Голова - критическая зона
  chest: 1.2,     // Грудь - важная зона
  abdomen: 1.3,   // Живот - уязвимая зона
  leftArm: 0.8,   // Руки - меньше урона
  rightArm: 0.8,
  leftLeg: 0.7,   // Ноги - меньше урона
  rightLeg: 0.7,
};

/** Конфигурация боя по умолчанию */
export const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  baseDamageMultiplier: 1.0,
  criticalChance: 0.1,        // 10% шанс крита
  criticalMultiplier: 2.0,    // 2x урон при крите
  dodgeBaseChance: 0.15,      // 15% базовый шанс уклонения
  blockBaseChance: 0.25,      // 25% базовый шанс блока
  parryBaseChance: 0.12,      // 12% базовый шанс парирования
  staminaRegenRate: 5,        // 5 ед/сек регенерация
  exhaustionThreshold: 0,     // 0 выносливости = истощение
  zoneDamageMultipliers: ZONE_DAMAGE_MULTIPLIERS,
};

/** Базовые шаблоны оружия (10-20 типов) */
export const WEAPON_TEMPLATES: Omit<Weapon, 'id' | 'durability' | 'maxDurability'>[] = [
  // Мечи
  { name: 'Ржавый меч', type: 'sword', damageMin: 3, damageMax: 6, damageType: 'slashing', range: 0, attackSpeed: 1.2, staminaCost: 8, requiredStrength: 8, requiredAgility: 5, weight: 2.5 },
  { name: 'Длинный меч', type: 'sword', damageMin: 8, damageMax: 14, damageType: 'slashing', range: 0, attackSpeed: 1.4, staminaCost: 12, requiredStrength: 12, requiredAgility: 8, weight: 3.0 },
  { name: 'Короткий меч', type: 'sword', damageMin: 5, damageMax: 9, damageType: 'slashing', range: 0, attackSpeed: 1.0, staminaCost: 7, requiredStrength: 7, requiredAgility: 10, weight: 1.8 },
  
  // Топоры
  { name: 'Топор дровосека', type: 'axe', damageMin: 6, damageMax: 11, damageType: 'slashing', range: 0, attackSpeed: 1.6, staminaCost: 14, requiredStrength: 10, requiredAgility: 4, weight: 3.5 },
  { name: 'Боевой топор', type: 'axe', damageMin: 10, damageMax: 18, damageType: 'slashing', range: 0, attackSpeed: 1.8, staminaCost: 18, requiredStrength: 15, requiredAgility: 5, weight: 4.0 },
  
  // Булавы
  { name: 'Дубина', type: 'mace', damageMin: 4, damageMax: 8, damageType: 'blunt', range: 0, attackSpeed: 1.5, staminaCost: 10, requiredStrength: 8, requiredAgility: 3, weight: 3.0 },
  { name: 'Боевая булава', type: 'mace', damageMin: 9, damageMax: 15, damageType: 'blunt', range: 0, attackSpeed: 1.7, staminaCost: 15, requiredStrength: 14, requiredAgility: 4, weight: 4.5 },
  
  // Кинжалы
  { name: 'Нож', type: 'dagger', damageMin: 2, damageMax: 5, damageType: 'piercing', range: 0, attackSpeed: 0.7, staminaCost: 5, requiredStrength: 4, requiredAgility: 8, weight: 0.5 },
  { name: 'Кинжал убийцы', type: 'dagger', damageMin: 6, damageMax: 12, damageType: 'piercing', range: 0, attackSpeed: 0.8, staminaCost: 7, requiredStrength: 6, requiredAgility: 14, weight: 0.8 },
  
  // Копья
  { name: 'Короткое копье', type: 'spear', damageMin: 5, damageMax: 9, damageType: 'piercing', range: 1, attackSpeed: 1.3, staminaCost: 10, requiredStrength: 9, requiredAgility: 7, weight: 2.0 },
  { name: 'Длинное копье', type: 'spear', damageMin: 8, damageMax: 15, damageType: 'piercing', range: 2, attackSpeed: 1.5, staminaCost: 13, requiredStrength: 12, requiredAgility: 8, weight: 3.0 },
  
  // Луки
  { name: 'Простой лук', type: 'bow', damageMin: 4, damageMax: 8, damageType: 'piercing', range: 5, attackSpeed: 1.2, staminaCost: 8, requiredStrength: 6, requiredAgility: 10, weight: 1.5 },
  { name: 'Длинный лук', type: 'bow', damageMin: 8, damageMax: 15, damageType: 'piercing', range: 7, attackSpeed: 1.4, staminaCost: 12, requiredStrength: 10, requiredAgility: 14, weight: 2.0 },
  
  // Арбалеты
  { name: 'Лёгкий арбалет', type: 'crossbow', damageMin: 7, damageMax: 13, damageType: 'piercing', range: 6, attackSpeed: 2.0, staminaCost: 10, requiredStrength: 8, requiredAgility: 6, weight: 3.5 },
  { name: 'Тяжёлый арбалет', type: 'crossbow', damageMin: 12, damageMax: 22, damageType: 'piercing', range: 8, attackSpeed: 2.5, staminaCost: 15, requiredStrength: 14, requiredAgility: 5, weight: 5.0 },
  
  // Посохи
  { name: 'Деревянный посох', type: 'staff', damageMin: 3, damageMax: 6, damageType: 'blunt', range: 0, attackSpeed: 1.4, staminaCost: 8, requiredStrength: 5, requiredAgility: 5, weight: 2.0 },
  { name: 'Боевой посох', type: 'staff', damageMin: 6, damageMax: 11, damageType: 'blunt', range: 0, attackSpeed: 1.3, staminaCost: 10, requiredStrength: 8, requiredAgility: 8, weight: 2.5 },
  
  // Без оружия
  { name: 'Кулаки', type: 'unarmed', damageMin: 1, damageMax: 3, damageType: 'blunt', range: 0, attackSpeed: 0.6, staminaCost: 3, requiredStrength: 1, requiredAgility: 1, weight: 0 },
];

/** Базовые шаблоны брони */
export const ARMOR_TEMPLATES: Omit<Armor, 'id' | 'durability' | 'maxDurability'>[] = [
  { name: 'Тряпьё', type: 'cloth', armorValue: 1, weight: 0.5, protectedZones: ['chest', 'abdomen'], mobilityPenalty: 0 },
  { name: 'Кожаная куртка', type: 'leather', armorValue: 4, weight: 2.0, protectedZones: ['chest', 'abdomen', 'leftArm', 'rightArm'], requiredStrength: 5, mobilityPenalty: 0.05 },
  { name: 'Кожаные штаны', type: 'leather', armorValue: 2, weight: 1.0, protectedZones: ['leftLeg', 'rightLeg'], requiredStrength: 4, mobilityPenalty: 0.03 },
  { name: 'Кольчужная рубаха', type: 'chainmail', armorValue: 8, weight: 8.0, protectedZones: ['chest', 'abdomen', 'leftArm', 'rightArm'], requiredStrength: 10, mobilityPenalty: 0.15 },
  { name: 'Латный нагрудник', type: 'plate', armorValue: 15, weight: 15.0, protectedZones: ['chest', 'abdomen'], requiredStrength: 15, mobilityPenalty: 0.25 },
  { name: 'Латные поножи', type: 'plate', armorValue: 10, weight: 8.0, protectedZones: ['leftLeg', 'rightLeg'], requiredStrength: 12, mobilityPenalty: 0.15 },
  { name: 'Шлем', type: 'plate', armorValue: 8, weight: 3.0, protectedZones: ['head'], requiredStrength: 8, mobilityPenalty: 0.05 },
];

/** Шаблоны щитов */
export const SHIELD_TEMPLATES: Omit<Shield, 'id' | 'durability' | 'maxDurability'>[] = [
  { name: 'Деревянный щит', armorValue: 5, blockChance: 0.3, weight: 2.0, requiredStrength: 6 },
  { name: 'Кожаный щит', armorValue: 8, blockChance: 0.35, weight: 3.0, requiredStrength: 8 },
  { name: 'Металлический щит', armorValue: 15, blockChance: 0.45, weight: 6.0, requiredStrength: 12 },
  { name: 'Башенный щит', armorValue: 25, blockChance: 0.55, weight: 10.0, requiredStrength: 18 },
];
