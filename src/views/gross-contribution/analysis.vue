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
            <div
              class="stack-chart-item"
              @mousemove="handleStackTooltipMousemove($event, 'sku')"
              @mouseleave="hideStackTooltip"
            >
              <div ref="barChartRef" v-loading="pageLoading" class="chart-box stack-chart" />
              <div v-if="stackTooltip.visible && stackTooltip.chart === 'sku'" class="stack-tooltip" :style="{ left: `${stackTooltip.x}px`, top: `${stackTooltip.y}px` }">
                <div class="stack-tooltip-title">{{ stackTooltip.title }}</div>
                <div v-for="item in stackTooltip.rows" :key="item.name" class="stack-tooltip-row">
                  <span class="stack-tooltip-dot" :style="{ background: item.color }" />
                  <span class="stack-tooltip-name">{{ item.name }}</span>
                  <span class="stack-tooltip-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
            <div
              class="stack-chart-item"
              @mousemove="handleStackTooltipMousemove($event, 'sales')"
              @mouseleave="hideStackTooltip"
            >
              <div ref="barChartRef2" v-loading="pageLoading" class="chart-box stack-chart" />
              <div v-if="stackTooltip.visible && stackTooltip.chart === 'sales'" class="stack-tooltip" :style="{ left: `${stackTooltip.x}px`, top: `${stackTooltip.y}px` }">
                <div class="stack-tooltip-title">{{ stackTooltip.title }}</div>
                <div v-for="item in stackTooltip.rows" :key="item.name" class="stack-tooltip-row">
                  <span class="stack-tooltip-dot" :style="{ background: item.color }" />
                  <span class="stack-tooltip-name">{{ item.name }}</span>
                  <span class="stack-tooltip-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
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
                <el-button
                  link
                  type="primary"
                  :disabled="!isMatrixCellClickable(row, column)"
                  :class="['matrix-number', { 'is-total': row.isTotal, 'is-highlight': true }]"
                  @click="handleMatrixCellClick(row, column)"
                >
                  {{ formatCell(row[column.key]) }}
                </el-button>
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
        <li>该品类存在问题商品(低毛利率低周转){{ formatInteger(skuPer.currentSku_3 || 0) }}个，占比{{ formatPercent(skuPer.currentSkuPer_3 || 0) }}，建议重点关注，可结合其他异常分析及用户需求进行末位淘汰;</li>
        <li>存在由对比周期的第一象限降为本期较差象限的商品{{ formatInteger((skuChange.sku_2 || 0) + (skuChange.sku_3 || 0) + (skuChange.sku_4 || 0)) }}个，请加以关注和分析!</li>
        <li>点击GMROI四象限名称可查看对应的商品策略!</li>
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
  compareGross: GrossRoleKey | '';
  isTotal?: boolean;
}

interface MatrixColumn {
  key: GrossRoleKey;
  label: string;
  highlight?: boolean;
}

type GrossRoleKey = 'leading' | 'attracting' | 'profit' | 'problem';

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
const skuPer = reactive({
  currentSku_3: 0,
  currentSkuPer_3: 0
});
const skuChange = ref({ sku_2: 0, sku_3: 0, sku_4: 0 });
const themeOrange = '#f97316';
const quadrantColors = {
  leading: '#27b0d6',
  attracting: '#f06b4f',
  profit: '#8b6ff6',
  problem: '#e95570'
};
type StackChartType = 'sku' | 'sales';
const stackTooltip = reactive({
  visible: false,
  chart: '' as StackChartType | '',
  x: 0,
  y: 0,
  title: '',
  rows: [] as Array<{ name: string; value: string; color: string }>
});

const matrixColumns = [
  { key: 'attracting', label: '本期-吸客商品', highlight: true },
  { key: 'profit', label: '本期-利润商品', highlight: true },
  { key: 'problem', label: '本期-问题商品', highlight: true }
];

const matrixRows = computed<MatrixRow[]>(() => {
  const fromLeadingToAttracting = Math.max(0, Number(skuChange.value.sku_2 || 0));
  const fromLeadingToProblem = Math.max(0, Number(skuChange.value.sku_3 || 0));
  const fromLeadingToProfit = Math.max(0, Number(skuChange.value.sku_4 || 0));
  return [
    { label: '领跑商品', compareGross: 'leading', leading: '-', attracting: fromLeadingToAttracting, profit: fromLeadingToProfit, problem: fromLeadingToProblem },
    { label: '吸客商品', compareGross: 'attracting', leading: '-', attracting: 0, profit: 0, problem: 0 },
    { label: '利润商品', compareGross: 'profit', leading: '-', attracting: 0, profit: 0, problem: 0 },
    { label: '问题商品', compareGross: 'problem', leading: '-', attracting: 0, profit: 0, problem: 0 },
    { label: '总计', compareGross: '', leading: '-', attracting: fromLeadingToAttracting, profit: fromLeadingToProfit, problem: fromLeadingToProblem, isTotal: true }
  ];
});

const summaryStats = computed(() => {
  const problemCount = scatterPoints.value.filter((item) => item.grossRate < 20 && item.salesShare < 10).length;
  const downgradeCount = Number(skuChange.value.sku_2 || 0) + Number(skuChange.value.sku_3 || 0) + Number(skuChange.value.sku_4 || 0);
  return { problemCount, downgradeCount };
});

const formatInteger = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) : '0';
};

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : '0.00%';
};

const hideStackTooltip = () => {
  stackTooltip.visible = false;
  stackTooltip.chart = '';
};

const handleStackTooltipMousemove = (event: MouseEvent, type: StackChartType) => {
  const wrap = event.currentTarget as HTMLElement;
  const rect = wrap.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(rect.width, 1)));
  const period = ratio < 0.5 ? 'current' : 'compare';
  const source = type === 'sku' ? skuCompare : salesCompare;
  const title = period === 'current' ? '本期' : '对比日期';
  const tooltipWidth = 210;
  const tooltipHeight = 170;

  stackTooltip.visible = true;
  stackTooltip.chart = type;
  stackTooltip.title = title;
  stackTooltip.rows = [
    { name: '领跑商品', value: formatPercent(source[period].leading), color: quadrantColors.leading },
    { name: '吸客商品', value: formatPercent(source[period].attracting), color: quadrantColors.attracting },
    { name: '利润商品', value: formatPercent(source[period].profit), color: quadrantColors.profit },
    { name: '问题商品', value: formatPercent(source[period].problem), color: quadrantColors.problem }
  ];
  stackTooltip.x = Math.min(Math.max(12, event.clientX - rect.left + 14), Math.max(12, rect.width - tooltipWidth - 12));
  stackTooltip.y = Math.min(Math.max(12, event.clientY - rect.top - 86), Math.max(12, rect.height - tooltipHeight - 12));
};

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

const handleMatrixCellClick = (row: MatrixRow, column: MatrixColumn) => {
  if (!isMatrixCellClickable(row, column)) {
    return;
  }
  router.push({
    path: '/gross-contribution/analysis/detail',
    query: {
      ...route.query,
      currentGross: column.key,
      ...(row.compareGross ? { compareGross: row.compareGross } : {})
    }
  });
};

const isMatrixCellClickable = (row: MatrixRow, column: MatrixColumn) => {
  if (row.isTotal || !row.compareGross) {
    return false;
  }
  const value = Number(row[column.key]);
  return Number.isFinite(value) && value > 0;
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
      profit: Number(salesPer.currentSalesPer_4 || 0),
      problem: Number(salesPer.currentSalesPer_3 || 0)
    };
    salesCompare.compare = {
      leading: Number(salesPer.compareSalesPer_1 || 0),
      attracting: Number(salesPer.compareSalesPer_2 || 0),
      profit: Number(salesPer.compareSalesPer_4 || 0),
      problem: Number(salesPer.compareSalesPer_3 || 0)
    };

    const skuPerData = skuPerRes?.result || {};
    skuPer.currentSku_3 = Number(skuPerData.currentSku_3 || 0);
    skuPer.currentSkuPer_3 = Number(skuPerData.currentSkuPer_3 || 0);
    skuCompare.current = {
      leading: Number(skuPerData.currentSkuPer_1 || 0),
      attracting: Number(skuPerData.currentSkuPer_2 || 0),
      profit: Number(skuPerData.currentSkuPer_4 || 0),
      problem: Number(skuPerData.currentSkuPer_3 || 0)
    };
    skuCompare.compare = {
      leading: Number(skuPerData.compareSkuPer_1 || 0),
      attracting: Number(skuPerData.compareSkuPer_2 || 0),
      profit: Number(skuPerData.compareSkuPer_4 || 0),
      problem: Number(skuPerData.compareSkuPer_3 || 0)
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
      appendToBody: true,
      confine: false,
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
          color: themeOrange,
          opacity: 0.72
        },
        emphasis: {
          itemStyle: {
            color: '#ea580c',
            opacity: 0.95,
            borderColor: '#ffedd5',
            borderWidth: 2
          }
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
      triggerOn: 'mousemove|click',
      appendToBody: true,
      confine: false,
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
        itemStyle: { color: quadrantColors.leading },
        data: [skuCompare.current.leading, skuCompare.compare.leading]
      },
      {
        name: '吸客商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: quadrantColors.attracting },
        data: [skuCompare.current.attracting, skuCompare.compare.attracting]
      },
      {
        name: '利润商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: quadrantColors.profit },
        data: [skuCompare.current.profit, skuCompare.compare.profit]
      },
      {
        name: '问题商品',
        type: 'bar',
        stack: 'sku',
        itemStyle: { color: quadrantColors.problem },
        data: [skuCompare.current.problem, skuCompare.compare.problem]
      }
    ]
  };

  barChartIns.value.setOption(option, true);
};

const renderBarChart2 = () => {
  initBarChart2();
  if (!barChartIns2.value) return;

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
      triggerOn: 'mousemove|click',
      appendToBody: true,
      confine: false,
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
        itemStyle: { color: quadrantColors.leading },
        data: [salesCompare.current.leading, salesCompare.compare.leading]
      },
      {
        name: '吸客商品',
        type: 'bar',
        stack: 'sales2',
        itemStyle: { color: quadrantColors.attracting },
        data: [salesCompare.current.attracting, salesCompare.compare.attracting]
      },
      {
        name: '利润商品',
        type: 'bar',
        stack: 'sales2',
        itemStyle: { color: quadrantColors.profit },
        data: [salesCompare.current.profit, salesCompare.compare.profit]
      },
      {
        name: '问题商品',
        type: 'bar',
        stack: 'sales2',
        itemStyle: { color: quadrantColors.problem },
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

.stack-chart-item {
  position: relative;
  min-width: 0;
}

.stack-chart {
  height: 360px;
}

.stack-tooltip {
  position: absolute;
  z-index: 20;
  min-width: 198px;
  padding: 14px 16px;
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
  color: #555;
  pointer-events: none;
}

.stack-tooltip-title {
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #555;
}

.stack-tooltip-row {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 8px;
  min-height: 26px;
  font-size: 14px;
}

.stack-tooltip-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.stack-tooltip-value {
  font-weight: 700;
  color: #666;
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
