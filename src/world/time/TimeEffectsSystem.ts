/**
 * Система влияния времени на игровые процессы
 */

import { GameCalendar, Season, Holiday } from './GameCalendar';

export interface TimeEffect {
  type: 'weather' | 'price' | 'schedule' | 'harvest' | 'hunt' | 'migration' | 'crime' | 'lighting' | 'building_access';
  multiplier: number;
  description: string;
}

export class TimeEffectsSystem {
  private calendar: GameCalendar;
  
  constructor(calendar: GameCalendar) {
    this.calendar = calendar;
  }
  
  /**
   * Получить все активные эффекты от текущего времени
   */
  getActiveEffects(): TimeEffect[] {
    const effects: TimeEffect[] = [];
    
    // Эффекты от времени суток
    effects.push(...this.getTimeOfDayEffects());
    
    // Эффекты от сезона
    effects.push(...this.getSeasonalEffects());
    
    // Эффекты от праздника
    const holiday = this.calendar.isHoliday();
    if (holiday) {
      effects.push(...this.getHolidayEffects(holiday));
    }
    
    return effects;
  }
  
  /**
   * Эффекты от времени суток
   */
  private getTimeOfDayEffects(): TimeEffect[] {
    const timeOfDay = this.calendar.getTimeOfDay();
    const effects: TimeEffect[] = [];
    
    switch (timeOfDay) {
      case 'morning':
        effects.push(
          { type: 'schedule', multiplier: 1.0, description: 'NPC начинают свой день' },
          { type: 'building_access', multiplier: 1.0, description: 'Большинство зданий открыты' },
          { type: 'lighting', multiplier: 0.8, description: 'Рассвет, хорошее освещение' }
        );
        break;
      case 'day':
        effects.push(
          { type: 'schedule', multiplier: 1.2, description: 'Пик активности NPC' },
          { type: 'price', multiplier: 1.0, description: 'Стандартные цены' },
          { type: 'building_access', multiplier: 1.0, description: 'Все здания открыты' },
          { type: 'lighting', multiplier: 1.0, description: 'Ясный день' },
          { type: 'hunt', multiplier: 0.7, description: 'Животные менее активны' }
        );
        break;
      case 'evening':
        effects.push(
          { type: 'schedule', multiplier: 0.8, description: 'NPC возвращаются домой' },
          { type: 'crime', multiplier: 1.2, description: 'Уровень преступности растёт' },
          { type: 'building_access', multiplier: 0.7, description: 'Некоторые здания закрываются' },
          { type: 'lighting', multiplier: 0.5, description: 'Сумерки' }
        );
        break;
      case 'night':
        effects.push(
          { type: 'schedule', multiplier: 0.3, description: 'NPC спят' },
          { type: 'crime', multiplier: 1.5, description: 'Высокий уровень преступности' },
          { type: 'building_access', multiplier: 0.2, description: 'Большинство зданий закрыто' },
          { type: 'lighting', multiplier: 0.2, description: 'Темно, нужно освещение' },
          { type: 'hunt', multiplier: 1.3, description: 'Ночные животные активны' }
        );
        break;
    }
    
    return effects;
  }
  
  /**
   * Эффекты от сезона
   */
  private getSeasonalEffects(): TimeEffect[] {
    const season = this.calendar.getSeason();
    const effects: TimeEffect[] = [];
    
    switch (season) {
      case Season.SPRING:
        effects.push(
          { type: 'weather', multiplier: 0.8, description: 'Частые дожди' },
          { type: 'harvest', multiplier: 0.5, description: 'Посадка культур' },
          { type: 'migration', multiplier: 1.2, description: 'Возвращение перелётных птиц' },
          { type: 'price', multiplier: 1.1, description: 'Цены на семена выше' }
        );
        break;
      case Season.SUMMER:
        effects.push(
          { type: 'weather', multiplier: 0.3, description: 'Жарко и сухо' },
          { type: 'harvest', multiplier: 0.8, description: 'Рост культур' },
          { type: 'hunt', multiplier: 0.9, description: 'Активность животных' },
          { type: 'price', multiplier: 0.9, description: 'Цены на воду выше' }
        );
        break;
      case Season.AUTUMN:
        effects.push(
          { type: 'weather', multiplier: 0.6, description: 'Дождливая погода' },
          { type: 'harvest', multiplier: 1.5, description: 'Сбор урожая' },
          { type: 'migration', multiplier: 1.3, description: 'Отлёт птиц' },
          { type: 'price', multiplier: 0.8, description: 'Цены на еду ниже (урожай)' }
        );
        break;
      case Season.WINTER:
        effects.push(
          { type: 'weather', multiplier: 1.5, description: 'Холод и снег' },
          { type: 'harvest', multiplier: 0.0, description: 'Нет урожая' },
          { type: 'hunt', multiplier: 0.6, description: 'Мало животных' },
          { type: 'price', multiplier: 1.3, description: 'Цены на еду и тепло выше' },
          { type: 'building_access', multiplier: 0.8, description: 'Некоторые дороги закрыты' }
        );
        break;
    }
    
    return effects;
  }
  
  /**
   * Эффекты от праздника
   */
  private getHolidayEffects(holiday: Holiday): TimeEffect[] {
    const effects: TimeEffect[] = [];
    
    for (const [effectType, multiplier] of Object.entries(holiday.effects)) {
      effects.push({
        type: effectType as TimeEffect['type'],
        multiplier: 1 + multiplier,
        description: `Праздник "${holiday.name}": ${effectType} ${(multiplier * 100).toFixed(0)}%`
      });
    }
    
    return effects;
  }
  
  /**
   * Получить множитель для конкретного типа эффекта
   */
  getMultiplier(effectType: TimeEffect['type']): number {
    const effects = this.getActiveEffects();
    const matchingEffects = effects.filter(e => e.type === effectType);
    
    if (matchingEffects.length === 0) {
      return 1.0;
    }
    
    // Перемножаем все множители
    return matchingEffects.reduce((acc, effect) => acc * effect.multiplier, 1.0);
  }
  
  /**
   * Проверить, доступно ли здание в текущее время
   */
  isBuildingAccessible(): boolean {
    return this.getMultiplier('building_access') >= 0.5;
  }
  
  /**
   * Получить текущий уровень освещения (0-1)
   */
  getLightingLevel(): number {
    return Math.min(1.0, this.getMultiplier('lighting'));
  }
  
  /**
   * Сериализовать состояние
   */
  serialize(): Record<string, any> {
    return {
      calendar: this.calendar.serialize(),
      activeEffects: this.getActiveEffects()
    };
  }
  
  /**
   * Восстановить из сериализации
   */
  deserialize(data: Record<string, any>): void {
    if (data.calendar) {
      this.calendar.deserialize(data.calendar);
    }
  }
}

export default TimeEffectsSystem;
