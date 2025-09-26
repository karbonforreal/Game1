export type LoopCallback = (delta: number, time: number) => void;

export class GameLoop {
  private accumulator = 0;
  private lastTime = 0;
  private running = false;
  private readonly step = 1 / 60;
  private logic: LoopCallback;
  private render: LoopCallback;

  constructor(logic: LoopCallback, render: LoopCallback) {
    this.logic = logic;
    this.render = render;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
  }

  private tick = (timestamp: number) => {
    if (!this.running) return;
    const now = timestamp / 1000;
    let frameTime = now - this.lastTime;
    if (frameTime > 0.25) frameTime = 0.25;
    this.lastTime = now;
    this.accumulator += frameTime;
    while (this.accumulator >= this.step) {
      this.logic(this.step, now);
      this.accumulator -= this.step;
    }
    this.render(this.accumulator / this.step, now);
    requestAnimationFrame(this.tick);
  };
}
