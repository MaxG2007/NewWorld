/**
 * Этап 16 — NPC SIMULATION
 * Система расписаний для NPC
 */

export type ActivityType = 
  | 'sleep'
  | 'wake'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'work'
  | 'market'
  | 'home'
  | 'travel'
  | 'socialize'
  | 'prayer'
  | 'leisure';

export interface ScheduleBlock {
  startTime: number; // Часы (0-23)
  endTime: number;   // Часы (0-23)
  activity: ActivityType;
  location?: string;
  priority: number;
}

export interface DailySchedule {
  npcId: string;
  blocks: ScheduleBlock[];
  currentBlockIndex: number;
  lastUpdated: number;
  modifiers: {
    weather?: string;
    event?: string;
    profession?: string;
    culture?: string;
  };
}

export class NPCScheduler {
  private schedules: Map<string, DailySchedule> = new Map();

  /**
   * Создает базовое расписание для NPC
   */
  createBaseSchedule(
    npcId: string,
    profession: string,
    culture: string
  ): DailySchedule {
    const blocks: ScheduleBlock[] = this.generateBlocksForProfession(profession, culture);
    
    const schedule: DailySchedule = {
      npcId,
      blocks,
      currentBlockIndex: 0,
      lastUpdated: Date.now(),
      modifiers: {
        profession,
        culture
      }
    };

    this.schedules.set(npcId, schedule);
    return schedule;
  }

  /**
   * Генерирует блоки расписания в зависимости от профессии
   */
  private generateBlocksForProfession(profession: string, _culture: string): ScheduleBlock[] {
    const baseBlocks: ScheduleBlock[] = [
      { startTime: 0, endTime: 7, activity: 'sleep', priority: 10 },
      { startTime: 7, endTime: 8, activity: 'wake', priority: 10 },
      { startTime: 8, endTime: 9, activity: 'breakfast', priority: 9 },
    ];

    // Разные профессии имеют разное расписание
    if (profession === 'farmer') {
      baseBlocks.push(
        { startTime: 9, endTime: 13, activity: 'work', location: 'fields', priority: 8 },
        { startTime: 13, endTime: 14, activity: 'lunch', priority: 9 },
        { startTime: 14, endTime: 18, activity: 'work', location: 'fields', priority: 8 },
        { startTime: 18, endTime: 20, activity: 'market', priority: 6 },
        { startTime: 20, endTime: 22, activity: 'home', priority: 7 },
        { startTime: 22, endTime: 24, activity: 'leisure', priority: 5 }
      );
    } else if (profession === 'blacksmith') {
      baseBlocks.push(
        { startTime: 9, endTime: 13, activity: 'work', location: 'forge', priority: 8 },
        { startTime: 13, endTime: 14, activity: 'lunch', priority: 9 },
        { startTime: 14, endTime: 18, activity: 'work', location: 'forge', priority: 8 },
        { startTime: 18, endTime: 20, activity: 'market', priority: 6 },
        { startTime: 20, endTime: 22, activity: 'home', priority: 7 },
        { startTime: 22, endTime: 24, activity: 'leisure', priority: 5 }
      );
    } else if (profession === 'guard') {
      baseBlocks.push(
        { startTime: 9, endTime: 13, activity: 'work', location: 'barracks', priority: 8 },
        { startTime: 13, endTime: 14, activity: 'lunch', priority: 9 },
        { startTime: 14, endTime: 18, activity: 'work', location: 'city_wall', priority: 8 },
        { startTime: 18, endTime: 20, activity: 'home', priority: 7 },
        { startTime: 20, endTime: 22, activity: 'socialize', priority: 6 },
        { startTime: 22, endTime: 24, activity: 'sleep', priority: 10 }
      );
    } else if (profession === 'merchant') {
      baseBlocks.push(
        { startTime: 9, endTime: 13, activity: 'market', location: 'marketplace', priority: 8 },
        { startTime: 13, endTime: 14, activity: 'lunch', priority: 9 },
        { startTime: 14, endTime: 18, activity: 'market', location: 'marketplace', priority: 8 },
        { startTime: 18, endTime: 20, activity: 'home', priority: 7 },
        { startTime: 20, endTime: 22, activity: 'socialize', priority: 6 },
        { startTime: 22, endTime: 24, activity: 'leisure', priority: 5 }
      );
    } else {
      // Стандартное расписание для остальных профессий
      baseBlocks.push(
        { startTime: 9, endTime: 13, activity: 'work', priority: 8 },
        { startTime: 13, endTime: 14, activity: 'lunch', priority: 9 },
        { startTime: 14, endTime: 18, activity: 'work', priority: 8 },
        { startTime: 18, endTime: 20, activity: 'market', priority: 6 },
        { startTime: 20, endTime: 22, activity: 'home', priority: 7 },
        { startTime: 22, endTime: 24, activity: 'leisure', priority: 5 }
      );
    }

    return baseBlocks;
  }

  /**
   * Применяет модификаторы к расписанию (погода, события)
   */
  applyModifiers(schedule: DailySchedule, weather?: string, event?: string): void {
    schedule.modifiers.weather = weather;
    schedule.modifiers.event = event;

    // Дождь отменяет работу на улице
    if (weather === 'rain' || weather === 'storm') {
      schedule.blocks.forEach(block => {
        if (block.location === 'fields' || block.location === 'marketplace') {
          block.activity = 'home';
          block.location = 'home';
        }
      });
    }

    // Праздники меняют расписание
    if (event === 'festival') {
      schedule.blocks.forEach(block => {
        if (block.activity === 'work') {
          block.activity = 'leisure';
        }
        if (block.startTime >= 18 && block.endTime <= 24) {
          block.activity = 'socialize';
        }
      });
    }

    // Война меняет приоритеты
    if (event === 'war') {
      schedule.blocks.forEach(block => {
        if (block.activity === 'work' && schedule.modifiers.profession === 'guard') {
          block.endTime = 24;
          block.priority = 10;
        }
      });
    }

    schedule.lastUpdated = Date.now();
  }

  /**
   * Получает текущую активность NPC
   */
  getCurrentActivity(schedule: DailySchedule, currentHour: number): ScheduleBlock | null {
    const normalizedHour = currentHour % 24;
    
    for (const block of schedule.blocks) {
      if (normalizedHour >= block.startTime && normalizedHour < block.endTime) {
        return block;
      }
    }

    // Если не найдено, возвращаем последний блок
    return schedule.blocks.length > 0 ? schedule.blocks[schedule.blocks.length - 1] : null;
  }

  /**
   * Обновляет состояние расписания
   */
  updateSchedule(npcId: string, currentHour: number): ScheduleBlock | null {
    const schedule = this.schedules.get(npcId);
    if (!schedule) return null;

    const currentBlock = this.getCurrentActivity(schedule, currentHour);
    if (currentBlock) {
      schedule.currentBlockIndex = schedule.blocks.indexOf(currentBlock);
    }

    return currentBlock;
  }

  /**
   * Получает расписание NPC
   */
  getSchedule(npcId: string): DailySchedule | undefined {
    return this.schedules.get(npcId);
  }

  /**
   * Удаляет расписание NPC
   */
  removeSchedule(npcId: string): void {
    this.schedules.delete(npcId);
  }

  /**
   * Сериализует все расписания
   */
  serialize(): Record<string, DailySchedule> {
    const result: Record<string, DailySchedule> = {};
    this.schedules.forEach((schedule, id) => {
      result[id] = schedule;
    });
    return result;
  }

  /**
   * Десериализует расписания
   */
  deserialize(data: Record<string, DailySchedule>): void {
    this.schedules.clear();
    Object.entries(data).forEach(([id, schedule]) => {
      this.schedules.set(id, schedule);
    });
  }
}

export default NPCScheduler;
