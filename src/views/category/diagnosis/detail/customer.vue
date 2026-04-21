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
            <el-option label="全部" value="all" />
            <el-option label="20岁及以下" value="0" />
            <el-option label="21-30岁" value="1" />
            <el-option label="31-40岁" value="2" />
            <el-option label="41-50岁" value="3" />
            <el-option label="51-60岁" value="4" />
            <el-option label="61岁及以上" value="5" />
          </el-select>
          <el-select v-model="filters.gender" class="header-select" size="small">
            <el-option label="选择性别" value="" />
            <el-option label="全部" value="ALL" />
            <el-option label="男性" value="1" />
            <el-option label="女性" value="2" />
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
      <div ref="radarChartRef" class="radar-chart-box" />
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

const route = useRoute();
const radarChartRef = ref<HTMLDivElement>();
const radarChartIns = ref<echarts.ECharts>();

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
  onSuccess: (res) => {
    radarRows.value = normalizeRadarRows(res?.data);
    nextTick(renderRadarChart);
  }
});

const tableRequest = useRequest(async (id: string, page = 1, size = 10) => await getCategoryDiagnosisCustomerDetails(id, page, size, 'ageOrder', 'asc'), {
  onSuccess: (res) => {
    tableRows.value = normalizeTableRows(res?.data);
  }
});

const radarLoading = computed(() => radarRequest.loading.value);
const tableLoading = computed(() => tableRequest.loading.value);

const metricLabels = ['购物次数', '消费金额', '平均客单价', '平均商品单价', '平均购买件数'];

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

const buildRadarSourceRows = () => {
  const ageGroupOrder = ['20岁及以下', '21-30岁', '31-40岁', '41-50岁', '51-60岁', '61岁及以上'];
  const genderValue = filters.gender;
  const rows = radarRows.value.filter((item) => item.ageCode !== 'ALL' && item.ageName !== '全部');
  return ageGroupOrder.map((ageName) => {
    const matched = rows.filter((item) => {
      const sameAge = item.ageName === ageName;
      const sameGender = genderValue === 'ALL' || String(item.gender ?? '') === genderValue;
      return sameAge && sameGender;
    });
    return matched[0];
  });
};

const renderRadarChart = () => {
  if (!radarChartRef.value) return;
  if (!radarChartIns.value) radarChartIns.value = echarts.init(radarChartRef.value);

  const ageGroupOrder = ['20岁及以下', '21-30岁', '31-40岁', '41-50岁', '51-60岁', '61岁及以上'];
  const ageColorMap: Record<string, string> = {
    '20岁及以下': '#3b82f6',
    '21-30岁': '#22c55e',
    '31-40岁': '#f59e0b',
    '41-50岁': '#ef4444',
    '51-60岁': '#8b5cf6',
    '61岁及以上': '#14b8a6'
  };
  const sourceRows = buildRadarSourceRows();
  const chartSeries: RadarSeriesItem[] = ageGroupOrder.map((ageName, index) => ({
    name: ageName,
    value: metricLabels.map((_, metricIndex) => getRadarDimensionValue(sourceRows[index], metricIndex))
  }));

  radarChartIns.value.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const values = params?.value || [];
        return `${params.name}<br/>${metricLabels.map((label: string, index: number) => `${label}：${formatAmount(values[index])}`).join('<br/>')}`;
      }
    },
    legend: {
      orient: 'vertical',
      right: 6,
      top: 'middle',
      itemGap: 14,
      icon: 'roundRect'
    },
    radar: {
      center: ['40%', '55%'],
      radius: '62%',
      indicator: metricLabels.map((name) => ({ name, max: 100000 }))
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 5,
        data: chartSeries.map((item) => ({
          name: item.name,
          value: item.value,
          lineStyle: { width: 2, color: ageColorMap[item.name] },
          itemStyle: { color: ageColorMap[item.name] },
          areaStyle: { opacity: 0.08, color: ageColorMap[item.name] }
        }))
      }
    ]
  } as EChartsOption);
};

const displayRows = computed(() => {
  const order = ['ALL', '0', '1', '2', '3', '4', '5'];
  return [...tableRows.value].sort((a, b) => {
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
    tableRequest.run(sessionId.value, pageState.page, pageState.size)
  ]);
};

const handlePageChange = async () => {
  await tableRequest.run(sessionId.value, pageState.page, pageState.size);
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
  () => route.query.sessionId,
  async () => {
    await loadPageData();
  }
);

watch(
  () => [filters.gender, filters.group],
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
}
</style>
