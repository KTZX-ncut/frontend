<template>
  <div class="cpirse-lib">
    <Header title="课程题库" :pathData="pathData" />

    <div class="cpirse-lib-btn flex-between">
      <el-checkbox label="全选" @change="handleSelectAll"></el-checkbox>
      <div>
        <el-button type="success" @click="openAiDialog">AI生成题目</el-button>
        <el-button type="danger" :icon="Delete" @click="batchDel" :disabled="!selectedRows.length">批量删除</el-button>
      </div>
    </div>

    <el-table ref="questionTableRef" :data="courseList" stripe border style="margin-top:16px" @selection-change="(rows) => selectedRows = rows">
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="content" label="题目内容" min-width="300">
        <template #default="{ row }">
          <el-popover trigger="hover" placement="top" width="500">
            <div v-html="renderLatex(row.content)"></div>
            <template #reference>
              <span class="text-ellipsis" v-html="renderLatex(row.content || '')"></span>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="KWA" min-width="120">
        <template #default="{ row }">
          <el-popover trigger="hover" placement="top" width="400">
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              <el-tag v-for="k in (row.kwas||[])" :key="k" size="small">{{ k }}</el-tag>
              <span v-if="!row.kwas?.length" style="color:#999">无</span>
            </div>
            <template #reference>
              <div class="text-ellipsis">
                <el-tag v-for="k in (row.kwas||[]).slice(0,3)" :key="k" size="small" style="margin:1px 2px">{{ k }}</el-tag>
                <el-tag v-if="(row.kwas||[]).length > 3" size="small" type="info" style="margin:1px 2px">+{{ (row.kwas||[]).length - 3 }}</el-tag>
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="题型" width="80">
        <template #default="{ row }">{{ { '0201':'单选','0202':'多选','0203':'判断','0204':'填空','0205':'简答' }[row.questionTypeId] || row.questionTypeId }}</template>
      </el-table-column>
      <el-table-column label="难度" width="80">
        <template #default="{ row }">
          <el-tag size="small" :type="row.difficultyLevel == 1 ? 'success' : row.difficultyLevel == 3 ? 'danger' : 'warning'">
            {{ row.difficultyLevel == 1 ? '简单' : row.difficultyLevel == 3 ? '困难' : '中等' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" text @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="!courseList || !courseList.length" style="text-align:center;padding:40px;color:#999">暂无题目</div>

    <div class="pagination flex-end" style="margin-top:16px">
      <el-pagination
        v-model:currentPage="params.pageIndex"
        v-model:page-size="params.pageSize"
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- AI出题弹窗 -->
    <el-dialog v-model="aiDialogVisible" title="AI生成题目" width="500px" :close-on-click-modal="false">
      <!-- KWA选择阶段 -->
      <div v-if="!taskId" v-loading="aiKwaLoading">
        <el-empty v-if="!aiKwaLoading && aiKwaList.length === 0" description="暂无KWA数据" />
        <div v-else>
          <p style="margin-bottom:12px;color:#606266">选择知识点（KWA）以生成题目：</p>
          <el-checkbox-group v-model="aiSelectedKwas" style="max-height:250px;overflow-y:auto;display:grid;grid-template-columns:1fr 1fr">
            <el-checkbox v-for="kwa in aiKwaList" :key="kwa.kwaId" :label="kwa.kwaId" style="margin:4px 0">{{ kwa.kwaName }}</el-checkbox>
          </el-checkbox-group>
          <div style="margin-top:16px;display:flex;align-items:center">
            <span>生成数量：</span><el-input-number v-model="aiQuestionCount" :min="1" :max="100" />
            <el-button type="primary" :loading="aiGenerating" @click="handleAiGenerate" style="margin-left:16px">开始生成</el-button>
          </div>
        </div>
      </div>
      <!-- 进度阶段 -->
      <div v-else style="text-align:center;padding:20px">
        <el-progress :percentage="aiPercent" :status="aiProgressStatus" :stroke-width="16" :text-inside="true" style="margin-bottom:12px" />
        <p style="color:#606266">{{ aiStage }}</p>
        <el-button v-if="aiPercent >= 100" type="primary" @click="finishGenerate" style="margin-top:12px">完成，刷新列表</el-button>
        <p v-if="aiError" style="color:#f56c6c;margin-top:8px">{{ aiError }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Header from "../components/header/index.vue";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { getKwaList, generateQuestions, getGenerateProgress, getQuestionGenPage, deleteQuestions } from "@/api/exam.js";

// 渲染文本中的 $...$ LaTeX公式
const renderLatex = (text) => {
  if (!text) return '';
  return text.replace(/\$([\s\S]+?)\$/g, (_, formula) => {
    // 清理公式：双反斜杠→单，中文括号→英文，去掉多余换行
    let f = formula.replace(/\\\\/g, '\\').replace(/（/g, '(').replace(/）/g, ')').trim();
    let displayMode = /\\begin|\\frac|\\\\/.test(f);
    try { return katex.renderToString(f, { throwOnError: false, displayMode }); }
    catch (e) { console.warn('KaTeX:', e.message, f.substring(0,50)); return f; }
  });
};

export default defineComponent({
  components: { Header, Delete },
  setup() {
    const courseList = ref([]);
    const total = ref(0);
    const activeNames = ref([]);
    const params = ref({ pageIndex: 1, pageSize: 20 });

    const pathData = [{ name: "课程题库", path: "" }];

    const selectedRows = ref([]);
    const getCourseLibList = () => {
      getQuestionGenPage({ pageIndex: params.value.pageIndex, pageSize: params.value.pageSize }).then(res => {
        // 兼容 code 是字符串 "200" 或数字 200
        if (res.code == '200' || res.code === 200) {
          courseList.value = (res.data?.data || []).map(q => ({ ...q, isChecked: false }));
          total.value = res.data?.recordSize || 0;
          activeNames.value = courseList.value.map(q => q.id);
        }
      });
    };

    onMounted(() => getCourseLibList());

    const questionTableRef = ref(null);
    const handleSelectAll = (val) => {
      if (val) {
        courseList.value.forEach(q => questionTableRef.value?.toggleRowSelection(q, true));
      } else {
        questionTableRef.value?.clearSelection();
      }
    };
    const handleSizeChange = (val) => { params.value.pageSize = val; getCourseLibList(); };
    const handleCurrentChange = (val) => { params.value.pageIndex = val; getCourseLibList(); };

    const del = (row) => {
      ElMessageBox.confirm("确定删除？", "提示", { type: "warning" }).then(() => {
        deleteQuestions([row.id]).then(res => {
          if (res.code == '200' || res.code === 200) { ElMessage.success("已删除"); getCourseLibList(); }
        });
      }).catch(() => {});
    };

    const batchDel = () => {
      if (!selectedRows.value.length) return ElMessage.warning("请勾选题目");
      const ids = selectedRows.value.map(r => r.id);
      ElMessageBox.confirm(`确定删除 ${ids.length} 道题？`, "提示", { type: "warning" }).then(() => {
        deleteQuestions(ids).then(res => {
          if (res.code == '200' || res.code === 200) { ElMessage.success("已删除"); getCourseLibList(); }
        });
      }).catch(() => {});
    };

    // ===== AI出题 =====
    const aiDialogVisible = ref(false);
    const aiKwaList = ref([]);
    const aiKwaLoading = ref(false);
    const aiSelectedKwas = ref([]);
    const aiQuestionCount = ref(20);
    const aiGenerating = ref(false);
    const taskId = ref('');
    const aiPercent = ref(0);
    const aiStage = ref('');
    const aiProgressStatus = ref('');
    const aiError = ref('');
    let pollTimer = null;

    const openAiDialog = () => {
      aiDialogVisible.value = true;
      aiSelectedKwas.value = [];
      aiQuestionCount.value = 20;
      taskId.value = '';
      aiPercent.value = 0;
      aiStage.value = '';
      aiError.value = '';
      if (pollTimer) clearInterval(pollTimer);
      aiKwaLoading.value = true;
      getKwaList().then(res => {
        if (res.code == '200' || res.code === 200) aiKwaList.value = res.data || [];
      }).finally(() => { aiKwaLoading.value = false });
    };

    // 假进度：100ms微步丝滑涨到80，上限80
    const startFakeProgress = (from) => {
      let fakePercent = from || 10;
      const fakeTimer = setInterval(() => {
        if (!taskId.value) { clearInterval(fakeTimer); return; }
        fakePercent += (80 - fakePercent) / 180; // 18秒÷100ms=180步
        if (aiPercent.value < Math.min(fakePercent, 80)) {
          aiPercent.value = Math.round(Math.min(fakePercent, 80));
        }
      }, 100);
      return fakeTimer;
    };

    let fakeTimer = null;

    const handleAiGenerate = () => {
      if (!aiSelectedKwas.value.length) return ElMessage.warning("请至少选择一个KWA");
      aiGenerating.value = true;
      aiPercent.value = 5;
      aiStage.value = '正在提交任务...';
      generateQuestions({ selectedKwaIds: aiSelectedKwas.value, questionCount: aiQuestionCount.value }).then(res => {
        if (res.code == '200' || res.code === 200) {
          taskId.value = res.data;
          // 启动假进度（只在真实进度不动时缓慢增长）
          fakeTimer = startFakeProgress(10);
          // 真实进度轮询
          pollTimer = setInterval(() => {
            getGenerateProgress(taskId.value).then(p => {
              if (p.code == '200' || p.code === 200) {
                const d = p.data;
                // 真实进度优先，取最大值
                if (d.percent > aiPercent.value) {
                  aiPercent.value = d.percent;
                }
                aiStage.value = d.stage || '';
                if (d.status === 'DONE') {
                  clearInterval(pollTimer); clearInterval(fakeTimer);
                  aiPercent.value = 100; aiProgressStatus.value = 'success';
                  aiGenerating.value = false;
                } else if (d.status === 'FAILED') {
                  clearInterval(pollTimer); clearInterval(fakeTimer);
                  aiPercent.value = 100; aiProgressStatus.value = 'exception';
                  aiError.value = d.errorMsg || '未知错误'; aiGenerating.value = false;
                }
              }
            }).catch(() => {});
          }, 1500);
        } else { ElMessage.error(res.msg || "提交失败"); aiGenerating.value = false; }
      });
    };

    const finishGenerate = () => { aiDialogVisible.value = false; taskId.value = ''; getCourseLibList(); };

    return {
      courseList, total, activeNames, params, pathData, selectedRows, questionTableRef,
      handleSelectAll, handleSizeChange, handleCurrentChange, del, batchDel,
      aiDialogVisible, aiKwaList, aiKwaLoading, aiSelectedKwas, aiQuestionCount, aiGenerating,
      openAiDialog, handleAiGenerate, Delete, renderLatex,
      taskId, aiPercent, aiStage, aiProgressStatus, aiError, finishGenerate,
    };
  },
});
</script>

<style scoped>
.cpirse-lib { padding: 0 20px 20px 20px; background: #fff; min-height: 100%; box-sizing: border-box; }
.cpirse-lib-btn { padding: 10px 0; }
.topic-item { text-align: left; padding: 0 10px; }
.pagination { margin-top: 10px; }
</style>
