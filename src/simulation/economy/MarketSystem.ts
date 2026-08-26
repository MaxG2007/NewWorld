/**
 * ЭТАП 18 — ECONOMY
 * Система динамического ценообразования на рынке
 * Учитывает: спрос, предложение, расстояние, сезон, войну, налоги, дефицит, качество, репутацию
 */

import { 
  SettlementMarket, 
  MarketOffer, 
  MarketDemand, 
  PriceFactors, 
  ResourceId
} from './EconomyTypes';
import { resourceSystem } from './ResourceSystem';

export class MarketSystem {
  private markets: Map<string, SettlementMarket> = new Map();
  
  constructor() {}

  /**
   * Создать рынок для поселения
   */
  createMarket(settlementId: string, taxRate: number = 0.1): SettlementMarket {
    const market: SettlementMarket = {
      settlementId,
      resources: new Map(),
      activeOffers: [],
      activeDemands: [],
      taxRate,
      isAtWar: false,
    };
    
    this.markets.set(settlementId, market);
    return market;
  }

  getMarket(settlementId: string): SettlementMarket | undefined {
    return this.markets.get(settlementId);
  }

  /**
   * Рассчитать цену ресурса с учетом всех факторов
   * НЕ использует глобальные фиксированные цены - каждый рынок уникален
   */
  calculatePrice(
    settlementId: string,
    resourceId: ResourceId,
    factors: PriceFactors
  ): number {
    const market = this.markets.get(settlementId);
    if (!market) {
      throw new Error(`Market not found for settlement: ${settlementId}`);
    }

    const resource = resourceSystem.getResource(resourceId);
    if (!resource) {
      throw new Error(`Resource not found: ${resourceId}`);
    }

    const basePrice = resource.basePrice;

    // 1. Базовое соотношение спроса и предложения
    const supplyDemandRatio = factors.demand > 0 ? factors.supply / factors.demand : 1;
    let price = basePrice;

    // 2. Влияние спроса и предложения (основной механизм рынка)
    if (supplyDemandRatio < 0.5) {
      // Дефицит - цена растет
      price *= 1.5 + (0.5 - supplyDemandRatio) * 2;
    } else if (supplyDemandRatio > 2) {
      // Избыток - цена падает
      price *= 0.7 + (2 - supplyDemandRatio) * 0.1;
    } else {
      // Нормальный диапазон
      price *= 1 + (1 - supplyDemandRatio) * 0.3;
    }

    // 3. Расстояние до источника ресурсов (транспортные расходы)
    price *= 1 + (factors.distance * 0.05);

    // 4. Сезонный множитель
    price *= factors.season;

    // 5. Военный множитель (война повышает цены на оружие, еду)
    if (factors.war > 1) {
      if (resource.category === 'crafted' || resource.category === 'food') {
        price *= factors.war;
      }
    }

    // 6. Налоги
    price *= 1 + factors.taxes;

    // 7. Дефицит (экстремальный)
    if (factors.shortage > 0) {
      price *= 1 + factors.shortage;
    }

    // 8. Избыток (обвал цен)
    if (factors.surplus > 0) {
      price *= 1 - Math.min(factors.surplus * 0.3, 0.5);
    }

    // 9. Качество товара
    price *= factors.quality;

    // 10. Репутация продавца
    price *= 0.9 + (factors.sellerReputation * 0.2);

    // Округление до 2 знаков
    return Math.round(price * 100) / 100;
  }

  /**
   * Добавить предложение на рынок
   */
  addOffer(settlementId: string, offer: MarketOffer): void {
    const market = this.markets.get(settlementId);
    if (!market) return;

    // Расчет актуальной цены
    const resourceData = market.resources.get(offer.resourceId);
    const factors: PriceFactors = {
      supply: resourceData?.supply || 0,
      demand: resourceData?.demand || 0,
      distance: 0,
      season: 1,
      war: market.isAtWar ? 1.5 : 1,
      taxes: market.taxRate,
      shortage: 0,
      surplus: 0,
      quality: offer.quality,
      sellerReputation: offer.sellerReputation,
    };

    offer.price = this.calculatePrice(settlementId, offer.resourceId, factors);
    offer.timestamp = Date.now();

    market.activeOffers.push(offer);
    
    // Обновление данных о ресурсе
    this.updateResourceData(market, offer.resourceId, offer.quantity, 0);
  }

  /**
   * Добавить спрос на рынке
   */
  addDemand(settlementId: string, demand: MarketDemand): void {
    const market = this.markets.get(settlementId);
    if (!market) return;

    market.activeDemands.push(demand);
    
    // Обновление данных о ресурсе
    this.updateResourceData(market, demand.resourceId, 0, demand.quantity);
  }

  /**
   * Обновить данные о ресурсе на рынке
   */
  private updateResourceData(
    market: SettlementMarket,
    resourceId: ResourceId,
    supplyChange: number,
    demandChange: number
  ): void {
    if (!market.resources.has(resourceId)) {
      const resource = resourceSystem.getResource(resourceId);
      market.resources.set(resourceId, {
        supply: 0,
        demand: 0,
        currentPrice: resource?.basePrice || 10,
        basePrice: resource?.basePrice || 10,
        lastUpdated: Date.now(),
      });
    }

    const data = market.resources.get(resourceId)!;
    data.supply += supplyChange;
    data.demand += demandChange;
    data.lastUpdated = Date.now();

    // Пересчет текущей цены
    const factors: PriceFactors = {
      supply: data.supply,
      demand: data.demand,
      distance: 0,
      season: 1,
      war: market.isAtWar ? 1.5 : 1,
      taxes: market.taxRate,
      shortage: data.demand > data.supply * 2 ? (data.demand - data.supply) / data.supply : 0,
      surplus: data.supply > data.demand * 2 ? (data.supply - data.demand) / data.demand : 0,
      quality: 1,
      sellerReputation: 1,
    };

    data.currentPrice = this.calculatePrice(
      market.settlementId,
      resourceId,
      factors
    );
  }

  /**
   * Обработать транзакцию (покупку/продажу)
   */
  processTransaction(
    settlementId: string,
    resourceId: ResourceId,
    quantity: number,
    isBuy: boolean
  ): { success: boolean; price: number; message?: string } {
    const market = this.markets.get(settlementId);
    if (!market) {
      return { success: false, price: 0, message: 'Market not found' };
    }

    const resourceData = market.resources.get(resourceId);
    if (!resourceData) {
      return { success: false, price: 0, message: 'Resource not available' };
    }

    // Проверка доступности
    if (isBuy && resourceData.supply < quantity) {
      return { 
        success: false, 
        price: resourceData.currentPrice, 
        message: 'Insufficient supply' 
      };
    }

    // Обновление баланса
    if (isBuy) {
      resourceData.supply -= quantity;
    } else {
      resourceData.supply += quantity;
    }

    // Пересчет цены после транзакции
    const factors: PriceFactors = {
      supply: resourceData.supply,
      demand: resourceData.demand,
      distance: 0,
      season: 1,
      war: market.isAtWar ? 1.5 : 1,
      taxes: market.taxRate,
      shortage: resourceData.demand > resourceData.supply * 2 ? 0.5 : 0,
      surplus: resourceData.supply > resourceData.demand * 2 ? 0.3 : 0,
      quality: 1,
      sellerReputation: 1,
    };

    resourceData.currentPrice = this.calculatePrice(
      settlementId,
      resourceId,
      factors
    );

    return {
      success: true,
      price: resourceData.currentPrice,
    };
  }

  /**
   * Установить военное положение для рынка
   */
  setWarState(settlementId: string, atWar: boolean): void {
    const market = this.markets.get(settlementId);
    if (market) {
      market.isAtWar = atWar;
      // Пересчет всех цен при изменении военного положения
      for (const [resourceId] of market.resources.entries()) {
        const data = market.resources.get(resourceId)!;
        const factors: PriceFactors = {
          supply: data.supply,
          demand: data.demand,
          distance: 0,
          season: 1,
          war: atWar ? 1.5 : 1,
          taxes: market.taxRate,
          shortage: 0,
          surplus: 0,
          quality: 1,
          sellerReputation: 1,
        };
        data.currentPrice = this.calculatePrice(settlementId, resourceId, factors);
      }
    }
  }

  /**
   * Получить статистику рынка
   */
  getMarketStats(settlementId: string): {
    totalSupply: number;
    totalDemand: number;
    averagePriceMultiplier: number;
    resourceCount: number;
  } | null {
    const market = this.markets.get(settlementId);
    if (!market) return null;

    let totalSupply = 0;
    let totalDemand = 0;
    let priceMultiplierSum = 0;
    let resourceCount = 0;

    for (const data of market.resources.values()) {
      totalSupply += data.supply;
      totalDemand += data.demand;
      priceMultiplierSum += data.currentPrice / data.basePrice;
      resourceCount++;
    }

    return {
      totalSupply,
      totalDemand,
      averagePriceMultiplier: resourceCount > 0 ? priceMultiplierSum / resourceCount : 1,
      resourceCount,
    };
  }

  /**
   * Очистить старые предложения
   */
  cleanupOffers(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const market of this.markets.values()) {
      market.activeOffers = market.activeOffers.filter(
        offer => now - offer.timestamp < maxAge
      );
    }
  }
}

export const marketSystem = new MarketSystem();
