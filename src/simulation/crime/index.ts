/**
 * Этап 24: CRIME + LAW
 * Экспорт системы преступлений и закона
 */

export { CrimeLawSystem } from './CrimeLawSystem';
export {
  CrimeType,
  CrimeSeverity,
  WantedStatus,
  EvidenceType,
  EvidenceQuality,
  TrialOutcome,
  InvestigationStage,
  LockType,
  LightingLevel,
} from './CrimeLawTypes';

export type {
  Witness,
  Evidence,
  Rumor,
  Crime,
  Investigation,
  WantedProfile,
  TrialCase,
  CrimeLawConfig,
  CrimeAttemptResult,
  InvestigationResult,
  TrialResult,
  Shop,
  ShopItem,
  ShopRobberyResult,
  RobberyAttemptParams,
  LockType as ILockType,
  LightingLevel as ILightingLevel,
} from './CrimeLawTypes';
