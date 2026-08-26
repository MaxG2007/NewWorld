/**
 * Типы событий детства
 */

export enum ChildhoodEventType {
  // Здоровье
  ILLNESS = 'illness',           // Болезнь
  INJURY = 'injury',             // Травма
  
  // Социальные
  GAME = 'game',                 // Игры с друзьями
  FIGHT = 'fight',               // Драка
  FESTIVAL = 'festival',         // Праздник
  RELIGIOUS_RITE = 'religious_rite', // Религиозное посвящение
  
  // Обучение
  LEARNING = 'learning',         // Обучение
  PROFESSION_TRAINING = 'profession_training', // Обучение профессии
  
  // Семья
  FAMILY_LOSS = 'family_loss',   // Потеря родственника
  FAMILY_MOVE = 'family_move',   // Переезд семьи
  FAMILY_SECRET = 'family_secret', // Тайна семьи
  
  // Внешние события
  WAR = 'war',                   // Война затронула ребенка
  MEETING = 'meeting',           // Знакомство с важным NPC
  
  // Исследование
  DISCOVERY = 'discovery',       // Находка (предмет, место)
}

export interface ChildhoodEvent {
  id: string;
  type: ChildhoodEventType;
  title: string;
  description: string;
  ageRange: [number, number]; // Диапазон возрастов, когда может произойти
  minSocialStatus: number;    // Минимальный социальный статус семьи (0-100)
  maxSocialStatus: number;    // Максимальный социальный статус
  biomes?: string[];          // Биомы, где может произойти (undefined = везде)
  
  // Влияние на навыки
  skillEffects: {
    strength?: number;
    intelligence?: number;
    dexterity?: number;
    speech?: number;
    observation?: number;
    sociability?: number;
    crafting?: number;
    survival?: number;
  };
  
  // Влияние на здоровье
  healthEffect?: number;
  
  // Влияние на психику
  trauma?: number;      // Отрицательное влияние
  happyMemory?: number; // Положительное воспоминание
  
  // Последствия
  unlocksProfession?: boolean; // Открывает доступ к профессии
  addsTrait?: string;          // Добавляет черту характера
  removesTrait?: string;       // Убирает черту характера
}

/**
 * База данных событий детства
 */
export const CHILDHOOD_EVENTS: ChildhoodEvent[] = [
  // === БОЛЕЗНИ И ТРАВМЫ ===
  {
    id: 'childhood_fever',
    type: ChildhoodEventType.ILLNESS,
    title: 'Детская лихорадка',
    description: 'Тяжелая болезнь в раннем детстве ослабила тело, но закалила дух.',
    ageRange: [2, 5],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    skillEffects: {
      strength: -2,
      survival: 1,
    },
    healthEffect: -5,
    trauma: 2,
  },
  {
    id: 'broken_bone',
    type: ChildhoodEventType.INJURY,
    title: 'Сломанная кость',
    description: 'Падение с дерева привело к серьезной травме.',
    ageRange: [6, 12],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    skillEffects: {
      dexterity: -1,
      strength: -1,
    },
    healthEffect: -3,
    trauma: 1,
  },
  
  // === ИГРЫ И СОЦИАЛИЗАЦИЯ ===
  {
    id: 'children_games',
    type: ChildhoodEventType.GAME,
    title: 'Детские игры',
    description: 'Игры со сверстниками развили ловкость и социальные навыки.',
    ageRange: [4, 10],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    skillEffects: {
      dexterity: 2,
      sociability: 2,
      speech: 1,
    },
    happyMemory: 3,
  },
  {
    id: 'street_fight',
    type: ChildhoodEventType.FIGHT,
    title: 'Уличная драка',
    description: 'Драка с другими детьми научила постоять за себя.',
    ageRange: [8, 14],
    minSocialStatus: 0,
    maxSocialStatus: 70,
    skillEffects: {
      strength: 2,
      dexterity: 1,
      sociability: -1,
    },
    trauma: 1,
    addsTrait: 'aggressive',
  },
  
  // === ПРАЗДНИКИ И ОБРЯДЫ ===
  {
    id: 'harvest_festival',
    type: ChildhoodEventType.FESTIVAL,
    title: 'Праздник урожая',
    description: 'Участие в празднике урожая оставило яркие воспоминания.',
    ageRange: [5, 15],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    biomes: ['field', 'plains', 'forest'],
    skillEffects: {
      sociability: 2,
      speech: 1,
    },
    happyMemory: 4,
  },
  {
    id: 'religious_initiation',
    type: ChildhoodEventType.RELIGIOUS_RITE,
    title: 'Религиозное посвящение',
    description: 'Обряд посвящения в веру дал духовную силу.',
    ageRange: [10, 14],
    minSocialStatus: 20,
    maxSocialStatus: 100,
    skillEffects: {
      intelligence: 1,
      speech: 1,
    },
    happyMemory: 2,
    addsTrait: 'devout',
  },
  
  // === ОБУЧЕНИЕ ===
  {
    id: 'basic_education',
    type: ChildhoodEventType.LEARNING,
    title: 'Базовое образование',
    description: 'Изучение грамоты и счета открыло новые возможности.',
    ageRange: [7, 12],
    minSocialStatus: 30,
    maxSocialStatus: 100,
    skillEffects: {
      intelligence: 3,
      speech: 1,
    },
    happyMemory: 1,
  },
  {
    id: 'apprenticeship',
    type: ChildhoodEventType.PROFESSION_TRAINING,
    title: 'Ученичество',
    description: 'Начало обучения ремеслу у мастера.',
    ageRange: [12, 15],
    minSocialStatus: 10,
    maxSocialStatus: 80,
    skillEffects: {
      crafting: 4,
      intelligence: 1,
      dexterity: 1,
    },
    unlocksProfession: true,
    happyMemory: 2,
  },
  
  // === СЕМЕЙНЫЕ СОБЫТИЯ ===
  {
    id: 'parent_death',
    type: ChildhoodEventType.FAMILY_LOSS,
    title: 'Потеря родителя',
    description: 'Смерть родителя стала тяжелой травмой.',
    ageRange: [5, 15],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    skillEffects: {
      sociability: -2,
      survival: 2,
      intelligence: 1,
    },
    trauma: 8,
    addsTrait: 'melancholic',
  },
  {
    id: 'family_relocation',
    type: ChildhoodEventType.FAMILY_MOVE,
    title: 'Переезд семьи',
    description: 'Переезд в новый город расширил кругозор.',
    ageRange: [6, 14],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    skillEffects: {
      sociability: -1,
      speech: 1,
      observation: 1,
    },
    trauma: 2,
    happyMemory: 1,
  },
  {
    id: 'family_secret',
    type: ChildhoodEventType.FAMILY_SECRET,
    title: 'Семейная тайна',
    description: 'Раскрытие семейной тайны изменило взгляд на мир.',
    ageRange: [12, 15],
    minSocialStatus: 40,
    maxSocialStatus: 100,
    skillEffects: {
      intelligence: 2,
      observation: 2,
    },
    trauma: 3,
    addsTrait: 'secretive',
  },
  
  // === ВНЕШНИЕ СОБЫТИЯ ===
  {
    id: 'war_refugee',
    type: ChildhoodEventType.WAR,
    title: 'Беженец войны',
    description: 'Война разрушила детство, но закалила характер.',
    ageRange: [5, 15],
    minSocialStatus: 0,
    maxSocialStatus: 50,
    skillEffects: {
      survival: 4,
      strength: 1,
      sociability: -3,
      intelligence: 1,
    },
    healthEffect: -5,
    trauma: 10,
    addsTrait: 'traumatized',
  },
  {
    id: 'mentor_meeting',
    type: ChildhoodEventType.MEETING,
    title: 'Встреча с наставником',
    description: 'Знакомство с мудрым наставником изменило судьбу.',
    ageRange: [8, 14],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    skillEffects: {
      intelligence: 2,
      observation: 2,
      speech: 1,
    },
    happyMemory: 5,
    addsTrait: 'educated',
  },
  
  // === НАХОДКИ ===
  {
    id: 'treasure_find',
    type: ChildhoodEventType.DISCOVERY,
    title: 'Находка сокровища',
    description: 'Случайная находка старого клада.',
    ageRange: [7, 14],
    minSocialStatus: 0,
    maxSocialStatus: 60,
    skillEffects: {
      observation: 2,
      survival: 1,
    },
    happyMemory: 4,
  },
  {
    id: 'ancient_ruins',
    type: ChildhoodEventType.DISCOVERY,
    title: 'Исследование руин',
    description: 'Исследование древних руин пробудило интерес к истории.',
    ageRange: [10, 15],
    minSocialStatus: 0,
    maxSocialStatus: 100,
    biomes: ['ruins', 'dungeon', 'mountain'],
    skillEffects: {
      intelligence: 2,
      observation: 2,
      survival: 1,
    },
    trauma: 2,
    happyMemory: 3,
  },
];

/**
 * Получить событие по ID
 */
export function getEventById(id: string): ChildhoodEvent | undefined {
  return CHILDHOOD_EVENTS.find(event => event.id === id);
}

/**
 * Получить события подходящие для возраста и условий
 */
export function getAvailableEvents(
  age: number,
  socialStatus: number,
  biome?: string
): ChildhoodEvent[] {
  return CHILDHOOD_EVENTS.filter(event => {
    // Проверка возраста
    if (age < event.ageRange[0] || age > event.ageRange[1]) {
      return false;
    }
    
    // Проверка социального статуса
    if (socialStatus < event.minSocialStatus || socialStatus > event.maxSocialStatus) {
      return false;
    }
    
    // Проверка биома
    if (event.biomes && biome && !event.biomes.includes(biome)) {
      return false;
    }
    
    return true;
  });
}
