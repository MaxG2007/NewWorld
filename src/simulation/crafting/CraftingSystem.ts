import { Item } from '../../entities/items/Item';
import { Quality, ItemProperties } from '../../entities/items/ItemTypes';

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  resultItemId: string;
  resultQuantity: number;
  ingredients: RecipeIngredient[];
  requiredTool?: string;
  skillRequired?: number;
  timeToCraft: number; // в игровых минутах
}

export interface CraftingResult {
  success: boolean;
  item?: Item;
  quality?: Quality;
  message?: string;
}

export class CraftingSystem {
  private recipes: Map<string, Recipe> = new Map();

  constructor() {
    this.initializeRecipes();
  }

  private initializeRecipes(): void {
    // Примеры рецептов
    this.addRecipe({
      id: 'iron_sword_recipe',
      name: 'Iron Sword',
      resultItemId: 'iron_sword',
      resultQuantity: 1,
      ingredients: [
        { itemId: 'iron_ore', quantity: 3 },
        { itemId: 'oak_log', quantity: 1 },
      ],
      requiredTool: 'hammer',
      skillRequired: 10,
      timeToCraft: 60,
    });

    this.addRecipe({
      id: 'bread_recipe',
      name: 'Bread',
      resultItemId: 'bread',
      resultQuantity: 1,
      ingredients: [
        { itemId: 'wheat', quantity: 2 },
        { itemId: 'water', quantity: 1 },
      ],
      requiredTool: 'oven',
      skillRequired: 5,
      timeToCraft: 30,
    });

    this.addRecipe({
      id: 'health_potion_recipe',
      name: 'Health Potion',
      resultItemId: 'health_potion',
      resultQuantity: 1,
      ingredients: [
        { itemId: 'red_herb', quantity: 3 },
        { itemId: 'water', quantity: 1 },
        { itemId: 'glass_bottle', quantity: 1 },
      ],
      requiredTool: 'alchemy_table',
      skillRequired: 15,
      timeToCraft: 45,
    });
  }

  public addRecipe(recipe: Recipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  public getRecipe(recipeId: string): Recipe | undefined {
    return this.recipes.get(recipeId);
  }

  public getAllRecipes(): Recipe[] {
    return Array.from(this.recipes.values());
  }

  public craft(
    recipeId: string,
    availableItems: Map<string, number>,
    crafterSkill: number = 0,
    toolQuality: number = 1.0
  ): CraftingResult {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return {
        success: false,
        message: 'Recipe not found',
      };
    }

    // Проверка наличия ингредиентов
    for (const ingredient of recipe.ingredients) {
      const available = availableItems.get(ingredient.itemId) || 0;
      if (available < ingredient.quantity) {
        return {
          success: false,
          message: `Not enough ${ingredient.itemId}. Required: ${ingredient.quantity}, Available: ${available}`,
        };
      }
    }

    // Проверка навыка
    if (recipe.skillRequired && crafterSkill < recipe.skillRequired) {
      return {
        success: false,
        message: `Skill too low. Required: ${recipe.skillRequired}, Current: ${crafterSkill}`,
      };
    }

    // Расчет качества результата
    let quality = Quality.Normal;
    const skillBonus = crafterSkill - (recipe.skillRequired || 0);
    const qualityRoll = Math.random() * 100 + skillBonus * 0.5 * toolQuality;

    if (qualityRoll > 95) quality = Quality.Pristine;
    else if (qualityRoll > 85) quality = Quality.Excellent;
    else if (qualityRoll > 70) quality = Quality.Good;
    else if (qualityRoll > 50) quality = Quality.Normal;
    else if (qualityRoll > 30) quality = Quality.Poor;
    else quality = Quality.Broken;

    // Создание предмета
    // В реальной игре здесь была бы загрузка определения предмета из базы данных
    const properties: ItemProperties = {};
    if (recipe.resultItemId.includes('sword')) {
      properties.damage = 10 * toolQuality;
    } else if (recipe.resultItemId.includes('potion')) {
      properties.healing = 20 * toolQuality;
    }

    const craftedItem = new Item(recipe.resultItemId, {
      quality,
      properties,
      origin: {
        creator: `Crafted via recipe ${recipe.name}`,
        discoveredAt: Date.now(),
      },
    });

    craftedItem.addToHistory(`Crafted using recipe: ${recipe.name}`);

    return {
      success: true,
      item: craftedItem,
      quality,
      message: `Successfully crafted ${recipe.name} with quality ${quality}`,
    };
  }

  public canCraft(recipeId: string, availableItems: Map<string, number>): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return false;

    for (const ingredient of recipe.ingredients) {
      const available = availableItems.get(ingredient.itemId) || 0;
      if (available < ingredient.quantity) {
        return false;
      }
    }

    return true;
  }
}
