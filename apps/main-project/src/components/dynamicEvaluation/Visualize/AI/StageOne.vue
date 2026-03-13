<template>
  <div class="ai-workflow-container">
    <!-- ================= 阶段一：数据输入 ================= -->
    <transition name="el-fade-in-linear">
      <div v-if="!hasResult" class="input-panel">
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="title">📚 智能教学分析助手</span>
                <el-tag effect="dark" round>VoltAgent Powered</el-tag>
              </div>
              <el-button link type="primary">查看历史记录</el-button>
            </div>
          </template>

          <el-form label-position="top" size="large">
            <!-- 1. 教学教案 -->
            <el-form-item>
              <template #label>
                <span class="custom-label"
                  ><el-icon><Document /></el-icon> 教学教案 (Word/PDF)</span
                >
              </template>

              <!-- 修复后的区域结构 -->
              <div class="file-action-area">
                <!-- 左侧：按钮区 -->
                <div class="buttons-row">
                  <!-- 本地上传 -->
                  <!-- <el-upload
                    v-model:file-list="fileList.plan"
                    class="inline-upload"
                    :auto-upload="false"
                    :limit="1"
                    accept=".doc,.docx,.pdf"
                    :show-file-list="false"
                    :on-change="(file:File)  => handleLocalUpload(file, 'plan')"
                  >
                    <el-button type="primary" plain :icon="Upload">本地上传</el-button>
                  </el-upload> -->

                  <!-- 资源库选择 -->
                  <el-button type="primary" plain :icon="Files" @click="openResourceDialog('plan')">
                    从资源库选择
                  </el-button>
                </div>

                <!-- 右侧：选中文件展示 (当有文件时显示) -->
                <transition name="el-fade-in">
                  <div class="selected-file-tag" v-if="fileList.plan.length > 0">
                    <el-tag
                      closable
                      @close="fileList.plan = []"
                      type="success"
                      effect="light"
                      size="large"
                    >
                      <el-icon class="file-icon-gap"><Document /></el-icon>
                      {{ fileList.plan[0].name }}
                    </el-tag>
                  </div>
                </transition>
              </div>
            </el-form-item>

            <!-- 2. 课堂 PPT (结构同上，仅变量不同) -->
            <el-form-item>
              <template #label>
                <span class="custom-label"
                  ><el-icon><Platform /></el-icon> 课堂 PPT (PPTX)</span
                >
              </template>
              <div class="file-action-area">
                <div class="buttons-row">
                  <!-- <el-upload
                    v-model:file-list="fileList.ppt"
                    class="inline-upload"
                    :auto-upload="false"
                    :limit="1"
                    accept=".ppt,.pptx"
                    :show-file-list="false"
                    :on-change="(file:File) => handleLocalUpload(file, 'ppt')"
                  >
                    <el-button type="primary" plain :icon="Upload">本地上传</el-button>
                  </el-upload> -->
                  <el-button type="primary" plain :icon="Files" @click="openResourceDialog('ppt')">
                    从资源库选择
                  </el-button>
                </div>
                <transition name="el-fade-in">
                  <div class="selected-file-tag" v-if="fileList.ppt.length > 0">
                    <el-tag
                      closable
                      @close="fileList.ppt = []"
                      type="warning"
                      effect="light"
                      size="large"
                    >
                      <el-icon class="file-icon-gap"><Platform /></el-icon>
                      {{ fileList.ppt[0].name }}
                    </el-tag>
                  </div>
                </transition>
              </div>
            </el-form-item>

            <!-- 3. 学生反馈 (结构同上，仅变量不同) -->
            <el-form-item>
              <template #label>
                <span class="custom-label"
                  ><el-icon><ChatLineSquare /></el-icon> 学生反馈/课堂记录 (Docx)</span
                >
              </template>
              <div class="file-action-area">
                <div class="buttons-row">
                  <!-- <el-upload
                    v-model:file-list="fileList.feedback"
                    class="inline-upload"
                    :auto-upload="false"
                    :limit="1"
                    accept=".docx"
                    :show-file-list="false"
                    :on-change="(file:File)  => handleLocalUpload(file, 'feedback')"
                  >
                    <el-button type="primary" plain :icon="Upload">本地上传</el-button>
                  </el-upload> -->
                  <el-button
                    type="primary"
                    plain
                    :icon="Files"
                    @click="openResourceDialog('feedback')"
                  >
                    从资源库选择
                  </el-button>
                </div>
                <transition name="el-fade-in">
                  <div class="selected-file-tag" v-if="fileList.feedback.length > 0">
                    <el-tag
                      closable
                      @close="fileList.feedback = []"
                      type="info"
                      effect="light"
                      size="large"
                    >
                      <el-icon class="file-icon-gap"><Document /></el-icon>
                      {{ fileList.feedback[0].name }}
                    </el-tag>
                  </div>
                </transition>
              </div>
            </el-form-item>

            <!-- 提交按钮 -->
            <div class="form-footer">
              <el-button
                type="primary"
                size="large"
                :loading="isProcessing"
                @click="startGeneration"
                round
                class="submit-btn"
              >
                {{ isProcessing ? 'AI 正在分析中...' : '开始生成分析报告' }}
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- ================= 阶段二：结果与思考 (SSE 流式渲染) ================= -->
    <!-- 使用 v-show 或 v-if 切换，建议 v-if 以便销毁 input DOM -->
    <transition name="el-zoom-in-bottom">
      <div v-if="hasResult" class="result-panel">
        <el-row :gutter="20" style="height: 100%">
          <!-- 左侧：思考链路 (Logs) -->
          <el-col :span="8" class="process-col">
            <el-card class="box-card process-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>🧠 思考链路 (CoT)</span>
                  <div class="header-right">
                    <span v-if="streamStatus === 'thinking'" class="status-text blink"
                      >思考中...</span
                    >
                    <el-icon v-if="streamStatus === 'done'" color="#67C23A"
                      ><CircleCheckFilled
                    /></el-icon>
                    <el-icon v-else class="is-loading"><Loading /></el-icon>
                  </div>
                </div>
              </template>

              <!-- 使用 ref 获取 DOM 以便自动滚动 -->
              <el-scrollbar ref="logScrollbarRef">
                <el-timeline>
                  <el-timeline-item
                    v-for="(log, index) in logs"
                    :key="index"
                    :type="log.type"
                    :color="log.color"
                    :timestamp="log.time"
                    :hollow="log.status === 'processing'"
                  >
                    <el-card shadow="hover" :body-style="{ padding: '10px' }" class="log-item-card">
                      <h4>{{ log.title }}</h4>
                      <p v-if="log.detail" class="log-detail">{{ log.detail }}</p>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </el-scrollbar>
            </el-card>
          </el-col>

          <!-- 右侧：生成结果 (Markdown Stream) -->
          <el-col :span="16" class="result-col">
            <el-card class="box-card result-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>✨ 生成结果</span>
                  <div class="header-actions">
                    <el-tag
                      v-if="streamStatus === 'receiving'"
                      type="warning"
                      size="small"
                      effect="plain"
                      class="typing-tag"
                    >
                      正在输入...
                    </el-tag>
                    <el-button v-if="streamStatus === 'done'" size="small" @click="reset"
                      >重新生成</el-button
                    >
                  </div>
                </div>
              </template>

              <el-scrollbar ref="resultScrollbarRef">
                <div class="report-content">
                  <div v-if="!isFinished">
                    <div class="markdown-body" v-html="renderedMarkdown"></div>
                    <div v-if="streamStatus !== 'done'" class="cursor-blinker"></div>
                    <div v-if="showModelingReopenBtn" class="action-footer">
                      <span class="tips-text">已自动提取建模数据，您可以：</span>
                      <el-button type="primary" plain @click="handleReopenModeling">
                        <el-icon class="mr-1"><EditPen /></el-icon>
                        编辑/确认建模数据
                      </el-button>
                    </div>
                  </div>
                  <div v-else class="editor-container">
                    <el-alert
                      title="AI 分析已完成，请复核以下内容。您可以点击标签删除，或点击 + 号新增。"
                      type="info"
                      show-icon
                      :closable="false"
                      class="mb-4"
                    />

                    <el-collapse v-model="activeNames">
                      <el-collapse-item
                        v-for="(item, index) in editableData"
                        :key="index"
                        :name="index.toString()"
                      >
                        <template #title>
                          <div class="font-bold text-gray-700">
                            📄 分析来源 {{ index + 1 }}
                            <!-- 这里可以根据实际情况映射名称，比如 '教学大纲' / 'PPT' -->
                          </div>
                        </template>

                        <div class="edit-section">
                          <!-- 1. 知识单元 (KU) -->
                          <div class="field-row">
                            <div class="field-label text-blue-600">知识单元 (KU)</div>
                            <div class="tag-area">
                              <el-tag
                                v-for="(tag, tIndex) in item.KU"
                                :key="tIndex"
                                closable
                                disable-transitions
                                @close="handleCloseTag(index, 'KU', tIndex)"
                              >
                                {{ tag }}
                              </el-tag>
                              <!-- 动态输入框 -->
                              <el-input
                                v-if="tagInputState[`${index}_KU`]?.visible"
                                :id="`saveTagInput-${index}_KU`"
                                v-model="tagInputState[`${index}_KU`].value"
                                class="new-tag-input"
                                size="small"
                                @keyup.enter="handleInputConfirm(index, 'KU')"
                                @blur="handleInputConfirm(index, 'KU')"
                              />
                              <el-button
                                v-else
                                class="button-new-tag"
                                size="small"
                                @click="showInput(index, 'KU')"
                              >
                                + New
                              </el-button>
                            </div>
                          </div>

                          <!-- 2. 关键字 (KW) -->
                          <div class="field-row">
                            <div class="field-label text-orange-600">关键字 (KW)</div>
                            <div class="tag-area">
                              <el-tag
                                v-for="(tag, tIndex) in item.KW"
                                :key="tIndex"
                                type="warning"
                                closable
                                disable-transitions
                                @close="handleCloseTag(index, 'KW', tIndex)"
                              >
                                {{ tag }}
                              </el-tag>
                              <el-input
                                v-if="tagInputState[`${index}_KW`]?.visible"
                                :id="`saveTagInput-${index}_KW`"
                                v-model="tagInputState[`${index}_KW`].value"
                                class="new-tag-input"
                                size="small"
                                @keyup.enter="handleInputConfirm(index, 'KW')"
                                @blur="handleInputConfirm(index, 'KW')"
                              />
                              <el-button
                                v-else
                                class="button-new-tag"
                                size="small"
                                @click="showInput(index, 'KW')"
                              >
                                + New
                              </el-button>
                            </div>
                          </div>

                          <!-- 3. 能力 (A) -->
                          <div class="field-row">
                            <div class="field-label text-green-600">能力 (A)</div>
                            <div class="tag-area">
                              <el-tag
                                v-for="(tag, tIndex) in item.A"
                                :key="tIndex"
                                type="success"
                                closable
                                disable-transitions
                                @close="handleCloseTag(index, 'A', tIndex)"
                              >
                                {{ tag }}
                              </el-tag>
                              <el-input
                                v-if="tagInputState[`${index}_A`]?.visible"
                                :id="`saveTagInput-${index}_A`"
                                v-model="tagInputState[`${index}_A`].value"
                                class="new-tag-input"
                                size="small"
                                @keyup.enter="handleInputConfirm(index, 'A')"
                                @blur="handleInputConfirm(index, 'A')"
                              />
                              <el-button
                                v-else
                                class="button-new-tag"
                                size="small"
                                @click="showInput(index, 'A')"
                              >
                                + New
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                    <div class="action-footer">
                      <el-button type="primary" size="large" @click="handleImmediateImport">
                        <el-icon class="mr-1"><UploadFilled /></el-icon>
                        立即入库
                      </el-button>

                      <el-button type="success" size="large" @click="handleGenerateModeling">
                        <el-icon class="mr-1"><DataLine /></el-icon>
                        生成课程建模
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>

    <!-- ================= 资源选择弹窗 ================= -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <div class="resource-toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件名..."
          prefix-icon="Search"
          style="width: 300px"
          @input="handleSearch"
        />
      </div>

      <el-table
        v-loading="loadingResources"
        :data="resourceList"
        style="width: 100%; margin-top: 20px"
        height="300"
        @current-change="handleResourceSelect"
        highlight-current-row
      >
        <el-table-column width="50">
          <template #default="{ row }">
            <el-icon v-if="selectedResource?.id === row.id" color="#409EFF"><Check /></el-icon>
          </template>
        </el-table-column>
        <el-table-column property="filename" label="文件名" />
        <el-table-column property="createtime" label="上传时间" width="180" />
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmResourceSelection" :disabled="!selectedResource">
            确认选择
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- ================= 新增：课程建模编辑弹窗 ================= -->
    <el-dialog
      v-model="modelingDialogVisible"
      title="🛠️ 课程评价建模确认"
      width="800px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-alert
        title="以下是AI根据分析结果生成的评价建模，请核对并修改每一个知识单元(KU)下的评价维度。"
        type="success"
        :closable="false"
        class="mb-4"
      />

      <div class="modeling-editor-content">
        <el-collapse accordion>
          <el-collapse-item v-for="(item, index) in modelingData" :key="index" :name="index">
            <template #title>
              <div class="modeling-item-header">
                <el-tag size="small" effect="dark" class="mr-2">KU {{ index + 1 }}</el-tag>
                <span class="ku-title">{{ item.KU }}</span>
              </div>
            </template>

            <div class="dimension-table-wrapper">
              <el-table :data="item.EvaluationDimensions" style="width: 100%" border size="small">
                <el-table-column label="关联关键字 (KW)" width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.KW" placeholder="关键字" />
                  </template>
                </el-table-column>

                <el-table-column label="对应能力 (A)" width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.A" placeholder="能力项" />
                  </template>
                </el-table-column>

                <el-table-column label="组合逻辑/描述 (Combination)">
                  <template #default="{ row }">
                    <el-input v-model="row.combination" placeholder="描述评价逻辑..." />
                  </template>
                </el-table-column>

                <el-table-column label="操作" width="60" align="center">
                  <template #default="{ $index }">
                    <el-button
                      type="danger"
                      link
                      icon="Delete"
                      @click="removeDimension(index, $index)"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <div class="table-footer">
                <el-button type="primary" link icon="Plus" @click="addDimension(index)">
                  添加评价维度
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="modelingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmModelingImport"> 确认并入库 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import {
  Upload,
  Files,
  Document,
  Platform,
  ChatLineSquare,
  Loading,
  CircleCheckFilled,
  Check,
  Search,
  UploadFilled
} from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import type { ElScrollbar, UploadFile, UploadUserFile } from 'element-plus';
import useAI, { fileParams, fileType } from '../../../../stores/ai';
import { storeToRefs } from 'pinia';
import request from '../../../../utils/request.js';
import { UniExport } from '@/api/type';
import MarkdownIt from 'markdown-it';
import { LogItem, sseGeneration } from './utils';
import { EditPen } from '@element-plus/icons-vue';
// --- 类型定义 ---
type FileType = 'plan' | 'ppt' | 'feedback';

// 扩展 UploadUserFile 以支持云端文件 ID
interface ExtendedUploadFile extends UploadUserFile {
  filename: string;
  bucketName: string;
}

interface classRoomData {
  assistantName: string;
  classroomId: string;
  classroomName: string;
  courseName: string;
  professionName: string;
  score: number;
  teacherName: string;
  termName: string;
  time: number;
}

interface EvaluationDimension {
  KW: string; // 关键词
  A: string; // 能力
  combination: string; // 组合说明/权重等
}

interface ModelingItem {
  KU: string; // 知识单元
  EvaluationDimensions: EvaluationDimension[];
}

// --- 状态定义 ---
const modelingDialogVisible = ref(false); // 控制建模编辑弹窗
const modelingData = ref<ModelingItem[]>([]); // 存储建模数据
// 用于控制建模弹窗中每行的编辑状态
// key: `itemIndex-dimIndex`, value: 是否处于编辑模式
const dimensionEditState = reactive<Record<string, boolean>>({});

const aiStore = useAI();
const { fetchAllFile, fetchFilePath, fetchRunWorkflow } = aiStore;
const { allFiles, files } = storeToRefs(aiStore);
const classRoomData = ref<classRoomData>();
const streamStatus = ref<'idle' | 'thinking' | 'receiving' | 'done'>('idle');

// --- 滚动到底部函数 (封装) ---
const scrollToBottom = () => {
  nextTick(() => {
    if (resultScrollbarRef.value) {
      // 2. 获取滚动容器的实际高度信息
      const wrap = resultScrollbarRef.value.wrapRef;

      // 3. 核心修复：
      // 如果 wrap 存在，直接设置 scrollTop 为一个巨大的值，
      // 浏览器会自动修正为最大滚动距离，这比手动计算 scrollHeight 更可靠
      if (wrap) {
        resultScrollbarRef.value.setScrollTop(999999);
      }
    }
  });
};

onMounted(async () => {
  try {
    const res = (await request.evaluation.get(
      '/evaluation/attainment/getClassroomByCourseId'
    )) as UniExport;
    if (res.code === 200) {
      console.log(res.data);
      classRoomData.value = res.data[0];
    } else {
      ElMessage.error(res.msg);
    }
    await fetchAllFile();
    console.log(allFiles.value);
  } catch (error) {
    ElMessage.error('获取课堂列表失败' + error);
  }
});

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  if (renderTimer) cancelAnimationFrame(renderTimer);
});

// --- 初始化 ---
const md = new MarkdownIt({ html: true, linkify: true, breaks: true });
// 结果与日志
const logs = ref<LogItem[]>([]);
const rawMarkdown = ref(''); // 累积的原始 Markdown 文本
const renderedMarkdown = ref(''); // 渲染后的 HTML
const resultScrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const logScrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
// --- 性能优化：渲染缓冲 ---
// 用于存储 SSE 收到的文本片段，不直接去操作 DOM
let textBuffer = ref('');
let renderTimer: number | null = null;
let isRenderLoopRunning = false;

// --- 状态定义 ---
const isProcessing = ref(false);
const hasResult = ref(false);
const fileList = reactive<{
  plan: ExtendedUploadFile[];
  ppt: ExtendedUploadFile[];
  feedback: ExtendedUploadFile[];
}>({
  plan: [],
  ppt: [],
  feedback: []
});

// --- 资源弹窗逻辑 ---
const dialogVisible = ref(false);
const loadingResources = ref(false);
const currentDialogType = ref<FileType>('plan');
const searchKeyword = ref('');
const resourceList = ref<fileType[]>([]);
const selectedResource = ref<fileType | null>(null);

// --- 新增状态定义 ---
const isFinished = ref(false); // 标记流程是否彻底完成
const editableData = ref<any[]>([]); // 存储解析后的最终 JSON，用于编辑
const activeNames = ref(['0', '1', '2']); // 折叠面板默认展开
// 用于控制动态添加标签的输入框状态
// 结构: { [rowIndex_field]: { visible: boolean, value: string } }
const tagInputState = reactive<Record<string, { visible: boolean; value: string }>>({});

// --- 标签删除逻辑 ---
const handleCloseTag = (rowIndex: number, field: string, tagIndex: number) => {
  editableData.value[rowIndex][field].splice(tagIndex, 1);
};

const { startSSEConnection, startRenderLoop, addLog } = sseGeneration({
  streamStatus,
  isProcessing,
  editableData,
  isFinished,
  textBuffer,
  scrollToBottom,
  rawMarkdown,
  renderedMarkdown,
  logs,
  logScrollbarRef
});

// --- 标签新增逻辑：显示输入框 ---
const showInput = (rowIndex: number, field: string) => {
  const key = `${rowIndex}_${field}`;
  if (!tagInputState[key]) {
    tagInputState[key] = { visible: true, value: '' };
  } else {
    tagInputState[key].visible = true;
  }
  // 自动聚焦
  nextTick(() => {
    const inputId = `saveTagInput-${key}`;
    const inputElement = document.getElementById(inputId);
    if (inputElement) inputElement.focus();
  });
};

// --- 标签新增逻辑：确认添加 ---
const handleInputConfirm = (rowIndex: number, field: string) => {
  const key = `${rowIndex}_${field}`;
  const state = tagInputState[key];
  if (state && state.value) {
    if (!editableData.value[rowIndex][field]) {
      editableData.value[rowIndex][field] = [];
    }
    editableData.value[rowIndex][field].push(state.value);
  }
  if (state) {
    state.visible = false;
    state.value = '';
  }
};

const dialogTitle = computed(() => {
  const map = { plan: '选择教学教案', ppt: '选择课堂 PPT', feedback: '选择学生反馈记录' };
  return map[currentDialogType.value];
});

// 1. 打开弹窗，后端获取数据
const openResourceDialog = async (type: FileType) => {
  currentDialogType.value = type;
  dialogVisible.value = true;
  selectedResource.value = null;
  searchKeyword.value = '';

  loadingResources.value = true;
  // 模拟 API 请求耗时
  setTimeout(() => {
    resourceList.value = ApiGetResources(type);
    loadingResources.value = false;
  }, 600);
};

// 3. 弹窗中选中某一行
const handleResourceSelect = (val: fileType | undefined) => {
  selectedResource.value = val || null;
};

// 4. 确认选择云端文件
const confirmResourceSelection = () => {
  if (!selectedResource.value) return;
  console.log(`${selectedResource.value.objectName}${selectedResource.value.id}`);

  // 将云端文件转换为 Element Upload 能显示的格式
  const cloudFileWrapper: ExtendedUploadFile = {
    name: selectedResource.value.filename,
    filename: `${selectedResource.value.objectName}${selectedResource.value.id}`,
    bucketName: selectedResource.value.bucketName
  };

  fileList[currentDialogType.value] = [cloudFileWrapper];
  dialogVisible.value = false;
};

// ---  API 数据 ---
const ApiGetResources = (type: FileType): fileType[] => {
  // 简单过滤一下模拟真实感
  if (type === 'ppt')
    return allFiles.value.filter(f => f.filename.includes('PPT') || f.filename.includes('pptx'));
  return allFiles.value.filter(f => f.filename.includes('doc') && f.filename.includes('docx'));
};

// --- 核心逻辑：开始生成 (SSE 流式) ---
const startGeneration = async () => {
  // 1. 校验
  if (fileList.plan.length === 0 && fileList.ppt.length === 0 && fileList.feedback.length === 0) {
    ElMessage.warning('请至少选择一份文件');
    return;
  }

  isProcessing.value = true;

  try {
    // 2. 准备文件路径 (保持原有逻辑)
    const params = {
      lessonPlan: {
        fileName: fileList.plan[0]?.filename,
        bucketName: fileList.plan[0]?.bucketName
      },
      studentFeedback: {
        fileName: fileList.feedback[0]?.filename,
        bucketName: fileList.feedback[0]?.bucketName
      },
      ppt: { fileName: fileList.ppt[0]?.filename, bucketName: fileList.ppt[0]?.bucketName }
    } as fileParams;

    // 获取文件路径（假设这是同步或短时异步）
    await fetchFilePath(params, 'data-extract', true);

    // 3. 切换界面状态
    hasResult.value = true;
    streamStatus.value = 'thinking';
    logs.value = []; // 清空日志
    rawMarkdown.value = '';
    renderedMarkdown.value = '';
    textBuffer.value = '';

    // 添加初始日志
    addLog('工作流启动', '已连接至推理引擎，正在加载上下文...', 'primary', 'processing');

    //开启渲染循环 (RequestAnimationFrame)
    const url = import.meta.env.VITE_API_VOLTAGENT + `/workflows/data-extract/stream`;
    //   // 构建请求体
    const requestBody = {
      input: {
        courseName: classRoomData.value?.courseName,
        teachingMaterials: {
          lessonPlanPath: files.value?.lessonPlan.url,
          pptPath: files.value?.ppt.url,
          studentFeedbackPath: files.value?.studentFeedback.url
        }
      }
    };

    startRenderLoop();

    // 5. 发起 SSE 请求
    await startSSEConnection(url, requestBody);
  } catch (e) {
    ElMessage.error('启动失败: ' + e);
    isProcessing.value = false;
  }
};

const reset = () => {
  hasResult.value = false;
  isProcessing.value = false;
  fileList.plan = [];
  fileList.ppt = [];
  fileList.feedback = [];
};
const handleSearch = () => {
  // 前端简单模拟搜索
  loadingResources.value = true;
  setTimeout(() => {
    const all = ApiGetResources(currentDialogType.value);
    resourceList.value = all.filter(i => i.filename.includes(searchKeyword.value));
    loadingResources.value = false;
  }, 300);
};

// 立即入库
const handleImmediateImport = () => {};
// 生成建模
const handleGenerateModeling = async () => {
  // 3. === 核心：重置 UI 状态以回到 Markdown 渲染模式 ===
  isFinished.value = false; // 隐藏编辑器，显示 Markdown 区域
  rawMarkdown.value = ''; // 清空旧内容
  renderedMarkdown.value = ''; // 清空渲染结果
  textBuffer.value = ''; // 清空缓冲
  streamStatus.value = 'thinking'; // 重置为思考状态
  isProcessing.value = true; // 显示加载中

  // 4. 添加一条系统日志
  addLog('系统', '开始生成课程建模报告...', 'primary', 'processing');

  // 5. 开启渲染循环
  try {
    startRenderLoop();
    // 建立新的 sse 连接
    const url =
      import.meta.env.VITE_API_VOLTAGENT + `/agents/generate-course-evaluate-model/stream`;
    const requestBody = {
      input: JSON.stringify(editableData.value)
    };

    await startSSEConnection(url, requestBody);
    console.log(textBuffer.value);
    // 正则提取 ```json ... ```
    let finalJson: ModelingItem[] | null = null;
    const jsonMatch = rawMarkdown.value.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        finalJson = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error('JSON解析失败', e);
      }
    }
    // 如果成功提取到建模数据，弹出编辑框
    if (finalJson) {
      modelingData.value = finalJson;
      modelingDialogVisible.value = true; // 打开弹窗
      ElMessage.success('建模数据已提取，请进行确认与调整');
    } else {
      ElMessage.warning('未能自动提取到结构化建模数据，请检查生成内容');
    }
  } catch (error) {
    console.log(error);
  }
};

const removeDimension = (itemIndex: number, dimIndex: number) => {
  modelingData.value[itemIndex].EvaluationDimensions.splice(dimIndex, 1);
};

// 新增维度
const addDimension = (itemIndex: number) => {
  modelingData.value[itemIndex].EvaluationDimensions.push({
    KW: '',
    A: '',
    combination: ''
  });
  // 自动激活新行的编辑状态（可选，如果使用表格内联编辑）
};

// 确认并入库
const confirmModelingImport = () => {
  console.log('最终确认的建模数据:', modelingData.value);

  // 模拟入库
  const loading = ElLoading.service({ text: '正在入库建模数据...' });
  setTimeout(() => {
    loading.close();
    modelingDialogVisible.value = false;
    ElMessage.success('课程建模已成功入库！');
    // 这里可以重置状态或跳转
  }, 1000);
};

// --- 新增计算属性 ---
// 是否显示“重新打开建模”按钮
const showModelingReopenBtn = computed(() => {
  return (
    streamStatus.value === 'done' && // 必须已生成完毕
    modelingData.value.length > 0 // 必须成功提取到了数据
  );
});

// --- 新增方法 ---
const handleReopenModeling = () => {
  modelingDialogVisible.value = true;
};
</script>

<style scoped>
/* 1. 最外层容器：必须 100% 高度以继承 Tab 的 800px */
.ai-workflow-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 10px;
  box-sizing: border-box;
}

/* 2. 输入面板：自然高度，不需要特殊处理 */
.input-panel {
  width: 100%;
  max-width: 800px;
  margin: 40px auto;
  /* 输入阶段不需要滚动限制，或者你可以给它加 overflow-y: auto */
}

/* 3. 结果面板 (关键) */
/* 当 v-if="hasResult" 显示时，它必须占满剩余空间 */
.result-panel {
  flex: 1; /* 自动占据剩余高度 */
  height: 0; /* 【核心】强制限制高度，触发布局计算 */
  width: 100%;
  min-height: 0; /* 防止 flex 子项溢出 */
  display: flex;
  flex-direction: column;
}

/* 4. 让 Element 的 Row 和 Col 传递高度 */
.el-row {
  height: 100%;
}
.el-col {
  height: 100%;
}

/* 5. 卡片样式改造 */
.process-card,
.result-card {
  height: 100%; /* 撑满 Col */
  display: flex;
  flex-direction: column; /* 垂直布局：Header + Body */
  border: none;
}

/* 6. 深度修改 Card Body (最关键的一步) */
:deep(.el-card__body) {
  flex: 1; /* 占据 Header 之外的所有空间 */
  height: 0; /* 【核心】限制高度 */
  padding: 0; /* 移除 padding，让 scrollbar 贴边 */
  overflow: hidden; /* 隐藏原生滚动条，必须加！ */
  position: relative;
}

/* 7. 强制 Scrollbar 撑满 Card Body */
:deep(.el-scrollbar) {
  height: 100%;
  width: 100%;
}

/* 8. 滚动视图内部的 Padding */
:deep(.el-scrollbar__view) {
  padding: 20px; /* 在这里加 padding 代替 card-body 的 padding */
}

.result-panel :deep(.el-card__body) {
  flex: 1;
  height: 0; /* 强制高度为0，配合flex:1实现自适应 */
  padding: 0;
  overflow: hidden; /* 隐藏原生滚动条 */
  position: relative;
}

/* 2. 【新增】给内部日志卡片“松绑” */
/* 使用更具体的选择器覆盖上面的样式 */
.log-item-card :deep(.el-card__body) {
  height: auto !important; /* 恢复自然高度，由文字撑开 */
  flex: none !important; /* 禁止 Flex 压缩或拉伸 */
  padding: 12px 16px !important; /* 恢复内边距，让文字不贴边 */
  overflow: visible !important; /* 允许内容展示 */
}

/* 3. 优化时间轴的显示，防止太挤 */
:deep(.el-timeline-item__content) {
  margin-top: -6px; /* 微调对齐圆点 */
}

/* 阶段一的表单卡片样式 (显式声明，确保万无一失) */
.form-card :deep(.el-card__body) {
  height: auto; /* 阶段一需要根据内容撑开 */
  overflow: visible;
  padding: 20px; /* 恢复默认 padding */
  flex: none;
}

/* --- 其他样式保持不变 --- */
.report-content {
  position: relative;
}
.log-item-card {
  border: 1px solid #ebeef5;
}

/* 头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.custom-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
}

.selected-file-display {
  margin-left: 10px;
}

.form-footer {
  margin-top: 40px;
  text-align: center;
}
.submit-btn {
  width: 220px;
  font-weight: bold;
  height: 50px;
  font-size: 16px;
}

/* 弹窗样式 */
.resource-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.log-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
.markdown-body {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  padding: 10px;
  text-align: left;
}

/* 修复后的文件操作区域布局 */
.file-action-area {
  display: flex;
  align-items: center; /* 垂直居中 */
  flex-wrap: wrap; /* 小屏幕下自动换行 */
  gap: 15px; /* 按钮组和文件名之间的间距 */
  background-color: #f8f9fa; /* 给操作区一个极淡的背景，增加层次感 */
  padding: 10px;
  border-radius: 6px;
  border: 1px dashed #dcdfe6; /* 虚线框，提示这是一个文件区域 */
}

/* 按钮行：确保两个按钮紧贴 */
.buttons-row {
  display: flex;
  align-items: center;
  gap: 10px; /* 两个按钮之间的间距 */
}

/* 强制 upload 组件变为行内元素，解决换行问题 */
.inline-upload {
  display: inline-flex;
}
/* 深度选择器：确保 upload 内部的 div 也是行内的 */
:deep(.el-upload) {
  display: inline-flex;
}

/* 选中文件的 Tag 样式 */
.selected-file-tag {
  display: flex;
  align-items: center;
}
.file-icon-gap {
  margin-right: 4px;
  position: relative;
  top: 1px;
}

/* 优化 Label 样式 */
.custom-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #606266;
  font-size: 15px;
}

/* --- 新增样式：结果展示区 --- */
.report-content {
  padding: 20px;
  min-height: 200px;
  position: relative;
}

/* Markdown 样式覆盖 (github-markdown-css 风格) */
.markdown-body {
  font-size: 15px;
  line-height: 1.7;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
}
:deep(.markdown-body h1),
:deep(.markdown-body h2) {
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}
:deep(.markdown-body code) {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}
:deep(.markdown-body pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow: auto;
}
:deep(.markdown-body blockquote) {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  padding-left: 1em;
  margin: 0;
}
:deep(.markdown-body ul) {
  padding-left: 2em;
}

/* 闪烁光标 */
.cursor-blinker {
  display: inline-block;
  width: 8px;
  height: 18px;
  background-color: #409eff;
  margin-left: 4px;
  animation: blink 1s step-end infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.status-text {
  font-size: 12px;
  color: #909399;
  margin-right: 10px;
}
.blink {
  animation: blink 2s infinite;
}

.header-right {
  display: flex;
  align-items: center;
}
.typing-tag {
  margin-right: 10px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 优化 Timeline 样式 */
.log-item-card {
  border: none;
  background: transparent;
}
:deep(.el-timeline-item__content) {
  margin-bottom: 20px;
}

.editor-container {
  padding-bottom: 20px;
}

.edit-section {
  padding: 10px;
}

.field-row {
  margin-bottom: 20px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 15px;
}
.field-row:last-child {
  border-bottom: none;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.tag-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 标签样式微调 */
:deep(.el-tag) {
  height: 32px;
  line-height: 30px;
  font-size: 13px;
}

/* 动态输入框样式 */
.new-tag-input {
  width: 120px;
  height: 32px;
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

/* 调整 Collapse 样式，使其更清爽 */
:deep(.el-collapse-item__header) {
  font-size: 15px;
  background-color: #fafafa;
  padding-left: 15px;
  border-radius: 4px;
}
:deep(.el-collapse-item__content) {
  padding: 15px;
}
/* 底部操作栏容器 */
.action-footer {
  margin-top: 30px; /* 与上方内容的间距 */
  padding-top: 20px; /* 内部间距 */
  border-top: 1px solid #ebeef5; /*加一条淡分割线 */
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  gap: 15px; /* 按钮之间的间距 */
  padding-right: 10px; /* 右侧留一点白 */
}

/* 如果你想让按钮看起来更显眼，可以微调按钮样式 */
.action-footer .el-button {
  font-weight: bold;
  padding: 20px 25px; /* 让按钮稍微大一点 */
}

/* ... 原有样式 ... */

/* 建模编辑弹窗样式 */
.modeling-item-header {
  display: flex;
  align-items: center;
  width: 100%;
}
.ku-title {
  font-weight: bold;
  color: #303133;
  /* 文本截断 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 600px;
}

.dimension-table-wrapper {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.table-footer {
  margin-top: 10px;
  text-align: center;
  border-top: 1px dashed #dcdfe6;
  padding-top: 8px;
}

.tips-text {
  font-size: 13px;
  color: #909399;
  margin-right: 10px;
  align-self: center;
}

/* 确保 action-footer 在 Markdown 下方有足够的间距 */
.action-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  align-items: center;
}
</style>
