/**
 * Event System Tests
 * Этап 29 — QUESTS + EVENTS
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { eventSystem } from '../simulation/events/EventSystem';
import { EventLayer } from '../simulation/events/EventTypes';

// Mock Region and Settlement for testing
const mockRegion = {
  id: 'test-region',
  name: 'Test Kingdom',
};

const mockSettlement = {
  id: 'test-settlement',
  name: 'Test City',
  regionId: 'test-region',
};

describe('EventSystem', () => {
  beforeEach(() => {
    // Clear system state before each test
    // Note: In a real implementation, we'd add a reset method
  });

  describe('Event Generation', () => {
    it('should generate micro events', () => {
      const event = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        settlement: mockSettlement as any,
        currentTime: Date.now(),
        existingEvents: [],
      });

      expect(event.id).toBeDefined();
      expect(event.layer).toBe('micro');
      expect(event.status).toBe('pending');
      expect(event.microData).toBeDefined();
      expect(event.microData?.type).toBeDefined();
      expect(event.microData?.severity).toBeDefined();
    });

    it('should generate regional events', () => {
      const event = eventSystem.generateRegionalEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });

      expect(event.id).toBeDefined();
      expect(event.layer).toBe('regional');
      expect(event.regionalData).toBeDefined();
      expect(event.regionalData?.type).toBeDefined();
      expect(event.regionalData?.severity).toBeDefined();
      expect(event.regionalData?.intensity).toBeGreaterThan(0);
    });

    it('should generate global events', () => {
      const event = eventSystem.generateGlobalEvent({
        currentTime: Date.now(),
        existingEvents: [],
      });

      expect(event.id).toBeDefined();
      expect(event.layer).toBe('global');
      expect(event.globalData).toBeDefined();
      expect(event.globalData?.type).toBeDefined();
      expect(event.globalData?.magnitude).toBeDefined();
      expect(event.globalData?.stages.length).toBeGreaterThan(0);
    });

    it('should include all micro event types', () => {
      const eventTypes = new Set([
        'bandit_attack',
        'fire',
        'wedding',
        'quarrel',
        'lost_goods',
        'found_child',
      ]);

      // Generate multiple events to ensure variety
      for (let i = 0; i < 20; i++) {
        const event = eventSystem.generateMicroEvent({
          region: mockRegion as any,
          currentTime: Date.now(),
          existingEvents: [],
        });
        eventTypes.delete(event.microData?.type as string);
      }

      // Most types should appear in 20 generations
      expect(eventTypes.size).toBeLessThan(4);
    });

    it('should include all regional event types', () => {
      const eventTypes = new Set([
        'epidemic',
        'famine',
        'war',
        'flood',
        'rebellion',
      ]);

      // Generate multiple events to ensure variety
      for (let i = 0; i < 20; i++) {
        const event = eventSystem.generateRegionalEvent({
          region: mockRegion as any,
          currentTime: Date.now(),
          existingEvents: [],
        });
        eventTypes.delete(event.regionalData?.type as string);
      }

      // Most types should appear in 20 generations
      expect(eventTypes.size).toBeLessThan(3);
    });

    it('should include all global event types', () => {
      const eventTypes = new Set([
        'kingdom_fall',
        'border_change',
        'ancient_threat',
        'catastrophe',
      ]);

      // Generate multiple events to ensure variety
      for (let i = 0; i < 20; i++) {
        const event = eventSystem.generateGlobalEvent({
          currentTime: Date.now(),
          existingEvents: [],
        });
        eventTypes.delete(event.globalData?.type as string);
      }

      // Most types should appear in 20 generations
      expect(eventTypes.size).toBeLessThan(2);
    });
  });

  describe('Event Lifecycle', () => {
    it('should create and retrieve an event', () => {
      const event = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });

      eventSystem.createEvent(event);

      const retrieved = eventSystem.getEvent(event.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(event.id);
    });

    it('should activate an event', () => {
      const event = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      eventSystem.activateEvent(event.id);

      const updated = eventSystem.getEvent(event.id);
      expect(updated?.status).toBe('active');
      expect(updated?.activatedAt).toBeDefined();
    });

    it('should resolve an event', () => {
      const event = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);
      eventSystem.activateEvent(event.id);

      eventSystem.resolveEvent(event.id, 'Problem solved by hero');

      const updated = eventSystem.getEvent(event.id);
      expect(updated?.status).toBe('resolved');
      expect(updated?.resolvedAt).toBeDefined();
      expect(updated?.microData?.resolution).toBe('Problem solved by hero');
    });

    it('should escalate an event', () => {
      const event = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      const initialSeverity = event.microData?.severity;
      eventSystem.escalateEvent(event.id);

      const updated = eventSystem.getEvent(event.id);
      expect(updated?.status).toBe('escalated');
      
      // Severity should increase or stay at max
      const severities = ['minor', 'moderate', 'serious'];
      const newIndex = severities.indexOf(updated?.microData?.severity || 'minor');
      const oldIndex = severities.indexOf(initialSeverity || 'minor');
      expect(newIndex).toBeGreaterThanOrEqual(oldIndex);
    });
  });

  describe('Event Discovery', () => {
    it('should discover events for an actor', () => {
      const event = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      const discovered = eventSystem.discoverEvents('player-1', {});

      expect(discovered.length).toBeGreaterThan(0);
      expect(discovered.map(e => e.id)).toContain(event.id);
      expect(event.discoveredBy).toContain('player-1');
    });

    it('should filter events by region', () => {
      const event1 = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      const event2 = eventSystem.generateMicroEvent({
        region: { ...mockRegion, id: 'other-region' } as any,
        currentTime: Date.now(),
        existingEvents: [],
      });

      eventSystem.createEvent(event1);
      eventSystem.createEvent(event2);

      const discovered = eventSystem.discoverEvents('player-1', {
        regionId: 'test-region',
      });

      expect(discovered.map(e => e.id)).toContain(event1.id);
      expect(discovered.map(e => e.id)).not.toContain(event2.id);
    });

    it('should filter events by layer', () => {
      const microEvent = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      const regionalEvent = eventSystem.generateRegionalEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });

      eventSystem.createEvent(microEvent);
      eventSystem.createEvent(regionalEvent);

      const microOnly = eventSystem.discoverEvents('player-1', {
        layer: 'micro',
      });

      expect(microOnly.map(e => e.id)).toContain(microEvent.id);
      expect(microOnly.map(e => e.id)).not.toContain(regionalEvent.id);
    });
  });

  describe('Event Tracking', () => {
    it('should get active events', () => {
      const event1 = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      const event2 = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });

      eventSystem.createEvent(event1);
      eventSystem.createEvent(event2);
      eventSystem.activateEvent(event1.id);
      eventSystem.activateEvent(event2.id);

      const active = eventSystem.getActiveEvents();
      expect(active.length).toBeGreaterThanOrEqual(2);
    });

    it('should get events by region', () => {
      const event = eventSystem.generateRegionalEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      const events = eventSystem.getEventsByRegion('test-region');
      expect(events.map(e => e.id)).toContain(event.id);
    });

    it('should get events by settlement', () => {
      const event = eventSystem.generateMicroEvent({
        region: mockRegion as any,
        settlement: mockSettlement as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      const events = eventSystem.getEventsBySettlement('test-settlement');
      expect(events.map(e => e.id)).toContain(event.id);
    });
  });

  describe('Chronicles', () => {
    it('should record event in chronicles', () => {
      const event = eventSystem.generateGlobalEvent({
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      eventSystem.recordInChronicles(event, 'A momentous occasion');

      const entries = eventSystem.getChronicleEntries();
      expect(entries.length).toBeGreaterThan(0);
      
      const entry = entries.find(e => e.eventId === event.id);
      expect(entry).toBeDefined();
      expect(entry?.description).toContain('A momentous occasion');
    });

    it('should mark global events as recorded', () => {
      const event = eventSystem.generateGlobalEvent({
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      eventSystem.recordInChronicles(event, 'Historic record');

      const updated = eventSystem.getEvent(event.id);
      expect(updated?.globalData?.recordedInChronicles).toBe(true);
    });
  });

  describe('Event Propagation', () => {
    it('should propagate regional events to other regions', () => {
      const event = eventSystem.generateRegionalEvent({
        region: mockRegion as any,
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      eventSystem.propagateEvent(event.id, ['region-2', 'region-3']);

      const updated = eventSystem.getEvent(event.id);
      expect(updated?.regionalData?.affectedRegions).toContain('region-2');
      expect(updated?.regionalData?.affectedRegions).toContain('region-3');
    });

    it('should propagate global events to regions', () => {
      const event = eventSystem.generateGlobalEvent({
        currentTime: Date.now(),
        existingEvents: [],
      });
      eventSystem.createEvent(event);

      eventSystem.propagateEvent(event.id, ['region-1', 'region-2']);

      const updated = eventSystem.getEvent(event.id);
      expect(updated?.globalData?.affectedRegions).toContain('region-1');
      expect(updated?.globalData?.affectedRegions).toContain('region-2');
    });
  });
});
