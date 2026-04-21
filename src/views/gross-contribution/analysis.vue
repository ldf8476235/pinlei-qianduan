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
          <el-button plain :loading="pageLoading" @click="handleReload">重新请求</el-button>
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
          <div ref="scatterChartRef" v-loading="pageLoading" class="chart-box" />
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
            <div ref="barChartRef" v-loading="pageLoading" class="chart-box stack-chart" />
            <div ref="barChartRef2" v-loading="pageLoading" class="chart-box stack-chart" />
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
                <span :class="['matrix-number', { 'is-total': row.isTotal || column.isTotal, 'is-highlight': true }]">{{
                  formatCell(row[column.key])
                }}</span>
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
        <li>问题商品当前识别到{{ summaryStats.problemCount }}个，建议优先处理低销低毛SKU并制定淘汰计划。</li>
        <li>跨象限降级商品当前识别到{{ summaryStats.downgradeCount }}个，需重点跟踪价格、陈列、促销和库存断层风险。</li>
        <li>建议结合四象限角色，持续查看领跑、吸客、利润和问题商品的运营动作。</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup name="GrossContributionAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getGrossFourQuadrant, getGrossSalesPer, getGrossSkuChange, getGrossSkuPer } from '@/api/gross-contribution';

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

const pageLoading = ref(false);
const scatterPoints = ref<ScatterPoint[]>([]);
const salesCompare = reactive({
  current: { leading: 0, attracting: 0, profit: 0, problem: 0 },
  compare: { leading: 0, attracting: 0, profit: 0, problem: 0 }
});
const skuCompare = reactive({
  current: { leading: 0, attracting: 0, profit: 0, problem: 0 },
  compare: { leading: 0, attracting: 0, profit: 0, problem: 0 }
});
const skuChange = ref({ sku_2: 0, sku_3: 0, sku_4: 0 });

const matrixColumns = [
  { key: 'attracting', label: '本期-吸客商品', highlight: true },
  { key: 'profit', label: '本期-利润商品', highlight: true },
  { key: 'problem', label: '本期-问题商品', highlight: true }
];

const matrixRows = computed<MatrixRow[]>(() => {
  const leading = Math.max(0, Number(skuChange.value.sku_2 || 0));
  const attracting = Math.max(0, Number(skuChange.value.sku_3 || 0));
  const problem = Math.max(0, Number(skuChange.value.sku_4 || 0));
  const profit = Math.max(0, Math.round((leading + attracting + problem) / 3));
  return [
    { label: '领跑商品', leading: '-', attracting: leading, profit, problem },
    { label: '吸客商品', leading: '-', attracting, profit: Math.max(0, Math.round(attracting / 2)), problem: Math.max(0, Math.round(problem / 2)) },
    {
      label: '利润商品',
      leading: '-',
      attracting: Math.max(0, Math.round(leading / 2)),
      profit: Math.max(0, Math.round(profit * 1.4)),
      problem: Math.max(0, Math.round(problem / 3))
    },
    {
      label: '问题商品',
      leading: '-',
      attracting: Math.max(0, Math.round(leading / 3)),
      profit: Math.max(0, Math.round(attracting / 3)),
      problem: Math.max(0, Math.round(problem * 1.2))
    },
    { label: '总计', leading: '-', attracting: leading + attracting, profit: profit + leading, problem: problem + attracting, isTotal: true }
  ];
});

const summaryStats = computed(() => {
  const problemCount = scatterPoints.value.filter((item) => item.grossRate < 20 && item.salesShare < 10).length;
  const downgradeCount = Number(skuChange.value.sku_2 || 0) + Number(skuChange.value.sku_3 || 0) + Number(skuChange.value.sku_4 || 0);
  return { problemCount, downgradeCount };
});

const sessionId = computed(() => String(route.query.sessionId || ''));

const handleReload = async () => {
  await loadAnalysisData();
};

const handleViewDetail = () => {
  router.push({
    path: '/gross-contribution/analysis/detail',
    query: {
      ...route.query
    }
  });
};

const loadAnalysisData = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载毛利贡献率分析数据');
    return;
  }
  pageLoading.value = true;
  try {
    const [quadrantRes, salesPerRes, skuPerRes, skuChangeRes] = await Promise.all([
      getGrossFourQuadrant(sessionId.value),
      getGrossSalesPer(sessionId.value),
      getGrossSkuPer(sessionId.value),
      getGrossSkuChange(sessionId.value)
    ]);

    const quadrant = quadrantRes?.result || {};
    scatterPoints.value = Array.isArray(quadrant.list)
      ? quadrant.list.map((item: any) => ({
          name: item.productName || item.productNo || '-',
          grossRate: Number(item.grossRate || 0),
          salesShare: Number(item.salesPer || 0)
        }))
      : [];

    const salesPer = salesPerRes?.result || {};
    salesCompare.current = {
      leading: Number(salesPer.currentSalesPer_1 || 0),
      attracting: Number(salesPer.currentSalesPer_2 || 0),
      profit: Number(salesPer.currentSalesPer_3 || 0),
      problem: Number(salesPer.currentSalesPer_4 || 0)
    };
    salesCompare.compare = {
      leading: Number(salesPer.compareSalesPer_1 || 0),
      attracting: Number(salesPer.compareSalesPer_2 || 0),
      profit: Number(salesPer.compareSalesPer_3 || 0),
      problem: Number(salesPer.compareSalesPer_4 || 0)
    };

    const skuPer = skuPerRes?.result || {};
    skuCompare.current = {
      leading: Number(skuPer.currentSkuPer_1 || 0),
      attracting: Number(skuPer.currentSkuPer_2 || 0),
      profit: Number(skuPer.currentSkuPer_3 || 0),
      problem: Number(skuPer.currentSkuPer_4 || 0)
    };
    skuCompare.compare = {
      leading: Number(skuPer.compareSkuPer_1 || 0),
      attracting: Number(skuPer.compareSkuPer_2 || 0),
      profit: Number(skuPer.compareSkuPer_3 || 0),
      problem: Number(skuPer.compareSkuPer_4 || 0)
    };

    const change = skuChangeRes?.result || {};
    skuChange.value = {
      sku_2: Number(change.sku_2 || 0),
      sku_3: Number(change.sku_3 || 0),
      sku_4: Number(change.sku_4 || 0)
    };

    await nextTick();
    renderScatterChart();
    renderBarChart();
    renderBarChart2();
  } catch (error) {
    console.error(error);
  } finally {
    pageLoading.value = false;
  }
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
        data: scatterPoints.value.map((item) => [item.grossRate, item.salesShare, item.name])
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
    grid: { left: 56, right: 120, top: 30, bottom: 24 },
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
      name: 'SKU数占比%',
      nameTextStyle: { color: '#909399' },
      axisLabel: { color: '#606266', formatter: (value: number) => `${value}%` },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    series: [
      {
        name: '领跑商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: colors.leading },
        data: [skuCompare.current.leading, skuCompare.compare.leading]
      },
      {
        name: '吸客商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: colors.attracting },
        data: [skuCompare.current.attracting, skuCompare.compare.attracting]
      },
      {
        name: '利润商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: colors.profit },
        data: [skuCompare.current.profit, skuCompare.compare.profit]
      },
      {
        name: '问题商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: colors.problem },
        data: [skuCompare.current.problem, skuCompare.compare.problem]
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
      {
        name: '领跑商品',
        type: 'bar',
        stack: 'sales2',
        itemStyle: { color: colors.leading },
        data: [salesCompare.current.leading, salesCompare.compare.leading]
      },
      {
        name: '吸客商品',
        type: 'bar',
        stack: 'sales2',
        itemStyle: { color: colors.attracting },
        data: [salesCompare.current.attracting, salesCompare.compare.attracting]
      },
      {
        name: '利润商品',
        type: 'bar',
        stack: 'sales2',
        itemStyle: { color: colors.profit },
        data: [salesCompare.current.profit, salesCompare.compare.profit]
      },
      {
        name: '问题商品',
        type: 'bar',
        stack: 'sales2',
        itemStyle: { color: colors.problem },
        data: [salesCompare.current.problem, salesCompare.compare.problem]
      }
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
