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

export async function runWithConcurrency<T, R>(
  items: T[],
  taskExecutor: (item: T, index: number) => Promise<R>,
  concurrencyLimit: number = 5,
  taskName: string = 'Task'
): Promise<R[]> {
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
