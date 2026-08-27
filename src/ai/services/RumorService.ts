import { AIManager } from '../managers/AIManager';
import { AIRequest, RumorContext } from '../types/AITypes';

/**
 * Сервис для генерации и распространения слухов
 */
export class RumorService {
  private aiManager: AIManager;

  constructor(aiManager: AIManager) {
    this.aiManager = aiManager;
  }

  /**
   * Генерация слуха на основе события
   */
  async generateRumor(context: RumorContext): Promise<string> {
    const request: AIRequest = {
      task: 'rumor',
      context: {
        source: context.source,
        baseEvent: context.baseEvent,
        region: context.region,
        distortionLevel: context.distortionLevel,
      },
      prompt: this.buildRumorPrompt(context),
      maxTokens: 128,
      temperature: 0.7 + (context.distortionLevel * 0.3), // Больше искажений = больше креативности
    };

    const response = await this.aiManager.generate(request);
    
    if (response.success && response.content) {
      return this.applyDistortion(response.content, context.distortionLevel);
    }
    
    return response.content || 'Ходят какие-то слухи...';
  }

  private buildRumorPrompt(context: RumorContext): string {
    const { source, baseEvent, region, distortionLevel } = context;
    
    return `Generate a rumor based on event: "${baseEvent}". ` +
           `Source: ${source.name} (credibility: ${source.credibility}). ` +
           `Region: ${region}. ` +
           `Distortion level: ${distortionLevel} (0=accurate, 1=highly distorted). ` +
           `Make it sound like gossip.`;
  }

  /**
   * Применение искажений к слуху при передаче
   */
  private applyDistortion(rumor: string, distortionLevel: number): string {
    if (distortionLevel < 0.1) {
      return rumor;
    }

    // Простые искажения для fallback
    const distortions = [
      { from: 'один', to: 'множество' },
      { from: 'маленький', to: 'огромный' },
      { from: 'вчера', to: 'давно' },
      { from: 'возможно', to: 'точно' },
      { from: 'некоторые', to: 'все' },
    ];

    let distorted = rumor;
    const numDistortions = Math.floor(distortionLevel * 3);

    for (let i = 0; i < numDistortions; i++) {
      const d = distortions[Math.floor(Math.random() * distortions.length)];
      distorted = distorted.replace(d.from, d.to);
    }

    return distorted;
  }

  /**
   * Передача слуха от одного NPC к другому с возможным искажением
   */
  async transmitRumor(
    originalRumor: string,
    newSource: { name: string; credibility: number },
    distortionIncrease: number = 0.1
  ): Promise<string> {
    const request: AIRequest = {
      task: 'rumor',
      context: {
        source: newSource,
        baseEvent: originalRumor,
        region: 'unknown',
        distortionLevel: distortionIncrease,
      },
      prompt: `Retell this rumor with slight variation: "${originalRumor}". ` +
              `New source: ${newSource.name}. Make it sound like second-hand information.`,
      maxTokens: 128,
      temperature: 0.8,
    };

    const response = await this.aiManager.generate(request);
    
    if (response.success && response.content) {
      return response.content;
    }

    // Fallback: простое добавление "слышал от..."
    return `${newSource.name} пересказывает: "${originalRumor}"`;
  }

  /**
   * Создание цепочки слухов (как слух изменяется при передаче)
   */
  async createRumorChain(
    baseEvent: string,
    initialSource: { name: string; credibility: number },
    chainLength: number = 5
  ): Promise<string[]> {
    const chain: string[] = [];
    let currentRumor = baseEvent;

    for (let i = 0; i < chainLength; i++) {
      const source = {
        name: `NPC_${i}`,
        credibility: Math.max(0.1, initialSource.credibility - (i * 0.1)),
      };

      currentRumor = await this.transmitRumor(
        currentRumor,
        source,
        0.15 * (i + 1)
      );

      chain.push(currentRumor);
    }

    return chain;
  }
}
