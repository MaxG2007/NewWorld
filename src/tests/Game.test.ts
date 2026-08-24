import { describe, it, expect } from 'vitest';
import { Game } from '../core/Game';

describe('Game Core', () => {
  it('should create a game instance', () => {
    const game = new Game();
    expect(game).toBeDefined();
  });

  it('should not be running initially', () => {
    const game = new Game();
    expect(game.isGameRunning()).toBe(false);
  });

  it('should start successfully', () => {
    const game = new Game();
    game.start();
    expect(game.isGameRunning()).toBe(true);
  });

  it('should stop successfully', () => {
    const game = new Game();
    game.start();
    game.stop();
    expect(game.isGameRunning()).toBe(false);
  });

  it('should have valid config', () => {
    const game = new Game();
    const config = game.getConfig();
    expect(config.width).toBeGreaterThan(0);
    expect(config.height).toBeGreaterThan(0);
  });

  it('should have scene manager', () => {
    const game = new Game();
    const sceneManager = game.getSceneManager();
    expect(sceneManager).toBeDefined();
  });
});
