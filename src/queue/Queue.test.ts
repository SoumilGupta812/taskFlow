import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Redis } from "ioredis";
import { Queue } from "./Queue.js";

describe("Queue.add", () => {
  let redis: Redis;
  let queue: Queue;
  const queueName = "test-email";

  beforeAll(() => {
    redis = new Redis({ host: "127.0.0.1", port: 6379 });
  });

  beforeEach(async () => {
    const keys = await redis.keys(`taskflow:${queueName}:*`);
    if (keys.length) await redis.del(...keys);
    queue = new Queue(queueName, redis);
  });

  afterAll(async () => {
    await redis.quit();
  });
  it("returns the job with its original id and data", async () => {
    const added = await queue.add("send-email", { to: "a@example.com" });

    const fetched = await queue.getJob<{ to: string }>(added.id);

    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(added.id);
    expect(fetched!.name).toBe("send-email");
    expect(fetched!.data).toEqual({ to: "a@example.com" });
    expect(fetched!.status).toBe("waiting");
    expect(fetched!.attemptsMade).toBe(0);
    expect(fetched!.createdAt).toBe(added.createdAt);
  });

  it("returns null for an unknown id", async () => {
    const fetched = await queue.getJob("does-not-exist");
    expect(fetched).toBeNull();
  });

  it("stores job metadata in a hash", async () => {
    const job = await queue.add("send-email", { to: "a@example.com" });

    const stored = await redis.hgetall(`taskflow:${queueName}:job:${job.id}`);
    expect(stored.name).toBe("send-email");
    expect(stored.status).toBe("waiting");
    expect(JSON.parse(stored.data)).toEqual({ to: "a@example.com" });
  });

  it("pushes the job id onto the waiting list in FIFO order", async () => {
    const a = await queue.add("send-email", { n: 1 });
    const b = await queue.add("send-email", { n: 2 });

    const ids = await redis.lrange(`taskflow:${queueName}:waiting`, 0, -1);
    expect(ids).toEqual([a.id, b.id]);
  });
});

