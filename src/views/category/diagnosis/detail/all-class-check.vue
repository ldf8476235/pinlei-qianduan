<template>
  <div class="p-2 all-class-check-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">全类检查</span>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-select v-model="query.classRole" multiple collapse-tags collapse-tags-tooltip clearable placeholder="角色筛选" style="width: 220px">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" plain :loading="loading" @click="reload">重新请求</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header
            ><div class="card-header"><span class="card-title">销售变化</span></div></template
          >
          <div ref="changeChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header
            ><div class="card-header"><span class="card-title">全类检查散点图</span></div></template
          >
          <div ref="scatterChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header
            ><div class="card-header"><span class="card-title">SKU 结构</span></div></template
          >
          <div ref="skuChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header
            ><div class="card-header"><span class="card-title">SKU 差异</span></div></template
          >
          <div ref="diffChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header
        ><div class="card-header"><span class="card-title">明细</span></div></template
      >
      <el-table :data="currentRows" border stripe height="520">
        <el-table-column label="品类" prop="className" min-width="160" fixed="left" />
        <el-table-column label="角色" prop="classRoleName" min-width="110" />
        <el-table-column label="销售额" prop="sales" min-width="120" align="right" />
        <el-table-column label="对比销售额" prop="salesCompare" min-width="120" align="right" />
        <el-table-column label="销售对比增幅" prop="salesCompareRate" min-width="120" align="right" />
        <el-table-column label="综合贡献率" prop="contributionRatePer" min-width="120" align="right" />
        <el-table-column label="销售占比" prop="salesPer" min-width="100" align="right" />
      </el-table>
    </el-card>

    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header
        ><div class="card-header"><span class="card-title">SKU 差异明细</span></div></template
      >
      <el-table :data="diffRows" border stripe height="420">
        <el-table-column label="品类" prop="className" min-width="160" fixed="left" />
        <el-table-column label="建议销售SKU" prop="suggestSaleSku" min-width="120" align="right" />
        <el-table-column label="实际销售SKU" prop="saleSku" min-width="120" align="right" />
        <el-table-column label="SKU差异" prop="skuDiffer" min-width="120" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import {
  getAllClassCheckRoleTypes,
  getAllClassCheckSalesChange,
  getAllClassCheckScatter,
  getAllClassCheckSku,
  getAllClassCheckSkuDiffer
} from '@/api/category/diagnosis/detail';
import type { AllClassCheckListRequest, AllClassCheckRequest } from '@/api/category/diagnosis/detail/all-class-check-types';

const route = useRoute();
const loading = ref(false);
const roleOptions = ref<{ label: string; value: string }[]>([]);
const currentRows = ref<any[]>([]);
const diffRows = ref<any[]>([]);
const changeChartRef = ref<HTMLDivElement>();
const scatterChartRef = ref<HTMLDivElement>();
const skuChartRef = ref<HTMLDivElement>();
const diffChartRef = ref<HTMLDivElement>();
const changeChartIns = ref<echarts.ECharts>();
const scatterChartIns = ref<echarts.ECharts>();
const skuChartIns = ref<echarts.ECharts>();
const diffChartIns = ref<echarts.ECharts>();

const query = reactive<AllClassCheckListRequest>({
  deptId: (route.query.deptId as string) || '1',
  retailTypeId: (route.query.retailTypeId as string) || '0',
  businessCircleId: (route.query.businessCircleId as string) || '0',
  deptGroupId: (route.query.deptGroupId as string) || '0',
  storeNo: (route.query.storeNo as string) || '0',
  classLevel: 1,
  classNo: ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011'],
  classRole: [],
  currentStartDate: (route.query.currentStartDate as string) || '',
  currentEndDate: (route.query.currentEndDate as string) || '',
  compareStartDate: (route.query.compareStartDate as string) || '',
  compareEndDate: (route.query.compareEndDate as string) || '',
  page: 1,
  size: 10
});

const baseRequest = computed<AllClassCheckRequest>(() => ({
  deptId: query.deptId,
  retailTypeId: query.retailTypeId,
  businessCircleId: query.businessCircleId,
  deptGroupId: query.deptGroupId,
  storeNo: query.storeNo,
  classLevel: query.classLevel,
  classNo: query.classNo,
  classRole: query.classRole,
  currentStartDate: query.currentStartDate,
  currentEndDate: query.currentEndDate,
  compareStartDate: query.compareStartDate,
  compareEndDate: query.compareEndDate
}));

const initChart = (refEl: HTMLDivElement | undefined, insRef: { value?: echarts.ECharts }) => {
  if (!refEl) return null;
  if (!insRef.value) insRef.value = echarts.init(refEl);
  return insRef.value;
};

const formatPercent = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : '-';
};

const renderChangeChart = (rows: any[]) => {
  const ins = initChart(changeChartRef.value, changeChartIns);
  if (!ins) return;
  ins.setOption(
    {
      tooltip: { trigger: 'axis' },
      legend: { top: 8 },
      xAxis: { type: 'category', data: rows.map((item) => item.className || item.classNo || '-') },
      yAxis: { type: 'value' },
      series: [
        { type: 'bar', name: '本期销售额', data: rows.map((item) => Number(item.sales || 0)) },
        { type: 'bar', name: '对比销售额', data: rows.map((item) => Number(item.salesCompare || 0)) }
      ]
    } as EChartsOption,
    true
  );
};

const renderScatterChart = (rows: any[], xyData: any) => {
  const ins = initChart(scatterChartRef.value, scatterChartIns);
  if (!ins) return;
  ins.setOption(
    {
      tooltip: {
        formatter: (params: any) => {
          const data = params.data as any[];
          return `${data[2]}<br/>贡献率：${Number(data[0]).toFixed(2)}%<br/>销售增幅：${Number(data[1]).toFixed(2)}%`;
        }
      },
      xAxis: { type: 'value', name: xyData?.xName || '综合贡献率', min: 'dataMin', max: 'dataMax' },
      yAxis: { type: 'value', name: xyData?.yName || '销售对比增幅%', min: 'dataMin', max: 'dataMax' },
      series: [
        {
          type: 'scatter',
          symbolSize: 12,
          data: rows.map((item) => [Number(item.contributionRatePer || 0), Number(item.salesCompareRate || 0), item.className || item.classNo || '-'])
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderSkuChart = (rows: any[]) => {
  const ins = initChart(skuChartRef.value, skuChartIns);
  if (!ins) return;
  ins.setOption(
    {
      tooltip: { trigger: 'axis' },
      legend: { top: 8 },
      xAxis: { type: 'category', data: rows.map((item) => item.className || item.classNo || '-') },
      yAxis: { type: 'value' },
      series: [
        { type: 'bar', name: '销售占比', data: rows.map((item) => Number(item.salesPer || 0)) },
        { type: 'bar', name: 'SKU占比', data: rows.map((item) => Number(item.skuPer || 0)) }
      ]
    } as EChartsOption,
    true
  );
};

const renderDiffChart = (rows: any[]) => {
  const ins = initChart(diffChartRef.value, diffChartIns);
  if (!ins) return;
  ins.setOption(
    {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: rows.map((item) => item.className || item.classNo || '-') },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', name: 'SKU差异', data: rows.map((item) => Number(item.skuDiffer || 0)) }]
    } as EChartsOption,
    true
  );
};

const reload = async () => {
  loading.value = true;
  try {
    const body = baseRequest.value;
    const [roleRes, changeRes, scatterRes, skuRes, diffRes] = await Promise.all([
      getAllClassCheckRoleTypes(),
      getAllClassCheckSalesChange({ ...body, page: query.page, size: query.size, order: 'sales', orderType: 'desc' }),
      getAllClassCheckScatter(body),
      getAllClassCheckSku(body),
      getAllClassCheckSkuDiffer(body)
    ]);
    roleOptions.value = (roleRes.data?.data || []).map((item: any) => ({ label: item.label, value: item.value }));
    currentRows.value = changeRes.data?.data?.content || changeRes.data?.data?.list || [];
    const scatter = scatterRes.data?.data || {};
    const sku = skuRes.data?.data || {};
    diffRows.value = diffRes.data?.data?.list || [];
    renderChangeChart(currentRows.value);
    renderScatterChart(scatter.list || [], scatter.xyData);
    renderSkuChart(sku.list || []);
    renderDiffChart(diffRows.value);
  } finally {
    loading.value = false;
  }
};

const resizeCharts = () => {
  changeChartIns.value?.resize();
  scatterChartIns.value?.resize();
  skuChartIns.value?.resize();
  diffChartIns.value?.resize();
};

onMounted(async () => {
  await reload();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  changeChartIns.value?.dispose();
  scatterChartIns.value?.dispose();
  skuChartIns.value?.dispose();
  diffChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.all-class-check-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}
.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.header-card,
.chart-row,
.table-card {
  margin-bottom: 12px;
}
.page-header,
.page-title-wrap,
.page-actions,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.page-title-wrap {
  justify-content: flex-start;
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
.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
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
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .page-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .chart-box {
    height: 320px;
  }
}
</style>
