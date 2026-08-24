import { DeterministicRNG } from './DeterministicRNG';

/**
 * Система отдельных random streams для различных систем игры
 * Каждая система получает свой независимый поток случайных чисел
 */
export class RandomStreams {
  private baseSeed: string;
  private streams: Map<string, DeterministicRNG>;

  constructor(baseSeed: string) {
    this.baseSeed = baseSeed;
    this.streams = new Map();
    this.initializeStreams();
  }

  private initializeStreams(): void {
    // Создаем отдельные stream'ы для каждой системы
    const streamNames = [
      'terrain',
      'civilization',
      'family',
      'event',
      'dungeon',
      'loot',
      'npc',
      'climate',
      'biome',
      'resource',
      'road',
      'ruin',
      'country',
      'settlement',
      'history',
    ];

    streamNames.forEach((name, index) => {
      // Каждый stream получает производный seed на основе имени и индекса
      const streamSeed = `${this.baseSeed}_${name}_${index}`;
      this.streams.set(name, new DeterministicRNG(streamSeed));
    });
  }

  /**
   * Получает RNG для указанной системы
   */
  getStream(name: string): DeterministicRNG {
    const stream = this.streams.get(name);
    if (!stream) {
      throw new Error(`Unknown random stream: ${name}`);
    }
    return stream;
  }

  /**
   * Получает terrain RNG
   */
  get terrain(): DeterministicRNG {
    return this.getStream('terrain');
  }

  /**
   * Получает civilization RNG
   */
  get civilization(): DeterministicRNG {
    return this.getStream('civilization');
  }

  /**
   * Получает family RNG
   */
  get family(): DeterministicRNG {
    return this.getStream('family');
  }

  /**
   * Получает event RNG
   */
  get event(): DeterministicRNG {
    return this.getStream('event');
  }

  /**
   * Получает dungeon RNG
   */
  get dungeon(): DeterministicRNG {
    return this.getStream('dungeon');
  }

  /**
   * Получает loot RNG
   */
  get loot(): DeterministicRNG {
    return this.getStream('loot');
  }

  /**
   * Получает npc RNG
   */
  get npc(): DeterministicRNG {
    return this.getStream('npc');
  }

  /**
   * Получает climate RNG
   */
  get climate(): DeterministicRNG {
    return this.getStream('climate');
  }

  /**
   * Получает biome RNG
   */
  get biome(): DeterministicRNG {
    return this.getStream('biome');
  }

  /**
   * Получает resource RNG
   */
  get resource(): DeterministicRNG {
    return this.getStream('resource');
  }

  /**
   * Получает road RNG
   */
  get road(): DeterministicRNG {
    return this.getStream('road');
  }

  /**
   * Получает ruin RNG
   */
  get ruin(): DeterministicRNG {
    return this.getStream('ruin');
  }

  /**
   * Получает country RNG
   */
  get country(): DeterministicRNG {
    return this.getStream('country');
  }

  /**
   * Получает settlement RNG
   */
  get settlement(): DeterministicRNG {
    return this.getStream('settlement');
  }

  /**
   * Получает history RNG
   */
  get history(): DeterministicRNG {
    return this.getStream('history');
  }

  /**
   * Создает новый набор streams с другим base seed
   */
  derive(newBaseSeed: string): RandomStreams {
    return new RandomStreams(newBaseSeed);
  }
}
