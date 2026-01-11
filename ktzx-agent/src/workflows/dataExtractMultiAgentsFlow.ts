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
        condition: async ({ data }) => {
          const lessonPlanPath = data.teachingMaterials.lessonPlanPath;
          return !!lessonPlanPath;
        },
        // condition: async ({ data }) => false,
        step: andThen({
          id: 'extract-lessonPlan',
          execute: async ({ data, logger }) => {
            const lessonData = await lessonPlanAgent.generateText(
              data?.teachingMaterials?.lessonPlanPath as string
            );

            logger.info('lessonData', { feedBackData: lessonData.text })
            return JSON.parse(lessonData.text)
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
          execute: async ({ data, logger }) => {
            const feedBackData = await feedbackAgent.generateText(
              data?.teachingMaterials?.studentFeedbackPath as string
            )
            logger.info('feedBackData', { feedBackData: feedBackData.text })
            return JSON.parse(feedBackData.text)
          }
        })
      }),
      andWhen({
        id: 'when-to-extract-ppt',
        condition: async ({ data }) => {
          const pptPath = data.teachingMaterials.pptPath;
          return !!pptPath;
        },
        step: andThen({
          id: 'extract-ppt-multimodal',
          execute: async ({ data, logger }) => {
            const pptMultiData = await PPTAnalysisAgent.generateText(data?.teachingMaterials?.pptPath as string)
            logger.info('pptMultiData', { feedBackData: pptMultiData.text })
            return JSON.parse(pptMultiData.text)
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
