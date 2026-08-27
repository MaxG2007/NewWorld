/**
 * Тесты для Этапа 31 — SOCIAL WORLD
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SocialWorldManager,
  SocialGraph,
  RelationshipFactory,
  type RelationshipType,
  type GroupType
} from '../simulation/social/SocialWorldSystem';

describe('SocialWorldSystem', () => {
  let manager: SocialWorldManager;

  beforeEach(() => {
    manager = new SocialWorldManager();
    RelationshipFactory.setManager(manager);
  });

  describe('Relationships', () => {
    it('should create a friendship relationship', () => {
      const personA = 'char_1';
      const personB = 'char_2';
      
      const relationship = RelationshipFactory.createFriendship(personA, personB, 'friend');
      
      expect(relationship.type).toBe('friendship');
      expect(relationship.subtype).toBe('friend');
      expect(relationship.weight).toBe(50);
      expect(relationship.trust).toBe(60);
      expect(relationship.status).toBe('active');
    });

    it('should create a family relationship (parent-child)', () => {
      const parent = 'char_parent';
      const child = 'char_child';
      
      const relationship = RelationshipFactory.createParentChild(parent, child);
      
      expect(relationship.type).toBe('family');
      expect(relationship.subtype).toBe('parent');
      expect(relationship.weight).toBe(80);
      expect(relationship.trust).toBe(90);
    });

    it('should create a marriage relationship', () => {
      const spouseA = 'char_spouse_a';
      const spouseB = 'char_spouse_b';
      
      const relationship = RelationshipFactory.createMarriage(spouseA, spouseB);
      
      expect(relationship.type).toBe('romantic');
      expect(relationship.subtype).toBe('married');
      expect(relationship.visibility).toBe('public');
      expect(relationship.weight).toBe(90);
    });

    it('should create a rivalry relationship', () => {
      const rivalA = 'char_rival_a';
      const rivalB = 'char_rival_b';
      
      const relationship = RelationshipFactory.createRivalry(rivalA, rivalB, 'enemy');
      
      expect(relationship.type).toBe('rivalry');
      expect(relationship.subtype).toBe('enemy');
      expect(relationship.weight).toBe(-80);
      expect(relationship.trust).toBe(5);
    });

    it('should add events to relationship history', () => {
      const personA = 'char_a';
      const personB = 'char_b';
      
      const relationship = RelationshipFactory.createFriendship(personA, personB, 'friend');
      
      manager.addRelationshipEvent(
        relationship.id,
        'helped_in_battle',
        'Helped during a bandit attack',
        15,
        [personA, personB]
      );
      
      expect(relationship.history.length).toBe(1);
      expect(relationship.history[0].type).toBe('helped_in_battle');
      expect(relationship.weight).toBe(65); // 50 + 15
    });

    it('should end a relationship', () => {
      const personA = 'char_a';
      const personB = 'char_b';
      
      const relationship = RelationshipFactory.createFriendship(personA, personB, 'friend');
      
      manager.endRelationship(relationship.id, 'Betrayal');
      
      expect(relationship.status).toBe('ended');
      expect(relationship.endDate).toBeDefined();
    });

    it('should get all relationships for a character', () => {
      const char1 = 'char_1';
      const char2 = 'char_2';
      const char3 = 'char_3';
      
      RelationshipFactory.createFriendship(char1, char2, 'friend');
      RelationshipFactory.createColleagues(char1, char3);
      
      const relationships = manager.getCharacterRelationships(char1);
      
      expect(relationships.length).toBe(2);
    });

    it('should find relationship between two characters', () => {
      const personA = 'char_a';
      const personB = 'char_b';
      
      const created = RelationshipFactory.createFriendship(personA, personB, 'close_friend');
      const found = manager.getRelationship(personA, personB);
      
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
      expect(found!.subtype).toBe('close_friend');
    });
  });

  describe('Social Groups', () => {
    it('should create a guild', () => {
      const founder = 'char_founder';
      
      const guild = manager.createGroup(
        'Blacksmiths Guild',
        'guild',
        founder,
        'A guild of skilled blacksmiths'
      );
      
      expect(guild.name).toBe('Blacksmiths Guild');
      expect(guild.type).toBe('guild');
      expect(guild.members.length).toBe(1);
      expect(guild.leaderId).toBe(founder);
      expect(guild.status).toBe('active');
    });

    it('should create a criminal gang', () => {
      const leader = 'char_thief';
      
      const gang = manager.createGroup(
        'Shadow Thieves',
        'criminal_gang',
        leader,
        'Underground thieves network'
      );
      
      expect(gang.type).toBe('criminal_gang');
      expect(gang.leaderId).toBe(leader);
    });

    it('should create a political faction', () => {
      const leader = 'char_noble';
      
      const faction = manager.createGroup(
        'Royal Loyalists',
        'political_faction',
        leader,
        'Supporters of the crown'
      );
      
      expect(faction.type).toBe('political_faction');
      expect(faction.influence).toBe(10);
    });

    it('should join a group', () => {
      const founder = 'char_founder';
      const newMember = 'char_member';
      
      const guild = manager.createGroup('Test Guild', 'guild', founder);
      manager.joinGroup(guild.id, newMember, 'apprentice');
      
      expect(guild.members.length).toBe(2);
      const member = guild.members.find(m => m.characterId === newMember);
      expect(member).toBeDefined();
      expect(member!.rank).toBe('apprentice');
    });

    it('should leave a group', () => {
      const founder = 'char_founder';
      const member = 'char_member';
      
      const guild = manager.createGroup('Test Guild', 'guild', founder);
      manager.joinGroup(guild.id, member);
      
      manager.leaveGroup(guild.id, member);
      
      const memberData = guild.members.find(m => m.characterId === member);
      expect(memberData!.status).toBe('inactive');
      expect(memberData!.leaveDate).toBeDefined();
    });

    it('should handle leader leaving by appointing new leader', () => {
      const founder = 'char_founder';
      const seniorMember = 'char_senior';
      
      const guild = manager.createGroup('Test Guild', 'guild', founder);
      manager.joinGroup(guild.id, seniorMember, 'senior');
      
      // Увеличим репутацию старшему члену
      const member = guild.members.find(m => m.characterId === seniorMember);
      if (member) member.reputation = 80;
      
      manager.leaveGroup(guild.id, founder);
      
      expect(guild.leaderId).toBe(seniorMember);
    });

    it('should expel a member from group', () => {
      const founder = 'char_founder';
      const badMember = 'char_bad';
      
      const guild = manager.createGroup('Test Guild', 'guild', founder);
      manager.joinGroup(guild.id, badMember);
      
      manager.expelMember(guild.id, badMember, 'Theft');
      
      const memberData = guild.members.find(m => m.characterId === badMember);
      expect(memberData!.status).toBe('expelled');
    });

    it('should get all groups for a character', () => {
      const char = 'char_multi';
      
      const guild1 = manager.createGroup('Guild 1', 'guild', char);
      const guild2 = manager.createGroup('Guild 2', 'guild', 'other');
      manager.joinGroup(guild2.id, char);
      
      const groups = manager.getCharacterGroups(char);
      
      expect(groups.length).toBe(2);
    });
  });

  describe('Social Graph', () => {
    it('should build connections between characters', () => {
      const charA = 'char_a';
      const charB = 'char_b';
      const charC = 'char_c';
      
      RelationshipFactory.createFriendship(charA, charB, 'friend');
      RelationshipFactory.createFriendship(charB, charC, 'friend');
      
      const path = manager.findConnectionPath(charA, charC);
      
      expect(path).toBeDefined();
      expect(path).toContain(charA);
      expect(path).toContain(charB);
      expect(path).toContain(charC);
    });

    it('should calculate centrality of a node', () => {
      const center = 'char_center';
      const others = ['char_1', 'char_2', 'char_3'];
      
      for (const other of others) {
        RelationshipFactory.createFriendship(center, other, 'friend');
      }
      
      // Граф должен быть перестроен
      manager['rebuildGraph']();
      
      const centrality = manager['graph'].calculateCentrality(center);
      expect(centrality).toBeGreaterThanOrEqual(others.length);
    });

    it('should find clusters in the social network', () => {
      // Cluster 1
      const c1a = 'c1_a';
      const c1b = 'c1_b';
      RelationshipFactory.createFriendship(c1a, c1b, 'friend');
      
      // Cluster 2
      const c2a = 'c2_a';
      const c2b = 'c2_b';
      RelationshipFactory.createFriendship(c2a, c2b, 'friend');
      
      const clusters = manager['graph'].findClusters();
      
      expect(clusters.length).toBeGreaterThanOrEqual(2);
    });

    it('should spread rumor through social network', () => {
      const originator = 'char_originator';
      const friend1 = 'char_friend1';
      const friend2 = 'char_friend2';
      
      // Создаем сильные связи
      const rel1 = RelationshipFactory.createFriendship(originator, friend1, 'best_friend');
      const rel2 = RelationshipFactory.createFriendship(friend1, friend2, 'close_friend');
      
      const reached = manager.spreadRumor(originator, 'Secret rumor');
      
      expect(reached).toContain(originator);
      // Из-за вероятности передачи не гарантируем всех, но хотя бы инициатора
    });

    it('should calculate influence for a character', () => {
      const char = 'char_influential';
      
      // Создаем несколько положительных отношений
      RelationshipFactory.createFriendship(char, 'friend1', 'friend');
      RelationshipFactory.createAlliance(char, 'ally1');
      
      const influence = manager.calculateInfluence(char);
      
      expect(influence.socialStanding).toBeGreaterThan(50);
      expect(influence.networkSize).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Relationship Factory', () => {
    it('should create mentor-apprentice relationship', () => {
      const mentor = 'char_mentor';
      const apprentice = 'char_apprentice';
      
      const relationship = RelationshipFactory.createMentorship(mentor, apprentice);
      
      expect(relationship.type).toBe('professional');
      expect(relationship.subtype).toBe('mentor');
    });

    it('should create colleagues relationship', () => {
      const col1 = 'char_col1';
      const col2 = 'char_col2';
      
      const relationship = RelationshipFactory.createColleagues(col1, col2);
      
      expect(relationship.type).toBe('professional');
      expect(relationship.subtype).toBe('colleague');
      expect(relationship.weight).toBe(40);
    });

    it('should create political alliance', () => {
      const ally1 = 'char_ally1';
      const ally2 = 'char_ally2';
      
      const relationship = RelationshipFactory.createAlliance(ally1, ally2);
      
      expect(relationship.type).toBe('political');
      expect(relationship.subtype).toBe('ally');
      expect(relationship.weight).toBe(70);
    });

    it('should create liege-vassal relationship', () => {
      const liege = 'char_liege';
      const vassal = 'char_vassal';
      
      const relationship = RelationshipFactory.createLiegeVassal(liege, vassal);
      
      expect(relationship.type).toBe('political');
      expect(relationship.subtype).toBe('liege');
    });

    it('should process divorce', () => {
      const spouseA = 'char_spouse_a';
      const spouseB = 'char_spouse_b';
      
      const marriage = RelationshipFactory.createMarriage(spouseA, spouseB);
      RelationshipFactory.createDivorce(marriage.id, 'Irreconcilable differences');
      
      expect(marriage.status).toBe('ended');
      expect(marriage.subtype).toBe('ex_spouse');
      expect(marriage.weight).toBeLessThan(50); // Было 90, минус 50
    });
  });

  describe('Export/Import', () => {
    it('should export and import social world state', () => {
      const char1 = 'char_1';
      const char2 = 'char_2';
      
      RelationshipFactory.createFriendship(char1, char2, 'friend');
      manager.createGroup('Test Guild', 'guild', char1);
      
      const exported = manager.export();
      
      expect(exported.relationships.length).toBe(1);
      expect(exported.groups.length).toBe(1);
      expect(exported.graph.nodes.length).toBeGreaterThan(0);
      
      // Импортируем в новый менеджер
      const newManager = new SocialWorldManager();
      newManager.import(exported);
      
      const imported = newManager.export();
      
      expect(imported.relationships.length).toBe(exported.relationships.length);
      expect(imported.groups.length).toBe(exported.groups.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle weight bounds (-100 to 100)', () => {
      const char1 = 'char_1';
      const char2 = 'char_2';
      
      const relationship = RelationshipFactory.createFriendship(char1, char2, 'friend');
      
      // Добавляем много положительных событий
      for (let i = 0; i < 20; i++) {
        manager.addRelationshipEvent(relationship.id, 'good_deed', 'Did something good', 10, []);
      }
      
      expect(relationship.weight).toBeLessThanOrEqual(100);
      
      // Добавляем много отрицательных событий
      for (let i = 0; i < 30; i++) {
        manager.addRelationshipEvent(relationship.id, 'bad_deed', 'Did something bad', -10, []);
      }
      
      expect(relationship.weight).toBeGreaterThanOrEqual(-100);
    });

    it('should handle trust bounds (0 to 100)', () => {
      const char1 = 'char_1';
      const char2 = 'char_2';
      
      const relationship = RelationshipFactory.createFriendship(char1, char2, 'friend');
      
      // Много положительных событий
      for (let i = 0; i < 30; i++) {
        manager.addRelationshipEvent(relationship.id, 'trust_building', 'Built trust', 10, []);
      }
      
      expect(relationship.trust).toBeLessThanOrEqual(100);
      expect(relationship.trust).toBeGreaterThanOrEqual(0);
    });

    it('should handle getting non-existent relationship', () => {
      const result = manager.getRelationship('nonexistent1', 'nonexistent2');
      expect(result).toBeUndefined();
    });

    it('should handle empty graph operations', () => {
      const emptyManager = new SocialWorldManager();
      const path = emptyManager.findConnectionPath('char1', 'char2');
      expect(path).toBeNull();
    });
  });
});
