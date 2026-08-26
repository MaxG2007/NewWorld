/**
 * Этап 15: PERSONALITY + MEMORY
 * 
 * Система памяти NPC
 * NPC не знает то, чего никогда не видел, не слышал и не узнал
 */

export interface Memory {
  id: string;
  event: MemoryEvent;
  importance: number;        // 0-1, важность события
  emotionalWeight: number;   // -1 до 1, эмоциональная окраска
  source: MemorySource;      // Откуда получена информация
  timestamp: number;         // Когда произошло
  confidence: number;        // 0-1, уверенность в достоверности
  
  // Метаданные
  relatedNPCs?: string[];    // ID других участников
  location?: string;         // Где произошло
  decayRate?: number;        // Как быстро забывается (0-1)
  lastRecalled?: number;     // Когда вспоминалось последний раз
}

export interface MemoryEvent {
  id: string;
  type: EventType;
  description: string;
  participants: string[];    // ID участников
  outcome?: string;          // Результат события
  consequences?: string[];   // Последствия
}

export type EventType =
  | 'birth'
  | 'death'
  | 'meeting'
  | 'conversation'
  | 'trade'
  | 'fight'
  | 'help'
  | 'betrayal'
  | 'gift'
  | 'insult'
  | 'promise'
  | 'secret'
  | 'crime'
  | 'punishment'
  | 'celebration'
  | 'disaster'
  | 'discovery'
  | 'learning'
  | 'journey'
  | 'illness'
  | 'marriage'
  | 'birth_child';

export type MemorySource =
  | 'personal_experience'    // Личный опыт
  | 'observation'           // Наблюдение
  | 'hearsay'              // Слухи
  | 'trusted_source'       // Доверенный источник
  | 'book'                 // Книга
  | 'dream'                // Сон/видение
  | 'magic'                // Магическое знание
  | 'revelation';          // Откровение

export interface Knowledge {
  id: string;
  type: KnowledgeType;
  content: string;
  confidence: number;        // 0-1, уверенность
  source: MemorySource;
  acquiredAt: number;
  lastUsed?: number;
  
  // Контекст знания
  category?: string;
  tags?: string[];
  relatedMemories?: string[];
}

export type KnowledgeType =
  | 'fact'                  // Факт о мире
  | 'skill'                 // Навык
  | 'recipe'                // Рецепт
  | 'location'              // Информация о месте
  | 'person'                // Информация о человеке
  | 'rumor'                 // Слух
  | 'secret'                // Секрет
  | 'law'                   // Закон
  | 'history'               // Историческое знание
  | 'culture'               // Культурное знание
  | 'language'              // Язык/диалект;

export interface MemorySystem {
  memories: Map<string, Memory>;
  knowledge: Map<string, Knowledge>;
  
  // Фильтры доступа к информации
  canKnow(npcId: string, information: string): boolean;
  addMemory(memory: Memory): void;
  addKnowledge(knowledge: Knowledge): void;
  getMemories(filters?: MemoryFilters): Memory[];
  getKnowledge(filters?: KnowledgeFilters): Knowledge[];
  forget(memoryId: string): void;
  recall(memoryId: string): Memory | null;
  
  // Симуляция ограничений знания
  hasDirectExperience(event: string): boolean;
  hasHeardAbout(event: string): boolean;
  knowsTruthfully(fact: string): boolean;
}

export interface MemoryFilters {
  type?: EventType;
  importanceMin?: number;
  emotionalWeightMin?: number;
  timeRange?: [number, number];
  relatedNPC?: string;
  location?: string;
}

export interface KnowledgeFilters {
  type?: KnowledgeType;
  confidenceMin?: number;
  category?: string;
  tag?: string;
}

export function createMemorySystem(): MemorySystem {
  const system: MemorySystem = {
    memories: new Map(),
    knowledge: new Map(),
    
    canKnow(npcId: string, information: string): boolean {
      // NPC может знать только то, что имел возможность узнать
      // Проверка на наличие соответствующего опыта или источника
      for (const memory of this.memories.values()) {
        if (memory.event.description.includes(information)) {
          return true;
        }
        if (memory.relatedNPCs?.includes(npcId)) {
          return true;
        }
      }
      
      for (const know of this.knowledge.values()) {
        if (know.content.includes(information)) {
          return true;
        }
      }
      
      return false;
    },
    
    addMemory(memory: Memory): void {
      // Валидация: память должна иметь источник
      if (!memory.source) {
        console.warn('Memory without source rejected');
        return;
      }
      
      this.memories.set(memory.id, memory);
    },
    
    addKnowledge(knowledge: Knowledge): void {
      // Валидация: знание должно иметь источник
      if (!knowledge.source) {
        console.warn('Knowledge without source rejected');
        return;
      }
      
      this.knowledge.set(knowledge.id, knowledge);
    },
    
    getMemories(filters?: MemoryFilters): Memory[] {
      let result = Array.from(this.memories.values());
      
      if (filters) {
        if (filters.type) {
          result = result.filter(m => m.event.type === filters.type);
        }
        if (filters.importanceMin !== undefined) {
          result = result.filter(m => m.importance >= filters.importanceMin!);
        }
        if (filters.emotionalWeightMin !== undefined) {
          result = result.filter(m => m.emotionalWeight >= filters.emotionalWeightMin!);
        }
        if (filters.timeRange) {
          result = result.filter(m => 
            m.timestamp >= filters.timeRange![0] && 
            m.timestamp <= filters.timeRange![1]
          );
        }
        if (filters.relatedNPC) {
          result = result.filter(m => 
            m.relatedNPCs?.includes(filters.relatedNPC!)
          );
        }
        if (filters.location) {
          result = result.filter(m => m.location === filters.location);
        }
      }
      
      return result;
    },
    
    getKnowledge(filters?: KnowledgeFilters): Knowledge[] {
      let result = Array.from(this.knowledge.values());
      
      if (filters) {
        if (filters.type) {
          result = result.filter(k => k.type === filters.type);
        }
        if (filters.confidenceMin !== undefined) {
          result = result.filter(k => k.confidence >= filters.confidenceMin!);
        }
        if (filters.category) {
          result = result.filter(k => k.category === filters.category);
        }
        if (filters.tag) {
          result = result.filter(k => k.tags?.includes(filters.tag!));
        }
      }
      
      return result;
    },
    
    forget(memoryId: string): void {
      this.memories.delete(memoryId);
    },
    
    recall(memoryId: string): Memory | null {
      const memory = this.memories.get(memoryId);
      if (memory) {
        memory.lastRecalled = Date.now();
        // Увеличиваем уверенность при воспоминании
        memory.confidence = Math.min(1, memory.confidence + 0.05);
      }
      return memory || null;
    },
    
    hasDirectExperience(event: string): boolean {
      for (const memory of this.memories.values()) {
        if (memory.source === 'personal_experience' && 
            memory.event.description.includes(event)) {
          return true;
        }
      }
      return false;
    },
    
    hasHeardAbout(event: string): boolean {
      for (const memory of this.memories.values()) {
        if ((memory.source === 'hearsay' || memory.source === 'trusted_source') &&
            memory.event.description.includes(event)) {
          return true;
        }
      }
      return false;
    },
    
    knowsTruthfully(fact: string): boolean {
      for (const know of this.knowledge.values()) {
        if (know.content.includes(fact) && know.confidence > 0.9) {
          return true;
        }
      }
      
      for (const memory of this.memories.values()) {
        if (memory.source === 'personal_experience' &&
            memory.confidence > 0.9 &&
            memory.event.description.includes(fact)) {
          return true;
        }
      }
      
      return false;
    },
  };
  
  return system;
}

export function createMemory(
  event: MemoryEvent,
  importance: number,
  emotionalWeight: number,
  source: MemorySource,
  timestamp: number,
  confidence: number = 1.0,
  relatedNPCs?: string[],
  location?: string
): Memory {
  return {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    event,
    importance: Math.max(0, Math.min(1, importance)),
    emotionalWeight: Math.max(-1, Math.min(1, emotionalWeight)),
    source,
    timestamp,
    confidence: Math.max(0, Math.min(1, confidence)),
    relatedNPCs,
    location,
    decayRate: 0.01, // Базовая скорость забывания
  };
}

export function createKnowledge(
  type: KnowledgeType,
  content: string,
  source: MemorySource,
  confidence: number = 1.0,
  category?: string,
  tags?: string[]
): Knowledge {
  return {
    id: `know_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    confidence: Math.max(0, Math.min(1, confidence)),
    source,
    acquiredAt: Date.now(),
    category,
    tags,
    relatedMemories: [],
  };
}

export function simulateMemoryDecay(
  system: MemorySystem,
  deltaTime: number
): void {
  const memoriesToDelete: string[] = [];
  
  for (const [id, memory] of system.memories.entries()) {
    // Уменьшаем уверенность со временем
    const decay = (memory.decayRate || 0.01) * deltaTime;
    memory.confidence = Math.max(0, memory.confidence - decay);
    
    // Если уверенность упала до нуля - забываем
    if (memory.confidence <= 0) {
      memoriesToDelete.push(id);
    }
    
    // Важные воспоминаются чаще и забываются медленнее
    if (memory.importance > 0.8) {
      memory.decayRate = Math.max(0.001, (memory.decayRate || 0.01) * 0.5);
    }
  }
  
  for (const id of memoriesToDelete) {
    system.forget(id);
  }
}

export function serializeMemorySystem(system: MemorySystem): object {
  return {
    memories: Array.from(system.memories.entries()),
    knowledge: Array.from(system.knowledge.entries()),
  };
}

export function deserializeMemorySystem(data: any): MemorySystem {
  const system = createMemorySystem();
  
  if (data.memories) {
    for (const [id, memory] of data.memories) {
      system.memories.set(id, memory);
    }
  }
  
  if (data.knowledge) {
    for (const [id, knowledge] of data.knowledge) {
      system.knowledge.set(id, knowledge);
    }
  }
  
  return system;
}
