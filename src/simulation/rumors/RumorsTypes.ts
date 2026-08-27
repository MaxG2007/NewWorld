/**
 * ЭТАП 25 — RUMORS + KNOWLEDGE
 * Типы и интерфейсы для системы слухов и знаний
 */

/**
 * Тип события в мире
 */
export interface WorldEvent {
  id: string;
  type: EventType;
  timestamp: number;
  location: string;
  participants: string[]; // IDs участников
  description: string;
  severity: number; // Важность события (0-1)
  tags: string[];
}

export type EventType =
  | 'crime'
  | 'battle'
  | 'trade'
  | 'festival'
  | 'disaster'
  | 'political'
  | 'magic'
  | 'death'
  | 'birth'
  | 'marriage'
  | 'construction'
  | 'other';

/**
 * Свидетель события
 */
export interface Witness {
  id: string;
  eventId: string;
  witnessTime: number;
  /** Насколько хорошо свидетель видел событие (0-1) */
  visibility: number;
  /** Расстояние до события в момент наблюдения */
  distance: number;
  /** Эмоциональное состояние свидетеля */
  emotion: EmotionType;
  /** Политические предпочтения свидетеля */
  politicalBias: PoliticalBias;
  /** Личная надёжность свидетеля (0-1) */
  reliability: number;
  /** Запомненные детали события */
  memory: MemoryFragment[];
}

export type EmotionType =
  | 'neutral'
  | 'fear'
  | 'excitement'
  | 'anger'
  | 'sadness'
  | 'joy'
  | 'surprise'
  | 'disgust';

export type PoliticalBias =
  | 'neutral'
  | 'pro_authority'
  | 'anti_authority'
  | 'pro_guild'
  | 'anti_guild'
  | 'pro_noble'
  | 'anti_noble'
  | 'pro_common'
  | 'religious';

/**
 * Фрагмент памяти о событии
 */
export interface MemoryFragment {
  detail: string;
  confidence: number; // Уверенность в детали (0-1)
  clarity: number; // Чёткость воспоминания (0-1)
  emotionalWeight: number; // Эмоциональная значимость
  lastRecalled: number; // Когда последний раз вспоминалось
  recallCount: number; // Сколько раз вспоминалось
}

/**
 * Слух - версия события, передаваемая между NPC
 */
export interface Rumor {
  id: string;
  eventId: string;
  /** Текущая версия описания события */
  version: string;
  /** Уверенность рассказчика в правдивости (0-1) */
  confidence: number;
  /** Надёжность источника (0-1) */
  sourceReliability: number;
  /** Расстояние от оригинального события */
  distanceFromSource: number;
  /** Сколько раз слух был пересказан */
  repetitionCount: number;
  /** Эмоциональная окраска слуха */
  emotion: EmotionType;
  /** Политическая предвзятость в версии */
  politicalBias: PoliticalBias;
  /** Искажения относительно оригинала */
  distortions: Distortion[];
  /** Когда слух был создан/обновлён */
  timestamp: number;
  /** ID текущего носителя слуха */
  currentCarrier: string;
  /** История передачи слуха */
  transmissionHistory: TransmissionRecord[];
}

/**
 * Тип искажения информации
 */
export interface Distortion {
  type: DistortionType;
  originalDetail?: string;
  distortedDetail?: string;
  magnitude: number; // Степень искажения (0-1)
  cause: DistortionCause;
}

export type DistortionType =
  | 'exaggeration' // Преувеличение
  | 'minimization' // Преуменьшение
  | 'omission' // Упущение деталей
  | 'addition' // Добавление несуществующих деталей
  | 'substitution' // Замена деталей
  | 'reordering' // Изменение последовательности
  | 'conflation' // Смешение с другим событием;

export type DistortionCause =
  | 'poor_visibility'
  | 'emotional_state'
  | 'memory_decay'
  | 'political_bias'
  | 'intentional_lie'
  | 'misunderstanding'
  | 'cultural_filter'
  | 'gossip_amplification';

/**
 * Запись о передаче слуха
 */
export interface TransmissionRecord {
  fromNPC: string;
  toNPC: string;
  timestamp: number;
  context: string;
  confidenceChange: number;
  newDistortions: Distortion[];
}

/**
 * Знание NPC о событии
 */
export interface NPCKnowledge {
  npcId: string;
  eventId: string;
  /** Знает ли NPC об этом событии */
  isKnown: boolean;
  /** Когда узнал */
  learnedAt: number;
  /** Источник знания */
  source: KnowledgeSource;
  /** Уверенность в знании (0-1) */
  confidence: number;
  /** Версия события, которую знает NPC */
  knownVersion: string;
  /** Эмоциональное отношение к событию */
  emotionalResponse: EmotionType;
  /** Политическая интерпретация */
  politicalInterpretation: PoliticalBias;
  /** Когда последний раз вспоминал это знание */
  lastRecalled: number;
  /** Сколько раз вспоминал */
  recallCount: number;
  /** Детали, которые знает NPC */
  knownDetails: Set<string>;
  /** Искажения в понимании NPC */
  distortions: Distortion[];
}

export type KnowledgeSource =
  | 'direct_witness'
  | 'secondhand_rumor'
  | 'official_announcement'
  | 'written_record'
  | 'divine_vision'
  | 'torture_confession'
  | 'magical_revelation';

/**
 * Параметры распространения слухов
 */
export interface RumorPropagationParams {
  /** Базовый коэффициент забывания */
  baseDecayRate: number;
  /** Коэффициент усиления от эмоций */
  emotionAmplification: Record<EmotionType, number>;
  /** Влияние расстояния на точность */
  distanceDecayFactor: number;
  /** Порог уверенности для передачи */
  confidenceThreshold: number;
  /** Максимальное количество искажений */
  maxDistortions: number;
  /** Вероятность преднамеренной лжи */
  intentionalLieChance: number;
  /** Культурные фильтры по регионам */
  culturalFilters: Record<string, CulturalFilter>;
}

export interface CulturalFilter {
  name: string;
  biasAgainst: string[];
  biasFor: string[];
  tabooTopics: string[];
  amplificationThemes: string[];
}

/**
 * Контекст передачи слуха
 */
export interface TellingContext {
  tellerId: string;
  listenerId: string;
  location: string;
  socialSetting: SocialSetting;
  relationship: RelationshipType;
  timePressure: boolean;
  privacy: boolean;
  alcoholInvolved: boolean;
  incentive: number; // Стимул для рассказа/сокрытия
}

export type SocialSetting =
  | 'tavern'
  | 'marketplace'
  | 'temple'
  | 'guild_hall'
  | 'noble_court'
  | 'private_home'
  | 'street'
  | 'battlefield'
  | 'prison';

export type RelationshipType =
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'family'
  | 'rival'
  | 'enemy'
  | 'authority_figure'
  | 'subordinate'
  | 'business_partner';

/**
 * Результат проверки знания NPC
 */
export interface KnowledgeCheckResult {
  knowsAboutEvent: boolean;
  confidence: number;
  version: string;
  distortions: Distortion[];
  canActOnKnowledge: boolean;
  willingToShare: boolean;
  emotionalResponse?: EmotionType;
  politicalInterpretation?: PoliticalBias;
  shareConditions?: ShareCondition[];
}

export interface ShareCondition {
  type: 'payment' | 'favor' | 'threat' | 'friendship' | 'authority';
  value: number;
  description: string;
}

/**
 * Статистика распространения слуха
 */
export interface RumorStatistics {
  totalCarriers: number;
  averageConfidence: number;
  distortionCount: number;
  versionsCount: number;
  spreadRadius: number;
  peakIntensity: number;
  currentIntensity: number;
  estimatedOrigin: string;
  mostCommonEmotion: EmotionType;
  dominantPoliticalBias: PoliticalBias;
}
