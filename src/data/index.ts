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
