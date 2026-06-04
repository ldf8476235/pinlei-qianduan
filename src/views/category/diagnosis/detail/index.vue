<template>
  <div class="p-2 category-diagnosis-detail-page">
    <el-card shadow="hover" class="mb-[12px]">
      <div class="filter-line">本期日期: {{ summary.filterInfo.currentDateRangeText }}；对比日期: {{ summary.filterInfo.compareDateRangeText }}</div>
      <div class="filter-line">
        组织: {{ summary.filterInfo.orgName }}；业态: {{ summary.filterInfo.retailTypeName }}；商圈: {{ summary.filterInfo.circleName }}
      </div>
      <div class="filter-line">门店: {{ summary.filterInfo.storeRangeName }}</div>

      <div class="core-line mt-[10px]">
        <div class="core-left">
          {{ summary.coreInfo.categoryCode }} {{ summary.coreInfo.categoryName }}（{{ summary.coreInfo.categoryLevelName }}）
        </div>
        <div class="core-center">
          诊断状态:
          <el-tag :type="statusTagType" effect="dark" class="ml-1">{{ statusText }}</el-tag>
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
              <div
                v-for="item in metrics.firstRow"
                :key="item.metricKey"
                class="metric-card"
                :class="{ 'is-clickable': item.metricKey === 'sku' }"
                :role="item.metricKey === 'sku' ? 'button' : undefined"
                :tabindex="item.metricKey === 'sku' ? 0 : undefined"
                @click="handleMetricCardClick(item)"
                @keydown.enter="handleMetricCardClick(item)"
                @keydown.space.prevent="handleMetricCardClick(item)"
              >
                <div class="metric-name">
                  <span>{{ item.metricName }}</span>
                  <el-tooltip :content="item.metricDesc || '暂无说明'" placement="top">
                    <span class="metric-tip">?</span>
                  </el-tooltip>
                </div>
                <div class="metric-value">{{ item.currentValue }}</div>
                <div
                  class="metric-compare"
                  :class="[compareClass(item.compareValue), hiddenMetricCompareKeys.includes(item.metricKey) ? 'metric-compare--hidden' : '']"
                >
                  <span class="metric-arrow">{{ compareArrow(item.compareValue) }}</span>
                  <span>{{ compareText(item.compareValue, item.compareType, item.unit) }}</span>
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
                <div
                  class="metric-compare"
                  :class="[compareClass(item.compareValue), hiddenMetricCompareKeys.includes(item.metricKey) ? 'metric-compare--hidden' : '']"
                >
                  <span class="metric-arrow">{{ compareArrow(item.compareValue) }}</span>
                  <span>{{ compareText(item.compareValue, item.compareType, item.unit) }}</span>
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
                    :class="{ 'is-brand-active': activeTrendMetric === item.key }"
                    @click="handleTrendMetricChange(item.key)"
                  >
                    {{ item.label }}
                  </el-button>
                </div>
              </div>
            </template>
            <div v-loading="trendLoading" class="trend-chart-wrap" @mousemove="handleTrendChartMousemove" @mouseleave="hideTrendTooltip">
              <div ref="chartRef" class="trend-chart" />
              <template v-if="customTrendTooltip.visible">
                <div class="trend-guide-line trend-guide-line--vertical" :style="{ left: `${customTrendTooltip.guideX}px` }" />
                <div class="trend-guide-line trend-guide-line--horizontal" :style="{ top: `${customTrendTooltip.guideY}px` }" />
                <div class="trend-axis-tag trend-axis-tag--top" :style="{ left: `${customTrendTooltip.guideX}px` }">
                  {{ customTrendTooltip.compareDate }}
                </div>
                <div class="trend-axis-tag trend-axis-tag--bottom" :style="{ left: `${customTrendTooltip.guideX}px` }">
                  {{ customTrendTooltip.currentDate }}
                </div>
              </template>
              <div
                v-if="customTrendTooltip.visible"
                class="custom-trend-tooltip"
                :style="{ left: `${customTrendTooltip.x}px`, top: `${customTrendTooltip.y}px` }"
              >
                <div class="tooltip-section">
                  <div class="tooltip-label">本期</div>
                  <div class="tooltip-row">
                    <span class="tooltip-dot current" />
                    <span>{{ customTrendTooltip.currentDate }} {{ customTrendTooltip.current }}</span>
                  </div>
                </div>
                <div class="tooltip-section">
                  <div class="tooltip-label">对比日期</div>
                  <div class="tooltip-row">
                    <span class="tooltip-dot compare" />
                    <span>{{ customTrendTooltip.compareDate }} {{ customTrendTooltip.compare }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </template>
        <div v-else-if="!sessionReady" class="placeholder-panel">
          <el-empty description="诊断预计算中，分析模块将在数据就绪后自动加载" />
        </div>
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
import { defineAsyncComponent, markRaw } from 'vue';
import { useRequest } from '@/hooks/useRequest';
import { createDiagnosisSession, getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import { getCategoryDiagnosisDetailSummary, getCategoryDiagnosisDetailTrend } from '@/api/category/diagnosis/detail';
import type { DiagnosisSessionCreateRequest } from '@/api/category/diagnosis/types';
import type {
  CategoryDiagnosisDetailQuery,
  CategoryDiagnosisDetailSummaryVO,
  CategoryDiagnosisMetricGroupVO,
  CategoryDiagnosisMetricVO,
  CategoryDiagnosisTrendVO,
  DiagnosisOverviewResponse
} from '@/api/category/diagnosis/detail/types';
import type { DiagnosisSessionStatusResponse } from '@/api/category/diagnosis/types';
import { getCategoryIndexByMouse, showVueChartTooltip } from './useVueChartTooltip';
const SubClassView = defineAsyncComponent(() => import('./sub-class.vue'));
const ChannelView = defineAsyncComponent(() => import('./channel.vue'));
const CustomerView = defineAsyncComponent(() => import('./customer.vue'));
const SpecView = defineAsyncComponent(() => import('./spec.vue'));
const TagView = defineAsyncComponent(() => import('./tag.vue'));
const RemoveGoodsView = defineAsyncComponent(() => import('./remove-goods.vue'));
const IntroduceDirectionView = defineAsyncComponent(() => import('./introduce-direction.vue'));
const OverallSummaryView = defineAsyncComponent(() => import('./overall-summary.vue'));
const AbcAnalysisView = defineAsyncComponent(() => import('@/views/abc/analysis.vue'));
const GrossContributionAnalysisView = defineAsyncComponent(() => import('@/views/gross-contribution/analysis.vue'));
const GmroiAnalysisView = defineAsyncComponent(() => import('@/views/gmroi/analysis.vue'));
const SupplierAnalysisView = defineAsyncComponent(() => import('@/views/supplier/analysis.vue'));
const PriceBandAnalysisView = defineAsyncComponent(() => import('@/views/price-band/analysis.vue'));
const BrandAnalysisView = defineAsyncComponent(() => import('@/views/brand/analysis.vue'));

const route = useRoute();
const router = useRouter();

const chartRef = ref<HTMLDivElement>();
const chartIns = ref<echarts.ECharts>();
const pollTimer = ref<number | null>(null);
const recoveringSession = ref(false);
const sessionRecoverAttempted = ref(false);
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
  channel: markRaw(ChannelView),
  customer: markRaw(CustomerView)
} as const;

const embeddedSideViewMap = {
  abcAnalysis: markRaw(AbcAnalysisView),
  grossContribution: markRaw(GrossContributionAnalysisView),
  gmroiAnalysis: markRaw(GmroiAnalysisView),
  supplierAnalysis: markRaw(SupplierAnalysisView),
  priceBandAnalysis: markRaw(PriceBandAnalysisView),
  brandAnalysis: markRaw(BrandAnalysisView),
  specAnalysis: markRaw(SpecView),
  tagAnalysis: markRaw(TagView),
  summaryAnalysis: markRaw(OverallSummaryView),
  removeGoods: markRaw(RemoveGoodsView),
  introduceDirection: markRaw(IntroduceDirectionView)
} as const;

const trendMetricTabs = [
  { key: 'sales', label: '销售额', unit: '万元' },
  { key: 'salesQuantity', label: '销售量', unit: '件' },
  { key: 'gross', label: '毛利额', unit: '万元' },
  { key: 'grossRate', label: '毛利率', unit: '%' },
  { key: 'customerCount', label: '客数', unit: '人' },
  { key: 'customerPrice', label: '客单价', unit: '元' },
  { key: 'inventorySales', label: '库销比', unit: '比' }
];

const trendTabTypeMap: Record<string, string> = {
  sales: '0',
  salesQuantity: '1',
  gross: '2',
  grossRate: '3',
  customerCount: '4',
  customerPrice: '5',
  inventorySales: '6'
};

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
const customTrendTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  guideX: 0,
  guideY: 0,
  currentDate: '--',
  compareDate: '--',
  current: '--',
  compare: '--',
  title: '',
  rows: []
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

const isSessionExpiredError = (err: any) => {
  const code = err?.code || err?.data?.code || err?.response?.data?.code;
  const message = String(err?.message || err?.data?.message || err?.response?.data?.message || '');
  return code === 'DIAG-400' && message.includes('session not found or expired');
};

const buildRecoverRequest = (): DiagnosisSessionCreateRequest | null => {
  const current = query.value;
  if (!current.categoryId || !current.categoryLevel || !current.startDate || !current.endDate) {
    return null;
  }
  return {
    classLevel: Number(current.categoryLevel),
    classNo: current.categoryId,
    className: current.categoryName,
    storeNo: current.storeNo,
    periodStart: current.startDate,
    periodEnd: current.endDate,
    compareStart: current.compareStartDate,
    compareEnd: current.compareEndDate,
    triggerIfMissing: true,
    waitSeconds: 0
  };
};

const recoverExpiredSession = async () => {
  if (recoveringSession.value || sessionRecoverAttempted.value) {
    return false;
  }
  const request = buildRecoverRequest();
  if (!request) {
    ElMessage.error('诊断会话已失效，请重新发起诊断');
    return false;
  }
  recoveringSession.value = true;
  sessionRecoverAttempted.value = true;
  try {
    const res = await createDiagnosisSession(request);
    const session = res?.data?.data ?? (res?.data as any);
    const nextSessionId = session?.sessionId;
    if (!nextSessionId) {
      ElMessage.error('诊断会话恢复失败，请重新发起诊断');
      return false;
    }
    statusState.value = undefined;
    await router.replace({
      path: route.path,
      query: {
        ...route.query,
        sessionId: nextSessionId
      }
    });
    await nextTick();
    await loadSessionState();
    return true;
  } finally {
    recoveringSession.value = false;
  }
};

const isPerformanceView = computed(() => !activeSideModule.value && activeMainNav.value === 'performance');
const activeEmbeddedComponent = computed(() => {
  if (!sessionReady.value) {
    return null;
  }
  if (activeSideModule.value && activeSideModule.value in embeddedSideViewMap) {
    return embeddedSideViewMap[activeSideModule.value as keyof typeof embeddedSideViewMap];
  }
  if (activeMainNav.value in embeddedMainViewMap) {
    return embeddedMainViewMap[activeMainNav.value as keyof typeof embeddedMainViewMap];
  }
  return null;
});

const getDefaultExpandedGroupKeys = () => navGroups.filter((group) => group.defaultExpanded).map((group) => group.key);

const resolveGroupKeyByActiveModule = (activeMain: string, activeSide: string) => {
  if (activeSide) {
    return navGroups.find((group) => group.items.some((item) => item.key === activeSide))?.key;
  }
  return navGroups.find((group) => group.items.some((item) => item.key === activeMain))?.key;
};

const readNavState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(NAV_STATE_KEY);
    return raw ? (JSON.parse(raw) as { expandedGroupKeys?: string[]; activeMainNav?: string; activeSideModule?: string }) : null;
  } catch {
    return null;
  }
};

const getRouteQueryValue = (key: string) => {
  const value = route.query[key];
  return Array.isArray(value) ? value[0] : value;
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

const resetToPerformanceView = () => {
  activeMainNav.value = 'performance';
  activeSideModule.value = '';
  const performanceGroupKey = resolveGroupKeyByActiveModule('performance', '');
  expandedGroupKeys.value = [performanceGroupKey || getDefaultExpandedGroupKeys()[0] || navGroups[0]?.key].filter(Boolean) as string[];
  writeNavState();
};

const syncNavState = () => {
  const initialView = String(getRouteQueryValue('initialView') || '');
  if (initialView && initialView !== 'performance') {
    activeMainNav.value = 'performance';
    activeSideModule.value = initialView;
    const activeGroupKey = resolveGroupKeyByActiveModule(activeMainNav.value, activeSideModule.value);
    expandedGroupKeys.value = [activeGroupKey || getDefaultExpandedGroupKeys()[0] || navGroups[0]?.key].filter(Boolean) as string[];
    writeNavState();
    return;
  }
  if (initialView === 'performance' || getRouteQueryValue('demo') === '1') {
    resetToPerformanceView();
    return;
  }
  const state = readNavState();
  activeMainNav.value = state?.activeMainNav || 'performance';
  activeSideModule.value = state?.activeSideModule || '';
  const activeGroupKey = resolveGroupKeyByActiveModule(activeMainNav.value, activeSideModule.value);
  const fallbackGroupKey = state?.expandedGroupKeys?.[0] || getDefaultExpandedGroupKeys()[0] || navGroups[0]?.key;
  expandedGroupKeys.value = [activeGroupKey || fallbackGroupKey].filter(Boolean) as string[];
};

const isGroupExpanded = (groupKey: string) => expandedGroupKeys.value.includes(groupKey);

const toggleGroup = (groupKey: string) => {
  if (isGroupExpanded(groupKey)) {
    expandedGroupKeys.value = [];
  } else {
    expandedGroupKeys.value = [groupKey];
  }
  writeNavState();
};

const ensureGroupExpanded = (groupKey: string) => {
  if (!isGroupExpanded(groupKey)) {
    expandedGroupKeys.value = [groupKey];
    writeNavState();
  }
};

const statusRequest = useRequest(async (id: string) => await getDiagnosisSessionStatus(id), {
  onSuccess: (res) => {
    if (res?.data) {
      statusState.value = res.data;
    }
  },
  onError: async (err) => {
    if (isSessionExpiredError(err)) {
      await recoverExpiredSession();
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

const trendRequest = useRequest(
  async (params: { sessionId: string; metricCode: string; tabType: string }) =>
    await getCategoryDiagnosisDetailTrend(params.sessionId, params.metricCode, params.tabType),
  {
    onSuccess: (res) => {
      if (res?.data) {
        trendData.value = buildTrendView(res.data, activeTrendMetric.value);
        renderTrendChart();
      }
    }
  }
);

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

const compareText = (value: number, type: string, unit = '') => {
  const numericValue = Number(value || 0);
  const abs = Math.abs(numericValue);
  if (abs === 0) {
    return '·';
  }
  if (type === 'diff') {
    const action = numericValue > 0 ? '提升' : '下降';
    return unit === '%' ? `对比${action} ${abs.toFixed(2)}个百分点` : `对比${action} ${abs.toFixed(2)}`;
  }
  return `${numericValue > 0 ? '对比增长' : '对比下降'} ${abs.toFixed(2)}%`;
};

const hiddenMetricCompareKeys = ['sellRate', 'penetrateRate'];

const formatNumber = (value: number | string | undefined, digits = 2) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits }) : '--';
};

const getChartValue = (value: unknown) => {
  if (Array.isArray(value)) return value[value.length - 1];
  if (value && typeof value === 'object') return (value as any).value;
  return value;
};

const formatPercent = (value?: number) => `${Number(value || 0).toFixed(0)}%`;

const parseLocalDate = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split(/[-/]/).map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const formatAxisDate = (value?: string) => {
  if (!value) return '--';
  const date = parseLocalDate(value);
  return date ? formatLocalDate(date) : value.replace(/-/g, '/');
};

const buildDateSeries = (start?: string, end?: string, fallbackLength = 0) => {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  if (!startDate || !endDate || startDate > endDate) return [];
  const result: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate && result.length < Math.max(fallbackLength, 366)) {
    result.push(formatLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
};

const getTrendPlotRect = (rect: DOMRect) => {
  const gridLeft = 72;
  const gridRight = 40;
  const gridTop = 64;
  const gridBottom = 56;
  return {
    left: gridLeft,
    right: gridRight,
    top: gridTop,
    bottom: gridBottom,
    width: Math.max(1, rect.width - gridLeft - gridRight),
    height: Math.max(1, rect.height - gridTop - gridBottom)
  };
};

const hideTrendTooltip = () => {
  customTrendTooltip.visible = false;
};

const handleTrendChartMousemove = (event: MouseEvent) => {
  const currentSeries = trendData.value.currentSeries || [];
  if (!currentSeries.length || !chartRef.value) {
    hideTrendTooltip();
    return;
  }
  const rect = chartRef.value.getBoundingClientRect();
  const plotRect = getTrendPlotRect(rect);
  const index = getCategoryIndexByMouse(event, chartRef.value, currentSeries.length, { left: plotRect.left, right: 40 });
  const ratio = Math.max(0, Math.min(1, index / Math.max(currentSeries.length - 1, 1)));
  const current = currentSeries[index];
  const compare = trendData.value.compareSeries?.[index];
  if (!current) {
    hideTrendTooltip();
    return;
  }

  const allValues = [...currentSeries, ...(trendData.value.compareSeries || [])].map((item) => Number(item.value || 0));
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 1);
  const valueRange = Math.max(1, maxValue - minValue);
  const guideX = plotRect.left + ratio * plotRect.width;
  const guideY = plotRect.top + (1 - (Number(current.value || 0) - minValue) / valueRange) * plotRect.height;
  customTrendTooltip.guideX = guideX;
  customTrendTooltip.guideY = guideY;
  customTrendTooltip.currentDate = formatAxisDate(current.date);
  customTrendTooltip.compareDate = formatAxisDate(compare?.date);
  customTrendTooltip.current = `${formatNumber(current.value)}${trendData.value.unit || ''}`;
  customTrendTooltip.compare = `${formatNumber(compare?.value)}${trendData.value.unit || ''}`;
  showVueChartTooltip(customTrendTooltip, event, '', [], { width: 250, height: 134, offsetY: 78 });
};

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
    buildMetric('sku', '本期在售SKU', overview.currentClassSku, overview.compareClassSku, 'growth', '当前品类在售SKU数量'),
    buildMetric('sellRate', '动销率', overview.currentTurnoverRate, overview.comparativeTurnoverRate, 'diff', '品类动销率', '%'),
    buildMetric('penetrateRate', '渗透率', overview.currentPenetrateRate, overview.comparativePenetrateRate, 'diff', '品类渗透率', '%'),
    buildMetric('turnoverDays', '库存周转天数', overview.currentTurnoverDays, overview.comparativeTurnoverDays, 'diff', '库存周转天数'),
    buildMetric('inventorySales', '库销比', overview.currentInventorySales, overview.comparativeInventorySales, 'diff', '库存销售比'),
    buildMetric('avgInventory', '平均库存成本', overview.currentAvgInventory, overview.comparativeAvgInventory, 'growth', '平均库存成本'),
    buildMetric('saleQuantity', '销售量', overview.currentSaleQuantity, overview.comparativeSaleQuantity, 'growth', '当前品类销售量')
  ],
  secondRow: [
    buildMetric('sales', '销售额(万元)', overview.currentSales, overview.comparativeSales, 'growth', '当前品类销售额'),
    buildMetric('gross', '毛利额(万元)', overview.currentGross, overview.comparativeGross, 'growth', '当前品类毛利额'),
    buildMetric('grossRate', '毛利率', overview.currentGrossRate, overview.comparativeGrossRate, 'diff', '毛利率', '%'),
    buildMetric('customerCount', '客数', overview.currentCustomerCount, overview.comparativeCustomerCount, 'growth', '当前品类客数'),
    buildMetric('customerPrice', '客单价', overview.currentCustomerPrice, overview.comparativeCustomerPrice, 'growth', '当前品类客单价'),
    buildMetric(
      'customerAvgQuantity',
      '客均件数',
      overview.currentCustomerAvgQuantity,
      overview.comparativeCustomerAvgQuantity,
      'growth',
      '客均件数'
    ),
    buildMetric('pieceAvgPrice', '件均价', overview.currentPieceAvgPrice, overview.comparativePieceAvgPrice, 'growth', '件均价')
  ]
});

const buildTrendView = (payload: any, metricCode: string): CategoryDiagnosisTrendVO => {
  const rows = Array.isArray(payload?.trends) ? payload.trends : [];
  const currentDates = buildDateSeries(query.value.startDate, query.value.endDate, rows.length);
  const compareDates = buildDateSeries(query.value.compareStartDate, query.value.compareEndDate, rows.length);
  const currentSeries = Array.isArray(payload?.trends)
    ? rows.map((item: any, index: number) => ({
        date: currentDates[index] || formatAxisDate(item.pointDate),
        value: Number(item.currentValue || 0)
      }))
    : [];
  const compareSeries = Array.isArray(payload?.trends)
    ? rows.map((item: any, index: number) => ({
        date: item.compareDate || item.comparisonDate || compareDates[index] || formatAxisDate(item.pointDate),
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
  if (!chartRef.value) return false;
  if (chartIns.value && chartIns.value.getDom() !== chartRef.value) {
    chartIns.value.dispose();
    chartIns.value = undefined;
  }
  if (!chartIns.value) {
    chartIns.value = echarts.init(chartRef.value);
  }
  return true;
};

const renderTrendChart = async () => {
  await nextTick();
  if (!initChart()) return;
  if (!chartIns.value) return;

  const currentSeries = trendData.value.currentSeries || [];
  const compareSeries = trendData.value.compareSeries || [];
  const currentAxisDates = currentSeries.map((item) => formatAxisDate(item.date));
  const compareAxisDates = compareSeries.map((item) => formatAxisDate(item.date));
  const currentValues = currentSeries.map((item) => Number(item.value || 0));
  const compareValues = compareSeries.map((item) => Number(item.value || 0));
  const unit = trendData.value.unit || '';
  const axisLabelInterval = Math.max(0, Math.ceil(currentAxisDates.length / 9) - 1);

  chartIns.value.setOption({
    tooltip: {
      show: false
    },
    legend: {
      top: 6,
      right: 24,
      itemWidth: 34,
      itemHeight: 14,
      icon: 'path://M0,6 L28,6 M14,0 A6,6 0 1,0 14,12 A6,6 0 1,0 14,0',
      textStyle: {
        color: '#374151',
        fontSize: 13,
        fontWeight: 600
      },
      data: ['本期', '对比日期'],
      selectedMode: false
    },
    grid: {
      left: 72,
      right: 40,
      top: 64,
      bottom: 56,
      containLabel: false
    },
    xAxis: [
      {
        type: 'category',
        position: 'top',
        data: compareAxisDates,
        boundaryGap: false,
        axisTick: {
          show: true,
          alignWithLabel: true,
          length: 6,
          lineStyle: { color: '#6b7280' }
        },
        axisLine: { lineStyle: { color: '#6b7280', width: 1 } },
        axisLabel: {
          color: '#6b7280',
          fontSize: 13,
          interval: axisLabelInterval,
          margin: 10
        },
        splitLine: { show: false }
      },
      {
        type: 'category',
        position: 'bottom',
        data: currentAxisDates,
        boundaryGap: false,
        axisTick: {
          show: true,
          alignWithLabel: true,
          length: 6,
          lineStyle: { color: '#6b7280' }
        },
        axisLine: { lineStyle: { color: '#6b7280', width: 1 } },
        axisLabel: {
          color: '#6b7280',
          fontSize: 13,
          interval: axisLabelInterval,
          margin: 10
        },
        splitLine: { show: false }
      }
    ],
    yAxis: {
      type: 'value',
      name: unit,
      nameTextStyle: { color: '#6b7280', fontSize: 13, padding: [0, 0, 0, 12] },
      axisLabel: { color: '#6b7280', formatter: (value: number) => formatNumber(value, 2) },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e5e7eb' } }
    },
    series: [
      {
        name: '本期',
        type: 'line',
        xAxisIndex: 1,
        smooth: true,
        data: currentValues,
        symbol: 'circle',
        symbolSize: 7,
        itemStyle: { color: '#37c8da', borderColor: '#fff', borderWidth: 2 },
        lineStyle: { width: 3, color: '#37c8da' },
        emphasis: { focus: 'series', scale: 1.2 },
        z: 3
      },
      {
        name: '对比日期',
        type: 'line',
        xAxisIndex: 0,
        smooth: true,
        data: compareValues,
        symbol: 'circle',
        symbolSize: 7,
        itemStyle: { color: '#f45a2d', borderColor: '#fff', borderWidth: 2 },
        lineStyle: { width: 3, color: '#f45a2d' },
        emphasis: { focus: 'series', scale: 1.2 },
        z: 2
      }
    ]
  });
  chartIns.value.resize();
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
  if (!sessionId.value || !sessionReady.value) return;
  await overviewRequest.run(sessionId.value);
};

const loadTrend = async () => {
  if (!sessionId.value || !sessionReady.value) return;
  await trendRequest.run({
    sessionId: sessionId.value,
    metricCode: activeTrendMetric.value,
    tabType: trendTabTypeMap[activeTrendMetric.value] || ''
  });
};

const loadReadyData = async () => {
  if (!sessionReady.value) return;
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

const refreshPerformanceView = async () => {
  if (!sessionId.value) return;
  const statusRes = await statusRequest.run(sessionId.value);
  const current = statusRes?.data;
  if (!current) return;
  if (current.ready) {
    clearPolling();
    await loadReadyData();
    return;
  }
  await loadSessionState();
};

const handleMainNavClick = async (navKey: string, groupKey?: string) => {
  activeSideModule.value = '';
  activeMainNav.value = navKey;
  if (groupKey) {
    ensureGroupExpanded(groupKey);
  }
  writeNavState();
  if (navKey === 'performance') {
    await nextTick();
    await refreshPerformanceView();
  }
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

const handleMetricCardClick = (item: CategoryDiagnosisMetricVO) => {
  if (item.metricKey !== 'sku') return;
  if (!query.value.sessionId) {
    ElMessage.error('缺少 sessionId，无法查看 SKU 商品明细');
    return;
  }
  router.push({
    path: '/brand/analysis/detail/sku',
    query: {
      ...route.query,
      source: 'category-sku',
      categoryId: summary.coreInfo.categoryCode || query.value.categoryId,
      categoryName: summary.coreInfo.categoryName || query.value.categoryName,
      categoryLevel: query.value.categoryLevel
    }
  });
};

const resizeChart = () => chartIns.value?.resize();

watch(
  [isPerformanceView, () => trendData.value.currentSeries.length, () => trendData.value.compareSeries.length],
  async ([visible, currentCount, compareCount]) => {
    if (!visible || (!currentCount && !compareCount)) {
      return;
    }
    await renderTrendChart();
  },
  { flush: 'post' }
);

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
  grid-template-columns: minmax(0, 1.6fr) auto;
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
  justify-self: end;
}

.left-nav-card {
  --diag-orange-900: #9a3412;
  --diag-orange-800: #c2410c;
  --diag-orange-700: #ea580c;
  --diag-orange-500: #fb923c;
  background:
    linear-gradient(180deg, rgba(255, 168, 76, 0.16) 0%, rgba(255, 244, 228, 0.96) 36%, rgba(255, 249, 242, 1) 100%),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.18), transparent 36%);
  border: 1px solid rgba(251, 146, 60, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 14px 28px rgba(194, 65, 12, 0.08);
}

.left-nav-group {
  padding: 10px 0;
  border-bottom: 1px solid rgba(234, 88, 12, 0.12);
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
  color: var(--diag-orange-900);
  line-height: 1.3;
}

.left-nav-group-sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(154, 52, 18, 0.62);
  line-height: 1.4;
}

.left-nav-arrow {
  flex: 0 0 auto;
  color: var(--diag-orange-700);
  font-size: 22px;
  line-height: 1;
  transform: rotate(0deg);
  transition:
    transform 0.22s ease,
    color 0.22s ease;
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
  border-radius: 12px;
  color: var(--diag-orange-800);
  cursor: pointer;
  margin-bottom: 8px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.left-nav-item:hover {
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1px rgba(251, 146, 60, 0.18);
}

.left-nav-item.active {
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
  color: var(--diag-orange-900);
  box-shadow:
    inset 0 0 0 1px rgba(251, 146, 60, 0.34),
    0 10px 22px rgba(234, 88, 12, 0.1);
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
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(255, 250, 245, 0.98) 100%);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.left-sub-item:hover {
  background: #fffdfb;
  border-color: rgba(251, 146, 60, 0.22);
  box-shadow: 0 8px 18px rgba(194, 65, 12, 0.08);
  transform: translateX(2px);
}

.left-sub-item.active {
  background: linear-gradient(180deg, #ffffff 0%, #fff7ed 100%);
  box-shadow:
    inset 0 0 0 1px rgba(234, 88, 12, 0.28),
    0 12px 24px rgba(234, 88, 12, 0.12);
}

.left-sub-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--diag-orange-700);
  margin-top: 8px;
  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.12);
}

.left-sub-content {
  min-width: 0;
  flex: 1;
}

.left-sub-title {
  font-size: 14px;
  font-weight: 600;
  color: #7c2d12;
  line-height: 1.4;
}

.left-sub-desc {
  font-size: 12px;
  color: rgba(124, 45, 18, 0.56);
  margin-top: 3px;
  line-height: 1.4;
}

.left-sub-extra {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--diag-orange-800);
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
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
}

.metrics-row::after {
  content: '';
}

.metric-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  padding: 12px 12px 10px;
  min-height: 132px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.metric-card.is-clickable {
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.metric-card.is-clickable:hover,
.metric-card.is-clickable:focus-visible {
  border-color: rgba(249, 115, 22, 0.48);
  box-shadow: 0 12px 26px rgba(249, 115, 22, 0.14);
  outline: none;
  transform: translateY(-1px);
}

.metric-card.is-clickable .metric-value {
  color: #ea580c;
}

.metric-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
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
  flex: 0 0 auto;
}

.metric-value {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  word-break: break-all;
}

.metric-compare {
  margin-top: 12px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
}

.metric-compare--hidden {
  visibility: hidden;
}

.metric-compare.is-up {
  color: #dc2626;
}

.metric-compare.is-down {
  color: #16a34a;
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

.trend-tabs :deep(.el-button) {
  border-radius: 999px;
  border: 1px solid #d8e2f1;
  background: #fff;
  color: #475569;
  padding: 7px 14px;
}

.trend-tabs :deep(.el-button:hover) {
  border-color: rgba(249, 115, 22, 0.45);
  color: #f97316;
}

.trend-tabs :deep(.el-button.is-brand-active) {
  background: linear-gradient(135deg, #ff9f2d 0%, #ff6a00 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 8px 18px rgba(249, 115, 22, 0.22);
}

.trend-tabs :deep(.el-button.is-brand-active:hover) {
  color: #fff;
}

.trend-chart-wrap {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-height: 380px;
  background: #fff;
  overflow: hidden;
}

.trend-chart {
  width: 100%;
  height: 380px;
}

.custom-trend-tooltip {
  position: absolute;
  z-index: 20;
  min-width: 226px;
  padding: 14px 16px;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.96);
  color: #4b5563;
  font-size: 15px;
  line-height: 1.6;
  pointer-events: none;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(4px);
}

.tooltip-section + .tooltip-section {
  margin-top: 6px;
}

.tooltip-label {
  font-size: 15px;
  font-weight: 700;
  color: #6b7280;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.tooltip-dot.current {
  background: #37c8da;
}

.tooltip-dot.compare {
  background: #f45a2d;
}

.trend-guide-line {
  position: absolute;
  z-index: 12;
  pointer-events: none;
}

.trend-guide-line--vertical {
  top: 64px;
  bottom: 56px;
  width: 0;
  border-left: 1px dashed #94a3b8;
}

.trend-guide-line--horizontal {
  left: 72px;
  right: 40px;
  height: 0;
  border-top: 1px dashed #6b7280;
}

.trend-axis-tag {
  position: absolute;
  z-index: 13;
  transform: translateX(-50%);
  padding: 3px 9px;
  border-radius: 4px;
  background: #667783;
  color: #fff;
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
}

.trend-axis-tag--top {
  top: 34px;
}

.trend-axis-tag--bottom {
  bottom: 20px;
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
