/**
 * Race System - Defines biological and cultural traits for different races
 */

export interface RaceTraits {
  // Biological traits
  heightRange: { min: number; max: number }; // in cm
  lifespan: { min: number; max: number }; // in years
  maturationSpeed: number; // multiplier (1.0 = human baseline)
  adultAge: number; // age when considered adult
  
  // Physical features
  physicalFeatures: string[];
  sensoryOrgans: {
    vision: 'normal' | 'darkvision' | 'blindsight' | 'truesight';
    hearing: 'normal' | 'enhanced' | 'diminished';
    smell: 'normal' | 'enhanced' | 'diminished';
  };
  
  // Abilities and resistances
  innateAbilities: string[];
  resistances: {
    fire?: number; // percentage
    cold?: number;
    poison?: number;
    disease?: number;
    magic?: number;
    physical?: number;
    pain?: number;
    fear?: number;
    charm?: number;
  };
  
  // Cultural traits
  culturalTraditions: string[];
  typicalProfessions: string[];
  language: string;
  dialects: string[];
  
  // Social aspects
  familyStructure: 'patriarchal' | 'matriarchal' | 'egalitarian' | 'clan-based' | 'tribal';
  religionAffinity: string[];
  relationsWithOtherCultures: Record<string, 'friendly' | 'neutral' | 'hostile' | 'allied'>;
}

export interface Race {
  id: string;
  version: string;
  name: string;
  singularName: string;
  pluralName: string;
  adjective: string;
  
  traits: RaceTraits;
  
  // Debug info
  debugInfo: {
    createdAt: number;
    seed: string;
  };
}

/**
 * Default races for the game world
 */
export const DEFAULT_RACES: Race[] = [
  {
    id: 'race_human',
    version: '1.0.0',
    name: 'Human',
    singularName: 'Human',
    pluralName: 'Humans',
    adjective: 'Human',
    traits: {
      heightRange: { min: 150, max: 200 },
      lifespan: { min: 60, max: 100 },
      maturationSpeed: 1.0,
      adultAge: 18,
      physicalFeatures: ['varied skin tones', 'varied hair colors', 'versatile build'],
      sensoryOrgans: {
        vision: 'normal',
        hearing: 'normal',
        smell: 'normal',
      },
      innateAbilities: ['adaptability', 'diplomacy bonus'],
      resistances: {
        disease: 10,
      },
      culturalTraditions: ['trade', 'diplomacy', 'innovation', 'exploration'],
      typicalProfessions: ['merchant', 'soldier', 'diplomat', 'craftsman', 'farmer', 'scholar'],
      language: 'Common',
      dialects: ['Northern Common', 'Southern Common', 'Eastern Common', 'Western Common'],
      familyStructure: 'egalitarian',
      religionAffinity: ['any'],
      relationsWithOtherCultures: {
        'race_elf': 'friendly',
        'race_dwarf': 'friendly',
        'race_orc': 'neutral',
        'race_halfling': 'friendly',
      },
    },
    debugInfo: {
      createdAt: Date.now(),
      seed: 'human_default',
    },
  },
  {
    id: 'race_elf',
    version: '1.0.0',
    name: 'Elf',
    singularName: 'Elf',
    pluralName: 'Elves',
    adjective: 'Elven',
    traits: {
      heightRange: { min: 160, max: 190 },
      lifespan: { min: 200, max: 400 },
      maturationSpeed: 0.3,
      adultAge: 50,
      physicalFeatures: ['pointed ears', 'slender build', 'graceful movement', 'ageless appearance'],
      sensoryOrgans: {
        vision: 'darkvision',
        hearing: 'enhanced',
        smell: 'normal',
      },
      innateAbilities: ['longevity', 'nature affinity', 'magic sensitivity', 'enhanced reflexes'],
      resistances: {
        magic: 25,
        poison: 15,
        disease: 20,
      },
      culturalTraditions: ['nature worship', 'artistic expression', 'ancient lore', 'archery'],
      typicalProfessions: ['ranger', 'mage', 'artisan', 'hunter', 'lorekeeper', 'druid'],
      language: 'Elvish',
      dialects: ['High Elvish', 'Wood Elvish', 'Sea Elvish'],
      familyStructure: 'clan-based',
      religionAffinity: ['nature gods', 'moon deities', 'star spirits'],
      relationsWithOtherCultures: {
        'race_human': 'friendly',
        'race_dwarf': 'neutral',
        'race_orc': 'hostile',
        'race_halfling': 'friendly',
      },
    },
    debugInfo: {
      createdAt: Date.now(),
      seed: 'elf_default',
    },
  },
  {
    id: 'race_dwarf',
    version: '1.0.0',
    name: 'Dwarf',
    singularName: 'Dwarf',
    pluralName: 'Dwarves',
    adjective: 'Dwarven',
    traits: {
      heightRange: { min: 120, max: 150 },
      lifespan: { min: 150, max: 300 },
      maturationSpeed: 0.5,
      adultAge: 40,
      physicalFeatures: ['stocky build', 'beards (males)', 'strong constitution', 'short stature'],
      sensoryOrgans: {
        vision: 'darkvision',
        hearing: 'normal',
        smell: 'enhanced',
      },
      innateAbilities: ['stonecunning', 'craft mastery', 'sturdy constitution', 'underground navigation'],
      resistances: {
        poison: 30,
        disease: 25,
        physical: 15,
      },
      culturalTraditions: ['mining', 'metalworking', 'stonemasonry', 'clan loyalty', 'ancestral worship'],
      typicalProfessions: ['miner', 'blacksmith', 'engineer', 'warrior', 'gemcutter', 'brewer'],
      language: 'Dwarvish',
      dialects: ['Mountain Dwarvish', 'Hill Dwarvish', 'Deep Dwarvish'],
      familyStructure: 'clan-based',
      religionAffinity: ['earth gods', 'forge deities', 'ancestor spirits'],
      relationsWithOtherCultures: {
        'race_human': 'friendly',
        'race_elf': 'neutral',
        'race_orc': 'hostile',
        'race_halfling': 'friendly',
      },
    },
    debugInfo: {
      createdAt: Date.now(),
      seed: 'dwarf_default',
    },
  },
  {
    id: 'race_orc',
    version: '1.0.0',
    name: 'Orc',
    singularName: 'Orc',
    pluralName: 'Orcs',
    adjective: 'Orcish',
    traits: {
      heightRange: { min: 170, max: 220 },
      lifespan: { min: 40, max: 60 },
      maturationSpeed: 1.5,
      adultAge: 14,
      physicalFeatures: ['muscular build', 'tusks', 'green/gray skin', 'powerful physique'],
      sensoryOrgans: {
        vision: 'normal',
        hearing: 'enhanced',
        smell: 'enhanced',
      },
      innateAbilities: ['berserker rage', 'intimidation', 'rapid healing', 'strength bonus'],
      resistances: {
        physical: 20,
        pain: 30,
      },
      culturalTraditions: ['combat prowess', 'tribal loyalty', 'honor codes', 'raiding'],
      typicalProfessions: ['warrior', 'hunter', 'shaman', 'raider', 'beast tamer'],
      language: 'Orcish',
      dialects: ['Mountain Orcish', 'Plains Orcish', 'Jungle Orcish'],
      familyStructure: 'tribal',
      religionAffinity: ['war gods', 'spirit ancestors', 'nature spirits'],
      relationsWithOtherCultures: {
        'race_human': 'neutral',
        'race_elf': 'hostile',
        'race_dwarf': 'hostile',
        'race_halfling': 'neutral',
      },
    },
    debugInfo: {
      createdAt: Date.now(),
      seed: 'orc_default',
    },
  },
  {
    id: 'race_halfling',
    version: '1.0.0',
    name: 'Halfling',
    singularName: 'Halfling',
    pluralName: 'Halflings',
    adjective: 'Halfling',
    traits: {
      heightRange: { min: 80, max: 110 },
      lifespan: { min: 80, max: 120 },
      maturationSpeed: 1.2,
      adultAge: 20,
      physicalFeatures: ['small stature', 'agile build', 'large feet', 'youthful appearance'],
      sensoryOrgans: {
        vision: 'normal',
        hearing: 'enhanced',
        smell: 'normal',
      },
      innateAbilities: ['luck', 'stealth', 'acrobatics', 'charm'],
      resistances: {
        fear: 30,
        charm: 20,
      },
      culturalTraditions: ['community gatherings', 'agriculture', 'storytelling', 'comfort seeking'],
      typicalProfessions: ['farmer', 'cook', 'thief', 'merchant', 'innkeeper', 'gardener'],
      language: 'Halfling',
      dialects: ['Lightfoot Halfling', 'Stout Halfling', 'Hairfoot Halfling'],
      familyStructure: 'egalitarian',
      religionAffinity: ['hearth deities', 'harvest gods', 'travel spirits'],
      relationsWithOtherCultures: {
        'race_human': 'friendly',
        'race_elf': 'friendly',
        'race_dwarf': 'friendly',
        'race_orc': 'neutral',
      },
    },
    debugInfo: {
      createdAt: Date.now(),
      seed: 'halfling_default',
    },
  },
];

/**
 * Get race by ID
 */
export function getRaceById(id: string): Race | undefined {
  return DEFAULT_RACES.find(race => race.id === id);
}

/**
 * Get random race based on seed
 */
export function getRandomRace(seed: string): Race {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % DEFAULT_RACES.length;
  return DEFAULT_RACES[index];
}

/**
 * Calculate effective age for a race
 */
export function calculateEffectiveAge(race: Race, chronologicalAge: number): number {
  return chronologicalAge * race.traits.maturationSpeed;
}

/**
 * Check if character is adult for their race
 */
export function isAdult(race: Race, age: number): boolean {
  return age >= race.traits.adultAge;
}

/**
 * Get life stage for a character of given race and age
 */
export function getLifeStage(race: Race, age: number): 'child' | 'young' | 'adult' | 'middle-aged' | 'elderly' {
  const { lifespan, adultAge } = race.traits;
  const youngAdultAge = Math.floor(adultAge * 1.2);
  const middleAge = Math.floor((lifespan.min + lifespan.max) / 2 * 0.6);
  const elderlyAge = Math.floor((lifespan.min + lifespan.max) / 2 * 0.8);

  if (age < adultAge) return 'child';
  if (age < youngAdultAge) return 'young';
  if (age < middleAge) return 'adult';
  if (age < elderlyAge) return 'middle-aged';
  return 'elderly';
}

/**
 * Get resistance value for a specific damage type
 */
export function getResistance(race: Race, damageType: keyof RaceTraits['resistances']): number {
  return race.traits.resistances[damageType] || 0;
}

/**
 * Check if race has specific ability
 */
export function hasAbility(race: Race, ability: string): boolean {
  return race.traits.innateAbilities.includes(ability);
}

/**
 * Get relation status between two races
 */
export function getRaceRelation(race1: Race, race2Id: string): 'friendly' | 'neutral' | 'hostile' | 'allied' {
  return race1.traits.relationsWithOtherCultures[race2Id] || 'neutral';
}
