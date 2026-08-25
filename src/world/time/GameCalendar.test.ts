/**
 * Тесты для системы времени и календаря
 */

import { describe, it, expect } from 'vitest';
import { GameCalendar, Season } from './GameCalendar';
import TimeEffectsSystem from './TimeEffectsSystem';

describe('GameCalendar', () => {
  it('должен создавать календарь с начальными значениями', () => {
    const calendar = new GameCalendar();
    const serialized = calendar.serialize();
    
    expect(serialized.year).toBe(1);
    expect(serialized.month).toBe(1);
    expect(serialized.day).toBe(1);
    expect(serialized.hour).toBe(0);
    expect(serialized.minute).toBe(0);
    expect(serialized.second).toBe(0);
  });
  
  it('должен продвигать время корректно', () => {
    const calendar = new GameCalendar({ ticksPerSecond: 10, secondsPerMinute: 60, minutesPerHour: 60, hoursPerDay: 24 });
    
    // Продвигаем на 10 тиков (1 секунда)
    for (let i = 0; i < 10; i++) {
      calendar.advance();
    }
    
    const serialized = calendar.serialize();
    expect(serialized.second).toBe(1);
  });
  
  it('должен переходить на следующий день после 24 часов', () => {
    const calendar = new GameCalendar({ 
      ticksPerSecond: 1, 
      secondsPerMinute: 1, 
      minutesPerHour: 1, 
      hoursPerDay: 3 
    });
    
    // 3 часа = 3 тика
    for (let i = 0; i < 3; i++) {
      calendar.advance();
    }
    
    const serialized = calendar.serialize();
    expect(serialized.hour).toBe(0);
    expect(serialized.day).toBe(2);
  });
  
  it('должен определять сезоны корректно', () => {
    const calendar = new GameCalendar();
    
    // Месяц 1-3: Весна
    (calendar as any).month = 1;
    expect(calendar.getSeason()).toBe(Season.SPRING);
    
    (calendar as any).month = 4;
    expect(calendar.getSeason()).toBe(Season.SUMMER);
    
    (calendar as any).month = 7;
    expect(calendar.getSeason()).toBe(Season.AUTUMN);
    
    (calendar as any).month = 10;
    expect(calendar.getSeason()).toBe(Season.WINTER);
  });
  
  it('должен находить праздники', () => {
    const calendar = new GameCalendar();
    
    // Новый год - 1 января
    (calendar as any).day = 1;
    (calendar as any).month = 1;
    
    const holiday = calendar.isHoliday();
    expect(holiday).not.toBeNull();
    expect(holiday!.id).toBe('new_year');
  });
  
  it('должен определять время суток', () => {
    const calendar = new GameCalendar();
    
    (calendar as any).hour = 6;
    expect(calendar.getTimeOfDay()).toBe('morning');
    
    (calendar as any).hour = 12;
    expect(calendar.getTimeOfDay()).toBe('day');
    
    (calendar as any).hour = 19;
    expect(calendar.getTimeOfDay()).toBe('evening');
    
    (calendar as any).hour = 23;
    expect(calendar.getTimeOfDay()).toBe('night');
  });
  
  it('должен сериализовать и восстанавливать состояние', () => {
    const calendar = new GameCalendar();
    
    // Продвинуть время
    for (let i = 0; i < 1000; i++) {
      calendar.advance();
    }
    
    const serialized = calendar.serialize();
    const newCalendar = new GameCalendar();
    newCalendar.deserialize(serialized);
    
    expect(newCalendar.serialize()).toEqual(serialized);
  });
});

describe('TimeEffectsSystem', () => {
  it('должен создавать систему эффектов', () => {
    const calendar = new GameCalendar();
    const system = new TimeEffectsSystem(calendar);
    
    const effects = system.getActiveEffects();
    expect(effects.length).toBeGreaterThan(0);
  });
  
  it('должен возвращать множители для эффектов', () => {
    const calendar = new GameCalendar();
    const system = new TimeEffectsSystem(calendar);
    
    const lightingMultiplier = system.getMultiplier('lighting');
    expect(lightingMultiplier).toBeGreaterThan(0);
  });
  
  it('должен проверять доступность зданий', () => {
    const calendar = new GameCalendar();
    const system = new TimeEffectsSystem(calendar);
    
    // Днём здания должны быть доступны
    (calendar as any).hour = 12;
    expect(system.isBuildingAccessible()).toBe(true);
    
    // Ночью большинство зданий закрыто
    (calendar as any).hour = 2;
    expect(system.isBuildingAccessible()).toBe(false);
  });
  
  it('должен возвращать уровень освещения', () => {
    const calendar = new GameCalendar();
    const system = new TimeEffectsSystem(calendar);
    
    (calendar as any).hour = 12;
    expect(system.getLightingLevel()).toBe(1.0);
    
    (calendar as any).hour = 2;
    expect(system.getLightingLevel()).toBeLessThan(0.5);
  });
});
