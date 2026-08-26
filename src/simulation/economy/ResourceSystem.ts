/**
 * ЭТАП 18 — ECONOMY
 * Система ресурсов и производства
 * Цикл: RESOURCE → PRODUCTION → CRAFT
 */

import { Resource, ResourceId, ProductionBuilding } from './EconomyTypes';

export class ResourceSystem {
  private resources: Map<ResourceId, Resource> = new Map();
  private productionBuildings: Map<string, ProductionBuilding> = new Map();
  private resourceStockpiles: Map<string, Map<ResourceId, number>> = new Map();

  constructor() {
    this.initializeBaseResources();
  }

  private initializeBaseResources(): void {
    // Сырье
    this.registerResource({
      id: 'wood',
      name: 'Древесина',
      category: 'raw',
      basePrice: 10,
    });

    this.registerResource({
      id: 'stone',
      name: 'Камень',
      category: 'raw',
      basePrice: 15,
    });

    this.registerResource({
      id: 'ore',
      name: 'Руда',
      category: 'raw',
      basePrice: 20,
    });

    this.registerResource({
      id: 'wheat',
      name: 'Пшеница',
      category: 'food',
      basePrice: 5,
    });

    this.registerResource({
      id: 'cotton',
      name: 'Хлопок',
      category: 'raw',
      basePrice: 8,
    });

    // Обработанные ресурсы
    this.registerResource({
      id: 'metal',
      name: 'Металл',
      category: 'processed',
      basePrice: 40,
    });

    this.registerResource({
      id: 'fabric',
      name: 'Ткань',
      category: 'processed',
      basePrice: 25,
    });

    this.registerResource({
      id: 'bread',
      name: 'Хлеб',
      category: 'food',
      basePrice: 12,
    });

    // Крафтовые предметы
    this.registerResource({
      id: 'sword',
      name: 'Меч',
      category: 'crafted',
      basePrice: 150,
    });

    this.registerResource({
      id: 'armor',
      name: 'Броня',
      category: 'crafted',
      basePrice: 200,
    });

    this.registerResource({
      id: 'tools',
      name: 'Инструменты',
      category: 'crafted',
      basePrice: 50,
    });

    // Роскошь
    this.registerResource({
      id: 'jewelry',
      name: 'Украшения',
      category: 'luxury',
      basePrice: 300,
    });

    this.registerResource({
      id: 'spices',
      name: 'Специи',
      category: 'luxury',
      basePrice: 80,
    });
  }

  registerResource(resource: Resource): void {
    this.resources.set(resource.id, resource);
  }

  getResource(id: ResourceId): Resource | undefined {
    return this.resources.get(id);
  }

  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  registerProductionBuilding(building: ProductionBuilding): void {
    this.productionBuildings.set(building.id, building);
  }

  getProductionBuilding(id: string): ProductionBuilding | undefined {
    return this.productionBuildings.get(id);
  }

  /**
   * Произвести ресурс в здании производства
   */
  produce(buildingId: string, stockpileId: string): boolean {
    const building = this.productionBuildings.get(buildingId);
    if (!building || !building.active) {
      return false;
    }

    const stockpile = this.getResourceStockpile(stockpileId);

    // Проверка наличия входных ресурсов
    for (const [resourceId, quantity] of building.inputResources.entries()) {
      const available = stockpile.get(resourceId) || 0;
      if (available < quantity) {
        return false; // Недостаточно ресурсов
      }
    }

    // Потребление входных ресурсов
    for (const [resourceId, quantity] of building.inputResources.entries()) {
      stockpile.set(resourceId, (stockpile.get(resourceId) || 0) - quantity);
    }

    // Производство выходных ресурсов
    for (const [resourceId, quantity] of building.outputResources.entries()) {
      const current = stockpile.get(resourceId) || 0;
      stockpile.set(resourceId, current + quantity * building.efficiency);
    }

    return true;
  }

  /**
   * Получить склад ресурсов для поселения/объекта
   */
  getResourceStockpile(stockpileId: string): Map<ResourceId, number> {
    if (!this.resourceStockpiles.has(stockpileId)) {
      this.resourceStockpiles.set(stockpileId, new Map());
    }
    return this.resourceStockpiles.get(stockpileId)!;
  }

  /**
   * Добавить ресурс на склад
   */
  addResource(stockpileId: string, resourceId: ResourceId, quantity: number): void {
    const stockpile = this.getResourceStockpile(stockpileId);
    stockpile.set(resourceId, (stockpile.get(resourceId) || 0) + quantity);
  }

  /**
   * Удалить ресурс со склада
   */
  removeResource(stockpileId: string, resourceId: ResourceId, quantity: number): boolean {
    const stockpile = this.getResourceStockpile(stockpileId);
    const current = stockpile.get(resourceId) || 0;
    
    if (current >= quantity) {
      stockpile.set(resourceId, current - quantity);
      return true;
    }
    return false;
  }

  /**
   * Получить количество ресурса на складе
   */
  getResourceQuantity(stockpileId: string, resourceId: ResourceId): number {
    const stockpile = this.getResourceStockpile(stockpileId);
    return stockpile.get(resourceId) || 0;
  }

  /**
   * Произвести все доступные ресурсы во всех зданиях
   */
  processAllProduction(settlementId: string): void {
    
    for (const building of this.productionBuildings.values()) {
      if (building.active) {
        this.produce(building.id, settlementId);
      }
    }
  }

  /**
   * Получить цепочку производства для ресурса
   */
  getProductionChain(resourceId: ResourceId): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();
    
    const findInputs = (id: ResourceId) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      for (const building of this.productionBuildings.values()) {
        if (building.outputResources.has(id)) {
          for (const [inputId] of building.inputResources.entries()) {
            chain.push(inputId);
            findInputs(inputId);
          }
        }
      }
    };
    
    findInputs(resourceId);
    return chain;
  }
}

export const resourceSystem = new ResourceSystem();
