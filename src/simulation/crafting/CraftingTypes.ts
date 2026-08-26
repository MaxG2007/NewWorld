import { BaseEntity, EntityRef } from '../../data/BaseTypes';

/**
 * Категория крафта
 */
export type CraftingCategory =
  | 'blacksmithing'      // кузнечное дело
  | 'alchemy'           // алхимия
  | 'cooking'           // кулинария
  | 'tailoring'         // портняжное дело
  | 'carpentry'         // плотничество
  | 'jewelry'           // ювелирное дело
  | 'construction'      // строительство
  | 'weaponcrafting'    // изготовление оружия
  | 'armorsmithing';    // изготовление брони

/**
 * Уровень сложности крафта
 */
export type CraftingDifficulty = 'simple' | 'medium' | 'complex' | 'masterwork' | 'legendary';

/**
 * Источник получения рецепта
 */
export type RecipeSource = 'book' | 'teacher' | 'experiment' | 'family' | 'regional' | 'discovery';

/**
 * Тип результата крафта
 */
export type CraftResultType = 'item' | 'structure' | 'improvement' | 'repair';

/**
 * Требования к навыкам для крафта
 */
export interface SkillRequirement {
  skillId: string;
  minLevel: number;
  isOptional: boolean; // если true, можно крафтить без этого навыка, но с штрафом
}

/**
 * Требования к инструменту для крафта
 */
export interface ToolRequirement {
  toolId: string;
  minCondition: number; // минимальное состояние инструмента (0-100)
  isConsumed: boolean; // расходуется ли инструмент
  consumptionChance: number; // шанс расхода (0-1)
}

/**
 * Шаг крафта
 */
export interface CraftingStep {
  id: string;
  name: string;
  description: string;
  duration: number; // время в минутах
  requiredTools: ToolRequirement[];
  skillChecks: SkillRequirement[];
  successChance: number; // 0-1, базовый шанс успеха
  failureConsequence: 'nothing' | 'waste_materials' | 'damage_tools' | 'inferior_quality';
}

/**
 * Параметры качества результата
 */
export interface QualityParameters {
  baseQuality: number; // базовое качество (0-100)
  qualityVariance: number; // разброс качества
  criticalSuccessThreshold: number; // порог критического успеха
  criticalFailureThreshold: number; // порог критического провала
  qualityFactors: {
    skillBonus: number; // бонус от навыка
    toolBonus: number; // бонус от инструмента
    materialBonus: number; // бонус от материалов
    environmentBonus: number; // бонус от окружения
  };
}

/**
 * Рецепт крафта
 */
export interface CraftingRecipe extends BaseEntity {
  name: string;
  category: CraftingCategory;
  difficulty: CraftingDifficulty;
  
  // Результат
  resultType: CraftResultType;
  resultItem?: EntityRef<'Item'>; // для item/repair
  resultStructure?: string; // для structure
  quantity: number;
  
  // Ингредиенты
  ingredients: Array<{
    item: EntityRef<'Item'>;
    quantity: number;
    isConsumed: boolean;
    allowSubstitutes: boolean; // можно ли заменять аналогичными материалами
  }>;
  
  // Требования
  tools: ToolRequirement[];
  skills: SkillRequirement[];
  minSkillLevel: number;
  
  // Время
  craftingTime: number; // время в минутах
  
  // Шаги крафта (для сложных рецептов)
  steps?: CraftingStep[];
  
  // Качество
  qualityParams: QualityParameters;
  
  // Открытие рецепта
  isDiscovered: boolean;
  source: RecipeSource;
  region?: EntityRef<'Culture'> | null; // региональные рецепты
  familySecret?: boolean; // семейный секрет ремесла
  
  // Эксперименты
  isExperimental: boolean; // можно ли получить экспериментально
  experimentClues: string[]; // подсказки для экспериментального открытия
  
  // Обучение
  canBeTaught: boolean;
  teacherProfession?: EntityRef<'Profession'> | null;
  
  // Книга рецептов
  recipeBookItem?: EntityRef<'Item'> | null;
}

/**
 * Навык крафта
 */
export interface CraftingSkill extends BaseEntity {
  name: string;
  category: CraftingCategory;
  level: number; // 0-100
  experience: number;
  experienceToNextLevel: number;
  
  // Специализации внутри навыка
  specializations: Array<{
    id: string;
    name: string;
    level: number;
    bonus: number;
  }>;
  
  // Известные рецепты
  knownRecipes: EntityRef<'CraftingRecipe'>[];
  
  // Статистика
  itemsCrafted: number;
  criticalSuccesses: number;
  criticalFailures: number;
  averageQuality: number;
}

/**
 * Рабочее место для крафта
 */
export interface CraftingStation extends BaseEntity {
  name: string;
  type: CraftingCategory;
  location: EntityRef<'Building' | 'Chunk'>;
  owner?: EntityRef<'NPC' | 'Family'>;
  
  // Состояние
  condition: number; // 0-100
  efficiency: number; // 0-1, эффективность рабочего места
  
  // Доступные категории крафта
  supportedCategories: CraftingCategory[];
  
  // Бонусы
  qualityBonus: number; // бонус к качеству
  speedBonus: number; // бонус к скорости
  successChanceBonus: number; // бонус к шансу успеха
  
  // Инструменты на рабочем месте
  availableTools: EntityRef<'Item'>[];
  
  // Хранилище материалов
  storage: Array<{
    item: EntityRef<'Item'>;
    quantity: number;
  }>;
}

/**
 * Результат крафта
 */
export interface CraftingResult {
  success: boolean;
  isCritical: boolean;
  quality: number; // 0-100
  resultItem?: EntityRef<'Item'>;
  quantity: number;
  timeSpent: number; // затраченное время в минутах
  experienceGained: number;
  materialsUsed: Array<{
    item: EntityRef<'Item'>;
    quantity: number;
  }>;
  toolsDamaged: Array<{
    tool: EntityRef<'Item'>;
    damage: number;
  }>;
  byproducts?: Array<{
    item: EntityRef<'Item'>;
    quantity: number;
  }>;
  discovery?: {
    newRecipe?: EntityRef<'CraftingRecipe'>;
    techniqueImprovement?: string;
  };
}

/**
 * Контекст крафта
 */
export interface CraftingContext {
  crafter: EntityRef<'NPC'>;
  station?: EntityRef<'CraftingStation'>;
  recipe: EntityRef<'CraftingRecipe'>;
  selectedIngredients: Array<{
    item: EntityRef<'Item'>;
    quantity: number;
  }>;
  selectedTools: EntityRef<'Item'>[];
  startTime: number; // игровое время начала
  modifiers: {
    fatigue: number; // усталость крафтера
    environment: number; // условия окружения
    assistance: number; // помощь других NPC
    luck: number; // удача
  };
}

/**
 * Данные о прогрессе обучения ремеслу
 */
export interface ApprenticeshipData {
  master: EntityRef<'NPC'>;
  apprentice: EntityRef<'NPC'>;
  skill: CraftingCategory;
  startDate: number;
  progress: number; // 0-100
  lessonsCompleted: number;
  nextLessonDate?: number;
  relationshipBonus: number; // бонус от отношений с учителем
}

/**
 * Книга рецептов
 */
export interface RecipeBook extends BaseEntity {
  name: string;
  description: string;
  category: CraftingCategory;
  recipes: EntityRef<'CraftingRecipe'>[];
  author?: EntityRef<'NPC'>;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  condition: number; // 0-100
  canBeCopied: boolean;
  language?: EntityRef<'Culture'>;
  requiredSkillLevel: number;
}
