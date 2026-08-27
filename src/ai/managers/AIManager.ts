import { AIAdapter, AIRequest, AIResponse, AIAdapterConfig, AIStats } from '../types/AITypes';
import { LocalHTTPAIAdapter } from '../adapters/LocalHTTPAIAdapter';
import { FallbackAIAdapter } from '../adapters/FallbackAIAdapter';

/**
 * Центральный менеджер ИИ - реализует паттерн Portable Mode
 * Динамически переключает адаптеры (Local vs Fallback)
 */
export class AIManager {
  private currentAdapter: AIAdapter | null = null;
  private fallbackAdapter: FallbackAIAdapter;
  private config: AIAdapterConfig;
  private requestQueue: Array<{
    request: AIRequest;
    resolve: (response: AIResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  private _processing: boolean = false;
  private initialized: boolean = false;

  constructor(config: AIAdapterConfig) {
    this.config = config;
    this.fallbackAdapter = new FallbackAIAdapter();
  }

  async initialize(): Promise<void> {
    // Сначала инициализируем fallback (всегда доступен)
    await this.fallbackAdapter.initialize();

    // Пытаемся инициализировать основной адаптер
    try {
      if (this.config.type === 'local_http' && this.config.endpoint) {
        this.currentAdapter = new LocalHTTPAIAdapter(
          this.config.endpoint,
          this.config.model || 'llama2',
          this.config.timeout,
          this.config.maxRetries
        );
        await this.currentAdapter.initialize();
        
        if (!this.currentAdapter.isAvailable()) {
          console.warn('Local AI not available, using fallback');
          this.currentAdapter = this.fallbackAdapter;
        }
      } else {
        this.currentAdapter = this.fallbackAdapter;
      }
      
      this.initialized = true;
      console.log(`AI Manager initialized with adapter: ${this.config.type}`);
    } catch (error) {
      console.error('Failed to initialize AI adapter, using fallback:', error);
      this.currentAdapter = this.fallbackAdapter;
      this.initialized = true;
    }

    // Запускаем обработчик очереди
    this.processQueue();
  }

  /**
   * Генерация ответа с автоматическим переключением на fallback при ошибке
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error('AI Manager not initialized');
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
    });
  }

  /**
   * Обработка очереди запросов
   */
  private async processQueue(): Promise<void> {
    while (true) {
      if (this.requestQueue.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      const { request, resolve, reject } = this.requestQueue.shift()!;

      try {
        if (!this.currentAdapter) {
          throw new Error('No AI adapter available');
        }

        let response = await this.currentAdapter.generate(request);

        // Если основной адаптер не справился, используем fallback
        if (!response.success && this.currentAdapter !== this.fallbackAdapter) {
          console.warn('Primary AI failed, switching to fallback');
          response = await this.fallbackAdapter.generate(request);
        }

        resolve(response);
      } catch (error) {
        // При критической ошибке переключаемся на fallback
        if (this.currentAdapter !== this.fallbackAdapter) {
          console.error('AI adapter error, switching to fallback:', error);
          this.currentAdapter = this.fallbackAdapter;
          
          // Повторяем запрос через fallback
          try {
            const response = await this.fallbackAdapter.generate(request);
            resolve(response);
            continue;
          } catch (fallbackError) {
            reject(fallbackError as Error);
            continue;
          }
        }
        
        reject(error as Error);
      }
    }
  }

  /**
   * Проверка доступности ИИ
   */
  isAvailable(): boolean {
    return this.currentAdapter?.isAvailable() ?? false;
  }

  /**
   * Получение статистики
   */
  getStats(): AIStats {
    if (!this.currentAdapter) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        fallbackUsed: 0,
        averageResponseTime: 0,
      };
    }
    return this.currentAdapter.getStats();
  }

  /**
   * Принудительное переключение на fallback
   */
  forceFallback(): void {
    if (this.currentAdapter !== this.fallbackAdapter) {
      console.log('Forcing fallback mode');
      this.currentAdapter = this.fallbackAdapter;
    }
  }

  /**
   * Попытка восстановления основного адаптера
   */
  async tryReconnect(): Promise<boolean> {
    if (this.config.type !== 'local_http' || !this.config.endpoint) {
      return false;
    }

    try {
      const newAdapter = new LocalHTTPAIAdapter(
        this.config.endpoint,
        this.config.model || 'llama2',
        this.config.timeout,
        this.config.maxRetries
      );
      
      await newAdapter.initialize();
      
      if (newAdapter.isAvailable()) {
        this.currentAdapter = newAdapter;
        console.log('Successfully reconnected to local AI');
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {
    this.requestQueue = [];
    if (this.currentAdapter) {
      await this.currentAdapter.shutdown();
    }
    this.initialized = false;
  }
}
