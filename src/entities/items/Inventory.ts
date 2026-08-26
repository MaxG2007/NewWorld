import { Item } from './Item';
import { ItemType } from './ItemTypes';

export interface EquipmentSlots {
  head?: Item;
  chest?: Item;
  legs?: Item;
  feet?: Item;
  hands?: Item;
  mainHand?: Item;
  offHand?: Item;
  neck?: Item;
  ring1?: Item;
  ring2?: Item;
  back?: Item;
}

export interface InventoryData {
  items: Item[];
  equipment: EquipmentSlots;
  maxWeight: number;
  currentWeight: number;
}

export class Inventory {
  private items: Map<string, Item>;
  private equipment: EquipmentSlots = {};
  private maxWeight: number;

  constructor(maxWeight: number = 50) {
    this.items = new Map();
    this.maxWeight = maxWeight;
  }

  public addItem(item: Item): boolean {
    const currentWeight = this.getCurrentWeight();
    if (currentWeight + item.data.weight > this.maxWeight) {
      return false; // Превышен лимит веса
    }

    // Проверка на стек
    const existingItem = this.findStackableItem(item);
    if (existingItem && this.canStack(existingItem, item)) {
      // Обновляем существующий стак
      this.items.set(item.data.id, item);
    } else {
      this.items.set(item.data.id, item);
    }

    return true;
  }

  public removeItem(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  public getItem(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }

  public getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  public equipItem(itemId: string, slot: keyof EquipmentSlots): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    // Проверка типа предмета для слота
    if (!this.isValidSlotForItem(item, slot)) {
      return false;
    }

    // Если в слоте уже есть предмет, снимаем его
    const existingItem = this.equipment[slot];
    if (existingItem) {
      this.unequipItem(slot);
    }

    // Надеваем предмет
    this.equipment[slot] = item;
    this.items.delete(itemId);

    return true;
  }

  public unequipItem(slot: keyof EquipmentSlots): boolean {
    const item = this.equipment[slot];
    if (!item) return false;

    this.equipment[slot] = undefined;
    this.items.set(item.data.id, item);

    return true;
  }

  public getEquipment(): EquipmentSlots {
    return { ...this.equipment };
  }

  public getCurrentWeight(): number {
    let weight = 0;
    this.items.forEach(item => {
      weight += item.data.weight * item.data.stackSize;
    });
    Object.values(this.equipment).forEach(item => {
      if (item) weight += item.data.weight;
    });
    return weight;
  }

  public getMaxWeight(): number {
    return this.maxWeight;
  }

  public setMaxWeight(weight: number): void {
    this.maxWeight = weight;
  }

  private findStackableItem(newItem: Item): Item | undefined {
    for (const item of this.items.values()) {
      if (
        item.data.definitionId === newItem.data.definitionId &&
        item.data.quality === newItem.data.quality &&
        item.data.stackSize < item.data.maxStackSize
      ) {
        return item;
      }
    }
    return undefined;
  }

  private canStack(item1: Item, item2: Item): boolean {
    return (
      item1.data.definitionId === item2.data.definitionId &&
      item1.data.quality === item2.data.quality &&
      item1.data.stackSize < item1.data.maxStackSize
    );
  }

  private isValidSlotForItem(item: Item, slot: keyof EquipmentSlots): boolean {
    const slotItemMap: Record<string, ItemType[]> = {
      head: [ItemType.Armor, ItemType.Clothing],
      chest: [ItemType.Armor, ItemType.Clothing],
      legs: [ItemType.Armor, ItemType.Clothing],
      feet: [ItemType.Armor, ItemType.Clothing],
      hands: [ItemType.Armor, ItemType.Clothing, ItemType.Tool],
      mainHand: [ItemType.Weapon, ItemType.Tool],
      offHand: [ItemType.Weapon, ItemType.Tool],
      neck: [ItemType.Decor, ItemType.Artifact],
      ring1: [ItemType.Decor, ItemType.Artifact],
      ring2: [ItemType.Decor, ItemType.Artifact],
      back: [ItemType.Armor, ItemType.Clothing],
    };

    const allowedTypes = slotItemMap[slot] || [];
    return allowedTypes.includes(item.data.type);
  }

  public serialize(): InventoryData {
    return {
      items: this.getAllItems(),
      equipment: {
        head: this.equipment.head,
        chest: this.equipment.chest,
        legs: this.equipment.legs,
        feet: this.equipment.feet,
        hands: this.equipment.hands,
        mainHand: this.equipment.mainHand,
        offHand: this.equipment.offHand,
        neck: this.equipment.neck,
        ring1: this.equipment.ring1,
        ring2: this.equipment.ring2,
        back: this.equipment.back,
      },
      maxWeight: this.maxWeight,
      currentWeight: this.getCurrentWeight(),
    };
  }

  public static deserialize(data: InventoryData): Inventory {
    const inventory = new Inventory(data.maxWeight);
    
    data.items.forEach(item => {
      inventory.items.set(item.data.id, item);
    });

    const equipmentSlots = (Object.keys(data.equipment) as (keyof EquipmentSlots)[]);
    equipmentSlots.forEach(slot => {
      const item = data.equipment[slot];
      if (item) {
        inventory.equipment[slot] = item;
      }
    });

    return inventory;
  }
}
