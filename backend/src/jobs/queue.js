const EventEmitter = require('events');

class InMemoryQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = [];
    this.processing = false;
  }

  add(name, payload, opts = {}) {
    const job = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      payload,
      attempts: 0,
      maxAttempts: opts.attempts || 3,
      backoffMs: opts.backoffMs || 1000
    };

    this.jobs.push(job);
    this._drain();
    return job;
  }

  async _drain() {
    if (this.processing) return;
    this.processing = true;

    while (this.jobs.length) {
      const job = this.jobs.shift();
      this.emit('job:queued', job);
      try {
        this.emit('job:processing', job);
        await this.emitAsync(job.name, job.payload);
        this.emit('job:completed', job);
      } catch (error) {
        job.attempts += 1;
        this.emit('job:error', job, error);

        if (job.attempts < job.maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, job.backoffMs * job.attempts));
          this.jobs.push(job);
        }
      }
    }

    this.processing = false;
  }

  async emitAsync(eventName, payload) {
    const listeners = this.listeners(eventName);
    for (const listener of listeners) {
      await listener(payload);
    }
  }
}

const queue = new InMemoryQueue();

function enqueueTicketAI(ticketId) {
  return queue.add('processTicketAI', { ticketId }, { attempts: 3, backoffMs: 1500 });
}

module.exports = { queue, enqueueTicketAI };
