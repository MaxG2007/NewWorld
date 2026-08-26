/**
 * ЭТАП 18 — ECONOMY
 * Глобальный симулятор экономики
 * Запускает полный цикл: RESOURCE → PRODUCTION → CRAFT → MARKET → CONSUMPTION → PRICE CHANGE
 */

import { resourceSystem } from './ResourceSystem';
import { marketSystem } from './MarketSystem';
import { tradeRoutesSystem } from './TradeRoutes';
import { ResourceId } from './EconomyTypes';

export interface EconomyConfig {
  seasonMultiplier: number;
  baseTaxRate: number;
  warMode: boolean;
}

export class EconomySimulator {
  private config: EconomyConfig = {
    seasonMultiplier: 1,
    baseTaxRate: 0.1,
    warMode: false,
  };

  private settlements: string[] = [];
  private tickCount: number = 0;

  constructor() {}

  /**
   * Инициализировать экономику для поселений
   */
  initializeSettlements(settlementIds: string[]): void {
    this.settlements = settlementIds;
    
    for (const id of settlementIds) {
      marketSystem.createMarket(id, this.config.baseTaxRate);
    }

    // Автоматическое создание торговых путей
    tradeRoutesSystem.autoCreateProfitableRoutes(settlementIds);
  }

  /**
   * Выполнить один тик симуляции экономики
   */
  tick(): void {
    this.tickCount++;

    // 1. RESOURCE - Добыча ресурсов
    this.processResourceGathering();

    // 2. PRODUCTION - Производство
    this.processProduction();

    // 3. CRAFT - Крафт
    this.processCrafting();

    // 4. MARKET - Рыночные операции
    this.processMarkets();

    // 5. CONSUMPTION - Потребление
    this.processConsumption();

    // 6. SHORTAGE/SURPLUS - Анализ дефицита/избытка
    this.analyzeSupplyDemand();

    // 7. PRICE_CHANGE - Изменение цен
    this.updatePrices();

    // Обработка торговых путей
    tradeRoutesSystem.processAllRoutes();
  }

  /**
   * 1. RESOURCE - Симуляция добычи ресурсов
   */
  private processResourceGathering(): void {
    for (const settlementId of this.settlements) {
      const stockpile = resourceSystem.getResourceStockpile(settlementId);
      
      // Автоматическая добыча базовых ресурсов (симуляция)
      const baseResources: ResourceId[] = ['wood', 'stone', 'wheat'];
      
      for (const resourceId of baseResources) {
        const current = stockpile.get(resourceId) || 0;
        // Добавляем немного ресурсов каждый тик
        stockpile.set(resourceId, current + Math.floor(Math.random() * 10) + 5);
      }
    }
  }

  /**
   * 2. PRODUCTION - Переработка ресурсов
   */
  private processProduction(): void {
    for (const settlementId of this.settlements) {
      // Руда → Металл
      const ore = resourceSystem.getResourceQuantity(settlementId, 'ore');
      if (ore >= 2) {
        resourceSystem.removeResource(settlementId, 'ore', 2);
        resourceSystem.addResource(settlementId, 'metal', 1);
      }

      // Хлопок → Ткань
      const cotton = resourceSystem.getResourceQuantity(settlementId, 'cotton');
      if (cotton >= 2) {
        resourceSystem.removeResource(settlementId, 'cotton', 2);
        resourceSystem.addResource(settlementId, 'fabric', 1);
      }
    }
  }

  /**
   * 3. CRAFT - Создание предметов
   */
  private processCrafting(): void {
    for (const settlementId of this.settlements) {
      // Металл → Меч
      const metal = resourceSystem.getResourceQuantity(settlementId, 'metal');
      if (metal >= 3) {
        resourceSystem.removeResource(settlementId, 'metal', 3);
        resourceSystem.addResource(settlementId, 'sword', 1);
      }

      // Ткань + Металл → Броня
      const fabric = resourceSystem.getResourceQuantity(settlementId, 'fabric');
      const metalForArmor = resourceSystem.getResourceQuantity(settlementId, 'metal');
      if (fabric >= 2 && metalForArmor >= 2) {
        resourceSystem.removeResource(settlementId, 'fabric', 2);
        resourceSystem.removeResource(settlementId, 'metal', 2);
        resourceSystem.addResource(settlementId, 'armor', 1);
      }

      // Пшеница → Хлеб
      const wheat = resourceSystem.getResourceQuantity(settlementId, 'wheat');
      if (wheat >= 2) {
        resourceSystem.removeResource(settlementId, 'wheat', 2);
        resourceSystem.addResource(settlementId, 'bread', 1);
      }
    }
  }

  /**
   * 4. MARKET - Рыночная активность
   */
  private processMarkets(): void {
    for (const settlementId of this.settlements) {
      const stockpile = resourceSystem.getResourceStockpile(settlementId);
      
      // Добавление предложений на рынок от производителей
      for (const [resourceId, quantity] of stockpile.entries()) {
        if (quantity > 10) {
          // Избыток资源 - выставляем на продажу
          const excess = Math.floor(quantity / 2);
          
          marketSystem.addOffer(settlementId, {
            resourceId,
            quantity: excess,
            price: 0, // будет рассчитано
            sellerId: `producer_${settlementId}`,
            sellerReputation: 0.8 + Math.random() * 0.2,
            quality: 0.8 + Math.random() * 0.2,
            timestamp: Date.now(),
          });
        }
      }

      // Добавление спроса от NPC
      const foodDemand = Math.floor(Math.random() * 5) + 2;
      marketSystem.addDemand(settlementId, {
        resourceId: 'bread',
        quantity: foodDemand,
        maxPrice: 20,
        priority: 1,
      });
    }
  }

  /**
   * 5. CONSUMPTION - Потребление ресурсов
   */
  private processConsumption(): void {
    for (const settlementId of this.settlements) {
      // Потребление еды населением
      const bread = resourceSystem.getResourceQuantity(settlementId, 'bread');
      if (bread > 0) {
        const consumption = Math.min(bread, Math.floor(Math.random() * 3) + 1);
        resourceSystem.removeResource(settlementId, 'bread', consumption);
      }

      // Потребление инструментов для производства
      const tools = resourceSystem.getResourceQuantity(settlementId, 'tools');
      if (tools > 5) {
        // Износ инструментов
        resourceSystem.removeResource(settlementId, 'tools', 1);
      }
    }
  }

  /**
   * 6. SHORTAGE/SURPLUS - Анализ баланса спроса и предложения
   */
  private analyzeSupplyDemand(): void {
    for (const settlementId of this.settlements) {
      const stats = marketSystem.getMarketStats(settlementId);
      if (!stats) continue;

      // Логика анализа может быть расширена
      if (stats.totalDemand > stats.totalSupply * 2) {
        console.log(`[Economy] Дефицит в ${settlementId}`);
      } else if (stats.totalSupply > stats.totalDemand * 2) {
        console.log(`[Economy] Избыток в ${settlementId}`);
      }
    }
  }

  /**
   * 7. PRICE_CHANGE - Обновление цен на основе всех факторов
   */
  private updatePrices(): void {
    // Цены обновляются автоматически через marketSystem при каждой транзакции
    // Здесь можно добавить глобальные корректировки
    
    if (this.config.warMode) {
      for (const settlementId of this.settlements) {
        marketSystem.setWarState(settlementId, true);
      }
    }
  }

  /**
   * Установить сезонный множитель
   */
  setSeason(multiplier: number): void {
    this.config.seasonMultiplier = multiplier;
  }

  /**
   * Включить/выключить военный режим
   */
  setWarMode(enabled: boolean): void {
    this.config.warMode = enabled;
    
    if (enabled) {
      for (const settlementId of this.settlements) {
        marketSystem.setWarState(settlementId, true);
      }
    } else {
      for (const settlementId of this.settlements) {
        marketSystem.setWarState(settlementId, false);
      }
    }
  }

  /**
   * Получить статистику экономики
   */
  getStats(): {
    totalSettlements: number;
    totalTick: number;
    tradeRoutes: any;
    markets: Array<{
      settlementId: string;
      supply: number;
      demand: number;
      avgPriceMultiplier: number;
    }>;
  } {
    const markets = this.settlements.map(id => {
      const stats = marketSystem.getMarketStats(id);
      return {
        settlementId: id,
        supply: stats?.totalSupply || 0,
        demand: stats?.totalDemand || 0,
        avgPriceMultiplier: stats?.averagePriceMultiplier || 1,
      };
    });

    return {
      totalSettlements: this.settlements.length,
      totalTick: this.tickCount,
      tradeRoutes: tradeRoutesSystem.getStats(),
      markets,
    };
  }

  /**
   * Получить цены в конкретном поселении
   */
  getPricesInSettlement(settlementId: string): Map<string, number> {
    const market = marketSystem.getMarket(settlementId);
    if (!market) return new Map();

    const prices = new Map<string, number>();
    for (const [resourceId, data] of market.resources.entries()) {
      prices.set(resourceId, data.currentPrice);
    }

    return prices;
  }

  /**
   * Сравнить цены между двумя поселениями
   */
  comparePrices(settlement1: string, settlement2: string): Array<{
    resourceId: string;
    price1: number;
    price2: number;
    difference: number;
  }> {
    const prices1 = this.getPricesInSettlement(settlement1);
    const prices2 = this.getPricesInSettlement(settlement2);
    
    const comparison: Array<{
      resourceId: string;
      price1: number;
      price2: number;
      difference: number;
    }> = [];

    for (const [resourceId, price1] of prices1.entries()) {
      const price2 = prices2.get(resourceId) || price1;
      const difference = ((price2 - price1) / price1) * 100;
      
      comparison.push({
        resourceId,
        price1,
        price2,
        difference,
      });
    }

    return comparison;
  }
}

export const economySimulator = new EconomySimulator();
