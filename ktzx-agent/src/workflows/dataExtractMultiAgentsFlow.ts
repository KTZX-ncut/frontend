// this is a workflow to analyze the data from the class
import { andThen, andWhen, createWorkflowChain, LoggerProxy } from '@voltagent/core';
import { z } from 'zod';
import { lessonPlanAgent, feedbackAgent, PPTAnalysisAgent } from '../agents';

const schema = z.object({
  ku: z.array(z.string()),
  kw: z.array(z.string()),
  a: z.array(z.string())
});

// 前置任务：文本清洗、切片、多模态分析
export const dataExtractWorkflow = createWorkflowChain({
  id: 'data-extract',
  name: 'Data Extract Workflow',
  purpose: 'Course evaluation data analyze with high quality',
  input: z.object({
    courseName: z.string().describe('课堂名称，例如《数据库系统原理》'),
    teachingMaterials: z.object({
      lessonPlanPath: z.string().optional().describe('教师教案文件路径（.docx格式）'),
      pptPath: z.string().optional().describe('课堂PPT文件路径（.pptx格式）'),
      studentFeedbackPath: z.string().optional().describe('课堂反馈文件路径（.docx格式）')
    })
  }),
  result: z.object({
    courseName: z.string(),
    extractCourseFramwork: z.array(
      z.object({
        ku: z.string().describe('知识单元'),
        keywords: z.array(z.string()).describe('关键字'),
        ability: z.array(z.string()).describe('能力'),
        kwA: z.array(z.string()).describe('关键字-能力对')
      })
    ),
    metaData: z.object({
      source: z.array(z.string()).describe('数据来源')
    })
  })
})
  .andAll({
    id: 'label-extract',
    steps: [
      // 处理教学教案
      andWhen({
        id: 'when-to-extract-lessonPlan',
        condition: async ({ data, logger }) => {
          const lessonPlanPath = data.teachingMaterials.lessonPlanPath;
          return !!lessonPlanPath;
        },
        // condition: async ({ data }) => false,
        step: andThen({
          id: 'extract-lessonPlan',
          execute: async ({ data, logger, writer }) => {
            const lessonData = await lessonPlanAgent.streamText(
              data?.teachingMaterials?.lessonPlanPath as string
            );
            let fullText = '';
            for await (const chunk of lessonData.fullStream) {
              writer.write({
                type: 'lessonplan-resoning',
                output: { content: chunk }
              });
              console.log(chunk);
              // 累加正文内容，以便最后解析 JSON
              if (chunk.type === 'text-delta') {
                fullText += chunk.text;
              }
            }

            // 3. 等流结束后，解析最终的文本并返回给工作流下一步
            try {
              return JSON.parse(fullText);
            } catch (e) {
              console.error('Failed to parse AI JSON:', fullText);
              // 如果解析失败，可以尝试用框架内置的工具修复或返回原始文本
              return { raw: fullText };
            }
          }
        })
      }),
      // 处理课堂反馈
      andWhen({
        id: 'when-to-extract-studentFeedback',
        condition: async ({ data, logger }) => {
          const studentFeedbackPath = data.teachingMaterials.studentFeedbackPath;
          return !!studentFeedbackPath;
        },
        // condition: async ({ data }) => false,
        step: andThen({
          id: 'extract-studentFeedback',
          execute: async ({ data, logger, writer }) => {
            const feedBackData = await feedbackAgent.streamText(
              data?.teachingMaterials?.studentFeedbackPath as string
            );
            let fullText = '';
            for await (const chunk of feedBackData.fullStream) {
              writer.write({
                type: 'feedback-resoning',
                output: { content: chunk }
              });
              console.log(chunk);
              // 累加正文内容，以便最后解析 JSON
              if (chunk.type === 'text-delta') {
                fullText += chunk.text;
              }
            }

            // 3. 等流结束后，解析最终的文本并返回给工作流下一步
            try {
              return JSON.parse(fullText);
            } catch (e) {
              console.error('Failed to parse AI JSON:', fullText);
              // 如果解析失败，可以尝试用框架内置的工具修复或返回原始文本
              return { raw: fullText };
            }
          }
        })
      }),
      andWhen({
        id: 'when-to-extract-ppt',
        condition: async ({ data }) => {
          const pptPath = data.teachingMaterials.pptPath;
          return !!pptPath;
        },
        // condition: async ({ data }) => false,
        step: andThen({
          id: 'extract-ppt-multimodal',
          execute: async ({ data, logger, writer }) => {
            const pptMultiData = await PPTAnalysisAgent.streamText(
              data?.teachingMaterials?.pptPath as string
            );
            let fullText = '';
            for await (const chunk of pptMultiData.fullStream) {
              writer.write({
                type: 'ppt-resoning',
                output: { content: chunk }
              });
              console.log(chunk);
              // 累加正文内容，以便最后解析 JSON
              if (chunk.type === 'text-delta') {
                fullText += chunk.text;
              }
            }

            // 3. 等流结束后，解析最终的文本并返回给工作流下一步
            try {
              return JSON.parse(fullText);
            } catch (e) {
              console.error('Failed to parse AI JSON:', fullText);
              // 如果解析失败，可以尝试用框架内置的工具修复或返回原始文本
              return { raw: fullText };
            }
          }
        })
      })
    ]
  })
  .andThen({
    id: 'merge-results',
    execute: async ({ data }) => {
      console.log('lyjc----->data', data);
      // data.map(())
      // let kuRes = [] as string[]
      // let kwRes = [] as string[]
      // let abilityRes = [] as string[]
      // data.map((dataObj) => {
      //   kuRes = [...kuRes, ...dataObj.ku]
      //   kwRes = [...kwRes, ...dataObj.kw]
      //   abilityRes = [...abilityRes, ...dataObj.a]
      // })
      return {
        // ku: kuRes,
        // kw: kwRes,
        // ability: abilityRes,
        data
      };
    }
  });
