/**
 * Этап 24: CRIME + LAW
 * Типы и интерфейсы системы преступлений и закона
 */

/**
 * Типы преступлений
 */
export enum CrimeType {
  THEFT = 'theft', // Кража
  BURGLARY = 'burglary', // Взлом
  ROBBERY = 'robbery', // Грабёж
  ASSAULT = 'assault', // Нападение
  MURDER = 'murder', // Убийство
  FRAUD = 'fraud', // Мошенничество
  SMUGGLING = 'smuggling', // Контрабанда
  ILLEGAL_CONSTRUCTION = 'illegal_construction', // Незаконное строительство
}

/**
 * Серьёзность преступления
 */
export enum CrimeSeverity {
  MINOR = 'minor', // Незначительное (штраф)
  MODERATE = 'moderate', // Среднее (тюрьма)
  SERIOUS = 'serious', // Серьёзное (длительная тюрьма)
  HEINOUS = 'heinous', // Особо тяжкое (казнь/изгнание)
}

/**
 * Статус разыскиваемого
 */
export enum WantedStatus {
  NONE = 'none', // Не разыскивается
  SUSPECT = 'suspect', // Подозреваемый
  PERSON_OF_INTEREST = 'person_of_interest', // Лицо, представляющее интерес
  WANTED = 'wanted', // Разыскивается
  DANGEROUS = 'dangerous', // Опасный преступник
  ENEMY_OF_STATE = 'enemy_of_state', // Враг государства
}

/**
 * Типы улик
 */
export enum EvidenceType {
  PHYSICAL = 'physical', // Физическая улика (оружие, украденное)
  WITNESS_TESTIMONY = 'witness_testimony', // Показания свидетеля
  FORENSIC = 'forensic', // Судебно-медицинская (отпечатки, следы)
  DOCUMENTARY = 'documentary', // Документы (подделки, записи)
  MAGIC = 'magic', // Магические следы
}

/**
 * Качество улики
 */
export enum EvidenceQuality {
  WEAK = 'weak', // Слабая (косвенная)
  MODERATE = 'moderate', // Средняя
  STRONG = 'strong', // Сильная (прямая)
  CONCLUSIVE = 'conclusive', // Неопровержимая
}

/**
 * Исход суда
 */
export enum TrialOutcome {
  ACQUITTED = 'acquitted', // Оправдан
  FINED = 'fined', // Штраф
  IMPRISONED = 'imprisoned', // Тюремное заключение
  EXILED = 'exiled', // Изгнание
  EXECUTED = 'executed', // Казнь
  COMMUNITY_SERVICE = 'community_service', // Общественные работы
}

/**
 * Стадия расследования
 */
export enum InvestigationStage {
  NONE = 'none', // Нет расследования
  INITIAL = 'initial', // Начальная стадия
  ACTIVE = 'active', // Активное расследование
  EVIDENCE_GATHERING = 'evidence_gathering', // Сбор улик
  ARREST_WARRANT = 'arrest_warrant', // Ордер на арест
  CLOSED = 'closed', // Закрыто
}

/**
 * Интерфейс свидетеля
 */
export interface Witness {
  id: string;
  npcId: string; // ID NPC-свидетеля
  reliability: number; // Надёжность (0-1)
  memory: number; // Память (0-1)
  courage: number; // Храбрость (0-1)
  testimony?: string; // Показания
  isHostile: boolean; // Враждебен ли свидетель
  location: string; // Место нахождения
  timestamp: number; // Время свидетельства
}

/**
 * Интерфейс улики
 */
export interface Evidence {
  id: string;
  type: EvidenceType;
  quality: EvidenceQuality;
  description: string;
  linkedCrimeId: string; // ID связанного преступления
  linkedSuspectId?: string; // ID подозреваемого
  location: string; // Место обнаружения
  discoveredBy?: string; // Кто обнаружил
  timestamp: number; // Время обнаружения
  strength: number; // Сила улики (0-1)
}

/**
 * Интерфейс слуха
 */
export interface Rumor {
  id: string;
  content: string; // Содержание слуха
  origin: string; // Источник
  spread: number; // Распространённость (0-1)
  credibility: number; // Достоверность (0-1)
  targetId: string; // Цель слуха (игрок/NPC)
  crimeId?: string; // Связанное преступление
  timestamp: number; // Время появления
  regions: string[]; // Регионы распространения
}

/**
 * Интерфейс преступления
 */
export interface Crime {
  id: string;
  type: CrimeType;
  severity: CrimeSeverity;
  perpetratorId: string; // ID преступника
  victimIds: string[]; // ID жертв
  location: string; // Место преступления
  timestamp: number; // Время совершения
  witnesses: Witness[]; // Список свидетелей
  evidence: Evidence[]; // Улики
  reported: boolean; // Заявлено ли властям
  investigated: boolean; // Расследуется ли
  solved: boolean; // Раскрыто ли
  bounty: number; // Награда за поимку
}

/**
 * Интерфейс расследования
 */
export interface Investigation {
  id: string;
  crimeId: string; // ID расследуемого преступления
  leadInvestigatorId: string; // ID главного следователя
  stage: InvestigationStage;
  evidenceCollected: Evidence[];
  suspects: string[]; // ID подозреваемых
  witnessesInterviewed: string[]; // ID опрошенных свидетелей
  progress: number; // Прогресс расследования (0-1)
  startedAt: number; // Время начала
  lastUpdated: number; // Последнее обновление
  notes: string[]; // Заметки следователя
}

/**
 * Интерфейс статуса розыска
 */
export interface WantedProfile {
  targetId: string; // ID разыскиваемого
  status: WantedStatus;
  crimes: string[]; // ID совершённых преступлений
  bounty: number; // Общая награда
  lastKnownLocation?: string; // Последнее известное местоположение
  knownAssociates: string[]; // Известные сообщники
  dangerLevel: number; // Уровень опасности (1-10)
  issuedBy: string; // Кто выдал ордер
  issuedAt: number; // Время выдачи
  expiresAt?: number; // Время истечения (если есть)
  regions: string[]; // Регионы действия ордера
}

/**
 * Интерфейс судебного дела
 */
export interface TrialCase {
  id: string;
  defendantId: string; // ID обвиняемого
  crimes: string[]; // ID преступлений
  judgeId: string; // ID судьи
  prosecutorId?: string; // ID прокурора
  defenderId?: string; // ID защитника
  evidence: Evidence[];
  witnesses: Witness[];
  outcome?: TrialOutcome; // Исход
  sentence?: string; // Приговор
  heldAt: number; // Время проведения
  location: string; // Место проведения
  public: boolean; // Публичное ли
}

/**
 * Конфигурация системы преступлений и закона
 */
export interface CrimeLawConfig {
  witnessMemoryDuration: number; // Длительность памяти свидетелей (мс)
  rumorSpreadRate: number; // Скорость распространения слухов
  investigationSpeed: number; // Скорость расследований
  baseBountyRates: Record<CrimeType, number>; // Базовые награды за преступления
  severityMultipliers: Record<CrimeSeverity, number>; // Множители серьёзности
  evidenceDecayRate: number; // Скорость порчи улик
  wantedStatusThresholds: Record<WantedStatus, number>; // Пороги статусов розыска
}

/**
 * Типы замков
 */
export enum LockType {
  NONE = 'none', // Нет замка
  SIMPLE = 'simple', // Простой замок
  AVERAGE = 'average', // Средний замок
  COMPLEX = 'complex', // Сложный замок
  MAGIC = 'magic', // Магический замок
  MASTERWORK = 'masterwork', // Шедевральный замок
}

/**
 * Уровень освещения
 */
export enum LightingLevel {
  DARK = 'dark', // Темно (ночь, подвал)
  DIM = 'dim', // Тускло (сумерки, свечи)
  NORMAL = 'normal', // Нормально (день, факелы)
  BRIGHT = 'bright', // Ярко (солнце, магический свет)
}

/**
 * Интерфейс магазина/торговой точки
 */
export interface Shop {
  id: string;
  name: string;
  location: string;
  ownerNpcId: string; // ID владельца
  isOpen: boolean; // Открыт ли магазин
  openTime: { start: number; end: number }; // Время работы (часы 0-23)
  lockType: LockType; // Тип замка
  guardCount: number; // Количество охраны
  lightingLevel: LightingLevel; // Уровень освещения
  valuableItems: ShopItem[]; // Ценные предметы
  alarmSystem: boolean; // Есть ли сигнализация
  backEntrance: boolean; // Есть ли чёрный вход
  safeLocation: string; // Расположение сейфа
  safeLockType: LockType; // Тип замка сейфа
}

/**
 * Предмет в магазине
 */
export interface ShopItem {
  id: string;
  name: string;
  value: number; // Стоимость
  weight: number; // Вес
  category: string; // Категория
  isStolen: boolean; // Украден ли
  unique: boolean; // Уникальный ли
}

/**
 * Результат ограбления магазина
 */
export interface ShopRobberyResult {
  success: boolean; // Успешно ли ограбление
  entered: boolean; // Удалось ли войти
  lockPicked: boolean; // Взломан ли замок
  guardsAlerted: boolean; // Поднята ли тревога охраной
  witnessesCount: number; // Количество свидетелей
  itemsStolen: ShopItem[]; // Украденные предметы
  totalValue: number; // Общая стоимость украденного
  evidenceLeft: Evidence[]; // Оставленные улики
  timeSpent: number; // Потраченное время (минуты)
  escapeSuccessful: boolean; // Удалось ли скрыться
  crime?: Crime; // Совершённое преступление
  consequences: string[]; // Последствия
}

/**
 * Параметры для попытки ограбления
 */
export interface RobberyAttemptParams {
  shopId: string; // ID магазина
  perpetratorId: string; // ID преступника
  timeOfDay: number; // Время суток (0-23)
  useTools: boolean; // Использует ли инструменты
  hasDisguise: boolean; // Есть ли маскировка
  silenceGuards: boolean; // Пытается ли обезвредить охрану
  targetItems?: string[]; // Целевые предметы (ID)
  escapeRoute: 'front' | 'back' | 'window' | 'roof'; // Маршрут побега
}

/**
 * Результат попытки преступления
 */
export interface CrimeAttemptResult {
  success: boolean; // Успешно ли совершено
  crime?: Crime; // Совершённое преступление
  detected: boolean; // Обнаружено ли
  witnesses: Witness[]; // Свидетели
  evidenceLeft: Evidence[]; // Оставленные улики
  immediateConsequences: string[]; // Немедленные последствия
}

/**
 * Результат расследования
 */
export interface InvestigationResult {
  completed: boolean; // Завершено ли
  solved: boolean; // Раскрыто ли
  suspectIdentified?: string; // Выявленный подозреваемый
  evidenceFound: Evidence[]; // Найденные улики
  recommendations: string[]; // Рекомендации следователя
}

/**
 * Результат суда
 */
export interface TrialResult {
  completed: boolean; // Завершён ли суд
  outcome: TrialOutcome; // Исход
  sentence?: string; // Приговор
  reputationChange: number; // Изменение репутации
  fines: number; // Штрафы
  imprisonmentDays?: number; // Дни заключения
}
