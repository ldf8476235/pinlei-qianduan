<template>
  <div class="p-2 supplier-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="title-block">
          <div class="page-title-row">
            <span class="page-title">供应商分析</span>
            <el-link type="primary" :underline="false" class="detail-link" @click="handleViewDetail">详情 &gt;</el-link>
          </div>
        </div>

        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" plain @click="handleViewDetail">详情</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="chart-card-header">
              <span class="card-title">近3月供应商销售占比</span>
            </div>
          </template>
          <div class="pie-layout">
            <div ref="pieChartRef" class="chart-box" />
            <div class="pie-legend">
              <div v-for="item in pieLegendItems" :key="item.key" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-name">{{ item.name }}</span>
              </div>
              <div class="legend-pager">
                <span class="pager-arrow">▲</span>
                <span>{{ pieLegendPageText }}</span>
                <span class="pager-arrow">▼</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="chart-card-header">
              <div class="chart-title-group">
                <span class="card-title">近3月供应商指标排名</span>
                <button type="button" class="rank-direction" @click="toggleRankDesc">{{ rankDesc ? '降序' : '升序' }}</button>
              </div>
              <el-select v-model="activeMetric" style="width: 180px" @change="handleMetricChange">
                <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </template>
          <div class="bar-wrap" @mousemove="handleRankTooltipMousemove" @mouseleave="hideRankTooltip">
            <div ref="barChartRef" class="chart-box chart-box--bar" />
            <div v-if="rankTooltip.visible" class="rank-tooltip" :style="{ left: `${rankTooltip.x}px`, top: `${rankTooltip.y}px` }">
              <div class="rank-tooltip-main">
                <span class="rank-tooltip-dot" />
                <span>{{ rankTooltip.vendorNo }}</span>
              </div>
              <div class="rank-tooltip-name">{{ rankTooltip.vendorName }}</div>
              <div class="rank-tooltip-value">
                {{ activeMetricLabel }}：
                <strong>{{ rankTooltip.value }}</strong>
              </div>
            </div>
            <div class="bar-pager">
              <button type="button" class="page-arrow" :disabled="rankPage.page <= 1" @click="handleRankPageChange(rankPage.page - 1)">&lt;</button>
              <button
                v-for="(item, index) in rankingPageMarks"
                :key="`${item}-${index}`"
                type="button"
                class="page-mark"
                :class="{ active: item === rankPage.page, 'page-mark--ellipsis': item === '...' }"
                :disabled="item === '...'"
                @click="item !== '...' && handleRankPageChange(Number(item))"
              >
                {{ item }}
              </button>
              <button type="button" class="page-arrow" :disabled="rankPage.page >= totalRankPages" @click="handleRankPageChange(rankPage.page + 1)">&gt;</button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card advice-card mt-[12px]">
      <template #header>
        <div class="advice-card-header">
          <span class="advice-accent" />
          <span class="card-title">总结与建议</span>
        </div>
      </template>

      <ul class="advice-list">
        <li v-if="summarySentenceOne"><span class="bullet">●</span><span>{{ summarySentenceOne }}</span></li>
        <li v-if="summarySentenceTwo"><span class="bullet">●</span><span>{{ summarySentenceTwo }}</span></li>
        <li v-if="summarySentenceThree"><span class="bullet">●</span><span>{{ summarySentenceThree }}</span></li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import { getVendorRanking, getVendorSalesShare, getVendorSummary } from '@/api/supplier';
import type { VendorRankingItemVO, VendorSalesShareItemVO, VendorSummaryVO } from '@/api/supplier/types';

const metricOptions = [
  { label: '单品产出', value: '1' },
  { label: '毛利率', value: '2' },
  { label: 'SKU数', value: '3' },
  { label: '新商品SKU数', value: '4' },
  { label: '异议单金额占比', value: '5' }
];

const legendColors = ['#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#15803d'];

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const statusState = ref<any>();
const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();
const activeMetric = ref(metricOptions[0].value);
const rankDesc = ref(true);
const rankPage = reactive({ page: 1, pageSize: 10 });
const salesShare = ref<VendorSalesShareItemVO[]>([]);
const ranking = ref<VendorRankingItemVO[]>([]);
const rankingTotal = ref(0);
const rankingAverage = ref(0);
const rankingMax = ref(0);
const summary = ref<VendorSummaryVO>({});
const loading = ref(false);
const rankTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  vendorNo: '',
  vendorName: '',
  value: ''
});

const pieLegendItems = computed(() => {
  return [...salesShare.value]
    .sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))
    .slice(0, 5)
    .map((item, index) => ({
      key: `${item.productVendorNo || index}`,
      name: item.productVendorNo || item.productVendorName || '--',
      color: legendColors[index % legendColors.length]
    }));
});

const pieLegendPageText = computed(() => {
  const totalPages = Math.max(1, Math.ceil((salesShare.value.length || 1) / 5));
  return `1/${totalPages}`;
});

const totalRankPages = computed(() => Math.max(1, Math.ceil((rankingTotal.value || ranking.value.length || 1) / rankPage.pageSize)));

const rankingPageMarks = computed<Array<number | '...'>>(() => {
  const totalPages = totalRankPages.value;
  const current = rankPage.page;
  if (totalPages <= 6) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
  if (current >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', current - 1, current, current + 1, '...', totalPages];
});

const activeMetricLabel = computed(() => metricOptions.find((item) => item.value === activeMetric.value)?.label || '指标');
const isMoneyMetric = computed(() => activeMetric.value === '1');

const formatMetricValue = (value: unknown) => {
  const text = Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: isMoneyMetric.value ? 2 : 0,
    maximumFractionDigits: 2
  });
  return isMoneyMetric.value ? `${text}元` : text;
};

const hideRankTooltip = () => {
  rankTooltip.visible = false;
};

const handleRankTooltipMousemove = (event: MouseEvent) => {
  if (!barChartRef.value || !ranking.value.length) return;
  const wrap = event.currentTarget as HTMLElement;
  const wrapRect = wrap.getBoundingClientRect();
  const chartRect = barChartRef.value.getBoundingClientRect();
  const gridTop = 18;
  const gridBottom = 28;
  const chartData = ranking.value.slice(0, rankPage.pageSize);
  const plotTop = chartRect.top + gridTop;
  const plotHeight = chartRect.height - gridTop - gridBottom;
  const relativeY = event.clientY - plotTop;

  if (relativeY < 0 || relativeY > plotHeight || !chartData.length) {
    hideRankTooltip();
    return;
  }

  const index = Math.max(0, Math.min(chartData.length - 1, Math.floor((relativeY / plotHeight) * chartData.length)));
  const item = chartData[index];
  if (!item) {
    hideRankTooltip();
    return;
  }

  const tooltipWidth = 230;
  const tooltipHeight = 118;
  rankTooltip.visible = true;
  rankTooltip.vendorNo = item.productVendorNo || '--';
  rankTooltip.vendorName = item.productVendorName || item.productVendorNo || '--';
  rankTooltip.value = formatMetricValue(item.data);
  rankTooltip.x = Math.min(Math.max(12, event.clientX - wrapRect.left + 14), Math.max(12, wrapRect.width - tooltipWidth - 12));
  rankTooltip.y = Math.min(Math.max(12, event.clientY - wrapRect.top - 54), Math.max(12, wrapRect.height - tooltipHeight - 12));
};

const summarySentenceOne = computed(() => {
  const list = (summary.value.summaryOne || []).filter(Boolean);
  return list.length ? `${list.join('、')}等，单品产出较少且毛利率较低，建议优化该供应商下的商品，可优先对供应SKU较少的供应商处理。` : '';
});

const summarySentenceTwo = computed(() => {
  const list = (summary.value.summaryTwo || []).filter(Boolean);
  return list.length ? `${list.join('、')}等，单品产出较少，建议减少或更换该供应商下的商品。` : '';
});

const summarySentenceThree = computed(() => {
  const list = (summary.value.summaryThree || []).filter(Boolean);
  return list.length ? `${list.join('、')}等，缺货率相对较高(超过5%)，建议规范该供应商的履约行为。` : '';
});



const renderPie = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
  const data = [...salesShare.value]
    .sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))
    .slice(0, 5)
    .map((item, index) => ({
      name: item.productVendorName || item.productVendorNo || '--',
      value: Number(item.sales || 0),
      itemStyle: { color: legendColors[index % legendColors.length] }
    }));

  pieChartIns.value.setOption(
    {
      tooltip: {
        trigger: 'item',
        formatter: (param: any) => `${param.name}<br/>销售额：${Number(param.value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '76%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderBar = () => {
  if (!barChartRef.value) return;
  barChartIns.value ||= echarts.init(barChartRef.value);
  const values = ranking.value.map((item) => Number(item.data || 0));
  const maxValue = values.length ? Math.max(...values) : 0;
  const guideValue = Number(rankingAverage.value || 0) || (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
  const axisMax = Math.max(maxValue, Number(rankingMax.value || 0), guideValue, 1);
  const axisLimit = Math.ceil((axisMax * 1.08) / 1000) * 1000 || axisMax * 1.08;
  const chartData = ranking.value.slice(0, rankPage.pageSize);
  const normalizeVendorLabel = (item: VendorRankingItemVO) => {
    const no = item.productVendorNo || '--';
    const name = item.productVendorName || '';
    return name && name !== no ? `${no} ${name}` : no;
  };
  barChartIns.value.setOption(
    {
      animationDuration: 300,
      tooltip: { show: false },
      grid: { left: 112, right: 18, top: 18, bottom: 28, containLabel: true },
      xAxis: {
        type: 'value',
        min: 0,
        max: axisLimit,
        boundaryGap: [0, 0],
        axisLabel: {
          color: '#8b95a1',
          fontSize: 12,
          formatter: (value: number) => Number(value).toFixed(2)
        },
        splitLine: { lineStyle: { color: '#e1e8f0', type: 'dashed' } },
        axisLine: { lineStyle: { color: '#9ca3af' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12,
          width: 132,
          overflow: 'truncate',
          margin: 12
        },
        data: chartData.map(normalizeVendorLabel)
      },
      series: [
        {
          type: 'bar',
          barWidth: 14,
          silent: true,
          barGap: '-100%',
          itemStyle: { color: '#e9f7f5' },
          data: chartData.map(() => axisLimit)
        },
        {
          type: 'bar',
          barWidth: 14,
          itemStyle: { color: '#16c2a3', borderRadius: [0, 999, 999, 0] },
          data: chartData.map((item) => Number(item.data || 0)),
          markLine: {
            symbol: ['triangle', 'none'],
            symbolSize: [12, 16],
            symbolRotate: 0,
            label: { show: false },
            lineStyle: { color: '#ef4444', width: 1.5, type: 'dashed' },
            data: [{ xAxis: guideValue }]
          }
        }
      ]
    } as EChartsOption,
    true
  );
};

const loadRanking = async () => {
  if (!sessionId.value) return;
  const res = await getVendorRanking(sessionId.value, activeMetric.value, rankPage.page, rankPage.pageSize, rankDesc.value ? 'desc' : 'asc');
  ranking.value = res.data?.list || [];
  rankingTotal.value = Number(res.data?.total || ranking.value.length || 0);
  rankingAverage.value = Number(res.data?.ave || 0);
  rankingMax.value = Number(res.data?.maxData || 0);
  await nextTick();
  renderBar();
};

const toggleRankDesc = async () => {
  rankDesc.value = !rankDesc.value;
  rankPage.page = 1;
  await loadRanking();
};

const handleMetricChange = async () => {
  rankPage.page = 1;
  await loadRanking();
};

const handleRankPageChange = async (page: number) => {
  rankPage.page = Math.max(1, Math.min(Number(page || 1), totalRankPages.value));
  await loadRanking();
};

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [statusRes, shareRes, summaryRes] = await Promise.all([
      getDiagnosisSessionStatus(sessionId.value),
      getVendorSalesShare(sessionId.value),
      getVendorSummary(sessionId.value)
    ]);
    statusState.value = statusRes.data;
    salesShare.value = shareRes.data || [];
    summary.value = summaryRes.data || {};
    await loadRanking();
    await nextTick();
    renderPie();
  } finally {
    loading.value = false;
  }
};

const handleViewDetail = () => {
  router.push({ path: '/supplier/analysis/detail', query: { ...route.query } });
};

const resize = () => {
  pieChartIns.value?.resize();
  barChartIns.value?.resize();
};

onMounted(async () => {
  await loadData();
  window.addEventListener('resize', resize);
});

watch(
  () => route.query.sessionId,
  async () => {
    await loadData();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.supplier-analysis-page {
  min-height: calc(100vh - 84px);
  background:
    radial-gradient(circle at top left, rgb(20 184 166 / 8%), transparent 34%),
    linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%);
}

.page-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgb(15 23 42 / 5%);
  border-radius: 14px;
  overflow: hidden;
}

.header-card {
  margin-bottom: 12px;
}

.page-header,
.page-title-row,
.page-actions,
.chart-card-header,
.chart-title-group,
.advice-card-header {
  display: flex;
  align-items: center;
}

.page-header,
.chart-card-header {
  justify-content: space-between;
  gap: 12px;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.page-title-row {
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.detail-link {
  font-size: 14px;
  font-weight: 600;
}

.page-subtitle,
.unit-text {
  font-size: 13px;
  color: #64748b;
}

.rank-direction {
  border: 0;
  background: transparent;
  padding: 0;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.18s ease;
}

.rank-direction::before {
  content: '⇅';
  margin-right: 5px;
  color: #94a3b8;
  font-size: 13px;
}

.rank-direction:hover {
  color: #16c2a3;
}

.page-subtitle {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.page-actions {
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.chart-title-group {
  gap: 10px;
}

.chart-box {
  width: 100%;
  height: 360px;
}

.chart-box--bar {
  height: 340px;
}

.bar-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
}

.rank-tooltip {
  position: absolute;
  z-index: 20;
  width: 230px;
  padding: 14px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 14px 30px rgb(15 23 42 / 16%);
  color: #6b7280;
  font-size: 15px;
  line-height: 1.55;
  pointer-events: none;
  backdrop-filter: blur(6px);
}

.rank-tooltip-main {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}

.rank-tooltip-dot {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  background: #16c2a3;
  box-shadow: 0 0 0 4px rgb(22 194 163 / 12%);
  flex: 0 0 auto;
}

.rank-tooltip-name {
  margin-top: 7px;
  font-size: 16px;
}

.rank-tooltip-value {
  margin-top: 5px;
  font-size: 16px;
}

.rank-tooltip-value strong {
  color: #64748b;
  font-weight: 700;
}

.pie-layout {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.pie-legend {
  width: 220px;
  padding: 10px 0 10px 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  flex: 0 0 auto;
}

.legend-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-pager {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #334155;
  font-size: 12px;
}

.pager-arrow {
  color: #0f766e;
}

.bar-pager {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 0 0 6px;
}

.page-arrow,
.page-mark {
  border: 0;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
}

.page-arrow {
  width: 26px;
  height: 26px;
  color: #1f2937;
  font-size: 22px;
  line-height: 1;
}

.page-arrow:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.page-mark {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  background: transparent;
}

.page-mark.active {
  color: #16c2a3;
  background: transparent;
}

.page-mark--ellipsis {
  background: transparent;
  cursor: default;
}

.advice-card {
  margin-top: 12px;
  background: #fbfdff;
}

.advice-card-header {
  gap: 10px;
}

.advice-accent {
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: #14b8a6;
}

.advice-list {
  margin: 0;
  padding: 0 0 0 4px;
  list-style: none;
  line-height: 1.9;
  color: #111827;
}

.advice-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.bullet {
  flex: 0 0 auto;
  color: #111827;
  line-height: 1.9;
}
</style>
