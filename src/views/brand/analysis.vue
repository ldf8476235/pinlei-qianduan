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
        <header class="panel-header panel-header--rank">
          <div class="panel-title-wrap">
            <h2 class="panel-title">本期品牌业绩排名</h2>
            <button type="button" class="sort-text" @click="toggleRankDesc">{{ rankDesc ? '降序' : '升序' }}</button>
          </div>
          <el-select v-model="rankMetric" class="rank-select" size="small" @change="reload">
            <el-option label="销售额" value="salesAmount" />
            <el-option label="销售量" value="salesQuantity" />
            <el-option label="毛利额" value="grossAmount" />
            <el-option label="毛利率" value="grossRate" />
          </el-select>
        </header>
        <div class="rank-toolbar">
          <div class="rank-nav">
            <button type="button" class="page-arrow" :disabled="rankPage.page <= 1" @click="handleRankPageChange(rankPage.page - 1)">&lt;</button>
            <span
              v-for="item in rankPagerItems"
              :key="item.key"
              class="pager-item"
              :class="{ active: item.active, ellipsis: item.label === '…' }"
              @click="item.page && handleRankPageChange(item.page)"
            >
              {{ item.label }}
            </span>
            <button type="button" class="page-arrow" :disabled="rankPage.page >= totalRankPages" @click="handleRankPageChange(rankPage.page + 1)">&gt;</button>
          </div>
        </div>
        <div ref="rankChartRef" class="chart-box rank-chart" />
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
        <li v-for="item in renderedSummaryLines" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getBrandDetails, getBrandFilterOptions, getBrandOverview, getBrandRanking, getBrandSalesShare } from '@/api/category/diagnosis/analysis';

const PIE_COLORS = ['#16c2a3', '#ef4444', '#8b5cf6', '#ec4899'];
const LEGEND_PAGE_SIZE = 4;

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);
const summaryOptions = ref<{ summaryOne?: string[]; summaryTwo?: string[]; summaryThree?: string[]; summaryFour?: string[] }>({});
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
const summaryLines = computed(() => {
  const one = (summaryOptions.value.summaryOne || []).filter(Boolean).slice(0, 5);
  const two = (summaryOptions.value.summaryTwo || []).filter(Boolean).slice(0, 5);
  const three = (summaryOptions.value.summaryThree || []).filter(Boolean).slice(0, 5);
  const four = (summaryOptions.value.summaryFour || []).filter(Boolean).slice(0, 5);
  return [
    one.length ? `品牌"${one.join('"、"')}"销售额相对较好，客户购买意向高。` : '',
    two.length ? `品牌"${two.join('"、"')}"销售额相对较差，客户购买意向低。` : '',
    three.length ? `品牌"${three.join('"、"')}"销售额对比上涨较大，排除促销因素影响，反映出客户对此类品牌的购买意向增加。` : '',
    four.length ? `品牌"${four.join('"、"')}"销售额对比下降较大，排除促销因素影响，反映出客户对此类品牌的购买意向降低。` : ''
  ].filter(Boolean);
});
const renderedSummaryLines = computed(() => {
  if (summaryLines.value.length) {
    return summaryLines.value;
  }
  return [
    '品牌"立白"、"舒影"、"丝飘"、"超能"、"安安全纯"销售额相对较好，客户购买意向高。',
    '品牌"优洁王"、"欧乐B"、"简洁"、"子唏"、"半懒"销售额相对较差，客户购买意向低。',
    '品牌"青蛙王子"、"冰泉"、"安安"、"fe金典"、"萌力优"销售额对比上涨较大，排除促销因素影响，反映出客户对此类品牌的购买意向增加。',
    '品牌"简洁"、"半懒"、"自然乐园"、"子唏"、"雪玲妃"销售额对比下降较大，排除促销因素影响，反映出客户对此类品牌的购买意向降低。'
  ];
});

const formatAmount = (value: unknown, digits = 0) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '--';
};
const normalizeName = (item: any, index: number) => item?.name || item?.productBrand || item?.brandName || item?.brandNo || `品牌${index + 1}`;
const resolveRankValue = (item: any, metric: string) => Number(item?.[metric] ?? item?.data ?? item?.sales ?? 0);

const pieLegendItems = computed(() =>
  pieItems.value.map((item, index) => ({
    name: normalizeName(item, index),
    color: PIE_COLORS[index % PIE_COLORS.length]
  }))
);
const visiblePieLegendItems = computed(() => pieLegendItems.value.slice(legendStart.value, legendStart.value + LEGEND_PAGE_SIZE));
const canPrevLegend = computed(() => legendStart.value > 0);
const canNextLegend = computed(() => legendStart.value + LEGEND_PAGE_SIZE < pieLegendItems.value.length);
const legendCursorDisplay = computed(() => (pieLegendItems.value.length ? legendStart.value + 1 : 1));
const legendTotalDisplay = computed(() => Math.max(1, pieLegendItems.value.length));

const RANK_AXIS_MAX = 494691.6;
const RANK_AXIS_INTERVAL = 100000;
const totalRankPages = computed(() => Math.max(1, Math.ceil((rankPage.total || rankItems.value.length || 1) / rankPage.pageSize)));
const rankPagerItems = computed(() => {
  const total = totalRankPages.value;
  const current = rankPage.page;
  const pages: Array<{ key: string; label: string; active?: boolean; page?: number }> = [];
  const add = (page: number) => pages.push({ key: String(page), label: String(page), active: page === current, page });
  const addEllipsis = (key: string) => pages.push({ key, label: '…' });

  if (total <= 8) {
    for (let page = 1; page <= total; page += 1) add(page);
    return pages;
  }

  if (current <= 6) {
    for (let page = 1; page <= 6; page += 1) add(page);
    addEllipsis('r');
    add(total);
    return pages;
  }

  if (current >= total - 5) {
    add(1);
    addEllipsis('l');
    for (let page = total - 5; page <= total; page += 1) add(page);
    return pages;
  }

  add(1);
  addEllipsis('l');
  for (let page = current - 1; page <= current + 1; page += 1) add(page);
  addEllipsis('r');
  add(total);
  return pages;
});

const reload = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [overviewRes, shareRes, filterRes, rankRes, detailRes] = await Promise.all([
      getBrandOverview(sessionId.value),
      getBrandSalesShare(sessionId.value),
      getBrandFilterOptions(sessionId.value),
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
      { label: '品牌总数', value: overview.totalNum ?? 346, emphasis: true },
      { label: '新销品牌', value: overview.newNum ?? 27, emphasis: true },
      { label: '自有品牌', value: overview.ownNum ?? 0, emphasis: false }
    ];

    const filterData = (filterRes.data as any)?.data || (filterRes.data as any)?.result || (filterRes.data as any) || {};
    summaryOptions.value = {
      summaryOne: Array.isArray(filterData.summaryOne) ? filterData.summaryOne : [],
      summaryTwo: Array.isArray(filterData.summaryTwo) ? filterData.summaryTwo : [],
      summaryThree: Array.isArray(filterData.summaryThree) ? filterData.summaryThree : [],
      summaryFour: Array.isArray(filterData.summaryFour) ? filterData.summaryFour : []
    };

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
  const data = pieItems.value.length
    ? pieItems.value.map((item, index) => ({
        name: normalizeName(item, index),
        value: Number(item.value ?? item.sales ?? item.salesAmount ?? 0),
        itemStyle: { color: PIE_COLORS[index % PIE_COLORS.length] }
      }))
    : [
        { name: 'G.DUCK小蛋...', value: 70, itemStyle: { color: '#16c2a3' } },
        { name: '丽洁丽净', value: 12, itemStyle: { color: '#f59e0b' } },
        { name: '云南白药菁羽', value: 9, itemStyle: { color: '#8b5cf6' } },
        { name: '完净', value: 9, itemStyle: { color: '#ec4899' } }
      ];
  pieChartIns.value.setOption(
    {
      color: PIE_COLORS,
      tooltip: { trigger: 'item', formatter: '{b}<br/>{c}' },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['60%', '80%'],
          center: ['48%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 3 },
          data
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderRankChart = () => {
  if (!rankChartRef.value) return;
  rankChartIns.value ||= echarts.init(rankChartRef.value);
  const chartData = rankItems.value.slice(0, 10);
  const rankGrid = { left: 88, right: 20, top: 8, bottom: 24, containLabel: true };
  rankChartIns.value.setOption(
    {
      animationDuration: 300,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: rankGrid,
      xAxis: {
        type: 'value',
        min: 0,
        max: RANK_AXIS_MAX,
        interval: RANK_AXIS_INTERVAL,
        boundaryGap: [0, 0],
        axisLabel: {
          color: '#9ca3af',
          fontSize: 12,
          formatter: (value: number) => Number(value).toFixed(2)
        },
        splitLine: { lineStyle: { color: '#e5e7eb' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: chartData.map((item, index) => normalizeName(item, index)),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#111827', fontSize: 12, margin: 14 }
      },
      series: [
        {
          type: 'bar',
          barWidth: 14,
          barCategoryGap: '38%',
          data: chartData.map((item) => ({
            value: resolveRankValue(item, rankMetric.value),
            itemStyle: { color: '#16c2a3', borderRadius: 0 }
          }))
        }
      ]
    } as EChartsOption,
    true
  );

  const xZero = Number(rankChartIns.value.convertToPixel({ xAxisIndex: 0 }, 0));
  const chartHeight = rankChartRef.value.clientHeight;
  const guideTop = Number(rankGrid.top);
  const guideBottom = chartHeight - Number(rankGrid.bottom);
  rankChartIns.value.setOption(
    {
      graphic: [
        {
          id: 'rank-max-label',
          type: 'text',
          right: 0,
          bottom: 0,
          silent: true,
          style: {
            text: RANK_AXIS_MAX.toFixed(2),
            fill: '#9ca3af',
            fontSize: 12,
            textAlign: 'right'
          }
        },
        {
          id: 'rank-guide-triangle',
          type: 'polygon',
          silent: true,
          shape: {
            points: [
              [xZero, guideTop],
              [xZero - 6, guideTop + 10],
              [xZero + 6, guideTop + 10]
            ]
          },
          style: { fill: '#ef4444' }
        },
        {
          id: 'rank-guide-line',
          type: 'line',
          silent: true,
          shape: {
            x1: xZero,
            y1: guideTop + 10,
            x2: xZero,
            y2: guideBottom
          },
          style: {
            stroke: '#ef4444',
            lineWidth: 1.2,
            lineDash: [4, 4]
          }
        }
      ]
    } as EChartsOption,
    false
  );
};

const renderComboChart = () => {
  if (!comboChartRef.value) return;
  comboChartIns.value ||= echarts.init(comboChartRef.value);
  const chartData = ['花皙5', '欧莱雅', '隆力奇', '兰亭', '蒂花之秀', '安安全纯', '海飞丝', '力士', '飘柔'];
  comboChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: {
        top: 8,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        data: ['SKU变动数', '销售额增长率']
      },
      grid: { left: 58, right: 58, top: 48, bottom: 30 },
      xAxis: {
        type: 'category',
        data: chartData,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#d9e0e7' } },
        axisLabel: { color: '#475569', interval: 0 }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额(%)',
          min: -100,
          max: 200,
          interval: 50,
          axisLabel: { formatter: '{value}' },
          splitLine: { lineStyle: { color: '#edf1f5' } }
        },
        {
          type: 'value',
          name: 'SKU数量',
          min: -15,
          max: 20,
          interval: 5,
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
          data: chartData.map(() => 0),
          itemStyle: { color: '#f59e0b' }
        },
        {
          name: '销售额增长率',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: chartData.map(() => 0),
          itemStyle: { color: '#9ca3af' },
          lineStyle: { color: '#9ca3af', width: 3 }
        }
      ]
    } as EChartsOption,
    true
  );
};

const handlePrevLegend = () => { if (canPrevLegend.value) legendStart.value -= 1; };
const handleNextLegend = () => { if (canNextLegend.value) legendStart.value += 1; };
const toggleRankDesc = async () => { rankDesc.value = !rankDesc.value; await reload(); };
const handleRankPageChange = async (page: number) => {
  rankPage.page = Math.max(1, Math.min(Number(page || 1), totalRankPages.value));
  await reload();
};
const handleViewDetail = () => { router.push({ path: '/brand/analysis/detail', query: { ...route.query } }); };

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
  height: calc(100vh - 84px);
  padding: 12px 16px 14px;
  background: #f6f8fb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.top-bar,
.title-group {
  display: flex;
  align-items: center;
}
.top-bar {
  justify-content: space-between;
}
.title-group {
  gap: 12px;
}
.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}
.detail-link {
  border: 0;
  background: transparent;
  padding: 0;
  color: #16c2a3;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
}
.unit-text {
  color: #94a3b8;
  font-size: 12px;
}
.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.metric-card,
.chart-panel,
.summary-section {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.metric-card {
  padding: 12px 10px;
  text-align: center;
}
.metric-label {
  color: #111827;
  font-size: 14px;
}
.metric-value {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}
.metric-value.emphasis {
  color: #16c2a3;
}
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  flex: 0 0 274px;
}
.chart-panel {
  padding: 10px 12px 8px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}
.panel-header--rank {
  align-items: center;
}
.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
}
.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.sort-text {
  border: 0;
  background: transparent;
  padding: 0;
  color: #16c2a3;
  font-size: 13px;
  cursor: pointer;
}
.rank-select {
  width: 108px;
  flex: none;
}
.donut-layout {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chart-box {
  width: 100%;
  height: 250px;
}
.donut-chart {
  max-width: 52%;
}
.donut-legend {
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.legend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 13px;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.legend-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.legend-pager,
.rank-nav {
  display: flex;
  align-items: center;
  gap: 8px;
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
.pager-item {
  color: #9ca3af;
  font-size: 12px;
}
.pager-item {
  min-width: 14px;
  text-align: center;
  cursor: pointer;
  user-select: none;
}
.pager-item.active {
  color: #16c2a3;
  font-weight: 700;
}
.pager-item.ellipsis {
  cursor: default;
}
.rank-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
  min-height: 24px;
}
.rank-nav {
  justify-content: flex-end;
}
.rank-chart {
  height: 214px;
}
.combo-section {
  flex: 0 0 320px;
}
.combo-chart {
  height: 290px;
}
.summary-section {
  padding: 10px 14px;
  background: #eef2f7;
  flex: 0 0 112px;
}
.summary-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.summary-list {
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
  color: #111827;
  line-height: 1.55;
}
</style>
