/**
 * Система логирования событий игры
 */

import { LogEntry, LogFilter } from '../types/SaveTypes';

export class LogManager {
  private static logs: LogEntry[] = [];
  private static maxLogs = 10000;
  private static logListeners: ((entry: LogEntry) => void)[] = [];

  /**
   * Добавляет запись в лог
   */
  static log(
    level: 'debug' | 'info' | 'warn' | 'error',
    category: string,
    message: string,
    data?: any
  ): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);

    // Ограничиваем размер лога
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Уведомляем слушателей
    this.logListeners.forEach((listener) => listener(entry));

    // Выводим в консоль для отладки
    if (level === 'debug' && process.env.NODE_ENV !== 'production') {
      console.debug(`[${category}] ${message}`, data || '');
    } else if (level === 'info') {
      console.info(`[${category}] ${message}`, data || '');
    } else if (level === 'warn') {
      console.warn(`[${category}] ${message}`, data || '');
    } else if (level === 'error') {
      console.error(`[${category}] ${message}`, data || '');
    }
  }

  /**
   * Логирование отладочных сообщений
   */
  static debug(category: string, message: string, data?: any): void {
    this.log('debug', category, message, data);
  }

  /**
   * Логирование информационных сообщений
   */
  static info(category: string, message: string, data?: any): void {
    this.log('info', category, message, data);
  }

  /**
   * Логирование предупреждений
   */
  static warn(category: string, message: string, data?: any): void {
    this.log('warn', category, message, data);
  }

  /**
   * Логирование ошибок
   */
  static error(category: string, message: string, data?: any): void {
    this.log('error', category, message, data);
  }

  /**
   * Получает логи с фильтрацией
   */
  static getLogs(filter?: LogFilter): LogEntry[] {
    let filtered = [...this.logs];

    if (filter) {
      if (filter.level) {
        filtered = filtered.filter((log) => log.level === filter.level);
      }
      if (filter.category) {
        filtered = filtered.filter((log) => log.category === filter.category);
      }
      if (filter.startTime) {
        filtered = filtered.filter((log) => log.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        filtered = filtered.filter((log) => log.timestamp <= filter.endTime!);
      }
    }

    return filtered;
  }

  /**
   * Очищает логи
   */
  static clear(): void {
    this.logs = [];
    this.info('LogManager', 'Logs cleared');
  }

  /**
   * Экспортирует логи в JSON
   */
  static export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Подписывается на новые записи лога
   */
  static subscribe(listener: (entry: LogEntry) => void): () => void {
    this.logListeners.push(listener);
    return () => {
      const index = this.logListeners.indexOf(listener);
      if (index > -1) {
        this.logListeners.splice(index, 1);
      }
    };
  }

  /**
   * Получает статистику логов
   */
  static getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    for (const log of this.logs) {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    }

    return stats;
  }

  /**
   * Сохраняет логи в файл (для Node.js окружения)
   */
  static async saveToFile(filePath: string): Promise<void> {
    try {
      // В реальной реализации здесь было бы сохранение в файл
      console.log(`Saving logs to ${filePath}`);
      const logsJson = this.export();
      // fs.writeFileSync(filePath, logsJson);
    } catch (error) {
      this.error('LogManager', `Failed to save logs to file: ${filePath}`, error);
    }
  }
}
