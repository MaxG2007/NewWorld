/**
 * Этап 12: FAMILY + GENEALOGY
 * Экспорт всех модулей системы семей
 */

export { Family } from './Family';
export { GenealogyTree } from './GenealogyTree';
export { FamilyGenerator } from '../../world/generation/FamilyGenerator';

export type {
  FamilyData,
} from './Family';

export type {
  RelationshipType,
  FamilySecret,
  FamilyEvent,
  FamilyAsset,
  FamilyDebt,
  FamilyRelationship,
} from './FamilyTypes';
