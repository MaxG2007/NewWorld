import {
  DeathCause,
  type DeathCauseType,
  type LifeSummary,
  type LifeAchievement,
  type LifeRelationship,
  type CreatedObject,
  type DiscoveredDungeon,
  type ChronicleEntry,
  type MetaLegacy
} from '../../types/lifecycle';

/**
 * Система обработки смерти персонажей
 */
export class DeathSystem {
  
  /**
   * Создать причину смерти в бою
   */
  createCombatDeath(killerId: string, location: { x: number; y: number; regionId?: string }): DeathCause {
    return {
      type: 'combat',
      description: `Погиб в бою от руки ${killerId}`,
      timestamp: Date.now(),
      location,
      killerId
    };
  }
  
  /**
   * Создать причину смерти от болезни
   */
  createDiseaseDeath(diseaseId: string, diseaseName: string, location?: { x: number; y: number; regionId?: string }): DeathCause {
    return {
      type: 'disease',
      description: `Умер от болезни: ${diseaseName}`,
      timestamp: Date.now(),
      location,
      diseaseId
    };
  }
  
  /**
   * Создать причину смерти от голода
   */
  createStarvationDeath(location?: { x: number; y: number; regionId?: string }): DeathCause {
    return {
      type: 'starvation',
      description: 'Умер от голода',
      timestamp: Date.now(),
      location
    };
  }
  
  /**
   * Создать причину смерти от старости
   */
  createOldAgeDeath(age: number, location?: { x: number; y: number; regionId?: string }): DeathCause {
    return {
      type: 'old_age',
      description: `Умер от старости в возрасте ${age} лет`,
      timestamp: Date.now(),
      location,
      details: { age }
    };
  }
  
  /**
   * Создать причину смерти из-за события
   */
  createEventDeath(eventId: string, eventName: string, location: { x: number; y: number; regionId?: string }): DeathCause {
    return {
      type: 'event',
      description: `Погиб во время события: ${eventName}`,
      timestamp: Date.now(),
      location,
      eventId
    };
  }
  
  /**
   * Создать причину смерти из-за окружающей среды
   */
  createEnvironmentDeath(cause: string, location: { x: number; y: number; regionId?: string; dungeonId?: string }): DeathCause {
    return {
      type: 'environment',
      description: `Погиб из-за окружающей среды: ${cause}`,
      timestamp: Date.now(),
      location,
      details: { cause }
    };
  }
  
  /**
   * Создать причину смерти от несчастного случая
   */
  createAccidentDeath(cause: string, location?: { x: number; y: number; regionId?: string }): DeathCause {
    return {
      type: 'accident',
      description: `Погиб в результате несчастного случая: ${cause}`,
      timestamp: Date.now(),
      location,
      details: { cause }
    };
  }
  
  /**
   * Создать причину смерти от казни
   */
  createExecutionDeath(reason: string, executorId?: string): DeathCause {
    return {
      type: 'execution',
      description: `Казнен: ${reason}`,
      timestamp: Date.now(),
      killerId: executorId,
      details: { reason }
    };
  }
  
  /**
   * Создать причину смерти от жертвоприношения
   */
  createSacrificeDeath(ritualId: string, deityId?: string): DeathCause {
    return {
      type: 'sacrifice',
      description: `Погиб в результате ритуала жертвоприношения`,
      timestamp: Date.now(),
      details: { ritualId, deityId }
    };
  }
  
  /**
   * Определить тип смерти на основе контекста
   */
  determineDeathCause(
    _character: any,
    context: {
      inCombat?: boolean;
      hasDisease?: string;
      isStarving?: boolean;
      age?: number;
      inDangerousEnvironment?: string;
      activeEvent?: { id: string; name: string };
    },
    location: { x: number; y: number; regionId?: string; dungeonId?: string }
  ): DeathCause {
    if (context.inCombat) {
      return this.createCombatDeath('unknown', location);
    }
    
    if (context.hasDisease) {
      return this.createDiseaseDeath(context.hasDisease, context.hasDisease, location);
    }
    
    if (context.isStarving) {
      return this.createStarvationDeath(location);
    }
    
    if (context.age && context.age >= 80) {
      return this.createOldAgeDeath(context.age, location);
    }
    
    if (context.activeEvent) {
      return this.createEventDeath(context.activeEvent.id, context.activeEvent.name, location);
    }
    
    if (context.inDangerousEnvironment) {
      return this.createEnvironmentDeath(context.inDangerousEnvironment, location);
    }
    
    // По умолчанию - неизвестная причина
    return {
      type: 'unknown',
      description: 'Причина смерти неизвестна',
      timestamp: Date.now(),
      location
    };
  }
  
  /**
   * Проверить, должен ли персонаж умереть
   */
  shouldDie(
    _character: any,
    state: {
      health: number;
      hunger: number;
      age: number;
      diseases: string[];
      inCombat: boolean;
      inDangerousZone: boolean;
    }
  ): boolean {
    // Смерть от потери здоровья
    if (state.health <= 0) {
      return true;
    }
    
    // Смерть от голода
    if (state.hunger <= 0) {
      return true;
    }
    
    // Смерть от старости (шанс увеличивается с возрастом)
    if (state.age >= 70) {
      const deathChance = (state.age - 70) / 30; // 0% в 70, 100% в 100
      if (Math.random() < deathChance * 0.1) { // 10% шанс каждый тик после 70
        return true;
      }
    }
    
    // Смерть от опасных зон
    if (state.inDangerousZone && Math.random() < 0.05) {
      return true;
    }
    
    return false;
  }
}
