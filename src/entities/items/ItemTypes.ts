/**
 * Этап 19: ITEMS + INVENTORY
 * Типы предметов, редкость, качество и свойства.
 */

export enum ItemType {
  Weapon = 'weapon',
  Armor = 'armor',
  Clothing = 'clothing',
  Food = 'food',
  Tool = 'tool',
  Alchemy = 'alchemy',
  Ore = 'ore',
  Wood = 'wood',
  Book = 'book',
  Map = 'map',
  Key = 'key',
  Artifact = 'artifact',
  Decor = 'decor',
}

export enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
  Artifact = 'artifact',
}

export enum Quality {
  Broken = 'broken',
  Poor = 'poor',
  Normal = 'normal',
  Good = 'good',
  Excellent = 'excellent',
  Pristine = 'pristine',
}

export interface ItemProperties {
  damage?: number;
  defense?: number;
  healing?: number;
  durability?: number;
  magicPower?: number;
  weightModifier?: number;
  [key: string]: number | undefined;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  baseWeight: number;
  baseValue: number;
  defaultProperties?: ItemProperties;
}

// База данных определений предметов (пример)
export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  'iron_sword': {
    id: 'iron_sword',
    name: 'Iron Sword',
    type: ItemType.Weapon,
    baseWeight: 1.5,
    baseValue: 50,
    defaultProperties: { damage: 10, durability: 100 },
  },
  'leather_armor': {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: ItemType.Armor,
    baseWeight: 3.0,
    baseValue: 80,
    defaultProperties: { defense: 5, durability: 80 },
  },
  'apple': {
    id: 'apple',
    name: 'Apple',
    type: ItemType.Food,
    baseWeight: 0.2,
    baseValue: 5,
    defaultProperties: { healing: 5 },
  },
  'iron_ore': {
    id: 'iron_ore',
    name: 'Iron Ore',
    type: ItemType.Ore,
    baseWeight: 5.0,
    baseValue: 20,
  },
  'oak_log': {
    id: 'oak_log',
    name: 'Oak Log',
    type: ItemType.Wood,
    baseWeight: 4.0,
    baseValue: 10,
  },
  // Дополнительные предметы для лута и крафта
  'rusty_dagger': {
    id: 'rusty_dagger',
    name: 'Rusty Dagger',
    type: ItemType.Weapon,
    baseWeight: 0.8,
    baseValue: 15,
    defaultProperties: { damage: 4, durability: 40 },
  },
  'gold_ore': {
    id: 'gold_ore',
    name: 'Gold Ore',
    type: ItemType.Ore,
    baseWeight: 4.0,
    baseValue: 50,
  },
  'torch': {
    id: 'torch',
    name: 'Torch',
    type: ItemType.Tool,
    baseWeight: 1.0,
    baseValue: 5,
  },
  'dragon_scale_armor': {
    id: 'dragon_scale_armor',
    name: 'Dragon Scale Armor',
    type: ItemType.Armor,
    baseWeight: 8.0,
    baseValue: 500,
    defaultProperties: { defense: 40, durability: 200 },
  },
  'fire_sword': {
    id: 'fire_sword',
    name: 'Fire Sword',
    type: ItemType.Weapon,
    baseWeight: 2.5,
    baseValue: 400,
    defaultProperties: { damage: 35, durability: 150, magicPower: 20 },
  },
  'gold_coin': {
    id: 'gold_coin',
    name: 'Gold Coin',
    type: ItemType.Decor,
    baseWeight: 0.05,
    baseValue: 1,
  },
  'ancient_tome': {
    id: 'ancient_tome',
    name: 'Ancient Tome',
    type: ItemType.Book,
    baseWeight: 2.0,
    baseValue: 150,
    defaultProperties: { magicPower: 15 },
  },
  'bread': {
    id: 'bread',
    name: 'Bread',
    type: ItemType.Food,
    baseWeight: 0.3,
    baseValue: 8,
    defaultProperties: { healing: 10 },
  },
  'wheat': {
    id: 'wheat',
    name: 'Wheat',
    type: ItemType.Food,
    baseWeight: 0.5,
    baseValue: 3,
  },
  'water': {
    id: 'water',
    name: 'Water',
    type: ItemType.Food,
    baseWeight: 1.0,
    baseValue: 2,
  },
  'health_potion': {
    id: 'health_potion',
    name: 'Health Potion',
    type: ItemType.Alchemy,
    baseWeight: 0.3,
    baseValue: 25,
    defaultProperties: { healing: 25 },
  },
  'red_herb': {
    id: 'red_herb',
    name: 'Red Herb',
    type: ItemType.Alchemy,
    baseWeight: 0.1,
    baseValue: 8,
  },
  'glass_bottle': {
    id: 'glass_bottle',
    name: 'Glass Bottle',
    type: ItemType.Tool,
    baseWeight: 0.2,
    baseValue: 5,
  },
  'dwarf_axe': {
    id: 'dwarf_axe',
    name: 'Dwarf Axe',
    type: ItemType.Weapon,
    baseWeight: 3.0,
    baseValue: 120,
    defaultProperties: { damage: 18, durability: 120 },
  },
};
