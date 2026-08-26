/**
 * Симулятор роста персонажа от рождения до взросления
 * Интегрирует все системы детства: возрастные стадии, события, навыки
 */

import { DeterministicRNG } from '../../core/random/DeterministicRNG';
import { LifeStage, getLifeStage, getSkillGrowthMultiplier } from './AgeStages';
import { ChildhoodEvent, getAvailableEvents } from './ChildhoodEvents';
import { SkillDevelopment, calculateStatusBonuses, calculateBiomeBonuses, calculateRaceBonuses, type ChildhoodSkills } from './SkillDevelopment';

export interface GrowthConfig {
  raceId: string;
  maxLifespan: number;        // Максимальная продолжительность жизни расы
  socialStatus: number;       // Социальный статус семьи (0-100)
  biome: string;              // Биом места рождения
  settlementType?: string;    // Тип поселения (city, village, etc.)
  seed: string;               // Seed для детерминированной генерации
}

export interface ChildhoodMemory {
  age: number;
  event: ChildhoodEvent;
  impact: {
    skillsChanged: Record<string, number>;
    trauma: number;
    happyMemory: number;
  };
}

export interface GrowthResult {
  finalSkills: SkillDevelopment;
  memories: ChildhoodMemory[];
  totalTrauma: number;
  totalHappyMemories: number;
  unlockedProfessions: string[];
  acquiredTraits: string[];
  lostTraits: string[];
  healthAtAdulthood: number;
  adulthoodAge: number;
}

/**
 * Главный класс симуляции роста персонажа
 */
export class GrowthSimulator {
  private rng: DeterministicRNG;
  private config: GrowthConfig;
  private skills: SkillDevelopment;
  private memories: ChildhoodMemory[] = [];
  private totalTrauma = 0;
  private totalHappyMemories = 0;
  private unlockedProfessions: string[] = [];
  private acquiredTraits: Set<string> = new Set();
  private lostTraits: Set<string> = new Set();
  private currentHealth = 100;

  constructor(config: GrowthConfig) {
    this.config = config;
    this.rng = new DeterministicRNG(config.seed + '_growth');
    this.skills = new SkillDevelopment();
    
    // Применяем начальные бонусы
    this.applyInitialBonuses();
  }

  /**
   * Применить начальные бонусы от расы, статуса и биома
   */
  private applyInitialBonuses(): void {
    // Бонусы социального статуса
    const statusBonuses = calculateStatusBonuses(this.config.socialStatus);
    this.skills.applyEventEffects(statusBonuses);

    // Бонусы биома
    const biomeBonuses = calculateBiomeBonuses(this.config.biome);
    this.skills.applyEventEffects(biomeBonuses);

    // Расовые бонусы
    const raceBonuses = calculateRaceBonuses(this.config.raceId);
    this.skills.applyEventEffects(raceBonuses);
  }

  /**
   * Запустить полную симуляцию детства
   * @returns Результат симуляции
   */
  simulate(): GrowthResult {
    const adulthoodAge = this.getAdulthoodAge();
    
    // Симуляция по годам от 0 до возраста взросления
    for (let age = 0; age <= adulthoodAge; age++) {
      this.simulateYear(age);
    }

    return {
      finalSkills: this.skills,
      memories: this.memories,
      totalTrauma: this.totalTrauma,
      totalHappyMemories: this.totalHappyMemories,
      unlockedProfessions: this.unlockedProfessions,
      acquiredTraits: Array.from(this.acquiredTraits),
      lostTraits: Array.from(this.lostTraits),
      healthAtAdulthood: Math.max(0, this.currentHealth),
      adulthoodAge,
    };
  }

  /**
   * Симулировать один год жизни
   */
  private simulateYear(age: number): void {
    const stage = getLifeStage(age, this.config.maxLifespan);
    const multiplier = getSkillGrowthMultiplier(stage);

    // Определить количество событий в этом году
    const eventsCount = this.getEventsCountForYear(stage);

    // Получить доступные события
    const availableEvents = getAvailableEvents(
      age,
      this.config.socialStatus,
      this.config.biome
    );

    // Выбрать случайные события
    for (let i = 0; i < eventsCount && availableEvents.length > 0; i++) {
      const event = this.selectRandomEvent(availableEvents);
      if (event) {
        this.processEvent(event, age, multiplier);
      }
    }

    // Применить множитель роста навыков за этот год
    if (multiplier !== 1.0) {
      this.skills.applyGrowthMultiplier(1 + (multiplier - 1) * 0.1);
    }
  }

  /**
   * Получить количество событий для года
   */
  private getEventsCountForYear(stage: LifeStage): number {
    // Младенцы: почти нет событий
    if (stage === LifeStage.INFANT) {
      return this.rng.nextInt(0, 1);
    }

    // Раннее детство: 1-2 события в год
    if (stage === LifeStage.EARLY_CHILDHOOD) {
      return this.rng.nextInt(1, 2);
    }

    // Детство: 2-3 события
    if (stage === LifeStage.CHILDHOOD) {
      return this.rng.nextInt(2, 3);
    }

    // Подросток: 2-4 события
    if (stage === LifeStage.ADOLESCENCE) {
      return this.rng.nextInt(2, 4);
    }

    // Взрослый: события реже
    return this.rng.nextInt(1, 2);
  }

  /**
   * Выбрать случайное событие из доступных
   */
  private selectRandomEvent(events: ChildhoodEvent[]): ChildhoodEvent | null {
    if (events.length === 0) return null;

    const index = this.rng.nextInt(0, events.length - 1);
    return events[index];
  }

  /**
   * Обработать событие
   */
  private processEvent(event: ChildhoodEvent, age: number, growthMultiplier: number): void {
    // Применить эффекты к навыкам
    const skillsBefore = this.skills.getSkills();
    
    if (event.skillEffects) {
      // Применяем с учетом множителя роста
      const effectKeys = Object.keys(event.skillEffects) as Array<keyof ChildhoodSkills>;
      effectKeys.forEach(skill => {
        const effect = event.skillEffects[skill];
        if (effect !== undefined && effect !== 0) {
          const adjustedEffect = effect * (0.5 + growthMultiplier * 0.5);
          this.skills.addSkill(skill, adjustedEffect);
        }
      });
    }

    // Здоровье
    if (event.healthEffect !== undefined) {
      this.currentHealth += event.healthEffect;
    }

    // Травмы и воспоминания
    if (event.trauma !== undefined && event.trauma > 0) {
      this.totalTrauma += event.trauma;
    }
    if (event.happyMemory !== undefined && event.happyMemory > 0) {
      this.totalHappyMemories += event.happyMemory;
    }

    // Профессии
    if (event.unlocksProfession) {
      this.unlockedProfessions.push(`unlocked_by_${event.id}`);
    }

    // Черты характера
    if (event.addsTrait) {
      this.acquiredTraits.add(event.addsTrait);
    }
    if (event.removesTrait) {
      this.lostTraits.add(event.removesTrait);
      this.acquiredTraits.delete(event.removesTrait);
    }

    // Сохранить воспоминание
    const skillsAfter = this.skills.getSkills();
    const skillsChanged: Record<string, number> = {};
    
    const skillKeys = Object.keys(skillsBefore) as Array<keyof ChildhoodSkills>;
    skillKeys.forEach(skill => {
      const diff = skillsAfter[skill] - skillsBefore[skill];
      if (diff !== 0) {
        skillsChanged[skill] = diff;
      }
    });

    this.memories.push({
      age,
      event,
      impact: {
        skillsChanged,
        trauma: event.trauma || 0,
        happyMemory: event.happyMemory || 0,
      },
    });
  }

  /**
   * Получить возраст наступления взросления для расы
   */
  private getAdulthoodAge(): number {
    // Возраст взросления зависит от расы
    // Для людей ~16 лет, для эльфов больше, для орков меньше
    const baseAdulthoodRatio = 0.21; // 21% от максимальной продолжительности жизни
    
    switch (this.config.raceId.toLowerCase()) {
      case 'elf':
        return Math.floor(this.config.maxLifespan * 0.25); // ~25-30 лет
      case 'dwarf':
        return Math.floor(this.config.maxLifespan * 0.22); // ~30-35 лет
      case 'orc':
        return Math.floor(this.config.maxLifespan * 0.15); // ~12-14 лет
      case 'hobbit':
        return Math.floor(this.config.maxLifespan * 0.20); // ~18-20 лет
      default: // human
        return Math.floor(this.config.maxLifespan * baseAdulthoodRatio);
    }
  }

  /**
   * Статический метод для быстрой симуляции
   */
  static quickSimulate(config: GrowthConfig): GrowthResult {
    const simulator = new GrowthSimulator(config);
    return simulator.simulate();
  }

  /**
   * Создать несколько вариантов детства для одного персонажа
   * (для отладки или выбора альтернативных таймлайнов)
   */
  static simulateVariants(config: GrowthConfig, count: number): GrowthResult[] {
    const variants: GrowthResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const variantConfig = {
        ...config,
        seed: config.seed + `_variant_${i}`,
      };
      variants.push(this.quickSimulate(variantConfig));
    }
    
    return variants;
  }
}
