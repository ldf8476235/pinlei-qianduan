<template>
  <div class="p-2 spec-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="page-title">规格分析</span>
          <el-button link type="primary" class="detail-link" @click="handleViewDetail">详情 &gt;</el-button>
        </div>
        <span class="unit-text">金额单位：元</span>
      </div>
    </el-card>

    <section class="metric-row">
      <el-card v-for="item in metrics" :key="item.label" shadow="hover" class="page-card metric-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value" :class="{ emphasis: item.emphasis }">{{ item.value }}</div>
      </el-card>
    </section>

    <section class="main-grid">
      <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">本期各规格销售占比</span>
          </div>
        </template>
        <div class="pie-layout">
          <div ref="pieChartRef" class="chart-box pie-chart" />
          <div class="pie-legend">
            <div class="pie-legend-list">
              <div v-for="item in visiblePieLegendItems" :key="item.name" class="pie-legend-item">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-name" :title="item.name">{{ item.name }}</span>
              </div>
            </div>
            <div class="legend-pager">
              <button type="button" class="legend-arrow" :disabled="!canPrevLegend" @click="handlePrevLegend">▲</button>
              <span class="legend-page">{{ legendPageDisplay }}/{{ legendTotalDisplay }}</span>
              <button type="button" class="legend-arrow" :disabled="!canNextLegend" @click="handleNextLegend">▼</button>
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
        <template #header>
          <div class="panel-header panel-header--rank">
            <div class="panel-title-wrap">
              <span class="panel-title">本期规格业绩排名</span>
              <el-button link type="primary" class="sort-text" @click="toggleRankDesc">{{ rankDesc ? '降序' : '升序' }}</el-button>
            </div>
            <el-select v-model="rankMetric" class="rank-select" size="small">
              <el-option label="销售额" value="sales" />
              <el-option label="销售量" value="quantity" />
            </el-select>
          </div>
        </template>
        <div class="rank-nav">
          <el-pagination
            v-model:current-page="rankPage.page"
            :page-size="rankPage.pageSize"
            :total="rankPage.total"
            layout="prev, pager, next"
            :pager-count="6"
            background
            small
            @current-change="handleRankPageChange"
          />
        </div>
        <div ref="rankChartRef" class="chart-box rank-chart" />
      </el-card>
    </section>

    <section class="combo-section">
      <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">规格SKU数及销售对比变化</span>
          </div>
        </template>
        <div ref="comboChartRef" class="chart-box combo-chart" />
      </el-card>
    </section>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="panel-header">
          <span class="panel-title">总结与建议</span>
        </div>
      </template>
      <ul class="summary-list">
        <li>规格"5kg"、"4.8kg"、"4.75kg"、"50g"、"100g"销售额相对较好，客户购买意向高。</li>
        <li>规格"1支装()"、"1500g"、"278"、"五双圈"、"13p"销售额相对较差客户购买意向低。</li>
        <li>规格"3000g"、"2.5L"、"720g+280g"、"2.38kg"、"100g+100g"销售额对比上涨较大，排除促销因素影响，反映出客户对此类规格的购买意向增加。</li>
        <li>规格"278"、"五双圈"、"250g(J)"、"285cm*5p"、"13p"销售额对比下降较大，排除促销因素影响，反映出客户对此类规格的购买意向降低。</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import {
  getSpecDetails,
  getSpecOverview,
  getSpecRanking,
  getSpecSalesShare,
  getSpecSkuSalesChange
} from '@/api/category/diagnosis/analysis';

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);

const metrics = ref([
  { label: '规格总数', value: '1198', emphasis: true },
  { label: '新销规格', value: '72', emphasis: true }
]);

const pieChartRef = ref<HTMLDivElement>();
const rankChartRef = ref<HTMLDivElement>();
const comboChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const rankChartIns = ref<echarts.ECharts>();
const comboChartIns = ref<echarts.ECharts>();

const rankMetric = ref('sales');
const rankDesc = ref(true);
const rankPage = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const legendPageSize = 4;
const legendStart = ref(0);
const pieItems = ref<any[]>([]);
const rankItems = ref<any[]>([]);
const comboItems = ref<any[]>([]);
const detailRows = ref<any[]>([]);

const colors = ['#16c2a3', '#ef4444', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#22c55e', '#64748b'];

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};

const getName = (item: any, index = 0) => item?.specName || item?.name || item?.spec || item?.label || `规格${index + 1}`;
const getSales = (item: any) => Number(item?.sales ?? item?.salesAmount ?? item?.value ?? item?.data ?? 0);
const getQuantity = (item: any) => Number(item?.sku ?? item?.skuNum ?? item?.currentSku ?? item?.value ?? 0);
const getGrowth = (item: any) => Number(item?.growthRate ?? item?.salesGrowthRate ?? item?.compareRate ?? item?.rate ?? 0);
const getSkuChange = (item: any) => Number(item?.skuChange ?? item?.skuInc ?? item?.changeSku ?? 0);

const pieLegendItems = computed(() =>
  pieItems.value.map((item, index) => ({
    name: getName(item, index),
    color: item?.color || colors[index % colors.length]
  }))
);

const visiblePieLegendItems = computed(() => pieLegendItems.value.slice(legendStart.value, legendStart.value + legendPageSize));
const legendPageDisplay = computed(() => (pieLegendItems.value.length ? legendStart.value + 1 : 1));
const legendTotalDisplay = computed(() => Math.max(1, pieLegendItems.value.length));
const canPrevLegend = computed(() => legendStart.value > 0);
const canNextLegend = computed(() => legendStart.value + legendPageSize < pieLegendItems.value.length);

const sortedRankItems = computed(() =>
  [...rankItems.value].sort((left, right) => {
    const leftValue = rankMetric.value === 'quantity' ? getQuantity(left) : getSales(left);
    const rightValue = rankMetric.value === 'quantity' ? getQuantity(right) : getSales(right);
    const diff = leftValue - rightValue;
    return rankDesc.value ? -diff : diff;
  })
);

const summaryLines = [
  '规格"5kg"、"4.8kg"、"4.75kg"、"50g"、"100g"销售额相对较好，客户购买意向高。',
  '规格"1支装()"、"1500g"、"278"、"五双圈"、"13p"销售额相对较差客户购买意向低。',
  '规格"3000g"、"2.5L"、"720g+280g"、"2.38kg"、"100g+100g"销售额对比上涨较大，排除促销因素影响，反映出客户对此类规格的购买意向增加。',
  '规格"278"、"五双圈"、"250g(J)"、"285cm*5p"、"13p"销售额对比下降较大，排除促销因素影响，反映出客户对此类规格的购买意向降低。'
];

const renderPieChart = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
  pieChartIns.value.setOption(
    {
      color: colors,
      tooltip: { trigger: 'item', formatter: '{b}<br/>{c}' },
      series: [
        {
          type: 'pie',
          radius: ['60%', '78%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 3 },
          data: pieItems.value.map((item, index) => ({
            name: getName(item, index),
            value: getSales(item),
            itemStyle: { color: item?.color || colors[index % colors.length] }
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
  const data = sortedRankItems.value.slice(0, 10);
  const values = data.map((item) => (rankMetric.value === 'quantity' ? getQuantity(item) : getSales(item)));
  const maxValue = values.length ? Math.max(...values) : 320488.28;
  rankChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 92, right: 28, top: 6, bottom: 14, containLabel: true },
      xAxis: {
        type: 'value',
        min: 0,
        max: 320488.28,
        interval: 50000,
        axisLabel: { color: '#6b7280', formatter: (value: number) => formatAmount(value, 2) },
        splitLine: { lineStyle: { color: '#edf1f5' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#334155' },
        data: data.map((item, index) => getName(item, index))
      },
      series: [
        {
          type: 'bar',
          barWidth: 16,
          data: data.map((item) => ({
            value: rankMetric.value === 'quantity' ? getQuantity(item) : getSales(item),
            itemStyle: { color: '#0f766e', borderRadius: [0, 8, 8, 0] }
          })),
          markLine: {
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: '#ef4444', width: 1.2, type: 'dashed' },
            data: [{ xAxis: maxValue * 0.72 }]
          },
          markPoint: {
            symbol: 'triangle',
            symbolSize: 12,
            label: { show: false },
            data: data.length
              ? [
                  {
                    coord: [rankMetric.value === 'quantity' ? getQuantity(data[0]) : getSales(data[0]), getName(data[0], 0)],
                    itemStyle: { color: '#ef4444' }
                  }
                ]
              : []
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
  const source = comboItems.value.length ? comboItems.value : detailRows.value;
  const names = source.map((item, index) => getName(item, index));
  const skuData = source.map((item) => getSkuChange(item));
  const rateData = source.map((item) => getGrowth(item));
  comboChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: {
        top: 6,
        left: 16,
        itemWidth: 10,
        itemHeight: 10,
        data: ['SKU变动数', '销售额增长率']
      },
      grid: { left: 52, right: 56, top: 38, bottom: 26, containLabel: true },
      xAxis: {
        type: 'category',
        data: names,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#d9e0e7' } },
        axisLabel: { color: '#475569', interval: 0, rotate: 0 }
      },
      yAxis: [
        {
          type: 'value',
          min: -70,
          max: 10,
          interval: 10,
          axisLabel: { formatter: '{value}' },
          splitLine: { lineStyle: { color: '#edf1f5' } }
        },
        {
          type: 'value',
          min: -9,
          max: 6,
          interval: 3,
          axisLabel: { formatter: '{value}' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'SKU变动数',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: 16,
          data: skuData,
          itemStyle: { color: '#f59e0b' }
        },
        {
          name: '销售额增长率',
          type: 'line',
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 7,
          data: rateData,
          itemStyle: { color: '#9ca3af' },
          lineStyle: { color: '#9ca3af', width: 2.5 }
        }
      ]
    } as EChartsOption,
    true
  );
};

const reload = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [overviewRes, shareRes, rankingRes, comboRes, detailsRes] = await Promise.all([
      getSpecOverview(sessionId.value),
      getSpecSalesShare(sessionId.value),
      getSpecRanking({
        sessionId: sessionId.value,
        page: rankPage.page,
        size: rankPage.pageSize,
        type: rankMetric.value,
        order: rankDesc.value ? 'desc' : 'asc'
      }),
      getSpecSkuSalesChange(sessionId.value),
      getSpecDetails({ sessionId: sessionId.value, page: 1, size: 20 })
    ]);

    const overview: any = overviewRes.data || {};
    metrics.value = [
      { label: '规格总数', value: formatAmount(overview.totalNum ?? overview.specTotalNum ?? 1198, 0), emphasis: true },
      { label: '新销规格', value: formatAmount(overview.newNum ?? overview.newSpecNum ?? 72, 0), emphasis: true }
    ];

    pieItems.value = Array.isArray((shareRes.data as any)?.data)
      ? (shareRes.data as any).data
      : Array.isArray(shareRes.data as any)
        ? (shareRes.data as any)
        : [];
    rankItems.value = Array.isArray((rankingRes.data as any)?.data?.list)
      ? (rankingRes.data as any).data.list
      : Array.isArray((rankingRes.data as any)?.data?.records)
        ? (rankingRes.data as any).data.records
        : Array.isArray((rankingRes.data as any)?.data)
          ? (rankingRes.data as any).data
          : [];
    comboItems.value = Array.isArray((comboRes.data as any)?.data?.list)
      ? (comboRes.data as any).data.list
      : Array.isArray((comboRes.data as any)?.data)
        ? (comboRes.data as any).data
        : [];
    detailRows.value = Array.isArray((detailsRes.data as any)?.data?.records)
      ? (detailsRes.data as any).data.records
      : Array.isArray((detailsRes.data as any)?.data?.list)
        ? (detailsRes.data as any).data.list
        : Array.isArray((detailsRes.data as any)?.data)
          ? (detailsRes.data as any).data
          : [];

    rankPage.total = Number((rankingRes.data as any)?.data?.total || (rankingRes.data as any)?.data?.pages || rankItems.value.length || 0);
    legendStart.value = Math.min(legendStart.value, Math.max(0, pieLegendItems.value.length - legendPageSize));
    if (!pieLegendItems.value.length) legendStart.value = 0;

    await nextTick();
    renderPieChart();
    renderRankChart();
    renderComboChart();
  } finally {
    loading.value = false;
  }
};

const handleViewDetail = () => {
  router.push({ path: '/spec/analysis/detail', query: { ...route.query } });
};

const handleRankPageChange = async (page: number) => {
  rankPage.page = page;
  await reload();
};

const handlePrevLegend = () => {
  if (canPrevLegend.value) legendStart.value -= 1;
};

const handleNextLegend = () => {
  if (canNextLegend.value) legendStart.value += 1;
};

const toggleRankDesc = async () => {
  rankDesc.value = !rankDesc.value;
  rankPage.page = 1;
  await reload();
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  rankChartIns.value?.resize();
  comboChartIns.value?.resize();
};

watch(
  () => [rankMetric.value, route.query.sessionId],
  async () => {
    rankPage.page = 1;
    legendStart.value = 0;
    await reload();
  }
);

onMounted(async () => {
  await reload();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  rankChartIns.value?.dispose();
  comboChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.spec-analysis-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100vh - 84px);
  overflow: hidden;
  background: #f5f7fa;
}

.page-card {
  border: 1px solid #e5e7eb;
  box-shadow: none;
  background: #fff;
}

.header-card {
  flex: none;
  padding: 10px 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.detail-link {
  padding-left: 0;
  color: #0f9f9a;
}

.unit-text {
  font-size: 13px;
  color: #94a3b8;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  flex: none;
}

.metric-card {
  height: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  line-height: 1;
}

.metric-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
  color: #0f9f9a;
  line-height: 1;
}

.main-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  height: 292px;
  flex: none;
}

.chart-card {
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 24px;
}

.panel-title {
  font-size: 15px;
  font-weight: 400;
  color: #0f172a;
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-text {
  padding-left: 0;
  color: #0f9f9a;
}

.rank-select {
  width: 96px;
}

.pie-layout {
  display: flex;
  align-items: center;
  gap: 12px;
  height: calc(100% - 24px);
}

.pie-chart {
  flex: 1 1 auto;
  height: 232px;
}

.pie-legend {
  width: 176px;
  height: 232px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.pie-legend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pie-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 18px;
  font-size: 12px;
  color: #334155;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.legend-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
}

.legend-arrow {
  border: none;
  background: transparent;
  color: #0f9f9a;
  cursor: pointer;
  padding: 0 2px;
}

.legend-arrow:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.rank-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.rank-chart {
  height: 214px;
}

.combo-section {
  flex: none;
  height: 218px;
}

.combo-chart {
  height: 180px;
}

.summary-card {
  flex: none;
  height: 128px;
  overflow: hidden;
  border: none;
  background: #eef2f5;
  box-shadow: none;
}

.summary-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.35;
  font-size: 13px;
  color: #334155;
}

.summary-list li {
  list-style: disc;
}

:deep(.el-card__header) {
  padding: 10px 14px 0;
  border-bottom: none;
}

:deep(.el-card__body) {
  padding: 10px 14px 12px;
}

:deep(.metric-card .el-card__body) {
  padding: 0;
  height: 100%;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #0f9f9a;
}

:deep(.el-pagination button:hover) {
  color: #0f9f9a;
}
</style>
