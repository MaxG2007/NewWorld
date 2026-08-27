/**
 * Тесты UI/UX системы - Этап 33
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UIManager } from '../ui/managers/UIManager';
import { DebugOverlay } from '../ui/debug/DebugOverlay';
import { UIComponentFactory, UIComponentUtils } from '../ui/components/UIComponents';
import { ScreenType, UIComponent } from '../ui/types/UITypes';

describe('UI/UX System - Этап 33', () => {
  describe('UIManager', () => {
    let uiManager: UIManager;

    beforeEach(() => {
      uiManager = new UIManager();
    });

    it('должен создавать менеджер с начальным состоянием', () => {
      expect(uiManager.activeScreen).toBeNull();
      expect(uiManager.screenHistory).toHaveLength(0);
    });

    it('должен открывать экран персонажа', () => {
      uiManager.openScreen('character');
      expect(uiManager.activeScreen).toBe('character');
      expect(uiManager.isScreenVisible('character')).toBe(true);
    });

    it('должен открывать экран инвентаря', () => {
      uiManager.openScreen('inventory');
      expect(uiManager.activeScreen).toBe('inventory');
    });

    it('должен открывать экран карты', () => {
      uiManager.openScreen('map');
      expect(uiManager.activeScreen).toBe('map');
    });

    it('должен открывать экран журнала', () => {
      uiManager.openScreen('journal');
      expect(uiManager.activeScreen).toBe('journal');
    });

    it('должен открывать экран квестов', () => {
      uiManager.openScreen('quests');
      expect(uiManager.activeScreen).toBe('quests');
    });

    it('должен открывать экран навыков', () => {
      uiManager.openScreen('skills');
      expect(uiManager.activeScreen).toBe('skills');
    });

    it('должен открывать экран семьи', () => {
      uiManager.openScreen('family');
      expect(uiManager.activeScreen).toBe('family');
    });

    it('должен открывать экран отношений', () => {
      uiManager.openScreen('relations');
      expect(uiManager.activeScreen).toBe('relations');
    });

    it('должен открывать экран знаний', () => {
      uiManager.openScreen('knowledge');
      expect(uiManager.activeScreen).toBe('knowledge');
    });

    it('должен открывать экран слухов', () => {
      uiManager.openScreen('rumors');
      expect(uiManager.activeScreen).toBe('rumors');
    });

    it('должен открывать экран строительства', () => {
      uiManager.openScreen('construction');
      expect(uiManager.activeScreen).toBe('construction');
    });

    it('должен открывать экран крафта', () => {
      uiManager.openScreen('crafting');
      expect(uiManager.activeScreen).toBe('crafting');
    });

    it('должен открывать экран торговли', () => {
      uiManager.openScreen('trade');
      expect(uiManager.activeScreen).toBe('trade');
    });

    it('должен открывать экран настроек', () => {
      uiManager.openScreen('settings');
      expect(uiManager.activeScreen).toBe('settings');
    });

    it('должен открывать экран хроники', () => {
      uiManager.openScreen('chronicle');
      expect(uiManager.activeScreen).toBe('chronicle');
    });

    it('должен открывать debug экран', () => {
      uiManager.openScreen('debug');
      expect(uiManager.activeScreen).toBe('debug');
    });

    it('должен сохранять историю экранов', () => {
      uiManager.openScreen('character');
      uiManager.openScreen('inventory');
      uiManager.openScreen('map');
      
      expect(uiManager.screenHistory).toContain('character');
      expect(uiManager.screenHistory).toContain('inventory');
    });

    it('должен закрывать текущий экран и возвращаться к предыдущему', () => {
      uiManager.openScreen('character');
      uiManager.openScreen('inventory');
      uiManager.closeScreen();
      
      expect(uiManager.activeScreen).toBe('character');
    });

    it('должен переключаться между экранами', () => {
      uiManager.switchScreen('character');
      expect(uiManager.activeScreen).toBe('character');
      
      uiManager.switchScreen('inventory');
      expect(uiManager.activeScreen).toBe('inventory');
    });

    it('должен обновлять данные экрана', () => {
      uiManager.openScreen('character');
      uiManager.updateScreenData('character', { name: 'Test', level: 5 });
      
      const state = uiManager.getScreenState('character');
      expect(state?.data).toHaveProperty('name', 'Test');
      expect(state?.data).toHaveProperty('level', 5);
    });

    it('должен поддерживать навигацию назад', () => {
      uiManager.openScreen('character');
      uiManager.openScreen('inventory');
      uiManager.openScreen('map');
      
      expect(uiManager.canGoBack()).toBe(true);
      uiManager.goBack();
      expect(uiManager.activeScreen).toBe('inventory');
    });

    it('должен очищать историю', () => {
      uiManager.openScreen('character');
      uiManager.openScreen('inventory');
      uiManager.clearHistory();
      
      expect(uiManager.canGoBack()).toBe(false);
    });
  });

  describe('DebugOverlay', () => {
    let debugOverlay: DebugOverlay;

    beforeEach(() => {
      debugOverlay = new DebugOverlay();
    });

    it('должен создаваться с начальными настройками', () => {
      expect(debugOverlay.isVisible()).toBe(false);
    });

    it('должен переключать видимость', () => {
      debugOverlay.toggle();
      expect(debugOverlay.isVisible()).toBe(true);
      
      debugOverlay.toggle();
      expect(debugOverlay.isVisible()).toBe(false);
    });

    it('должен обновлять данные отладки', () => {
      debugOverlay.setGameTime(1000);
      debugOverlay.setSeed('test-seed-123');
      debugOverlay.setCurrentChunk(5, 10);
      debugOverlay.setNPCCount(150);
      debugOverlay.setLoadedEntities(500);
      debugOverlay.setSimulationTier(3);
      debugOverlay.setMemoryEstimate(256);
      debugOverlay.setEventQueueSize(42);
      debugOverlay.setActiveSystems(['combat', 'economy', 'social']);

      const data = debugOverlay.getDebugData();
      expect(data.gameTime).toBe(1000);
      expect(data.seed).toBe('test-seed-123');
      expect(data.currentChunk).toEqual({ x: 5, y: 10 });
      expect(data.npcCount).toBe(150);
      expect(data.loadedEntities).toBe(500);
      expect(data.simulationTier).toBe(3);
      expect(data.memoryEstimate).toBe(256);
      expect(data.eventQueueSize).toBe(42);
      expect(data.activeSystems).toContain('combat');
    });

    it('должен форматировать вывод для консоли', () => {
      debugOverlay.setGameTime(5000);
      debugOverlay.setNPCCount(100);
      
      const output = debugOverlay.formatDebugOutput();
      expect(output).toContain('=== DEBUG OVERLAY ===');
      expect(output).toContain('Time: 5000');
      expect(output).toContain('NPCs: 100');
    });

    it('должен возвращать стили позиционирования', () => {
      const styles = debugOverlay.getPositionStyles();
      expect(styles).toHaveProperty('top');
      expect(styles).toHaveProperty('left');
    });
  });

  describe('UIComponentFactory', () => {
    it('должен создавать окно', () => {
      const window = UIComponentFactory.createWindow('test-window', 'Test Title');
      expect(window.type).toBe('window');
      expect(window.id).toBe('test-window');
      expect(window.visible).toBe(true);
    });

    it('должен создавать панель', () => {
      const panel = UIComponentFactory.createPanel('test-panel');
      expect(panel.type).toBe('panel');
      expect(panel.id).toBe('test-panel');
    });

    it('должен создавать кнопку', () => {
      const button = UIComponentFactory.createButton('test-btn', 'Click Me');
      expect(button.type).toBe('button');
      expect(button.id).toBe('test-btn');
    });

    it('должен создавать список', () => {
      const list = UIComponentFactory.createList('test-list');
      expect(list.type).toBe('list');
    });

    it('должен создавать грид', () => {
      const grid = UIComponentFactory.createGrid('test-grid', 4, 4);
      expect(grid.type).toBe('grid');
      expect(grid.size.width).toBe(240); // 4 * 60
      expect(grid.size.height).toBe(240);
    });

    it('должен создавать tooltip', () => {
      const tooltip = UIComponentFactory.createTooltip('test-tip', 'Help text');
      expect(tooltip.type).toBe('tooltip');
      expect(tooltip.visible).toBe(false);
    });

    it('должен создавать input', () => {
      const input = UIComponentFactory.createInput('test-input', 'Enter value');
      expect(input.type).toBe('input');
    });

    it('должен создавать label', () => {
      const label = UIComponentFactory.createLabel('test-label', 'Some text');
      expect(label.type).toBe('label');
    });
  });

  describe('UIComponentUtils', () => {
    it('должен находить компонент по ID', () => {
      const parent = UIComponentFactory.createWindow('parent', 'Parent');
      const child = UIComponentFactory.createButton('child', 'Child');
      UIComponentUtils.addChild(parent, child);

      const found = UIComponentUtils.findById(parent, 'child');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('child');
    });

    it('должен устанавливать видимость', () => {
      const component = UIComponentFactory.createPanel('test');
      expect(component.visible).toBe(true);
      
      UIComponentUtils.setVisible(component, false);
      expect(component.visible).toBe(false);
    });

    it('должен устанавливать enabled статус', () => {
      const component = UIComponentFactory.createButton('test', 'Btn');
      expect(component.enabled).toBe(true);
      
      UIComponentUtils.setEnabled(component, false);
      expect(component.enabled).toBe(false);
    });

    it('должен устанавливать позицию', () => {
      const component = UIComponentFactory.createPanel('test');
      UIComponentUtils.setPosition(component, 100, 200);
      
      expect(component.position.x).toBe(100);
      expect(component.position.y).toBe(200);
    });

    it('должен устанавливать размер', () => {
      const component = UIComponentFactory.createPanel('test');
      UIComponentUtils.setSize(component, 500, 400);
      
      expect(component.size.width).toBe(500);
      expect(component.size.height).toBe(400);
    });

    it('должен добавлять дочерние компоненты', () => {
      const parent = UIComponentFactory.createPanel('parent');
      const child = UIComponentFactory.createLabel('child', 'text');
      
      expect(parent.children).toHaveLength(0);
      UIComponentUtils.addChild(parent, child);
      expect(parent.children).toHaveLength(1);
    });

    it('должен удалять дочерние компоненты', () => {
      const parent = UIComponentFactory.createPanel('parent');
      const child = UIComponentFactory.createLabel('child', 'text');
      UIComponentUtils.addChild(parent, child);
      
      expect(parent.children).toHaveLength(1);
      const removed = UIComponentUtils.removeChild(parent, 'child');
      expect(removed).toBe(true);
      expect(parent.children).toHaveLength(0);
    });

    it('должен применять стили', () => {
      const component = UIComponentFactory.createPanel('test');
      UIComponentUtils.applyStyle(component, { backgroundColor: '#ff0000' });
      
      expect(component.style?.backgroundColor).toBe('#ff0000');
    });
  });

  describe('Все 15 основных экранов', () => {
    let uiManager: UIManager;

    beforeEach(() => {
      uiManager = new UIManager();
    });

    const screens: ScreenType[] = [
      'character',
      'inventory',
      'map',
      'journal',
      'quests',
      'skills',
      'family',
      'relations',
      'knowledge',
      'rumors',
      'construction',
      'crafting',
      'trade',
      'settings',
      'chronicle',
    ];

    it('должен поддерживать все 15 основных экранов', () => {
      screens.forEach(screen => {
        uiManager.openScreen(screen);
        expect(uiManager.activeScreen).toBe(screen);
      });
    });

    it('должен иметь debug экран как отдельный', () => {
      uiManager.openScreen('debug');
      expect(uiManager.activeScreen).toBe('debug');
    });
  });
});
