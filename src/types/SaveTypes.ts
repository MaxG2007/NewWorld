/**
 * Типы данных для системы сохранений и логирования
 */

export interface SaveVersionInfo {
  saveVersion: number;      // Версия формата сохранения
  worldVersion: number;     // Версия мира
  contentVersion: number;   // Версия контента
}

export interface SaveMetadata {
  timestamp: number;
  playtime: number;
  characterName: string;
  location: string;
  gameVersion: string;
  versionInfo: SaveVersionInfo;
}

export interface SaveData {
  versionInfo: SaveVersionInfo;
  metadata: SaveMetadata;
  checksum: string;
  worldState: any;
  characterState: any;
  questState: any;
  inventoryState: any;
  relationsState: any;
  knowledgeState: any;
  buildingState: any;
  eventState: any;
}

export interface BackupSave {
  originalPath: string;
  backupPath: string;
  timestamp: number;
  checksum: string;
}

export interface MigrationStep {
  fromVersion: number;
  toVersion: number;
  migrate: (data: any) => any;
}

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

export interface LogFilter {
  level?: string;
  category?: string;
  startTime?: number;
  endTime?: number;
}

export const CURRENT_SAVE_VERSION = 12;
export const CURRENT_WORLD_VERSION = 8;
export const CURRENT_CONTENT_VERSION = 17;
