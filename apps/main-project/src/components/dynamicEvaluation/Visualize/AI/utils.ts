// --- SSE 连接与处理 ---

import MarkdownIt from "markdown-it";
import { nextTick, Ref } from "vue";

// --- 日志与结果状态 (复用) ---
export interface LogItem {
  time: string;
  title: string;
  detail?: string;
  type?: string;
  color?: string;
  status?: string
}

export interface SSEGenerationParams {
  streamStatus: Ref<string>;
  isProcessing: Ref<boolean>;
  editableData: Ref<any[]>;
  isFinished: Ref<boolean>;
  textBuffer: Ref<string>;
  scrollToBottom: () => void;
  rawMarkdown: Ref<string>;
  renderedMarkdown: Ref<string>;
  logs: Ref<LogItem[]>;
  logScrollbarRef: Ref<any>
}

export const sseGeneration = (params: SSEGenerationParams) => {

  const { streamStatus, isProcessing, editableData, isFinished, scrollToBottom, rawMarkdown, renderedMarkdown, logs, logScrollbarRef, textBuffer } = params
  const md = new MarkdownIt({ html: true, linkify: true, breaks: true });
  let renderTimer: number | null = null;
  let isRenderLoopRunning = false;

  const startSSEConnection = async (url: string, requestBody: any) => {

    try {
      // 使用 fetch 获取 ReadableStream
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // 标记第一条日志完成
      updateLastLogStatus('done');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        processSSEChunk(chunk);
      }

      // 结束处理
      streamStatus.value = 'done';
      isProcessing.value = false;
      addLog('分析完成', '所有内容已生成', 'success', 'done');
    } catch (error) {
      console.error('Stream Error:', error);
      addLog('生成中断', '网络连接异常或服务超时', 'danger');
      isProcessing.value = false;
      streamStatus.value = 'done';
    }
  };

  // --- 解析 SSE 数据包 ---
  // --- 处理具体的业务事件 ---
  const handleSSEEvent = (payload: any) => {
    // 根据 type 字段判断事件类型
    switch (payload.type) {
      // 1. 流程启动
      case 'workflow-start':
        streamStatus.value = 'thinking';
        addLog('流程启动', `Execution ID: ${payload.executionId}`, 'primary', 'done');
        break;

      // 2. 步骤开始
      case 'step-start':
        const stepName = payload.metadata?.displayName || payload.from || '未知步骤';
        addLog('进入步骤', `开始执行: ${stepName}`, 'warning', 'processing');
        break;

      case 'workflow-result':
        streamStatus.value = 'done';
        isProcessing.value = false;
        isRenderLoopRunning = false; // 停止流渲染
        if (payload.result && payload.result.data) {
          try {
            // 将结果赋值给可编辑对象
            editableData.value = JSON.parse(JSON.stringify(payload.result.data));
            isFinished.value = true; // 切换 UI 到编辑模式
            addLog('数据解析', '已转换为可视化编辑模式', 'success', 'done');
            scrollToBottom(); // 滚动到底部
          } catch (e) {
            console.error('解析最终结果失败', e);
            addLog('错误', '最终结果格式异常', 'danger');
          }
        }
        break;

      // Agent 思考链
      case 'start':
        streamStatus.value = 'thinking';
        addLog('构建模型...', '思考中');
        scrollToBottom(); // 滚动到底部
        break;

      // 3. 推理/生成过程 (核心内容)
      // 匹配 lessonplan-resoning, ppt-resoning, feedback-resoning 等
      default:
        // 工作流
        if (payload.type && payload.type.endsWith('-resoning')) {
          const content = payload.output?.content;
          if (!content) return;

          // --- 情况 A: 正在生成文本 (text-delta) ---
          if (content.type === 'text-delta' && content.text) {
            streamStatus.value = 'receiving';
            // 将增量文本追加到缓冲池，等待 requestAnimationFrame 渲染
            textBuffer.value += content.text;
          }

          // --- 情况 B: 工具调用 (tool-call) ---
          else if (content.type === 'tool-call') {
            const toolName = content.toolName || '未知工具';
            const inputPath = content.input?.path
              ? `读取文件: ...${content.input.path.slice(-20)}`
              : '';
            addLog('调用工具', `正在使用 ${toolName} ${inputPath}`, 'info', 'processing');
          }

          // --- 情况 C: 工作流调用结束 (workflow-result) ---
          else if (content.type === 'workflow-result') {
            // 可以选择更新日志状态，或者忽略
            // updateLastLogStatus('done');
          }
        }

        // 4. 流程结束
        else if (payload.type === 'workflow-complete' || payload.type === 'finish') {
          streamStatus.value = 'done';
          isProcessing.value = false;

          // 停止渲染循环，处理剩余 buffer
          isRenderLoopRunning = false;
          if (textBuffer) {
            rawMarkdown.value += textBuffer.value;
            textBuffer.value = '';
          }
          formatFinalResult();

          addLog('分析完成', '所有内容已生成', 'success', 'done');
        }
        // Agent 调用
        else if (payload.type === 'text-delta') {
          const content = payload?.text;
          if (!content) return;
          streamStatus.value = 'receiving';
          // 将增量文本追加到缓冲池，等待 requestAnimationFrame 渲染
          textBuffer.value += content;
        }
        break;
    }
  };

  const processSSEChunk = (chunk: string) => {
    // 简单的 SSE 解析器 (实际生产中建议使用 @microsoft/fetch-event-source 库处理粘包问题)
    const lines = chunk.split('\n');

    let currentEvent = '';

    lines.forEach(line => {
      // 忽略空行和非 data 开头的行
      if (!line.trim().startsWith('data:')) return;

      // 2. 提取 JSON 字符串
      const jsonStr = line.replace('data:', '').trim();
      if (!jsonStr || jsonStr === '[DONE]') return;

      try {
        const payload = JSON.parse(jsonStr);
        handleSSEEvent(payload);
      } catch (e) {
        console.warn('JSON Parse Error:', e);
      }
    });
  };

  // --- 性能优化：动态窗口渲染循环 (Throttled Rendering) ---
  // 该函数使用 requestAnimationFrame 使得浏览器在空闲时更新 DOM，
  // 避免高频数据流导致 UI 冻结。
  const startRenderLoop = () => {
    isRenderLoopRunning = true;

    const loop = () => {
      if (!isRenderLoopRunning) return;

      if (textBuffer.value.length > 0) {
        // 1. 将 buffer 中的文本转移到 rawMarkdown
        rawMarkdown.value += textBuffer.value;
        textBuffer.value = ''; // 清空 buffer

        // 2. 解析 Markdown 为 HTML
        // 优化点：如果是追加模式，其实不用每次全量解析，但 markdown-it 通常很快。
        // 如果特别长，可以考虑只解析新增段落，但处理 markdown 上下文（如代码块）会很复杂。
        renderedMarkdown.value = md.render(rawMarkdown.value);

        // 3. 自动滚动到底部
        scrollToBottom();
      }

      // 继续下一帧
      renderTimer = requestAnimationFrame(loop);
    };

    renderTimer = requestAnimationFrame(loop);
  };

  // --- 日志辅助函数 ---
  const addLog = (title: string, detail: string, type: any = 'primary', status: any = 'done') => {
    logs.value.push({
      time: new Date().toLocaleTimeString(),
      title,
      detail,
      type,
      status
    });
    // 滚动日志
    nextTick(() => {
      if (logScrollbarRef.value) {
        const wrap = logScrollbarRef.value.wrapRef;
        if (wrap) wrap.scrollTop = wrap.scrollHeight;
      }
    });
  };

  // --- JSON 美化函数 ---
  const formatFinalResult = () => {
    try {
      // 尝试解析累积的原始文本
      // 只有当它是纯 JSON 字符串时才美化
      const jsonObj = JSON.parse(rawMarkdown.value);

      // 如果解析成功，说明是 JSON 格式
      const prettyJson = JSON.stringify(jsonObj, null, 2);

      // 重新构建 Markdown，包裹在代码块中以利用样式
      const newMarkdown = `**分析报告生成完毕，元数据如下：**\n\n\`\`\`json\n${prettyJson}\n\`\`\``;

      // 更新渲染结果
      renderedMarkdown.value = md.render(newMarkdown);

      // 再次滚动到底部确保用户看到
      scrollToBottom();
    } catch (e) {
      // 如果解析失败，说明是大模型生成的普通自然语言文本，不需要做任何处理
      console.log('Output is likely natural language, skipping JSON formatting.');
    }
  };

  const updateLastLogStatus = (status: 'processing' | 'done') => {
    if (logs.value.length > 0) {
      logs.value[logs.value.length - 1].status = status;
    }
  };

  return {
    startSSEConnection,
    startRenderLoop,
    addLog
  }
}

