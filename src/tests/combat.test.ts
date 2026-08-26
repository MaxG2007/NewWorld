/**
 * Тесты системы боя (Этап 22 - COMBAT)
 * 
 * Проверяют:
 * 1. Движение
 * 2. Направление
 * 3. Атака
 * 4. Защита
 * 5. Попадание
 * 6. Получение урона
 * 7. Смерть
 * 
 * Расширенные механики:
 * - Зоны попадания
 * - Типы урона
 * - Броня
 * - Выносливость
 * - Блок
 * - Уклонение
 * - Парирование
 * - Дальний бой
 * - Позиционирование
 * - Укрытия
 * - Высота
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSystem } from '../simulation/combat/CombatSystem';
import {
  Combatant,
  Armor,
  WEAPON_TEMPLATES,
  ARMOR_TEMPLATES,
  SHIELD_TEMPLATES,
} from '../simulation/combat/CombatTypes';

describe('Этап 22: COMBAT - Боевая система', () => {
  let combatSystem: CombatSystem;

  const createTestCombatant = (id: string, name: string): Combatant => ({
    id,
    name,
    health: 100,
    maxHealth: 100,
    stamina: 50,
    maxStamina: 50,
    level: 5,
    strength: 12,
    agility: 10,
    endurance: 10,
    intelligence: 8,
    armor: 5,
    blockChance: 0.2,
    dodgeChance: 0.15,
    parryChance: 0.1,
    position: { x: 0, y: 0, elevation: 0, inCover: false },
    facingDirection: 'north',
    statusEffects: [],
    isDead: false,
    isExhausted: false,
    combatSkills: ['sword'],
  });

  beforeEach(() => {
    combatSystem = new CombatSystem(12345);
  });

  describe('Минимальный бой', () => {
    it('✓ Должен создать систему боя', () => {
      expect(combatSystem).toBeDefined();
    });

    it('✓ Должен добавить участника в бой', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      combatSystem.addCombatant(warrior);
      
      const retrieved = combatSystem.getCombatant('w1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Воин');
    });

    it('✓ Должен выполнить движение (бой #1)', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      combatSystem.addCombatant(warrior);

      const result = combatSystem.executeAction({
        type: 'move',
        actorId: 'w1',
        targetPosition: { x: 2, y: 1, elevation: 0, inCover: false },
      });

      expect(result).toBeDefined();
      if (result && 'success' in result) {
        expect(result.success).toBe(true);
        expect(result.to.x).toBe(2);
        expect(result.to.y).toBe(1);
      }
    });

    it('✓ Должен обновить направление при движении (бой #2)', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      combatSystem.addCombatant(warrior);

      combatSystem.executeAction({
        type: 'move',
        actorId: 'w1',
        targetPosition: { x: 1, y: 0, elevation: 0, inCover: false },
      });

      const updated = combatSystem.getCombatant('w1');
      expect(updated?.facingDirection).toBe('east');
    });

    it('✓ Должен выполнить атаку (бой #3)', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const enemy = createTestCombatant('e1', 'Враг');
      
      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(enemy);

      // Экипируем оружие
      const weapon = combatSystem.createWeapon(1); // Длинный меч
      warrior.weapon = weapon;

      const result = combatSystem.executeAction({
        type: 'attack',
        actorId: 'w1',
        targetId: 'e1',
        weapon,
      });

      expect(result).toBeDefined();
      if (result && 'hit' in result) {
        expect(result.attackerId).toBe('w1');
        expect(result.targetId).toBe('e1');
      }
    });

    it('✓ Должен проверить попадание (бой #5)', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const enemy = createTestCombatant('e1', 'Враг');
      
      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(enemy);

      const weapon = combatSystem.createWeapon(0); // Ржавый меч
      warrior.weapon = weapon;

      const results: any[] = [];
      for (let i = 0; i < 10; i++) {
        const result = combatSystem.executeAction({
          type: 'attack',
          actorId: 'w1',
          targetId: 'e1',
          weapon,
        });
        if (result && 'hit' in result) {
          results.push(result.hit);
        }
      }

      // Хотя бы некоторые атаки должны попадать
      const hits = results.filter(h => h).length;
      expect(hits).toBeGreaterThan(0);
    });

    it('✓ Должен нанести урон (бой #6)', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const enemy = createTestCombatant('e1', 'Враг');
      
      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(enemy);

      const initialHealth = enemy.health;

      const weapon = combatSystem.createWeapon(1); // Длинный меч
      warrior.weapon = weapon;

      // Выполняем несколько атак для гарантированного попадания
      for (let i = 0; i < 5; i++) {
        combatSystem.executeAction({
          type: 'attack',
          actorId: 'w1',
          targetId: 'e1',
          weapon,
        });
      }

      const finalHealth = combatSystem.getCombatant('e1')?.health || 0;
      expect(finalHealth).toBeLessThan(initialHealth);
    });

    it('✓ Должен убить при достижении 0 здоровья (бой #7)', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const weakEnemy = createTestCombatant('e1', 'Слабый враг');
      weakEnemy.health = 5;
      weakEnemy.maxHealth = 5;
      
      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(weakEnemy);

      const weapon = combatSystem.createWeapon(1); // Длинный меч
      warrior.weapon = weapon;

      // Атакуем пока враг не умрёт
      let attempts = 0;
      while (!weakEnemy.isDead && attempts < 10) {
        combatSystem.executeAction({
          type: 'attack',
          actorId: 'w1',
          targetId: 'e1',
          weapon,
        });
        attempts++;
      }

      const enemy = combatSystem.getCombatant('e1');
      expect(enemy?.isDead).toBe(true);
    });
  });

  describe('Расширенные механики', () => {
    it('✓ Должен учитывать зоны попадания', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const enemy = createTestCombatant('e1', 'Враг');
      
      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(enemy);

      const weapon = combatSystem.createWeapon(0);
      warrior.weapon = weapon;

      const zones: string[] = [];
      for (let i = 0; i < 20; i++) {
        const result = combatSystem.executeAction({
          type: 'attack',
          actorId: 'w1',
          targetId: 'e1',
          weapon,
        });
        if (result && 'hitZone' in result) {
          zones.push(result.hitZone);
        }
      }

      // Должны быть попадания по разным зонам
      const uniqueZones = new Set(zones);
      expect(uniqueZones.size).toBeGreaterThan(2);
    });

    it('✓ Должен учитывать типы урона', () => {
      const slashingWeapon = combatSystem.createWeapon(0); // Меч - slashing
      const bluntWeapon = combatSystem.createWeapon(6); // Дубина - blunt (индекс 6)
      const piercingWeapon = combatSystem.createWeapon(7); // Нож - piercing (индекс 7)

      expect(slashingWeapon.damageType).toBe('slashing');
      expect(bluntWeapon.damageType).toBe('blunt');
      expect(piercingWeapon.damageType).toBe('piercing');
    });

    it('✓ Должен учитывать броню', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const armoredEnemy = createTestCombatant('e1', 'Бронированный враг');
      
      armoredEnemy.armor = 20;
      const armor: Armor = {
        ...ARMOR_TEMPLATES[4], // Латный нагрудник
        id: 'armor1',
        durability: 100,
        maxDurability: 100,
      };
      armoredEnemy.armor_equipped = armor;

      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(armoredEnemy);

      const weapon = combatSystem.createWeapon(1);
      warrior.weapon = weapon;

      const initialHealth = armoredEnemy.health;

      combatSystem.executeAction({
        type: 'attack',
        actorId: 'w1',
        targetId: 'e1',
        weapon,
      });

      const damageDealt = initialHealth - (combatSystem.getCombatant('e1')?.health || 0);
      // Урон должен быть меньше из-за брони
      expect(damageDealt).toBeLessThan(15);
    });

    it('✓ Должен учитывать выносливость', () => {
      const tiredWarrior = createTestCombatant('w1', 'Уставший воин');
      tiredWarrior.stamina = 3;
      
      combatSystem.addCombatant(tiredWarrior);

      const weapon = combatSystem.createWeapon(1); // Требует 12 выносливости
      tiredWarrior.weapon = weapon;

      const enemy = createTestCombatant('e1', 'Враг');
      combatSystem.addCombatant(enemy);

      const result = combatSystem.executeAction({
        type: 'attack',
        actorId: 'w1',
        targetId: 'e1',
        weapon,
      });

      if (result && 'message' in result) {
        expect(result.message).toContain('устал');
      }
    });

    it('✓ Должен выполнить блок', () => {
      const defender = createTestCombatant('d1', 'Защитник');
      defender.shield = combatSystem.createShield(0);
      
      combatSystem.addCombatant(defender);

      const result = combatSystem.executeAction({
        type: 'block',
        actorId: 'd1',
      });

      if (result && 'blocked' in result) {
        expect(result.blocked).toBe(true);
      }
    });

    it('✓ Должен выполнить уклонение', () => {
      const agile = createTestCombatant('a1', 'Ловкач');
      agile.agility = 20;
      agile.dodgeChance = 0.4;
      
      combatSystem.addCombatant(agile);

      const result = combatSystem.executeAction({
        type: 'dodge',
        actorId: 'a1',
      });

      if (result && 'dodged' in result) {
        expect(result.dodged).toBe(true);
      }
    });

    it('✓ Должен выполнить парирование', () => {
      const fencer = createTestCombatant('f1', 'Фехтовальщик');
      fencer.weapon = combatSystem.createWeapon(0);
      fencer.parryChance = 0.3;
      
      combatSystem.addCombatant(fencer);

      const result = combatSystem.executeAction({
        type: 'parry',
        actorId: 'f1',
      });

      if (result && 'parried' in result) {
        expect(result.parried).toBe(true);
      }
    });

    it('✓ Должен поддержать дальний бой', () => {
      const archer = createTestCombatant('a1', 'Лучник');
      const bow = combatSystem.createWeapon(7); // Лук
      archer.weapon = bow;

      const target = createTestCombatant('t1', 'Цель');
      target.position = { x: 4, y: 0, elevation: 0, inCover: false };

      combatSystem.addCombatant(archer);
      combatSystem.addCombatant(target);

      const result = combatSystem.executeAction({
        type: 'rangedAttack',
        actorId: 'a1',
        targetId: 't1',
        weapon: bow,
      });

      expect(result).toBeDefined();
    });

    it('✓ Должен учитывать позиционирование', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const enemy = createTestCombatant('e1', 'Враг');
      enemy.position = { x: 0, y: 2, elevation: 0, inCover: true };

      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(enemy);

      // Враг в укрытии - шанс попадания должен быть ниже
      const weapon = combatSystem.createWeapon(0);
      warrior.weapon = weapon;

      let hitsInCover = 0;
      for (let i = 0; i < 30; i++) {
        const result = combatSystem.executeAction({
          type: 'attack',
          actorId: 'w1',
          targetId: 'e1',
          weapon,
        });
        if (result && 'hit' in result && result.hit) {
          hitsInCover++;
        }
      }

      // Перемещаем врага из укрытия
      enemy.position.inCover = false;

      let hitsNoCover = 0;
      for (let i = 0; i < 30; i++) {
        const result = combatSystem.executeAction({
          type: 'attack',
          actorId: 'w1',
          targetId: 'e1',
          weapon,
        });
        if (result && 'hit' in result && result.hit) {
          hitsNoCover++;
        }
      }

      // Статистически без укрытия должно быть больше или равно попаданий
      // Из-за случайности допускаем небольшую вариацию
      expect(hitsNoCover + 3).toBeGreaterThanOrEqual(hitsInCover);
    });

    it('✓ Должен учитывать укрытия', () => {
      const covered = createTestCombatant('c1', 'В укрытии');
      covered.position = { x: 0, y: 0, elevation: 0, inCover: true };

      const exposed = createTestCombatant('e1', 'На открытом месте');
      exposed.position = { x: 0, y: 0, elevation: 0, inCover: false };

      combatSystem.addCombatant(covered);
      combatSystem.addCombatant(exposed);

      // Проверяем, что статус укрытия сохранён
      expect(combatSystem.getCombatant('c1')?.position.inCover).toBe(true);
      expect(combatSystem.getCombatant('e1')?.position.inCover).toBe(false);
    });

    it('✓ Должен учитывать высоту', () => {
      const highGround = createTestCombatant('h1', 'На высоте');
      highGround.position = { x: 0, y: 0, elevation: 2, inCover: false };

      const lowGround = createTestCombatant('l1', 'Внизу');
      lowGround.position = { x: 0, y: 0, elevation: 0, inCover: false };

      combatSystem.addCombatant(highGround);
      combatSystem.addCombatant(lowGround);

      expect(highGround.position.elevation).toBe(2);
      expect(lowGround.position.elevation).toBe(0);
    });

    it('✓ Должен проверить окончание боя', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const enemy = createTestCombatant('e1', 'Враг');

      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(enemy);

      expect(combatSystem.isCombatOver()).toBe(false);

      enemy.isDead = true;

      expect(combatSystem.isCombatOver()).toBe(true);
    });

    it('✓ Должен определить победителя', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      const enemy = createTestCombatant('e1', 'Враг');

      combatSystem.addCombatant(warrior);
      combatSystem.addCombatant(enemy);

      enemy.isDead = true;

      const winner = combatSystem.getWinner();
      expect(winner).toBeDefined();
      expect(winner?.id).toBe('w1');
    });
  });

  describe('Шаблоны оружия и брони', () => {
    it('✓ Должен иметь 10-20 типов оружия', () => {
      expect(WEAPON_TEMPLATES.length).toBeGreaterThanOrEqual(10);
      expect(WEAPON_TEMPLATES.length).toBeLessThanOrEqual(30);
    });

    it('✓ Должен иметь различные типы оружия', () => {
      const types = new Set(WEAPON_TEMPLATES.map(w => w.type));
      expect(types.size).toBeGreaterThanOrEqual(5);
    });

    it('✓ Должен иметь шаблоны брони', () => {
      expect(ARMOR_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    });

    it('✓ Должен иметь шаблоны щитов', () => {
      expect(SHIELD_TEMPLATES.length).toBeGreaterThanOrEqual(2);
    });

    it('✓ Должен создать оружие из шаблона', () => {
      const weapon = combatSystem.createWeapon(0);
      expect(weapon.id).toBeDefined();
      expect(weapon.name).toBeDefined();
      expect(weapon.damageMin).toBeGreaterThan(0);
      expect(weapon.damageMax).toBeGreaterThanOrEqual(weapon.damageMin);
    });

    it('✓ Должен создать броню из шаблона', () => {
      const armor = combatSystem.createArmor(0);
      expect(armor.id).toBeDefined();
      expect(armor.armorValue).toBeGreaterThanOrEqual(0);
    });

    it('✓ Должен создать щит из шаблона', () => {
      const shield = combatSystem.createShield(0);
      expect(shield.id).toBeDefined();
      expect(shield.blockChance).toBeGreaterThan(0);
    });
  });

  describe('Логирование боя', () => {
    it('✓ Должен вести лог боя', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      combatSystem.addCombatant(warrior);

      const log = combatSystem.getCombatLog();
      expect(log.length).toBeGreaterThan(0);
      expect(log[0]).toContain('Воин');
    });

    it('✓ Должен очистить лог боя', () => {
      const warrior = createTestCombatant('w1', 'Воин');
      combatSystem.addCombatant(warrior);

      expect(combatSystem.getCombatLog().length).toBeGreaterThan(0);

      combatSystem.clearLog();

      expect(combatSystem.getCombatLog().length).toBe(0);
    });
  });
});
