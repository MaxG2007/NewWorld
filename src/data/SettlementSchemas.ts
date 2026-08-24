import { BaseEntity, EntityRef } from './BaseTypes';

/**
 * Страна/государство
 */
export interface Country extends BaseEntity {
  name: string;
  type: 'kingdom' | 'empire' | 'republic' | 'tribe' | 'city-state' | 'theocracy';
  capital: EntityRef<'Settlement'> | null;
  ruler: EntityRef<'NPC'> | null;
  culture: EntityRef<'Culture'>;
  religion: EntityRef<'Religion'> | null;
  laws: EntityRef<'Law'>[];
  territories: EntityRef<'Settlement'>[];
  relations: Record<string, 'allied' | 'neutral' | 'hostile' | 'war'>; // countryId -> отношение
  resources: EntityRef<'Item'>[];
  armySize: number;
  population: number;
  treasury: number;
}

/**
 * Поселение (город, деревня)
 */
export interface Settlement extends BaseEntity {
  name: string;
  type: 'village' | 'town' | 'city' | 'fortress' | 'monastery' | 'outpost';
  country: EntityRef<'Country'> | null;
  culture: EntityRef<'Culture'>;
  population: number;
  districts: EntityRef<'District'>[];
  buildings: EntityRef<'Building'>[];
  marketPrices: Record<string, number>; // itemId -> цена
  crimeRate: number; // 0-1
  guards: EntityRef<'NPC'>[];
  leader: EntityRef<'NPC'> | null;
  tradeRoutes: EntityRef<'Settlement'>[];
  rumors: EntityRef<'Rumor'>[];
}

/**
 * Район поселения
 */
export interface District extends BaseEntity {
  name: string;
  type:
    | 'residential'
    | 'market'
    | 'craftsman'
    | 'poor'
    | 'rich'
    | 'religious'
    | 'military'
    | 'port'
    | 'slums'
    | 'administrative';
  settlement: EntityRef<'Settlement'>;
  buildings: EntityRef<'Building'>[];
  safetyLevel: number; // 0-10
  cleanliness: number; // 0-10
  population: number;
}

/**
 * Здание
 */
export interface Building extends BaseEntity {
  name: string;
  type:
    | 'house'
    | 'shop'
    | 'tavern'
    | 'temple'
    | 'barracks'
    | 'workshop'
    | 'warehouse'
    | 'castle'
    | 'farm'
    | 'mine'
    | 'library'
    | 'guild';
  location: EntityRef<'District'> | EntityRef<'Chunk'>;
  owner: EntityRef<'NPC' | 'Family'> | null;
  rooms: EntityRef<'Room'>[];
  floors: number;
  condition: number; // 0-100
  value: number;
  isAccessible: boolean;
}

/**
 * Комната в здании
 */
export interface Room extends BaseEntity {
  name: string;
  type:
    | 'bedroom'
    | 'kitchen'
    | 'storage'
    | 'workshop'
    | 'hall'
    | 'cellar'
    | 'attic'
    | 'bathroom'
    | 'throne'
    | 'shrine';
  building: EntityRef<'Building'>;
  floor: number;
  size: { width: number; height: number };
  furniture: EntityRef<'Item'>[];
  containers: EntityRef<'Item'>[]; // сундуки, шкафы
  isLocked: boolean;
  lightLevel: number; // 0-10
}
