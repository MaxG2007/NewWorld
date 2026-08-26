/**
 * Этап 16 — NPC SIMULATION
 * Тесты для систем симуляции
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NPCScheduler, ScheduleBlock } from './schedule/NPCScheduler';
import { LifeSimulation, LifeEvent } from './life/LifeSimulation';

describe('Этап 16 — NPC SIMULATION', () => {
  describe('NPCScheduler', () => {
    let scheduler: NPCScheduler;

    beforeEach(() => {
      scheduler = new NPCScheduler();
    });

    it('должен создавать базовое расписание для NPC', () => {
      const schedule = scheduler.createBaseSchedule('npc1', 'farmer', 'human_culture');
      
      expect(schedule.npcId).toBe('npc1');
      expect(schedule.blocks.length).toBeGreaterThan(5);
      expect(schedule.modifiers.profession).toBe('farmer');
    });

    it('должен генерировать разные расписания для разных профессий', () => {
      const farmerSchedule = scheduler.createBaseSchedule('npc1', 'farmer', 'culture');
      const guardSchedule = scheduler.createBaseSchedule('npc2', 'guard', 'culture');
      const merchantSchedule = scheduler.createBaseSchedule('npc3', 'merchant', 'culture');

      // Фермер работает в полях
      const farmerWorkBlocks = farmerSchedule.blocks.filter((b: ScheduleBlock) => b.location === 'fields');
      expect(farmerWorkBlocks.length).toBeGreaterThan(0);

      // Страж работает в казармах или на стене
      const guardWorkBlocks = guardSchedule.blocks.filter(
        (b: ScheduleBlock) => b.location === 'barracks' || b.location === 'city_wall'
      );
      expect(guardWorkBlocks.length).toBeGreaterThan(0);

      // Торговец работает на рынке
      const merchantWorkBlocks = merchantSchedule.blocks.filter((b: ScheduleBlock) => b.location === 'marketplace');
      expect(merchantWorkBlocks.length).toBeGreaterThan(0);
    });

    it('должен применять модификаторы погоды', () => {
      const schedule = scheduler.createBaseSchedule('npc1', 'farmer', 'culture');

      scheduler.applyModifiers(schedule, 'rain', undefined);

      // Дождь должен изменять активность на 'home' для работы на улице
      const hasHomeActivity = schedule.blocks.some((b: ScheduleBlock) => b.activity === 'home');
      expect(hasHomeActivity).toBe(true);
    });

    it('должен применять модификаторы событий (праздник)', () => {
      const schedule = scheduler.createBaseSchedule('npc1', 'farmer', 'culture');

      scheduler.applyModifiers(schedule, undefined, 'festival');

      // Работа должна быть заменена на отдых
      const leisureBlocks = schedule.blocks.filter((b: ScheduleBlock) => b.activity === 'leisure');
      expect(leisureBlocks.length).toBeGreaterThan(0);
    });

    it('должен возвращать текущую активность по часу', () => {
      const schedule = scheduler.createBaseSchedule('npc1', 'farmer', 'culture');

      const activityAt3am = scheduler.getCurrentActivity(schedule, 3);
      expect(activityAt3am?.activity).toBe('sleep');

      const activityAt10am = scheduler.getCurrentActivity(schedule, 10);
      expect(activityAt10am?.activity).toBe('work');

      const activityAt8pm = scheduler.getCurrentActivity(schedule, 20);
      expect(activityAt8pm?.activity).toBe('home');
    });

    it('должен обновлять состояние расписания', () => {
      scheduler.createBaseSchedule('npc1', 'farmer', 'culture');
      
      const currentBlock = scheduler.updateSchedule('npc1', 10);
      expect(currentBlock).not.toBeNull();
      expect(currentBlock?.activity).toBe('work');
    });

    it('должен сериализовать и десериализовать расписания', () => {
      scheduler.createBaseSchedule('npc1', 'farmer', 'culture');
      scheduler.createBaseSchedule('npc2', 'blacksmith', 'culture');

      const serialized = scheduler.serialize();
      expect(Object.keys(serialized).length).toBe(2);

      const newScheduler = new NPCScheduler();
      newScheduler.deserialize(serialized);

      expect(newScheduler.getSchedule('npc1')).toBeDefined();
      expect(newScheduler.getSchedule('npc2')).toBeDefined();
    });
  });

  describe('LifeSimulation', () => {
    let lifeSim: LifeSimulation;
    let mockCalendar: any;
    let mockWeather: any;

    beforeEach(() => {
      mockCalendar = {
        getCurrentHour: () => 12,
        getTotalDays: () => 100
      };
      mockWeather = {
        getCurrentWeather: () => ({ type: 'clear', temperature: 20 })
      };
      lifeSim = new LifeSimulation(mockCalendar as any, mockWeather as any);
    });

    it('должен инициализировать состояние жизни NPC', () => {
      lifeSim.initializeLife('npc1');
      const state = lifeSim.getLifeState('npc1');

      expect(state).toBeDefined();
      expect(state?.energy).toBe(100);
      expect(state?.hunger).toBe(0);
      expect(state?.health).toBe(100);
      expect(state?.happiness).toBe(75);
    });

    it('должен обновлять потребности NPC', () => {
      lifeSim.initializeLife('npc1');
      
      // Симуляция работы в течение 4 часов
      const mockNPC = {
        id: 'npc1',
        name: 'Test',
        age: 25,
        currentActivity: 'work',
        location: 'test',
        race: { maxAge: 80, adultAge: 18 }
      };

      lifeSim.update(mockNPC, 4);
      const state = lifeSim.getLifeState('npc1');

      expect(state?.energy).toBeLessThan(100);
      expect(state?.hunger).toBeGreaterThan(0);
    });

    it('должен восстанавливать энергию во время сна', () => {
      lifeSim.initializeLife('npc1');
      
      const mockNPC = {
        id: 'npc1',
        name: 'Test',
        age: 25,
        currentActivity: 'sleep',
        location: 'home',
        race: { maxAge: 80, adultAge: 18 }
      };

      // Уменьшим энергию вручную
      const state = lifeSim.getLifeState('npc1');
      if (state) state.energy = 50;

      lifeSim.update(mockNPC, 4);
      const updatedState = lifeSim.getLifeState('npc1');

      expect(updatedState?.energy).toBeGreaterThan(50);
    });

    it('должен регистрировать события жизни', () => {
      lifeSim.initializeLife('npc1');

      lifeSim.recordEvent('npc1', {
        type: 'marriage',
        timestamp: 100,
        description: 'Свадьба',
        participants: ['npc1', 'npc2'],
        impact: { happiness: 20 }
      });

      const events = lifeSim.getLifeEvents('npc1');
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('marriage');
    });

    it('должен симулировать брак', () => {
      lifeSim.initializeLife('npc1');
      lifeSim.initializeLife('npc2');

      const npc1 = { id: 'npc1', name: 'Alice', age: 25, race: { maxAge: 80, adultAge: 18 } };
      const npc2 = { id: 'npc2', name: 'Bob', age: 26, race: { maxAge: 80, adultAge: 18 } };

      lifeSim.simulateMarriage(npc1, npc2);

      const events1 = lifeSim.getLifeEvents('npc1');
      const events2 = lifeSim.getLifeEvents('npc2');

      expect(events1.some((e: LifeEvent) => e.type === 'marriage')).toBe(true);
      expect(events2.some((e: LifeEvent) => e.type === 'marriage')).toBe(true);
    });

    it('должен симулировать преступление', () => {
      lifeSim.initializeLife('npc1');
      lifeSim.initializeLife('npc2');

      const perpetrator = { id: 'npc1', name: 'Thief', age: 30, race: { maxAge: 80, adultAge: 18 } };
      const victim = { id: 'npc2', name: 'Victim', age: 25, race: { maxAge: 80, adultAge: 18 } };

      lifeSim.simulateCrime(perpetrator, victim, 'theft');

      const perpEvents = lifeSim.getLifeEvents('npc1');
      const victimEvents = lifeSim.getLifeEvents('npc2');

      expect(perpEvents.some((e: LifeEvent) => e.type === 'crime')).toBe(true);
      expect(victimEvents.some((e: LifeEvent) => e.type === 'crime')).toBe(true);
    });

    it('должен симулировать путешествие', () => {
      lifeSim.initializeLife('npc1');

      const npc = { id: 'npc1', name: 'Traveler', age: 30, race: { maxAge: 80, adultAge: 18 } };

      lifeSim.simulateTravel(npc, 'City A', 'City B');

      const events = lifeSim.getLifeEvents('npc1');
      expect(events.some((e: LifeEvent) => e.type === 'travel')).toBe(true);
      expect(events.some((e: LifeEvent) => e.description.includes('путешествует'))).toBe(true);
    });

    it('должен проверять условие смерти от старости', () => {
      lifeSim.initializeLife('npc1');

      const oldNPC = {
        id: 'npc1',
        name: 'Old Man',
        age: 85, // Больше maxAge
        currentActivity: 'rest',
        location: 'home',
        race: { maxAge: 80, adultAge: 18 }
      };

      const isDead = (lifeSim as any).checkDeath(oldNPC, { 
        energy: 50, hunger: 50, health: 50, happiness: 50, socialNeed: 50 
      });

      expect(isDead).toBe(true);
    });

    it('должен сериализовать и десериализовать состояния', () => {
      lifeSim.initializeLife('npc1');
      lifeSim.recordEvent('npc1', {
        type: 'birth',
        timestamp: 0,
        description: 'Рождение',
        participants: ['npc1'],
        impact: {}
      });

      const data = lifeSim.serialize();
      const newLifeSim = new LifeSimulation(mockCalendar as any, mockWeather as any);
      newLifeSim.deserialize(data);

      expect(newLifeSim.getLifeState('npc1')).toBeDefined();
      expect(newLifeSim.getLifeEvents('npc1').length).toBe(1);
    });
  });

  describe('Интеграция расписания и жизни', () => {
    it('должен корректно работать с разными профессиями и погодой', () => {
      const scheduler = new NPCScheduler();
      const schedule = scheduler.createBaseSchedule('npc1', 'farmer', 'culture');

      // Нормальная погода
      let activity = scheduler.getCurrentActivity(schedule, 10);
      expect(activity?.activity).toBe('work');
      expect(activity?.location).toBe('fields');

      // Дождливая погода
      scheduler.applyModifiers(schedule, 'rain', undefined);
      activity = scheduler.getCurrentActivity(schedule, 10);
      expect(activity?.activity).toBe('home');
    });
  });
});
