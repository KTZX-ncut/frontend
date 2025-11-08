<template>
  <div class="links-container">
    <h3>{{ title ? title : 'D3 Links Visualization' }}</h3>
    <!-- 添加使用提示 -->
    <div v-if="isCreatingLink" class="creation-hint">
      <span class="hint-text">🔗 点击另一个节点创建连线，或点击空白区域取消</span>
    </div>
    <div v-else class="usage-hint">
      <span class="hint-text">💡 点击任意节点开始创建连线 | 点击已连线的节点可删除连线</span>
    </div>
    <div
      class="h-[100vh] border-[#ddd] radius-[8px] overflow-hidden bg-[#f9f9f9]"
      ref="chartContainer"
    ></div>
  </div>
</template>

<script setup lang="ts">
import d3 from '../../utils/d3';
import { onMounted, onUnmounted, ref, toRefs, watch } from 'vue';
import { Link, LinkNode } from './data';
import { nextTick } from 'vue';

const props = defineProps<{
  title: string;
  sendlink: Link[];
  linkNodes: LinkNode[];
}>();

const { title, sendlink, linkNodes } = toRefs(props);

const emit = defineEmits<{
  (e: 'nodeClick', node: LinkNode, event?: MouseEvent): void;
  (e: 'nodeHover', node: LinkNode, event?: MouseEvent): void;
  (e: 'nodeMove', node: LinkNode, event?: MouseEvent): void;
  (e: 'nodeOut', node: LinkNode, event?: MouseEvent): void;
  (e: 'linkCreated', link: Link): void; // 新增：连线创建事件
  (e: 'linkRemoved', data: { source: LinkNode; target: LinkNode; link: Link }): void; // 新增：连线删除事件
}>();

if (!(sendlink.value && sendlink.value.length && linkNodes.value && linkNodes.value.length)) {
  throw new Error('sendlink和linkNodes数组不能为空！');
}

// 添加响应式数据来管理连线创建状态
console.log('sendlink.value', sendlink.value);
const links = ref<Link[]>([...sendlink.value]);
const selectedNodes = ref<LinkNode[]>([]); // 存储选中的节点
const isCreatingLink = ref(false); // 是否正在创建连线

const types = Array.from(new Set(links.value.map(d => d.value)));
const chartContainer = ref<HTMLDivElement | null>();
const width = 1000;
const height = 1000;

const linkArc = (d: Link) => {
  const s = d.source as unknown as LinkNode;
  const t = d.target as unknown as LinkNode;
  const r = Math.hypot(t.x! - s.x!, t.y! - s.y!);
  return `
    M${s.x},${s.y}
    A${r},${r} 0 0,1 ${t.x},${t.y}
  `;
};

const color = d3.scaleOrdinal(types, d3.schemeCategory10);

// 创建新连线的函数
const createLink = (source: LinkNode, target: LinkNode) => {
  console.log(source.id);
  console.log(target.id);
  // 检查是否已存在相同的连线
  const existingLinkIndex = links.value.findIndex(
    link =>
      (link.source === source.id || (link.source as LinkNode).id === source.id) &&
      (link.target === target.id || (link.target as LinkNode).id === target.id)
  );
  console.log('existingLinkIndex', existingLinkIndex);
  const removedLink = links.value[existingLinkIndex];
  if (existingLinkIndex !== -1) {
    links.value = [
      ...links.value.slice(0, existingLinkIndex),
      ...links.value.slice(existingLinkIndex + 1)
    ];
    console.log('links.value', links.value);
    emit('linkRemoved', { source, target, link: removedLink });
    showDeleteSuccessToast(source, target);
    return 'removed';

    return false;
  }

  // 创建新连线
  const newLink: Link = {
    source: source.id,
    target: target.id,
    value: 1,
    type: 'user-created' // 用户创建的连线类型
  };

  links.value.push(newLink);
  emit('linkCreated', newLink);
  return true;
};

// 重置选中状态
const resetSelection = () => {
  selectedNodes.value = [];
  isCreatingLink.value = false;
};

const drag = (simulation: d3.Simulation<LinkNode, Link>) => {
  function dragstarted(event: any, d: LinkNode) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event: any, d: LinkNode) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event: any, d: LinkNode) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;

    // 如果正在创建连线，清除状态
    if (isCreatingLink.value) {
      resetSelection();
    }
    d3.select(event.currentTarget)
      .select('circle')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);
  }

  return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
};

const initialize = () => {
  const nodes = linkNodes.value.map(d => Object.create(d));

  // 使用响应式的links数据
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3.forceLink(links.value).id(d => d.id)
    )
    .force('charge', d3.forceManyBody().strength(-400))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  const svg = d3
    .create('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .style('font', '12px sans-serif');

  const g = svg.append('g').attr('class', 'everything');

  svg
    .append('defs')
    .selectAll('marker')
    .data([...types, 'user-created']) // 添加用户创建连线类型
    .join('marker')
    .attr('id', d => `arrow-${d}`)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 15)
    .attr('refY', -0.5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', color)
    .attr('d', 'M0,-5L10,0L0,5');

  // 连线选择器（需要能够动态更新）
  let linkSelection = g
    .append('g')
    .attr('fill', 'none')
    .attr('stroke-width', 1.5)
    .selectAll('path');

  const getLinkKey = (d: any) => {
    const s = typeof d.source === 'object' ? d.source.id : d.source;
    const t = typeof d.target === 'object' ? d.target.id : d.target;
    console.log(`${s}-${t}`);
    return `${s}-${t}`;
  };

  // 更新连线函数
  const updateLinks = () => {
    const linkData = links.value.map(d => Object.create(d));
    console.log('linkData', linkData);
    linkSelection = linkSelection.data(linkData, d => getLinkKey(d));
    console.log(linkSelection.exit());
    console.log('exit count', linkSelection.exit().size());
    linkSelection.exit().remove();

    const linkEnter = linkSelection
      .enter()
      .append('path')
      .attr('stroke', d => color(d.value))
      .attr('marker-end', d => `url(${new URL(`#arrow-${d.type}`, location)})`);
    linkSelection = linkSelection.merge(linkEnter as any);
  };

  // 初始更新连线
  updateLinks();

  const node = g
    .append('g')
    .attr('fill', 'currentColor')
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .on('click', (event: MouseEvent, d: LinkNode) => {
      event.stopPropagation();

      if (!isCreatingLink.value) {
        // 第一次点击，开始创建连线
        selectedNodes.value = [d];
        isCreatingLink.value = true;

        // 高亮选中的节点
        d3.select(event.currentTarget)
          .select('circle')
          .attr('stroke', '#ff6b6b')
          .attr('stroke-width', 3);
      } else {
        // 第二次点击，创建连线或选择新节点
        const lastSelected = selectedNodes.value[0];

        if (lastSelected.id !== d.id) {
          // 创建或删除连线
          const result = createLink(lastSelected, d);
          if (result) {
            updateLinks(); // 更新连线显示
            if (visualization && visualization.updateLinks) {
              visualization.updateLinks();
              // 重新计算力导向
              if (visualization.simulation) {
                visualization.simulation.force('link').links(links.value);
                visualization.simulation.alpha(0.3).restart();
              }
            }
            resetSelection();

            // 重置所有节点样式
            g.selectAll('circle').attr('stroke', 'white').attr('stroke-width', 1.5);
          } else if (result === 'removed') {
            // 连线被删除
            updateLinks(); // 更新连线显示
            if (visualization && visualization.updateLinks) {
              visualization.updateLinks();
              // 重新计算力导向
              if (visualization.simulation) {
                visualization.simulation.force('link').links(links.value);
                visualization.simulation.alpha(0.3).restart();
              }
            }
            resetSelection();

            // 重置所有节点样式
            g.selectAll('circle').attr('stroke', 'white').attr('stroke-width', 1.5);
          }
        } else {
          // 点击同一个节点，取消选择
          resetSelection();

          // 重置所有节点样式
          g.selectAll('circle').attr('stroke', 'white').attr('stroke-width', 1.5);
        }
      }

      emit('nodeClick', d, event);
    })
    .on('mouseover', (event: MouseEvent, d: LinkNode) => {
      emit('nodeHover', d, event);
    })
    .on('mousemove', (event: MouseEvent, d: LinkNode) => {
      emit('nodeMove', d, event);
    })
    .on('mouseout', (event: MouseEvent, d: LinkNode) => {
      emit('nodeOut', d, event);
    });

  node.append('circle').attr('stroke', 'white').attr('stroke-width', 1.5).attr('r', 4);

  node.append('title').text(d => d.name);

  const textElems = g
    .append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => (d.show ? d.name : null))
    .attr('font-size', 12)
    .call(drag(simulation));

  textElems.append('title').text(d => d.id);

  // 添加点击空白区域取消选择的功能
  svg.on('click', (event: MouseEvent) => {
    if (event.target === svg.node() || event.target === g.node()) {
      resetSelection();

      // 重置所有节点样式
      g.selectAll('circle').attr('stroke', 'white').attr('stroke-width', 1.5);
    }
  });

  simulation.on('tick', () => {
    // 更新连线路径
    g.selectAll('path').attr('d', linkArc);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
    textElems.attr('x', d => d.x + 10).attr('y', d => d.y);
  });

  function zoomed({ transform }: { transform: any }) {
    g.attr('transform', transform);
  }

  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [width, height]
      ])
      .scaleExtent([0, 8])
      .on('zoom', zoomed)
  );

  if (chartContainer.value) {
    chartContainer.value.appendChild(svg.node() as Node);
  }

  return { svgNode: svg.node(), simulation, updateLinks };
};

let visualization: any = null;

onMounted(() => {
  visualization = initialize();
});

onUnmounted(() => {
  if (visualization && visualization.simulation) {
    visualization.simulation.stop();
  }
});

// 检查删除结果的辅助函数
const checkDeleteResult = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ shouldDelete: false }); // 默认返回 false
    }, 100);
  });

// 删除成功提示
const showDeleteSuccessToast = (source: LinkNode, target: LinkNode) => {
  const toast = document.createElement('div');
  toast.className = 'delete-success-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(220, 53, 69, 0.15);
    z-index: 1002;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  toast.innerHTML = `
    <span class="toast-icon">✓</span>
    <span class="toast-message">成功删除连线</span>
    <span class="toast-nodes">${source.name} → ${target.name}</span>
  `;

  document.body.appendChild(toast);

  // 3.5秒后自动移除
  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3500);
};

const dialogStyles = document.createElement('style');
dialogStyles.textContent = `
  .link-delete-dialog {
    animation: dialogFadeIn 0.3s ease-out;
  }

  .dialog-overlay {
    animation: overlayFadeIn 0.2s ease-out;
  }

  .dialog-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px 16px 0 0 0;
    padding: 16px 20px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
  }

  .dialog-icon {
    font-size: 20px;
    opacity: 0.8;
  }

  .dialog-message {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin: 12px 0;
  }

  .node-name {
    color: #dc3545;
    font-weight: 500;
  }

  .dialog-link-info {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 8px;
    margin: 8px 0;
    font-size: 12px;
    border: 1px solid rgba(220, 53, 69, 0.1);
  }

  .link-type {
    color: #666;
    font-size: 12px;
  }

  .link-value {
    color: #495057;
    font-weight: 600;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
    height: 40px;
  }

  .btn-cancel {
    background: #6c757d;
    color: white;
    border-color: #6c757d;
  }

  .btn-cancel:hover {
    background: #5a6268;
    border-color: #5a6268;
  }

  .btn-confirm {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
  }

  .btn-confirm:hover {
    background: #c82333;
    border-color: #c82333;
  }

  .btn-icon {
    font-size: 16px;
    margin-right: 4px;
  }

  .btn-text {
    font-weight: 500;
  }

  .btn-removing {
    animation: btnPulse 0.6s ease-in-out infinite;
  }

  .btn-cancelling {
    animation: btnShake 0.5s ease-in-out;
  }

  .delete-success-toast {
    animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .delete-success-toast.hiding {
    animation: slideOutRight 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53);
    opacity: 0;
    transform: translateX(100%);
  }

  @keyframes dialogFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes overlayFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes btnPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes btnShake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 90% {
      transform: translateX(-2px);
    }
    20%, 80% {
      � transform: translateX(4px);
    }
    30%, 70% {
      transform: translateX(-1px);
    }
    40%, 60% {
      transform: translateX(0);
    }
    50%, 50% {
      transform: translateX(1px);
    }
    60%, 40% {
      transform: translateX(-1px);
    }
    70%, 30% {
      transform: transform: translateX(-1px);
    }
    80%, 20% {
      transform: translateX(0);
    }
    90%, 10% {
      transform: transform: translateX(-1px);
    }
    100%, 0% {
      transform: translateX(0px);
    }
  }
  }
  `;

document.head.appendChild(dialogStyles);

// 强制更新函数
const forceUpdateLinksAndVisualization = () => {
  // 立即触发Vue响应式更新
  links.value = [...links.value];
  nextTick(() => {
    if (visualization && visualization.updateLinks) {
      visualization.updateLinks();
    }
  });
};
</script>

<style lang="less" scoped>
.links-container {
  padding: 20px;

  h3 {
    margin-bottom: 20px;
    color: #333;
  }

  .chart-container {
    height: '1000px';
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background: #f9f9f9;
  }

  .creation-hint,
  .usage-hint {
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 14px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .creation-hint {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .hint-text {
    display: flex;
    align-items: center;
    font-weight: 500;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
}

:deep(.links line) {
  stroke: #999;
  stroke-opacity: 0.6;
}

:deep(.nodes circle) {
  cursor: pointer;
  stroke: #fff;
  stroke-width: 2px;
  transition: all 0.3s ease;

  &:hover {
    stroke-width: 3px;
  }
}

:deep(.labels text) {
  pointer-events: none;
  user-select: none;
}
</style>
