/**
 * Unit тесты для системы сохранений (save/load)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

interface SaveData {
  version: number;
  timestamp: number;
  worldState: Record<string, unknown>;
  playerState: Record<string, unknown>;
  checksum?: string;
}

export class SaveLoadTest {
  private suite: TestSuite = {
    name: 'Save/Load System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testSaveCreation();
    this.testLoadIntegrity();
    this.testVersionMigration();
    this.testChecksumValidation();
    this.testCorruptedSaveRecovery();
    return this.suite;
  }

  private testSaveCreation(): void {
    const startTime = Date.now();
    try {
      const saveData: SaveData = {
        version: 1,
        timestamp: Date.now(),
        worldState: { day: 100, year: 1050 },
        playerState: { health: 100, gold: 500 }
      };

      // Проверка структуры сохранения
      if (!saveData.version || !saveData.timestamp) {
        throw new Error('Save data missing required fields');
      }

      if (!saveData.worldState || !saveData.playerState) {
        throw new Error('Save data missing state objects');
      }

      this.addTest('save_creation', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('save_creation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testLoadIntegrity(): void {
    const startTime = Date.now();
    try {
      const originalData: SaveData = {
        version: 1,
        timestamp: 1234567890,
        worldState: { day: 100, year: 1050, cities: 5 },
        playerState: { health: 100, gold: 500, level: 10 }
      };

      // Сериализация и десериализация
      const serialized = JSON.stringify(originalData);
      const loadedData: SaveData = JSON.parse(serialized);

      // Проверка целостности после загрузки
      if (loadedData.version !== originalData.version) {
        throw new Error('Version mismatch after load');
      }

      if (loadedData.timestamp !== originalData.timestamp) {
        throw new Error('Timestamp mismatch after load');
      }

      if (JSON.stringify(loadedData.worldState) !== JSON.stringify(originalData.worldState)) {
        throw new Error('World state mismatch after load');
      }

      if (JSON.stringify(loadedData.playerState) !== JSON.stringify(originalData.playerState)) {
        throw new Error('Player state mismatch after load');
      }

      this.addTest('load_integrity', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('load_integrity', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testVersionMigration(): void {
    const startTime = Date.now();
    try {
      const oldSave: SaveData = {
        version: 1,
        timestamp: 1234567890,
        worldState: { day: 100 },
        playerState: { health: 100 }
      };

      // Миграция версии 1 -> 2
      const migrated = this.migrateSave(oldSave, 2);

      if (migrated.version !== 2) {
        throw new Error('Migration should update version');
      }

      // Проверка что данные сохранились
      if (!migrated.worldState || !migrated.playerState) {
        throw new Error('Migration should preserve data');
      }

      this.addTest('version_migration', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('version_migration', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testChecksumValidation(): void {
    const startTime = Date.now();
    try {
      const saveData: SaveData = {
        version: 1,
        timestamp: 1234567890,
        worldState: { day: 100 },
        playerState: { health: 100 }
      };

      // Вычисление контрольной суммы
      const checksum = this.calculateChecksum(saveData);
      saveData.checksum = checksum;

      // Проверка валидности
      const isValid = this.validateChecksum(saveData);
      if (!isValid) {
        throw new Error('Valid checksum should pass validation');
      }

      // Повреждение данных
      saveData.worldState.day = 999;
      const isInvalid = !this.validateChecksum(saveData);
      
      if (!isInvalid) {
        throw new Error('Modified data should fail checksum validation');
      }

      this.addTest('checksum_validation', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('checksum_validation', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testCorruptedSaveRecovery(): void {
    const startTime = Date.now();
    try {
      const validSave: SaveData = {
        version: 1,
        timestamp: 1234567890,
        worldState: { day: 100 },
        playerState: { health: 100 },
        checksum: 'valid_checksum'
      };

      const corruptedSave: SaveData = {
        version: 1,
        timestamp: 1234567890,
        worldState: { day: 100 },
        playerState: { health: 100 },
        checksum: 'invalid_checksum'
      };

      // Попытка восстановления из备份
      const backup = this.createBackup(validSave);
      const recovered = this.recoverFromBackup(corruptedSave, backup);

      if (recovered.checksum !== backup.checksum) {
        throw new Error('Recovery should restore from backup');
      }

      this.addTest('corrupted_save_recovery', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('corrupted_save_recovery', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private migrateSave(save: SaveData, targetVersion: number): SaveData {
    const migrated = { ...save };
    
    // Простая миграция: обновляем версию и добавляем новые поля если нужно
    if (targetVersion > save.version) {
      migrated.version = targetVersion;
      if (targetVersion >= 2) {
        migrated.worldState = { ...migrated.worldState, migrationApplied: true };
      }
    }
    
    return migrated;
  }

  private calculateChecksum(save: SaveData): string {
    const dataString = JSON.stringify({
      version: save.version,
      timestamp: save.timestamp,
      worldState: save.worldState,
      playerState: save.playerState
    });
    
    // Простой хэш (в реальности использовать crypto)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = ((hash << 5) - hash) + dataString.charCodeAt(i);
      hash = hash & hash;
    }
    
    return `checksum_${hash}`;
  }

  private validateChecksum(save: SaveData): boolean {
    if (!save.checksum) return false;
    const expectedChecksum = this.calculateChecksum(save);
    return save.checksum === expectedChecksum;
  }

  private createBackup(save: SaveData): SaveData {
    return JSON.parse(JSON.stringify(save));
  }

  private recoverFromBackup(corrupted: SaveData, backup: SaveData): SaveData {
    // Восстановление из backup при обнаружении повреждений
    if (!this.validateChecksum(corrupted)) {
      return backup;
    }
    return corrupted;
  }

  private addTest(name: string, passed: boolean, duration: number, error?: string): void {
    const result: TestResult = { name, passed, duration, error };
    this.suite.tests.push(result);
    this.suite.totalDuration += duration;
    if (passed) {
      this.suite.passedCount++;
    } else {
      this.suite.failedCount++;
    }
  }
}
