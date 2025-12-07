import { Agent } from "@voltagent/core";
import { mirrorOpenAi } from "../model-mirror";
import { lessonPrompts, feedbackPrompts } from "../prompts";

// 教师教案Agent、课堂反馈Agent
export const lessPlanExtractAgent = new Agent({
  name: "ktzx-agent",
  model: mirrorOpenAi("glm-4-air-250414"),
  instructions: lessonPrompts
});

export const lessonFeedbackAgent = new Agent({
  name: "ktzx-agent",
  model: mirrorOpenAi("glm-4-air-250414"),
  instructions: feedbackPrompts
});