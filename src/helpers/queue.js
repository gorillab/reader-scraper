class Queue {
  constructor() {
    this.running = false;
    this.queue = [];
  }

  async add(callback) {
    this.queue.push(async () => {
      await callback();
      this.next();
    });

    if (!this.running) {
      this.next();
    }
  }

  next() {
    this.running = false;
    const shift = this.queue.shift();

    if (shift) {
      this.running = true;
      shift();
    }
  }
}

module.exports = Queue;
