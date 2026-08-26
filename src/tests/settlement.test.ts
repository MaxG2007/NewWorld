import { describe, it, expect } from 'vitest';
import { District, DISTRICT_CONFIGS, DistrictType } from '../world/settlements/District';
import { Settlement } from '../world/settlements/Settlement';
import { SettlementGenerator } from '../world/generation/SettlementGenerator';

describe('Этап 17 — SETTLEMENT SIMULATION', () => {
  describe('District', () => {
    it('должен создавать все 10 типов районов', () => {
      const districtTypes: DistrictType[] = [
        'residential', 'market', 'craftsman', 'poor', 'rich',
        'religious', 'military', 'port', 'slums', 'administrative'
      ];

      districtTypes.forEach(type => {
        const config = DISTRICT_CONFIGS[type];
        const district = new District(config, 0, 0, 100, 100);
        
        expect(district.type).toBe(type);
        expect(district.name).toBeDefined();
        expect(district.coordinates).toBeDefined();
      });
    });

    it('должен иметь правильные характеристики для каждого типа района', () => {
      const richConfig = DISTRICT_CONFIGS.rich;
      expect(richConfig.crimeRate).toBeLessThan(0.2);
      expect(richConfig.housingCost).toBeGreaterThan(2.0);

      const slumsConfig = DISTRICT_CONFIGS.slums;
      expect(slumsConfig.crimeRate).toBeGreaterThan(0.5);
      expect(slumsConfig.housingCost).toBeLessThan(0.5);
    });

    it('должен добавлять здания и обновлять население', () => {
      const config = DISTRICT_CONFIGS.residential;
      const district = new District(config, 0, 0, 100, 100);
      
      const initialPopulation = district.population;
      district.addBuilding('house_1', 'house', 10, 10);
      
      expect(district.buildings.length).toBe(1);
      expect(district.population).toBeGreaterThan(initialPopulation);
    });

    it('должен обновлять уровень преступности', () => {
      const config = DISTRICT_CONFIGS.residential;
      const district = new District(config, 0, 0, 100, 100);
      
      const initialCrime = district.crimeRate;
      district.updateCrimeRate(0.5, { poverty: 0.8, policing: 0.2, lighting: 0.3 });
      
      expect(district.crimeRate).toBeGreaterThan(initialCrime);
    });

    it('должен сериализоваться и десериализоваться', () => {
      const config = DISTRICT_CONFIGS.market;
      const district = new District(config, 50, 50, 200, 150);
      district.addBuilding('shop_1', 'shop', 20, 30);
      
      const json = district.toJSON();
      const restored = District.fromJSON(json);
      
      expect(restored.type).toBe(district.type);
      expect(restored.name).toBe(district.name);
      expect(restored.population).toBe(district.population);
      expect(restored.buildings.length).toBe(district.buildings.length);
    });
  });

  describe('Settlement', () => {
    it('должен создавать поселение с базовыми данными', () => {
      const settlement = new Settlement('TestCity', 'city', 100, 200);
      
      expect(settlement.name).toBe('TestCity');
      expect(settlement.type).toBe('city');
      expect(settlement.coordinates).toEqual({ x: 100, y: 200 });
      expect(settlement.population).toBe(0);
    });

    it('должен добавлять районы и обновлять население', () => {
      const settlement = new Settlement('TestTown', 'town', 0, 0);
      const district = new District(DISTRICT_CONFIGS.residential, 0, 0, 100, 100);
      district.addBuilding('house_1', 'house', 10, 10);
      district.addBuilding('house_2', 'house', 20, 20);
      
      settlement.addDistrict(district);
      
      expect(settlement.districts.size).toBe(1);
      expect(settlement.population).toBeGreaterThan(0);
    });

    it('должен управлять ресурсами и ценами', () => {
      const settlement = new Settlement('TradeHub', 'city', 0, 0);
      
      settlement.updateResource('food', 1000, 50, 40, 5000);
      
      expect(settlement.resources.has('food')).toBe(true);
      const resource = settlement.resources.get('food');
      expect(resource?.amount).toBe(1000);
      expect(resource?.production).toBe(50);
      
      // Цена должна обновиться
      const price = settlement.getPrice('food');
      expect(price).toBeGreaterThan(0);
    });

    it('должен добавлять и распространять слухи', () => {
      const settlement = new Settlement('GossipTown', 'town', 0, 0);
      
      settlement.addRumor('There is a dragon nearby!', 'npc_123', 'disaster');
      
      expect(settlement.rumors.length).toBe(1);
      expect(settlement.rumors[0].content).toContain('dragon');
      
      // Распространение слухов
      settlement.spreadRumors();
      expect(settlement.rumors[0].spread).toBeGreaterThan(0.1);
    });

    it('должен добавлять торговые маршруты', () => {
      const settlement = new Settlement('PortCity', 'city', 0, 0);
      
      settlement.addTradeRoute('other_city_123', ['food', 'wood'], 7, 100);
      
      expect(settlement.tradeRoutes.length).toBe(1);
      expect(settlement.tradeRoutes[0].goods).toContain('food');
      expect(settlement.tradeRoutes[0].frequency).toBe(7);
    });

    it('должен обрабатывать торговлю по расписанию', () => {
      const settlement = new Settlement('TradeCity', 'city', 0, 0);
      settlement.updateResource('food', 500, 20, 15, 2000);
      settlement.addTradeRoute('partner_city', ['food'], 5, 100);
      
      const initialAmount = settlement.resources.get('food')?.amount || 0;
      
      // День 5 - торговля должна произойти
      settlement.processTrade(5);
      
      const afterTradeAmount = settlement.resources.get('food')?.amount || 0;
      expect(afterTradeAmount).toBeGreaterThan(initialAmount);
    });

    it('должен сериализоваться и десериализоваться', () => {
      const settlement = new Settlement('SerializableCity', 'city', 50, 60);
      const district = new District(DISTRICT_CONFIGS.market, 0, 0, 100, 100);
      settlement.addDistrict(district);
      settlement.updateResource('gold', 100, 5, 2, 500);
      
      const json = settlement.toJSON();
      const restored = Settlement.fromJSON(json);
      
      expect(restored.name).toBe(settlement.name);
      expect(restored.type).toBe(settlement.type);
      expect(json.districts.length).toBeGreaterThanOrEqual(1);
      expect(json.resources.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('SettlementGenerator', () => {
    it('должен генерировать деревню с правильными районами', () => {
      const generator = new SettlementGenerator();
      const village = generator.generate({
        name: 'SmallVillage',
        type: 'village',
        seed: 12345,
        x: 100,
        y: 200,
        hasPort: false,
        isCapital: false
      });
      
      expect(village.name).toBe('SmallVillage');
      expect(village.type).toBe('village');
      expect(village.districts.size).toBeGreaterThanOrEqual(2);
      
      // Деревня должна иметь жилой район
      const residential = village.getDistrictByType('residential');
      expect(residential).toBeDefined();
    });

    it('должен генерировать город с портом если указан', () => {
      const generator = new SettlementGenerator();
      const portCity = generator.generate({
        name: 'PortCity',
        type: 'city',
        seed: 67890,
        x: 0,
        y: 0,
        hasPort: true,
        isCapital: false
      });
      
      const port = portCity.getDistrictByType('port');
      expect(port).toBeDefined();
    });

    it('должен генерировать столицу с правительством монархии', () => {
      const generator = new SettlementGenerator();
      const capital = generator.generate({
        name: 'CapitalCity',
        type: 'capital',
        seed: 11111,
        x: 500,
        y: 500,
        hasPort: false,
        isCapital: true
      });
      
      expect(capital.government.type).toBe('monarchy');
      expect(capital.government.stability).toBeGreaterThan(0.8);
    });

    it('должен генерировать ресурсы в поселении', () => {
      const generator = new SettlementGenerator();
      const city = generator.generate({
        name: 'ResourceCity',
        type: 'city',
        seed: 22222,
        x: 0,
        y: 0,
        hasPort: false,
        isCapital: false
      });
      
      expect(city.resources.has('food')).toBe(true);
      expect(city.resources.size).toBeGreaterThanOrEqual(3);
    });

    it('должен генерировать начальные слухи', () => {
      const generator = new SettlementGenerator();
      const town = generator.generate({
        name: 'RumorTown',
        type: 'town',
        seed: 33333,
        x: 0,
        y: 0,
        hasPort: false,
        isCapital: false
      });
      
      expect(town.rumors.length).toBeGreaterThanOrEqual(1);
    });

    it('должен быть детерминированным при одинаковом seed', () => {
      const generator = new SettlementGenerator();
      
      const city1 = generator.generate({
        name: 'DeterministicCity',
        type: 'city',
        seed: 99999,
        x: 100,
        y: 100,
        hasPort: false,
        isCapital: false
      });
      
      const city2 = generator.generate({
        name: 'DeterministicCity',
        type: 'city',
        seed: 99999,
        x: 100,
        y: 100,
        hasPort: false,
        isCapital: false
      });
      
      // Одинаковый seed должен давать одинаковое количество ресурсов и тип правительства
      expect(city1.resources.size).toBe(city2.resources.size);
      expect(city1.government.type).toBe(city2.government.type);
      expect(city1.name).toBe(city2.name);
      expect(city1.type).toBe(city2.type);
    });
  });
});
