/**
 * Этап 12: FAMILY + GENEALOGY
 * Генератор семей для мира
 */

import { DeterministicRNG } from '../../core/random/DeterministicRNG';
import { Family } from '../../entities/family/Family';
import { FamilySecret, FamilyEvent, FamilyAsset } from '../../entities/family/FamilyTypes';

export interface FamilyGeneratorConfig {
  baseFamilySeed: string;
  cultureId: string;
  religionId?: string;
  settlementId: string;
  socialClassDistribution: {
    nobility: number;
    merchant: number;
    craftsman: number;
    peasant: number;
    outcast: number;
  };
}

export class FamilyGenerator {
  private config: FamilyGeneratorConfig;

  constructor(config: FamilyGeneratorConfig) {
    this.config = config;
  }

  generateFamilies(count: number): Family[] {
    const families: Family[] = [];
    const currentTime = Date.now();

    for (let i = 0; i < count; i++) {
      const family = this.generateSingleFamily(i, currentTime);
      families.push(family);
    }

    // Create dynasty relationships for nobility
    this.createDynastyRelationships(families);

    return families;
  }

  private generateSingleFamily(index: number, currentTime: number): Family {
    const familyRng = new DeterministicRNG(
      `${this.config.baseFamilySeed}_family_${index}`
    );

    const socialClass = this.selectSocialClass(familyRng);
    const surname = this.generateSurname(familyRng, socialClass);
    const profession = this.selectProfession(familyRng, socialClass);

    const foundedYearsAgo = familyRng.nextInt(1, socialClass === 'nobility' ? 500 : 100);
    const foundedAt = currentTime - foundedYearsAgo * 365 * 24 * 60 * 60 * 1000;

    const family = new Family({
      id: `family_${this.config.settlementId}_${index}`,
      name: surname,
      surname,
      cultureId: this.config.cultureId,
      religionId: this.config.religionId,
      socialClass,
      profession,
      foundedAt,
      debugInfo: {
        generationSeed: `${this.config.baseFamilySeed}_family_${index}`,
        createdAt: new Date().toISOString(),
      },
    });

    // Generate assets based on social class
    this.generateAssets(family, familyRng, socialClass);

    // Generate debts
    this.generateDebts(family, familyRng, socialClass);

    // Generate initial history events
    this.generateHistory(family, familyRng, foundedYearsAgo, currentTime);

    // Generate secrets for some families
    if (familyRng.nextFloat() < (socialClass === 'nobility' ? 0.7 : 0.2)) {
      this.generateSecrets(family, familyRng);
    }

    return family;
  }

  private selectSocialClass(rng: DeterministicRNG): Family['socialClass'] {
    const roll = rng.nextFloat();
    const dist = this.config.socialClassDistribution;

    if (roll < dist.nobility) return 'nobility';
    if (roll < dist.nobility + dist.merchant) return 'merchant';
    if (roll < dist.nobility + dist.merchant + dist.craftsman) return 'craftsman';
    if (roll < dist.nobility + dist.merchant + dist.craftsman + dist.peasant) return 'peasant';
    return 'outcast';
  }

  private generateSurname(rng: DeterministicRNG, socialClass: string): string {
    const noblePrefixes = ['Von', 'De', 'Van', 'Al', 'Mac', 'O\''];
    const commonPrefixes = ['Smith', 'Brown', 'Johnson', 'Williams', 'Jones'];
    const natureNames = ['Forest', 'River', 'Mountain', 'Field', 'Stone'];
    
    const baseName = rng.nextFloat() < 0.5 
      ? commonPrefixes[rng.nextInt(0, commonPrefixes.length - 1)]
      : natureNames[rng.nextInt(0, natureNames.length - 1)];

    if (socialClass === 'nobility' && rng.nextFloat() < 0.8) {
      const prefix = noblePrefixes[rng.nextInt(0, noblePrefixes.length - 1)];
      return `${prefix}${baseName}`;
    }

    return baseName;
  }

  private selectProfession(rng: DeterministicRNG, socialClass: string): string | undefined {
    const professions: Record<string, string[]> = {
      nobility: ['Lord', 'Lady', 'Knight', 'Governor', 'Ambassador'],
      merchant: ['Merchant', 'Trader', 'Shopkeeper', 'Banker'],
      craftsman: ['Blacksmith', 'Carpenter', 'Weaver', 'Potter', 'Baker'],
      peasant: ['Farmer', 'Herder', 'Laborer', 'Fisherman'],
      outcast: ['Beggar', 'Outlaw', 'Exile'],
    };

    const classProfessions = professions[socialClass] || professions.peasant;
    return classProfessions[rng.nextInt(0, classProfessions.length - 1)];
  }

  private generateAssets(family: Family, rng: DeterministicRNG, socialClass: string): void {
    const assetCount = rng.nextInt(1, socialClass === 'nobility' ? 10 : 3);
    
    for (let i = 0; i < assetCount; i++) {
      const typeRoll = rng.nextFloat();
      let type: FamilyAsset['type'] = 'money';
      
      if (typeRoll < 0.3) type = 'land';
      else if (typeRoll < 0.5) type = 'building';
      else if (typeRoll < 0.7) type = 'item';
      else if (typeRoll < 0.9) type = 'livestock';

      const baseValue = socialClass === 'nobility' ? 1000 : 100;
      const value = rng.nextInt(baseValue, baseValue * 10);

      family.addAsset({
        type,
        name: `${type}_${rng.nextInt(1, 9999)}`,
        value,
        description: `${type} asset of ${family.name} family`,
      });
    }
  }

  private generateDebts(family: Family, rng: DeterministicRNG, socialClass: string): void {
    // Nobility and merchants are more likely to have debts
    const debtChance = socialClass === 'nobility' ? 0.6 : socialClass === 'merchant' ? 0.4 : 0.1;
    
    if (rng.nextFloat() < debtChance) {
      const creditor = `creditor_${rng.nextInt(1, 100)}`;
      const amount = rng.nextInt(100, socialClass === 'nobility' ? 10000 : 1000);
      
      family.addDebt({
        creditor,
        amount,
        interestRate: rng.nextFloat() * 0.1,
        dueDate: Date.now() + rng.nextInt(30, 365) * 24 * 60 * 60 * 1000,
      });
    }
  }

  private generateHistory(
    family: Family, 
    rng: DeterministicRNG, 
    foundedYearsAgo: number, 
    currentTime: number
  ): void {
    const eventCount = Math.min(foundedYearsAgo / 10, 20);
    
    const eventTypes: FamilyEvent['type'][] = [
      'birth', 'death', 'marriage', 'wealth_change', 'migration'
    ];

    for (let i = 0; i < eventCount; i++) {
      const yearsAgo = rng.nextInt(0, foundedYearsAgo);
      const timestamp = currentTime - yearsAgo * 365 * 24 * 60 * 60 * 1000;
      const eventType = eventTypes[rng.nextInt(0, eventTypes.length - 1)];

      family.addEvent({
        id: `event_${family.id}_${i}`,
        type: eventType,
        timestamp,
        description: `${eventType} event in ${family.name} history`,
        participants: [],
      });
    }
  }

  private generateSecrets(family: Family, rng: DeterministicRNG): void {
    const secretCount = rng.nextInt(1, 3);
    const secretTypes: FamilySecret['type'][] = [
      'scandal', 'crime', 'illegitimate', 'debt', 'alliance', 'curse'
    ];

    for (let i = 0; i < secretCount; i++) {
      const type = secretTypes[rng.nextInt(0, secretTypes.length - 1)];
      
      family.addSecret({
        id: `secret_${family.id}_${i}`,
        type,
        description: `${type} secret of ${family.name} family`,
        knownBy: [],
      });
    }
  }

  private createDynastyRelationships(families: Family[]): void {
    const nobility = families.filter((f: any) => f.socialClass === 'nobility');
    
    // Create parent-child relationships between noble families
    for (let i = 1; i < nobility.length; i++) {
      if (nobility[i - 1]) {
        nobility[i].parentFamilyId = nobility[i - 1].id;
        nobility[i - 1].alliedFamilies.push(nobility[i].id);
      }
    }

    // Create rivalries
    for (const family of nobility) {
      const potentialRivals = nobility.filter((f: any) => f.id !== family.id);
      if (potentialRivals.length > 0 && Math.random() < 0.3) {
        const rival = potentialRivals[Math.floor(Math.random() * potentialRivals.length)];
        family.rivalFamilies.push(rival.id);
        rival.rivalFamilies.push(family.id);
      }
    }
  }
}
