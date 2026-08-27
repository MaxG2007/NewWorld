/**
 * Этап 23 — MAGIC
 * 
 * Экспорт системы магии
 */

export {
  MagicSchool,
  SpellEffectType,
  SpellAreaType,
  SpellRange,
  CastingTime,
  SpellDamageType,
} from './MagicTypes';

export type {
  SpellParams,
  SpellStatusEffect,
  SpellCastResult,
  KnownSpell,
} from './MagicTypes';

export {
  SPELL_DATABASE,
  getSpell,
  getSpellsBySchool,
  registerSpell,
} from './SpellTemplates';

export {
  MagicSystem,
  magicSystem,
} from './MagicSystem';
