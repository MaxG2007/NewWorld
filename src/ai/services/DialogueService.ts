import { AIManager } from '../managers/AIManager';
import { AIRequest, DialogueContext } from '../types/AITypes';

/**
 * Сервис для генерации вариативных диалогов
 */
export class DialogueService {
  private aiManager: AIManager;

  constructor(aiManager: AIManager) {
    this.aiManager = aiManager;
  }

  /**
   * Генерация реплики для NPC
   */
  async generateDialogue(context: DialogueContext): Promise<string> {
    const request: AIRequest = {
      task: 'dialogue',
      context: {
        speaker: context.speaker,
        listener: context.listener,
        topic: context.topic,
        relationship: context.relationship,
        location: context.location,
        timeOfDay: context.timeOfDay,
        recentEvents: context.recentEvents,
      },
      prompt: this.buildDialoguePrompt(context),
      maxTokens: 128,
      temperature: 0.8,
    };

    const response = await this.aiManager.generate(request);
    
    if (response.success && response.content) {
      return response.content;
    }
    
    // Fallback уже обработан в AIManager
    return response.content || '...';
  }

  private buildDialoguePrompt(context: DialogueContext): string {
    const { speaker, listener, topic, relationship, location, timeOfDay } = context;
    
    return `Generate a short dialogue line for ${speaker.name} (${speaker.race}, ${speaker.profession}) ` +
           `speaking to ${listener.name}. ` +
           `Location: ${location}, Time: ${timeOfDay}. ` +
           `Relationship: ${relationship}. ` +
           `Topic: ${topic || 'general'}. ` +
           `Keep it brief and in character.`;
  }

  /**
   * Генерация вариантов ответов для игрока
   */
  async generateResponseOptions(context: DialogueContext, count: number = 3): Promise<string[]> {
    const options: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const request: AIRequest = {
        task: 'dialogue',
        context: { ...context, optionIndex: i },
        prompt: `Generate response option ${i + 1} of ${count} for player to ${context.speaker.name}. ` +
                `Vary tone: ${i === 0 ? 'friendly' : i === 1 ? 'neutral' : 'assertive'}.`,
        maxTokens: 64,
        temperature: 0.9,
      };

      const response = await this.aiManager.generate(request);
      if (response.success && response.content) {
        options.push(response.content);
      } else {
        // Fallback варианты
        const fallbackOptions = [
          'Согласиться',
          'Отказаться',
          'Задать вопрос',
          'Уйти',
        ];
        options.push(fallbackOptions[i % fallbackOptions.length]);
      }
    }

    return options;
  }
}
