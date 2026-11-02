
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

import type { Processor } from "./types.js";
import type { WorkerOptions } from "./WorkerOptions.js";

export class Worker<T = unknown> {
  public readonly id: string;

  private readonly queueName: string;
  private readonly processor: Processor<T>;
  private readonly redis: Redis;

  private readonly concurrency: number;
  private readonly pollInterval: number;
  private readonly lockDuration: number;

  private running = false;

  constructor(
    queueName: string,
    processor: Processor<T>,
    options: WorkerOptions
  ) {
    if (!queueName.trim()) {
      throw new Error("Queue name cannot be empty");
    }

    const concurrency = options.concurrency ?? 1;
    const pollInterval = options.pollInterval ?? 1000;
    const lockDuration = options.lockDuration ?? 30000;

    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error(
        "Concurrency must be a positive integer"
      );
    }

    if (!Number.isInteger(pollInterval) || pollInterval < 1) {
      throw new Error(
        "Poll interval must be greater than 0"
      );
    }

    if (!Number.isInteger(lockDuration) || lockDuration < 1) {
      throw new Error(
        "Lock duration must be greater than 0"
      );
    }

    this.id = randomUUID();

    this.queueName = queueName;
    this.processor = processor;
    this.redis = options.redis;

    this.concurrency = concurrency;
    this.pollInterval = pollInterval;
    this.lockDuration = lockDuration;
  }
}