<template>
  <div class="p-2 category-diagnosis-customer-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">客户分析</span>
          </div>
        </div>
        <div class="page-actions">
          <el-select v-model="filters.group" class="header-select" size="small">
            <el-option label="全部年龄" value="all" />
            <el-option v-for="item in ageGroups" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="filters.gender" class="header-select" size="small">
            <el-option label="全部性别" value="ALL" />
            <el-option label="男" value="1" />
            <el-option label="女" value="2" />
            <el-option label="未知" value="3" />
          </el-select>
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card radar-card" v-loading="radarLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">客户分析雷达</span>
        </div>
      </template>
      <div class="vue-chart-tooltip-wrap" @mousemove="handleRadarTooltipMousemove" @mouseleave="hideRadarTooltip">
        <div ref="radarChartRef" class="radar-chart-box" />
        <div v-if="radarTooltip.visible" class="vue-chart-tooltip" :style="{ left: `${radarTooltip.x}px`, top: `${radarTooltip.y}px` }">
          <div class="tooltip-title">{{ radarTooltip.title }}</div>
          <div v-for="item in radarTooltip.rows" :key="item.name" class="tooltip-row">
            <span v-if="item.color" class="tooltip-dot" :style="{ background: item.color }" />
            <span>{{ item.name }}：{{ item.value }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card table-card" v-loading="tableLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">本期不同群体贡献分析</span>
        </div>
      </template>
      <el-table :data="displayRows" border stripe row-key="ageKey" class="customer-table">
        <el-table-column label="年龄" min-width="120" fixed="left">
          <template #default="{ row }">{{ row.ageName || row.ageCode || '-' }}</template>
        </el-table-column>

        <el-table-column label="汇总">
          <el-table-column label="消费金额" min-width="130" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentSales) }}</template>
          </el-table-column>
          <el-table-column label="购物次数" min-width="120" align="right">
            <template #default="{ row }">{{ formatInteger(row.currentCustomerCount) }}</template>
          </el-table-column>
          <el-table-column label="平均客单价" min-width="130" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentCustomerPrice) }}</template>
          </el-table-column>
          <el-table-column label="平均商品单价" min-width="140" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentUnitPrice) }}</template>
          </el-table-column>
          <el-table-column label="平均购买件数" min-width="140" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentCountAve) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="男性">
          <el-table-column label="消费金额" min-width="130" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentManSales) }}</template>
          </el-table-column>
          <el-table-column label="购物次数" min-width="120" align="right">
            <template #default="{ row }">{{ formatInteger(row.currentManCustomerCount) }}</template>
          </el-table-column>
          <el-table-column label="平均客单价" min-width="130" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentManCustomerPrice) }}</template>
          </el-table-column>
          <el-table-column label="平均商品单价" min-width="140" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentManUnitPrice) }}</template>
          </el-table-column>
          <el-table-column label="平均购买件数" min-width="140" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentManCountAve) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="女性">
          <el-table-column label="消费金额" min-width="130" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentWomanSales) }}</template>
          </el-table-column>
          <el-table-column label="购物次数" min-width="120" align="right">
            <template #default="{ row }">{{ formatInteger(row.currentWomanCustomerCount) }}</template>
          </el-table-column>
          <el-table-column label="平均客单价" min-width="130" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentWomanCustomerPrice) }}</template>
          </el-table-column>
          <el-table-column label="平均商品单价" min-width="140" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentWomanUnitPrice) }}</template>
          </el-table-column>
          <el-table-column label="平均购买件数" min-width="140" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentWomanCountAve) }}</template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageState.page"
          v-model:page-size="pageState.size"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
          :total="pageState.total"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosisCustomerDetail" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useRequest } from '@/hooks/useRequest';
import { createVueChartTooltip, hideVueChartTooltip, showVueChartTooltip } from './useVueChartTooltip';
import {
  getCategoryDiagnosisCustomerAgeBuckets,
  getCategoryDiagnosisCustomerDetails,
  getCategoryDiagnosisCustomerRadar
} from '@/api/category/diagnosis/detail';
import type {
  CustomerAgeBucketResponse,
  CustomerSalesDetailsItemResponse,
  CustomerSalesDetailsResponse,
  CustomerSalesRadarItemResponse,
  DiagnosisSubClassQuery
} from '@/api/category/diagnosis/detail/types';

interface AgeBarItem extends CustomerAgeBucketResponse {
  ageKey: string;
}

interface RadarSeriesItem {
  name: string;
  value: number[];
}

const metricLabels = ['购物次数', '消费金额', '平均客单价', '平均商品单价', '平均购买件数'];

const ageGroups = [
  { label: '20岁及以下', value: '0' },
  { label: '21-30岁', value: '1' },
  { label: '31-40岁', value: '2' },
  { label: '41-50岁', value: '3' },
  { label: '51-60岁', value: '4' },
  { label: '61岁及以上', value: '5' }
];

const ageGroupOrder = ageGroups.map((item) => item.label);

const ageColorMap: Record<string, string> = {
  '20岁及以下': '#34c6d8',
  '21-30岁': '#f75a32',
  '31-40岁': '#7d6ff2',
  '41-50岁': '#e84f73',
  '51-60岁': '#59df6b',
  '61岁及以上': '#ff7043'
};

const ageLabelAliasMap: Record<string, string[]> = {
  '20岁及以下': ['20岁及以下', '20岁以下', '20及以下'],
  '21-30岁': ['21-30岁', '21-30'],
  '31-40岁': ['31-40岁', '31-40'],
  '41-50岁': ['41-50岁', '41-50'],
  '51-60岁': ['51-60岁', '51-60'],
  '61岁及以上': ['61岁及以上', '61岁以上', '61及以上']
};

const route = useRoute();
const radarChartRef = ref<HTMLDivElement>();
const radarChartIns = ref<echarts.ECharts>();
const radarTooltip = createVueChartTooltip();

const query = computed<DiagnosisSubClassQuery>(() => ({
  sessionId: (route.query.sessionId as string) || ''
}));

const sessionId = computed(() => query.value.sessionId || '');

const filters = reactive({
  group: 'all',
  gender: 'ALL'
});

const pageState = reactive({
  page: 1,
  size: 10,
  total: 0
});

const ageRows = ref<AgeBarItem[]>([]);
const radarRows = ref<CustomerSalesRadarItemResponse[]>([]);
const tableRows = ref<(CustomerSalesDetailsItemResponse & { ageKey: string })[]>([]);

const toNumber = (value: unknown, digits?: number) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return typeof digits === 'number' ? Number(num.toFixed(digits)) : num;
};

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatInteger = (value: unknown) => formatAmount(value, 0);

const normalizeAgeRows = (payload: CustomerAgeBucketResponse[] | undefined): AgeBarItem[] =>
  (payload || []).map((item, index) => ({
    ...item,
    ageKey: `${item.ageCode || 'age'}-${index}`
  }));

const normalizeRadarRows = (payload: CustomerSalesRadarItemResponse[] | undefined) => payload || [];

const normalizeTableRows = (payload: CustomerSalesDetailsResponse | undefined) => {
  pageState.total = Number(payload?.total || 0);
  pageState.page = Number(payload?.current || pageState.page);
  pageState.size = Number(payload?.size || pageState.size);
  return (payload?.records || []).map((item, index) => ({
    ...item,
    ageKey: `${item.ageCode || 'age'}-${index}`
  }));
};

const ageRequest = useRequest(async (id: string) => await getCategoryDiagnosisCustomerAgeBuckets(id), {
  onSuccess: (res) => {
    ageRows.value = normalizeAgeRows(res?.data);
  }
});

const radarRequest = useRequest(async (id: string) => await getCategoryDiagnosisCustomerRadar(id), {
  onSuccess: async (res) => {
    radarRows.value = normalizeRadarRows(res?.data);
    await nextTick();
    renderRadarChart();
  }
});

const tableRequest = useRequest(
  async (params: { id: string; page: number; size: number }) =>
    await getCategoryDiagnosisCustomerDetails(params.id, params.page, params.size, 'ageOrder', 'asc'),
  {
    onSuccess: (res) => {
      tableRows.value = normalizeTableRows(res?.data);
    }
  }
);

const radarLoading = computed(() => radarRequest.loading.value);
const tableLoading = computed(() => tableRequest.loading.value);

const getRadarDimensionValue = (item: CustomerSalesRadarItemResponse | undefined, index: number) => {
  if (!item) return 0;
  const values = [
    item.currentCustomerCount,
    item.currentSales,
    item.currentCustomerPrice,
    item.currentUnitPrice,
    item.currentCountAve
  ];
  return toNumber(values[index], 2);
};

const hideRadarTooltip = () => {
  hideVueChartTooltip(radarTooltip);
};

const matchesGender = (item: CustomerSalesRadarItemResponse) => {
  if (filters.gender === 'ALL') return true;
  return String(item.gender ?? '') === String(filters.gender);
};

const matchesGroup = (ageName: string) => {
  if (filters.group === 'all') return true;
  const groupIndex = ageGroupOrder.indexOf(ageName);
  return String(groupIndex) === String(filters.group);
};

const findRadarRowByAge = (ageName: string) => {
  const aliases = ageLabelAliasMap[ageName] || [ageName];
  return radarRows.value.find((item) => matchesGender(item) && aliases.includes(String(item.ageName || '')));
};

const visibleRadarSeries = computed<RadarSeriesItem[]>(() =>
  ageGroupOrder
    .filter(matchesGroup)
    .map((ageName) => {
      const row = findRadarRowByAge(ageName);
      return {
        name: ageName,
        value: metricLabels.map((_, index) => getRadarDimensionValue(row, index))
      };
    })
    .filter((item) => item.value.some((value) => value > 0))
);

const handleRadarTooltipMousemove = (event: MouseEvent) => {
  if (!radarChartRef.value || !radarChartIns.value || !visibleRadarSeries.value.length) {
    hideRadarTooltip();
    return;
  }
  const rect = radarChartRef.value.getBoundingClientRect();
  const point = [event.clientX - rect.left, event.clientY - rect.top];
  const index = visibleRadarSeries.value.findIndex((_, dataIndex) => radarChartIns.value?.containPixel({ seriesIndex: 0, dataIndex }, point));
  const item = index >= 0 ? visibleRadarSeries.value[index] : null;
  if (!item) {
    hideRadarTooltip();
    return;
  }
  showVueChartTooltip(
    radarTooltip,
    event,
    item.name,
    metricLabels.map((label, valueIndex) => ({
      name: label,
      value: formatAmount(item.value[valueIndex]),
      color: ageColorMap[item.name]
    })),
    { width: 260, height: 150 }
  );
};

const renderRadarChart = () => {
  if (!radarChartRef.value) return;
  if (!radarChartIns.value) radarChartIns.value = echarts.init(radarChartRef.value);

  const chartSeries = visibleRadarSeries.value;

  const values = chartSeries.flatMap((item) => item.value);
  const radarMax = Math.max(1, ...values);
  const indicatorMax = Number((radarMax * 1.2).toFixed(2));

  radarChartIns.value.setOption(
    {
      tooltip: { show: false },
      legend: {
        orient: 'vertical',
        right: 56,
        top: 'center',
        itemWidth: 32,
        itemHeight: 14,
        itemGap: 13,
        icon: 'roundRect',
        textStyle: {
          color: '#4b5563',
          fontSize: 14,
          padding: [0, 0, 0, 4]
        }
      },
      radar: {
        center: ['39%', '52%'],
        radius: 150,
        splitNumber: 5,
        axisName: {
          color: '#1f2937',
          fontSize: 18,
          lineHeight: 24
        },
        axisNameGap: 16,
        splitArea: {
          areaStyle: {
            color: ['rgba(248, 250, 252, 0.55)', 'rgba(241, 245, 249, 0.38)']
          }
        },
        splitLine: {
          lineStyle: {
            color: '#dbe3ef'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#dbe3ef'
          }
        },
        indicator: metricLabels.map((name) => ({ name, max: indicatorMax }))
      },
      series: [
        {
          type: 'radar',
          symbol: 'circle',
          symbolSize: 8,
          data: chartSeries.map((item) => ({
            name: item.name,
            value: item.value,
            lineStyle: { width: 3, color: ageColorMap[item.name] },
            itemStyle: { color: ageColorMap[item.name] },
            areaStyle: { opacity: 0, color: ageColorMap[item.name] }
          }))
        }
      ]
    } as EChartsOption,
    true
  );
};

const displayRows = computed(() => {
  const order = ['ALL', '0', '1', '2', '3', '4', '5'];
  return [...tableRows.value]
    .filter((row) => {
      if (filters.group === 'all') return true;
      return String(order.indexOf(row.ageCode || '')) === String(filters.group);
    })
    .sort((a, b) => {
      const ai = order.indexOf(a.ageCode || '');
      const bi = order.indexOf(b.ageCode || '');
      if (ai !== bi) return ai - bi;
      return Number(a.ageOrder || 0) - Number(b.ageOrder || 0);
    });
});

const loadPageData = async () => {
  if (!sessionId.value) return;
  await Promise.all([
    ageRequest.run(sessionId.value),
    radarRequest.run(sessionId.value),
    tableRequest.run({ id: sessionId.value, page: pageState.page, size: pageState.size })
  ]);
};

const handlePageChange = async () => {
  if (!sessionId.value) return;
  await tableRequest.run({ id: sessionId.value, page: pageState.page, size: pageState.size });
};

const handleExport = () => {
  ElMessage.info('导出功能后续对接真实接口');
};

const resizeCharts = () => {
  radarChartIns.value?.resize();
};

onMounted(async () => {
  await loadPageData();
  window.addEventListener('resize', resizeCharts);
});

watch(
  () => [filters.group, filters.gender],
  () => {
    renderRadarChart();
  }
);

watch(
  () => route.query.sessionId,
  async () => {
    await loadPageData();
  }
);

watch(
  () => filters.gender,
  async () => {
    if (!sessionId.value) return;
    await radarRequest.run(sessionId.value);
  }
);

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  radarChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-diagnosis-customer-page {
  background: #f5f7fa;
  min-height: 100%;
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
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.page-header-left {
  display: flex;
  flex-direction: column;
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
  color: #0f172a;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.header-select {
  width: 150px;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.radar-card,
.table-card {
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
  color: #0f172a;
}

.radar-chart-box {
  width: 100%;
  height: 520px;
}

.vue-chart-tooltip-wrap {
  position: relative;
  width: 100%;
  height: 520px;
}

.vue-chart-tooltip {
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

.customer-table :deep(.el-table__header th) {
  background: #f8fafc;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
}

.customer-table :deep(.cell) {
  font-size: 13px;
}

.customer-table :deep(.el-table__body td) {
  color: #334155;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-actions {
    justify-content: flex-start;
  }

  .radar-chart-box {
    height: 420px;
  }

  .vue-chart-tooltip-wrap {
    height: 420px;
  }
}
</style>
