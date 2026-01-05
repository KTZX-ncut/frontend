import { Agent, AgentOptions } from '@voltagent/core';
import { InjectModelOptions } from '../decorators';
import { qwOpenAi } from '../model-mirror';
import pLimit from 'p-limit';
import { fileTools } from '../tools';

type EvaluationOptions = Partial<Pick<AgentOptions, 'model'>> & Omit<AgentOptions, 'model'>;

@InjectModelOptions(qwOpenAi.chat('qwen-plus'))
class AgentWrapper {
  private agent: Agent;

  constructor(options: EvaluationOptions) {
    this.agent = new Agent(options as AgentOptions);
  }

  getAgent() {
    return this.agent;
  }
  /**
   * 核心：Agent 内部处理逻辑
   * Workflow 只需要调用这个方法
   */
}

export default AgentWrapper;
