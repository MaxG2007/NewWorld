import { Scene } from '../../core/Scene';

/**
 * Loading Scene - Initial loading screen
 */
export class LoadingScene extends Scene {
  private loadProgress: number = 0;

  public enter(): void {
    console.log('LoadingScene: entered');
    this.loadProgress = 0;

    // Simulate loading
    setTimeout(() => {
      this.loadProgress = 100;
      // Transition to menu after loading
      this.sceneManager.loadScene('menu');
    }, 1000);
  }

  public exit(): void {
    console.log('LoadingScene: exited');
  }

  public update(_deltaTime: number): void {
    // Update loading logic
  }

  public render(): void {
    console.log(`LoadingScene: rendering progress ${this.loadProgress}%`);
  }
}
