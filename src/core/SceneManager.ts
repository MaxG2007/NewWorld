import { Game } from './Game';
import { Scene } from './Scene';
import { LoadingScene } from '../ui/scenes/LoadingScene';
import { MenuScene } from '../ui/scenes/MenuScene';
import { NewWorldScene } from '../ui/scenes/NewWorldScene';
import { LoadWorldScene } from '../ui/scenes/LoadWorldScene';
import { SettingsScene } from '../ui/scenes/SettingsScene';
import { DebugScene } from '../ui/scenes/DebugScene';

/**
 * Manages game scenes and transitions
 */
export class SceneManager {
  private game: Game;
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;

  constructor(game: Game) {
    this.game = game;
    this.registerScenes();
  }

  private registerScenes(): void {
    this.scenes.set('loading', new LoadingScene(this));
    this.scenes.set('menu', new MenuScene(this));
    this.scenes.set('newWorld', new NewWorldScene(this));
    this.scenes.set('loadWorld', new LoadWorldScene(this));
    this.scenes.set('settings', new SettingsScene(this));
    this.scenes.set('debug', new DebugScene(this));
  }

  public loadScene(sceneName: string): void {
    const scene = this.scenes.get(sceneName);
    if (!scene) {
      console.error(`Scene "${sceneName}" not found`);
      return;
    }

    if (this.currentScene) {
      this.currentScene.exit();
    }

    this.currentScene = scene;
    this.currentScene.enter();
  }

  public getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  public getGame(): Game {
    return this.game;
  }
}
