import { describe, it, expect } from 'vitest';
import { LifeStage, getLifeStage, canPerformAction, getSkillGrowthMultiplier } from './AgeStages';
import { ChildhoodEventType, getAvailableEvents, CHILDHOOD_EVENTS } from './ChildhoodEvents';
import { SkillDevelopment, calculateStatusBonuses, calculateBiomeBonuses } from './SkillDevelopment';
import { GrowthSimulator } from './GrowthSimulator';

describe('Этап 14: CHILDHOOD + GROWTH', () => {
  describe('Возрастные стадии', () => {
    it('должен корректно определять стадии для человека (maxLifespan=80)', () => {
      expect(getLifeStage(1, 80)).toBe(LifeStage.INFANT);
      expect(getLifeStage(4, 80)).toBe(LifeStage.EARLY_CHILDHOOD);
      expect(getLifeStage(8, 80)).toBe(LifeStage.CHILDHOOD);
      expect(getLifeStage(14, 80)).toBe(LifeStage.ADOLESCENCE);
      expect(getLifeStage(20, 80)).toBe(LifeStage.ADULTHOOD);
      expect(getLifeStage(60, 80)).toBe(LifeStage.MIDDLE_AGE);
      expect(getLifeStage(75, 80)).toBe(LifeStage.ELDERLY);
    });

    it('должен учитывать расу при определении стадии (эльф, maxLifespan=200)', () => {
      // Эльфы взрослеют медленнее
      // При maxLifespan=200: 10 лет = 5% (early_childhood: 4-8%), 20 лет = 10% (childhood: 9-15%)
      expect(getLifeStage(10, 200)).toBe(LifeStage.EARLY_CHILDHOOD);
      expect(getLifeStage(20, 200)).toBe(LifeStage.CHILDHOOD);
      expect(getLifeStage(32, 200)).toBe(LifeStage.ADOLESCENCE); // 16% 
      expect(getLifeStage(45, 200)).toBe(LifeStage.ADULTHOOD); // 22.5%
    });

    it('должен проверять возможность действий на стадии', () => {
      expect(canPerformAction(LifeStage.INFANT, 'learn')).toBe(false);
      expect(canPerformAction(LifeStage.CHILDHOOD, 'learn')).toBe(true);
      expect(canPerformAction(LifeStage.ADULTHOOD, 'work')).toBe(true);
      expect(canPerformAction(LifeStage.ADULTHOOD, 'marry')).toBe(true);
      expect(canPerformAction(LifeStage.CHILDHOOD, 'fight')).toBe(false);
    });

    it('должен возвращать правильный множитель роста навыков', () => {
      expect(getSkillGrowthMultiplier(LifeStage.CHILDHOOD)).toBeGreaterThan(1);
      expect(getSkillGrowthMultiplier(LifeStage.ADULTHOOD)).toBe(1.0);
      expect(getSkillGrowthMultiplier(LifeStage.ELDERLY)).toBeLessThan(1);
    });
  });

  describe('События детства', () => {
    it('должен содержать все требуемые типы событий', () => {
      const types = new Set(CHILDHOOD_EVENTS.map(e => e.type));
      
      // Болезни и травмы
      expect(types.has(ChildhoodEventType.ILLNESS)).toBe(true);
      expect(types.has(ChildhoodEventType.INJURY)).toBe(true);
      
      // Социальные
      expect(types.has(ChildhoodEventType.GAME)).toBe(true);
      expect(types.has(ChildhoodEventType.FIGHT)).toBe(true);
      expect(types.has(ChildhoodEventType.FESTIVAL)).toBe(true);
      expect(types.has(ChildhoodEventType.RELIGIOUS_RITE)).toBe(true);
      
      // Обучение
      expect(types.has(ChildhoodEventType.LEARNING)).toBe(true);
      expect(types.has(ChildhoodEventType.PROFESSION_TRAINING)).toBe(true);
      
      // Семья
      expect(types.has(ChildhoodEventType.FAMILY_LOSS)).toBe(true);
      expect(types.has(ChildhoodEventType.FAMILY_MOVE)).toBe(true);
      expect(types.has(ChildhoodEventType.FAMILY_SECRET)).toBe(true);
      
      // Внешние события
      expect(types.has(ChildhoodEventType.WAR)).toBe(true);
      expect(types.has(ChildhoodEventType.MEETING)).toBe(true);
      
      // Исследование
      expect(types.has(ChildhoodEventType.DISCOVERY)).toBe(true);
    });

    it('должен фильтровать события по возрасту', () => {
      const eventsForBaby = getAvailableEvents(1, 50);
      const eventsForTeen = getAvailableEvents(14, 50);
      
      expect(eventsForBaby.length).toBeLessThanOrEqual(eventsForTeen.length);
    });

    it('должен фильтровать события по социальному статусу', () => {
      const eventsForRich = getAvailableEvents(10, 90);
      
      // Богатые имеют доступ к большему количеству событий обучения
      const richHasEducation = eventsForRich.some(e => 
        e.type === ChildhoodEventType.LEARNING || 
        e.type === ChildhoodEventType.PROFESSION_TRAINING
      );
      
      expect(richHasEducation).toBe(true);
    });
  });

  describe('Развитие навыков', () => {
    it('должен создавать навыки с базовыми значениями', () => {
      const skills = new SkillDevelopment();
      const allSkills = skills.getSkills();
      
      expect(allSkills.strength).toBeDefined();
      expect(allSkills.intelligence).toBeDefined();
      expect(allSkills.dexterity).toBeDefined();
      expect(allSkills.speech).toBeDefined();
      expect(allSkills.observation).toBeDefined();
      expect(allSkills.sociability).toBeDefined();
      expect(allSkills.crafting).toBeDefined();
      expect(allSkills.survival).toBeDefined();
    });

    it('должен применять бонусы социального статуса', () => {
      const highStatusBonuses = calculateStatusBonuses(80);
      const lowStatusBonuses = calculateStatusBonuses(10);
      
      expect(highStatusBonuses.intelligence).toBeGreaterThan(0);
      expect(lowStatusBonuses.survival).toBeGreaterThan(0);
    });

    it('должен применять бонусы биома', () => {
      const forestBonuses = calculateBiomeBonuses('forest');
      const mountainBonuses = calculateBiomeBonuses('mountain');
      const cityBonuses = calculateBiomeBonuses('city');
      
      expect(forestBonuses.survival).toBeGreaterThan(0);
      expect(mountainBonuses.strength).toBeGreaterThan(0);
      expect(cityBonuses.speech).toBeGreaterThan(0);
    });

    it('должен ограничивать диапазон навыков', () => {
      const skills = new SkillDevelopment();
      
      // Пытаемся добавить очень большое значение
      skills.addSkill('strength', 100);
      expect(skills.getSkill('strength')).toBeLessThanOrEqual(20);
      
      // Пытаемся добавить очень отрицательное значение
      skills.addSkill('intelligence', -50);
      expect(skills.getSkill('intelligence')).toBeGreaterThanOrEqual(-10);
    });
  });

  describe('Симулятор роста', () => {
    it('должен запускать симуляцию для человека', () => {
      const result = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 50,
        biome: 'forest',
        seed: 'test_child_1',
      });
      
      expect(result.adulthoodAge).toBeGreaterThan(14);
      expect(result.adulthoodAge).toBeLessThan(20);
      expect(result.memories.length).toBeGreaterThan(0);
      expect(result.finalSkills).toBeDefined();
    });

    it('должен быть детерминированным (одинаковый seed = одинаковый результат)', () => {
      const result1 = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 50,
        biome: 'plains',
        seed: 'deterministic_test',
      });
      
      const result2 = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 50,
        biome: 'plains',
        seed: 'deterministic_test',
      });
      
      expect(result1.totalTrauma).toBe(result2.totalTrauma);
      expect(result1.totalHappyMemories).toBe(result2.totalHappyMemories);
      expect(result1.acquiredTraits).toEqual(result2.acquiredTraits);
    });

    it('должен учитывать расу при расчете возраста взросления', () => {
      const humanResult = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 50,
        biome: 'plains',
        seed: 'race_test_human',
      });
      
      const orcResult = GrowthSimulator.quickSimulate({
        raceId: 'orc',
        maxLifespan: 60,
        socialStatus: 50,
        biome: 'plains',
        seed: 'race_test_orc',
      });
      
      // Орки взрослеют быстрее
      expect(orcResult.adulthoodAge).toBeLessThan(humanResult.adulthoodAge);
    });

    it('должен генерировать воспоминания о событиях', () => {
      const result = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 50,
        biome: 'forest',
        seed: 'memory_test',
      });
      
      expect(result.memories.length).toBeGreaterThan(0);
      
      // Каждое воспоминание должно иметь структуру
      result.memories.forEach(memory => {
        expect(memory.age).toBeDefined();
        expect(memory.event).toBeDefined();
        expect(memory.impact).toBeDefined();
      });
    });

    it('должен накапливать травмы и счастливые воспоминания', () => {
      const result = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 50,
        biome: 'forest',
        seed: 'trauma_test',
      });
      
      expect(result.totalTrauma).toBeGreaterThanOrEqual(0);
      expect(result.totalHappyMemories).toBeGreaterThanOrEqual(0);
    });

    it('должен разблокировать профессии через события', () => {
      const result = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 60,
        biome: 'city',
        seed: 'profession_test',
      });
      
      // Проверяем что структура существует
      expect(Array.isArray(result.unlockedProfessions)).toBe(true);
    });

    it('должен приобретать черты характера', () => {
      const result = GrowthSimulator.quickSimulate({
        raceId: 'human',
        maxLifespan: 80,
        socialStatus: 30,
        biome: 'plains',
        seed: 'traits_test',
      });
      
      expect(Array.isArray(result.acquiredTraits)).toBe(true);
    });
  });

  describe('Интеграция всех систем', () => {
    it('должен корректно симулировать полное детство', () => {
      const variants = GrowthSimulator.simulateVariants({
        raceId: 'elf',
        maxLifespan: 200,
        socialStatus: 70,
        biome: 'forest',
        seed: 'full_simulation',
      }, 3);
      
      expect(variants.length).toBe(3);
      
      variants.forEach((result) => {
        expect(result.adulthoodAge).toBeGreaterThan(40); // Эльфы взрослеют долго
        expect(result.memories.length).toBeGreaterThan(10); // Много событий за долгое детство
      });
    });
  });
});
