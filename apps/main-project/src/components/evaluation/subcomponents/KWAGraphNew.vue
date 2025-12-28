<template>
  <div class="graph-wrapper">
    <!-- 加载与空状态处理 -->
    <div v-if="loading" class="overlay"><el-skeleton :rows="10" animated /></div>
    <div v-else-if="isEmpty" class="empty-state"><el-empty description="暂无图谱数据" /></div>

    <div v-show="!isEmpty" class="container-wrapper">
      <!-- 顶部工具栏 (使用 Element Plus) -->
      <div class="graph-toolbar">
        <el-button-group>
          <el-tooltip content="自适应"
            ><el-button :icon="FullScreen" @click="handleFitView"
          /></el-tooltip>
          <el-tooltip content="放大"
            ><el-button :icon="ZoomIn" @click="handleZoom(1.2)"
          /></el-tooltip>
          <el-tooltip content="缩小"
            ><el-button :icon="ZoomOut" @click="handleZoom(0.8)"
          /></el-tooltip>
        </el-button-group>
        <el-tag :type="isCourseManager ? 'success' : 'info'" effect="dark" class="role-tag">
          {{ isCourseManager ? '负责人编辑模式' : '只读查看模式' }}
        </el-tag>
      </div>

      <!-- 图例 -->
      <div class="graph-legend">
        <div class="legend-item"><span class="dot achieved"></span> 已达成</div>
        <div class="legend-item"><span class="dot pending"></span> 未达成</div>
      </div>

      <!-- 画布容器 -->
      <div id="container" ref="containerRef" class="g6-container"></div>
    </div>
    <div v-if="sourceNodeId" class="op-tip">
      当前已选中：<el-tag closable @close="sourceNodeId = null">待连接节点</el-tag>
      请点击另一个节点完成操作
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, onUnmounted, shallowRef, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { FullScreen, ZoomIn, ZoomOut } from '@element-plus/icons-vue';
// G6 5.0 导入方式
import { Graph, type GraphData } from '@antv/g6';
import _ from 'lodash';
import request from '@/utils/request.js';

// --- 类型定义 (严格匹配业务与 G6 5.0) ---

interface KnowledgeNode {
  id: string;
  data: {
    unitid: number;
    kwaid: number;
    label: string;
    status: number;
  };
  combo?: string;
  style?: any;
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  data: {
    edgeid: number;
    startunitid: number;
    startkwaid: number;
    endunitid: number;
    endkwaid: number;
  };
}

// --- 状态与常量 ---
const COLORS = {
  achieved: '#52c41a',
  pending: '#ff4d4f',
  edge: '#fa8c16',
  edgeActive: '#1890ff',
  comboFill: 'rgba(240, 245, 255, 0.5)',
  comboStroke: '#91d5ff',
  selected: '#1890ff' // 选中时的颜色
};

const loading = ref(true);
const isCourseManager = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const graph = shallowRef<Graph | null>(null); // 使用 shallowRef 避免深度响应式影响性能

// ID 映射管理
const nodesMap = new Map<string, string>();
let nodesIdIdx = 0;
let edgesIdIdx = 0;

const nodes = ref<KnowledgeNode[]>([]);
const edges = ref<KnowledgeEdge[]>([]);
const combos = ref<any[]>([]);

const isEmpty = computed(() => nodes.value.length === 0);

const sourceNodeId = ref<string | null>(null); // 记录第一次点击的节点ID

const handleNodeClick = async (targetId: string, targetType: 'node' | 'combo') => {
  if (!isCourseManager.value || !graph.value) return;

  // 1. 选择起点
  if (!sourceNodeId.value) {
    sourceNodeId.value = targetId;
    graph.value.setElementState(targetId, 'selected');
    return;
  }

  // 2. 取消选择
  if (sourceNodeId.value === targetId) {
    graph.value.setElementState(sourceNodeId.value, []);
    sourceNodeId.value = null;
    return;
  }

  const sId = sourceNodeId.value;
  const tId = targetId;
  const sType = graph.value.getElementType(sId);

  // 3. 校验：节点连节点，框连框
  if (sType !== targetType) {
    ElMessage.warning('禁止跨类型连接');
    graph.value.setElementState(sId, []);
    sourceNodeId.value = null;
    return;
  }

  // 4. 查找现有边
  const allEdges = graph.value.getEdgeData();
  const existingEdge = allEdges.find(
    e => (e.source === sId && e.target === tId) || (e.source === tId && e.target === sId)
  );

  if (existingEdge) {
    // --- 逻辑 A: 删除连线 ---
    const edgeIdFromBackend = existingEdge.data?.edgeid;
    if (!edgeIdFromBackend) {
      ElMessage.warning('正在同步数据，请稍后再试');
      return;
    }

    try {
      const res = await request.evaluation.post('/evaluation/lines/delete', [edgeIdFromBackend]);
      if (res.code === 200) {
        graph.value.removeData({ edges: [existingEdge.id] });
        graph.value.draw();
        ElMessage.success('已移除连线');
      }
    } catch (err) {
      ElMessage.error('删除请求失败');
    }
  } else {
    // --- 逻辑 B: 创建连线 ---
    const sElement = graph.value.getElementData(sId);
    const tElement = graph.value.getElementData(tId);
    const postData = {
      startunitid: sElement.data.unitid,
      startkwaid: sElement.data.kwaid,
      endunitid: tElement.data.unitid,
      endkwaid: tElement.data.kwaid
    };

    try {
      const res = await request.evaluation.post('/evaluation/lines/create', postData);

      if (res.code === 200) {
        // 后端不返回 id，我们先生成一个临时的前端 id 渲染出来
        const tempEdgeId = `edge-${Date.now()}`;
        graph.value.addData({
          edges: [
            {
              id: tempEdgeId,
              source: sId,
              target: tId,
              data: {
                ...postData,
                edgeid: null // 暂时为空，等会儿同步
              }
            }
          ]
        });
        graph.value.draw();
        ElMessage.success('已建立连线');

        // 【关键步骤】异步去后端找回这个新创建的 ID
        syncBackendId(tempEdgeId, postData);
      }
    } catch (err) {
      ElMessage.error('建立连线失败');
    }
  }

  // 重置
  graph.value.setElementState(sId, []);
  sourceNodeId.value = null;
};

/**
 * 辅助函数：去后端同步边 ID
 * 防止因为后端创建不返回 ID 导致无法删除
 */
const syncBackendId = async (frontendId: string, params: any) => {
  try {
    // 请求全量边列表
    const res = await request.evaluation.get('/evaluation/lines');
    if (res.code === 200 && Array.isArray(res.data)) {
      // 在列表中根据起点和终点匹配刚刚创建的那条线
      const match = res.data.find(
        b =>
          b.startkwaid === params.startkwaid &&
          b.endkwaid === params.endkwaid &&
          b.startunitid === params.startunitid &&
          b.endunitid === params.endunitid
      );

      if (match && match.id) {
        // 更新画布中这条边的元数据
        graph.value?.updateData('edge', {
          id: frontendId,
          data: { edgeid: match.id }
        });
        console.log('ID 同步成功:', match.id);
      }
    }
  } catch (err) {
    console.error('同步 ID 失败', err);
  }
};

// --- 文本换行工具 ---
const fittingString = (str: string = '', maxWidth: number, fontSize: number) => {
  let currentWidth = 0;
  let res = '';
  const pattern = /[\u4E00-\u9FA5]/;
  str.split('').forEach(letter => {
    currentWidth += pattern.test(letter) ? fontSize : fontSize / 2;
    if (currentWidth > maxWidth) {
      res += '\n';
      currentWidth = pattern.test(letter) ? fontSize : fontSize / 2;
    }
    res += letter;
  });
  return res;
};

// --- 数据加载逻辑 ---
const fetchData = async () => {
  try {
    const [roleRes, treeRes, edgeRes] = await Promise.all([
      request.evaluation.get('/evaluation/attainment'),
      request.evaluation.get('/evaluation/knowledgeUnit/getKnowledgeUnitTree'),
      request.evaluation.get('/evaluation/lines')
    ]);

    isCourseManager.value = roleRes.data?.isCourseManager || false;

    // 递归解析 Combo 和 Node
    const parseData = (data: any[], parentComboId?: string) => {
      data.forEach(item => {
        const cId = `combo-${item.id}`;
        combos.value.push({
          id: cId,
          data: { label: fittingString(item.name, 120, 14) },
          parentId: parentComboId
        });

        item.kwas?.forEach((node: any) => {
          const nId = `n-${nodesIdIdx++}`;
          nodes.value.push({
            id: nId,
            combo: cId,
            data: {
              unitid: node.unitid,
              kwaid: node.kwaid,
              label: fittingString(node.name, 80, 12),
              status: node.status
            },
            style: {
              fill: node.status === 1 ? COLORS.achieved : COLORS.pending,
              stroke: '#fff',
              lineWidth: 2
            }
          });
          nodesMap.set(JSON.stringify([node.unitid, node.kwaid]), nId);
        });

        if (item.children?.length) parseData(item.children, cId);
      });
    };

    if (treeRes.code === 200) parseData(treeRes.data);

    // 解析 Edge
    if (edgeRes.code === 200) {
      edgeRes.data.forEach((edge: any) => {
        const source = nodesMap.get(JSON.stringify([edge.startunitid, edge.startkwaid]));
        const target = nodesMap.get(JSON.stringify([edge.endunitid, edge.endkwaid]));
        if (source && target) {
          edges.value.push({
            id: `edge-${edgesIdIdx++}`,
            source,
            target,
            data: { ...edge, edgeid: edge.id }
          });
        }
      });
    }
  } catch (error) {
    ElMessage.error('数据初始化失败');
  }
};

// --- G6 5.0 初始化 ---
const initGraph = () => {
  // 使用 ref 而不是 getElementById，确保在 Vue 这里的引用是稳定的
  const container = containerRef.value;
  if (!container || container.clientWidth === 0) {
    console.warn('G6 Container 宽度为0，等待重试...');
    return;
  }

  // 如果已经有实例了，先销毁（防止热更新重复创建）
  if (graph.value) {
    graph.value.destroy();
  }

  graph.value = new Graph({
    container: container,
    width: container.clientWidth,
    height: container.clientHeight || 600, // 确保高度不为0
    data: {
      nodes: nodes.value,
      edges: edges.value,
      combos: combos.value
    },
    // 5.0 的全局配置
    node: {
      type: 'circle', // 明确指定节点类型
      style: {
        size: 26,
        labelText: (d: any) => d.data.label,
        labelPlacement: 'bottom',
        fill: (d: any) => (d.data.status === 1 ? COLORS.achieved : COLORS.pending)
      }
    },
    combo: {
      type: 'rect', // 明确指定为矩形
      style: {
        padding: [40, 20, 20, 20],
        fill: COLORS.comboFill,
        stroke: COLORS.comboStroke,
        radius: 4,
        labelText: (d: any) => d.data.label,
        labelPlacement: 'top'
      }
    },
    edge: {
      type: 'quadratic',
      style: {
        stroke: COLORS.edge,
        endArrow: true
      }
    },
    layout: {
      type: 'combo-combined',
      spacing: 60,
      comboPadding: 10
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    autoFit: 'view' // 自动缩放以适应视口
  });

  graph.value.on('node:click', e => {
    // 保护6：确保点击的是元素而不是背景
    if (e.target && e.target.id) {
      handleNodeClick(e.target.id, 'node');
    }
  });

  graph.value.on('combo:click', e => {
    if (e.target && e.target.id) {
      handleNodeClick(e.target.id, 'combo');
    }
  });

  // 渲染并监听
  graph.value.render();
};

// --- 工具栏动作 ---
const handleFitView = () => graph.value?.zoomTo(1, { duration: 500 });
const handleZoom = (ratio: number) => {
  const current = graph.value?.getZoom() || 1;
  graph.value?.zoomTo(current * ratio, { duration: 300 });
};

// --- 生命周期 ---
onMounted(async () => {
  await fetchData(); // 1. 等待接口返回
  loading.value = false; // 2. 关闭加载状态（此时 Vue 开始渲染 container）

  if (!isEmpty.value) {
    // 3. 关键：等待 Vue 将 v-show/v-if 中的 DOM 真正渲染出来
    await nextTick();

    // 4. 稳妥起见，如果还是 0，尝试延迟一下或者监听尺寸
    const checkAndInit = () => {
      if (containerRef.value && containerRef.value.clientWidth > 0) {
        initGraph();
      } else {
        // 如果容器还没准备好，等待 100ms 重试
        setTimeout(checkAndInit, 100);
      }
    };
    checkAndInit();
  }
});

onUnmounted(() => graph.value?.destroy());
</script>

<style scoped>
.op-tip {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border: 1px solid #1890ff;
}

.graph-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f8fafc;
}
.g6-container {
  width: 100vw;
  height: calc(100vh - 120px);
}
.graph-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 15px;
}
.graph-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin: 4px 0;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}
.dot.achieved {
  background: v-bind('COLORS.achieved');
}
.dot.pending {
  background: v-bind('COLORS.pending');
}
.role-tag {
  font-weight: bold;
}
</style>
