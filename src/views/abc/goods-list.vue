<template>
  <div class="p-2 abc-goods-list-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <span class="page-title">品类ABC商品清单</span>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
        </div>
      </div>

      <el-alert
        v-if="!sessionReady"
        class="mb-[12px]"
        type="info"
        :closable="false"
        :title="`诊断预计算中，当前阶段：${statusState?.currentStage || 'WAIT_PRECOMPUTE'}`"
        :description="`进度 ${formatPercent(statusState?.progressPercent)}，页面会在结果就绪后自动刷新。`"
        show-icon
      />

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="ABC类型">
          <el-select v-model="queryForm.abcType" style="width: 180px" @change="handleQuery">
            <el-option v-for="item in abcTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="queryForm.status" multiple collapse-tags collapse-tags-tooltip clearable style="width: 220px">
            <el-option v-for="item in statusOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期促销">
          <el-select v-model="queryForm.promotion" clearable style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="是" value="1" />
            <el-option label="否" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期ABC">
          <el-select v-model="queryForm.currentAbc" clearable style="width: 140px">
            <el-option label="A" value="A" />
            <el-option label="B" value="B" />
            <el-option label="C" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比期ABC">
          <el-select v-model="queryForm.compareAbc" clearable style="width: 140px">
            <el-option label="A" value="A" />
            <el-option label="B" value="B" />
            <el-option label="C" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="!sessionReady" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card" v-loading="tableLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类ABC商品清单</span>
          <span class="table-summary">共 {{ pagination.total }} 条</span>
        </div>
      </template>

      <el-table :data="tableRows" border stripe class="goods-table">
        <el-table-column label="商品编码" min-width="120" fixed="left" align="left" prop="productNo" />
        <el-table-column label="商品名称" min-width="220" fixed="left" align="left" prop="productName" show-overflow-tooltip />
        <el-table-column label="商品状态" min-width="120" align="left">
          <template #default="{ row }">
            {{ row.productStatus || row.productStatusNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="门店数" min-width="90" align="right">
          <template #default="{ row }">{{ formatNumber(row.storeNum, 0) }}</template>
        </el-table-column>
        <el-table-column label="本期/对比ABC" min-width="120" align="center">
          <template #default="{ row }">{{ `${row.currentAbc || '-'} / ${row.compareAbc || '-'}` }}</template>
        </el-table-column>
        <el-table-column label="销售量" min-width="100" align="right">
          <template #default="{ row }">{{ formatNumber(row.saleQuantity, 2) }}</template>
        </el-table-column>
        <el-table-column label="销售量PSD" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd, 4) }}</template>
        </el-table-column>
        <el-table-column label="销售额" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.sales, 2) }}</template>
        </el-table-column>
        <el-table-column label="销售额占比" min-width="110" align="right">
          <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
        </el-table-column>
        <el-table-column label="销售额PSD" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.salesPsd, 4) }}</template>
        </el-table-column>
        <el-table-column label="毛利额" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.gross, 2) }}</template>
        </el-table-column>
        <el-table-column label="毛利额占比" min-width="110" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
        </el-table-column>
        <el-table-column label="毛利率" min-width="100" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="库存数量" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.stockQuantity, 2) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" min-width="100" align="right">
          <template #default="{ row }">{{ formatNumber(row.gmroi, 4) }}</template>
        </el-table-column>
        <el-table-column label="促销" min-width="80" align="center" prop="activity" />
        <el-table-column label="品牌" min-width="140" align="left" prop="brandName" show-overflow-tooltip />
        <el-table-column label="规格" min-width="120" align="left" prop="spec" show-overflow-tooltip />
        <el-table-column label="品类" min-width="180" align="left">
          <template #default="{ row }">{{ [row.classNo, row.className].filter(Boolean).join(' ') || '--' }}</template>
        </el-table-column>
      </el-table>

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

const route = useRoute();
const pollTimer = ref<number | null>(null);

const statusState = ref<any>();
const abcParams = ref<AbcTypeParamVO[]>([]);
const statusOptions = ref<OptionVO[]>([]);
const tableRows = ref<AbcSalesListItemVO[]>([]);
const tableLoading = ref(false);

const sessionId = computed(() => String(route.query.sessionId || ''));
const sessionReady = computed(() => Boolean(statusState.value?.ready));

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

const abcTypeOptions = computed(() =>
  abcParams.value.map((item) => ({
    label: item.abcTypeName || item.abcType,
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
    queryForm.abcType = abcParams.value[0].abcType;
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
    queryForm.abcType = abcParams.value[0].abcType;
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

.filter-card {
  margin-bottom: 12px;
}

.filter-header,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title,
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text,
.table-summary {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.filter-form {
  margin-top: 14px;
}

.goods-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.goods-table :deep(.cell) {
  font-size: 13px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 992px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pagination-wrap {
    justify-content: center;
  }
}
</style>
