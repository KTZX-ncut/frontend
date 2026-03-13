import { lessonStaticPrompt, pptStaticPrompt, studentFeedBackStaticPrompt, courseEvaluationModelPrompt } from '../prompts';
import AgentWrapper from './AgentWrapper';

// 教师教案Agent、课堂反馈Agent
/**
 * 教案提取 Agent
 */
export const lessonPlanAgent = new AgentWrapper({
  id: 'lesson-plan-extractor',
  name: 'Lesson Plan Extractor',
  instructions: lessonStaticPrompt
}).getAgent();

/* 
 课堂反馈 Agent
*/
export const feedbackAgent = new AgentWrapper({
  id: 'extract-studentFeedback',
  name: 'studentFeedback Plan Extractor',
  instructions: studentFeedBackStaticPrompt
}).getAgent();

/* 
  PPT分析 Agent
*/
export const PPTAnalysisAgent = new AgentWrapper({
  id: 'extract-ppt-multimodal',
  name: 'ppt Plan Extractor',
  instructions: pptStaticPrompt
}).getAgent();

/* 
  KU、KW、A 建模 Agent
*/
export const modelingCreateAgent = new AgentWrapper({
  id: 'generate-course-evaluate-model',
  name: 'course Model Generator',
  instructions: courseEvaluationModelPrompt
}).getAgent();
