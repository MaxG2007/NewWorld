import { DeterministicRNG } from '../../core/random/DeterministicRNG';
import { CraftingRecipe, CraftingResult, CraftingContext, CraftingSkill, CraftingStation, CraftingCategory, RecipeSource } from './CraftingTypes';
import { EntityRef } from '../../data/BaseTypes';

/**
 * Система крафта - управляет созданием предметов, обучением ремеслам и открытием рецептов
 */
export class CraftingSystem {
  private rng: DeterministicRNG;
  private recipes: Map<string, CraftingRecipe> = new Map();
  private craftingSkills: Map<string, CraftingSkill> = new Map();
  private stations: Map<string, CraftingStation> = new Map();
  
  // База данных всех возможных рецептов по категориям
  private readonly RECIPE_DATABASE: Record<CraftingCategory, Partial<CraftingRecipe>[]> = {
    blacksmithing: [
      {
        name: 'Железный меч',
        category: 'blacksmithing',
        difficulty: 'medium',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 20,
        craftingTime: 120,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Стальной топор',
        category: 'blacksmithing',
        difficulty: 'complex',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 40,
        craftingTime: 180,
        source: 'regional' as RecipeSource,
      },
      {
        name: 'Подкова',
        category: 'blacksmithing',
        difficulty: 'simple',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 5,
        craftingTime: 30,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
    ],
    alchemy: [
      {
        name: 'Лечебное зелье',
        category: 'alchemy',
        difficulty: 'simple',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 10,
        craftingTime: 60,
        source: 'book' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Зелье невидимости',
        category: 'alchemy',
        difficulty: 'complex',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 50,
        craftingTime: 240,
        source: 'experiment' as RecipeSource,
        isExperimental: true,
      },
    ],
    cooking: [
      {
        name: 'Хлеб',
        category: 'cooking',
        difficulty: 'simple',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 1,
        craftingTime: 45,
        source: 'family' as RecipeSource,
        familySecret: false,
        canBeTaught: true,
      },
      {
        name: 'Пир с трапезы короля',
        category: 'cooking',
        difficulty: 'masterwork',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 70,
        craftingTime: 300,
        source: 'regional' as RecipeSource,
      },
    ],
    tailoring: [
      {
        name: 'Льняная рубаха',
        category: 'tailoring',
        difficulty: 'simple',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 5,
        craftingTime: 60,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Шёлковое платье',
        category: 'tailoring',
        difficulty: 'complex',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 45,
        craftingTime: 200,
        source: 'regional' as RecipeSource,
      },
    ],
    carpentry: [
      {
        name: 'Деревянный стул',
        category: 'carpentry',
        difficulty: 'simple',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 10,
        craftingTime: 90,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Сундук',
        category: 'carpentry',
        difficulty: 'medium',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 25,
        craftingTime: 150,
        source: 'family' as RecipeSource,
      },
    ],
    jewelry: [
      {
        name: 'Серебряное кольцо',
        category: 'jewelry',
        difficulty: 'medium',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 30,
        craftingTime: 120,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Изумрудное ожерелье',
        category: 'jewelry',
        difficulty: 'masterwork',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 65,
        craftingTime: 360,
        source: 'family' as RecipeSource,
        familySecret: true,
      },
    ],
    construction: [
      {
        name: 'Деревянная стена',
        category: 'construction',
        difficulty: 'simple',
        resultType: 'structure',
        quantity: 1,
        minSkillLevel: 15,
        craftingTime: 180,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Каменный фундамент',
        category: 'construction',
        difficulty: 'complex',
        resultType: 'structure',
        quantity: 1,
        minSkillLevel: 40,
        craftingTime: 480,
        source: 'regional' as RecipeSource,
      },
    ],
    weaponcrafting: [
      {
        name: 'Кинжал',
        category: 'weaponcrafting',
        difficulty: 'simple',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 10,
        craftingTime: 60,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Длинный лук',
        category: 'weaponcrafting',
        difficulty: 'complex',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 45,
        craftingTime: 240,
        source: 'regional' as RecipeSource,
      },
    ],
    armorsmithing: [
      {
        name: 'Кожаная броня',
        category: 'armorsmithing',
        difficulty: 'medium',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 20,
        craftingTime: 150,
        source: 'teacher' as RecipeSource,
        canBeTaught: true,
      },
      {
        name: 'Латный доспех',
        category: 'armorsmithing',
        difficulty: 'legendary',
        resultType: 'item',
        quantity: 1,
        minSkillLevel: 80,
        craftingTime: 720,
        source: 'family' as RecipeSource,
        familySecret: true,
      },
    ],
  };

  constructor(seed: string) {
    this.rng = new DeterministicRNG(seed);
    this.initializeRecipes();
  }

  /**
   * Инициализация базы рецептов
   */
  private initializeRecipes(): void {
    const categories = Object.keys(this.RECIPE_DATABASE) as CraftingCategory[];
    const now = Date.now();
    
    for (const category of categories) {
      const recipeTemplates = this.RECIPE_DATABASE[category];
      
      for (const template of recipeTemplates) {
        if (!template.name) continue;
        
        const recipe: CraftingRecipe = {
          id: `recipe_${category}_${template.name.toLowerCase().replace(/\s+/g, '_')}`,
          version: '1.0',
          createdAt: now,
          updatedAt: now,
          name: template.name,
          category: category,
          difficulty: template.difficulty || 'simple',
          resultType: template.resultType || 'item',
          quantity: template.quantity || 1,
          ingredients: [],
          tools: [],
          skills: [],
          minSkillLevel: template.minSkillLevel || 0,
          craftingTime: template.craftingTime || 60,
          qualityParams: {
            baseQuality: 50,
            qualityVariance: 20,
            criticalSuccessThreshold: 0.95,
            criticalFailureThreshold: 0.05,
            qualityFactors: {
              skillBonus: 0.3,
              toolBonus: 0.2,
              materialBonus: 0.2,
              environmentBonus: 0.1,
            },
          },
          isDiscovered: false,
          source: template.source || 'discovery',
          region: null,
          familySecret: template.familySecret || false,
          isExperimental: template.isExperimental || false,
          experimentClues: [],
          canBeTaught: template.canBeTaught !== undefined ? template.canBeTaught : true,
          teacherProfession: null,
          recipeBookItem: null,
          ...template,
        };
        
        this.recipes.set(recipe.id, recipe);
      }
    }
  }

  /**
   * Получить рецепт по ID
   */
  getRecipe(recipeId: string): CraftingRecipe | undefined {
    return this.recipes.get(recipeId);
  }

  /**
   * Получить все рецепты категории
   */
  getRecipesByCategory(category: CraftingCategory): CraftingRecipe[] {
    return Array.from(this.recipes.values()).filter(r => r.category === category);
  }

  /**
   * Получить только открытые рецепты
   */
  getDiscoveredRecipes(category?: CraftingCategory): CraftingRecipe[] {
    let recipes = Array.from(this.recipes.values()).filter(r => r.isDiscovered);
    if (category) {
      recipes = recipes.filter(r => r.category === category);
    }
    return recipes;
  }

  /**
   * Открыть рецепт (например, из книги или от учителя)
   */
  discoverRecipe(recipeId: string, source: RecipeSource): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return false;
    }
    
    if (!recipe.isDiscovered) {
      recipe.isDiscovered = true;
      recipe.source = source;
      return true;
    }
    
    return false;
  }

  /**
   * Попытка экспериментального открытия рецепта
   */
  attemptExperiment(crafterId: string, category: CraftingCategory, materials: EntityRef<'Item'>[]): CraftingResult {
    const skill = this.craftingSkills.get(`${crafterId}_${category}`);
    const skillLevel = skill?.level || 0;
    
    // Шанс успеха зависит от навыка
    const successChance = Math.min(0.8, 0.1 + (skillLevel / 100) * 0.7);
    const roll = this.rng.nextFloat();
    
    if (roll < successChance && skillLevel >= 30) {
      // Найти потенциально открываемый рецепт
      const undiscoveredRecipes = this.getRecipesByCategory(category).filter(
        r => !r.isDiscovered && r.isExperimental
      );
      
      if (undiscoveredRecipes.length > 0) {
        const discoveredRecipe = undiscoveredRecipes[this.rng.nextInt(0, undiscoveredRecipes.length - 1)];
        this.discoverRecipe(discoveredRecipe.id, 'experiment');
        
        return {
          success: true,
          isCritical: true,
          quality: 80,
          quantity: 0,
          timeSpent: 60,
          experienceGained: 50,
          materialsUsed: materials.map(m => ({ item: m, quantity: 1 })),
          toolsDamaged: [],
          discovery: {
            newRecipe: { id: discoveredRecipe.id, type: 'CraftingRecipe' },
            techniqueImprovement: `Открыт новый рецепт: ${discoveredRecipe.name}`,
          },
        };
      }
    }
    
    return {
      success: false,
      isCritical: false,
      quality: 0,
      quantity: 0,
      timeSpent: 60,
      experienceGained: skillLevel > 0 ? 5 : 0,
      materialsUsed: materials.map(m => ({ item: m, quantity: 1 })),
      toolsDamaged: [],
    };
  }

  /**
   * Обучение у NPC-учителя
   */
  learnFromTeacher(
    apprenticeId: string,
    teacherId: string,
    category: CraftingCategory
  ): { success: boolean; recipesLearned: string[]; skillIncrease: number } {
    const teacherSkill = this.craftingSkills.get(`${teacherId}_${category}`);
    const apprenticeSkill = this.craftingSkills.get(`${apprenticeId}_${category}`);
    
    if (!teacherSkill || teacherSkill.level < 30) {
      return { success: false, recipesLearned: [], skillIncrease: 0 };
    }
    
    const recipesLearned: string[] = [];
    
    // Найти рецепты, которые знает учитель, но не знает ученик
    const teacherRecipes = teacherSkill.knownRecipes;
    const apprenticeKnownIds = apprenticeSkill?.knownRecipes.map(r => r.id) || [];
    
    for (const recipeRef of teacherRecipes) {
      const recipe = this.recipes.get(recipeRef.id);
      if (recipe && !apprenticeKnownIds.includes(recipe.id) && recipe.canBeTaught) {
        this.discoverRecipe(recipe.id, 'teacher');
        recipesLearned.push(recipe.id);
        
        if (apprenticeSkill) {
          apprenticeSkill.knownRecipes.push({ id: recipe.id, type: 'CraftingRecipe' });
        }
      }
    }
    
    // Увеличение навыка ученика
    let skillIncrease = 0;
    if (apprenticeSkill && apprenticeSkill.level < teacherSkill.level) {
      skillIncrease = Math.floor((teacherSkill.level - apprenticeSkill.level) * 0.1);
      apprenticeSkill.experience += skillIncrease * 10;
      this.checkLevelUp(apprenticeSkill);
    }
    
    return {
      success: recipesLearned.length > 0 || skillIncrease > 0,
      recipesLearned,
      skillIncrease,
    };
  }

  /**
   * Проверка повышения уровня навыка
   */
  private checkLevelUp(skill: CraftingSkill): void {
    while (skill.experience >= skill.experienceToNextLevel) {
      skill.experience -= skill.experienceToNextLevel;
      skill.level++;
      skill.experienceToNextLevel = Math.floor(skill.experienceToNextLevel * 1.5);
    }
  }

  /**
   * Выполнить крафт
   */
  craft(context: CraftingContext): CraftingResult {
    const recipe = this.getRecipe(context.recipe.id);
    if (!recipe) {
      return this.createFailedResult('Рецепт не найден', context);
    }
    
    if (!recipe.isDiscovered && recipe.source !== 'experiment') {
      return this.createFailedResult('Рецепт не изучен', context);
    }
    
    // Проверка навыков
    const crafterSkill = this.getCrafterSkill(context.crafter.id, recipe.category);
    if (crafterSkill.level < recipe.minSkillLevel) {
      return this.createFailedResult('Недостаточный уровень навыка', context);
    }
    
    // Расчёт шанса успеха
    const successChance = this.calculateSuccessChance(context, recipe, crafterSkill);
    const roll = this.rng.nextFloat();
    const isSuccess = roll <= successChance;
    const isCritical = roll <= recipe.qualityParams.criticalSuccessThreshold && isSuccess;
    
    // Расчёт качества
    const quality = this.calculateQuality(context, recipe, crafterSkill, isCritical);
    
    // Опыт за крафт
    const experienceGained = isSuccess 
      ? this.calculateExperience(recipe, quality, isCritical)
      : 1;
    
    // Обновление навыка
    crafterSkill.experience += experienceGained;
    crafterSkill.itemsCrafted++;
    if (isCritical) crafterSkill.criticalSuccesses++;
    if (!isSuccess) crafterSkill.criticalFailures++;
    this.checkLevelUp(crafterSkill);
    
    return {
      success: isSuccess,
      isCritical,
      quality,
      resultItem: recipe.resultItem,
      quantity: isSuccess ? recipe.quantity : 0,
      timeSpent: recipe.craftingTime,
      experienceGained,
      materialsUsed: recipe.ingredients.map(i => ({ item: i.item, quantity: i.quantity })),
      toolsDamaged: [],
    };
  }

  /**
   * Получить навык крафтера
   */
  private getCrafterSkill(crafterId: string, category: CraftingCategory): CraftingSkill {
    const skillKey = `${crafterId}_${category}`;
    
    if (!this.craftingSkills.has(skillKey)) {
      // Создать новый навык если не существует
      const now = Date.now();
      const newSkill: CraftingSkill = {
        id: skillKey,
        version: '1.0',
        createdAt: now,
        updatedAt: now,
        name: this.getSkillName(category),
        category,
        level: 0,
        experience: 0,
        experienceToNextLevel: 100,
        specializations: [],
        knownRecipes: [],
        itemsCrafted: 0,
        criticalSuccesses: 0,
        criticalFailures: 0,
        averageQuality: 0,
      };
      this.craftingSkills.set(skillKey, newSkill);
    }
    
    return this.craftingSkills.get(skillKey)!;
  }

  /**
   * Получить название навыка по категории
   */
  private getSkillName(category: CraftingCategory): string {
    const names: Record<CraftingCategory, string> = {
      blacksmithing: 'Кузнечное дело',
      alchemy: 'Алхимия',
      cooking: 'Кулинария',
      tailoring: 'Портняжное дело',
      carpentry: 'Плотничество',
      jewelry: 'Ювелирное дело',
      construction: 'Строительство',
      weaponcrafting: 'Изготовление оружия',
      armorsmithing: 'Изготовление брони',
    };
    return names[category];
  }

  /**
   * Расчёт шанса успеха
   */
  private calculateSuccessChance(
    context: CraftingContext,
    _recipe: CraftingRecipe,
    skill: CraftingSkill
  ): number {
    let chance = 0.7; // Базовый шанс
    
    // Бонус от навыка
    chance += (skill.level / 100) * 0.2;
    
    // Бонус от рабочего места
    if (context.station) {
      const station = this.stations.get(context.station.id);
      if (station) {
        chance += station.successChanceBonus;
      }
    }
    
    // Модификаторы
    chance += context.modifiers.assistance * 0.1;
    chance -= context.modifiers.fatigue * 0.2;
    chance += context.modifiers.environment * 0.05;
    
    return Math.max(0.1, Math.min(0.99, chance));
  }

  /**
   * Расчёт качества результата
   */
  private calculateQuality(
    context: CraftingContext,
    recipe: CraftingRecipe,
    skill: CraftingSkill,
    isCritical: boolean
  ): number {
    const params = recipe.qualityParams;
    let quality = params.baseQuality;
    
    // Бонус от навыка
    quality += skill.level * params.qualityFactors.skillBonus;
    
    // Бонус от окружения
    quality += context.modifiers.environment * 20 * params.qualityFactors.environmentBonus;
    
    // Разброс
    const variance = (this.rng.nextFloat() - 0.5) * 2 * params.qualityVariance;
    quality += variance;
    
    // Критический успех
    if (isCritical) {
      quality = Math.min(100, quality + 25);
    }
    
    return Math.max(0, Math.min(100, Math.round(quality)));
  }

  /**
   * Расчёт опыта за крафт
   */
  private calculateExperience(recipe: CraftingRecipe, quality: number, isCritical: boolean): number {
    let exp = recipe.craftingTime / 10; // Базовый опыт от времени
    
    // Бонус за качество
    exp *= (quality / 50);
    
    // Бонус за критический успех
    if (isCritical) {
      exp *= 1.5;
    }
    
    // Бонус за сложность
    const difficultyMultipliers: Record<string, number> = {
      simple: 1,
      medium: 1.5,
      complex: 2,
      masterwork: 3,
      legendary: 5,
    };
    exp *= difficultyMultipliers[recipe.difficulty] || 1;
    
    return Math.floor(exp);
  }

  /**
   * Создать результат неудачного крафта
   */
  private createFailedResult(_reason: string, context: CraftingContext): CraftingResult {
    return {
      success: false,
      isCritical: false,
      quality: 0,
      quantity: 0,
      timeSpent: 10,
      experienceGained: 1,
      materialsUsed: context.selectedIngredients,
      toolsDamaged: [],
    };
  }

  /**
   * Добавить рабочее место
   */
  addStation(station: CraftingStation): void {
    this.stations.set(station.id, station);
  }

  /**
   * Получить рабочее место
   */
  getStation(stationId: string): CraftingStation | undefined {
    return this.stations.get(stationId);
  }

  /**
   * Сохранить состояние системы
   */
  saveState(): object {
    return {
      recipes: Array.from(this.recipes.entries()),
      craftingSkills: Array.from(this.craftingSkills.entries()),
      stations: Array.from(this.stations.entries()),
    };
  }

  /**
   * Загрузить состояние системы
   */
  loadState(state: object): void {
    const typedState = state as {
      recipes: [string, CraftingRecipe][];
      craftingSkills: [string, CraftingSkill][];
      stations: [string, CraftingStation][];
    };
    
    this.recipes = new Map(typedState.recipes);
    this.craftingSkills = new Map(typedState.craftingSkills);
    this.stations = new Map(typedState.stations);
  }
}
