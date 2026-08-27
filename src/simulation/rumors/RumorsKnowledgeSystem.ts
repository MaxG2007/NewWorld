/**
 * ЭТАП 25 — RUMORS + KNOWLEDGE
 * Система слухов и знаний NPC
 * 
 * Информационная модель мира:
 * - NPC знает только то, что может знать
 * - Слухи распространяются с искажениями
 * - Одно событие может иметь множество версий
 */

import {
  WorldEvent,
  Witness,
  Rumor,
  Distortion,
  DistortionType,
  DistortionCause,
  TransmissionRecord,
  NPCKnowledge,
  EmotionType,
  PoliticalBias,
  MemoryFragment,
  TellingContext,
  SocialSetting,
  RelationshipType,
  KnowledgeCheckResult,
  ShareCondition,
  RumorStatistics,
  CulturalFilter,
  RumorPropagationParams,
} from './RumorsTypes';

export class RumorsKnowledgeSystem {
  private events: Map<string, WorldEvent> = new Map();
  private witnesses: Map<string, Witness[]> = new Map(); // eventId -> witnesses
  private rumors: Map<string, Rumor[]> = new Map(); // eventId -> rumors (multiple versions)
  private npcKnowledge: Map<string, Map<string, NPCKnowledge>> = new Map(); // npcId -> (eventId -> knowledge)
  private rumorCarriers: Map<string, Set<string>> = new Map(); // rumorId -> carrierIds
  
  private params: RumorPropagationParams;
  private currentTime: number = 0;
  
  constructor(params?: Partial<RumorPropagationParams>) {
    this.params = {
      baseDecayRate: 0.01,
      emotionAmplification: {
        neutral: 1.0,
        fear: 1.8,
        excitement: 1.6,
        anger: 1.7,
        sadness: 1.3,
        joy: 1.5,
        surprise: 1.4,
        disgust: 1.5,
      },
      distanceDecayFactor: 0.05,
      confidenceThreshold: 0.3,
      maxDistortions: 10,
      intentionalLieChance: 0.1,
      culturalFilters: {},
      ...params,
    };
  }
  
  /**
   * Регистрация события в мире
   */
  registerEvent(event: WorldEvent): void {
    this.events.set(event.id, event);
    this.witnesses.set(event.id, []);
    this.rumors.set(event.id, []);
  }
  
  /**
   * Добавление свидетеля события
   */
  addWitness(eventId: string, witness: Witness): void {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }
    
    // Создаём фрагменты памяти на основе видимости и расстояния
    witness.memory = this.createMemoryFragments(event, witness);
    
    const eventWitnesses = this.witnesses.get(eventId) || [];
    eventWitnesses.push(witness);
    this.witnesses.set(eventId, eventWitnesses);
    
    // Свидетель сразу получает знание о событии
    this.addDirectKnowledge(witness.id, eventId, event, witness);
  }
  
  /**
   * Создание фрагментов памяти на основе параметров свидетеля
   */
  private createMemoryFragments(event: WorldEvent, witness: Witness): MemoryFragment[] {
    const fragments: MemoryFragment[] = [];
    
    // Базовая чёткость зависит от видимости и расстояния
    const baseClarity = witness.visibility * (1 - Math.min(witness.distance / 100, 0.8));
    
    // Разбиваем описание события на детали
    const details = event.description.split(/[.,;]/).filter(d => d.trim().length > 0);
    
    for (const detail of details) {
      const emotionalWeight = this.calculateEmotionalWeight(detail, witness.emotion);
      const clarity = baseClarity * (0.8 + Math.random() * 0.4);
      
      fragments.push({
        detail: detail.trim(),
        confidence: clarity * witness.reliability,
        clarity,
        emotionalWeight,
        lastRecalled: this.currentTime,
        recallCount: 0,
      });
    }
    
    return fragments;
  }
  
  private calculateEmotionalWeight(detail: string, emotion: EmotionType): number {
    const threatWords = ['attack', 'kill', 'danger', 'blood', 'death', 'fight'];
    const positiveWords = ['celebration', 'gift', 'joy', 'victory', 'success'];
    const lowerDetail = detail.toLowerCase();
    
    let weight = 0.5;
    
    if (threatWords.some(w => lowerDetail.includes(w))) {
      weight = emotion === 'fear' ? 0.9 : 0.7;
    } else if (positiveWords.some(w => lowerDetail.includes(w))) {
      weight = emotion === 'joy' || emotion === 'excitement' ? 0.9 : 0.6;
    }
    
    return weight * this.params.emotionAmplification[emotion];
  }
  
  /**
   * Добавление прямого знания свидетелю
   */
  private addDirectKnowledge(
    npcId: string,
    eventId: string,
    event: WorldEvent,
    witness: Witness
  ): void {
    const knownDetails = new Set<string>();
    witness.memory.forEach(m => {
      if (m.confidence >= 0.5) {
        knownDetails.add(m.detail);
      }
    });
    
    const knowledge: NPCKnowledge = {
      npcId,
      eventId,
      isKnown: true,
      learnedAt: this.currentTime,
      source: 'direct_witness',
      confidence: witness.reliability * witness.visibility,
      knownVersion: event.description,
      emotionalResponse: witness.emotion,
      politicalInterpretation: witness.politicalBias,
      lastRecalled: this.currentTime,
      recallCount: 0,
      knownDetails,
      distortions: [],
    };
    
    this.saveNPCKnowledge(npcId, eventId, knowledge);
  }
  
  /**
   * Передача слуха от одного NPC к другому
   */
  tellRumor(tellerId: string, listenerId: string, eventId: string, context: TellingContext): boolean {
    const tellerKnowledge = this.getNPCKnowledge(tellerId, eventId);
    if (!tellerKnowledge || !tellerKnowledge.isKnown) {
      return false; // Рассказчик не знает о событии
    }
    
    // Проверяем, готов ли NPC делиться знанием
    const shareCheck = this.checkWillingnessToShare(tellerKnowledge, context);
    if (!shareCheck.willingToShare) {
      return false;
    }
    
    // Получаем или создаём слух
    let rumor = this.findRumorByCarrier(tellerId, eventId);
    if (!rumor) {
      rumor = this.createRumorFromKnowledge(tellerKnowledge, tellerId, eventId);
    }
    
    // Применяем искажения при передаче
    const distortedRumor = this.applyDistortions(rumor, context);
    
    // Обновляем историю передачи
    const transmission: TransmissionRecord = {
      fromNPC: tellerId,
      toNPC: listenerId,
      timestamp: this.currentTime,
      context: `${context.socialSetting}:${context.relationship}`,
      confidenceChange: distortedRumor.confidence - rumor.confidence,
      newDistortions: distortedRumor.distortions.slice(rumor.distortions.length),
    };
    distortedRumor.transmissionHistory.push(transmission);
    distortedRumor.currentCarrier = listenerId;
    distortedRumor.repetitionCount++;
    
    // Сохраняем обновлённый слух
    this.updateRumor(distortedRumor);
    
    // Добавляем знание слушателю
    this.addRumorKnowledge(listenerId, distortedRumor);
    
    // Добавляем слушателя как носителя слуха
    const carriers = this.rumorCarriers.get(distortedRumor.id) || new Set();
    carriers.add(listenerId);
    this.rumorCarriers.set(distortedRumor.id, carriers);
    
    return true;
  }
  
  /**
   * Проверка готовности NPC поделиться знанием
   */
  private checkWillingnessToShare(
    knowledge: NPCKnowledge,
    context: TellingContext
  ): KnowledgeCheckResult {
    let willingToShare = true;
    const conditions: ShareCondition[] = [];
    
    // Влияние отношений
    if (context.relationship === 'enemy') {
      willingToShare = false;
    } else if (context.relationship === 'rival') {
      conditions.push({
        type: 'payment',
        value: 50,
        description: 'Payment for information',
      });
    }
    
    // Влияние обстановки
    if (!context.privacy && knowledge.emotionalResponse === 'fear') {
      willingToShare = false;
    }
    
    if (context.alcoholInvolved) {
      // Алкоголь снижает осторожность
      willingToShare = true;
    }
    
    // Политические факторы
    if (this.hasPoliticalConflict()) {
      willingToShare = false;
      conditions.push({
        type: 'favor',
        value: 100,
        description: 'Political favor required',
      });
    }
    
    return {
      knowsAboutEvent: knowledge.isKnown,
      confidence: knowledge.confidence,
      version: knowledge.knownVersion,
      distortions: knowledge.distortions,
      canActOnKnowledge: knowledge.confidence > 0.6,
      willingToShare,
      shareConditions: conditions.length > 0 ? conditions : undefined,
    };
  }
  
  private hasPoliticalConflict(): boolean {
    // Упрощённая проверка политических конфликтов
    // Здесь можно добавить логику проверки политических взглядов собеседников
    return false;
  }
  
  /**
   * Создание слуха из знания NPC
   */
  private createRumorFromKnowledge(knowledge: NPCKnowledge, carrierId: string, eventId: string): Rumor {
    const rumor: Rumor = {
      id: `rumor_${eventId}_${carrierId}_${this.currentTime}`,
      eventId,
      version: knowledge.knownVersion,
      confidence: knowledge.confidence,
      sourceReliability: knowledge.source === 'direct_witness' ? 0.9 : 0.5,
      distanceFromSource: knowledge.source === 'direct_witness' ? 0 : 1,
      repetitionCount: 0,
      emotion: knowledge.emotionalResponse,
      politicalBias: knowledge.politicalInterpretation,
      distortions: [...knowledge.distortions],
      timestamp: this.currentTime,
      currentCarrier: carrierId,
      transmissionHistory: [],
    };
    
    const eventRumors = this.rumors.get(eventId) || [];
    eventRumors.push(rumor);
    this.rumors.set(eventId, eventRumors);
    
    const carriers = new Set<string>();
    carriers.add(carrierId);
    this.rumorCarriers.set(rumor.id, carriers);
    
    return rumor;
  }
  
  /**
   * Применение искажений при передаче слуха
   */
  private applyDistortions(rumor: Rumor, context: TellingContext): Rumor {
    const distortedRumor: Rumor = { ...rumor, distortions: [...rumor.distortions] };
    
    // Факторы, влияющие на искажение
    const emotionFactor = this.params.emotionAmplification[rumor.emotion];
    const distanceFactor = 1 + (rumor.distanceFromSource * this.params.distanceDecayFactor);
    const repetitionFactor = 1 + (rumor.repetitionCount * 0.1);
    const settingFactor = this.getSocialSettingFactor(context.socialSetting);
    const relationshipFactor = this.getRelationshipFactor(context.relationship);
    
    // Общая вероятность искажения
    const distortionChance = Math.min(
      0.3 * emotionFactor * distanceFactor * repetitionFactor * settingFactor * relationshipFactor,
      0.9
    );
    
    // Проверка на преднамеренную ложь
    if (Math.random() < this.params.intentionalLieChance * (context.incentive > 0 ? 2 : 1)) {
      this.addDistortion(distortedRumor, 'intentional_lie', context);
    }
    
    // Случайные искажения
    if (Math.random() < distortionChance && distortedRumor.distortions.length < this.params.maxDistortions) {
      const cause = this.selectDistortionCause(context);
      this.addDistortion(distortedRumor, cause, context);
    }
    
    // Обновление уверенности
    const confidenceLoss = distortedRumor.distortions.length * 0.05;
    distortedRumor.confidence = Math.max(0.1, rumor.confidence - confidenceLoss);
    
    // Увеличение расстояния от источника
    distortedRumor.distanceFromSource = rumor.distanceFromSource + 1;
    
    return distortedRumor;
  }
  
  private getSocialSettingFactor(setting: SocialSetting): number {
    const factors: Record<SocialSetting, number> = {
      tavern: 1.5, // Много шума, алкоголя
      marketplace: 1.3,
      temple: 0.8, // Более серьёзная обстановка
      guild_hall: 0.9,
      noble_court: 0.7, // Осторожность
      private_home: 1.0,
      street: 1.2,
      battlefield: 1.8, // Хаос
      prison: 1.4,
    };
    return factors[setting] || 1.0;
  }
  
  private getRelationshipFactor(relationship: RelationshipType): number {
    const factors: Record<RelationshipType, number> = {
      stranger: 1.3,
      acquaintance: 1.1,
      friend: 0.8, // Больше доверия, меньше искажений
      family: 0.7,
      rival: 1.5,
      enemy: 1.8,
      authority_figure: 0.9,
      subordinate: 1.1,
      business_partner: 1.0,
    };
    return factors[relationship] || 1.0;
  }
  
  private selectDistortionCause(context: TellingContext): DistortionCause {
    const causes: DistortionCause[] = [];
    
    if (!context.privacy) {
      causes.push('misunderstanding');
    }
    
    if (context.alcoholInvolved) {
      causes.push('emotional_state');
    }
    
    if (context.timePressure) {
      causes.push('omission' as DistortionCause);
    }
    
    if (context.incentive !== 0) {
      causes.push('intentional_lie');
    }
    
    // Культурные фильтры
    const culturalFilter = this.params.culturalFilters[context.location];
    if (culturalFilter) {
      causes.push('cultural_filter');
    }
    
    if (causes.length === 0) {
      causes.push('memory_decay' as DistortionCause);
    }
    
    return causes[Math.floor(Math.random() * causes.length)];
  }
  
  private addDistortion(rumor: Rumor, cause: DistortionCause, context: TellingContext): void {
    if (rumor.distortions.length >= this.params.maxDistortions) {
      return;
    }
    
    const types: DistortionType[] = this.selectDistortionTypes(cause);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const distortion: Distortion = {
      type,
      magnitude: 0.3 + Math.random() * 0.5,
      cause,
    };
    
    // Применяем искажение к версии
    rumor.version = this.applyDistortionToVersion(rumor.version, distortion, context);
    rumor.distortions.push(distortion);
  }
  
  private selectDistortionTypes(cause: DistortionCause): DistortionType[] {
    const mapping: Record<DistortionCause, DistortionType[]> = {
      poor_visibility: ['omission', 'substitution'],
      emotional_state: ['exaggeration', 'minimization'],
      memory_decay: ['omission', 'reordering'],
      political_bias: ['addition', 'substitution', 'minimization'],
      intentional_lie: ['addition', 'substitution', 'exaggeration'],
      misunderstanding: ['substitution', 'reordering'],
      cultural_filter: ['omission', 'substitution'],
      gossip_amplification: ['exaggeration', 'addition'],
    };
    return mapping[cause] || ['omission'];
  }
  
  private applyDistortionToVersion(version: string, distortion: Distortion): string {
    let result = version;
    
    switch (distortion.type) {
      case 'exaggeration':
        result = result.replace(/some/gi, 'many')
                      .replace(/a few/gi, 'dozens')
                      .replace(/small/gi, 'huge')
                      .replace(/quickly/gi, 'instantly');
        break;
        
      case 'minimization':
        result = result.replace(/many/gi, 'some')
                      .replace(/dozens/gi, 'a few')
                      .replace(/huge/gi, 'small')
                      .replace(/terrible/gi, 'unfortunate');
        break;
        
      case 'addition':
        const additions = [
          ' witnesses say ',
          ' rumors suggest ',
          ' some believe ',
          ' it is said that ',
        ];
        const randomAddition = additions[Math.floor(Math.random() * additions.length)];
        result = randomAddition + result;
        break;
        
      case 'omission':
        // Удаляем случайную часть предложения
        const parts = result.split(' ');
        if (parts.length > 5) {
          const removeIndex = Math.floor(Math.random() * (parts.length - 3)) + 2;
          parts.splice(removeIndex, 2);
          result = parts.join(' ');
        }
        break;
        
      case 'substitution':
        result = result.replace(/guard/gi, 'soldier')
                      .replace(/thief/gi, 'assassin')
                      .replace(/merchant/gi, 'noble')
                      .replace(/accident/gi, 'conspiracy');
        break;
        
      case 'reordering':
        const sentences = result.split('. ');
        if (sentences.length > 1) {
          const shuffled = sentences.sort(() => Math.random() - 0.5);
          result = shuffled.join('. ');
        }
        break;
        
      case 'conflation':
        result += ' This reminds people of another incident...';
        break;
    }
    
    return result;
  }
  
  /**
   * Добавление знания на основе слуха
   */
  private addRumorKnowledge(npcId: string, rumor: Rumor): void {
    const existingKnowledge = this.getNPCKnowledge(npcId, rumor.eventId);
    
    const knownDetails = new Set<string>();
    const details = rumor.version.split(/[.,;]/).filter(d => d.trim().length > 0);
    details.forEach(d => knownDetails.add(d.trim()));
    
    const knowledge: NPCKnowledge = {
      npcId,
      eventId: rumor.eventId,
      isKnown: true,
      learnedAt: this.currentTime,
      source: 'secondhand_rumor',
      confidence: rumor.confidence,
      knownVersion: rumor.version,
      emotionalResponse: rumor.emotion,
      politicalInterpretation: rumor.politicalBias,
      lastRecalled: this.currentTime,
      recallCount: 0,
      knownDetails,
      distortions: [...rumor.distortions],
    };
    
    // Если уже есть знание, сохраняем более уверенное
    if (existingKnowledge && existingKnowledge.confidence > knowledge.confidence) {
      return;
    }
    
    this.saveNPCKnowledge(npcId, rumor.eventId, knowledge);
  }
  
  /**
   * Проверка знания NPC о событии
   */
  checkKnowledge(npcId: string, eventId: string): KnowledgeCheckResult {
    const knowledge = this.getNPCKnowledge(npcId, eventId);
    
    if (!knowledge || !knowledge.isKnown) {
      return {
        knowsAboutEvent: false,
        confidence: 0,
        version: '',
        distortions: [],
        canActOnKnowledge: false,
        willingToShare: false,
      };
    }
    
    // Проверяем забывание
    this.applyMemoryDecay(knowledge);
    
    return {
      knowsAboutEvent: knowledge.isKnown && knowledge.confidence > 0.2,
      confidence: knowledge.confidence,
      version: knowledge.knownVersion,
      distortions: knowledge.distortions,
      canActOnKnowledge: knowledge.confidence > 0.6,
      willingToShare: knowledge.confidence > 0.4,
      emotionalResponse: knowledge.emotionalResponse,
      politicalInterpretation: knowledge.politicalInterpretation,
    };
  }
  
  /**
   * Применение забывания к памяти NPC
   */
  private applyMemoryDecay(knowledge: NPCKnowledge): void {
    const timeSinceLearned = this.currentTime - knowledge.learnedAt;
    
    // Базовое забывание со временем
    const decay = timeSinceLearned * this.params.baseDecayRate;
    
    // Воспоминания замедляют забывание
    const recallBonus = knowledge.recallCount * 0.05;
    
    // Эмоциональные воспоминания забываются медленнее
    const emotionRetention = this.params.emotionAmplification[knowledge.emotionalResponse] * 0.1;
    
    const totalDecay = Math.max(0, decay - recallBonus - emotionRetention);
    knowledge.confidence = Math.max(0, knowledge.confidence - totalDecay);
    
    if (knowledge.confidence < 0.1) {
      knowledge.isKnown = false;
    }
  }
  
  /**
   * Вспоминание знания NPC
   */
  recallKnowledge(npcId: string, eventId: string): boolean {
    const knowledge = this.getNPCKnowledge(npcId, eventId);
    if (!knowledge || !knowledge.isKnown) {
      return false;
    }
    
    knowledge.lastRecalled = this.currentTime;
    knowledge.recallCount++;
    
    // Воспоминание немного укрепляет память
    knowledge.confidence = Math.min(1.0, knowledge.confidence + 0.05);
    
    this.saveNPCKnowledge(npcId, eventId, knowledge);
    return true;
  }
  
  /**
   * Получение всех версий слуха о событии
   */
  getAllRumorVersions(eventId: string): Rumor[] {
    return this.rumors.get(eventId) || [];
  }
  
  /**
   * Получение статистики распространения слуха
   */
  getRumorStatistics(eventId: string): RumorStatistics | null {
    const eventRumors = this.rumors.get(eventId);
    if (!eventRumors || eventRumors.length === 0) {
      return null;
    }
    
    const allCarriers = new Set<string>();
    let totalConfidence = 0;
    let totalDistortions = 0;
    const emotions: Record<string, number> = {};
    const biases: Record<string, number> = {};
    
    eventRumors.forEach(rumor => {
      const carriers = this.rumorCarriers.get(rumor.id) || new Set();
      carriers.forEach(c => allCarriers.add(c));
      
      totalConfidence += rumor.confidence;
      totalDistortions += rumor.distortions.length;
      
      emotions[rumor.emotion] = (emotions[rumor.emotion] || 0) + 1;
      biases[rumor.politicalBias] = (biases[rumor.politicalBias] || 0) + 1;
    });
    
    const mostCommonEmotion = Object.entries(emotions)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as EmotionType || 'neutral';
    const dominantBias = Object.entries(biases)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as PoliticalBias || 'neutral';
    
    return {
      totalCarriers: allCarriers.size,
      averageConfidence: totalConfidence / eventRumors.length,
      distortionCount: totalDistortions,
      versionsCount: eventRumors.length,
      spreadRadius: Math.max(...eventRumors.map(r => r.distanceFromSource)),
      peakIntensity: Math.max(...eventRumors.map(r => r.confidence)),
      currentIntensity: totalConfidence / eventRumors.length,
      estimatedOrigin: eventRumors[0]?.currentCarrier || 'unknown',
      mostCommonEmotion,
      dominantPoliticalBias: dominantBias,
    };
  }
  
  /**
   * Поиск слуха по носителю
   */
  private findRumorByCarrier(carrierId: string, eventId: string): Rumor | undefined {
    const eventRumors = this.rumors.get(eventId) || [];
    return eventRumors.find(r => {
      const carriers = this.rumorCarriers.get(r.id);
      return carriers?.has(carrierId);
    });
  }
  
  /**
   * Обновление слуха
   */
  private updateRumor(rumor: Rumor): void {
    const eventRumors = this.rumors.get(rumor.eventId) || [];
    const index = eventRumors.findIndex(r => r.id === rumor.id);
    if (index !== -1) {
      eventRumors[index] = rumor;
    } else {
      eventRumors.push(rumor);
    }
    this.rumors.set(rumor.eventId, eventRumors);
  }
  
  /**
   * Сохранение знания NPC
   */
  private saveNPCKnowledge(npcId: string, eventId: string, knowledge: NPCKnowledge): void {
    if (!this.npcKnowledge.has(npcId)) {
      this.npcKnowledge.set(npcId, new Map());
    }
    this.npcKnowledge.get(npcId)!.set(eventId, knowledge);
  }
  
  /**
   * Получение знания NPC
   */
  private getNPCKnowledge(npcId: string, eventId: string): NPCKnowledge | undefined {
    return this.npcKnowledge.get(npcId)?.get(eventId);
  }
  
  /**
   * Установка текущего времени
   */
  setCurrentTime(time: number): void {
    this.currentTime = time;
  }
  
  /**
   * Получение текущего времени
   */
  getCurrentTime(): number {
    return this.currentTime;
  }
  
  /**
   * Добавление культурного фильтра для региона
   */
  addCulturalFilter(regionName: string, filter: CulturalFilter): void {
    this.params.culturalFilters[regionName] = filter;
  }
  
  /**
   * Очистка старых данных
   */
  cleanupOldData(maxAge: number): void {
    const cutoff = this.currentTime - maxAge;
    
    // Удаляем старые события
    for (const [eventId, event] of this.events.entries()) {
      if (event.timestamp < cutoff) {
        this.events.delete(eventId);
        this.witnesses.delete(eventId);
        this.rumors.delete(eventId);
      }
    }
    
    // Очищаем знания NPC о старых событиях
    for (const [npcId, knowledgeMap] of this.npcKnowledge.entries()) {
      for (const eventId of knowledgeMap.keys()) {
        const event = this.events.get(eventId);
        if (!event || event.timestamp < cutoff) {
          knowledgeMap.delete(eventId);
        }
      }
      if (knowledgeMap.size === 0) {
        this.npcKnowledge.delete(npcId);
      }
    }
  }
}
