import { BaseEntity, EntityRef } from '../data/BaseTypes';

/**
 * Типы строительных блоков
 */
export type BlockType =
  | 'wall'           // стена
  | 'floor'          // пол
  | 'door'           // дверь
  | 'roof'           // крыша
  | 'foundation'     // фундамент
  | 'pillar'         // колонна
  | 'beam'           // балка
  | 'stairs'         // лестница
  | 'ramp'           // пандус
  | 'window'         // окно
  | 'gate'           // ворота
  | 'fence'          // забор
  | 'chimney';       // дымоход

/**
 * Типы материалов для строительства
 */
export type BuildingMaterial =
  | 'wood'
  | 'stone'
  | 'brick'
  | 'marble'
  | 'clay'
  | 'thatch'
  | 'tile'
  | 'metal'
  | 'glass'
  | 'concrete'
  | 'ice'
  | 'crystal';

/**
 * Состояние блока
 */
export type BlockCondition =
  | 'pristine'       // идеальное
  | 'good'           // хорошее
  | 'worn'           // изношенное
  | 'damaged'        // повреждённое
  | 'ruined'         // разрушенное
  | 'destroyed';     // уничтоженное

/**
 * Ориентация блока в пространстве
 */
export type BlockOrientation =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'up'
  | 'down'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest';

/**
 * Строительный блок - базовая единица строительства
 */
export interface BuildingBlock extends BaseEntity {
  // Позиция в мире
  x: number;
  y: number;
  z: number; // высота/этаж
  
  // Тип и материал
  blockType: BlockType;
  material: BuildingMaterial;
  
  // Состояние
  condition: number; // 0-100 прочность
  conditionState: BlockCondition;
  
  // Ориентация
  orientation: BlockOrientation;
  rotation: number; // 0-360 градусов
  
  // Размеры
  width: number;
  height: number;
  depth: number;
  
  // Подключения к другим блокам
  connectedBlocks: EntityRef<'BuildingBlock'>[];
  supportedBy: EntityRef<'BuildingBlock'> | null;
  supports: EntityRef<'BuildingBlock'>[];
  
  // Владелец и авторство
  placedBy: EntityRef<'Player' | 'NPC'> | null;
  ownerId: string | null;
  
  // Физические свойства
  isSolid: boolean; // можно ли пройти сквозь
  isTransparent: boolean; // прозрачный ли
  isClimbable: boolean; // можно ли лазить
  isWalkable: boolean; // можно ли ходить по нему
  
  // Интерактивность
  isOpenable: boolean; // можно ли открыть (двери, окна)
  isOpen: boolean; // открыто ли сейчас
  isLocked: boolean; // заблокировано ли
  lockLevel: number; // сложность взлома
  
  // Освещение
  emitsLight: boolean;
  lightIntensity: number; // 0-100
  lightColor: string | null;
  
  // Декоративные свойства
  customName: string | null;
  description: string | null;
  textureVariant: number; // вариант текстуры для разнообразия
  
  // Специфичные данные
  metadata: Record<string, unknown>;
}

/**
 * Предмет мебели
 */
export interface Furniture extends BaseEntity {
  name: string;
  furnitureType:
    | 'bed'
    | 'table'
    | 'chair'
    | 'chest'
    | 'cupboard'
    | 'shelf'
    | 'desk'
    | 'bench'
    | 'stool'
    | 'cabinet'
    | 'throne'
    | 'altar'
    | 'workbench'
    | 'anvil'
    | 'forge'
    | 'cauldron'
    | 'barrel'
    | 'crate'
    | 'lamp'
    | 'chandelier'
    | 'rug'
    | 'curtain'
    | 'mirror'
    | 'custom';
  
  // Позиция
  x: number;
  y: number;
  z: number;
  rotation: number;
  
  // Размеры
  width: number;
  height: number;
  depth: number;
  
  // Материал
  material: BuildingMaterial;
  condition: number; // 0-100
  
  // Функциональность
  capacity: number | null; // вместимость (для сундуков, шкафов)
  storedItems: EntityRef<'Item'>[];
  isUsable: boolean;
  usageType: string | null; // тип использования
  
  // Владелец
  ownerId: string | null;
  placedInRoom: EntityRef<'Room'> | null;
  
  // Визуальные свойства
  color: string | null;
  textureVariant: number;
  decoration: string | null;
  
  description: string | null;
  value: number;
  weight: number;
  
  metadata: Record<string, unknown>;
}

/**
 * Комната/помещение в здании
 */
export interface Room extends BaseEntity {
  name: string;
  roomType:
    | 'bedroom'
    | 'kitchen'
    | 'hall'
    | 'storage'
    | 'workshop'
    | 'shop'
    | 'tavern'
    | 'stable'
    | 'barracks'
    | 'library'
    | 'laboratory'
    | 'temple'
    | 'throne_room'
    | 'dungeon_cell'
    | 'vault'
    | 'attic'
    | 'basement'
    | 'corridor'
    | 'entrance'
    | 'bathroom'
    | 'dining_room'
    | 'study'
    | 'guard_room'
    | 'custom';
  
  // Границы комнаты
  bounds: {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
  };
  
  // Блоки, составляющие комнату
  floorBlocks: EntityRef<'BuildingBlock'>[];
  wallBlocks: EntityRef<'BuildingBlock'>[];
  ceilingBlocks: EntityRef<'BuildingBlock'>[];
  
  // Двери и окна
  doors: EntityRef<'BuildingBlock'>[];
  windows: EntityRef<'BuildingBlock'>[];
  
  // Мебель
  furniture: EntityRef<'Furniture'>[];
  
  // Освещение
  lightSources: EntityRef<'BuildingBlock' | 'Furniture'>[];
  ambientLight: number; // 0-100
  
  // Функциональность
  hasHeating: boolean;
  hasVentilation: boolean;
  isEnclosed: boolean;
  isAccessible: boolean;
  
  // Владелец и назначение
  ownerId: string | null;
  assignedTo: EntityRef<'Player' | 'NPC' | 'Family'> | null;
  buildingId: EntityRef<'Building'> | null;
  floorLevel: number; // на каком этаже
  
  // Атмосфера
  temperature: number; // условная температура
  cleanliness: number; // 0-100 чистота
  decorationLevel: number; // 0-100 украшенность
  
  description: string | null;
  
  metadata: Record<string, unknown>;
}

/**
 * Этаж здания
 */
export interface BuildingFloor extends BaseEntity {
  floorNumber: number; // 0 = первый, -1 = подвал, и т.д.
  floorName: string | null;
  
  // Высота этажа
  zLevel: number;
  height: number;
  
  // Комнаты на этаже
  rooms: EntityRef<'Room'>[];
  
  // Лестницы на этом этаже
  staircases: EntityRef<'Staircase'>[];
  
  // Пол и потолок
  floorBlocks: EntityRef<'BuildingBlock'>[];
  ceilingBlocks: EntityRef<'BuildingBlock'>[];
  
  // Освещение этажа
  lighting: Array<{
    x: number;
    y: number;
    intensity: number;
    type: 'torch' | 'lamp' | 'lantern' | 'magical' | 'natural';
  }>;
  
  // Доступность
  isAccessible: boolean;
  accessRequirements: string[]; // требования для доступа
  
  buildingId: EntityRef<'Building'>;
  
  metadata: Record<string, unknown>;
}

/**
 * Лестница между этажами
 */
export interface Staircase extends BaseEntity {
  staircaseType: 'straight' | 'spiral' | 'ladder' | 'ramp' | 'custom';
  
  // Позиция
  x: number;
  y: number;
  fromZ: number;
  toZ: number;
  
  // Направление
  direction: BlockOrientation;
  
  // Размеры
  width: number;
  depth: number;
  steps: number;
  
  // Материал
  material: BuildingMaterial;
  condition: number; // 0-100
  
  // Безопасность
  isSafe: boolean;
  difficulty: number; // 0-10 сложность подъёма
  
  // Подключения
  connectsFloors: [number, number]; // номера этажей
  
  buildingId: EntityRef<'Building'>;
  
  metadata: Record<string, unknown>;
}

/**
 * Здание как целостная структура
 */
export interface Building extends BaseEntity {
  name: string;
  buildingType:
    | 'house'
    | 'mansion'
    | 'shop'
    | 'tavern'
    | 'inn'
    | 'warehouse'
    | 'workshop'
    | 'barn'
    | 'stable'
    | 'fortress'
    | 'tower'
    | 'castle'
    | 'temple'
    | 'church'
    | 'monastery'
    | 'library'
    | 'school'
    | 'hospital'
    | 'prison'
    | 'barracks'
    | 'guild_hall'
    | 'town_hall'
    | 'market'
    | 'farmhouse'
    | 'mill'
    | 'mine'
    | 'lighthouse'
    | 'bridge'
    | 'gatehouse'
    | 'ruins'
    | 'custom';
  
  // Местоположение в мире
  location: {
    x: number;
    y: number;
    regionId: string | null;
    settlementId: string | null;
  };
  
  // Размеры здания
  footprint: {
    width: number;
    depth: number;
  };
  
  // Этажи
  floors: EntityRef<'BuildingFloor'>[];
  floorCount: number;
  basementLevels: number;
  
  // Крыша
  hasRoof: boolean;
  roofType: 'flat' | 'pitched' | 'domed' | 'conical' | 'custom' | null;
  roofMaterial: BuildingMaterial | null;
  
  // Фундамент
  foundationDepth: number;
  foundationMaterial: BuildingMaterial | null;
  
  // Стены
  exteriorWalls: EntityRef<'BuildingBlock'>[];
  wallMaterial: BuildingMaterial | null;
  
  // Входы
  entrances: Array<{
    x: number;
    y: number;
    doorId: EntityRef<'BuildingBlock'> | null;
    direction: BlockOrientation;
    isLocked: boolean;
    isBlocked: boolean;
  }>;
  
  // Комнаты (плоский список для быстрого доступа)
  rooms: EntityRef<'Room'>[];
  
  // Мебель (плоский список)
  furniture: EntityRef<'Furniture'>[];
  
  // Хранилища
  storageAreas: EntityRef<'Room'>[];
  totalStorageCapacity: number;
  
  // Мастерские
  workshops: EntityRef<'Room'>[];
  
  // Магазины
  shopAreas: EntityRef<'Room'>[];
  
  // Укрепления (для военных зданий)
  fortifications: {
    hasWalls: boolean;
    hasMoat: boolean;
    hasDrawbridge: boolean;
    hasGatehouse: boolean;
    hasTowers: boolean;
    towerCount: number;
    defenseRating: number; // 0-100
  } | null;
  
  // Освещение здания
  lightingSystem: {
    hasNaturalLight: boolean;
    artificialLights: EntityRef<'BuildingBlock' | 'Furniture'>[];
    totalLightOutput: number;
  } | null;
  
  // Функциональность
  isHabitable: boolean;
  isFunctional: boolean;
  requiresMaintenance: boolean;
  lastMaintenance: number | null; // timestamp
  
  // Владелец
  ownerId: string | null;
  ownerType: 'Player' | 'NPC' | 'Family' | 'Faction' | null;
  
  // Экономика
  value: number;
  maintenanceCost: number;
  taxValue: number;
  
  // Состояние
  condition: number; // 0-100 общее состояние
  age: number; // возраст в игровых днях
  
  // История
  builtAt: number | null;
  builtBy: EntityRef<'Player' | 'NPC'> | null;
  renovatedAt: number | null;
  
  // Разрешения
  accessPermissions: Array<{
    entityId: string;
    entityType: 'Player' | 'NPC' | 'Family' | 'Faction';
    permissionLevel: 'owner' | 'resident' | 'visitor' | 'restricted' | 'none';
  }>;
  
  description: string | null;
  
  metadata: Record<string, unknown>;
}

/**
 * Конструкция укрепления
 */
export interface Fortification extends BaseEntity {
  fortificationType:
    | 'wall'
    | 'tower'
    | 'gatehouse'
    | 'bastion'
    | 'rampart'
    | 'moat'
    | 'palisade'
    | 'drawbridge'
    | 'portcullis'
    | 'barbican'
    | 'keep'
    | 'citadel';
  
  // Позиция
  location: {
    x: number;
    y: number;
    regionId: string | null;
    settlementId: string | null;
  };
  
  // Размеры
  dimensions: {
    width: number;
    height: number;
    depth: number;
    length?: number; // для стен
  };
  
  // Материал
  material: BuildingMaterial;
  condition: number; // 0-100
  
  // Оборонительные свойства
  defenseRating: number; // 0-100
  hitPoints: number;
  maxHitPoints: number;
  
  // Гарнизон
  garrisonCapacity: number;
  currentGarrison: EntityRef<'NPC'>[];
  
  // Вооружение
  weapons: Array<{
    type: 'ballista' | 'catapult' | 'trebuchet' | 'cannon' | 'archer_position';
    position: { x: number; y: number; z: number };
    ammunition: number;
  }>;
  
  // Ворота
  gates: Array<{
    isOpen: boolean;
    isLocked: boolean;
    health: number;
    material: BuildingMaterial;
  }> | null;
  
  // Владелец
  ownerId: string | null;
  controllingFaction: string | null;
  
  // Поддержание
  requiresMaintenance: boolean;
  maintenanceCost: number;
  
  metadata: Record<string, unknown>;
}

/**
 * Действие строительства
 */
export interface ConstructionAction extends BaseEntity {
  actionType:
    | 'place_block'
    | 'remove_block'
    | 'place_furniture'
    | 'remove_furniture'
    | 'build_room'
    | 'demolish_room'
    | 'add_floor'
    | 'remove_floor'
    | 'install_stairs'
    | 'add_lighting'
    | 'reinforce'
    | 'repair'
    | 'upgrade'
    | 'paint'
    | 'decorate';
  
  // Что строится
  targetBlock?: EntityRef<'BuildingBlock'>;
  targetFurniture?: EntityRef<'Furniture'>;
  targetRoom?: EntityRef<'Room'>;
  targetBuilding?: EntityRef<'Building'>;
  
  // Кто строит
  builderId: string;
  builderType: 'Player' | 'NPC';
  
  // Время выполнения
  startedAt: number;
  estimatedCompletion: number;
  completedAt: number | null;
  
  // Прогресс
  progress: number; // 0-100
  
  // Необходимые ресурсы
  requiredMaterials: Array<{
    material: BuildingMaterial;
    quantity: number;
    consumed: number;
  }>;
  
  // Стоимость
  laborCost: number;
  materialCost: number;
  
  // Результат
  success: boolean | null;
  errorMessage: string | null;
  
  metadata: Record<string, unknown>;
}
