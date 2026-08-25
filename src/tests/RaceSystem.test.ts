import { describe, it, expect } from 'vitest';
import {
  DEFAULT_RACES,
  getRaceById,
  getRandomRace,
  calculateEffectiveAge,
  isAdult,
  getLifeStage,
  getResistance,
  hasAbility,
  getRaceRelation,
} from '../data/RaceSystem';

describe('Race System', () => {
  describe('DEFAULT_RACES', () => {
    it('should have at least 5 races', () => {
      expect(DEFAULT_RACES.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all required fields for each race', () => {
      DEFAULT_RACES.forEach((race: any) => {
        expect(race.id).toBeDefined();
        expect(race.version).toBeDefined();
        expect(race.name).toBeDefined();
        expect(race.singularName).toBeDefined();
        expect(race.pluralName).toBeDefined();
        expect(race.adjective).toBeDefined();
        expect(race.traits).toBeDefined();
        expect(race.debugInfo).toBeDefined();
        
        // Check traits
        expect(race.traits.heightRange).toBeDefined();
        expect(race.traits.lifespan).toBeDefined();
        expect(race.traits.maturationSpeed).toBeDefined();
        expect(race.traits.adultAge).toBeDefined();
        expect(race.traits.physicalFeatures).toBeDefined();
        expect(race.traits.sensoryOrgans).toBeDefined();
        expect(race.traits.innateAbilities).toBeDefined();
        expect(race.traits.resistances).toBeDefined();
        expect(race.traits.culturalTraditions).toBeDefined();
        expect(race.traits.typicalProfessions).toBeDefined();
        expect(race.traits.language).toBeDefined();
        expect(race.traits.dialects).toBeDefined();
        expect(race.traits.familyStructure).toBeDefined();
        expect(race.traits.religionAffinity).toBeDefined();
        expect(race.traits.relationsWithOtherCultures).toBeDefined();
      });
    });

    it('should include humans, elves, dwarves, orcs, and halflings', () => {
      const raceNames = DEFAULT_RACES.map((r: any) => r.name.toLowerCase());
      expect(raceNames).toContain('human');
      expect(raceNames).toContain('elf');
      expect(raceNames).toContain('dwarf');
      expect(raceNames).toContain('orc');
      expect(raceNames).toContain('halfling');
    });
  });

  describe('getRaceById', () => {
    it('should return correct race by id', () => {
      const human = getRaceById('race_human');
      expect(human).toBeDefined();
      expect(human?.name).toBe('Human');
      
      const elf = getRaceById('race_elf');
      expect(elf).toBeDefined();
      expect(elf?.name).toBe('Elf');
    });

    it('should return undefined for non-existent race', () => {
      const unknown = getRaceById('race_unknown');
      expect(unknown).toBeUndefined();
    });
  });

  describe('getRandomRace', () => {
    it('should return a valid race for any seed', () => {
      const seeds = ['test1', 'test2', 'world_seed_123', 'abc'];
      seeds.forEach(seed => {
        const race = getRandomRace(seed);
        expect(race).toBeDefined();
        expect(DEFAULT_RACES.includes(race)).toBe(true);
      });
    });

    it('should return same race for same seed', () => {
      const seed = 'consistent_test_seed';
      const race1 = getRandomRace(seed);
      const race2 = getRandomRace(seed);
      expect(race1.id).toBe(race2.id);
    });
  });

  describe('calculateEffectiveAge', () => {
    it('should calculate effective age correctly', () => {
      const human = getRaceById('race_human')!;
      const elf = getRaceById('race_elf')!;
      
      // Human: 20 years * 1.0 = 20
      expect(calculateEffectiveAge(human, 20)).toBe(20);
      
      // Elf: 20 years * 0.3 = 6 (matures slower)
      expect(calculateEffectiveAge(elf, 20)).toBe(6);
    });
  });

  describe('isAdult', () => {
    it('should correctly identify adults', () => {
      const human = getRaceById('race_human')!;
      const orc = getRaceById('race_orc')!;
      
      expect(isAdult(human, 17)).toBe(false);
      expect(isAdult(human, 18)).toBe(true);
      expect(isAdult(human, 25)).toBe(true);
      
      expect(isAdult(orc, 13)).toBe(false);
      expect(isAdult(orc, 14)).toBe(true); // Orcs mature faster
    });
  });

  describe('getLifeStage', () => {
    it('should return correct life stage', () => {
      const human = getRaceById('race_human')!;
      
      expect(getLifeStage(human, 5)).toBe('child');
      expect(getLifeStage(human, 18)).toBe('young');
      expect(getLifeStage(human, 30)).toBe('adult');
      expect(getLifeStage(human, 50)).toBe('middle-aged');
      expect(getLifeStage(human, 70)).toBe('elderly');
    });

    it('should account for different lifespans', () => {
      const elf = getRaceById('race_elf')!;
      
      // A 50 year old elf is just becoming adult
      expect(getLifeStage(elf, 50)).toBe('young');
      expect(getLifeStage(elf, 100)).toBe('adult');
    });
  });

  describe('getResistance', () => {
    it('should return correct resistance values', () => {
      const dwarf = getRaceById('race_dwarf')!;
      const human = getRaceById('race_human')!;
      
      expect(getResistance(dwarf, 'poison')).toBe(30);
      expect(getResistance(dwarf, 'disease')).toBe(25);
      expect(getResistance(human, 'disease')).toBe(10);
      expect(getResistance(human, 'fire')).toBe(0); // No resistance
    });
  });

  describe('hasAbility', () => {
    it('should check for innate abilities', () => {
      const elf = getRaceById('race_elf')!;
      const dwarf = getRaceById('race_dwarf')!;
      
      expect(hasAbility(elf, 'longevity')).toBe(true);
      expect(hasAbility(elf, 'nature affinity')).toBe(true);
      expect(hasAbility(dwarf, 'stonecunning')).toBe(true);
      expect(hasAbility(dwarf, 'longevity')).toBe(false);
    });
  });

  describe('getRaceRelation', () => {
    it('should return correct relations between races', () => {
      const human = getRaceById('race_human')!;
      const elf = getRaceById('race_elf')!;
      const orc = getRaceById('race_orc')!;
      
      // Humans are friendly to elves
      expect(getRaceRelation(human, 'race_elf')).toBe('friendly');
      
      // Elves are hostile to orcs
      expect(getRaceRelation(elf, 'race_orc')).toBe('hostile');
      
      // Orcs are neutral to humans
      expect(getRaceRelation(orc, 'race_human')).toBe('neutral');
      
      // Unknown relations default to neutral
      expect(getRaceRelation(human, 'race_unknown')).toBe('neutral');
    });
  });

  describe('Race biology and culture integration', () => {
    it('should support random race selection for player birth', () => {
      const playerSeed = 'player_birth_seed_12345';
      const playerRace = getRandomRace(playerSeed);
      
      expect(playerRace).toBeDefined();
      expect(playerRace.traits.heightRange.min).toBeLessThan(playerRace.traits.heightRange.max);
      expect(playerRace.traits.lifespan.min).toBeLessThan(playerRace.traits.lifespan.max);
      expect(playerRace.traits.maturationSpeed).toBeGreaterThan(0);
    });

    it('should have unique characteristics for each race', () => {
      const races = DEFAULT_RACES;
      
      // Each race should have unique traits
      const lifespans = races.map((r: any) => `${r.traits.lifespan.min}-${r.traits.lifespan.max}`);
      const uniqueLifespans = new Set(lifespans);
      
      expect(uniqueLifespans.size).toBe(races.length);
    });
  });
});
