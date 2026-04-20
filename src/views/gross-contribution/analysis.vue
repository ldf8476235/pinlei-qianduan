<template>
  <div class="p-2 gross-contribution-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">毛利贡献率分析</span>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button link type="primary" @click="handleViewDetail">详情</el-button>
          <el-button type="primary" plain class="export-btn">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期毛利贡献率四象限散点图</span>
            </div>
          </template>
          <div ref="scatterChartRef" class="chart-box" />
        </el-card>
      </el-col>

      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">四象限对比变化统计</span>
            </div>
          </template>
          <div class="stack-chart-wrap">
            <div ref="barChartRef" class="chart-box stack-chart" />
            <div ref="barChartRef2" class="chart-box stack-chart" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">四象限异动变化SKU统计</span>
        </div>
      </template>

      <div class="matrix-table-wrap">
        <el-table :data="matrixRows" border class="matrix-table">
          <el-table-column label="对比日期" min-width="130" align="center">
            <template #default="{ row }">
              <span :class="{ 'is-total': row.isTotal }">{{ row.label }}</span>
            </template>
          </el-table-column>
          <el-table-column label="本期" align="center">
            <el-table-column v-for="column in matrixColumns" :key="column.key" :label="column.label" min-width="140" align="center">
              <template #default="{ row }">
                <span :class="['matrix-number', { 'is-total': row.isTotal || column.isTotal, 'is-highlight': true }]">{{ formatCell(row[column.key]) }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card advice-card">
      <template #header>
        <div class="advice-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>

      <ul class="advice-list">
        <li>问题商品占比偏高，当前识别到{{ summaryStats.problemCount }}个问题商品，建议优先处理低销低毛SKU并制定淘汰计划。</li>
        <li>跨象限降级商品当前识别到{{ summaryStats.downgradeCount }}个，需重点跟踪价格、陈列、促销和库存断层风险。</li>
        <li>建议结合四象限角色，持续查看领跑、吸客、利润和问题商品的运营动作。</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup name="GrossContributionAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface ScatterPoint {
  name: string;
  grossRate: number;
  salesShare: number;
}

interface MatrixRow {
  label: string;
  leading: number | string;
  attracting: number | string;
  profit: number | string;
  problem: number | string;
  isTotal?: boolean;
}

interface MatrixColumn {
  key: string;
  label: string;
  highlight?: boolean;
}

const router = useRouter();
const route = useRoute();

const scatterChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const barChartRef2 = ref<HTMLDivElement>();
const scatterChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();
const barChartIns2 = ref<echarts.ECharts>();

const scatterPoints: ScatterPoint[] = [
  { name: '柔顺洗发露', grossRate: 38, salesShare: 14.2 },
  { name: '控油沐浴露', grossRate: 34, salesShare: 12.4 },
  { name: '抑菌洗手液', grossRate: 18, salesShare: 11.8 },
  { name: '便携湿巾', grossRate: 16, salesShare: 9.3 },
  { name: '香氛洗衣液', grossRate: 32, salesShare: 6.2 },
  { name: '家用清洁喷雾', grossRate: 28, salesShare: 4.8 },
  { name: '去污皂', grossRate: 12, salesShare: 3.9 },
  { name: '旅行洗漱套装', grossRate: 9, salesShare: 2.4 }
];

const compareStats = {
  skuShare: {
    current: { leading: 22, attracting: 18, profit: 28, problem: 32 },
    compare: { leading: 24, attracting: 21, profit: 25, problem: 30 }
  },
  salesShare: {
    current: { leading: 46, attracting: 24, profit: 18, problem: 12 },
    compare: { leading: 43, attracting: 27, profit: 17, problem: 13 }
  }
};

const matrixColumns = [
  { key: 'attracting', label: '本期-吸客商品', highlight: true },
  { key: 'profit', label: '本期-利润商品', highlight: true },
  { key: 'problem', label: '本期-问题商品', highlight: true }
];

const matrixRows: MatrixRow[] = [
  { label: '领跑商品', leading: '-', attracting: 6, profit: 3, problem: 1 },
  { label: '吸客商品', leading: '-', attracting: 12, profit: 2, problem: 4 },
  { label: '利润商品', leading: '-', attracting: 3, profit: 18, problem: 2 },
  { label: '问题商品', leading: '-', attracting: 2, profit: 4, problem: 20 },
  { label: '总计', leading: '-', attracting: 23, profit: 27, problem: 27, isTotal: true }
];

const summaryStats = computed(() => {
  const problemCount = scatterPoints.filter((item) => item.grossRate < 20 && item.salesShare < 10).length;
  const downgradeCount = Math.abs(Number(compareStats.skuShare.current.problem || 0) - Number(compareStats.skuShare.compare.problem || 0));
  const problemRate = Number(compareStats.skuShare.current.problem || 0);
  return { problemCount, downgradeCount, problemRate };
});

const loadAnalysisData = async () => {
  // TODO: replace with real backend request for gross contribution analysis.
  await nextTick();
  renderScatterChart();
  renderBarChart();
  renderBarChart2();
};

const handleViewDetail = () => {
  router.push({
    path: '/gross-contribution/analysis/detail',
    query: {
      ...route.query
    }
  });
};

const initScatterChart = () => {
  if (!scatterChartRef.value) return;
  if (!scatterChartIns.value) {
    scatterChartIns.value = echarts.init(scatterChartRef.value);
  }
};

const initBarChart = () => {
  if (!barChartRef.value) return;
  if (!barChartIns.value) {
    barChartIns.value = echarts.init(barChartRef.value);
  }
};

const initBarChart2 = () => {
  if (!barChartRef2.value) return;
  if (!barChartIns2.value) {
    barChartIns2.value = echarts.init(barChartRef2.value);
  }
};

const renderScatterChart = () => {
  initScatterChart();
  if (!scatterChartIns.value) return;

  const xCenter = 22;
  const yCenter = 8;

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = params.data as [number, number, string];
        return `${data[2]}<br/>毛利率：${data[0].toFixed(2)}%<br/>销售额占比：${data[1].toFixed(2)}%`;
      }
    },
    grid: {
      left: 48,
      right: 24,
      top: 24,
      bottom: 42
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 45,
      interval: 5,
      name: '毛利率%',
      nameTextStyle: { color: '#909399' },
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: {
        color: '#606266',
        formatter: (value: number) => `${value}%`
      },
      splitLine: {
        lineStyle: { color: '#ebeef5' }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 20,
      interval: 2,
      name: '销售额占比%',
      nameTextStyle: { color: '#909399' },
      axisLine: { show: false },
      axisLabel: {
        color: '#606266',
        formatter: (value: number) => `${value}%`
      },
      splitLine: {
        lineStyle: { color: '#ebeef5' }
      }
    },
    graphic: [
      { type: 'text', right: 38, top: 18, style: { text: '领跑商品(高销高毛)', fill: '#606266', fontSize: 12 } },
      { type: 'text', left: 42, top: 18, style: { text: '吸客商品(高销低毛)', fill: '#606266', fontSize: 12 } },
      { type: 'text', right: 38, bottom: 42, style: { text: '利润商品(低销高毛)', fill: '#606266', fontSize: 12 } },
      { type: 'text', left: 42, bottom: 42, style: { text: '问题商品(低销低毛)', fill: '#606266', fontSize: 12 } }
    ],
    series: [
      {
        type: 'scatter',
        symbolSize: 12,
        itemStyle: {
          color: '#27b0d6'
        },
        markLine: {
          symbol: 'none',
          label: { show: false },
          lineStyle: {
            color: '#111827',
            type: 'solid',
            width: 1
          },
          data: [{ xAxis: xCenter }, { yAxis: yCenter }]
        },
        data: scatterPoints.map((item) => [item.grossRate, item.salesShare, item.name])
      }
    ]
  };

  scatterChartIns.value.setOption(option, true);
};

const renderBarChart = () => {
  initBarChart();
  if (!barChartIns.value) return;

  const colors = {
    leading: '#27b0d6',
    attracting: '#f06b4f',
    profit: '#b69cff',
    problem: '#e53e3e'
  };

  const option: EChartsOption = {
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: { color: '#606266', fontSize: 13 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        const title = rows[0]?.axisValueLabel || rows[0]?.axisValue || '';
        return [title, ...rows.map((item) => `${item.marker}${item.seriesName}：${Number(item.value).toFixed(2)}%`)].join('<br/>');
      }
    },
    grid: [
      { left: 56, right: 120, top: 30, height: 120 },
      { left: 56, right: 120, top: 210, height: 120 }
    ],
    xAxis: [
      {
        type: 'category',
        gridIndex: 0,
        data: ['本期', '对比日期'],
        axisLine: { lineStyle: { color: '#dcdfe6' } },
        axisLabel: { color: '#606266' }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: ['本期', '对比日期'],
        axisLine: { lineStyle: { color: '#dcdfe6' } },
        axisLabel: { color: '#606266' }
      }
    ],
    yAxis: [
      {
        type: 'value',
        gridIndex: 0,
        min: 0,
        max: 100,
        interval: 20,
        name: 'SKU数占比%',
        nameTextStyle: { color: '#909399' },
        axisLabel: { color: '#606266', formatter: (value: number) => `${value}%` },
        splitLine: { lineStyle: { color: '#ebeef5' } }
      },
      {
        type: 'value',
        gridIndex: 1,
        min: 0,
        max: 100,
        interval: 20,
        name: '销售额占比%',
        nameTextStyle: { color: '#909399' },
        axisLabel: { color: '#606266', formatter: (value: number) => `${value}%` },
        splitLine: { lineStyle: { color: '#ebeef5' } }
      }
    ],
    series: [
      {
        name: '领跑商品',
        type: 'bar',
        stack: 'sku',
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: { color: colors.leading },
        data: [compareStats.skuShare.current.leading, compareStats.skuShare.compare.leading]
      },
      {
        name: '吸客商品',
        type: 'bar',
        stack: 'sku',
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: { color: colors.attracting },
        data: [compareStats.skuShare.current.attracting, compareStats.skuShare.compare.attracting]
      },
      {
        name: '利润商品',
        type: 'bar',
        stack: 'sku',
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: { color: colors.profit },
        data: [compareStats.skuShare.current.profit, compareStats.skuShare.compare.profit]
      },
      {
        name: '问题商品',
        type: 'bar',
        stack: 'sku',
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: { color: colors.problem },
        data: [compareStats.skuShare.current.problem, compareStats.skuShare.compare.problem]
      },
      {
        name: '领跑商品',
        type: 'bar',
        stack: 'sales',
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: { color: colors.leading },
        data: [compareStats.salesShare.current.leading, compareStats.salesShare.compare.leading]
      },
      {
        name: '吸客商品',
        type: 'bar',
        stack: 'sales',
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: { color: colors.attracting },
        data: [compareStats.salesShare.current.attracting, compareStats.salesShare.compare.attracting]
      },
      {
        name: '利润商品',
        type: 'bar',
        stack: 'sales',
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: { color: colors.profit },
        data: [compareStats.salesShare.current.profit, compareStats.salesShare.compare.profit]
      },
      {
        name: '问题商品',
        type: 'bar',
        stack: 'sales',
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: { color: colors.problem },
        data: [compareStats.salesShare.current.problem, compareStats.salesShare.compare.problem]
      }
    ]
  };

  barChartIns.value.setOption(option, true);
};

const renderBarChart2 = () => {
  initBarChart2();
  if (!barChartIns2.value) return;

  const colors = {
    leading: '#27b0d6',
    attracting: '#f06b4f',
    profit: '#b69cff',
    problem: '#e53e3e'
  };

  const option: EChartsOption = {
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: { color: '#606266', fontSize: 13 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        const title = rows[0]?.axisValueLabel || rows[0]?.axisValue || '';
        return [title, ...rows.map((item) => `${item.marker}${item.seriesName}：${Number(item.value).toFixed(2)}%`)].join('<br/>');
      }
    },
    grid: { left: 56, right: 120, top: 20, bottom: 24 },
    xAxis: {
      type: 'category',
      data: ['本期', '对比日期'],
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 20,
      name: '销售额占比%',
      nameTextStyle: { color: '#909399' },
      axisLabel: { color: '#606266', formatter: (value: number) => `${value}%` },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    series: [
      { name: '领跑商品', type: 'bar', stack: 'sales2', itemStyle: { color: colors.leading }, data: [compareStats.salesShare.current.leading, compareStats.salesShare.compare.leading] },
      { name: '吸客商品', type: 'bar', stack: 'sales2', itemStyle: { color: colors.attracting }, data: [compareStats.salesShare.current.attracting, compareStats.salesShare.compare.attracting] },
      { name: '利润商品', type: 'bar', stack: 'sales2', itemStyle: { color: colors.profit }, data: [compareStats.salesShare.current.profit, compareStats.salesShare.compare.profit] },
      { name: '问题商品', type: 'bar', stack: 'sales2', itemStyle: { color: colors.problem }, data: [compareStats.salesShare.current.problem, compareStats.salesShare.compare.problem] }
    ]
  };

  barChartIns2.value.setOption(option, true);
};

const formatCell = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '-';
  return value;
};

const resizeCharts = () => {
  scatterChartIns.value?.resize();
  barChartIns.value?.resize();
  barChartIns2.value?.resize();
};

onMounted(async () => {
  await loadAnalysisData();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  scatterChartIns.value?.dispose();
  barChartIns.value?.dispose();
  barChartIns2.value?.dispose();
});
</script>

<style scoped lang="scss">
.gross-contribution-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card,
.chart-row,
.table-card {
  margin-bottom: 12px;
}

.page-header,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-header-left {
  display: flex;
  align-items: center;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title-line {
  width: 3px;
  height: 16px;
  border-radius: 999px;
  background: var(--el-color-primary);
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-btn {
  border-radius: 8px;
}

.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-box {
  width: 100%;
  height: 360px;
}

.stack-chart-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stack-chart {
  height: 360px;
}

.matrix-table-wrap {
  overflow-x: auto;
}

.matrix-table :deep(.el-table__header th) {
  background: #f2f5f8;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.matrix-table :deep(.cell) {
  font-size: 13px;
}

.matrix-number {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.matrix-number.is-highlight {
  color: #0f766e;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.matrix-number.is-total,
.is-total {
  font-weight: 700;
}

.advice-header {
  background: #f3f4f6;
  margin: -18px -20px 0;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.advice-list {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
  line-height: 1.9;
  font-size: 14px;
}

.advice-card :deep(.el-card__body) {
  background: #f3f4f6;
  border-radius: 10px;
}

.advice-list li + li {
  margin-top: 10px;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-actions {
    width: 100%;
    justify-content: space-between;
  }

  .chart-box {
    height: 320px;
  }
}
</style>
