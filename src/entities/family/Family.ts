/**
 * Этап 12: FAMILY + GENEALOGY
 * Базовый класс Семья
 */

import { FamilySecret, FamilyEvent, FamilyAsset, FamilyDebt, FamilyRelationship } from './FamilyTypes';

export interface FamilyData {
  id: string;
  version: number;
  name: string;
  surname?: string;
  
  // Members
  memberIds: string[]; // NPC IDs
  parentFamilyId?: string; // Parent family (for nobility dynasties)
  
  // Social status
  profession?: string;
  socialClass: 'nobility' | 'merchant' | 'craftsman' | 'peasant' | 'outcast';
  
  // Property
  residence?: {
    buildingId: string;
    settlementId: string;
  };
  assets: FamilyAsset[];
  debts: FamilyDebt[];
  
  // Relationships
  alliedFamilies: string[]; // Family IDs
  rivalFamilies: string[]; // Family IDs
  relationshipsWithOthers: Map<string, FamilyRelationship>; // Other families
  
  // Secrets and history
  secrets: FamilySecret[];
  history: FamilyEvent[];
  
  // Metadata
  foundedAt: number; // Game timestamp
  cultureId: string;
  religionId?: string;
  reputation: number; // -100 to 100
  isExtinct: boolean;
  
  // Debug
  debugInfo?: {
    generationSeed: string;
    createdAt: string;
  };
}

export class Family {
  public readonly id: string;
  public version: number = 1;
  public name: string;
  public surname?: string;
  
  // Members
  public memberIds: string[] = [];
  public parentFamilyId?: string;
  
  // Social status
  public profession?: string;
  public socialClass: 'nobility' | 'merchant' | 'craftsman' | 'peasant' | 'outcast';
  
  // Property
  public residence?: { buildingId: string; settlementId: string };
  public assets: FamilyAsset[] = [];
  public debts: FamilyDebt[] = [];
  
  // Relationships
  public alliedFamilies: string[] = [];
  public rivalFamilies: string[] = [];
  public relationshipsWithOthers: Map<string, FamilyRelationship> = new Map();
  
  // Secrets and history
  public secrets: FamilySecret[] = [];
  public history: FamilyEvent[] = [];
  
  // Metadata
  public foundedAt: number;
  public cultureId: string;
  public religionId?: string;
  public reputation: number = 0;
  public isExtinct: boolean = false;
  
  // Debug
  public debugInfo?: {
    generationSeed: string;
    createdAt: string;
  };

  constructor(data: Partial<FamilyData> & { id: string; name: string; cultureId: string }) {
    this.id = data.id;
    this.name = data.name;
    this.surname = data.surname;
    this.cultureId = data.cultureId;
    this.religionId = data.religionId;
    this.socialClass = data.socialClass || 'peasant';
    this.foundedAt = data.foundedAt || 0;
    
    if (data.memberIds) this.memberIds = data.memberIds;
    if (data.parentFamilyId) this.parentFamilyId = data.parentFamilyId;
    if (data.profession) this.profession = data.profession;
    if (data.residence) this.residence = data.residence;
    if (data.assets) this.assets = data.assets;
    if (data.debts) this.debts = data.debts;
    if (data.alliedFamilies) this.alliedFamilies = data.alliedFamilies;
    if (data.rivalFamilies) this.rivalFamilies = data.rivalFamilies;
    if (data.relationshipsWithOthers) {
      this.relationshipsWithOthers = new Map(data.relationshipsWithOthers);
    }
    if (data.secrets) this.secrets = data.secrets;
    if (data.history) this.history = data.history;
    if (data.reputation !== undefined) this.reputation = data.reputation;
    if (data.isExtinct !== undefined) this.isExtinct = data.isExtinct;
    if (data.debugInfo) this.debugInfo = data.debugInfo;
  }

  addMember(npcId: string): void {
    if (!this.memberIds.includes(npcId)) {
      this.memberIds.push(npcId);
    }
  }

  removeMember(npcId: string): void {
    this.memberIds = this.memberIds.filter(id => id !== npcId);
    if (this.memberIds.length === 0) {
      this.isExtinct = true;
    }
  }

  addEvent(event: FamilyEvent): void {
    this.history.push(event);
  }

  addSecret(secret: FamilySecret): void {
    this.secrets.push(secret);
  }

  addAsset(asset: FamilyAsset): void {
    this.assets.push(asset);
  }

  addDebt(debt: FamilyDebt): void {
    this.debts.push(debt);
  }

  setRelationship(familyId: string, opinion: number, trustLevel: number): void {
    this.relationshipsWithOthers.set(familyId, {
      familyId,
      opinion,
      trustLevel,
      lastInteraction: Date.now(),
    });
  }

  getTotalWealth(): number {
    const assetValue = this.assets.reduce((sum, asset) => sum + asset.value, 0);
    const debtValue = this.debts.reduce((sum, debt) => sum + debt.amount, 0);
    return assetValue - debtValue;
  }

  serialize(): FamilyData {
    return {
      id: this.id,
      version: this.version,
      name: this.name,
      surname: this.surname,
      memberIds: [...this.memberIds],
      parentFamilyId: this.parentFamilyId,
      profession: this.profession,
      socialClass: this.socialClass,
      residence: this.residence,
      assets: [...this.assets],
      debts: [...this.debts],
      alliedFamilies: [...this.alliedFamilies],
      rivalFamilies: [...this.rivalFamilies],
      relationshipsWithOthers: new Map(this.relationshipsWithOthers),
      secrets: [...this.secrets],
      history: [...this.history],
      foundedAt: this.foundedAt,
      cultureId: this.cultureId,
      religionId: this.religionId,
      reputation: this.reputation,
      isExtinct: this.isExtinct,
      debugInfo: this.debugInfo,
    };
  }

  static deserialize(data: FamilyData): Family {
    return new Family({
      id: data.id,
      name: data.name,
      surname: data.surname,
      memberIds: data.memberIds,
      parentFamilyId: data.parentFamilyId,
      profession: data.profession,
      socialClass: data.socialClass,
      residence: data.residence,
      assets: data.assets,
      debts: data.debts,
      alliedFamilies: data.alliedFamilies,
      rivalFamilies: data.rivalFamilies,
      relationshipsWithOthers: data.relationshipsWithOthers,
      secrets: data.secrets,
      history: data.history,
      foundedAt: data.foundedAt,
      cultureId: data.cultureId,
      religionId: data.religionId,
      reputation: data.reputation,
      isExtinct: data.isExtinct,
      debugInfo: data.debugInfo,
    });
  }
}
