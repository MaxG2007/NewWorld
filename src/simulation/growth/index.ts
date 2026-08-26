/**
 * Этап 14: CHILDHOOD + GROWTH
 * 
 * Экспорт всех модулей системы роста персонажа
 */

export {
  LifeStage,
  type AgeStageConfig,
  BASE_AGE_STAGES,
  getLifeStage,
  getAgeStageConfig,
  canPerformAction,
  getSkillGrowthMultiplier,
} from './AgeStages';

export {
  ChildhoodEventType,
  type ChildhoodEvent,
  CHILDHOOD_EVENTS,
  getEventById,
  getAvailableEvents,
} from './ChildhoodEvents';

export {
  type ChildhoodSkills,
  BASE_SKILLS,
  SkillDevelopment,
  calculateStatusBonuses,
  calculateBiomeBonuses,
  calculateRaceBonuses,
} from './SkillDevelopment';

export {
  type GrowthConfig,
  type ChildhoodMemory,
  type GrowthResult,
  GrowthSimulator,
} from './GrowthSimulator';
