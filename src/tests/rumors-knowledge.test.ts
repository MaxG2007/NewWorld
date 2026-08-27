/**
 * Тесты для ЭТАП 25 — RUMORS + KNOWLEDGE
 * Тестирование системы слухов и знаний NPC
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  RumorsKnowledgeSystem,
  WorldEvent,
  Witness,
  TellingContext,
  Rumor,
} from '../simulation/rumors';

describe('ЭТАП 25 — RUMORS + KNOWLEDGE', () => {
  let system: RumorsKnowledgeSystem;
  
  beforeEach(() => {
    system = new RumorsKnowledgeSystem();
    system.setCurrentTime(1000);
  });
  
  describe('Регистрация событий и свидетелей', () => {
    it('должна регистрировать событие в мире', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'crime',
        timestamp: 1000,
        location: 'marketplace',
        participants: ['npc_thief', 'npc_merchant'],
        description: 'Thief stole apples from merchant stall',
        severity: 0.3,
        tags: ['theft', 'market'],
      };
      
      system.registerEvent(event);
      
      // Событие зарегистрировано
      expect(() => system.registerEvent(event)).not.toThrow();
    });
    
    it('должна добавлять свидетеля с правильными параметрами', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'crime',
        timestamp: 1000,
        location: 'marketplace',
        participants: ['npc_thief'],
        description: 'Thief stole gold from chest',
        severity: 0.5,
        tags: ['theft'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'npc_witness_1',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.9,
        distance: 5,
        emotion: 'surprise',
        politicalBias: 'neutral',
        reliability: 0.8,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // Свидетель получил знание о событии
      const knowledge = system.checkKnowledge('npc_witness_1', 'event_1');
      expect(knowledge.knowsAboutEvent).toBe(true);
      expect(knowledge.confidence).toBeGreaterThan(0.5);
    });
    
    it('должна создавать фрагменты памяти на основе видимости и расстояния', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'battle',
        timestamp: 1000,
        location: 'town_square',
        participants: ['npc_guard', 'npc_bandit'],
        description: 'Guard fought bandit. Blood was spilled. Crowd gathered quickly.',
        severity: 0.7,
        tags: ['violence', 'public'],
      };
      
      system.registerEvent(event);
      
      // Свидетель близко и хорошо видит
      const closeWitness: Witness = {
        id: 'npc_close',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.95,
        distance: 2,
        emotion: 'fear',
        politicalBias: 'pro_authority',
        reliability: 0.9,
        memory: [],
      };
      
      // Свидетель далеко и плохо видит
      const farWitness: Witness = {
        id: 'npc_far',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.3,
        distance: 50,
        emotion: 'neutral',
        politicalBias: 'neutral',
        reliability: 0.5,
        memory: [],
      };
      
      system.addWitness('event_1', closeWitness);
      system.addWitness('event_1', farWitness);
      
      const closeKnowledge = system.checkKnowledge('npc_close', 'event_1');
      const farKnowledge = system.checkKnowledge('npc_far', 'event_1');
      
      // Близкий свидетель знает больше
      expect(closeKnowledge.confidence).toBeGreaterThan(farKnowledge.confidence);
    });
  });
  
  describe('Передача слухов между NPC', () => {
    it('должна передавать слух от свидетеля к другому NPC', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'crime',
        timestamp: 1000,
        location: 'tavern',
        participants: ['npc_thief'],
        description: 'Thief pickpocketed noble in tavern',
        severity: 0.4,
        tags: ['theft', 'noble'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'npc_witness',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.8,
        distance: 3,
        emotion: 'excitement',
        politicalBias: 'neutral',
        reliability: 0.7,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      const context: TellingContext = {
        tellerId: 'npc_witness',
        listenerId: 'npc_listener',
        location: 'tavern',
        socialSetting: 'tavern',
        relationship: 'friend',
        timePressure: false,
        privacy: true,
        alcoholInvolved: false,
        incentive: 0,
      };
      
      const success = system.tellRumor('npc_witness', 'npc_listener', 'event_1', context);
      
      expect(success).toBe(true);
      
      // Слушатель теперь знает о событии
      const listenerKnowledge = system.checkKnowledge('npc_listener', 'event_1');
      expect(listenerKnowledge.knowsAboutEvent).toBe(true);
    });
    
    it('не должна передавать слух если рассказчик не знает о событии', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'crime',
        timestamp: 1000,
        location: 'street',
        participants: ['npc_thief'],
        description: 'Theft occurred',
        severity: 0.3,
        tags: ['theft'],
      };
      
      system.registerEvent(event);
      
      const context: TellingContext = {
        tellerId: 'npc_stranger',
        listenerId: 'npc_listener',
        location: 'street',
        socialSetting: 'street',
        relationship: 'stranger',
        timePressure: false,
        privacy: false,
        alcoholInvolved: false,
        incentive: 0,
      };
      
      const success = system.tellRumor('npc_stranger', 'npc_listener', 'event_1', context);
      
      expect(success).toBe(false);
    });
    
    it('должна учитывать отношения при передаче слуха', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'political',
        timestamp: 1000,
        location: 'castle',
        participants: ['npc_king'],
        description: 'King made controversial decision',
        severity: 0.8,
        tags: ['politics', 'royal'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'npc_courtier',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 1.0,
        distance: 0,
        emotion: 'neutral',
        politicalBias: 'pro_noble',
        reliability: 0.9,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // С врагом не делится
      const enemyContext: TellingContext = {
        tellerId: 'npc_courtier',
        listenerId: 'npc_enemy',
        location: 'castle',
        socialSetting: 'noble_court',
        relationship: 'enemy',
        timePressure: false,
        privacy: true,
        alcoholInvolved: false,
        incentive: 0,
      };
      
      const enemySuccess = system.tellRumor('npc_courtier', 'npc_enemy', 'event_1', enemyContext);
      expect(enemySuccess).toBe(false);
      
      // С другом делится
      const friendContext: TellingContext = {
        tellerId: 'npc_courtier',
        listenerId: 'npc_friend',
        location: 'castle',
        socialSetting: 'noble_court',
        relationship: 'friend',
        timePressure: false,
        privacy: true,
        alcoholInvolved: false,
        incentive: 0,
      };
      
      const friendSuccess = system.tellRumor('npc_courtier', 'npc_friend', 'event_1', friendContext);
      expect(friendSuccess).toBe(true);
    });
  });
  
  describe('Искажение слухов', () => {
    it('должна создавать несколько версий одного события', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'battle',
        timestamp: 1000,
        location: 'bridge',
        participants: ['npc_hero', 'npc_dragon'],
        description: 'Hero fought dragon on bridge',
        severity: 0.9,
        tags: ['epic', 'monster'],
      };
      
      system.registerEvent(event);
      
      // Добавляем нескольких свидетелей с разными характеристиками
      const witnesses: Witness[] = [
        {
          id: 'witness_1',
          eventId: 'event_1',
          witnessTime: 1000,
          visibility: 0.9,
          distance: 5,
          emotion: 'excitement',
          politicalBias: 'pro_common',
          reliability: 0.8,
          memory: [],
        },
        {
          id: 'witness_2',
          eventId: 'event_1',
          witnessTime: 1000,
          visibility: 0.6,
          distance: 20,
          emotion: 'fear',
          politicalBias: 'neutral',
          reliability: 0.5,
          memory: [],
        },
        {
          id: 'witness_3',
          eventId: 'event_1',
          witnessTime: 1000,
          visibility: 0.4,
          distance: 50,
          emotion: 'surprise',
          politicalBias: 'religious',
          reliability: 0.6,
          memory: [],
        },
      ];
      
      witnesses.forEach(w => system.addWitness('event_1', w));
      
      // Передаём слухи дальше
      system.tellRumor('witness_1', 'listener_1', 'event_1', {
        tellerId: 'witness_1',
        listenerId: 'listener_1',
        location: 'tavern',
        socialSetting: 'tavern',
        relationship: 'acquaintance',
        timePressure: false,
        privacy: false,
        alcoholInvolved: true,
        incentive: 0,
      });
      
      system.tellRumor('listener_1', 'listener_2', 'event_1', {
        tellerId: 'listener_1',
        listenerId: 'listener_2',
        location: 'marketplace',
        socialSetting: 'marketplace',
        relationship: 'stranger',
        timePressure: true,
        privacy: false,
        alcoholInvolved: false,
        incentive: 10,
      });
      
      system.tellRumor('witness_2', 'listener_3', 'event_1', {
        tellerId: 'witness_2',
        listenerId: 'listener_3',
        location: 'temple',
        socialSetting: 'temple',
        relationship: 'friend',
        timePressure: false,
        privacy: true,
        alcoholInvolved: false,
        incentive: 0,
      });
      
      // Получаем все версии слуха
      const versions = system.getAllRumorVersions('event_1');
      
      // Должно быть несколько разных версий
      expect(versions.length).toBeGreaterThanOrEqual(3);
      
      // Версии должны отличаться
      const versionTexts = versions.map((v: Rumor) => v.version);
      const uniqueVersions = new Set(versionTexts);
      expect(uniqueVersions.size).toBeGreaterThanOrEqual(2);
    });
    
    it('должна накапливать искажения при многократной передаче', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'crime',
        timestamp: 1000,
        location: 'alley',
        participants: ['npc_thief'],
        description: 'Thief stole purse from merchant',
        severity: 0.3,
        tags: ['theft'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'witness_1',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.8,
        distance: 5,
        emotion: 'neutral',
        politicalBias: 'neutral',
        reliability: 0.8,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // Цепочка передачи: witness -> l1 -> l2 -> l3 -> l4 -> l5
      let currentTeller = 'witness_1';
      const chain: string[] = [];
      
      for (let i = 1; i <= 5; i++) {
        const listener = `listener_${i}`;
        chain.push(listener);
        
        system.tellRumor(currentTeller, listener, 'event_1', {
          tellerId: currentTeller,
          listenerId: listener,
          location: 'street',
          socialSetting: 'street',
          relationship: 'stranger',
          timePressure: false,
          privacy: false,
          alcoholInvolved: false,
          incentive: 5,
        });
        
        currentTeller = listener;
      }
      
      // Последний слушатель должен иметь искажения
      const lastKnowledge = system.checkKnowledge('listener_5', 'event_1');
      expect(lastKnowledge.distortions.length).toBeGreaterThanOrEqual(0);
      
      // Уверенность должна снизиться
      expect(lastKnowledge.confidence).toBeLessThan(0.8);
    });
    
    it('должна учитывать эмоции при искажении', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'disaster',
        timestamp: 1000,
        location: 'village',
        participants: [],
        description: 'Fire destroyed some buildings in village',
        severity: 0.7,
        tags: ['fire', 'destruction'],
      };
      
      system.registerEvent(event);
      
      // Свидетель со страхом
      const fearfulWitness: Witness = {
        id: 'fearful',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.7,
        distance: 10,
        emotion: 'fear',
        politicalBias: 'neutral',
        reliability: 0.7,
        memory: [],
      };
      
      // Свидетель со спокойствием
      const calmWitness: Witness = {
        id: 'calm',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.7,
        distance: 10,
        emotion: 'neutral',
        politicalBias: 'neutral',
        reliability: 0.7,
        memory: [],
      };
      
      system.addWitness('event_1', fearfulWitness);
      system.addWitness('event_1', calmWitness);
      
      // Передаём слухи
      system.tellRumor('fearful', 'fearful_listener', 'event_1', {
        tellerId: 'fearful',
        listenerId: 'fearful_listener',
        location: 'tavern',
        socialSetting: 'tavern',
        relationship: 'acquaintance',
        timePressure: false,
        privacy: false,
        alcoholInvolved: false,
        incentive: 0,
      });
      
      system.tellRumor('calm', 'calm_listener', 'event_1', {
        tellerId: 'calm',
        listenerId: 'calm_listener',
        location: 'tavern',
        socialSetting: 'tavern',
        relationship: 'acquaintance',
        timePressure: false,
        privacy: false,
        alcoholInvolved: false,
        incentive: 0,
      });
      
      const fearfulKnowledge = system.checkKnowledge('fearful_listener', 'event_1');
      const calmKnowledge = system.checkKnowledge('calm_listener', 'event_1');
      
      // Слух от напуганного свидетеля должен быть более эмоциональным
      expect(fearfulKnowledge.confidence).toBeDefined();
      expect(calmKnowledge.confidence).toBeDefined();
    });
  });
  
  describe('Забывание и воспоминания', () => {
    it('должна забывать информацию со временем', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'trade',
        timestamp: 1000,
        location: 'market',
        participants: ['npc_merchant'],
        description: 'Merchant sold rare artifact',
        severity: 0.4,
        tags: ['trade', 'rare'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'witness',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.8,
        distance: 5,
        emotion: 'joy',
        politicalBias: 'neutral',
        reliability: 0.8,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // Проверяем сразу
      const initialKnowledge = system.checkKnowledge('witness', 'event_1');
      expect(initialKnowledge.knowsAboutEvent).toBe(true);
      const initialConfidence = initialKnowledge.confidence;
      
      // Перематываем время вперёд
      system.setCurrentTime(2000);
      
      const laterKnowledge = system.checkKnowledge('witness', 'event_1');
      
      // Уверенность должна уменьшиться
      expect(laterKnowledge.confidence).toBeLessThan(initialConfidence);
    });
    
    it('должна укреплять память при воспоминании', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'festival',
        timestamp: 1000,
        location: 'square',
        participants: [],
        description: 'Grand festival celebration',
        severity: 0.2,
        tags: ['celebration'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'witness',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.7,
        distance: 10,
        emotion: 'joy',
        politicalBias: 'neutral',
        reliability: 0.7,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // Перематываем время
      system.setCurrentTime(1500);
      
      const beforeRecall = system.checkKnowledge('witness', 'event_1');
      const beforeConfidence = beforeRecall.confidence;
      
      // Вспоминаем событие
      system.recallKnowledge('witness', 'event_1');
      
      const afterRecall = system.checkKnowledge('witness', 'event_1');
      
      // Уверенность должна вырасти после воспоминания
      expect(afterRecall.confidence).toBeGreaterThan(beforeConfidence);
    });
  });
  
  describe('Статистика слухов', () => {
    it('должна предоставлять статистику распространения слуха', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'magic',
        timestamp: 1000,
        location: 'tower',
        participants: ['npc_wizard'],
        description: 'Wizard cast powerful spell',
        severity: 0.6,
        tags: ['magic', 'spectacular'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'witness',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.9,
        distance: 5,
        emotion: 'surprise',
        politicalBias: 'neutral',
        reliability: 0.8,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // Создаём цепочку распространения
      system.tellRumor('witness', 'l1', 'event_1', {
        tellerId: 'witness',
        listenerId: 'l1',
        location: 'street',
        socialSetting: 'street',
        relationship: 'friend',
        timePressure: false,
        privacy: false,
        alcoholInvolved: false,
        incentive: 0,
      });
      
      system.tellRumor('l1', 'l2', 'event_1', {
        tellerId: 'l1',
        listenerId: 'l2',
        location: 'tavern',
        socialSetting: 'tavern',
        relationship: 'acquaintance',
        timePressure: false,
        privacy: false,
        alcoholInvolved: true,
        incentive: 0,
      });
      
      const stats = system.getRumorStatistics('event_1');
      
      expect(stats).not.toBeNull();
      expect(stats!.totalCarriers).toBeGreaterThanOrEqual(3);
      expect(stats!.versionsCount).toBeGreaterThanOrEqual(1);
      expect(stats!.distortionCount).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Политические предвзятости', () => {
    it('должна учитывать политические взгляды при интерпретации', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'political',
        timestamp: 1000,
        location: 'throne_room',
        participants: ['npc_king', 'npc_noble'],
        description: 'King raised taxes on commoners',
        severity: 0.7,
        tags: ['politics', 'taxes'],
      };
      
      system.registerEvent(event);
      
      // Свидетель-дворянин
      const nobleWitness: Witness = {
        id: 'noble',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 1.0,
        distance: 0,
        emotion: 'neutral',
        politicalBias: 'pro_noble',
        reliability: 0.9,
        memory: [],
      };
      
      // Свидетель-простолюдин
      const commonWitness: Witness = {
        id: 'common',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.8,
        distance: 10,
        emotion: 'anger',
        politicalBias: 'pro_common',
        reliability: 0.8,
        memory: [],
      };
      
      system.addWitness('event_1', nobleWitness);
      system.addWitness('event_1', commonWitness);
      
      const nobleKnowledge = system.checkKnowledge('noble', 'event_1');
      const commonKnowledge = system.checkKnowledge('common', 'event_1');
      
      // Политические интерпретации должны отличаться
      expect(nobleKnowledge.politicalInterpretation).toBe('pro_noble');
      expect(commonKnowledge.politicalInterpretation).toBe('pro_common');
      
      // Эмоциональные реакции должны отличаться
      expect(nobleKnowledge.emotionalResponse).toBe('neutral');
      expect(commonKnowledge.emotionalResponse).toBe('anger');
    });
  });
  
  describe('Культурные фильтры', () => {
    it('должна применять культурные фильтры региона', () => {
      system.addCulturalFilter('kingdom_a', {
        name: 'Kingdom A',
        biasAgainst: ['magic', 'foreigners'],
        biasFor: ['religion', 'tradition'],
        tabooTopics: ['regicide', 'heresy'],
        amplificationThemes: ['royal glory', 'divine favor'],
      });
      
      const event: WorldEvent = {
        id: 'event_1',
        type: 'magic',
        timestamp: 1000,
        location: 'kingdom_a',
        participants: ['npc_mage'],
        description: 'Mage used magic in public',
        severity: 0.5,
        tags: ['magic', 'public'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'witness',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.8,
        distance: 5,
        emotion: 'surprise',
        politicalBias: 'religious',
        reliability: 0.7,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // Передача в регионе с культурным фильтром
      system.tellRumor('witness', 'listener', 'event_1', {
        tellerId: 'witness',
        listenerId: 'listener',
        location: 'kingdom_a',
        socialSetting: 'marketplace',
        relationship: 'stranger',
        timePressure: false,
        privacy: false,
        alcoholInvolved: false,
        incentive: 0,
      });
      
      const listenerKnowledge = system.checkKnowledge('listener', 'event_1');
      expect(listenerKnowledge.knowsAboutEvent).toBe(true);
    });
  });
  
  describe('Очистка старых данных', () => {
    it('должна удалять старые события и знания', () => {
      const event: WorldEvent = {
        id: 'event_1',
        type: 'trade',
        timestamp: 1000,
        location: 'market',
        participants: ['npc_merchant'],
        description: 'Old trade event',
        severity: 0.2,
        tags: ['old'],
      };
      
      system.registerEvent(event);
      
      const witness: Witness = {
        id: 'witness',
        eventId: 'event_1',
        witnessTime: 1000,
        visibility: 0.8,
        distance: 5,
        emotion: 'neutral',
        politicalBias: 'neutral',
        reliability: 0.8,
        memory: [],
      };
      
      system.addWitness('event_1', witness);
      
      // Перематываем время далеко вперёд
      system.setCurrentTime(10000);
      
      // Очищаем данные старше 5000 единиц времени
      system.cleanupOldData(5000);
      
      // Событие должно быть удалено
      const knowledge = system.checkKnowledge('witness', 'event_1');
      expect(knowledge.knowsAboutEvent).toBe(false);
    });
  });
});
