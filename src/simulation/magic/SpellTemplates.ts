import {
  MagicSchool,
  SpellParams,
  SpellEffectType,
  SpellAreaType,
  SpellRange,
  CastingTime,
  SpellDamageType,
} from './MagicTypes';

/**
 * База данных всех заклинаний
 */
export const SPELL_DATABASE: Record<string, SpellParams> = {};

/**
 * Регистрация заклинания в базе
 */
export function registerSpell(spell: SpellParams): void {
  SPELL_DATABASE[spell.id] = spell;
}

/**
 * Получить заклинание по ID
 */
export function getSpell(spellId: string): SpellParams | undefined {
  return SPELL_DATABASE[spellId];
}

/**
 * Получить все заклинания школы
 */
export function getSpellsBySchool(school: MagicSchool): SpellParams[] {
  return Object.values(SPELL_DATABASE).filter(s => s.school === school);
}

// ==================== ОГНЕННАЯ ШКОЛА ====================

registerSpell({
  id: 'fireball',
  name: 'Огненный шар',
  description: 'Запускает шар огня, взрывающийся при столкновении',
  school: MagicSchool.Fire,
  damageType: SpellDamageType.Fire,
  manaCost: 30,
  castingTime: CastingTime.Normal,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Circle,
  areaSize: 5,
  effectType: SpellEffectType.Damage,
  basePower: 50,
  scalingCoefficient: 1.2,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 3,
  statusEffects: [
    { type: 'burn', duration: 5, magnitude: 5, tickInterval: 1 }
  ]
});

registerSpell({
  id: 'fire_blast',
  name: 'Огненный всплеск',
  description: 'Быстрый выброс огня в ближайших врагов',
  school: MagicSchool.Fire,
  damageType: SpellDamageType.Fire,
  manaCost: 15,
  castingTime: CastingTime.Quick,
  range: SpellRange.Melee,
  areaType: SpellAreaType.Cone,
  areaSize: 10,
  effectType: SpellEffectType.Damage,
  basePower: 25,
  scalingCoefficient: 0.8,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 2
});

registerSpell({
  id: 'flame_wall',
  name: 'Стена пламени',
  description: 'Создаёт стену огня, наносящую урон проходящим сквозь неё',
  school: MagicSchool.Fire,
  damageType: SpellDamageType.Fire,
  manaCost: 50,
  castingTime: CastingTime.Normal,
  range: SpellRange.Short,
  areaType: SpellAreaType.Line,
  areaSize: 15,
  effectType: SpellEffectType.Damage,
  basePower: 30,
  scalingCoefficient: 0.9,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: true,
  channelDuration: 10,
  cooldown: 15,
  statusEffects: [
    { type: 'burn', duration: 3, magnitude: 8, tickInterval: 1 }
  ]
});

// ==================== ВОДНАЯ ШКОЛА ====================

registerSpell({
  id: 'icebolt',
  name: 'Ледяная стрела',
  description: 'Запускает острую ледяную стрелу во врага',
  school: MagicSchool.Water,
  damageType: SpellDamageType.Cold,
  manaCost: 20,
  castingTime: CastingTime.Quick,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Damage,
  basePower: 35,
  scalingCoefficient: 1.0,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 2,
  statusEffects: [
    { type: 'slow', duration: 4, magnitude: 30 }
  ]
});

registerSpell({
  id: 'water_heal',
  name: 'Целебный поток',
  description: 'Восстанавливает здоровье целебной водой',
  school: MagicSchool.Water,
  manaCost: 40,
  castingTime: CastingTime.Normal,
  range: SpellRange.Short,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Healing,
  basePower: 60,
  scalingCoefficient: 1.5,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 5
});

registerSpell({
  id: 'ice_armor',
  name: 'Ледяная броня',
  description: 'Окружает цель ледяным щитом',
  school: MagicSchool.Water,
  manaCost: 35,
  castingTime: CastingTime.Quick,
  range: SpellRange.Melee,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Buff,
  basePower: 20,
  scalingCoefficient: 0.5,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 30,
  statusEffects: [
    { type: 'ice_shield', duration: 60, magnitude: 20 }
  ]
});

// ==================== ШКОЛА ВОЗДУХА ====================

registerSpell({
  id: 'lightning',
  name: 'Молния',
  description: 'Удар молнии по цели с цепной реакцией',
  school: MagicSchool.Air,
  damageType: SpellDamageType.Lightning,
  manaCost: 45,
  castingTime: CastingTime.Normal,
  range: SpellRange.Long,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Damage,
  basePower: 70,
  scalingCoefficient: 1.3,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 6,
  statusEffects: [
    { type: 'shock', duration: 2, magnitude: 50 }
  ]
});

registerSpell({
  id: 'air_push',
  name: 'Толчок воздуха',
  description: 'Отталкивает врагов мощным порывом ветра',
  school: MagicSchool.Air,
  manaCost: 25,
  castingTime: CastingTime.Quick,
  range: SpellRange.Short,
  areaType: SpellAreaType.Cone,
  areaSize: 12,
  effectType: SpellEffectType.Control,
  basePower: 10,
  scalingCoefficient: 0.3,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 8
});

registerSpell({
  id: 'wind_speed',
  name: 'Ветер скорости',
  description: 'Увеличивает скорость передвижения',
  school: MagicSchool.Air,
  manaCost: 30,
  castingTime: CastingTime.Instant,
  range: SpellRange.Melee,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Buff,
  basePower: 50,
  scalingCoefficient: 0.5,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 20,
  statusEffects: [
    { type: 'haste', duration: 30, magnitude: 50 }
  ]
});

// ==================== ШКОЛА ЗЕМЛИ ====================

registerSpell({
  id: 'stone_skin',
  name: 'Каменная кожа',
  description: 'Покрывает кожу каменной коркой, увеличивая защиту',
  school: MagicSchool.Earth,
  manaCost: 40,
  castingTime: CastingTime.Normal,
  range: SpellRange.Melee,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Buff,
  basePower: 30,
  scalingCoefficient: 0.8,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 45,
  statusEffects: [
    { type: 'armor_up', duration: 120, magnitude: 30 }
  ]
});

registerSpell({
  id: 'earth_spikes',
  name: 'Шипы земли',
  description: 'Выращивает острые шипы из земли под врагами',
  school: MagicSchool.Earth,
  damageType: SpellDamageType.Nature,
  manaCost: 35,
  castingTime: CastingTime.Normal,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Circle,
  areaSize: 6,
  effectType: SpellEffectType.Damage,
  basePower: 45,
  scalingCoefficient: 1.1,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 8,
  statusEffects: [
    { type: 'root', duration: 3, magnitude: 100 }
  ]
});

registerSpell({
  id: 'earthquake',
  name: 'Землетрясение',
  description: 'Вызывает подземные толчки в большой области',
  school: MagicSchool.Earth,
  damageType: SpellDamageType.Force,
  manaCost: 80,
  castingTime: CastingTime.Long,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Circle,
  areaSize: 15,
  effectType: SpellEffectType.Damage,
  basePower: 60,
  scalingCoefficient: 1.0,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: true,
  channelDuration: 6,
  cooldown: 30,
  statusEffects: [
    { type: 'stun', duration: 2, magnitude: 100 },
    { type: 'knockdown', duration: 1, magnitude: 100 }
  ]
});

// ==================== ШКОЛА СВЕТА ====================

registerSpell({
  id: 'divine_light',
  name: 'Божественный свет',
  description: 'Ослепляет нежить и демонов священным светом',
  school: MagicSchool.Light,
  damageType: SpellDamageType.Holy,
  manaCost: 50,
  castingTime: CastingTime.Normal,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Circle,
  areaSize: 8,
  effectType: SpellEffectType.Damage,
  basePower: 55,
  scalingCoefficient: 1.4,
  canResist: true,
  resistanceStat: 'darkResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 12,
  statusEffects: [
    { type: 'blind', duration: 5, magnitude: 80 }
  ]
});

registerSpell({
  id: 'purify',
  name: 'Очищение',
  description: 'Снимает негативные эффекты и проклятия',
  school: MagicSchool.Light,
  manaCost: 35,
  castingTime: CastingTime.Quick,
  range: SpellRange.Short,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Buff,
  basePower: 0,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 15
});

registerSpell({
  id: 'blessing',
  name: 'Благословение',
  description: 'Благословляет союзника, усиливая все характеристики',
  school: MagicSchool.Light,
  manaCost: 45,
  castingTime: CastingTime.Normal,
  range: SpellRange.Short,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Buff,
  basePower: 15,
  scalingCoefficient: 0.4,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 60,
  statusEffects: [
    { type: 'blessed', duration: 180, magnitude: 15 }
  ]
});

// ==================== ШКОЛА ТЬМЫ ====================

registerSpell({
  id: 'shadow_bolt',
  name: 'Стрела тьмы',
  description: 'Запускает сгусток тёмной энергии',
  school: MagicSchool.Dark,
  damageType: SpellDamageType.Shadow,
  manaCost: 25,
  castingTime: CastingTime.Quick,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Damage,
  basePower: 40,
  scalingCoefficient: 1.1,
  canResist: true,
  resistanceStat: 'holyResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 3
});

registerSpell({
  id: 'curse',
  name: 'Проклятие слабости',
  description: 'Ослабляет врага, снижая его характеристики',
  school: MagicSchool.Dark,
  manaCost: 30,
  castingTime: CastingTime.Normal,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Debuff,
  basePower: 20,
  scalingCoefficient: 0.5,
  canResist: true,
  resistanceStat: 'willpower',
  isRitual: false,
  isChanneled: false,
  cooldown: 20,
  statusEffects: [
    { type: 'weakened', duration: 30, magnitude: 20 }
  ]
});

registerSpell({
  id: 'vampirism',
  name: 'Вампиризм',
  description: 'Поглощает жизнь врага, передавая её casterу',
  school: MagicSchool.Dark,
  damageType: SpellDamageType.Shadow,
  manaCost: 40,
  castingTime: CastingTime.Normal,
  range: SpellRange.Melee,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Damage,
  basePower: 35,
  scalingCoefficient: 1.0,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: true,
  channelDuration: 5,
  cooldown: 18
});

// ==================== ШКОЛА ПРИРОДЫ ====================

registerSpell({
  id: 'entangle',
  name: 'Опутывание',
  description: 'Растения опутывают врагов, обездвиживая их',
  school: MagicSchool.Nature,
  manaCost: 30,
  castingTime: CastingTime.Normal,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Circle,
  areaSize: 7,
  effectType: SpellEffectType.Control,
  basePower: 0,
  canResist: true,
  resistanceStat: 'natureResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 15,
  statusEffects: [
    { type: 'root', duration: 5, magnitude: 100 }
  ]
});

registerSpell({
  id: 'poison_cloud',
  name: 'Ядовитое облако',
  description: 'Создаёт облако ядовитого газа',
  school: MagicSchool.Nature,
  damageType: SpellDamageType.Nature,
  manaCost: 45,
  castingTime: CastingTime.Normal,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Circle,
  areaSize: 8,
  effectType: SpellEffectType.Damage,
  basePower: 25,
  scalingCoefficient: 0.8,
  canResist: true,
  resistanceStat: 'natureResist',
  isRitual: false,
  isChanneled: true,
  channelDuration: 8,
  cooldown: 20,
  statusEffects: [
    { type: 'poison', duration: 10, magnitude: 8, tickInterval: 2 }
  ]
});

registerSpell({
  id: 'regrowth',
  name: 'Буйный рост',
  description: 'Мощное исцеление с эффектом регенерации',
  school: MagicSchool.Nature,
  manaCost: 55,
  castingTime: CastingTime.Normal,
  range: SpellRange.Short,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Healing,
  basePower: 70,
  scalingCoefficient: 1.6,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 12,
  statusEffects: [
    { type: 'regen', duration: 15, magnitude: 10, tickInterval: 3 }
  ]
});

// ==================== ШКОЛА ХАОСА ====================

registerSpell({
  id: 'chaos_bolt',
  name: 'Хаотический заряд',
  description: 'Нестабильная энергия со случайным эффектом',
  school: MagicSchool.Chaos,
  damageType: SpellDamageType.Arcane,
  manaCost: 35,
  castingTime: CastingTime.Quick,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Damage,
  basePower: 45,
  scalingCoefficient: 1.2,
  canResist: true,
  resistanceStat: 'chaosResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 4
});

registerSpell({
  id: 'time_warp',
  name: 'Искажение времени',
  description: 'Замедляет время для всех кроме casterа',
  school: MagicSchool.Chaos,
  manaCost: 70,
  castingTime: CastingTime.Long,
  range: SpellRange.Self,
  areaType: SpellAreaType.Self,
  effectType: SpellEffectType.Buff,
  basePower: 50,
  scalingCoefficient: 0.5,
  canResist: false,
  isRitual: false,
  isChanneled: false,
  cooldown: 120,
  statusEffects: [
    { type: 'time_slow', duration: 8, magnitude: 70 }
  ]
});

registerSpell({
  id: 'wild_magic',
  name: 'Дикая магия',
  description: 'Случайный эффект из любого дерева магии',
  school: MagicSchool.Chaos,
  manaCost: 50,
  castingTime: CastingTime.Instant,
  range: SpellRange.Medium,
  areaType: SpellAreaType.Single,
  effectType: SpellEffectType.Damage,
  basePower: 30,
  scalingCoefficient: 2.0,
  canResist: true,
  resistanceStat: 'magicResist',
  isRitual: false,
  isChanneled: false,
  cooldown: 25
});
