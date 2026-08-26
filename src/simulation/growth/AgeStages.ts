/**
 * Возрастные стадии развития персонажа
 * Диапазоны зависят от расы (множитель продолжительности жизни)
 */

export enum LifeStage {
  INFANT = 'infant',         // 0-2 года (базовое)
  EARLY_CHILDHOOD = 'early_childhood', // 3-6 лет
  CHILDHOOD = 'childhood',   // 7-12 лет
  ADOLESCENCE = 'adolescence', // 13-15 лет
  ADULTHOOD = 'adulthood',   // 16+ лет
  MIDDLE_AGE = 'middle_age', // зрелость
  ELDERLY = 'elderly',       // старость
}

export interface AgeStageConfig {
  stage: LifeStage;
  minAgeRatio: number; // Минимальный возраст как доля от максимальной продолжительности жизни расы
  maxAgeRatio: number; // Максимальный возраст как доля от максимальной продолжительности жизни расы
  description: string;
  canLearn: boolean;   // Может ли обучаться навыкам
  canWork: boolean;    // Может ли работать
  canMarry: boolean;   // Может ли вступать в брак
  canFight: boolean;   // Может ли сражаться
  skillGrowthMultiplier: number; // Множитель роста навыков
}

// Базовая конфигурация возрастных стадий (для людей)
export const BASE_AGE_STAGES: AgeStageConfig[] = [
  {
    stage: LifeStage.INFANT,
    minAgeRatio: 0,
    maxAgeRatio: 0.03, // ~2 года при 80 годах жизни
    description: 'Младенец, полностью зависим от родителей',
    canLearn: false,
    canWork: false,
    canMarry: false,
    canFight: false,
    skillGrowthMultiplier: 0.5,
  },
  {
    stage: LifeStage.EARLY_CHILDHOOD,
    minAgeRatio: 0.04, // ~3 года
    maxAgeRatio: 0.08, // ~6 лет
    description: 'Раннее детство, начало обучения и игр',
    canLearn: true,
    canWork: false,
    canMarry: false,
    canFight: false,
    skillGrowthMultiplier: 1.5,
  },
  {
    stage: LifeStage.CHILDHOOD,
    minAgeRatio: 0.09, // ~7 лет
    maxAgeRatio: 0.15, // ~12 лет
    description: 'Ребёнок, активное обучение и социализация',
    canLearn: true,
    canWork: false,
    canMarry: false,
    canFight: false,
    skillGrowthMultiplier: 2.0,
  },
  {
    stage: LifeStage.ADOLESCENCE,
    minAgeRatio: 0.16, // ~13 лет
    maxAgeRatio: 0.20, // ~15 лет
    description: 'Подросток, подготовка к взрослой жизни',
    canLearn: true,
    canWork: true,
    canMarry: false,
    canFight: false,
    skillGrowthMultiplier: 1.8,
  },
  {
    stage: LifeStage.ADULTHOOD,
    minAgeRatio: 0.21, // ~16 лет
    maxAgeRatio: 0.60, // ~48 лет
    description: 'Взрослый, полная самостоятельность',
    canLearn: true,
    canWork: true,
    canMarry: true,
    canFight: true,
    skillGrowthMultiplier: 1.0,
  },
  {
    stage: LifeStage.MIDDLE_AGE,
    minAgeRatio: 0.61,
    maxAgeRatio: 0.85,
    description: 'Зрелость, пик возможностей',
    canLearn: true,
    canWork: true,
    canMarry: true,
    canFight: true,
    skillGrowthMultiplier: 0.7,
  },
  {
    stage: LifeStage.ELDERLY,
    minAgeRatio: 0.86,
    maxAgeRatio: 1.0,
    description: 'Старость, передача опыта',
    canLearn: false,
    canWork: false,
    canMarry: false,
    canFight: false,
    skillGrowthMultiplier: 0.3,
  },
];

/**
 * Получить возрастную стадию для конкретного возраста и расы
 * @param age - текущий возраст в годах
 * @param maxLifespan - максимальная продолжительность жизни расы
 */
export function getLifeStage(age: number, maxLifespan: number): LifeStage {
  const ageRatio = age / maxLifespan;
  
  for (const config of BASE_AGE_STAGES) {
    if (ageRatio >= config.minAgeRatio && ageRatio < config.maxAgeRatio) {
      return config.stage;
    }
  }
  
  return LifeStage.ELDERLY;
}

/**
 * Получить конфигурацию возрастной стадии
 */
export function getAgeStageConfig(stage: LifeStage): AgeStageConfig | undefined {
  return BASE_AGE_STAGES.find(config => config.stage === stage);
}

/**
 * Проверить, может ли персонаж выполнять действие на данной стадии
 */
export function canPerformAction(
  stage: LifeStage,
  action: 'learn' | 'work' | 'marry' | 'fight'
): boolean {
  const config = getAgeStageConfig(stage);
  if (!config) return false;
  
  switch (action) {
    case 'learn': return config.canLearn;
    case 'work': return config.canWork;
    case 'marry': return config.canMarry;
    case 'fight': return config.canFight;
    default: return false;
  }
}

/**
 * Рассчитать множитель роста навыков для стадии
 */
export function getSkillGrowthMultiplier(stage: LifeStage): number {
  const config = getAgeStageConfig(stage);
  return config?.skillGrowthMultiplier || 1.0;
}
