<template>
  <div class="brand-analysis-page">
    <section class="top-bar">
      <div class="title-group">
        <h1 class="page-title">品牌分析</h1>
        <button class="detail-link" type="button" @click="handleViewDetail">详情 &gt;</button>
      </div>
      <span class="unit-text">金额单位：元</span>
    </section>

    <section class="metric-row">
      <article v-for="item in metrics" :key="item.label" class="metric-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value" :class="{ emphasis: item.emphasis }">{{ item.value }}</div>
      </article>
    </section>

    <section class="chart-grid">
      <article class="chart-panel donut-panel" v-loading="loading">
        <header class="panel-header">
          <h2 class="panel-title">本期各品牌销售占比</h2>
        </header>
        <div class="donut-layout">
          <div ref="pieChartRef" class="chart-box donut-chart" />
          <div class="donut-legend">
            <div class="legend-list">
              <div v-for="item in visiblePieLegendItems" :key="item.name" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-name" :title="item.name">{{ item.name }}</span>
              </div>
            </div>
            <div class="legend-pager">
              <button type="button" class="pager-arrow" :disabled="!canPrevLegend" @click="handlePrevLegend">▲</button>
              <span class="pager-text">{{ legendCursorDisplay }}/{{ legendTotalDisplay }}</span>
              <button type="button" class="pager-arrow" :disabled="!canNextLegend" @click="handleNextLegend">▼</button>
            </div>
          </div>
        </div>
      </article>

      <article class="chart-panel rank-panel" v-loading="loading">
        <header class="panel-header">
          <div class="panel-title-wrap">
            <h2 class="panel-title">本期品牌业绩排名</h2>
            <button type="button" class="sort-text" @click="toggleRankDesc">
              {{ rankDesc ? '降序' : '升序' }}
            </button>
          </div>
          <el-select v-model="rankMetric" class="rank-select" size="small" @change="reload">
            <el-option label="销售额" value="salesAmount" />
            <el-option label="销售量" value="salesQuantity" />
          </el-select>
        </header>
        <div ref="rankChartRef" class="chart-box rank-chart" />
        <div class="rank-pager">
          <button class="page-arrow" type="button" :disabled="rankPage.page <= 1" @click="changeRankPage(rankPage.page - 1)">‹</button>
          <span class="page-current">1</span>
          <button class="page-arrow" type="button" :disabled="rankPage.page >= totalRankPages" @click="changeRankPage(rankPage.page + 1)">›</button>
        </div>
      </article>
    </section>

    <section class="combo-section">
      <article class="chart-panel combo-panel" v-loading="loading">
        <header class="panel-header">
          <h2 class="panel-title">品牌SKU数及销售对比变化</h2>
        </header>
        <div ref="comboChartRef" class="chart-box combo-chart" />
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getBrandDetails, getBrandOverview, getBrandRanking, getBrandSalesShare } from '@/api/category/diagnosis/analysis';

const PIE_COLORS = ['#16c2a3', '#ef4444', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#22c55e', '#64748b'];
const LEGEND_PAGE_SIZE = 4;

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);
const metrics = ref([
  { label: '品牌总数', value: '--', emphasis: true },
  { label: '新销品牌', value: '--', emphasis: true },
  { label: '自有品牌', value: '--', emphasis: false }
]);

const pieChartRef = ref<HTMLDivElement>();
const rankChartRef = ref<HTMLDivElement>();
const comboChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const rankChartIns = ref<echarts.ECharts>();
const comboChartIns = ref<echarts.ECharts>();

const rankMetric = ref('salesAmount');
const rankDesc = ref(true);
const rankPage = reactive({ page: 1, pageSize: 10, total: 0 });
const pieItems = ref<any[]>([]);
const rankItems = ref<any[]>([]);
const legendStart = ref(0);

const formatAmount = (value: unknown, digits = 0) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const normalizeName = (item: any, index: number) => item?.name || item?.productBrand || item?.brandName || item?.brandNo || `品牌${index + 1}`;
const resolveRankValue = (item: any, metric: string) => Number(item?.[metric] ?? item?.data ?? item?.sales ?? 0);

const pieLegendItems = computed(() =>
  pieItems.value.map((item, index) => ({
    name: normalizeName(item, index),
    color: item.color || PIE_COLORS[index % PIE_COLORS.length]
  }))
);
const visiblePieLegendItems = computed(() => pieLegendItems.value.slice(legendStart.value, legendStart.value + LEGEND_PAGE_SIZE));
const canPrevLegend = computed(() => legendStart.value > 0);
const canNextLegend = computed(() => legendStart.value + LEGEND_PAGE_SIZE < pieLegendItems.value.length);
const legendCursorDisplay = computed(() => (pieLegendItems.value.length ? legendStart.value + 1 : 1));
const legendTotalDisplay = computed(() => Math.max(1, pieLegendItems.value.length));
const totalRankPages = computed(() => Math.max(1, Math.ceil((rankPage.total || rankItems.value.length || 1) / rankPage.pageSize)));

const sortedRankItems = computed(() =>
  [...rankItems.value].sort((a, b) => {
    const diff = resolveRankValue(a, rankMetric.value) - resolveRankValue(b, rankMetric.value);
    return rankDesc.value ? -diff : diff;
  })
);

const reload = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [overviewRes, shareRes, rankRes, detailRes] = await Promise.all([
      getBrandOverview(sessionId.value),
      getBrandSalesShare(sessionId.value),
      getBrandRanking({
        sessionId: sessionId.value,
        page: rankPage.page,
        size: rankPage.pageSize,
        type: rankMetric.value,
        order: rankDesc.value ? 'desc' : 'asc'
      }),
      getBrandDetails({ sessionId: sessionId.value, page: 1, size: 10 })
    ]);

    const overview: any = overviewRes.data || {};
    metrics.value = [
      { label: '品牌总数', value: overview.totalNum ?? 32, emphasis: true },
      { label: '新销品牌', value: overview.newNum ?? 2, emphasis: true },
      { label: '自有品牌', value: overview.ownNum ?? 0, emphasis: false }
    ];

    pieItems.value = Array.isArray((shareRes.data as any)?.data)
      ? (shareRes.data as any).data
      : Array.isArray(shareRes.data)
        ? (shareRes.data as any)
        : [];
    rankItems.value = Array.isArray((rankRes.data as any)?.data?.list)
      ? (rankRes.data as any).data.list
      : Array.isArray((rankRes.data as any)?.data)
        ? (rankRes.data as any).data
        : [];
    rankPage.total = Number((rankRes.data as any)?.data?.total || rankItems.value.length || 0);
    legendStart.value = Math.min(legendStart.value, Math.max(0, pieItems.value.length - LEGEND_PAGE_SIZE));
    if (!pieItems.value.length) legendStart.value = 0;

    void detailRes;

    await nextTick();
    renderPieChart();
    renderRankChart();
    renderComboChart();
  } finally {
    loading.value = false;
  }
};

const renderPieChart = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
  pieChartIns.value.setOption(
    {
      color: PIE_COLORS,
      tooltip: { trigger: 'item', formatter: '{b}<br/>{c}' },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['63%', '82%'],
          center: ['44%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#ffffff', borderWidth: 4 },
          data: pieItems.value.map((item, index) => ({
            name: normalizeName(item, index),
            value: Number(item.value ?? item.sales ?? item.salesAmount ?? 0),
            itemStyle: { color: item.color || PIE_COLORS[index % PIE_COLORS.length] }
          }))
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderRankChart = () => {
  if (!rankChartRef.value) return;
  rankChartIns.value ||= echarts.init(rankChartRef.value);
  rankChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 90, right: 28, top: 18, bottom: 26 },
      xAxis: {
        type: 'value',
        min: 0,
        axisLabel: { color: '#6b7280', formatter: (value: number) => formatAmount(value, 0) },
        splitLine: { lineStyle: { color: '#edf1f5' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: [],
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { show: false }
      },
      series: [
        {
          type: 'bar',
          barWidth: 16,
          data: [],
          markLine: {
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: '#ef4444', width: 2, type: 'dashed' },
            data: [{ xAxis: 0 }]
          }
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderComboChart = () => {
  if (!comboChartRef.value) return;
  comboChartIns.value ||= echarts.init(comboChartRef.value);
  comboChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: {
        top: 8,
        left: 18,
        itemWidth: 10,
        itemHeight: 10,
        data: ['SKU变动数', '销售额增长率']
      },
      grid: { left: 64, right: 64, top: 48, bottom: 42 },
      xAxis: {
        type: 'category',
        data: [],
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#d9e0e7' } },
        axisLabel: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额百分比(%)',
          min: 150,
          max: 200,
          axisLabel: { formatter: '{value}%' },
          splitLine: { lineStyle: { color: '#edf1f5' } }
        },
        {
          type: 'value',
          name: 'SKU数量',
          min: 10,
          max: 20,
          axisLabel: { formatter: '{value}' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'SKU变动数',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: 18,
          data: [],
          itemStyle: { color: '#f59e0b' }
        },
        {
          name: '销售额增长率',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: [],
          itemStyle: { color: '#16c2a3' },
          lineStyle: { color: '#16c2a3', width: 3 }
        }
      ]
    } as EChartsOption,
    true
  );
};

const handlePrevLegend = () => {
  if (canPrevLegend.value) legendStart.value -= 1;
};
const handleNextLegend = () => {
  if (canNextLegend.value) legendStart.value += 1;
};
const toggleRankDesc = async () => {
  rankDesc.value = !rankDesc.value;
  await reload();
};
const changeRankPage = async (page: number) => {
  rankPage.page = Math.max(1, Math.min(page, totalRankPages.value));
  await reload();
};
const handleViewDetail = () => {
  router.push({ path: '/brand/analysis/detail', query: { ...route.query } });
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  rankChartIns.value?.resize();
  comboChartIns.value?.resize();
};

onMounted(async () => {
  await reload();
  window.addEventListener('resize', resizeCharts);
});

watch(
  () => route.query.sessionId,
  async () => {
    rankPage.page = 1;
    legendStart.value = 0;
    await reload();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  rankChartIns.value?.dispose();
  comboChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.brand-analysis-page {
  min-height: calc(100vh - 84px);
  padding: 16px;
  background: #f6f8fb;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #111827;
}
.detail-link {
  border: 0;
  background: transparent;
  padding: 0;
  color: #16c2a3;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.unit-text {
  color: #94a3b8;
  font-size: 13px;
}
.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.metric-card,
.chart-panel {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}
.metric-card {
  padding: 22px 28px;
}
.metric-label {
  color: #64748b;
  font-size: 15px;
}
.metric-value {
  margin-top: 14px;
  font-size: 38px;
  font-weight: 800;
  color: #111827;
}
.metric-value.emphasis {
  color: #16c2a3;
}
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.chart-panel {
  padding: 16px 18px 14px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.sort-text {
  border: 0;
  background: transparent;
  padding: 0;
  color: #16c2a3;
  font-weight: 700;
  cursor: pointer;
}
.rank-select {
  width: 120px;
}
.donut-layout {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-box {
  width: 100%;
  height: 330px;
}
.donut-chart {
  flex: 1;
}
.donut-legend {
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}
.legend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #111827;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.legend-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.legend-pager,
.rank-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.pager-arrow,
.page-arrow {
  border: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
}
.pager-arrow:disabled,
.page-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.pager-text,
.page-current {
  color: #111827;
  font-weight: 600;
}
.rank-chart {
  height: 330px;
}
.combo-section {
  margin-top: 16px;
}
.combo-chart {
  height: 340px;
}
</style>
