import { BaseEntity, EntityRef } from './BaseTypes';

/**
 * Типы карт в игре
 */
export type MapType =
  | 'purchased'      // купленная карта
  | 'stolen'         // украденная карта
  | 'found'          // найденная карта
  | 'player_drawn'   // нарисованная игроком
  | 'reward'         // получена как награда
  | 'religious'      // религиозная карта
  | 'military'       // военная карта
  | 'dungeon'        // карта подземелья
  | 'regional'       // карта региона
  | 'settlement'     // карта поселения
  | 'trade_route'    // карта торгового пути
  | 'treasure'       // карта сокровищ
  | 'ancient'        // древняя карта
  | 'incomplete';    // неполная/испорченная карта

/**
 * Статус знания о территории
 */
export type KnowledgeStatus =
  | 'unknown'        // ничего не известно
  | 'rumored'        // есть слухи о месте
  | 'partially_known' // частично известно
  | 'mapped'         // нанесено на карту
  | 'verified'       // проверено лично
  | 'explored';      // полностью исследовано

/**
 * Элемент карты - точка интереса или отметка
 */
export interface MapPoint extends BaseEntity {
  name: string;
  type:
    | 'settlement'
    | 'dungeon'
    | 'landmark'
    | 'resource'
    | 'danger'
    | 'secret'
    | 'route_point'
    | 'custom_mark';
  x: number;
  y: number;
  knowledgeStatus: KnowledgeStatus;
  description: string | null;
  discoveredBy: EntityRef<'Player' | 'NPC'> | null;
  discoveredAt: number | null; // игровое время открытия
  isHidden: boolean; // скрыто ли от отображения
  metadata: Record<string, unknown>;
}

/**
 * Маршрут на карте
 */
export interface MapRoute extends BaseEntity {
  name: string;
  description: string | null;
  points: Array<{
    x: number;
    y: number;
    order: number;
  }>;
  distance: number; // условные единицы
  difficulty: number; // 0-10 сложность прохождения
  isTraveled: boolean; // пройден ли маршрут
  createdBy: EntityRef<'Player' | 'NPC'> | null;
  mapType: MapType;
}

/**
 * Карта как предмет/объект данных
 */
export interface GameMap extends BaseEntity {
  name: string;
  mapType: MapType;
  region: EntityRef<'Region'> | null;
  
  // Данные карты
  centerPoint: { x: number; y: number };
  scale: number; // масштаб карты
  rotation: number; // поворот в градусах
  
  // Известные точки
  knownPoints: EntityRef<'MapPoint'>[];
  routes: EntityRef<'MapRoute'>[];
  
  // Зоны с разным уровнем знания
  knowledgeZones: Array<{
    area: { x: number; y: number; radius: number };
    status: KnowledgeStatus;
  }>;
  
  // Владелец и авторство
  owner: EntityRef<'Player' | 'NPC' | 'Family' | 'Faction'> | null;
  creator: EntityRef<'Player' | 'NPC'> | null;
  
  // Состояние карты
  completeness: number; // 0-1 насколько карта полная
  accuracy: number; // 0-1 точность карты
  condition: number; // 0-100 состояние предмета-карты
  
  // Специфичные данные
  isComplete: boolean; // завершена ли карта
  hasSecrets: boolean; // содержит ли скрытые элементы
  hiddenAreas: Array<{ x: number; y: number; radius: number }>; // спрятанные области
  
  // Торговые свойства
  value: number; // стоимость
  canBeSold: boolean; // можно ли продать
  canBeCopied: boolean; // можно ли скопировать
  
  // Награды и открытия
  discoveryRecord: {
    discovererId: string | null;
    discoveredAt: number | null;
    isFirstDiscovery: boolean;
  } | null;
  
  metadata: Record<string, unknown>;
}

/**
 * Профиль картографа (для игрока и NPC)
 */
export interface CartographerProfile extends BaseEntity {
  ownerId: string;
  ownerType: 'Player' | 'NPC';
  
  // Навыки
  mappingSkill: number; // 0-100 навык картографии
  explorationSkill: number; // 0-100 навык исследования
  
  // Статистика
  mapsCreated: number;
  regionsDiscovered: number;
  pointsMarked: number;
  routesDrawn: number;
  mapsSold: number;
  mapsBought: number;
  
  // Коллекция карт
  ownedMaps: EntityRef<'GameMap'>[];
  knownRegions: EntityRef<'Region'>[];
  
  // Открытия
  firstDiscoveries: Array<{
    locationName: string;
    locationType: string;
    coordinates: { x: number; y: number };
    discoveredAt: number;
  }>;
  
  // Продаваемые карты
  mapsForSale: Array<{
    mapId: string;
    price: number;
    listedAt: number;
  }>;
}

/**
 * Событие открытия локации
 */
export interface DiscoveryEvent extends BaseEntity {
  locationName: string;
  locationType: string;
  coordinates: { x: number; y: number };
  discoverer: EntityRef<'Player' | 'NPC'>;
  discoveredAt: number; // игровое время
  worldSeed: string;
  description: string;
  isFirstDiscovery: boolean;
  reward: EntityRef<'Item'> | null;
  recordedInChronicle: boolean;
}

/**
 * Конфигурация видимости карты для игрока
 */
export interface MapVisibilityConfig {
  showUnknownAreas: boolean; // показывать ли неизвестные области
  showRumoredLocations: boolean; // показывать слухи
  autoExplore: boolean; // авто-открытие вокруг игрока
  fogOfWarEnabled: boolean; // туман войны
  revealRadius: number; // радиус открытия вокруг игрока
}
