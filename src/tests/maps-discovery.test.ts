import { describe, it, expect, beforeEach } from 'vitest';
import { MapDiscoverySystem } from '../simulation/maps/MapDiscoverySystem';
import { MapType } from '../data/MapSchemas';

describe('MapDiscoverySystem', () => {
  let mapSystem: MapDiscoverySystem;
  const testPlayerId = 'player_001';

  beforeEach(() => {
    mapSystem = new MapDiscoverySystem();
  });

  describe('Создание карт', () => {
    it('должен создавать карту с правильным типом', () => {
      const map = mapSystem.createMap(
        'Test Map',
        'purchased',
        testPlayerId,
        'Player',
        { x: 100, y: 200 }
      );

      expect(map.name).toBe('Test Map');
      expect(map.mapType).toBe('purchased');
      expect(map.owner?.id).toBe(testPlayerId);
      expect(map.centerPoint.x).toBe(100);
      expect(map.centerPoint.y).toBe(200);
    });

    it('должен создавать разные типы карт', () => {
      const mapTypes: MapType[] = [
        'purchased', 'stolen', 'found', 'player_drawn', 
        'reward', 'religious', 'military', 'dungeon'
      ];

      mapTypes.forEach(type => {
        const map = mapSystem.createMap(
          `Map ${type}`,
          type,
          testPlayerId,
          'Player',
          { x: 0, y: 0 }
        );
        expect(map.mapType).toBe(type);
      });
    });

    it('должен увеличивать счётчик созданных карт в профиле', () => {
      mapSystem.createMap('Map 1', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      mapSystem.createMap('Map 2', 'found', testPlayerId, 'Player', { x: 0, y: 0 });

      const profile = mapSystem.getOrCreateCartographerProfile(testPlayerId, 'Player');
      expect(profile.mapsCreated).toBe(2);
    });
  });

  describe('Открытие регионов', () => {
    it('должен открывать регион для игрока', () => {
      const regionId = 'region_north';
      mapSystem.openRegion(regionId, testPlayerId);

      expect(mapSystem.isLocationKnown(regionId)).toBe(true);
    });

    it('должен увеличивать счётчик открытых регионов', () => {
      mapSystem.openRegion('region_1', testPlayerId);
      mapSystem.openRegion('region_2', testPlayerId);

      const profile = mapSystem.getOrCreateCartographerProfile(testPlayerId, 'Player');
      expect(profile.regionsDiscovered).toBe(2);
    });

    it('не должен дублировать открытые регионы', () => {
      mapSystem.openRegion('region_1', testPlayerId);
      mapSystem.openRegion('region_1', testPlayerId);

      const profile = mapSystem.getOrCreateCartographerProfile(testPlayerId, 'Player');
      expect(profile.regionsDiscovered).toBe(1);
    });
  });

  describe('Отметка точек на карте', () => {
    it('должен отмечать точку на карте', () => {
      const map = mapSystem.createMap('Test', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      
      const point = mapSystem.markPoint(
        map.id,
        {
          name: 'Treasure Spot',
          type: 'landmark',
          x: 50,
          y: 75
        },
        testPlayerId
      );

      expect(point).not.toBeNull();
      expect(point!.name).toBe('Treasure Spot');
      expect(point!.x).toBe(50);
      expect(point!.y).toBe(75);
    });

    it('должен увеличивать счётчик отмеченных точек', () => {
      const map = mapSystem.createMap('Test', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      
      mapSystem.markPoint(map.id, { name: 'Point 1', type: 'landmark', x: 10, y: 10 }, testPlayerId);
      mapSystem.markPoint(map.id, { name: 'Point 2', type: 'danger', x: 20, y: 20 }, testPlayerId);

      const profile = mapSystem.getOrCreateCartographerProfile(testPlayerId, 'Player');
      expect(profile.pointsMarked).toBe(2);
    });

    it('не должен отмечать точки на несуществующей карте', () => {
      const point = mapSystem.markPoint(
        'nonexistent_map',
        { name: 'Test', type: 'landmark', x: 0, y: 0 },
        testPlayerId
      );

      expect(point).toBeNull();
    });
  });

  describe('Рисование маршрутов', () => {
    it('должен рисовать маршрут на карте', () => {
      const map = mapSystem.createMap('Test', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      
      const route = mapSystem.drawRoute(
        map.id,
        'Trade Route',
        [
          { x: 0, y: 0 },
          { x: 50, y: 50 },
          { x: 100, y: 100 }
        ],
        testPlayerId
      );

      expect(route).not.toBeNull();
      expect(route!.name).toBe('Trade Route');
      expect(route!.points.length).toBe(3);
    });

    it('должен рассчитывать расстояние маршрута', () => {
      const map = mapSystem.createMap('Test', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      
      const route = mapSystem.drawRoute(
        map.id,
        'Short Route',
        [
          { x: 0, y: 0 },
          { x: 3, y: 4 }
        ],
        testPlayerId
      );

      // Расстояние должно быть 5 (теорема Пифагора)
      expect(route!.distance).toBe(5);
    });

    it('должен увеличивать счётчик нарисованных маршрутов', () => {
      const map = mapSystem.createMap('Test', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      
      mapSystem.drawRoute(map.id, 'Route 1', [{ x: 0, y: 0 }, { x: 10, y: 10 }], testPlayerId);
      mapSystem.drawRoute(map.id, 'Route 2', [{ x: 0, y: 0 }, { x: 20, y: 20 }], testPlayerId);

      const profile = mapSystem.getOrCreateCartographerProfile(testPlayerId, 'Player');
      expect(profile.routesDrawn).toBe(2);
    });
  });

  describe('Продажа карт', () => {
    it('должен продавать карту другому игроку', () => {
      const map = mapSystem.createMap('Valuable Map', 'treasure', testPlayerId, 'Player', { x: 0, y: 0 });
      const buyerId = 'player_002';

      const success = mapSystem.sellMap(map.id, testPlayerId, buyerId, 300);

      expect(success).toBe(true);
      expect(map.owner?.id).toBe(buyerId);
    });

    it('должен обновлять статистику продаж у продавца', () => {
      const map = mapSystem.createMap('Map', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      const buyerId = 'player_002';

      mapSystem.sellMap(map.id, testPlayerId, buyerId, 50);

      const sellerProfile = mapSystem.getOrCreateCartographerProfile(testPlayerId, 'Player');
      expect(sellerProfile.mapsSold).toBe(1);
    });

    it('должен обновлять статистику покупок у покупателя', () => {
      const map = mapSystem.createMap('Map', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      const buyerId = 'player_002';

      mapSystem.sellMap(map.id, testPlayerId, buyerId, 50);

      const buyerProfile = mapSystem.getOrCreateCartographerProfile(buyerId, 'Player');
      expect(buyerProfile.mapsBought).toBe(1);
    });

    it('не должен продавать чужую карту', () => {
      const map = mapSystem.createMap('Map', 'purchased', 'original_owner', 'Player', { x: 0, y: 0 });

      const success = mapSystem.sellMap(map.id, testPlayerId, 'buyer', 50);

      expect(success).toBe(false);
    });
  });

  describe('Скрытие информации на карте', () => {
    it('должен скрывать область на карте', () => {
      const map = mapSystem.createMap('Secret Map', 'treasure', testPlayerId, 'Player', { x: 0, y: 0 });

      const success = mapSystem.hideMapArea(map.id, { x: 50, y: 50, radius: 10 });

      expect(success).toBe(true);
      expect(map.hasSecrets).toBe(true);
      expect(map.hiddenAreas.length).toBe(1);
    });

    it('должен добавлять несколько скрытых областей', () => {
      const map = mapSystem.createMap('Secret Map', 'treasure', testPlayerId, 'Player', { x: 0, y: 0 });

      mapSystem.hideMapArea(map.id, { x: 10, y: 10, radius: 5 });
      mapSystem.hideMapArea(map.id, { x: 90, y: 90, radius: 15 });

      expect(map.hiddenAreas.length).toBe(2);
    });
  });

  describe('Запись событий открытий', () => {
    it('должен записывать событие открытия локации', () => {
      const discovery = mapSystem.recordDiscovery(
        'Ancient Ruins',
        'dungeon',
        { x: 500, y: 300 },
        testPlayerId,
        'world_seed_123',
        'Old ruins with treasures',
        true
      );

      expect(discovery.locationName).toBe('Ancient Ruins');
      expect(discovery.discoverer.id).toBe(testPlayerId);
      expect(discovery.isFirstDiscovery).toBe(true);
      expect(discovery.recordedInChronicle).toBe(true);
    });

    it('должен добавлять открытие в профиль игрока', () => {
      mapSystem.recordDiscovery(
        'Cave',
        'cave',
        { x: 100, y: 100 },
        testPlayerId,
        'seed',
        'description',
        true
      );

      const profile = mapSystem.getOrCreateCartographerProfile(testPlayerId, 'Player');
      expect(profile.firstDiscoveries.length).toBe(1);
      expect(profile.firstDiscoveries[0].locationName).toBe('Cave');
    });

    it('должен сохранять все события открытий', () => {
      mapSystem.recordDiscovery('Location 1', 'type1', { x: 1, y: 1 }, testPlayerId, 'seed', 'desc', true);
      mapSystem.recordDiscovery('Location 2', 'type2', { x: 2, y: 2 }, testPlayerId, 'seed', 'desc', false);

      const events = mapSystem.getDiscoveryEvents();
      expect(events.length).toBe(2);
    });
  });

  describe('Слухи о локациях', () => {
    it('должен добавлять слухи о локациях', () => {
      const locationId = 'mysterious_forest';
      mapSystem.addRumoredLocation(locationId);

      expect(mapSystem.hasRumorsAbout(locationId)).toBe(true);
    });

    it('не должен показывать слухи о неизвестных локациях', () => {
      expect(mapSystem.hasRumorsAbout('unknown_place')).toBe(false);
    });
  });

  describe('Получение карт игрока', () => {
    it('должен возвращать карты игрока', () => {
      mapSystem.createMap('Map 1', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      mapSystem.createMap('Map 2', 'found', testPlayerId, 'Player', { x: 0, y: 0 });
      mapSystem.createMap('Map 3', 'ancient', 'other_player', 'Player', { x: 0, y: 0 });

      const playerMaps = mapSystem.getPlayerMaps(testPlayerId);
      expect(playerMaps.length).toBe(2);
    });
  });

  describe('Сериализация и десериализация', () => {
    it('должен сериализовать состояние системы', () => {
      mapSystem.createMap('Test Map', 'purchased', testPlayerId, 'Player', { x: 100, y: 200 });
      mapSystem.openRegion('test_region', testPlayerId);
      mapSystem.addRumoredLocation('rumored_location');

      const serialized = mapSystem.serialize();

      expect(serialized.maps).toBeDefined();
      expect(serialized.knownRegions).toBeDefined();
      expect(serialized.rumoredLocations).toBeDefined();
    });

    it('должен восстанавливать состояние из сериализации', () => {
      // Создать начальное состояние
      const map = mapSystem.createMap('Restore Test', 'treasure', testPlayerId, 'Player', { x: 50, y: 50 });
      mapSystem.openRegion('region_to_restore', testPlayerId);
      mapSystem.addRumoredLocation('rumor_to_restore');

      const serialized = mapSystem.serialize();

      // Создать новую систему и восстановить
      const newSystem = new MapDiscoverySystem();
      newSystem.deserialize(serialized);

      // Проверить восстановление
      const restoredMap = newSystem.getMap(map.id);
      expect(restoredMap).toBeDefined();
      expect(restoredMap!.name).toBe('Restore Test');
      expect(newSystem.isLocationKnown('region_to_restore')).toBe(true);
      expect(newSystem.hasRumorsAbout('rumor_to_restore')).toBe(true);
    });
  });

  describe('Обновление статуса знания', () => {
    it('должен обновлять статус знания точки', () => {
      const map = mapSystem.createMap('Test', 'purchased', testPlayerId, 'Player', { x: 0, y: 0 });
      const point = mapSystem.markPoint(
        map.id,
        { name: 'Test Point', type: 'landmark', x: 10, y: 10 },
        testPlayerId
      );

      expect(point!.knowledgeStatus).toBe('mapped');

      const updated = mapSystem.updateKnowledgeStatus(point!.id, 'verified');
      
      expect(updated).toBe(true);
      expect(point!.knowledgeStatus).toBe('verified');
    });
  });

  describe('Расчёт стоимости карт', () => {
    it('должен правильно рассчитывать стоимость разных типов карт', () => {
      const treasureMap = mapSystem.createMap('Treasure', 'treasure', testPlayerId, 'Player', { x: 0, y: 0 });
      const ancientMap = mapSystem.createMap('Ancient', 'ancient', testPlayerId, 'Player', { x: 0, y: 0 });
      const incompleteMap = mapSystem.createMap('Incomplete', 'incomplete', testPlayerId, 'Player', { x: 0, y: 0 });

      expect(treasureMap.value).toBe(300);
      expect(ancientMap.value).toBe(500);
      expect(incompleteMap.value).toBe(10);
    });
  });
});
