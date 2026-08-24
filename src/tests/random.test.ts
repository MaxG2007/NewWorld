import { describe, it, expect } from 'vitest';
import { DeterministicRNG } from '../core/random/DeterministicRNG';
import { RandomStreams } from '../core/random/RandomStreams';

describe('DeterministicRNG', () => {
  it('должен генерировать одинаковые значения с одинаковым seed', () => {
    const rng1 = new DeterministicRNG('test-seed');
    const rng2 = new DeterministicRNG('test-seed');

    const values1 = [rng1.next(), rng1.next(), rng1.next()];
    const values2 = [rng2.next(), rng2.next(), rng2.next()];

    expect(values1).toEqual(values2);
  });

  it('должен генерировать разные значения с разными seed', () => {
    const rng1 = new DeterministicRNG('seed-1');
    const rng2 = new DeterministicRNG('seed-2');

    const val1 = rng1.next();
    const val2 = rng2.next();

    expect(val1).not.toBe(val2);
  });

  it('должен генерировать числа в правильном диапазоне', () => {
    const rng = new DeterministicRNG(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('должен генерировать целые числа в диапазоне', () => {
    const rng = new DeterministicRNG(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it('должен выбирать элементы из массива', () => {
    const rng = new DeterministicRNG(12345);
    const array = ['a', 'b', 'c', 'd', 'e'];

    for (let i = 0; i < 100; i++) {
      const element = rng.nextArrayElement(array);
      expect(array).toContain(element);
    }
  });
});

describe('RandomStreams', () => {
  it('должен создавать независимые stream\'ы', () => {
    const streams1 = new RandomStreams('world-123');
    const streams2 = new RandomStreams('world-123');

    // Одинаковые stream'ы должны давать одинаковые значения
    const terrain1 = streams1.terrain.next();
    const terrain2 = streams2.terrain.next();
    expect(terrain1).toBe(terrain2);

    // Разные stream'ы должны давать разные значения
    const civilization = streams1.civilization.next();
    expect(civilization).not.toBe(terrain1);
  });

  it('должен иметь все требуемые stream\'ы', () => {
    const streams = new RandomStreams('test');

    expect(() => streams.terrain).not.toThrow();
    expect(() => streams.civilization).not.toThrow();
    expect(() => streams.family).not.toThrow();
    expect(() => streams.event).not.toThrow();
    expect(() => streams.dungeon).not.toThrow();
    expect(() => streams.loot).not.toThrow();
    expect(() => streams.npc).not.toThrow();
    expect(() => streams.climate).not.toThrow();
    expect(() => streams.biome).not.toThrow();
    expect(() => streams.resource).not.toThrow();
    expect(() => streams.road).not.toThrow();
    expect(() => streams.ruin).not.toThrow();
    expect(() => streams.country).not.toThrow();
    expect(() => streams.settlement).not.toThrow();
    expect(() => streams.history).not.toThrow();
  });

  it('должен быть воспроизводимым после создания нового экземпляра', () => {
    const getSequence = (seed: string) => {
      const streams = new RandomStreams(seed);
      return [
        streams.terrain.next(),
        streams.civilization.next(),
        streams.biome.next(),
      ];
    };

    const seq1 = getSequence('repro-test');
    const seq2 = getSequence('repro-test');

    expect(seq1).toEqual(seq2);
  });
});
