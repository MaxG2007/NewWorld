/**
 * Игровое время и календарь
 */

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

export interface GameTimeConfig {
  ticksPerSecond: number;      // тиков в секунду реального времени
  secondsPerMinute: number;    // секунд в минуте игрового времени
  minutesPerHour: number;      // минут в часе
  hoursPerDay: number;         // часов в дне
  daysPerWeek: number;         // дней в неделе
  daysPerMonth: number;        // дней в месяце
  monthsPerYear: number;       // месяцев в году
  seasonLengthMonths: number;  // месяцев в сезоне
}

export interface Holiday {
  id: string;
  name: string;
  day: number;
  month: number;
  description: string;
  effects: Record<string, number>;
}

export const DEFAULT_TIME_CONFIG: GameTimeConfig = {
  ticksPerSecond: 60,
  secondsPerMinute: 60,
  minutesPerHour: 60,
  hoursPerDay: 24,
  daysPerWeek: 7,
  daysPerMonth: 30,
  monthsPerYear: 12,
  seasonLengthMonths: 3
};

export class GameCalendar {
  private config: GameTimeConfig;
  
  // Текущее время
  private gameTick: number = 0;
  private second: number = 0;
  private minute: number = 0;
  private hour: number = 0;
  private day: number = 1;
  private week: number = 1;
  private month: number = 1;
  private year: number = 1;
  
  // Праздники
  private holidays: Holiday[] = [];
  
  constructor(config: Partial<GameTimeConfig> = {}) {
    this.config = { ...DEFAULT_TIME_CONFIG, ...config };
    this.initHolidays();
  }
  
  private initHolidays(): void {
    this.holidays = [
      {
        id: 'new_year',
        name: 'Новый Год',
        day: 1,
        month: 1,
        description: 'Начало нового года',
        effects: { happiness: 0.2, trade: 0.1 }
      },
      {
        id: 'spring_festival',
        name: 'Праздник Весны',
        day: 1,
        month: 4,
        description: 'Праздник пробуждения природы',
        effects: { farming: 0.15, happiness: 0.1 }
      },
      {
        id: 'harvest_festival',
        name: 'Праздник Урожая',
        day: 15,
        month: 9,
        description: 'Праздник сбора урожая',
        effects: { farming: 0.2, food: 0.3, happiness: 0.15 }
      },
      {
        id: 'winter_solstice',
        name: 'Зимнее Солнцестояние',
        day: 21,
        month: 12,
        description: 'Самая длинная ночь в году',
        effects: { magic: 0.1, crime: -0.1 }
      }
    ];
  }
  
  /**
   * Продвинуть время на один тик (публичный метод)
   */
  advance(): void {
    this.gameTick++;
    
    if (this.gameTick >= this.config.ticksPerSecond) {
      this.gameTick = 0;
      this.second++;
      
      if (this.second >= this.config.secondsPerMinute) {
        this.second = 0;
        this.minute++;
        
        if (this.minute >= this.config.minutesPerHour) {
          this.minute = 0;
          this.hour++;
          
          if (this.hour >= this.config.hoursPerDay) {
            this.hour = 0;
            this.day++;
            
            if (this.day > this.config.daysPerMonth) {
              this.day = 1;
              this.month++;
              
              if (this.month > this.config.monthsPerYear) {
                this.month = 1;
                this.year++;
              }
              
              // Обновляем неделю
              this.week = Math.ceil(this.day / 7);
            } else {
              this.week = Math.ceil(this.day / 7);
            }
          }
        }
      }
    }
  }
  
  /**
   * Получить текущий сезон
   */
  getSeason(): Season {
    const monthIndex = this.month - 1;
    const seasonIndex = Math.floor(monthIndex / this.config.seasonLengthMonths);
    
    switch (seasonIndex) {
      case 0: return Season.SPRING;
      case 1: return Season.SUMMER;
      case 2: return Season.AUTUMN;
      case 3: return Season.WINTER;
      default: return Season.SPRING;
    }
  }
  
  /**
   * Проверить, является ли текущий день праздником
   */
  isHoliday(): Holiday | null {
    const holiday = this.holidays.find(h => h.day === this.day && h.month === this.month);
    return holiday || null;
  }
  
  /**
   * Получить все праздники в текущем месяце
   */
  getHolidaysThisMonth(): Holiday[] {
    return this.holidays.filter(h => h.month === this.month);
  }
  
  /**
   * Получить возраст в годах от количества дней
   */
  getAgeFromDays(days: number): number {
    return Math.floor(days / (this.config.daysPerMonth * this.config.monthsPerYear));
  }
  
  /**
   * Получить время суток (утро, день, вечер, ночь)
   */
  getTimeOfDay(): 'morning' | 'day' | 'evening' | 'night' {
    if (this.hour >= 5 && this.hour < 9) return 'morning';
    if (this.hour >= 9 && this.hour < 17) return 'day';
    if (this.hour >= 17 && this.hour < 22) return 'evening';
    return 'night';
  }
  
  /**
   * Сериализовать состояние
   */
  serialize(): Record<string, any> {
    return {
      gameTick: this.gameTick,
      second: this.second,
      minute: this.minute,
      hour: this.hour,
      day: this.day,
      week: this.week,
      month: this.month,
      year: this.year,
      config: this.config
    };
  }
  
  /**
   * Восстановить из сериализации
   */
  deserialize(data: Record<string, any>): void {
    this.gameTick = data.gameTick || 0;
    this.second = data.second || 0;
    this.minute = data.minute || 0;
    this.hour = data.hour || 0;
    this.day = data.day || 1;
    this.week = data.week || 1;
    this.month = data.month || 1;
    this.year = data.year || 1;
    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }
  
  /**
   * Получить строковое представление времени
   */
  toString(): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(this.hour)}:${pad(this.minute)}:${pad(this.second)} | ` +
           `День ${this.day}, Неделя ${this.week}, Месяц ${this.month}, Год ${this.year} | ` +
           `Сезон: ${this.getSeason()}`;
  }
}

export { GameCalendar as TimeSystem };
