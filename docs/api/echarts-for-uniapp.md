# echarts-for-uniapp 使用说明

## 依赖安装

```bash
npm install echarts-for-uniapp --save
```

## 组件注册

无需手动注册，已在 pages.json usingComponents 配置：
```json
"usingComponents": {
  "ec-canvas": "echarts-for-uniapp/ec-canvas"
}
```

## 基本用法

```vue
<template>
  <ec-canvas :option="chartOption" />
</template>
<script setup>
import { ref } from 'vue';
const chartOption = ref({
  title: { text: '任务完成趋势', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['完成任务', '总任务'], bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { type: 'value', minInterval: 1 },
  series: [
    { name: '完成任务', type: 'line', data: [], itemStyle: { color: '#8477fa' } },
    { name: '总任务', type: 'line', data: [], itemStyle: { color: '#ff9c6e' } }
  ]
});
</script>
```

## 注意事项
- 兼容H5、微信小程序、App。
- option 数据变化会自动刷新图表。
- 不再需要自定义 ec-canvas 目录。
- 复杂交互建议参考官方文档：https://github.com/ecomfe/echarts-for-uniapp

</rewritten_file> 