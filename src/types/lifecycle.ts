/**
 * Типы причин смерти
 */
export type DeathCauseType = 
  | 'combat'           // Смерть в бою
  | 'disease'          // Смерть от болезни
  | 'starvation'       // Смерть от голода
  | 'old_age'          // Смерть от старости
  | 'event'            // Смерть из-за события
  | 'environment'      // Смерть из-за окружающей среды
  | 'accident'         // Несчастный случай
  | 'execution'        // Казнь
  | 'sacrifice'        // Жертвоприношение
  | 'unknown';         // Неизвестная причина

/**
 * Интерфейс причины смерти
 */
export interface DeathCause {
  type: DeathCauseType;
  description: string;
  timestamp: number;
  location?: {
    x: number;
    y: number;
    regionId?: string;
    dungeonId?: string;
  };
  killerId?: string;      // ID убийцы (если combat)
  eventId?: string;       // ID события (если event)
  diseaseId?: string;     // ID болезни (если disease)
  details?: Record<string, any>;
}

/**
 * Этапы жизни персонажа
 */
export interface LifeStage {
  age: number;
  stage: 'infancy' | 'childhood' | 'adolescence' | 'adulthood' | 'middle_age' | 'elderly';
  majorEvents: string[];
}

/**
 * Достижения персонажа
 */
export interface LifeAchievement {
  id: string;
  type: 'quest' | 'discovery' | 'construction' | 'relationship' | 'skill' | 'combat' | 'social';
  title: string;
  description: string;
  timestamp: number;
  importance: number; // 1-10
}

/**
 * Отношения персонажа
 */
export interface LifeRelationship {
  characterId: string;
  characterName: string;
  relationshipType: string;
  strength: number; // -100 до 100
  summary: string;
}

/**
 * Созданные объекты
 */
export interface CreatedObject {
  id: string;
  type: 'building' | 'item' | 'artwork' | 'book' | 'map' | 'organization';
  name: string;
  description: string;
  stillExists: boolean;
}

/**
 * Открытые подземелья
 */
export interface DiscoveredDungeon {
  dungeonId: string;
  name: string;
  depth: number;
  discoveryDate: number;
  isPrimaryDiscoverer: boolean;
}

/**
 * Вклад в хронику
 */
export interface ChronicleEntry {
  entryId: string;
  title: string;
  summary: string;
  impact: 'minor' | 'notable' | 'significant' | 'legendary';
  timestamp: number;
}

/**
 * Посмертный отчет о жизни
 */
export interface LifeSummary {
  characterId: string;
  characterName: string;
  birthDate: number;
  deathDate: number;
  ageAtDeath: number;
  causeOfDeath: DeathCause;
  
  lifeStages: LifeStage[];
  achievements: LifeAchievement[];
  relationships: LifeRelationship[];
  createdObjects: CreatedObject[];
  discoveredDungeons: DiscoveredDungeon[];
  chronicleEntries: ChronicleEntry[];
  
  legacyScore: number; // 0-100, общая оценка наследия
  rememberedBy: string[]; // ID персонажей, которые помнят умершего
}

/**
 * Мета-следы, сохраняемые после смерти
 */
export interface MetaLegacy {
  // История рода
  familyHistory: {
    familyName: string;
    generation: number;
    notableAncestors: string[];
    familyReputation: number; // -100 до 100
  };
  
  // Часть хроники мира
  worldChronicleEntries: string[]; // IDs записей в хронике
  
  // Легендарная репутация семьи
  familyLegend: {
    legendType: 'heroic' | 'tragic' | 'mysterious' | 'infamous' | 'noble';
    legendStrength: number; // 0-100
    bonuses: string[]; // Бонусы для потомков
    maluses: string[]; // Малусы для потомков
  };
  
  // Открытые записи мира (карты, знания)
  unlockedWorldKnowledge: {
    mapRegions: string[]; // ID открытых регионов
    discoveredSecrets: string[]; // ID открытых секретов
    knownRecipes: string[]; // ID известных рецептов
    learnedLanguages: string[]; // ID изученных языков
  };
}

/**
 * Данные для нового рождения
 */
export interface RebirthData {
  newCharacterId: string;
  
  // Случайные параметры
  randomTraits: string[];
  randomStartingLocation: {
    x: number;
    y: number;
    regionId: string;
  };
  randomBackground: string;
  
  // Сохраненные мета-следы
  metaLegacy: MetaLegacy;
  
  // Начальные бонусы/малусы от наследия
  startingBonuses: string[];
  startingMaluses: string[];
  
  // Важно: НЕТ переноса силы, навыков, предметов
  // Новый персонаж начинает с базовыми характеристиками
}

/**
 * Конфигурация системы смерти и возрождения
 */
export interface LifecycleConfig {
  enablePermanentDeath: boolean;
  allowResurrectionRituals: boolean; // Редкие ритуалы воскрешения
  maxFamilyGeneration: number;
  legacyDecayRate: number; // Скорость затухания славы со временем
}
