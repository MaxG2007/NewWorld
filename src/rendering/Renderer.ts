import { GameConfig } from './GameConfig';

/**
 * Main renderer using Phaser 3
 */
export class Renderer {
  private config: GameConfig;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(config: GameConfig) {
    this.config = config;
  }

  public initialize(): void {
    const container = document.getElementById('game-container');
    if (!container) {
      console.error('Game container not found');
      return;
    }

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;

    const context = this.canvas.getContext('2d');
    if (!context) {
      console.error('Could not get 2D context');
      return;
    }
    this.ctx = context;

    container.appendChild(this.canvas);
    console.log(`Renderer initialized: ${this.config.width}x${this.config.height}`);
  }

  public getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  public clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }

  public getWidth(): number {
    return this.config.width;
  }

  public getHeight(): number {
    return this.config.height;
  }
}
