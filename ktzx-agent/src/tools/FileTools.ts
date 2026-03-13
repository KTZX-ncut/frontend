import { createTool } from '@voltagent/core';
import { z } from 'zod';
import { documentsSplit, parseMarkdownJson } from '../utils';
import { reader } from '../model-mirror';
import { SentenceSplitter } from 'llamaindex';
import pLimit from 'p-limit';

export const fileTools = (logger: any) =>
  createTool({
    name: 'readAndSplit',
    description: '读取文件路径并将其拆分为多个文本块进行分析',
    parameters: z.object({
      path: z.string().describe('文件路径')
    }),
    execute: async ({ path }) => {
      logger.info(`Tool: 正在解析文件 ${path}`);
      const nodes = await documentsSplit(path);
      return {
        chunks: nodes?.map(n => n.text),
        count: nodes?.length
      };
    }
  });


export const concurrencyTool = () => createTool({
  name: 'batch_concurrent_processor',
  description: '高效地并行处理大量项目（如文本块、URL 或数据记录），并带有速率限制。当你需要对多个输入同时执行相同的操作以节省时间，同时避免 API 速率限制错误 (429) 时，请使用此工具。返回聚合结果。同时为了节省大模型 API 额度，建议只在 PPT 这种文档切片中进行使用',
  parameters: z.object({
    items: z.array(z.any())
      .describe("待处理的数据项列表。数组中的每一项将作为参数传递给 taskExecutor。"),

    taskExecutor: z.function()
      .describe("执行任务的异步函数。接收 (item, index) 作为参数，必须返回一个 Promise。"),

    concurrencyLimit: z.number()
      .int()
      .min(1, "并发数至少为 1")
      .default(5)
      .describe("最大并发限制数。控制同时运行的 Promise 数量，默认为 5。"),

    taskName: z.string()
      .default("Task")
      .describe("任务名称。用于日志记录或调试时的标识，默认为 'Task'。"),
  }),
  execute: async ({ items, taskExecutor, concurrencyLimit, taskName }) => {
    const limit = pLimit(concurrencyLimit);

    const tasks = items.map((item, index) => {
      return limit(async () => {
        try {
          return await taskExecutor(item, index);
        } catch (error) {
          console.error(`[${taskName} ${index}] ❌ Failed:`, error);
          throw error; // 或者返回默认值防止整个流程中断
        }
      });
    });

    return Promise.all(tasks);
  }
})

export const pptSentenceTool = (log: any) =>
  createTool({
    name: 'readAndSplitPPT',
    description: '读取PPT文件路径并将其拆分为多个文本块进行分析,仅限于目标路径指向文件为PPT文件',
    parameters: z.object({
      path: z.string().describe('文件路径')
    }),
    execute: async ({ path }) => {
      // 1. 加载文档
      const documents = await reader.loadData(path);

      // 2. 文本切片
      const splitter = new SentenceSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
      });

      const nodes = splitter.getNodesFromDocuments(documents);

      // 返回统一的文本数组，方便后续逻辑遍历
      return nodes.map(node => ({
        text: node.text,
        metadata: node.metadata // 保留元数据以备后用（如页码）
      }));
    }
  });
