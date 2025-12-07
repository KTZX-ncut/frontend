// this is a workflow to analyze the data from the class
import { andThen, andWhen, createWorkflowChain, LoggerProxy } from "@voltagent/core";
import { z } from "zod";
import { extract, pptMultimodalPrompts } from "../prompts";
import { documentsSplit, extractPPTContent, PPTAnalysisResult, chunkArray, summarizeText, extractImageLinks } from "../utils";
import { glmClient, reader } from "../model-mirror";
import { parseMarkdownJson } from "../utils";
import { CLIENT_RENEG_LIMIT } from "tls";
import { logger } from "../logs";
import { SentenceSplitter } from "llamaindex";
import pLimit from 'p-limit';

const schema = z.object({
  ku: z.array(z.string()),
  kw: z.array(z.string()),
  a: z.array(z.string())
})

const CONCURRENCY_LIMIT = 5;

// 前置任务：文本清洗、切片、多模态分析
export const dataAnalyzeWorkflow = createWorkflowChain({
  id: 'data-analyze',
  name: 'Data Analyze Workflow',
  purpose: "Course evaluation data analyze with high quality",
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
    extractCourseFramwork: z.array(z.object({
      ku: z.string().describe('知识单元'),
      keywords: z.array(z.string()).describe('关键字'),
      ability: z.array(z.string()).describe('能力'),
      kwA: z.array(z.string()).describe('关键字-能力对')
    })),
    metaData: z.object({
      source: z.array(z.string()).describe('数据来源')
    })
  })
}).andAll({
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
          const log = logger
          const lessonPlanPath = data.teachingMaterials.lessonPlanPath;

          if (!lessonPlanPath) {
            log.error('[Workflow] 跳过执行：lessonPlanPath 为空');
            return { ku: [], kw: [], a: [] };
          }

          try {
            log.info(`[Workflow] 开始处理教案文件: ${lessonPlanPath}`);

            // 读取并切片教案文件
            log.info(`[Workflow] 读取并切片教案文件...`);
            const lessonPlanNodes = await documentsSplit(lessonPlanPath);
            if (!lessonPlanNodes || lessonPlanNodes.length === 0) {
              return { ku: [], kw: [], a: [] };
            }

            const lessonPlan = lessonPlanNodes.map(node => node.text);
            log.info(`[Workflow] 教案文件处理完成，共 ${lessonPlan.length} 个文本块`);

            // 构建prompt
            const prompt = extract({
              source: 'lessonPlan',
              task: lessonPlan.join('\n--- BATCH_SEPARATOR ---\n')
            });

            const completion = await glmClient.chat.completions.create({
              model: 'glm-4-air-250414',
              messages: [
                { role: 'user', content: prompt }
              ]
            });

            const text = completion.choices[0].message.content;

            // 解析文本为 JSON（支持 Markdown 格式）
            const rawData = parseMarkdownJson<{ KU?: string[], KW?: string[], A?: string[], ku?: string[], kw?: string[], a?: string[] }>(text as string);

            // 转换字段名为小写（兼容大模型返回的大写字段名）
            const normalizedData = {
              ku: rawData.ku || rawData.KU || [],
              kw: rawData.kw || rawData.KW || [],
              a: rawData.a || rawData.A || []
            };

            // 校验 schema
            const parsed = schema.parse(normalizedData);
            log.info('提取结果：', parsed)
            return parsed;
          } catch (error) {
            log.error(`[Workflow] 教案处理失败:`, error);
            return { ku: [], kw: [], a: [] };
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
        execute: async ({ data, logger }) => {
          const log = logger
          const studentFeedbackPath = data.teachingMaterials.studentFeedbackPath;

          if (!studentFeedbackPath) {
            log.error('[Workflow] 跳过执行：studentFeedbackPath 为空');
            return { ku: [], kw: [], a: [] };
          }

          try {
            // 读取并切片反馈文件
            const studentFeedbackNodes = await documentsSplit(studentFeedbackPath);
            if (!studentFeedbackNodes || studentFeedbackNodes.length === 0) {
              return { ku: [], kw: [], a: [] };
            }

            const studentFeedback = studentFeedbackNodes.map(node => node.text);

            // 构建prompt
            const prompt = extract({
              source: 'studentFeedback',
              task: studentFeedback.join('\n--- BATCH_SEPARATOR ---\n')
            });

            const completion = await glmClient.chat.completions.create({
              model: 'glm-4-air-250414',
              messages: [
                { role: 'user', content: prompt }
              ]
            });

            const text = completion.choices[0].message.content;

            // 解析文本为 JSON（支持 Markdown 格式）
            const rawData = parseMarkdownJson<{ KU?: string[], KW?: string[], A?: string[], ku?: string[], kw?: string[], a?: string[] }>(text as string);

            // 转换字段名为小写（兼容大模型返回的大写字段名）
            const normalizedData = {
              ku: rawData.ku || rawData.KU || [],
              kw: rawData.kw || rawData.KW || [],
              a: rawData.a || rawData.A || []
            };

            // 校验 schema
            const parsed = schema.parse(normalizedData);
            log.info(`[Workflow] 反馈提取结果: KU=${parsed.ku}, KW=${parsed.kw}, A=${parsed.a}`);

            return parsed;
          } catch (error) {
            log.error(`[Workflow] 反馈处理失败:`, error);
            return { ku: [], kw: [], a: [] };
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
      step: andThen({
        id: 'extract-ppt-multimodal',
        execute: async ({ data, logger }) => {
          const pptPath = data.teachingMaterials.pptPath;
          const log = logger;

          if (!pptPath) {
            log?.info('跳过执行：pptPath 为空');
            return { ku: [], kw: [], a: [] };
          }

          try {
            log?.info(`[Workflow] 开始处理PPT文件: ${pptPath}`);

            // 1. 加载文档
            const documents = await reader.loadData(pptPath);

            // 2. (可选) 提取图片逻辑保留，供后续多模态扩展
            const fullMarkdown = documents.map(doc => doc.text).join("\n\n");
            // const imageLinks = extractImageLinks(fullMarkdown); 
            // log?.info(`提取到 ${imageLinks.length} 张图片`);

            // 3. 文本切片
            const splitter = new SentenceSplitter({ chunkSize: 1000, chunkOverlap: 100 }); // 建议稍微调大 chunkSize，减少 HTTP 请求次数，GLM-4 上下文很长
            const nodes = splitter.getNodesFromDocuments(documents);
            log?.info(`[Workflow] 分块完成，共 ${nodes.length} 个节点，开始并发提取...`);

            // --- 核心优化：并发控制逻辑 ---
            const CONCURRENCY_LIMIT = 5; // 根据你的 API 速率限制调整
            const limit = pLimit(CONCURRENCY_LIMIT);
            const startTime = Date.now();

            // 定义 Promise 数组
            const tasks = nodes.map((chunk, index) => {
              // limit 包裹异步函数
              return limit(async () => {
                const chunkText = chunk.text; // 确保获取的是文本内容

                // A. 预检查：内容太少直接跳过
                if (!chunkText || chunkText.length < 20) {
                  return { status: 'skipped', index };
                }

                try {
                  // B. 构建 Prompt
                  // 注意：这里暂时只传了文本，如果后续需要图片，需在这里关联 chunk 对应的图片
                  const prompt = pptMultimodalPrompts({
                    pptText: chunkText,
                    pptImages: '',
                  });

                  // C. 调用大模型
                  const completion = await glmClient.chat.completions.create({
                    model: 'glm-4-air-250414',
                    messages: [
                      { role: 'user', content: prompt } // 简化消息构建，除非真的传图片对象
                    ],
                    temperature: 0.1, // 提取任务建议低温度
                  });

                  const text = completion.choices[0].message.content;

                  // D. 解析结果
                  const rawData = parseMarkdownJson<{
                    KU?: string[], KW?: string[], A?: string[],
                    ku?: string[], kw?: string[], a?: string[]
                  }>(text as string);

                  const normalizedData = {
                    ku: rawData.ku || rawData.KU || [],
                    kw: rawData.kw || rawData.KW || [],
                    a: rawData.a || rawData.A || []
                  };

                  // E. 校验并返回统一结构 (关键修改：统一返回结构)
                  const parsed = schema.parse(normalizedData);

                  // 简单的进度日志
                  console.log(`[Task ${index}/${nodes.length}] ✅ 完成 (KU:${parsed.ku.length}, KW:${parsed.kw.length})`);

                  return {
                    status: 'success',
                    index,
                    data: parsed
                  };

                } catch (error) {
                  console.error(`[Task ${index}] ❌ 失败: ${error}`);
                  // 返回错误状态，不要抛出异常，否则 Promise.all 会挂
                  return {
                    status: 'error',
                    index,
                    error
                  };
                }
              });
            });

            // 4. 等待所有任务完成
            const results = await Promise.all(tasks);

            // 5. 数据聚合 (Map-Reduce 中的 Reduce 步骤)
            const validResults = results
              .filter((r): r is { status: 'success', index: number, data: any } => r.status === 'success')
              .map(r => r.data);

            // 合并所有切片的结果
            const finalResult = {
              ku: validResults.flatMap(r => r.ku),
              kw: validResults.flatMap(r => r.kw),
              a: validResults.flatMap(r => r.a),
            };

            // 去重 (可选，视业务需求而定)
            finalResult.ku = [...new Set(finalResult.ku)];
            finalResult.kw = [...new Set(finalResult.kw)];
            finalResult.a = [...new Set(finalResult.a)];

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            log?.info(`[Workflow] PPT处理完毕。耗时: ${duration}s`);
            log?.info(`[Workflow] 最终产出: KU=${finalResult.ku.length}, KW=${finalResult.kw.length}, A=${finalResult.a.length}`);

            return finalResult;

          } catch (error) {
            log?.error(`PPT处理整体失败:`, error);
            return { ku: [], kw: [], a: [] };
          }
        }
      })
    }),
  ]
}).andThen({
  id: "merge-results",
  execute: async ({ data }) => {
    console.log('lyjc----->data', data)
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
  },
})

// const res = await dataAnalyzeWorkflow.run({
//   courseName: '数据库系统原理',
//   teachingMaterials: {
//     lessonPlan,
//     studentFeedback,
//     pptPath: join(DATA_DIR,'CH5范数、序列、级数.pptx')
//   }
// })

// console.log("workflow results", res)


