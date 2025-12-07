import { DocxReader } from "@llamaindex/readers/docx";
import { SentenceSplitter, Settings } from 'llamaindex';
import { OpenAIEmbedding, OpenAI } from "@llamaindex/openai";
import { VectorStoreIndex } from "llamaindex";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';

// 全局设置 Embedding 模型
Settings.embedModel = new HuggingFaceEmbedding();

Settings.llm = new OpenAI({
  model: "gpt-3.5-turbo",
  apiKey: 'sb-aa963b90f85cb7bbfab55b0a9eef58fd06f11a21b4bca334',
  baseURL: "https://api.openai-sb.com/v1",
});

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 默认目录为当前目录下的 assests 文件夹
export const DATA_DIR = join(__dirname, '../assests');

// 文本清洗函数
export function cleanText(text: string): string {
  return text
    // 移除多个连续的换行符，替换为单个空格
    .replace(/\n\n+/g, ' ')
    // 移除单个换行符
    .replace(/\n/g, ' ')
    // 移除回车符
    .replace(/\r/g, ' ')
    // 移除制表符
    .replace(/\t/g, ' ')
    // 移除多个连续的空格，替换为单个空格
    .replace(/\s+/g, ' ')
    // 移除首尾空格
    .trim();
}



// 读取文档
export async function getDocuments(filePath?: string) {
  const reader = new DocxReader();
  // 如果传入了文件路径，直接使用；否则使用默认路径
  const finalPath = filePath || join(DATA_DIR, 'C-02.docx');
  const documents = await reader.loadData(finalPath);
  return documents;
}

// 主函数：读取文档、分块、向量化、查询
export async function documentsSplit(filePath?: string) {
  try {
    // 如果传入了文件路径，使用传入的路径；否则使用默认路径
    const finalPath = filePath || join(DATA_DIR, 'C-02.docx');
    const fileName = finalPath.split(/[/\\]/).pop() || '未知文件';
    console.log(`\n开始读取文件: ${fileName}...`);

    // 读取文档
    const documents = await getDocuments(filePath);
    console.log(`成功读取文档，共 ${documents.length} 个`);

    // 文本分块
    console.log('开始文本分块...');
    const splitter = new SentenceSplitter({ chunkSize: 512, chunkOverlap: 50 });
    const nodes = splitter.getNodesFromDocuments(documents);
    console.log(`分块完成，共 ${nodes.length} 个节点\n`);
    return nodes


  } catch (error) {
    console.log(error);
  }
}

// 批处理函数
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
}

/**
 * 使用大模型对文本进行摘要
 * @param text 原始文本
 * @param maxLength 摘要最大长度（字符数）
 * @param glmClient 大模型客户端（可选，如果不提供则使用智能截取）
 * @returns 摘要后的文本
 */
export async function summarizeText(
  text: string, 
  maxLength: number = 2000,
  glmClient?: any
): Promise<string> {
  try {
    // 如果文本已经足够短，直接返回
    if (text.length <= maxLength) {
      console.log(`[摘要] 文本长度 ${text.length} 已满足要求，无需摘要`);
      return text;
    }

    console.log(`[摘要] 开始对文本进行摘要，原始长度: ${text.length} 字符，目标长度: ${maxLength} 字符`);
    
    // 如果提供了glmClient，使用大模型进行摘要
    if (glmClient) {
      try {
        const summaryPrompt = `请对以下教学PPT内容进行摘要，保留所有关键知识点、概念和重要信息，摘要长度控制在${maxLength}字符以内。要求：
1. 保留所有重要的知识点和概念
2. 保留关键术语和技术名词
3. 保留重要的定义、公式和原理
4. 去除冗余和重复内容
5. 保持逻辑连贯性
6. 摘要必须用中文输出

原始内容：
${text}

摘要：`;

        console.log(`[摘要] 调用大模型进行摘要...`);
        const completion = await glmClient.chat.completions.create({
          model: 'glm-4-air-250414',
          messages: [
            { role: 'user', content: summaryPrompt }
          ]
        });

        const summarizedText = completion.choices[0].message.content?.trim() || '';
        
        // 如果摘要结果仍然太长，再次截取
        if (summarizedText.length > maxLength * 1.2) {
          console.log(`[摘要] 摘要结果仍然较长 (${summarizedText.length} 字符)，进行二次处理`);
          return smartTruncate(summarizedText, maxLength);
        }
        
        console.log(`[摘要] 大模型摘要完成，摘要后长度: ${summarizedText.length} 字符`);
        return summarizedText;
      } catch (apiError) {
        console.log(`[摘要] 大模型API调用失败，使用智能截取方案:`, apiError);
        // Fallback: 智能截取
        return smartTruncate(text, maxLength);
      }
    } else {
      // 如果没有提供glmClient，使用智能截取
      console.log(`[摘要] 未提供大模型客户端，使用智能截取方案`);
      return smartTruncate(text, maxLength);
    }
  } catch (error) {
    console.error(`[摘要] 摘要处理失败:`, error);
    // 如果摘要失败，使用智能截取
    return smartTruncate(text, maxLength);
  }
}

/**
 * 智能截取文本，按句子边界截取，避免截断句子
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截取后的文本
 */
function smartTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // 按句子分割（中文和英文句号、问号、感叹号）
  const sentences = text.split(/([。！？.!?]\s*)/);
  let result = '';
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] + (sentences[i + 1] || '');
    if ((result + sentence).length <= maxLength) {
      result += sentence;
    } else {
      break;
    }
  }
  
  // 如果截取后太短，至少保留前maxLength个字符
  if (result.length < maxLength * 0.5) {
    result = text.substring(0, maxLength);
    // 尝试在最后一个句号处截断
    const lastPeriod = result.lastIndexOf('。');
    const lastPeriodEn = result.lastIndexOf('.');
    const lastBreak = Math.max(lastPeriod, lastPeriodEn);
    if (lastBreak > maxLength * 0.7) {
      result = result.substring(0, lastBreak + 1);
    }
  }
  
  console.log(`[摘要] 智能截取完成，截取后长度: ${result.length} 字符`);
  return result;
}

// PPT幻灯片数据结构
export interface PPTSlide {
  slideNumber: number;
  title?: string;
  text: string;
  images: Array<{
    data: string; // base64编码的图片数据
    name: string;
    type: string;
  }>;
  codeBlocks: string[];
  structure: {
    level: number;
    content: string;
  }[];
}

// PPT处理结果
export interface PPTAnalysisResult {
  slides: PPTSlide[];
  totalSlides: number;
  allText: string;
  allImages: Array<{
    data: string;
    name: string;
    type: string;
  }>;
  allCodeBlocks: string[];
}

/**
 * 从PPTX文件中提取文本、图片和结构信息
 * @param filePath PPTX文件路径
 * @returns PPT分析结果
 */
export async function extractPPTContent(filePath: string): Promise<PPTAnalysisResult> {
  try {
    console.log(`[PPT处理] 步骤1: 检查文件是否存在: ${filePath}`);
    if (!existsSync(filePath)) {
      throw new Error(`PPT文件不存在: ${filePath}`);
    }
    console.log(`[PPT处理] 步骤2: 文件存在，开始读取ZIP文件...`);

    const zip = new AdmZip(filePath);
    console.log(`[PPT处理] 步骤3: ZIP文件读取成功，开始检查PPT结构...`);
    
    const slides: PPTSlide[] = [];
    const allImages: Array<{ data: string; name: string; type: string }> = [];
    const allCodeBlocks: string[] = [];

    // 读取幻灯片关系文件
    console.log(`[PPT处理] 步骤4: 读取presentation.xml.rels...`);
    const slideRels = zip.getEntry('ppt/_rels/presentation.xml.rels');
    if (!slideRels) {
      throw new Error('无法读取PPT结构');
    }
    console.log(`[PPT处理] 步骤5: presentation.xml.rels读取成功`);

    // 解析presentation.xml获取幻灯片列表
    console.log(`[PPT处理] 步骤6: 读取并解析presentation.xml...`);
    const presentationXml = zip.readAsText('ppt/presentation.xml');
    console.log(`[PPT处理] 步骤7: presentation.xml读取成功，开始XML解析...`);
    const presentation = await parseStringPromise(presentationXml);
    console.log(`[PPT处理] 步骤8: XML解析完成`);
    
    // 获取幻灯片ID列表
    const slideIdList = presentation['p:presentation']?.['p:sldIdLst']?.[0]?.['p:sldId'] || [];
    console.log(`[PPT处理] 步骤9: 找到 ${slideIdList.length} 张幻灯片，开始处理...`);
    
    for (let i = 0; i < slideIdList.length; i++) {
      console.log(`[PPT处理] 步骤10.${i + 1}: 开始处理第 ${i + 1}/${slideIdList.length} 张幻灯片...`);
      const slideId = slideIdList[i];
      const slideRId = slideId['$']?.['r:id'];
      console.log(`[PPT处理] 步骤10.${i + 1}.1: 幻灯片ID: ${slideRId}`);
      
      if (!slideRId) {
        console.log(`[PPT处理] 步骤10.${i + 1}.2: 警告：幻灯片ID为空，跳过`);
        continue;
      }
      
      // 查找对应的幻灯片文件
      console.log(`[PPT处理] 步骤10.${i + 1}.2: 读取幻灯片关系文件...`);
      const slideRelXml = zip.readAsText('ppt/_rels/presentation.xml.rels');
      console.log(`[PPT处理] 步骤10.${i + 1}.3: 解析幻灯片关系XML...`);
      const slideRel = await parseStringPromise(slideRelXml);
      const relationships = slideRel['Relationships']?.['Relationship'] || [];
      console.log(`[PPT处理] 步骤10.${i + 1}.4: 找到 ${relationships.length} 个关系，查找幻灯片文件...`);
      const slideRelEntry = relationships.find((rel: { $: { Id?: string } }) => rel['$']?.['Id'] === slideRId);
      
      if (!slideRelEntry) {
        console.log(`[PPT处理] 步骤10.${i + 1}.5: 警告：未找到对应的幻灯片关系，跳过`);
        continue;
      }
      
      const slidePath = `ppt/${slideRelEntry['$']?.['Target']}`;
      console.log(`[PPT处理] 步骤10.${i + 1}.5: 幻灯片路径: ${slidePath}`);
      console.log(`[PPT处理] 步骤10.${i + 1}.6: 读取幻灯片XML...`);
      const slideXml = zip.readAsText(slidePath);
      console.log(`[PPT处理] 步骤10.${i + 1}.7: 解析幻灯片XML...`);
      const slideData = await parseStringPromise(slideXml);
      console.log(`[PPT处理] 步骤10.${i + 1}.8: 幻灯片XML解析完成`);
      
      // 提取文本内容
      const textElements: string[] = [];
      const extractText = (obj: any): void => {
        if (typeof obj === 'string') {
          textElements.push(obj);
        } else if (Array.isArray(obj)) {
          obj.forEach(item => extractText(item));
        } else if (obj && typeof obj === 'object') {
          Object.values(obj).forEach(value => extractText(value));
          // 提取文本节点
          if (obj['a:t']) {
            const textNodes = Array.isArray(obj['a:t']) ? obj['a:t'] : [obj['a:t']];
            textNodes.forEach((node: any) => {
              if (typeof node === 'string') {
                textElements.push(node);
              } else if (node['_']) {
                textElements.push(node['_']);
              }
            });
          }
        }
      };
      
      console.log(`[PPT处理] 步骤10.${i + 1}.9: 开始提取文本内容...`);
      extractText(slideData);
      const slideText = textElements.join(' ').trim();
      console.log(`[PPT处理] 步骤10.${i + 1}.10: 文本提取完成，文本长度: ${slideText.length}`);
      
      // 提取图片
      console.log(`[PPT处理] 步骤10.${i + 1}.11: 开始提取图片...`);
      const slideImages: Array<{ data: string; name: string; type: string }> = [];
      const mediaEntries = zip.getEntries().filter((entry: { entryName: string }) => 
        entry.entryName.startsWith('ppt/media/') && 
        (entry.entryName.match(/\.(png|jpg|jpeg|gif|bmp)$/i))
      );
      console.log(`[PPT处理] 步骤10.${i + 1}.12: 找到 ${mediaEntries.length} 个媒体文件`);
      
      // 尝试从当前幻灯片关联的图片
      const slideRelPath = slidePath.replace('.xml', '.xml.rels');
      console.log(`[PPT处理] 步骤10.${i + 1}.13: 检查幻灯片关系文件: ${slideRelPath}`);
      if (zip.getEntry(slideRelPath)) {
        console.log(`[PPT处理] 步骤10.${i + 1}.14: 读取幻灯片关系文件...`);
        const relXml = zip.readAsText(slideRelPath);
        console.log(`[PPT处理] 步骤10.${i + 1}.15: 解析关系XML...`);
        const relData = await parseStringPromise(relXml);
        const rels = relData['Relationships']?.['Relationship'] || [];
        console.log(`[PPT处理] 步骤10.${i + 1}.16: 找到 ${rels.length} 个关系，开始提取图片...`);
        
        let imageCount = 0;
        rels.forEach((rel: { $: { Type?: string; Target?: string; Id?: string } }) => {
          if (rel['$']?.['Type']?.includes('image')) {
            const imagePath = `ppt/${rel['$']?.['Target']}`;
            console.log(`[PPT处理] 步骤10.${i + 1}.16.${imageCount + 1}: 处理图片: ${imagePath}`);
            const imageEntry = zip.getEntry(imagePath);
            if (imageEntry) {
              console.log(`[PPT处理] 步骤10.${i + 1}.16.${imageCount + 1}.1: 读取图片数据...`);
              const imageBuffer = imageEntry.getData();
              console.log(`[PPT处理] 步骤10.${i + 1}.16.${imageCount + 1}.2: 图片大小: ${imageBuffer.length} bytes，转换为base64...`);
              const imageBase64 = imageBuffer.toString('base64');
              const imageType = imagePath.split('.').pop()?.toLowerCase() || 'png';
              const imageName = imagePath.split('/').pop() || `image_${i}_${slideImages.length}`;
              
              slideImages.push({
                data: `data:image/${imageType};base64,${imageBase64}`,
                name: imageName,
                type: imageType
              });
              
              allImages.push({
                data: `data:image/${imageType};base64,${imageBase64}`,
                name: imageName,
                type: imageType
              });
              console.log(`[PPT处理] 步骤10.${i + 1}.16.${imageCount + 1}.3: 图片处理完成: ${imageName}`);
              imageCount++;
            }
          }
        });
        console.log(`[PPT处理] 步骤10.${i + 1}.17: 图片提取完成，共 ${imageCount} 张`);
      } else {
        console.log(`[PPT处理] 步骤10.${i + 1}.14: 未找到幻灯片关系文件，跳过图片提取`);
      }
      
      // 提取代码块（通过识别代码模式）
      console.log(`[PPT处理] 步骤10.${i + 1}.18: 开始提取代码块...`);
      const codeBlocks: string[] = [];
      const codePatterns = [
        /```[\s\S]*?```/g,
        /`[^`]+`/g,
        /(function|const|let|var|class|interface|import|export)\s+[\s\S]*?[;}]/g
      ];
      
      codePatterns.forEach(pattern => {
        const matches = slideText.match(pattern);
        if (matches) {
          codeBlocks.push(...matches);
        }
      });
      
      allCodeBlocks.push(...codeBlocks);
      console.log(`[PPT处理] 步骤10.${i + 1}.19: 代码块提取完成，找到 ${codeBlocks.length} 个代码块`);
      
      // 构建结构信息（简单的层级提取）
      console.log(`[PPT处理] 步骤10.${i + 1}.20: 构建结构信息...`);
      const structure = slideText.split('\n').map((line, idx) => ({
        level: line.match(/^#+/)?.[0]?.length || 1,
        content: line.trim()
      })).filter(item => item.content);
      
      slides.push({
        slideNumber: i + 1,
        text: slideText,
        images: slideImages,
        codeBlocks: codeBlocks,
        structure: structure
      });
      console.log(`[PPT处理] 步骤10.${i + 1}.21: 第 ${i + 1} 张幻灯片处理完成`);
    }
    
    console.log(`[PPT处理] 步骤11: 所有幻灯片处理完成，开始汇总结果...`);
    const allText = slides.map(s => s.text).join('\n--- SLIDE_SEPARATOR ---\n');
    console.log(`[PPT处理] 步骤12: 结果汇总完成`);
    console.log(`[PPT处理] 最终统计: ${slides.length} 张幻灯片, ${allImages.length} 张图片, ${allCodeBlocks.length} 个代码块`);
    
    return {
      slides,
      totalSlides: slides.length,
      allText,
      allImages,
      allCodeBlocks
    };
  } catch (error) {
    console.error('[PPT处理] 错误:', error);
    if (error instanceof Error) {
      console.error('[PPT处理] 错误堆栈:', error.stack);
    }
    throw error;
  }
}

/**
 * 解析大模型返回的 Markdown 格式 JSON 数据
 * 支持以下格式：
 * - ```json\n{...}\n```
 * - ```\n{...}\n```
 * - 纯 JSON 字符串
 * 
 * @param text 可能包含 Markdown 代码块的文本
 * @returns 解析后的 JSON 对象
 * @throws 如果无法解析为有效 JSON，抛出错误
 */
export function parseMarkdownJson<T = any>(text: string): T {
  if (!text || typeof text !== 'string') {
    throw new Error('输入必须是有效的字符串');
  }

  // 去除首尾空白字符
  const trimmed = text.trim();

  // 尝试匹配 Markdown 代码块格式：```json 或 ```
  const jsonBlockRegex = /^```(?:json)?\s*\n([\s\S]*?)\n```$/;
  const match = trimmed.match(jsonBlockRegex);

  if (match) {
    // 提取代码块内的内容
    const jsonContent = match[1].trim();
    try {
      return JSON.parse(jsonContent) as T;
    } catch (error) {
      throw new Error(`解析 JSON 代码块内容失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 如果没有匹配到代码块，尝试直接解析为 JSON
  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    throw new Error(`无法解析为 JSON: ${error instanceof Error ? error.message : String(error)}。原始内容: ${trimmed.substring(0, 100)}...`);
  }
}

export function extractImageLinks(md: string): string[] {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(md)) !== null) {
      links.push(match[1]);
  }
  return links;
}



// embedings
// 向量化
// console.log('开始向量化...');
// const index = await VectorStoreIndex.fromDocuments(documents);
// console.log('✅ 向量化完成\n');

// // 打印 embedding 向量坐标
// console.log('========== Embedding 向量信息 ==========\n');

// // 从索引的向量存储中获取已向量化的节点
// const vectorStore = index.vectorStores;
// console.log('向量存储类型:', vectorStore.constructor.name);

// // 获取所有已向量化的节点
// const retriever = index.asRetriever({ similarityTopK: nodes.length });

// // 手动为每个节点生成 embedding 来查看
// console.log('\n正在为每个节点生成 embedding...\n');

// for (let i = 0; i < Math.min(nodes.length, 5); i++) {  // 只打印前5个节点
//   const node = nodes[i];

//   console.log(`\n--- 节点 ${i + 1} ---`);
//   console.log('节点ID:', node.id_);
//   console.log('文本内容:', node.text.substring(0, 150) + '...');

//   // 手动生成该节点的 embedding
//   try {
//     const embedding = await Settings.embedModel.getTextEmbedding(node.text);

//     console.log('\n✅ Embedding 信息:');
//     console.log('  维度:', embedding.length);
//     console.log('  前10个值:', embedding.slice(0, 10).map(v => v.toFixed(6)));
//     console.log('  后10个值:', embedding.slice(-10).map(v => v.toFixed(6)));

//     // 计算向量的范数（模长）
//     const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
//     console.log('  向量范数（模长）:', norm.toFixed(6));

//     // 计算向量的统计信息
//     const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
//     const max = Math.max(...embedding);
//     const min = Math.min(...embedding);
//     console.log('  平均值:', mean.toFixed(6));
//     console.log('  最大值:', max.toFixed(6));
//     console.log('  最小值:', min.toFixed(6));

//   } catch (error) {
//     console.log('⚠️  生成 embedding 失败:', error);
//   }
// }

// console.log('\n========================================\n');

// // 查询
// const queryEngine = index.asQueryEngine();
// const query = "如何对总价进行四舍五入";

// console.log(`开始查询: "${query}"\n`);
// const results = await queryEngine.query({ query });

// console.log('========== 查询结果 ==========');
// console.log('回答:', results.response);
// console.log('\n相关文档片段:');
// if (results.sourceNodes) {
//   results.sourceNodes.forEach((node, i) => {
//     console.log(`\n片段 ${i + 1}:`);
//     console.log('相似度分数:', node.score?.toFixed(4) || 'N/A');
//     console.log('内容:', node.node.text.substring(0, 200) + '...');
//   });
// }
// console.log('\n================================\n');
