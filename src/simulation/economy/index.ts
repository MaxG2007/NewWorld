/**
 * ЭТАП 18 — ECONOMY
 * Экспорт всех модулей экономической системы
 */

export * from './EconomyTypes';
export * from './ResourceSystem';
export * from './MarketSystem';
export * from './TradeRoutes';
export * from './EconomySimulator';

import { ResourceSystem } from './ResourceSystem';
import { MarketSystem } from './MarketSystem';
import { TradeRoutesSystem } from './TradeRoutes';
import { EconomySimulator } from './EconomySimulator';

export const resourceSystem = new ResourceSystem();
export const marketSystem = new MarketSystem();
export const tradeRoutesSystem = new TradeRoutesSystem();
export const economySimulator = new EconomySimulator();
