import { createOpenAI } from '@ai-sdk/openai'
import 'dotenv/config'
import OpenAI from 'openai'
import { LlamaParseReader } from "llama-cloud-services";
import 'dotenv/config'

console.log("KEY:", process.env.OPENAI_API_KEY)


// const baseURL = 'https://api.openai-sb.com/v1'
const baseURL = 'https://open.bigmodel.cn/api/paas/v4/'

export const mirrorOpenAi = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL,
})

export const glmClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL
})

export const reader = new LlamaParseReader({ 
  apiKey: process.env.LLAMAINDEX_PARSE_KEY, 
  resultType: "markdown",
  verbose: true
});