/**
 * Тесты для этапа 11 — NPC CORE
 */

import { describe, it, expect } from 'vitest';
import { NPC, NPCFactory } from './NPC';
import { getRaceById } from '../../data/RaceSystem';
import type { Culture } from '../../data/CivilizationSchemas';

describe('NPC Core', () => {
  const humanRace = getRaceById('human')!;
  const testCulture: Culture = {
    id: 'culture_test',
    version: '1.0.0',
    name: 'Test Culture',
    language: 'test',
    traditions: ['tradition1'],
    values: ['value1'],
    artStyle: 'test-style',
    architecture: 'test-arch',
    clothing: 'test-clothing',
    cuisine: ['food1'],
    socialStructure: 'hierarchical',
    typicalProfessions: ['farmer'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  describe('NPC Creation', () => {
    it('should create NPC with all required fields', () => {
      const npc = NPCFactory.createDefault('npc_1', 'John Doe', humanRace, testCulture);
      
      expect(npc.id).toBe('npc_1');
      expect(npc.name).toBe('John Doe');
      expect(npc.age).toBe(20);
      expect(npc.race).toBe(humanRace);
      expect(npc.culture).toBe(testCulture);
      expect(npc.profession).toBe('commoner');
      expect(npc.location).toEqual({ x: 0, y: 0 });
      expect(npc.health).toBeDefined();
      expect(npc.needs).toHaveLength(6);
      expect(npc.personality).toBeDefined();
      expect(npc.memory).toEqual([]);
      expect(npc.relationships).toBeInstanceOf(Map);
      expect(npc.knowledge).toBeInstanceOf(Map);
      expect(npc.inventory).toEqual([]);
      expect(npc.schedule).toBeDefined();
      expect(npc.legalStatus).toBeDefined();
      expect(npc.reputation).toBeInstanceOf(Map);
    });

    it('should have all 17 required fields from specification', () => {
      const npc = NPCFactory.createDefault('npc_2', 'Jane Doe', humanRace, testCulture);
      
      const requiredFields = [
        'id', 'name', 'age', 'race', 'culture', 'family', 'profession',
        'location', 'health', 'needs', 'traits', 'personality', 'memory',
        'relationships', 'knowledge', 'inventory', 'schedule', 'legalStatus', 'reputation'
      ];
      
      requiredFields.forEach(field => {
        expect(npc).toHaveProperty(field);
      });
    });
  });

  describe('Serialization', () => {
    it('should serialize NPC to JSON and back', () => {
      const originalNpc = NPCFactory.createDefault('npc_3', 'Bob Smith', humanRace, testCulture);
      originalNpc.updateNeed('hunger', 50);
      originalNpc.addMemory({
        timestamp: Date.now(),
        type: 'event',
        description: 'Test memory',
        emotionalImpact: 10,
        importance: 50,
      });
      
      const json = originalNpc.toJSON();
      const restoredNpc = NPC.fromJSON(json);
      
      expect(restoredNpc.id).toBe(originalNpc.id);
      expect(restoredNpc.name).toBe(originalNpc.name);
      expect(restoredNpc.age).toBe(originalNpc.age);
      expect(restoredNpc.race).toBe(originalNpc.race);
      expect(restoredNpc.needs.length).toBe(originalNpc.needs.length);
    });
  });

  describe('Needs System', () => {
    it('should update need values', () => {
      const npc = NPCFactory.createDefault('npc_4', 'Alice', humanRace, testCulture);
      
      npc.updateNeed('hunger', 30);
      const hunger = npc.getNeed('hunger');
      
      expect(hunger?.value).toBe(30);
    });

    it('should clamp need values between 0-100', () => {
      const npc = NPCFactory.createDefault('npc_5', 'Charlie', humanRace, testCulture);
      
      npc.updateNeed('thirst', 150);
      const thirst = npc.getNeed('thirst');
      
      expect(thirst?.value).toBe(100);
      
      npc.updateNeed('thirst', -20);
      const thirst2 = npc.getNeed('thirst');
      
      expect(thirst2?.value).toBe(0);
    });

    it('should check if NPC can perform action based on needs', () => {
      const npc = NPCFactory.createDefault('npc_6', 'David', humanRace, testCulture);
      
      npc.updateNeed('sleep', 80);
      expect(npc.canPerformAction('sleep', 50)).toBe(true);
      
      npc.updateNeed('sleep', 30);
      expect(npc.canPerformAction('sleep', 50)).toBe(false);
    });
  });

  describe('Relationship System', () => {
    it('should update relationships', () => {
      const npc = NPCFactory.createDefault('npc_7', 'Eve', humanRace, testCulture);
      
      npc.updateRelationship('npc_other', 20, 10);
      const rel = npc.relationships.get('npc_other');
      
      expect(rel?.value).toBe(20);
      expect(rel?.trust).toBe(60);
    });

    it('should clamp relationship values', () => {
      const npc = NPCFactory.createDefault('npc_8', 'Frank', humanRace, testCulture);
      
      npc.updateRelationship('npc_enemy', -150);
      const rel = npc.relationships.get('npc_enemy');
      
      expect(rel?.value).toBe(-100);
      
      npc.updateRelationship('npc_friend', 200);
      const rel2 = npc.relationships.get('npc_friend');
      
      expect(rel2?.value).toBe(100);
    });
  });

  describe('Memory System', () => {
    it('should add memories', () => {
      const npc = NPCFactory.createDefault('npc_9', 'Grace', humanRace, testCulture);
      
      npc.addMemory({
        timestamp: Date.now(),
        type: 'conversation',
        description: 'Had a nice chat',
        emotionalImpact: 30,
        importance: 60,
      });
      
      expect(npc.memory).toHaveLength(1);
      expect(npc.memory[0].type).toBe('conversation');
    });
  });

  describe('Schedule System', () => {
    it('should get current schedule entry', () => {
      const npc = NPCFactory.createDefault('npc_10', 'Henry', humanRace, testCulture);
      
      const morningActivity = npc.getCurrentSchedule(10);
      expect(morningActivity?.activity).toBe('work');
      
      const nightActivity = npc.getCurrentSchedule(3);
      expect(nightActivity?.activity).toBe('sleep');
    });
  });

  describe('Health System', () => {
    it('should calculate health percentage', () => {
      const npc = NPCFactory.createDefault('npc_11', 'Ivy', humanRace, testCulture);
      
      expect(npc.getHealthPercentage()).toBe(100);
      
      npc.health.current = 50;
      expect(npc.getHealthPercentage()).toBe(50);
    });

    it('should apply and remove health effects', () => {
      const npc = NPCFactory.createDefault('npc_12', 'Jack', humanRace, testCulture);
      
      npc.applyHealthEffect({
        type: 'injury',
        name: 'Cut',
        severity: 3,
        effects: { speed: -10 },
      });
      
      expect(npc.health.conditions).toHaveLength(1);
      
      npc.removeHealthEffect('Cut');
      expect(npc.health.conditions).toHaveLength(0);
    });
  });

  describe('Legal Status', () => {
    it('should check rights', () => {
      const npc = NPCFactory.createDefault('npc_13', 'Kate', humanRace, testCulture);
      
      expect(npc.hasRight('basic_protection')).toBe(true);
      expect(npc.hasRight('free_speech')).toBe(false);
    });

    it('should track unpunished crimes', () => {
      const npc = NPCFactory.createDefault('npc_14', 'Leo', humanRace, testCulture);
      
      expect(npc.hasUnpunishedCrimes()).toBe(false);
      
      npc.legalStatus.crimes.push({
        crime: 'theft',
        date: Date.now(),
        severity: 5,
        punished: false,
      });
      
      expect(npc.hasUnpunishedCrimes()).toBe(true);
    });
  });

  describe('Reputation System', () => {
    it('should update reputation', () => {
      const npc = NPCFactory.createDefault('npc_15', 'Mia', humanRace, testCulture);
      
      npc.updateReputation('merchants_guild', 50, 'member');
      const rep = npc.getReputation('merchants_guild');
      
      expect(rep?.value).toBe(50);
      expect(rep?.rank).toBe('member');
    });
  });

  describe('Knowledge System', () => {
    it('should add knowledge', () => {
      const npc = NPCFactory.createDefault('npc_16', 'Noah', humanRace, testCulture);
      
      npc.addKnowledge({
        type: 'location',
        subject: 'Old Ruins',
        details: { x: 100, y: 200 },
        confidence: 80,
      });
      
      expect(npc.knowledge.size).toBeGreaterThan(0);
    });
  });
});
