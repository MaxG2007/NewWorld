/**
 * Этап 24: CRIME + LAW
 * Система преступлений и закона
 */

import {
  CrimeType,
  CrimeSeverity,
  WantedStatus,
  EvidenceType,
  EvidenceQuality,
  TrialOutcome,
  InvestigationStage,
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
  LockType,
  LightingLevel,
} from './CrimeLawTypes';

/**
 * Базовая конфигурация системы
 */
const DEFAULT_CONFIG: CrimeLawConfig = {
  witnessMemoryDuration: 7 * 24 * 60 * 60 * 1000, // 7 дней
  rumorSpreadRate: 0.1, // 10% за тик
  investigationSpeed: 0.05, // 5% прогресса за тик
  baseBountyRates: {
    [CrimeType.THEFT]: 50,
    [CrimeType.BURGLARY]: 100,
    [CrimeType.ROBBERY]: 200,
    [CrimeType.ASSAULT]: 150,
    [CrimeType.MURDER]: 500,
    [CrimeType.FRAUD]: 300,
    [CrimeType.SMUGGLING]: 250,
    [CrimeType.ILLEGAL_CONSTRUCTION]: 100,
  },
  severityMultipliers: {
    [CrimeSeverity.MINOR]: 1,
    [CrimeSeverity.MODERATE]: 2,
    [CrimeSeverity.SERIOUS]: 4,
    [CrimeSeverity.HEINOUS]: 8,
  },
  evidenceDecayRate: 0.01, // 1% порчи за тик
  wantedStatusThresholds: {
    [WantedStatus.NONE]: 0,
    [WantedStatus.SUSPECT]: 50,
    [WantedStatus.PERSON_OF_INTEREST]: 100,
    [WantedStatus.WANTED]: 250,
    [WantedStatus.DANGEROUS]: 500,
    [WantedStatus.ENEMY_OF_STATE]: 1000,
  },
};

/**
 * Генерация уникального ID
 */
function generateId(): string {
  return `cl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Определение серьёзности преступления по типу
 */
function getCrimeSeverity(type: CrimeType): CrimeSeverity {
  switch (type) {
    case CrimeType.THEFT:
      return CrimeSeverity.MINOR;
    case CrimeType.BURGLARY:
    case CrimeType.SMUGGLING:
    case CrimeType.ILLEGAL_CONSTRUCTION:
      return CrimeSeverity.MODERATE;
    case CrimeType.ROBBERY:
    case CrimeType.ASSAULT:
    case CrimeType.FRAUD:
      return CrimeSeverity.SERIOUS;
    case CrimeType.MURDER:
      return CrimeSeverity.HEINOUS;
    default:
      return CrimeSeverity.MINOR;
  }
}

/**
 * Система преступлений и закона
 */
export class CrimeLawSystem {
  private config: CrimeLawConfig;
  private crimes: Map<string, Crime>;
  private investigations: Map<string, Investigation>;
  private wantedProfiles: Map<string, WantedProfile>;
  private rumors: Map<string, Rumor>;
  private evidence: Map<string, Evidence>;
  private trials: Map<string, TrialCase>;
  private reputation: Map<string, Map<string, number>>; // region -> faction -> reputation
  private shops: Map<string, Shop>; // Магазины для ограблений

  constructor(config?: Partial<CrimeLawConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.crimes = new Map();
    this.investigations = new Map();
    this.wantedProfiles = new Map();
    this.rumors = new Map();
    this.evidence = new Map();
    this.trials = new Map();
    this.reputation = new Map();
    this.shops = new Map();
  }

  /**
   * Совершение преступления
   */
  commitCrime(
    perpetratorId: string,
    type: CrimeType,
    location: string,
    victimIds: string[] = [],
    witnesses: Witness[] = []
  ): CrimeAttemptResult {
    const severity = getCrimeSeverity(type);
    const baseBounty = this.config.baseBountyRates[type];
    const multiplier = this.config.severityMultipliers[severity];
    const bounty = baseBounty * multiplier;

    // Определяем, было ли обнаружено преступление
    const detected = witnesses.length > 0 || Math.random() < 0.3;

    // Генерируем улики
    const evidenceLeft: Evidence[] = [];
    if (detected) {
      // Физические улики
      if (Math.random() < 0.4) {
        evidenceLeft.push({
          id: generateId(),
          type: EvidenceType.PHYSICAL,
          quality: Math.random() < 0.5 ? EvidenceQuality.WEAK : EvidenceQuality.MODERATE,
          description: `Физическая улика, связанная с ${type}`,
          linkedCrimeId: '',
          linkedSuspectId: perpetratorId,
          location,
          timestamp: Date.now(),
          strength: Math.random() * 0.5,
        });
      }
      // Магические следы
      if (Math.random() < 0.2) {
        evidenceLeft.push({
          id: generateId(),
          type: EvidenceType.MAGIC,
          quality: EvidenceQuality.STRONG,
          description: 'Магические следы присутствия',
          linkedCrimeId: '',
          linkedSuspectId: perpetratorId,
          location,
          timestamp: Date.now(),
          strength: Math.random() * 0.3 + 0.7,
        });
      }
    }

    const crime: Crime = {
      id: generateId(),
      type,
      severity,
      perpetratorId,
      victimIds,
      location,
      timestamp: Date.now(),
      witnesses,
      evidence: evidenceLeft,
      reported: detected,
      investigated: detected,
      solved: false,
      bounty,
    };

    // Обновляем ссылки на crimeId в уликах
    evidenceLeft.forEach(e => {
      e.linkedCrimeId = crime.id;
      this.evidence.set(e.id, e);
    });

    this.crimes.set(crime.id, crime);

    // Если обнаружено - создаём расследование
    if (detected) {
      this.startInvestigation(crime);
    }

    // Обновляем статус розыска
    if (detected) {
      this.updateWantedStatus(perpetratorId, crime);
    }

    // Распространяем слухи
    if (detected && severity !== CrimeSeverity.MINOR) {
      this.spreadRumor(perpetratorId, crime);
    }

    const immediateConsequences: string[] = [];
    if (detected) {
      immediateConsequences.push('Преступление замечено');
      if (witnesses.length > 0) {
        immediateConsequences.push(`Есть ${witnesses.length} свидетелей`);
      }
      if (evidenceLeft.length > 0) {
        immediateConsequences.push(`Оставлено ${evidenceLeft.length} улик`);
      }
    }

    return {
      success: true,
      crime,
      detected,
      witnesses,
      evidenceLeft,
      immediateConsequences,
    };
  }

  /**
   * Начало расследования
   */
  private startInvestigation(crime: Crime): void {
    const investigation: Investigation = {
      id: generateId(),
      crimeId: crime.id,
      leadInvestigatorId: `guard_${Math.floor(Math.random() * 1000)}`,
      stage: InvestigationStage.INITIAL,
      evidenceCollected: [],
      suspects: [],
      witnessesInterviewed: [],
      progress: 0,
      startedAt: Date.now(),
      lastUpdated: Date.now(),
      notes: [],
    };

    this.investigations.set(investigation.id, investigation);
    crime.investigated = true;
  }

  /**
   * Обновление статуса розыска
   */
  private updateWantedStatus(perpetratorId: string, crime: Crime): void {
    let profile = this.wantedProfiles.get(perpetratorId);

    if (!profile) {
      profile = {
        targetId: perpetratorId,
        status: WantedStatus.NONE,
        crimes: [],
        bounty: 0,
        knownAssociates: [],
        dangerLevel: 1,
        issuedBy: 'local_authority',
        issuedAt: Date.now(),
        regions: [],
      };
    }

    profile.crimes.push(crime.id);
    profile.bounty += crime.bounty;
    profile.dangerLevel = Math.min(10, profile.dangerLevel + 1);

    // Определяем новый статус
    let newStatus = WantedStatus.NONE;
    for (const [status, threshold] of Object.entries(this.config.wantedStatusThresholds)) {
      if (profile.bounty >= threshold) {
        newStatus = status as WantedStatus;
      }
    }

    profile.status = newStatus;

    this.wantedProfiles.set(perpetratorId, profile);
  }

  /**
   * Распространение слухов
   */
  private spreadRumor(targetId: string, crime: Crime): void {
    const rumor: Rumor = {
      id: generateId(),
      content: `Разыскивается преступник за ${crime.type}`,
      origin: crime.location,
      spread: 0.1,
      credibility: 0.8,
      targetId,
      crimeId: crime.id,
      timestamp: Date.now(),
      regions: [crime.location],
    };

    this.rumors.set(rumor.id, rumor);
  }

  /**
   * Обновление расследований
   */
  updateInvestigations(deltaTime: number): void {
    const speed = this.config.investigationSpeed;

    for (const [, investigation] of this.investigations) {
      if (investigation.stage === InvestigationStage.CLOSED) {
        continue;
      }

      // Увеличиваем прогресс
      investigation.progress += speed * (deltaTime / 1000);
      investigation.lastUpdated = Date.now();

      // Обновляем стадию
      if (investigation.progress < 0.3) {
        investigation.stage = InvestigationStage.INITIAL;
      } else if (investigation.progress < 0.6) {
        investigation.stage = InvestigationStage.ACTIVE;
      } else if (investigation.progress < 0.8) {
        investigation.stage = InvestigationStage.EVIDENCE_GATHERING;
      } else if (investigation.progress < 1.0) {
        investigation.stage = InvestigationStage.ARREST_WARRANT;
      } else {
        // Завершаем расследование
        investigation.stage = InvestigationStage.CLOSED;
        this.completeInvestigation(investigation);
      }

      // Собираем улики автоматически
      if (investigation.stage === InvestigationStage.EVIDENCE_GATHERING) {
        const crime = this.crimes.get(investigation.crimeId);
        if (crime) {
          for (const evidence of crime.evidence) {
            if (!investigation.evidenceCollected.find(e => e.id === evidence.id)) {
              investigation.evidenceCollected.push(evidence);
              investigation.progress += 0.05;
            }
          }
        }
      }
    }
  }

  /**
   * Завершение расследования
   */
  private completeInvestigation(investigation: Investigation): InvestigationResult {
    const crime = this.crimes.get(investigation.crimeId);
    if (!crime) {
      return {
        completed: true,
        solved: false,
        evidenceFound: investigation.evidenceCollected,
        recommendations: ['Преступление не найдено'],
      };
    }

    // Определяем, раскрыто ли преступление
    const totalEvidenceStrength = investigation.evidenceCollected.reduce(
      (sum, e) => sum + e.strength,
      0
    );
    const avgStrength =
      investigation.evidenceCollected.length > 0
        ? totalEvidenceStrength / investigation.evidenceCollected.length
        : 0;

    const solved = avgStrength > 0.5 || investigation.suspects.includes(crime.perpetratorId);

    if (solved) {
      crime.solved = true;
      investigation.suspects.push(crime.perpetratorId);

      // Начинаем судебный процесс
      this.startTrial(crime, investigation);
    }

    return {
      completed: true,
      solved,
      suspectIdentified: solved ? crime.perpetratorId : undefined,
      evidenceFound: investigation.evidenceCollected,
      recommendations: solved
        ? ['Арестовать подозреваемого', 'Передать дело в суд']
        : ['Продолжить поиски улик', 'Опросить новых свидетелей'],
    };
  }

  /**
   * Начало судебного процесса
   */
  private startTrial(crime: Crime, investigation: Investigation): void {
    const trial: TrialCase = {
      id: generateId(),
      defendantId: crime.perpetratorId,
      crimes: [crime.id],
      judgeId: `judge_${Math.floor(Math.random() * 100)}`,
      prosecutorId: `prosecutor_${Math.floor(Math.random() * 50)}`,
      defenderId: Math.random() < 0.5 ? `defender_${Math.floor(Math.random() * 50)}` : undefined,
      evidence: investigation.evidenceCollected,
      witnesses: crime.witnesses,
      heldAt: Date.now() + 24 * 60 * 60 * 1000, // Через 1 день
      location: 'court_house',
      public: crime.severity !== CrimeSeverity.MINOR,
    };

    this.trials.set(trial.id, trial);
  }

  /**
   * Проведение суда
   */
  conductTrial(trialId: string): TrialResult {
    const trial = this.trials.get(trialId);
    if (!trial) {
      return {
        completed: false,
        outcome: TrialOutcome.ACQUITTED,
        reputationChange: 0,
        fines: 0,
      };
    }

    // Вычисляем силу обвинения
    const evidenceStrength = trial.evidence.reduce((sum, e) => sum + e.strength, 0);
    const witnessCredibility = trial.witnesses.reduce(
      (sum, w) => sum + w.reliability * w.memory,
      0
    );
    const accusationStrength = (evidenceStrength + witnessCredibility) / 2;

    // Определяем исход
    let outcome: TrialOutcome;
    let sentence = '';
    let fines = 0;
    let imprisonmentDays = 0;
    let reputationChange = 0;

    const crime = this.crimes.get(trial.crimes[0]);
    const severity = crime?.severity || CrimeSeverity.MINOR;

    if (accusationStrength > 0.7) {
      // Виновен
      switch (severity) {
        case CrimeSeverity.MINOR:
          outcome = TrialOutcome.FINED;
          fines = 100;
          sentence = `Штраф ${fines} золотых`;
          reputationChange = -10;
          break;
        case CrimeSeverity.MODERATE:
          outcome = TrialOutcome.IMPRISONED;
          imprisonmentDays = 30;
          sentence = `${imprisonmentDays} дней тюрьмы`;
          reputationChange = -30;
          break;
        case CrimeSeverity.SERIOUS:
          outcome = TrialOutcome.IMPRISONED;
          imprisonmentDays = 180;
          sentence = `${imprisonmentDays} дней тюрьмы`;
          reputationChange = -50;
          break;
        case CrimeSeverity.HEINOUS:
          outcome = Math.random() < 0.5 ? TrialOutcome.EXECUTED : TrialOutcome.EXILED;
          sentence = outcome === TrialOutcome.EXECUTED ? 'Казнь' : 'Вечное изгнание';
          reputationChange = -100;
          break;
        default:
          outcome = TrialOutcome.COMMUNITY_SERVICE;
          sentence = 'Общественные работы';
          reputationChange = -20;
      }
    } else if (accusationStrength > 0.4) {
      // Частично виновен
      outcome = TrialOutcome.COMMUNITY_SERVICE;
      sentence = 'Общественные работы';
      fines = 50;
      reputationChange = -15;
    } else {
      // Оправдан
      outcome = TrialOutcome.ACQUITTED;
      sentence = 'Невиновен';
      reputationChange = 5;
    }

    trial.outcome = outcome;
    trial.sentence = sentence;

    // Обновляем репутацию
    if (crime) {
      this.updateReputation(crime.location, 'authority', reputationChange);
    }

    return {
      completed: true,
      outcome,
      sentence,
      reputationChange,
      fines,
      imprisonmentDays: imprisonmentDays || undefined,
    };
  }

  /**
   * Обновление репутации
   */
  updateReputation(region: string, faction: string, change: number): void {
    if (!this.reputation.has(region)) {
      this.reputation.set(region, new Map());
    }
    const factionRep = this.reputation.get(region)!;
    factionRep.set(faction, (factionRep.get(faction) || 0) + change);
  }

  /**
   * Получение репутации
   */
  getReputation(region: string, faction: string): number {
    return this.reputation.get(region)?.get(faction) || 0;
  }

  /**
   * Получение статуса розыска
   */
  getWantedStatus(targetId: string): WantedProfile | undefined {
    return this.wantedProfiles.get(targetId);
  }

  /**
   * Арест разыскиваемого
   */
  arrest(targetId: string): boolean {
    const profile = this.wantedProfiles.get(targetId);
    if (!profile || profile.status === WantedStatus.NONE) {
      return false;
    }

    // Находим все нераскрытые преступления
    for (const crimeId of profile.crimes) {
      const crime = this.crimes.get(crimeId);
      if (crime && !crime.solved) {
        crime.solved = true;
      }
    }

    // Очищаем статус
    profile.status = WantedStatus.NONE;
    profile.bounty = 0;
    this.wantedProfiles.set(targetId, profile);

    return true;
  }

  /**
   * Побег из тюрьмы
   */
  escapePrison(targetId: string): boolean {
    const success = Math.random() < 0.3; // 30% шанс успеха
    if (success) {
      // Восстанавливаем статус розыска
      const profile = this.wantedProfiles.get(targetId);
      if (profile) {
        profile.status = WantedStatus.DANGEROUS;
        profile.dangerLevel = Math.min(10, profile.dangerLevel + 2);
        this.wantedProfiles.set(targetId, profile);
      }
    }
    return success;
  }

  /**
   * Очистка имени (снятие обвинений)
   */
  clearName(targetId: string, method: 'pay_fine' | 'serve_time' | 'mission'): boolean {
    const profile = this.wantedProfiles.get(targetId);
    if (!profile) {
      return false;
    }

    // Проверяем, есть ли активный статус розыска
    if (profile.status === WantedStatus.NONE) {
      return false;
    }

    if (method === 'pay_fine' && profile.bounty <= 500) {
      profile.status = WantedStatus.NONE;
      profile.bounty = 0;
      this.wantedProfiles.set(targetId, profile);
      return true;
    }

    if (method === 'serve_time') {
      profile.status = WantedStatus.NONE;
      profile.bounty = 0;
      this.wantedProfiles.set(targetId, profile);
      return true;
    }

    if (method === 'mission') {
      profile.status = WantedStatus.PERSON_OF_INTEREST;
      profile.bounty = Math.floor(profile.bounty / 2);
      this.wantedProfiles.set(targetId, profile);
      return true;
    }

    return false;
  }

  /**
   * Получение всех преступлений
   */
  getAllCrimes(): Crime[] {
    return Array.from(this.crimes.values());
  }

  /**
   * Получение преступления по ID
   */
  getCrime(crimeId: string): Crime | undefined {
    return this.crimes.get(crimeId);
  }

  /**
   * Получение всех расследований
   */
  getAllInvestigations(): Investigation[] {
    return Array.from(this.investigations.values());
  }

  /**
   * Получение всех слухов
   */
  getAllRumors(): Rumor[] {
    return Array.from(this.rumors.values());
  }

  /**
   * Очистка старых данных
   */
  cleanup(maxAge: number): void {
    const now = Date.now();

    // Удаляем старые слухи
    for (const [id, rumor] of this.rumors) {
      if (now - rumor.timestamp > maxAge) {
        this.rumors.delete(id);
      }
    }

    // Удаляем завершённые расследования
    for (const [id, investigation] of this.investigations) {
      if (
        investigation.stage === InvestigationStage.CLOSED &&
        now - investigation.lastUpdated > maxAge
      ) {
        this.investigations.delete(id);
      }
    }
  }

  /**
   * Регистрация магазина
   */
  registerShop(shop: Shop): void {
    this.shops.set(shop.id, shop);
  }

  /**
   * Получение магазина по ID
   */
  getShop(shopId: string): Shop | undefined {
    return this.shops.get(shopId);
  }

  /**
   * Проверка, открыт ли магазин в данное время
   */
  isShopOpen(shop: Shop, timeOfDay: number): boolean {
    if (!shop.isOpen) return false;
    const { start, end } = shop.openTime;
    if (start <= end) {
      return timeOfDay >= start && timeOfDay < end;
    } else {
      // Работает через полночь (например, 22:00 - 06:00)
      return timeOfDay >= start || timeOfDay < end;
    }
  }

  /**
   * Расчёт множителя освещения
   */
  private getLightingMultiplier(lighting: LightingLevel): number {
    switch (lighting) {
      case LightingLevel.DARK:
        return 0.3; // Легче скрыться
      case LightingLevel.DIM:
        return 0.6;
      case LightingLevel.NORMAL:
        return 1.0;
      case LightingLevel.BRIGHT:
        return 1.5; // Сложнее скрыться
      default:
        return 1.0;
    }
  }

  /**
   * Расчёт сложности замка
   */
  private getLockDifficulty(lockType: LockType): number {
    switch (lockType) {
      case LockType.NONE:
        return 0;
      case LockType.SIMPLE:
        return 20;
      case LockType.AVERAGE:
        return 40;
      case LockType.COMPLEX:
        return 60;
      case LockType.MAGIC:
        return 80;
      case LockType.MASTERWORK:
        return 95;
      default:
        return 20;
    }
  }

  /**
   * Ограбление магазина
   */
  robShop(params: RobberyAttemptParams): ShopRobberyResult {
    const shop = this.shops.get(params.shopId);
    if (!shop) {
      return {
        success: false,
        entered: false,
        lockPicked: false,
        guardsAlerted: false,
        witnessesCount: 0,
        itemsStolen: [],
        totalValue: 0,
        evidenceLeft: [],
        timeSpent: 0,
        escapeSuccessful: false,
        consequences: ['Магазин не найден'],
      };
    }

    const consequences: string[] = [];
    let timeSpent = 0;
    let evidenceLeft: Evidence[] = [];

    // 1. Проверка времени работы магазина
    const isOpen = this.isShopOpen(shop, params.timeOfDay);
    if (isOpen) {
      consequences.push('Магазин открыт, больше свидетелей');
    } else {
      consequences.push('Магазин закрыт, нужно взломать замок');
    }

    // 2. Взлом замка (если магазин закрыт)
    let lockPicked = false;
    let entered = false;
    if (!isOpen) {
      const lockDifficulty = this.getLockDifficulty(shop.lockType);
      const toolBonus = params.useTools ? 20 : 0;
      const roll = Math.random() * 100;
      const successChance = roll + toolBonus;

      timeSpent += Math.floor(shop.lockType === LockType.NONE ? 1 : 5 + lockDifficulty / 10);

      if (successChance >= lockDifficulty) {
        lockPicked = true;
        entered = true;
        consequences.push('Замок успешно взломан');
      } else {
        // Неудачный взлом - шум!
        entered = false;
        consequences.push('Не удалось взломать замок');
        // Шум может привлечь охрану или свидетелей
        if (Math.random() < 0.5) {
          return {
            success: false,
            entered: false,
            lockPicked: false,
            guardsAlerted: true,
            witnessesCount: Math.floor(Math.random() * 3),
            itemsStolen: [],
            totalValue: 0,
            evidenceLeft: [{
              id: generateId(),
              type: EvidenceType.PHYSICAL,
              quality: EvidenceQuality.STRONG,
              description: 'Следы попытки взлома',
              linkedCrimeId: '',
              linkedSuspectId: params.perpetratorId,
              location: shop.location,
              timestamp: Date.now(),
              strength: 0.7,
            }],
            timeSpent,
            escapeSuccessful: Math.random() < 0.7,
            consequences: [...consequences, 'Шум привлёк внимание'],
          };
        }
      }
    } else {
      entered = true;
    }

    if (!entered) {
      return {
        success: false,
        entered: false,
        lockPicked: false,
        guardsAlerted: false,
        witnessesCount: 0,
        itemsStolen: [],
        totalValue: 0,
        evidenceLeft,
        timeSpent,
        escapeSuccessful: false,
        consequences,
      };
    }

    // 3. Охрана и свидетели
    let guardsAlerted = false;
    let witnessesCount = 0;

    if (isOpen) {
      // Днём больше свидетелей
      witnessesCount = Math.floor(Math.random() * 5) + 2;
      if (shop.guardCount > 0) {
        if (params.silenceGuards) {
          // Попытка обезвредить охрану
          if (Math.random() < 0.6) {
            consequences.push('Охрана обезврежена тихо');
          } else {
            guardsAlerted = true;
            consequences.push('Охрана подняла тревогу!');
          }
        } else {
          guardsAlerted = true;
          consequences.push(`Охрана (${shop.guardCount} чел.) заметила ограбление`);
        }
      }
    } else {
      // Ночью меньше свидетелей, но есть охрана
      witnessesCount = Math.floor(Math.random() * 2);
      if (shop.guardCount > 0 && Math.random() < 0.5) {
        guardsAlerted = true;
        consequences.push('Ночная охрана обнаружила вторжение');
      }
    }

    // 4. Освещение влияет на обнаружение
    const lightingMult = this.getLightingMultiplier(shop.lightingLevel);
    if (lightingMult > 1.0 && Math.random() < 0.3 * lightingMult) {
      witnessesCount += 1;
      consequences.push('Яркое освещение помогло заметить преступника');
    }

    // 5. Кража предметов
    const itemsStolen: ShopItem[] = [];
    let totalValue = 0;

    if (params.targetItems && params.targetItems.length > 0) {
      // Целенаправленная кража конкретных предметов
      for (const itemId of params.targetItems) {
        const item = shop.valuableItems.find(i => i.id === itemId);
        if (item && !item.isStolen) {
          itemsStolen.push({ ...item, isStolen: true });
          totalValue += item.value;
        }
      }
    } else {
      // Случайная кража ценных предметов
      const availableItems = shop.valuableItems.filter(i => !i.isStolen);
      const stealCount = Math.min(
        availableItems.length,
        Math.floor(Math.random() * 3) + 1
      );

      for (let i = 0; i < stealCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const item = availableItems[randomIndex];
        if (item) {
          itemsStolen.push({ ...item, isStolen: true });
          totalValue += item.value;
          availableItems.splice(randomIndex, 1);
        }
      }
    }

    // Попытка вскрыть сейф (если есть доступ)
    if (Math.random() < 0.3 && shop.safeLocation) {
      const safeDifficulty = this.getLockDifficulty(shop.safeLockType);
      const safeRoll = Math.random() * 100 + (params.useTools ? 20 : 0);
      if (safeRoll >= safeDifficulty) {
        timeSpent += 10;
        // Добавляем стоимость из сейфа (условно 50-200 золотых)
        const safeValue = Math.floor(Math.random() * 150) + 50;
        totalValue += safeValue;
        consequences.push(`Взломан сейф в ${shop.safeLocation}, найдено ${safeValue} золотых`);
      } else {
        consequences.push('Не удалось взломать сейф');
      }
    }

    timeSpent += Math.floor(itemsStolen.length * 2); // Время на сбор предметов

    // 6. Генерация улик
    if (guardsAlerted || witnessesCount > 0) {
      // Физические улики
      if (Math.random() < 0.5) {
        evidenceLeft.push({
          id: generateId(),
          type: EvidenceType.PHYSICAL,
          quality: witnessesCount > 2 ? EvidenceQuality.STRONG : EvidenceQuality.MODERATE,
          description: `Улики ограбления магазина ${shop.name}`,
          linkedCrimeId: '',
          linkedSuspectId: params.perpetratorId,
          location: shop.location,
          timestamp: Date.now(),
          strength: Math.min(0.9, 0.3 + witnessesCount * 0.1),
        });
      }

      // Следы взлома
      if (!isOpen && lockPicked) {
        evidenceLeft.push({
          id: generateId(),
          type: EvidenceType.FORENSIC,
          quality: EvidenceQuality.MODERATE,
          description: 'Следы профессионального взлома замка',
          linkedCrimeId: '',
          linkedSuspectId: params.perpetratorId,
          location: `${shop.location}_door`,
          timestamp: Date.now(),
          strength: 0.5,
        });
      }

      // Показания свидетелей
      if (witnessesCount > 0) {
        evidenceLeft.push({
          id: generateId(),
          type: EvidenceType.WITNESS_TESTIMONY,
          quality: witnessesCount >= 3 ? EvidenceQuality.CONCLUSIVE : EvidenceQuality.MODERATE,
          description: `Показания ${witnessesCount} свидетелей ограбления`,
          linkedCrimeId: '',
          linkedSuspectId: params.perpetratorId,
          location: shop.location,
          timestamp: Date.now(),
          strength: Math.min(0.95, 0.4 + witnessesCount * 0.15),
        });
      }
    }

    // 7. Побег
    let escapeSuccessful = true;
    if (guardsAlerted) {
      const escapeChance = params.escapeRoute === 'back' && shop.backEntrance ? 0.8 :
                          params.escapeRoute === 'roof' ? 0.6 :
                          params.escapeRoute === 'window' ? 0.7 : 0.5;
      escapeSuccessful = Math.random() < escapeChance;
      if (!escapeSuccessful) {
        consequences.push('Побег не удался, окружён охраной!');
      } else {
        consequences.push(`Успешный побег через ${params.escapeRoute}`);
      }
    }

    // 8. Создание преступления (если обнаружено)
    let crime: Crime | undefined;
    const detected = guardsAlerted || witnessesCount > 0 || !escapeSuccessful;

    if (detected) {
      const witnesses: Witness[] = [];
      for (let i = 0; i < witnessesCount; i++) {
        witnesses.push({
          id: generateId(),
          npcId: `witness_${Date.now()}_${i}`,
          reliability: 0.5 + Math.random() * 0.5,
          memory: 0.4 + Math.random() * 0.6,
          courage: Math.random(),
          isHostile: false,
          location: shop.location,
          timestamp: Date.now(),
        });
      }

      const crimeResult = this.commitCrime(
        params.perpetratorId,
        isOpen ? CrimeType.ROBBERY : CrimeType.BURGLARY,
        shop.location,
        [shop.ownerNpcId],
        witnesses
      );
      crime = crimeResult.crime;

      // Добавляем информацию об украденных предметах
      if (crime) {
        crime.evidence.push(...evidenceLeft);
        consequences.push(`Совершено преступление: ${isOpen ? 'Грабёж' : 'Взлом'}`);
        consequences.push(`Украдено предметов на сумму: ${totalValue} золотых`);
      }
    } else {
      consequences.push('Ограбление прошло незамеченным');
    }

    return {
      success: escapeSuccessful && (itemsStolen.length > 0 || totalValue > 0),
      entered,
      lockPicked,
      guardsAlerted,
      witnessesCount,
      itemsStolen,
      totalValue,
      evidenceLeft,
      timeSpent,
      escapeSuccessful,
      crime,
      consequences,
    };
  }

  /**
   * Получение всех магазинов
   */
  getAllShops(): Shop[] {
    return Array.from(this.shops.values());
  }
}

export default CrimeLawSystem;
