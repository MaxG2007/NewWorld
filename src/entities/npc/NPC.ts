/**
 * Этап 11 — NPC CORE
 * Базовый класс NPC со всеми требуемыми полями
 */

import { Race } from '../../data/RaceSystem';
import { Culture, Family } from '../../data/CivilizationSchemas';
import { Item } from '../../data/ItemSchemas';

// Типы для системы NPC
export type NPCId = string;
export type TraitType = 
  | 'brave' | 'cowardly' 
  | 'kind' | 'cruel' 
  | 'honest' | 'deceitful' 
  | 'hardworking' | 'lazy'
  | 'generous' | 'greedy'
  | 'curious' | 'cautious'
  | 'ambitious' | 'content';

export type PersonalityTrait = {
  type: TraitType;
  value: number; // 0-100
};

export type NeedType = 'hunger' | 'thirst' | 'sleep' | 'social' | 'safety' | 'fun';

export type Need = {
  type: NeedType;
  value: number; // 0-100 (0 = критически низкая)
  decayRate: number; // насколько быстро уменьшается
};

export type MemoryEntry = {
  id: string;
  timestamp: number;
  type: 'event' | 'conversation' | 'observation' | 'relationship_change';
  description: string;
  involvedNPCs?: NPCId[];
  emotionalImpact: number; // -100 to 100
  importance: number; // 0-100
};

export type Relationship = {
  npcId: NPCId;
  value: number; // -100 (враг) to 100 (лучший друг)
  trust: number; // 0-100
  history: string[]; // ключевые события в отношениях
};

export type KnowledgeEntry = {
  id: string;
  type: 'location' | 'person' | 'event' | 'skill' | 'lore' | 'rumor';
  subject: string;
  details: Record<string, unknown>;
  confidence: number; // 0-100 (насколько уверен NPC в этой информации)
  source?: NPCId; // от кого получено знание
  acquiredAt: number;
};

export type ScheduleEntry = {
  startTime: number; // час дня (0-23)
  endTime: number;
  activity: 'sleep' | 'work' | 'eat' | 'socialize' | 'travel' | 'leisure' | 'prayer';
  location?: { x: number; y: number };
  priority: number; // 1-10
};

export type LegalStatus = {
  citizenship: string; // государство/город
  socialClass: string;
  titles: string[];
  crimes: Array<{
    crime: string;
    date: number;
    severity: number; // 1-10
    punished: boolean;
  }>;
  rights: string[];
  obligations: string[];
};

export type ReputationEntry = {
  group: string; // гильдия, семья, государство и т.д.
  value: number; // -100 to 100
  rank?: string;
  lastUpdated: number;
};

export type NPCHealth = {
  current: number;
  max: number;
  conditions: Array<{
    type: 'injury' | 'disease' | 'buff' | 'debuff';
    name: string;
    severity: number; // 1-10
    duration?: number; // в часах
    effects: Record<string, number>;
  }>;
};

export interface NPCData {
  id: NPCId;
  name: string;
  age: number;
  race: Race;
  culture: Culture;
  family?: Family;
  profession: string;
  location: { x: number; y: number; chunkId?: string };
  health: NPCHealth;
  needs: Need[];
  traits: PersonalityTrait[];
  personality: {
    bigFive: {
      openness: number; // 0-100
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    moralAlignment: {
      lawful: number; // 0-100
      good: number; // 0-100
    };
  };
  memory: MemoryEntry[];
  relationships: Map<NPCId, Relationship>;
  knowledge: Map<string, KnowledgeEntry>;
  inventory: Item[];
  schedule: ScheduleEntry[];
  legalStatus: LegalStatus;
  reputation: Map<string, ReputationEntry>;
  
  // Мета-данные
  version: string;
  createdAt: number;
  lastUpdated: number;
}

/**
 * Класс базового NPC
 */
export class NPC {
  public readonly id: NPCId;
  public name: string;
  public age: number;
  public race: Race;
  public culture: Culture;
  public family?: Family;
  public profession: string;
  public location: { x: number; y: number; chunkId?: string };
  public health: NPCHealth;
  public needs: Need[];
  public traits: PersonalityTrait[];
  public personality: {
    bigFive: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    moralAlignment: {
      lawful: number;
      good: number;
    };
  };
  public memory: MemoryEntry[];
  public relationships: Map<NPCId, Relationship>;
  public knowledge: Map<string, KnowledgeEntry>;
  public inventory: Item[];
  public schedule: ScheduleEntry[];
  public legalStatus: LegalStatus;
  public reputation: Map<string, ReputationEntry>;
  
  public readonly version: string = '1.0.0';
  public readonly createdAt: number;
  public lastUpdated: number;

  constructor(data: Omit<NPCData, 'version' | 'createdAt' | 'lastUpdated'>) {
    this.id = data.id;
    this.name = data.name;
    this.age = data.age;
    this.race = data.race;
    this.culture = data.culture;
    this.family = data.family;
    this.profession = data.profession;
    this.location = data.location;
    this.health = data.health;
    this.needs = data.needs;
    this.traits = data.traits;
    this.personality = data.personality;
    this.memory = data.memory;
    this.relationships = data.relationships || new Map();
    this.knowledge = data.knowledge || new Map();
    this.inventory = data.inventory || [];
    this.schedule = data.schedule || [];
    this.legalStatus = data.legalStatus;
    this.reputation = data.reputation || new Map();
    
    this.createdAt = Date.now();
    this.lastUpdated = this.createdAt;
  }

  /**
   * Сериализация NPC в JSON
   */
  toJSON(): NPCData {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      race: this.race,
      culture: this.culture,
      family: this.family,
      profession: this.profession,
      location: this.location,
      health: this.health,
      needs: this.needs,
      traits: this.traits,
      personality: this.personality,
      memory: this.memory,
      relationships: this.relationships,
      knowledge: this.knowledge,
      inventory: this.inventory,
      schedule: this.schedule,
      legalStatus: this.legalStatus,
      reputation: this.reputation,
      version: this.version,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
    };
  }

  /**
   * Десериализация NPC из JSON
   */
  static fromJSON(data: NPCData): NPC {
    const npc = new NPC({
      id: data.id,
      name: data.name,
      age: data.age,
      race: data.race,
      culture: data.culture,
      family: data.family,
      profession: data.profession,
      location: data.location,
      health: data.health,
      needs: data.needs,
      traits: data.traits,
      personality: data.personality,
      memory: data.memory,
      relationships: data.relationships || new Map(),
      knowledge: data.knowledge || new Map(),
      inventory: data.inventory || [],
      schedule: data.schedule || [],
      legalStatus: data.legalStatus,
      reputation: data.reputation || new Map(),
    });
    
    // Восстанавливаем Maps если они были сериализованы как объекты
    if (!(data.relationships instanceof Map)) {
      npc.relationships = new Map(Object.entries(data.relationships as any));
    }
    if (!(data.knowledge instanceof Map)) {
      npc.knowledge = new Map(Object.entries(data.knowledge as any));
    }
    if (!(data.reputation instanceof Map)) {
      npc.reputation = new Map(Object.entries(data.reputation as any));
    }
    
    return npc;
  }

  /**
   * Обновление временной метки
   */
  markUpdated(): void {
    this.lastUpdated = Date.now();
  }

  /**
   * Добавить воспоминание
   */
  addMemory(entry: Omit<MemoryEntry, 'id'>): void {
    const memory: MemoryEntry = {
      ...entry,
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.memory.push(memory);
    this.markUpdated();
  }

  /**
   * Обновить отношение с другим NPC
   */
  updateRelationship(npcId: NPCId, delta: number, trustDelta: number = 0): void {
    let rel = this.relationships.get(npcId);
    if (!rel) {
      rel = {
        npcId,
        value: 0,
        trust: 50,
        history: [],
      };
    }
    
    rel.value = Math.max(-100, Math.min(100, rel.value + delta));
    rel.trust = Math.max(0, Math.min(100, rel.trust + trustDelta));
    
    this.relationships.set(npcId, rel);
    this.markUpdated();
  }

  /**
   * Получить текущую потребность
   */
  getNeed(type: NeedType): Need | undefined {
    return this.needs.find(n => n.type === type);
  }

  /**
   * Обновить потребность
   */
  updateNeed(type: NeedType, value: number): void {
    const need = this.getNeed(type);
    if (need) {
      need.value = Math.max(0, Math.min(100, value));
    } else {
      this.needs.push({
        type,
        value: Math.max(0, Math.min(100, value)),
        decayRate: 0.5, // стандартная скорость уменьшения
      });
    }
    this.markUpdated();
  }

  /**
   * Проверить, может ли NPC выполнить действие berdasarkan потребностей
   */
  canPerformAction(requiredNeed?: NeedType, minValue: number = 20): boolean {
    if (!requiredNeed) return true;
    const need = this.getNeed(requiredNeed);
    return need ? need.value >= minValue : true;
  }

  /**
   * Получить текущее расписание
   */
  getCurrentSchedule(hour: number): ScheduleEntry | undefined {
    return this.schedule.find(s => hour >= s.startTime && hour < s.endTime);
  }

  /**
   * Добавить знание
   */
  addKnowledge(entry: Omit<KnowledgeEntry, 'id' | 'acquiredAt'>): void {
    const knowledge: KnowledgeEntry = {
      ...entry,
      id: `know_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      acquiredAt: Date.now(),
    };
    this.knowledge.set(knowledge.id, knowledge);
    this.markUpdated();
  }

  /**
   * Получить репутацию в группе
   */
  getReputation(group: string): ReputationEntry | undefined {
    return this.reputation.get(group);
  }

  /**
   * Обновить репутацию
   */
  updateReputation(group: string, delta: number, rank?: string): void {
    let rep = this.reputation.get(group);
    if (!rep) {
      rep = {
        group,
        value: 0,
        lastUpdated: Date.now(),
      };
    }
    
    rep.value = Math.max(-100, Math.min(100, rep.value + delta));
    if (rank) rep.rank = rank;
    rep.lastUpdated = Date.now();
    
    this.reputation.set(group, rep);
    this.markUpdated();
  }

  /**
   * Проверить правовой статус
   */
  hasRight(right: string): boolean {
    return this.legalStatus.rights.includes(right);
  }

  /**
   * Есть ли активные преступления
   */
  hasUnpunishedCrimes(): boolean {
    return this.legalStatus.crimes.some(c => !c.punished);
  }

  /**
   * Получить суммарный уровень здоровья
   */
  getHealthPercentage(): number {
    return (this.health.current / this.health.max) * 100;
  }

  /**
   * Применить эффект к здоровью
   */
  applyHealthEffect(effect: NPCHealth['conditions'][0]): void {
    this.health.conditions.push(effect);
    this.markUpdated();
  }

  /**
   * Удалить эффект здоровья по имени
   */
  removeHealthEffect(name: string): void {
    this.health.conditions = this.health.conditions.filter(c => c.name !== name);
    this.markUpdated();
  }
}

/**
 * Фабрика для создания NPC с дефолтными значениями
 */
export class NPCFactory {
  static createDefault(
    id: NPCId,
    name: string,
    race: Race,
    culture: Culture,
    profession: string = 'commoner',
    location: { x: number; y: number } = { x: 0, y: 0 }
  ): NPC {
    return new NPC({
      id,
      name,
      age: 20,
      race,
      culture,
      profession,
      location: { ...location },
      health: {
        current: 100,
        max: 100,
        conditions: [],
      },
      needs: [
        { type: 'hunger' as NeedType, value: 80, decayRate: 2 },
        { type: 'thirst' as NeedType, value: 80, decayRate: 3 },
        { type: 'sleep' as NeedType, value: 90, decayRate: 1 },
        { type: 'social' as NeedType, value: 70, decayRate: 0.5 },
        { type: 'safety' as NeedType, value: 85, decayRate: 0.3 },
        { type: 'fun' as NeedType, value: 60, decayRate: 0.8 },
      ],
      traits: [],
      personality: {
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
        moralAlignment: {
          lawful: 50,
          good: 50,
        },
      },
      memory: [],
      relationships: new Map(),
      knowledge: new Map(),
      inventory: [],
      schedule: [
        { startTime: 0, endTime: 6, activity: 'sleep', priority: 10 },
        { startTime: 6, endTime: 7, activity: 'eat', priority: 8 },
        { startTime: 7, endTime: 12, activity: 'work', priority: 7 },
        { startTime: 12, endTime: 13, activity: 'eat', priority: 8 },
        { startTime: 13, endTime: 18, activity: 'work', priority: 7 },
        { startTime: 18, endTime: 20, activity: 'socialize', priority: 6 },
        { startTime: 20, endTime: 22, activity: 'leisure', priority: 5 },
        { startTime: 22, endTime: 24, activity: 'sleep', priority: 10 },
      ],
      legalStatus: {
        citizenship: 'unknown',
        socialClass: 'commoner',
        titles: [],
        crimes: [],
        rights: ['basic_protection'],
        obligations: ['pay_taxes'],
      },
      reputation: new Map(),
    });
  }
}

export default NPC;
