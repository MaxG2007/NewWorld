import { ItemType, Rarity, Quality, ItemProperties, ItemDefinition, ITEM_DEFINITIONS } from './ItemTypes';

export interface ItemHistoryEntry {
  timestamp: number; // игровое время
  event: string;
  actor?: string; // кто совершил действие (NPC имя)
}

export interface ItemData {
  id: string;
  definitionId: string;
  name: string;
  type: ItemType;
  quality: Quality;
  condition: number; // 0-100
  origin: {
    biome?: string;
    settlement?: string;
    creator?: string;
    discoveredAt?: number;
  };
  owner?: string; // ID владельца
  history: ItemHistoryEntry[];
  cost: number;
  properties: ItemProperties;
  weight: number;
  rarity: Rarity;
  stackSize: number;
  maxStackSize: number;
}

export class Item {
  public readonly data: ItemData;

  constructor(definitionId: string, overrides: Partial<ItemData> = {}) {
    const def = ITEM_DEFINITIONS[definitionId];
    if (!def) {
      throw new Error(`Item definition not found: ${definitionId}`);
    }

    this.data = {
      id: overrides.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      definitionId: def.id,
      name: def.name,
      type: def.type,
      quality: overrides.quality || Quality.Normal,
      condition: overrides.condition ?? 100,
      origin: overrides.origin || {},
      owner: overrides.owner,
      history: overrides.history || [],
      properties: def.defaultProperties || {},
      weight: overrides.weight ?? def.baseWeight,
      rarity: overrides.rarity || Rarity.Common,
      stackSize: overrides.stackSize ?? 1,
      maxStackSize: overrides.maxStackSize ?? this.getMaxStackSize(def.type),
      cost: 0, // временное значение, будет пересчитано ниже
      ...overrides,
    };

    // Пересчитываем cost после применения всех overrides
    this.data.cost = overrides.cost ?? this.calculateBaseCost(def, this.data.quality);
  }

  private calculateBaseCost(def: ItemDefinition, quality: Quality): number {
    const qualityMultipliers: Record<Quality, number> = {
      [Quality.Broken]: 0.1,
      [Quality.Poor]: 0.5,
      [Quality.Normal]: 1.0,
      [Quality.Good]: 1.5,
      [Quality.Excellent]: 2.0,
      [Quality.Pristine]: 3.0,
    };

    let cost = def.baseValue * qualityMultipliers[quality];
    
    // Учитываем свойства только если они определены
    const props = this.data.properties || {};
    if (props.damage) cost += props.damage * 2;
    if (props.defense) cost += props.defense * 3;
    if (props.healing) cost += props.healing * 1.5;
    if (props.magicPower) cost += props.magicPower * 5;

    return Math.floor(cost);
  }

  private getMaxStackSize(type: ItemType): number {
    switch (type) {
      case ItemType.Food:
      case ItemType.Alchemy:
      case ItemType.Ore:
      case ItemType.Wood:
        return 99;
      case ItemType.Key:
      case ItemType.Book:
      case ItemType.Map:
        return 1;
      default:
        return 20;
    }
  }

  public addToHistory(event: string, actor?: string, timestamp: number = 0): void {
    this.data.history.push({
      timestamp,
      event,
      actor,
    });
  }

  public changeOwner(newOwnerId: string, timestamp: number = 0): void {
    const oldOwner = this.data.owner;
    this.data.owner = newOwnerId;
    this.addToHistory(
      oldOwner 
        ? `Transferred from ${oldOwner} to ${newOwnerId}` 
        : `Acquired by ${newOwnerId}`,
      newOwnerId,
      timestamp
    );
  }

  public damage(amount: number): void {
    this.data.condition = Math.max(0, this.data.condition - amount);
    if (this.data.condition < 30) {
      this.data.quality = Quality.Broken;
    } else if (this.data.condition < 60) {
      this.data.quality = Quality.Poor;
    } else if (this.data.condition < 90) {
      this.data.quality = Quality.Normal;
    }
    this.addToHistory(`Damaged for ${amount} points (condition: ${this.data.condition})`);
  }

  public repair(amount: number): void {
    this.data.condition = Math.min(100, this.data.condition + amount);
    if (this.data.condition >= 90) {
      this.data.quality = Quality.Pristine;
    } else if (this.data.condition >= 70) {
      this.data.quality = Quality.Excellent;
    }
    this.addToHistory(`Repaired for ${amount} points (condition: ${this.data.condition})`);
  }

  public serialize(): ItemData {
    return { ...this.data };
  }

  public static deserialize(data: ItemData): Item {
    const item = new Item(data.definitionId, data);
    return item;
  }
}
