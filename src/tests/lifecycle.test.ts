import { describe, it, expect } from 'vitest';
import { DeathSystem } from '../simulation/lifecycle/DeathSystem';
import { LifeSummaryGenerator } from '../simulation/lifecycle/LifeSummaryGenerator';
import { RebirthSystem } from '../simulation/lifecycle/RebirthSystem';
import type { DeathCause, LifeAchievement, LifeRelationship, CreatedObject, DiscoveredDungeon, ChronicleEntry, MetaLegacy } from '../types/lifecycle';

describe('ЭТАП 32 — DEATH + REBIRTH', () => {
  const deathSystem = new DeathSystem();
  const lifeSummaryGenerator = new LifeSummaryGenerator();
  const rebirthSystem = new RebirthSystem({
    enablePermanentDeath: true,
    allowResurrectionRituals: true,
    maxFamilyGeneration: 10,
    legacyDecayRate: 0.1
  });

  describe('Смерть (Death)', () => {
    it('должна создавать смерть в бою', () => {
      const cause = deathSystem.createCombatDeath('enemy_123', { x: 100, y: 200, regionId: 'battlefield' });
      
      expect(cause.type).toBe('combat');
      expect(cause.killerId).toBe('enemy_123');
      expect(cause.location?.x).toBe(100);
      expect(cause.description).toContain('Погиб в бою');
    });

    it('должна создавать смерть от болезни', () => {
      const cause = deathSystem.createDiseaseDeath('plague_456', 'Чумная лихорадка', { x: 50, y: 50 });
      
      expect(cause.type).toBe('disease');
      expect(cause.diseaseId).toBe('plague_456');
      expect(cause.description).toContain('Чумная лихорадка');
    });

    it('должна создавать смерть от голода', () => {
      const cause = deathSystem.createStarvationDeath({ x: 10, y: 10 });
      
      expect(cause.type).toBe('starvation');
      expect(cause.description).toBe('Умер от голода');
    });

    it('должна создавать смерть от старости', () => {
      const cause = deathSystem.createOldAgeDeath(85, { x: 0, y: 0 });
      
      expect(cause.type).toBe('old_age');
      expect(cause.description).toContain('85 лет');
      expect(cause.details?.age).toBe(85);
    });

    it('должна создавать смерть из-за события', () => {
      const cause = deathSystem.createEventDeath('earthquake_789', 'Землетрясение', { x: 200, y: 300, regionId: 'quake_zone' });
      
      expect(cause.type).toBe('event');
      expect(cause.eventId).toBe('earthquake_789');
      expect(cause.description).toContain('Землетрясение');
    });

    it('должна создавать смерть из-за окружающей среды', () => {
      const cause = deathSystem.createEnvironmentDeath('Лавовое озеро', { x: 500, y: 500, dungeonId: 'volcano_1' });
      
      expect(cause.type).toBe('environment');
      expect(cause.description).toContain('Лавовое озеро');
      expect(cause.location?.dungeonId).toBe('volcano_1');
    });

    it('должна определять причину смерти на основе контекста', () => {
      const location = { x: 100, y: 100 };
      
      // Смерть в бою
      let cause = deathSystem.determineDeathCause({}, { inCombat: true }, location);
      expect(cause.type).toBe('combat');
      
      // Смерть от болезни
      cause = deathSystem.determineDeathCause({}, { hasDisease: 'flu' }, location);
      expect(cause.type).toBe('disease');
      
      // Смерть от голода
      cause = deathSystem.determineDeathCause({}, { isStarving: true }, location);
      expect(cause.type).toBe('starvation');
      
      // Смерть от старости
      cause = deathSystem.determineDeathCause({}, { age: 85 }, location);
      expect(cause.type).toBe('old_age');
      
      // Смерть от события
      cause = deathSystem.determineDeathCause({}, { activeEvent: { id: 'war', name: 'Война' } }, location);
      expect(cause.type).toBe('event');
      
      // Смерть от окружающей среды
      cause = deathSystem.determineDeathCause({}, { inDangerousEnvironment: 'Радиация' }, location);
      expect(cause.type).toBe('environment');
    });

    it('должна проверять, должен ли персонаж умереть', () => {
      // Смерть от здоровья
      expect(deathSystem.shouldDie({}, { health: 0, hunger: 50, age: 30, diseases: [], inCombat: false, inDangerousZone: false })).toBe(true);
      
      // Смерть от голода
      expect(deathSystem.shouldDie({}, { health: 50, hunger: 0, age: 30, diseases: [], inCombat: false, inDangerousZone: false })).toBe(true);
      
      // Жив
      expect(deathSystem.shouldDie({}, { health: 50, hunger: 50, age: 30, diseases: [], inCombat: false, inDangerousZone: false })).toBe(false);
    });
  });

  describe('Посмертный отчет (Life Summary)', () => {
    it('должен генерировать полный посмертный отчет', () => {
      const achievements: LifeAchievement[] = [
        { id: '1', type: 'quest', title: 'Спаситель королевства', description: 'Победил древнего дракона', timestamp: Date.now(), importance: 10 },
        { id: '2', type: 'discovery', title: 'Первооткрыватель', description: 'Нашел затерянный город', timestamp: Date.now(), importance: 8 }
      ];
      
      const relationships: LifeRelationship[] = [
        { characterId: 'friend_1', characterName: 'Алиса', relationshipType: 'friend', strength: 80, summary: 'Верный друг' },
        { characterId: 'spouse_1', characterName: 'Боб', relationshipType: 'spouse', strength: 100, summary: 'Любимый супруг' }
      ];
      
      const createdObjects: CreatedObject[] = [
        { id: '1', type: 'building', name: 'Великий замок', description: 'Построен собственноручно', stillExists: true },
        { id: '2', type: 'item', name: 'Легендарный меч', description: 'Выкован из драконьей стали', stillExists: true }
      ];
      
      const discoveredDungeons: DiscoveredDungeon[] = [
        { dungeonId: 'd1', name: 'Пещера Дракона', depth: 5, discoveryDate: Date.now(), isPrimaryDiscoverer: true },
        { dungeonId: 'd2', name: 'Затерянные руины', depth: 3, discoveryDate: Date.now(), isPrimaryDiscoverer: false }
      ];
      
      const chronicleEntries: ChronicleEntry[] = [
        { entryId: 'c1', title: 'Победа над драконом', summary: 'Герой победил древнего дракона', impact: 'legendary', timestamp: Date.now() }
      ];
      
      const birthDate = Date.now() - 70 * 365 * 24 * 60 * 60 * 1000; // 70 лет назад
      const deathDate = Date.now();
      
      const causeOfDeath: DeathCause = {
        type: 'old_age',
        description: 'Умер от старости в возрасте 70 лет',
        timestamp: deathDate
      };
      
      const summary = lifeSummaryGenerator.generateLifeSummary(
        'hero_123',
        'Великий Герой',
        birthDate,
        deathDate,
        causeOfDeath,
        achievements,
        relationships,
        createdObjects,
        discoveredDungeons,
        chronicleEntries
      );
      
      expect(summary.characterId).toBe('hero_123');
      expect(summary.characterName).toBe('Великий Герой');
      expect(summary.ageAtDeath).toBeGreaterThanOrEqual(69);
      expect(summary.ageAtDeath).toBeLessThanOrEqual(71);
      expect(summary.achievements.length).toBe(2);
      expect(summary.relationships.length).toBe(2);
      expect(summary.createdObjects.length).toBe(2);
      expect(summary.discoveredDungeons.length).toBe(2);
      expect(summary.chronicleEntries.length).toBe(1);
      expect(summary.legacyScore).toBeGreaterThan(0);
      expect(summary.legacyScore).toBeLessThanOrEqual(100);
      expect(summary.rememberedBy.length).toBeGreaterThan(0);
    });

    it('должен форматировать посмертный отчет для отображения', () => {
      const summary: any = {
        characterName: 'Тестовый Персонаж',
        ageAtDeath: 45,
        causeOfDeath: { description: 'Погиб в бою' },
        legacyScore: 75,
        achievements: [{ title: 'Достижение 1', description: 'Описание' }],
        relationships: [{ characterName: 'Друг', relationshipType: 'friend', strength: 60, summary: 'Хороший друг' }],
        createdObjects: [{ name: 'Дом', type: 'building', description: 'Уютный дом', stillExists: true }],
        discoveredDungeons: [{ name: 'Пещера', depth: 3, isPrimaryDiscoverer: true }],
        chronicleEntries: [{ title: 'Запись', impact: 'notable' as const }],
        rememberedBy: ['person1', 'person2']
      };
      
      const formatted = lifeSummaryGenerator.formatLifeSummary(summary);
      
      expect(formatted).toContain('ПОСМЕРТНЫЙ ОТЧЕТ');
      expect(formatted).toContain('Тестовый Персонаж');
      expect(formatted).toContain('45 лет');
      expect(formatted).toContain('75/100');
    });
  });

  describe('Новая жизнь (Rebirth)', () => {
    it('должна создавать данные для нового рождения со случайными параметрами', () => {
      const worldState = {
        regions: [
          { id: 'region_1', isSafeForBirth: true, centerX: 100, centerY: 200 },
          { id: 'region_2', isSafeForBirth: true, centerX: 300, centerY: 400 }
        ]
      };
      
      const rebirthData = rebirthSystem.createRebirthData('new_char_1', null, worldState);
      
      expect(rebirthData.newCharacterId).toBe('new_char_1');
      expect(rebirthData.randomTraits.length).toBeGreaterThanOrEqual(3);
      expect(rebirthData.randomTraits.length).toBeLessThanOrEqual(5);
      expect(rebirthData.randomStartingLocation.regionId).toBeDefined();
      expect(rebirthData.randomBackground).toBeDefined();
      expect(rebirthData.metaLegacy).toBeDefined();
      
      // Важно: нет переноса силы или предметов
      expect((rebirthData as any).stats).toBeUndefined();
      expect((rebirthData as any).items).toBeUndefined();
      expect((rebirthData as any).skills).toBeUndefined();
    });

    it('должна сохранять мета-следы между жизнями', () => {
      const previousLegacy: MetaLegacy = {
        familyHistory: {
          familyName: 'Драконоборцы',
          generation: 3,
          notableAncestors: ['Герой 1', 'Герой 2'],
          familyReputation: 75
        },
        worldChronicleEntries: ['entry_1', 'entry_2'],
        familyLegend: {
          legendType: 'heroic',
          legendStrength: 60,
          bonuses: ['brave_heart'],
          maluses: []
        },
        unlockedWorldKnowledge: {
          mapRegions: ['region_1', 'region_2', 'region_3', 'region_4'],
          discoveredSecrets: ['secret_1'],
          knownRecipes: ['recipe_1', 'recipe_2', 'recipe_3', 'recipe_4', 'recipe_5', 'recipe_6'],
          learnedLanguages: ['common', 'ancient']
        }
      };
      
      const worldState = { regions: [] };
      const rebirthData = rebirthSystem.createRebirthData('heir_1', previousLegacy, worldState);
      
      expect(rebirthData.metaLegacy.familyHistory.generation).toBe(4);
      expect(rebirthData.metaLegacy.familyHistory.familyName).toBe('Драконоборцы');
      expect(rebirthData.metaLegacy.familyHistory.notableAncestors).toContain('Герой 1');
      
      // Бонусы от наследия
      expect(rebirthData.startingBonuses).toContain('good_family_reputation');
      expect(rebirthData.startingBonuses).toContain('heroic_ancestry');
      expect(rebirthData.startingBonuses).toContain('well_traveled_family');
      expect(rebirthData.startingBonuses).toContain('family_secrets');
    });

    it('должна применять затухание репутации со временем', () => {
      const previousLegacy: MetaLegacy = {
        familyHistory: {
          familyName: 'Старый Род',
          generation: 5,
          notableAncestors: [],
          familyReputation: 100
        },
        worldChronicleEntries: [],
        familyLegend: {
          legendType: 'noble',
          legendStrength: 50,
          bonuses: [],
          maluses: []
        },
        unlockedWorldKnowledge: {
          mapRegions: [],
          discoveredSecrets: [],
          knownRecipes: [],
          learnedLanguages: []
        }
      };
      
      const worldState = { regions: [] };
      const rebirthData = rebirthSystem.createRebirthData('descendant_1', previousLegacy, worldState);
      
      // Репутация должна уменьшиться на 10%
      expect(rebirthData.metaLegacy.familyHistory.familyReputation).toBeLessThan(100);
      expect(rebirthData.metaLegacy.familyHistory.generation).toBe(6);
    });

    it('должна ограничивать максимальное поколение семьи', () => {
      const config = {
        enablePermanentDeath: true,
        allowResurrectionRituals: false,
        maxFamilyGeneration: 5,
        legacyDecayRate: 0.1
      };
      
      const limitedRebirthSystem = new RebirthSystem(config);
      
      const previousLegacy: MetaLegacy = {
        familyHistory: {
          familyName: 'Древний Род',
          generation: 5,
          notableAncestors: ['A', 'B', 'C', 'D', 'E', 'F'],
          familyReputation: 50
        },
        worldChronicleEntries: Array(25).fill('entry'),
        familyLegend: {
          legendType: 'mysterious',
          legendStrength: 40,
          bonuses: [],
          maluses: []
        },
        unlockedWorldKnowledge: {
          mapRegions: [],
          discoveredSecrets: [],
          knownRecipes: [],
          learnedLanguages: []
        }
      };
      
      const rebirthData = limitedRebirthSystem.createRebirthData('new_gen', previousLegacy, { regions: [] });
      
      expect(rebirthData.metaLegacy.familyHistory.generation).toBe(5); // Не больше максимума
      expect(rebirthData.metaLegacy.familyHistory.notableAncestors.length).toBeLessThanOrEqual(5);
      expect(rebirthData.metaLegacy.worldChronicleEntries.length).toBeLessThanOrEqual(20);
    });

    it('должна генерировать повествование о новом рождении', () => {
      const worldState = { regions: [{ id: 'start', isSafeForBirth: true, centerX: 0, centerY: 0 }] };
      const rebirthData = rebirthSystem.createRebirthData('char_1', null, worldState);
      
      const narrative = rebirthSystem.getRebirthNarrative(rebirthData);
      
      expect(narrative).toContain('НОВОЕ РОЖДЕНИЕ');
      expect(narrative).toContain('Происхождение');
      expect(narrative).toContain('Черты характера');
      expect(narrative).toContain('Место рождения');
      expect(narrative).toContain('Семья');
      expect(narrative).toContain('НЕ передаются');
    });

    it('должна проверять возможность воскрешения', () => {
      // Воскрешение запрещено конфигурацией
      const noResurrectSystem = new RebirthSystem({
        enablePermanentDeath: true,
        allowResurrectionRituals: false,
        maxFamilyGeneration: 10,
        legacyDecayRate: 0.1
      });
      
      expect(noResurrectSystem.canResurrect({}, { ritualPerformed: true, nearbyTemple: true, hasResurrectionItem: true })).toBe(false);
      
      // Воскрешение разрешено, но условия не выполнены
      expect(rebirthSystem.canResurrect({}, { ritualPerformed: false })).toBe(false);
      
      // Все условия выполнены
      expect(rebirthSystem.canResurrect({}, { 
        ritualPerformed: true, 
        nearbyTemple: true, 
        hasResurrectionItem: true 
      })).toBe(true);
      
      // Или высокий благосклонность божества
      expect(rebirthSystem.canResurrect({}, { 
        ritualPerformed: true, 
        nearbyTemple: true, 
        deityFavor: 90 
      })).toBe(true);
    });
  });

  describe('Интеграция всех систем', () => {
    it('должна проходить полный цикл: жизнь → смерть → посмертный отчет → новое рождение', () => {
      // 1. Смерть
      const causeOfDeath = deathSystem.createCombatDeath('dragon_boss', { x: 500, y: 500, regionId: 'dragon_lair' });
      
      // 2. Посмертный отчет
      const achievements: LifeAchievement[] = [
        { id: '1', type: 'combat', title: 'Драконоборец', description: 'Победил множество драконов', timestamp: Date.now(), importance: 9 }
      ];
      
      const relationships: LifeRelationship[] = [
        { characterId: 'ally_1', characterName: 'Верный спутник', relationshipType: 'friend', strength: 90, summary: 'Лучший друг' }
      ];
      
      const createdObjects: CreatedObject[] = [
        { id: '1', type: 'building', name: 'Крепость', description: 'База гильдии', stillExists: true }
      ];
      
      const discoveredDungeons: DiscoveredDungeon[] = [
        { dungeonId: 'dragon_lair', name: 'Логово Дракона', depth: 10, discoveryDate: Date.now(), isPrimaryDiscoverer: true }
      ];
      
      const chronicleEntries: ChronicleEntry[] = [
        { entryId: 'c1', title: 'Великая битва', summary: 'Героическая смерть в бою с драконом', impact: 'significant', timestamp: Date.now() }
      ];
      
      const birthDate = Date.now() - 35 * 365 * 24 * 60 * 60 * 1000;
      const deathDate = Date.now();
      
      const lifeSummary = lifeSummaryGenerator.generateLifeSummary(
        'fallen_hero',
        'Павший Герой',
        birthDate,
        deathDate,
        causeOfDeath,
        achievements,
        relationships,
        createdObjects,
        discoveredDungeons,
        chronicleEntries
      );
      
      expect(lifeSummary.legacyScore).toBeGreaterThan(50);
      
      // 3. Подготовка мета-наследия
      const metaLegacy: MetaLegacy = {
        familyHistory: {
          familyName: 'Герои',
          generation: 1,
          notableAncestors: ['Павший Герой'],
          familyReputation: lifeSummary.legacyScore
        },
        worldChronicleEntries: chronicleEntries.map(c => c.entryId),
        familyLegend: {
          legendType: 'heroic',
          legendStrength: Math.min(100, lifeSummary.legacyScore),
          bonuses: ['courage'],
          maluses: []
        },
        unlockedWorldKnowledge: {
          mapRegions: discoveredDungeons.map(d => d.dungeonId),
          discoveredSecrets: [],
          knownRecipes: [],
          learnedLanguages: []
        }
      };
      
      // 4. Новое рождение
      const worldState = { regions: [{ id: 'home_village', isSafeForBirth: true, centerX: 100, centerY: 100 }] };
      const rebirthData = rebirthSystem.createRebirthData('next_generation', metaLegacy, worldState);
      
      expect(rebirthData.metaLegacy.familyHistory.generation).toBe(2);
      expect(rebirthData.metaLegacy.familyHistory.notableAncestors).toContain('Павший Герой');
      expect(rebirthData.startingBonuses).toContain('heroic_ancestry');
      
      // Проверка что нет переноса силы
      expect((rebirthData as any).combatSkills).toBeUndefined();
      expect((rebirthData as any).weapons).toBeUndefined();
      
      // 5. Форматирование для игрока
      const deathReport = lifeSummaryGenerator.formatLifeSummary(lifeSummary);
      const birthNarrative = rebirthSystem.getRebirthNarrative(rebirthData);
      
      expect(deathReport).toContain('Павший Герой');
      expect(birthNarrative).toContain('Наследие предков');
    });
  });
});
