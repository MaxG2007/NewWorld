/**
 * ЭТАП 38 — TESTING + DEBUG
 * 
 * Unit tests и Simulation tests для проверки стабильности систем игры.
 * 
 * Unit тесты покрывают:
 * - damage (система урона)
 * - RNG (генератор случайных чисел)
 * - pathfinding (поиск пути)
 * - economy (экономика)
 * - age (возраст и время)
 * - genealogy (генеалогия)
 * - crafting (крафт)
 * - rumors (слухи)
 * - law (правовая система)
 * - save/load (сохранения)
 * 
 * Simulation тесты запускают мир без игрока на длительные периоды:
 * - 100 лет
 * - 1000 лет
 * - 10000 дней NPC
 * 
 * Проверяют:
 * - исчезли ли города
 * - сломалась ли экономика
 * - появились ли бесконечные деньги
 * - не зациклились ли события
 * - не разрушилась ли генеалогия
 */

// Types
export * from './types/TestTypes';

// Unit Tests
export { DamageTest } from './unit/DamageTest';
export { RNGTest } from './unit/RNGTest';
export { PathfindingTest } from './unit/PathfindingTest';
export { EconomyTest } from './unit/EconomyTest';
export { AgeTest } from './unit/AgeTest';
export { GenealogyTest } from './unit/GenealogyTest';
export { CraftingTest } from './unit/CraftingTest';
export { RumorsTest } from './unit/RumorsTest';
export { LawTest } from './unit/LawTest';
export { SaveLoadTest } from './unit/SaveLoadTest';

// Simulation Tests
export { WorldSimulationTest } from './simulation/WorldSimulationTest';

// Test Runner
export { TestRunner, runTests } from './TestRunner';
