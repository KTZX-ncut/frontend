import 'dotenv/config';
import { VoltAgent, VoltOpsClient, Agent, Memory } from '@voltagent/core';
import { LibSQLMemoryAdapter } from '@voltagent/libsql';
import { createPinoLogger } from '@voltagent/logger';
import { mirrorOpenAi } from './model-mirror';
import { honoServer } from '@voltagent/server-hono';
import { dataAnalyzeWorkflow, dataExtractWorkflow } from './workflows';
import { weatherTool } from './tools';
import { lessonPlanAgent, feedbackAgent, PPTAnalysisAgent } from './agents';

// Create a logger instance
const logger = createPinoLogger({
  name: 'ktzx-agent',
  level: 'info'
});

// Configure persistent memory (LibSQL / SQLite)
const memory = new Memory({
  storage: new LibSQLMemoryAdapter({
    url: 'file:./.voltagent/memory.db',
    logger: logger.child({ component: 'libsql' })
  })
});

new VoltAgent({
  agents: {
    lessonPlanAgent,
    feedbackAgent,
    PPTAnalysisAgent
  },
  workflows: {
    dataAnalyzeWorkflow,
    dataExtractWorkflow
  },
  server: honoServer(),
  logger,
  voltOpsClient: new VoltOpsClient({
    publicKey: process.env.VOLTAGENT_PUBLIC_KEY || '',
    secretKey: process.env.VOLTAGENT_SECRET_KEY || ''
  })
});
