<template>
  <div class="p-2 abc-goods-list-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="page-main-title">品类ABC商品清单</div>
      <div class="summary-line">数据日期：{{ currentDateRangeText }}；对比日期：{{ compareDateRangeText }}</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="category-title">{{ categoryTitle }}</div>
    </el-card>

    <el-alert
      v-if="!sessionReady"
      class="mb-[12px]"
      type="info"
      :closable="false"
      :title="`诊断预计算中，当前阶段：${statusState?.currentStage || 'WAIT_PRECOMPUTE'}`"
      :description="`进度 ${formatPercent(statusState?.progressPercent)}，页面会在结果就绪后自动刷新。`"
      show-icon
    />

    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-bar">
        <el-form :model="queryForm" inline class="filter-form">
          <el-form-item label="当前状态">
            <el-select
              v-model="queryForm.status"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
              clearable
              style="width: 220px"
            >
              <el-option v-for="item in statusOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
            </el-select>
          </el-form-item>

          <el-form-item label="本期促销">
            <el-select v-model="queryForm.promotion" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="是" value="1" />
              <el-option label="否" value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="ABC类型">
            <el-select v-model="queryForm.abcType" style="width: 160px">
              <el-option v-for="item in abcTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="本期ABC">
            <el-select v-model="queryForm.currentAbc" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="A" value="A" />
              <el-option label="B" value="B" />
              <el-option label="C" value="C" />
            </el-select>
          </el-form-item>

          <el-form-item label="对比日期ABC">
            <el-select v-model="queryForm.compareAbc" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="A" value="A" />
              <el-option label="B" value="B" />
              <el-option label="C" value="C" />
            </el-select>
          </el-form-item>

          <el-form-item class="filter-actions">
            <el-button type="primary" :disabled="!sessionReady" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card table-card" v-loading="tableLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类ABC商品清单</span>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <div class="table-scroll-wrap">
        <el-table
          :data="displayRows"
          border
          stripe
          class="goods-table goods-table--wide"
          :default-sort="{ prop: 'sales', order: 'descending' }"
          header-cell-class-name="goods-table-header"
          @sort-change="handleSortChange"
        >
          <el-table-column
            label="商品编码"
            prop="productNo"
            min-width="140"
            fixed="left"
            align="left"
            header-align="center"
            sortable="custom"
            show-overflow-tooltip
          />

          <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" align="left" header-align="center" sortable="custom" show-overflow-tooltip>
            <template #default="{ row }">
              <el-button link type="primary" class="name-link" @click="handleGoodsDetail(row)">
                {{ row.productName || '--' }}
              </el-button>
            </template>
          </el-table-column>

          <el-table-column label="当前状态" prop="productStatus" min-width="120" align="left" header-align="center" sortable="custom" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.productStatus || row.productStatusNo || '--' }}
            </template>
          </el-table-column>

          <el-table-column label="销售门店数" prop="storeNum" min-width="120" align="center" header-align="center" sortable="custom">
            <template #default="{ row }">
              <span class="store-count">{{ formatNumber(row.storeNum, 0) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="销售额ABC类别分组列" align="center" header-align="center">
            <el-table-column label="销售额ABC类别-本期" prop="currentAbc" min-width="110" align="center" header-align="center" sortable="custom" />
            <el-table-column label="销售额ABC类别-对比日期" prop="compareAbc" min-width="120" align="center" header-align="center" sortable="custom" />
          </el-table-column>

          <el-table-column label="销售量指标列" align="center" header-align="center">
            <el-table-column label="销售量-总计" prop="saleQuantity" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.saleQuantity, 2) }}</template>
            </el-table-column>
            <el-table-column label="销售量-PSD" prop="saleQuantityPsd" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd, 4) }}</template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="销售额指标列" align="center" header-align="center">
            <el-table-column label="销售额-总计" prop="sales" min-width="130" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.sales, 2) }}</template>
            </el-table-column>
            <el-table-column label="销售额-占比" prop="salesPer" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
            </el-table-column>
            <el-table-column label="销售额-PSD" prop="salesPsd" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.salesPsd, 4) }}</template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="毛利额&毛利率列" align="center" header-align="center">
            <el-table-column label="毛利额-总计" prop="gross" min-width="130" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.gross, 2) }}</template>
            </el-table-column>
            <el-table-column label="毛利额-占比" prop="grossPer" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
            </el-table-column>
            <el-table-column label="毛利额-PSD" prop="grossPsd" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.grossPsd, 4) }}</template>
            </el-table-column>
            <el-table-column label="毛利率" prop="grossRate" min-width="110" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="库存&经营效率列" align="center" header-align="center">
            <el-table-column label="当前库存数量" prop="stockQuantity" min-width="130" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.stockQuantity, 2) }}</template>
            </el-table-column>
            <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.turnoverRate, 2) }}</template>
            </el-table-column>
            <el-table-column label="库存周转天数" prop="turnoverDays" min-width="130" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.turnoverDays, 2) }}</template>
            </el-table-column>
            <el-table-column label="库销比" prop="stockSalesRate" min-width="110" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.stockSalesRate, 2) }}</template>
            </el-table-column>
            <el-table-column label="毛利贡献率" prop="contributionRate" min-width="120" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatPercent(row.contributionRate) }}</template>
            </el-table-column>
            <el-table-column label="GMROI" prop="gmroi" min-width="110" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatNumber(row.gmroi, 4) }}</template>
            </el-table-column>
            <el-table-column label="销售率" prop="salesRate" min-width="110" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">{{ formatPercent(row.salesRate) }}</template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="商品属性扩展列" align="center" header-align="center">
            <el-table-column label="本期促销" prop="activity" min-width="110" align="center" header-align="center" show-overflow-tooltip />
            <el-table-column label="首次销售日期" prop="firstSaleDate" min-width="130" align="left" header-align="center" sortable="custom" show-overflow-tooltip />
            <el-table-column label="本期新品" prop="newProduct" min-width="100" align="center" header-align="center" sortable="custom" />
            <el-table-column label="重点商品" prop="keyProduct" min-width="100" align="center" header-align="center" sortable="custom" />
            <el-table-column label="季节性商品" prop="seasonableFlagName" min-width="110" align="center" header-align="center" sortable="custom">
              <template #default="{ row }">
                {{ row.seasonableFlagName || row.seasonableFlag || '--' }}
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column label="操作" min-width="100" fixed="right" align="center" header-align="center">
            <template #default="{ row }">
              <el-button type="primary" plain class="process-button" @click="handleProcess(row)">处理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.pageNum"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import { getCategoryFilterOptions } from '@/api/category/tree';
import { getAbcParams, getAbcSalesList } from '@/api/category/abc';
import type { AbcSalesListItemVO, AbcTypeParamVO } from '@/api/category/abc/types';
import type { OptionVO } from '@/api/category/tree/types';
import type { Sort } from 'element-plus';

type SortOrder = 'ascending' | 'descending' | null;

const route = useRoute();
const pollTimer = ref<number | null>(null);

const statusState = ref<any>();
const abcParams = ref<AbcTypeParamVO[]>([]);
const statusOptions = ref<OptionVO[]>([]);
const tableRows = ref<AbcSalesListItemVO[]>([]);
const tableLoading = ref(false);

const sortState = reactive<{
  prop: string;
  order: SortOrder;
}>({
  prop: 'sales',
  order: 'descending'
});

const sessionId = computed(() => String(route.query.sessionId || ''));
const sessionReady = computed(() => Boolean(statusState.value?.ready));

const currentDateRangeText = computed(() => {
  const start = String(route.query.startDate || '--');
  const end = String(route.query.endDate || '--');
  return `${start} ~ ${end}`;
});

const compareDateRangeText = computed(() => {
  const start = String(route.query.compareStartDate || '--');
  const end = String(route.query.compareEndDate || '--');
  return `${start} ~ ${end}`;
});

const formatCategoryLevelName = (level?: string | number) => {
  const levelNumber = Number(level || 0);
  if (levelNumber >= 1 && levelNumber <= 5) {
    return `${['', '一级', '二级', '三级', '四级', '五级'][levelNumber]}品类`;
  }
  return '一级品类';
};

const categoryTitle = computed(() => {
  const categoryId = String(route.query.categoryId || '004');
  const categoryName = String(route.query.categoryName || '洗化部');
  const levelName = formatCategoryLevelName(String(route.query.categoryLevel || ''));
  return `${categoryId}${categoryName}（${levelName}）`;
});

const initialQueryForm = () => ({
  abcType: String(route.query.abcType || ''),
  status: [] as string[],
  promotion: '',
  currentAbc: '',
  compareAbc: ''
});

const queryForm = reactive(initialQueryForm());

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const abcTypeLabelMap: Record<string, string> = {
  sales: '销售额ABC',
  gross: '毛利额ABC',
  contribution: '销售额ABC'
};

const abcTypeOptions = computed(() =>
  abcParams.value.map((item) => ({
    label: item.abcTypeName || abcTypeLabelMap[item.abcType] || item.abcType,
    value: item.abcType
  }))
);

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

const loadAbcParams = async () => {
  if (!sessionId.value) return;
  const res: any = await getAbcParams(sessionId.value);
  abcParams.value = Array.isArray(res?.data) ? res.data : [];
  if (!queryForm.abcType && abcParams.value.length > 0) {
    const salesOption = abcParams.value.find((item) => item.abcType === 'sales');
    queryForm.abcType = salesOption?.abcType || abcParams.value[0].abcType;
  }
};

const loadStatusOptions = async () => {
  const res: any = await getCategoryFilterOptions();
  statusOptions.value = Array.isArray(res?.classSalesStatusNo)
    ? res.classSalesStatusNo.map((item) => ({
        label: String(item.label || item.value || ''),
        value: String(item.value || '')
      }))
    : [];
};

const loadTable = async () => {
  if (!sessionReady.value || !sessionId.value || !queryForm.abcType) return;
  tableLoading.value = true;
  try {
    const res: any = await getAbcSalesList({
      sessionId: sessionId.value,
      abcType: queryForm.abcType,
      status: queryForm.status,
      promotion: queryForm.promotion || undefined,
      currentAbc: queryForm.currentAbc || undefined,
      compareAbc: queryForm.compareAbc || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      order: 'sales',
      orderType: 'desc'
    });
    const payload = res?.data || {};
    tableRows.value = Array.isArray(payload.records) ? payload.records : [];
    pagination.total = Number(payload.total || 0);
    pagination.pageNum = Number(payload.current || pagination.pageNum);
    pagination.pageSize = Number(payload.size || pagination.pageSize);
  } finally {
    tableLoading.value = false;
  }
};

const loadSessionState = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载ABC商品清单');
    return;
  }
  const res: any = await getDiagnosisSessionStatus(sessionId.value);
  statusState.value = res?.data;
  await loadAbcParams();
  if (!statusState.value) return;
  if (statusState.value.ready) {
    clearPolling();
    await loadTable();
    return;
  }
  if (['FAILED', 'STOPPED'].includes(String(statusState.value.status || '').toUpperCase())) {
    clearPolling();
    return;
  }
  schedulePolling();
};

const handleQuery = async () => {
  pagination.pageNum = 1;
  await loadTable();
};

const handleReset = async () => {
  Object.assign(queryForm, initialQueryForm());
  if (!queryForm.abcType && abcParams.value.length > 0) {
    const salesOption = abcParams.value.find((item) => item.abcType === 'sales');
    queryForm.abcType = salesOption?.abcType || abcParams.value[0].abcType;
  }
  pagination.pageNum = 1;
  await loadTable();
};

const handleCurrentChange = async (page: number) => {
  pagination.pageNum = page;
  await loadTable();
};

const handleSizeChange = async (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  await loadTable();
};

const getSortValue = (row: AbcSalesListItemVO, prop: string) => {
  if (prop === 'productStatus') return row.productStatus || row.productStatusNo || '';
  if (prop === 'seasonableFlagName') return row.seasonableFlagName || row.seasonableFlag || '';
  return (row as unknown as Record<string, unknown>)[prop];
};

const displayRows = computed(() => {
  const rows = [...tableRows.value];
  if (!sortState.prop || !sortState.order) return rows;
  const direction = sortState.order === 'ascending' ? 1 : -1;
  return rows.sort((left, right) => {
    const leftValue = getSortValue(left, sortState.prop);
    const rightValue = getSortValue(right, sortState.prop);
    const leftNumber = Number(leftValue);
    const rightNumber = Number(rightValue);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return (leftNumber - rightNumber) * direction;
    }
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'zh-CN') * direction;
  });
});

const handleSortChange = ({ prop, order }: { prop: string; order: Sort['order'] }) => {
  sortState.prop = prop || 'sales';
  sortState.order = order as SortOrder;
};

const handleExport = () => {
  ElMessage.info('导出功能后续对接真实接口');
};

const handleGoodsDetail = (_row: AbcSalesListItemVO) => {
  ElMessage.info('商品详情跳转功能待接入');
};

const handleProcess = (_row: AbcSalesListItemVO) => {
  ElMessage.info('处理功能待接入');
};

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.00%';
  const actual = Math.abs(num) <= 1 ? num * 100 : num;
  return `${actual.toFixed(2)}%`;
};

onMounted(async () => {
  await Promise.all([loadStatusOptions(), loadSessionState()]);
});

onBeforeUnmount(() => {
  clearPolling();
});
</script>

<style scoped lang="scss">
.abc-goods-list-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.summary-card,
.filter-card {
  margin-bottom: 12px;
}

.summary-line {
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
}

.page-main-title {
  margin-bottom: 10px;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  letter-spacing: 1px;
}

.category-title {
  margin-top: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 0;
  width: 100%;
}

.filter-form :deep(.el-form-item__label) {
  color: #334155;
  font-weight: 500;
}

.filter-actions {
  margin-left: auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  font-size: 13px;
  color: #64748b;
}

.goods-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: #0f172a;
  font-weight: 600;
}

.goods-table :deep(.el-table__header th .cell) {
  font-weight: 700;
  text-align: center;
}

.goods-table :deep(.cell) {
  font-size: 13px;
}

.goods-table :deep(.el-table__body td) {
  color: #334155;
}

.table-scroll-wrap {
  width: 100%;
  overflow-x: auto;
}

.goods-table--wide {
  min-width: 2480px;
}

.goods-table :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 16px rgba(15, 23, 42, 0.05);
}

.store-count {
  color: #0f9f9a;
  font-weight: 700;
}

.name-link {
  padding: 0;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.process-button {
  color: #0f9f9a;
  border-color: rgba(15, 159, 154, 0.35);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 992px) {
  .filter-actions {
    margin-left: 0;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pagination-wrap {
    justify-content: center;
  }
}
</style>
