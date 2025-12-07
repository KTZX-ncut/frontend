import { InferenceClient } from '@huggingface/inference';

const hf = new InferenceClient('your access token');

export const summarizePromises = (chunks: string[]) => {
    chunks.map(async (chunk, index) => {
        try {
            // 调用 HF Inference API
            const result = await hf.chatCompletion({
                model: "Qwen/Qwen2.5-72B-Instruct", // 使用强大的开源模型
                messages: [
                    {
                        role: "system",
                        content: "你是一个专业的文档总结助手。请简要总结用户的输入，保留关键数据和核心观点。不要废话，直接输出总结结果。"
                    },
                    { role: "user", content: chunk }
                ],
                max_tokens: 500, // 限制输出长度，强制压缩
                temperature: 0.3
            });

            const summary = result.choices[0].message.content || "";
            console.log(`[HF Step] 片段 ${index + 1} 总结完成 (长度: ${summary.length})`);
            return summary;

        } catch (error) {
            console.error(`[HF Step] 片段 ${index + 1} 处理失败:`, error);
            // 如果失败，为了不打断流程，可以选择返回空或原文本的前200字
            return `[片段${index}提取失败]`;
        }
    });
}