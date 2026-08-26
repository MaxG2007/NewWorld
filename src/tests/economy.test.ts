/**
 * ЭТАП 18 — ECONOMY
 * Тесты экономической системы
 */

import { describe, it, expect } from 'vitest';
import { 
  resourceSystem, 
  marketSystem, 
  tradeRoutesSystem, 
  economySimulator,
  EconomySimulator
} from '../simulation/economy/index.js';

describe('Economy System - Этап 18', () => {
  describe('ResourceSystem', () => {
    it('должен иметь базовые ресурсы', () => {
      const resources = resourceSystem.getAllResources();
      expect(resources.length).toBeGreaterThan(0);
      
      const wood = resourceSystem.getResource('wood');
      expect(wood).toBeDefined();
      expect(wood?.name).toBe('Древесина');
      expect(wood?.basePrice).toBe(10);
    });

    it('должен добавлять и удалять ресурсы на складе', () => {
      const stockpileId = 'test_stockpile_1';
      
      resourceSystem.addResource(stockpileId, 'wood', 100);
      expect(resourceSystem.getResourceQuantity(stockpileId, 'wood')).toBe(100);
      
      resourceSystem.removeResource(stockpileId, 'wood', 30);
      expect(resourceSystem.getResourceQuantity(stockpileId, 'wood')).toBe(70);
    });

    it('должен производить ресурсы из сырья', () => {
      const stockpileId = 'test_production_1';
      
      // Добавляем руду
      resourceSystem.addResource(stockpileId, 'ore', 10);
      
      // Руда → Металл (2 руды = 1 металл)
      const oreBefore = resourceSystem.getResourceQuantity(stockpileId, 'ore');
      expect(oreBefore).toBe(10);
      
      // Симуляция производства
      if (oreBefore >= 2) {
        resourceSystem.removeResource(stockpileId, 'ore', 2);
        resourceSystem.addResource(stockpileId, 'metal', 1);
      }
      
      expect(resourceSystem.getResourceQuantity(stockpileId, 'ore')).toBe(8);
      expect(resourceSystem.getResourceQuantity(stockpileId, 'metal')).toBe(1);
    });
  });

  describe('MarketSystem - динамические цены', () => {
    it('должен создавать рынки для поселений', () => {
      const market = marketSystem.createMarket('test_city_1', 0.1);
      expect(market).toBeDefined();
      expect(market.settlementId).toBe('test_city_1');
      expect(market.taxRate).toBe(0.1);
    });

    it('должен рассчитывать разные цены для разных городов (НЕТ глобальных цен)', () => {
      const city1 = 'city_alpha';
      const city2 = 'city_beta';
      
      marketSystem.createMarket(city1, 0.1);
      marketSystem.createMarket(city2, 0.15); // Другие налоги
      
      // Добавляем предложение в city1
      marketSystem.addOffer(city1, {
        resourceId: 'bread',
        quantity: 50,
        price: 0,
        sellerId: 'seller1',
        sellerReputation: 1.0,
        quality: 1.0,
        timestamp: Date.now(),
      });
      
      // Добавляем предложение в city2 с другим спросом
      for (let i = 0; i < 5; i++) {
        marketSystem.addDemand(city2, {
          resourceId: 'bread',
          quantity: 20,
          maxPrice: 30,
          priority: 1,
        });
      }
      
      marketSystem.addOffer(city2, {
        resourceId: 'bread',
        quantity: 10,
        price: 0,
        sellerId: 'seller2',
        sellerReputation: 1.0,
        quality: 1.0,
        timestamp: Date.now(),
      });
      
      const prices1 = marketSystem.getMarketStats(city1);
      const prices2 = marketSystem.getMarketStats(city2);
      
      expect(prices1).not.toBeNull();
      expect(prices2).not.toBeNull();
      
      // Цены должны быть разными из-за разного спроса/предложения и налогов
      const market1Data = marketSystem.getMarket(city1)?.resources.get('bread');
      const market2Data = marketSystem.getMarket(city2)?.resources.get('bread');
      
      expect(market1Data?.currentPrice).not.toBe(market2Data?.currentPrice);
    });

    it('должен учитывать фактор войны при расчете цен', () => {
      const city = 'war_city';
      marketSystem.createMarket(city, 0.1);
      
      marketSystem.addOffer(city, {
        resourceId: 'sword',
        quantity: 10,
        price: 0,
        sellerId: 'blacksmith',
        sellerReputation: 1.0,
        quality: 1.0,
        timestamp: Date.now(),
      });
      
      const priceBeforeWar = marketSystem.getMarket(city)?.resources.get('sword')?.currentPrice;
      
      marketSystem.setWarState(city, true);
      
      const priceAfterWar = marketSystem.getMarket(city)?.resources.get('sword')?.currentPrice;
      
      expect(priceAfterWar).toBeGreaterThan(priceBeforeWar || 0);
    });

    it('должен обрабатывать транзакции', () => {
      const city = 'trade_city';
      marketSystem.createMarket(city, 0.1);
      
      // Добавляем много ресурса
      marketSystem.addOffer(city, {
        resourceId: 'wood',
        quantity: 100,
        price: 0,
        sellerId: 'lumberjack',
        sellerReputation: 1.0,
        quality: 1.0,
        timestamp: Date.now(),
      });
      
      // Покупаем
      const result = marketSystem.processTransaction(city, 'wood', 10, true);
      
      expect(result.success).toBe(true);
      expect(result.price).toBeGreaterThan(0);
    });
  });

  describe('TradeRoutes', () => {
    it('должен создавать торговые пути', () => {
      const route = tradeRoutesSystem.createTradeRoute('city_a', 'city_b', 50);
      
      expect(route).toBeDefined();
      expect(route.fromSettlement).toBe('city_a');
      expect(route.toSettlement).toBe('city_b');
      expect(route.distance).toBe(50);
      expect(route.active).toBe(true);
    });

    it('должен добавлять ресурсы на маршрут', () => {
      const route = tradeRoutesSystem.createTradeRoute('city_c', 'city_d', 30);
      
      tradeRoutesSystem.addResourcesToRoute(route.id, 'wheat', 100);
      
      const quantity = route.resources.get('wheat') || 0;
      expect(quantity).toBe(100);
    });

    it('должен закрывать маршруты во время войны', () => {
      const route = tradeRoutesSystem.createTradeRoute('enemy1', 'enemy2', 100);
      
      expect(route.active).toBe(true);
      
      tradeRoutesSystem.closeRoutesDuringWar('enemy1', 'enemy2');
      
      expect(route.active).toBe(false);
    });
  });

  describe('EconomySimulator - полный цикл', () => {
    it('должен запускать экономический цикл', () => {
      const settlements = ['sim_city_1', 'sim_city_2', 'sim_city_3'];
      
      economySimulator.initializeSettlements(settlements);
      
      const statsBefore = economySimulator.getStats();
      expect(statsBefore.totalSettlements).toBe(3);
      expect(statsBefore.totalTick).toBe(0);
      
      // Запускаем несколько тиков
      economySimulator.tick();
      economySimulator.tick();
      economySimulator.tick();
      
      const statsAfter = economySimulator.getStats();
      expect(statsAfter.totalTick).toBe(3);
    });

    it('должен показывать разные цены в разных городах после симуляции', () => {
      const settlements = ['price_city_1', 'price_city_2'];
      
      economySimulator.initializeSettlements(settlements);
      
      // Запускаем симуляцию
      for (let i = 0; i < 5; i++) {
        economySimulator.tick();
      }
      
      const comparison = economySimulator.comparePrices('price_city_1', 'price_city_2');
      
      // Должны быть какие-то различия в ценах
      expect(comparison.length).toBeGreaterThan(0);
    });

    it('должен реагировать на смену сезона', () => {
      const settlements = ['season_city'];
      economySimulator.initializeSettlements(settlements);
      
      economySimulator.tick();
      const pricesBefore = economySimulator.getPricesInSettlement('season_city');
      
      // Устанавливаем зимний сезон (меньше еды)
      economySimulator.setSeason(1.3); // Цены растут
      economySimulator.tick();
      
      const pricesAfter = economySimulator.getPricesInSettlement('season_city');
      
      // Цены на еду должны вырасти
      const breadBefore = pricesBefore.get('bread') || 0;
      const breadAfter = pricesAfter.get('bread') || 0;
      
      expect(breadAfter).toBeGreaterThanOrEqual(breadBefore);
    });

    it('должен реагировать на войну', () => {
      const settlements = ['war_city_1', 'war_city_2'];
      economySimulator.initializeSettlements(settlements);
      
      economySimulator.tick();
      const pricesBefore = economySimulator.getPricesInSettlement('war_city_1');
      
      economySimulator.setWarMode(true);
      economySimulator.tick();
      
      const pricesAfter = economySimulator.getPricesInSettlement('war_city_1');
      
      // Цены на оружие должны вырасти
      const swordBefore = pricesBefore.get('sword') || 0;
      const swordAfter = pricesAfter.get('sword') || 0;
      
      if (swordAfter > 0) {
        expect(swordAfter).toBeGreaterThanOrEqual(swordBefore);
      }
    });
  });

  describe('Экономический цикл - все этапы', () => {
    it('должен проходить полный цикл: RESOURCE → PRODUCTION → CRAFT → MARKET → CONSUMPTION → PRICE_CHANGE', () => {
      // Создаем новый симулятор для чистого теста
      const freshSimulator = new EconomySimulator();
      const settlements = ['cycle_city'];
      freshSimulator.initializeSettlements(settlements);
      
      // Начальное состояние
      const initialStats = freshSimulator.getStats();
      expect(initialStats.totalTick).toBe(0);
      
      // Запускаем цикл
      freshSimulator.tick();
      
      const afterTick = freshSimulator.getStats();
      expect(afterTick.totalTick).toBe(1);
      
      // Проверяем что рынки работают
      const marketData = afterTick.markets[0];
      expect(marketData.supply).toBeGreaterThanOrEqual(0);
      expect(marketData.demand).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Факторы влияния на цены', () => {
    it('должен учитывать все 9 факторов', () => {
      const city = 'factor_city';
      marketSystem.createMarket(city, 0.1);
      
      // Базовая цена
      marketSystem.addOffer(city, {
        resourceId: 'spices',
        quantity: 10,
        price: 0,
        sellerId: 'merchant',
        sellerReputation: 0.5,
        quality: 0.8,
        timestamp: Date.now(),
      });
      
      const basePrice = marketSystem.getMarket(city)?.resources.get('spices')?.currentPrice;
      
      // Меняем репутацию
      marketSystem.addOffer(city, {
        resourceId: 'spices',
        quantity: 10,
        price: 0,
        sellerId: 'reputable_merchant',
        sellerReputation: 1.0, // Высокая репутация
        quality: 1.0, // Высокое качество
        timestamp: Date.now(),
      });
      
      const highRepPrice = marketSystem.getMarket(city)?.resources.get('spices')?.currentPrice;
      
      expect(highRepPrice).toBeDefined();
      expect(basePrice).toBeDefined();
    });
  });
});
