# TaskFlow

A distributed background job processing engine built from scratch with Node.js, TypeScript and Redis, inspired by BullMQ.

> **Status: work in progress (Phase 1 - Basic Queue Engine).** See the status table below for what exists today.

## Why this project exists

Slow work (sending emails, generating reports) should not block an API request. TaskFlow lets a producer add a job to Redis and lets independent worker processes execute it later.

## Prerequisites

- Node.js (LTS)
- Docker Desktop

## Getting started

```bash
# start Redis (run from the project root, where docker-compose.yml lives)
docker compose up -d

# install dependencies
npm install

# run tests
npx vitest run
```

## Usage (current API)

```ts
import { Redis } from "ioredis";
import { Queue } from "./src/queue/Queue.js";

const redis = new Redis({ host: "127.0.0.1", port: 6379 });
const queue = new Queue("email", redis);

const job = await queue.add("send-email", { to: "user@example.com" });
const fetched = await queue.getJob(job.id);
```

## Status

| Feature                          | State       |
| -------------------------------- | ----------- |
| Job model                        | Done        |
| `Queue.add()`                    | Done        |
| `Queue.getJob()`                 | Done        |
| Worker (FIFO processing)         | Not started |
| Atomic job claiming (Lua)        | Not started |
| Retries and backoff              | Not started |
| Delayed jobs                     | Not started |
| Locks, heartbeats, crash recovery| Not started |
| Dashboard                        | Not started |
| Benchmarks                       | Not started |

## Documentation

- [Design decisions](docs/design-decisions.md)
- [Redis schema](docs/redis-schema.md)
- [Known limitations](docs/known-limitations.md)

