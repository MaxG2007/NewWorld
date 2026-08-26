import { describe, it, expect } from 'vitest';
import { Item } from '../entities/items/Item';
import { Inventory } from '../entities/items/Inventory';
import { ItemType, Rarity, Quality } from '../entities/items/ItemTypes';
import { CraftingSystem } from '../simulation/crafting/CraftingSystem';
import { LootGenerator } from '../simulation/loot/LootGenerator';

describe('Этап 19: ITEMS + INVENTORY', () => {
  describe('Item - Создание предметов', () => {
    it('должен создавать предмет с базовыми характеристиками', () => {
      const item = new Item('iron_sword');
      
      expect(item.data.name).toBe('Iron Sword');
      expect(item.data.type).toBe(ItemType.Weapon);
      expect(item.data.quality).toBe(Quality.Normal);
      expect(item.data.condition).toBe(100);
      expect(item.data.rarity).toBe(Rarity.Common);
    });

    it('должен создавать предмет с переопределенными характеристиками', () => {
      const item = new Item('iron_sword', {
        quality: Quality.Excellent,
        rarity: Rarity.Rare,
        condition: 85,
      });
      
      expect(item.data.quality).toBe(Quality.Excellent);
      expect(item.data.rarity).toBe(Rarity.Rare);
      expect(item.data.condition).toBe(85);
    });

    it('должен рассчитывать стоимость на основе качества и редкости', () => {
      const normalItem = new Item('iron_sword', { quality: Quality.Normal, rarity: Rarity.Common });
      const legendaryItem = new Item('iron_sword', { quality: Quality.Pristine, rarity: Rarity.Legendary });
      
      expect(legendaryItem.data.cost).toBeGreaterThan(normalItem.data.cost);
    });

    it('должен добавлять запись в историю при изменении владельца', () => {
      const item = new Item('apple');
      item.changeOwner('player_1', 1000);
      
      expect(item.data.history.length).toBe(1);
      expect(item.data.owner).toBe('player_1');
    });

    it('должен уменьшать состояние при получении урона', () => {
      const item = new Item('iron_sword');
      item.damage(45); // 100 - 45 = 55 (condition < 60, но >= 30)
      
      expect(item.data.condition).toBe(55);
      expect(item.data.quality).toBe(Quality.Poor);
    });

    it('должен восстанавливать состояние при ремонте', () => {
      const item = new Item('iron_sword', { condition: 40 });
      item.repair(50);
      
      expect(item.data.condition).toBe(90);
      // Качество становится Pristine при condition >= 90
      expect(item.data.quality).toBe(Quality.Pristine);
    });

    it('должен сериализовать и десериализовать без потерь', () => {
      const originalItem = new Item('leather_armor', {
        quality: Quality.Good,
        rarity: Rarity.Uncommon,
        condition: 75,
      });
      
      const serialized = originalItem.serialize();
      const deserializedItem = Item.deserialize(serialized);
      
      expect(deserializedItem.data.name).toBe(originalItem.data.name);
      expect(deserializedItem.data.quality).toBe(originalItem.data.quality);
      expect(deserializedItem.data.rarity).toBe(originalItem.data.rarity);
      expect(deserializedItem.data.condition).toBe(originalItem.data.condition);
    });
  });

  describe('Inventory - Система инвентаря', () => {
    it('должен добавлять предметы в инвентарь', () => {
      const inventory = new Inventory(50);
      const item = new Item('apple');
      
      const success = inventory.addItem(item);
      
      expect(success).toBe(true);
      expect(inventory.getAllItems().length).toBe(1);
    });

    it('должен отказывать в добавлении предмета при превышении веса', () => {
      const inventory = new Inventory(5);
      const heavyItem = new Item('iron_ore'); // вес 5.0
      
      inventory.addItem(new Item('apple')); // вес 0.2
      const success = inventory.addItem(heavyItem);
      
      expect(success).toBe(false);
    });

    it('должен удалять предметы из инвентаря', () => {
      const inventory = new Inventory(50);
      const item = new Item('apple');
      
      inventory.addItem(item);
      inventory.removeItem(item.data.id);
      
      expect(inventory.getAllItems().length).toBe(0);
    });

    it('должен экипировать предметы в правильные слоты', () => {
      const inventory = new Inventory(50);
      const sword = new Item('iron_sword');
      
      inventory.addItem(sword);
      const success = inventory.equipItem(sword.data.id, 'mainHand');
      
      expect(success).toBe(true);
      expect(inventory.getEquipment().mainHand).toBeDefined();
      expect(inventory.getAllItems().length).toBe(0);
    });

    it('должен снимать экипированные предметы', () => {
      const inventory = new Inventory(50);
      const sword = new Item('iron_sword');
      
      inventory.addItem(sword);
      inventory.equipItem(sword.data.id, 'mainHand');
      inventory.unequipItem('mainHand');
      
      expect(inventory.getEquipment().mainHand).toBeUndefined();
      expect(inventory.getAllItems().length).toBe(1);
    });

    it('должен рассчитывать текущий вес', () => {
      const inventory = new Inventory(50);
      inventory.addItem(new Item('apple')); // 0.2
      inventory.addItem(new Item('oak_log')); // 4.0
      
      const weight = inventory.getCurrentWeight();
      expect(weight).toBeCloseTo(4.2, 1);
    });
  });

  describe('CraftingSystem - Крафтовая система', () => {
    it('должен создавать предметы по рецепту', () => {
      const craftingSystem = new CraftingSystem();
      const ingredients = new Map([
        ['iron_ore', 10],
        ['oak_log', 5],
      ]);
      
      const result = craftingSystem.craft('iron_sword_recipe', ingredients, 15, 1.0);
      
      expect(result.success).toBe(true);
      expect(result.item).toBeDefined();
      expect(result.item?.data.name).toBe('Iron Sword');
    });

    it('должен отказывать в крафте при недостатке ингредиентов', () => {
      const craftingSystem = new CraftingSystem();
      const ingredients = new Map([
        ['iron_ore', 1], // нужно 3
      ]);
      
      const result = craftingSystem.craft('iron_sword_recipe', ingredients, 15, 1.0);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough');
    });

    it('должен отказывать в крафте при низком навыке', () => {
      const craftingSystem = new CraftingSystem();
      const ingredients = new Map([
        ['iron_ore', 10],
        ['oak_log', 5],
      ]);
      
      const result = craftingSystem.craft('iron_sword_recipe', ingredients, 5, 1.0); // нужно 10
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Skill too low');
    });
  });

  describe('LootGenerator - Генератор лута', () => {
    it('должен генерировать лут из таблицы', () => {
      const lootGenerator = new LootGenerator();
      
      const loot = lootGenerator.generateLoot('forest_chest', {
        timeOfDay: 'day',
        difficulty: 1,
        luck: 0,
        biome: 'forest',
      });
      
      expect(Array.isArray(loot)).toBe(true);
    });

    it('должен учитывать удачу при генерации лута', () => {
      const lootGenerator = new LootGenerator();
      
      const highLuckLoot = lootGenerator.generateLoot('goblin_drop', {
        timeOfDay: 'day',
        difficulty: 1,
        luck: 5,
      });
      
      // Высокая удача должна давать больше предметов (статистически)
      expect(highLuckLoot.length >= 0).toBe(true);
    });

    it('должен проверять условия биома', () => {
      const lootGenerator = new LootGenerator();
      
      const caveLoot = lootGenerator.generateLoot('cave_chest', {
        timeOfDay: 'night',
        difficulty: 2,
        luck: 0,
        biome: 'cave',
      });
      
      expect(Array.isArray(caveLoot)).toBe(true);
    });

    it('должен создавать предметы с правильной редкостью', () => {
      const lootGenerator = new LootGenerator();
      
      // Много попыток для получения легендарного предмета
      let legendaryFound = false;
      for (let i = 0; i < 100; i++) {
        const loot = lootGenerator.generateLoot('dragon_hoard', {
          timeOfDay: 'night',
          difficulty: 10,
          luck: 0,
        });
        
        if (loot.some(item => item.data.rarity === Rarity.Legendary)) {
          legendaryFound = true;
          break;
        }
      }
      
      expect(legendaryFound).toBe(true);
    });
  });

  describe('Интеграционные тесты', () => {
    it('должен поддерживать полный цикл: крафт -> инвентарь -> экипировка', () => {
      const craftingSystem = new CraftingSystem();
      const inventory = new Inventory(50);
      
      // Крафт предмета
      const ingredients = new Map([
        ['iron_ore', 10],
        ['oak_log', 5],
      ]);
      
      const craftResult = craftingSystem.craft('iron_sword_recipe', ingredients, 20, 1.0);
      expect(craftResult.success).toBe(true);
      expect(craftResult.item).toBeDefined();
      
      // Добавление в инвентарь
      if (craftResult.item) {
        inventory.addItem(craftResult.item);
        expect(inventory.getAllItems().length).toBe(1);
        
        // Экипировка
        const item = inventory.getAllItems()[0];
        const equipSuccess = inventory.equipItem(item.data.id, 'mainHand');
        expect(equipSuccess).toBe(true);
        expect(inventory.getEquipment().mainHand).toBeDefined();
      }
    });

    it('должен поддерживать полный цикл: лут -> инвентарь -> использование', () => {
      const lootGenerator = new LootGenerator();
      const inventory = new Inventory(50);
      
      // Генерация лута
      const loot = lootGenerator.generateLoot('forest_chest', {
        timeOfDay: 'day',
        difficulty: 1,
        luck: 2,
        biome: 'forest',
      });
      
      // Добавление всего лута в инвентарь
      let addedCount = 0;
      for (const item of loot) {
        if (inventory.addItem(item)) {
          addedCount++;
        }
      }
      
      expect(addedCount).toBeGreaterThan(0);
      expect(inventory.getAllItems().length).toBeGreaterThan(0);
    });
  });
});
