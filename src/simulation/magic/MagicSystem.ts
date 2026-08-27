import {
  MagicSchool,
  SpellParams,
  SpellEffectType,
  SpellCastResult,
  KnownSpell,
} from './MagicTypes';
import { SPELL_DATABASE, getSpell } from './SpellTemplates';

/**
 * Интерфейс персонажа для системы магии
 */
export interface MagicCaster {
  id: string;
  name: string;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  health: number;
  maxHealth: number;
  
  // Навыки магии по школам
  magicSkills: Partial<Record<MagicSchool, number>>;
  
  // Известные заклинания
  knownSpells: Record<string, KnownSpell>;
  
  // Характеристики для сопротивления
  magicResist: number;
  holyResist: number;
  darkResist: number;
  natureResist: number;
  chaosResist: number;
  
  // Интеллект для масштабирования
  intelligence: number;
  willpower: number;
}

/**
 * Цель для заклинания
 */
export interface SpellTarget {
  id: string;
  isAlly: boolean;
  magicResist: number;
  holyResist: number;
  darkResist: number;
  natureResist: number;
  chaosResist: number;
  willpower: number;
  currentHealth: number;
  maxHealth: number;
}

/**
 * Система магии
 */
export class MagicSystem {
  private casters: Map<string, MagicCaster> = new Map();
  
  /**
   * Регистрация кастера в системе
   */
  registerCaster(caster: MagicCaster): void {
    this.casters.set(caster.id, caster);
  }
  
  /**
   * Получить кастера по ID
   */
  getCaster(casterId: string): MagicCaster | undefined {
    return this.casters.get(casterId);
  }
  
  /**
   * Проверка возможности применения заклинания
   */
  canCastSpell(caster: MagicCaster, spell: SpellParams): { 
    canCast: boolean; 
    reason?: string 
  } {
    // Проверка маны
    if (caster.mana < spell.manaCost) {
      return { canCast: false, reason: 'Недостаточно маны' };
    }
    
    // Проверка выносливости
    if (spell.staminaCost && caster.stamina < spell.staminaCost) {
      return { canCast: false, reason: 'Недостаточно выносливости' };
    }
    
    // Проверка здоровья (для некоторых заклинаний)
    if (spell.healthCost && caster.health <= spell.healthCost) {
      return { canCast: false, reason: 'Недостаточно здоровья' };
    }
    
    // Проверка уровня навыка
    if (spell.minSkillLevel) {
      const skillLevel = caster.magicSkills[spell.school] || 0;
      if (skillLevel < spell.minSkillLevel) {
        return { 
          canCast: false, 
          reason: `Требуется уровень навыка ${spell.school} ${spell.minSkillLevel}` 
        };
      }
    }
    
    // Проверка кулдауна
    const knownSpell = caster.knownSpells[spell.id];
    if (knownSpell && knownSpell.lastCastTime) {
      const elapsed = Date.now() - knownSpell.lastCastTime;
      if (elapsed < spell.cooldown * 1000) {
        const remaining = Math.ceil((spell.cooldown * 1000 - elapsed) / 1000);
        return { canCast: false, reason: `Заклинание будет готово через ${remaining} сек.` };
      }
    }
    
    return { canCast: true };
  }
  
  /**
   * Расчёт сопротивления цели
   */
  calculateResistance(
    target: SpellTarget, 
    spell: SpellParams
  ): number {
    if (!spell.canResist) {
      return 0;
    }
    
    let resistStat = 0;
    
    switch (spell.resistanceStat) {
      case 'magicResist':
        resistStat = target.magicResist;
        break;
      case 'holyResist':
        resistStat = target.holyResist;
        break;
      case 'darkResist':
        resistStat = target.darkResist;
        break;
      case 'natureResist':
        resistStat = target.natureResist;
        break;
      case 'chaosResist':
        resistStat = target.chaosResist;
        break;
      case 'willpower':
        resistStat = target.willpower;
        break;
      default:
        resistStat = target.magicResist;
    }
    
    // Сопротивление в процентах (максимум 75%)
    const resistancePercent = Math.min(resistStat / 10, 75);
    
    return resistancePercent;
  }
  
  /**
   * Расчёт силы заклинания с учётом навыков
   */
  calculateSpellPower(
    caster: MagicCaster,
    spell: SpellParams
  ): number {
    const skillLevel = caster.magicSkills[spell.school] || 0;
    const skillBonus = skillLevel * 0.5; // 0.5% за уровень навыка
    
    const intBonus = caster.intelligence * 0.2; // 20% от интеллекта
    
    let power = spell.basePower;
    
    if (spell.scalingCoefficient) {
      power += (caster.intelligence + skillLevel) * spell.scalingCoefficient;
    }
    
    power *= (1 + skillBonus / 100);
    power *= (1 + intBonus / 100);
    
    // Критический шанс (зависит от навыка)
    const critChance = Math.min(skillLevel * 0.5, 25); // макс 25%
    const isCrit = Math.random() * 100 < critChance;
    
    if (isCrit) {
      power *= 1.5; // 50% бонус криту
    }
    
    return Math.round(power);
  }
  
  /**
   * Применение заклинания
   */
  castSpell(
    casterId: string,
    spellId: string,
    targets: SpellTarget[]
  ): SpellCastResult {
    const caster = this.casters.get(casterId);
    if (!caster) {
      return {
        success: false,
        spellId,
        casterId,
        targets: targets.map(t => t.id),
        effectsApplied: [],
        resisted: false,
        criticalHit: false,
        message: 'Кастер не найден'
      };
    }
    
    const spell = getSpell(spellId);
    if (!spell) {
      return {
        success: false,
        spellId,
        casterId,
        targets: targets.map(t => t.id),
        effectsApplied: [],
        resisted: false,
        criticalHit: false,
        message: 'Заклинание не найдено'
      };
    }
    
    // Проверка возможности casts
    const check = this.canCastSpell(caster, spell);
    if (!check.canCast) {
      return {
        success: false,
        spellId,
        casterId,
        targets: targets.map(t => t.id),
        effectsApplied: [],
        resisted: false,
        criticalHit: false,
        message: check.reason || 'Невозможно применить заклинание'
      };
    }
    
    // Оплата стоимости
    caster.mana -= spell.manaCost;
    if (spell.staminaCost) {
      caster.stamina -= spell.staminaCost;
    }
    if (spell.healthCost) {
      caster.health -= spell.healthCost;
    }
    
    // Обновление времени последнего casts
    const knownSpell = caster.knownSpells[spellId];
    if (knownSpell) {
      knownSpell.timesCast++;
      knownSpell.lastCastTime = Date.now();
    } else {
      caster.knownSpells[spellId] = {
        spellId,
        skillLevel: caster.magicSkills[spell.school] || 0,
        timesCast: 1,
        lastCastTime: Date.now()
      };
    }
    
    // Расчёт эффектов
    const effectsApplied: string[] = [];
    let totalDamage = 0;
    let totalHealing = 0;
    let anyResisted = false;
    let isCrit = false;
    
    for (const target of targets) {
      const resistance = this.calculateResistance(target, spell);
      
      // Проверка на сопротивление
      const resistRoll = Math.random() * 100;
      const fullyResisted = resistRoll < resistance;
      
      if (fullyResisted) {
        anyResisted = true;
        continue;
      }
      
      // Применение эффекта
      switch (spell.effectType) {
        case SpellEffectType.Damage:
          const damage = this.calculateSpellPower(caster, spell);
          const reducedDamage = Math.floor(damage * (1 - resistance / 100));
          totalDamage += reducedDamage;
          effectsApplied.push(`damage:${reducedDamage}`);
          break;
          
        case SpellEffectType.Healing:
          const healing = this.calculateSpellPower(caster, spell);
          totalHealing += healing;
          effectsApplied.push(`heal:${healing}`);
          break;
          
        case SpellEffectType.Buff:
        case SpellEffectType.Debuff:
        case SpellEffectType.Control:
          if (spell.statusEffects) {
            for (const effect of spell.statusEffects) {
              effectsApplied.push(`${effect.type}:${effect.magnitude}`);
            }
          }
          break;
      }
    }
    
    const message = spell.effectType === SpellEffectType.Damage
      ? `Нанесено ${totalDamage} урона ${targets.length} целям`
      : spell.effectType === SpellEffectType.Healing
        ? `Исцелено ${totalHealing} здоровья`
        : `Заклинание "${spell.name}" успешно применено`;
    
    return {
      success: true,
      spellId,
      casterId,
      targets: targets.map(t => t.id),
      damageDealt: totalDamage > 0 ? totalDamage : undefined,
      healingDone: totalHealing > 0 ? totalHealing : undefined,
      effectsApplied,
      resisted: anyResisted,
      criticalHit: isCrit,
      message
    };
  }
  
  /**
   * Изучение нового заклинания
   */
  learnSpell(casterId: string, spellId: string): { 
    success: boolean; 
    message: string 
  } {
    const caster = this.casters.get(casterId);
    if (!caster) {
      return { success: false, message: 'Кастер не найден' };
    }
    
    const spell = getSpell(spellId);
    if (!spell) {
      return { success: false, message: 'Заклинание не найдено' };
    }
    
    if (caster.knownSpells[spellId]) {
      return { success: false, message: 'Заклинание уже изучено' };
    }
    
    // Проверка требования уровня навыка
    if (spell.minSkillLevel) {
      const skillLevel = caster.magicSkills[spell.school] || 0;
      if (skillLevel < spell.minSkillLevel) {
        return { 
          success: false, 
          message: `Требуется уровень навыка ${spell.school} ${spell.minSkillLevel}` 
        };
      }
    }
    
    caster.knownSpells[spellId] = {
      spellId,
      skillLevel: caster.magicSkills[spell.school] || 0,
      timesCast: 0
    };
    
    return { 
      success: true, 
      message: `Изучено заклинание: ${spell.name}` 
    };
  }
  
  /**
   * Повышение уровня навыка магии
   */
  increaseSkill(casterId: string, school: MagicSchool, amount: number = 1): void {
    const caster = this.casters.get(casterId);
    if (!caster) return;
    
    const current = caster.magicSkills[school] || 0;
    caster.magicSkills[school] = Math.min(current + amount, 100); // макс 100
  }
  
  /**
   * Восстановление маны
   */
  regenerateMana(casterId: string, amount: number): void {
    const caster = this.casters.get(casterId);
    if (!caster) return;
    
    caster.mana = Math.min(caster.mana + amount, caster.maxMana);
  }
  
  /**
   * Получить все известные заклинания кастера
   */
  getKnownSpells(casterId: string): KnownSpell[] {
    const caster = this.casters.get(casterId);
    if (!caster) return [];
    
    return Object.values(caster.knownSpells);
  }
  
  /**
   * Получить заклинания доступные для изучения
   */
  getAvailableSpells(casterId: string): SpellParams[] {
    const caster = this.casters.get(casterId);
    if (!caster) return [];
    
    const allSpells = Object.values(SPELL_DATABASE);
    
    return allSpells.filter(spell => {
      // Уже изучено
      if (caster.knownSpells[spell.id]) return false;
      
      // Проверка требования навыка
      if (spell.minSkillLevel) {
        const skillLevel = caster.magicSkills[spell.school] || 0;
        if (skillLevel < spell.minSkillLevel) return false;
      }
      
      return true;
    });
  }
}

// Экспорт singleton instance
export const magicSystem = new MagicSystem();
