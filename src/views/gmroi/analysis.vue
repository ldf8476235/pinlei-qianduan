<template>
  <div class="p-2 gmroi-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">GMROI(年毛利回报率)分析</span>
          </div>
          <div class="title-row">
            <span class="category-title">004洗化部</span>
            <el-tag effect="plain" type="success" class="role-tag">本期角色：结构品类</el-tag>
          </div>
        </div>
        <div class="page-header-right">
          <div class="hint-text">该门店范围下品类的预设角色为“结构品类”，预设SKU数为132</div>
          <div class="page-actions">
            <el-button link type="primary" @click="handleViewDetail">详情</el-button>
            <span class="unit-text">金额单位：元</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="14" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期GMROI四象限散点图</span>
            </div>
          </template>
          <div ref="scatterChartRef" class="chart-box large-chart" />
        </el-card>
      </el-col>

      <el-col :lg="10" :md="24" :sm="24" :xs="24">
        <div class="right-stack">
          <el-card shadow="hover" class="page-card chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">本期GMROI区间SKU统计</span>
              </div>
            </template>
            <div ref="pieChartRef" class="chart-box small-chart" />
          </el-card>

          <el-card shadow="hover" class="page-card chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">四象限SKU占比变化统计</span>
              </div>
            </template>
            <div ref="barChartRef" class="chart-box small-chart" />
          </el-card>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">四象限异动变化SKU统计</span>
        </div>
      </template>

      <div class="matrix-table-wrap">
        <el-table :data="matrixRows" border stripe class="matrix-table">
          <el-table-column label="对比日期" min-width="140" align="center">
            <template #default="{ row }">
              <span :class="{ 'is-total': row.isTotal }">{{ row.label }}</span>
            </template>
          </el-table-column>
          <el-table-column v-for="column in matrixColumns" :key="column.key" :label="column.label" min-width="150" align="center">
            <template #default="{ row }">
              <span :class="['matrix-number', { 'is-total': row.isTotal || column.isTotal }]">{{ formatCell(row[column.key]) }}</span>
            </template>
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
        <li><strong>问题商品占比与优化淘汰建议：</strong> 低GMROI问题商品占比较高，建议优先处理长期低回报且库存深的商品，释放陈列与资金占用。</li>
        <li><strong>跨周期象限降级商品风险提醒：</strong> 从成功/吸客象限降级到沉睡或问题象限的商品，应及时复盘价格、库存和促销策略。</li>
        <li><strong>低GMROI商品经营风险预警：</strong> 低周转且低毛利商品会持续拉低整体回报率，需结合门店分布与生命周期做分层管控。</li>
        <li><strong>点击查看商品策略引导文案：</strong> 进入详情页可查看商品清单、经营指标与处理建议，便于门店落地执行。</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup name="GmroiAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface ScatterPoint {
  name: string;
  turnoverRate: number;
  grossRate: number;
}

interface MatrixRow {
  label: string;
  sleeping: number | string;
  attracting: number | string;
  problem: number | string;
  isTotal?: boolean;
}

const router = useRouter();
const route = useRoute();

const scatterChartRef = ref<HTMLDivElement>();
const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const scatterChartIns = ref<echarts.ECharts>();
const pieChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();

const quadrantColors = {
  success: '#27b0d6',
  sleeping: '#f06b4f',
  attracting: '#b69cff',
  problem: '#e53e3e'
};

const scatterPoints: ScatterPoint[] = [
  { name: '柔顺洗发露', turnoverRate: 3.8, grossRate: 36 },
  { name: '控油沐浴露', turnoverRate: 3.4, grossRate: 32 },
  { name: '抑菌洗手液', turnoverRate: 1.4, grossRate: 28 },
  { name: '香氛洗衣液', turnoverRate: 1.8, grossRate: 34 },
  { name: '便携湿巾', turnoverRate: 3.2, grossRate: 15 },
  { name: '家用清洁喷雾', turnoverRate: 0.9, grossRate: 11 },
  { name: '天然香皂', turnoverRate: 2.6, grossRate: 17 },
  { name: '旅行洗漱套装', turnoverRate: 1.1, grossRate: 9 }
];

const pieData = [
  { name: 'GMROI<=1', value: 24, color: '#27b0d6' },
  { name: '1<GMROI<=2', value: 38, color: '#f06b4f' },
  { name: '2<GMROI<=3', value: 21, color: '#b69cff' },
  { name: 'GMROI>3', value: 17, color: '#e53e3e' }
];

const barStats = {
  current: { success: 24, sleeping: 18, attracting: 29, problem: 29 },
  compare: { success: 21, sleeping: 20, attracting: 31, problem: 28 }
};

const matrixColumns = [
  { key: 'sleeping', label: '本期-沉睡商品' },
  { key: 'attracting', label: '本期-吸客商品' },
  { key: 'problem', label: '本期-问题商品' }
];

const matrixRows: MatrixRow[] = [
  { label: '成功商品', sleeping: 4, attracting: 3, problem: 1 },
  { label: '沉睡商品', sleeping: 12, attracting: 2, problem: 5 },
  { label: '吸客商品', sleeping: 3, attracting: 18, problem: 4 },
  { label: '问题商品', sleeping: 2, attracting: 4, problem: 19 },
  { label: '总计', sleeping: 21, attracting: 27, problem: 29, isTotal: true }
];

const loadAnalysisData = async () => {
  // TODO: replace with real backend request for GMROI analysis.
  await nextTick();
  renderScatterChart();
  renderPieChart();
  renderBarChart();
};

const handleViewDetail = () => {
  router.push({
    path: '/gmroi/analysis/detail',
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

const initPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChartIns.value) {
    pieChartIns.value = echarts.init(pieChartRef.value);
  }
};

const initBarChart = () => {
  if (!barChartRef.value) return;
  if (!barChartIns.value) {
    barChartIns.value = echarts.init(barChartRef.value);
  }
};

const renderScatterChart = () => {
  initScatterChart();
  if (!scatterChartIns.value) return;

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = params.data as [number, number, string];
        return `${data[2]}<br/>年库存周转率：${data[0].toFixed(2)}<br/>毛利率：${data[1].toFixed(2)}%`;
      }
    },
    grid: {
      left: 54,
      right: 26,
      top: 24,
      bottom: 48
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 5,
      interval: 0.5,
      name: '年库存周转率',
      nameTextStyle: { color: '#909399' },
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 40,
      interval: 5,
      name: '毛利率%',
      nameTextStyle: { color: '#909399' },
      axisLine: { show: false },
      axisLabel: { color: '#606266', formatter: (value: number) => `${value}%` },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    graphic: [
      { type: 'text', right: 26, top: 18, style: { text: '成功商品(高毛高周转)', fill: '#606266', fontSize: 12 } },
      { type: 'text', left: 48, top: 18, style: { text: '沉睡商品(高毛低周转)', fill: '#606266', fontSize: 12 } },
      { type: 'text', right: 26, bottom: 38, style: { text: '吸客商品(低毛高周转)', fill: '#606266', fontSize: 12 } },
      { type: 'text', left: 48, bottom: 38, style: { text: '问题商品(低毛低周转)', fill: '#606266', fontSize: 12 } }
    ],
    series: [
      {
        type: 'scatter',
        symbolSize: 12,
        itemStyle: { color: '#27b0d6' },
        markLine: {
          symbol: 'none',
          label: { show: false },
          lineStyle: {
            color: '#e53e3e',
            type: 'dashed',
            width: 1
          },
          data: [{ xAxis: 2.2 }, { yAxis: 20 }]
        },
        data: scatterPoints.map((item) => [item.turnoverRate, item.grossRate, item.name])
      }
    ]
  };

  scatterChartIns.value.setOption(option, true);
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;

  const option: EChartsOption = {
    color: pieData.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>SKU数：${params.value}<br/>占比：${Number(params.percent).toFixed(2)}%`
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: {
        color: '#606266',
        fontSize: 13
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['34%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: pieData.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  };

  pieChartIns.value.setOption(option, true);
};

const renderBarChart = () => {
  initBarChart();
  if (!barChartIns.value) return;

  const option: EChartsOption = {
    legend: {
      top: 0,
      left: 'center',
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
    grid: {
      left: 56,
      right: 24,
      top: 46,
      bottom: 36
    },
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
      name: 'SKU占比%',
      nameTextStyle: { color: '#909399' },
      axisLabel: { color: '#606266', formatter: (value: number) => `${value}%` },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    series: [
      {
        name: '成功商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: quadrantColors.success },
        data: [barStats.current.success, barStats.compare.success]
      },
      {
        name: '沉睡商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: quadrantColors.sleeping },
        data: [barStats.current.sleeping, barStats.compare.sleeping]
      },
      {
        name: '吸客商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: quadrantColors.attracting },
        data: [barStats.current.attracting, barStats.compare.attracting]
      },
      {
        name: '问题商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: quadrantColors.problem },
        data: [barStats.current.problem, barStats.compare.problem]
      }
    ]
  };

  barChartIns.value.setOption(option, true);
};

const formatCell = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '-';
  return value;
};

const resizeCharts = () => {
  scatterChartIns.value?.resize();
  pieChartIns.value?.resize();
  barChartIns.value?.resize();
};

onMounted(async () => {
  await loadAnalysisData();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  scatterChartIns.value?.dispose();
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.gmroi-analysis-page {
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-header-left,
.page-header-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.page-header-right {
  align-items: flex-end;
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

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.category-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.role-tag {
  width: fit-content;
}

.hint-text,
.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-box {
  width: 100%;
}

.large-chart {
  height: 500px;
}

.small-chart {
  height: 230px;
}

.right-stack {
  display: grid;
  gap: 12px;
}

.matrix-table-wrap {
  overflow-x: auto;
}

.matrix-table :deep(.el-table__header th) {
  background: #f8fafc;
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

.matrix-number.is-total,
.is-total {
  font-weight: 700;
}

.advice-header {
  background: #f5f7fa;
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

.advice-list li + li {
  margin-top: 10px;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-header-right {
    align-items: flex-start;
  }

  .page-actions {
    width: 100%;
    justify-content: space-between;
  }

  .large-chart {
    height: 380px;
  }

  .small-chart {
    height: 300px;
  }
}
</style>
