/**
 * Этап 12: FAMILY + GENEALOGY
 * Типы данных для системы семей и генеалогии
 */

export type RelationshipType = 
  | 'parent'
  | 'child'
  | 'spouse'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'ancestor';

export interface FamilySecret {
  id: string;
  type: 'scandal' | 'crime' | 'illegitimate' | 'debt' | 'alliance' | 'curse';
  description: string;
  knownBy: string[]; // IDs of NPCs who know this secret
  discoveredAt?: number; // Game time when discovered
}

export interface FamilyEvent {
  id: string;
  type: 'birth' | 'death' | 'marriage' | 'divorce' | 'adoption' | 'war' | 'migration' | 'wealth_change';
  timestamp: number;
  description: string;
  participants: string[]; // NPC IDs
}

export interface FamilyAsset {
  type: 'land' | 'building' | 'money' | 'item' | 'livestock';
  name: string;
  value: number;
  description?: string;
}

export interface FamilyDebt {
  creditor: string; // NPC ID or organization name
  amount: number;
  interestRate: number;
  dueDate?: number;
  collateral?: string;
}

export interface FamilyRelationship {
  familyId: string;
  opinion: number; // -100 to 100
  trustLevel: number; // 0 to 100
  lastInteraction?: number;
}
