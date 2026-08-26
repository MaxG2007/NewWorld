/**
 * Детерминированный генератор случайных чисел (RNG)
 * Использует алгоритм Mulberry32 для воспроизводимой генерации
 */
export class DeterministicRNG {
  private seed: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = seed >>> 0;
    }
  }

  /**
   * Хэширует строку в 32-битное число
   */
  private hashString(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  /**
   * Генерирует следующее псевдослучайное число [0, 1)
   */
  next(): number {
    // Mulberry32 algorithm
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Генерирует случайное целое число в диапазоне [min, max]
   */
  nextInt(min: number, max: number): number {
    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }

  /**
   * Генерирует случайное число с плавающей точкой в диапазоне [0, 1)
   */
  nextFloat(min?: number, max?: number): number {
    if (min !== undefined && max !== undefined) {
      return this.next() * (max - min) + min;
    }
    return this.next();
  }

  /**
   * Генерирует случайное булево значение
   */
  nextBoolean(): boolean {
    return this.next() >= 0.5;
  }

  /**
   * Выбирает случайный элемент из массива
   */
  nextArrayElement<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Перемешивает массив (алгоритм Фишера-Йетса)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Создает новый RNG с производным seed
   */
  derive(offset: number): DeterministicRNG {
    return new DeterministicRNG(this.seed + offset);
  }

  /**
   * Получить текущее состояние (для сохранения)
   */
  getState(): number {
    return this.seed;
  }

  /**
   * Восстановить состояние
   */
  setState(seed: number): void {
    this.seed = seed >>> 0;
  }
}
