/**
 * Quest System Types
 * Этап 29 — QUESTS + EVENTS
 */

import { NPC } from '../entities/npc/NPC';
import { Settlement } from '../../world/settlements/Settlement';
import { Region } from '../../world/regions/Region';

// ============================================================================
// Quest Types
// ============================================================================

export type QuestType = 
  | 'hand-authored'
  | 'procedural'
  | 'chained'
  | 'personal'
  | 'family'
  | 'city'
  | 'political'
  | 'dungeon';

export type QuestTier = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';

export type QuestStatus = 
  | 'available'
  | 'active'
  | 'completed'
  | 'failed'
  | 'expired';

// ============================================================================
// Quest Structures
// ============================================================================

export interface QuestObjective {
  id: string;
  type: 'kill' | 'collect' | 'deliver' | 'explore' | 'escort' | 'defend' | 'craft' | 'discover';
  description: string;
  targetId?: string;
  targetType?: string;
  requiredAmount?: number;
  currentAmount?: number;
  location?: {
    regionId: string;
    coordinates?: { x: number; y: number };
  };
  isCompleted: boolean;
  isOptional: boolean;
}

export interface QuestReward {
  type: 'gold' | 'item' | 'reputation' | 'skill' | 'property' | 'title' | 'unlock';
  amount?: number;
  itemId?: string;
  reputationChange?: { factionId: string; amount: number };
  skillExperience?: { skillType: string; amount: number };
  propertyId?: string;
  title?: string;
  unlockType?: 'area' | 'feature' | 'recipe';
  unlockId?: string;
}

export interface QuestChainLink {
  questId: string;
  prerequisiteQuestIds: string[];
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  tier: QuestTier;
  status: QuestStatus;
  
  // Quest giver
  giverId?: string;
  giverType: 'npc' | 'settlement' | 'faction' | 'system';
  
  // Objectives
  objectives: QuestObjective[];
  
  // Rewards
  rewards: QuestReward[];
  
  // Prerequisites
  requiredLevel?: number;
  requiredReputation?: { factionId: string; minimum: number };
  prerequisiteQuestIds?: string[];
  
  // Time constraints
  timeLimit?: number; // in game hours
  expirationTime?: number; // game timestamp
  
  // Context
  regionId?: string;
  settlementId?: string;
  dungeonId?: string;
  familyId?: string;
  
  // Chain info
  chainId?: string;
  chainPosition?: number;
  
  // Metadata
  createdAt: number;
  activatedAt?: number;
  completedAt?: number;
  failedAt?: number;
  
  // Tracking
  discoveredBy?: string; // player who discovered this quest
  completedBy?: string[]; // NPCs or players who completed
}

// ============================================================================
// Quest Generation Context
// ============================================================================

export interface QuestGenerationContext {
  region: Region;
  settlement?: Settlement;
  targetNPC?: NPC;
  dungeonDepth?: number;
  factionId?: string;
  familyId?: string;
  difficulty: QuestTier;
}

// ============================================================================
// Quest Templates for Hand-Authored Quests
// ============================================================================

export interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  tier: QuestTier;
  
  objectiveTemplates: Array<{
    type: QuestObjective['type'];
    descriptionTemplate: string;
    variables: string[];
  }>;
  
  rewardTemplates: Array<{
    type: QuestReward['type'];
    baseAmount?: number;
    scaleWithTier: boolean;
  }>;
  
  prerequisites: {
    level?: number;
    reputation?: { factionId: string; minimum: number };
    quests?: string[];
  };
}

// ============================================================================
// Quest Manager Interface
// ============================================================================

export interface QuestManager {
  // Quest lifecycle
  createQuest(quest: Quest): void;
  getQuest(questId: string): Quest | undefined;
  acceptQuest(questId: string, actorId: string): void;
  completeObjective(questId: string, objectiveId: string, actorId: string): void;
  completeQuest(questId: string, actorId: string): void;
  failQuest(questId: string, reason: string, actorId: string): void;
  
  // Quest discovery
  discoverAvailableQuests(actorId: string, context: {
    regionId?: string;
    settlementId?: string;
  }): Quest[];
  
  // Procedural generation
  generateProceduralQuest(context: QuestGenerationContext): Quest;
  generateChainedQuest(baseQuest: Quest, chainLength: number): Quest[];
  generatePersonalQuest(npc: NPC, playerId: string): Quest;
  generateFamilyQuest(familyId: string): Quest;
  generateCityQuest(settlement: Settlement): Quest;
  generatePoliticalQuest(factionId: string, region: Region): Quest;
  generateDungeonQuest(dungeonId: string, depth: number): Quest;
  
  // Quest tracking
  getActiveQuests(actorId: string): Quest[];
  getCompletedQuests(actorId: string): Quest[];
  getQuestChain(chainId: string): Quest[];
  
  // Cleanup
  expireQuests(currentTime: number): void;
}
