import { Item } from '../../entities/items/Item';
import { Rarity, Quality, ItemProperties } from '../../entities/items/ItemTypes';

export interface LootTableEntry {
  itemId: string;
  minQuantity: number;
  maxQuantity: number;
  chance: number; // 0-1
  rarity?: Rarity;
  conditions?: {
    biome?: string[];
    timeOfDay?: 'day' | 'night' | 'any';
    difficulty?: number;
  };
}

export interface LootContext {
  biome?: string;
  timeOfDay: 'day' | 'night';
  difficulty: number;
  luck: number; // удача искателя лута
  location?: string;
}

export class LootGenerator {
  private lootTables: Map<string, LootTableEntry[]> = new Map();

  constructor() {
    this.initializeLootTables();
  }

  private initializeLootTables(): void {
    // Лут из сундуков в лесу
    this.addLootTable('forest_chest', [
      { itemId: 'apple', minQuantity: 1, maxQuantity: 5, chance: 0.7 },
      { itemId: 'oak_log', minQuantity: 2, maxQuantity: 8, chance: 0.5 },
      { itemId: 'iron_sword', minQuantity: 1, maxQuantity: 1, chance: 0.1, rarity: Rarity.Uncommon },
      { itemId: 'health_potion', minQuantity: 1, maxQuantity: 3, chance: 0.3 },
    ]);

    // Лут из сундуков в пещерах
    this.addLootTable('cave_chest', [
      { itemId: 'iron_ore', minQuantity: 5, maxQuantity: 20, chance: 0.8 },
      { itemId: 'gold_ore', minQuantity: 2, maxQuantity: 10, chance: 0.4 },
      { itemId: 'dwarf_axe', minQuantity: 1, maxQuantity: 1, chance: 0.05, rarity: Rarity.Rare },
      { itemId: 'torch', minQuantity: 5, maxQuantity: 20, chance: 0.6 },
    ]);

    // Лут с врагов (гоблины)
    this.addLootTable('goblin_drop', [
      { itemId: 'rusty_dagger', minQuantity: 1, maxQuantity: 1, chance: 0.3 },
      { itemId: 'apple', minQuantity: 1, maxQuantity: 2, chance: 0.4 },
      { itemId: 'gold_coin', minQuantity: 1, maxQuantity: 10, chance: 0.5 },
    ]);

    // Лут с боссов
    this.addLootTable('dragon_hoard', [
      { itemId: 'dragon_scale_armor', minQuantity: 1, maxQuantity: 1, chance: 1.0, rarity: Rarity.Legendary },
      { itemId: 'fire_sword', minQuantity: 1, maxQuantity: 1, chance: 1.0, rarity: Rarity.Legendary },
      { itemId: 'gold_coin', minQuantity: 100, maxQuantity: 1000, chance: 1.0 },
      { itemId: 'ancient_tome', minQuantity: 1, maxQuantity: 3, chance: 0.5, rarity: Rarity.Epic },
    ]);
  }

  public addLootTable(tableId: string, entries: LootTableEntry[]): void {
    this.lootTables.set(tableId, entries);
  }

  public getLootTable(tableId: string): LootTableEntry[] | undefined {
    return this.lootTables.get(tableId);
  }

  public generateLoot(
    tableId: string,
    context: LootContext
  ): Item[] {
    const table = this.lootTables.get(tableId);
    if (!table) {
      throw new Error(`Loot table not found: ${tableId}`);
    }

    const items: Item[] = [];

    for (const entry of table) {
      // Проверка условий
      if (entry.conditions) {
        if (entry.conditions.biome && !entry.conditions.biome.includes(context.biome || '')) {
          continue;
        }
        if (entry.conditions.timeOfDay && entry.conditions.timeOfDay !== 'any' && entry.conditions.timeOfDay !== context.timeOfDay) {
          continue;
        }
        if (entry.conditions.difficulty && context.difficulty < entry.conditions.difficulty) {
          continue;
        }
      }

      // Расчет шанса с учетом удачи
      let adjustedChance = entry.chance * (1 + context.luck * 0.1);
      if (adjustedChance > 1) adjustedChance = 1;

      const roll = Math.random();
      if (roll <= adjustedChance) {
        const quantity = Math.floor(
          Math.random() * (entry.maxQuantity - entry.minQuantity + 1) + entry.minQuantity
        );

        // Создание предмета
        const item = this.createItem(entry.itemId, {
          rarity: entry.rarity || Rarity.Common,
          quantity,
          context,
        });

        if (item) {
          items.push(item);
        }
      }
    }

    return items;
  }

  private createItem(
    itemId: string,
    options: {
      rarity: Rarity;
      quantity: number;
      context: LootContext;
    }
  ): Item | null {
    // В реальной игре здесь была бы загрузка из базы данных определений предметов
    // Для примера создадим базовые предметы
    
    const properties: ItemProperties = {};
    let baseWeight = 1.0;
    let baseValue = 10;

    // Настройка свойств в зависимости от типа предмета
    if (itemId.includes('sword') || itemId.includes('axe') || itemId.includes('dagger')) {
      properties.damage = this.getRandomStat(options.rarity);
      baseWeight = 2.0;
      baseValue = 50 * this.getRarityMultiplier(options.rarity);
    } else if (itemId.includes('armor') || itemId.includes('scale')) {
      properties.defense = this.getRandomStat(options.rarity);
      baseWeight = 5.0;
      baseValue = 80 * this.getRarityMultiplier(options.rarity);
    } else if (itemId.includes('potion') || itemId.includes('herb')) {
      properties.healing = this.getRandomStat(options.rarity);
      baseWeight = 0.3;
      baseValue = 20 * this.getRarityMultiplier(options.rarity);
    } else if (itemId.includes('ore') || itemId.includes('coin')) {
      baseWeight = 3.0;
      baseValue = 15 * this.getRarityMultiplier(options.rarity);
    }

    // Генерация уникальной истории для редких предметов
    const history: string[] = [];
    if (options.rarity === Rarity.Rare || options.rarity === Rarity.Epic || options.rarity === Rarity.Legendary) {
      history.push(`Discovered in ${options.context.biome || 'unknown lands'}`);
      history.push(`Found during ${options.context.timeOfDay} time`);
      
      if (options.rarity === Rarity.Legendary) {
        history.push('Legend says this item belonged to an ancient hero');
      }
    }

    try {
      const item = new Item(itemId, {
        rarity: options.rarity,
        quality: this.getQualityFromRarity(options.rarity),
        properties,
        weight: baseWeight,
        cost: baseValue,
        stackSize: options.quantity,
        origin: {
          biome: options.context.biome,
          discoveredAt: Date.now(),
        },
      });

      history.forEach(event => item.addToHistory(event));

      return item;
    } catch (e) {
      console.warn(`Could not create item ${itemId}:`, e);
      return null;
    }
  }

  private getRandomStat(rarity: Rarity): number {
    const baseStats: Record<Rarity, number> = {
      [Rarity.Common]: 5,
      [Rarity.Uncommon]: 10,
      [Rarity.Rare]: 20,
      [Rarity.Epic]: 35,
      [Rarity.Legendary]: 50,
      [Rarity.Artifact]: 100,
    };
    
    const variance = Math.random() * 0.4 + 0.8; // 0.8 - 1.2
    return Math.floor(baseStats[rarity] * variance);
  }

  private getRarityMultiplier(rarity: Rarity): number {
    const multipliers: Record<Rarity, number> = {
      [Rarity.Common]: 1,
      [Rarity.Uncommon]: 2,
      [Rarity.Rare]: 5,
      [Rarity.Epic]: 10,
      [Rarity.Legendary]: 25,
      [Rarity.Artifact]: 100,
    };
    return multipliers[rarity];
  }

  private getQualityFromRarity(rarity: Rarity): Quality {
    switch (rarity) {
      case Rarity.Artifact:
      case Rarity.Legendary:
        return Quality.Pristine;
      case Rarity.Epic:
        return Quality.Excellent;
      case Rarity.Rare:
        return Quality.Good;
      case Rarity.Uncommon:
        return Quality.Normal;
      default:
        return Quality.Normal;
    }
  }
}
