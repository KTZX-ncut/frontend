import { minioClient } from '../clients/index.ts';
import type { FileResourceSchema, WorkflowRequestSchema } from '../schema/index.ts';

/**
 * 为选中的文件生成工作流可访问的信息
 * @param bucketName 桶名
 * @param objectName 文件名/路径
 */
export const getFileWorkflowPath = async (resources: WorkflowRequestSchema) => {
  // 我们可以使用 Promise.all 并行处理这三个文件的 URL 生成
  const keys = Object.keys(resources) as Array<keyof WorkflowRequestSchema>;

  const results = await Promise.all(
    keys.map(async key => {
      const { fileName, bucketName } = resources[key] as FileResourceSchema;
      let actualFullKey = '';

      // 生成 24 小时有效的预签名 URL
      let url = '';
      if (fileName && bucketName) {
        // 找到所有以filename 开头的文件，取第一个
        console.log(fileName);
        let stream = minioClient.listObjects(bucketName, fileName, true);
        for await (const obj of stream) {
          if (obj.name) {
            actualFullKey = obj.name;
            break;
          }
        }

        url = await minioClient.presignedGetObject(bucketName, actualFullKey, 24 * 60 * 60);
      }

      return {
        type: key, // studentFeedback, lessonPlan, 或 ppt
        url: url,
        fileName: actualFullKey
      };
    })
  );

  // 将数组转回对象格式返回给前端/工作流
  return {
    studentFeedback: results.find(r => r.type === 'studentFeedback'),
    lessonPlan: results.find(r => r.type === 'lessonPlan'),
    ppt: results.find(r => r.type === 'ppt')
  };
};
