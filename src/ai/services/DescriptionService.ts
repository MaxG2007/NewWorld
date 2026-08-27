import { AIManager } from '../managers/AIManager';
import { AIRequest, DescriptionContext } from '../types/AITypes';

/**
 * Сервис для генерации описаний (NPC, предметы, локации)
 */
export class DescriptionService {
  private aiManager: AIManager;

  constructor(aiManager: AIManager) {
    this.aiManager = aiManager;
  }

  /**
   * Генерация описания объекта
   */
  async generateDescription(context: DescriptionContext): Promise<string> {
    const request: AIRequest = {
      task: 'description',
      context: {
        targetType: context.targetType,
        data: context.data,
        style: context.style || 'brief',
        maxLength: context.maxLength || 200,
      },
      prompt: this.buildDescriptionPrompt(context),
      maxTokens: context.maxLength ? Math.floor(context.maxLength / 4) : 64,
      temperature: context.style === 'poetic' ? 0.9 : 0.7,
    };

    const response = await this.aiManager.generate(request);
    
    if (response.success && response.content) {
      return response.content;
    }
    
    return this.generateFallbackDescription(context);
  }

  private buildDescriptionPrompt(context: DescriptionContext): string {
    const { targetType, data, style, maxLength } = context;
    
    let prompt = `Generate a ${style || 'brief'} description for ${targetType}. `;
    
    switch (targetType) {
      case 'npc':
        prompt += `Name: ${data.name || 'Unknown'}. Race: ${data.race || 'Human'}. ` +
                  `Profession: ${data.profession || 'Commoner'}. ` +
                  `Age: ${data.age || 'Adult'}. Gender: ${data.gender || 'M'}.`;
        break;
      case 'item':
        prompt += `Name: ${data.name || 'Item'}. Type: ${data.type || 'Generic'}. ` +
                  `Rarity: ${data.rarity || 'Common'}. Value: ${data.value || 'Unknown'}.`;
        break;
      case 'location':
        prompt += `Name: ${data.name || 'Place'}. Type: ${data.type || 'Area'}. ` +
                  `Biome: ${data.biome || 'Temperate'}. Climate: ${data.climate || 'Moderate'}.`;
        break;
      case 'building':
        prompt += `Name: ${data.name || 'Building'}. Type: ${data.type || 'Structure'}. ` +
                  `Condition: ${data.condition || 'Good'}. Size: ${data.size || 'Medium'}.`;
        break;
    }
    
    prompt += ` Keep it under ${maxLength || 200} characters.`;
    
    return prompt;
  }

  private generateFallbackDescription(context: DescriptionContext): string {
    const { targetType, data } = context;
    
    const templates: Record<string, string[]> = {
      npc: [
        `${data.name || 'Незнакомец'} выглядит как типичный ${data.race || 'человек'}.`,
        `${data.name || 'Этот человек'} одет в ${data.profession ? 'одежду ' + data.profession : 'простую одежду'}.`,
        `Внешность ${data.name || 'персонажа'} ничем не примечательна.`,
      ],
      item: [
        `${data.name || 'Предмет'} выглядит обычным для своих целей.`,
        `${data.name || 'Эта вещь'} имеет следы использования.`,
        `Качественная работа, ничего особенного.`,
      ],
      location: [
        `${data.name || 'Это место'} типично для данной местности.`,
        `Здесь чувствуется особая атмосфера.`,
        `Место с интересной историей.`,
      ],
      building: [
        `${data.name || 'Здание'} выглядит надёжным.`,
        `Строение в хорошем состоянии.`,
        `Типичное здание для этих краёв.`,
      ],
    };

    const typeTemplates = templates[targetType] || templates.npc;
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  }

  /**
   * Генерация короткого описания для портрета NPC
   */
  async generatePortraitDescription(npcData: Record<string, any>): Promise<string> {
    return this.generateDescription({
      targetType: 'npc',
      data: npcData,
      style: 'brief',
      maxLength: 100,
    });
  }

  /**
   * Генерация подробного описания для журнала
   */
  async generateDetailedDescription(targetType: string, data: Record<string, any>): Promise<string> {
    return this.generateDescription({
      targetType: targetType as any,
      data,
      style: 'detailed',
      maxLength: 500,
    });
  }

  /**
   * Генерация поэтичного описания для особых событий
   */
  async generatePoeticDescription(targetType: string, data: Record<string, any>): Promise<string> {
    return this.generateDescription({
      targetType: targetType as any,
      data,
      style: 'poetic',
      maxLength: 300,
    });
  }
}
