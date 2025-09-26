export class GameLoop {
  constructor(logic, render) {
    this.logic = logic;
    this.render = render;
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.step = 1 / 60;

    this.tick = this.tick.bind(this);
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

  tick(timestamp) {
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
  }
}
