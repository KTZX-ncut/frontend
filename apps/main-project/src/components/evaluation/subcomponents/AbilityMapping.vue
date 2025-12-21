<template>
  <div
    ref="containerRef"
    id="container"
    v-loading="loading"
    element-loading-text="全息链路实时同步中..."
    element-loading-background="rgba(0, 5, 15, 0.95)"
  >
    <!-- 智慧大屏悬浮弹窗 -->
    <div v-show="showPopup" :style="popupStyle" class="tech-popup">
      <div class="tech-header">
        <span class="tech-icon-dot"></span>
        {{ popupTitle }}
      </div>
      <div class="tech-body">
        <p><span>节点类型:</span> {{ popupType }}</p>
        <p v-if="popupDetail" class="highlight-val"><span>达成数值:</span> {{ popupDetail }}</p>
      </div>
    </div>

    <!-- 图例 -->
    <div class="tech-legend">
      <div class="legend-title">智慧教学全息图例</div>
      <div class="legend-item"><span class="dot target"></span> 课程目标</div>
      <!-- <div class="legend-item"><span class="dot unit"></span> 知识单元</div> -->
      <!-- <div class="legend-item"><span class="dot kwa-s"></span> 已掌握KWA</div> -->
      <div class="legend-item"><span class="dot kwa-f"></span> 关键字 - 能力</div>
      <div class="legend-item"><span class="dot kw"></span> 关键字</div>
      <div class="legend-item"><span class="dot ab"></span> 能力节点</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onMounted, ref, onBeforeUnmount, CSSProperties, nextTick } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import request from '../../../utils/request';
import { ElMessage } from 'element-plus';

// --- 类型声明 ---
interface Kwa {
  kwaid: string;
  name: string;
  status: number;
  unitid?: string;
}
interface KnowledgeUnit {
  id: string;
  name: string;
  kwas: Kwa[];
  processedKwas?: Kwa[];
  children?: KnowledgeUnit[];
}
interface Keyword {
  id: string;
  name: string;
}
interface Ability {
  id: string;
  name: string;
}
interface CourseTarget {
  id: string;
  name: string;
  value?: number;
  kwas: { id: string }[];
}
interface KwaDict {
  id: string;
  keywordid: string;
  abilityid: string;
}

// 连线关系接口
interface ActiveLink {
  line: THREE.Line;
  startObj: THREE.Object3D;
  endObj: THREE.Object3D;
}

// --- 响应式数据 ---
const containerRef = ref<HTMLDivElement | null>(null);
const loading = ref(true);
const showPopup = ref(false);
const popupTitle = ref('');
const popupType = ref('');
const popupDetail = ref('');
const popupStyle = ref<CSSProperties>({});

const rawData = {
  units: [] as KnowledgeUnit[],
  keywords: [] as Keyword[],
  abilities: [] as Ability[],
  targets: [] as CourseTarget[],
  kwadict: [] as KwaDict[]
};

// 存储节点物体（用于动态追踪坐标）
const kwNodeMap = new Map<string, THREE.Object3D>();
const abNodeMap = new Map<string, THREE.Object3D>();
const kwaNodeMap = new Map<string, THREE.Object3D>(); // Key: "kwaid-unitid"
const targetNodeMap = new Map<string, THREE.Object3D>();

// 活跃连线数组
const activeLinks: ActiveLink[] = [];

let scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  controls: OrbitControls,
  raycaster: THREE.Raycaster;
const mouse = new THREE.Vector2();
const layerPlanes: THREE.Mesh[] = [];
const animatedNodes: THREE.Group[] = [];

const COLORS = {
  target: 0xffcc00,
  kwaSuccess: 0x00ffcc,
  kwaFail: 0xff4444,
  kw: 0x00d2ff,
  ab: 0x9d50bb
};

// --- 初始化场景 ---
const initScene = () => {
  if (!containerRef.value) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x00050a);

  camera = new THREE.PerspectiveCamera(
    45,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(30, 30, 45);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  containerRef.value.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const light = new THREE.PointLight(0xffffff, 1.5);
  light.position.set(20, 50, 20);
  scene.add(light);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  raycaster = new THREE.Raycaster();

  const yPositions = [12, 0, -12];
  const layerColors = [0xffaa00, 0x00ccff, 0x6600ff];
  yPositions.forEach((y, i) => {
    const plane = new THREE.Mesh(
      new THREE.CircleGeometry(20, 64),
      new THREE.MeshStandardMaterial({
        color: layerColors[i],
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    plane.rotation.x = Math.PI / 2;
    plane.position.y = y;
    scene.add(plane);
    layerPlanes.push(plane);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(20, 20.3, 64),
      new THREE.MeshBasicMaterial({
        color: layerColors[i],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      })
    );
    plane.add(ring);
  });
};

// --- 渲染逻辑 ---

const renderBottom = (parent: THREE.Mesh) => {
  parent.updateMatrixWorld(true);
  const kwGrid = getGrid(rawData.keywords.length, 12);
  rawData.keywords.forEach((kw, i) => {
    const node = createNode(COLORS.kw, kw.name, '关键字');
    node.position.set(kwGrid[i].x - 6, kwGrid[i].y, 0.4);
    parent.add(node);
    kwNodeMap.set(kw.id, node);
  });

  const abGrid = getGrid(rawData.abilities.length, 12);
  rawData.abilities.forEach((ab, i) => {
    const node = createNode(COLORS.ab, ab.name, '能力维度');
    node.position.set(abGrid[i].x + 6, abGrid[i].y, 0.4);
    parent.add(node);
    abNodeMap.set(ab.id, node);
  });
};

const renderMiddle = (parent: THREE.Mesh) => {
  parent.updateMatrixWorld(true);
  const unitGrid = getGrid(rawData.units.length, 25);
  rawData.units.forEach((unit, i) => {
    const group = new THREE.Group();
    group.position.set(unitGrid[i].x, unitGrid[i].y, 0.2);
    parent.add(group);
    animatedNodes.push(group);

    const plate = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 32),
      new THREE.MeshPhongMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      })
    );
    plate.userData = { type: 'node', name: unit.name, category: '知识单元' };
    group.add(plate);

    const kwas = unit.processedKwas || [];
    const kwaGrid = getGrid(kwas.length, 3.5);
    kwas.forEach((kwa, ki) => {
      const color = kwa.status === 1 ? COLORS.kwaSuccess : COLORS.kwaFail;
      const node = createNode(color, kwa.name, 'KWA知识点');
      node.position.set(kwaGrid[ki].x, kwaGrid[ki].y, 0.3);
      group.add(node);
      kwaNodeMap.set(`${kwa.kwaid}-${unit.id}`, node);
    });
  });
};

const renderTop = (parent: THREE.Mesh) => {
  parent.updateMatrixWorld(true);
  const grid = getGrid(rawData.targets.length, 18);
  rawData.targets.forEach((target, i) => {
    const group = new THREE.Group();
    group.position.set(grid[i].x, grid[i].y, 0);
    parent.add(group);
    animatedNodes.push(group);

    const val = target.value || Math.random() * 5 + 2;
    const displayVal = val.toFixed(2);

    const node = createNode(COLORS.target, target.name, '课程目标');
    node.position.z = -0.5; // 节点上方
    node.userData.detail = displayVal;
    group.add(node);
    targetNodeMap.set(target.id, node);

    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, val, 16),
      new THREE.MeshStandardMaterial({
        color: COLORS.target,
        transparent: true,
        opacity: 0.7,
        emissive: COLORS.target,
        emissiveIntensity: 0.4
      })
    );
    bar.rotation.x = -Math.PI / 2;
    bar.position.z = -(0.5 + val / 2);
    bar.userData = {
      type: 'node',
      name: target.name,
      category: '目标达成分值',
      detail: displayVal
    };
    group.add(bar);
  });
};

// --- 动态连线逻辑 ---
const renderStrictLines = () => {
  activeLinks.length = 0; // 重置连线数组

  // 1. 目标 -> KWA
  rawData.targets.forEach(target => {
    const tNode = targetNodeMap.get(target.id);
    if (!tNode) return;
    target.kwas?.forEach(kRef => {
      rawData.units.forEach(unit => {
        const kNode = kwaNodeMap.get(`${kRef.id}-${unit.id}`);
        if (kNode) createDynamicLink(tNode, kNode, COLORS.target);
      });
    });
  });

  // 2. KWA -> 要素
  rawData.units.forEach(unit => {
    unit.processedKwas?.forEach(kwa => {
      const kNode = kwaNodeMap.get(`${kwa.kwaid}-${unit.id}`);
      const dict = rawData.kwadict.find(d => d.id === kwa.kwaid);
      if (kNode && dict) {
        const kwNode = kwNodeMap.get(dict.keywordid);
        if (kwNode) createDynamicLink(kNode, kwNode, COLORS.kw);
        const abNode = abNodeMap.get(dict.abilityid);
        if (abNode) createDynamicLink(kNode, abNode, COLORS.ab);
      }
    });
  });
};

// 创建动态追踪的线
const createDynamicLink = (startObj: THREE.Object3D, endObj: THREE.Object3D, color: number) => {
  const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const line = new THREE.Line(
    geom,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 })
  );
  scene.add(line);
  activeLinks.push({ line, startObj, endObj });
};

// --- 核心：每一帧更新连线位置 ---
const syncLines = () => {
  const vStart = new THREE.Vector3();
  const vEnd = new THREE.Vector3();

  activeLinks.forEach(link => {
    // 获取两个节点当前瞬时的世界坐标
    link.startObj.getWorldPosition(vStart);
    link.endObj.getWorldPosition(vEnd);

    // 更新线条几何体的顶点数据
    const positions = link.line.geometry.attributes.position.array as Float32Array;
    positions[0] = vStart.x;
    positions[1] = vStart.y;
    positions[2] = vStart.z;
    positions[3] = vEnd.x;
    positions[4] = vEnd.y;
    positions[5] = vEnd.z;

    link.line.geometry.attributes.position.needsUpdate = true;
  });
};

// --- 动画循环 ---
const animate = () => {
  const time = Date.now() * 0.001;
  requestAnimationFrame(animate);

  // 1. 圆盘旋转（父级旋转，带动子物体节点旋转）
  layerPlanes.forEach((p, i) => {
    p.rotation.z += i % 2 === 0 ? 0.0012 : -0.0012;
  });

  // 2. 节点组呼吸浮动（相对于父级局部位移）
  animatedNodes.forEach((group, i) => {
    group.position.z = Math.sin(time + i) * 0.12;
  });

  // 3. 关键：同步连线坐标
  syncLines();

  if (controls) controls.update();
  if (renderer) renderer.render(scene, camera);
};

// --- 生命周期与数据加载 ---

const loadDataAndBuild = async () => {
  try {
    const [resAb, resKw, resUn, resTg, resDict] = await Promise.all([
      request.evaluation.get('/evaluation/getability').catch(() => ({ data: [] })),
      request.evaluation.get('/evaluation/keywords').catch(() => ({ data: [] })),
      request.evaluation
        .get('/evaluation/knowledgeUnit/getKnowledgeUnitTree')
        .catch(() => ({ data: [] })),
      request.evaluation.get('/evaluation/coursetarget').catch(() => ({ data: [] })),
      request.evaluation.get('/evaluation/kwadict').catch(() => ({ data: [] }))
    ]);

    rawData.abilities = resAb?.data || [];
    rawData.keywords = resKw?.data || [];
    rawData.units = resUn?.data || [];
    rawData.targets = resTg?.data || [];
    rawData.kwadict = resDict?.data || [];

    // 数据清洗逻辑
    rawData.units.forEach(u => {
      const combined = u.kwas ? [...u.kwas] : [];
      u.children?.forEach(c => c.kwas?.forEach(k => combined.push({ ...k, unitid: u.id })));
      const map = new Map();
      combined.forEach(k => {
        if (!map.has(k.kwaid)) map.set(k.kwaid, k);
        else if (k.status === 0) map.get(k.kwaid).status = 0;
      });
      u.processedKwas = Array.from(map.values());
    });

    renderBottom(layerPlanes[2]);
    renderMiddle(layerPlanes[1]);
    renderTop(layerPlanes[0]);

    // 初始化连线关系
    renderStrictLines();

    loading.value = false;
  } catch (e) {
    ElMessage.error('系统模型构建失败');
    loading.value = false;
  }
};

const createNode = (color: number, name: string, category: string) => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 16),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 })
  );
  mesh.userData = { type: 'node', name, category };
  return mesh;
};

const getGrid = (count: number, size: number) => {
  const pts: THREE.Vector2[] = [];
  const side = Math.ceil(Math.sqrt(count)) || 1;
  const step = size / side;
  for (let i = 0; i < side; i++) {
    for (let j = 0; j < side; j++) {
      if (pts.length < count) {
        pts.push(new THREE.Vector2((i - (side - 1) / 2) * step, (j - (side - 1) / 2) * step));
      }
    }
  }
  return pts;
};

const onMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster
    .intersectObjects(scene.children, true)
    .find(i => i.object.userData.type === 'node');
  if (hit) {
    const data = hit.object.userData;
    showPopup.value = true;
    popupTitle.value = data.name;
    popupType.value = data.category;
    popupDetail.value = data.detail || '';
    popupStyle.value = { left: `${e.clientX + 20}px`, top: `${e.clientY + 15}px` };
    containerRef.value.style.cursor = 'pointer';
  } else {
    showPopup.value = false;
    containerRef.value.style.cursor = 'default';
  }
};

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    // 检查容器尺寸，如果是0则重试一次
    if (containerRef.value && containerRef.value.clientWidth > 0) {
      startApp();
    } else {
      const timer = setInterval(() => {
        if (containerRef.value && containerRef.value.clientWidth > 0) {
          startApp();
          clearInterval(timer);
        }
      }, 100);
    }
  }, 100);
});
const startApp = () => {
  initScene();
  animate(); // 启动循环
  loadDataAndBuild(); // 加载数据
  containerRef.value?.addEventListener('mousemove', onMouseMove);
  // 启动后强制触发一次 resize 逻辑，确保相机比例完美
  onWindowResize();
};

const onWindowResize = () => {
  if (!containerRef.value || !camera || !renderer) return;
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
};

onBeforeUnmount(() => {
  renderer?.dispose();
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100vh;
  background: #000a14;
  position: relative;
  overflow: hidden;
}
.tech-popup {
  position: fixed;
  background: rgba(0, 20, 40, 0.9);
  border: 1px solid #00f3ff;
  color: #fff;
  padding: 12px 18px;
  min-width: 180px;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 4px;
}
.tech-header {
  font-weight: bold;
  color: #00f3ff;
  font-size: 15px;
  border-bottom: 1px solid rgba(0, 243, 255, 0.3);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.tech-icon-dot {
  width: 6px;
  height: 6px;
  background: #00f3ff;
  margin-right: 8px;
  box-shadow: 0 0 5px #00f3ff;
}
.tech-body p {
  margin: 6px 0;
  font-size: 13px;
}
.tech-body span {
  color: #8899aa;
  margin-right: 8px;
}
.highlight-val {
  color: #ffcc00;
  font-weight: bold;
}
.tech-legend {
  position: absolute;
  left: 25px;
  bottom: 25px;
  background: rgba(0, 15, 30, 0.8);
  padding: 15px;
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 4px;
}
.legend-title {
  color: #00f3ff;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}
.legend-item {
  color: #fff;
  font-size: 12px;
  margin: 5px 0;
  display: flex;
  align-items: center;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}
.target {
  background: #ffcc00;
}
.unit {
  background: #333;
  border: 1px solid #00f3ff;
}
.kwa-s {
  background: #00ffcc;
}
.kwa-f {
  background: #ff4444;
}
.kw {
  background: #00d2ff;
}
.ab {
  background: #9d50bb;
}
</style>
