// echarts工具箱
const toolbox = {
  show: true,
  feature: {
    dataView: {
      readOnly: false,
      title: '数据视图', // 修改按钮的文字为中文
      lang: ['数据视图', '关闭', '刷新'] // 定义数据视图窗口的文字
    },

    restore: {
      title: '还原'
    },
    saveAsImage: {
      title: '保存为图片'
    }
  }
};

// 假图例
const graphicLegend = {
  type: 'group', // 使用分组容器
  // left: '5%', // 整体分组距离左侧的距离
  top: '2%', // 整体分组距离顶部的距离
  children: [
    // 优
    {
      type: 'circle',
      left: '0', // 第一个圆形的水平位置
      top: '0', // 圆形的垂直位置
      shape: {
        cx: 5, // 圆心 X 坐标
        cy: 8, // 圆心 Y 坐标
        r: 5 // 半径
      },
      style: {
        fill: '#90ee90' // 圆形颜色（绿色）
      }
    },
    {
      type: 'text',
      left: '15', // 第一个文本在最左侧
      top: '0',
      style: {
        text: '优',
        fill: '#90ee90', // 绿色
        font: 'bold 16px sans-serif'
      }
    },
    // 良
    {
      type: 'circle',
      left: '50', // 第一个圆形的水平位置
      top: '0', // 圆形的垂直位置
      shape: {
        cx: 5, // 圆心 X 坐标
        cy: 8, // 圆心 Y 坐标
        r: 5 // 半径
      },
      style: {
        fill: '#4876ff' // 圆形颜色（绿色）
      }
    },
    {
      type: 'text',
      left: '65', // 与前一个文本的水平间距
      top: '0',
      style: {
        text: '良',
        fill: '#4876ff', // 蓝色
        font: 'bold 16px sans-serif'
      }
    },
    // 中
    {
      type: 'circle',
      left: '100', // 第一个圆形的水平位置
      top: '0', // 圆形的垂直位置
      shape: {
        cx: 5, // 圆心 X 坐标
        cy: 8, // 圆心 Y 坐标
        r: 5 // 半径
      },
      style: {
        fill: '#ffff00' // 圆形颜色（绿色）
      }
    },
    {
      type: 'text',
      left: '115', // 与前一个文本的水平间距
      top: '0',
      style: {
        text: '中',
        fill: '#ffff00', // 黄色
        font: 'bold 16px sans-serif'
      }
    },
    // 差
    {
      type: 'circle',
      left: '150', // 第一个圆形的水平位置
      top: '0', // 圆形的垂直位置
      shape: {
        cx: 5, // 圆心 X 坐标
        cy: 8, // 圆心 Y 坐标
        r: 5 // 半径
      },
      style: {
        fill: '#fb9e94' // 圆形颜色（绿色）
      }
    },
    {
      type: 'text',
      left: '165', // 与前一个文本的水平间距
      top: '0',
      style: {
        text: '差',
        fill: '#fb9e94', // 红色
        font: 'bold 16px sans-serif'
      }
    },
    // 无
    {
      type: 'circle',
      left: '200', // 第一个圆形的水平位置
      top: '0', // 圆形的垂直位置
      shape: {
        cx: 5, // 圆心 X 坐标
        cy: 8, // 圆心 Y 坐标
        r: 5 // 半径
      },
      style: {
        fill: '#cfcfcf' // 圆形颜色（绿色）
      }
    },
    {
      type: 'text',
      left: '215', // 与前一个文本的水平间距
      top: '0',
      style: {
        text: '无',
        fill: '#cfcfcf', // 灰色
        font: 'bold 16px sans-serif'
      }
    }
  ]
};

const graphicTitle = {
  type: 'text',
  left: 'left', // 将文本框放置在右侧
  top: 'top', // 将文本框放置在底部
  style: {
    text: '', // TODO数据产生后，将会存储到store中更好处理
    fill: '#333', // 设置文本颜色
    font: '14px sans-serif', // 设置字体和大小
    align: 'right', // 文本右对齐
    verticalAlign: 'bottom', // 文本底部对齐
    padding: [10, 10, 20, 20] // 可以调整文本框的内边距来防止文本被切割
  }
};

// 时间轴
const timeline = timelineData => ({
  axisType: 'category', // 时间轴类型为分类
  autoPlay: false, // 自动播放
  playInterval: 2000, // 自动播放间隔，单位：毫秒
  data: timelineData, // 时间节点
  controlStyle: {
    showPlayBtn: false, // 隐藏播放按钮
    showPrevBtn: true, // 显示上一页按钮
    showNextBtn: true // 显示下一页按钮
  },
  tooltip: {
    trigger: 'item',
    formatter: function (value, index) {
      return '第' + value + '次作业';
    }
  },
  checkpointStyle: {
    symbol: 'diamond', // 设置时间节点符号样式
    symbolSize: 16, // 设置时间节点符号大小
    color: '#b7feb7' // 时间节点颜色
  },
  // 样式设定
  bottom: '-4%'
});

// 图例
const tooltip = {
  trigger: 'item'
  // appendToBody: true,
  // extraCssText: 'z-index: 9999 !important;'
};

// x轴文字斜体
const axisLabel = {
  interval: 0,
  rotate: 45
};

export { toolbox, graphicLegend, timeline, tooltip, graphicTitle, axisLabel };
