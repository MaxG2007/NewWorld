import { AIAdapter, AIRequest, AIResponse, AIStats } from '../types/AITypes';

/**
 * Базовый абстрактный класс адаптера ИИ
 * Все адаптеры должны наследовать этот класс
 */
export abstract class BaseAIAdapter implements AIAdapter {
  protected initialized: boolean = false;
  protected stats: AIStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    fallbackUsed: 0,
    averageResponseTime: 0,
  };

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  abstract isAvailable(): boolean;

  abstract generate(request: AIRequest): Promise<AIResponse>;

  getStats(): AIStats {
    return { ...this.stats };
  }

  protected updateStats(success: boolean, responseTime: number, usedFallback: boolean = false) {
    this.stats.totalRequests++;
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }
    if (usedFallback) {
      this.stats.fallbackUsed++;
    }
    
    // Скользящее среднее для времени ответа
    const totalReqs = this.stats.totalRequests;
    this.stats.averageResponseTime = 
      ((this.stats.averageResponseTime * (totalReqs - 1)) + responseTime) / totalReqs;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
  }
}
