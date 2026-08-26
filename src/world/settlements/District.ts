/**
 * Типы районов поселения
 */
export type DistrictType = 
  | 'residential'      // Жилой район
  | 'market'           // Рынок
  | 'craftsman'        // Ремесленный район
  | 'poor'             // Бедный район
  | 'rich'             // Богатый район
  | 'religious'        // Религиозный район
  | 'military'         // Военный район
  | 'port'             // Портовый район
  | 'slums'            // Трущобы
  | 'administrative';  // Административный район

/**
 * Конфигурация района
 */
export interface DistrictConfig {
  type: DistrictType;
  name: string;
  populationDensity: number;      // Плотность населения (0-1)
  crimeRate: number;              // Уровень преступности (0-1)
  housingCost: number;            // Стоимость жилья (множитель)
  availableServices: string[];    // Доступные услуги
  allowedProfessions: string[];   // Разрешенные профессии
  buildingTypes: string[];        // Типы зданий
}

/**
 * Данные района
 */
export interface DistrictData {
  id: string;
  version: string;
  type: DistrictType;
  name: string;
  coordinates: { x: number; y: number; width: number; height: number };
  population: number;
  buildings: BuildingReference[];
  services: ServiceInfo[];
  crimeRate: number;
  cleanliness: number;            // Чистота района (0-1)
  development: number;            // Уровень развития (0-1)
  reputation: number;             // Репутация района (-1 до 1)
  lastUpdated: number;
}

interface BuildingReference {
  id: string;
  type: string;
  coordinates: { x: number; y: number };
}

interface ServiceInfo {
  type: string;
  count: number;
  quality: number;
}

/**
 * Класс района поселения
 */
export class District {
  public readonly id: string;
  public readonly version: string = '1.0.0';
  public type: DistrictType;
  public name: string;
  public coordinates: { x: number; y: number; width: number; height: number };
  public population: number;
  public buildings: BuildingReference[];
  public services: ServiceInfo[];
  public crimeRate: number;
  public cleanliness: number;
  public development: number;
  public reputation: number;
  public lastUpdated: number;

  constructor(config: DistrictConfig, x: number, y: number, width: number, height: number) {
    this.id = `district_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = config.type;
    this.name = config.name;
    this.coordinates = { x, y, width, height };
    this.population = 0;
    this.buildings = [];
    this.services = config.availableServices.map(service => ({
      type: service,
      count: Math.floor(Math.random() * 5) + 1,
      quality: 0.5 + Math.random() * 0.5
    }));
    this.crimeRate = config.crimeRate;
    this.cleanliness = 0.5 + Math.random() * 0.5;
    this.development = 0.3 + Math.random() * 0.7;
    this.reputation = 0;
    this.lastUpdated = Date.now();
  }

  /**
   * Добавить здание в район
   */
  addBuilding(id: string, type: string, x: number, y: number): void {
    this.buildings.push({
      id,
      type,
      coordinates: { x, y }
    });
    this.population += this.calculateBuildingPopulation(type);
    this.updateDevelopment();
  }

  /**
   * Обновить уровень преступности
   */
  updateCrimeRate(baseRate: number, factors: { poverty: number; policing: number; lighting: number }): void {
    const factor = factors.poverty * 0.4 + (1 - factors.policing) * 0.4 + (1 - factors.lighting) * 0.2;
    this.crimeRate = Math.max(0, Math.min(1, baseRate * factor));
    this.lastUpdated = Date.now();
  }

  /**
   * Обновить репутацию на основе событий
   */
  updateReputation(eventImpact: number): void {
    this.reputation = Math.max(-1, Math.min(1, this.reputation + eventImpact));
    this.lastUpdated = Date.now();
  }

  /**
   * Сериализация в JSON
   */
  toJSON(): DistrictData {
    return {
      id: this.id,
      version: this.version,
      type: this.type,
      name: this.name,
      coordinates: this.coordinates,
      population: this.population,
      buildings: this.buildings,
      services: this.services,
      crimeRate: this.crimeRate,
      cleanliness: this.cleanliness,
      development: this.development,
      reputation: this.reputation,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Десериализация из JSON
   */
  static fromJSON(data: DistrictData): District {
    const district = new District(
      {
        type: data.type,
        name: data.name,
        populationDensity: data.population / (data.coordinates.width * data.coordinates.height),
        crimeRate: data.crimeRate,
        housingCost: 1.0,
        availableServices: data.services.map(s => s.type),
        allowedProfessions: [],
        buildingTypes: []
      },
      data.coordinates.x,
      data.coordinates.y,
      data.coordinates.width,
      data.coordinates.height
    );
    
    district.population = data.population;
    district.buildings = data.buildings;
    district.services = data.services;
    district.crimeRate = data.crimeRate;
    district.cleanliness = data.cleanliness;
    district.development = data.development;
    district.reputation = data.reputation;
    district.lastUpdated = data.lastUpdated;
    
    return district;
  }

  private calculateBuildingPopulation(type: string): number {
    const basePopulation: Record<string, number> = {
      'house': 4,
      'apartment': 12,
      'mansion': 8,
      'shop': 2,
      'tavern': 5,
      'temple': 3,
      'barracks': 20,
      'warehouse': 1
    };
    return basePopulation[type] || 2;
  }

  private updateDevelopment(): void {
    const buildingCount = this.buildings.length;
    const avgQuality = this.services.reduce((sum, s) => sum + s.quality, 0) / (this.services.length || 1);
    this.development = Math.min(1, (buildingCount / 50) * 0.6 + avgQuality * 0.4);
  }
}

/**
 * Предустановленные конфигурации районов
 */
export const DISTRICT_CONFIGS: Record<DistrictType, DistrictConfig> = {
  residential: {
    type: 'residential',
    name: 'Жилой район',
    populationDensity: 0.7,
    crimeRate: 0.2,
    housingCost: 1.0,
    availableServices: ['tavern', 'shop', 'well'],
    allowedProfessions: ['merchant', 'craftsman', 'laborer'],
    buildingTypes: ['house', 'apartment']
  },
  market: {
    type: 'market',
    name: 'Торговый район',
    populationDensity: 0.5,
    crimeRate: 0.3,
    housingCost: 1.5,
    availableServices: ['market_stall', 'shop', 'tavern', 'bank'],
    allowedProfessions: ['merchant', 'trader', 'guard'],
    buildingTypes: ['shop', 'warehouse', 'market_stall']
  },
  craftsman: {
    type: 'craftsman',
    name: 'Ремесленный район',
    populationDensity: 0.6,
    crimeRate: 0.25,
    housingCost: 1.1,
    availableServices: ['workshop', 'shop', 'tavern'],
    allowedProfessions: ['blacksmith', 'carpenter', 'weaver', 'potter'],
    buildingTypes: ['workshop', 'house', 'warehouse']
  },
  poor: {
    type: 'poor',
    name: 'Бедный район',
    populationDensity: 0.9,
    crimeRate: 0.5,
    housingCost: 0.3,
    availableServices: ['tavern', 'well'],
    allowedProfessions: ['laborer', 'beggar', 'thief'],
    buildingTypes: ['shack', 'small_house']
  },
  rich: {
    type: 'rich',
    name: 'Богатый район',
    populationDensity: 0.3,
    crimeRate: 0.05,
    housingCost: 3.0,
    availableServices: ['mansion', 'garden', 'private_guard', 'luxury_shop'],
    allowedProfessions: ['noble', 'merchant', 'advisor'],
    buildingTypes: ['mansion', 'villa', 'estate']
  },
  religious: {
    type: 'religious',
    name: 'Религиозный район',
    populationDensity: 0.2,
    crimeRate: 0.1,
    housingCost: 1.2,
    availableServices: ['temple', 'shrine', 'monastery', 'cemetery'],
    allowedProfessions: ['priest', 'monk', 'acrolyte'],
    buildingTypes: ['temple', 'monastery', 'shrine']
  },
  military: {
    type: 'military',
    name: 'Военный район',
    populationDensity: 0.4,
    crimeRate: 0.15,
    housingCost: 0.8,
    availableServices: ['barracks', 'armory', 'training_ground'],
    allowedProfessions: ['soldier', 'captain', 'blacksmith'],
    buildingTypes: ['barracks', 'armory', 'watchtower']
  },
  port: {
    type: 'port',
    name: 'Портовый район',
    populationDensity: 0.6,
    crimeRate: 0.4,
    housingCost: 0.9,
    availableServices: ['dock', 'warehouse', 'tavern', 'fish_market'],
    allowedProfessions: ['sailor', 'fisherman', 'docker', 'merchant'],
    buildingTypes: ['warehouse', 'dock', 'shipyard']
  },
  slums: {
    type: 'slums',
    name: 'Трущобы',
    populationDensity: 1.0,
    crimeRate: 0.8,
    housingCost: 0.1,
    availableServices: ['shack', 'illegal_market'],
    allowedProfessions: ['beggar', 'thief', 'scavenger'],
    buildingTypes: ['shack', 'tent']
  },
  administrative: {
    type: 'administrative',
    name: 'Административный район',
    populationDensity: 0.25,
    crimeRate: 0.08,
    housingCost: 1.8,
    availableServices: ['town_hall', 'court', 'prison', 'office'],
    allowedProfessions: ['official', 'judge', 'guard', 'scribe'],
    buildingTypes: ['town_hall', 'court', 'office']
  }
};
