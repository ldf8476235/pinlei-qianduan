<template>
  <div class="p-2 category-analysis-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-toolbar">
        <div class="filter-form">
          <el-select v-model="queryForm.storeScope" class="filter-item" placeholder="门店范围">
            <el-option v-for="item in filterOptions.storeOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="queryForm.categoryLevel" class="filter-item" placeholder="品类级别">
            <el-option v-for="item in filterOptions.levelOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
          <el-select
            v-model="queryForm.categoryIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            class="filter-category"
            placeholder="品类"
          >
            <el-option v-for="item in filterOptions.categoryOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
          <el-date-picker
            v-model="currentDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="本期开始"
            end-placeholder="本期结束"
            range-separator="-"
            class="filter-date"
          />
          <el-date-picker
            v-model="compareDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="对比开始"
            end-placeholder="对比结束"
            range-separator="-"
            class="filter-date"
          />
        </div>
        <div class="filter-actions">
          <el-button text type="primary" @click="showSearch = !showSearch">{{ showSearch ? '收起' : '展开' }}</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" class="query-button" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="showSearch" class="search-extra">
          <el-alert type="error" :closable="false" show-icon class="warning-card">
            <template #title>
              <span class="warning-title">异常预警</span>
            </template>
            <div class="warning-list">
              <div v-for="item in alertItems" :key="item" class="warning-item">{{ item }}</div>
            </div>
          </el-alert>
        </div>
      </transition>
    </el-card>

    <el-card shadow="hover" class="page-card chart-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类角色 / 角色策略</span>
          <el-button link type="primary" @click="handleRoleDetail">详情</el-button>
        </div>
      </template>
      <div ref="roleChartRef" class="chart-box role-chart-box" />
    </el-card>

    <el-card shadow="hover" class="page-card chart-card">
      <template #header>
        <div class="card-header">
          <div class="card-title-wrap">
            <span class="card-title">品类SKU数</span>
            <el-tooltip content="名词释义" placement="top">
              <span class="glossary-icon">?</span>
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="sku-panel">
        <div ref="skuRatioChartRef" class="chart-box sku-chart-box" />
        <div ref="skuCountChartRef" class="chart-box sku-chart-box" />
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card chart-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">销售额变动</span>
          <el-pagination
            v-model:current-page="salesPage.pageNum"
            :page-size="salesPage.pageSize"
            :total="salesPage.total"
            layout="prev, pager, next"
            :pager-count="5"
            background
            @current-change="handleSalesPageChange"
          />
        </div>
      </template>
      <div ref="salesChartRef" class="chart-box sales-chart-box" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryCheckAlert,
  getCategoryCheckFilter,
  getCategoryCheckRole,
  getCategoryCheckSales,
  getCategoryCheckSku
} from '@/api/category/check';
import type {
  CategoryCheckAlertVO,
  CategoryCheckFilterVO,
  CategoryCheckQuery,
  CategoryCheckRoleVO,
  CategoryCheckSalesQuery,
  CategoryCheckSalesVO,
  CategoryCheckSkuVO
} from '@/api/category/check/types';

const proxy = getCurrentInstance()?.proxy as any;
const route = useRoute();

const showSearch = ref(true);
const roleChartRef = ref<HTMLDivElement>();
const skuRatioChartRef = ref<HTMLDivElement>();
const skuCountChartRef = ref<HTMLDivElement>();
const salesChartRef = ref<HTMLDivElement>();
const roleChartIns = ref<echarts.ECharts>();
const skuRatioChartIns = ref<echarts.ECharts>();
const skuCountChartIns = ref<echarts.ECharts>();
const salesChartIns = ref<echarts.ECharts>();

const filterOptions = reactive<CategoryCheckFilterVO>({
  storeOptions: [],
  levelOptions: [],
  categoryOptions: []
});

const queryForm = reactive({
  storeScope: '0',
  categoryLevel: '',
  categoryIds: [] as Array<string | number>
});

const DEFAULT_CURRENT_DATE_RANGE: [string, string] = ['2026-04-01', '2026-04-30'];
const DEFAULT_COMPARE_DATE_RANGE: [string, string] = ['2026-03-01', '2026-03-31'];

const currentDateRange = ref<[string, string]>([...DEFAULT_CURRENT_DATE_RANGE]);
const compareDateRange = ref<[string, string]>([...DEFAULT_COMPARE_DATE_RANGE]);

const salesPage = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const alertState = reactive<CategoryCheckAlertVO>({
  roleAbnormalCount: 0,
  skuStructureAbnormalCount: 0,
  skuPresetAbnormalCount: 0
});

const roleState = ref<CategoryCheckRoleVO>({ list: [] });
const skuState = ref<CategoryCheckSkuVO>({ list: [] });
const salesState = ref<CategoryCheckSalesVO>({ rows: [], total: 0, pageNum: 1, pageSize: 10 });

const filterRequest = useRequest(async () => await getCategoryCheckFilter(), {
  onSuccess: (res) => {
    const data = res?.data;
    if (!data) return;
    filterOptions.storeOptions = data.storeOptions || [];
    filterOptions.levelOptions = data.levelOptions || [];
    filterOptions.categoryOptions = data.categoryOptions || [];
    queryForm.storeScope = String(filterOptions.storeOptions[0]?.value ?? '0');
    queryForm.categoryLevel = String(filterOptions.levelOptions[0]?.value ?? '');
  }
});

const alertRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckAlert(params), {
  onSuccess: (res) => {
    Object.assign(alertState, res?.data || {});
  }
});

const roleRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckRole(params), {
  onSuccess: async (res) => {
    roleState.value = res?.data || { list: [] };
    await nextTick();
    renderRoleChart();
  }
});

const skuRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckSku(params), {
  onSuccess: async (res) => {
    skuState.value = res?.data || { list: [] };
    await nextTick();
    renderSkuCharts();
  }
});

const salesRequest = useRequest(async (params: CategoryCheckSalesQuery) => await getCategoryCheckSales(params), {
  onSuccess: async (res) => {
    salesState.value = res?.data || { rows: [], total: 0, pageNum: 1, pageSize: salesPage.pageSize };
    salesPage.total = salesState.value.total || 0;
    salesPage.pageNum = salesState.value.pageNum || salesPage.pageNum;
    salesPage.pageSize = salesState.value.pageSize || salesPage.pageSize;
    await nextTick();
    renderSalesChart();
  }
});

const buildQuery = (): CategoryCheckQuery => ({
  storeScope: queryForm.storeScope,
  categoryLevel: queryForm.categoryLevel,
  categoryIds: queryForm.categoryIds,
  currentStartDate: currentDateRange.value?.[0],
  currentEndDate: currentDateRange.value?.[1],
  compareStartDate: compareDateRange.value?.[0],
  compareEndDate: compareDateRange.value?.[1]
});

const alertItems = computed(() => [
  `存在${alertState.roleAbnormalCount || 0}个品类角色异常`,
  `存在${alertState.skuStructureAbnormalCount || 0}个品类SKU数异常`,
  `存在${alertState.skuPresetAbnormalCount || 0}个品类SKU数异常`
]);

const initChart = (refEl: Ref<HTMLDivElement | undefined>, ins: Ref<echarts.ECharts | undefined>) => {
  if (!refEl.value) return;
  if (!ins.value) ins.value = echarts.init(refEl.value);
};

const renderRoleChart = () => {
  initChart(roleChartRef, roleChartIns);
  if (!roleChartIns.value) return;
  const data = roleState.value.list || [];
  roleChartIns.value.setOption(
    {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const row = params.data?.raw || {};
          return [
            `${row.categoryCode || ''} ${row.categoryName || ''}`,
            `品类角色：${row.roleName || '--'}`,
            `综合贡献率：${row.contributionRate ?? 0}%`,
            `销售对比增长率：${row.growthRate ?? 0}%`,
            `SKU数：${row.skuCount ?? 0}`,
            `销售额：${row.salesAmount ?? '--'}`
          ].join('<br/>');
        }
      },
      grid: { left: 70, right: 24, top: 60, bottom: 52 },
      xAxis: {
        type: 'value',
        name: '综合贡献率%',
        min: 0,
        max: 50,
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      yAxis: {
        type: 'value',
        name: '销售对比增长率%',
        min: 0,
        max: 15,
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#edf2f7' } }
      },
      graphic: [
        { type: 'text', left: 54, top: 18, style: { text: '幼童品类', fill: '#64748b', fontSize: 14, fontWeight: 600 } },
        { type: 'text', right: 56, top: 18, style: { text: '明星品类', fill: '#64748b', fontSize: 14, fontWeight: 600 } },
        { type: 'text', left: 54, bottom: 18, style: { text: '结构品类', fill: '#64748b', fontSize: 14, fontWeight: 600 } },
        { type: 'text', right: 56, bottom: 18, style: { text: '金牛品类', fill: '#64748b', fontSize: 14, fontWeight: 600 } }
      ],
      series: [
        {
          type: 'scatter',
          symbolSize: 14,
          label: {
            show: true,
            position: 'top',
            color: '#334155',
            fontSize: 12,
            formatter: (params: any) => `${params.data?.raw?.categoryCode || ''} ${params.data?.raw?.categoryName || ''}`
          },
          data: data.map((item) => ({
            value: [Number(item.contributionRate || 0), Number(item.growthRate || 0)],
            raw: item,
            itemStyle: {
              color: item.roleMatchStatus === 'match' ? '#2A9D8F' : item.roleMatchStatus === 'mismatch' ? '#F4A261' : '#9CA3AF'
            }
          }))
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderSkuCharts = () => {
  const list = skuState.value.list || [];
  const names = list.map((item) => item.categoryName);
  const skuRatio = list.map((item) => Number(item.skuRatio || 0));
  const salesRatio = list.map((item) => Number(item.salesRatio || 0));
  const ratioDiff = list.map((item) => Number(item.ratioDiff || 0));
  const currentSku = list.map((item) => Number(item.currentSkuCount || 0));
  const presetSku = list.map((item) => Number(item.presetSkuCount || 0));
  const skuDiff = list.map((item) => Number(item.skuDiff || 0));

  initChart(skuRatioChartRef, skuRatioChartIns);
  initChart(skuCountChartRef, skuCountChartIns);
  if (!skuRatioChartIns.value || !skuCountChartIns.value) return;

  skuRatioChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis' },
      legend: { top: 8, data: ['本期SKU构成比', '本期销售额构成比', '构成比差值'] },
      grid: { left: 56, right: 52, top: 48, bottom: 50 },
      xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 25 } },
      yAxis: [
        { type: 'value', name: '构成比%', axisLabel: { formatter: '{value}%' } },
        { type: 'value', name: '构成比差值%', axisLabel: { formatter: '{value}%' } }
      ],
      series: [
        { name: '本期SKU构成比', type: 'bar', data: skuRatio, itemStyle: { color: '#f97316' } },
        { name: '本期销售额构成比', type: 'bar', data: salesRatio, itemStyle: { color: '#F56C6C' } },
        { name: '构成比差值', type: 'line', yAxisIndex: 1, data: ratioDiff, itemStyle: { color: '#F4A261' } }
      ]
    } as EChartsOption,
    true
  );

  skuCountChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis' },
      legend: { top: 8, data: ['当前SKU数', '预设SKU数', 'SKU差值'] },
      grid: { left: 56, right: 52, top: 48, bottom: 50 },
      xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 25 } },
      yAxis: [{ type: 'value', name: 'SKU数' }, { type: 'value', name: 'SKU差值' }],
      series: [
        { name: '当前SKU数', type: 'bar', data: currentSku, itemStyle: { color: '#f97316' } },
        { name: '预设SKU数', type: 'bar', data: presetSku, itemStyle: { color: '#F56C6C' } },
        { name: 'SKU差值', type: 'line', yAxisIndex: 1, data: skuDiff, itemStyle: { color: '#F4A261' } }
      ]
    } as EChartsOption,
    true
  );
};

const renderSalesChart = () => {
  initChart(salesChartRef, salesChartIns);
  if (!salesChartIns.value) return;
  const rows = salesState.value.rows || [];
  salesChartIns.value.setOption(
    {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const row = (rows[params?.[0]?.dataIndex ?? 0] || {}) as any;
          return `${row.categoryCode || ''} ${row.categoryName || ''}<br/>对比增长率：${row.growthRate ?? 0}%<br/>销售额：${row.salesAmount ?? '--'}`;
        }
      },
      grid: { left: 140, right: 36, top: 20, bottom: 24 },
      xAxis: { type: 'value', name: '百分比%', axisLabel: { formatter: '{value}%' }, splitLine: { lineStyle: { color: '#edf2f7' } } },
      yAxis: {
        type: 'category',
        data: rows.map((item) => `${item.categoryId || ''} ${item.categoryName || ''}`),
        axisTick: { show: false }
      },
      series: [{ type: 'bar', data: rows.map((item) => Number(item.growthRate || 0)), itemStyle: { color: '#2A9D8F' }, barWidth: 16 }]
    } as EChartsOption,
    true
  );
};

const loadAll = async () => {
  const query = buildQuery();
  await Promise.all([
    alertRequest.run(query),
    roleRequest.run(query),
    skuRequest.run(query),
    salesRequest.run({ ...query, pageNum: salesPage.pageNum, pageSize: salesPage.pageSize })
  ]);
};

const handleSearch = async () => {
  salesPage.pageNum = 1;
  await loadAll();
};

const handleReset = async () => {
  queryForm.storeScope = String(filterOptions.storeOptions[0]?.value ?? '0');
  queryForm.categoryLevel = String(filterOptions.levelOptions[0]?.value ?? '');
  queryForm.categoryIds = [];
  currentDateRange.value = [...DEFAULT_CURRENT_DATE_RANGE];
  compareDateRange.value = [...DEFAULT_COMPARE_DATE_RANGE];
  await loadAll();
};

const handleSalesPageChange = async (pageNum: number) => {
  salesPage.pageNum = pageNum;
  await salesRequest.run({ ...buildQuery(), pageNum: salesPage.pageNum, pageSize: salesPage.pageSize });
};

const handleRoleDetail = () => {
  ElMessage.info('详情入口预留');
};

const resizeCharts = () => {
  roleChartIns.value?.resize();
  skuRatioChartIns.value?.resize();
  skuCountChartIns.value?.resize();
  salesChartIns.value?.resize();
};

onMounted(async () => {
  await filterRequest.run(undefined as never);
  await loadAll();
  window.addEventListener('resize', resizeCharts);
});

watch(
  () => route.query.sessionId,
  async () => {
    await loadAll();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  roleChartIns.value?.dispose();
  skuRatioChartIns.value?.dispose();
  skuCountChartIns.value?.dispose();
  salesChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-analysis-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  margin-bottom: 12px;
}

.filter-toolbar,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-item {
  width: 168px;
}

.filter-category,
.filter-date {
  width: 240px;
}

.query-button {
  background: #20b2aa;
  border-color: #20b2aa;
}

.query-button:hover,
.query-button:focus {
  background: #1ca29b;
  border-color: #1ca29b;
}

.search-extra {
  margin-top: 12px;
}

.warning-card {
  background: #fff2f2;
  border-color: #f9d4d4;
}

.warning-title {
  color: #b42318;
  font-weight: 700;
}

.warning-list {
  display: grid;
  gap: 8px;
  margin-top: 4px;
  color: #7a271a;
  line-height: 1.7;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.card-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.glossary-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chart-box {
  width: 100%;
}

.role-chart-box {
  height: 520px;
}

.sku-panel {
  display: grid;
  gap: 12px;
}

.sku-chart-box {
  height: 330px;
}

.sales-chart-box {
  height: 420px;
}

@media (max-width: 992px) {
  .filter-form {
    width: 100%;
  }

  .filter-item,
  .filter-category,
  .filter-date {
    width: 100%;
  }

  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
