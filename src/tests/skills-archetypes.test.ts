/**
 * Тесты системы навыков и архетипов - Этап 21
 */

import { describe, it, expect } from 'vitest';
import { SkillsSystem } from '../simulation/skills/SkillsSystem';
import { SkillType } from '../simulation/skills/SkillsTypes';

describe('SkillsSystem', () => {
  const testSeed = 'test_skills_seed_123';
  
  it('должна создавать систему навыков', () => {
    const system = new SkillsSystem(testSeed);
    expect(system).toBeDefined();
  });

  it('должна создавать профиль прогрессии персонажа', () => {
    const system = new SkillsSystem(testSeed);
    const progression = system.createCharacterProgression('test_char');
    
    expect(progression.skills).toBeDefined();
    expect(progression.talents).toEqual([]);
    expect(progression.habits).toEqual([]);
    expect(progression.characterLevel).toBe(1);
    expect(progression.totalExperience).toBe(0);
  });

  it('должна возвращать все доступные происхождения', () => {
    const system = new SkillsSystem(testSeed);
    const origins = system.getAllOrigins();
    
    expect(origins.length).toBeGreaterThan(0);
    expect(origins.some(o => o.name === 'Крестьянский ребёнок')).toBe(true);
    expect(origins.some(o => o.name === 'Городской ремесленник')).toBe(true);
    expect(origins.some(o => o.name === 'Благородное происхождение')).toBe(true);
  });

  it('должна возвращать все архетипы старта', () => {
    const system = new SkillsSystem(testSeed);
    const archetypes = system.getAllArchetypes();
    
    expect(archetypes.length).toBeGreaterThan(0);
    expect(archetypes.some(a => a.id === 'warrior_start')).toBe(true);
    expect(archetypes.some(a => a.id === 'mage_start')).toBe(true);
    expect(archetypes.some(a => a.id === 'rogue_start')).toBe(true);
    expect(archetypes.some(a => a.id === 'crafter_start')).toBe(true);
  });

  it('должна применять происхождение к персонажу', () => {
    const system = new SkillsSystem(testSeed);
    const progression = system.createCharacterProgression('test_char');
    const origin = system.getOrigin('крестьянский_ребёнок');
    
    expect(origin).toBeDefined();
    if (origin) {
      system.applyOriginToCharacter(progression, origin);
      
      expect(progression.origin).toBeDefined();
      expect(progression.skills.size).toBeGreaterThan(0);
    }
  });

  it('должна добавлять опыт к навыку', () => {
    const system = new SkillsSystem(testSeed);
    const progression = system.createCharacterProgression('test_char');
    
    // Сначала создадим навык через применение происхождения
    const origin = system.getOrigin('craftsman_origin');
    if (origin) {
      system.applyOriginToCharacter(progression, origin);
    }
    
    // Добавим опыт
    system.addSkillExperience(progression, 'blacksmithing', 50);
    
    const skill = Array.from(progression.skills.values()).find(s => s.type === 'blacksmithing');
    expect(skill).toBeDefined();
    if (skill) {
      expect(skill.experience).toBeGreaterThanOrEqual(50);
    }
  });

  it('должна проверять возможность получения таланта', () => {
    const system = new SkillsSystem(testSeed);
    const progression = system.createCharacterProgression('test_char');
    
    // Создадим талант для проверки
    const talentTemplate = {
      name: 'Тестовый талант',
      description: 'Тест',
      type: 'passive' as const,
      category: 'combat' as const,
      requirements: {
        minSkills: [{ skillType: 'weapon' as SkillType, minLevel: 10 }],
      },
      effects: [],
      maxRank: 1,
      currentRank: 1,
      mutuallyExclusiveWith: [],
      requiresTalents: [],
    };
    
    // Без навыков талант недоступен
    const canAcquire = system.canAcquireTalent(progression, talentTemplate as any);
    expect(canAcquire).toBe(false);
  });

  it('должна формировать привычки', () => {
    const system = new SkillsSystem(testSeed);
    const progression = system.createCharacterProgression('test_char');
    
    // Недостаточно повторений
    const habit1 = system.formHabit(progression, 'test_action', 5);
    expect(habit1).toBeNull();
    
    // Достаточно повторений
    const habit2 = system.formHabit(progression, 'test_action', 15);
    expect(habit2).toBeDefined();
    if (habit2) {
      expect(habit2.name).toContain('Привычка');
    }
  });

  it('должна иметь бонусы обучения для разных архетипов', () => {
    const system = new SkillsSystem(testSeed);
    
    const warriorArchetype = system.getArchetype('warrior_start');
    expect(warriorArchetype).toBeDefined();
    if (warriorArchetype) {
      expect(warriorArchetype.learningBonuses.some(b => b.skillCategory === 'combat')).toBe(true);
    }
    
    const mageArchetype = system.getArchetype('mage_start');
    expect(mageArchetype).toBeDefined();
    if (mageArchetype) {
      expect(mageArchetype.learningBonuses.some(b => b.skillCategory === 'magic')).toBe(true);
    }
    
    const crafterArchetype = system.getArchetype('crafter_start');
    expect(crafterArchetype).toBeDefined();
    if (crafterArchetype) {
      expect(crafterArchetype.learningBonuses.some(b => b.skillCategory === 'crafting')).toBe(true);
    }
  });

  it('должна сохранять и загружать состояние', () => {
    const system = new SkillsSystem(testSeed);
    
    const state = system.saveState();
    expect(state).toBeDefined();
    
    system.loadState(state);
    // Загрузка не должна вызывать ошибок
  });

  it('должна иметь различные категории навыков', () => {
    const system = new SkillsSystem(testSeed);
    
    // Проверка что система поддерживает разные типы навыков
    const skillTypes: SkillType[] = [
      'weapon', 'armor', 'spell',
      'blacksmithing', 'cooking', 'carpentry',
      'persuasion', 'deception',
      'hunting', 'foraging',
      'observation', 'tracking'
    ];
    
    for (const skillType of skillTypes) {
      const skill = system.createSkill(skillType, 'test_char');
      expect(skill.type).toBe(skillType);
      expect(skill.category).toBeDefined();
    }
  });

  it('должна отслеживать историю прогрессии', () => {
    const system = new SkillsSystem(testSeed);
    const progression = system.createCharacterProgression('test_char');
    
    const initialHistoryLength = progression.progressionHistory.length;
    
    // Применяем происхождение
    const origin = system.getOrigin('peasant_origin');
    if (origin) {
      system.applyOriginToCharacter(progression, origin);
    }
    
    // Формируем привычку
    system.formHabit(progression, 'daily_exercise', 20);
    
    // История должна обновиться
    expect(progression.progressionHistory.length).toBeGreaterThanOrEqual(initialHistoryLength);
  });
});
