/**
 * UIManager - Менеджер пользовательского интерфейса
 * Этап 33: UI/UX
 */

import {
  ScreenType,
  UIWindowManager,
  ScreenState,
  UIEvent,
  UIConfig,
} from '../types/UITypes';

export class UIManager implements UIWindowManager {
  private activeScreenInternal: ScreenType | null = null;
  private screenHistoryInternal: ScreenType[] = [];
  private screenStates: Map<ScreenType, ScreenState> = new Map();
  private eventListeners: Map<string, ((event: UIEvent) => void)[]> = new Map();
  
  private config: UIConfig = {
    defaultScreen: 'character',
    maxScreenHistory: 10,
    tooltipDelay: 300,
    animationDuration: 200,
    responsiveBreakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1920,
    },
  };

  get activeScreen(): ScreenType | null {
    return this.activeScreenInternal;
  }

  get screenHistory(): ScreenType[] {
    return [...this.screenHistoryInternal];
  }

  constructor(config?: Partial<UIConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  openScreen(screen: ScreenType): void {
    const previousScreen = this.activeScreenInternal;
    
    // Добавляем в историю
    if (previousScreen) {
      this.screenHistoryInternal.push(previousScreen);
      if (this.screenHistoryInternal.length > this.config.maxScreenHistory) {
        this.screenHistoryInternal.shift();
      }
    }

    // Устанавливаем активный экран
    this.activeScreenInternal = screen;

    // Создаем или обновляем состояние экрана
    if (!this.screenStates.has(screen)) {
      this.screenStates.set(screen, {
        screen,
        data: {},
        lastUpdated: Date.now(),
        isVisible: true,
      });
    } else {
      const state = this.screenStates.get(screen)!;
      state.isVisible = true;
      state.lastUpdated = Date.now();
    }

    // Отправляем событие
    this.emitEvent({
      type: 'screen_opened',
      screen,
      timestamp: Date.now(),
    });

    console.log(`[UI] Opened screen: ${screen}`);
  }

  closeScreen(): void {
    if (!this.activeScreenInternal) {
      return;
    }

    const screen = this.activeScreenInternal;
    const state = this.screenStates.get(screen);
    
    if (state) {
      state.isVisible = false;
      state.lastUpdated = Date.now();
    }

    // Возвращаемся к предыдущему экрану
    if (this.screenHistoryInternal.length > 0) {
      this.activeScreenInternal = this.screenHistoryInternal.pop()!;
    } else {
      this.activeScreenInternal = null;
    }

    // Отправляем событие
    this.emitEvent({
      type: 'screen_closed',
      screen,
      timestamp: Date.now(),
    });

    console.log(`[UI] Closed screen: ${screen}`);
  }

  switchScreen(screen: ScreenType): void {
    if (this.activeScreenInternal === screen) {
      return;
    }

    this.openScreen(screen);
  }

  getScreenState(screen: ScreenType): ScreenState | null {
    return this.screenStates.get(screen) || null;
  }

  updateScreenData(screen: ScreenType, data: Record<string, unknown>): void {
    const state = this.screenStates.get(screen);
    if (state) {
      state.data = { ...state.data, ...data };
      state.lastUpdated = Date.now();
    }
  }

  isScreenVisible(screen: ScreenType): boolean {
    const state = this.screenStates.get(screen);
    return state?.isVisible ?? false;
  }

  addEventListener(eventType: string, callback: (event: UIEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (event: UIEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: UIEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[UI] Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  getConfig(): UIConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<UIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getAllScreenStates(): Map<ScreenType, ScreenState> {
    return new Map(this.screenStates);
  }

  clearHistory(): void {
    this.screenHistoryInternal = [];
  }

  canGoBack(): boolean {
    return this.screenHistoryInternal.length > 0;
  }

  goBack(): void {
    if (this.canGoBack()) {
      const previousScreen = this.screenHistoryInternal.pop()!;
      this.activeScreenInternal = previousScreen;
      
      const state = this.screenStates.get(previousScreen);
      if (state) {
        state.isVisible = true;
        state.lastUpdated = Date.now();
      }
      
      console.log(`[UI] Navigated back to: ${previousScreen}`);
    }
  }
}

// Экспорт singleton экземпляра
export const uiManager = new UIManager();
