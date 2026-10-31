import type { Redis } from "ioredis";
import { Job } from "../job/Job.js";

export class Queue {
  private readonly waitingKey: string;

  constructor(
    public readonly name: string,
    private readonly redis: Redis
  ) {
    this.waitingKey = `taskflow:${name}:waiting`;
  }

  private jobKey(jobId: string): string {
    return `taskflow:${this.name}:job:${jobId}`;
  }

  async add<T>(name: string, data: T): Promise<Job<T>> {
    const job = new Job<T>(name, data);

    const results = await this.redis
      .multi()
      .hset(this.jobKey(job.id), {
        id: job.id,
        name: job.name,
        data: JSON.stringify(job.data),
        status: job.status,
        attemptsMade: String(job.attemptsMade),
        createdAt: String(job.createdAt),
      })
      .rpush(this.waitingKey, job.id)
      .exec();

    if (!results) {
      throw new Error("Failed to add job: transaction aborted");
    }
    for (const [err] of results) {
        
      if (err) throw err;
    }

    return job;
  }

 async getJob<T>(jobId: string): Promise<Job<T> | null> {
  const hash = await this.redis.hgetall(this.jobKey(jobId));

  if (Object.keys(hash).length === 0) {
    return null;
  }

  return Job.fromRedisHash<T>(hash);
}
}