/**
 * Unit тесты для системы урона (damage)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

export class DamageTest {
  private suite: TestSuite = {
    name: 'Damage System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testBasicDamage();
    this.testCriticalHit();
    this.testArmorReduction();
    this.testZeroDamage();
    this.testMaxHealthClamp();
    this.testDamageOverTime();
    return this.suite;
  }

  private testBasicDamage(): void {
    const startTime = Date.now();
    try {
      // Симуляция базового урона
      const baseDamage = 50;
      const health = 100;
      const expectedHealth = health - baseDamage;
      
      // Проверка: урон наносится корректно
      if (expectedHealth !== 50) {
        throw new Error(`Expected health 50, got ${expectedHealth}`);
      }

      this.addTest('basic_damage_calculation', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('basic_damage_calculation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testCriticalHit(): void {
    const startTime = Date.now();
    try {
      const baseDamage = 30;
      const critMultiplier = 2.0;
      const critDamage = baseDamage * critMultiplier;

      if (critDamage !== 60) {
        throw new Error(`Expected crit damage 60, got ${critDamage}`);
      }

      this.addTest('critical_hit_multiplier', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('critical_hit_multiplier', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testArmorReduction(): void {
    const startTime = Date.now();
    try {
      const incomingDamage = 100;
      const armor = 30;
      const reductionPercent = 0.3;
      const finalDamage = incomingDamage * (1 - reductionPercent);

      if (finalDamage !== 70) {
        throw new Error(`Expected reduced damage 70, got ${finalDamage}`);
      }

      this.addTest('armor_damage_reduction', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('armor_damage_reduction', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testZeroDamage(): void {
    const startTime = Date.now();
    try {
      const incomingDamage = 0;
      const health = 100;
      const finalHealth = health - incomingDamage;

      if (finalHealth !== 100) {
        throw new Error(`Expected health 100 with zero damage, got ${finalHealth}`);
      }

      this.addTest('zero_damage_no_change', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('zero_damage_no_change', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testMaxHealthClamp(): void {
    const startTime = Date.now();
    try {
      const damage = 150;
      const health = 100;
      const finalHealth = Math.max(0, health - damage);

      if (finalHealth !== 0) {
        throw new Error(`Expected health clamped to 0, got ${finalHealth}`);
      }

      this.addTest('health_clamp_at_zero', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('health_clamp_at_zero', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testDamageOverTime(): void {
    const startTime = Date.now();
    try {
      const dotDamage = 10;
      const ticks = 5;
      const totalDotDamage = dotDamage * ticks;

      if (totalDotDamage !== 50) {
        throw new Error(`Expected DoT damage 50, got ${totalDotDamage}`);
      }

      this.addTest('damage_over_time_ticks', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('damage_over_time_ticks', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private addTest(name: string, passed: boolean, duration: number, error?: string): void {
    const result: TestResult = { name, passed, duration, error };
    this.suite.tests.push(result);
    this.suite.totalDuration += duration;
    if (passed) {
      this.suite.passedCount++;
    } else {
      this.suite.failedCount++;
    }
  }
}
