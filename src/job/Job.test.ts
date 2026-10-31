import { describe, it, expect } from "vitest";
import { Job } from "./Job.js";

describe("Job", () => {
  it("generates unique ids", () => {
    const a = new Job("send-email", { to: "a@example.com" });
    const b = new Job("send-email", { to: "b@example.com" });
    expect(a.id).not.toBe(b.id);
  });

  it("starts with correct defaults", () => {
    const payload = { to: "a@example.com" };
    const job = new Job("send-email", payload);
    expect(job.status).toBe("waiting");
    expect(job.attemptsMade).toBe(0);
    expect(job.createdAt).toBeLessThanOrEqual(Date.now());
    expect(job.data).toBe(payload);
  });
});