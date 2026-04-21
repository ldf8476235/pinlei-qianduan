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
          <div ref="pieChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="trendRequest.loading.value">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期销售趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="tableRequest.loading.value">
      <template #header>
        <div class="card-header">
          <span class="card-title">明细数据</span>
        </div>
      </template>

      <el-table
        :data="tableRows"
        border
        stripe
        row-key="categoryKey"
        class="sub-class-table"
        header-cell-class-name="sub-class-table-header"
      >
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

const colorMap: Record<string, string> = {
  '00401': '#27b0d6',
  '00402': '#f06b4f',
  '00403': '#b69cff'
};

const pieData = ref<PieChartItem[]>([]);
const trendData = ref<LegacySubclassSalesTrendResponse>({ legend: [], xdata: [], lineDate: [] });
const tableRows = ref<SubClassTableViewRow[]>([]);

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

const toNumber = (value: unknown, digits?: number) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return typeof digits === 'number' ? Number(num.toFixed(digits)) : num;
};

const resolveColor = (classNo: string, index: number) => colorMap[classNo] || Object.values(colorMap)[index % 3] || '#27b0d6';
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
      color: resolveColor(classNo, index)
    };
  });
};

const normalizeTrendData = (payload: LegacySubclassSalesTrendResponse | undefined): LegacySubclassSalesTrendResponse => {
  const source = payload || {};
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
    color: resolveColor(classNo, index),
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

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;
  const option: EChartsOption = {
    color: pieData.value.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      formatter: (params: any) =>
        `${params.name}<br/>销售额：${formatAmount(params.value)}<br/>占比：${toNumber(params.percent, 2).toFixed(2)}%`
    },
    legend: { show: false },
    series: [
      {
        name: '本期销售占比',
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['34%', '50%'],
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

const renderTrendChart = () => {
  initTrendChart();
  if (!trendChartIns.value) return;
  const option: EChartsOption = {
    color: trendSeries.value.map((item) => item.color),
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        const title = rows[0]?.axisValueLabel || rows[0]?.axisValue || '';
        const lines = rows.map((item) => `${item.marker}${item.seriesName}：${formatAmount(item.value)}`);
        return [title, ...lines].join('<br/>');
      }
    },
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
}
</style>
