import { District, DistrictType, DistrictData } from './District';

/**
 * Ссылка на здание
 */
interface BuildingReference {
  id: string;
  type: string;
  districtId: string;
}

/**
 * Торговый маршрут
 */
interface TradeRoute {
  id: string;
  targetSettlementId: string;
  goods: string[];
  frequency: number;          // Частота торговли (дни)
  volume: number;             // Объем торговли
  lastTrade: number;
}

/**
 * Слух в поселении
 */
interface Rumor {
  id: string;
  content: string;
  source: string;             // ID источника
  timestamp: number;
  credibility: number;        // Достоверность (0-1)
  spread: number;             // Распространенность (0-1)
  topic: 'war' | 'peace' | 'disaster' | 'opportunity' | 'scandal' | 'mystery';
}

/**
 * Данные поселения
 */
export interface SettlementData {
  id: string;
  version: string;
  name: string;
  type: 'village' | 'town' | 'city' | 'capital';
  coordinates: { x: number; y: number };
  population: number;
  districts: DistrictData[];
  resources: ResourceInfo[];
  prices: PriceInfo[];
  crimeRate: number;
  government: GovernmentInfo;
  religions: ReligionInfo[];
  rumors: Rumor[];
  tradeRoutes: TradeRoute[];
  importantBuildings: BuildingReference[];
  lastUpdated: number;
}

interface ResourceInfo {
  type: string;
  amount: number;
  production: number;       // Производство в день
  consumption: number;      // Потребление в день
  storage: number;          // Максимальное хранение
}

interface PriceInfo {
  itemType: string;
  price: number;
  demand: number;           // Спрос (0-1)
  supply: number;           // Предложение (0-1)
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: number;
}

interface GovernmentInfo {
  type: 'monarchy' | 'republic' | 'tribal' | 'theocracy' | 'oligarchy';
  rulerId: string | null;
  council: string[];        // IDs членов совета
  laws: string[];
  taxRate: number;
  stability: number;        // Стабильность (0-1)
}

interface ReligionInfo {
  religionId: string;
  followers: number;
  influence: number;        // Влияние (0-1)
  temples: number;
}

/**
 * Класс поселения
 */
export class Settlement {
  public readonly id: string;
  public readonly version: string = '1.0.0';
  public name: string;
  public type: 'village' | 'town' | 'city' | 'capital';
  public coordinates: { x: number; y: number };
  public population: number;
  public districts: Map<string, District>;
  public resources: Map<string, ResourceInfo>;
  public prices: Map<string, PriceInfo>;
  public crimeRate: number;
  public government: GovernmentInfo;
  public religions: Map<string, ReligionInfo>;
  public rumors: Rumor[];
  public tradeRoutes: TradeRoute[];
  public importantBuildings: BuildingReference[];
  public lastUpdated: number;

  constructor(
    name: string,
    type: 'village' | 'town' | 'city' | 'capital',
    x: number,
    y: number
  ) {
    this.id = `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.type = type;
    this.coordinates = { x, y };
    this.population = 0;
    this.districts = new Map();
    this.resources = new Map();
    this.prices = new Map();
    this.crimeRate = 0.1;
    this.government = {
      type: 'monarchy',
      rulerId: null,
      council: [],
      laws: [],
      taxRate: 0.1,
      stability: 0.8
    };
    this.religions = new Map();
    this.rumors = [];
    this.tradeRoutes = [];
    this.importantBuildings = [];
    this.lastUpdated = Date.now();
  }

  /**
   * Добавить район в поселение
   */
  addDistrict(district: District): void {
    this.districts.set(district.id, district);
    this.population += district.population;
    this.updateCrimeRate();
    this.lastUpdated = Date.now();
  }

  /**
   * Получить район по типу
   */
  getDistrictByType(type: DistrictType): District | undefined {
    for (const district of this.districts.values()) {
      if (district.type === type) {
        return district;
      }
    }
    return undefined;
  }

  /**
   * Обновить ресурс
   */
  updateResource(type: string, amount: number, production: number, consumption: number, storage: number): void {
    this.resources.set(type, {
      type,
      amount: Math.max(0, Math.min(storage, amount)),
      production,
      consumption,
      storage
    });
    
    // Обновить цену на основе спроса и предложения
    this.updatePrice(type);
    this.lastUpdated = Date.now();
  }

  /**
   * Получить цену товара
   */
  getPrice(itemType: string): number {
    const priceInfo = this.prices.get(itemType);
    return priceInfo ? priceInfo.price : 10; // Базовая цена
  }

  /**
   * Добавить слух
   */
  addRumor(content: string, source: string, topic: Rumor['topic']): void {
    const rumor: Rumor = {
      id: `rumor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      source,
      timestamp: Date.now(),
      credibility: 0.5 + Math.random() * 0.5,
      spread: 0.1,
      topic
    };
    this.rumors.push(rumor);
    
    // Ограничить количество слухов
    if (this.rumors.length > 50) {
      this.rumors.sort((a, b) => b.timestamp - a.timestamp);
      this.rumors = this.rumors.slice(0, 50);
    }
    
    this.lastUpdated = Date.now();
  }

  /**
   * Распространить слухи
   */
  spreadRumors(): void {
    for (const rumor of this.rumors) {
      // Увеличить распространение
      rumor.spread = Math.min(1, rumor.spread + 0.05);
      
      // Уменьшить достоверность со временем
      const ageInDays = (Date.now() - rumor.timestamp) / (1000 * 60 * 60 * 24);
      rumor.credibility = Math.max(0, rumor.credibility - ageInDays * 0.1);
    }
    
    // Удалить старые слухи
    this.rumors = this.rumors.filter(r => r.credibility > 0.1 && r.spread > 0.05);
    this.lastUpdated = Date.now();
  }

  /**
   * Добавить торговый маршрут
   */
  addTradeRoute(targetSettlementId: string, goods: string[], frequency: number, volume: number): void {
    const route: TradeRoute = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetSettlementId,
      goods,
      frequency,
      volume,
      lastTrade: Date.now()
    };
    this.tradeRoutes.push(route);
    this.lastUpdated = Date.now();
  }

  /**
   * Обработать торговлю
   */
  processTrade(currentDay: number): void {
    for (const route of this.tradeRoutes) {
      if (currentDay % route.frequency === 0) {
        // Имитация торговли
        for (const good of route.goods) {
          const resource = this.resources.get(good);
          if (resource) {
            resource.amount += route.volume * 0.1;
            resource.production *= 1.05;
          }
        }
        route.lastTrade = Date.now();
      }
    }
    this.lastUpdated = Date.now();
  }

  /**
   * Сериализация в JSON
   */
  toJSON(): SettlementData {
    return {
      id: this.id,
      version: this.version,
      name: this.name,
      type: this.type,
      coordinates: this.coordinates,
      population: this.population,
      districts: Array.from(this.districts.values()).map(d => d.toJSON()),
      resources: Array.from(this.resources.values()),
      prices: Array.from(this.prices.values()),
      crimeRate: this.crimeRate,
      government: this.government,
      religions: Array.from(this.religions.values()),
      rumors: this.rumors,
      tradeRoutes: this.tradeRoutes,
      importantBuildings: this.importantBuildings,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Десериализация из JSON
   */
  static fromJSON(data: SettlementData): Settlement {
    const settlement = new Settlement(data.name, data.type, data.coordinates.x, data.coordinates.y);
    
    settlement.population = data.population;
    data.districts.forEach(d => {
      const district = District.fromJSON(d);
      settlement.districts.set(district.id, district);
    });
    
    data.resources.forEach(r => settlement.resources.set(r.type, r));
    data.prices.forEach(p => settlement.prices.set(p.itemType, p));
    settlement.crimeRate = data.crimeRate;
    settlement.government = data.government;
    data.religions.forEach(r => settlement.religions.set(r.religionId, r));
    settlement.rumors = data.rumors;
    settlement.tradeRoutes = data.tradeRoutes;
    settlement.importantBuildings = data.importantBuildings;
    settlement.lastUpdated = data.lastUpdated;
    
    return settlement;
  }

  private updateCrimeRate(): void {
    let totalCrime = 0;
    let totalPopulation = 0;
    
    for (const district of this.districts.values()) {
      totalCrime += district.crimeRate * district.population;
      totalPopulation += district.population;
    }
    
    this.crimeRate = totalPopulation > 0 ? totalCrime / totalPopulation : 0;
  }

  private updatePrice(itemType: string): void {
    const resource = this.resources.get(itemType);
    if (!resource) return;

    const existingPrice = this.prices.get(itemType);
    const basePrice = existingPrice?.price || 10;
    
    // Расчет спроса и предложения
    const demand = Math.min(1, resource.consumption / (resource.production || 1));
    const supply = Math.min(1, resource.amount / (resource.storage || 1));
    
    // Новая цена на основе спроса и предложения
    const priceMultiplier = demand / (supply || 0.1);
    const newPrice = Math.max(1, basePrice * priceMultiplier);
    
    const trend: PriceInfo['trend'] = newPrice > basePrice * 1.1 ? 'rising' : 
                                       newPrice < basePrice * 0.9 ? 'falling' : 'stable';
    
    this.prices.set(itemType, {
      itemType,
      price: newPrice,
      demand,
      supply,
      trend,
      lastUpdated: Date.now()
    });
  }
}
