# Redis Schema

All keys use the prefix `taskflow:{queue}:`.

## Keys

| Key                          | Type | Purpose                          | Status  |
| ---------------------------- | ---- | -------------------------------- | ------- |
| `taskflow:{queue}:waiting`   | List | Job IDs waiting, FIFO (RPUSH)    | Done    |
| `taskflow:{queue}:job:{id}`  | Hash | All fields of one job            | Done    |
| `taskflow:{queue}:active`    | Set  | Job IDs currently claimed        | Planned |
| `taskflow:{queue}:completed` | Set  | Finished job IDs                 | Planned |
| `taskflow:{queue}:failed`    | Set  | Permanently failed job IDs       | Planned |
| `taskflow:{queue}:delayed`   | ZSet | Job IDs scored by due timestamp  | Planned |

## Job Hash fields

Redis Hashes store strings only, so values are serialized.

| Field          | Stored as                 | Parsed back with     |
| -------------- | ------------------------- | -------------------- |
| `id`           | UUID string               | none                 |
| `name`         | string                    | none                 |
| `data`         | `JSON.stringify(payload)` | `JSON.parse`         |
| `status`       | `waiting/active/completed/failed` | validated   |
| `attemptsMade` | stringified integer       | `Number()`           |
| `createdAt`    | stringified ms timestamp  | `Number()`           |

## Example

```
taskflow:email:waiting
  [ "8f1c...", "a42d..." ]

taskflow:email:job:8f1c...
  id           = 8f1c...
  name         = send-email
  data         = {"to":"user@example.com"}
  status       = waiting
  attemptsMade = 0
  createdAt    = 1793450000000
```

## Notes

- The Hash is the source of truth; Lists and Sets are indexes by state.
- `HGETALL` on a missing key returns an empty object, not `null`.
- Never use `KEYS` on a production Redis (used only in tests). Use `SCAN`.