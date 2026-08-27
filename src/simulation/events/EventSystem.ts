/**
 * Event System Implementation
 * Этап 29 — QUESTS + EVENTS
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  GameEvent, 
  EventLayer, 
  EventStatus,
  MicroEventData,
  RegionalEventData,
  GlobalEventData,
  EventGenerationContext,
  EventManager,
  ChronicleEntry,
  MicroEventType,
  RegionalEventType,
  GlobalEventType
} from './EventTypes';
import { Settlement } from '../../world/settlements/Settlement';
import { Region } from '../../world/regions/Region';
import { NPC } from '../entities/npc/NPC';

export class EventSystem implements EventManager {
  private events: Map<string, GameEvent> = new Map();
  private chronicles: ChronicleEntry[] = [];
  private eventChains: Map<string, string[]> = new Map(); // eventId -> triggered event IDs
  
  // Event templates for generation
  private microEventTemplates: MicroEventTemplate[] = [
    { type: 'bandit_attack', name: 'Bandit Raid', baseSeverity: 'moderate' },
    { type: 'fire', name: 'Fire Outbreak', baseSeverity: 'serious' },
    { type: 'wedding', name: 'Wedding Celebration', baseSeverity: 'minor' },
    { type: 'quarrel', name: 'Local Dispute', baseSeverity: 'minor' },
    { type: 'lost_goods', name: 'Lost Merchandise', baseSeverity: 'minor' },
    { type: 'found_child', name: 'Foundling Discovery', baseSeverity: 'moderate' },
  ];
  
  private regionalEventTemplates: RegionalEventTemplate[] = [
    { type: 'epidemic', name: 'Plague Outbreak', baseSeverity: 'high' },
    { type: 'famine', name: 'Food Shortage', baseSeverity: 'high' },
    { type: 'war', name: 'Regional Conflict', baseSeverity: 'critical' },
    { type: 'flood', name: 'Great Flood', baseSeverity: 'high' },
    { type: 'rebellion', name: 'Peasant Uprising', baseSeverity: 'high' },
  ];
  
  private globalEventTemplates: GlobalEventTemplate[] = [
    { type: 'kingdom_fall', name: 'Fall of Kingdom', magnitude: 'cataclysmic' },
    { type: 'border_change', name: 'Border Restructuring', magnitude: 'major' },
    { type: 'ancient_threat', name: 'Ancient Evil Awakens', magnitude: 'severe' },
    { type: 'catastrophe', name: 'Natural Catastrophe', magnitude: 'cataclysmic' },
  ];
  
  // ============================================================================
  // Event Lifecycle
  // ============================================================================
  
  createEvent(event: GameEvent): void {
    this.events.set(event.id, event);
  }
  
  getEvent(eventId: string): GameEvent | undefined {
    return this.events.get(eventId);
  }
  
  activateEvent(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }
    
    if (event.status !== 'pending') {
      throw new Error(`Event ${eventId} is not pending`);
    }
    
    event.status = 'active';
    event.activatedAt = Date.now();
  }
  
  resolveEvent(eventId: string, resolution: string): void {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }
    
    event.status = 'resolved';
    event.resolvedAt = Date.now();
    
    // Store resolution
    if (event.microData) {
      event.microData.resolution = resolution;
    }
    
    // Check for chain reactions
    this.checkEventChains(Date.now());
  }
  
  escalateEvent(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }
    
    event.status = 'escalated';
    
    // Increase severity
    if (event.microData) {
      const severities: Array<'minor' | 'moderate' | 'serious'> = ['minor', 'moderate', 'serious'];
      const currentIndex = severities.indexOf(event.microData.severity);
      if (currentIndex < severities.length - 1) {
        event.microData.severity = severities[currentIndex + 1];
      }
    }
    
    if (event.regionalData) {
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
      const currentIndex = severities.indexOf(event.regionalData.severity);
      if (currentIndex < severities.length - 1) {
        event.regionalData.severity = severities[currentIndex + 1];
      }
      event.regionalData.intensity = Math.min(100, event.regionalData.intensity + 20);
    }
  }
  
  // ============================================================================
  // Event Discovery
  // ============================================================================
  
  discoverEvents(actorId: string, context: {
    regionId?: string;
    settlementId?: string;
    layer?: EventLayer;
  }): GameEvent[] {
    const discovered: GameEvent[] = [];
    
    for (const event of this.events.values()) {
      if (event.status === 'expired') continue;
      
      // Filter by layer
      if (context.layer && event.layer !== context.layer) continue;
      
      // Filter by region
      if (context.regionId) {
        const inRegion = this.isEventInRegion(event, context.regionId);
        if (!inRegion) continue;
      }
      
      // Filter by settlement
      if (context.settlementId) {
        const inSettlement = this.isEventInSettlement(event, context.settlementId);
        if (!inSettlement) continue;
      }
      
      // Add to discovered if not already known
      if (!event.discoveredBy?.includes(actorId)) {
        if (!event.discoveredBy) {
          event.discoveredBy = [];
        }
        event.discoveredBy.push(actorId);
        discovered.push(event);
      }
    }
    
    return discovered;
  }
  
  private isEventInRegion(event: GameEvent, regionId: string): boolean {
    if (event.microData?.location?.regionId === regionId) return true;
    if (event.regionalData?.affectedRegions.includes(regionId)) return true;
    if (event.globalData?.affectedRegions.includes(regionId)) return true;
    return false;
  }
  
  private isEventInSettlement(event: GameEvent, settlementId: string): boolean {
    if (event.microData?.location?.settlementId === settlementId) return true;
    if (event.microData?.involvedSettlement === settlementId) return true;
    if (event.regionalData?.affectedSettlements?.includes(settlementId)) return true;
    return false;
  }
  
  // ============================================================================
  // Micro Event Generation
  // ============================================================================
  
  generateMicroEvent(context: EventGenerationContext): GameEvent {
    const template = this.microEventTemplates[
      Math.floor(Math.random() * this.microEventTemplates.length)
    ];
    
    const eventId = uuidv4();
    const severity = this.getRandomSeverity(template.baseSeverity);
    
    const microData: MicroEventData = {
      type: template.type,
      involvedSettlement: context.settlement?.id,
      location: {
        regionId: context.region?.id || 'unknown',
        settlementId: context.settlement?.id,
      },
      severity,
      description: this.generateMicroEventDescription(template.type, context),
      startedAt: context.currentTime,
      expectedDuration: this.getMicroEventDuration(template.type),
    };
    
    if (context.involvedNPC) {
      microData.involvedNPCs = [context.involvedNPC.id];
    }
    
    const event: GameEvent = {
      id: eventId,
      name: template.name,
      description: microData.description,
      layer: 'micro',
      status: 'pending',
      microData,
      createdAt: context.currentTime,
      tags: ['micro', template.type],
      importance: this.calculateMicroImportance(severity),
    };
    
    return event;
  }
  
  private generateMicroEventDescription(type: MicroEventType, context: EventGenerationContext): string {
    const descriptions: Record<MicroEventType, string[]> = {
      bandit_attack: [
        'Bandits have been spotted near the settlement.',
        'A merchant caravan was attacked by brigands.',
        'Local travelers report increased bandit activity.',
      ],
      fire: [
        'A fire has broken out in the settlement.',
        'Buildings are threatened by an uncontrolled blaze.',
        'Emergency response needed for a structure fire.',
      ],
      wedding: [
        'A joyous wedding celebration is taking place.',
        'Two families are united in marriage.',
        'The community gathers for a wedding feast.',
      ],
      quarrel: [
        'A dispute has arisen between locals.',
        'Neighbors are in conflict over property.',
        'A heated argument threatens to escalate.',
      ],
      lost_goods: [
        'A merchant has lost valuable cargo.',
        'Goods went missing during transport.',
        'A shipment has been misplaced.',
      ],
      found_child: [
        'An orphaned child has been discovered.',
        'A lost child needs to be reunited with family.',
        'A foundling requires care and protection.',
      ],
    };
    
    const options = descriptions[type];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private getRandomSeverity(base: 'minor' | 'moderate' | 'serious'): 'minor' | 'moderate' | 'serious' {
    const severities: Array<'minor' | 'moderate' | 'serious'> = ['minor', 'moderate', 'serious'];
    const baseIndex = severities.indexOf(base);
    const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const newIndex = Math.max(0, Math.min(2, baseIndex + variation));
    return severities[newIndex];
  }
  
  private getMicroEventDuration(type: MicroEventType): number {
    const durations: Record<MicroEventType, number> = {
      bandit_attack: 24,
      fire: 12,
      wedding: 48,
      quarrel: 6,
      lost_goods: 72,
      found_child: 168,
    };
    return durations[type] || 24;
  }
  
  private calculateMicroImportance(severity: 'minor' | 'moderate' | 'serious'): number {
    const importance: Record<'minor' | 'moderate' | 'serious', number> = {
      minor: 2,
      moderate: 4,
      serious: 6,
    };
    return importance[severity];
  }
  
  // ============================================================================
  // Regional Event Generation
  // ============================================================================
  
  generateRegionalEvent(context: EventGenerationContext): GameEvent {
    const template = this.regionalEventTemplates[
      Math.floor(Math.random() * this.regionalEventTemplates.length)
    ];
    
    const eventId = uuidv4();
    const severity = this.getRandomRegionalSeverity(template.baseSeverity);
    
    const affectedRegions = context.region ? [context.region.id] : ['unknown'];
    
    const regionalData: RegionalEventData = {
      type: template.type,
      affectedRegions,
      severity,
      intensity: this.getBaseIntensity(severity),
      spreadRate: this.getSpreadRate(template.type),
      startedAt: context.currentTime,
      consequences: {
        shortTerm: this.getShortTermConsequences(template.type),
        longTerm: this.getLongTermConsequences(template.type),
      },
    };
    
    const event: GameEvent = {
      id: eventId,
      name: template.name,
      description: this.generateRegionalEventDescription(template.type, context),
      layer: 'regional',
      status: 'pending',
      regionalData,
      createdAt: context.currentTime,
      tags: ['regional', template.type],
      importance: this.calculateRegionalImportance(severity),
    };
    
    return event;
  }
  
  private generateRegionalEventDescription(type: RegionalEventType, context: EventGenerationContext): string {
    const descriptions: Record<RegionalEventType, string[]> = {
      epidemic: [
        'A deadly plague spreads through the region.',
        'Disease claims victims across multiple settlements.',
        'Medical resources are overwhelmed by the outbreak.',
      ],
      famine: [
        'Crops have failed, leading to widespread hunger.',
        'Food supplies dwindle as famine grips the land.',
        'Starvation threatens the regional population.',
      ],
      war: [
        'Armed conflict erupts between neighboring powers.',
        'Armies clash across the countryside.',
        'War brings destruction to the region.',
      ],
      flood: [
        'Rivers overflow, submerging vast areas.',
        'Torrential rains cause catastrophic flooding.',
        'Floodwaters destroy homes and farmland.',
      ],
      rebellion: [
        'Peasants rise up against their rulers.',
        'Rebels seize control of key locations.',
        'Insurgency spreads throughout the region.',
      ],
    };
    
    const options = descriptions[type];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private getRandomRegionalSeverity(base: 'low' | 'medium' | 'high' | 'critical'): 'low' | 'medium' | 'high' | 'critical' {
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    const baseIndex = severities.indexOf(base);
    const variation = Math.floor(Math.random() * 3) - 1;
    const newIndex = Math.max(0, Math.min(3, baseIndex + variation));
    return severities[newIndex];
  }
  
  private getBaseIntensity(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    const intensities: Record<'low' | 'medium' | 'high' | 'critical', number> = {
      low: 25,
      medium: 50,
      high: 75,
      critical: 95,
    };
    return intensities[severity];
  }
  
  private getSpreadRate(type: RegionalEventType): number {
    const rates: Record<RegionalEventType, number> = {
      epidemic: 15,
      famine: 5,
      war: 10,
      flood: 20,
      rebellion: 8,
    };
    return rates[type] || 10;
  }
  
  private getShortTermConsequences(type: RegionalEventType): string[] {
    const consequences: Record<RegionalEventType, string[]> = {
      epidemic: ['Increased mortality', 'Trade disruption', 'Quarantine measures'],
      famine: ['Malnutrition', 'Price inflation', 'Migration'],
      war: ['Casualties', 'Infrastructure damage', 'Refugees'],
      flood: ['Property loss', 'Crop destruction', 'Displacement'],
      rebellion: ['Civil unrest', 'Authority challenged', 'Violence'],
    };
    return consequences[type] || [];
  }
  
  private getLongTermConsequences(type: RegionalEventType): string[] {
    const consequences: Record<RegionalEventType, string[]> = {
      epidemic: ['Population decline', 'Medical reforms', 'Social changes'],
      famine: ['Demographic shifts', 'Agricultural reforms', 'Economic impact'],
      war: ['Territory changes', 'Political restructuring', 'Long-term trauma'],
      flood: ['Geographical changes', 'Infrastructure rebuilding', 'Policy changes'],
      rebellion: ['Power shifts', 'Social reforms', 'Lasting resentment'],
    };
    return consequences[type] || [];
  }
  
  private calculateRegionalImportance(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    const importance: Record<'low' | 'medium' | 'high' | 'critical', number> = {
      low: 4,
      medium: 6,
      high: 8,
      critical: 10,
    };
    return importance[severity];
  }
  
  // ============================================================================
  // Global Event Generation
  // ============================================================================
  
  generateGlobalEvent(context: EventGenerationContext): GameEvent {
    const template = this.globalEventTemplates[
      Math.floor(Math.random() * this.globalEventTemplates.length)
    ];
    
    const eventId = uuidv4();
    
    const stages = this.generateGlobalEventStages(template.type);
    
    const globalData: GlobalEventData = {
      type: template.type,
      affectedRegions: [],
      magnitude: template.magnitude,
      worldStateChanges: this.getWorldStateChanges(template.type),
      stages,
      currentStage: 0,
      startedAt: context.currentTime,
      recordedInChronicles: true,
    };
    
    const event: GameEvent = {
      id: eventId,
      name: template.name,
      description: this.generateGlobalEventDescription(template.type),
      layer: 'global',
      status: 'pending',
      globalData,
      createdAt: context.currentTime,
      tags: ['global', template.type],
      importance: 10,
    };
    
    return event;
  }
  
  private generateGlobalEventStages(type: GlobalEventType): Array<{
    name: string;
    description: string;
    triggers: string[];
    effects: string[];
  }> {
    const stageSets: Record<GlobalEventType, Array<{
      name: string;
      description: string;
      triggers: string[];
      effects: string[];
    }>> = {
      kingdom_fall: [
        { name: 'Decline', description: 'Kingdom shows signs of weakness', triggers: ['economic_crisis'], effects: ['unrest'] },
        { name: 'Crisis', description: 'Royal authority crumbles', triggers: ['rebellion'], effects: ['fragmentation'] },
        { name: 'Collapse', description: 'Kingdom falls', triggers: ['final_battle'], effects: ['new_order'] },
      ],
      border_change: [
        { name: 'Tensions', description: 'Border disputes arise', triggers: ['diplomatic_failure'], effects: ['military_buildup'] },
        { name: 'Conflict', description: 'Armed clashes occur', triggers: ['skirmish'], effects: ['territory_loss'] },
        { name: 'Resolution', description: 'New borders established', triggers: ['treaty'], effects: ['stability'] },
      ],
      ancient_threat: [
        { name: 'Awakening', description: 'Ancient evil stirs', triggers: ['disturbance'], effects: ['ominous_signs'] },
        { name: 'Emergence', description: 'Threat reveals itself', triggers: ['first_attack'], effects: ['panic'] },
        { name: 'Confrontation', description: 'Final battle approaches', triggers: ['gathering_forces'], effects: ['world_hanging_balance'] },
      ],
      catastrophe: [
        { name: 'Warning Signs', description: 'Nature shows warning', triggers: ['anomalies'], effects: ['concern'] },
        { name: 'Event', description: 'Catastrophe strikes', triggers: ['trigger_event'], effects: ['destruction'] },
        { name: 'Aftermath', description: 'World changed forever', triggers: ['settling'], effects: ['new_reality'] },
      ],
    };
    
    return stageSets[type] || [];
  }
  
  private getWorldStateChanges(type: GlobalEventType): Array<{
    type: 'political' | 'geographical' | 'magical' | 'economic';
    description: string;
    permanent: boolean;
  }> {
    const changes: Record<GlobalEventType, Array<{
      type: 'political' | 'geographical' | 'magical' | 'economic';
      description: string;
      permanent: boolean;
    }>> = {
      kingdom_fall: [
        { type: 'political', description: 'New power structures emerge', permanent: true },
        { type: 'economic', description: 'Trade routes disrupted', permanent: false },
      ],
      border_change: [
        { type: 'geographical', description: 'National boundaries shift', permanent: true },
        { type: 'political', description: 'Allegiances change', permanent: true },
      ],
      ancient_threat: [
        { type: 'magical', description: 'Magic becomes unstable', permanent: true },
        { type: 'political', description: 'Nations unite or fall', permanent: true },
      ],
      catastrophe: [
        { type: 'geographical', description: 'Landscape permanently altered', permanent: true },
        { type: 'economic', description: 'Resources depleted', permanent: true },
      ],
    };
    
    return changes[type] || [];
  }
  
  private generateGlobalEventDescription(type: GlobalEventType): string {
    const descriptions: Record<GlobalEventType, string> = {
      kingdom_fall: 'A great kingdom faces its final days, reshaping the political landscape.',
      border_change: 'The map of the world is redrawn as nations rise and fall.',
      ancient_threat: 'An ancient evil awakens, threatening all civilization.',
      catastrophe: 'A natural disaster of unprecedented scale strikes the world.',
    };
    return descriptions[type];
  }
  
  // ============================================================================
  // Event Propagation
  // ============================================================================
  
  propagateEvent(eventId: string, targetRegionIds: string[]): void {
    const event = this.events.get(eventId);
    if (!event) return;
    
    // Spread regional events
    if (event.regionalData) {
      for (const regionId of targetRegionIds) {
        if (!event.regionalData.affectedRegions.includes(regionId)) {
          event.regionalData.affectedRegions.push(regionId);
        }
      }
    }
    
    // Spread global events
    if (event.globalData) {
      for (const regionId of targetRegionIds) {
        if (!event.globalData.affectedRegions.includes(regionId)) {
          event.globalData.affectedRegions.push(regionId);
        }
      }
    }
  }
  
  checkEventChains(currentTime: number): void {
    // Check for event chains and trigger follow-up events
    for (const event of this.events.values()) {
      if (event.status !== 'resolved') continue;
      
      // Micro events might escalate to regional
      if (event.layer === 'micro' && event.microData?.severity === 'serious') {
        // Chance to trigger regional event
        if (Math.random() < 0.3) {
          // Would create a linked regional event here
        }
      }
      
      // Regional events might escalate to global
      if (event.layer === 'regional' && event.regionalData?.severity === 'critical') {
        // Chance to trigger global event
        if (Math.random() < 0.2) {
          // Would create a linked global event here
        }
      }
    }
  }
  
  // ============================================================================
  // Event Tracking
  // ============================================================================
  
  getActiveEvents(layer?: EventLayer): GameEvent[] {
    const active: GameEvent[] = [];
    
    for (const event of this.events.values()) {
      if (event.status !== 'active' && event.status !== 'pending') continue;
      if (layer && event.layer !== layer) continue;
      active.push(event);
    }
    
    return active;
  }
  
  getEventsByRegion(regionId: string): GameEvent[] {
    return Array.from(this.events.values()).filter(event => 
      this.isEventInRegion(event, regionId)
    );
  }
  
  getEventsBySettlement(settlementId: string): GameEvent[] {
    return Array.from(this.events.values()).filter(event => 
      this.isEventInSettlement(event, settlementId)
    );
  }
  
  // ============================================================================
  // Cleanup
  // ============================================================================
  
  expireEvents(currentTime: number): void {
    for (const event of this.events.values()) {
      if (event.status !== 'active' && event.status !== 'pending') continue;
      
      let shouldExpire = false;
      
      // Check micro event duration
      if (event.microData && event.microData.expectedDuration) {
        const elapsed = currentTime - event.microData.startedAt;
        if (elapsed > event.microData.expectedDuration * 3600 * 1000) {
          shouldExpire = true;
        }
      }
      
      // Check regional event end time
      if (event.regionalData && event.regionalData.expectedEnd) {
        if (currentTime > event.regionalData.expectedEnd) {
          shouldExpire = true;
        }
      }
      
      if (shouldExpire) {
        event.status = 'expired';
      }
    }
  }
  
  // ============================================================================
  // Chronicles
  // ============================================================================
  
  recordInChronicles(event: GameEvent, note: string): void {
    const entry: ChronicleEntry = {
      id: uuidv4(),
      eventId: event.id,
      eventName: event.name,
      eventType: event.microData?.type || event.regionalData?.type || event.globalData?.type || 'unknown',
      layer: event.layer,
      recordedAt: Date.now(),
      title: this.generateChronicleTitle(event),
      description: event.description,
      significance: event.importance,
      dateOccurred: event.createdAt,
      outcomes: this.getEventOutcomes(event),
      longTermEffects: event.regionalData?.consequences.longTerm || event.globalData?.worldStateChanges.map(c => c.description),
    };
    
    // Add chronicler notes
    if (note) {
      entry.description += ` [Chronicler's Note: ${note}]`;
    }
    
    this.chronicles.push(entry);
    
    // Mark event as recorded
    if (event.globalData) {
      event.globalData.recordedInChronicles = true;
    }
  }
  
  private generateChronicleTitle(event: GameEvent): string {
    const prefixes: Record<EventLayer, string> = {
      micro: 'Local Incident',
      regional: 'Regional Crisis',
      global: 'Historic Event',
    };
    return `${prefixes[event.layer]}: ${event.name}`;
  }
  
  private getEventOutcomes(event: GameEvent): string[] {
    const outcomes: string[] = [];
    
    if (event.microData?.resolution) {
      outcomes.push(event.microData.resolution);
    }
    
    if (event.regionalData?.consequences.shortTerm) {
      outcomes.push(...event.regionalData.consequences.shortTerm);
    }
    
    return outcomes;
  }
  
  getChronicleEntries(): ChronicleEntry[] {
    return [...this.chronicles];
  }
}

// Helper types for templates
interface MicroEventTemplate {
  type: MicroEventType;
  name: string;
  baseSeverity: 'minor' | 'moderate' | 'serious';
}

interface RegionalEventTemplate {
  type: RegionalEventType;
  name: string;
  baseSeverity: 'low' | 'medium' | 'high' | 'critical';
}

interface GlobalEventTemplate {
  type: GlobalEventType;
  name: string;
  magnitude: 'major' | 'severe' | 'cataclysmic';
}

// Export singleton instance
export const eventSystem = new EventSystem();
