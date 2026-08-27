/**
 * WorldEditorManager - Менеджер редактора мира
 * Этап 34: FULL WORLD EDITOR
 */

import {
  TerrainTool,
  MapEditorState,
  NPCEditorState,
  FamilyEditorState,
  EventEditorState,
  EditOperation,
  WorldEditorHistory,
  EditorConfig,
  ValidationResult,
} from '../types/WorldEditorTypes';

export class WorldEditorManager {
  private mapEditorStateInternal: MapEditorState = {
    activeTool: 'terrain',
    brushSize: 5,
    brushShape: 'circle',
    heightDelta: 1,
    waterLevel: 0,
  };

  private npcEditorStateInternal: NPCEditorState = {
    selectedNPCId: null,
    editMode: 'appearance',
    previewChanges: true,
  };

  private familyEditorStateInternal: FamilyEditorState = {
    selectedFamilyId: null,
    editMode: 'clan',
    viewMode: 'tree',
  };

  private eventEditorStateInternal: EventEditorState = {
    selectedEventId: null,
    editMode: 'conditions',
    testMode: false,
  };

  private historyInternal: WorldEditorHistory = {
    undoStack: [],
    redoStack: [],
    maxHistorySize: 100,
  };

  private configInternal: EditorConfig = {
    enableUndoRedo: true,
    autoSave: true,
    autoSaveInterval: 60000,
    validationEnabled: true,
    previewEnabled: true,
    gridSnap: true,
    gridSize: 10,
  };

  private isEditorActiveInternal = false;

  get mapEditorState(): MapEditorState {
    return { ...this.mapEditorStateInternal };
  }

  get npcEditorState(): NPCEditorState {
    return { ...this.npcEditorStateInternal };
  }

  get familyEditorState(): FamilyEditorState {
    return { ...this.familyEditorStateInternal };
  }

  get eventEditorState(): EventEditorState {
    return { ...this.eventEditorStateInternal };
  }

  get isEditorActive(): boolean {
    return this.isEditorActiveInternal;
  }

  get canUndo(): boolean {
    return this.historyInternal.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.historyInternal.redoStack.length > 0;
  }

  activateEditor(): void {
    this.isEditorActiveInternal = true;
    console.log('[Editor] World Editor activated');
  }

  deactivateEditor(): void {
    this.isEditorActiveInternal = false;
    console.log('[Editor] World Editor deactivated');
  }

  toggleEditor(): void {
    this.isEditorActiveInternal = !this.isEditorActiveInternal;
    console.log(`[Editor] World Editor ${this.isEditorActiveInternal ? 'activated' : 'deactivated'}`);
  }

  // ==================== МЕТОДЫ РЕДАКТОРА КАРТЫ ====================

  setMapTool(tool: TerrainTool): void {
    this.mapEditorStateInternal.activeTool = tool;
    console.log(`[Editor] Map tool set to: ${tool}`);
  }

  setBrushSize(size: number): void {
    this.mapEditorStateInternal.brushSize = Math.max(1, size);
  }

  setBrushShape(shape: 'circle' | 'square' | 'line'): void {
    this.mapEditorStateInternal.brushShape = shape;
  }

  setSelectedBiome(biome: string): void {
    this.mapEditorStateInternal.selectedBiome = biome;
  }

  setHeightDelta(delta: number): void {
    this.mapEditorStateInternal.heightDelta = delta;
  }

  setWaterLevel(level: number): void {
    this.mapEditorStateInternal.waterLevel = level;
  }

  // ==================== МЕТОДЫ РЕДАКТОРА NPC ====================

  selectNPC(npcId: string): void {
    this.npcEditorStateInternal.selectedNPCId = npcId;
    console.log(`[Editor] Selected NPC: ${npcId}`);
  }

  deselectNPC(): void {
    this.npcEditorStateInternal.selectedNPCId = null;
  }

  setNPCEditMode(mode: NPCEditorState['editMode']): void {
    this.npcEditorStateInternal.editMode = mode;
  }

  toggleNPCPreview(): void {
    this.npcEditorStateInternal.previewChanges = !this.npcEditorStateInternal.previewChanges;
  }

  // ==================== МЕТОДЫ РЕДАКТОРА СЕМЬИ ====================

  selectFamily(familyId: string): void {
    this.familyEditorStateInternal.selectedFamilyId = familyId;
    console.log(`[Editor] Selected Family: ${familyId}`);
  }

  deselectFamily(): void {
    this.familyEditorStateInternal.selectedFamilyId = null;
  }

  setFamilyEditMode(mode: FamilyEditorState['editMode']): void {
    this.familyEditorStateInternal.editMode = mode;
  }

  setFamilyViewMode(mode: FamilyEditorState['viewMode']): void {
    this.familyEditorStateInternal.viewMode = mode;
  }

  // ==================== МЕТОДЫ РЕДАКТОРА СОБЫТИЙ ====================

  selectEvent(eventId: string): void {
    this.eventEditorStateInternal.selectedEventId = eventId;
    console.log(`[Editor] Selected Event: ${eventId}`);
  }

  deselectEvent(): void {
    this.eventEditorStateInternal.selectedEventId = null;
  }

  setEventEditMode(mode: EventEditorState['editMode']): void {
    this.eventEditorStateInternal.editMode = mode;
  }

  toggleEventTestMode(): void {
    this.eventEditorStateInternal.testMode = !this.eventEditorStateInternal.testMode;
  }

  // ==================== ИСТОРИЯ (UNDO/REDO) ====================

  pushOperation(operation: EditOperation): void {
    if (!this.configInternal.enableUndoRedo) {
      return;
    }

    this.historyInternal.undoStack.push(operation);
    
    // Очищаем redo stack при новой операции
    this.historyInternal.redoStack = [];

    // Ограничиваем размер истории
    while (this.historyInternal.undoStack.length > this.historyInternal.maxHistorySize) {
      this.historyInternal.undoStack.shift();
    }

    console.log(`[Editor] Operation pushed: ${operation.type}`);
  }

  undo(): EditOperation | null {
    if (!this.canUndo) {
      return null;
    }

    const operation = this.historyInternal.undoStack.pop()!;
    operation.undone = true;
    this.historyInternal.redoStack.push(operation);

    console.log(`[Editor] Undone: ${operation.type}`);
    return operation;
  }

  redo(): EditOperation | null {
    if (!this.canRedo) {
      return null;
    }

    const operation = this.historyInternal.redoStack.pop()!;
    operation.undone = false;
    this.historyInternal.undoStack.push(operation);

    console.log(`[Editor] Redone: ${operation.type}`);
    return operation;
  }

  clearHistory(): void {
    this.historyInternal.undoStack = [];
    this.historyInternal.redoStack = [];
  }

  // ==================== КОНФИГУРАЦИЯ ====================

  getConfig(): EditorConfig {
    return { ...this.configInternal };
  }

  updateConfig(config: Partial<EditorConfig>): void {
    this.configInternal = { ...this.configInternal, ...config };
    console.log('[Editor] Configuration updated');
  }

  // ==================== ВАЛИДАЦИЯ ====================

  validate(data: Record<string, unknown>, rules: Array<{ field: string; rule: (value: unknown) => boolean; errorMessage: string }>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];
      if (!rule.rule(value)) {
        errors.push(rule.errorMessage);
      }
    }

    // Примеры предупреждений
    if (data.brushSize && (data.brushSize as number) > 50) {
      warnings.push('Large brush size may impact performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ==================== ЭКСПОРТ/ИМПОРТ ====================

  exportEditorState(): string {
    const state = {
      mapEditor: this.mapEditorStateInternal,
      npcEditor: this.npcEditorStateInternal,
      familyEditor: this.familyEditorStateInternal,
      eventEditor: this.eventEditorStateInternal,
      config: this.configInternal,
    };
    return JSON.stringify(state, null, 2);
  }

  importEditorState(json: string): boolean {
    try {
      const state = JSON.parse(json);
      
      if (state.mapEditor) {
        this.mapEditorStateInternal = { ...this.mapEditorStateInternal, ...state.mapEditor };
      }
      
      if (state.npcEditor) {
        this.npcEditorStateInternal = { ...this.npcEditorStateInternal, ...state.npcEditor };
      }
      
      if (state.familyEditor) {
        this.familyEditorStateInternal = { ...this.familyEditorStateInternal, ...state.familyEditor };
      }
      
      if (state.eventEditor) {
        this.eventEditorStateInternal = { ...this.eventEditorStateInternal, ...state.eventEditor };
      }
      
      if (state.config) {
        this.configInternal = { ...this.configInternal, ...state.config };
      }

      console.log('[Editor] State imported successfully');
      return true;
    } catch (error) {
      console.error('[Editor] Failed to import state:', error);
      return false;
    }
  }
}

// Экспорт singleton экземпляра
export const worldEditorManager = new WorldEditorManager();
