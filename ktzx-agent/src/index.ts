import "dotenv/config";
import { VoltAgent, VoltOpsClient, Agent, Memory } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { createPinoLogger } from "@voltagent/logger";
import { mirrorOpenAi } from './model-mirror'
import { honoServer } from "@voltagent/server-hono";
import { dataAnalyzeWorkflow } from "./workflows";
import { weatherTool } from "./tools";

// Create a logger instance
const logger = createPinoLogger({
  name: "ktzx-agent",
  level: "info",
});

// Configure persistent memory (LibSQL / SQLite)
const memory = new Memory({
  storage: new LibSQLMemoryAdapter({
    url: "file:./.voltagent/memory.db",
    logger: logger.child({ component: "libsql" }),
  }),
});

const agent = new Agent({
  name: "ktzx-agent",
  instructions: "A helpful assistant that can check weather and help with various tasks",
  model: mirrorOpenAi("gpt-3.5-turbo"),
  tools: [weatherTool],
  memory,
});

new VoltAgent({
  agents: {
    agent,
  },
  workflows: {
    dataAnalyzeWorkflow,
  },
  server: honoServer(),
  logger,
  voltOpsClient: new VoltOpsClient({
    publicKey: process.env.VOLTAGENT_PUBLIC_KEY || "",
    secretKey: process.env.VOLTAGENT_SECRET_KEY || "",
  }),
});
