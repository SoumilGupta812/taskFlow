

import type { Redis } from "ioredis";

export interface WorkerOptions {
  redis: Redis;
  concurrency?: number;
  pollInterval?: number;
  lockDuration?: number;
}