/**
 * Religion System - Stage 28
 * 
 * Implements:
 * - Gods/Powers
 * - Sacred Places
 * - Dogmas
 * - Festivals
 * - Rituals
 * - Clergy
 * - Taboos
 * - Religious Conflicts
 * 
 * Religion influences NPCs, politics, architecture, and events
 * without becoming a simple "good/evil" scale.
 */

import { v4 as uuidv4 } from 'uuid';
import { WorldRegion } from '../../world/regions/WorldRegion';
import { NPC } from '../../entities/npc/NPC';
import { Settlement } from '../../world/settlements/Settlement';
import { Building } from '../construction/Building';

// ============================================================================
// Core Types
// ============================================================================

export type DivineDomain = 
  | 'war'
  | 'peace'
  | 'nature'
  | 'death'
  | 'life'
  | 'knowledge'
  | 'magic'
  | 'craft'
  | 'trade'
  | 'justice'
  | 'deception'
  | 'love'
  | 'harvest'
  | 'sea'
  | 'sky'
  | 'earth'
  | 'fire'
  | 'water'
  | 'sun'
  | 'moon'
  | 'stars'
  | 'time'
  | 'fate'
  | 'chaos'
  | 'order'
  | 'freedom'
  | 'family'
  | 'ancestors';

export type GodAlignment = 
  | 'benevolent'
  | 'neutral'
  | 'demanding'
  | 'indifferent'
  | 'capricious'
  | 'strict'
  | 'mysterious';

export type ReligiousConflictType =
  | 'doctrinal_dispute'
  | 'sacred_site_contest'
  | 'conversion_pressure'
  | 'heresy_accusation'
  | 'resource_competition'
  | 'political_alliance'
  | 'schism'
  | 'holy_war';

export interface Deity {
  id: string;
  name: string;
  title: string;
  domains: DivineDomain[];
  alignment: GodAlignment;
  description: string;
  symbols: string[];
  sacredAnimals: string[];
  sacredPlants: string[];
  colors: string[];
  dogmas: Dogma[];
  taboos: Taboo[];
  festivals: Festival[];
  rituals: Ritual[];
  favoredClasses: string[];
  creationMyth: string;
  relationships: DeityRelationship[];
  worshipLevel: number; // 0-100
  activeFollowers: number;
}

export interface DeityRelationship {
  deityId: string;
  relationship: 'ally' | 'enemy' | 'lover' | 'rival' | 'parent' | 'child' | 'neutral';
  description: string;
}

export interface Dogma {
  id: string;
  name: string;
  description: string;
  importance: 'core' | 'important' | 'recommended';
  reward: string; // What followers gain by following
}

export interface Taboo {
  id: string;
  name: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'cardinal';
  consequence: string; // What happens when broken
}

export interface Festival {
  id: string;
  name: string;
  description: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  dayRange: [number, number]; // Day range in season
  traditions: string[];
  requiredOfferings: string[];
  blessings: string[];
}

export interface Ritual {
  id: string;
  name: string;
  description: string;
  purpose: 'blessing' | 'healing' | 'purification' | 'initiation' | 'funeral' | 'marriage' | 'divination' | 'sacrifice';
  requiredItems: string[];
  duration: number; // In minutes
  minClergyLevel: number;
  effects: string[];
}

export interface SacredPlace {
  id: string;
  name: string;
  type: 'temple' | 'shrine' | 'grove' | 'cave' | 'mountain' | 'spring' | 'ruins' | 'altar' | 'monastery' | 'cathedral';
  deityIds: string[];
  coordinates: { x: number; y: number };
  regionId: string;
  holiness: number; // 0-100
  pilgrimageDestination: boolean;
  miraclesReported: MiracleReport[];
  guardians: string[]; // NPC IDs of guardians
  accessibility: 'public' | 'restricted' | 'secret';
  architecturalStyle: string;
  builtYear?: number;
  destroyedYear?: number;
  restoredYear?: number;
}

export interface MiracleReport {
  id: string;
  description: string;
  reportedBy: string;
  date: number;
  verified: boolean;
  witnesses: number;
}

export interface ClergyMember {
  npcId: string;
  deityId: string;
  rank: 'acolyte' | 'priest' | 'high_priest' | 'bishop' | 'archbishop' | 'pontiff' | 'oracle' | 'saint';
  specialization: string[];
  piety: number; // 0-100
  divineFavor: number; // 0-100
  knownRituals: string[];
  sermons: Sermon[];
  conversions: number;
  miraclesPerformed: number;
}

export interface Sermon {
  id: string;
  topic: string;
  date: number;
  audience: number;
  impact: number; // -100 to 100
}

export interface ReligiousOrder {
  id: string;
  name: string;
  primaryDeity: string;
  alliedDeities: string[];
  headquarters: string; // Sacred place ID
  members: string[]; // NPC IDs
  ranks: string[];
  vows: string[];
  activities: string[];
  wealth: number;
  influence: number; // 0-100
  territories: string[]; // Region IDs
  enemies: string[]; // Order IDs
  allies: string[]; // Order IDs
}

export interface ReligiousAffiliation {
  primaryDeity: string | null;
  devotion: number; // 0-100
  secondaryDeities: string[];
  orderMembership: string | null;
  personalDogmas: string[];
  violatedTaboos: string[];
  lastRitualDate: number | null;
  pilgrimageHistory: string[]; // Sacred place IDs visited
}

export interface ReligiousConflict {
  id: string;
  type: ReligiousConflictType;
  parties: {
    orderIds: string[];
    regionIds: string[];
    deityIds: string[];
  };
  startDate: number;
  intensity: number; // 0-100
  casualties: number;
  territoriesAffected: string[];
  resolution: string | null;
  endDate: number | null;
}

export interface ReligionWorldState {
  deities: Map<string, Deity>;
  sacredPlaces: Map<string, SacredPlace>;
  clergy: Map<string, ClergyMember>;
  orders: Map<string, ReligiousOrder>;
  conflicts: Map<string, ReligiousConflict>;
  regionalDominance: Map<string, string[]>; // Region ID -> dominant deity IDs
  festivalSchedule: FestivalEvent[];
  miracleCooldowns: Map<string, number>;
}

export interface FestivalEvent {
  id: string;
  festivalId: string;
  deityId: string;
  location: string; // Sacred place or settlement ID
  startDate: number;
  endDate: number;
  participants: string[]; // NPC IDs
  completed: boolean;
}

// ============================================================================
// Default Pantheon Generator
// ============================================================================

export function generateDefaultPantheon(): Deity[] {
  const pantheon: Deity[] = [
    {
      id: uuidv4(),
      name: 'Aelindra',
      title: 'The Dawn Mother',
      domains: ['life', 'sun', 'family', 'harvest'],
      alignment: 'benevolent',
      description: 'Goddess of life, light, and nurturing. She brings the sun each morning and watches over families.',
      symbols: ['rising sun', 'wheat sheaf', 'cradle'],
      sacredAnimals: ['dove', 'lion', 'deer'],
      sacredPlants: ['sunflower', 'oak', 'lavender'],
      colors: ['gold', 'white', 'green'],
      dogmas: [
        { id: uuidv4(), name: 'Protect the Innocent', description: 'Always defend those who cannot defend themselves.', importance: 'core', reward: 'Divine protection in battle' },
        { id: uuidv4(), name: 'Honor Family', description: 'Family bonds are sacred and must be preserved.', importance: 'core', reward: 'Blessing of fertility and health' },
        { id: uuidv4(), name: 'Share Abundance', description: 'Those with plenty must help those in need.', importance: 'important', reward: 'Good harvests and prosperity' },
      ],
      taboos: [
        { id: uuidv4(), name: 'Harm Children', description: 'Never cause harm to the young.', severity: 'cardinal', consequence: 'Loss of all divine favor, eternal damnation' },
        { id: uuidv4(), name: 'Abandon Family', description: 'Do not forsake your family duties.', severity: 'major', consequence: ' crops fail, livestock sicken' },
        { id: uuidv4(), name: 'Waste Food', description: 'Never waste the gifts of the harvest.', severity: 'moderate', consequence: 'Temporary reduction in blessings' },
      ],
      festivals: [
        { id: uuidv4(), name: 'Spring Equinox', description: 'Celebration of new life and planting.', season: 'spring', dayRange: [1, 3], traditions: ['Seed blessing', 'Family feast', 'Dawn vigil'], requiredOfferings: ['First fruits', 'Flowers', 'Bread'], blessings: ['Fertility boost', 'Crop growth acceleration'] },
        { id: uuidv4(), name: 'Midsummer', description: 'Peak of solar power and life energy.', season: 'summer', dayRange: [45, 47], traditions: ['Bonfires', 'Sunrise ceremony', 'Marriage blessings'], requiredOfferings: ['Honey', 'Golden grains', 'Sunflowers'], blessings: ['Enhanced healing', 'Protection from disease'] },
      ],
      rituals: [
        { id: uuidv4(), name: 'Morning Prayer', description: 'Daily greeting to the dawn.', purpose: 'blessing', requiredItems: [], duration: 10, minClergyLevel: 0, effects: ['Minor blessing for the day'] },
        { id: uuidv4(), name: 'Naming Ceremony', description: 'Blessing of newborns.', purpose: 'initiation', requiredItems: ['Holy water', 'White cloth', 'Flower garland'], duration: 30, minClergyLevel: 1, effects: ['Divine protection for child', 'Family bonding'] },
        { id: uuidv4(), name: 'Harvest Thanksgiving', description: 'Gratitude for abundant harvest.', purpose: 'blessing', requiredItems: ['First fruits', 'Grain offering', 'Incense'], duration: 60, minClergyLevel: 2, effects: ['Next year\'s harvest blessed', 'Community prosperity'] },
      ],
      favoredClasses: ['paladin', 'cleric', 'druid', 'healer'],
      creationMyth: 'In the beginning, there was only darkness. Aelindra opened her eyes and brought the first light, warming the cold void until life could take root.',
      relationships: [],
      worshipLevel: 75,
      activeFollowers: 0,
    },
    {
      id: uuidv4(),
      name: 'Tharok',
      title: 'The Iron Judge',
      domains: ['war', 'justice', 'order', 'earth'],
      alignment: 'strict',
      description: 'God of war, justice, and unyielding order. He demands discipline and punishes transgression.',
      symbols: ['balanced scales', 'sword', 'iron anvil'],
      sacredAnimals: ['wolf', 'eagle', 'bear'],
      sacredPlants: ['ironwood', 'pine', 'nettle'],
      colors: ['gray', 'black', 'red'],
      dogmas: [
        { id: uuidv4(), name: 'Uphold the Law', description: 'Justice must be served without exception.', importance: 'core', reward: 'Victory in righteous battles' },
        { id: uuidv4(), name: 'Maintain Discipline', description: 'Order in oneself leads to order in all things.', importance: 'core', reward: 'Mental fortitude and clarity' },
        { id: uuidv4(), name: 'Punish the Guilty', description: 'Let no crime go unpunished.', importance: 'important', reward: 'Divine strength against enemies' },
      ],
      taboos: [
        { id: uuidv4(), name: 'Show Mercy to Traitors', description: 'Traitors deserve only death.', severity: 'cardinal', consequence: 'Loss of martial prowess, defeat in battle' },
        { id: uuidv4(), name: 'Break Oaths', description: 'An oath once sworn must never be broken.', severity: 'major', consequence: 'Weapons break, armor fails' },
        { id: uuidv4(), name: 'Act Without Honor', description: 'Even enemies deserve honorable treatment.', severity: 'moderate', consequence: 'Shame follows all endeavors' },
      ],
      festivals: [
        { id: uuidv4(), name: 'Day of Judgment', description: 'Review of laws and administration of justice.', season: 'autumn', dayRange: [20, 22], traditions: ['Public trials', 'Oath renewals', 'Military parade'], requiredOfferings: ['Iron tokens', 'Blood sacrifice (animal)', 'Broken weapons'], blessings: ['Clarity in judgment', 'Strength in combat'] },
      ],
      rituals: [
        { id: uuidv4(), name: 'Oath Binding', description: 'Sacred swearing of oaths.', purpose: 'initiation', requiredItems: ['Iron ring', 'Blood drop', 'Witnesses'], duration: 20, minClergyLevel: 2, effects: ['Divine enforcement of oath', 'Binding magical contract'] },
        { id: uuidv4(), name: 'Battle Blessing', description: 'Pre-combat prayer for victory.', purpose: 'blessing', requiredItems: ['Weapon', 'War paint', 'Incense'], duration: 15, minClergyLevel: 1, effects: ['Enhanced combat ability', 'Fear resistance'] },
      ],
      favoredClasses: ['fighter', 'paladin', 'judge', 'guard'],
      creationMyth: 'When chaos threatened to consume the newborn world, Tharok forged chains from the bones of mountains and bound the wild forces into submission.',
      relationships: [],
      worshipLevel: 60,
      activeFollowers: 0,
    },
    {
      id: uuidv4(),
      name: 'Lyssara',
      title: 'The Whispering Veil',
      domains: ['death', 'magic', 'knowledge', 'moon'],
      alignment: 'mysterious',
      description: 'Goddess of death, magic, and hidden knowledge. She guides souls to the afterlife and guards ancient secrets.',
      symbols: ['crescent moon', 'veil', 'open book'],
      sacredAnimals: ['owl', 'bat', 'cat'],
      sacredPlants: ['nightshade', 'willow', 'mushroom'],
      colors: ['silver', 'purple', 'black'],
      dogmas: [
        { id: uuidv4(), name: 'Respect the Dead', description: 'All dead deserve proper rites.', importance: 'core', reward: 'Peaceful passage to afterlife' },
        { id: uuidv4(), name: 'Seek Hidden Truth', description: 'Knowledge hidden is knowledge waiting.', importance: 'important', reward: 'Insight into mysteries' },
        { id: uuidv4(), name: 'Balance Life and Death', description: 'Neither should dominate the other.', importance: 'core', reward: 'Harmony with natural cycles' },
      ],
      taboos: [
        { id: uuidv4(), name: 'Desecrate Graves', description: 'Never disturb the resting dead without cause.', severity: 'cardinal', consequence: 'Haunted by spirits, cursed luck' },
        { id: uuidv4(), name: 'Hide Knowledge Maliciously', description: 'Knowledge should serve understanding, not oppression.', severity: 'major', consequence: 'Magic becomes unstable' },
        { id: uuidv4(), name: 'Fear Death', description: 'Death is a transition, not an end.', severity: 'moderate', consequence: 'Anxiety and nightmares' },
      ],
      festivals: [
        { id: uuidv4(), name: 'Night of Whispers', description: 'When the veil between worlds is thinnest.', season: 'autumn', dayRange: [30, 31], traditions: ['Ancestor veneration', 'Divination', 'Silent vigil'], requiredOfferings: ['Candles', 'Incense', 'Memories written on paper'], blessings: ['Communication with ancestors', 'Enhanced divination'] },
      ],
      rituals: [
        { id: uuidv4(), name: 'Funeral Rites', description: 'Guiding the soul to rest.', purpose: 'funeral', requiredItems: ['Shroud', 'Coin for passage', 'Incense'], duration: 45, minClergyLevel: 1, effects: ['Peaceful transition', 'Prevents haunting'] },
        { id: uuidv4(), name: 'Divination Ritual', description: 'Seeking knowledge from beyond.', purpose: 'divination', requiredItems: ['Crystal', 'Moonlight', 'Quiet space'], duration: 60, minClergyLevel: 3, effects: ['Vision of possible futures', 'Answer to one question'] },
      ],
      favoredClasses: ['necromancer', 'wizard', 'oracle', 'undertaker'],
      creationMyth: 'Lyssara was born from the first shadow cast by Aelindra\'s light. She does not oppose life but completes it, as night completes day.',
      relationships: [],
      worshipLevel: 45,
      activeFollowers: 0,
    },
  ];

  // Set up relationships
  pantheon[0].relationships.push({ deityId: pantheon[1].id, relationship: 'ally', description: 'Both protect civilization in different ways' });
  pantheon[0].relationships.push({ deityId: pantheon[2].id, relationship: 'neutral', description: 'Life and death exist in balance' });
  pantheon[1].relationships.push({ deityId: pantheon[0].id, relationship: 'ally', description: 'Order enables life to flourish' });
  pantheon[1].relationships.push({ deityId: pantheon[2].id, relationship: 'rival', description: 'Justice struggles with mystery' });
  pantheon[2].relationships.push({ deityId: pantheon[0].id, relationship: 'neutral', description: 'Death serves life by making room for renewal' });
  pantheon[2].relationships.push({ deityId: pantheon[1].id, relationship: 'rival', description: 'Some truths are meant to remain hidden' });

  return pantheon;
}

// ============================================================================
// Religion System Class
// ============================================================================

export class ReligionSystem {
  private state: ReligionWorldState;
  private worldRegions: Map<string, WorldRegion>;

  constructor() {
    this.state = {
      deities: new Map(),
      sacredPlaces: new Map(),
      clergy: new Map(),
      orders: new Map(),
      conflicts: new Map(),
      regionalDominance: new Map(),
      festivalSchedule: [],
      miracleCooldowns: new Map(),
    };
    this.worldRegions = new Map();
  }

  initialize(worldRegions: Map<string, WorldRegion>): void {
    this.worldRegions = worldRegions;
    
    // Generate default pantheon
    const pantheon = generateDefaultPantheon();
    pantheon.forEach(deity => {
      this.state.deities.set(deity.id, deity);
    });

    // Generate initial sacred places
    this.generateInitialSacredPlaces();

    // Generate initial religious orders
    this.generateInitialOrders();

    // Schedule festivals for current year
    this.scheduleFestivals(0);
  }

  private generateInitialSacredPlaces(): void {
    const deityArray = Array.from(this.state.deities.values());
    
    this.worldRegions.forEach((region, regionId) => {
      // Each region gets 1-3 sacred places
      const numPlaces = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numPlaces; i++) {
        const deity = deityArray[Math.floor(Math.random() * deityArray.length)];
        const types: SacredPlace['type'][] = ['temple', 'shrine', 'grove', 'cave', 'spring'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const sacredPlace: SacredPlace = {
          id: uuidv4(),
          name: `${deity.name}'s ${type === 'grove' ? 'Sacred Grove' : type === 'shrine' ? 'Wayside Shrine' : 'Temple'}`,
          type,
          deityIds: [deity.id],
          coordinates: {
            x: Math.floor(Math.random() * region.width),
            y: Math.floor(Math.random() * region.height),
          },
          regionId,
          holiness: Math.floor(Math.random() * 50) + 50,
          pilgrimageDestination: Math.random() > 0.7,
          miraclesReported: [],
          guardians: [],
          accessibility: Math.random() > 0.8 ? 'restricted' : Math.random() > 0.9 ? 'secret' : 'public',
          architecturalStyle: this.getArchitecturalStyle(type, deity),
        };
        
        this.state.sacredPlaces.set(sacredPlace.id, sacredPlace);
      }
    });
  }

  private getArchitecturalStyle(type: SacredPlace['type'], deity: Deity): string {
    if (type === 'grove') return 'Natural';
    if (type === 'cave') return 'Carved';
    if (type === 'spring') return 'Classical';
    
    switch (deity.alignment) {
      case 'benevolent': return 'Ornate and welcoming';
      case 'strict': return 'Imposing and geometric';
      case 'mysterious': return 'Enigmatic with hidden chambers';
      default: return 'Traditional';
    }
  }

  private generateInitialOrders(): void {
    const deityArray = Array.from(this.state.deities.values());
    
    deityArray.forEach(deity => {
      const order: ReligiousOrder = {
        id: uuidv4(),
        name: `Order of ${deity.title.replace('The ', '')}`,
        primaryDeity: deity.id,
        alliedDeities: deity.relationships
          .filter(r => r.relationship === 'ally')
          .map(r => r.deityId),
        headquarters: '', // Will be set to a sacred place
        members: [],
        ranks: ['acolyte', 'priest', 'high_priest', 'bishop'],
        vows: deity.dogmas.filter(d => d.importance === 'core').map(d => d.name),
        activities: ['worship', 'charity', 'education', 'rituals'],
        wealth: Math.floor(Math.random() * 10000) + 1000,
        influence: Math.floor(Math.random() * 50) + 25,
        territories: [],
        enemies: [],
        allies: [],
      };

      // Assign headquarters
      const sacredPlaces = Array.from(this.state.sacredPlaces.values())
        .filter(sp => sp.deityIds.includes(deity.id));
      if (sacredPlaces.length > 0) {
        order.headquarters = sacredPlaces[0].id;
      }

      this.state.orders.set(order.id, order);
    });
  }

  private scheduleFestivals(currentYear: number): void {
    this.state.festivalSchedule = [];
    
    this.state.deities.forEach(deity => {
      deity.festivals.forEach(festival => {
        const event: FestivalEvent = {
          id: uuidv4(),
          festivalId: festival.id,
          deityId: deity.id,
          location: '', // Will be filled based on region
          startDate: this.getFestivalDays(festival.season, festival.dayRange[0]),
          endDate: this.getFestivalDays(festival.season, festival.dayRange[1]),
          participants: [],
          completed: false,
        };
        
        this.state.festivalSchedule.push(event);
      });
    });
  }

  private getFestivalDays(season: string, dayInSeason: number): number {
    const seasonStarts: Record<string, number> = {
      'spring': 0,
      'summer': 90,
      'autumn': 180,
      'winter': 270,
    };
    return seasonStarts[season] + dayInSeason;
  }

  // ========================================================================
  // NPC Religion Management
  // ========================================================================

  getOrCreateReligiousAffiliation(npc: NPC): ReligiousAffiliation {
    if (!npc.religiousAffiliation) {
      npc.religiousAffiliation = {
        primaryDeity: null,
        devotion: 0,
        secondaryDeities: [],
        orderMembership: null,
        personalDogmas: [],
        violatedTaboos: [],
        lastRitualDate: null,
        pilgrimageHistory: [],
      };
    }
    return npc.religiousAffiliation;
  }

  assignDeityToNPC(npc: NPC, deityId: string, reason: string = 'personal_choice'): void {
    const affiliation = this.getOrCreateReligiousAffiliation(npc);
    const deity = this.state.deities.get(deityId);
    
    if (!deity) {
      console.warn(`Deity ${deityId} not found`);
      return;
    }

    // Check compatibility based on NPC personality and background
    if (!this.isDeityCompatible(npc, deity)) {
      console.log(`${npc.name} is not compatible with ${deity.name}`);
      return;
    }

    affiliation.primaryDeity = deityId;
    affiliation.devotion = 20; // Starting devotion
    
    // Add core dogmas as personal dogmas
    deity.dogmas
      .filter(d => d.importance === 'core')
      .forEach(d => {
        if (!affiliation.personalDogmas.includes(d.name)) {
          affiliation.personalDogmas.push(d.name);
        }
      });

    console.log(`${npc.name} has embraced ${deity.name}: ${reason}`);
  }

  private isDeityCompatible(npc: NPC, deity: Deity): boolean {
    // Simplified compatibility check
    // In full implementation, this would consider:
    // - NPC personality traits
    // - NPC background and culture
    // - NPC profession
    // - Existing religious affiliations
    
    const favorableDomains = ['family', 'craft', 'trade', 'harvest'];
    const conflictingDomains = ['death', 'war', 'chaos'];
    
    if (npc.age < 18 && deity.domains.includes('death')) {
      return false; // Young NPCs rarely choose death deities
    }
    
    if (npc.profession === 'farmer' && deity.domains.includes('harvest')) {
      return true; // Farmers naturally drawn to harvest deities
    }
    
    if (npc.profession === 'soldier' && deity.domains.includes('war')) {
      return true; // Soldiers often worship war deities
    }

    return true; // Default to compatible
  }

  modifyDevotion(npc: NPC, amount: number, reason: string): void {
    const affiliation = this.getOrCreateReligiousAffiliation(npc);
    
    if (!affiliation.primaryDeity) {
      return;
    }

    const oldDevotion = affiliation.devotion;
    affiliation.devotion = Math.max(0, Math.min(100, affiliation.devotion + amount));
    
    if (affiliation.devotion >= 100 && oldDevotion < 100) {
      console.log(`${npc.name} has become a devout follower!`);
      this.onMaxDevotion(npc);
    } else if (affiliation.devotion <= 0 && oldDevotion > 0) {
      console.log(`${npc.name} has abandoned their faith.`);
      affiliation.primaryDeity = null;
      affiliation.personalDogmas = [];
      affiliation.orderMembership = null;
    }
  }

  private onMaxDevotion(npc: NPC): void {
    // Grant special blessings or abilities
    // Could trigger quests, miracles, or transformation
  }

  violateTaboo(npc: NPC, tabooId: string): void {
    const affiliation = this.getOrCreateReligiousAffiliation(npc);
    
    if (!affiliation.primaryDeity) {
      return;
    }

    const deity = this.state.deities.get(affiliation.primaryDeity);
    if (!deity) return;

    const taboo = deity.taboos.find(t => t.id === tabooId);
    if (!taboo) return;

    if (!affiliation.violatedTaboos.includes(tabooId)) {
      affiliation.violatedTaboos.push(tabooId);
      
      // Apply consequences based on severity
      this.applyTabooConsequences(npc, taboo);
      
      // Reduce devotion
      const devotionLoss = {
        'minor': 5,
        'moderate': 15,
        'major': 30,
        'cardinal': 100,
      }[taboo.severity];
      
      this.modifyDevotion(npc, -devotionLoss, `Violated taboo: ${taboo.name}`);
    }
  }

  private applyTabooConsequences(npc: NPC, taboo: Taboo): void {
    console.log(`${npc.name} suffered consequences for violating ${taboo.name}: ${taboo.consequence}`);
    // In full implementation, apply actual game effects
  }

  performRitual(npc: NPC, ritualId: string, location: string): boolean {
    const affiliation = this.getOrCreateReligiousAffiliation(npc);
    
    if (!affiliation.primaryDeity) {
      return false;
    }

    const deity = this.state.deities.get(affiliation.primaryDeity);
    if (!deity) return false;

    const ritual = deity.rituals.find(r => r.id === ritualId);
    if (!ritual) return false;

    // Check if NPC or local clergy can perform ritual
    const clergyMember = this.state.clergy.get(npc.id);
    if (clergyMember && clergyMember.rank === 'acolyte' && ritual.minClergyLevel > 0) {
      // Need higher level clergy
      return false;
    }

    // Perform ritual
    affiliation.lastRitualDate = Date.now();
    this.modifyDevotion(npc, 5, `Performed ritual: ${ritual.name}`);
    
    console.log(`${npc.name} performed ${ritual.name} at ${location}`);
    return true;
  }

  // ========================================================================
  // Clergy System
  // ========================================================================

  ordainClergy(npc: NPC, deityId: string, rank: ClergyMember['rank']): void {
    const affiliation = this.getOrCreateReligiousAffiliation(npc);
    
    if (affiliation.primaryDeity !== deityId) {
      console.warn(`${npc.name} tries to serve a deity they don't follow`);
      return;
    }

    const clergyMember: ClergyMember = {
      npcId: npc.id,
      deityId,
      rank,
      specialization: [],
      piety: Math.floor(Math.random() * 30) + 70,
      divineFavor: 50,
      knownRituals: [],
      sermons: [],
      conversions: 0,
      miraclesPerformed: 0,
    };

    // Learn basic rituals
    const deity = this.state.deities.get(deityId);
    if (deity) {
      clergyMember.knownRituals = deity.rituals
        .filter(r => r.minClergyLevel === 0)
        .map(r => r.id);
    }

    this.state.clergy.set(npc.id, clergyMember);
    console.log(`${npc.name} ordained as ${rank} of ${deity?.name}`);
  }

  promoteClergy(npcId: string): void {
    const clergyMember = this.state.clergy.get(npcId);
    if (!clergyMember) return;

    const rankOrder: ClergyMember['rank'][] = [
      'acolyte', 'priest', 'high_priest', 'bishop', 'archbishop', 'pontiff'
    ];
    
    const currentIndex = rankOrder.indexOf(clergyMember.rank);
    if (currentIndex < rankOrder.length - 1 && clergyMember.piety >= 80) {
      clergyMember.rank = rankOrder[currentIndex + 1];
      console.log(`${npcId} promoted to ${clergyMember.rank}`);
    }
  }

  deliverSermon(npcId: string, topic: string, audience: number): void {
    const clergyMember = this.state.clergy.get(npcId);
    if (!clergyMember) return;

    const sermon: Sermon = {
      id: uuidv4(),
      topic,
      date: Date.now(),
      audience,
      impact: Math.floor(Math.random() * 60) - 30, // -30 to +30
    };

    clergyMember.sermons.push(sermon);
    
    // Affect audience devotion
    if (sermon.impact > 0) {
      // Would need to track audience NPCs in full implementation
    }
  }

  // ========================================================================
  // Religious Orders
  // ========================================================================

  joinOrder(npcId: string, orderId: string): boolean {
    const order = this.state.orders.get(orderId);
    if (!order) return false;

    // Check if already a member
    if (order.members.includes(npcId)) {
      return false;
    }

    order.members.push(npcId);
    console.log(`${npcId} joined ${order.name}`);
    return true;
  }

  leaveOrder(npcId: string, orderId: string): void {
    const order = this.state.orders.get(orderId);
    if (!order) return;

    order.members = order.members.filter(id => id !== npcId);
    console.log(`${npcId} left ${order.name}`);
  }

  // ========================================================================
  // Sacred Places & Pilgrimages
  // ========================================================================

  visitSacredPlace(npcId: string, sacredPlaceId: string): void {
    const sacredPlace = this.state.sacredPlaces.get(sacredPlaceId);
    if (!sacredPlace) return;

    // Find NPC's religious affiliation
    // This would require an NPC manager in full implementation
    console.log(`${npcId} visited ${sacredPlace.name}`);

    // Add to pilgrimage history if tracked
    // Increase holiness slightly through visits
    sacredPlace.holiness = Math.min(100, sacredPlace.holiness + 1);
  }

  reportMiracle(sacredPlaceId: string, description: string, reporterId: string, witnesses: number): void {
    const sacredPlace = this.state.sacredPlaces.get(sacredPlaceId);
    if (!sacredPlace) return;

    const miracle: MiracleReport = {
      id: uuidv4(),
      description,
      reportedBy: reporterId,
      date: Date.now(),
      verified: false,
      witnesses,
    };

    sacredPlace.miraclesReported.push(miracle);
    
    // Increase holiness significantly
    sacredPlace.holiness = Math.min(100, sacredPlace.holiness + 10);
    
    console.log(`Miracle reported at ${sacredPlace.name}: ${description}`);
  }

  // ========================================================================
  // Religious Conflicts
  // ========================================================================

  startConflict(
    type: ReligiousConflictType,
    orderIds: string[],
    regionIds: string[],
    deityIds: string[]
  ): ReligiousConflict {
    const conflict: ReligiousConflict = {
      id: uuidv4(),
      type,
      parties: {
        orderIds,
        regionIds,
        deityIds,
      },
      startDate: Date.now(),
      intensity: 50,
      casualties: 0,
      territoriesAffected: regionIds,
      resolution: null,
      endDate: null,
    };

    this.state.conflicts.set(conflict.id, conflict);
    console.log(`Religious conflict started: ${type}`);
    
    return conflict;
  }

  escalateConflict(conflictId: string, amount: number): void {
    const conflict = this.state.conflicts.get(conflictId);
    if (!conflict) return;

    conflict.intensity = Math.min(100, conflict.intensity + amount);
    
    if (conflict.intensity >= 80) {
      console.warn(`Conflict ${conflictId} escalating to holy war!`);
      conflict.type = 'holy_war';
    }
  }

  resolveConflict(conflictId: string, resolution: string): void {
    const conflict = this.state.conflicts.get(conflictId);
    if (!conflict) return;

    conflict.resolution = resolution;
    conflict.endDate = Date.now();
    conflict.intensity = 0;
    
    console.log(`Conflict ${conflictId} resolved: ${resolution}`);
  }

  // ========================================================================
  // Regional Influence
  // ========================================================================

  updateRegionalDominance(regionId: string): void {
    // Calculate which deities are most worshipped in region
    const deityWorship = new Map<string, number>();
    
    // Count sacred places
    this.state.sacredPlaces.forEach(place => {
      if (place.regionId === regionId) {
        place.deityIds.forEach(deityId => {
          deityWorship.set(deityId, (deityWorship.get(deityId) || 0) + place.holiness);
        });
      }
    });

    // Count clergy
    this.state.clergy.forEach(clergy => {
      // Would need region info for NPC in full implementation
      deityWorship.set(clergy.deityId, (deityWorship.get(clergy.deityId) || 0) + 10);
    });

    // Determine dominant deities (top 2)
    const sorted = Array.from(deityWorship.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);

    this.state.regionalDominance.set(regionId, sorted);
  }

  // ========================================================================
  // Festival Management
  // ========================================================================

  celebrateFestival(eventId: string, location: string, participants: string[]): void {
    const event = this.state.festivalSchedule.find(e => e.id === eventId);
    if (!event || event.completed) return;

    event.location = location;
    event.participants = participants;
    event.completed = true;

    console.log(`Festival celebrated: ${eventId} with ${participants.length} participants`);

    // Grant blessings to participants
    // Would affect NPCs in full implementation
  }

  // ========================================================================
  // Architecture Influence
  // ========================================================================

  getPreferredArchitecture(deityId: string, buildingType: string): string {
    const deity = this.state.deities.get(deityId);
    if (!deity) return 'traditional';

    const styles: Record<string, string> = {
      'temple': this.getArchitecturalStyle('temple', deity),
      'shrine': this.getArchitecturalStyle('shrine', deity),
      'house': deity.alignment === 'benevolent' ? 'welcoming' : 'modest',
      'fortress': deity.domains.includes('war') ? 'imposing' : 'practical',
      'market': deity.domains.includes('trade') ? 'ornate' : 'functional',
    };

    return styles[buildingType] || 'traditional';
  }

  // ========================================================================
  // State Management
  // ========================================================================

  getState(): ReligionWorldState {
    return this.state;
  }

  serialize(): string {
    const serializable = {
      deities: Array.from(this.state.deities.entries()),
      sacredPlaces: Array.from(this.state.sacredPlaces.entries()),
      clergy: Array.from(this.state.clergy.entries()),
      orders: Array.from(this.state.orders.entries()),
      conflicts: Array.from(this.state.conflicts.entries()),
      regionalDominance: Array.from(this.state.regionalDominance.entries()),
      festivalSchedule: this.state.festivalSchedule,
      miracleCooldowns: Array.from(this.state.miracleCooldowns.entries()),
    };
    return JSON.stringify(serializable);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    
    this.state.deities = new Map(parsed.deities);
    this.state.sacredPlaces = new Map(parsed.sacredPlaces);
    this.state.clergy = new Map(parsed.clergy);
    this.state.orders = new Map(parsed.orders);
    this.state.conflicts = new Map(parsed.conflicts);
    this.state.regionalDominance = new Map(parsed.regionalDominance);
    this.state.festivalSchedule = parsed.festivalSchedule;
    this.state.miracleCooldowns = new Map(parsed.miracleCooldowns);
  }
}

// Export singleton instance
export const religionSystem = new ReligionSystem();
