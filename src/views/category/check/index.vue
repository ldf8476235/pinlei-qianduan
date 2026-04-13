<template>
  <div class="p-2 category-check-page">
    <el-card shadow="hover" class="mb-[12px]">
      <div class="filter-header">
        <div class="filter-actions">
          <el-button text @click="showSearch = !showSearch">{{ showSearch ? '收起^' : '展开∨' }}</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-hasPermi="['category:check:list']" type="success" icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="showSearch" class="filter-form-wrap">
          <el-form :model="queryForm" :inline="true" label-width="80px">
            <el-form-item label="门店范围">
              <el-select v-model="queryForm.storeScope" style="width: 180px" placeholder="请选择">
                <el-option v-for="item in filterOptions.storeOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="品类级别">
              <el-select v-model="queryForm.categoryLevel" style="width: 180px" placeholder="请选择">
                <el-option v-for="item in filterOptions.levelOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="品类">
              <el-select
                v-model="queryForm.categoryIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="2"
                style="width: 260px"
                placeholder="全部"
              >
                <el-option v-for="item in filterOptions.categoryOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="本期日期">
              <el-date-picker
                v-model="currentDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                range-separator="-"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item>
              <el-button text type="primary" @click="moreConditionVisible = !moreConditionVisible">
                {{ moreConditionVisible ? '收起更多条件' : '更多条件' }}
              </el-button>
            </el-form-item>
          </el-form>

          <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
            <div v-show="moreConditionVisible" class="mt-[8px]">
              <el-form :model="queryForm" :inline="true" label-width="80px">
                <el-form-item label="对比日期">
                  <el-date-picker
                    v-model="compareDateRange"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    range-separator="-"
                    style="width: 260px"
                  />
                </el-form-item>
              </el-form>
            </div>
          </transition>
        </div>
      </transition>
    </el-card>

    <el-card shadow="never" class="mb-[12px] alert-card">
      <template #header>
        <div class="alert-title">异常预警</div>
      </template>
      <div class="alert-line">
        存在
        <span class="alert-num">{{ alertData.roleAbnormalCount }}</span>
        个品类角色异常，与预设品类角色不一致！您可以使用系统进一步分析异常品类或根据企业策略调整品类角色的预设值。
      </div>
      <div class="alert-line">
        存在
        <span class="alert-num">{{ alertData.skuStructureAbnormalCount }}</span>
        个品类SKU数异常，其SKU构成比与销售构成比差值过大(超过3%)！您可以使用系统进一步分析异常SKU数的品类或根据企业策略调整品类SKU数的预设值
      </div>
      <div class="alert-line">
        存在
        <span class="alert-num">{{ alertData.skuPresetAbnormalCount }}</span>
        个品类SKU数异常，其当前SKU数与品类预设SKU数不一致！您可以使用系统进一步分析异常SKU数的品类或根据企业策略调整品类SKU数的预设值。
      </div>
    </el-card>

    <el-card shadow="hover" class="mb-[12px]">
      <template #header>
        <div class="module-header">
          <span class="module-title">品类角色</span>
          <div class="module-right">
            <el-button link type="primary" @click="goRoleStrategy">角色策略</el-button>
            <el-button type="primary" plain @click="goDetail('role')">详情</el-button>
          </div>
        </div>
      </template>
      <div v-loading="roleLoading" class="chart-box h-[420px]">
        <div ref="roleChartRef" class="chart-inner"></div>
      </div>
    </el-card>

    <el-card shadow="hover" class="mb-[12px]">
      <template #header>
        <div class="module-header">
          <span class="module-title">
            品类SKU数
            <el-tooltip
              effect="dark"
              placement="top"
              content="当前SKU数:以所选门店范围下在向前30天内有(销售或有库存)且状态为上架的商品作为统计依据! 本期SKU数:以所选门店范围及本期日期下有销售或(期末有库存且状态为上架)的商品作为统计依据!"
            >
              <span class="glossary-icon">ⓘ</span>
            </el-tooltip>
          </span>
          <el-button type="primary" plain @click="goDetail('sku')">详情</el-button>
        </div>
      </template>

      <div v-loading="skuLoading" class="chart-box h-[340px] mb-[12px]">
        <div ref="skuRatioChartRef" class="chart-inner"></div>
      </div>
      <div v-loading="skuLoading" class="chart-box h-[340px]">
        <div ref="skuCountChartRef" class="chart-inner"></div>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="module-header">
          <span class="module-title">销售额变动</span>
          <div class="module-right">
            <el-pagination
              v-model:current-page="salesPage.pageNum"
              :page-size="salesPage.pageSize"
              :total="salesPage.total"
              layout="prev, pager, next"
              :pager-count="5"
              background
              @current-change="handleSalesPageChange"
            />
            <el-button type="primary" plain @click="goDetail('sales')">详情</el-button>
          </div>
        </div>
      </template>
      <div v-loading="salesLoading" class="chart-box h-[420px] sales-no-wheel">
        <div ref="salesChartRef" class="chart-inner"></div>
      </div>
    </el-card>

    <el-dialog v-model="roleStrategyDialogVisible" title="角色策略及战术" width="820px" append-to-body>
      <div class="role-strategy-dialog">
        <p><strong>1. 品类角色与品类策略战术的关系：</strong></p>
        <p>
          针对不同的品类角色，需要制定不同的品类策略并运用不同的品类战术进行管理。品类战术直接影响着顾客对于企业的认知印象，同时影响品类业绩目标的实现。
        </p>

        <p><strong>2. 如何设定不同品类角色的策略及战术：</strong></p>
        <p>
          品类角色划分方法不同，品类策略及战术也不同。以行业内普适的一种品类角色划分方式为例进行介绍：示例的品类角色划分方式是以品类“综合贡献率”、“销售增长率”作为矩阵的横、纵轴，将企业同一级别的品类进行划分，从而定位品类的初始角色，企业可在此基础上基于自身考虑对品类角色进一步调整。
        </p>

        <img :src="treeStrategyImage" alt="角色策略及战术" class="role-strategy-image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="CategoryCheck" lang="ts">
import * as echarts from 'echarts';
import treeStrategyImage from '@/assets/images/tree1.ae4aedc.png';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryCheckAlert,
  getCategoryCheckFilter,
  getCategoryCheckRole,
  getCategoryCheckSales,
  getCategoryCheckSku
} from '@/api/category/check';
import {
  CategoryCheckAlertVO,
  CategoryCheckFilterVO,
  CategoryCheckQuery,
  CategoryCheckRoleVO,
  CategoryCheckSalesQuery,
  CategoryCheckSalesVO,
  CategoryCheckSkuVO
} from '@/api/category/check/types';

const proxy = getCurrentInstance()?.proxy as any;
const router = useRouter();

const showSearch = ref(true);
const moreConditionVisible = ref(false);
const roleStrategyDialogVisible = ref(false);

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

const alertData = reactive<CategoryCheckAlertVO>({
  roleAbnormalCount: 0,
  skuStructureAbnormalCount: 0,
  skuPresetAbnormalCount: 0
});

const queryForm = reactive({
  storeScope: '' as string | number,
  categoryLevel: '' as string | number,
  categoryIds: [] as Array<string | number>
});

const currentDateRange = ref<[string, string]>(['2024-10-01', '2024-12-08']);
const compareDateRange = ref<[string, string]>(['2023-10-01', '2023-12-08']);

const salesPage = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const filterRequest = useRequest(async () => await getCategoryCheckFilter());
const alertRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckAlert(params));
const roleRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckRole(params));
const skuRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckSku(params));
const salesRequest = useRequest(async (params: CategoryCheckSalesQuery) => await getCategoryCheckSales(params));

const roleLoading = computed(() => roleRequest.loading.value);
const skuLoading = computed(() => skuRequest.loading.value);
const salesLoading = computed(() => salesRequest.loading.value);

const buildQuery = (): CategoryCheckQuery => ({
  storeScope: queryForm.storeScope,
  categoryLevel: queryForm.categoryLevel,
  categoryIds: queryForm.categoryIds,
  currentStartDate: currentDateRange.value?.[0],
  currentEndDate: currentDateRange.value?.[1],
  compareStartDate: compareDateRange.value?.[0],
  compareEndDate: compareDateRange.value?.[1]
});

const initFilter = async () => {
  const res = await filterRequest.run(undefined as never);
  const data = res?.data;
  if (!data) return;
  filterOptions.storeOptions = data.storeOptions || [];
  filterOptions.levelOptions = data.levelOptions || [];
  filterOptions.categoryOptions = data.categoryOptions || [];

  const defaultStore = filterOptions.storeOptions.find((item) => item.label === '全店') || filterOptions.storeOptions[0];
  const defaultLevel = filterOptions.levelOptions.find((item) => String(item.label).includes('一级')) || filterOptions.levelOptions[0];
  queryForm.storeScope = defaultStore?.value || '';
  queryForm.categoryLevel = defaultLevel?.value || '';
};

const renderRoleChart = (data: CategoryCheckRoleVO) => {
  if (!roleChartRef.value) return;
  if (!roleChartIns.value) {
    roleChartIns.value = echarts.init(roleChartRef.value);
    roleChartIns.value.on('click', (params: any) => {
      const row = params.data?.rawData;
      if (row?.categoryId) {
        router.push(`/category/diagnosis?categoryId=${row.categoryId}`);
      }
    });
  }

  const list = data.list || [];
  const xThreshold = data.splitLineX ?? 10;
  const yThreshold = data.splitLineY ?? 10;
  const points = list.map((item) => ({
    value: [item.contributionRate, item.growthRate, item.skuCount],
    rawData: item,
    itemStyle: {
      color: item.roleMatchStatus === 'match' ? '#2A9D8F' : item.roleMatchStatus === 'mismatch' ? '#F4A261' : '#9CA3AF'
    },
    symbolSize: Math.max(8, Math.min(36, Math.sqrt(Math.max(item.skuCount, 1)) / 2)),
    name: `${item.categoryCode} ${item.categoryName}`
  }));

  roleChartIns.value.setOption({
    legend: {
      top: 6,
      data: ['品类角色与设定一致', '品类角色与设定不一致', '品类角色未设定']
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const row = params.data?.rawData || {};
        return [
          `${row.categoryCode || ''} ${row.categoryName || ''}`,
          `品类角色：${row.roleName || '--'}`,
          `销售对比增长率：${row.growthRate ?? 0}%`,
          `综合贡献率：${row.contributionRate ?? 0}%`,
          `SKU数：${row.skuCount ?? 0}`,
          `销售额：${row.salesAmount ?? '--'}`
        ].join('<br/>');
      }
    },
    grid: { left: 64, right: 24, top: 48, bottom: 42 },
    xAxis: {
      type: 'value',
      name: '综合贡献率%',
      axisLabel: { formatter: '{value}%' },
      splitLine: { show: true, lineStyle: { color: '#EEF1F6' } }
    },
    yAxis: {
      type: 'value',
      name: '销售对比增长率%',
      axisLabel: { formatter: '{value}%' },
      splitLine: { show: true, lineStyle: { color: '#EEF1F6' } }
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        moveOnMouseWheel: true,
        zoomOnMouseWheel: true
      }
    ],
    graphic: [
      {
        type: 'line',
        shape: { x1: 0, y1: 0, x2: 0, y2: 0 }
      }
    ],
    series: [
      {
        name: '品类角色与设定一致',
        type: 'scatter',
        data: points.filter((item: any) => item.rawData.roleMatchStatus === 'match')
      },
      {
        name: '品类角色与设定不一致',
        type: 'scatter',
        data: points.filter((item: any) => item.rawData.roleMatchStatus === 'mismatch')
      },
      {
        name: '品类角色未设定',
        type: 'scatter',
        data: points.filter((item: any) => item.rawData.roleMatchStatus === 'unset')
      },
      {
        type: 'line',
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          lineStyle: { color: '#111827', width: 1.1 },
          data: [{ xAxis: xThreshold }, { yAxis: yThreshold }]
        }
      }
    ]
  });
};

const renderSkuCharts = (data: CategoryCheckSkuVO) => {
  const list = data.list || [];
  const names = list.map((item) => item.categoryName);
  const skuRatio = list.map((item) => item.skuRatio);
  const salesRatio = list.map((item) => item.salesRatio);
  const ratioDiff = list.map((item) => item.ratioDiff);
  const currentSku = list.map((item) => item.currentSkuCount);
  const presetSku = list.map((item) => item.presetSkuCount);
  const skuDiff = list.map((item) => item.skuDiff);

  if (!skuRatioChartIns.value && skuRatioChartRef.value) {
    skuRatioChartIns.value = echarts.init(skuRatioChartRef.value);
  }
  if (!skuCountChartIns.value && skuCountChartRef.value) {
    skuCountChartIns.value = echarts.init(skuCountChartRef.value);
  }
  if (!skuRatioChartIns.value || !skuCountChartIns.value) return;

  const zoomCfg = [
    {
      type: 'inside',
      xAxisIndex: 0,
      zoomOnMouseWheel: true,
      moveOnMouseWheel: true
    }
  ];

  skuRatioChartIns.value.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 8, data: ['本期SKU构成比', '本期销售额构成比', '构成比差值'] },
    grid: { left: 52, right: 52, top: 40, bottom: 52 },
    xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: [
      { type: 'value', name: '构成比%', axisLabel: { formatter: '{value}%' }, min: 0, max: 60 },
      { type: 'value', name: '构成比差值%', axisLabel: { formatter: '{value}%' }, min: -40, max: 30 }
    ],
    dataZoom: zoomCfg,
    series: [
      { name: '本期SKU构成比', type: 'bar', data: skuRatio, itemStyle: { color: '#409EFF' } },
      { name: '本期销售额构成比', type: 'bar', data: salesRatio, itemStyle: { color: '#F56C6C' } },
      { name: '构成比差值', type: 'line', yAxisIndex: 1, data: ratioDiff, itemStyle: { color: '#F4A261' } }
    ]
  });

  skuCountChartIns.value.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 8, data: ['当前SKU数', '预设SKU数', 'SKU差值'] },
    grid: { left: 52, right: 52, top: 40, bottom: 52 },
    xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: [
      { type: 'value', name: 'SKU数', min: 0 },
      { type: 'value', name: 'SKU差值' }
    ],
    dataZoom: zoomCfg,
    series: [
      { name: '当前SKU数', type: 'bar', data: currentSku, itemStyle: { color: '#409EFF' } },
      { name: '预设SKU数', type: 'bar', data: presetSku, itemStyle: { color: '#F56C6C' } },
      { name: 'SKU差值', type: 'line', yAxisIndex: 1, data: skuDiff, itemStyle: { color: '#F4A261' } }
    ]
  });
};

const renderSalesChart = (data: CategoryCheckSalesVO) => {
  if (!salesChartRef.value) return;
  if (!salesChartIns.value) {
    salesChartIns.value = echarts.init(salesChartRef.value);
  }
  const rows = data.rows || [];
  const sorted = [...rows].sort((a, b) => b.growthRate - a.growthRate);
  const names = sorted.map((item) => item.categoryName);
  const growthRates = sorted.map((item) => item.growthRate);

  salesChartIns.value.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const row = sorted[params[0].dataIndex];
        return `${row.categoryName}<br/>对比增长率：${row.growthRate}%<br/>销售额：${row.salesAmount}`;
      }
    },
    legend: { top: 8, data: ['对比增长率'] },
    grid: { left: 120, right: 24, top: 40, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: names, inverse: true },
    series: [
      {
        name: '对比增长率',
        type: 'bar',
        data: growthRates,
        itemStyle: { color: '#2A9D8F' }
      }
    ]
  });
};

const loadAlert = async () => {
  const res = await alertRequest.run(buildQuery());
  Object.assign(alertData, res?.data || {});
};

const loadRole = async () => {
  const res = await roleRequest.run(buildQuery());
  renderRoleChart(res?.data || { list: [] });
};

const loadSku = async () => {
  const res = await skuRequest.run(buildQuery());
  renderSkuCharts(res?.data || { list: [] });
};

const loadSales = async () => {
  const params: CategoryCheckSalesQuery = {
    ...buildQuery(),
    pageNum: salesPage.pageNum,
    pageSize: salesPage.pageSize
  };
  const res = await salesRequest.run(params);
  const data = res?.data || { rows: [], total: 0, pageNum: 1, pageSize: salesPage.pageSize };
  salesPage.total = data.total || 0;
  renderSalesChart(data);
};

const loadAll = async () => {
  await Promise.all([loadAlert(), loadRole(), loadSku(), loadSales()]);
};

const handleSearch = async () => {
  salesPage.pageNum = 1;
  await loadAll();
};

const handleReset = async () => {
  const defaultStore = filterOptions.storeOptions.find((item) => item.label === '全店') || filterOptions.storeOptions[0];
  const defaultLevel = filterOptions.levelOptions.find((item) => String(item.label).includes('一级')) || filterOptions.levelOptions[0];
  queryForm.storeScope = defaultStore?.value || '';
  queryForm.categoryLevel = defaultLevel?.value || '';
  queryForm.categoryIds = [];
  currentDateRange.value = ['2024-10-01', '2024-12-08'];
  compareDateRange.value = ['2023-10-01', '2023-12-08'];
  salesPage.pageNum = 1;
  await loadAll();
};

const handleSalesPageChange = async (pageNum: number) => {
  salesPage.pageNum = pageNum;
  await loadSales();
};

const goRoleStrategy = () => {
  roleStrategyDialogVisible.value = true;
};

const goDetail = (type: string) => {
  router.push(`/category/diagnosis?from=${type}`);
};

const resizeCharts = () => {
  roleChartIns.value?.resize();
  skuRatioChartIns.value?.resize();
  skuCountChartIns.value?.resize();
  salesChartIns.value?.resize();
};

onMounted(async () => {
  await initFilter();
  await loadAll();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  roleChartIns.value?.dispose();
  skuRatioChartIns.value?.dispose();
  skuCountChartIns.value?.dispose();
  salesChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-check-page {
  background: transparent;
}

.filter-header {
  display: flex;
  justify-content: flex-end;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.filter-form-wrap {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.alert-card {
  background: #fff2f2;
  border-color: #f9d4d4;
}

.alert-title {
  color: #b42318;
  font-size: 18px;
  font-weight: 700;
}

.alert-line {
  color: #7a271a;
  line-height: 1.85;
  font-size: 14px;
}

.alert-num {
  color: #d92d20;
  font-size: 18px;
  font-weight: 700;
  padding: 0 2px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.module-title {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.glossary-icon {
  margin-left: 4px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
}

.module-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.chart-box {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.chart-inner {
  width: 100%;
  height: 100%;
}

.sales-no-wheel {
  overflow: hidden;
}

.role-strategy-dialog {
  max-height: 68vh;
  overflow-y: auto;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

.role-strategy-image {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 8px;
}

@media (max-width: 992px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
