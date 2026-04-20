<template>
  <div class="p-2 category-diagnosis-detail-page">
    <el-card shadow="hover" class="mb-[12px]">
      <div class="filter-line">本期日期: {{ summary.filterInfo.currentDateRangeText }}；对比日期: {{ summary.filterInfo.compareDateRangeText }}</div>
      <div class="filter-line">组织: {{ summary.filterInfo.orgName }}；业态: {{ summary.filterInfo.retailTypeName }}；商圈: {{ summary.filterInfo.circleName }}</div>
      <div class="filter-line">门店: {{ summary.filterInfo.storeRangeName }}</div>

      <div class="core-line mt-[10px]">
        <div class="core-left">{{ summary.coreInfo.categoryCode }} {{ summary.coreInfo.categoryName }}（{{ summary.coreInfo.categoryLevelName }}）</div>
        <div class="core-center">
          诊断状态:
          <el-tag :type="statusTagType" effect="dark" class="ml-1">{{ statusText }}</el-tag>
        </div>
        <div class="core-right">
          sessionId: {{ sessionId || '--' }}
          <span v-if="statusState?.dataVersion">；版本: {{ statusState.dataVersion }}</span>
        </div>
      </div>
    </el-card>

    <el-alert
      v-if="!sessionReady"
      class="mb-[12px]"
      type="info"
      :closable="false"
      :title="`诊断预计算中，当前阶段：${statusState?.currentStage || 'WAIT_PRECOMPUTE'}`"
      :description="`进度 ${formatPercent(statusState?.progressPercent)}，页面会自动刷新。`"
      show-icon
    />

    <el-row :gutter="12">
      <el-col :lg="5" :md="7" :sm="24" :xs="24">
        <el-card shadow="hover" class="left-nav-card">
          <div v-for="group in navGroups" :key="group.key" class="left-nav-group">
            <div class="left-nav-group-header" @click="toggleGroup(group.key)">
              <div class="left-nav-group-text">
                <div class="left-nav-group-title">{{ group.title }}</div>
                <div class="left-nav-group-sub">{{ group.subtitle }}</div>
              </div>
              <span class="left-nav-arrow" :class="{ expanded: isGroupExpanded(group.key) }">›</span>
            </div>

            <transition name="nav-fold">
              <div v-show="isGroupExpanded(group.key)" class="left-nav-group-body">
                <template v-if="group.type === 'main'">
                  <div
                    v-for="item in group.items"
                    :key="item.key"
                    class="left-nav-item"
                    :class="{ active: !activeSideModule && activeMainNav === item.key }"
                    @click="handleMainNavClick(item.key, group.key)"
                  >
                    <span class="left-nav-icon">{{ item.icon }}</span>
                    <span>{{ item.label }}</span>
                  </div>
                </template>

                <template v-else>
                  <div
                    v-for="item in group.items"
                    :key="item.key"
                    class="left-sub-item"
                    :class="{ active: activeSideModule === item.key }"
                    @click="handleSideModuleClick(item, group.key)"
                  >
                    <span class="left-sub-dot" />
                    <div class="left-sub-content">
                      <div class="left-sub-title">{{ item.title }}</div>
                      <div class="left-sub-desc">{{ item.desc }}</div>
                      <div v-if="item.extra" class="left-sub-extra">{{ item.extra }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </transition>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="19" :md="17" :sm="24" :xs="24">
        <template v-if="isPerformanceView">
          <el-card shadow="hover" class="mb-[12px]" v-loading="overviewLoading">
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
        <component :is="activeEmbeddedComponent" v-else-if="activeEmbeddedComponent" />
        <div v-else class="placeholder-panel">
          <el-empty description="该模块待接入" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="CategoryDiagnosisDetail" lang="ts">
import * as echarts from 'echarts';
import { markRaw } from 'vue';
import { useRequest } from '@/hooks/useRequest';
import { getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import { getCategoryDiagnosisDetailSummary, getCategoryDiagnosisDetailTrend } from '@/api/category/diagnosis/detail';
import type {
  CategoryDiagnosisDetailQuery,
  CategoryDiagnosisDetailSummaryVO,
  CategoryDiagnosisMetricGroupVO,
  CategoryDiagnosisMetricVO,
  CategoryDiagnosisTrendVO,
  DiagnosisOverviewResponse
} from '@/api/category/diagnosis/detail/types';
import type { DiagnosisSessionStatusResponse } from '@/api/category/diagnosis/types';
import SubClassView from './sub-class.vue';
import ChannelView from './channel.vue';
import AbcAnalysisView from '@/views/abc/analysis.vue';
import GrossContributionAnalysisView from '@/views/gross-contribution/analysis.vue';
import GmroiAnalysisView from '@/views/gmroi/analysis.vue';
import SupplierAnalysisView from '@/views/supplier/analysis.vue';
import PriceBandAnalysisView from '@/views/price-band/analysis.vue';
import BrandAnalysisView from '@/views/brand/analysis.vue';

const route = useRoute();

const chartRef = ref<HTMLDivElement>();
const chartIns = ref<echarts.ECharts>();
const pollTimer = ref<number | null>(null);
const NAV_STATE_KEY = 'category-diagnosis-detail-nav-state';

const activeMainNav = ref('performance');
const activeSideModule = ref('');
const activeTrendMetric = ref('sales');
const statusState = ref<DiagnosisSessionStatusResponse>();

type NavGroupType = 'main' | 'side';

interface NavGroupItem {
  key: string;
  label?: string;
  icon?: string;
  title?: string;
  desc?: string;
  extra?: string;
}

interface NavGroup {
  key: string;
  title: string;
  subtitle: string;
  type: NavGroupType;
  defaultExpanded: boolean;
  items: NavGroupItem[];
}

const navGroups: NavGroup[] = [
  {
    key: 'performanceGroup',
    title: '纵观品类整体',
    subtitle: '掌握品类整体情况和发力点',
    type: 'main',
    defaultExpanded: false,
    items: [
      { key: 'performance', label: '品类业绩', icon: '•' },
      { key: 'subCategory', label: '子类贡献', icon: '•' },
      { key: 'channel', label: '渠道业绩', icon: '•' },
      { key: 'customer', label: '客户分析', icon: '•' }
    ]
  },
  {
    key: 'abnormalGroup',
    title: '定位异常品项',
    subtitle: '及时优化表现差单品',
    type: 'side',
    defaultExpanded: false,
    items: [
      { key: 'abcAnalysis', title: 'ABC结构分析', desc: '及时优化表现差的商品' },
      { key: 'grossContribution', title: '毛利贡献率分析', desc: '聚焦高销低毛与低销高毛商品' },
      { key: 'gmroiAnalysis', title: 'GMROI分析', desc: '识别低回报与高潜力商品结构' },
      { key: 'supplierAnalysis', title: '供应商分析', desc: '识别供应商贡献与履约风险' }
    ]
  },
  {
    key: 'demandGroup',
    title: '深究用户需求',
    subtitle: '助力品项优化与补充',
    type: 'side',
    defaultExpanded: true,
    items: [
      { key: 'priceBandAnalysis', title: '价格带分析', desc: '洞察用户偏好价格区间' },
      { key: 'brandAnalysis', title: '品牌分析', desc: '识别品牌表现与用户偏好' },
      { key: 'specAnalysis', title: '规格分析', desc: '识别规格偏好与需求差异' },
      { key: 'tagAnalysis', title: '标签分析', desc: '分析标签结构与用户偏好' }
    ]
  },
  {
    key: 'adjustGroup',
    title: '整合调整方向',
    subtitle: '指导品类优化与执行',
    type: 'side',
    defaultExpanded: false,
    items: [
      { key: 'summaryAnalysis', title: '整体情况总结', desc: '汇总诊断结果与核心结论' },
      { key: 'removeGoods', title: '建议淘汰商品', desc: '识别优先优化与淘汰商品' },
      { key: 'introduceDirection', title: '建议引品方向', desc: '输出引品与补充方向' }
    ]
  }
];

const expandedGroupKeys = ref<string[]>([]);

const embeddedMainViewMap = {
  subCategory: markRaw(SubClassView),
  channel: markRaw(ChannelView)
} as const;

const embeddedSideViewMap = {
  abcAnalysis: markRaw(AbcAnalysisView),
  grossContribution: markRaw(GrossContributionAnalysisView),
  gmroiAnalysis: markRaw(GmroiAnalysisView),
  supplierAnalysis: markRaw(SupplierAnalysisView),
  priceBandAnalysis: markRaw(PriceBandAnalysisView),
  brandAnalysis: markRaw(BrandAnalysisView)
} as const;

const trendMetricTabs = [
  { key: 'sales', label: '销售额', unit: '元' },
  { key: 'gross', label: '毛利额', unit: '元' }
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
    categoryLevelName: '四级品类',
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
  metricKey: 'sales',
  metricName: '销售额',
  unit: '元',
  currentSeries: [],
  compareSeries: []
});

const query = computed<CategoryDiagnosisDetailQuery>(() => ({
  sessionId: (route.query.sessionId as string) || '',
  categoryId: route.query.categoryId as string,
  categoryName: (route.query.categoryName as string) || '',
  categoryLevel: (route.query.categoryLevel as string) || '',
  storeNo: (route.query.storeNo as string) || '',
  startDate: (route.query.startDate as string) || '',
  endDate: (route.query.endDate as string) || '',
  compareStartDate: (route.query.compareStartDate as string) || '',
  compareEndDate: (route.query.compareEndDate as string) || ''
}));

const formatCategoryLevelName = (level?: string | number) => {
  const levelNumber = Number(level || 0);
  if (levelNumber >= 1 && levelNumber <= 5) {
    return `${['', '一级', '二级', '三级', '四级', '五级'][levelNumber]}品类`;
  }
  return '品类';
};

const sessionId = computed(() => query.value.sessionId || '');
const sessionReady = computed(() => Boolean(statusState.value?.ready));
const statusText = computed(() => (sessionReady.value ? 'READY' : statusState.value?.status || 'PENDING'));
const statusTagType = computed(() => {
  if (sessionReady.value) return 'success';
  if (statusState.value?.status === 'FAILED') return 'danger';
  return 'warning';
});

const isPerformanceView = computed(() => !activeSideModule.value && activeMainNav.value === 'performance');
const activeEmbeddedComponent = computed(() => {
  if (activeSideModule.value && activeSideModule.value in embeddedSideViewMap) {
    return embeddedSideViewMap[activeSideModule.value as keyof typeof embeddedSideViewMap];
  }
  if (activeMainNav.value in embeddedMainViewMap) {
    return embeddedMainViewMap[activeMainNav.value as keyof typeof embeddedMainViewMap];
  }
  return null;
});

const getDefaultExpandedGroupKeys = () => navGroups.filter((group) => group.defaultExpanded).map((group) => group.key);

const readNavState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(NAV_STATE_KEY);
    return raw ? (JSON.parse(raw) as { expandedGroupKeys?: string[]; activeMainNav?: string; activeSideModule?: string }) : null;
  } catch {
    return null;
  }
};

const writeNavState = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    NAV_STATE_KEY,
    JSON.stringify({
      expandedGroupKeys: expandedGroupKeys.value,
      activeMainNav: activeMainNav.value,
      activeSideModule: activeSideModule.value
    })
  );
};

const syncNavState = () => {
  const state = readNavState();
  expandedGroupKeys.value = state?.expandedGroupKeys?.length ? state.expandedGroupKeys : getDefaultExpandedGroupKeys();
  activeMainNav.value = state?.activeMainNav || 'performance';
  activeSideModule.value = state?.activeSideModule || '';
};

const isGroupExpanded = (groupKey: string) => expandedGroupKeys.value.includes(groupKey);

const toggleGroup = (groupKey: string) => {
  if (isGroupExpanded(groupKey)) {
    expandedGroupKeys.value = expandedGroupKeys.value.filter((key) => key !== groupKey);
  } else {
    expandedGroupKeys.value = [...expandedGroupKeys.value, groupKey];
  }
  writeNavState();
};

const ensureGroupExpanded = (groupKey: string) => {
  if (!isGroupExpanded(groupKey)) {
    expandedGroupKeys.value = [...expandedGroupKeys.value, groupKey];
    writeNavState();
  }
};

const statusRequest = useRequest(async (id: string) => await getDiagnosisSessionStatus(id), {
  onSuccess: (res) => {
    if (res?.data) {
      statusState.value = res.data;
    }
  }
});

const overviewRequest = useRequest(async (id: string) => await getCategoryDiagnosisDetailSummary(id), {
  onSuccess: (res) => {
    if (res?.data) {
      applyOverview(res.data);
    }
  }
});

const trendRequest = useRequest(async (params: { sessionId: string; metricCode: string }) => await getCategoryDiagnosisDetailTrend(params.sessionId, params.metricCode), {
  onSuccess: (res) => {
    if (res?.data) {
      trendData.value = buildTrendView(res.data, activeTrendMetric.value);
      renderTrendChart();
    }
  }
});

const overviewLoading = computed(() => overviewRequest.loading.value || statusRequest.loading.value);
const trendLoading = computed(() => trendRequest.loading.value || statusRequest.loading.value);

const compareClass = (value: number) => {
  if (value > 0) return 'is-up';
  if (value < 0) return 'is-down';
  return 'is-flat';
};

const compareArrow = (value: number) => {
  if (value > 0) return '▲';
  if (value < 0) return '▼';
  return '•';
};

const compareText = (value: number, type: string) => {
  const abs = Math.abs(Number(value || 0));
  if (type === 'diff') {
    return `对比差距 ${abs.toFixed(2)}`;
  }
  return `对比增长 ${abs.toFixed(2)}%`;
};

const formatNumber = (value: number | string | undefined, digits = 2) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits }) : '--';
};

const formatPercent = (value?: number) => `${Number(value || 0).toFixed(0)}%`;

const buildMetric = (
  metricKey: string,
  metricName: string,
  currentValue: number | undefined,
  compareValue: number | undefined,
  compareType: 'growth' | 'diff',
  metricDesc: string,
  unit = ''
): CategoryDiagnosisMetricVO => ({
  metricKey,
  metricName,
  metricDesc,
  currentValue: unit === '%' ? `${Number(currentValue || 0).toFixed(2)}%` : formatNumber(currentValue),
  compareValue: Number(compareValue || 0),
  compareType,
  unit
});

const buildMetrics = (overview: DiagnosisOverviewResponse): CategoryDiagnosisMetricGroupVO => ({
  firstRow: [
    buildMetric('sku', 'SKU数', overview.currentClassSku, overview.comparativeGrowthRate, 'growth', '当前品类SKU数量'),
    buildMetric('sales', '销售额', overview.currentSales, overview.comparativeSales, 'growth', '当前品类销售额'),
    buildMetric('gross', '毛利额', overview.currentGross, overview.comparativeGross, 'growth', '当前品类毛利额'),
    buildMetric('grossRate', '毛利率', overview.currentGrossRate, overview.comparativeGrossRate, 'diff', '毛利率', '%'),
    buildMetric('saleQuantity', '销售量', overview.currentSaleQuantity, overview.comparativeSaleQuantity, 'growth', '当前品类销售量'),
    buildMetric('customerCount', '客数', overview.currentCustomerCount, overview.comparativeCustomerCount, 'growth', '当前品类客数'),
    buildMetric('customerPrice', '客单价', overview.currentCustomerPrice, overview.comparativeCustomerPrice, 'growth', '当前品类客单价')
  ],
  secondRow: [
    buildMetric('avgInventory', '平均库存', overview.currentAvgInventory, overview.comparativeAvgInventory, 'growth', '当前品类平均库存'),
    buildMetric('inventorySales', '库销比', overview.currentInventorySales, overview.comparativeInventorySales, 'growth', '库存销售比'),
    buildMetric('turnoverDays', '周转天数', overview.currentTurnoverDays, overview.comparativeTurnoverDays, 'growth', '库存周转天数'),
    buildMetric('turnoverRate', '周转率', overview.currentTurnoverRate, overview.comparativeTurnoverRate, 'growth', '库存周转率'),
    buildMetric('penetrateRate', '渗透率', overview.currentPenetrateRate, overview.comparativePenetrateRate, 'diff', '渗透率', '%'),
    buildMetric('pieceAvgPrice', '件单价', overview.currentPieceAvgPrice, overview.comparativePieceAvgPrice, 'growth', '件单价'),
    buildMetric('customerAvgQuantity', '客单量', overview.currentCustomerAvgQuantity, overview.comparativeCustomerAvgQuantity, 'growth', '客单量')
  ]
});

const buildTrendView = (payload: any, metricCode: string): CategoryDiagnosisTrendVO => {
  const currentSeries = Array.isArray(payload?.trends)
    ? payload.trends.map((item: any) => ({
        date: item.pointDate,
        value: Number(item.currentValue || 0)
      }))
    : [];
  const compareSeries = Array.isArray(payload?.trends)
    ? payload.trends.map((item: any) => ({
        date: item.pointDate,
        value: Number(item.compareValue || 0)
      }))
    : [];
  const tab = trendMetricTabs.find((item) => item.key === metricCode);
  return {
    metricKey: metricCode,
    metricName: tab?.label || metricCode,
    unit: tab?.unit || '',
    currentSeries,
    compareSeries
  };
};

const applyOverview = (overview: DiagnosisOverviewResponse) => {
  summary.filterInfo.currentDateRangeText = `${query.value.startDate || '--'} ~ ${query.value.endDate || '--'}`;
  summary.filterInfo.compareDateRangeText = `${query.value.compareStartDate || '--'} ~ ${query.value.compareEndDate || '--'}`;
  summary.filterInfo.orgName = '--';
  summary.filterInfo.retailTypeName = '全部业态';
  summary.filterInfo.circleName = '全部商圈';
  summary.filterInfo.storeRangeName = query.value.storeNo || '全店';
  summary.coreInfo.categoryCode = overview.classNo || String(query.value.categoryId || '--');
  summary.coreInfo.categoryName = overview.className || query.value.categoryName || '--';
  summary.coreInfo.categoryLevelName = formatCategoryLevelName(query.value.categoryLevel);
  summary.coreInfo.currentRoleName = statusText.value;
  summary.coreInfo.presetRoleName = '--';
  summary.coreInfo.presetSkuCount = Number(overview.currentClassSku || 0);
  Object.assign(metrics, buildMetrics(overview));
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
    tooltip: { trigger: 'axis' },
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

const clearPolling = () => {
  if (pollTimer.value != null) {
    window.clearTimeout(pollTimer.value);
    pollTimer.value = null;
  }
};

const schedulePolling = () => {
  clearPolling();
  pollTimer.value = window.setTimeout(async () => {
    await loadSessionState();
  }, 2000);
};

const loadOverview = async () => {
  if (!sessionId.value) return;
  await overviewRequest.run(sessionId.value);
};

const loadTrend = async () => {
  if (!sessionId.value) return;
  await trendRequest.run({
    sessionId: sessionId.value,
    metricCode: activeTrendMetric.value
  });
};

const loadReadyData = async () => {
  await Promise.all([loadOverview(), loadTrend()]);
};

const loadSessionState = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载诊断详情');
    return;
  }
  const statusRes = await statusRequest.run(sessionId.value);
  const current = statusRes?.data;
  if (!current) {
    return;
  }
  if (current.ready) {
    clearPolling();
    await loadReadyData();
    return;
  }
  if (current.status === 'FAILED' || current.status === 'STOPPED') {
    clearPolling();
    ElMessage.error(`诊断任务状态异常: ${current.status}`);
    return;
  }
  schedulePolling();
};

const handleMainNavClick = async (navKey: string, groupKey?: string) => {
  activeSideModule.value = '';
  activeMainNav.value = navKey;
  if (groupKey) {
    ensureGroupExpanded(groupKey);
  }
  writeNavState();
};

const handleSideModuleClick = async (item: { key: string }, groupKey?: string) => {
  activeSideModule.value = item.key;
  if (groupKey) {
    ensureGroupExpanded(groupKey);
  }
  writeNavState();
};

const handleTrendMetricChange = async (metricKey: string) => {
  if (activeTrendMetric.value === metricKey) return;
  activeTrendMetric.value = metricKey;
  if (sessionReady.value) {
    await loadTrend();
  }
};

const resizeChart = () => chartIns.value?.resize();

onMounted(async () => {
  syncNavState();
  await loadSessionState();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  clearPolling();
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
  background: linear-gradient(180deg, #e9fbf7 0%, #f3fffc 100%);
  border: 1px solid #cfeee7;
}

.left-nav-group {
  padding: 10px 0;
  border-bottom: 1px solid rgba(15, 118, 110, 0.12);
}

.left-nav-group:last-child {
  border-bottom: 0;
}

.left-nav-group-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  padding: 4px 2px;
}

.left-nav-group-text {
  min-width: 0;
}

.left-nav-group-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f766e;
  line-height: 1.3;
}

.left-nav-group-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #8a94a6;
  line-height: 1.4;
}

.left-nav-arrow {
  flex: 0 0 auto;
  color: #0f766e;
  font-size: 22px;
  line-height: 1;
  transform: rotate(0deg);
  transition: transform 0.22s ease, color 0.22s ease;
  margin-top: 2px;
}

.left-nav-arrow.expanded {
  transform: rotate(90deg);
}

.left-nav-group-body {
  padding-top: 10px;
}

.left-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #0f766e;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.left-nav-item:hover {
  background: rgba(13, 148, 136, 0.1);
}

.left-nav-item.active {
  background: rgba(15, 118, 110, 0.12);
  color: #0b6b64;
}

.left-nav-icon {
  font-size: 12px;
}

.left-sub-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px 10px 24px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.2s ease;
}

.left-sub-item:hover {
  background: rgba(255, 255, 255, 0.82);
  transform: translateX(1px);
}

.left-sub-item.active {
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.18), 0 8px 18px rgba(15, 118, 110, 0.08);
}

.left-sub-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #111827;
  margin-top: 8px;
}

.left-sub-content {
  min-width: 0;
  flex: 1;
}

.left-sub-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  line-height: 1.4;
}

.left-sub-desc {
  font-size: 12px;
  color: #8a94a6;
  margin-top: 3px;
  line-height: 1.4;
}

.left-sub-extra {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #0f766e;
}

.nav-fold-enter-active,
.nav-fold-leave-active {
  overflow: hidden;
  transition: all 0.22s ease;
}

.nav-fold-enter-from,
.nav-fold-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

.nav-fold-enter-to,
.nav-fold-leave-from {
  max-height: 520px;
  opacity: 1;
  transform: translateY(0);
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
