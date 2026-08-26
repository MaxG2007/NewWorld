/**
 * Этап 19: ITEMS + INVENTORY
 * Экспорт всех модулей системы предметов и инвентаря.
 */

export { ItemType, Rarity, Quality, ITEM_DEFINITIONS } from './ItemTypes';
export type { ItemProperties, ItemDefinition } from './ItemTypes';

export { Item } from './Item';
export type { ItemData, ItemHistoryEntry } from './Item';

export { Inventory } from './Inventory';
export type { EquipmentSlots, InventoryData } from './Inventory';
