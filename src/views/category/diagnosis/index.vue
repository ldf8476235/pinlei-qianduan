<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="门店" prop="storeCode">
            <el-select v-model="queryParams.storeCode" clearable filterable placeholder="请选择门店" style="width: 220px">
              <el-option v-for="item in storeOptions" :key="item.storeCode" :label="item.storeName" :value="item.storeCode" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期" prop="dateRange">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              range-separator="-"
              style="width: 260px"
            />
          </el-form-item>
          <el-form-item>
            <el-button v-hasPermi="['category:diagnosis:list']" type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-row :gutter="12" class="mb-3">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="overview-title">总品类数</div>
          <div class="overview-value">{{ overview.totalCategory }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="overview-title">健康品类</div>
          <div class="overview-value success">{{ overview.healthyCategory }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="overview-title">预警品类</div>
          <div class="overview-value warning">{{ overview.warningCategory }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="overview-title">风险品类</div>
          <div class="overview-value danger">{{ overview.riskCategory }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="mb-3">
      <template #header>
        <span>品类健康度趋势</span>
      </template>
      <div ref="trendRef" class="trend-chart" v-loading="chartLoading"></div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
      </template>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="品类ID" prop="categoryId" align="center" width="110" />
        <el-table-column label="品类名称" prop="categoryName" min-width="160" align="center" show-overflow-tooltip />
        <el-table-column label="健康得分" prop="healthScore" align="center" width="110" />
        <el-table-column label="销售额" align="center" width="130">
          <template #default="scope"> {{ scope.row.salesAmount?.toFixed?.(2) ?? scope.row.salesAmount }} </template>
        </el-table-column>
        <el-table-column label="毛利率" align="center" width="110">
          <template #default="scope"> {{ scope.row.grossMarginRate }}% </template>
        </el-table-column>
        <el-table-column label="问题数" prop="issueCount" align="center" width="100" />
        <el-table-column label="诊断建议" prop="advice" align="center" min-width="220" show-overflow-tooltip />
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosis" lang="ts">
import * as echarts from 'echarts';
import { listStoreOptions } from '@/api/category/tree';
import { StoreOptionVO } from '@/api/category/tree/types';
import { getCategoryDiagnosisOverview, listCategoryDiagnosis, listCategoryDiagnosisTrend } from '@/api/category/diagnosis';
import { CategoryDiagnosisOverviewVO, CategoryDiagnosisQuery, CategoryDiagnosisTrendVO, CategoryDiagnosisVO } from '@/api/category/diagnosis/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showSearch = ref(true);
const loading = ref(false);
const chartLoading = ref(false);
const total = ref(0);
const dataList = ref<CategoryDiagnosisVO[]>([]);
const storeOptions = ref<StoreOptionVO[]>([]);
const dateRange = ref<[string, string]>(['', '']);
const trendRef = ref<HTMLDivElement>();
const trendIns = ref<echarts.ECharts>();

const overview = reactive<CategoryDiagnosisOverviewVO>({
  totalCategory: 0,
  healthyCategory: 0,
  warningCategory: 0,
  riskCategory: 0
});

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<CategoryDiagnosisQuery>({
  pageNum: 1,
  pageSize: 10,
  storeCode: '',
  startDate: '',
  endDate: ''
});

const syncDateRange = () => {
  queryParams.startDate = dateRange.value?.[0] || '';
  queryParams.endDate = dateRange.value?.[1] || '';
};

const initTrendChart = () => {
  if (!trendRef.value) {
    return;
  }
  if (!trendIns.value) {
    trendIns.value = echarts.init(trendRef.value);
  }
};

const renderTrend = (rows: CategoryDiagnosisTrendVO[]) => {
  initTrendChart();
  trendIns.value?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: rows.map((item) => item.categoryName),
      axisLabel: { rotate: 30 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100
    },
    grid: {
      left: 40,
      right: 20,
      bottom: 60
    },
    series: [
      {
        type: 'bar',
        data: rows.map((item) => item.healthScore),
        itemStyle: { color: '#409EFF' },
        barMaxWidth: 36
      }
    ]
  });
};

const getStoreList = async () => {
  const res = await listStoreOptions();
  storeOptions.value = res.data || [];
};

const getOverview = async () => {
  const res = await getCategoryDiagnosisOverview({
    storeCode: queryParams.storeCode,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate
  });
  Object.assign(overview, res.data || {});
};

const getTrend = async () => {
  chartLoading.value = true;
  try {
    const res = await listCategoryDiagnosisTrend({
      storeCode: queryParams.storeCode,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate
    });
    renderTrend(res.data || []);
  } finally {
    chartLoading.value = false;
  }
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listCategoryDiagnosis(queryParams);
    dataList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = async () => {
  syncDateRange();
  queryParams.pageNum = 1;
  await Promise.all([getOverview(), getTrend(), getList()]);
};

const resetQuery = async () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  syncDateRange();
  await Promise.all([getOverview(), getTrend(), getList()]);
};

const resizeHandler = () => trendIns.value?.resize();

onMounted(async () => {
  await getStoreList();
  await handleQuery();
  window.addEventListener('resize', resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler);
  trendIns.value?.dispose();
});
</script>

<style lang="scss" scoped>
.overview-title {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.overview-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.success {
  color: var(--el-color-success);
}

.warning {
  color: var(--el-color-warning);
}

.danger {
  color: var(--el-color-danger);
}

.trend-chart {
  height: 340px;
  width: 100%;
}
</style>
