/**
 * Unit тесты для крафта (crafting)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

interface Item {
  id: string;
  name: string;
  quantity: number;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Item[];
  result: Item;
  craftTime: number;
}

export class CraftingTest {
  private suite: TestSuite = {
    name: 'Crafting System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testRecipeRequirements();
    this.testCraftingResult();
    this.testInsufficientResources();
    this.testCraftingTime();
    this.testRecipeChain();
    return this.suite;
  }

  private testRecipeRequirements(): void {
    const startTime = Date.now();
    try {
      const recipe: Recipe = {
        id: 'sword',
        name: 'Iron Sword',
        ingredients: [
          { id: 'iron', name: 'Iron Ingot', quantity: 2 },
          { id: 'wood', name: 'Wood Handle', quantity: 1 }
        ],
        result: { id: 'sword', name: 'Iron Sword', quantity: 1 },
        craftTime: 100
      };

      // Проверка что рецепт имеет ингредиенты
      if (recipe.ingredients.length === 0) {
        throw new Error('Recipe should have ingredients');
      }

      // Проверка что результат определен
      if (!recipe.result) {
        throw new Error('Recipe should have a result');
      }

      this.addTest('recipe_requirements', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('recipe_requirements', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testCraftingResult(): void {
    const startTime = Date.now();
    try {
      const inventory: Map<string, number> = new Map([
        ['iron', 5],
        ['wood', 3]
      ]);

      const recipe: Recipe = {
        id: 'sword',
        name: 'Iron Sword',
        ingredients: [
          { id: 'iron', name: 'Iron Ingot', quantity: 2 },
          { id: 'wood', name: 'Wood Handle', quantity: 1 }
        ],
        result: { id: 'sword', name: 'Iron Sword', quantity: 1 },
        craftTime: 100
      };

      // Проверка возможности крафта
      const canCraft = this.canCraft(inventory, recipe);
      if (!canCraft) {
        throw new Error('Should be able to craft with sufficient resources');
      }

      // Крафт и проверка результата
      const newInventory = this.craft(inventory, recipe);
      if (!newInventory.has('sword') || newInventory.get('sword') !== 1) {
        throw new Error('Crafting should produce the result item');
      }

      this.addTest('crafting_result', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('crafting_result', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testInsufficientResources(): void {
    const startTime = Date.now();
    try {
      const inventory: Map<string, number> = new Map([
        ['iron', 1], // Недостаточно
        ['wood', 3]
      ]);

      const recipe: Recipe = {
        id: 'sword',
        name: 'Iron Sword',
        ingredients: [
          { id: 'iron', name: 'Iron Ingot', quantity: 2 },
          { id: 'wood', name: 'Wood Handle', quantity: 1 }
        ],
        result: { id: 'sword', name: 'Iron Sword', quantity: 1 },
        craftTime: 100
      };

      // Проверка что нельзя скрафтить при недостатке ресурсов
      const canCraft = this.canCraft(inventory, recipe);
      if (canCraft) {
        throw new Error('Should not be able to craft with insufficient resources');
      }

      this.addTest('insufficient_resources', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('insufficient_resources', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testCraftingTime(): void {
    const startTime = Date.now();
    try {
      const recipes: Recipe[] = [
        {
          id: 'potion',
          name: 'Health Potion',
          ingredients: [{ id: 'herb', name: 'Herb', quantity: 1 }],
          result: { id: 'potion', name: 'Health Potion', quantity: 1 },
          craftTime: 10
        },
        {
          id: 'armor',
          name: 'Steel Armor',
          ingredients: [{ id: 'steel', name: 'Steel Plate', quantity: 5 }],
          result: { id: 'armor', name: 'Steel Armor', quantity: 1 },
          craftTime: 500
        }
      ];

      // Проверка что более сложные предметы требуют больше времени
      if (recipes[0].craftTime >= recipes[1].craftTime) {
        throw new Error('Complex items should take longer to craft');
      }

      this.addTest('crafting_time', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('crafting_time', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testRecipeChain(): void {
    const startTime = Date.now();
    try {
      // Цепочка крафта: дерево -> доски -> сундук
      const recipes: Recipe[] = [
        {
          id: 'planks',
          name: 'Wood Planks',
          ingredients: [{ id: 'log', name: 'Log', quantity: 1 }],
          result: { id: 'planks', name: 'Wood Planks', quantity: 4 },
          craftTime: 5
        },
        {
          id: 'chest',
          name: 'Wood Chest',
          ingredients: [{ id: 'planks', name: 'Wood Planks', quantity: 8 }],
          result: { id: 'chest', name: 'Wood Chest', quantity: 1 },
          craftTime: 20
        }
      ];

      let inventory: Map<string, number> = new Map([['log', 10]]);

      // Крафт досок
      if (!this.canCraft(inventory, recipes[0])) {
        throw new Error('Should be able to craft planks');
      }
      inventory = this.craft(inventory, recipes[0]);
      inventory = this.craft(inventory, recipes[0]); // Еще раз для 8 досок

      // Крафт сундука
      if (!this.canCraft(inventory, recipes[1])) {
        throw new Error('Should be able to craft chest after planks');
      }
      inventory = this.craft(inventory, recipes[1]);

      if (!inventory.has('chest') || inventory.get('chest') !== 1) {
        throw new Error('Recipe chain should produce final item');
      }

      this.addTest('recipe_chain', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('recipe_chain', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private canCraft(inventory: Map<string, number>, recipe: Recipe): boolean {
    for (const ingredient of recipe.ingredients) {
      const available = inventory.get(ingredient.id) || 0;
      if (available < ingredient.quantity) {
        return false;
      }
    }
    return true;
  }

  private craft(inventory: Map<string, number>, recipe: Recipe): Map<string, number> {
    const newInventory = new Map(inventory);
    
    // Удаляем ингредиенты
    for (const ingredient of recipe.ingredients) {
      const current = newInventory.get(ingredient.id) || 0;
      newInventory.set(ingredient.id, current - ingredient.quantity);
    }
    
    // Добавляем результат
    const current = newInventory.get(recipe.result.id) || 0;
    newInventory.set(recipe.result.id, current + recipe.result.quantity);
    
    return newInventory;
  }

  private addTest(name: string, passed: boolean, duration: number, error?: string): void {
    const result: TestResult = { name, passed, duration, error };
    this.suite.tests.push(result);
    this.suite.totalDuration += duration;
    if (passed) {
      this.suite.passedCount++;
    } else {
      this.suite.failedCount++;
    }
  }
}
