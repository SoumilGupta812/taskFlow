# Design Decisions

Each entry: context, decision, alternatives, trade-offs.

## 1. Redis for job storage

- **Context:** Jobs must survive process crashes and be visible to multiple processes.
- **Decision:** Store jobs in Redis, with AOF persistence enabled (`--appendonly yes`) and a Docker volume.
- **Alternatives:** In-memory array (lost on crash, not shared); PostgreSQL (durable, but slower for queue operations and no native atomic list/sorted-set primitives).
- **Trade-offs:** Data lives in memory, so memory must be managed. Durability depends on the `appendfsync` policy; recent writes can be lost on a crash.

## 2. Hash for job data, List for ordering, ID as the link

- **Context:** We need FIFO ordering and the ability to look up and update a job by ID.
- **Decision:** Each job is a Redis Hash (`taskflow:{queue}:job:{id}`). The waiting List holds only job IDs.
- **Alternatives:** Store the full job JSON inside the List.
- **Trade-offs:** Two structures to keep consistent, but the Hash is the single source of truth. Individual fields (e.g. `status`) can be updated in O(1) without rewriting the job, and list entries stay small.

## 3. Inject the Redis connection into `Queue`

- **Context:** Each Redis connection is a TCP socket.
- **Decision:** `Queue` receives a connection in its constructor instead of creating one.
- **Alternatives:** Each `Queue` creates its own connection.
- **Trade-offs:** The caller must create and close the connection. In return: shared connections, easier testing, clear ownership.

## 4. `MULTI/EXEC` in `Queue.add()`

- **Context:** `add()` writes the Hash and pushes to the List. A crash between them would leave a job no worker can find.
- **Decision:** Group `HSET` and `RPUSH` in a transaction.
- **Alternatives:** Separate commands; a Lua script.
- **Trade-offs:** Commands are not interleaved with other clients, but Redis has no rollback: if one command fails at runtime, the other still applies. We check every result from `exec()`. Conditional logic (job claiming) will use Lua.

## 5. `getJob()` reads the Hash directly

- **Context:** Retrieve a job by ID regardless of status.
- **Decision:** Build the key from the ID and call `HGETALL`.
- **Alternatives:** Scan the waiting List (O(N), and misses non-waiting jobs).
- **Trade-offs:** None significant. An empty result means "not found".

## 6. Restore jobs with optional constructor options and `Job.fromRedisHash()`

- **Context:** The constructor generates a new UUID and default state, but restored jobs need their original values.
- **Decision:** An optional `restore` argument plus a static factory that parses Redis strings (`JSON.parse`, `Number`) and validates them.
- **Alternatives:** Separate `Job.create()` and `Job.restore()` factories; a dedicated serializer class.
- **Trade-offs:** `Job` knows about Redis string formats. Acceptable now.

## 7. UUIDs for job IDs

- **Context:** Multiple producers may add jobs without coordinating.
- **Decision:** `crypto.randomUUID()`.
- **Alternatives:** Redis `INCR` counter (needs a round trip, sequential and guessable).
- **Trade-offs:** Longer IDs, no natural ordering.
