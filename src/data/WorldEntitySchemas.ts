import { BaseEntity, EntityRef } from './BaseTypes';

/**
 * Преступление
 */
export interface Crime extends BaseEntity {
  type:
    | 'theft'
    | 'burglary'
    | 'robbery'
    | 'assault'
    | 'murder'
    | 'fraud'
    | 'smuggling'
    | 'illegal_construction';
  description: string;
  perpetrator: EntityRef<'NPC'> | null; // может быть неизвестен
  victim: EntityRef<'NPC' | 'Settlement'> | null;
  location: EntityRef<'Building' | 'District' | 'Chunk'>;
  timestamp: number;
  witnesses: EntityRef<'NPC'>[];
  evidence: string[];
  severity: number; // 0-10
  isSolved: boolean;
  investigator: EntityRef<'NPC'> | null;
}

/**
 * Закон
 */
export interface Law extends BaseEntity {
  name: string;
  description: string;
  country: EntityRef<'Country'> | null;
  settlement: EntityRef<'Settlement'> | null;
  category: 'criminal' | 'civil' | 'tax' | 'trade' | 'religious' | 'military';
  punishments: Array<{
    crime: string;
    penalty: 'fine' | 'imprisonment' | 'exile' | 'execution' | 'labor' | 'shame';
    duration?: number; // для заключения/изгнания
    amount?: number; // для штрафа
  }>;
  enforcement: number; // 0-1 насколько применяется
  isActive: boolean;
  enactedBy: EntityRef<'NPC'> | null;
  enactmentDate: number;
}

/**
 * Подземелье
 */
export interface Dungeon extends BaseEntity {
  name: string;
  type: 'cave' | 'ruins' | 'tomb' | 'mine' | 'crypt' | 'lair' | 'tower';
  entrance: { x: number; y: number }; // координаты в мире
  levels: number;
  difficulty: number; // 0-10
  rooms: EntityRef<'Room'>[];
  corridors: Array<{ from: string; to: string }>; // room IDs
  traps: Array<{
    room: string;
    type: 'spike' | 'pit' | 'poison' | 'arrow' | 'magic';
    damage: number;
    isTriggered: boolean;
  }>;
  monsters: EntityRef<'NPC'>[];
  treasures: EntityRef<'Item'>[];
  secrets: string[]; // секретные проходы
  boss: EntityRef<'NPC'> | null;
  isCleared: boolean;
  respawnTime: number | null; // время возрождения монстров
}

/**
 * Карта
 */
export interface Map extends BaseEntity {
  name: string;
  type: 'world' | 'region' | 'city' | 'dungeon' | 'treasure' | 'military' | 'religious';
  owner: EntityRef<'NPC'> | null;
  regions: string[]; // открытые регионы
  markers: Array<{
    x: number;
    y: number;
    label: string;
    type: 'point' | 'route' | 'area';
  }>;
  accuracy: number; // 0-1
  isComplete: boolean;
  discoveredBy: EntityRef<'NPC'>[];
  value: number;
}

/**
 * Игрок
 */
export interface Player extends BaseEntity {
  name: string;
  npc: EntityRef<'NPC'>; // основной NPC игрока
  isReincarnating: boolean; // готов к новой жизни
  previousLives: EntityRef<'Player'>[];
  legacyPoints: number; // очки наследия
  settings: {
    uiScale: number;
    soundVolume: number;
    musicVolume: number;
    showDebug: boolean;
  };
  saveSlot: number;
}

/**
 * Сохранение игры
 */
export interface Save extends BaseEntity {
  name: string;
  slot: number;
  world: EntityRef<'World'>;
  player: EntityRef<'Player'>;
  gameTime: number; // текущее игровое время
  realTimePlayed: number; // реальное время игры в минутах
  version: string; // версия игры
  checksum: string; // для проверки целостности
  thumbnail: string | null; // base64 скриншот
  autosave: boolean;
  createdAt: number;
  modifiedAt: number;
}

/**
 * Мир (корневая сущность)
 */
export interface World extends BaseEntity {
  name: string;
  seed: EntityRef<'WorldSeed'>;
  chunks: EntityRef<'Chunk'>[];
  biomes: EntityRef<'Biome'>[];
  climates: EntityRef<'Climate'>[];
  countries: EntityRef<'Country'>[];
  settlements: EntityRef<'Settlement'>[];
  races: EntityRef<'Race'>[];
  cultures: EntityRef<'Culture'>[];
  religions: EntityRef<'Religion'>[];
  npcs: EntityRef<'NPC'>[];
  families: EntityRef<'NPCFamily'>[];
  items: EntityRef<'Item'>[];
  events: EntityRef<'Event'>[];
  dungeons: EntityRef<'Dungeon'>[];
  currentTime: number; // текущее игровое время
  age: number; // возраст мира в годах
  isActive: boolean;
}
