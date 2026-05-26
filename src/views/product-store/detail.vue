<template>
  <div class="product-store-detail-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期：{{ currentDateRangeText }}；对比日期：{{ compareDateRangeText }}</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="product-title">{{ productTitle }}</div>
      <div class="product-meta">
        <span>品牌：{{ productBrand }}</span>
        <span>规格：{{ productSpec }}</span>
        <span>商品条码：{{ productBarcode }}</span>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card filter-card">
      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="门店">
          <el-input
            v-model="queryForm.storeKeyword"
            clearable
            placeholder="请输入门店编码/名称"
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="当前状态">
          <el-select
            v-model="queryForm.status"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            clearable
            placeholder="全部 +2"
            style="width: 220px"
          >
            <el-option v-for="item in statusOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
          </el-select>
        </el-form-item>

        <el-form-item class="filter-actions">
          <el-button type="primary" :loading="tableLoading" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">商品销售门店明细</span>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-alert v-if="tableError" class="table-alert" :title="tableError" type="error" show-icon :closable="false" />

      <el-table
        v-loading="tableLoading"
        :data="tableRows"
        border
        stripe
        height="620"
        class="store-table"
        :empty-text="tableError || '暂无商品销售门店明细数据'"
        @sort-change="handleSortChange"
      >
        <el-table-column label="门店" prop="storeNo" min-width="170" fixed="left" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="store-cell">
              <div class="store-no">{{ row.storeNo || '--' }}</div>
              <div class="store-name">{{ row.storeName || '--' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" prop="productStatus" min-width="110" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">{{ row.productStatus || row.productStatusNo || '--' }}</template>
        </el-table-column>
        <el-table-column label="销售数量" prop="saleQuantity" min-width="120" align="right" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.saleQuantity, 2) }}</template>
        </el-table-column>
        <el-table-column label="销售额" prop="sales" min-width="130" align="right" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.sales, 2) }}</template>
        </el-table-column>
        <el-table-column label="毛利额" prop="gross" min-width="130" align="right" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.gross, 2) }}</template>
        </el-table-column>
        <el-table-column label="毛利率" prop="grossRate" min-width="110" align="right" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="当前库存数量" prop="stockQuantity" min-width="130" align="right" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.stockQuantity, 2) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="right" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.turnoverRate, 4) }}</template>
        </el-table-column>
        <el-table-column label="库存周转天数" prop="turnoverDays" min-width="130" align="right" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.turnoverDays, 2) }}</template>
        </el-table-column>
        <el-table-column label="毛利贡献率" prop="contributionRate" min-width="120" align="right" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.contributionRate) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" prop="gmroi" min-width="100" align="right" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.gmroi, 4) }}</template>
        </el-table-column>
        <el-table-column label="销售率" prop="salesRate" min-width="100" align="right" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.salesRate) }}</template>
        </el-table-column>
        <el-table-column label="本期促销" prop="activity" min-width="100" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFlagText(row.activity) }}</template>
        </el-table-column>
        <el-table-column label="首次销售日期" prop="firstSaleDate" min-width="130" align="left" sortable="custom" show-overflow-tooltip />
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.size"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { Sort } from 'element-plus';
import { getCategoryFilterOptions } from '@/api/category/tree';
import { getProductStoreDetails } from '@/api/category/diagnosis/analysis';
import type { OptionVO } from '@/api/category/tree/types';

type SortOrder = 'ascending' | 'descending' | null;

interface StoreRow {
  storeNo?: string;
  storeName?: string;
  productStatus?: string;
  productStatusNo?: string;
  saleQuantity?: number;
  sales?: number;
  gross?: number;
  grossRate?: number;
  stockQuantity?: number;
  turnoverRate?: number;
  turnoverDays?: number;
  contributionRate?: number;
  gmroi?: number;
  salesRate?: number;
  activity?: string;
  firstSaleDate?: string;
}

const route = useRoute();

const statusOptions = ref<OptionVO[]>([]);
const tableRows = ref<StoreRow[]>([]);
const tableLoading = ref(false);
const tableError = ref('');
const total = ref(0);

const sortState = reactive<{ prop: string; order: SortOrder }>({ prop: 'sales', order: 'descending' });
const queryForm = reactive({
  storeKeyword: '',
  status: [] as string[],
  page: 1,
  size: 10
});

const resolveQueryValue = (value: string | string[] | null | undefined, fallback = '') => {
  if (Array.isArray(value)) return String(value[0] || fallback);
  return String(value || fallback);
};

const sessionId = computed(() => resolveQueryValue(route.query.sessionId as string | string[] | null | undefined));
const productNo = computed(() => resolveQueryValue(route.query.productNo as string | string[] | null | undefined));
const productName = computed(() => resolveQueryValue(route.query.productName as string | string[] | null | undefined, '--'));
const productBarcode = computed(() => resolveQueryValue(route.query.productBarcode as string | string[] | null | undefined, '--'));
const productBrand = computed(() => resolveQueryValue(route.query.brandName as string | string[] | null | undefined, '--'));
const productSpec = computed(() => resolveQueryValue(route.query.spec as string | string[] | null | undefined, '--'));

const currentDateRangeText = computed(() => {
  const start = resolveQueryValue(route.query.startDate as string | string[] | null | undefined, '2024/10/01');
  const end = resolveQueryValue(route.query.endDate as string | string[] | null | undefined, '2024/12/08');
  return `${start}至${end}`;
});

const compareDateRangeText = computed(() => {
  const start = resolveQueryValue(route.query.compareStartDate as string | string[] | null | undefined, '2023/10/01');
  const end = resolveQueryValue(route.query.compareEndDate as string | string[] | null | undefined, '2023/12/08');
  return `${start}至${end}`;
});

const productTitle = computed(() => `${productNo.value || '--'}${productName.value}`);

const sortFieldMap: Record<string, string> = {
  storeNo: 'storeNo',
  storeName: 'storeName',
  productStatus: 'productStatus',
  saleQuantity: 'saleQuantity',
  sales: 'sales',
  gross: 'gross',
  grossRate: 'grossRate',
  stockQuantity: 'stockQuantity',
  turnoverRate: 'turnoverRate',
  turnoverDays: 'turnoverDays',
  contributionRate: 'contributionRate',
  gmroi: 'gmroi',
  activity: 'activity',
  firstSaleDate: 'firstSaleDate'
};

const currentOrder = computed(() => sortFieldMap[sortState.prop] || 'sales');
const currentOrderType = computed(() => (sortState.order === 'ascending' ? 'asc' : 'desc'));

const loadStatusOptions = async () => {
  const res: any = await getCategoryFilterOptions();
  statusOptions.value = Array.isArray(res?.classSalesStatusNo)
    ? res.classSalesStatusNo.map((item: any) => ({ label: String(item.label || item.value || ''), value: String(item.value || '') }))
    : [];
};

const loadTable = async () => {
  if (!sessionId.value || !productNo.value) {
    tableError.value = '缺少 sessionId 或商品编码，无法加载销售门店明细';
    tableRows.value = [];
    total.value = 0;
    return;
  }
  tableLoading.value = true;
  tableError.value = '';
  try {
    const res: any = await getProductStoreDetails({
      sessionId: sessionId.value,
      productNo: productNo.value,
      status: queryForm.status.length ? queryForm.status : undefined,
      storeKeyword: queryForm.storeKeyword || undefined,
      page: queryForm.page,
      size: queryForm.size,
      order: currentOrder.value,
      orderType: currentOrderType.value
    });
    const payload = res?.data || {};
    tableRows.value = Array.isArray(payload.records) ? payload.records : [];
    total.value = Number(payload.total || 0);
    queryForm.page = Number(payload.current || queryForm.page);
    queryForm.size = Number(payload.size || queryForm.size);
  } catch (error: any) {
    tableRows.value = [];
    total.value = 0;
    tableError.value = error?.message || '商品销售门店明细加载失败';
  } finally {
    tableLoading.value = false;
  }
};

const handleQuery = async () => {
  queryForm.page = 1;
  await loadTable();
};

const handleReset = async () => {
  queryForm.storeKeyword = '';
  queryForm.status = [];
  queryForm.page = 1;
  await loadTable();
};

const handleSortChange = async ({ prop, order }: { prop: string; order: Sort['order'] }) => {
  sortState.prop = prop || 'sales';
  sortState.order = (order as SortOrder) || 'descending';
  queryForm.page = 1;
  await loadTable();
};

const handlePageChange = async (page: number) => {
  queryForm.page = page;
  await loadTable();
};

const handlePageSizeChange = async (size: number) => {
  queryForm.size = size;
  queryForm.page = 1;
  await loadTable();
};

const handleExport = () => {
  ElMessage.info('导出功能待接入');
};

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  const actual = Math.abs(num) <= 1 ? num * 100 : num;
  return `${actual.toFixed(2)}%`;
};

const formatFlagText = (value: string | null | undefined) => {
  if (!value) return '--';
  if (['Y', '1', '是', 'YES'].includes(value)) return '是';
  if (['N', '0', '否', 'NO'].includes(value)) return '否';
  return value;
};

watch(
  () => route.fullPath,
  async () => {
    queryForm.page = 1;
    await loadTable();
  }
);

onMounted(async () => {
  await Promise.all([loadStatusOptions(), loadTable()]);
});
</script>

<style scoped lang="scss">
.product-store-detail-page {
  min-height: calc(100vh - 84px);
  padding: 8px;
  background: #f5f7fa;
}

.page-card {
  border: 1px solid #dbe4f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.summary-card,
.filter-card,
.table-card {
  margin-bottom: 12px;
}

.summary-line {
  color: #475569;
  font-size: 13px;
  line-height: 1.8;
}

.product-title {
  margin-top: 14px;
  color: #0f172a;
  font-size: 24px;
  font-weight: 700;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin-top: 10px;
  color: #0f9f9a;
  font-size: 14px;
  font-weight: 600;
}

.filter-form {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 8px 0;
}

.filter-form :deep(.el-form-item) {
  margin-right: 18px;
  margin-bottom: 0;
}

.filter-form :deep(.el-form-item__label) {
  color: #334155;
  font-weight: 600;
}

.filter-form :deep(.el-input__wrapper),
.filter-form :deep(.el-select__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d7e0ea inset;
}

.filter-actions {
  margin-left: auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.table-alert {
  margin-bottom: 12px;
}

.store-table {
  width: 100%;
}

.store-cell {
  line-height: 1.55;
}

.store-no {
  color: #334155;
  font-weight: 700;
}

.store-name {
  color: #64748b;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
