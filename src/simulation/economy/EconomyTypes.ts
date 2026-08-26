/**
 * ЭТАП 18 — ECONOMY
 * Типы данных для экономической системы
 */

export type ResourceId = string;

export interface Resource {
  id: ResourceId;
  name: string;
  category: 'raw' | 'processed' | 'crafted' | 'food' | 'luxury';
  basePrice: number;
  durability?: number;
  quality?: number;
}

export interface ProductionBuilding {
  id: string;
  type: string;
  inputResources: Map<ResourceId, number>;
  outputResources: Map<ResourceId, number>;
  productionTime: number;
  efficiency: number;
  active: boolean;
}

export interface MarketOffer {
  resourceId: ResourceId;
  quantity: number;
  price: number;
  sellerId: string;
  sellerReputation: number;
  quality: number;
  timestamp: number;
}

export interface MarketDemand {
  resourceId: ResourceId;
  quantity: number;
  maxPrice: number;
  priority: number;
}

export interface PriceFactors {
  supply: number;        // Предложение
  demand: number;        // Спрос
  distance: number;      // Расстояние до источника
  season: number;        // Сезонный множитель
  war: number;           // Военный множитель
  taxes: number;         // Налоги
  shortage: number;      // Дефицит
  surplus: number;       // Избыток
  quality: number;       // Качество товара
  sellerReputation: number; // Репутация продавца
}

export interface SettlementMarket {
  settlementId: string;
  resources: Map<ResourceId, {
    supply: number;
    demand: number;
    currentPrice: number;
    basePrice: number;
    lastUpdated: number;
  }>;
  activeOffers: MarketOffer[];
  activeDemands: MarketDemand[];
  taxRate: number;
  isAtWar: boolean;
}

export interface TradeRoute {
  id: string;
  fromSettlement: string;
  toSettlement: string;
  resources: Map<ResourceId, number>;
  distance: number;
  active: boolean;
  riskFactor: number;
  lastTrade: number;
}

export interface EconomicCycle {
  phase: 'RESOURCE' | 'PRODUCTION' | 'CRAFT' | 'MARKET' | 'CONSUMPTION' | 'SHORTAGE_SURPLUS' | 'PRICE_CHANGE';
  tick: number;
  settlements: Map<string, SettlementMarket>;
  tradeRoutes: Map<string, TradeRoute>;
}
