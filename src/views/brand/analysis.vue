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
        <div class="metric-value" :class="{ emphasis: item.emphasis }">
          {{ item.value }}
        </div>
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
            <button type="button" class="sort-text" @click="rankDesc = !rankDesc">
              {{ rankDesc ? '降序' : '升序' }}
            </button>
          </div>
          <el-select v-model="rankMetric" class="rank-select" size="small">
            <el-option label="销售额" value="salesAmount" />
            <el-option label="销售量" value="salesQuantity" />
          </el-select>
        </header>
        <div ref="rankChartRef" class="chart-box rank-chart" />
        <div class="rank-pager">
          <el-pagination
            v-model:current-page="rankPage.page"
            :page-size="rankPage.pageSize"
            :total="rankPage.total"
            layout="prev, pager, next"
            :pager-count="7"
            background
            small
            @current-change="handleRankPageChange"
          />
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

    <section class="summary-section">
      <h2 class="summary-title">总结与建议</h2>
      <ul class="summary-list">
        <li v-for="item in summaryLines" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getBrandDetails, getBrandOverview, getBrandRanking, getBrandSalesShare } from '@/api/category/diagnosis/analysis';

const PIE_COLORS = ['#16c2a3', '#ef4444', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#22c55e', '#64748b'];
const LEGEND_PAGE_SIZE = 4;
const summaryLines = [
  '品牌“立白”、“舒影”、“丝飘”、“超能”、“安安金纯”销售额相对较好，客户购买意向高。',
  '品牌“优活王”、“欧乐B”、“简洁”、“子晞”、“半懒”销售额相对较差客户购买意向低。',
  '品牌“青蛙王子”、“冰泉”、“安安”、“金典”、“萌力优”销售额对比上涨较大，排除促销因素影响，反映出客户对此类品牌的购买意向增加。',
  '品牌“简洁”、“半懒”、“自然乐园”、“子晞”、“雪玲妃”销售额对比下降较大，排除促销因素影响，反映出客户对此类品牌的购买意向降低。'
];

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
const rankPage = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const pieItems = ref<any[]>([]);
const rankItems = ref<any[]>([]);
const legendStart = ref(0);

const formatAmount = (value: unknown, digits = 0) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
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
    const [overviewRes, shareRes, rankRes, listRes] = await Promise.all([
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
      { label: '品牌总数', value: overview.totalNum ?? 0, emphasis: true },
      { label: '新销品牌', value: overview.newNum ?? 0, emphasis: true },
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

    const currentMaxStart = Math.max(0, pieItems.value.length - LEGEND_PAGE_SIZE);
    legendStart.value = Math.min(legendStart.value, currentMaxStart);
    if (!pieItems.value.length) {
      legendStart.value = 0;
    }

    void listRes;

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
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 4
          },
          data: pieItems.value.map((item, index) => ({
            name: normalizeName(item, index),
            value: Number(item.value ?? item.sales ?? item.salesAmount ?? 0),
            itemStyle: {
              color: item.color || PIE_COLORS[index % PIE_COLORS.length]
            }
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
  const chartData = sortedRankItems.value;
  const values = chartData.map((item) => resolveRankValue(item, rankMetric.value));
  const maxValue = Math.max(...values, 0);

  rankChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 108, right: 28, top: 18, bottom: 18 },
      xAxis: {
        type: 'value',
        min: 0,
        max: maxValue || undefined,
        axisLabel: { color: '#6b7280', formatter: (value: number) => formatAmount(value, 2) },
        splitLine: { lineStyle: { color: '#edf1f5' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: chartData.map((item, index) => normalizeName(item, index)),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#1f2937' }
      },
      series: [
        {
          type: 'bar',
          barWidth: 16,
          data: chartData.map((item) => ({
            value: resolveRankValue(item, rankMetric.value),
            itemStyle: {
              color: '#16c2a3',
              borderRadius: [0, 8, 8, 0]
            }
          })),
          markLine: {
            symbol: 'none',
            lineStyle: {
              color: '#ef4444',
              width: 2
            },
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
  const chartData = sortedRankItems.value.slice(0, 9);

  comboChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: {
        top: 6,
        left: 24,
        itemGap: 24,
        textStyle: { color: '#475569' },
        data: ['SKU变动数', '销售额增长率']
      },
      grid: { left: 70, right: 70, top: 58, bottom: 56 },
      xAxis: {
        type: 'category',
        data: chartData.map((item, index) => normalizeName(item, index)),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#d9e0e7' } },
        axisLabel: {
          color: '#475569',
          interval: 0,
          rotate: chartData.length > 7 ? 24 : 0
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额百分比（%）',
          min: -100,
          max: 200,
          interval: 50,
          axisLabel: { formatter: '{value}%', color: '#64748b' },
          splitLine: { lineStyle: { color: '#edf1f5' } },
          nameTextStyle: { color: '#64748b' }
        },
        {
          type: 'value',
          name: 'SKU数量',
          min: -15,
          max: 20,
          interval: 5,
          axisLabel: { color: '#64748b' },
          splitLine: { show: false },
          nameTextStyle: { color: '#64748b' }
        }
      ],
      series: [
        {
          name: 'SKU变动数',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: 20,
          itemStyle: {
            color: '#f59e0b',
            borderRadius: [6, 6, 0, 0]
          },
          data: chartData.map((item) => Number(item?.skuChange ?? item?.skuDiff ?? 0))
        },
        {
          name: '销售额增长率',
          type: 'line',
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 10,
          smooth: true,
          itemStyle: { color: '#16c2a3' },
          lineStyle: { color: '#16c2a3', width: 3 },
          data: chartData.map((item) => Number(item?.growthRate ?? item?.salesGrowthRate ?? 0))
        }
      ]
    } as EChartsOption,
    true
  );
};

const handlePrevLegend = () => {
  if (!canPrevLegend.value) return;
  legendStart.value -= 1;
};

const handleNextLegend = () => {
  if (!canNextLegend.value) return;
  legendStart.value += 1;
};

const handleRankPageChange = async (page: number) => {
  rankPage.page = page;
  await reload();
};

watch([rankMetric, rankDesc], async () => {
  rankPage.page = 1;
  await reload();
});

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
  background: #f4f7fb;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #172033;
  line-height: 1;
}

.detail-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #16c2a3;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.unit-text {
  color: #667085;
  font-size: 14px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.metric-card,
.chart-panel,
.summary-section {
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.metric-card {
  padding: 24px 28px;
}

.metric-label {
  font-size: 15px;
  color: #667085;
}

.metric-value {
  margin-top: 16px;
  font-size: 38px;
  line-height: 1;
  font-weight: 700;
  color: #172033;
}

.metric-value.emphasis {
  color: #16c2a3;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.combo-section {
  margin-bottom: 16px;
}

.chart-panel {
  padding: 20px 22px 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #172033;
}

.sort-text {
  border: 0;
  padding: 0;
  background: transparent;
  color: #16c2a3;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.rank-select {
  width: 112px;
}

.donut-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  align-items: center;
  gap: 8px;
}

.chart-box {
  width: 100%;
}

.donut-chart,
.rank-chart {
  height: 340px;
}

.combo-chart {
  height: 420px;
}

.donut-legend {
  display: flex;
  min-height: 340px;
  flex-direction: column;
  justify-content: center;
  padding-left: 18px;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.legend-dot {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  border-radius: 999px;
}

.legend-name {
  overflow: hidden;
  color: #344054;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.legend-pager {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  color: #667085;
  font-size: 13px;
}

.pager-arrow {
  border: 0;
  padding: 0;
  background: transparent;
  color: #475467;
  font-size: 13px;
  cursor: pointer;
}

.pager-arrow:disabled {
  cursor: not-allowed;
  color: #c0c4cc;
}

.pager-text {
  min-width: 48px;
}

.rank-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.summary-section {
  padding: 22px 24px;
  background: #eef1f4;
}

.summary-title {
  margin: 0 0 16px;
  color: #172033;
  font-size: 18px;
  font-weight: 700;
}

.summary-list {
  margin: 0;
  padding-left: 20px;
  color: #475467;
  font-size: 14px;
  line-height: 2;
}

.summary-list li + li {
  margin-top: 2px;
}

:deep(.el-pagination.is-background .btn-next),
:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .el-pager li) {
  min-width: 28px;
  height: 28px;
  border-radius: 8px;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #16c2a3;
}

@media (max-width: 1200px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .donut-layout {
    grid-template-columns: 1fr;
  }

  .donut-legend {
    min-height: unset;
    padding-left: 0;
    padding-top: 8px;
  }
}

@media (max-width: 768px) {
  .brand-analysis-page {
    padding: 12px;
  }

  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .metric-row {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .rank-select {
    width: 100%;
  }

  .donut-chart,
  .rank-chart {
    height: 300px;
  }

  .combo-chart {
    height: 360px;
  }
}
</style>
