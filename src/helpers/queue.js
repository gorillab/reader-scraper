class Queue {
  constructor() {
    this.running = false;
    this.queue = [];
  }

  async addFunction(callback) {
    const that = this;
    this.queue.push(async () => {
      const finished = await callback();
      if (typeof finished === 'undefined' || finished) {
        that.next();
      }
    });

    if (!this.running) {
      this.next();
    }

    return this;
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
