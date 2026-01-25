import 'dotenv/config';
import { Hono } from 'hono';
import { getFileWorkflowPath } from '../services/minio.service.js';
import { zValidator } from '@hono/zod-validator';
import type { FileResourceSchema, WorkflowRequestSchema } from '../schema/index.ts';

const fileRoutes = new Hono();

/**
 * POST /api/files/generate-workflow-path
 * 前端在弹窗选中文件后，将 bucket 和 name 传给此接口
 */
fileRoutes.post('/generate-workflow-path', async (c) => {
  try {
    const data = await c.req.json() as WorkflowRequestSchema;
    const id = c.req.query('id')
    const stream = c.req.query('stream')

    const result = await getFileWorkflowPath(data)
    console.log(data, result)
    // 调用工作流
    console.log('env:', process.env.VOLTAGENT_API)
    // const response = await fetch(`${process.env.VOLTAGENT_API}/workflows/${id}/${stream ? 'stream' : 'execute'}`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   // 必须将对象序列化为字符串
    //   body: JSON.stringify({
    //     "courseName": data.courseName,
    //     "teachingMaterials": {
    //       "lessonPlanPath": result.lessonPlan?.url,
    //       "pptPath": result.ppt?.url,
    //       "studentFeedbackPath": result.studentFeedback?.url
    //     }
    //   })
    // });

    // const res = await response.json();
    // console.log(res)


    return c.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error,
      data: {}
    }, 500);
  }
});

export default fileRoutes;