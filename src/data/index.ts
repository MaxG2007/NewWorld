/**
 * Экспорт всех схем данных
 */
export * from './BaseTypes';
export * from './WorldSchemas';
export * from './CivilizationSchemas';
export * from './SettlementSchemas';
export * from './NPCSchemas';
export * from './ItemSchemas';
export * from './WorldEntitySchemas';
export * from './MapSchemas';
// DungeonSchemas экспортирует расширенные версии для подземелий
export type {
  DungeonDepthType,
  RoomType,
  TrapType,
  DoorType,
  KeyType,
  HiddenCacheType,
  Door,
  Trap,
  DungeonKey,
  HiddenCache,
  DungeonRoom,
  Corridor,
  SecretPassage,
  TreasureVault,
  DungeonDepthConfig,
  Dungeon as DungeonDetail,
  DungeonExplorerProfile,
  DungeonDiscoveryEvent,
  DungeonGenerationConfig
} from './DungeonSchemas';
// ConstructionSchemas экспортирует расширенные версии Building и Room
export type { 
  BuildingBlock, 
  Furniture, 
  BuildingFloor, 
  Staircase, 
  Fortification, 
  ConstructionAction,
  BlockType,
  BuildingMaterial,
  BlockCondition,
  BlockOrientation
} from './ConstructionSchemas';
