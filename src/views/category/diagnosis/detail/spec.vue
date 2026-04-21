<template>
  <div class="p-2 spec-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">规格分析</span>
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
              <span class="card-title">本期各规格销售占比</span>
            </div>
          </template>
          <div class="pie-wrap">
            <div ref="pieChartRef" class="chart-box medium-chart" />
            <div class="pie-legend">
              <div v-for="item in pieLegendItems" :key="item.name" class="pie-legend-item">
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
                <span class="card-title">本期规格业绩排名</span>
                <el-button link type="primary" class="desc-toggle" @click="rankDesc = !rankDesc">{{ rankDesc ? '降序' : '升序' }}</el-button>
              </div>
              <div class="rank-toolbar">
                <el-select v-model="rankMetric" class="rank-select" size="small">
                  <el-option label="销售额" value="sales" />
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
              <span class="card-title">规格SKU数及销售对比变化</span>
            </div>
          </template>
          <div ref="comboChartRef" class="chart-box large-chart" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card summary-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <div class="summary-box">
        <ul class="summary-list">
          <li v-for="line in summaryLines" :key="line">{{ line }}</li>
        </ul>
      </div>
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
  { label: '规格总数', value: '--', emphasis: true },
  { label: '新销规格', value: '--', emphasis: true }
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

const pieItems = ref<any[]>([]);
const rankItems = ref<any[]>([]);
const comboItems = ref<any[]>([]);
const detailRows = ref<any[]>([]);

const chartColors = ['#2a9d8f', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

const formatNumber = (value: unknown, digits = 0) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};

const resolveName = (item: any) => item?.specName || item?.name || item?.label || item?.spec || '--';
const resolveColor = (index: number, color?: string) => color || chartColors[index % chartColors.length];
const resolveSalesValue = (item: any) => Number(item?.sales ?? item?.salesAmount ?? item?.value ?? item?.data ?? 0);
const resolveCompareRate = (item: any) => Number(item?.comparePer ?? item?.perCompare ?? item?.perDiff ?? item?.salesCompareRate ?? 0);
const resolveGrowthRate = (item: any) => Number(item?.salesGrowth ?? item?.salesInc ?? item?.growthRate ?? item?.salesGrowthRate ?? 0);
const resolveSkuChange = (item: any) => Number(item?.skuChange ?? item?.skuInc ?? item?.skuDiff ?? item?.skuGrowth ?? 0);

const pieLegendItems = computed(() =>
  pieItems.value.map((item, index) => {
    const compare = resolveCompareRate(item);
    return {
      name: resolveName(item),
      color: resolveColor(index, item?.color),
      percentText: formatPercent(item?.salesPer ?? item?.per ?? item?.value ?? 0),
      arrow: compare > 0 ? '▲' : compare < 0 ? '▼' : '•',
      arrowClass: compare > 0 ? 'is-up' : compare < 0 ? 'is-down' : 'is-flat'
    };
  })
);

const summaryLines = computed(() => {
  const salesSource = rankItems.value.length ? rankItems.value : detailRows.value;
  const top = [...salesSource].sort((a, b) => resolveSalesValue(b) - resolveSalesValue(a))[0];
  const low = [...salesSource].sort((a, b) => resolveSalesValue(a) - resolveSalesValue(b))[0];
  const growthSource = comboItems.value.length ? comboItems.value : detailRows.value;
  const up = [...growthSource].sort((a, b) => resolveGrowthRate(b) - resolveGrowthRate(a))[0];
  const down = [...growthSource].sort((a, b) => resolveGrowthRate(a) - resolveGrowthRate(b))[0];
  return [
    `高销售额优质规格 ${resolveName(top)} 销售额 ${formatNumber(resolveSalesValue(top))} 元，客户购买意向高，建议持续强化陈列与动销资源。`,
    `表现弱势规格 ${resolveName(low)} 销售额 ${formatNumber(resolveSalesValue(low))} 元，客户购买意向低，建议重点复盘定价、陈列与组合策略。`,
    `环比大幅上涨规格 ${resolveName(up)} 销售额增长率 ${formatPercent(resolveGrowthRate(up))}，客户购买意向提升，可继续承接增长势能。`,
    `环比大幅下滑规格 ${resolveName(down)} 销售额增长率 ${formatPercent(resolveGrowthRate(down))}，客户购买意向降低，需要及时分析波动原因。`
  ];
});

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
            name: resolveName(item),
            value: resolveSalesValue(item),
            itemStyle: { color: resolveColor(index, item?.color) }
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
  const data = [...rankItems.value].sort((a, b) => {
    const diff = resolveSalesValue(a) - resolveSalesValue(b);
    return rankDesc.value ? -diff : diff;
  });
  const markValue = data.length ? resolveSalesValue(data[Math.floor(data.length / 2)]) : 0;
  rankChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 110, right: 28, top: 24, bottom: 24 },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', formatter: (value: number) => formatNumber(value) },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#334155' },
        data: data.map((item) => resolveName(item))
      },
      series: [
        {
          type: 'bar',
          barWidth: 16,
          data: data.map((item) => ({
            value: resolveSalesValue(item),
            itemStyle: { color: '#0f766e', borderRadius: [0, 8, 8, 0] }
          })),
          markLine: {
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: '#ef4444', width: 1.2, type: 'solid' },
            data: [{ xAxis: markValue }]
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
  const names = source.map((item) => resolveName(item));
  const skuData = source.map((item) => resolveSkuChange(item));
  const salesRateData = source.map((item) => resolveGrowthRate(item));
  const maxSku = Math.max(1, ...skuData.map((item) => Math.abs(item)));
  const maxRate = Math.max(1, ...salesRateData.map((item) => Math.abs(item)));
  comboChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { top: 10, data: ['SKU变动数', '销售额增长率'] },
      grid: { left: 64, right: 60, top: 52, bottom: 40 },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: '#475569', interval: 0, rotate: names.length > 8 ? 28 : 0 }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额百分比',
          min: -maxRate,
          max: maxRate,
          axisLabel: { formatter: '{value}%' },
          splitLine: { lineStyle: { color: '#e2e8f0' } }
        },
        {
          type: 'value',
          name: 'SKU差值数量',
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
          barWidth: 16,
          data: skuData,
          itemStyle: { color: '#f59e0b' }
        },
        {
          name: '销售额增长率',
          type: 'line',
          yAxisIndex: 0,
          data: salesRateData,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#ffffff', borderColor: '#7dd3fc', borderWidth: 2 },
          lineStyle: { color: '#7dd3fc', width: 3 }
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

    const overview = (overviewRes.data as any)?.data || overviewRes.data || {};
    metrics.value = [
      { label: '规格总数', value: formatNumber(overview.totalNum ?? overview.specTotalNum ?? 0), emphasis: true },
      { label: '新销规格', value: formatNumber(overview.newNum ?? overview.newSpecNum ?? 0), emphasis: true }
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

const resizeCharts = () => {
  pieChartIns.value?.resize();
  rankChartIns.value?.resize();
  comboChartIns.value?.resize();
};

watch([rankMetric, rankDesc], async () => {
  rankPage.page = 1;
  await reload();
});

watch(
  () => route.query.sessionId,
  async () => {
    rankPage.page = 1;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
