/**
 * Quest System Implementation
 * Этап 29 — QUESTS + EVENTS
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  Quest, 
  QuestObjective, 
  QuestReward, 
  QuestType, 
  QuestTier, 
  QuestStatus,
  QuestGenerationContext,
  QuestManager 
} from './QuestTypes';
import { NPC } from '../entities/npc/NPC';
import { Settlement } from '../../world/settlements/Settlement';
import { Region } from '../../world/regions/Region';

export class QuestSystem implements QuestManager {
  private quests: Map<string, Quest> = new Map();
  private actorQuests: Map<string, Set<string>> = new Map(); // actorId -> questIds
  private questChains: Map<string, string[]> = new Map(); // chainId -> questIds
  
  // ============================================================================
  // Quest Lifecycle
  // ============================================================================
  
  createQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
    
    if (quest.chainId) {
      const chain = this.questChains.get(quest.chainId) || [];
      chain.push(quest.id);
      this.questChains.set(quest.chainId, chain);
    }
  }
  
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }
  
  acceptQuest(questId: string, actorId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }
    
    if (quest.status !== 'available') {
      throw new Error(`Quest ${questId} is not available`);
    }
    
    quest.status = 'active';
    quest.activatedAt = Date.now();
    
    // Track quest for actor
    if (!this.actorQuests.has(actorId)) {
      this.actorQuests.set(actorId, new Set());
    }
    this.actorQuests.get(actorId)!.add(questId);
  }
  
  completeObjective(questId: string, objectiveId: string, actorId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }
    
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      throw new Error(`Objective ${objectiveId} not found in quest ${questId}`);
    }
    
    if (objective.currentAmount !== undefined && objective.requiredAmount !== undefined) {
      objective.currentAmount++;
      if (objective.currentAmount >= objective.requiredAmount) {
        objective.isCompleted = true;
      }
    } else {
      objective.isCompleted = true;
    }
    
    // Check if all required objectives are complete
    this.checkQuestCompletion(quest);
  }
  
  completeQuest(questId: string, actorId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }
    
    quest.status = 'completed';
    quest.completedAt = Date.now();
    
    if (!quest.completedBy) {
      quest.completedBy = [];
    }
    quest.completedBy.push(actorId);
    
    // Remove from active quests
    const actorQuestSet = this.actorQuests.get(actorId);
    if (actorQuestSet) {
      actorQuestSet.delete(questId);
    }
  }
  
  failQuest(questId: string, reason: string, actorId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }
    
    quest.status = 'failed';
    quest.failedAt = Date.now();
    
    // Remove from active quests
    const actorQuestSet = this.actorQuests.get(actorId);
    if (actorQuestSet) {
      actorQuestSet.delete(questId);
    }
  }
  
  // ============================================================================
  // Quest Discovery
  // ============================================================================
  
  discoverAvailableQuests(actorId: string, context: {
    regionId?: string;
    settlementId?: string;
  }): Quest[] {
    const available: Quest[] = [];
    
    for (const quest of this.quests.values()) {
      if (quest.status !== 'available') continue;
      
      // Check region filter
      if (context.regionId && quest.regionId !== context.regionId) continue;
      
      // Check settlement filter
      if (context.settlementId && quest.settlementId !== context.settlementId) continue;
      
      // Check prerequisites
      if (quest.prerequisiteQuestIds) {
        const completedQuests = this.getCompletedQuests(actorId);
        const completedIds = new Set(completedQuests.map(q => q.id));
        
        const hasAllPrerequisites = quest.prerequisiteQuestIds.every(
          prereqId => completedIds.has(prereqId)
        );
        
        if (!hasAllPrerequisites) continue;
      }
      
      available.push(quest);
    }
    
    return available;
  }
  
  // ============================================================================
  // Procedural Quest Generation
  // ============================================================================
  
  generateProceduralQuest(context: QuestGenerationContext): Quest {
    const questId = uuidv4();
    const tier = context.difficulty;
    
    // Generate objectives based on context
    const objectives = this.generateProceduralObjectives(context);
    const rewards = this.generateProceduralRewards(tier, context);
    
    const quest: Quest = {
      id: questId,
      name: this.generateQuestName(objectives),
      description: this.generateQuestDescription(objectives, context),
      type: 'procedural',
      tier: tier,
      status: 'available',
      giverType: context.settlement ? 'settlement' : 'system',
      objectives,
      rewards,
      regionId: context.region.id,
      settlementId: context.settlement?.id,
      createdAt: Date.now(),
    };
    
    return quest;
  }
  
  private generateProceduralObjectives(context: QuestGenerationContext): QuestObjective[] {
    const objectives: QuestObjective[] = [];
    const objectiveTypes: QuestObjective['type'][] = ['kill', 'collect', 'deliver', 'explore'];
    
    const numObjectives = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numObjectives; i++) {
      const type = objectiveTypes[Math.floor(Math.random() * objectiveTypes.length)];
      
      const objective: QuestObjective = {
        id: uuidv4(),
        type,
        description: this.getObjectiveDescription(type, context),
        requiredAmount: type === 'kill' || type === 'collect' ? Math.floor(Math.random() * 5) + 1 : undefined,
        currentAmount: 0,
        location: {
          regionId: context.region.id,
        },
        isCompleted: false,
        isOptional: false,
      };
      
      objectives.push(objective);
    }
    
    return objectives;
  }
  
  private generateProceduralRewards(tier: QuestTier, context: QuestGenerationContext): QuestReward[] {
    const rewards: QuestReward[] = [];
    
    // Base gold reward based on tier
    const tierMultipliers: Record<QuestTier, number> = {
      trivial: 1,
      easy: 2,
      medium: 5,
      hard: 10,
      epic: 25,
      legendary: 50,
    };
    
    const baseGold = 10 * tierMultipliers[tier];
    rewards.push({
      type: 'gold',
      amount: baseGold + Math.floor(Math.random() * baseGold),
    });
    
    // Maybe add item reward
    if (Math.random() > 0.7) {
      rewards.push({
        type: 'item',
        itemId: `item_${uuidv4().substring(0, 8)}`,
      });
    }
    
    // Maybe add reputation
    if (context.factionId && Math.random() > 0.5) {
      rewards.push({
        type: 'reputation',
        reputationChange: {
          factionId: context.factionId,
          amount: 10 * tierMultipliers[tier],
        },
      });
    }
    
    return rewards;
  }
  
  private generateQuestName(objectives: QuestObjective[]): string {
    const verbs: Record<QuestObjective['type'], string> = {
      kill: 'Eliminate',
      collect: 'Gather',
      deliver: 'Deliver',
      explore: 'Explore',
      escort: 'Escort',
      defend: 'Defend',
      craft: 'Craft',
      discover: 'Discover',
    };
    
    const mainObjective = objectives[0];
    return `${verbs[mainObjective.type]} ${mainObjective.targetType || 'Target'}`;
  }
  
  private generateQuestDescription(objectives: QuestObjective[], context: QuestGenerationContext): string {
    return `A quest has become available in ${context.region.name}. Complete the objectives to earn rewards.`;
  }
  
  private getObjectiveDescription(type: QuestObjective['type'], context: QuestGenerationContext): string {
    const descriptions: Record<QuestObjective['type'], string[]> = {
      kill: ['Defeat hostile creatures', 'Eliminate the threat'],
      collect: ['Gather necessary resources', 'Collect items from the area'],
      deliver: ['Transport goods safely', 'Deliver the package'],
      explore: ['Survey the unknown territory', 'Map the unexplored region'],
      escort: ['Protect the VIP', 'Ensure safe passage'],
      defend: ['Hold the position', 'Protect the location'],
      craft: ['Create the required item', 'Forge the equipment'],
      discover: ['Find the hidden location', 'Uncover the secret'],
    };
    
    const options = descriptions[type];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  // ============================================================================
  // Chained Quests
  // ============================================================================
  
  generateChainedQuest(baseQuest: Quest, chainLength: number): Quest[] {
    const chain: Quest[] = [];
    const chainId = uuidv4();
    
    let previousQuestId: string | undefined = baseQuest.id;
    baseQuest.chainId = chainId;
    baseQuest.chainPosition = 1;
    chain.push(baseQuest);
    
    for (let i = 2; i <= chainLength; i++) {
      const chainedQuest: Quest = {
        ...baseQuest,
        id: uuidv4(),
        name: `${baseQuest.name} - Part ${i}`,
        status: 'available',
        chainId,
        chainPosition: i,
        prerequisiteQuestIds: [previousQuestId!],
        createdAt: Date.now(),
      };
      
      chain.push(chainedQuest);
      previousQuestId = chainedQuest.id;
    }
    
    this.questChains.set(chainId, chain.map(q => q.id));
    
    return chain;
  }
  
  // ============================================================================
  // Personal Quests
  // ============================================================================
  
  generatePersonalQuest(npc: NPC, playerId: string): Quest {
    const questId = uuidv4();
    
    const objectives: QuestObjective[] = [{
      id: uuidv4(),
      type: 'deliver',
      description: `Help ${npc.name} with a personal request`,
      targetId: npc.id,
      targetType: 'npc',
      isCompleted: false,
      isOptional: false,
    }];
    
    const quest: Quest = {
      id: questId,
      name: `${npc.name}'s Request`,
      description: `A personal quest from ${npc.name}.`,
      type: 'personal',
      tier: 'easy',
      status: 'available',
      giverId: npc.id,
      giverType: 'npc',
      objectives,
      rewards: [{
        type: 'reputation',
        reputationChange: {
          factionId: npc.factionId || 'default',
          amount: 20,
        },
      }],
      createdAt: Date.now(),
    };
    
    return quest;
  }
  
  // ============================================================================
  // Family Quests
  // ============================================================================
  
  generateFamilyQuest(familyId: string): Quest {
    const questId = uuidv4();
    
    const objectives: QuestObjective[] = [{
      id: uuidv4(),
      type: 'defend',
      description: 'Protect the family honor and interests',
      isCompleted: false,
      isOptional: false,
    }];
    
    const quest: Quest = {
      id: questId,
      name: 'Family Duty',
      description: 'A quest to uphold the family legacy.',
      type: 'family',
      tier: 'medium',
      status: 'available',
      giverType: 'faction',
      familyId,
      objectives,
      rewards: [
        {
          type: 'reputation',
          reputationChange: {
            factionId: `family_${familyId}`,
            amount: 30,
          },
        },
        {
          type: 'item',
          itemId: 'family_heirloom',
        },
      ],
      createdAt: Date.now(),
    };
    
    return quest;
  }
  
  // ============================================================================
  // City Quests
  // ============================================================================
  
  generateCityQuest(settlement: Settlement): Quest {
    const questId = uuidv4();
    const objectiveTypes: Array<{type: QuestObjective['type'], desc: string}> = [
      { type: 'defend', desc: 'Defend the city from threats' },
      { type: 'collect', desc: 'Gather supplies for the city' },
      { type: 'craft', desc: 'Craft equipment for the guards' },
    ];
    
    const selected = objectiveTypes[Math.floor(Math.random() * objectiveTypes.length)];
    
    const objectives: QuestObjective[] = [{
      id: uuidv4(),
      type: selected.type,
      description: selected.desc,
      location: {
        regionId: settlement.regionId,
      },
      isCompleted: false,
      isOptional: false,
    }];
    
    const quest: Quest = {
      id: questId,
      name: `For ${settlement.name}`,
      description: `The city of ${settlement.name} needs your help.`,
      type: 'city',
      tier: 'medium',
      status: 'available',
      giverId: settlement.id,
      giverType: 'settlement',
      settlementId: settlement.id,
      regionId: settlement.regionId,
      objectives,
      rewards: [
        {
          type: 'gold',
          amount: 100,
        },
        {
          type: 'reputation',
          reputationChange: {
            factionId: `city_${settlement.id}`,
            amount: 25,
          },
        },
      ],
      createdAt: Date.now(),
    };
    
    return quest;
  }
  
  // ============================================================================
  // Political Quests
  // ============================================================================
  
  generatePoliticalQuest(factionId: string, region: Region): Quest {
    const questId = uuidv4();
    
    const objectives: QuestObjective[] = [{
      id: uuidv4(),
      type: 'discover',
      description: 'Uncover political intrigue and conspiracies',
      location: {
        regionId: region.id,
      },
      isCompleted: false,
      isOptional: false,
    }];
    
    const quest: Quest = {
      id: questId,
      name: 'Shadows of Power',
      description: `Navigate the complex political landscape of ${region.name}.`,
      type: 'political',
      tier: 'hard',
      status: 'available',
      giverType: 'faction',
      regionId: region.id,
      objectives,
      rewards: [
        {
          type: 'reputation',
          reputationChange: {
            factionId,
            amount: 50,
          },
        },
        {
          type: 'title',
          title: 'Political Advisor',
        },
      ],
      createdAt: Date.now(),
    };
    
    return quest;
  }
  
  // ============================================================================
  // Dungeon Quests
  // ============================================================================
  
  generateDungeonQuest(dungeonId: string, depth: number): Quest {
    const questId = uuidv4();
    
    const objectives: QuestObjective[] = [
      {
        id: uuidv4(),
        type: 'explore',
        description: `Explore dungeon depth ${depth}`,
        location: {
          regionId: `dungeon_${dungeonId}`,
        },
        isCompleted: false,
        isOptional: false,
      },
      {
        id: uuidv4(),
        type: 'kill',
        description: 'Defeat the dungeon boss',
        targetType: 'boss',
        requiredAmount: 1,
        currentAmount: 0,
        isCompleted: false,
        isOptional: false,
      },
    ];
    
    const tier: QuestTier = depth <= 2 ? 'easy' : depth <= 4 ? 'medium' : depth <= 6 ? 'hard' : 'epic';
    
    const quest: Quest = {
      id: questId,
      name: `Depths of Darkness ${depth}`,
      description: `Venture into the dungeon and conquer depth ${depth}.`,
      type: 'dungeon',
      tier,
      status: 'available',
      giverType: 'system',
      dungeonId,
      objectives,
      rewards: [
        {
          type: 'gold',
          amount: 50 * depth,
        },
        {
          type: 'item',
          itemId: `dungeon_loot_depth_${depth}`,
        },
        {
          type: 'unlock',
          unlockType: 'area',
          unlockId: `dungeon_${dungeonId}_depth_${depth + 1}`,
        },
      ],
      createdAt: Date.now(),
    };
    
    return quest;
  }
  
  // ============================================================================
  // Quest Tracking
  // ============================================================================
  
  getActiveQuests(actorId: string): Quest[] {
    const questIds = this.actorQuests.get(actorId) || new Set();
    const active: Quest[] = [];
    
    for (const questId of questIds) {
      const quest = this.quests.get(questId);
      if (quest && quest.status === 'active') {
        active.push(quest);
      }
    }
    
    return active;
  }
  
  getCompletedQuests(actorId: string): Quest[] {
    const allQuests = Array.from(this.quests.values());
    return allQuests.filter(q => 
      q.completedBy?.includes(actorId) && q.status === 'completed'
    );
  }
  
  getQuestChain(chainId: string): Quest[] {
    const questIds = this.questChains.get(chainId) || [];
    return questIds
      .map(id => this.quests.get(id))
      .filter((q): q is Quest => q !== undefined);
  }
  
  // ============================================================================
  // Cleanup
  // ============================================================================
  
  expireQuests(currentTime: number): void {
    for (const quest of this.quests.values()) {
      if (quest.status === 'available' && quest.expirationTime && currentTime > quest.expirationTime) {
        quest.status = 'expired';
      }
    }
  }
  
  private checkQuestCompletion(quest: Quest): void {
    const allRequiredComplete = quest.objectives
      .filter(obj => !obj.isOptional)
      .every(obj => obj.isCompleted);
    
    if (allRequiredComplete) {
      // Quest can be completed, but we wait for explicit completion call
    }
  }
}

// Export singleton instance
export const questSystem = new QuestSystem();
