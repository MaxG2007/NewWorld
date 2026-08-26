/**
 * Этап 15: PERSONALITY + MEMORY - Тесты
 */

import { describe, it, expect } from 'vitest';
import { 
  createPersonality, 
  addFear, 
  addValue, 
  addHabit, 
  updateSympathy,
  serializePersonality,
  deserializePersonality
} from '../../src/simulation/personality/Personality';
import {
  createMemorySystem,
  createMemory,
  createKnowledge,
  simulateMemoryDecay,
  serializeMemorySystem,
  deserializeMemorySystem
} from '../../src/entities/memory/MemorySystem';

describe('Этап 15: PERSONALITY + MEMORY', () => {
  
  describe('Personality System', () => {
    
    it('должен создавать личность с характером и темпераментом', () => {
      const personality = createPersonality('sanguine');
      
      expect(personality.temperament).toBe('sanguine');
      expect(personality.traits.openness).toBeDefined();
      expect(personality.traits.extraversion).toBeDefined();
      expect(personality.traits.courage).toBeDefined();
    });
    
    it('должен добавлять страхи', () => {
      const personality = createPersonality('melancholic');
      
      addFear(personality, {
        id: 'fear_1',
        type: 'spiders',
        intensity: 0.9,
        source: 'traumatic_event',
        acquiredAt: Date.now(),
      });
      
      expect(personality.fears.length).toBe(1);
      expect(personality.fears[0].type).toBe('spiders');
      expect(personality.fears[0].intensity).toBe(0.9);
    });
    
    it('должен добавлять ценности', () => {
      const personality = createPersonality('choleric');
      
      addValue(personality, {
        id: 'value_1',
        name: 'Honor',
        priority: 9,
        description: 'Честь превыше всего',
      });
      
      expect(personality.values.length).toBe(1);
      expect(personality.values[0].priority).toBe(9);
    });
    
    it('должен добавлять привычки', () => {
      const personality = createPersonality('phlegmatic');
      
      addHabit(personality, {
        id: 'habit_1',
        name: 'Morning Reading',
        description: 'Чтение книг каждое утро',
        frequency: 'daily',
        trigger: 'waking_up',
        reward: 'knowledge',
      });
      
      expect(personality.habits.length).toBe(1);
      expect(personality.habits[0].frequency).toBe('daily');
    });
    
    it('должен обновлять симпатии и антипатии', () => {
      const personality = createPersonality('sanguine');
      const targetId = 'npc_123';
      
      // Добавляем симпатию
      updateSympathy(personality, targetId, 0.5);
      expect(personality.sympathies.get(targetId)).toBe(0.5);
      expect(personality.antipathies.has(targetId)).toBe(false);
      
      // Усиливаем симпатию
      updateSympathy(personality, targetId, 0.3);
      expect(personality.sympathies.get(targetId)).toBe(0.8);
      
      // Превращаем в антипатию
      updateSympathy(personality, targetId, -0.9);
      expect(personality.sympathies.has(targetId)).toBe(false);
      expect(personality.antipathies.get(targetId)).toBeCloseTo(0.1, 5);
    });
    
    it('должен рассчитывать модификаторы поведения', () => {
      const personality = createPersonality('choleric', {
        courage: 0.8,
        aggression: 0.9,
      });
      
      // Холерик в конфликте
      const conflictMod = personality.getBehaviorModifier('conflict');
      expect(conflictMod).toBeGreaterThan(1.0);
      
      // Агрессивный в бою
      const fightMod = personality.getBehaviorModifier('fight');
      expect(fightMod).toBeGreaterThan(1.0);
    });
    
    it('должен сериализовать и десериализовать личность', () => {
      const original = createPersonality('sanguine', {
        openness: 0.7,
        extraversion: 0.9,
      });
      
      addFear(original, {
        id: 'fear_1',
        type: 'darkness',
        intensity: 0.6,
      });
      
      const serialized = serializePersonality(original);
      const deserialized = deserializePersonality(serialized);
      
      expect(deserialized.temperament).toBe(original.temperament);
      expect(deserialized.traits.openness).toBe(original.traits.openness);
      expect(deserialized.fears.length).toBe(original.fears.length);
    });
  });
  
  describe('Memory System', () => {
    
    it('должен создавать систему памяти', () => {
      const system = createMemorySystem();
      
      expect(system.memories.size).toBe(0);
      expect(system.knowledge.size).toBe(0);
    });
    
    it('должен добавлять воспоминания с источником', () => {
      const system = createMemorySystem();
      
      const memory = createMemory(
        {
          id: 'event_1',
          type: 'meeting',
          description: 'Встреча с незнакомцем',
          participants: ['npc_1'],
        },
        0.7,  // importance
        0.3,  // emotionalWeight
        'personal_experience',
        Date.now()
      );
      
      system.addMemory(memory);
      
      expect(system.memories.size).toBe(1);
      expect(system.memories.get(memory.id)?.source).toBe('personal_experience');
    });
    
    it('должен отклонять воспоминания без источника', () => {
      const system = createMemorySystem();
      
      const badMemory = {
        id: 'bad_mem',
        event: {
          id: 'event_bad',
          type: 'meeting' as const,
          description: 'Test',
          participants: [],
        },
        importance: 0.5,
        emotionalWeight: 0,
        timestamp: Date.now(),
        confidence: 1,
      } as any;
      
      // @ts-ignore - намеренно пропускаем source
      delete badMemory.source;
      
      system.addMemory(badMemory);
      
      expect(system.memories.size).toBe(0);
    });
    
    it('должен добавлять знания с источником', () => {
      const system = createMemorySystem();
      
      const knowledge = createKnowledge(
        'fact',
        'Король живет в замке',
        'observation',
        0.95,
        'politics',
        ['king', 'castle']
      );
      
      system.addKnowledge(knowledge);
      
      expect(system.knowledge.size).toBe(1);
      expect(system.knowledge.get(knowledge.id)?.confidence).toBe(0.95);
    });
    
    it('должен фильтровать воспоминания', () => {
      const system = createMemorySystem();
      
      system.addMemory(createMemory(
        { id: 'e1', type: 'meeting', description: 'Meeting', participants: [] },
        0.8, 0.5, 'personal_experience', Date.now()
      ));
      
      system.addMemory(createMemory(
        { id: 'e2', type: 'fight', description: 'Fight', participants: [] },
        0.9, 0.8, 'personal_experience', Date.now()
      ));
      
      // Фильтр по типу
      const fights = system.getMemories({ type: 'fight' });
      expect(fights.length).toBe(1);
      
      // Фильтр по важности
      const important = system.getMemories({ importanceMin: 0.85 });
      expect(important.length).toBe(1);
    });
    
    it('должен проверять наличие прямого опыта', () => {
      const system = createMemorySystem();
      
      system.addMemory(createMemory(
        { id: 'e1', type: 'fight', description: 'Битва с драконом', participants: [] },
        1.0, 0.9, 'personal_experience', Date.now()
      ));
      
      system.addMemory(createMemory(
        { id: 'e2', type: 'meeting', description: 'Слух о драконе', participants: [] },
        0.5, 0.2, 'hearsay', Date.now()
      ));
      
      expect(system.hasDirectExperience('дракон')).toBe(true);
      expect(system.hasHeardAbout('дракон')).toBe(true);
    });
    
    it('должен проверять истинность знаний', () => {
      const system = createMemorySystem();
      
      system.addKnowledge(createKnowledge(
        'fact',
        'Земля круглая',
        'book',
        0.95
      ));
      
      system.addKnowledge(createKnowledge(
        'rumor',
        'Король - дракон',
        'hearsay',
        0.3
      ));
      
      expect(system.knowsTruthfully('Земля круглая')).toBe(true);
      expect(system.knowsTruthfully('Король - дракон')).toBe(false);
    });
    
    it('должен симулировать забывание', () => {
      const system = createMemorySystem();
      
      const memory = createMemory(
        { id: 'e1', type: 'meeting', description: 'Meeting', participants: [] },
        0.3,  // Низкая важность = быстрое забывание
        0.1,
        'observation',
        Date.now(),
        0.8   // Начальная уверенность (выше чтобы не забыть полностью)
      );
      memory.decayRate = 0.02; // Умеренная скорость забывания
      
      system.addMemory(memory);
      
      const initialConfidence = memory.confidence;
      
      // Симулируем время
      simulateMemoryDecay(system, 10);
      
      const updated = system.memories.get(memory.id);
      expect(updated).toBeDefined();
      if (updated) {
        expect(updated.confidence).toBeLessThan(initialConfidence);
      }
    });
    
    it('должен вспоминать воспоминания', () => {
      const system = createMemorySystem();
      
      const memory = createMemory(
        { id: 'e1', type: 'meeting', description: 'Meeting', participants: [] },
        0.7, 0.5, 'personal_experience', Date.now(), 0.8
      );
      
      system.addMemory(memory);
      
      const recalled = system.recall(memory.id);
      
      expect(recalled).not.toBeNull();
      expect(recalled?.confidence).toBeGreaterThan(0.8);
      expect(recalled?.lastRecalled).toBeDefined();
    });
    
    it('должен сериализовать и десериализовать систему памяти', () => {
      const original = createMemorySystem();
      
      original.addMemory(createMemory(
        { id: 'e1', type: 'birth', description: 'Рождение', participants: ['npc_1'] },
        1.0, 0.8, 'personal_experience', Date.now()
      ));
      
      original.addKnowledge(createKnowledge(
        'fact',
        'Test fact',
        'observation',
        0.9
      ));
      
      const serialized = serializeMemorySystem(original);
      const deserialized = deserializeMemorySystem(serialized);
      
      expect(deserialized.memories.size).toBe(original.memories.size);
      expect(deserialized.knowledge.size).toBe(original.knowledge.size);
    });
    
    it('NPC не должен знать то, чего не видел', () => {
      const system = createMemorySystem();
      
      // NPC знает только из слухов
      system.addMemory(createMemory(
        { id: 'e1', type: 'disaster', description: 'Пожар в далеком городе', participants: [] },
        0.6, 0.4, 'hearsay', Date.now(), 0.5
      ));
      
      expect(system.hasDirectExperience('Пожар')).toBe(false);
      expect(system.hasHeardAbout('Пожар')).toBe(true);
      expect(system.knowsTruthfully('Пожар')).toBe(false);
    });
  });
});
