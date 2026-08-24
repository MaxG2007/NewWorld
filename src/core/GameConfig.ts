/**
 * Game configuration settings
 */
export class GameConfig {
  public readonly width: number = 1280;
  public readonly height: number = 720;
  public readonly title: string = 'Mega Pixel World';
  public readonly pixelRatio: number = window.devicePixelRatio || 1;

  constructor() {
    // Configuration initialized
  }

  public getAspectRatio(): number {
    return this.width / this.height;
  }
}
