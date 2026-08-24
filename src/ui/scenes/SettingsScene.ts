import { Scene } from '../../core/Scene';

/**
 * Settings Scene - Game configuration
 */
export class SettingsScene extends Scene {
  public enter(): void {
    console.log('SettingsScene: entered');
  }

  public exit(): void {
    console.log('SettingsScene: exited');
  }

  public update(_deltaTime: number): void {
    // Update settings logic
  }

  public render(): void {
    console.log('SettingsScene: rendering');
  }

  public onBack(): void {
    this.sceneManager.loadScene('menu');
  }
}
