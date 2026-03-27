<template>
  <div class="pdf-container">
    <div ref="pdfViewer" class="pdf-frame"></div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, defineExpose, onMounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry.js';
import request from '../../../utils/request';

// 确保路径正确
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const props = defineProps({
  fileUrl: {
    type: String,
    required: true
  }
});

const pdfViewer = ref(null);
let currentRenderTasks = [];
let loadingTask = null;

const cancelCurrentTasks = () => {
  currentRenderTasks.forEach(task => task.cancel());
  currentRenderTasks = [];
  if (loadingTask) {
    loadingTask.destroy();
    loadingTask = null;
  }
};

const emit = defineEmits(['handleLoading']);
const renderPDF = async url => {
  try {
    if (!url) return;
    console.log('Starting to render PDF from URL:', url);
    cancelCurrentTasks();
    const pdfData = await request.course({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    const normalizedPdfData = pdfData instanceof ArrayBuffer ? new Uint8Array(pdfData) : pdfData;
    loadingTask = pdfjsLib.getDocument({ data: normalizedPdfData });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded:', pdf);

    // 清空 pdfViewer 容器
    pdfViewer.value.innerHTML = '';

    // 遍历所有页
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      console.log(`Page ${pageNum} loaded:`, page);

      // 使用默认的 scale 参数
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      // 创建新的 canvas 元素
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // 设置 canvas 的宽度和高度
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';

      console.log(`Canvas width set to: ${canvas.width}, Canvas height set to: ${canvas.height}`);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      // 渲染当前页
      const renderTask = page.render(renderContext);
      currentRenderTasks.push(renderTask);
      await renderTask.promise;
      console.log(`Page ${pageNum} rendered`);

      // 将 canvas 添加到 pdfViewer 容器中
      pdfViewer.value.appendChild(canvas);
      emit('handleLoading');
    }
  } catch (error) {
    if (error.name === 'RenderingCancelledException') {
      console.log('Rendering cancelled');
    } else {
      console.error('Error rendering PDF:', error);
    }
  }
};

watch(
  () => props.fileUrl,
  newUrl => {
    console.log('New file URL:', newUrl);
    if (pdfViewer.value) {
      renderPDF(newUrl);
    }
  }
);

onMounted(() => {
  cancelCurrentTasks();
  if (props.fileUrl) {
    console.log('Mounted file URL:', props.fileUrl);
    renderPDF(props.fileUrl);
  }
});

onBeforeUnmount(() => {
  cancelCurrentTasks();
});

// 公开取消任务的方法，以便父组件调用
defineExpose({ cancelCurrentTasks });
</script>

<style scoped>
.pdf-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.pdf-frame {
  width: 100%;
  height: auto;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
