/**
 * World Editor Module - Этап 34: FULL WORLD EDITOR
 * 
 * Полный редактор мира включающий:
 * - Редактор карты (terrain, биом, высота, вода, ресурсы, дороги, здания, регионы, POI)
 * - Редактор NPC (внешность, раса, имя, профессия, расписание, характер, отношения, инвентарь, память, секреты)
 * - Редактор семьи (род, родственники, имущество, история, статус, отношения)
 * - Редактор событий (условия, действия, триггеры, награды, диалоги)
 */

// Типы
export * from './types/WorldEditorTypes';

// Менеджеры
export { WorldEditorManager, worldEditorManager } from './managers/WorldEditorManager';

// Инструменты
export { MapEditorTools, mapEditorTools } from './tools/MapEditorTools';
export { EventEditorTools, eventEditorTools } from './tools/EventEditorTools';

// Компоненты UI
export * from './components/EditorComponents';
