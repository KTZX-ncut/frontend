<!-- 使用vxe-table组件开发 -->
<template>
  <div style="height: 100%">
    <el-header
      style="
        height: 40px;
        padding: 5px 0px;
        width: 100%;
        text-align: left;
        background-color: #deebf7;
      "
    >
      <!-- 原计算按钮 -->
      <el-button
        v-if="roleName !== '课程负责人'"
        type="success"
        @click="calc"
        style="margin-left: 0.8vw"
      >
        计算
      </el-button>

      <!-- 新增修改功能按钮组 -->
      <template v-if="!isEditMode && roleName === '课程负责人'">
        <el-button type="primary" style="margin-left: 10px" @click="enterEdit"> 修改 </el-button>
      </template>

      <template v-else-if="isEditMode && isCourseManager">
        <el-button style="margin-left: 10px" @click="cancelEdit"> 取消 </el-button>
        <el-button
          type="success"
          :disabled="calcFooter2Data() !== 100"
          style="margin-left: 10px"
          @click="saveEdit"
        >
          保存
        </el-button>
      </template>
    </el-header>

    <div v-loading="pageLoading" element-loading-background="rgba(0, 0, 0, 0.2)">
      <div id="container" style="height: calc(92vh - 130px); width: 100%">
        <vxe-grid
          v-if="info && info.head.length"
          v-bind="gridOptions"
          v-on="gridEvents"
          :edit-config="gridOptions.editConfig"
          class="scroll-container"
          @edit-closed="handleEditClosed"
        >
          <template #cell="{ rowIndex, columnIndex }">
            <!-- 只对第 0 行 0 列单元格自定义 -->
            <div v-if="rowIndex === 0 && columnIndex === 0" class="diagonal-cell">
              <span class="top-left">类别A</span>
              <span class="bottom-right">类别B</span>
            </div>
          </template>
        </vxe-grid>
        <div
          v-else
          style="
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: grey;
          "
        >
          暂无数据
        </div>
      </div>
      <div v-if="info && info.head.length">
        <el-table
          :data="footer1Data"
          :show-header="false"
          :row-class-name="tableRowClassName"
          border
        >
          <el-table-column prop="name" width="240" align="center"></el-table-column>
          <el-table-column
            :prop="item.id"
            v-for="(item, index) in info.head"
            :key="index"
            show-overflow-tooltip
            align="center"
          >
            <template v-slot="scope">
              <div
                v-if="calcFooter1Data(scope.row[item.id]) != 100"
                style="color: red; height: 28px"
              >
                合计需为100（当前为：{{ scope.row[item.id] }}）
              </div>
              <div v-else style="height: 28px; color: black">{{ scope.row[item.id] }}</div>
            </template>
          </el-table-column>
        </el-table>

        <el-table
          :data="footer2Data"
          :show-header="false"
          :row-class-name="tableRowClassName"
          border
        >
          <el-table-column prop="name" width="240" align="center"></el-table-column>
          <el-table-column
            v-for="(item, index) in info.head"
            :key="index"
            show-overflow-tooltip
            align="center"
          >
            <template v-slot="scope">
              {{ item.percent * 100 }}%
              <!-- <el-input
                v-if="scope.row.edit[item.id]"
                style="height: 28px"
                :ref="el => setInputRef(el, item.id)"
                @blur="handleBlur(scope.row, item.id)"
                v-model="scope.row[item.id]"
              ></el-input> -->
              <!-- <div
                v-else
                @dblclick="handleClick(scope.row, item.id)"
                :style="{
                  color: calcFooter2Data() !== 100 ? 'red' : 'black',
                  width: '100%',
                  height: '28px'
                }"
              >
                {{ scope.row[item.id] }}
                <span v-if="calcFooter2Data() !== 100" style="color: red">
                  （总评合计不为100）</span
                >
              </div> -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!----------------------------------编辑弹窗-------------------------------------->
    <el-dialog v-model="editDialogVisible" width="600" destroy-on-close>
      <div
        style="padding: 0 25%; display: flex; justify-content: space-between; margin: -5px 0 15px 0"
      >
        <el-button @click="uploadDialogVisible = true">上传</el-button>
        <el-button @click="associate()">关联</el-button>
      </div>
      <div
        style="
          font-weight: bolder;
          border: 1px solid #ebebeb;
          height: 30px;
          line-height: 30px;
          color: #969696;
          user-select: none;
        "
      >
        考核项：{{ rightClickItem.title }}
      </div>
      <el-table
        ref="multipleTableRef"
        :data="filesTableData"
        style="height: 350px"
        v-loading="filesTableLoading"
        element-loading-background="rgba(0, 0, 0, 0.2)"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column align="center" type="selection" width="40"></el-table-column>
        <el-table-column align="center" label="名称" width="150" prop="name"></el-table-column>
        <el-table-column
          align="center"
          label="上传时间"
          width="170"
          prop="createTime"
        ></el-table-column>
        <el-table-column align="center" width="60" label="类型">
          <template #default="{ row }">
            {{ row.type == 1 ? '作业' : row.type == 2 ? '测试' : row.type == 3 ? '实验' : '上传' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template #default="{ row }">
            <div style="display: flex; justify-content: space-between; padding: 0 10px">
              <el-button type="primary" size="small" @click="openPreviewDialog(row)"
                >预览</el-button
              >
              <el-button
                :disabled="row.type !== 4"
                type="danger"
                size="small"
                @click="openDeleteDialog(row)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!----------------------------------上传弹窗-------------------------------------->
    <el-dialog v-model="uploadDialogVisible" width="400" destroy-on-close>
      <!-- <el-text type="warning" style="margin-bottom: 10px;">仅支持.csv、.xls、.xlsx文件类型</el-text><br> -->
      <div class="link-text" @click="getUploadTemplate">获取上传模板</div>
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
        accept=".xls,.xlsx"
        :before-upload="file => storeFileInfo(file, rightClickItem)"
      >
        <template #trigger>
          <el-button type="primary" style="margin-top: 10px">选择文件</el-button>
        </template>
      </el-upload>
      <el-button @click="uploadFile()" style="margin-bottom: 10px">确定</el-button><br />
      <el-text type="danger"
        >模板中是最新的本课堂学生列表，<br />不使用模板进行上传可能产生无效数据</el-text
      >
    </el-dialog>

    <!----------------------------------预览文件的弹窗-------------------------------------->
    <el-dialog
      v-model="previewDialogVisible"
      width="1200"
      style="height: 90vh; margin-top: 30px; margin-bottom: 30px"
      destroy-on-close
    >
      <div v-if="fileType === 4" style="max-height: 82vh; overflow: auto">
        <!-- <vue-office-docx v-if="fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'"
          style="height: 82vh;" :src="blobData" />
        <vue-office-pdf v-else-if="fileType === 'application/pdf'" style="height: 82vh;" :src="blobData" /> -->
        <vue-office-excel style="height: 82vh" :src="blobData" />
      </div>
      <div v-else>{{ fileInfo }}</div>
    </el-dialog>
    <!------------------------------------------------------------------------------------->

    <!----------------------------------确认删除的弹框-------------------------------------->
    <el-dialog v-model="deleteDialogVisible" width="350" destroy-on-close>
      <template #header="{ titleId, titleClass }">
        <div style="text-align: left; margin-bottom: -15px">
          <div :id="titleId" :class="titleClass" style="font-size: 15px">
            <el-button link type="warning">
              <el-icon size="20" style="padding-bottom: 3px; box-sizing: border-box">
                <WarningFilled />
              </el-icon>
            </el-button>
            是否要删除选中的文件
          </div>
        </div>
      </template>
      <div
        v-if="associateFiles.length"
        style="
          max-height: 300px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        "
      >
        <div style="margin-bottom: 5px">
          <el-text type="danger" style="display: flex">
            <div>将删除的文件与以下考核项关联，请先取消关联</div>
          </el-text>
        </div>
        <el-table :data="associateFiles" style="width: 60%; height: 30vh" stripe border>
          <el-table-column label="考核项名" prop="itemName" align="center"></el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div v-if="!associateFiles.length" class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="deleteFile()"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-------------------------------------------------------------------------------------->
  </div>
  <Test :category-name="category.name" :classroom-id="classroomId" />
  <TypeItem :classroom-id="classroomId" />
</template>

<script setup lang="tsx">
// ✅ 在这里加上我们新引入的批量保存接口
import { batchSaveObjectiveCategory } from '@/api/externalAssessment';
import TypeItem from './TypeItem.vue';
import Test from './Test.vue';
import type { VxeGridProps } from 'vxe-table';
import { nextTick, onMounted, reactive, ref } from 'vue';
import request from '@/utils/request.js';
import { ElMessage, genFileId } from 'element-plus';
import type { TableInstance } from 'element-plus';
import _ from 'lodash';
import { UploadInstance } from 'element-plus';
import { UploadProps } from 'element-plus';
import { UploadRawFile } from 'element-plus';
import { Aim, WarningFilled } from '@element-plus/icons-vue';
import VueOfficeDocx from '@vue-office/docx';
import VueOfficeExcel from '@vue-office/excel';
import '@vue-office/excel/index.css';
import VueOfficePdf from '@vue-office/pdf';
import useItem from '../../../stores/useItem';
import useCourseAim from '../../../stores/useCourseAim';
import useEvaluationNew from '../../../stores/useEvaluationNew';
import { storeToRefs } from 'pinia';
import parseJWT from '../../../utils/parseJWT';
import { Category, AimType, newInfo, collumnItem } from './type';
import useLabel from '../../../stores/useLabel';
interface Footer2Row {
  name: string;
  edit: Record<string, boolean>;
  [key: string]: any;
}
const originalData = ref(null);
// ✅ 从后端加载各目标-类别分数并回显到表格
const loadObjectiveCategory = async () => {
  try {
    const res = await request.evaluation.get('/objective-category/list');
    if (res.code === 200 && Array.isArray(res.data)) {
      const list = res.data;

      list.forEach(item => {
        const { categoryId, objectiveId, score } = item;
        const field = `type${categoryId}`;
        const targetRow = info.value.items.find(i => i.id === objectiveId);
        if (targetRow) {
          targetRow[field] = score;
        }
      });

      console.log('✅ 已加载后端分数到前端表格');
    } else {
      console.warn(' 未获取到有效的分数数据');
    }
  } catch (err) {
    console.error(' 获取 objective-category 数据出错:', err);
  }
};

const labelStore = useLabel();
const { fetchExternalAssessmenCalc } = labelStore;
// const roleName = sessionStorage.getItem

// 是否处于编辑模式
const isEditMode = ref(false);

const enterEdit = () => {
  // 深拷贝一份当前 info 数据（用于撤销）
  originalData.value = _.cloneDeep(info.value);
  isEditMode.value = true;
  ElMessage.info('进入编辑模式');
};

const cancelEdit = () => {
  if (originalData.value) {
    // 恢复原始数据
    info.value = _.cloneDeep(originalData.value);
    // 同步 grid 数据
    gridOptions.value.data = info.value.items;
  }
  isEditMode.value = false;
  ElMessage.warning('已取消编辑，已恢复原始数据');
};

const saveEdit = async () => {
  try {
    // 1️⃣ 校验列是否合计为 100
    const totalMap: Record<string, number> = {};

    info.value.head.forEach((head: any) => {
      const categoryId = head.id;
      let total = 0;
      let hasValue = false;

      info.value.items.forEach((item: any) => {
        const field = `type${categoryId}`;
        const score = item[field];
        if (score !== undefined && score !== null && score !== '') {
          hasValue = true;
          total += Number(score);
        }
      });

      if (hasValue) totalMap[categoryId] = total;
    });

    const invalidColumns = Object.entries(totalMap).filter(([_, total]) => total !== 100);
    if (invalidColumns.length > 0) {
      ElMessage.error('有填写的考核项分数合计不为100，请检查！');
      return;
    }

    // 2️⃣ 校验绑定列是否被修改
    const boundCategories = bindList.value.map(b => b.categoryId); // 已绑定列
    const modifiedCategories = new Set<string>();

    info.value.items.forEach(item => {
      info.value.head.forEach(head => {
        const field = `type${head.id}`;
        const newVal = item[field];
        const oldVal = originalData.value?.items.find(r => r.id === item.id)?.[field];
        if (newVal !== oldVal) modifiedCategories.add(head.id);
      });
    });

    const lockedCols = Array.from(modifiedCategories).filter(id => boundCategories.includes(id));

    if (lockedCols.length > 0) {
      ElMessage.warning('请联系任课教师解绑后再修改该列分数');
      return;
    }

    // 3️⃣ 生成提交数据
    const flatList: any[] = [];
    info.value.items.forEach((item: any) => {
      const objectiveId = item.id;
      info.value.head.forEach((head: any) => {
        const categoryId = head.id;
        const field = `type${categoryId}`;
        let score = item[field];
        const prevRow = originalData.value?.items.find((r: any) => r.id === objectiveId);
        const prevScore = prevRow ? prevRow[field] : undefined;

        const shouldSendZero =
          (score === '' || score === undefined || score === null) &&
          prevScore !== undefined &&
          prevScore !== null &&
          prevScore !== '';
        if (shouldSendZero) score = 0;

        const changed =
          prevScore !== score ||
          shouldSendZero ||
          (score !== undefined && score !== null && score !== '');
        if (changed) {
          flatList.push({
            categoryId,
            objectiveId,
            score: Number(score || 0)
          });
        }
      });
    });

    console.log('提交数据:', flatList);
    const res = await batchSaveObjectiveCategory(flatList);

    if (res?.code === 200 && res?.data?.success !== false) {
      ElMessage.success('批量保存成功');
      isEditMode.value = false;
      await getData();
    } else {
      ElMessage.error(res?.msg || '保存失败，请检查数据');
    }
  } catch (err) {
    console.error('保存出错:', err);
    ElMessage.error('保存出错，请检查网络或后端接口');
  }
};

// 保存修改（调用 /api/objective-category/batch-save）
const savePercent = async () => {
  if (calcFooter2Data() !== 100) {
    ElMessage.error('各列总评占比之和必须为 100%');
    return;
  }

  const items = info.value!.head.map(h => ({
    id: h.id,
    weight: Math.max(0, Math.round(Number(footer2Data.value[0][h.id]) || 0))
  }));

  try {
    const res = await batchSaveObjectiveCategory(items);
    if (res.code === 200) {
      ElMessage.success('批量保存成功');
      info.value!.head.forEach(h => (footer2Data.value[0].edit[h.id] = false));
      isEditing.value = false;
      await getData(); // 刷新数据
    } else {
      ElMessage.error(res.msg || '保存失败');
    }
  } catch (err) {
    ElMessage.error('保存失败：' + err);
  }
};

const info = ref<newInfo | null>(null);

const calc = async () => {
  pageLoading.value = true;
  let totalPercent = 0;
  info.value?.head.forEach(h => {
    totalPercent += Number(h.percent);
  });
  if (totalPercent !== 1) {
    ElMessage.error('各列总评占比之和必须为 100%');
    pageLoading.value = false;
    return;
  }
  try {
    const res = await fetchExternalAssessmenCalc(classroomId);
    if (res.code === 200) {
      ElMessage.success(res.msg + '请到对应页面查看结果');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('计算失败' + error);
  }
  pageLoading.value = false;
};

const isCourseManager = ref(null);

const container = ref<HTMLElement | null>(null);

const pageLoading = ref(false);

// const info = ref(null); // 存储后端传来的的数据

const leafIds = ref({}); // 以id为键存储其所有叶节点的id

const footer1Data = ref([{ name: '分数合计' }]);
const footer2Data = ref<Footer2Row[]>([{ name: '总评占比(%)', edit: {} }]);

const itemStore = useItem();
const aimStore = useCourseAim();
const typeStore = useEvaluationNew();
const {
  fetchCourseId,
  setShow,
  fetchTest,
  setItemShow,
  setCategoryId,
  setObjectiveId,
  fetchGetBind,
  setCourseId
} = itemStore;
const { fetchType } = typeStore;
const { fetchAim } = aimStore;
const { testList, courseId, bindList } = storeToRefs(itemStore);
const { typeList } = storeToRefs(typeStore);
const { aimList } = storeToRefs(aimStore);
const roleName = JSON.parse(sessionStorage!.getItem('users')).rolename;
const classroomId = roleName === '任课教师' ? parseJWT(sessionStorage.getItem('token')).obsid : '';

const rightClickItem = ref(); // 存储被右键的考核项
const category = reactive<{ name: string; id: string }>({
  name: '',
  id: ''
});

// 用于渲染表格的数据
const gridOptions = ref<VxeGridProps<AimType>>({
  size: 'mini',
  border: true,
  height: 500,
  align: 'center',
  showOverflow: true,
  showHeaderOverflow: true,
  editConfig: {
    trigger: 'dblclick',
    mode: 'cell',
    showIcon: false,
    beforeEditMethod: ({ column }) => {
      // 只在编辑模式允许编辑
      return isEditMode.value && column.field !== 'target';
    }
  },
  columnConfig: { resizable: false },
  headerCellConfig: { height: 80 },
  menuConfig: {
    header: {
      options: [[{ code: 'edit', name: '编辑', suffixConfig: { icon: 'vxe-icon-edit' } }]]
    },
    visibleMethod({ options, column }) {
      rightClickItem.value = column;
      let isDisabled = true;
      let isVisible = false;
      if (
        info.value!.head.some(item => leafIds.value[item.id].includes(column.field)) &&
        !isCourseManager.value
      ) {
        isDisabled = false;
        isVisible = true;
      }
      options.forEach(list => {
        list.forEach(item => {
          if (item.code === 'edit') {
            item.visible = isVisible;
            item.disabled = isDisabled;
          }
        });
      });
      return true;
    }
  },
  columns: [] as collumnItem[],
  data: [] as AimType[]
});

onMounted(async () => {
  container.value = document.getElementById('container');
  await checkRole();
  await getData();
  if (!container.value) return;
  gridOptions.value.height = container.value.clientHeight;
});

const checkRole = async () => {
  try {
    const res = await request.evaluation.get(`/evaluation/attainment`);
    if (res.code === 200) {
      isCourseManager.value = res.data.isCourseManager;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('查询角色失败' + error);
  }
};

const getData = async () => {
  try {
    classroomId
      ? await fetchCourseId(classroomId)
      : setCourseId(parseJWT(sessionStorage.getItem('token')).obsid);
    await fetchTest({ classroomId });
    await fetchAim({ courseId: courseId.value, current: 1, size: -1 });
    await fetchType({ courseId: courseId.value, current: 1, size: -1 });
    if (!(typeList.value.length || aimList.value.length)) return;
    info.value = {
      head: [...typeList.value],
      items: [...aimList.value]
    };
    initialize(info.value);
    await loadObjectiveCategory();
  } catch (error) {
    ElMessage.error('获取考核方案失败', error);
  }
  await fetchGetBind(courseId.value, -1, 1, '', '');
};

function splitEvenlyInt(arr: any[]) {
  const len = arr.length;
  if (len === 0) return [];

  const base = Math.floor(100 / len);
  const remainder = 100 % len;

  return arr.map((_, i) => (i < remainder ? base + 1 : base));
}

const initialize = (info: newInfo) => {
  console.log(info);
  // TODO:处理表头
  info.head.forEach((h, index) => {
    footer1Data.value[0][h.id] = h.score;
    footer2Data.value[0][h.id] = splitEvenlyInt(info.head)[index];
    // 设置总评占比为true
    footer2Data.value[0].edit[h.id] = false;
    // footer2Data.value[0].edit[h.id] = true;
  });
  console.log('head list', info.head);

  creatHeader(info?.head); // 创建表头

  info.items.forEach(item => {
    // 处理数据单元格
    item.target = item.objectiveName; // 这里新加target是为了对应表格的课程目标列以显示数据，那列的field键值为'target'
  });
  gridOptions.value.data = info.items;
};

// ancextorId存储的是每个最外层节点的id，用于遍历到最深层时能知道其属于哪个最外部节点（考核项大类）
const creatHeader = (head: Category[], floor = 0, ancestorId = '') => {
  // 每个 head 生成列配置
  const heads = head.map<collumnItem>((h, index) => {
    const width = Number((container.value!.clientWidth / info.value!.head.length).toFixed(0));
    // const width = 240;

    return {
      title: h.categoryName,
      field: `type${h.id}`,
      width,
      // ⭐ 编辑时的输入框配置
      editRender: { name: 'input', props: { type: 'number', min: 0 } },

      // ⭐ 定义渲染逻辑
      slots: {
        default: ({ row, column, rowIndex }) => {
          // 编辑模式下显示输入框值
          if (isEditMode.value) return row[column.field] ?? '';

          const score = row[column.field];
          if (score === undefined || score === null || score === '' || Number(score) === 0) {
            return '';
          }

          // ✅ 非课程负责人时才显示“查看”按钮
          return (
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span style="font-weight: 600; color: #333;">{score}</span>
              {roleName !== '课程负责人' && (
                <vxe-button-group mode="text">
                  <vxe-button onClick={() => handleBind(h, row, rowIndex)} name="view">
                    查看
                  </vxe-button>
                </vxe-button-group>
              )}
            </div>
          );
        }
      }
    };
  });

  // ⭐ 最后整合列配置
  gridOptions.value.columns = [
    {
      field: 'target',
      title: '课程目标',
      width: 240
    },
    ...heads
    // {
    //   field: 'finalExam',
    //   title: '期末考试',
    //   width: 240
    // }
  ];
};

const handleBind = async (h: Category, row: any, rowIndex: number) => {
  category.name = h.categoryName;
  setCategoryId(h.id);
  setObjectiveId(row.id);
  await fetchGetBind(courseId.value, -1, 1, h.id, row.id);
  setShow(true); // ✅ 改成这一行
};

const getLeafIds = (node, result = []) => {
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      getLeafIds(child, result);
    });
  } else {
    result.push(node.id);
  }
  return result;
};

const calcSumScore = (array, ids) => {
  if (!array || !Array.isArray(array)) return 0;
  if (!ids || !Array.isArray(ids)) return 0;
  let sum = 0;
  array.forEach(item => {
    ids.forEach(id => {
      const field = `type${id}`; // ⭐ 加上前缀
      if (item && item[field] !== undefined && item[field] !== null && item[field] !== '') {
        sum += Number(item[field]);
      }
    });
  });
  return sum;
};

/**********************表格数据单元双击编辑*********************/
const oldData = ref();
const postData = ref({}); // 存储批量传到后端的数据

const gridEvents = {
  cellDblclick({ row, column }) {
    oldData.value = row[column.field];
  },
  async menuClick({ menu }) {
    if (menu.code === 'edit') {
      editDialogVisible.value = true;
      getFileList();
    }
  }
};

const handleEditClosed = async ({ row, column }) => {
  row[column.field] = row[column.field] ? Number(row[column.field]) : 0; // 清空数值则设为0
  let num = row[column.field];
  if (Number.isNaN(num)) {
    // 判断输入的是不是数字
    row[column.field] = oldData.value;
    return;
  }
  if (row[column.field] !== oldData.value) {
    // 当数据变化时再执行
    if (!postData.value.items) postData.value.items = {}; // 初始化post的数据
    row[column.field] = Number(Number(row[column.field]).toFixed(0)); // 若输入小数则四舍五入为整数
    if (num < 0) {
      // 若输入负数则撤销本次操作
      row[column.field] = oldData.value;
      return;
    }

    if (!postData.value.items) postData.value.items = {};
    if (!postData.value.items[row.id]) postData.value.items[row.id] = {}; // 以课程目标的id为键存储其内部所有考核项
    postData.value.items[row.id][column.field] = row[column.field]; // 以考核项的id为键存储其分数
    if (row[column.field] === 0) row[column.field] = undefined; // 值为0需要传给后端，但是前端表格里值为零就设为不显示
  }
};

const tableRowClassName = ({ row, rowIndex }) => {
  return 'footer-row';
};

const calcFooter1Data = score => {
  return score;
};

const calcFooter2Data = () => {
  let totalFooter2Data = 0; // 存储总评占比之和
  info.value!.head.forEach(item => {
    totalFooter2Data += footer2Data.value[0][item.id];
  });
  return totalFooter2Data;
};

const save = async () => {
  if (Object.keys(postData.value).length === 0) return; // 未改变任何值则不执行
  if (
    info.value!.head.every(item => footer1Data.value[0][item.id] === 100) ||
    calcFooter2Data() !== 100
  ) {
    ElMessage.error('数据不合法，无法保存');
    return;
  }
  // 数据合法再传给后端
  try {
    const res = await request.evaluation.post(
      `/evaluation/assessmentPlan/updateAssessmentTable`,
      postData.value
    );
    if (res.code === 200) {
      ElMessage.success('修改成功');
      await getData();
      postData.value = {};
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('修改失败' + error);
  }
};

/**********************双击修改总评占比栏**********************/
const inputsRefs = ref({});
const oldPercent = ref('');

const setInputRef = (el, id) => {
  if (el) {
    inputsRefs.value[id] = el;
  }
};

const handleClick = (row, field) => {
  console.log(row);
  nextTick(() => {
    row.edit[field] = true;
    oldPercent.value = row[field];
    setTimeout(() => {
      if (inputsRefs.value[field] && inputsRefs.value[field].$refs.input) {
        inputsRefs.value[field].$refs.input.focus();
      }
    }, 0);
  });
};

const handleBlur = (row, field) => {
  nextTick(async () => {
    row.edit[field] = false;
    if (row[field] !== oldPercent.value) {
      row[field] = Number(Number(row[field]).toFixed(0));
      if (row[field] === '') row[field] = 0;

      if (!postData.value.percent) postData.value.percent = {};
      postData.value.percent[field] = row[field]; // 以id为键存储其总评占比
    }
  });
};

/*************************编辑弹窗*************************/
const editDialogVisible = ref(false);
//---------------------------------------------作业实验表格相关
const filesTableData = ref([]);
const filesTableLoading = ref(true);

const multipleTableRef = ref<TableInstance>();
const multipleSelection = ref([]);
const oldSelection = ref([]); // 存储最初的被勾选的表格行，用于关联时找到哪些是被取消勾选的哪些是新勾选的

/*判定哪些行被选中*/
const handleSelectionChange = selection => {
  multipleSelection.value = selection;
};

const getFileList = async () => {
  filesTableLoading.value = true;
  try {
    const res = await request.evaluation.get(
      `/evaluation/assessmentPlan/getFileList?checkitemId=${rightClickItem.value.field}`
    );
    if (res.code === 200) {
      filesTableData.value = res.data.files;
      toggleSelection(res.data.associateFileIds);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('获取文件列表失败' + error);
  }
  filesTableLoading.value = false;
};
const toggleSelection = associateFileIds => {
  // 从filesTableData.value中过滤出id和associateFileIds每一个值相同的元素
  const rows = filesTableData.value.filter(file => associateFileIds.includes(file.id));
  oldSelection.value = rows;
  if (rows) {
    nextTick(() => {
      rows.forEach(row => {
        multipleTableRef.value!.toggleRowSelection(row, undefined, false);
      });
    });
  } else {
    multipleTableRef.value!.clearSelection();
  }
};

//---------------------------------------------关联按钮
const associate = async () => {
  // 新增的关联文件id
  const newFiles = multipleSelection.value.filter(item => !oldSelection.value.includes(item));
  // 取消关联的文件id
  const deletedFiles = oldSelection.value.filter(item => !multipleSelection.value.includes(item));
  if (!newFiles.length && !deletedFiles.length) return;
  console.log(newFiles, deletedFiles);

  // 标志着新增和删除关联是否成功
  let associate = true;
  let disassociate = true;
  filesTableLoading.value = true;

  if (newFiles.length) {
    const associatePost = {
      checkitemId: rightClickItem.value.field,
      files: newFiles
    };
    try {
      const res = await request.evaluation.post(
        `/evaluation/assessmentPlan/associate`,
        associatePost
      );
      if (res.code === 200) {
        getFileList();
      } else {
        ElMessage.error(res.msg);
        associate = false;
      }
    } catch (error) {
      ElMessage.error('修改失败' + error);
      associate = false;
    }
  }

  if (deletedFiles.length) {
    const disassociatePost = {
      checkitemId: rightClickItem.value.field,
      files: deletedFiles
    };
    try {
      const res = await request.evaluation.post(
        `/evaluation/assessmentPlan/disassociate`,
        disassociatePost
      );
      if (res.code === 200) {
        getFileList();
      } else {
        ElMessage.error(res.msg);
        disassociate = false;
      }
    } catch (error) {
      ElMessage.error('修改失败' + error);
      disassociate = false;
    }
  }

  if (associate && disassociate) ElMessage.success('修改成功');
};

//---------------------------------------------预览按钮
const previewDialogVisible = ref(false);
const fileType = ref(null);
const blobData = ref(null);
const fileInfo = ref(null);

const openPreviewDialog = async row => {
  fileType.value = row.type;
  if (row.type === 4) {
    try {
      const res = await request.evaluation.get(
        `/evaluation/assessmentPlan/showExcel?fileId=${row.id}`
      );
      if (res.code === 200) {
        blobData.value = generateBLOB(res.data);
      } else {
        ElMessage.error(res.msg);
      }
    } catch (error) {
      ElMessage.error('生成excel失败' + error);
    }
  }
  previewDialogVisible.value = true;
  fileInfo.value = row;
};

//---------------------------------------------删除按钮
const deleteDialogVisible = ref(false);
const filesTableRowData = ref(); // 存储文件列表点击了哪一行的数据
const associateFiles = ref([]);

const openDeleteDialog = async row => {
  deleteDialogVisible.value = true;
  filesTableRowData.value = row;
  try {
    const res = await request.evaluation.get(
      `/evaluation/assessmentPlan/getAssociateCheckitems?fileId=${filesTableRowData.value.id}`
    );
    if (res.code === 200) {
      associateFiles.value = res.data;
    } else ElMessage.error(res.msg);
  } catch (error) {
    ElMessage.error('获取关联考核项失败' + error);
  }
};

const deleteFile = async () => {
  const postData = {
    id: filesTableRowData.value.id,
    checkitemId: rightClickItem.value.field
  };
  try {
    const res = await request.evaluation.post(`/evaluation/assessmentPlan/deleteFile`, postData);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      getFileList();
      deleteDialogVisible.value = false;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('删除失败' + error);
  }
};

//---------------------------------------------上传
const uploadDialogVisible = ref(false);
const uploadingFile = ref({});
const uploadRef = ref<UploadInstance>();

// upload使用ref定义的类型为UploadInstance的变量，代表el-upload组件的实例。可通过upload.value访问el-upload的实例方法和属性。
const upload = ref<UploadInstance>();
// 这是处理文件超过限制的事件钩子，类型为 UploadProps['onExceed']，即它是 el-upload 的 onExceed 事件处理函数。files 是用户在操作时尝试上传的文件列表。
const handleExceed: UploadProps['onExceed'] = files => {
  upload.value!.clearFiles();
  // 从传入的 files 数组中取第一个文件，这个文件即是用户新选择的文件，并将其类型强制转换为 UploadRawFile 类型（即原始的文件对象）。
  const file = files[0] as UploadRawFile;
  // 给新选的文件生成一个唯一标识符 uid。Element Plus 内部依赖 uid 来区分不同的文件。如果这个文件对象没有 uid，上传时可能会出错。
  file.uid = genFileId();
  // 最后调用 handleStart(file) 方法，将这个文件手动加入到 el-upload 的上传队列中。handleStart() 是 el-upload 组件内部的方法。
  upload.value!.handleStart(file);
};

const storeFileInfo = (file, checkitem) => {
  if (file) {
    uploadingFile.value = file;
  }
  return false; // 阻止默认上传行为
};

const uploadFile = async () => {
  uploadRef.value!.submit(); // 触发上传文件
  const formData = new FormData();
  formData.append('file', uploadingFile.value);
  try {
    const res = await request.evaluation.post('/evaluation/assessmentPlan/uploadFile', formData);
    if (res.code === 200) {
      ElMessage.success(res.data);
      getFileList();
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('上传失败' + error);
  }
  uploadDialogVisible.value = false;
};

const getUploadTemplate = async () => {
  try {
    const res = await request.evaluation.get(`evaluation/assessmentPlan/getUploadTemplate`);
    if (res.code === 200) {
      const blob = generateBLOB(res.data);

      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'template.xlsx';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('获取模板失败' + error);
  }
};

//-------------------------------------------公用函数
const generateBLOB = data => {
  const base64Data = data;
  const byteChars = atob(base64Data);
  const len = byteChars.length;
  const byteArray = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  return blob;
};
</script>

<style scoped lang="scss">
.el-table {
  .footer-row {
    background-color: #fafafa;
  }
}

.scroll-container {
  ::-webkit-scrollbar {
    display: none;
  }
}

.link-text {
  color: dodgerblue;
  cursor: pointer;
  text-decoration: underline;
}

.link-text:hover {
  color: rgb(99, 177, 255);
}
</style>
