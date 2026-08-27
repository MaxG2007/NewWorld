import { BaseEntity, EntityRef } from './BaseTypes';

/**
 * Типы подземелий по глубине
 */
export type DungeonDepthType =
  | 'ruins'              // Depth 1 - руины
  | 'crypt'              // Depth 2 - склеп
  | 'abandoned_mine'     // Depth 3 - заброшенная шахта
  | 'ancient_fortress'   // Depth 4 - древняя крепость
  | 'sealed_civilization'; // Depth 5 - запечатанная цивилизация

/**
 * Типы комнат в подземелье
 */
export type RoomType =
  | 'entrance'
  | 'corridor'
  | 'chamber'
  | 'treasure_room'
  | 'monster_lair'
  | 'puzzle_room'
  | 'trap_room'
  | 'secret_room'
  | 'boss_room'
  | 'exit'
  | 'storage'
  | 'shrine'
  | 'workshop';

/**
 * Типы ловушек
 */
export type TrapType =
  | 'spike_pit'
  | 'dart_trap'
  | 'falling_block'
  | 'poison_gas'
  | 'fire_jet'
  | 'collapsing_floor'
  | 'alarm_trap'
  | 'teleport_trap'
  | 'curse_trap';

/**
 * Типы дверей
 */
export type DoorType =
  | 'wooden'
  | 'iron'
  | 'stone'
  | 'magical'
  | 'secret'
  | 'locked'
  | 'trapped'
  | 'hidden';

/**
 * Типы ключей
 */
export type KeyType =
  | 'simple_key'
  | 'ornate_key'
  | 'crystal_key'
  | 'bone_key'
  | 'magical_key'
  | 'master_key';

/**
 * Типы тайников
 */
export type HiddenCacheType =
  | 'gold_cache'
  | 'item_cache'
  | 'weapon_cache'
  | 'scroll_cache'
  | 'potion_cache'
  | 'artifact_cache';

/**
 * Состояние двери
 */
export interface Door extends BaseEntity {
  id: string;
  doorType: DoorType;
  position: { x: number; y: number };
  isOpen: boolean;
  isLocked: boolean;
  isTrapped: boolean;
  requiredKey: string | null; // ID ключа
  trapId: string | null; // ID ловушки если есть
  health: number; // прочность двери
  difficulty: number; // сложность взлома 0-10
}

/**
 * Ловушка в подземелье
 */
export interface Trap extends BaseEntity {
  id: string;
  trapType: TrapType;
  position: { x: number; y: number };
  damage: number;
  triggerRadius: number;
  isTriggered: boolean;
  canBeDisarmed: boolean;
  disarmDifficulty: number; // 0-10
  effects: string[]; // дополнительные эффекты (яд, паралич и т.д.)
}

/**
 * Ключ для открытия дверей/сундуков
 */
export interface DungeonKey extends BaseEntity {
  id: string;
  keyType: KeyType;
  name: string;
  description: string;
  compatibleDoors: string[]; // IDs дверей которые открывает
  location: string | null; // где находится (ID комнаты)
  isFound: boolean;
  rarity: number; // 1-10 редкость
}

/**
 * Тайник с сокровищами
 */
export interface HiddenCache extends BaseEntity {
  id: string;
  cacheType: HiddenCacheType;
  position: { x: number; y: number };
  roomId: string;
  isHidden: boolean;
  detectionDifficulty: number; // 0-10 сложность обнаружения
  contents: Array<{
    itemId: string;
    quantity: number;
  }>;
  isLooted: boolean;
  trapped: boolean; // защищён ли тайник ловушкой
  trapId: string | null;
}

/**
 * Комната в подземелье
 */
export interface DungeonRoom extends BaseEntity {
  id: string;
  roomType: RoomType;
  position: { x: number; y: number };
  width: number;
  height: number;
  doors: EntityRef<'Door'>[];
  traps: EntityRef<'Trap'>[];
  hiddenCaches: EntityRef<'HiddenCache'>[];
  monsters: EntityRef<'NPC'>[];
  npcs: EntityRef<'NPC'>[];
  treasures: EntityRef<'Item'>[];
  isExplored: boolean;
  isLit: boolean; // освещена ли комната
  lightSources: Array<{
    type: 'torch' | 'lantern' | 'magical' | 'brazier';
    position: { x: number; y: number };
    radius: number;
  }>;
  connections: string[]; // IDs соединённых комнат/коридоров
  secretPassages: EntityRef<'SecretPassage'>[];
  metadata: Record<string, unknown>;
}

/**
 * Коридор между комнатами
 */
export interface Corridor extends BaseEntity {
  id: string;
  startRoom: string; // ID комнаты начала
  endRoom: string; // ID комнаты конца
  path: Array<{ x: number; y: number }>;
  length: number;
  width: number;
  hasTraps: boolean;
  traps: EntityRef<'Trap'>[];
  isExplored: boolean;
  isLit: boolean;
  doors: EntityRef<'Door'>[];
}

/**
 * Секретный проход
 */
export interface SecretPassage extends BaseEntity {
  id: string;
  position: { x: number; y: number };
  connectedRooms: string[]; // IDs комнат которые соединяет
  isDiscovered: boolean;
  discoveryRequirement: string | null; // что нужно для открытия
  mechanism: 'lever' | 'button' | 'pressure_plate' | 'keyword' | 'item_required';
  requiredItem: string | null; // ID предмета если нужен
  isHidden: boolean;
}

/**
 * Сокровищница
 */
export interface TreasureVault extends BaseEntity {
  id: string;
  roomId: string;
  position: { x: number; y: number };
  treasureTier: number; // 1-5 уровень сокровищ
  contents: Array<{
    itemId: string;
    itemtype: string;
    quantity: number;
    rarity: number;
  }>;
  isProtected: boolean;
  protectionType: 'trap' | 'guardian' | 'puzzle' | 'lock' | 'magic';
  protectionDetails: string | null;
  isLooted: boolean;
  value: number;
}

/**
 * Конфигурация глубины подземелья
 */
export interface DungeonDepthConfig {
  depth: number;
  type: DungeonDepthType;
  minRoomCount: number;
  maxRoomCount: number;
  monsterLevelRange: [number, number];
  trapFrequency: number; // 0-1 частота ловушек
  treasureQuality: number; // 1-10 качество сокровищ
  complexity: number; // 1-10 сложность структуры
  specialFeatures: string[];
  enemyTypes: string[];
  environmentalHazards: string[];
}

/**
 * Подземелье как целое
 */
export interface Dungeon extends BaseEntity {
  id: string;
  name: string;
  dungeonType: DungeonDepthType;
  depth: number; // текущая глубина
  worldSeed: string;
  position: { x: number; y: number; z: number }; // z - глубина
  
  // Структура
  rooms: EntityRef<'DungeonRoom'>[];
  corridors: EntityRef<'Corridor'>[];
  secretPassages: EntityRef<'SecretPassage'>[];
  
  // Объекты
  doors: EntityRef<'Door'>[];
  traps: EntityRef<'Trap'>[];
  keys: EntityRef<'DungeonKey'>[];
  hiddenCaches: EntityRef<'HiddenCache'>[];
  treasureVaults: EntityRef<'TreasureVault'>[];
  
  // Сущности
  monsters: EntityRef<'NPC'>[];
  npcs: EntityRef<'NPC'>[];
  
  // Состояние
  isGenerated: boolean;
  isExplored: boolean;
  explorationProgress: number; // 0-1 процент исследования
  clearedPercentage: number; // 0-1 процент зачистки
  
  // Баланс
  difficulty: number; // 1-10 общая сложность
  recommendedLevel: number;
  
  // Входы/выходы
  entrances: Array<{ x: number; y: number }>;
  exits: Array<{ x: number; y: number }>;
  deeperLevels: string[]; // IDs подземелий глубже
  upperLevels: string[]; // IDs подземелий выше
  
  // Авторство открытия
  discoveredBy: EntityRef<'Player' | 'NPC'> | null;
  discoveredAt: number | null;
  isFirstDiscovery: boolean;
  
  metadata: Record<string, unknown>;
}

/**
 * Профиль исследователя подземелий
 */
export interface DungeonExplorerProfile extends BaseEntity {
  ownerId: string;
  ownerType: 'Player' | 'NPC';
  
  // Навыки
  explorationSkill: number; // 0-100
  trapDetectionSkill: number; // 0-100
  lockpickingSkill: number; // 0-100
  combatSkill: number; // 0-100
  
  // Статистика
  dungeonsExplored: number;
  roomsDiscovered: number;
  trapsDetected: number;
  trapsTriggered: number;
  secretsFound: number;
  treasuresLooted: number;
  monstersDefeated: number;
  deepestDepthReached: number;
  
  // Открытые подземелья
  discoveredDungeons: EntityRef<'Dungeon'>[];
  
  // Первые открытия
  firstDiscoveries: Array<{
    dungeonName: string;
    dungeonType: DungeonDepthType;
    depth: number;
    discoveredAt: number;
    coordinates: { x: number; y: number; z: number };
  }>;
  
  // Карта подземелий
  knownDungeons: Map<string, {
    dungeonId: string;
    mappedRooms: string[];
    mappedCorridors: string[];
    lastVisited: number;
  }>;
}

/**
 * Событие открытия подземелья
 */
export interface DungeonDiscoveryEvent extends BaseEntity {
  dungeonId: string;
  dungeonName: string;
  dungeonType: DungeonDepthType;
  depth: number;
  coordinates: { x: number; y: number; z: number };
  discoverer: EntityRef<'Player' | 'NPC'>;
  discoveredAt: number;
  worldSeed: string;
  description: string;
  isFirstDiscovery: boolean;
  recordedInChronicle: boolean;
  initialFindings: {
    roomCount: number;
    hasTraps: boolean;
    hasTreasure: boolean;
    hasMonsters: boolean;
    estimatedDanger: number;
  };
}

/**
 * Настройки генерации подземелья
 */
export interface DungeonGenerationConfig {
  seed: string;
  depth: number;
  dungeonType: DungeonDepthType;
  size: 'small' | 'medium' | 'large' | 'massive';
  theme: string;
  includeSecrets: boolean;
  includeTraps: boolean;
  includeNPCs: boolean;
  treasureMultiplier: number;
  difficultyModifier: number;
}
