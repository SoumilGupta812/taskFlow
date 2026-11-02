import type { Job } from "../job/Job.js";

export type Processor<T> =
  (job: Job<T>) => Promise<void>;