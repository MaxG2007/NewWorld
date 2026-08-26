/**
 * ЭТАП 18 — ECONOMY
 * Система торговых путей между поселениями
 */

import { TradeRoute, ResourceId } from './EconomyTypes';
import { marketSystem } from './MarketSystem';

export class TradeRoutesSystem {
  private tradeRoutes: Map<string, TradeRoute> = new Map();
  private routeCounter: number = 0;

  constructor() {}

  /**
   * Создать торговый путь между двумя поселениями
   */
  createTradeRoute(
    fromSettlement: string,
    toSettlement: string,
    distance: number
  ): TradeRoute {
    const id = `route_${++this.routeCounter}`;
    
    const route: TradeRoute = {
      id,
      fromSettlement,
      toSettlement,
      resources: new Map(),
      distance,
      active: true,
      riskFactor: this.calculateRisk(distance),
      lastTrade: Date.now(),
    };

    this.tradeRoutes.set(id, route);
    return route;
  }

  /**
   * Рассчитать риск пути на основе расстояния и других факторов
   */
  private calculateRisk(distance: number): number {
    // Базовый риск растет с расстоянием
    let risk = Math.min(distance * 0.01, 0.5);
    
    // Дополнительные факторы можно добавить позже (разбойники, война)
    return risk;
  }

  getTradeRoute(id: string): TradeRoute | undefined {
    return this.tradeRoutes.get(id);
  }

  getAllTradeRoutes(): TradeRoute[] {
    return Array.from(this.tradeRoutes.values());
  }

  getRoutesForSettlement(settlementId: string): TradeRoute[] {
    return Array.from(this.tradeRoutes.values()).filter(
      route => route.fromSettlement === settlementId || route.toSettlement === settlementId
    );
  }

  /**
   * Добавить ресурсы для торговли на маршрут
   */
  addResourcesToRoute(routeId: string, resourceId: ResourceId, quantity: number): void {
    const route = this.tradeRoutes.get(routeId);
    if (!route || !route.active) return;

    const current = route.resources.get(resourceId) || 0;
    route.resources.set(resourceId, current + quantity);
  }

  /**
   * Выполнить торговую операцию по маршруту
   * Перемещает товары и выравнивает цены между городами
   */
  executeTrade(routeId: string): { success: boolean; message?: string } {
    const route = this.tradeRoutes.get(routeId);
    if (!route || !route.active) {
      return { success: false, message: 'Route not found or inactive' };
    }

    // Проверка риска (шанс неудачи)
    if (Math.random() < route.riskFactor) {
      return { success: false, message: 'Trade failed due to risks (bandits, weather)' };
    }

    const fromMarket = marketSystem.getMarket(route.fromSettlement);
    const toMarket = marketSystem.getMarket(route.toSettlement);

    if (!fromMarket || !toMarket) {
      return { success: false, message: 'One of the markets not found' };
    }

    // Перемещение ресурсов
    for (const [resourceId, quantity] of route.resources.entries()) {
      if (quantity <= 0) continue;

      // Расчет транспортной стоимости
      const transportCost = Math.floor(quantity * 0.05 * route.distance);
      const deliveredQuantity = quantity - transportCost;

      if (deliveredQuantity > 0) {
        // Удаление из источника
        const fromResult = marketSystem.processTransaction(
          route.fromSettlement,
          resourceId,
          quantity,
          true // покупка (изъятие с рынка)
        );

        if (fromResult.success) {
          // Добавление в пункт назначения
          marketSystem.processTransaction(
            route.toSettlement,
            resourceId,
            deliveredQuantity,
            false // продажа (добавление на рынок)
          );
        }
      }
    }

    route.lastTrade = Date.now();
    route.resources.clear();

    return { success: true };
  }

  /**
   * Автоматически создать торговые пути на основе разницы цен
   */
  autoCreateProfitableRoutes(settlements: string[], maxDistance: number = 100): void {
    for (let i = 0; i < settlements.length; i++) {
      for (let j = i + 1; j < settlements.length; j++) {
        const from = settlements[i];
        const to = settlements[j];
        
        // Простая эвристика расстояния
        const distance = Math.abs(i - j) * 10;
        
        if (distance <= maxDistance) {
          // Проверка是否存在 существующего маршрута
          const existing = this.getRoutesForSettlement(from).find(
            r => r.toSettlement === to || r.fromSettlement === to
          );
          
          if (!existing) {
            this.createTradeRoute(from, to, distance);
          }
        }
      }
    }
  }

  /**
   * Установить активность маршрута
   */
  setRouteActive(routeId: string, active: boolean): void {
    const route = this.tradeRoutes.get(routeId);
    if (route) {
      route.active = active;
    }
  }

  /**
   * Закрыть маршруты во время войны
   */
  closeRoutesDuringWar(settlement1: string, settlement2: string): void {
    for (const route of this.tradeRoutes.values()) {
      if (
        (route.fromSettlement === settlement1 && route.toSettlement === settlement2) ||
        (route.fromSettlement === settlement2 && route.toSettlement === settlement1)
      ) {
        route.active = false;
      }
    }
  }

  /**
   * Обработать все активные торговые пути
   */
  processAllRoutes(): { successful: number; failed: number } {
    let successful = 0;
    let failed = 0;

    for (const route of this.tradeRoutes.values()) {
      if (route.active && route.resources.size > 0) {
        const result = this.executeTrade(route.id);
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }
    }

    return { successful, failed };
  }

  /**
   * Получить статистику торговых путей
   */
  getStats(): {
    totalRoutes: number;
    activeRoutes: number;
    totalResourcesInTransit: number;
  } {
    const routes = Array.from(this.tradeRoutes.values());
    let totalResources = 0;

    for (const route of routes) {
      for (const quantity of route.resources.values()) {
        totalResources += quantity;
      }
    }

    return {
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.active).length,
      totalResourcesInTransit: totalResources,
    };
  }

  /**
   * Удалить торговый путь
   */
  removeRoute(routeId: string): boolean {
    return this.tradeRoutes.delete(routeId);
  }

  /**
   * Очистить все неактивные маршруты
   */
  cleanupInactiveRoutes(): number {
    let removed = 0;
    for (const [id, route] of this.tradeRoutes.entries()) {
      if (!route.active) {
        this.tradeRoutes.delete(id);
        removed++;
      }
    }
    return removed;
  }
}

export const tradeRoutesSystem = new TradeRoutesSystem();
