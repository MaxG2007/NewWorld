/**
 * Система миграции версий сохранений
 */

import { MigrationStep, SaveData } from '../types/SaveTypes';

export class SaveVersioning {
  private static migrations: MigrationStep[] = [
    // Пример миграции с версии 1 на версию 2
    {
      fromVersion: 1,
      toVersion: 2,
      migrate: (data: any) => {
        // Добавить новые поля при необходимости
        if (!data.inventoryState) {
          data.inventoryState = {};
        }
        return data;
      },
    },
    // Миграция с версии 2 на версию 3
    {
      fromVersion: 2,
      toVersion: 3,
      migrate: (data: any) => {
        if (!data.questState) {
          data.questState = {};
        }
        return data;
      },
    },
    // Миграция с версии 3 на версию 4
    {
      fromVersion: 3,
      toVersion: 4,
      migrate: (data: any) => {
        if (!data.relationsState) {
          data.relationsState = {};
        }
        return data;
      },
    },
    // Миграция с версии 4 на версию 5
    {
      fromVersion: 4,
      toVersion: 5,
      migrate: (data: any) => {
        if (!data.knowledgeState) {
          data.knowledgeState = {};
        }
        return data;
      },
    },
    // Миграция с версии 5 на версию 6
    {
      fromVersion: 5,
      toVersion: 6,
      migrate: (data: any) => {
        if (!data.buildingState) {
          data.buildingState = {};
        }
        return data;
      },
    },
    // Миграция с версии 6 на версию 7
    {
      fromVersion: 6,
      toVersion: 7,
      migrate: (data: any) => {
        if (!data.eventState) {
          data.eventState = {};
        }
        return data;
      },
    },
    // Миграция с версии 7 на версию 8
    {
      fromVersion: 7,
      toVersion: 8,
      migrate: (data: any) => {
        // Обновление структуры мира
        if (data.worldState && !data.worldState.regions) {
          data.worldState.regions = [];
        }
        return data;
      },
    },
    // Миграция с версии 8 на версию 9
    {
      fromVersion: 8,
      toVersion: 9,
      migrate: (data: any) => {
        // Добавление метаданных персонажа
        if (data.characterState && !data.characterState.appearance) {
          data.characterState.appearance = {};
        }
        return data;
      },
    },
    // Миграция с версии 9 на версию 10
    {
      fromVersion: 9,
      toVersion: 10,
      migrate: (data: any) => {
        // Добавление системы навыков
        if (data.characterState && !data.characterState.skills) {
          data.characterState.skills = [];
        }
        return data;
      },
    },
    // Миграция с версии 10 на версию 11
    {
      fromVersion: 10,
      toVersion: 11,
      migrate: (data: any) => {
        // Добавление системы репутации
        if (data.relationsState && !data.relationsState.reputation) {
          data.relationsState.reputation = {};
        }
        return data;
      },
    },
    // Миграция с версии 11 на версию 12
    {
      fromVersion: 11,
      toVersion: 12,
      migrate: (data: any) => {
        // Добавление системы крафта
        if (!data.craftingState) {
          data.craftingState = {};
        }
        return data;
      },
    },
  ];

  /**
   * Мигрирует данные сохранения до текущей версии
   */
  static migrate(data: SaveData): SaveData {
    const currentVersion = data.versionInfo.saveVersion;
    const targetVersion = this.getTargetVersion();

    if (currentVersion >= targetVersion) {
      return data;
    }

    console.log(`Migrating save from version ${currentVersion} to ${targetVersion}`);

    let migratedData = { ...data };

    for (const migration of this.migrations) {
      if (
        migratedData.versionInfo.saveVersion === migration.fromVersion &&
        migration.toVersion <= targetVersion
      ) {
        try {
          migratedData = migration.migrate(migratedData);
          migratedData.versionInfo.saveVersion = migration.toVersion;
          console.log(`Applied migration ${migration.fromVersion} -> ${migration.toVersion}`);
        } catch (error) {
          console.error(`Migration failed from ${migration.fromVersion} to ${migration.toVersion}:`, error);
          throw new Error(
            `Failed to migrate save from version ${migration.fromVersion} to ${migration.toVersion}`
          );
        }
      }
    }

    return migratedData;
  }

  /**
   * Получает целевую версию для миграции
   */
  static getTargetVersion(): number {
    // Возвращаем максимальную версию из доступных миграций
    return Math.max(...this.migrations.map((m) => m.toVersion));
  }

  /**
   * Проверяет, требуется ли миграция
   */
  static needsMigration(data: SaveData): boolean {
    return data.versionInfo.saveVersion < this.getTargetVersion();
  }

  /**
   * Добавляет новую миграцию
   */
  static addMigration(step: MigrationStep): void {
    this.migrations.push(step);
  }

  /**
   * Получает список доступных миграций
   */
  static getMigrations(): MigrationStep[] {
    return [...this.migrations];
  }
}
