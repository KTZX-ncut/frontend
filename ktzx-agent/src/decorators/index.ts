import { OpenAIChatLanguageModelOptions } from '@ai-sdk/openai';
import { DynamicValue, LanguageModel } from '@voltagent/core';
import { fileTools, pptSentenceTool, runWithConcurrency } from '../tools';

/**
 * @InjectModelOptions 注解实现
 * 接收模型名称，并修改类的构造逻辑,以调用者的参数为准否则用默认模型
 */
export const InjectModelOptions = (model: LanguageModel | DynamicValue<LanguageModel> | string) => {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    return class extends constructor {
      constructor(...args: any[]) {
        // 此处的args[0]就是劫持的构造函数的参数
        if (args[0]) {
          args[0].model = args[0].model || model;

          // 确保 tools 一定是数组后再做展开，避免对 undefined / 非数组做 ... 导致 not iterable
          const existingTools = Array.isArray(args[0].tools)
            ? args[0].tools
            : args[0].tools
            ? [args[0].tools]
            : [];

          args[0].tools = [
            ...existingTools,
            fileTools(console),
            // runWithConcurrency,
            pptSentenceTool(console)
          ];
        }
        super(...args);
      }
    };
  };
};
