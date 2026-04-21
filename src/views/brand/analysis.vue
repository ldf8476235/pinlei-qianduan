<template>
  <div class="p-2 brand-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">品牌分析</span>
          <el-button link type="primary" class="detail-link" @click="handleViewDetail">详情 &gt;</el-button>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
        </div>
      </div>
    </el-card>

    <div class="metric-row">
      <el-card v-for="item in metrics" :key="item.label" shadow="hover" class="page-card metric-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value" :class="{ emphasis: item.emphasis }">{{ item.value }}</div>
      </el-card>
    </div>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期各品牌销售占比</span>
            </div>
          </template>
          <div class="pie-wrap">
            <div ref="pieChartRef" class="chart-box medium-chart" />
            <div class="pie-legend">
              <div v-for="item in buildPieLegendItems" :key="item.name" class="pie-legend-item">
                <span class="pie-legend-dot" :style="{ background: item.color }" />
                <span class="pie-legend-name">{{ item.name }}</span>
                <span class="pie-legend-value">{{ item.percentText }}</span>
                <span class="pie-legend-arrow" :class="item.arrowClass">{{ item.arrow }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <div class="card-title-wrap">
                <span class="card-title">本期品牌业绩排名</span>
                <el-button link type="primary" class="desc-toggle" @click="rankDesc = !rankDesc">{{ rankDesc ? '降序' : '升序' }}</el-button>
              </div>
              <div class="rank-toolbar">
                <el-select v-model="rankMetric" class="rank-select" size="small">
                  <el-option label="销售额" value="salesAmount" />
                  <el-option label="销售量" value="salesQuantity" />
                </el-select>
                <el-pagination
                  v-model:current-page="rankPage.page"
                  :page-size="rankPage.pageSize"
                  :total="rankPage.total"
                  layout="prev, pager, next"
                  :pager-count="5"
                  background
                  small
                  @current-change="handleRankPageChange"
                />
              </div>
            </div>
          </template>
          <div ref="rankChartRef" class="chart-box medium-chart" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">品牌SKU数及销售对比变化</span>
            </div>
          </template>
          <div ref="comboChartRef" class="chart-box large-chart" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <div class="summary-box">
        <ul class="summary-list">
          <li>{{ summaryLines[0] }}</li>
          <li>{{ summaryLines[1] }}</li>
          <li>{{ summaryLines[2] }}</li>
          <li>{{ summaryLines[3] }}</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getBrandDetails, getBrandOverview, getBrandRanking, getBrandSalesShare } from '@/api/category/diagnosis/analysis';

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);
const metrics = ref([
  { label: '品牌总数', value: '--', emphasis: true },
  { label: '新销品牌', value: '--', emphasis: true },
  { label: '自有品牌', value: '--', emphasis: false }
]);
const tableRows = ref<any[]>([]);
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
const overviewData = ref<any>({});

const formatAmount = (value: unknown, digits = 0) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};

const resolveRankValue = (item: any, metric: string) => Number(item?.[metric] ?? item?.data ?? item?.sales ?? 0);

const buildPieLegendItems = computed(() =>
  pieItems.value.map((item, index) => {
    const compare = Number(item.comparePer ?? item.perCompare ?? item.perDiff ?? 0);
    return {
      name: item.name || item.productBrand || '--',
      color: item.color || ['#2A9D8F', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'][index % 6],
      percentText: formatPercent(item.per ?? item.salesPer ?? item.value ?? 0),
      arrow: compare > 0 ? '▲' : compare < 0 ? '▼' : '•',
      arrowClass: compare > 0 ? 'is-up' : compare < 0 ? 'is-down' : 'is-flat'
    };
  })
);

const summaryLines = computed(() => {
  const top = rankItems.value[0];
  const low = rankItems.value[rankItems.value.length - 1];
  const up = [...rankItems.value].sort((a, b) => Number(b.growthRate ?? 0) - Number(a.growthRate ?? 0))[0];
  const down = [...rankItems.value].sort((a, b) => Number(a.growthRate ?? 0) - Number(b.growthRate ?? 0))[0];
  return [
    `高销售额品牌 ${top?.productBrand || top?.name || '--'} 表现领先，建议持续保持当前运营节奏并强化资源投放。`,
    `表现较弱品牌 ${low?.productBrand || low?.name || '--'} 需重点关注曝光、转化与补货节奏。`,
    `环比涨幅较高品牌 ${up?.productBrand || up?.name || '--'} 体现购买意向提升，可继续放大优势。`,
    `环比下滑品牌 ${down?.productBrand || down?.name || '--'} 需要及时复盘客群变化与竞品冲击。`
  ];
});

const reload = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [overviewRes, shareRes, rankRes, listRes] = await Promise.all([
      getBrandOverview(sessionId.value),
      getBrandSalesShare(sessionId.value),
      getBrandRanking({ sessionId: sessionId.value, page: rankPage.page, size: rankPage.pageSize, type: rankMetric.value, order: rankDesc.value ? 'desc' : 'asc' }),
      getBrandDetails({ sessionId: sessionId.value, page: 1, size: 10 })
    ]);
    const overview: any = overviewRes.data || {};
    overviewData.value = overview;
    metrics.value = [
      { label: '品牌总数', value: overview.totalNum ?? 0, emphasis: true },
      { label: '新销品牌', value: overview.newNum ?? 0, emphasis: true },
      { label: '自有品牌', value: overview.ownNum ?? 0, emphasis: false }
    ];
    pieItems.value = Array.isArray((shareRes.data as any)?.data) ? (shareRes.data as any).data : Array.isArray(shareRes.data) ? (shareRes.data as any) : [];
    rankItems.value = Array.isArray((rankRes.data as any)?.data?.list)
      ? (rankRes.data as any).data.list
      : Array.isArray((rankRes.data as any)?.data)
        ? (rankRes.data as any).data
        : [];
    tableRows.value = Array.isArray((listRes.data as any)?.data?.records) ? (listRes.data as any).data.records : [];
    rankPage.total = Number((rankRes.data as any)?.data?.total || rankItems.value.length || 0);
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
      tooltip: { trigger: 'item' },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['56%', '76%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: pieItems.value.map((item, index) => ({
            name: item.name || item.productBrand || `品牌${index + 1}`,
            value: Number(item.value ?? item.sales ?? 0),
            itemStyle: { color: item.color || ['#2A9D8F', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5] }
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
  const sorted = [...rankItems.value].sort((a, b) => {
    const diff = resolveRankValue(a, rankMetric.value) - resolveRankValue(b, rankMetric.value);
    return rankDesc.value ? -diff : diff;
  });
  const data = sorted.slice(0, rankPage.pageSize);
  rankChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 110, right: 30, top: 24, bottom: 20 },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => formatAmount(value) },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map((item) => item.productBrand || item.brandNo || item.name || '--'),
        axisTick: { show: false },
        axisLine: { show: false }
      },
      graphic: [
        {
          type: 'line',
          left: 110,
          top: 24,
          shape: { x1: 0, y1: 0, x2: 0, y2: 260 },
          style: { stroke: '#ef4444', lineWidth: 1.2 }
        }
      ],
      series: [
        {
          type: 'bar',
          data: data.map((item) => ({
            value: resolveRankValue(item, rankMetric.value),
            itemStyle: { color: '#0f766e', borderRadius: [0, 8, 8, 0] }
          })),
          barWidth: 16
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderComboChart = () => {
  if (!comboChartRef.value) return;
  comboChartIns.value ||= echarts.init(comboChartRef.value);
  const names = rankItems.value.map((item) => item.productBrand || item.brandNo || item.name || '--');
  const skuDiff = rankItems.value.map((item) => Number(item.skuChange ?? item.skuDiff ?? 0));
  const salesRate = rankItems.value.map((item) => Number(item.growthRate ?? item.salesGrowthRate ?? 0));
  const maxSku = Math.max(1, ...skuDiff.map((v) => Math.abs(v)));
  const maxRate = Math.max(1, ...salesRate.map((v) => Math.abs(v)));
  comboChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { top: 8, data: ['SKU变动数', '销售额增长率'] },
      grid: { left: 56, right: 56, top: 48, bottom: 30 },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { interval: 0, rotate: names.length > 8 ? 30 : 0 }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额百分比',
          axisLabel: { formatter: '{value}%' },
          min: -maxRate,
          max: maxRate,
          splitLine: { lineStyle: { color: '#eef2f7' } }
        },
        {
          type: 'value',
          name: 'SKU数量差值',
          min: -maxSku,
          max: maxSku,
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'SKU变动数',
          type: 'bar',
          yAxisIndex: 1,
          data: skuDiff,
          itemStyle: { color: '#f59e0b' },
          barWidth: 14
        },
        {
          name: '销售额增长率',
          type: 'line',
          yAxisIndex: 0,
          data: salesRate,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { color: '#3b82f6', width: 3 },
          areaStyle: {
            color: 'rgba(59, 130, 246, 0.08)'
          }
        }
      ]
    } as EChartsOption,
    true
  );
};

const handleRankPageChange = async (page: number) => {
  rankPage.page = page;
  await reload();
};

watch([rankMetric, rankDesc], async () => {
  await reload();
});

const handleViewDetail = () => {
  router.push({ path: '/brand/analysis/detail', query: { ...route.query } });
};

const handlePriceSetting = () => {
  ElMessage.info('此处为前端占位按钮');
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
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card,
.chart-row,
.metric-row,
.summary-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
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
  color: #0f172a;
}

.detail-link {
  padding-left: 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  min-height: 104px;
  border-radius: 12px;
  padding: 12px;
}

.metric-label {
  color: #64748b;
  font-size: 13px;
}

.metric-value {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.metric-value.emphasis {
  color: #0f766e;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title,
.card-title-wrap {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.desc-toggle {
  padding-left: 0;
}

.rank-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-select {
  width: 110px;
}

.chart-box {
  width: 100%;
}

.medium-chart {
  height: 360px;
}

.large-chart {
  height: 420px;
}

.pie-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 12px;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  border-left: 1px solid #e5e7eb;
  padding-left: 12px;
}

.pie-legend-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.pie-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.pie-legend-name {
  color: #334155;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pie-legend-value {
  color: #64748b;
}

.pie-legend-arrow {
  font-size: 12px;
  font-weight: 700;
}

.pie-legend-arrow.is-up {
  color: #16a34a;
}

.pie-legend-arrow.is-down {
  color: #dc2626;
}

.pie-legend-arrow.is-flat {
  color: #64748b;
}

.summary-card {
  background: #f3f4f6;
  border-radius: 14px;
}

.summary-box {
  background: #f3f4f6;
  padding: 16px 18px;
  border-radius: 14px;
}

.summary-list {
  margin: 0;
  padding-left: 20px;
  color: #4b5563;
  line-height: 1.9;
}

.summary-list li + li {
  margin-top: 6px;
}

@media (max-width: 1200px) {
  .pie-wrap {
    grid-template-columns: 1fr;
  }

  .pie-legend {
    border-left: 0;
    border-top: 1px solid #e5e7eb;
    padding-left: 0;
    padding-top: 12px;
  }
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

  .metric-row {
    grid-template-columns: 1fr;
  }

  .medium-chart {
    height: 320px;
  }
}
</style>
