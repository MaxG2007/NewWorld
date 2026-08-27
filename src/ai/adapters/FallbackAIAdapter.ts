import { AIRequest, AIResponse } from '../types/AITypes';
import { BaseAIAdapter } from './BaseAIAdapter';

/**
 * Fallback адаптер - используется когда локальная модель недоступна
 * Возвращает заранее заготовленные шаблоны вместо генерации ИИ
 */
export class FallbackAIAdapter extends BaseAIAdapter {
  private dialogueTemplates: Record<string, string[]> = {
    greeting: [
      'Здравствуй!',
      'Приветствую тебя.',
      'Доброго времени суток.',
      'Рад видеть тебя.',
    ],
    farewell: [
      'До встречи.',
      'Береги себя.',
      'Удачи в пути.',
      'Возвращайся скорее.',
    ],
    quest_offer: [
      'Мне нужна твоя помощь.',
      'Есть дело, которое только тебе по силам.',
      'Слушай, у меня есть предложение.',
    ],
    trade: [
      'Посмотри мои товары.',
      'Есть что-то интересное для продажи.',
      'Обменяемся?',
    ],
    generic: [
      'Интересные времена настали.',
      'Ходят разные слухи...',
      'Никогда не знаешь, чего ждать.',
      'Жизнь полна сюрпризов.',
    ],
  };

  private rumorTemplates: string[] = [
    'Говорят, в соседнем городе видели странного путника.',
    'Ходят слухи о новых залежах руды в горах.',
    'Некоторые утверждают, что цены скоро вырастут.',
    'Поговаривают о приближающейся буре.',
    'Кто-то видел редкого зверя в лесах.',
  ];

  private descriptionTemplates: Record<string, string[]> = {
    npc: [
      'Обычный житель этих мест.',
      'Выглядит опытным и бывалым.',
      'Одежда простая, но опрятная.',
      'Во взгляде читается ум.',
    ],
    item: [
      'Качественная работа мастера.',
      'Видно, что вещь служила долго.',
      'Простой, но надёжный предмет.',
      'Имеет следы использования.',
    ],
    location: [
      'Типичное место для этих краёв.',
      'Здесь чувствуется особая атмосфера.',
      'Место с богатой историей.',
      'Тихое и спокойное место.',
    ],
  };

  isAvailable(): boolean {
    return true; // Fallback всегда доступен
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    let content = '';

    try {
      switch (request.task) {
        case 'dialogue':
          content = this.generateDialogue(request.context);
          break;
        case 'rumor':
          content = this.generateRumor(request.context);
          break;
        case 'description':
        case 'npc_description':
          content = this.generateDescription(request.context);
          break;
        case 'npc_portrait':
          content = this.generatePortraitDescription(request.context);
          break;
        default:
          content = this.generateGeneric(request.prompt);
      }

      const responseTime = Date.now() - startTime;
      this.updateStats(true, responseTime, true); // usedFallback = true

      return {
        success: true,
        content,
        metadata: {
          model: 'fallback',
          generationTime: responseTime,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateStats(false, responseTime, true);

      return {
        success: false,
        content: '',
        error: (error as Error).message,
      };
    }
  }

  private generateDialogue(context: any): string {
    const templates = this.dialogueTemplates;
    const keys = Object.keys(templates);
    
    if (context?.topic) {
      const topicKey = context.topic.toLowerCase();
      for (const key of keys) {
        if (topicKey.includes(key)) {
          return this.pickRandom(templates[key]);
        }
      }
    }
    
    // Выбираем случайную реплику из всех доступных
    const allTemplates = Object.values(templates).flat();
    return this.pickRandom(allTemplates);
  }

  private generateRumor(context: any): string {
    let rumor = this.pickRandom(this.rumorTemplates);
    
    if (context?.region) {
      rumor = rumor.replace('в соседнем городе', `в ${context.region}`);
    }
    
    if (context?.source?.name) {
      rumor = `${context.source.name} рассказывает: "${rumor}"`;
    }
    
    return rumor;
  }

  private generateDescription(context: any): string {
    const type = context?.targetType || 'npc';
    const templates = this.descriptionTemplates[type] || this.descriptionTemplates.npc;
    
    let description = this.pickRandom(templates);
    
    if (context?.data?.name) {
      description = `${context.data.name}. ${description}`;
    }
    
    return description;
  }

  private generatePortraitDescription(context: any): string {
    const features = [
      'светлые волосы', 'тёмные волосы', 'рыжие волосы',
      'голубые глаза', 'карие глаза', 'зелёные глаза',
      'высокий рост', 'средний рост', 'низкий рост',
      'стройное телосложение', 'крепкое телосложение', 'полное телосложение',
    ];
    
    const selected = this.pickRandom(features);
    return `Человек с ${selected}.`;
  }

  private generateGeneric(prompt?: string): string {
    const responses = [
      'Интересный вопрос.',
      'Это требует размышлений.',
      'Не могу дать точный ответ.',
      'Продолжайте в том же духе.',
    ];
    return this.pickRandom(responses);
  }

  private pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
