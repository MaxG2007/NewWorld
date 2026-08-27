import { GameMap, MapPoint, MapRoute, MapType, KnowledgeStatus, CartographerProfile, DiscoveryEvent } from '../../data/MapSchemas';

/**
 * Система картографии и исследования мира
 * 
 * Игрок не должен автоматически видеть карту.
 * Карты бывают: купленные, украденные, найденные, нарисованные игроком,
 * полученные как награда, религиозные, военные, подземельные.
 * 
 * Игрок может: открыть регион, отметить точку, нарисовать маршрут,
 * создать собственную карту, продать карту, спрятать часть информации.
 */
export class MapDiscoverySystem {
  private maps: Map<string, GameMap>;
  private mapPoints: Map<string, MapPoint>;
  private mapRoutes: Map<string, MapRoute>;
  private cartographerProfiles: Map<string, CartographerProfile>;
  private discoveryEvents: DiscoveryEvent[];
  
  // Знания игрока о мире
  private knownRegions: Set<string>;
  private rumoredLocations: Set<string>;
  
  constructor() {
    this.maps = new Map();
    this.mapPoints = new Map();
    this.mapRoutes = new Map();
    this.cartographerProfiles = new Map();
    this.discoveryEvents = [];
    this.knownRegions = new Set();
    this.rumoredLocations = new Set();
  }
  
  /**
   * Создать новую карту
   */
  createMap(
    name: string,
    mapType: MapType,
    creatorId: string,
    creatorType: 'Player' | 'NPC',
    centerPoint: { x: number; y: number },
    regionId: string | null = null
  ): GameMap {
    const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newMap: GameMap = {
      id: mapId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name,
      mapType,
      region: regionId ? { id: regionId, type: 'Region' } : null,
      centerPoint,
      scale: 1.0,
      rotation: 0,
      knownPoints: [],
      routes: [],
      knowledgeZones: [],
      owner: { id: creatorId, type: creatorType },
      creator: { id: creatorId, type: creatorType },
      completeness: 0,
      accuracy: 0,
      condition: 100,
      isComplete: false,
      hasSecrets: false,
      hiddenAreas: [],
      value: this.calculateMapValue(mapType),
      canBeSold: true,
      canBeCopied: true,
      discoveryRecord: null,
      metadata: {}
    };
    
    this.maps.set(mapId, newMap);
    
    // Обновить профиль картографа
    this.updateCartographerProfile(creatorId, creatorType, (profile) => {
      profile.ownedMaps.push({ id: mapId, type: 'GameMap' });
      profile.mapsCreated++;
    });
    
    return newMap;
  }
  
  /**
   * Открыть регион для игрока
   */
  openRegion(regionId: string, playerId: string): void {
    this.knownRegions.add(regionId);
    
    // Обновить профиль исследователя
    this.updateCartographerProfile(playerId, 'Player', (profile) => {
      if (!profile.knownRegions.some(r => r.id === regionId)) {
        profile.knownRegions.push({ id: regionId, type: 'Region' });
        profile.regionsDiscovered++;
      }
    });
  }
  
  /**
   * Отметить точку на карте
   */
  markPoint(
    mapId: string,
    pointData: {
      name: string;
      type: MapPoint['type'];
      x: number;
      y: number;
      description?: string;
    },
    markedBy: string
  ): MapPoint | null {
    const map = this.maps.get(mapId);
    if (!map) return null;
    
    const pointId = `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newPoint: MapPoint = {
      id: pointId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: pointData.name,
      type: pointData.type,
      x: pointData.x,
      y: pointData.y,
      knowledgeStatus: 'mapped',
      description: pointData.description || null,
      discoveredBy: { id: markedBy, type: 'Player' },
      discoveredAt: now,
      isHidden: false,
      metadata: {}
    };
    
    this.mapPoints.set(pointId, newPoint);
    map.knownPoints.push({ id: pointId, type: 'MapPoint' });
    
    // Обновить профиль
    this.updateCartographerProfile(markedBy, 'Player', (profile) => {
      profile.pointsMarked++;
    });
    
    return newPoint;
  }
  
  /**
   * Нарисовать маршрут на карте
   */
  drawRoute(
    mapId: string,
    routeName: string,
    points: Array<{ x: number; y: number }>,
    createdBy: string
  ): MapRoute | null {
    const map = this.maps.get(mapId);
    if (!map) return null;
    
    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newRoute: MapRoute = {
      id: routeId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: routeName,
      description: null,
      points: points.map((p, index) => ({ ...p, order: index })),
      distance: this.calculateRouteDistance(points),
      difficulty: this.estimateRouteDifficulty(points),
      isTraveled: false,
      createdBy: { id: createdBy, type: 'Player' },
      mapType: map.mapType
    };
    
    this.mapRoutes.set(routeId, newRoute);
    map.routes.push({ id: routeId, type: 'MapRoute' });
    
    // Обновить профиль
    this.updateCartographerProfile(createdBy, 'Player', (profile) => {
      profile.routesDrawn++;
    });
    
    return newRoute;
  }
  
  /**
   * Создать собственную карту (нарисовать)
   */
  createPlayerMap(
    name: string,
    creatorId: string,
    centerPoint: { x: number; y: number },
    regionId: string | null = null
  ): GameMap {
    return this.createMap(name, 'player_drawn', creatorId, 'Player', centerPoint, regionId);
  }
  
  /**
   * Продать карту
   */
  sellMap(mapId: string, sellerId: string, buyerId: string, _price: number): boolean {
    const map = this.maps.get(mapId);
    if (!map || !map.canBeSold) return false;
    
    // Проверить владельца
    if (!map.owner || map.owner.id !== sellerId) return false;
    
    // Сменить владельца
    map.owner = { id: buyerId, type: 'Player' };
    map.updatedAt = Date.now();
    
    // Обновить профили
    this.updateCartographerProfile(sellerId, 'Player', (profile) => {
      profile.mapsSold++;
      profile.mapsForSale = profile.mapsForSale.filter(m => m.mapId !== mapId);
    });
    
    this.updateCartographerProfile(buyerId, 'Player', (profile) => {
      profile.mapsBought++;
      profile.ownedMaps.push({ id: mapId, type: 'GameMap' });
    });
    
    return true;
  }
  
  /**
   * Спрятать часть информации на карте
   */
  hideMapArea(mapId: string, area: { x: number; y: number; radius: number }): boolean {
    const map = this.maps.get(mapId);
    if (!map) return false;
    
    map.hiddenAreas.push(area);
    map.hasSecrets = true;
    map.updatedAt = Date.now();
    
    return true;
  }
  
  /**
   * Записать событие открытия локации
   */
  recordDiscovery(
    locationName: string,
    locationType: string,
    coordinates: { x: number; y: number },
    discovererId: string,
    worldSeed: string,
    description: string,
    isFirstDiscovery: boolean,
    rewardId: string | null = null
  ): DiscoveryEvent {
    const now = Date.now();
    const discoveryEvent: DiscoveryEvent = {
      id: `discovery_${now}_${Math.random().toString(36).substr(2, 9)}`,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      locationName,
      locationType,
      coordinates,
      discoverer: { id: discovererId, type: 'Player' },
      discoveredAt: now,
      worldSeed,
      description,
      isFirstDiscovery,
      reward: rewardId ? { id: rewardId, type: 'Item' } : null,
      recordedInChronicle: isFirstDiscovery
    };
    
    this.discoveryEvents.push(discoveryEvent);
    
    // Обновить профиль первооткрывателя
    if (isFirstDiscovery) {
      this.updateCartographerProfile(discovererId, 'Player', (profile) => {
        profile.firstDiscoveries.push({
          locationName,
          locationType,
          coordinates,
          discoveredAt: now
        });
      });
    }
    
    return discoveryEvent;
  }
  
  /**
   * Получить или создать профиль картографа
   */
  getOrCreateCartographerProfile(ownerId: string, ownerType: 'Player' | 'NPC'): CartographerProfile {
    const existing = this.cartographerProfiles.get(ownerId);
    if (existing) return existing;
    
    const now = Date.now();
    const newProfile: CartographerProfile = {
      id: `carto_profile_${ownerId}`,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      ownerId,
      ownerType,
      mappingSkill: 0,
      explorationSkill: 0,
      mapsCreated: 0,
      regionsDiscovered: 0,
      pointsMarked: 0,
      routesDrawn: 0,
      mapsSold: 0,
      mapsBought: 0,
      ownedMaps: [],
      knownRegions: [],
      firstDiscoveries: [],
      mapsForSale: []
    };
    
    this.cartographerProfiles.set(ownerId, newProfile);
    return newProfile;
  }
  
  /**
   * Добавить слух о локации
   */
  addRumoredLocation(locationId: string): void {
    this.rumoredLocations.add(locationId);
  }
  
  /**
   * Получить все карты игрока
   */
  getPlayerMaps(playerId: string): GameMap[] {
    return Array.from(this.maps.values()).filter(
      map => map.owner?.id === playerId || map.creator?.id === playerId
    );
  }
  
  /**
   * Получить карту по ID
   */
  getMap(mapId: string): GameMap | undefined {
    return this.maps.get(mapId);
  }
  
  /**
   * Получить все события открытий
   */
  getDiscoveryEvents(): DiscoveryEvent[] {
    return [...this.discoveryEvents];
  }
  
  /**
   * Проверить, известна ли локация
   */
  isLocationKnown(locationId: string): boolean {
    return this.knownRegions.has(locationId);
  }
  
  /**
   * Проверить, есть ли слухи о локации
   */
  hasRumorsAbout(locationId: string): boolean {
    return this.rumoredLocations.has(locationId);
  }
  
  /**
   * Обновить статус знания точки
   */
  updateKnowledgeStatus(pointId: string, status: KnowledgeStatus): boolean {
    const point = this.mapPoints.get(pointId);
    if (!point) return false;
    
    point.knowledgeStatus = status;
    point.updatedAt = Date.now();
    return true;
  }
  
  /**
   * Серализация состояния для сохранения
   */
  serialize(): Record<string, unknown> {
    return {
      maps: Array.from(this.maps.values()),
      mapPoints: Array.from(this.mapPoints.values()),
      mapRoutes: Array.from(this.mapRoutes.values()),
      cartographerProfiles: Array.from(this.cartographerProfiles.values()),
      discoveryEvents: this.discoveryEvents,
      knownRegions: Array.from(this.knownRegions),
      rumoredLocations: Array.from(this.rumoredLocations)
    };
  }
  
  /**
   * Загрузка состояния из сохранения
   */
  deserialize(data: Record<string, unknown>): void {
    const serialized = data as {
      maps: GameMap[];
      mapPoints: MapPoint[];
      mapRoutes: MapRoute[];
      cartographerProfiles: CartographerProfile[];
      discoveryEvents: DiscoveryEvent[];
      knownRegions: string[];
      rumoredLocations: string[];
    };
    
    this.maps.clear();
    this.mapPoints.clear();
    this.mapRoutes.clear();
    this.cartographerProfiles.clear();
    this.discoveryEvents = [];
    this.knownRegions.clear();
    this.rumoredLocations.clear();
    
    if (serialized.maps) {
      serialized.maps.forEach(map => this.maps.set(map.id, map));
    }
    if (serialized.mapPoints) {
      serialized.mapPoints.forEach(point => this.mapPoints.set(point.id, point));
    }
    if (serialized.mapRoutes) {
      serialized.mapRoutes.forEach(route => this.mapRoutes.set(route.id, route));
    }
    if (serialized.cartographerProfiles) {
      serialized.cartographerProfiles.forEach(profile => 
        this.cartographerProfiles.set(profile.ownerId, profile)
      );
    }
    if (serialized.discoveryEvents) {
      this.discoveryEvents = serialized.discoveryEvents;
    }
    if (serialized.knownRegions) {
      this.knownRegions = new Set(serialized.knownRegions);
    }
    if (serialized.rumoredLocations) {
      this.rumoredLocations = new Set(serialized.rumoredLocations);
    }
  }
  
  // Приватные вспомогательные методы
  
  private calculateMapValue(mapType: MapType): number {
    const baseValues: Record<MapType, number> = {
      purchased: 50,
      stolen: 30,
      found: 40,
      player_drawn: 20,
      reward: 100,
      religious: 80,
      military: 150,
      dungeon: 200,
      regional: 60,
      settlement: 30,
      trade_route: 70,
      treasure: 300,
      ancient: 500,
      incomplete: 10
    };
    
    return baseValues[mapType] || 50;
  }
  
  private calculateRouteDistance(points: Array<{ x: number; y: number }>): number {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    
    return Math.round(totalDistance * 10) / 10;
  }
  
  private estimateRouteDifficulty(points: Array<{ x: number; y: number }>): number {
    // Упрощённая оценка сложности маршрута
    const distance = this.calculateRouteDistance(points);
    const baseDifficulty = Math.min(distance / 10, 5);
    
    // Добавить случайный фактор для вариативности
    const variation = Math.random() * 3;
    
    return Math.min(Math.round((baseDifficulty + variation) * 10) / 10, 10);
  }
  
  private updateCartographerProfile(
    ownerId: string,
    ownerType: 'Player' | 'NPC',
    updater: (profile: CartographerProfile) => void
  ): void {
    const profile = this.getOrCreateCartographerProfile(ownerId, ownerType);
    updater(profile);
  }
}

export default MapDiscoverySystem;
