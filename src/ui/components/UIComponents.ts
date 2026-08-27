/**
 * Базовые UI компоненты
 * Этап 33: UI/UX
 */

import { UIComponent, UIStyle } from '../types/UITypes';

// Фабрика базовых компонентов
export class UIComponentFactory {
  static createWindow(id: string, title: string): UIComponent {
    return {
      id,
      type: 'window',
      visible: true,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 800, height: 600 },
      style: {
        backgroundColor: '#1a1a2e',
        borderColor: '#4a4a6a',
        borderWidth: 2,
        padding: 10,
      },
      children: [
        this.createLabel(`${id}-title`, title),
      ],
    };
  }

  static createPanel(id: string): UIComponent {
    return {
      id,
      type: 'panel',
      visible: true,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      style: {
        backgroundColor: '#16213e',
        padding: 8,
      },
      children: [],
    };
  }

  static createButton(id: string, label: string): UIComponent {
    return {
      id,
      type: 'button',
      visible: true,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 120, height: 40 },
      style: {
        backgroundColor: '#0f3460',
        borderColor: '#e94560',
        borderWidth: 1,
        fontColor: '#ffffff',
        fontSize: 14,
        padding: 5,
      },
      children: [
        this.createLabel(`${id}-label`, label),
      ],
    };
  }

  static createList(id: string): UIComponent {
    return {
      id,
      type: 'list',
      visible: true,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 300, height: 400 },
      style: {
        backgroundColor: '#1a1a2e',
        borderColor: '#4a4a6a',
        borderWidth: 1,
        padding: 5,
      },
      children: [],
    };
  }

  static createGrid(id: string, columns: number, rows: number): UIComponent {
    return {
      id,
      type: 'grid',
      visible: true,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: columns * 60, height: rows * 60 },
      style: {
        backgroundColor: '#1a1a2e',
        padding: 5,
      },
      children: [],
    };
  }

  static createTooltip(id: string, content: string): UIComponent {
    return {
      id,
      type: 'tooltip',
      visible: false,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 'auto' as unknown as number },
      style: {
        backgroundColor: '#0f3460',
        borderColor: '#e94560',
        borderWidth: 1,
        fontColor: '#ffffff',
        fontSize: 12,
        padding: 8,
      },
      children: [
        this.createLabel(`${id}-content`, content),
      ],
    };
  }

  static createInput(id: string, placeholder: string): UIComponent {
    return {
      id,
      type: 'input',
      visible: true,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 35 },
      style: {
        backgroundColor: '#16213e',
        borderColor: '#4a4a6a',
        borderWidth: 1,
        fontColor: '#ffffff',
        fontSize: 14,
        padding: 5,
      },
      children: [],
    };
  }

  static createLabel(id: string, text: string): UIComponent {
    return {
      id,
      type: 'label',
      visible: true,
      enabled: true,
      position: { x: 0, y: 0 },
      size: { width: 100, height: 20 },
      style: {
        fontColor: '#ffffff',
        fontSize: 14,
      },
      children: [],
    };
  }
}

// Утилиты для работы с компонентами
export class UIComponentUtils {
  static findById(component: UIComponent, id: string): UIComponent | null {
    if (component.id === id) {
      return component;
    }
    
    if (component.children) {
      for (const child of component.children) {
        const found = this.findById(child, id);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }

  static setVisible(component: UIComponent, visible: boolean): void {
    component.visible = visible;
  }

  static setEnabled(component: UIComponent, enabled: boolean): void {
    component.enabled = enabled;
  }

  static setPosition(component: UIComponent, x: number, y: number): void {
    component.position = { x, y };
  }

  static setSize(component: UIComponent, width: number, height: number): void {
    component.size = { width, height };
  }

  static addChild(parent: UIComponent, child: UIComponent): void {
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(child);
  }

  static removeChild(parent: UIComponent, childId: string): boolean {
    if (!parent.children) {
      return false;
    }
    
    const index = parent.children.findIndex(c => c.id === childId);
    if (index > -1) {
      parent.children.splice(index, 1);
      return true;
    }
    
    return false;
  }

  static applyStyle(component: UIComponent, style: Partial<UIStyle>): void {
    if (!component.style) {
      component.style = {};
    }
    component.style = { ...component.style, ...style };
  }
}
