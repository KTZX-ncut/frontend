<template>
  <Links
    v-if="links.length && nodes.length"
    title="2D图谱"
    :sendlink="links"
    :linkNodes="nodes"
    @nodeHover="handleHover"
    @nodeMove="handleMove"
    @nodeOut="handleOut"
    @nodeClick="handleNodeClick"
    @linkCreated="handleLinkCreated"
    @linkRemoved="handleLinkRemoved"
  />
</template>

<script setup lang="ts">
// @ts-ignore
import { Links } from '@ui';
// @ts-ignore
import type { LinkNode, Link } from '@ui/src/links/data';
// @ts-ignore
import { tooltip } from '@ui/src/links/data';
import { onMounted, ref, watch } from 'vue';
import useVisual from '../../../stores/dynamicEvaluation/useVisual';
import { storeToRefs } from 'pinia';

const { fetchKnowledge } = useVisual();
const { knowledgeList } = storeToRefs(useVisual());

const links = ref<Array<Link>>([]);
const nodes = ref<Array<LinkNode>>([]);

const handleHover = (node: LinkNode, event) => {
  tooltip
    .html(
      `<strong>${node.name}</strong><br/>${node.type === 'subject' ? '得分' : '权重'}: ${
        node.type === 'subject' ? node.datavalue : node.status
      }`
    )
    .style('opacity', '1')
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY + 10}px`);
};

const handleMove = (node: LinkNode, event) => {
  tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`);
};

const handleOut = (node: LinkNode, event) => {
  tooltip.style('opacity', '0');
};

// 处理节点点击事件
const handleNodeClick = (node: LinkNode, event?: MouseEvent) => {
  console.log('节点被点击:', node.name, node.id, event);
  // 可以在这里添加节点点击后的业务逻辑
  // 比如显示节点详细信息、高亮相关节点等
};

// 处理连线创建事件
const handleLinkCreated = (newLink: Link) => {
  console.log('新连线创建:', newLink);

  // 找到源节点和目标节点
  const sourceNode = nodes.value.find(
    (n: LinkNode) =>
      n.id === (typeof newLink.source === 'string' ? newLink.source : newLink.source.id)
  );
  const targetNode = nodes.value.find(
    (n: LinkNode) =>
      n.id === (typeof newLink.target === 'string' ? newLink.target : newLink.target.id)
  );

  if (sourceNode && targetNode) {
    console.log(`成功创建连线: ${sourceNode.name} → ${targetNode.name}`);

    // 显示创建成功的提示
    showSuccessMessage(`成功创建连线: ${sourceNode.name} → ${targetNode.name}`);

    // 可以在这里调用API保存连线
    // await saveLinkToBackend(newLink);
  }
};

// 处理连线删除事件
const handleLinkRemoved = (data: { source: LinkNode; target: LinkNode; link: Link }) => {
  console.log('连线被删除:', data);

  // 显示删除成功的提示
  showDeleteMessage(`已删除连线: ${data.source.name} → ${data.target.name}`);

  // 可以在这里调用API删除后端数据
  // await deleteLinkFromBackend(data.link);
};

// 显示成功消息的辅助函数
const showSuccessMessage = (message: string) => {
  // 创建一个简单的提示元素
  const toast = document.createElement('div');
  toast.className = 'link-creation-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    font-size: 14px;
    animation: slideInRight 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  // 3秒后自动移除
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// 显示删除消息的辅助函数
const showDeleteMessage = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'link-deletion-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    font-size: 14px;
    animation: slideInRight 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  // 3秒后自动移除
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

onMounted(async () => {
  await fetchKnowledge();
  knowledgeList.value.forEach((item, index) => {
    if (item.kwas) {
      item.kwas.map(kwa => {
        links.value.push({
          source: kwa.id,
          target: item.id,
          value: index,
          type: 'existing'
        });
        nodes.value.push({ ...kwa, type: 'kwa', show: false });
      });
    }
    nodes.value.push({ ...item, type: 'subject', show: true });
  });
});
</script>

<style lang="less">
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
</style>
