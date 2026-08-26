/**
 * CombatSystem - Система боя
 * 
 * Реализует:
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
 * - Эффекты состояний
 */

import { DeterministicRNG as SeededRandom } from '../../core/random/DeterministicRNG';
import {
  Combatant,
  CombatAction,
  AttackResult,
  MoveResult,
  CombatPosition,
  Weapon,
  Armor,
  Shield,
  HitZone,
  CombatConfig,
  DEFAULT_COMBAT_CONFIG,
  WEAPON_TEMPLATES,
  ARMOR_TEMPLATES,
  SHIELD_TEMPLATES,
} from './CombatTypes';

export class CombatSystem {
  private rng: SeededRandom;
  private config: CombatConfig;
  private combatants: Map<string, Combatant>;
  private combatLog: string[];

  constructor(seed: number, config: CombatConfig = DEFAULT_COMBAT_CONFIG) {
    this.rng = new SeededRandom(seed);
    this.config = config;
    this.combatants = new Map();
    this.combatLog = [];
  }

  /** Добавить участника в бой */
  addCombatant(combatant: Combatant): void {
    this.combatants.set(combatant.id, combatant);
    this.log(`${combatant.name} вступает в бой`);
  }

  /** Удалить участника из боя */
  removeCombatant(combatantId: string): void {
    const combatant = this.combatants.get(combatantId);
    if (combatant) {
      this.combatants.delete(combatantId);
      this.log(`${combatant.name} покидает бой`);
    }
  }

  /** Получить участника по ID */
  getCombatant(id: string): Combatant | undefined {
    return this.combatants.get(id);
  }

  /** Выполнить действие в бою */
  executeAction(action: CombatAction): AttackResult | MoveResult | null {
    const actor = this.combatants.get(action.actorId);
    if (!actor || actor.isDead) {
      return null;
    }

    switch (action.type) {
      case 'move':
        return this.move(actor, action.targetPosition!);
      case 'attack':
      case 'rangedAttack':
        if (!action.targetId) return null;
        const target = this.combatants.get(action.targetId);
        if (!target || target.isDead) return null;
        return this.attack(actor, target, action.weapon);
      case 'defend':
        return this.defend(actor);
      case 'block':
        return this.block(actor);
      case 'parry':
        return this.parry(actor);
      case 'dodge':
        return this.dodge(actor);
      case 'wait':
        return this.wait(actor);
      default:
        return null;
    }
  }

  /** Движение (минимальный бой #1) */
  private move(combatant: Combatant, targetPosition: CombatPosition): MoveResult {
    const from = { ...combatant.position };
    
    // Проверка выносливости
    const distance = this.calculateDistance(combatant.position, targetPosition);
    const staminaCost = Math.floor(distance * 2);
    
    if (combatant.stamina < staminaCost) {
      const result: MoveResult = {
        combatantId: combatant.id,
        from,
        to: from,
        success: false,
        staminaUsed: 0,
        message: `${combatant.name} слишком устал для движения`,
      };
      this.log(result.message);
      return result;
    }

    // Проверка досягаемости (простая проверка дистанции)
    if (distance > 3) {
      const result: MoveResult = {
        combatantId: combatant.id,
        from,
        to: from,
        success: false,
        staminaUsed: 0,
        message: `${combatant.name} не может достичь этой позиции`,
      };
      this.log(result.message);
      return result;
    }

    combatant.position = { ...targetPosition };
    combatant.stamina -= staminaCost;

    // Обновление направления
    if (targetPosition.x > from.x) combatant.facingDirection = 'east';
    else if (targetPosition.x < from.x) combatant.facingDirection = 'west';
    else if (targetPosition.y > from.y) combatant.facingDirection = 'south';
    else if (targetPosition.y < from.y) combatant.facingDirection = 'north';

    const result: MoveResult = {
      combatantId: combatant.id,
      from,
      to: { ...combatant.position },
      success: true,
      staminaUsed: staminaCost,
      message: `${combatant.name} перемещается на позицию (${targetPosition.x}, ${targetPosition.y})`,
    };
    this.log(result.message);
    return result;
  }

  /** Атака (минимальный бой #3, #5) */
  private attack(attacker: Combatant, defender: Combatant, weapon?: Weapon): AttackResult {
    const usedWeapon = weapon || attacker.weapon || this.createUnarmedWeapon();
    
    // Проверка выносливости
    if (attacker.stamina < usedWeapon.staminaCost) {
      const result: AttackResult = {
        attackerId: attacker.id,
        targetId: defender.id,
        hit: false,
        critical: false,
        damage: 0,
        damageType: usedWeapon.damageType,
        hitZone: 'chest',
        blocked: false,
        dodged: false,
        parried: false,
        staminaUsed: 0,
        message: `${attacker.name} слишком устал для атаки`,
      };
      this.log(result.message);
      return result;
    }

    attacker.stamina -= usedWeapon.staminaCost;

    // Проверка дальности
    const distance = this.calculateDistance(attacker.position, defender.position);
    if (distance > usedWeapon.range && usedWeapon.range > 0) {
      const result: AttackResult = {
        attackerId: attacker.id,
        targetId: defender.id,
        hit: false,
        critical: false,
        damage: 0,
        damageType: usedWeapon.damageType,
        hitZone: 'chest',
        blocked: false,
        dodged: false,
        parried: false,
        staminaUsed: usedWeapon.staminaCost,
        message: `${attacker.name} атакует, но цель слишком далеко`,
      };
      this.log(result.message);
      return result;
    }

    // Определение зоны попадания
    const hitZone = this.determineHitZone(attacker, defender);

    // Проверка попадания
    const hitChance = this.calculateHitChance(attacker, defender, usedWeapon);
    const hitRoll = this.rng.nextFloat();
    const hit = hitRoll < hitChance;

    if (!hit) {
      const result: AttackResult = {
        attackerId: attacker.id,
        targetId: defender.id,
        hit: false,
        critical: false,
        damage: 0,
        damageType: usedWeapon.damageType,
        hitZone,
        blocked: false,
        dodged: false,
        parried: false,
        staminaUsed: usedWeapon.staminaCost,
        message: `${attacker.name} промахивается по ${defender.name}`,
      };
      this.log(result.message);
      return result;
    }

    // Проверка на критический удар
    const criticalRoll = this.rng.nextFloat();
    const critical = criticalRoll < this.config.criticalChance;

    // Расчёт урона
    let damage = this.calculateDamage(attacker, defender, usedWeapon, hitZone, critical);

    // Проверка блока
    const blocked = this.checkBlock(defender, usedWeapon);
    if (blocked) {
      damage = Math.floor(damage * 0.3); // Блок снижает урон на 70%
    }

    // Проверка парирования
    const parried = this.checkParry(defender, usedWeapon);
    if (parried) {
      damage = 0;
    }

    // Проверка уклонения
    const dodged = this.checkDodge(defender, usedWeapon);
    if (dodged) {
      const result: AttackResult = {
        attackerId: attacker.id,
        targetId: defender.id,
        hit: true,
        critical: false,
        damage: 0,
        damageType: usedWeapon.damageType,
        hitZone,
        blocked: false,
        dodged: true,
        parried: false,
        staminaUsed: usedWeapon.staminaCost,
        message: `${defender.name} уклоняется от атаки ${attacker.name}`,
      };
      this.log(result.message);
      return result;
    }

    // Применение урона (минимальный бой #6)
    if (damage > 0) {
      defender.health = Math.max(0, defender.health - damage);
      
      // Проверка на смерть (минимальный бой #7)
      if (defender.health <= 0) {
        defender.isDead = true;
        this.log(`${attacker.name} убивает ${defender.name}!`);
      }
    }

    const result: AttackResult = {
      attackerId: attacker.id,
      targetId: defender.id,
      hit: true,
      critical,
      damage,
      damageType: usedWeapon.damageType,
      hitZone,
      blocked,
      dodged: false,
      parried,
      staminaUsed: usedWeapon.staminaCost,
      message: `${attacker.name} наносит ${damage} урона по ${defender.name}${critical ? ' (КРИТИЧЕСКИЙ УДАР!)' : ''}`,
    };
    this.log(result.message);
    return result;
  }

  /** Защита */
  private defend(combatant: Combatant): AttackResult {
    combatant.blockChance += 0.2; // +20% к блоку
    combatant.dodgeChance += 0.1; // +10% к уклонению
    
    const result: AttackResult = {
      attackerId: combatant.id,
      targetId: combatant.id,
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      hitZone: 'chest',
      blocked: false,
      dodged: false,
      parried: false,
      staminaUsed: 5,
      message: `${combatant.name} занимает оборонительную позицию`,
    };
    this.log(result.message);
    return result;
  }

  /** Блок */
  private block(combatant: Combatant): AttackResult {
    const staminaCost = 8;
    if (combatant.stamina < staminaCost) {
      const result: AttackResult = {
        attackerId: combatant.id,
        targetId: combatant.id,
        hit: false,
        critical: false,
        damage: 0,
        damageType: 'physical',
        hitZone: 'chest',
        blocked: false,
        dodged: false,
        parried: false,
        staminaUsed: 0,
        message: `${combatant.name} пытается заблокировать, но слишком устал`,
      };
      this.log(result.message);
      return result;
    }

    combatant.stamina -= staminaCost;
    
    const result: AttackResult = {
      attackerId: combatant.id,
      targetId: combatant.id,
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      hitZone: 'chest',
      blocked: true,
      dodged: false,
      parried: false,
      staminaUsed: staminaCost,
      message: `${combatant.name} готовится к блоку`,
    };
    this.log(result.message);
    return result;
  }

  /** Парирование */
  private parry(combatant: Combatant): AttackResult {
    const staminaCost = 10;
    if (combatant.stamina < staminaCost) {
      const result: AttackResult = {
        attackerId: combatant.id,
        targetId: combatant.id,
        hit: false,
        critical: false,
        damage: 0,
        damageType: 'physical',
        hitZone: 'chest',
        blocked: false,
        dodged: false,
        parried: false,
        staminaUsed: 0,
        message: `${combatant.name} пытается парировать, но слишком устал`,
      };
      this.log(result.message);
      return result;
    }

    combatant.stamina -= staminaCost;
    
    const result: AttackResult = {
      attackerId: combatant.id,
      targetId: combatant.id,
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      hitZone: 'chest',
      blocked: false,
      dodged: false,
      parried: true,
      staminaUsed: staminaCost,
      message: `${combatant.name} готовится к парированию`,
    };
    this.log(result.message);
    return result;
  }

  /** Уклонение */
  private dodge(combatant: Combatant): AttackResult {
    const staminaCost = 12;
    if (combatant.stamina < staminaCost) {
      const result: AttackResult = {
        attackerId: combatant.id,
        targetId: combatant.id,
        hit: false,
        critical: false,
        damage: 0,
        damageType: 'physical',
        hitZone: 'chest',
        blocked: false,
        dodged: false,
        parried: false,
        staminaUsed: 0,
        message: `${combatant.name} пытается уклониться, но слишком устал`,
      };
      this.log(result.message);
      return result;
    }

    combatant.stamina -= staminaCost;
    
    const result: AttackResult = {
      attackerId: combatant.id,
      targetId: combatant.id,
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      hitZone: 'chest',
      blocked: false,
      dodged: true,
      parried: false,
      staminaUsed: staminaCost,
      message: `${combatant.name} готовится к уклонению`,
    };
    this.log(result.message);
    return result;
  }

  /** Выжидание */
  private wait(combatant: Combatant): AttackResult {
    const staminaRegen = 5;
    combatant.stamina = Math.min(combatant.maxStamina, combatant.stamina + staminaRegen);
    
    const result: AttackResult = {
      attackerId: combatant.id,
      targetId: combatant.id,
      hit: false,
      critical: false,
      damage: 0,
      damageType: 'physical',
      hitZone: 'chest',
      blocked: false,
      dodged: false,
      parried: false,
      staminaUsed: -staminaRegen,
      message: `${combatant.name} выжидает и восстанавливает выносливость`,
    };
    this.log(result.message);
    return result;
  }

  /** Расчёт шанса попадания */
  private calculateHitChance(attacker: Combatant, defender: Combatant, weapon: Weapon): number {
    let baseChance = 0.75; // 75% базовый шанс

    // Бонус от ловкости атакующего
    baseChance += (attacker.agility - 10) * 0.02;

    // Штраф от ловкости защищающегося
    baseChance -= (defender.agility - 10) * 0.015;

    // Бонус от укрытия
    if (defender.position.inCover) {
      baseChance -= 0.2;
    }

    // Штраф за высоту
    const elevationDiff = defender.position.elevation - attacker.position.elevation;
    if (elevationDiff > 0) {
      baseChance -= elevationDiff * 0.1;
    }

    // Штраф за дистанцию для дальнего боя
    if (weapon.range > 0) {
      const distance = this.calculateDistance(attacker.position, defender.position);
      baseChance -= (distance / weapon.range) * 0.2;
    }

    return Math.max(0.1, Math.min(0.95, baseChance));
  }

  /** Расчёт урона */
  private calculateDamage(
    attacker: Combatant,
    defender: Combatant,
    weapon: Weapon,
    hitZone: HitZone,
    critical: boolean
  ): number {
    // Базовый урон оружия
    const baseDamage = this.rng.nextInt(weapon.damageMin, weapon.damageMax);

    // Бонус от силы
    const strengthBonus = Math.floor((attacker.strength - 10) * 0.5);

    // Множитель по зоне
    const zoneMultiplier = this.config.zoneDamageMultipliers[hitZone];

    // Критический множитель
    const critMultiplier = critical ? this.config.criticalMultiplier : 1.0;

    // Расчёт до брони
    let rawDamage = (baseDamage + strengthBonus) * zoneMultiplier * critMultiplier;

    // Вычет брони
    const effectiveArmor = this.calculateEffectiveArmor(defender, hitZone);
    const armorReduction = Math.floor(effectiveArmor * 0.5);

    const finalDamage = Math.max(1, rawDamage - armorReduction);

    return Math.floor(finalDamage);
  }

  /** Расчёт эффективной брони для зоны */
  private calculateEffectiveArmor(defender: Combatant, hitZone: HitZone): number {
    let totalArmor = defender.armor;

    // Добавляем броню от экипировки
    if (defender.armor_equipped) {
      const armor = defender.armor_equipped;
      if (armor.protectedZones.includes(hitZone)) {
        totalArmor += armor.armorValue;
      }
    }

    // Добавляем броню от щита при блоке
    if (defender.shield) {
      totalArmor += Math.floor(defender.shield.armorValue * 0.5);
    }

    return totalArmor;
  }

  /** Проверка блока */
  private checkBlock(defender: Combatant, _weapon: Weapon): boolean {
    if (!defender.shield) return false;

    const blockChance = defender.blockChance + this.config.blockBaseChance;
    const blockRoll = this.rng.nextFloat();
    
    return blockRoll < blockChance;
  }

  /** Проверка парирования */
  private checkParry(defender: Combatant, _weapon: Weapon): boolean {
    if (!defender.weapon || defender.weapon.type === 'bow' || defender.weapon.type === 'crossbow') {
      return false;
    }

    const parryChance = defender.parryChance + this.config.parryBaseChance;
    const parryRoll = this.rng.nextFloat();
    
    return parryRoll < parryChance;
  }

  /** Проверка уклонения */
  private checkDodge(defender: Combatant, weapon: Weapon): boolean {
    // Тяжёлое оружие сложнее уклонить
    let dodgePenalty = 0;
    if (weapon.weight > 4) {
      dodgePenalty = 0.1;
    }

    const dodgeChance = Math.max(0, defender.dodgeChance + this.config.dodgeBaseChance - dodgePenalty);
    const dodgeRoll = this.rng.nextFloat();
    
    return dodgeRoll < dodgeChance;
  }

  /** Определение зоны попадания */
  private determineHitZone(_attacker: Combatant, _defender: Combatant): HitZone {
    const zones: HitZone[] = ['head', 'chest', 'abdomen', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
    const weights = [0.1, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1]; // Вероятности по зонам

    const roll = this.rng.nextFloat();
    let cumulative = 0;
    
    for (let i = 0; i < zones.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) {
        return zones[i];
      }
    }
    
    return 'chest';
  }

  /** Расчёт расстояния между позициями */
  private calculateDistance(from: CombatPosition, to: CombatPosition): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    return Math.max(dx, dy); // Расстояние Чебышёва (для сетки)
  }

  /** Создание оружия безоружного боя */
  private createUnarmedWeapon(): Weapon {
    const template = WEAPON_TEMPLATES.find(w => w.type === 'unarmed');
    return {
      ...template!,
      id: 'unarmed',
      durability: 999,
      maxDurability: 999,
    };
  }

  /** Создание оружия из шаблона */
  createWeapon(templateIndex: number): Weapon {
    const template = WEAPON_TEMPLATES[templateIndex % WEAPON_TEMPLATES.length];
    const maxDurability = 100 + this.rng.nextInt(-20, 20);
    return {
      ...template,
      id: `weapon_${this.rng.nextInt(1000, 9999)}`,
      durability: maxDurability,
      maxDurability,
    };
  }

  /** Создание брони из шаблона */
  createArmor(templateIndex: number): Armor {
    const template = ARMOR_TEMPLATES[templateIndex % ARMOR_TEMPLATES.length];
    const maxDurability = 100 + this.rng.nextInt(-20, 20);
    return {
      ...template,
      id: `armor_${this.rng.nextInt(1000, 9999)}`,
      durability: maxDurability,
      maxDurability,
    };
  }

  /** Создание щита из шаблона */
  createShield(templateIndex: number): Shield {
    const template = SHIELD_TEMPLATES[templateIndex % SHIELD_TEMPLATES.length];
    const maxDurability = 100 + this.rng.nextInt(-20, 20);
    return {
      ...template,
      id: `shield_${this.rng.nextInt(1000, 9999)}`,
      durability: maxDurability,
      maxDurability,
    };
  }

  /** Логирование */
  private log(message: string): void {
    this.combatLog.push(message);
  }

  /** Получить лог боя */
  getCombatLog(): string[] {
    return [...this.combatLog];
  }

  /** Очистить лог боя */
  clearLog(): void {
    this.combatLog = [];
  }

  /** Проверить окончание боя */
  isCombatOver(): boolean {
    const aliveCombatants = Array.from(this.combatants.values()).filter(c => !c.isDead);
    return aliveCombatants.length <= 1;
  }

  /** Получить победителя */
  getWinner(): Combatant | null {
    const aliveCombatants = Array.from(this.combatants.values()).filter(c => !c.isDead);
    return aliveCombatants.length === 1 ? aliveCombatants[0] : null;
  }
}
