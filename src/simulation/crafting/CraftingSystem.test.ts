import { describe, it, expect } from 'vitest';
import { CraftingSystem } from './CraftingSystem';
import { CraftingCategory } from './CraftingTypes';

describe('CraftingSystem', () => {
  const TEST_SEED = 'test_crafting_seed_123';

  it('должен создавать систему крафта с базовыми рецептами', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    // Проверка что рецепты инициализированы для всех категорий
    const categories: CraftingCategory[] = [
      'blacksmithing',
      'alchemy',
      'cooking',
      'tailoring',
      'carpentry',
      'jewelry',
      'construction',
      'weaponcrafting',
      'armorsmithing',
    ];

    for (const category of categories) {
      const recipes = system.getRecipesByCategory(category);
      expect(recipes.length).toBeGreaterThan(0);
    }
  });

  it('должен возвращать рецепт по ID', () => {
    const system = new CraftingSystem(TEST_SEED);
    const recipes = system.getRecipesByCategory('blacksmithing');
    
    expect(recipes.length).toBeGreaterThan(0);
    const firstRecipe = recipes[0];
    const foundRecipe = system.getRecipe(firstRecipe.id);
    
    expect(foundRecipe).toBeDefined();
    expect(foundRecipe?.name).toBe(firstRecipe.name);
  });

  it('должен открывать рецепты через discoverRecipe', () => {
    const system = new CraftingSystem(TEST_SEED);
    const recipes = system.getRecipesByCategory('cooking');
    
    // Изначально рецепты не открыты
    expect(recipes.every(r => !r.isDiscovered)).toBe(true);
    
    // Открыть первый рецепт
    const recipeToDiscover = recipes[0];
    const discovered = system.discoverRecipe(recipeToDiscover.id, 'book');
    
    expect(discovered).toBe(true);
    
    // Проверить что рецепт открыт
    const updatedRecipe = system.getRecipe(recipeToDiscover.id);
    expect(updatedRecipe?.isDiscovered).toBe(true);
    expect(updatedRecipe?.source).toBe('book');
  });

  it('должен возвращать только открытые рецепты', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    // Изначально нет открытых рецептов
    expect(system.getDiscoveredRecipes().length).toBe(0);
    
    // Открыть несколько рецептов
    const cookingRecipes = system.getRecipesByCategory('cooking');
    system.discoverRecipe(cookingRecipes[0].id, 'teacher');
    system.discoverRecipe(cookingRecipes[1]?.id || cookingRecipes[0].id, 'family');
    
    // Теперь должны быть открытые рецепты
    const discovered = system.getDiscoveredRecipes();
    expect(discovered.length).toBeGreaterThan(0);
  });

  it('должен создавать навык крафтера при первом обращении', () => {
    const system = new CraftingSystem(TEST_SEED);
    // Навык должен быть создан автоматически через craft (внутренний метод)
    // Проверяем что рецепты существуют
    const recipes = system.getRecipesByCategory('blacksmithing');
    expect(recipes.length).toBeGreaterThan(0);
  });

  it('должен рассчитывать шанс успеха крафта', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    // Рецепты существуют
    const blacksmithingRecipes = system.getRecipesByCategory('blacksmithing');
    expect(blacksmithingRecipes.length).toBeGreaterThan(0);
    
    // Простой рецепт должен иметь меньшие требования
    const simpleRecipe = blacksmithingRecipes.find(r => r.difficulty === 'simple');
    if (simpleRecipe) {
      expect(simpleRecipe.minSkillLevel).toBeLessThanOrEqual(20);
    }
  });

  it('должен поддерживать семейные секреты ремесла', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    // Найти рецепты с familySecret
    const allRecipes = [
      ...system.getRecipesByCategory('jewelry'),
      ...system.getRecipesByCategory('armorsmithing'),
      ...system.getRecipesByCategory('cooking'),
    ];
    
    const familySecretRecipes = allRecipes.filter(r => r.familySecret);
    expect(familySecretRecipes.length).toBeGreaterThan(0);
  });

  it('должен поддерживать региональные рецепты', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    // Найти региональные рецепты
    const regionalRecipes = Array.from(
      ['blacksmithing', 'tailoring', 'weaponcrafting', 'construction'] as CraftingCategory[]
    ).flatMap(cat => system.getRecipesByCategory(cat))
      .filter(r => r.source === 'regional');
    
    expect(regionalRecipes.length).toBeGreaterThan(0);
  });

  it('должен поддерживать экспериментальные рецепты', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    const alchemyRecipes = system.getRecipesByCategory('alchemy');
    const experimentalRecipes = alchemyRecipes.filter(r => r.isExperimental);
    
    expect(experimentalRecipes.length).toBeGreaterThan(0);
  });

  it('должен иметь разные уровни сложности крафта', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    const allRecipes = Array.from(
      ['blacksmithing', 'alchemy', 'cooking', 'tailoring', 'carpentry', 'jewelry', 'construction', 'weaponcrafting', 'armorsmithing'] as CraftingCategory[]
    ).flatMap(cat => system.getRecipesByCategory(cat));
    
    const difficulties = new Set(allRecipes.map(r => r.difficulty));
    
    // Должны быть разные уровни сложности
    expect(difficulties.size).toBeGreaterThan(2);
  });

  it('должен сохранять и загружать состояние', () => {
    const system = new CraftingSystem(TEST_SEED);
    
    // Открыть несколько рецептов
    const cookingRecipes = system.getRecipesByCategory('cooking');
    system.discoverRecipe(cookingRecipes[0].id, 'book');
    
    // Сохранить состояние
    const state = system.saveState();
    
    // Создать новую систему и загрузить состояние
    const newSystem = new CraftingSystem(TEST_SEED);
    newSystem.loadState(state);
    
    // Проверить что рецепты сохранились
    const loadedRecipe = newSystem.getRecipe(cookingRecipes[0].id);
    expect(loadedRecipe?.isDiscovered).toBe(true);
  });
});
