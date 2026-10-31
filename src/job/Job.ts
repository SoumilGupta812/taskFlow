import {randomUUID} from "node:crypto";

export type JobStatus =
  | "waiting"
  | "active"
  | "completed"
  | "failed";


export interface JobRestoreOptions {
  id: string;
  status: JobStatus;
  attemptsMade: number;
  createdAt: number;
}
export class Job<T = unknown> {
   public readonly id: string;
  public readonly name: string;
  public readonly data: T;
  public status: JobStatus;
  public attemptsMade: number;
  public readonly createdAt: number;


    constructor(name: string, data: T, restore?: JobRestoreOptions) {
        this.id =restore?.id ?? randomUUID();
        this.name = name;
        this.data = data;
        this.status = restore?.status ?? "waiting";
        this.attemptsMade = restore?.attemptsMade ?? 0;
        this.createdAt = restore?.createdAt ?? Date.now();
    }

    static fromRedisHash<T>(hash: Record<string, string>): Job<T> {
    if (!hash.id || !hash.name || !hash.data) {
        throw new Error("Invalid job data in Redis");
    }

    const validStatuses: JobStatus[] = [
        "waiting",
        "active",
        "completed",
        "failed"
    ];

    if (!validStatuses.includes(hash.status as JobStatus)) {
        throw new Error("Invalid job status in Redis");
    }

    const attemptsMade = Number(hash.attemptsMade);
    const createdAt = Number(hash.createdAt);

    if (!Number.isInteger(attemptsMade) || attemptsMade < 0) {
        throw new Error("Invalid attemptsMade value");
    }

    if (!Number.isFinite(createdAt)) {
        throw new Error("Invalid createdAt value");
    }

    return new Job<T>(
        hash.name,
        JSON.parse(hash.data) as T,
        {
            id: hash.id,
            status: hash.status as JobStatus,
            attemptsMade,
            createdAt
        }
    );
}
}