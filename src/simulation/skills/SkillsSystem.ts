/**
 * Система навыков и архетипов - Этап 21
 * Управление развитием персонажа без жёстких классов
 */

import { DeterministicRNG } from '../../core/random/DeterministicRNG';
import { 
  Skill, 
  SkillType, 
  Talent, 
  Habit, 
  Origin, 
  CharacterProgression, 
  StartArchetype,
  EquipmentContext 
} from './SkillsTypes';

/**
 * Менеджер системы навыков и архетипов
 */
export class SkillsSystem {
  private rng: DeterministicRNG;
  
  // База данных всех возможных навыков
  private readonly SKILL_DATABASE: Record<SkillType, Partial<Skill>> = {
    // Боевые
    weapon: { name: 'Оружие', category: 'combat' },
    armor: { name: 'Броня', category: 'combat' },
    
    // Магия
    spell: { name: 'Заклинания', category: 'magic' },
    
    // Социальные
    trade: { name: 'Торговля', category: 'social' },
    persuasion: { name: 'Убеждение', category: 'social' },
    deception: { name: 'Обман', category: 'social' },
    intimidation: { name: 'Запугивание', category: 'social' },
    
    // Ремесла
    medicine: { name: 'Медицина', category: 'crafting' },
    alchemy: { name: 'Алхимия', category: 'crafting' },
    blacksmithing: { name: 'Кузнечное дело', category: 'crafting' },
    cooking: { name: 'Кулинария', category: 'crafting' },
    tailoring: { name: 'Портняжное дело', category: 'crafting' },
    carpentry: { name: 'Плотничество', category: 'crafting' },
    jewelry: { name: 'Ювелирное дело', category: 'crafting' },
    construction: { name: 'Строительство', category: 'crafting' },
    weaponcrafting: { name: 'Изготовление оружия', category: 'crafting' },
    armorsmithing: { name: 'Изготовление брони', category: 'crafting' },
    
    // Знания
    history: { name: 'История', category: 'knowledge' },
    lore: { name: 'Легенды', category: 'knowledge' },
    nature: { name: 'Природа', category: 'knowledge' },
    arcana: { name: 'Магия', category: 'knowledge' },
    religion: { name: 'Религия', category: 'knowledge' },
    
    // Выживание
    hunting: { name: 'Охота', category: 'survival' },
    fishing: { name: 'Рыбалка', category: 'survival' },
    foraging: { name: 'Собирательство', category: 'survival' },
    
    // Атлетика
    climbing: { name: 'Лазание', category: 'athletic' },
    swimming: { name: 'Плавание', category: 'athletic' },
    running: { name: 'Бег', category: 'athletic' },
    strength: { name: 'Сила', category: 'athletic' },
    
    // Скрытность
    sneaking: { name: 'Кража', category: 'stealth' },
    lockpicking: { name: 'Взлом', category: 'stealth' },
    
    // Восприятие
    observation: { name: 'Наблюдение', category: 'perception' },
    listening: { name: 'Слушание', category: 'perception' },
    tracking: { name: 'Следопытство', category: 'perception' },
  };

  // База талантов
  private readonly TALENT_DATABASE: Partial<Talent>[] = [
    {
      name: 'Мастер оружия',
      description: 'Бонус к владению всеми видами оружия',
      type: 'passive',
      category: 'combat',
      requirements: {
        minSkills: [{ skillType: 'weapon', minLevel: 30 }],
      },
      effects: [{ type: 'skill_bonus', target: 'weapon', value: 15 }],
      maxRank: 3,
      currentRank: 1,
      mutuallyExclusiveWith: [],
      requiresTalents: [],
    },
    {
      name: 'Железная кожа',
      description: 'Сопротивление физическому урону',
      type: 'passive',
      category: 'combat',
      requirements: {
        minSkills: [{ skillType: 'armor', minLevel: 40 }],
      },
      effects: [{ type: 'resistance', target: 'physical_damage', value: 10 }],
      maxRank: 5,
      currentRank: 1,
      mutuallyExclusiveWith: [],
      requiresTalents: [],
    },
    {
      name: 'Быстрые руки',
      description: 'Ускорение крафта',
      type: 'perk',
      category: 'crafting',
      requirements: {
        minSkills: [
          { skillType: 'blacksmithing', minLevel: 25 },
          { skillType: 'carpentry', minLevel: 25 },
        ],
      },
      effects: [{ type: 'special_ability', target: 'craft_speed', value: 20 }],
      maxRank: 3,
      currentRank: 1,
      mutuallyExclusiveWith: [],
      requiresTalents: [],
    },
    {
      name: 'Золотой язык',
      description: 'Бонус к убеждению и торговле',
      type: 'passive',
      category: 'social',
      requirements: {
        minSkills: [
          { skillType: 'persuasion', minLevel: 30 },
          { skillType: 'trade', minLevel: 30 },
        ],
      },
      effects: [
        { type: 'skill_bonus', target: 'persuasion', value: 20 },
        { type: 'skill_bonus', target: 'trade', value: 15 },
      ],
      maxRank: 3,
      currentRank: 1,
      mutuallyExclusiveWith: [],
      requiresTalents: [],
    },
    {
      name: 'Ночной охотник',
      description: 'Бонусы в ночное время',
      type: 'passive',
      category: 'survival',
      requirements: {
        minSkills: [
          { skillType: 'hunting', minLevel: 35 },
          { skillType: 'sneaking', minLevel: 30 },
        ],
      },
      effects: [
        { type: 'skill_bonus', target: 'sneaking', value: 25 },
        { type: 'stat_bonus', target: 'night_vision', value: 50 },
      ],
      maxRank: 2,
      currentRank: 1,
      mutuallyExclusiveWith: [],
      requiresTalents: [],
    },
  ];

  // База происхождений
  private readonly ORIGIN_DATABASE: Partial<Origin>[] = [
    {
      name: 'Крестьянский ребёнок',
      description: 'Вы выросли в деревне, помогая родителям по хозяйству',
      socialContext: {
        socialClass: 'peasant',
        typicalProfessions: ['farmer', 'herder', 'mill worker'],
        reputation: [
          { group: 'villagers', bonus: 10 },
          { group: 'nobles', bonus: -5 },
        ],
      },
      startingBonuses: {
        skills: [
          { skillType: 'strength', baseLevel: 15 },
          { skillType: 'cooking', baseLevel: 10 },
          { skillType: 'nature', baseLevel: 15 },
        ],
        attributes: [
          { attribute: 'constitution', bonus: 5 },
          { attribute: 'strength', bonus: 5 },
        ],
        items: [],
        relationships: [
          { type: 'family', description: 'Любящая семья фермеров' },
        ],
      },
      tendencies: {
        likelyRegions: ['rural', 'agricultural'],
        unlikelyRegions: ['urban', 'nobility'],
        culturalAffinity: [],
      },
      uniqueOpportunities: ['Семейная ферма', 'Местный староста'],
      familySecrets: [],
    },
    {
      name: 'Городской ремесленник',
      description: 'Вы родились в семье мастеров-ремесленников',
      socialContext: {
        socialClass: 'craftsman',
        typicalProfessions: ['blacksmith', 'carpenter', 'tailor', 'jeweler'],
        reputation: [
          { group: 'guilds', bonus: 15 },
          { group: 'merchants', bonus: 5 },
        ],
      },
      startingBonuses: {
        skills: [
          { skillType: 'blacksmithing', baseLevel: 20 },
          { skillType: 'carpentry', baseLevel: 10 },
          { skillType: 'trade', baseLevel: 10 },
        ],
        attributes: [
          { attribute: 'dexterity', bonus: 5 },
          { attribute: 'intelligence', bonus: 5 },
        ],
        items: [],
        relationships: [
          { type: 'mentor', description: 'Опытный мастер гильдии' },
        ],
      },
      tendencies: {
        likelyRegions: ['urban', 'trade_cities'],
        unlikelyRegions: ['wilderness', 'remote'],
        culturalAffinity: [],
      },
      uniqueOpportunities: ['Гильдия ремесленников', 'Семейная мастерская'],
      familySecrets: [
        {
          name: 'Секретный рецепт',
          description: 'Ваша семья хранит секрет изготовления особого сплава',
          revealed: false,
        },
      ],
    },
    {
      name: 'Благородное происхождение',
      description: 'Вы родились в знатной семье',
      socialContext: {
        socialClass: 'nobility',
        typicalProfessions: ['knight', 'courtier', 'administrator'],
        reputation: [
          { group: 'commoners', bonus: -5 },
          { group: 'nobles', bonus: 20 },
          { group: 'military', bonus: 10 },
        ],
      },
      startingBonuses: {
        skills: [
          { skillType: 'weapon', baseLevel: 20 },
          { skillType: 'persuasion', baseLevel: 15 },
          { skillType: 'history', baseLevel: 10 },
        ],
        attributes: [
          { attribute: 'charisma', bonus: 10 },
          { attribute: 'leadership', bonus: 5 },
        ],
        items: [],
        relationships: [
          { type: 'family', description: 'Влиятельная благородная семья' },
          { type: 'contact', description: 'Связи при дворе' },
        ],
      },
      tendencies: {
        likelyRegions: ['cities', 'castles', 'capitals'],
        unlikelyRegions: ['wilderness', 'slums'],
        culturalAffinity: [],
      },
      uniqueOpportunities: ['Придворная жизнь', 'Военная карьера', 'Политические интриги'],
      familySecrets: [
        {
          name: 'Древний долг',
          description: 'Ваша семья должна другому роду',
          revealed: false,
        },
      ],
    },
    {
      name: 'Сирота улиц',
      description: 'Вы выросли на улицах без семьи',
      socialContext: {
        socialClass: 'outcast',
        typicalProfessions: ['thief', 'beggar', 'street_performer'],
        reputation: [
          { group: 'criminals', bonus: 15 },
          { group: 'guards', bonus: -20 },
          { group: 'commoners', bonus: -5 },
        ],
      },
      startingBonuses: {
        skills: [
          { skillType: 'sneaking', baseLevel: 25 },
          { skillType: 'lockpicking', baseLevel: 20 },
          { skillType: 'observation', baseLevel: 15 },
        ],
        attributes: [
          { attribute: 'agility', bonus: 10 },
          { attribute: 'luck', bonus: 5 },
        ],
        items: [],
        relationships: [
          { type: 'friend', description: 'Друг с улицы' },
        ],
      },
      tendencies: {
        likelyRegions: ['urban', 'slums', 'ports'],
        unlikelyRegions: ['nobility', 'temples'],
        culturalAffinity: [],
      },
      uniqueOpportunities: ['Воровская гильдия', 'Уличные банды'],
      familySecrets: [
        {
          name: 'Неизвестные родители',
          description: 'Вы не знаете своих настоящих родителей',
          revealed: false,
        },
      ],
    },
    {
      name: 'Монастырский послушник',
      description: 'Вы воспитывались в монастыре',
      socialContext: {
        socialClass: 'religious',
        typicalProfessions: ['priest', 'scholar', 'healer'],
        reputation: [
          { group: 'religious', bonus: 20 },
          { group: 'commoners', bonus: 5 },
        ],
      },
      startingBonuses: {
        skills: [
          { skillType: 'religion', baseLevel: 25 },
          { skillType: 'medicine', baseLevel: 15 },
          { skillType: 'lore', baseLevel: 15 },
        ],
        attributes: [
          { attribute: 'wisdom', bonus: 10 },
          { attribute: 'willpower', bonus: 5 },
        ],
        items: [],
        relationships: [
          { type: 'mentor', description: 'Наставник из монастыря' },
        ],
      },
      tendencies: {
        likelyRegions: ['temple_lands', 'pilgrimage_routes'],
        unlikelyRegions: ['criminal_areas'],
        culturalAffinity: [],
      },
      uniqueOpportunities: ['Доступ к древним знаниям', 'Религиозные связи'],
      familySecrets: [],
    },
  ];

  // Архетипы старта
  private readonly ARCHETYPES: StartArchetype[] = [
    {
      id: 'warrior_start',
      name: 'Воин',
      description: 'Вы начали жизнь с оружием в руках',
      originId: 'noble_origin',
      recommendedSkills: ['weapon', 'armor', 'strength'],
      recommendedTalents: [],
      startingContext: {
        location: 'training_grounds',
        situation: 'Вы завершаете военную подготовку',
        initialGoal: 'Доказать свою доблесть',
      },
      learningBonuses: [
        { skillCategory: 'combat', bonus: 20 },
        { skillCategory: 'athletic', bonus: 10 },
      ],
    },
    {
      id: 'mage_start',
      name: 'Маг',
      description: 'Вы чувствуете тягу к магическим искусствам',
      originId: 'monastery_origin',
      recommendedSkills: ['spell', 'arcana', 'religion'],
      recommendedTalents: [],
      startingContext: {
        location: 'library',
        situation: 'Вы изучаете древние свитки',
        initialGoal: 'Постичь тайны магии',
      },
      learningBonuses: [
        { skillCategory: 'magic', bonus: 25 },
        { skillCategory: 'knowledge', bonus: 15 },
      ],
    },
    {
      id: 'rogue_start',
      name: 'Плут',
      description: 'Вы научились выживать хитростью',
      originId: 'street_orphan_origin',
      recommendedSkills: ['sneaking', 'lockpicking', 'deception'],
      recommendedTalents: [],
      startingContext: {
        location: 'city_alley',
        situation: 'Вы ищете следующую возможность',
        initialGoal: 'Разбогатеть любым способом',
      },
      learningBonuses: [
        { skillCategory: 'stealth', bonus: 25 },
        { skillCategory: 'social', bonus: 10 },
      ],
    },
    {
      id: 'crafter_start',
      name: 'Ремесленник',
      description: 'Вы наследуете семейное ремесло',
      originId: 'craftsman_origin',
      recommendedSkills: ['blacksmithing', 'carpentry', 'trade'],
      recommendedTalents: [],
      startingContext: {
        location: 'workshop',
        situation: 'Вы помогаете в семейной мастерской',
        initialGoal: 'Стать мастером своего дела',
      },
      learningBonuses: [
        { skillCategory: 'crafting', bonus: 25 },
        { skillCategory: 'social', bonus: 5 },
      ],
    },
    {
      id: 'survivor_start',
      name: 'Выживший',
      description: 'Вы научились жить в дикой природе',
      originId: 'peasant_origin',
      recommendedSkills: ['hunting', 'foraging', 'nature'],
      recommendedTalents: [],
      startingContext: {
        location: 'wilderness',
        situation: 'Вы возвращаетесь с охоты',
        initialGoal: 'Защитить свою семью',
      },
      learningBonuses: [
        { skillCategory: 'survival', bonus: 25 },
        { skillCategory: 'athletic', bonus: 10 },
      ],
    },
  ];

  constructor(seed: string) {
    this.rng = new DeterministicRNG(seed);
  }

  /**
   * Создать новый навык
   */
  createSkill(type: SkillType, characterId: string): Skill {
    const template = this.SKILL_DATABASE[type];
    const now = Date.now();
    
    return {
      id: `skill_${characterId}_${type}`,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: template.name || type,
      type,
      category: template.category || 'knowledge',
      level: 0,
      experience: 0,
      experienceToNextLevel: 100,
      baseValue: 0,
      equipmentBonus: 0,
      temporaryBonus: 0,
      specializations: [],
      timesUsed: 0,
      relatedTalents: [],
    };
  }

  /**
   * Получить происхождение по ID
   */
  getOrigin(originId: string): Origin | undefined {
    const origin = this.ORIGIN_DATABASE.find(o => 
      o.name?.toLowerCase().replace(/\s+/g, '_') === originId
    );
    
    if (!origin) return undefined;
    
    const now = Date.now();
    return {
      id: originId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: origin.name!,
      description: origin.description!,
      socialContext: origin.socialContext!,
      startingBonuses: origin.startingBonuses!,
      tendencies: origin.tendencies!,
      uniqueOpportunities: origin.uniqueOpportunities || [],
      familySecrets: origin.familySecrets || [],
    };
  }

  /**
   * Получить все доступные происхождения
   */
  getAllOrigins(): Origin[] {
    const now = Date.now();
    return this.ORIGIN_DATABASE.map(o => ({
      id: o.name?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: o.name!,
      description: o.description!,
      socialContext: o.socialContext!,
      startingBonuses: o.startingBonuses!,
      tendencies: o.tendencies!,
      uniqueOpportunities: o.uniqueOpportunities || [],
      familySecrets: o.familySecrets || [],
    }));
  }

  /**
   * Получить архетип по ID
   */
  getArchetype(archetypeId: string): StartArchetype | undefined {
    return this.ARCHETYPES.find(a => a.id === archetypeId);
  }

  /**
   * Получить все архетипы
   */
  getAllArchetypes(): StartArchetype[] {
    return [...this.ARCHETYPES];
  }

  /**
   * Применить происхождение к персонажу
   */
  applyOriginToCharacter(
    progression: CharacterProgression,
    origin: Origin
  ): CharacterProgression {
    // Применить стартовые бонусы навыков
    for (const skillBonus of origin.startingBonuses.skills) {
      const skill = this.createSkill(skillBonus.skillType, 'character');
      skill.baseValue = skillBonus.baseLevel;
      skill.level = skillBonus.baseLevel;
      progression.skills.set(skill.id, skill);
    }

    // Установить происхождение
    progression.origin = { id: origin.id, type: 'Origin' };

    // Добавить начальные отношения (в реальной игре это будет обрабатываться отдельно)
    console.log(`Применено происхождение: ${origin.name}`);
    console.log('Стартовые связи:', origin.startingBonuses.relationships);

    return progression;
  }

  /**
   * Проверить доступность таланта
   */
  canAcquireTalent(
    progression: CharacterProgression,
    talent: Talent
  ): boolean {
    // Проверка требований по навыкам
    for (const req of talent.requirements.minSkills) {
      const skill = Array.from(progression.skills.values()).find(
        s => s.type === req.skillType
      );
      if (!skill || skill.level < req.minLevel) {
        return false;
      }
    }

    // Проверка взаимоисключающих талантов
    for (const exclusiveRef of talent.mutuallyExclusiveWith) {
      if (progression.talents.some(t => t.id === exclusiveRef.id)) {
        return false;
      }
    }

    // Проверка требуемых талантов
    for (const requiredRef of talent.requiresTalents) {
      if (!progression.talents.some(t => t.id === requiredRef.id)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Добавить талант персонажу
   */
  acquireTalent(
    progression: CharacterProgression,
    talentId: string
  ): { success: boolean; error?: string } {
    const talentTemplate = this.TALENT_DATABASE.find(t => 
      t.name?.toLowerCase().replace(/\s+/g, '_') === talentId.toLowerCase()
    );

    if (!talentTemplate) {
      return { success: false, error: 'Талант не найден' };
    }

    const now = Date.now();
    const talent: Talent = {
      id: `talent_${progression.characterLevel}_${talentId}`,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: talentTemplate.name!,
      description: talentTemplate.description!,
      type: talentTemplate.type!,
      category: talentTemplate.category!,
      requirements: talentTemplate.requirements!,
      effects: talentTemplate.effects!,
      maxRank: talentTemplate.maxRank || 1,
      currentRank: 1,
      mutuallyExclusiveWith: talentTemplate.mutuallyExclusiveWith || [],
      requiresTalents: talentTemplate.requiresTalents || [],
    };

    if (!this.canAcquireTalent(progression, talent)) {
      return { success: false, error: 'Не выполнены требования для таланта' };
    }

    progression.talents.push({ id: talent.id, type: 'Talent' });
    
    // Записать в историю
    progression.progressionHistory.push({
      timestamp: now,
      eventType: 'talent_gained',
      description: `Получен талант: ${talent.name}`,
    });

    return { success: true };
  }

  /**
   * Добавить опыт к навыку
   */
  addSkillExperience(
    progression: CharacterProgression,
    skillType: SkillType,
    amount: number,
    archetypeBonus?: number
  ): void {
    const skill = Array.from(progression.skills.values()).find(
      s => s.type === skillType
    );

    if (!skill) {
      // Создать новый навык если его нет
      const newSkill = this.createSkill(skillType, 'character');
      progression.skills.set(newSkill.id, newSkill);
      return this.addSkillExperience(progression, skillType, amount, archetypeBonus);
    }

    // Применить бонус от архетипа обучения
    if (archetypeBonus && progression.origin) {
      amount = Math.floor(amount * (1 + archetypeBonus / 100));
    }

    skill.experience += amount;
    skill.timesUsed++;
    skill.lastUsed = Date.now();

    // Проверка повышения уровня
    while (skill.experience >= skill.experienceToNextLevel) {
      skill.experience -= skill.experienceToNextLevel;
      skill.level = Math.min(100, skill.level + 1);
      skill.experienceToNextLevel = Math.floor(skill.experienceToNextLevel * 1.5);

      // Записать в историю
      progression.progressionHistory.push({
        timestamp: Date.now(),
        eventType: 'skill_increase',
        description: `Навык ${skill.name} повышен до уровня ${skill.level}`,
      });
    }
  }

  /**
   * Расчитать общий бонус от экипировки
   */
  calculateEquipmentBonuses(_equipment: EquipmentContext): {
    skills: Map<SkillType, number>;
    attributes: Map<string, number>;
  } {
    const bonuses = {
      skills: new Map<SkillType, number>(),
      attributes: new Map<string, number>(),
    };

    // В реальной игре здесь будет анализ предметов экипировки
    // и применение их бонусов

    return bonuses;
  }

  /**
   * Сформировать привычку через повторение действий
   */
  formHabit(
    progression: CharacterProgression,
    actionType: string,
    repetitions: number
  ): Habit | null {
    // Простая реализация - в полной версии будет больше логики
    if (repetitions < 10) {
      return null;
    }

    const now = Date.now();
    const habit: Habit = {
      id: `habit_${actionType}_${now}`,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: `Привычка: ${actionType}`,
      description: `Сформирована через ${repetitions} повторений`,
      type: repetitions > 50 ? 'positive' : 'neutral',
      skillEffects: [],
      attributeEffects: [],
      formationRequirement: {
        actionType,
        repetitions,
        timeSpan: 30,
      },
      canBreak: true,
      breakingDifficulty: Math.min(100, repetitions),
    };

    progression.habits.push({ id: habit.id, type: 'Habit' });
    
    progression.progressionHistory.push({
      timestamp: now,
      eventType: 'habit_formed',
      description: `Сформирована привычка: ${habit.name}`,
    });

    return habit;
  }

  /**
   * Создать профиль прогрессии для нового персонажа
   */
  createCharacterProgression(_characterId: string): CharacterProgression {
    return {
      skills: new Map(),
      talents: [],
      habits: [],
      origin: undefined,
      primarySpecialization: undefined,
      secondarySpecialization: undefined,
      characterLevel: 1,
      totalExperience: 0,
      experienceToNextLevel: 1000,
      developmentPoints: 0,
      progressionHistory: [],
    };
  }

  /**
   * Сохранить состояние системы
   */
  saveState(): object {
    return {
      seed: this.rng.getState(),
    };
  }

  /**
   * Загрузить состояние системы
   */
  loadState(_state: object): void {
    // Восстановление состояния при необходимости
  }
}

export default SkillsSystem;
