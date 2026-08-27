/**
 * Тесты системы магии (Этап 23 — MAGIC)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MagicSchool,
  SpellEffectType,
  SpellAreaType,
  SpellRange,
  CastingTime,
  SpellDamageType,
  getSpell,
  getSpellsBySchool,
  MagicSystem,
} from '../simulation/magic';

describe('Этап 23 — MAGIC', () => {
  describe('Школы магии', () => {
    it('должны быть определены все 8 школ', () => {
      expect(Object.keys(MagicSchool).length).toBe(8);
      expect(MagicSchool.Fire).toBe('fire');
      expect(MagicSchool.Water).toBe('water');
      expect(MagicSchool.Air).toBe('air');
      expect(MagicSchool.Earth).toBe('earth');
      expect(MagicSchool.Light).toBe('light');
      expect(MagicSchool.Dark).toBe('dark');
      expect(MagicSchool.Nature).toBe('nature');
      expect(MagicSchool.Chaos).toBe('chaos');
    });
  });

  describe('Типы эффектов заклинаний', () => {
    it('должны быть определены основные типы эффектов', () => {
      expect(SpellEffectType.Damage).toBe('damage');
      expect(SpellEffectType.Healing).toBe('healing');
      expect(SpellEffectType.Buff).toBe('buff');
      expect(SpellEffectType.Debuff).toBe('debuff');
      expect(SpellEffectType.Control).toBe('control');
    });
  });

  describe('Область действия', () => {
    it('должны быть определены типы областей', () => {
      expect(SpellAreaType.Single).toBe('single');
      expect(SpellAreaType.Circle).toBe('circle');
      expect(SpellAreaType.Cone).toBe('cone');
      expect(SpellAreaType.Line).toBe('line');
      expect(SpellAreaType.Self).toBe('self');
    });
  });

  describe('Время применения', () => {
    it('должны быть определены уровни времени casts', () => {
      expect(CastingTime.Instant).toBe(0);
      expect(CastingTime.Quick).toBe(1);
      expect(CastingTime.Normal).toBe(3);
      expect(CastingTime.Long).toBe(6);
      expect(CastingTime.Ritual).toBe(30);
    });
  });

  describe('База заклинаний', () => {
    it('должна содержать заклинания для всех школ', () => {
      const schools = Object.values(MagicSchool);
      
      for (const school of schools) {
        const spells = getSpellsBySchool(school);
        expect(spells.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('должна иметь огненный шар с правильными параметрами', () => {
      const fireball = getSpell('fireball');
      
      expect(fireball).toBeDefined();
      expect(fireball!.school).toBe(MagicSchool.Fire);
      expect(fireball!.damageType).toBe(SpellDamageType.Fire);
      expect(fireball!.manaCost).toBe(30);
      expect(fireball!.castingTime).toBe(CastingTime.Normal);
      expect(fireball!.range).toBe(SpellRange.Medium);
      expect(fireball!.areaType).toBe(SpellAreaType.Circle);
      expect(fireball!.effectType).toBe(SpellEffectType.Damage);
      expect(fireball!.basePower).toBe(50);
    });

    it('должна иметь целебное заклинание', () => {
      const heal = getSpell('water_heal');
      
      expect(heal).toBeDefined();
      expect(heal!.school).toBe(MagicSchool.Water);
      expect(heal!.effectType).toBe(SpellEffectType.Healing);
      expect(heal!.basePower).toBe(60);
    });

    it('должна иметь заклинание контроля', () => {
      const entangle = getSpell('entangle');
      
      expect(entangle).toBeDefined();
      expect(entangle!.effectType).toBe(SpellEffectType.Control);
      expect(entangle!.statusEffects).toBeDefined();
      expect(entangle!.statusEffects![0].type).toBe('root');
    });
  });

  describe('Система магии', () => {
    let testSystem: MagicSystem;
    
    const testCaster = {
      id: 'mage1',
      name: 'Test Mage',
      mana: 100,
      maxMana: 100,
      stamina: 50,
      maxStamina: 50,
      health: 80,
      maxHealth: 80,
      magicSkills: {
        [MagicSchool.Fire]: 10,
        [MagicSchool.Water]: 5,
      },
      knownSpells: {},
      magicResist: 20,
      holyResist: 10,
      darkResist: 10,
      natureResist: 10,
      chaosResist: 10,
      intelligence: 25,
      willpower: 20,
    };

    const testTarget: any = {
      id: 'enemy1',
      isAlly: false,
      magicResist: 15,
      holyResist: 10,
      darkResist: 10,
      natureResist: 10,
      chaosResist: 10,
      willpower: 15,
      currentHealth: 100,
      maxHealth: 100,
    };

    beforeEach(() => {
      testSystem = new MagicSystem();
      testSystem.registerCaster({ ...testCaster, knownSpells: {} });
    });

    it('должна регистрировать кастера', () => {
      const caster = testSystem.getCaster('mage1');
      expect(caster).toBeDefined();
      expect(caster!.name).toBe('Test Mage');
    });

    it('должна проверять возможность casts (достаточно маны)', () => {
      const spell = getSpell('fireball')!;
      const result = testSystem.canCastSpell(testCaster, spell);
      
      expect(result.canCast).toBe(true);
    });

    it('должна проверять возможность casts (недостаточно маны)', () => {
      const lowManaCaster = { ...testCaster, mana: 10 };
      const spell = getSpell('fireball')!;
      const result = testSystem.canCastSpell(lowManaCaster, spell);
      
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain('маны');
    });

    it('должна применять заклинание урона', () => {
      const result = testSystem.castSpell('mage1', 'fireball', [testTarget]);
      
      expect(result.success).toBe(true);
      expect(result.spellId).toBe('fireball');
      expect(result.damageDealt).toBeGreaterThan(0);
    });

    it('должна применять заклинание лечения', () => {
      const allyTarget = { ...testTarget, isAlly: true };
      const result = testSystem.castSpell('mage1', 'water_heal', [allyTarget]);
      
      expect(result.success).toBe(true);
      expect(result.healingDone).toBeGreaterThan(0);
    });

    it('должна обновлять ману после casts', () => {
      testSystem.castSpell('mage1', 'fireball', [testTarget]);
      const casterAfter = testSystem.getCaster('mage1');
      
      expect(casterAfter!.mana).toBe(70); // 100 - 30 = 70
    });

    it('должна отслеживать количество применений заклинания', () => {
      testSystem.castSpell('mage1', 'fireball', [testTarget]);
      
      // Заклинание на кулдауне, поэтому следующие вызовы не пройдут
      // Проверяем что первое применение засчиталось
      const knownSpells = testSystem.getKnownSpells('mage1');
      const fireballData = knownSpells.find(s => s.spellId === 'fireball');
      
      expect(fireballData).toBeDefined();
      expect(fireballData!.timesCast).toBe(1);
    });

    it('должна изучать новые заклинания', () => {
      const result = testSystem.learnSpell('mage1', 'lightning');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Молния');
      
      const knownSpells = testSystem.getKnownSpells('mage1');
      expect(knownSpells.some(s => s.spellId === 'lightning')).toBe(true);
    });

    it('должна повышать уровень навыка', () => {
      testSystem.increaseSkill('mage1', MagicSchool.Fire, 5);
      
      const caster = testSystem.getCaster('mage1');
      expect(caster!.magicSkills[MagicSchool.Fire]).toBe(15);
    });

    it('должна восстанавливать ману', () => {
      testSystem.castSpell('mage1', 'fireball', [testTarget]);
      testSystem.regenerateMana('mage1', 50);
      
      const caster = testSystem.getCaster('mage1');
      expect(caster!.mana).toBe(100); // было 70 + 50 = 120, но макс 100
    });

    it('должна возвращать доступные для изучения заклинания', () => {
      const available = testSystem.getAvailableSpells('mage1');
      
      expect(available.length).toBeGreaterThan(0);
    });

    it('должна рассчитывать сопротивление', () => {
      const spell = getSpell('fireball')!;
      const resistance = testSystem.calculateResistance(testTarget, spell);
      
      expect(resistance).toBeGreaterThan(0);
      expect(resistance).toBeLessThan(76); // макс 75%
    });

    it('должна рассчитывать силу заклинания', () => {
      const spell = getSpell('fireball')!;
      const power = testSystem.calculateSpellPower(testCaster, spell);
      
      expect(power).toBeGreaterThan(spell.basePower);
    });
  });

  describe('Сопротивление магии', () => {
    it('должно зависеть от типа заклинания', () => {
      // divine_light использует resistanceStat: 'darkResist' 
      // (цели с высоким darkResist лучше защищаются от света)
      const holySpell = getSpell('divine_light')!;
      // entangle использует resistanceStat: 'natureResist'
      const natureSpell = getSpell('entangle')!;
      
      const targetWithHighDarkResist: any = {
        id: 'demon',
        isAlly: false,
        magicResist: 10,
        holyResist: 10,
        darkResist: 50,  // Высокое сопротивление тьме = защита от света
        natureResist: 10,
        chaosResist: 10,
        willpower: 30,
        currentHealth: 100,
        maxHealth: 100,
      };

      const system = new MagicSystem();
      
      const holyResist = system.calculateResistance(targetWithHighDarkResist, holySpell);
      const natureResist = system.calculateResistance(targetWithHighDarkResist, natureSpell);
      
      // Формула: min(resistStat / 10, 75)
      // darkResist: 50 -> 50/10 = 5%
      // natureResist: 10 -> 10/10 = 1%
      expect(holyResist).toBe(5);
      expect(natureResist).toBe(1);
    });

    it('должно иметь максимум 75%', () => {
      const superResistTarget: any = {
        id: 'boss',
        isAlly: false,
        magicResist: 800,  // 800/10 = 80, но максимум 75
        holyResist: 200,
        darkResist: 200,
        natureResist: 200,
        chaosResist: 200,
        willpower: 200,
        currentHealth: 1000,
        maxHealth: 1000,
      };

      const system = new MagicSystem();
      const spell = getSpell('fireball')!;
      
      // resistanceStat по умолчанию 'magicResist', fireball использует 'magicResist'
      // Проверяем что формула работает: min(800/10, 75) = min(80, 75) = 75
      const resist = system.calculateResistance(superResistTarget, spell);
      expect(resist).toBe(75);
    });
  });

  describe('Статус-эффекты', () => {
    it('заклинание должно иметь статус-эффекты', () => {
      const fireball = getSpell('fireball')!;
      
      expect(fireball.statusEffects).toBeDefined();
      expect(fireball.statusEffects!.length).toBeGreaterThan(0);
      
      const burn = fireball.statusEffects![0];
      expect(burn.type).toBe('burn');
      expect(burn.duration).toBe(5);
      expect(burn.tickInterval).toBe(1);
    });

    it('разные заклинания должны иметь разные эффекты', () => {
      const icebolt = getSpell('icebolt')!;
      const lightning = getSpell('lightning')!;
      
      expect(icebolt.statusEffects![0].type).toBe('slow');
      expect(lightning.statusEffects![0].type).toBe('shock');
    });
  });

  describe('Кулдауны', () => {
    it('должны предотвращать повторное применение', () => {
      const system = new MagicSystem();
      const caster = {
        id: 'mage2',
        name: 'Cooldown Mage',
        mana: 1000,
        maxMana: 1000,
        stamina: 100,
        maxStamina: 100,
        health: 100,
        maxHealth: 100,
        magicSkills: { [MagicSchool.Fire]: 50 },
        knownSpells: {},
        magicResist: 0,
        holyResist: 0,
        darkResist: 0,
        natureResist: 0,
        chaosResist: 0,
        intelligence: 50,
        willpower: 50,
      };
      
      system.registerCaster(caster);
      
      const target: any = {
        id: 'dummy',
        isAlly: false,
        magicResist: 0,
        holyResist: 0,
        darkResist: 0,
        natureResist: 0,
        chaosResist: 0,
        willpower: 0,
        currentHealth: 100,
        maxHealth: 100,
      };
      
      // Первое применение
      system.castSpell('mage2', 'fireball', [target]);
      
      // Сразу второе применение (должно быть заблокировано)
      const result = system.canCastSpell(caster, getSpell('fireball')!);
      
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain('сек.');
    });
  });
});
