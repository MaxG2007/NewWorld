/**
 * Event System Types
 * Этап 29 — QUESTS + EVENTS
 */

import { Settlement } from '../../world/settlements/Settlement';
import { Region } from '../../world/regions/Region';
import { NPC } from '../entities/npc/NPC';

// ============================================================================
// Event Layers
// ============================================================================

export type EventLayer = 'micro' | 'regional' | 'global';

export type EventStatus = 
  | 'pending'
  | 'active'
  | 'resolved'
  | 'escalated'
  | 'expired';

// ============================================================================
// Micro Events (Local, Personal)
// ============================================================================

export type MicroEventType = 
  | 'bandit_attack'      // разбойник
  | 'fire'              // пожар
  | 'wedding'           // свадьба
  | 'quarrel'           // ссора
  | 'lost_goods'        // потеря товара
  | 'found_child';      // найденный ребёнок

export interface MicroEventData {
  type: MicroEventType;
  
  // Participants
  involvedNPCs?: string[]; // NPC IDs
  involvedSettlement?: string; // Settlement ID
  
  // Location
  location?: {
    regionId: string;
    coordinates?: { x: number; y: number };
    settlementId?: string;
  };
  
  // Event specifics
  severity: 'minor' | 'moderate' | 'serious';
  description: string;
  
  // Timing
  startedAt: number;
  expectedDuration?: number; // in game hours
  
  // Resolution
  resolvedBy?: string;
  resolution?: string;
  consequences?: string[];
}

// ============================================================================
// Regional Events (Area-wide)
// ============================================================================

export type RegionalEventType = 
  | 'epidemic'    // эпидемия
  | 'famine'      // голод
  | 'war'         // война
  | 'flood'       // наводнение
  | 'rebellion';  // восстание

export interface RegionalEventData {
  type: RegionalEventType;
  
  // Affected areas
  affectedRegions: string[]; // Region IDs
  affectedSettlements?: string[]; // Settlement IDs
  
  // Severity and progression
  severity: 'low' | 'medium' | 'high' | 'critical';
  intensity: number; // 0-100 scale
  spreadRate?: number; // how fast it spreads
  
  // Statistics
  casualties?: number;
  economicImpact?: number;
  displacedPopulation?: number;
  
  // Timing
  startedAt: number;
  peakTime?: number;
  expectedEnd?: number;
  
  // Resolution
  resolutionRequirements?: {
    type: 'resource' | 'action' | 'time';
    resourceId?: string;
    amount?: number;
    action?: string;
  }[];
  
  consequences: {
    shortTerm: string[];
    longTerm: string[];
  };
}

// ============================================================================
// Global Events (World-changing)
// ============================================================================

export type GlobalEventType = 
  | 'kingdom_fall'        // падение королевства
  | 'border_change'       // изменение границ
  | 'ancient_threat'      // древняя угроза
  | 'catastrophe';        // катастрофа

export interface GlobalEventData {
  type: GlobalEventType;
  
  // Scope
  affectedRegions: string[];
  affectedCivilizations?: string[];
  
  // Impact
  magnitude: 'major' | 'severe' | 'cataclysmic';
  worldStateChanges: {
    type: 'political' | 'geographical' | 'magical' | 'economic';
    description: string;
    permanent: boolean;
  }[];
  
  // Progression
  stages: Array<{
    name: string;
    description: string;
    triggers: string[];
    effects: string[];
  }>;
  currentStage: number;
  
  // Timing
  startedAt: number;
  estimatedDuration?: number;
  
  // Historical significance
  recordedInChronicles: boolean;
  chroniclerNotes?: string;
}

// ============================================================================
// Base Event Interface
// ============================================================================

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  layer: EventLayer;
  status: EventStatus;
  
  // Type-specific data
  microData?: MicroEventData;
  regionalData?: RegionalEventData;
  globalData?: GlobalEventData;
  
  // Discovery
  discoveredBy?: string[]; // Actor IDs who know about this event
  discoveryMethod?: 'witness' | 'rumor' | 'official' | 'deduction';
  
  // Participation
  participants?: string[]; // Actor IDs involved
  interestedParties?: string[]; // Faction IDs, settlement IDs
  
  // Timeline
  createdAt: number;
  activatedAt?: number;
  resolvedAt?: number;
  
  // Chain reactions
  triggeredBy?: string; // Event ID that caused this
  mayTrigger?: string[]; // Event IDs this might cause
  
  // Metadata
  tags: string[];
  importance: number; // 1-10 scale
}

// ============================================================================
// Event Generation Context
// ============================================================================

export interface EventGenerationContext {
  region?: Region;
  settlement?: Settlement;
  involvedNPC?: NPC;
  currentTime: number;
  existingEvents: GameEvent[];
}

// ============================================================================
// Event Manager Interface
// ============================================================================

export interface EventManager {
  // Event lifecycle
  createEvent(event: GameEvent): void;
  getEvent(eventId: string): GameEvent | undefined;
  activateEvent(eventId: string): void;
  resolveEvent(eventId: string, resolution: string): void;
  escalateEvent(eventId: string): void;
  
  // Event discovery
  discoverEvents(actorId: string, context: {
    regionId?: string;
    settlementId?: string;
    layer?: EventLayer;
  }): GameEvent[];
  
  // Event generation
  generateMicroEvent(context: EventGenerationContext): GameEvent;
  generateRegionalEvent(context: EventGenerationContext): GameEvent;
  generateGlobalEvent(context: EventGenerationContext): GameEvent;
  
  // Event propagation
  propagateEvent(eventId: string, targetRegionIds: string[]): void;
  checkEventChains(currentTime: number): void;
  
  // Event tracking
  getActiveEvents(layer?: EventLayer): GameEvent[];
  getEventsByRegion(regionId: string): GameEvent[];
  getEventsBySettlement(settlementId: string): GameEvent[];
  
  // Cleanup
  expireEvents(currentTime: number): void;
  
  // Chronicles
  recordInChronicles(event: GameEvent, note: string): void;
  getChronicleEntries(): ChronicleEntry[];
}

// ============================================================================
// Chronicle System
// ============================================================================

export interface ChronicleEntry {
  id: string;
  eventId: string;
  eventName: string;
  eventType: string;
  layer: EventLayer;
  
  // Recording details
  recordedAt: number;
  recordedBy?: string; // Chronicler ID
  
  // Content
  title: string;
  description: string;
  significance: number;
  
  // Historical context
  dateOccurred: number;
  location?: {
    regionName?: string;
    settlementName?: string;
  };
  
  // Participants
  keyFigures?: string[]; // NPC names
  factions?: string[];
  
  // Outcomes
  outcomes: string[];
  longTermEffects?: string[];
  
  // Cross-references
  relatedEvents?: string[]; // Other chronicle entry IDs
  relatedQuests?: string[]; // Quest IDs
}

// ============================================================================
// Event Templates
// ============================================================================

export interface EventTemplate {
  id: string;
  name: string;
  layer: EventLayer;
  
  baseData: Partial<MicroEventData | RegionalEventData | GlobalEventData>;
  
  conditions: {
    requiredEvents?: string[];
    forbiddenEvents?: string[];
    minimumSeverity?: string;
    timeSinceLastEvent?: number;
  };
  
  probability: number; // Base spawn probability
}
