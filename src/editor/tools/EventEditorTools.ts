/**
 * EventEditorTools - Инструменты редактора событий
 * Этап 34: FULL WORLD EDITOR
 */

import {
  Condition,
  Action,
  ConditionsEdit,
  ActionsEdit,
  TriggerEdit,
  RewardEdit,
  DialogueEdit,
  DialogueLine,
  DialogueChoice,
  ConditionType,
  ActionType,
} from '../types/WorldEditorTypes';

export class EventEditorTools {
  // ==================== УСЛОВИЯ ====================

  /**
   * Создать условие
   */
  createCondition(
    id: string,
    type: ConditionType,
    expression: string,
    description: string
  ): Condition {
    return {
      id,
      type,
      expression,
      description,
    };
  }

  /**
   * Редактировать условия события
   */
  editConditions(
    eventId: string,
    conditions: Condition[],
    logic: 'AND' | 'OR'
  ): ConditionsEdit {
    return {
      eventId,
      conditions,
      logic,
    };
  }

  /**
   * Проверка выполнения условия (пример реализации)
   */
  evaluateCondition(
    condition: Condition,
    context: Record<string, unknown>
  ): boolean {
    const { type, expression } = condition;

    // Примеры условий из документации:
    // age > 18
    // weather == rain
    // cityCrime > 0.5
    // hasItem == key
    // relationship < -30

    switch (type) {
      case 'age': {
        const age = context['age'] as number;
        const threshold = parseInt(expression.split(' ')[2] || '0', 10);
        const operator = expression.split(' ')[1];
        
        if (operator === '>') return age > threshold;
        if (operator === '<') return age < threshold;
        if (operator === '>=') return age >= threshold;
        if (operator === '<=') return age <= threshold;
        if (operator === '==') return age === threshold;
        return false;
      }

      case 'weather': {
        const weather = context['weather'] as string;
        const expected = expression.split(' ')[2];
        return weather === expected;
      }

      case 'cityCrime': {
        const crime = context['cityCrime'] as number;
        const threshold = parseFloat(expression.split(' ')[2] || '0');
        const operator = expression.split(' ')[1];
        
        if (operator === '>') return crime > threshold;
        if (operator === '<') return crime < threshold;
        if (operator === '>=') return crime >= threshold;
        if (operator === '<=') return crime <= threshold;
        return false;
      }

      case 'hasItem': {
        const items = context['items'] as string[];
        const requiredItem = expression.split(' ')[2];
        return items?.includes(requiredItem) ?? false;
      }

      case 'relationship': {
        const rel = context['relationship'] as number;
        const threshold = parseInt(expression.split(' ')[2] || '0', 10);
        const operator = expression.split(' ')[1];
        
        if (operator === '>') return rel > threshold;
        if (operator === '<') return rel < threshold;
        if (operator === '>=') return rel >= threshold;
        if (operator === '<=') return rel <= threshold;
        return false;
      }

      case 'time': {
        const time = context['time'] as number;
        const [start, end] = expression.split('-').map(Number);
        return time >= start && time <= end;
      }

      case 'skill': {
        const skills = context['skills'] as Record<string, number>;
        const [skillId, requiredLevel] = expression.split(':');
        return (skills?.[skillId] ?? 0) >= parseInt(requiredLevel, 10);
      }

      case 'reputation': {
        const rep = context['reputation'] as Record<string, number>;
        const [faction, minRep] = expression.split(':');
        return (rep?.[faction] ?? 0) >= parseInt(minRep, 10);
      }

      case 'quest': {
        const quests = context['quests'] as Record<string, string>;
        const [questId, status] = expression.split(':');
        return quests?.[questId] === status;
      }

      case 'season': {
        const season = context['season'] as string;
        return season === expression.split(' ')[2];
      }

      case 'isNight': {
        const isNight = context['isNight'] as boolean;
        return isNight;
      }

      case 'inCombat': {
        const inCombat = context['inCombat'] as boolean;
        return inCombat;
      }

      default:
        return false;
    }
  }

  // ==================== ДЕЙСТВИЯ ====================

  /**
   * Создать действие
   */
  createAction(
    id: string,
    type: ActionType,
    parameters: Record<string, unknown>,
    description: string
  ): Action {
    return {
      id,
      type,
      parameters,
      description,
    };
  }

  /**
   * Редактировать действия события
   */
  editActions(
    eventId: string,
    actions: Action[],
    executionOrder: 'sequential' | 'parallel' | 'random'
  ): ActionsEdit {
    return {
      eventId,
      actions,
      executionOrder,
    };
  }

  /**
   * Выполнить действие (пример реализации)
   */
  executeAction(
    action: Action,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: Record<string, unknown>
  ): void {
    const { type, parameters } = action;

    // Примеры действий из документации:
    // spawn, move, kill, marry, changePrice, startQuest, changeOwner, createRumor, openDungeon

    switch (type) {
      case 'spawn': {
        const { entityType, position, count = 1 } = parameters;
        console.log(`[Event] Spawning ${count} x ${entityType} at ${JSON.stringify(position)}`);
        break;
      }

      case 'move': {
        const { entityId, targetPosition } = parameters;
        console.log(`[Event] Moving ${entityId} to ${JSON.stringify(targetPosition)}`);
        break;
      }

      case 'kill': {
        const { targetId } = parameters;
        console.log(`[Event] Killing entity: ${targetId}`);
        break;
      }

      case 'marry': {
        const { person1, person2 } = parameters;
        console.log(`[Event] Marrying ${person1} and ${person2}`);
        break;
      }

      case 'changePrice': {
        const { itemId, multiplier, location } = parameters;
        console.log(`[Event] Changing price of ${itemId} by ${multiplier}x in ${location}`);
        break;
      }

      case 'startQuest': {
        const { questId, targetId } = parameters;
        console.log(`[Event] Starting quest ${questId} for ${targetId}`);
        break;
      }

      case 'changeOwner': {
        const { itemId, newOwnerId } = parameters;
        console.log(`[Event] Changing owner of ${itemId} to ${newOwnerId}`);
        break;
      }

      case 'createRumor': {
        const { rumorContent, source: _source, location } = parameters;
        console.log(`[Event] Creating rumor: "${rumorContent}" in ${location}`);
        break;
      }

      case 'openDungeon': {
        const { dungeonId, position } = parameters;
        console.log(`[Event] Opening dungeon ${dungeonId} at ${JSON.stringify(position)}`);
        break;
      }

      case 'giveItem': {
        const { targetId, itemId, quantity } = parameters;
        console.log(`[Event] Giving ${quantity} x ${itemId} to ${targetId}`);
        break;
      }

      case 'teleport': {
        const { entityId, position } = parameters;
        console.log(`[Event] Teleporting ${entityId} to ${JSON.stringify(position)}`);
        break;
      }

      case 'changeWeather': {
        const { weatherType, duration } = parameters;
        console.log(`[Event] Changing weather to ${weatherType} for ${duration}ms`);
        break;
      }

      case 'showMessage': {
        const { message, recipient } = parameters;
        console.log(`[Event] Showing message to ${recipient}: "${message}"`);
        break;
      }

      case 'setFlag': {
        const { flagName, value } = parameters;
        console.log(`[Event] Setting flag ${flagName} = ${value}`);
        break;
      }

      default:
        console.warn(`[Event] Unknown action type: ${type}`);
    }
  }

  // ==================== ТРИГГЕРЫ ====================

  editTrigger(
    eventId: string,
    triggerType: 'time' | 'location' | 'interaction' | 'condition_met' | 'quest_complete' | 'quest_start',
    parameters: Record<string, unknown>,
    operation: 'add' | 'modify' | 'remove'
  ): TriggerEdit {
    return {
      eventId,
      trigger: {
        type: triggerType,
        parameters,
      },
      operation,
    };
  }

  // ==================== НАГРАДЫ ====================

  editReward(
    eventId: string,
    rewardType: 'item' | 'gold' | 'experience' | 'reputation' | 'unlock' | 'title',
    value: number | string,
    description: string,
    operation: 'add' | 'modify' | 'remove'
  ): RewardEdit {
    return {
      eventId,
      reward: {
        type: rewardType,
        value,
        description,
      },
      operation,
    };
  }

  // ==================== ДИАЛОГИ ====================

  createDialogueLine(
    speaker: string,
    text: string,
    emotion?: string,
    choices?: DialogueChoice[]
  ): DialogueLine {
    return {
      speaker,
      text,
      emotion,
      choices,
    };
  }

  createDialogueChoice(
    text: string,
    nextLineId?: string,
    condition?: Condition,
    effects?: Action[]
  ): DialogueChoice {
    return {
      text,
      nextLineId,
      condition,
      effects,
    };
  }

  editDialogue(
    eventId: string,
    lines: Record<string, DialogueLine>,
    startLineId: string,
    operation: 'add' | 'modify' | 'remove'
  ): DialogueEdit {
    return {
      eventId,
      dialogue: {
        lines,
        startLineId,
      },
      operation,
    };
  }

  // ==================== УТИЛИТЫ ====================

  /**
   * Проверить все условия с указанной логикой
   */
  checkAllConditions(
    conditions: Condition[],
    logic: 'AND' | 'OR',
    context: Record<string, unknown>
  ): boolean {
    if (conditions.length === 0) {
      return true;
    }

    if (logic === 'AND') {
      return conditions.every(cond => this.evaluateCondition(cond, context));
    } else {
      return conditions.some(cond => this.evaluateCondition(cond, context));
    }
  }

  /**
   * Выполнить все действия в указанном порядке
   */
  executeAllActions(
    actions: Action[],
    order: 'sequential' | 'parallel' | 'random',
    context: Record<string, unknown>
  ): void {
    let orderedActions = [...actions];

    if (order === 'random') {
      orderedActions = orderedActions.sort(() => Math.random() - 0.5);
    }

    // В реальном приложении 'parallel' мог бы запускать Promise.all
    for (const action of orderedActions) {
      this.executeAction(action, context);
    }
  }

  /**
   * Получить описание условия в читаемом формате
   */
  getConditionDescription(condition: Condition): string {
    return condition.description || `${condition.type}: ${condition.expression}`;
  }

  /**
   * Получить описание действия в читаемом формате
   */
  getActionDescription(action: Action): string {
    return action.description || `${action.type}: ${JSON.stringify(action.parameters)}`;
  }
}

// Экспорт singleton экземпляра
export const eventEditorTools = new EventEditorTools();
