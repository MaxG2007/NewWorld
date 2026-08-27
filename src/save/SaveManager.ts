/**
 * Менеджер сохранений игры
 * Поддерживает: autosave, manual save, backup, export/import, version migration, checksum, rollback
 */

import { SaveData, SaveMetadata, BackupSave } from '../types/SaveTypes';
import { SaveChecksum } from './SaveChecksum';
import { SaveVersioning } from './SaveVersioning';
import { LogManager } from './LogManager';
import {
  CURRENT_SAVE_VERSION,
  CURRENT_WORLD_VERSION,
  CURRENT_CONTENT_VERSION,
} from '../types/SaveTypes';

export class SaveManager {
  private static autosaveInterval: number | null = null;
  private static autosaveDelay = 300000; // 5 минут по умолчанию
  private static maxBackups = 5;
  private static backups: BackupSave[] = [];
  private static isAutosaveEnabled = true;
  private static pendingAutoSave = false;

  /**
   * Инициализация менеджера сохранений
   */
  static init(): void {
    LogManager.info('SaveManager', 'Save manager initialized');
    this.loadBackupsList();
  }

  /**
   * Включает автосохранение
   */
  static enableAutosave(delayMs?: number): void {
    this.isAutosaveEnabled = true;
    if (delayMs) {
      this.autosaveDelay = delayMs;
    }
    this.startAutosaveTimer();
    LogManager.info('SaveManager', `Autosave enabled with delay ${this.autosaveDelay}ms`);
  }

  /**
   * Выключает автосохранение
   */
  static disableAutosave(): void {
    this.isAutosaveEnabled = false;
    if (this.autosaveInterval) {
      clearTimeout(this.autosaveInterval);
      this.autosaveInterval = null;
    }
    LogManager.info('SaveManager', 'Autosave disabled');
  }

  /**
   * Запускает таймер автосохранения
   */
  private static startAutosaveTimer(): void {
    if (this.autosaveInterval) {
      clearTimeout(this.autosaveInterval);
    }

    this.autosaveInterval = window.setTimeout(() => {
      if (this.isAutosaveEnabled && this.pendingAutoSave) {
        this.performAutosave();
      }
      this.startAutosaveTimer();
    }, this.autosaveDelay);
  }

  /**
   * Отмечает необходимость автосохранения
   */
  static markDirty(): void {
    this.pendingAutoSave = true;
  }

  /**
   * Выполняет автосохранение
   */
  private static async performAutosave(): Promise<void> {
    if (!this.pendingAutoSave) return;

    try {
      LogManager.debug('SaveManager', 'Performing autosave');
      await this.save('autosave', true);
      this.pendingAutoSave = false;
    } catch (error) {
      LogManager.error('SaveManager', 'Autosave failed', error);
    }
  }

  /**
   * Ручное сохранение
   */
  static async manualSave(name?: string): Promise<boolean> {
    const saveName = name || `manual_${Date.now()}`;
    LogManager.info('SaveManager', `Manual save: ${saveName}`);
    return this.save(saveName, false);
  }

  /**
   * Основная функция сохранения
   */
  static async save(name: string, isAutosave: boolean): Promise<boolean> {
    try {
      // Сбор данных для сохранения
      const saveData = this.collectSaveData(name, isAutosave);

      // Расчёт контрольной суммы
      saveData.checksum = SaveChecksum.calculate(saveData);

      // Создание резервной копии перед сохранением
      if (!isAutosave) {
        await this.createBackup(name);
      }

      // Сохранение данных
      await this.persistSave(name, saveData);

      LogManager.info(
        'SaveManager',
        `Save successful: ${name} (version ${saveData.versionInfo.saveVersion})`
      );

      return true;
    } catch (error) {
      LogManager.error('SaveManager', `Save failed: ${name}`, error);
      return false;
    }
  }

  /**
   * Собирает данные для сохранения
   */
  private static collectSaveData(name: string, isAutosave: boolean): SaveData {
    const metadata: SaveMetadata = {
      timestamp: Date.now(),
      playtime: this.getPlaytime(),
      characterName: this.getCharacterName(),
      location: this.getPlayerLocation(),
      gameVersion: this.getGameVersion(),
      versionInfo: {
        saveVersion: CURRENT_SAVE_VERSION,
        worldVersion: CURRENT_WORLD_VERSION,
        contentVersion: CURRENT_CONTENT_VERSION,
      },
    };

    return {
      versionInfo: metadata.versionInfo,
      metadata,
      checksum: '', // Будет рассчитан позже
      worldState: this.getWorldState(),
      characterState: this.getCharacterState(),
      questState: this.getQuestState(),
      inventoryState: this.getInventoryState(),
      relationsState: this.getRelationsState(),
      knowledgeState: this.getKnowledgeState(),
      buildingState: this.getBuildingState(),
      eventState: this.getEventState(),
    };
  }

  /**
   * Создаёт резервную копию сохранения
   */
  private static async createBackup(name: string): Promise<void> {
    try {
      const backupPath = `backups/${name}_${Date.now()}`;
      
      // В реальной реализации здесь было бы копирование файла
      const backup: BackupSave = {
        originalPath: `saves/${name}`,
        backupPath,
        timestamp: Date.now(),
        checksum: '',
      };

      this.backups.push(backup);
      
      // Удаляем старые备份, если превышен лимит
      if (this.backups.length > this.maxBackups) {
        const removed = this.backups.shift();
        if (removed) {
          LogManager.debug('SaveManager', `Removed old backup: ${removed.backupPath}`);
        }
      }

      LogManager.debug('SaveManager', `Created backup: ${backupPath}`);
    } catch (error) {
      LogManager.warn('SaveManager', 'Failed to create backup', error);
    }
  }

  /**
   * Загружает сохранение
   */
  static async load(name: string): Promise<SaveData | null> {
    try {
      LogManager.info('SaveManager', `Loading save: ${name}`);
      
      let saveData = await this.loadSaveData(name);
      
      if (!saveData) {
        LogManager.error('SaveManager', `Save not found: ${name}`);
        return null;
      }

      // Проверка контрольной суммы
      if (!SaveChecksum.verify(saveData)) {
        LogManager.warn('SaveManager', `Checksum verification failed for ${name}, attempting restore`);
        saveData = await this.restoreCorruptedSave(name, saveData);
        
        if (!saveData) {
          LogManager.error('SaveManager', `Failed to restore corrupted save: ${name}`);
          return null;
        }
      }

      // Миграция версии при необходимости
      if (SaveVersioning.needsMigration(saveData)) {
        LogManager.info('SaveManager', `Migrating save from version ${saveData.versionInfo.saveVersion}`);
        saveData = SaveVersioning.migrate(saveData);
        
        // Пересчитываем контрольную сумму после миграции
        saveData.checksum = SaveChecksum.calculate(saveData);
      }

      // Применение загруженных данных
      await this.applySaveData(saveData);

      LogManager.info('SaveManager', `Save loaded successfully: ${name}`);
      return saveData;
    } catch (error) {
      LogManager.error('SaveManager', `Load failed: ${name}`, error);
      return null;
    }
  }

  /**
   * Восстанавливает повреждённое сохранение из backup
   */
  private static async restoreCorruptedSave(
    name: string,
    corruptedData: SaveData
  ): Promise<SaveData | null> {
    const backup = this.backups.find((b) => b.originalPath === `saves/${name}`);
    
    if (backup) {
      LogManager.info('SaveManager', `Restoring from backup: ${backup.backupPath}`);
      return SaveChecksum.restoreFromBackup(corruptedData, backup.backupPath);
    }

    LogManager.warn('SaveManager', `No backup found for ${name}`);
    return null;
  }

  /**
   * Экспортирует сохранение в JSON строку
   */
  static async export(name: string): Promise<string | null> {
    try {
      const saveData = await this.loadSaveData(name);
      if (!saveData) return null;
      
      LogManager.info('SaveManager', `Exporting save: ${name}`);
      return JSON.stringify(saveData, null, 2);
    } catch (error) {
      LogManager.error('SaveManager', `Export failed: ${name}`, error);
      return null;
    }
  }

  /**
   * Импортирует сохранение из JSON строки
   */
  static async import(jsonData: string, name: string): Promise<boolean> {
    try {
      const saveData = JSON.parse(jsonData) as SaveData;
      
      LogManager.info('SaveManager', `Importing save as: ${name}`);
      
      // Валидация структуры
      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save data structure');
      }

      // Миграция при необходимости
      if (SaveVersioning.needsMigration(saveData)) {
        saveData.versionInfo.saveVersion = CURRENT_SAVE_VERSION;
      }

      // Сохранение импортированных данных
      await this.persistSave(name, saveData);
      
      LogManager.info('SaveManager', `Import successful: ${name}`);
      return true;
    } catch (error) {
      LogManager.error('SaveManager', 'Import failed', error);
      return false;
    }
  }

  /**
   * Валидирует структуру данных сохранения
   */
  private static validateSaveData(data: any): boolean {
    return (
      data.versionInfo !== undefined &&
      data.metadata !== undefined &&
      data.worldState !== undefined &&
      data.characterState !== undefined
    );
  }

  /**
   * Загружает список резервных копий
   */
  private static loadBackupsList(): void {
    // В реальной реализации здесь была бы загрузка из файловой системы
    this.backups = [];
  }

  // Заглушки для методов получения состояния игры
  private static getPlaytime(): number {
    return 0;
  }

  private static getCharacterName(): string {
    return 'Unknown';
  }

  private static getPlayerLocation(): string {
    return 'Unknown';
  }

  private static getGameVersion(): string {
    return '1.0.0';
  }

  private static getWorldState(): any {
    return {};
  }

  private static getCharacterState(): any {
    return {};
  }

  private static getQuestState(): any {
    return {};
  }

  private static getInventoryState(): any {
    return {};
  }

  private static getRelationsState(): any {
    return {};
  }

  private static getKnowledgeState(): any {
    return {};
  }

  private static getBuildingState(): any {
    return {};
  }

  private static getEventState(): any {
    return {};
  }

  private static async persistSave(name: string, data: SaveData): Promise<void> {
    // В реальной реализации здесь было бы сохранение в файл / localStorage / IndexedDB
    console.log(`Persisting save: ${name}`);
  }

  private static async loadSaveData(name: string): Promise<SaveData | null> {
    // В реальной реализации здесь была бы загрузка из файла / localStorage / IndexedDB
    console.log(`Loading save: ${name}`);
    return null;
  }

  private static async applySaveData(data: SaveData): Promise<void> {
    // Применение загруженных данных к состоянию игры
    console.log('Applying save data');
  }

  /**
   * Получает список доступных сохранений
   */
  static async getSaveList(): Promise<string[]> {
    // В реальной реализации здесь был бы список файлов
    return [];
  }

  /**
   * Удаляет сохранение
   */
  static async deleteSave(name: string): Promise<boolean> {
    try {
      LogManager.info('SaveManager', `Deleting save: ${name}`);
      // В реальной реализации здесь было бы удаление файла
      return true;
    } catch (error) {
      LogManager.error('SaveManager', `Delete failed: ${name}`, error);
      return false;
    }
  }
}
