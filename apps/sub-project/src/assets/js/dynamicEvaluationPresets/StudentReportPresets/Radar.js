import {
  toolbox,
  timeline,
  tooltip,
  graphicTitle
} from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';

// TODO:性能优化每一次获取的数据都可以存起来，用timeline组件进行展示，也就是只有最新的数据需要请求拿到，之后的数据都可以存起来

export const radarOption = (options, indicator, expected) => ({
  toolbox,
  // 图例
  legend: {
    data: ['专业平均值', '个人评价值'],
    left: 'center' // 图例水平居中
  },
  // 时间轴
  graphic: {
    ...graphicTitle
  },

  // 提示框
  tooltip: {
    ...tooltip,
    appendToBody: true,
    extraCssText: 'z-index: 9999 !important;'
  },
  // 雷达图配置
  radar: {
    // 雷达图的基本配置
    indicator
  },

  // 初始值
  series: [
    {
      name: '能力评价',
      type: 'radar',
      data: [
        {
          value: expected,
          name: '专业平均值',
          areaStyle: {
            color: 'rgba(0, 0, 255, 0.4)' // 期望值的颜色
          }
        },
        {
          value: options,
          name: '个人评价值',
          areaStyle: {
            color: 'rgba(0, 255, 0, 0.4)' // 个人能力值的颜色
          }
        }
      ]
    }
  ]
  // series: [
  //   {
  //     name: '专业平均值',
  //     type: 'radar',
  //     data: expected,
  //     areaStyle: {
  //       color: 'rgba(0, 0, 255, 0.4)' // 期望值的颜色
  //     }
  //   },
  //   {
  //     name: '个人评价值',
  //     type: 'radar',
  //     data: options, // 初始数据为空，依赖时间轴切换
  //     areaStyle: {
  //       color: 'rgba(0, 255, 0, 0.4)' // 个人能力值的颜色
  //     }
  //   }
  // ]

  // 时间轴上数据展示
});
