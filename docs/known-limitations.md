# Known Limitations

| Limitation | Detail | Planned fix |
| --- | --- | --- |
| Payload serialization | `JSON.stringify` can throw (circular refs, `BigInt`) and returns `undefined` for `undefined`. `Date`, `Map` and functions do not round-trip. | Validate payloads before writing |
| Shallow `readonly` | `job.data.to = "x"` is allowed. Payloads must not be mutated. | Document; consider deep freeze |
| No rollback | `MULTI/EXEC` applies remaining commands if one fails at runtime. | Lua scripts for conditional transitions |
| Durability | Depends on Redis `appendfsync`; recent writes may be lost on crash. | Document recommended config; test restart |
| Attempts mutable | `attemptsMade` is a public field. | Encapsulate when adding retries |
| Delivery guarantee | At-least-once only. | Document idempotency requirements |
| Single Redis | No replication or failover. | Future work |
| Tests use `KEYS` | Fine for tests, unsafe in production. | Use `SCAN` |