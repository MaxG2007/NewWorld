/**
 * Утилита для расчёта и проверки контрольных сумм
 */

import { SaveData } from '../types/SaveTypes';

export class SaveChecksum {
  /**
   * Вычисляет контрольную сумму для данных сохранения
   */
  static calculate(data: SaveData): string {
    const content = JSON.stringify({
      versionInfo: data.versionInfo,
      worldState: data.worldState,
      characterState: data.characterState,
      questState: data.questState,
      inventoryState: data.inventoryState,
      relationsState: data.relationsState,
      knowledgeState: data.knowledgeState,
      buildingState: data.buildingState,
      eventState: data.eventState,
    });
    
    return this.hash(content);
  }

  /**
   * Проверяет целостность данных сохранения
   */
  static verify(data: SaveData): boolean {
    const calculatedChecksum = this.calculate(data);
    return calculatedChecksum === data.checksum;
  }

  /**
   * Простая хеш-функция (для продакшена использовать crypto)
   */
  private static hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Восстанавливает данные из резервной копии при повреждении
   */
  static async restoreFromBackup(
    corruptedData: SaveData,
    backupPath: string
  ): Promise<SaveData | null> {
    console.log(`Attempting to restore from backup: ${backupPath}`);
    
    try {
      // В реальной реализации здесь была бы загрузка из файла
      const backupData = await this.loadBackup(backupPath);
      
      if (backupData && this.verify(backupData)) {
        console.log('Successfully restored from backup');
        return backupData;
      }
      
      console.error('Backup verification failed');
      return null;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return null;
    }
  }

  private static async loadBackup(path: string): Promise<SaveData | null> {
    // Заглушка для загрузки из файловой системы
    // В браузере это было бы через localStorage или IndexedDB
    // В Node.js через fs module
    return null;
  }
}
