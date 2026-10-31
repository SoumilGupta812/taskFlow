
import redis from "./redis/connection.js";

async function main() {
  try {
    const response = await redis.ping();

    console.log("Redis response:", response);

    await redis.set("project", "TaskFlow");

    const value = await redis.get("project");

    console.log("Stored value:", value);
  } catch (error) {
    console.error("Connection test failed:", error);
  } finally {
    await redis.quit();
  }
}

main();
