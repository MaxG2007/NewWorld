/**
 * Этап 16 — NPC SIMULATION
 * Симуляция жизненного цикла NPC
 */

export interface LifeState {
  energy: number;        // 0-100
  hunger: number;        // 0-100
  health: number;        // 0-100
  happiness: number;     // 0-100
  socialNeed: number;    // 0-100
}

export interface LifeEvent {
  type: 'birth' | 'death' | 'marriage' | 'divorce' | 'job_change' | 'move' | 'crime' | 'travel';
  timestamp: number;
  description: string;
  participants: string[];
  impact: {
    health?: number;
    happiness?: number;
    wealth?: number;
    reputation?: number;
  };
}

export class LifeSimulation {
  private lifeStates: Map<string, LifeState> = new Map();
  private lifeEvents: Map<string, LifeEvent[]> = new Map();
  private calendar: any;
  private weatherSystem: any;

  constructor(calendar: any, weatherSystem: any) {
    this.calendar = calendar;
    this.weatherSystem = weatherSystem;
  }

  /**
   * Инициализирует состояние жизни для NPC
   */
  initializeLife(npcId: string): void {
    this.lifeStates.set(npcId, {
      energy: 100,
      hunger: 0,
      health: 100,
      happiness: 75,
      socialNeed: 50
    });
    this.lifeEvents.set(npcId, []);
  }

  /**
   * Обновляет состояние NPC за один тик симуляции
   */
  update(npc: any, deltaTime: number): void {
    const state = this.lifeStates.get(npc.id);
    if (!state) return;

    const weather = this.weatherSystem.getCurrentWeather(npc.location);
    const currentActivity = npc.currentActivity || 'idle';

    // Обновление потребностей
    this.updateNeeds(state, deltaTime, currentActivity);

    // Применение эффектов активности
    this.applyActivityEffects(state, currentActivity, deltaTime);

    // Применение эффектов погоды
    this.applyWeatherEffects(state, weather, deltaTime);

    // Проверка на смерть от старости
    this.checkDeath(npc, state);

    // Старение
    this.aging(npc, deltaTime);
  }

  /**
   * Обновляет потребности NPC
   */
  private updateNeeds(state: LifeState, deltaTime: number, activity: string): void {
    // Голод растет со временем
    state.hunger += deltaTime * 0.5;
    if (state.hunger > 100) state.hunger = 100;

    // Энергия тратится на активность
    if (activity === 'work' || activity === 'travel') {
      state.energy -= deltaTime * 0.8;
    } else if (activity === 'sleep') {
      state.energy += deltaTime * 1.5;
      state.hunger += deltaTime * 0.3; // Во сне тоже голодаем
    } else if (activity === 'breakfast' || activity === 'lunch' || activity === 'dinner') {
      state.hunger -= deltaTime * 2;
      state.energy += deltaTime * 0.5;
    }

    // Социальная потребность
    if (activity === 'socialize' || activity === 'market') {
      state.socialNeed += deltaTime * 0.7;
    } else {
      state.socialNeed -= deltaTime * 0.2;
    }

    // Ограничения
    state.energy = Math.max(0, Math.min(100, state.energy));
    state.hunger = Math.max(0, Math.min(100, state.hunger));
    state.socialNeed = Math.max(0, Math.min(100, state.socialNeed));

    // Влияние на счастье
    if (state.hunger > 80) state.happiness -= deltaTime * 0.3;
    if (state.energy < 20) state.happiness -= deltaTime * 0.2;
    if (state.socialNeed < 30) state.happiness -= deltaTime * 0.2;
  }

  /**
   * Применяет эффекты активности
   */
  private applyActivityEffects(state: LifeState, activity: string, deltaTime: number): void {
    switch (activity) {
      case 'work':
        state.happiness += deltaTime * 0.1; // Удовлетворение от работы
        break;
      case 'leisure':
        state.happiness += deltaTime * 0.4;
        state.energy -= deltaTime * 0.3;
        break;
      case 'prayer':
        state.happiness += deltaTime * 0.3;
        state.socialNeed += deltaTime * 0.2;
        break;
      case 'crime':
        state.happiness += deltaTime * 0.2; // Азарт
        state.health -= deltaTime * 0.1;    // Риск получить травму
        break;
    }

    state.happiness = Math.max(0, Math.min(100, state.happiness));
  }

  /**
   * Применяет эффекты погоды
   */
  private applyWeatherEffects(state: LifeState, weather: any, deltaTime: number): void {
    if (!weather) return;

    if (weather.type === 'storm' || weather.type === 'blizzard') {
      state.happiness -= deltaTime * 0.3;
      state.health -= deltaTime * 0.1;
    }

    if (weather.type === 'rain') {
      state.happiness -= deltaTime * 0.2;
      state.energy -= deltaTime * 0.2;
    }

    if (weather.temperature < 0) {
      state.health -= deltaTime * 0.05; // Холод
    }

    if (weather.temperature > 35) {
      state.energy -= deltaTime * 0.1; // Жара
      state.hunger += deltaTime * 0.2; // Обезвоживание
    }

    state.health = Math.max(0, Math.min(100, state.health));
    state.happiness = Math.max(0, Math.min(100, state.happiness));
  }

  /**
   * Проверяет условие смерти NPC
   */
  private checkDeath(npc: any, state: LifeState): boolean {
    const raceMaxAge = npc.race?.maxAge || 80;
    const isDead = 
      state.health <= 0 ||
      npc.age >= raceMaxAge ||
      (state.hunger >= 100 && state.health <= 10);

    if (isDead) {
      this.recordEvent(npc.id, {
        type: 'death',
        timestamp: this.calendar.getTotalDays ? this.calendar.getTotalDays() : 0,
        description: `${npc.name} умер в возрасте ${Math.floor(npc.age)} лет`,
        participants: [npc.id],
        impact: {
          reputation: -50
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Симулирует старение NPC
   */
  private aging(npc: any, deltaTime: number): void {
    // Каждый день добавляем возраст (упрощенно)
    const ageIncrement = deltaTime / 24; // deltaTime в часах
    npc.age += ageIncrement;

    // Ухудшение характеристик с возрастом
    const adultAge = npc.race?.adultAge || 18;
    if (npc.age > adultAge * 2) {
      // Здесь можно ухудшать физические характеристики
    }
  }

  /**
   * Регистрирует событие в жизни NPC
   */
  recordEvent(npcId: string, event: LifeEvent): void {
    const events = this.lifeEvents.get(npcId) || [];
    events.push(event);
    this.lifeEvents.set(npcId, events);

    // Применяем влияние события
    const state = this.lifeStates.get(npcId);
    if (state && event.impact) {
      if (event.impact.health !== undefined) state.health += event.impact.health;
      if (event.impact.happiness !== undefined) state.happiness += event.impact.happiness;
      if (event.impact.wealth !== undefined) {
        // Изменение богатства
      }
      if (event.impact.reputation !== undefined) {
        // Изменение репутации
      }
    }
  }

  /**
   * Симулирует брак между двумя NPC
   */
  simulateMarriage(npc1: any, npc2: any): void {
    const event: LifeEvent = {
      type: 'marriage',
      timestamp: this.calendar.getTotalDays ? this.calendar.getTotalDays() : 0,
      description: `${npc1.name} и ${npc2.name} поженились`,
      participants: [npc1.id, npc2.id],
      impact: {
        happiness: 20,
        reputation: 5
      }
    };

    this.recordEvent(npc1.id, event);
    this.recordEvent(npc2.id, event);

    // Создаем семейную связь
    // (интеграция с Family системой)
  }

  /**
   * Симулирует преступление
   */
  simulateCrime(perpetrator: any, victim: any | null, crimeType: string): void {
    const event: LifeEvent = {
      type: 'crime',
      timestamp: this.calendar.getTotalDays ? this.calendar.getTotalDays() : 0,
      description: `${perpetrator.name} совершил преступление: ${crimeType}`,
      participants: [perpetrator.id, ...(victim ? [victim.id] : [])],
      impact: {
        happiness: 5,
        reputation: -20,
        health: victim ? -10 : 0
      }
    };

    this.recordEvent(perpetrator.id, event);
    if (victim) {
      this.recordEvent(victim.id, {
        ...event,
        impact: {
          happiness: -40,
          health: -10
        }
      });
    }
  }

  /**
   * Симулирует путешествие NPC
   */
  simulateTravel(npc: any, from: string, to: string): void {
    const event: LifeEvent = {
      type: 'travel',
      timestamp: this.calendar.getTotalDays ? this.calendar.getTotalDays() : 0,
      description: `${npc.name} путешествует из ${from} в ${to}`,
      participants: [npc.id],
      impact: {
        happiness: 5
      }
    };

    this.recordEvent(npc.id, event);
  }

  /**
   * Получает состояние жизни NPC
   */
  getLifeState(npcId: string): LifeState | undefined {
    return this.lifeStates.get(npcId);
  }

  /**
   * Получает историю событий NPC
   */
  getLifeEvents(npcId: string, limit?: number): LifeEvent[] {
    const events = this.lifeEvents.get(npcId) || [];
    if (limit) {
      return events.slice(-limit);
    }
    return events;
  }

  /**
   * Сериализует все состояния
   */
  serialize(): { states: Record<string, LifeState>; events: Record<string, LifeEvent[]> } {
    const states: Record<string, LifeState> = {};
    const events: Record<string, LifeEvent[]> = {};

    this.lifeStates.forEach((state, id) => {
      states[id] = state;
    });

    this.lifeEvents.forEach((evts, id) => {
      events[id] = evts;
    });

    return { states, events };
  }

  /**
   * Десериализует состояния
   */
  deserialize(data: { states: Record<string, LifeState>; events: Record<string, LifeEvent[]> }): void {
    this.lifeStates.clear();
    this.lifeEvents.clear();

    Object.entries(data.states).forEach(([id, state]) => {
      this.lifeStates.set(id, state);
    });

    Object.entries(data.events).forEach(([id, evts]) => {
      this.lifeEvents.set(id, evts);
    });
  }
}

export default LifeSimulation;
