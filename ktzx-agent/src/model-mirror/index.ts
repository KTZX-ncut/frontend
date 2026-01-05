import { createOpenAI } from '@ai-sdk/openai';
import 'dotenv/config';
import OpenAI from 'openai';
import { LlamaParseReader } from 'llama-cloud-services';
import 'dotenv/config';

console.log('KEY-lyjc:', process.env.OPENAI_API_KEY);

// const baseURL = 'https://api.openai-sb.com/v1'
const glmbaseURL = 'https://open.bigmodel.cn/api/paas/v4/';
const QWbaseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/';

export const mirrorOpenAi = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: glmbaseURL
});

export const qwOpenAi = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: QWbaseURL,
  fetch: (url, options) => {
    // 1. 解析请求体
    const body = JSON.parse(options?.body as string);

    // 2. 将 'developer' 角色全部替换为 'system'
    if (body.messages) {
      body.messages = body.messages.map((msg: any) => ({
        ...msg,
        role: msg.role === 'developer' ? 'system' : msg.role
      }));
    }

    // 3. 重新包装请求
    const newOptions = {
      ...options,
      body: JSON.stringify(body)
    };

    return fetch(url, newOptions);
  }
});

// 智谱华章大模型
export const glmClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: glmbaseURL
});

// qianwen大模型
export const qwClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: QWbaseURL
});

export const reader = new LlamaParseReader({
  apiKey: process.env.LLAMAINDEX_PARSE_KEY,
  resultType: 'markdown',
  verbose: true
});
