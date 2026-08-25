import { BiomeConfig } from './BiomeConfig';

/**
 * База данных всех биомов мира
 */
export class BiomeDatabase {
  private static biomes: Map<string, BiomeConfig> = new Map();

  static initialize(): void {
    // Поля (Plains)
    this.registerBiome({
      id: 'plains',
      name: 'Поля',
      vegetation: ['grass', 'shrubs'],
      fauna: ['rabbit', 'deer', 'horse', 'cow', 'sheep', 'wolf'],
      resources: ['grain', 'livestock', 'wool', 'honey'],
      soilType: 'fertile_loam',
      climate: {
        temperatureRange: [5, 25],
        humidityRange: [0.3, 0.6],
        precipitationLevel: 'medium',
        seasonalVariation: 'moderate',
      },
      eventChance: 0.15,
      characteristicNPCs: ['farmer', 'shepherd', 'merchant', 'knight'],
      hazards: [
        { id: 'bandits', name: 'Бандиты', type: 'predator', severity: 'medium', description: 'Нападения бандитов на торговых путях' },
        { id: 'drought', name: 'Засуха', type: 'environmental', severity: 'high', description: 'Периоды засухи уничтожают урожай' },
      ],
      minElevation: 0.1,
      maxElevation: 0.4,
      minTemperature: 0.3,
      maxTemperature: 0.7,
      minHumidity: 0.3,
      maxHumidity: 0.6,
    });

    // Лес (Forest)
    this.registerBiome({
      id: 'forest',
      name: 'Лес',
      vegetation: ['deciduous_trees', 'shrubs', 'moss', 'grass'],
      fauna: ['deer', 'boar', 'bear', 'fox', 'owl', 'squirrel', 'wolf'],
      resources: ['wood', 'herbs', 'game', 'mushrooms', 'berries', 'resin'],
      soilType: 'fertile_loam',
      climate: {
        temperatureRange: [0, 22],
        humidityRange: [0.5, 0.8],
        precipitationLevel: 'medium',
        seasonalVariation: 'moderate',
      },
      eventChance: 0.2,
      characteristicNPCs: ['hunter', 'woodcutter', 'druid', 'hermit', 'ranger'],
      hazards: [
        { id: 'wild_beasts', name: 'Дикие звери', type: 'predator', severity: 'medium', description: 'Волки, медведи и другие хищники' },
        { id: 'getting_lost', name: 'Потеря ориентира', type: 'terrain', severity: 'low', description: 'Легко заблудиться в густом лесу' },
      ],
      minElevation: 0.1,
      maxElevation: 0.6,
      minTemperature: 0.2,
      maxTemperature: 0.6,
      minHumidity: 0.5,
      maxHumidity: 0.8,
    });

    // Болото (Swamp)
    this.registerBiome({
      id: 'swamp',
      name: 'Болото',
      vegetation: ['reeds', 'moss', 'shrubs', 'lichen'],
      fauna: ['frog', 'snake', 'crocodile', 'heron', 'mosquito', 'boar'],
      resources: ['peat', 'reeds', 'fish', 'medicinal_herbs', 'clay'],
      soilType: 'peat',
      climate: {
        temperatureRange: [5, 28],
        humidityRange: [0.7, 1.0],
        precipitationLevel: 'high',
        seasonalVariation: 'mild',
      },
      eventChance: 0.25,
      characteristicNPCs: ['witch', 'alchemist', 'fisherman', 'outcast'],
      hazards: [
        { id: 'disease', name: 'Болотная лихорадка', type: 'disease', severity: 'high', description: 'Болезни от стоячей воды' },
        { id: 'quicksand', name: 'Трясина', type: 'terrain', severity: 'high', description: 'Риск увязнуть в трясине' },
        { id: 'poisonous_creatures', name: 'Ядовитые существа', type: 'predator', severity: 'medium', description: 'Змеи и ядовитые насекомые' },
      ],
      minElevation: 0,
      maxElevation: 0.15,
      minTemperature: 0.3,
      maxTemperature: 0.8,
      minHumidity: 0.7,
      maxHumidity: 1.0,
    });

    // Пустыня (Desert)
    this.registerBiome({
      id: 'desert',
      name: 'Пустыня',
      vegetation: ['cacti', 'shrubs', 'none'],
      fauna: ['camel', 'scorpion', 'snake', 'lizard', 'falcon', 'jackal'],
      resources: ['salt', 'oil', 'glass_sand', 'gems', 'gold'],
      soilType: 'sandy',
      climate: {
        temperatureRange: [15, 45],
        humidityRange: [0, 0.2],
        precipitationLevel: 'none',
        seasonalVariation: 'mild',
      },
      eventChance: 0.1,
      characteristicNPCs: ['nomad', 'merchant', 'tribesman', 'scholar', 'guide'],
      hazards: [
        { id: 'dehydration', name: 'Обезвоживание', type: 'environmental', severity: 'extreme', description: 'Смертельная опасность без воды' },
        { id: 'sandstorm', name: 'Песчаная буря', type: 'environmental', severity: 'high', description: 'Бури скрывают путь и опасны для дыхания' },
        { id: 'extreme_heat', name: 'Экстремальная жара', type: 'environmental', severity: 'high', description: 'Тепловой удар днем' },
      ],
      minElevation: 0.1,
      maxElevation: 0.5,
      minTemperature: 0.6,
      maxTemperature: 1.0,
      minHumidity: 0,
      maxHumidity: 0.3,
    });

    // Горы (Mountain)
    this.registerBiome({
      id: 'mountain',
      name: 'Горы',
      vegetation: ['coniferous_trees', 'moss', 'lichen', 'grass'],
      fauna: ['goat', 'eagle', 'marmot', 'snow_leopard', 'bear'],
      resources: ['ore', 'gems', 'stone', 'metal', 'crystal', 'marble'],
      soilType: 'rocky',
      climate: {
        temperatureRange: [-15, 15],
        humidityRange: [0.2, 0.5],
        precipitationLevel: 'medium',
        seasonalVariation: 'extreme',
      },
      eventChance: 0.15,
      characteristicNPCs: ['miner', 'monk', 'hermit', 'climber', 'dwarf'],
      hazards: [
        { id: 'avalanche', name: 'Лавина', type: 'environmental', severity: 'extreme', description: 'Снежные лавины зимой' },
        { id: 'falling', name: 'Падение', type: 'terrain', severity: 'extreme', description: 'Опасность падения с высоты' },
        { id: 'altitude_sickness', name: 'Горная болезнь', type: 'disease', severity: 'medium', description: 'Нехватка кислорода на высоте' },
      ],
      minElevation: 0.7,
      maxElevation: 1.0,
      minTemperature: 0,
      maxTemperature: 0.4,
      minHumidity: 0.2,
      maxHumidity: 0.5,
    });

    // Тундра (Tundra)
    this.registerBiome({
      id: 'tundra',
      name: 'Тундра',
      vegetation: ['moss', 'lichen', 'grass', 'shrubs'],
      fauna: ['reindeer', 'arctic_fox', 'polar_bear', 'lemming', 'snow_owl', 'walrus'],
      resources: ['fur', 'ice', 'fish', 'whale_oil', 'ivory'],
      soilType: 'permafrost',
      climate: {
        temperatureRange: [-40, 5],
        humidityRange: [0.3, 0.6],
        precipitationLevel: 'low',
        seasonalVariation: 'extreme',
      },
      eventChance: 0.12,
      characteristicNPCs: ['hunter', 'tribesman', 'shaman', 'trapper'],
      hazards: [
        { id: 'freezing', name: 'Замерзание', type: 'environmental', severity: 'extreme', description: 'Смертельный холод' },
        { id: 'blizzard', name: 'Метель', type: 'environmental', severity: 'high', description: 'Снежные бури скрывают путь' },
        { id: 'polar_bears', name: 'Белые медведи', type: 'predator', severity: 'high', description: 'Опасные хищники' },
      ],
      minElevation: 0.1,
      maxElevation: 0.4,
      minTemperature: 0,
      maxTemperature: 0.2,
      minHumidity: 0.3,
      maxHumidity: 0.6,
    });

    // Побережье (Coast)
    this.registerBiome({
      id: 'coast',
      name: 'Побережье',
      vegetation: ['grass', 'shrubs', 'kelp', 'reeds'],
      fauna: ['fish', 'seagull', 'crab', 'seal', 'dolphin', 'whale'],
      resources: ['fish', 'salt', 'pearls', 'coral', 'amber', 'ship_materials'],
      soilType: 'sandy',
      climate: {
        temperatureRange: [0, 30],
        humidityRange: [0.5, 0.9],
        precipitationLevel: 'medium',
        seasonalVariation: 'mild',
      },
      eventChance: 0.18,
      characteristicNPCs: ['fisherman', 'sailor', 'merchant', 'pirate', 'shipwright'],
      hazards: [
        { id: 'storms', name: 'Штормы', type: 'environmental', severity: 'high', description: 'Морские штормы опасны для судов' },
        { id: 'pirates', name: 'Пираты', type: 'predator', severity: 'high', description: 'Нападения пиратов' },
        { id: 'riptides', name: 'Отбойные течения', type: 'terrain', severity: 'medium', description: 'Опасные течения у берега' },
      ],
      minElevation: 0,
      maxElevation: 0.1,
      minTemperature: 0.2,
      maxTemperature: 0.8,
      minHumidity: 0.5,
      maxHumidity: 0.9,
    });

    // Река (River)
    this.registerBiome({
      id: 'river',
      name: 'Река',
      vegetation: ['reeds', 'deciduous_trees', 'grass'],
      fauna: ['fish', 'beaver', 'otter', 'heron', 'crocodile', 'turtle'],
      resources: ['fish', 'fresh_water', 'clay', 'alluvial_gold', 'reeds'],
      soilType: 'alluvial',
      climate: {
        temperatureRange: [-5, 30],
        humidityRange: [0.6, 1.0],
        precipitationLevel: 'medium',
        seasonalVariation: 'moderate',
      },
      eventChance: 0.15,
      characteristicNPCs: ['fisherman', 'ferryman', 'merchant', 'millers'],
      hazards: [
        { id: 'flooding', name: 'Наводнение', type: 'environmental', severity: 'high', description: 'Сезонные разливы рек' },
        { id: 'drowning', name: 'Утопление', type: 'terrain', severity: 'medium', description: 'Быстрое течение' },
      ],
      minElevation: 0,
      maxElevation: 0.3,
      minTemperature: 0.1,
      maxTemperature: 0.9,
      minHumidity: 0.6,
      maxHumidity: 1.0,
    });

    // Озеро (Lake)
    this.registerBiome({
      id: 'lake',
      name: 'Озеро',
      vegetation: ['reeds', 'kelp', 'deciduous_trees'],
      fauna: ['fish', 'duck', 'swan', 'pike', 'carp', 'frog'],
      resources: ['fish', 'fresh_water', 'reeds', 'clay', 'pearls'],
      soilType: 'alluvial',
      climate: {
        temperatureRange: [-5, 28],
        humidityRange: [0.5, 0.9],
        precipitationLevel: 'medium',
        seasonalVariation: 'moderate',
      },
      eventChance: 0.12,
      characteristicNPCs: ['fisherman', 'boatman', 'hermit'],
      hazards: [
        { id: 'drowning', name: 'Утопление', type: 'terrain', severity: 'medium', description: 'Глубокая вода' },
        { id: 'ice_breaking', name: 'Тонкий лед', type: 'environmental', severity: 'high', description: 'Зимой лед может быть тонким' },
      ],
      minElevation: 0,
      maxElevation: 0.25,
      minTemperature: 0.1,
      maxTemperature: 0.8,
      minHumidity: 0.5,
      maxHumidity: 0.9,
    });

    // Подземные зоны (Underground)
    this.registerBiome({
      id: 'underground',
      name: 'Подземелье',
      vegetation: ['moss', 'lichen', 'fungi', 'none'],
      fauna: ['bat', 'cave_fish', 'giant_spider', 'mole', 'cave_cricket'],
      resources: ['deep_ore', 'crystals', 'ancient_artifacts', 'gems', 'mushrooms', 'glowstone'],
      soilType: 'stone',
      climate: {
        temperatureRange: [5, 15],
        humidityRange: [0.4, 0.8],
        precipitationLevel: 'none',
        seasonalVariation: 'none',
      },
      eventChance: 0.3,
      characteristicNPCs: ['miner', 'dwarf', 'troglodyte', 'explorer', 'dark_cultist'],
      hazards: [
        { id: 'cave_in', name: 'Обвал', type: 'terrain', severity: 'extreme', description: 'Внезапные обвалы породы' },
        { id: 'getting_lost', name: 'Потеря пути', type: 'terrain', severity: 'high', description: 'Лабиринты пещер' },
        { id: 'darkness', name: 'Темнота', type: 'environmental', severity: 'medium', description: 'Полная темнота без источника света' },
        { id: 'poison_gas', name: 'Ядовитый газ', type: 'environmental', severity: 'high', description: 'Скопления газов в глубине' },
      ],
      minElevation: -1,
      maxElevation: 0.1,
      minTemperature: 0.2,
      maxTemperature: 0.4,
      minHumidity: 0.4,
      maxHumidity: 0.8,
    });

    // Джунгли (Jungle) - дополнительный биом
    this.registerBiome({
      id: 'jungle',
      name: 'Джунгли',
      vegetation: ['tropical_trees', 'vines', 'ferns', 'orchids'],
      fauna: ['monkey', 'jaguar', 'parrot', 'snake', 'toucan', 'tapir'],
      resources: ['exotic_wood', 'spices', 'rare_herbs', 'fruits', 'rubber'],
      soilType: 'fertile_loam',
      climate: {
        temperatureRange: [20, 35],
        humidityRange: [0.7, 1.0],
        precipitationLevel: 'high',
        seasonalVariation: 'none',
      },
      eventChance: 0.25,
      characteristicNPCs: ['tribesman', 'explorer', 'shaman', 'treasure_hunter'],
      hazards: [
        { id: 'poisonous_creatures', name: 'Ядовитые существа', type: 'predator', severity: 'high', description: 'Много ядовитых змей и насекомых' },
        { id: 'disease', name: 'Тропические болезни', type: 'disease', severity: 'high', description: 'Малярия и другие болезни' },
        { id: 'dense_vegetation', name: 'Густая растительность', type: 'terrain', severity: 'medium', description: 'Труднопроходимые заросли' },
      ],
      minElevation: 0.1,
      maxElevation: 0.5,
      minTemperature: 0.7,
      maxTemperature: 1.0,
      minHumidity: 0.7,
      maxHumidity: 1.0,
    });

    // Саванна (Savanna) - дополнительный биом
    this.registerBiome({
      id: 'savanna',
      name: 'Саванна',
      vegetation: ['grass', 'acacia_trees', 'shrubs'],
      fauna: ['lion', 'elephant', 'zebra', 'giraffe', 'hyena', 'buffalo'],
      resources: ['ivory', 'gold', 'cattle', 'leather', 'feathers'],
      soilType: 'sandy',
      climate: {
        temperatureRange: [15, 35],
        humidityRange: [0.2, 0.5],
        precipitationLevel: 'low',
        seasonalVariation: 'moderate',
      },
      eventChance: 0.18,
      characteristicNPCs: ['tribesman', 'hunter', 'nomad', 'warrior'],
      hazards: [
        { id: 'predators', name: 'Хищники', type: 'predator', severity: 'high', description: 'Львы, гиены и другие хищники' },
        { id: 'drought', name: 'Засуха', type: 'environmental', severity: 'high', description: 'Сезонные засухи' },
      ],
      minElevation: 0.2,
      maxElevation: 0.5,
      minTemperature: 0.5,
      maxTemperature: 0.9,
      minHumidity: 0.2,
      maxHumidity: 0.5,
    });

    // Тайга (Taiga) - дополнительный биом
    this.registerBiome({
      id: 'taiga',
      name: 'Тайга',
      vegetation: ['coniferous_trees', 'moss', 'lichen', 'berries'],
      fauna: ['moose', 'bear', 'wolf', 'lynx', 'hare', 'grouse'],
      resources: ['pine_wood', 'fur', 'berries', 'resin', 'game'],
      soilType: 'permafrost',
      climate: {
        temperatureRange: [-25, 20],
        humidityRange: [0.4, 0.7],
        precipitationLevel: 'medium',
        seasonalVariation: 'extreme',
      },
      eventChance: 0.15,
      characteristicNPCs: ['hunter', 'trapper', 'logger', 'tribesman'],
      hazards: [
        { id: 'freezing', name: 'Замерзание', type: 'environmental', severity: 'high', description: 'Холодные зимы' },
        { id: 'predators', name: 'Хищники', type: 'predator', severity: 'medium', description: 'Волки и медведи' },
      ],
      minElevation: 0.2,
      maxElevation: 0.6,
      minTemperature: 0,
      maxTemperature: 0.4,
      minHumidity: 0.4,
      maxHumidity: 0.7,
    });
  }

  private static registerBiome(config: BiomeConfig): void {
    this.biomes.set(config.id, config);
  }

  /**
   * Получает конфигурацию биома по ID
   */
  static getBiome(id: string): BiomeConfig | undefined {
    return this.biomes.get(id);
  }

  /**
   * Получает все зарегистрированные биомы
   */
  static getAllBiomes(): BiomeConfig[] {
    return Array.from(this.biomes.values());
  }

  /**
   * Определяет биом по параметрам среды
   */
  static determineBiome(elevation: number, temperature: number, humidity: number): string {
    const allBiomes = this.getAllBiomes();
    
    // Ищем биом, параметры которого соответствуют текущим условиям
    for (const biome of allBiomes) {
      if (
        elevation >= biome.minElevation &&
        elevation <= biome.maxElevation &&
        temperature >= biome.minTemperature &&
        temperature <= biome.maxTemperature &&
        humidity >= biome.minHumidity &&
        humidity <= biome.maxHumidity
      ) {
        return biome.id;
      }
    }

    // Если не нашли точного совпадения, возвращаем наиболее подходящий
    // или дефолтный биом
    return 'plains';
  }

  /**
   * Проверяет, существует ли биом с таким ID
   */
  static hasBiome(id: string): boolean {
    return this.biomes.has(id);
  }
}

// Инициализируем базу данных при импорте
BiomeDatabase.initialize();
