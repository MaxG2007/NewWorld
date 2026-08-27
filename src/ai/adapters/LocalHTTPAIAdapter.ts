import { AIRequest, AIResponse } from '../types/AITypes';
import { BaseAIAdapter } from './BaseAIAdapter';

/**
 * Адаптер для подключения к локальной модели через HTTP (Ollama, LM Studio и др.)
 */
export class LocalHTTPAIAdapter extends BaseAIAdapter {
  private endpoint: string;
  private model: string;
  private timeout: number;
  private maxRetries: number;
  private available: boolean = false;

  constructor(endpoint: string, model: string, timeout: number = 5000, maxRetries: number = 3) {
    super();
    this.endpoint = endpoint;
    this.model = model;
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.available = await this.checkAvailability();
  }

  private async checkAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(id);
      return response.ok;
    } catch {
      return false;
    }
  }

  isAvailable(): boolean {
    return this.available && this.initialized;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    if (!this.isAvailable()) {
      return {
        success: false,
        content: '',
        error: 'Local AI adapter not available',
      };
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${this.endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.model,
            prompt: request.prompt,
            stream: false,
            options: {
              temperature: request.temperature ?? 0.7,
              num_predict: request.maxTokens ?? 256,
            },
          }),
          signal: controller.signal,
        });
        
        clearTimeout(id);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        this.updateStats(true, responseTime);
        
        return {
          success: true,
          content: data.response || data.text || '',
          metadata: {
            model: this.model,
            generationTime: responseTime,
          },
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    const responseTime = Date.now() - startTime;
    this.updateStats(false, responseTime);
    
    return {
      success: false,
      content: '',
      error: lastError?.message || 'Unknown error',
    };
  }

  async shutdown(): Promise<void> {
    this.available = false;
    await super.shutdown();
  }
}
