<template>
  <div class="p-2 category-diagnosis-sub-class-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">子类贡献</span>
          </div>
          <el-tag effect="plain" type="success" class="role-tag">本期角色：结构品类</el-tag>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button link type="primary" class="export-button" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="pieRequest.loading.value">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期销售占比</span>
            </div>
          </template>
          <div class="pie-chart-panel">
            <div class="vue-chart-tooltip-wrap" @mousemove="handlePieTooltipMousemove" @mouseleave="hidePieTooltip">
              <div ref="pieChartRef" class="pie-chart-box" />
              <div v-if="pieTooltip.visible" class="subclass-trend-tooltip" :style="{ left: `${pieTooltip.x}px`, top: `${pieTooltip.y}px` }">
                <div class="tooltip-title">{{ pieTooltip.title }}</div>
                <div v-for="item in pieTooltip.rows" :key="item.name" class="tooltip-row">
                  <span class="tooltip-dot" :style="{ background: item.color }" />
                  <span>{{ item.name }}：{{ item.value }}</span>
                </div>
              </div>
            </div>
            <div class="pie-legend-card" aria-label="本期销售占比图例">
              <div class="pie-legend-list">
                <div v-for="item in visiblePieLegendItems" :key="item.displayName" class="pie-legend-item">
                  <span class="pie-legend-dot" :style="{ background: item.color }" />
                  <span class="pie-legend-text">{{ item.displayName }}</span>
                </div>
              </div>
              <div v-if="pieLegendTotalPages > 1" class="pie-legend-pager">
                <button
                  class="pie-legend-arrow"
                  :class="{ 'is-disabled': pieLegendPage <= 1 }"
                  type="button"
                  aria-label="上一页图例"
                  @click="handlePieLegendPrev"
                >
                  ▲
                </button>
                <span class="pie-legend-page">{{ pieLegendPage }}/{{ pieLegendTotalPages }}</span>
                <button
                  class="pie-legend-arrow"
                  :class="{ 'is-disabled': pieLegendPage >= pieLegendTotalPages }"
                  type="button"
                  aria-label="下一页图例"
                  @click="handlePieLegendNext"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="trendRequest.loading.value">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期销售趋势</span>
            </div>
          </template>
          <div class="subclass-trend-chart-wrap" @mousemove="handleSubclassTrendMousemove" @mouseleave="hideSubclassTrendTooltip">
            <div ref="trendChartRef" class="chart-box" />
            <div
              v-if="customTrendTooltip.visible"
              class="subclass-trend-tooltip"
              :style="{ left: `${customTrendTooltip.x}px`, top: `${customTrendTooltip.y}px` }"
            >
              <div class="tooltip-title">{{ customTrendTooltip.title }}</div>
              <div v-for="item in customTrendTooltip.rows" :key="item.name" class="tooltip-row">
                <span class="tooltip-dot" :style="{ background: item.color }" />
                <span>{{ item.name }}：{{ item.value }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="tableRequest.loading.value">
      <template #header>
        <div class="card-header">
          <span class="card-title">明细数据</span>
        </div>
      </template>

      <el-table :data="tableRows" border stripe row-key="categoryKey" class="sub-class-table" header-cell-class-name="sub-class-table-header">
        <el-table-column label="品类" fixed="left" min-width="200" align="center">
          <template #default="{ row }">
            <div class="category-cell">
              <span class="category-code">{{ row.classNo }}</span>
              <span class="category-name">{{ row.className }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="本期" align="center">
          <el-table-column label="销售额" min-width="128" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.currentSales) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="164" align="center" sortable="custom">
            <template #default="{ row }">
              <div class="share-cell">
                <span class="share-value">{{ formatPercent(row.currentSalesPer) }}</span>
                <div class="share-track">
                  <span class="share-fill" :style="{ width: `${getShareBarWidth(row.currentSalesPer)}%` }" />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="毛利额" min-width="128" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.currentGross) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="164" align="center" sortable="custom">
            <template #default="{ row }">
              <div class="share-cell">
                <span class="share-value">{{ formatPercent(row.currentGrossPer) }}</span>
                <div class="share-track">
                  <span class="share-fill" :style="{ width: `${getShareBarWidth(row.currentGrossPer)}%` }" />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="毛利率" min-width="112" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.currentGrossRate) }}</template>
          </el-table-column>
          <el-table-column label="客数" min-width="112" align="center" sortable="custom">
            <template #default="{ row }">{{ formatInteger(row.currentCustomerCount) }}</template>
          </el-table-column>
          <el-table-column label="客单价" min-width="112" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.currentCustomerPrice) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="对比日期" align="center">
          <el-table-column label="销售额" min-width="128" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.compareSales) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="164" align="center" sortable="custom">
            <template #default="{ row }">
              <div class="share-cell">
                <span class="share-value">{{ formatPercent(row.compareSalesPer) }}</span>
                <div class="share-track">
                  <span class="share-fill" :style="{ width: `${getShareBarWidth(row.compareSalesPer)}%` }" />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="118" align="center" sortable="custom">
            <template #default="{ row }">
              <span :class="growthClass(row.compareSalesAddRate)">{{ formatGrowth(row.compareSalesAddRate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="毛利额" min-width="128" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.compareGross) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="164" align="center" sortable="custom">
            <template #default="{ row }">
              <div class="share-cell">
                <span class="share-value">{{ formatPercent(row.compareGrossPer) }}</span>
                <div class="share-track">
                  <span class="share-fill" :style="{ width: `${getShareBarWidth(row.compareGrossPer)}%` }" />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="118" align="center" sortable="custom">
            <template #default="{ row }">
              <span :class="growthClass(row.compareGrossAddRate)">{{ formatGrowth(row.compareGrossAddRate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="毛利率" min-width="112" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.compareGrossRate) }}</template>
          </el-table-column>
          <el-table-column label="客数" min-width="112" align="center" sortable="custom">
            <template #default="{ row }">{{ formatInteger(row.compareCustomerCount) }}</template>
          </el-table-column>
          <el-table-column label="客单价" min-width="112" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.compareCustomerPrice) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="118" align="center" sortable="custom">
            <template #default="{ row }">
              <span :class="growthClass(row.compareCustomerPriceAddRate)">{{ formatGrowth(row.compareCustomerPriceAddRate) }}</span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="效率指标" align="center">
          <el-table-column label="动销率" min-width="124" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.currentTurnoverRate) }}</template>
          </el-table-column>
          <el-table-column label="周转天数" min-width="132" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.currentTurnoverDays) }}</template>
          </el-table-column>
          <el-table-column label="GMROI" min-width="112" align="center" sortable="custom">
            <template #default="{ row }">{{ formatAmount(row.gmroi) }}</template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosisSubClassDetail" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { download } from '@/utils/request';
import { useRequest } from '@/hooks/useRequest';
import { createVueChartTooltip, hideVueChartTooltip, showVueChartTooltip } from './useVueChartTooltip';
import {
  getCategoryDiagnosisSubClassPie,
  getCategoryDiagnosisSubClassTable,
  getCategoryDiagnosisSubClassTrend
} from '@/api/category/diagnosis/detail';
import type {
  DiagnosisSubClassQuery,
  LegacySubclassContributionListRequest,
  LegacySubclassContributionRequest,
  LegacySubclassSalesListItem,
  LegacySubclassSalesListResponse,
  LegacySubclassSalesPerItem,
  LegacySubclassSalesTrendResponse
} from '@/api/category/diagnosis/detail/types';

interface SubClassTableViewRow extends LegacySubclassSalesListItem {
  categoryKey: string;
}

interface PieChartItem extends LegacySubclassSalesPerItem {
  salesAmount: number;
  salesShare: number;
  displayName: string;
  color: string;
}

interface TrendChartSeriesItem {
  classNo: string;
  className: string;
  displayName: string;
  color: string;
  values: number[];
}

const route = useRoute();
const pieChartRef = ref<HTMLDivElement>();
const trendChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const trendChartIns = ref<echarts.ECharts>();

const baseColorMap: Record<string, string> = {
  '00401': '#27b0d6',
  '00402': '#f06b4f',
  '00403': '#b69cff'
};
const subClassPalette = ['#27b0d6', '#f06b4f', '#b69cff', '#16a34a', '#f59e0b', '#ef4444', '#2563eb', '#14b8a6', '#a855f7', '#64748b'];
const subClassColorMap = reactive<Record<string, string>>({ ...baseColorMap });

const pieData = ref<PieChartItem[]>([]);
const trendData = ref<LegacySubclassSalesTrendResponse>({ legend: [], xdata: [], lineDate: [] });
const tableRows = ref<SubClassTableViewRow[]>([]);
const pieLegendPage = ref(1);
const pieLegendPageSize = 5;
const pieTooltip = createVueChartTooltip();
const customTrendTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  rows: [] as Array<{ name: string; value: string; color: string }>
});

const query = computed<DiagnosisSubClassQuery>(() => ({
  sessionId: (route.query.sessionId as string) || '',
  categoryId: route.query.categoryId as string,
  categoryName: (route.query.categoryName as string) || '',
  classLevel: route.query.categoryLevel as string,
  storeNo: (route.query.storeNo as string) || '',
  startDate: (route.query.startDate as string) || '',
  endDate: (route.query.endDate as string) || '',
  compareStartDate: (route.query.compareStartDate as string) || '',
  compareEndDate: (route.query.compareEndDate as string) || '',
  deptId: (route.query.deptId as string) || '',
  retailTypeId: (route.query.retailTypeId as string) || '',
  businessCircleId: (route.query.businessCircleId as string) || '',
  deptGroupId: (route.query.deptGroupId as string) || ''
}));

const sessionId = computed(() => query.value.sessionId || '');
const pieLegendTotalPages = computed(() => Math.max(1, Math.ceil(pieData.value.length / pieLegendPageSize)));
const visiblePieLegendItems = computed(() => {
  const start = (pieLegendPage.value - 1) * pieLegendPageSize;
  return pieData.value.slice(start, start + pieLegendPageSize);
});

const toNumber = (value: unknown, digits?: number) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return typeof digits === 'number' ? Number(num.toFixed(digits)) : num;
};

const getSubClassKey = (classNo: string, className = '') => classNo || className || 'unknown';
const resetSubClassColorMap = () => {
  Object.keys(subClassColorMap).forEach((key) => delete subClassColorMap[key]);
  Object.assign(subClassColorMap, baseColorMap);
};
const registerSubClassColor = (classNo: string, className = '') => {
  const key = getSubClassKey(classNo, className);
  if (!subClassColorMap[key]) {
    const assignedCount = Object.keys(subClassColorMap).filter((item) => !baseColorMap[item]).length;
    subClassColorMap[key] = subClassPalette[assignedCount % subClassPalette.length];
  }
  return subClassColorMap[key];
};
const getSubClassColor = (classNo: string, className = '', index = 0) =>
  subClassColorMap[getSubClassKey(classNo, className)] || subClassPalette[index % subClassPalette.length];
const resolveDisplayName = (classNo: string, className: string) => `${classNo} ${className}`.trim();

const normalizePieData = (payload: LegacySubclassSalesPerItem[] | undefined): PieChartItem[] => {
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map((item, index) => {
    const classNo = String(item.classNo || '');
    const className = String(item.className || '');
    return {
      ...item,
      classNo,
      className,
      salesAmount: toNumber(item.sales ?? 0, 2),
      salesShare: toNumber(item.salesPer ?? 0, 2),
      displayName: resolveDisplayName(classNo, className),
      color: registerSubClassColor(classNo, className)
    };
  });
};

const normalizeTrendData = (payload: LegacySubclassSalesTrendResponse | undefined): LegacySubclassSalesTrendResponse => {
  const source = payload || {};
  if (Array.isArray(source.lineDate)) {
    const seenKeys = new Set<string>();
    source.lineDate.forEach((item) => {
      const classNo = String(item.classNo || '');
      const className = String(item.className || '');
      const key = getSubClassKey(classNo, className);
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      registerSubClassColor(classNo, className);
    });
  }
  return {
    legend: Array.isArray(source.legend) ? source.legend.map((item) => String(item || '')) : [],
    xdata: Array.isArray(source.xdata) ? source.xdata.map((item) => String(item || '')) : [],
    lineDate: Array.isArray(source.lineDate)
      ? source.lineDate.map((item) => ({
          dataDate: item.dataDate,
          classNo: item.classNo,
          className: item.className,
          sales: toNumber(item.sales, 2)
        }))
      : []
  };
};

const normalizeTableRows = (payload: LegacySubclassSalesListResponse | undefined): SubClassTableViewRow[] => {
  const rows = payload?.content || payload?.list || payload?.rows || [];
  return rows.map((item, index) => ({
    ...item,
    classNo: String(item.classNo || ''),
    className: String(item.className || ''),
    categoryKey: `${item.classNo || 'sub-class'}-${index}`
  }));
};

const trendSeries = computed<TrendChartSeriesItem[]>(() => {
  const lineDate = trendData.value.lineDate || [];
  const legend = trendData.value.legend || [];
  const classMap = new Map<string, { className: string; values: Record<string, number> }>();
  lineDate.forEach((item) => {
    const classNo = String(item.classNo || '');
    if (!classMap.has(classNo)) {
      classMap.set(classNo, { className: String(item.className || ''), values: {} });
    }
    classMap.get(classNo)!.values[String(item.dataDate || '')] = toNumber(item.sales, 2);
  });
  return Array.from(classMap.entries()).map(([classNo, row], index) => ({
    classNo,
    className: row.className,
    displayName: resolveDisplayName(classNo, row.className || legend[index] || ''),
    color: getSubClassColor(classNo, row.className, index),
    values: (trendData.value.xdata || []).map((date) => row.values[date] ?? 0)
  }));
});

const buildRequestBody = (): LegacySubclassContributionRequest => ({
  sessionId: sessionId.value,
  deptId: query.value.deptId,
  retailTypeId: query.value.retailTypeId,
  businessCircleId: query.value.businessCircleId,
  deptGroupId: query.value.deptGroupId,
  storeNo: query.value.storeNo,
  classLevel: query.value.classLevel,
  classNo: query.value.categoryId ? String(query.value.categoryId) : '',
  currentStartDate: query.value.startDate,
  currentEndDate: query.value.endDate,
  compareStartDate: query.value.compareStartDate,
  compareEndDate: query.value.compareEndDate
});

const pieRequest = useRequest(async (body: LegacySubclassContributionRequest) => await getCategoryDiagnosisSubClassPie(body), {
  onSuccess: async (res) => {
    pieData.value = normalizePieData(res?.result);
    pieLegendPage.value = 1;
    await nextTick();
    renderPieChart();
  }
});

const trendRequest = useRequest(async (body: LegacySubclassContributionRequest) => await getCategoryDiagnosisSubClassTrend(body), {
  onSuccess: async (res) => {
    trendData.value = normalizeTrendData(res?.result);
    await nextTick();
    renderTrendChart();
  }
});

const tableRequest = useRequest(async (body: LegacySubclassContributionListRequest) => await getCategoryDiagnosisSubClassTable(body), {
  onSuccess: (res) => {
    tableRows.value = normalizeTableRows(res?.result);
  }
});

const initPieChart = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  trendChartIns.value ||= echarts.init(trendChartRef.value);
};

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatInteger = (value: unknown) => formatAmount(value, 0);
const formatPercent = (value: unknown) => `${toNumber(value, 2).toFixed(2)}%`;

const hidePieTooltip = () => {
  hideVueChartTooltip(pieTooltip);
};

const hideSubclassTrendTooltip = () => {
  customTrendTooltip.visible = false;
};

const getPieIndexByMouse = (event: MouseEvent) => {
  if (!pieChartRef.value || !pieData.value.length) return -1;
  const rect = pieChartRef.value.getBoundingClientRect();
  const centerX = rect.width * 0.42;
  const centerY = rect.height * 0.5;
  const radiusBase = Math.min(rect.width, rect.height) / 2;
  const innerRadius = radiusBase * 0.48;
  const outerRadius = radiusBase * 0.7;
  const dx = event.clientX - rect.left - centerX;
  const dy = event.clientY - rect.top - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < innerRadius || distance > outerRadius) return -1;

  const total = pieData.value.reduce((sum, item) => sum + Math.max(0, toNumber(item.salesAmount)), 0);
  if (total <= 0) return -1;

  const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  let cursor = 0;
  for (let index = 0; index < pieData.value.length; index += 1) {
    const span = (Math.max(0, toNumber(pieData.value[index].salesAmount)) / total) * 360;
    if (angle >= cursor && angle < cursor + span) return index;
    cursor += span;
  }
  return pieData.value.length - 1;
};

const getTrendIndexByMouse = (event: MouseEvent, itemCount: number) => {
  if (!trendChartRef.value || !trendChartIns.value || itemCount <= 0) return -1;
  const chartRect = trendChartRef.value.getBoundingClientRect();
  const point: [number, number] = [event.clientX - chartRect.left, event.clientY - chartRect.top];
  if (!trendChartIns.value.containPixel({ gridIndex: 0 }, point)) return -1;
  const coord = trendChartIns.value.convertFromPixel({ gridIndex: 0 }, point);
  const rawIndex = Array.isArray(coord) ? Number(coord[0]) : Number(coord);
  const index = Math.round(rawIndex);
  return Number.isInteger(index) && index >= 0 && index < itemCount ? index : -1;
};

const handlePieTooltipMousemove = (event: MouseEvent) => {
  if (!pieData.value.length || !pieChartRef.value || !pieChartIns.value) {
    hidePieTooltip();
    return;
  }
  const index = getPieIndexByMouse(event);
  if (index < 0) {
    hidePieTooltip();
    return;
  }
  const item = pieData.value[index];
  showVueChartTooltip(
    pieTooltip,
    event,
    item.displayName || '--',
    [
      { name: '销售额', value: formatAmount(item.salesAmount), color: item.color },
      { name: '占比', value: formatPercent(item.salesShare), color: item.color }
    ],
    { width: 230, height: 96 }
  );
};

const handleSubclassTrendMousemove = (event: MouseEvent) => {
  const dates = trendData.value.xdata || [];
  const series = trendSeries.value || [];
  if (!dates.length || !series.length || !trendChartRef.value) {
    hideSubclassTrendTooltip();
    return;
  }

  const index = getTrendIndexByMouse(event, dates.length);
  if (index < 0) {
    hideSubclassTrendTooltip();
    return;
  }
  const rows = series.map((item) => ({
    name: item.displayName || item.classNo || '--',
    value: formatAmount(item.values[index]),
    color: item.color
  }));

  customTrendTooltip.title = dates[index] || '--';
  customTrendTooltip.rows = rows;
  showVueChartTooltip(customTrendTooltip, event, dates[index] || '--', rows, { width: 260, height: 120 });
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;
  const option: EChartsOption = {
    color: pieData.value.map((item) => item.color),
    tooltip: { show: false },
    legend: { show: false },
    series: [
      {
        name: '本期销售占比',
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['42%', '50%'],
        startAngle: 90,
        clockwise: true,
        label: { show: false },
        labelLine: { show: false },
        data: pieData.value.map((item) => ({
          name: item.displayName,
          value: item.salesAmount,
          itemStyle: { color: item.color }
        }))
      }
    ]
  };
  pieChartIns.value.setOption(option, true);
};

const handlePieLegendPrev = () => {
  if (pieLegendPage.value <= 1) return;
  pieLegendPage.value -= 1;
};

const handlePieLegendNext = () => {
  if (pieLegendPage.value >= pieLegendTotalPages.value) return;
  pieLegendPage.value += 1;
};

const renderTrendChart = () => {
  initTrendChart();
  if (!trendChartIns.value) return;
  const option: EChartsOption = {
    color: trendSeries.value.map((item) => item.color),
    tooltip: { show: false },
    legend: {
      top: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: { color: '#606266', fontSize: 13 }
    },
    grid: { left: 56, right: 24, top: 52, bottom: 36 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.xdata || [],
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisTick: { show: false },
      axisLabel: { color: '#606266', fontSize: 12, rotate: (trendData.value.xdata || []).length > 8 ? 30 : 0 }
    },
    yAxis: {
      type: 'value',
      name: '元',
      nameTextStyle: { color: '#909399' },
      axisLine: { show: false },
      axisLabel: { color: '#606266', formatter: (value: number) => formatAmount(value, 0) },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    series: trendSeries.value.map((item) => ({
      name: item.displayName,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      data: item.values,
      lineStyle: { width: 2, color: item.color },
      itemStyle: { color: item.color, borderColor: '#fff', borderWidth: 1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${item.color}66` },
          { offset: 1, color: `${item.color}12` }
        ])
      }
    }))
  };
  trendChartIns.value.setOption(option, true);
};

const loadPageData = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载子类贡献详情');
    return;
  }
  resetSubClassColorMap();
  const body = buildRequestBody();
  await Promise.all([
    pieRequest.run(body),
    trendRequest.run(body),
    tableRequest.run({ ...body, page: 1, size: 999, order: 'currentSales', orderType: 'desc' })
  ]);
};

const handleExport = () => {
  if (!sessionId.value) {
    ElMessage.warning('缺少 sessionId，无法导出');
    return;
  }
  download('/api/v1/diagnosis/subClass/export', { sessionId: sessionId.value }, `子类贡献_${sessionId.value}.xlsx`);
};

const getShareBarWidth = (value: unknown) => {
  const normalized = Math.abs(toNumber(value));
  return Math.min(normalized <= 1 ? normalized * 100 : normalized, 100);
};

const formatGrowth = (value: unknown) => {
  const num = toNumber(value, 2);
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const growthClass = (value: unknown) => {
  const num = Number(value ?? 0);
  if (num > 0) return 'growth-text is-up';
  if (num < 0) return 'growth-text is-down';
  return 'growth-text is-flat';
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  trendChartIns.value?.resize();
};

watch(
  () => route.query.sessionId,
  async () => {
    await loadPageData();
  }
);

onMounted(async () => {
  pieData.value = normalizePieData(undefined);
  trendData.value = normalizeTrendData(undefined);
  await nextTick();
  renderPieChart();
  renderTrendChart();
  await loadPageData();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  trendChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-diagnosis-sub-class-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}
.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.header-card {
  margin-bottom: 12px;
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
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
  color: var(--el-text-color-primary);
}
.role-tag {
  width: fit-content;
}
.page-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 2px;
}
.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.export-button {
  padding: 0;
  font-size: 14px;
}
.chart-row {
  margin-bottom: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.chart-box {
  width: 100%;
  height: 360px;
}
.pie-chart-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  align-items: center;
  gap: 18px;
  min-height: 360px;
  padding: 8px 20px 8px 8px;
}
.pie-chart-box {
  width: 100%;
  height: 360px;
}
.vue-chart-tooltip-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.pie-legend-card {
  min-height: 210px;
  padding: 26px 24px 18px;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.pie-legend-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.pie-legend-item {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}
.pie-legend-dot {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 999px;
}
.pie-legend-text {
  min-width: 0;
  overflow: hidden;
  color: #2f3a45;
  font-size: 15px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pie-legend-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 18px;
  color: #2f3a45;
  font-size: 15px;
}
.pie-legend-arrow {
  border: 0;
  background: transparent;
  color: #34495e;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}
.pie-legend-arrow:first-child {
  color: #b7b7b7;
}
.pie-legend-arrow.is-disabled {
  cursor: not-allowed;
  opacity: 0.35;
}
.pie-legend-page {
  min-width: 34px;
  text-align: center;
}
.subclass-trend-chart-wrap {
  position: relative;
  width: 100%;
  height: 360px;
}
.subclass-trend-tooltip {
  position: absolute;
  z-index: 20;
  min-width: 220px;
  max-width: 300px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(17, 24, 39, 0.94);
  color: #fff;
  font-size: 12px;
  line-height: 1.6;
  pointer-events: none;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24);
}
.tooltip-title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 800;
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
  flex-shrink: 0;
  border-radius: 999px;
}
.category-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  text-align: center;
}
.category-code {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.category-name {
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.share-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.share-value {
  min-width: 56px;
  color: #0f766e;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.share-track {
  width: 72px;
  height: 8px;
  border-radius: 999px;
  background: #d9f2ef;
  overflow: hidden;
}
.share-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #16c2a3 0%, #0ea5a4 100%);
}
.growth-text {
  font-weight: 600;
}
.growth-text.is-up {
  color: var(--el-color-danger);
}
.growth-text.is-down {
  color: var(--el-color-success);
}
.growth-text.is-flat {
  color: var(--el-text-color-secondary);
}
.sub-class-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.sub-class-table :deep(.sub-class-table-header) {
  text-align: center;
}
.sub-class-table :deep(.el-table__header .cell) {
  white-space: normal;
  line-height: 1.4;
}
.sub-class-table :deep(.cell) {
  font-size: 13px;
  text-align: center;
}
.sub-class-table :deep(.el-table__body td) {
  color: var(--el-text-color-regular);
}
.sub-class-table :deep(.el-table__empty-block) {
  min-height: 220px;
}
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }
  .page-actions {
    width: 100%;
    justify-content: space-between;
  }
  .chart-box {
    height: 320px;
  }
  .pie-chart-panel {
    grid-template-columns: 1fr;
    padding: 0;
  }
  .pie-chart-box {
    height: 300px;
  }
  .pie-legend-card {
    min-height: auto;
  }
  .subclass-trend-chart-wrap {
    height: 320px;
  }
}
</style>
