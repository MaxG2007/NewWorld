/**
 * Editor Components - UI компоненты редактора мира
 * Этап 34: FULL WORLD EDITOR
 */

import {
  TerrainTool,
  NPCEditMode,
  FamilyEditMode,
  EventEditMode,
} from '../types/WorldEditorTypes';

// ==================== КОМПОНЕНТЫ РЕДАКТОРА КАРТЫ ====================

export interface MapEditorPanelProps {
  activeTool: TerrainTool;
  brushSize: number;
  brushShape: 'circle' | 'square' | 'line';
  onToolChange: (tool: TerrainTool) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushShapeChange: (shape: 'circle' | 'square' | 'line') => void;
}

export function createMapEditorPanel(props: MapEditorPanelProps): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'editor-panel map-editor-panel';
  panel.innerHTML = `
    <h3>Редактор карты</h3>
    <div class="tool-selector">
      <label>Инструмент:</label>
      <select id="map-tool-select">
        <option value="terrain" ${props.activeTool === 'terrain' ? 'selected' : ''}>Terrain</option>
        <option value="biome" ${props.activeTool === 'biome' ? 'selected' : ''}>Biome</option>
        <option value="height" ${props.activeTool === 'height' ? 'selected' : ''}>Height</option>
        <option value="water" ${props.activeTool === 'water' ? 'selected' : ''}>Water</option>
        <option value="resources" ${props.activeTool === 'resources' ? 'selected' : ''}>Resources</option>
        <option value="roads" ${props.activeTool === 'roads' ? 'selected' : ''}>Roads</option>
        <option value="buildings" ${props.activeTool === 'buildings' ? 'selected' : ''}>Buildings</option>
        <option value="regions" ${props.activeTool === 'regions' ? 'selected' : ''}>Regions</option>
        <option value="poi" ${props.activeTool === 'poi' ? 'selected' : ''}>Points of Interest</option>
      </select>
    </div>
    <div class="brush-settings">
      <label>Размер кисти: <span id="brush-size-value">${props.brushSize}</span></label>
      <input type="range" id="brush-size-slider" min="1" max="50" value="${props.brushSize}">
      <label>Форма кисти:</label>
      <select id="brush-shape-select">
        <option value="circle" ${props.brushShape === 'circle' ? 'selected' : ''}>Circle</option>
        <option value="square" ${props.brushShape === 'square' ? 'selected' : ''}>Square</option>
        <option value="line" ${props.brushShape === 'line' ? 'selected' : ''}>Line</option>
      </select>
    </div>
  `;

  // Обработчики событий
  const toolSelect = panel.querySelector('#map-tool-select') as HTMLSelectElement;
  toolSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    props.onToolChange(target.value as TerrainTool);
  });

  const brushSizeSlider = panel.querySelector('#brush-size-slider') as HTMLInputElement;
  brushSizeSlider.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const size = parseInt(target.value, 10);
    panel.querySelector('#brush-size-value')!.textContent = size.toString();
    props.onBrushSizeChange(size);
  });

  const brushShapeSelect = panel.querySelector('#brush-shape-select') as HTMLSelectElement;
  brushShapeSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    props.onBrushShapeChange(target.value as 'circle' | 'square' | 'line');
  });

  return panel;
}

// ==================== КОМПОНЕНТЫ РЕДАКТОРА NPC ====================

export interface NPCEditorPanelProps {
  selectedNPCId: string | null;
  editMode: NPCEditMode;
  onEditModeChange: (mode: NPCEditMode) => void;
  onSelectNPC: (npcId: string) => void;
}

export function createNPCEditorPanel(props: NPCEditorPanelProps): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'editor-panel npc-editor-panel';
  panel.innerHTML = `
    <h3>Редактор NPC</h3>
    <div class="npc-selector">
      <label>ID NPC:</label>
      <input type="text" id="npc-id-input" placeholder="Введите ID NPC" value="${props.selectedNPCId || ''}">
      <button id="npc-select-btn">Выбрать</button>
    </div>
    <div class="edit-mode-selector">
      <label>Режим редактирования:</label>
      <select id="npc-edit-mode-select">
        <option value="appearance" ${props.editMode === 'appearance' ? 'selected' : ''}>Внешность</option>
        <option value="race" ${props.editMode === 'race' ? 'selected' : ''}>Раса</option>
        <option value="name" ${props.editMode === 'name' ? 'selected' : ''}>Имя</option>
        <option value="profession" ${props.editMode === 'profession' ? 'selected' : ''}>Профессия</option>
        <option value="schedule" ${props.editMode === 'schedule' ? 'selected' : ''}>Расписание</option>
        <option value="personality" ${props.editMode === 'personality' ? 'selected' : ''}>Характер</option>
        <option value="relations" ${props.editMode === 'relations' ? 'selected' : ''}>Отношения</option>
        <option value="inventory" ${props.editMode === 'inventory' ? 'selected' : ''}>Инвентарь</option>
        <option value="memory" ${props.editMode === 'memory' ? 'selected' : ''}>Память</option>
        <option value="secrets" ${props.editMode === 'secrets' ? 'selected' : ''}>Секреты</option>
      </select>
    </div>
    <div class="npc-info" id="npc-info-display">
      ${props.selectedNPCId ? `<p>Выбран NPC: ${props.selectedNPCId}</p>` : '<p>NPC не выбран</p>'}
    </div>
  `;

  const npcIdInput = panel.querySelector('#npc-id-input') as HTMLInputElement;
  const selectBtn = panel.querySelector('#npc-select-btn') as HTMLButtonElement;
  selectBtn.addEventListener('click', () => {
    if (npcIdInput.value.trim()) {
      props.onSelectNPC(npcIdInput.value.trim());
    }
  });

  const editModeSelect = panel.querySelector('#npc-edit-mode-select') as HTMLSelectElement;
  editModeSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    props.onEditModeChange(target.value as NPCEditMode);
  });

  return panel;
}

// ==================== КОМПОНЕНТЫ РЕДАКТОРА СЕМЬИ ====================

export interface FamilyEditorPanelProps {
  selectedFamilyId: string | null;
  editMode: FamilyEditMode;
  viewMode: 'tree' | 'list' | 'graph';
  onEditModeChange: (mode: FamilyEditMode) => void;
  onViewModeChange: (mode: 'tree' | 'list' | 'graph') => void;
  onSelectFamily: (familyId: string) => void;
}

export function createFamilyEditorPanel(props: FamilyEditorPanelProps): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'editor-panel family-editor-panel';
  panel.innerHTML = `
    <h3>Редактор семьи</h3>
    <div class="family-selector">
      <label>ID семьи:</label>
      <input type="text" id="family-id-input" placeholder="Введите ID семьи" value="${props.selectedFamilyId || ''}">
      <button id="family-select-btn">Выбрать</button>
    </div>
    <div class="view-mode-selector">
      <label>Режим просмотра:</label>
      <select id="family-view-mode-select">
        <option value="tree" ${props.viewMode === 'tree' ? 'selected' : ''}>Древо</option>
        <option value="list" ${props.viewMode === 'list' ? 'selected' : ''}>Список</option>
        <option value="graph" ${props.viewMode === 'graph' ? 'selected' : ''}>Граф</option>
      </select>
    </div>
    <div class="edit-mode-selector">
      <label>Режим редактирования:</label>
      <select id="family-edit-mode-select">
        <option value="clan" ${props.editMode === 'clan' ? 'selected' : ''}>Род</option>
        <option value="relatives" ${props.editMode === 'relatives' ? 'selected' : ''}>Родственники</option>
        <option value="property" ${props.editMode === 'property' ? 'selected' : ''}>Имущество</option>
        <option value="history" ${props.editMode === 'history' ? 'selected' : ''}>История</option>
        <option value="status" ${props.editMode === 'status' ? 'selected' : ''}>Статус</option>
        <option value="relations" ${props.editMode === 'relations' ? 'selected' : ''}>Отношения</option>
      </select>
    </div>
    <div class="family-info" id="family-info-display">
      ${props.selectedFamilyId ? `<p>Выбрана семья: ${props.selectedFamilyId}</p>` : '<p>Семья не выбрана</p>'}
    </div>
  `;

  const familyIdInput = panel.querySelector('#family-id-input') as HTMLInputElement;
  const selectBtn = panel.querySelector('#family-select-btn') as HTMLButtonElement;
  selectBtn.addEventListener('click', () => {
    if (familyIdInput.value.trim()) {
      props.onSelectFamily(familyIdInput.value.trim());
    }
  });

  const viewModeSelect = panel.querySelector('#family-view-mode-select') as HTMLSelectElement;
  viewModeSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    props.onViewModeChange(target.value as 'tree' | 'list' | 'graph');
  });

  const editModeSelect = panel.querySelector('#family-edit-mode-select') as HTMLSelectElement;
  editModeSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    props.onEditModeChange(target.value as FamilyEditMode);
  });

  return panel;
}

// ==================== КОМПОНЕНТЫ РЕДАКТОРА СОБЫТИЙ ====================

export interface EventEditorPanelProps {
  selectedEventId: string | null;
  editMode: EventEditMode;
  testMode: boolean;
  onEditModeChange: (mode: EventEditMode) => void;
  onTestModeToggle: () => void;
  onSelectEvent: (eventId: string) => void;
}

export function createEventEditorPanel(props: EventEditorPanelProps): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'editor-panel event-editor-panel';
  panel.innerHTML = `
    <h3>Редактор событий</h3>
    <div class="event-selector">
      <label>ID события:</label>
      <input type="text" id="event-id-input" placeholder="Введите ID события" value="${props.selectedEventId || ''}">
      <button id="event-select-btn">Выбрать</button>
    </div>
    <div class="test-mode-toggle">
      <label>
        <input type="checkbox" id="test-mode-checkbox" ${props.testMode ? 'checked' : ''}>
        Режим тестирования
      </label>
    </div>
    <div class="edit-mode-selector">
      <label>Режим редактирования:</label>
      <select id="event-edit-mode-select">
        <option value="conditions" ${props.editMode === 'conditions' ? 'selected' : ''}>Условия</option>
        <option value="actions" ${props.editMode === 'actions' ? 'selected' : ''}>Действия</option>
        <option value="triggers" ${props.editMode === 'triggers' ? 'selected' : ''}>Триггеры</option>
        <option value="rewards" ${props.editMode === 'rewards' ? 'selected' : ''}>Награды</option>
        <option value="dialogue" ${props.editMode === 'dialogue' ? 'selected' : ''}>Диалоги</option>
      </select>
    </div>
    <div class="event-info" id="event-info-display">
      ${props.selectedEventId ? `<p>Выбрано событие: ${props.selectedEventId}</p>` : '<p>Событие не выбрано</p>'}
    </div>
    <div class="condition-examples">
      <h4>Примеры условий:</h4>
      <ul>
        <li><code>age > 18</code></li>
        <li><code>weather == rain</code></li>
        <li><code>cityCrime > 0.5</code></li>
        <li><code>hasItem == key</code></li>
        <li><code>relationship < -30</code></li>
      </ul>
    </div>
    <div class="action-examples">
      <h4>Примеры действий:</h4>
      <ul>
        <li><code>spawn</code></li>
        <li><code>move</code></li>
        <li><code>kill</code></li>
        <li><code>marry</code></li>
        <li><code>changePrice</code></li>
        <li><code>startQuest</code></li>
        <li><code>changeOwner</code></li>
        <li><code>createRumor</code></li>
        <li><code>openDungeon</code></li>
      </ul>
    </div>
  `;

  const eventIdInput = panel.querySelector('#event-id-input') as HTMLInputElement;
  const selectBtn = panel.querySelector('#event-select-btn') as HTMLButtonElement;
  selectBtn.addEventListener('click', () => {
    if (eventIdInput.value.trim()) {
      props.onSelectEvent(eventIdInput.value.trim());
    }
  });

  const testModeCheckbox = panel.querySelector('#test-mode-checkbox') as HTMLInputElement;
  testModeCheckbox.addEventListener('change', () => {
    props.onTestModeToggle();
  });

  const editModeSelect = panel.querySelector('#event-edit-mode-select') as HTMLSelectElement;
  editModeSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    props.onEditModeChange(target.value as EventEditMode);
  });

  return panel;
}

// ==================== ОБЩИЕ КОМПОНЕНТЫ ====================

export interface HistoryPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearHistory: () => void;
}

export function createHistoryPanel(props: HistoryPanelProps): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'editor-panel history-panel';
  panel.innerHTML = `
    <h3>История</h3>
    <div class="history-controls">
      <button id="undo-btn" ${!props.canUndo ? 'disabled' : ''}>↶ Undo</button>
      <button id="redo-btn" ${!props.canRedo ? 'disabled' : ''}>↷ Redo</button>
      <button id="clear-history-btn">Очистить историю</button>
    </div>
  `;

  const undoBtn = panel.querySelector('#undo-btn') as HTMLButtonElement;
  undoBtn.addEventListener('click', props.onUndo);

  const redoBtn = panel.querySelector('#redo-btn') as HTMLButtonElement;
  redoBtn.addEventListener('click', props.onRedo);

  const clearHistoryBtn = panel.querySelector('#clear-history-btn') as HTMLButtonElement;
  clearHistoryBtn.addEventListener('click', props.onClearHistory);

  return panel;
}

export interface ExportImportPanelProps {
  onExport: () => string;
  onImport: (json: string) => boolean;
}

export function createExportImportPanel(props: ExportImportPanelProps): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'editor-panel export-import-panel';
  panel.innerHTML = `
    <h3>Экспорт/Импорт</h3>
    <div class="export-import-controls">
      <button id="export-btn">Экспортировать состояние</button>
      <button id="import-btn">Импортировать состояние</button>
      <textarea id="import-textarea" placeholder="Вставьте JSON для импорта..." rows="5"></textarea>
    </div>
  `;

  const exportBtn = panel.querySelector('#export-btn') as HTMLButtonElement;
  exportBtn.addEventListener('click', () => {
    const json = props.onExport();
    navigator.clipboard?.writeText(json).then(() => {
      alert('Состояние экспортировано в буфер обмена');
    }).catch(() => {
      prompt('Скопируйте JSON:', json);
    });
  });

  const importBtn = panel.querySelector('#import-btn') as HTMLButtonElement;
  importBtn.addEventListener('click', () => {
    const textarea = panel.querySelector('#import-textarea') as HTMLTextAreaElement;
    if (textarea.value.trim()) {
      const success = props.onImport(textarea.value.trim());
      if (success) {
        alert('Состояние успешно импортировано');
        textarea.value = '';
      } else {
        alert('Ошибка импорта: неверный формат JSON');
      }
    }
  });

  return panel;
}
