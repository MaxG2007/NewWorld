import { describe, it, expect } from 'vitest';
import {
  World,
  WorldSeed,
  Chunk,
  Biome,
  Climate,
  Country,
  Settlement,
  District,
  Building,
  Room,
  Race,
  Culture,
  Religion,
  NPC,
  Family,
  Profession,
  Item,
  Recipe,
  Skill,
  Spell,
  Quest,
  Event,
  Rumor,
  Crime,
  Law,
  Dungeon,
  Map,
  Player,
  Save,
  Personality,
  Memory,
  Relationship,
} from '../data';

/**
 * Helper to create a basic entity with required fields
 */
function createBaseEntity(overrides: Partial<{ id: string; version: string; createdAt: number; updatedAt: number }> = {}) {
  const now = Date.now();
  return {
    id: overrides.id || `test-${Math.random().toString(36).substr(2, 9)}`,
    version: overrides.version || '1.0.0',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

describe('Data Schemas Serialization', () => {
  /**
   * Тест базовой сериализации/десериализации
   */
  function testSerialization<T extends object>(entity: T, typeName: string): void {
    it(`${typeName} should serialize and deserialize without losing critical state`, () => {
      // Serialize to JSON
      const json = JSON.stringify(entity);
      
      // Deserialize from JSON
      const restored: T = JSON.parse(json);
      
      // Check that critical fields are preserved
      expect(restored).toBeDefined();
      
      // Check that all keys from original exist in restored
      const originalKeys = Object.keys(entity);
      for (const key of originalKeys) {
        expect(restored).toHaveProperty(key);
      }
    });
  }

  describe('WorldSeed', () => {
    const worldSeed: WorldSeed = {
      ...createBaseEntity(),
      seed: 'test-seed-12345',
      terrainSeed: 'terrain-abc',
      civilizationSeed: 'civ-def',
      familySeed: 'family-ghi',
      eventSeed: 'event-jkl',
      dungeonSeed: 'dungeon-mno',
      lootSeed: 'loot-pqr',
    };

    testSerialization(worldSeed, 'WorldSeed');

    it('should have all seed values after serialization', () => {
      const json = JSON.stringify(worldSeed);
      const restored: WorldSeed = JSON.parse(json);
      expect(restored.seed).toBe(worldSeed.seed);
      expect(restored.terrainSeed).toBe(worldSeed.terrainSeed);
      expect(restored.civilizationSeed).toBe(worldSeed.civilizationSeed);
    });
  });

  describe('Climate', () => {
    const climate: Climate = {
      ...createBaseEntity(),
      temperature: 22.5,
      humidity: 0.65,
      precipitation: 850,
      season: 'summer',
      windSpeed: 12.3,
      windDirection: 180,
    };

    testSerialization(climate, 'Climate');
  });

  describe('Biome', () => {
    const biome: Biome = {
      ...createBaseEntity(),
      name: 'Temperate Forest',
      type: 'forest',
      vegetation: ['oak', 'pine', 'fern'],
      resources: ['wood', 'herbs', 'stone'],
      soilType: 'loam',
      climate: { type: 'Climate', id: 'climate-1' },
      fauna: ['deer', 'wolf', 'rabbit'],
      dangerLevel: 3,
      typicalNPCs: ['hunter', 'woodcutter'],
    };

    testSerialization(biome, 'Biome');
  });

  describe('Chunk', () => {
    const chunk: Chunk = {
      ...createBaseEntity(),
      x: 5,
      y: -3,
      size: 16,
      biome: { type: 'Biome', id: 'biome-1' },
      elevation: [[100, 105], [98, 102]],
      terrain: [[1, 2], [1, 3]],
      structures: [],
      entities: [],
      stateDelta: { modified: true },
      isLoaded: true,
    };

    testSerialization(chunk, 'Chunk');
  });

  describe('Culture', () => {
    const culture: Culture = {
      ...createBaseEntity(),
      name: 'Northern Kingdom',
      language: 'Common Tongue',
      traditions: ['Harvest Festival', 'Winter Solstice'],
      values: ['honor', 'family', 'tradition'],
      artStyle: 'realistic',
      architecture: 'stone and timber',
      clothing: 'wool and leather',
      cuisine: ['stew', 'bread', 'ale'],
      socialStructure: 'feudal',
      typicalProfessions: ['farmer', 'blacksmith', 'knight'],
    };

    testSerialization(culture, 'Culture');
  });

  describe('Religion', () => {
    const religion: Religion = {
      ...createBaseEntity(),
      name: 'Order of Light',
      deity: 'The Sun God',
      beliefs: ['Light conquers darkness', 'Truth prevails'],
      rituals: ['Morning Prayer', 'Sunset Ceremony'],
      holidays: ['Day of Light', 'Eclipse Festival'],
      symbols: ['sun', 'flame', 'golden crown'],
      moralCode: ['Do not steal', 'Protect the weak'],
      organization: 'hierarchical',
      influence: 0.75,
    };

    testSerialization(religion, 'Religion');
  });

  describe('Race', () => {
    const race: Race = {
      ...createBaseEntity(),
      name: 'Human',
      lifespan: 80,
      maturityAge: 18,
      agingRate: 1.0,
      height: { min: 150, max: 200 },
      abilities: ['adaptability', 'diplomacy'],
      resistances: { poison: 0.1, disease: 0.2 },
      senses: ['normal vision', 'normal hearing'],
      culturalTraditions: [],
      typicalProfessions: ['any'],
      familyStructure: 'nuclear family',
      religions: [],
      languages: ['Common'],
    };

    testSerialization(race, 'Race');
  });

  describe('Profession', () => {
    const profession: Profession = {
      ...createBaseEntity(),
      name: 'Blacksmith',
      category: 'crafting',
      skills: [],
      tools: [],
      incomeLevel: 5,
      socialStatus: 4,
      description: 'Creates weapons and armor',
    };

    testSerialization(profession, 'Profession');
  });

  describe('Skill', () => {
    const skill: Skill = {
      ...createBaseEntity(),
      name: 'Swordsmanship',
      category: 'combat',
      level: 45,
      experience: 2500,
      description: 'Ability to fight with swords',
      prerequisites: [],
    };

    testSerialization(skill, 'Skill');
  });

  describe('Country', () => {
    const country: Country = {
      ...createBaseEntity(),
      name: 'Kingdom of Aethelgard',
      type: 'kingdom',
      capital: null,
      ruler: null,
      culture: { type: 'Culture', id: 'culture-1' },
      religion: null,
      laws: [],
      territories: [],
      relations: {},
      resources: [],
      armySize: 5000,
      population: 150000,
      treasury: 100000,
    };

    testSerialization(country, 'Country');
  });

  describe('Settlement', () => {
    const settlement: Settlement = {
      ...createBaseEntity(),
      name: 'Riverside',
      type: 'town',
      country: null,
      culture: { type: 'Culture', id: 'culture-1' },
      population: 2500,
      districts: [],
      buildings: [],
      marketPrices: { bread: 5, sword: 100 },
      crimeRate: 0.15,
      guards: [],
      leader: null,
      tradeRoutes: [],
      rumors: [],
    };

    testSerialization(settlement, 'Settlement');
  });

  describe('District', () => {
    const district: District = {
      ...createBaseEntity(),
      name: 'Market Quarter',
      type: 'market',
      settlement: { type: 'Settlement', id: 'settlement-1' },
      buildings: [],
      safetyLevel: 7,
      cleanliness: 6,
      population: 500,
    };

    testSerialization(district, 'District');
  });

  describe('Building', () => {
    const building: Building = {
      ...createBaseEntity(),
      name: 'The Golden Anvil',
      type: 'workshop',
      location: { type: 'District', id: 'district-1' },
      owner: null,
      rooms: [],
      floors: 2,
      condition: 85,
      value: 5000,
      isAccessible: true,
    };

    testSerialization(building, 'Building');
  });

  describe('Room', () => {
    const room: Room = {
      ...createBaseEntity(),
      name: 'Forge Room',
      type: 'workshop',
      building: { type: 'Building', id: 'building-1' },
      floor: 1,
      size: { width: 10, height: 8 },
      furniture: [],
      containers: [],
      isLocked: false,
      lightLevel: 8,
    };

    testSerialization(room, 'Room');
  });

  describe('Personality', () => {
    const personality: Personality = {
      ...createBaseEntity(),
      temperament: 'sanguine',
      traits: ['brave', 'curious'],
      fears: ['spiders', 'heights'],
      likes: ['adventure', 'good food'],
      dislikes: ['injustice', 'boredom'],
      values: ['freedom', 'loyalty'],
      habits: ['early riser', 'reads daily'],
      moralAlignment: 'neutral-good',
    };

    testSerialization(personality, 'Personality');
  });

  describe('Memory', () => {
    const memory: Memory = {
      ...createBaseEntity(),
      event: 'First meeting with the king',
      importance: 8,
      emotionalWeight: 5,
      source: null,
      timestamp: 1234567890,
      confidence: 0.95,
      details: { location: 'throne room' },
    };

    testSerialization(memory, 'Memory');
  });

  describe('Relationship', () => {
    const relationship: Relationship = {
      ...createBaseEntity(),
      npcA: { type: 'NPC', id: 'npc-1' },
      npcB: { type: 'NPC', id: 'npc-2' },
      type: 'friend',
      strength: 0.7,
      trust: 0.8,
      history: [],
      lastInteraction: 1234567890,
    };

    testSerialization(relationship, 'Relationship');
  });

  describe('NPC', () => {
    const npc: NPC = {
      ...createBaseEntity(),
      name: 'John Smith',
      age: 35,
      race: { type: 'Race', id: 'race-1' },
      culture: { type: 'Culture', id: 'culture-1' },
      family: null,
      profession: null,
      location: { type: 'Settlement', id: 'settlement-1' },
      health: 100,
      needs: { hunger: 50, sleep: 70, social: 40 },
      personality: { type: 'Personality', id: 'personality-1' },
      memories: [],
      relationships: [],
      knowledge: [],
      inventory: [],
      schedule: [],
      legalStatus: 'free',
      reputation: 0,
      isAlive: true,
      gender: 'male',
    };

    testSerialization(npc, 'NPC');
  });

  describe('Family', () => {
    const family: Family = {
      ...createBaseEntity(),
      name: 'Smith Family',
      members: [],
      parents: [],
      children: [],
      spouses: [],
      residence: { type: 'Building', id: 'building-1' },
      assets: [],
      socialStatus: 5,
      debts: 100,
      secrets: ['hidden treasure'],
      history: ['Founded 100 years ago'],
      traditions: ['Annual reunion'],
    };

    testSerialization(family, 'Family');
  });

  describe('Item', () => {
    const item: Item = {
      ...createBaseEntity(),
      name: 'Iron Sword',
      type: 'weapon',
      quality: 75,
      condition: 90,
      origin: 'Riverside Forge',
      owner: null,
      history: ['Forged by master smith'],
      value: 150,
      properties: { damage: 25 },
      weight: 3.5,
      rarity: 'uncommon',
      stackable: false,
      maxStack: 1,
    };

    testSerialization(item, 'Item');
  });

  describe('Recipe', () => {
    const recipe: Recipe = {
      ...createBaseEntity(),
      name: 'Iron Sword Recipe',
      category: 'weaponsmithing',
      result: { type: 'Item', id: 'item-1' },
      quantity: 1,
      ingredients: [{ item: { type: 'Item', id: 'iron-1' }, quantity: 5 }],
      tools: [],
      skill: null,
      minSkillLevel: 20,
      time: 30,
      isDiscovered: true,
      source: 'teacher',
      region: null,
    };

    testSerialization(recipe, 'Recipe');
  });

  describe('Spell', () => {
    const spell: Spell = {
      ...createBaseEntity(),
      name: 'Fireball',
      school: 'fire',
      cost: 25,
      castTime: 2,
      range: 30,
      area: 'circle',
      element: 'fire',
      effect: 'Deals fire damage in an area',
      duration: 0,
      resistance: 'fire',
      level: 3,
      components: ['verbal', 'somatic'],
      isRitual: false,
    };

    testSerialization(spell, 'Spell');
  });

  describe('Quest', () => {
    const quest: Quest = {
      ...createBaseEntity(),
      name: 'The Lost Artifact',
      description: 'Find the ancient artifact',
      giver: null,
      objectives: [{
        description: 'Retrieve the artifact',
        type: 'collect',
        target: null,
        required: 1,
        current: 0,
        isCompleted: false,
      }],
      rewards: [],
      experience: 500,
      reputation: 50,
      status: 'available',
      prerequisites: [],
      timeLimit: null,
    };

    testSerialization(quest, 'Quest');
  });

  describe('Event', () => {
    const event: Event = {
      ...createBaseEntity(),
      name: 'Great Flood',
      description: 'A massive flood affected the region',
      type: 'natural',
      location: null,
      startTime: 1234567890,
      endTime: 1234654290,
      participants: [],
      consequences: ['Destroyed bridge', 'Displaced families'],
      isHistorical: true,
      impact: 7,
    };

    testSerialization(event, 'Event');
  });

  describe('Rumor', () => {
    const rumor: Rumor = {
      ...createBaseEntity(),
      content: 'There is a dragon in the mountains',
      topic: 'dragon sighting',
      source: null,
      reliability: 0.3,
      spread: 15,
      distortion: 0.4,
      emotionalTone: 'fear',
      relatedEvent: null,
      expirationTime: null,
    };

    testSerialization(rumor, 'Rumor');
  });

  describe('Crime', () => {
    const crime: Crime = {
      ...createBaseEntity(),
      type: 'theft',
      description: 'Stolen goods from the market',
      perpetrator: null,
      victim: null,
      location: { type: 'District', id: 'district-1' },
      timestamp: 1234567890,
      witnesses: [],
      evidence: ['footprints', 'witness testimony'],
      severity: 4,
      isSolved: false,
      investigator: null,
    };

    testSerialization(crime, 'Crime');
  });

  describe('Law', () => {
    const law: Law = {
      ...createBaseEntity(),
      name: 'Trade Regulation Act',
      description: 'Regulates merchant activities',
      country: null,
      settlement: null,
      category: 'trade',
      punishments: [{
        crime: 'smuggling',
        penalty: 'fine',
        amount: 500,
      }],
      enforcement: 0.8,
      isActive: true,
      enactedBy: null,
      enactmentDate: 1234567890,
    };

    testSerialization(law, 'Law');
  });

  describe('Dungeon', () => {
    const dungeon: Dungeon = {
      ...createBaseEntity(),
      name: 'Dark Caverns',
      type: 'cave',
      entrance: { x: 100, y: 200 },
      levels: 5,
      difficulty: 6,
      rooms: [],
      corridors: [],
      traps: [],
      monsters: [],
      treasures: [],
      secrets: ['Hidden chamber on level 3'],
      boss: null,
      isCleared: false,
      respawnTime: 86400,
    };

    testSerialization(dungeon, 'Dungeon');
  });

  describe('Map', () => {
    const map: Map = {
      ...createBaseEntity(),
      name: 'Regional Map',
      type: 'region',
      owner: null,
      regions: ['north', 'central'],
      markers: [{ x: 50, y: 75, label: 'Capital', type: 'point' }],
      accuracy: 0.85,
      isComplete: false,
      discoveredBy: [],
      value: 200,
    };

    testSerialization(map, 'Map');
  });

  describe('Player', () => {
    const player: Player = {
      ...createBaseEntity(),
      name: 'Hero',
      npc: { type: 'NPC', id: 'npc-player' },
      isReincarnating: false,
      previousLives: [],
      legacyPoints: 0,
      settings: {
        uiScale: 1,
        soundVolume: 0.8,
        musicVolume: 0.6,
        showDebug: true,
      },
      saveSlot: 1,
    };

    testSerialization(player, 'Player');
  });

  describe('Save', () => {
    const save: Save = {
      ...createBaseEntity(),
      name: 'My Adventure',
      slot: 1,
      world: { type: 'World', id: 'world-1' },
      player: { type: 'Player', id: 'player-1' },
      gameTime: 86400,
      realTimePlayed: 360,
      version: '0.1.0',
      checksum: 'abc123',
      thumbnail: null,
      autosave: false,
      modifiedAt: Date.now(),
    };

    testSerialization(save, 'Save');
  });

  describe('World', () => {
    const world: World = {
      ...createBaseEntity(),
      name: 'Test World',
      seed: { type: 'WorldSeed', id: 'seed-1' },
      chunks: [],
      biomes: [],
      climates: [],
      countries: [],
      settlements: [],
      races: [],
      cultures: [],
      religions: [],
      npcs: [],
      families: [],
      items: [],
      events: [],
      dungeons: [],
      currentTime: 0,
      age: 1000,
      isActive: true,
    };

    testSerialization(world, 'World');
  });
});
