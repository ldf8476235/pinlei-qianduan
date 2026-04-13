<template>
  <div class="p-2 category-diagnosis-detail-page">
    <el-card shadow="hover" class="mb-[12px]">
      <div class="filter-line">数据日期: {{ summary.filterInfo.currentDateRangeText }}；对比日期: {{ summary.filterInfo.compareDateRangeText }}</div>
      <div class="filter-line">
        组织: {{ summary.filterInfo.orgName }}；业态: {{ summary.filterInfo.retailTypeName }}；商圈: {{ summary.filterInfo.circleName }}；
      </div>
      <div class="filter-line">门店: {{ summary.filterInfo.storeRangeName }}</div>

      <div class="core-line mt-[10px]">
        <div class="core-left">
          {{ summary.coreInfo.categoryCode }}{{ summary.coreInfo.categoryName }}（{{ summary.coreInfo.categoryLevelName }}）
        </div>
        <div class="core-center">
          本期角色:
          <el-tag type="success" effect="dark" class="ml-1">{{ summary.coreInfo.currentRoleName }}</el-tag>
        </div>
        <div class="core-right">
          该门店范围下品类的预设角色为“{{ summary.coreInfo.presetRoleName }}”，预设SKU数为{{ formatNumber(summary.coreInfo.presetSkuCount) }}
        </div>
      </div>
    </el-card>

    <el-row :gutter="12">
      <el-col :lg="5" :md="7" :sm="24" :xs="24">
        <el-card shadow="hover" class="left-nav-card">
          <div class="left-module-title">纵观品类整体</div>
          <div class="left-module-sub">掌握品类整体情况和发力点</div>
          <div class="left-nav-list">
            <div
              v-for="item in mainNavList"
              :key="item.key"
              class="left-nav-item"
              :class="{ active: activeMainNav === item.key }"
              @click="activeMainNav = item.key"
            >
              <span class="left-nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </div>
          </div>

          <div class="left-sub-modules">
            <div class="left-sub-item">
              <div class="left-sub-title">定位异常品项</div>
              <div class="left-sub-desc">及时优化表现差单品</div>
            </div>
            <div class="left-sub-item">
              <div class="left-sub-title">深究用户需求</div>
              <div class="left-sub-desc">助力品项优化与补充</div>
            </div>
            <div class="left-sub-item">
              <div class="left-sub-title">整合调整方向</div>
              <div class="left-sub-desc">指导品类优化与执行</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="19" :md="17" :sm="24" :xs="24">
        <div v-if="activeMainNav !== 'performance'" class="placeholder-panel">
          <el-empty description="该模块待接入" />
        </div>
        <template v-else>
          <el-card shadow="hover" class="mb-[12px]">
            <template #header>
              <div class="section-title">品类业绩</div>
            </template>
            <div class="metrics-row">
              <div v-for="item in metrics.firstRow" :key="item.metricKey" class="metric-card">
                <div class="metric-name">
                  <span>{{ item.metricName }}</span>
                  <el-tooltip :content="item.metricDesc || '暂无说明'" placement="top">
                    <span class="metric-tip">?</span>
                  </el-tooltip>
                </div>
                <div class="metric-value">{{ item.currentValue }}</div>
                <div class="metric-compare" :class="compareClass(item.compareValue)">
                  <span class="metric-arrow">{{ compareArrow(item.compareValue) }}</span>
                  <span>{{ compareText(item.compareValue, item.compareType) }}</span>
                </div>
              </div>
            </div>

            <div class="metrics-row mt-[8px]">
              <div v-for="item in metrics.secondRow" :key="item.metricKey" class="metric-card">
                <div class="metric-name">
                  <span>{{ item.metricName }}</span>
                  <el-tooltip :content="item.metricDesc || '暂无说明'" placement="top">
                    <span class="metric-tip">?</span>
                  </el-tooltip>
                </div>
                <div class="metric-value">{{ item.currentValue }}</div>
                <div class="metric-compare" :class="compareClass(item.compareValue)">
                  <span class="metric-arrow">{{ compareArrow(item.compareValue) }}</span>
                  <span>{{ compareText(item.compareValue, item.compareType) }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card shadow="hover">
            <template #header>
              <div class="trend-header">
                <span class="section-title">趋势变化</span>
                <div class="trend-tabs">
                  <el-button
                    v-for="item in trendMetricTabs"
                    :key="item.key"
                    size="small"
                    :type="activeTrendMetric === item.key ? 'success' : 'default'"
                    @click="handleTrendMetricChange(item.key)"
                  >
                    {{ item.label }}
                  </el-button>
                </div>
              </div>
            </template>
            <div v-loading="trendLoading" class="trend-chart-wrap">
              <div ref="chartRef" class="trend-chart" />
            </div>
          </el-card>
        </template>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="CategoryDiagnosisDetail" lang="ts">
import * as echarts from 'echarts';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryDiagnosisDetailMetrics,
  getCategoryDiagnosisDetailSummary,
  getCategoryDiagnosisDetailTrend
} from '@/api/category/diagnosis/detail';
import type {
  CategoryDiagnosisDetailQuery,
  CategoryDiagnosisDetailSummaryVO,
  CategoryDiagnosisMetricGroupVO,
  CategoryDiagnosisMetricVO,
  CategoryDiagnosisTrendVO
} from '@/api/category/diagnosis/detail/types';

const route = useRoute();

const chartRef = ref<HTMLDivElement>();
const chartIns = ref<echarts.ECharts>();

const activeMainNav = ref('performance');
const activeTrendMetric = ref('salesAmount');

const mainNavList = [
  { key: 'performance', label: '品类业绩', icon: '◉' },
  { key: 'subCategory', label: '子类贡献', icon: '◉' },
  { key: 'channel', label: '渠道业绩', icon: '◉' },
  { key: 'customer', label: '客户分析', icon: '◉' }
];

const trendMetricTabs = [
  { key: 'salesAmount', label: '销售额' },
  { key: 'salesQty', label: '销售量' },
  { key: 'grossProfit', label: '毛利额' },
  { key: 'grossMarginRate', label: '毛利率' },
  { key: 'customerCount', label: '客数' },
  { key: 'customerUnitPrice', label: '客单价' },
  { key: 'stockSalesRatio', label: '库销比' }
];

const summary = reactive<CategoryDiagnosisDetailSummaryVO>({
  filterInfo: {
    currentDateRangeText: '--',
    compareDateRangeText: '--',
    orgName: '--',
    retailTypeName: '全部业态',
    circleName: '全部商圈',
    storeRangeName: '--'
  },
  coreInfo: {
    categoryCode: '--',
    categoryName: '--',
    categoryLevelName: '一级品类',
    currentRoleName: '--',
    presetRoleName: '--',
    presetSkuCount: 0
  }
});

const metrics = reactive<CategoryDiagnosisMetricGroupVO>({
  firstRow: [],
  secondRow: []
});

const trendData = ref<CategoryDiagnosisTrendVO>({
  metricKey: 'salesAmount',
  metricName: '销售额',
  unit: '',
  currentSeries: [],
  compareSeries: []
});

const query = computed<CategoryDiagnosisDetailQuery>(() => ({
  categoryId: route.query.categoryId as string,
  storeNo: (route.query.storeNo as string) || '',
  startDate: (route.query.startDate as string) || '',
  endDate: (route.query.endDate as string) || '',
  compareStartDate: (route.query.compareStartDate as string) || '',
  compareEndDate: (route.query.compareEndDate as string) || ''
}));

const summaryRequest = useRequest(async (params: CategoryDiagnosisDetailQuery) => await getCategoryDiagnosisDetailSummary(params), {
  onSuccess: (res) => {
    if (res?.data) {
      Object.assign(summary, res.data);
    }
  }
});

const metricsRequest = useRequest(async (params: CategoryDiagnosisDetailQuery) => await getCategoryDiagnosisDetailMetrics(params), {
  onSuccess: (res) => {
    if (res?.data) {
      const firstRow = Array.isArray(res.data.firstRow) ? res.data.firstRow : [];
      const secondRow = Array.isArray(res.data.secondRow) ? res.data.secondRow : [];
      metrics.firstRow = firstRow;
      metrics.secondRow = secondRow;
    }
  }
});

const trendRequest = useRequest(
  async (params: CategoryDiagnosisDetailQuery & { metricKey: string }) => await getCategoryDiagnosisDetailTrend(params),
  {
    onSuccess: (res) => {
      if (res?.data) {
        trendData.value = res.data;
        renderTrendChart();
      }
    }
  }
);

const trendLoading = computed(() => trendRequest.loading.value);

const compareClass = (value: number) => {
  if (value > 0) return 'is-up';
  if (value < 0) return 'is-down';
  return 'is-flat';
};

const compareArrow = (value: number) => {
  if (value > 0) return '▲';
  if (value < 0) return '▼';
  return '—';
};

const compareText = (value: number, type: string) => {
  const abs = Math.abs(Number(value || 0));
  if (type === 'diff') {
    return `对比差距 ${abs.toFixed(2)}`;
  }
  return `对比增长 ${abs.toFixed(2)}%`;
};

const formatNumber = (value: number | string) => {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toLocaleString('zh-CN') : value;
};

const initChart = () => {
  if (!chartRef.value) return;
  if (!chartIns.value) {
    chartIns.value = echarts.init(chartRef.value);
  }
};

const renderTrendChart = () => {
  initChart();
  if (!chartIns.value) return;

  const currentSeries = trendData.value.currentSeries || [];
  const compareSeries = trendData.value.compareSeries || [];
  const xAxis = currentSeries.map((item) => item.date);
  const currentValues = currentSeries.map((item) => Number(item.value || 0));
  const compareValues = compareSeries.map((item) => Number(item.value || 0));
  const unit = trendData.value.unit || '';

  chartIns.value.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      top: 6,
      data: ['本期', '对比日期']
    },
    grid: {
      left: 48,
      right: 20,
      top: 42,
      bottom: 34
    },
    xAxis: {
      type: 'category',
      data: xAxis
    },
    yAxis: {
      type: 'value',
      name: unit
    },
    series: [
      {
        name: '本期',
        type: 'line',
        smooth: true,
        data: currentValues,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 2, color: '#3b82f6' }
      },
      {
        name: '对比日期',
        type: 'line',
        smooth: true,
        data: compareValues,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 2, color: '#f59e0b' }
      }
    ]
  });
};

const handleTrendMetricChange = async (metricKey: string) => {
  if (activeTrendMetric.value === metricKey) return;
  activeTrendMetric.value = metricKey;
  await loadTrend();
};

const loadSummary = async () => {
  await summaryRequest.run(query.value);
};

const loadMetrics = async () => {
  await metricsRequest.run(query.value);
};

const loadTrend = async () => {
  await trendRequest.run({
    ...query.value,
    metricKey: activeTrendMetric.value
  });
};

const loadPageData = async () => {
  await Promise.all([loadSummary(), loadMetrics(), loadTrend()]);
};

const resizeChart = () => chartIns.value?.resize();

onMounted(async () => {
  await loadPageData();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  chartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-diagnosis-detail-page {
  background: #f5f7fa;
}

.filter-line {
  font-size: 13px;
  color: #374151;
  line-height: 1.7;
}

.core-line {
  display: grid;
  grid-template-columns: 1.3fr 1fr 2fr;
  gap: 12px;
  align-items: center;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 10px;
}

.core-left {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.core-center {
  font-size: 14px;
  color: #1f2937;
}

.core-right {
  font-size: 14px;
  color: #1f2937;
}

.left-nav-card {
  background: #e8f8f5;
  border: 1px solid #cfeee7;
}

.left-module-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f766e;
}

.left-module-sub {
  font-size: 12px;
  color: #0f766e;
  margin-top: 4px;
}

.left-nav-list {
  margin-top: 12px;
}

.left-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  color: #0f766e;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.left-nav-item:hover {
  background: rgba(13, 148, 136, 0.1);
}

.left-nav-item.active {
  background: #0f766e;
  color: #fff;
}

.left-nav-icon {
  font-size: 12px;
}

.left-sub-modules {
  margin-top: 16px;
  border-top: 1px solid #bde7df;
  padding-top: 12px;
}

.left-sub-item {
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.55);
}

.left-sub-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f766e;
}

.left-sub-desc {
  font-size: 12px;
  color: #0f766e;
  margin-top: 2px;
}

.placeholder-panel {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  min-height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.metric-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
  min-height: 108px;
}

.metric-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 12px;
  color: #4b5563;
}

.metric-tip {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: help;
}

.metric-value {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.metric-compare {
  margin-top: 8px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.metric-compare.is-up {
  color: #16a34a;
}

.metric-compare.is-down {
  color: #dc2626;
}

.metric-compare.is-flat {
  color: #6b7280;
}

.metric-arrow {
  font-size: 10px;
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.trend-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.trend-chart-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 380px;
}

.trend-chart {
  width: 100%;
  height: 380px;
}

@media (max-width: 1600px) {
  .metrics-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .core-line {
    grid-template-columns: 1fr;
  }

  .metrics-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
