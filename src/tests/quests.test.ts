/**
 * Quest System Tests
 * Этап 29 — QUESTS + EVENTS
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { questSystem } from '../simulation/quests/QuestSystem';
import { QuestTier, QuestType } from '../simulation/quests/QuestTypes';

// Mock Region and Settlement for testing
const mockRegion = {
  id: 'test-region',
  name: 'Test Kingdom',
};

const mockSettlement = {
  id: 'test-settlement',
  name: 'Test City',
  regionId: 'test-region',
};

describe('QuestSystem', () => {
  beforeEach(() => {
    // Clear system state before each test
    // Note: In a real implementation, we'd add a reset method
  });

  describe('Quest Generation', () => {
    it('should generate procedural quests', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });

      expect(quest.id).toBeDefined();
      expect(quest.type).toBe('procedural');
      expect(quest.tier).toBe('easy');
      expect(quest.status).toBe('available');
      expect(quest.objectives.length).toBeGreaterThan(0);
      expect(quest.rewards.length).toBeGreaterThan(0);
    });

    it('should generate chained quests', () => {
      const baseQuest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'medium',
      });

      const chain = questSystem.generateChainedQuest(baseQuest, 3);

      expect(chain.length).toBe(3);
      expect(chain[0].chainPosition).toBe(1);
      expect(chain[1].chainPosition).toBe(2);
      expect(chain[2].chainPosition).toBe(3);
      expect(chain[1].prerequisiteQuestIds).toContain(chain[0].id);
      expect(chain[2].prerequisiteQuestIds).toContain(chain[1].id);
    });

    it('should generate personal quests', () => {
      const mockNPC = {
        id: 'npc-1',
        name: 'John Smith',
        factionId: 'faction-1',
      };

      const quest = questSystem.generatePersonalQuest(mockNPC as any, 'player-1');

      expect(quest.type).toBe('personal');
      expect(quest.name).toContain("John Smith");
      expect(quest.giverId).toBe('npc-1');
      expect(quest.giverType).toBe('npc');
    });

    it('should generate family quests', () => {
      const quest = questSystem.generateFamilyQuest('family-123');

      expect(quest.type).toBe('family');
      expect(quest.familyId).toBe('family-123');
      expect(quest.tier).toBe('medium');
    });

    it('should generate city quests', () => {
      const quest = questSystem.generateCityQuest(mockSettlement as any);

      expect(quest.type).toBe('city');
      expect(quest.settlementId).toBe('test-settlement');
      expect(quest.name).toContain('Test City');
    });

    it('should generate political quests', () => {
      const quest = questSystem.generatePoliticalQuest('faction-1', mockRegion as any);

      expect(quest.type).toBe('political');
      expect(quest.tier).toBe('hard');
      expect(quest.regionId).toBe('test-region');
    });

    it('should generate dungeon quests with appropriate difficulty based on depth', () => {
      const quest1 = questSystem.generateDungeonQuest('dungeon-1', 1);
      const quest3 = questSystem.generateDungeonQuest('dungeon-1', 3);
      const quest5 = questSystem.generateDungeonQuest('dungeon-1', 5);
      const quest7 = questSystem.generateDungeonQuest('dungeon-1', 7);

      expect(quest1.tier).toBe('easy');
      expect(quest3.tier).toBe('medium');
      expect(quest5.tier).toBe('hard');
      expect(quest7.tier).toBe('epic');
    });
  });

  describe('Quest Lifecycle', () => {
    it('should create and retrieve a quest', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });

      questSystem.createQuest(quest);

      const retrieved = questSystem.getQuest(quest.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(quest.id);
    });

    it('should accept a quest', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      questSystem.createQuest(quest);

      questSystem.acceptQuest(quest.id, 'player-1');

      const updated = questSystem.getQuest(quest.id);
      expect(updated?.status).toBe('active');
      expect(updated?.activatedAt).toBeDefined();
    });

    it('should complete objectives', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      questSystem.createQuest(quest);
      questSystem.acceptQuest(quest.id, 'player-1');

      const objective = quest.objectives[0];
      if (objective.requiredAmount) {
        for (let i = 0; i < objective.requiredAmount; i++) {
          questSystem.completeObjective(quest.id, objective.id, 'player-1');
        }
      } else {
        questSystem.completeObjective(quest.id, objective.id, 'player-1');
      }

      const updated = questSystem.getQuest(quest.id);
      const updatedObjective = updated?.objectives.find(o => o.id === objective.id);
      expect(updatedObjective?.isCompleted).toBe(true);
    });

    it('should complete a quest', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      questSystem.createQuest(quest);
      questSystem.acceptQuest(quest.id, 'player-1');

      questSystem.completeQuest(quest.id, 'player-1');

      const updated = questSystem.getQuest(quest.id);
      expect(updated?.status).toBe('completed');
      expect(updated?.completedAt).toBeDefined();
      expect(updated?.completedBy).toContain('player-1');
    });

    it('should fail a quest', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      questSystem.createQuest(quest);
      questSystem.acceptQuest(quest.id, 'player-1');

      questSystem.failQuest(quest.id, 'Time expired', 'player-1');

      const updated = questSystem.getQuest(quest.id);
      expect(updated?.status).toBe('failed');
      expect(updated?.failedAt).toBeDefined();
    });
  });

  describe('Quest Tracking', () => {
    it('should get active quests for an actor', () => {
      const quest1 = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      const quest2 = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'medium',
      });

      questSystem.createQuest(quest1);
      questSystem.createQuest(quest2);
      questSystem.acceptQuest(quest1.id, 'player-1');
      questSystem.acceptQuest(quest2.id, 'player-1');

      const active = questSystem.getActiveQuests('player-1');
      expect(active.length).toBe(2);
    });

    it('should get completed quests for an actor', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      questSystem.createQuest(quest);
      questSystem.acceptQuest(quest.id, 'player-1');
      questSystem.completeQuest(quest.id, 'player-1');

      const completed = questSystem.getCompletedQuests('player-1');
      expect(completed.length).toBe(1);
      expect(completed[0].id).toBe(quest.id);
    });

    it('should get quest chain', () => {
      const baseQuest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'medium',
      });
      questSystem.createQuest(baseQuest);

      const chain = questSystem.generateChainedQuest(baseQuest, 3);
      chain.forEach(q => questSystem.createQuest(q));

      const retrievedChain = questSystem.getQuestChain(baseQuest.chainId!);
      expect(retrievedChain.length).toBe(3);
    });
  });

  describe('Quest Discovery', () => {
    it('should discover available quests', () => {
      const quest = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      questSystem.createQuest(quest);

      const discovered = questSystem.discoverAvailableQuests('player-1', {
        regionId: 'test-region',
      });

      expect(discovered.length).toBeGreaterThan(0);
      expect(discovered.map(q => q.id)).toContain(quest.id);
    });

    it('should filter quests by region', () => {
      const quest1 = questSystem.generateProceduralQuest({
        region: mockRegion as any,
        difficulty: 'easy',
      });
      const quest2 = questSystem.generateProceduralQuest({
        region: { ...mockRegion, id: 'other-region' } as any,
        difficulty: 'easy',
      });

      questSystem.createQuest(quest1);
      questSystem.createQuest(quest2);

      const discovered = questSystem.discoverAvailableQuests('player-1', {
        regionId: 'test-region',
      });

      expect(discovered.map(q => q.id)).toContain(quest1.id);
      expect(discovered.map(q => q.id)).not.toContain(quest2.id);
    });
  });
});
