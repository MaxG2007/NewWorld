import { GameConfig } from './GameConfig';
import { SceneManager } from './SceneManager';
import { Renderer } from '../rendering/Renderer';

/**
 * Main Game class - orchestrates game systems
 */
export class Game {
  private config: GameConfig;
  private sceneManager: SceneManager;
  private renderer: Renderer;
  private isRunning: boolean = false;

  constructor() {
    this.config = new GameConfig();
    this.sceneManager = new SceneManager(this);
    this.renderer = new Renderer(this.config);
  }

  public start(): void {
    if (this.isRunning) {
      console.warn('Game is already running');
      return;
    }

    this.isRunning = true;
    console.log('Mega Pixel World starting...');

    // Initialize renderer
    this.renderer.initialize();

    // Start with loading screen
    this.sceneManager.loadScene('loading');

    console.log('Game started successfully');
  }

  public stop(): void {
    this.isRunning = false;
    this.renderer.destroy();
    console.log('Game stopped');
  }

  public getConfig(): GameConfig {
    return this.config;
  }

  public getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  public isGameRunning(): boolean {
    return this.isRunning;
  }
}
