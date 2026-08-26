/**
 * Этап 15: PERSONALITY + MEMORY
 * 
 * Модель личности NPC на основе Big Five + дополнительные черты
 */

export type TemperamentType = 'sanguine' | 'choleric' | 'melancholic' | 'phlegmatic';

export interface PersonalityTraits {
  // Big Five модель
  openness: number;        // Открытость опыту (0-1)
  conscientiousness: number; // Добросовестность (0-1)
  extraversion: number;    // Экстраверсия (0-1)
  agreeableness: number;   // Доброжелательность (0-1)
  neuroticism: number;     // Невротизм (0-1)
  
  // Дополнительные черты
  courage: number;         // Храбрость (0-1)
  greed: number;           // Жадность (0-1)
  honesty: number;         // Честность (0-1)
  loyalty: number;         // Лояльность (0-1)
  ambition: number;        // Амбициозность (0-1)
  empathy: number;         // Эмпатия (0-1)
  aggression: number;      // Агрессивность (0-1)
  patience: number;        // Терпеливость (0-1)
}

export interface Fear {
  id: string;
  type: FearType;
  intensity: number;       // 0-1, сила страха
  source?: string;         // Что вызвало страх
  acquiredAt?: number;     // Timestamp получения
}

export type FearType = 
  | 'death'
  | 'pain'
  | 'darkness'
  | 'heights'
  | 'water'
  | 'fire'
  | 'spiders'
  | 'snakes'
  | 'crowds'
  | 'loneliness'
  | 'failure'
  | 'poverty'
  | 'betrayal'
  | 'war'
  | 'magic'
  | 'specific_npc'
  | 'specific_location';

export interface Value {
  id: string;
  name: string;
  priority: number;        // 1-10, важность ценности
  description: string;
}

export type ValueType = 
  | 'family'
  | 'honor'
  | 'wealth'
  | 'power'
  | 'knowledge'
  | 'freedom'
  | 'tradition'
  | 'justice'
  | 'faith'
  | 'loyalty'
  | 'survival'
  | 'pleasure'
  | 'revenge';

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'situational';
  trigger?: string;        // Что запускает привычку
  reward?: string;         // Какое удовлетворение дает
}

export interface Personality {
  temperament: TemperamentType;
  traits: PersonalityTraits;
  fears: Fear[];
  values: Value[];
  habits: Habit[];
  
  // Динамические предпочтения
  sympathies: Map<string, number>;  // NPC ID -> уровень симпатии (-1 до 1)
  antipathies: Map<string, number>; // NPC ID -> уровень антипатии (-1 до 1)
  
  // Влияние на поведение
  getBehaviorModifier(context: string): number;
}

export function createPersonality(
  temperament: TemperamentType,
  traits: Partial<PersonalityTraits> = {}
): Personality {
  const defaultTraits: PersonalityTraits = {
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5,
    courage: 0.5,
    greed: 0.5,
    honesty: 0.5,
    loyalty: 0.5,
    ambition: 0.5,
    empathy: 0.5,
    aggression: 0.5,
    patience: 0.5,
  };

  const personality: Personality = {
    temperament,
    traits: { ...defaultTraits, ...traits },
    fears: [],
    values: [],
    habits: [],
    sympathies: new Map(),
    antipathies: new Map(),
    
    getBehaviorModifier(context: string): number {
      let modifier = 1.0;
      
      // Влияние темперамента
      switch (this.temperament) {
        case 'sanguine':
          if (context === 'social') modifier *= 1.2;
          break;
        case 'choleric':
          if (context === 'conflict') modifier *= 1.3;
          break;
        case 'melancholic':
          if (context === 'analysis') modifier *= 1.2;
          break;
        case 'phlegmatic':
          if (context === 'patience') modifier *= 1.3;
          break;
      }
      
      // Влияние черт
      if (context === 'risk' && this.traits.courage < 0.3) modifier *= 0.7;
      if (context === 'trade' && this.traits.greed > 0.7) modifier *= 1.2;
      if (context === 'help' && this.traits.empathy > 0.7) modifier *= 1.3;
      if (context === 'fight' && this.traits.aggression > 0.7) modifier *= 1.2;
      
      // Влияние страхов
      for (const fear of this.fears) {
        if (fear.intensity > 0.8 && context.includes(fear.type)) {
          modifier *= 0.5;
        }
      }
      
      return modifier;
    },
  };

  return personality;
}

export function addFear(personality: Personality, fear: Fear): void {
  personality.fears.push(fear);
}

export function addValue(personality: Personality, value: Value): void {
  personality.values.push(value);
}

export function addHabit(personality: Personality, habit: Habit): void {
  personality.habits.push(habit);
}

export function updateSympathy(
  personality: Personality, 
  targetId: string, 
  delta: number
): void {
  const current = personality.sympathies.get(targetId) || 0;
  const newValue = Math.max(-1, Math.min(1, current + delta));
  
  if (newValue > 0) {
    personality.sympathies.set(targetId, newValue);
    // Уменьшаем антипатию если есть симпатия
    if (personality.antipathies.has(targetId)) {
      const anti = personality.antipathies.get(targetId)!;
      if (anti > 0) {
        personality.antipathies.set(targetId, Math.max(0, anti - delta));
      }
    }
  } else if (newValue < 0) {
    personality.antipathies.set(targetId, Math.abs(newValue));
    if (personality.sympathies.has(targetId)) {
      personality.sympathies.delete(targetId);
    }
  } else {
    personality.sympathies.delete(targetId);
    personality.antipathies.delete(targetId);
  }
}

export function serializePersonality(personality: Personality): object {
  return {
    temperament: personality.temperament,
    traits: personality.traits,
    fears: personality.fears,
    values: personality.values,
    habits: personality.habits,
    sympathies: Array.from(personality.sympathies.entries()),
    antipathies: Array.from(personality.antipathies.entries()),
  };
}

export function deserializePersonality(data: any): Personality {
  const personality = createPersonality(data.temperament, data.traits);
  personality.fears = data.fears || [];
  personality.values = data.values || [];
  personality.habits = data.habits || [];
  personality.sympathies = new Map(data.sympathies || []);
  personality.antipathies = new Map(data.antipathies || []);
  return personality;
}
