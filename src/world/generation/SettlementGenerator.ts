import { Settlement } from '../settlements/Settlement';
import { District, DISTRICT_CONFIGS, DistrictType } from '../settlements/District';

/**
 * Конфигурация генерации поселения
 */
interface SettlementGenConfig {
  name: string;
  type: 'village' | 'town' | 'city' | 'capital';
  seed: number;
  x: number;
  y: number;
  hasPort: boolean;
  isCapital: boolean;
}

/**
 * Генератор поселений
 */
export class SettlementGenerator {
  private seededRandom(seed: number): () => number {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  /**
   * Сгенерировать поселение
   */
  generate(config: SettlementGenConfig): Settlement {
    const random = this.seededRandom(config.seed);
    
    const settlement = new Settlement(
      config.name,
      config.type,
      config.x,
      config.y
    );

    // Определить доступные районы на основе типа и особенностей
    const availableDistricts = this.getAvailableDistricts(config);
    
    // Сгенерировать районы
    const districtCount = this.getDistrictCount(config.type);
    const generatedDistricts = this.generateDistricts(
      availableDistricts,
      districtCount,
      random,
      config.hasPort
    );

    // Добавить районы в поселение
    generatedDistricts.forEach(district => {
      settlement.addDistrict(district);
    });

    // Инициализировать ресурсы
    this.initializeResources(settlement, config.type, random);

    // Инициализировать цены
    this.initializePrices(settlement);

    // Настроить правительство
    this.setupGovernment(settlement, config.isCapital, random);

    // Добавить религии
    this.addReligions(settlement, random);

    // Сгенерировать начальные слухи
    this.generateInitialRumors(settlement, random);

    return settlement;
  }

  /**
   * Получить доступные типы районов для поселения
   */
  private getAvailableDistricts(config: SettlementGenConfig): DistrictType[] {
    const base: DistrictType[] = ['residential'];
    
    if (config.type === 'village') {
      base.push('craftsman');
      if (config.hasPort) base.push('port');
    } else if (config.type === 'town') {
      base.push('market', 'craftsman', 'religious');
      if (config.hasPort) base.push('port');
    } else if (config.type === 'city') {
      base.push('market', 'craftsman', 'religious', 'military', 'administrative');
      if (config.hasPort) base.push('port');
      base.push('rich', 'poor');
    } else if (config.type === 'capital') {
      base.push('market', 'craftsman', 'religious', 'military', 'administrative', 'rich');
      if (config.hasPort) base.push('port');
      base.push('poor', 'slums');
    }

    return base;
  }

  /**
   * Получить количество районов на основе типа поселения
   */
  private getDistrictCount(type: string): number {
    switch (type) {
      case 'village': return 2 + Math.floor(Math.random() * 2);
      case 'town': return 4 + Math.floor(Math.random() * 3);
      case 'city': return 7 + Math.floor(Math.random() * 4);
      case 'capital': return 10 + Math.floor(Math.random() * 5);
      default: return 3;
    }
  }

  /**
   * Сгенерировать районы
   */
  private generateDistricts(
    availableTypes: DistrictType[],
    count: number,
    random: () => number,
    hasPort: boolean
  ): District[] {
    const districts: District[] = [];
    const usedTypes = new Set<DistrictType>();
    
    // Всегда добавлять порт если есть
    if (hasPort) {
      const portConfig = DISTRICT_CONFIGS.port;
      const district = new District(portConfig, 0, 0, 100, 100);
      districts.push(district);
      usedTypes.add('port');
    }

    // Генерировать остальные районы
    let attempts = 0;
    while (districts.length < count && attempts < 100) {
      const typeIndex = Math.floor(random() * availableTypes.length);
      const type = availableTypes[typeIndex];
      
      if (!usedTypes.has(type) || random() > 0.7) {
        const config = DISTRICT_CONFIGS[type];
        const x = Math.floor(random() * 1000);
        const y = Math.floor(random() * 1000);
        const width = 50 + Math.floor(random() * 150);
        const height = 50 + Math.floor(random() * 150);
        
        const district = new District(config, x, y, width, height);
        
        // Добавить здания
        this.addBuildingsToDistrict(district, random);
        
        districts.push(district);
        usedTypes.add(type);
      }
      
      attempts++;
    }

    return districts;
  }

  /**
   * Добавить здания в район
   */
  private addBuildingsToDistrict(district: District, random: () => number): void {
    const buildingCount = Math.floor(random() * 20) + 5;
    const allowedTypes = DISTRICT_CONFIGS[district.type].buildingTypes;
    
    for (let i = 0; i < buildingCount; i++) {
      const typeIndex = Math.floor(random() * allowedTypes.length);
      const buildingType = allowedTypes[typeIndex];
      const x = Math.floor(random() * district.coordinates.width);
      const y = Math.floor(random() * district.coordinates.height);
      
      district.addBuilding(
        `building_${Date.now()}_${i}`,
        buildingType,
        x,
        y
      );
    }
  }

  /**
   * Инициализировать ресурсы поселения
   */
  private initializeResources(
    settlement: Settlement,
    type: string,
    random: () => number
  ): void {
    // Базовые ресурсы для всех поселений
    settlement.updateResource('food', 1000, 50, 40, 5000);
    
    if (type !== 'village') {
      settlement.updateResource('wood', 500, 20, 15, 2000);
    }
    
    if (type === 'city' || type === 'capital') {
      settlement.updateResource('stone', 300, 10, 8, 1500);
      settlement.updateResource('iron', 200, 8, 6, 1000);
    }
    
    if (type === 'capital') {
      settlement.updateResource('gold', 100, 2, 1, 500);
      settlement.updateResource('cloth', 400, 15, 12, 2000);
    }

    // Детерминированный выбор дополнительного ресурса
    const extraIndex = Math.floor(random() * 3); // Всегда один из первых трех
    const extraResource = ['stone', 'iron', 'gold'][extraIndex];
    if (!settlement.resources.has(extraResource)) {
      settlement.updateResource(extraResource, 200, 10, 8, 1000);
    }
  }

  /**
   * Инициализировать цены
   */
  private initializePrices(settlement: Settlement): void {
    const items = ['food', 'wood', 'stone', 'iron', 'gold', 'cloth', 'weapon', 'armor'];
    
    items.forEach(item => {
      const basePrice = 10 + Math.random() * 20;
      settlement.prices.set(item, {
        itemType: item,
        price: basePrice,
        demand: 0.3 + Math.random() * 0.4,
        supply: 0.3 + Math.random() * 0.4,
        trend: 'stable',
        lastUpdated: Date.now()
      });
    });
  }

  /**
   * Настроить правительство
   */
  private setupGovernment(
    settlement: Settlement,
    isCapital: boolean,
    random: () => number
  ): void {
    const types: Array<'monarchy' | 'republic' | 'oligarchy'> = ['monarchy', 'republic', 'oligarchy'];
    
    settlement.government.type = types[Math.floor(random() * types.length)];
    settlement.government.stability = 0.6 + random() * 0.4;
    settlement.government.taxRate = 0.08 + random() * 0.12;
    
    if (isCapital) {
      settlement.government.type = 'monarchy';
      settlement.government.stability = 0.8 + random() * 0.2;
    }

    // Сгенерировать законы
    const possibleLaws = ['trade_tax', 'curfew', 'military_service', 'religious_freedom', 'guild_regulation'];
    const lawCount = Math.floor(random() * 3) + 1;
    
    for (let i = 0; i < lawCount; i++) {
      const lawIndex = Math.floor(random() * possibleLaws.length);
      const law = possibleLaws[lawIndex];
      if (!settlement.government.laws.includes(law)) {
        settlement.government.laws.push(law);
      }
    }
  }

  /**
   * Добавить религии
   */
  private addReligions(settlement: Settlement, random: () => number): void {
    const religionCount = Math.floor(random() * 3) + 1;
    
    for (let i = 0; i < religionCount; i++) {
      const religionId = `religion_${Math.floor(random() * 100)}`;
      const followers = Math.floor(settlement.population * (0.3 + random() * 0.7) / religionCount);
      
      settlement.religions.set(religionId, {
        religionId,
        followers,
        influence: 0.2 + random() * 0.6,
        temples: Math.floor(random() * 5) + 1
      });
    }
  }

  /**
   * Сгенерировать начальные слухи
   */
  private generateInitialRumors(settlement: Settlement, random: () => number): void {
    const rumorTopics: Array<Rumor['topic']> = ['war', 'peace', 'disaster', 'opportunity', 'scandal', 'mystery'];
    const rumorContents = [
      'Торговый караван был атакован бандитами',
      'В шахтах найдена новая жила золота',
      'Король планирует посетить город',
      'Чума распространяется в соседнем регионе',
      'Гильдия магов ищет учеников',
      'Древние руины найдены в лесу'
    ];

    const rumorCount = Math.floor(random() * 3) + 1;
    
    for (let i = 0; i < rumorCount; i++) {
      const topic = rumorTopics[Math.floor(random() * rumorTopics.length)];
      const content = rumorContents[Math.floor(random() * rumorContents.length)];
      const source = `npc_${Math.floor(random() * 1000)}`;
      
      settlement.addRumor(content, source, topic);
    }
  }
}

// Тип для слуха (нужен для TypeScript)
type Rumor = {
  id: string;
  content: string;
  source: string;
  timestamp: number;
  credibility: number;
  spread: number;
  topic: 'war' | 'peace' | 'disaster' | 'opportunity' | 'scandal' | 'mystery';
};
