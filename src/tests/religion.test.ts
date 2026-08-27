/**
 * Religion System Tests - Stage 30
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ReligionSystem, 
  generateDefaultPantheon,
  DivineDomain,
  GodAlignment,
  ReligiousConflictType,
} from '../simulation/religion/ReligionSystem';
import { WorldRegion } from '../../world/regions/WorldRegion';
import { NPC, NPCData, NPCFactory } from '../../entities/npc/NPC';
import { getRaceById, Race } from '../../data/RaceSystem';
import { Culture } from '../../data/CivilizationSchemas';

describe('ReligionSystem', () => {
  let religionSystem: ReligionSystem;
  let mockRegions: Map<string, WorldRegion>;

  beforeEach(() => {
    religionSystem = new ReligionSystem();
    
    // Create mock regions
    mockRegions = new Map();
    const region1 = {
      id: 'region_1',
      name: 'Test Region 1',
      width: 100,
      height: 100,
      biomes: [],
      settlements: [],
      climate: 'temperate',
    } as WorldRegion;
    
    const region2 = {
      id: 'region_2',
      name: 'Test Region 2',
      width: 150,
      height: 150,
      biomes: [],
      settlements: [],
      climate: 'cold',
    } as WorldRegion;
    
    mockRegions.set('region_1', region1);
    mockRegions.set('region_2', region2);
    
    religionSystem.initialize(mockRegions);
  });

  describe('Initialization', () => {
    it('should initialize with default pantheon', () => {
      const state = religionSystem.getState();
      expect(state.deities.size).toBeGreaterThan(0);
    });

    it('should generate sacred places for each region', () => {
      const state = religionSystem.getState();
      expect(state.sacredPlaces.size).toBeGreaterThanOrEqual(mockRegions.size);
    });

    it('should create religious orders for each deity', () => {
      const state = religionSystem.getState();
      expect(state.orders.size).toBeGreaterThan(0);
    });

    it('should schedule festivals', () => {
      const state = religionSystem.getState();
      expect(state.festivalSchedule.length).toBeGreaterThan(0);
    });
  });

  describe('Deity System', () => {
    it('should generate deities with all required fields', () => {
      const pantheon = generateDefaultPantheon();
      
      pantheon.forEach(deity => {
        expect(deity.id).toBeDefined();
        expect(deity.name).toBeDefined();
        expect(deity.title).toBeDefined();
        expect(deity.domains).toBeInstanceOf(Array);
        expect(deity.alignment).toBeDefined();
        expect(deity.dogmas).toBeInstanceOf(Array);
        expect(deity.taboos).toBeInstanceOf(Array);
        expect(deity.festivals).toBeInstanceOf(Array);
        expect(deity.rituals).toBeInstanceOf(Array);
      });
    });

    it('should have diverse domains', () => {
      const pantheon = generateDefaultPantheon();
      const allDomains = new Set<DivineDomain>();
      
      pantheon.forEach(deity => {
        deity.domains.forEach(domain => allDomains.add(domain));
      });
      
      expect(allDomains.size).toBeGreaterThan(5);
    });

    it('should have varied alignments', () => {
      const pantheon = generateDefaultPantheon();
      const alignments = new Set<GodAlignment>();
      
      pantheon.forEach(deity => {
        alignments.add(deity.alignment);
      });
      
      expect(alignments.size).toBeGreaterThan(1);
    });

    it('should establish deity relationships', () => {
      const pantheon = generateDefaultPantheon();
      
      pantheon.forEach(deity => {
        expect(deity.relationships).toBeInstanceOf(Array);
      });
    });
  });

  describe('NPC Religion Management', () => {
    it('should create religious affiliation for NPC', () => {
      const mockNPC = createMockNPC('npc_1', 'Test NPC');
      const affiliation = religionSystem.getOrCreateReligiousAffiliation(mockNPC);
      
      expect(affiliation).toBeDefined();
      expect(affiliation.primaryDeity).toBeNull();
      expect(affiliation.devotion).toBe(0);
    });

    it('should assign deity to compatible NPC', () => {
      const mockNPC = createMockNPC('npc_2', 'Farmer Joe', 'farmer');
      const state = religionSystem.getState();
      const harvestDeity = Array.from(state.deities.values()).find(
        d => d.domains.includes('harvest')
      );
      
      if (harvestDeity) {
        religionSystem.assignDeityToNPC(mockNPC, harvestDeity.id);
        expect(mockNPC.religiousAffiliation?.primaryDeity).toBe(harvestDeity.id);
        expect(mockNPC.religiousAffiliation?.devotion).toBe(20);
      }
    });

    it('should modify devotion correctly', () => {
      const mockNPC = createMockNPC('npc_3', 'Devotee');
      const state = religionSystem.getState();
      const deity = Array.from(state.deities.values())[0];
      
      religionSystem.assignDeityToNPC(mockNPC, deity.id);
      religionSystem.modifyDevotion(mockNPC, 30, 'Good deed');
      
      expect(mockNPC.religiousAffiliation?.devotion).toBe(50);
    });

    it('should cap devotion between 0 and 100', () => {
      const mockNPC = createMockNPC('npc_4', 'Extreme Devotee');
      const state = religionSystem.getState();
      const deity = Array.from(state.deities.values())[0];
      
      religionSystem.assignDeityToNPC(mockNPC, deity.id);
      religionSystem.modifyDevotion(mockNPC, 200, 'Overwhelming faith');
      
      expect(mockNPC.religiousAffiliation?.devotion).toBe(100);
    });

    it('should handle taboo violation', () => {
      const mockNPC = createMockNPC('npc_5', 'Sinner');
      const state = religionSystem.getState();
      const deity = Array.from(state.deities.values())[0];
      
      religionSystem.assignDeityToNPC(mockNPC, deity.id);
      
      if (deity.taboos.length > 0) {
        const taboo = deity.taboos[0];
        religionSystem.violateTaboo(mockNPC, taboo.id);
        
        expect(mockNPC.religiousAffiliation?.violatedTaboos).toContain(taboo.id);
        expect(mockNPC.religiousAffiliation?.devotion).toBeLessThan(20);
      }
    });
  });

  describe('Clergy System', () => {
    it('should ordain clergy member', () => {
      const mockNPC = createMockNPC('cleric_1', 'Priest John');
      const state = religionSystem.getState();
      const deity = Array.from(state.deities.values())[0];
      
      religionSystem.assignDeityToNPC(mockNPC, deity.id);
      religionSystem.ordainClergy(mockNPC, deity.id, 'acolyte');
      
      const clergyState = religionSystem.getState().clergy;
      expect(clergyState.has(mockNPC.id)).toBe(true);
    });

    it('should promote clergy with sufficient piety', () => {
      const mockNPC = createMockNPC('cleric_2', 'Bishop Mike');
      const state = religionSystem.getState();
      const deity = Array.from(state.deities.values())[0];
      
      religionSystem.assignDeityToNPC(mockNPC, deity.id);
      religionSystem.ordainClergy(mockNPC, deity.id, 'acolyte');
      
      // Manually set high piety for testing
      const clergyMember = religionSystem.getState().clergy.get(mockNPC.id);
      if (clergyMember) {
        clergyMember.piety = 90;
        religionSystem.promoteClergy(mockNPC.id);
        
        const updated = religionSystem.getState().clergy.get(mockNPC.id);
        expect(updated?.rank).toBe('priest');
      }
    });
  });

  describe('Religious Orders', () => {
    it('should allow NPC to join order', () => {
      const state = religionSystem.getState();
      const orderId = Array.from(state.orders.keys())[0];
      
      const result = religionSystem.joinOrder('npc_join_test', orderId);
      
      expect(result).toBe(true);
    });

    it('should prevent duplicate membership', () => {
      const state = religionSystem.getState();
      const orderId = Array.from(state.orders.keys())[0];
      
      religionSystem.joinOrder('npc_dup_test', orderId);
      const result = religionSystem.joinOrder('npc_dup_test', orderId);
      
      expect(result).toBe(false);
    });

    it('should allow NPC to leave order', () => {
      const state = religionSystem.getState();
      const orderId = Array.from(state.orders.keys())[0];
      
      religionSystem.joinOrder('npc_leave_test', orderId);
      religionSystem.leaveOrder('npc_leave_test', orderId);
      
      const order = state.orders.get(orderId);
      expect(order?.members).not.toContain('npc_leave_test');
    });
  });

  describe('Sacred Places', () => {
    it('should track visits to sacred places', () => {
      const state = religionSystem.getState();
      const sacredPlaceId = Array.from(state.sacredPlaces.keys())[0];
      const initialHoliness = state.sacredPlaces.get(sacredPlaceId)?.holiness || 50;
      
      religionSystem.visitSacredPlace('visitor_1', sacredPlaceId);
      
      const updated = state.sacredPlaces.get(sacredPlaceId);
      expect(updated?.holiness).toBeGreaterThan(initialHoliness - 1);
    });

    it('should record miracles at sacred places', () => {
      const state = religionSystem.getState();
      const sacredPlaceId = Array.from(state.sacredPlaces.keys())[0];
      
      religionSystem.reportMiracle(
        sacredPlaceId,
        'Healing of the blind',
        'witness_1',
        5
      );
      
      const sacredPlace = state.sacredPlaces.get(sacredPlaceId);
      expect(sacredPlace?.miraclesReported.length).toBeGreaterThan(0);
      expect(sacredPlace?.holiness).toBeGreaterThan(50);
    });
  });

  describe('Religious Conflicts', () => {
    it('should start a religious conflict', () => {
      const state = religionSystem.getState();
      const orderId = Array.from(state.orders.keys())[0];
      const regionId = 'region_1';
      const deityId = Array.from(state.deities.keys())[0];
      
      const conflict = religionSystem.startConflict(
        'doctrinal_dispute',
        [orderId],
        [regionId],
        [deityId]
      );
      
      expect(conflict.id).toBeDefined();
      expect(conflict.type).toBe('doctrinal_dispute');
      expect(conflict.intensity).toBe(50);
    });

    it('should escalate conflict intensity', () => {
      const state = religionSystem.getState();
      const orderId = Array.from(state.orders.keys())[0];
      const regionId = 'region_1';
      const deityId = Array.from(state.deities.keys())[0];
      
      const conflict = religionSystem.startConflict(
        'resource_competition',
        [orderId],
        [regionId],
        [deityId]
      );
      
      religionSystem.escalateConflict(conflict.id, 35);
      
      const updated = state.conflicts.get(conflict.id);
      expect(updated?.intensity).toBe(85);
    });

    it('should resolve conflicts', () => {
      const state = religionSystem.getState();
      const orderId = Array.from(state.orders.keys())[0];
      const regionId = 'region_1';
      const deityId = Array.from(state.deities.keys())[0];
      
      const conflict = religionSystem.startConflict(
        'heresy_accusation',
        [orderId],
        [regionId],
        [deityId]
      );
      
      religionSystem.resolveConflict(conflict.id, 'Peace treaty signed');
      
      const updated = state.conflicts.get(conflict.id);
      expect(updated?.resolution).toBe('Peace treaty signed');
      expect(updated?.intensity).toBe(0);
      expect(updated?.endDate).toBeDefined();
    });

    it('should escalate to holy war at high intensity', () => {
      const state = religionSystem.getState();
      const orderId = Array.from(state.orders.keys())[0];
      const regionId = 'region_1';
      const deityId = Array.from(state.deities.keys())[0];
      
      const conflict = religionSystem.startConflict(
        'sacred_site_contest',
        [orderId],
        [regionId],
        [deityId]
      );
      
      religionSystem.escalateConflict(conflict.id, 50);
      
      const updated = state.conflicts.get(conflict.id);
      expect(updated?.type).toBe('holy_war');
    });
  });

  describe('Regional Dominance', () => {
    it('should calculate regional religious dominance', () => {
      const regionId = 'region_1';
      
      religionSystem.updateRegionalDominance(regionId);
      
      const state = religionSystem.getState();
      const dominance = state.regionalDominance.get(regionId);
      
      expect(dominance).toBeDefined();
      expect(dominance?.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Festival Management', () => {
    it('should celebrate festivals', () => {
      const state = religionSystem.getState();
      const eventId = state.festivalSchedule[0]?.id;
      
      if (eventId) {
        religionSystem.celebrateFestival(eventId, 'temple_1', ['npc_1', 'npc_2']);
        
        const event = state.festivalSchedule.find(e => e.id === eventId);
        expect(event?.completed).toBe(true);
        expect(event?.participants.length).toBe(2);
      }
    });
  });

  describe('Architecture Influence', () => {
    it('should return preferred architecture for deity', () => {
      const state = religionSystem.getState();
      const deityId = Array.from(state.deities.keys())[0];
      
      const style = religionSystem.getPreferredArchitecture(deityId, 'temple');
      
      expect(style).toBeDefined();
      expect(typeof style).toBe('string');
    });
  });

  describe('Serialization', () => {
    it('should serialize state to JSON', () => {
      const json = religionSystem.serialize();
      
      expect(json).toBeDefined();
      expect(json.length).toBeGreaterThan(0);
      
      const parsed = JSON.parse(json);
      expect(parsed.deities).toBeDefined();
      expect(parsed.sacredPlaces).toBeDefined();
    });

    it('should deserialize state from JSON', () => {
      const json = religionSystem.serialize();
      const newState = new ReligionSystem();
      
      newState.initialize(mockRegions);
      newState.deserialize(json);
      
      const state = newState.getState();
      expect(state.deities.size).toBeGreaterThan(0);
    });
  });
});


function createMockNPC(
  id: string,
  name: string,
  profession: string = 'commoner'
): NPC {
  const humanRace = getRaceById('human');
  
  const mockCulture: Culture = {
    id: 'test_culture',
    version: '1.0.0',
    name: 'Test Culture',
    language: 'test',
    traditions: [],
    values: [],
    artStyle: 'test',
    architecture: 'test',
    clothing: 'test',
    cuisine: 'test',
    government: 'tribal',
    economy: 'barter',
    religion: 'polytheistic',
    symbolism: 'test',
  };

  return NPCFactory.createDefault(id, name, humanRace!, mockCulture, profession, { x: 0, y: 0 });
}
