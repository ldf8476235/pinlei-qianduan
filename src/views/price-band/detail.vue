<template>
  <div class="price-band-detail-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期：{{ currentDateRangeText }}；对比日期：{{ compareDateRangeText }}</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="category-title">{{ categoryTitle }}</div>
    </el-card>

    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-row filter-row-top">
        <el-form :model="queryForm" inline class="filter-form">
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

          <el-form-item label="本期促销">
            <el-select v-model="queryForm.promotion" clearable placeholder="全部" style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="是" value="1" />
              <el-option label="否" value="2" />
            </el-select>
          </el-form-item>

          <el-form-item class="filter-actions">
            <el-button type="primary" @click="handleQuery">查询</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="filter-row filter-row-range">
        <div class="range-label">价格区间</div>
        <el-checkbox-group v-model="selectedRangeValues" class="range-checkbox-group" @change="handleRangeChange">
          <el-checkbox :label="ALL_RANGE_VALUE">全部</el-checkbox>
          <el-checkbox v-for="item in priceBandOptions" :key="item" :label="item">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类价格区间商品清单</span>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableRows" border stripe class="goods-table" @sort-change="handleSortChange">
        <el-table-column label="商品编码" prop="productNo" min-width="130" fixed="left" align="left" sortable="custom" show-overflow-tooltip />
        <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button link type="primary" class="name-link" @click="handleGoodsDetail(row)">{{ row.productName || '--' }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" prop="productStatus" min-width="120" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">{{ row.productStatus || row.productStatusNo || '--' }}</template>
        </el-table-column>
        <el-table-column label="销售门店数" prop="storeNum" min-width="120" align="center" sortable="custom">
          <template #default="{ row }"><span class="store-count">{{ formatNumber(row.storeNum, 0) }}</span></template>
        </el-table-column>
        <el-table-column label="销售量-总计" prop="saleQuantity" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.saleQuantity, 2) }}</template>
        </el-table-column>
        <el-table-column label="销售量-PSD" prop="saleQuantityPsd" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd, 4) }}</template>
        </el-table-column>
        <el-table-column label="销售额-总计" prop="sales" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.sales, 2) }}</template>
        </el-table-column>
        <el-table-column label="销售额-构成比" prop="salesPer" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
        </el-table-column>
        <el-table-column label="销售额-PSD" prop="salesPsd" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.salesPsd, 4) }}</template>
        </el-table-column>
        <el-table-column label="毛利额-总计" prop="gross" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.gross, 2) }}</template>
        </el-table-column>
        <el-table-column label="毛利额-构成比" prop="grossPer" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
        </el-table-column>
        <el-table-column label="毛利额-PSD" prop="grossPsd" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.grossPsd, 4) }}</template>
        </el-table-column>
        <el-table-column label="毛利率" prop="grossRate" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="当前库存数量" prop="stockQuantity" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.stockQuantity, 2) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.turnoverRate, 4) }}</template>
        </el-table-column>
        <el-table-column label="库存周转天数" prop="turnoverDays" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.turnoverDays, 4) }}</template>
        </el-table-column>
        <el-table-column label="库销比" prop="stockSalesRate" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.stockSalesRate, 2) }}</template>
        </el-table-column>
        <el-table-column label="毛利贡献率" prop="contributionRate" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.contributionRate) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" prop="gmroi" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.gmroi, 4) }}</template>
        </el-table-column>
        <el-table-column label="销售率" prop="salesRate" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.salesRate) }}</template>
        </el-table-column>
        <el-table-column label="本期促销" prop="activity" min-width="100" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFlagText(row.activity) }}</template>
        </el-table-column>
        <el-table-column label="首次销售日期" prop="firstSaleDate" min-width="130" align="left" sortable="custom" show-overflow-tooltip />
        <el-table-column label="本期新品" prop="newProduct" min-width="100" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFlagText(row.newProduct) }}</template>
        </el-table-column>
        <el-table-column label="重点商品" prop="keyProduct" min-width="100" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFlagText(row.keyProduct) }}</template>
        </el-table-column>
        <el-table-column label="季节性商品" prop="seasonableFlagName" min-width="120" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">{{ row.seasonableFlagName || row.seasonableFlag || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button class="process-btn" @click="handleProcess(row)">处理</el-button>
          </template>
        </el-table-column>
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

    <GoodsProcessDialog v-model="processDialogVisible" @save="handleSaveProcess" @dispatch="handleDispatchProcess" />
  </div>
</template>

<script setup lang="ts">
import type { Sort } from 'element-plus';
import GoodsProcessDialog from '@/components/GoodsProcessDialog/index.vue';
import { getCategoryFilterOptions } from '@/api/category/tree';
import { getPriceBandDetails, getPriceBandRangeSummary } from '@/api/category/diagnosis/analysis';
import type { OptionVO } from '@/api/category/tree/types';

type SortOrder = 'ascending' | 'descending' | null;

interface PriceBandGoodsRow {
  productNo?: string;
  productName?: string;
  productStatus?: string;
  productStatusNo?: string;
  storeNum?: number;
  saleQuantity?: number;
  saleQuantityPsd?: number;
  sales?: number;
  salesPer?: number;
  salesPsd?: number;
  gross?: number;
  grossPer?: number;
  grossPsd?: number;
  grossRate?: number;
  stockQuantity?: number;
  turnoverRate?: number;
  turnoverDays?: number;
  stockSalesRate?: number;
  contributionRate?: number;
  gmroi?: number;
  salesRate?: number;
  activity?: string;
  firstSaleDate?: string;
  newProduct?: string;
  keyProduct?: string;
  seasonableFlag?: string;
  seasonableFlagName?: string;
}

const ALL_RANGE_VALUE = '__ALL__';
const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));

const statusOptions = ref<OptionVO[]>([]);
const priceBandOptions = ref<string[]>([]);
const selectedRangeValues = ref<string[]>([ALL_RANGE_VALUE]);
const tableRows = ref<PriceBandGoodsRow[]>([]);
const loading = ref(false);
const total = ref(0);
const processDialogVisible = ref(false);

const sortState = reactive<{ prop: string; order: SortOrder }>({ prop: 'sales', order: 'descending' });

const queryForm = reactive({
  status: [] as string[],
  promotion: '',
  priceBandList: [] as string[],
  page: 1,
  size: 10
});

const resolveQueryValue = (value: string | string[] | null | undefined, fallback: string) => {
  if (Array.isArray(value)) return String(value[0] || fallback);
  return String(value || fallback);
};

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

const formatCategoryLevelName = (level?: string | number) => {
  const levelNumber = Number(level || 1);
  if (levelNumber >= 1 && levelNumber <= 5) return `${['', '一级', '二级', '三级', '四级', '五级'][levelNumber]}品类`;
  return '一级品类';
};

const categoryTitle = computed(() => {
  const categoryId = resolveQueryValue(route.query.categoryId as string | string[] | null | undefined, '004');
  const categoryName = resolveQueryValue(route.query.categoryName as string | string[] | null | undefined, '洗化部');
  const categoryLevel = resolveQueryValue(route.query.categoryLevel as string | string[] | null | undefined, '1');
  return `${categoryId}${categoryName}，${formatCategoryLevelName(categoryLevel)}`;
});

const sortFieldMap: Record<string, string> = {
  productNo: 'productNo',
  productName: 'productName',
  productStatus: 'productStatus',
  storeNum: 'storeNum',
  saleQuantity: 'saleQuantity',
  saleQuantityPsd: 'saleQuantityPsd',
  sales: 'sales',
  salesPer: 'salesPer',
  salesPsd: 'salesPsd',
  gross: 'gross',
  grossPer: 'grossPer',
  grossPsd: 'grossPsd',
  grossRate: 'grossRate',
  stockQuantity: 'stockQuantity',
  turnoverRate: 'turnoverRate',
  turnoverDays: 'turnoverDays',
  stockSalesRate: 'stockSalesRate',
  contributionRate: 'contributionRate',
  gmroi: 'gmroi',
  salesRate: 'salesRate',
  activity: 'activity',
  firstSaleDate: 'firstSaleDate',
  newProduct: 'newProduct',
  keyProduct: 'keyProduct',
  seasonableFlagName: 'seasonableFlagName'
};

const currentOrder = computed(() => sortFieldMap[sortState.prop] || 'sales');
const currentOrderType = computed(() => (sortState.order === 'ascending' ? 'asc' : 'desc'));

const loadStatusOptions = async () => {
  const res: any = await getCategoryFilterOptions();
  statusOptions.value = Array.isArray(res?.classSalesStatusNo)
    ? res.classSalesStatusNo.map((item: any) => ({ label: String(item.label || item.value || ''), value: String(item.value || '') }))
    : [];
};

const loadPriceBandOptions = async () => {
  if (!sessionId.value) return;
  const res: any = await getPriceBandRangeSummary(sessionId.value);
  const list = Array.isArray(res?.data?.list) ? res.data.list : [];
  priceBandOptions.value = list.map((item: any) => String(item?.priceBand || '').trim()).filter((item: string) => item);
};

const loadTable = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载价格区间商品清单');
    return;
  }
  loading.value = true;
  try {
    const res: any = await getPriceBandDetails({
      sessionId: sessionId.value,
      status: queryForm.status.length ? queryForm.status : undefined,
      promotion: queryForm.promotion || undefined,
      priceBandList: queryForm.priceBandList.length ? queryForm.priceBandList : undefined,
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
  } finally {
    loading.value = false;
  }
};

const syncSelectedRanges = () => {
  if (!queryForm.priceBandList.length) {
    selectedRangeValues.value = [ALL_RANGE_VALUE];
    return;
  }
  selectedRangeValues.value = [...queryForm.priceBandList];
};

const handleRangeChange = (values: string[]) => {
  if (values.includes(ALL_RANGE_VALUE)) {
    selectedRangeValues.value = [ALL_RANGE_VALUE];
    queryForm.priceBandList = [];
    return;
  }
  queryForm.priceBandList = values.filter((item) => item !== ALL_RANGE_VALUE);
  if (!queryForm.priceBandList.length) selectedRangeValues.value = [ALL_RANGE_VALUE];
};

const handleQuery = async () => {
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
  ElMessage.info('导出功能后续对接真实接口');
};

const handleGoodsDetail = (_row: PriceBandGoodsRow) => {
  ElMessage.info('商品详情跳转功能待接入');
};

const handleProcess = (_row: PriceBandGoodsRow) => {
  processDialogVisible.value = true;
};

const handleSaveProcess = () => {
  ElMessage.success('商品处理已暂存');
};

const handleDispatchProcess = () => {
  ElMessage.success('商品处理已下发');
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
  if (['Y', '1', '是'].includes(value)) return '是';
  if (['N', '0', '否'].includes(value)) return '否';
  return value;
};

onMounted(async () => {
  await Promise.all([loadStatusOptions(), loadPriceBandOptions()]);
  syncSelectedRanges();
  await loadTable();
});

watch(
  () => route.query.sessionId,
  async () => {
    queryForm.page = 1;
    queryForm.priceBandList = [];
    await loadPriceBandOptions();
    syncSelectedRanges();
    await loadTable();
  }
);
</script>

<style scoped lang="scss">
.price-band-detail-page {
  min-height: calc(100vh - 84px);
  padding: 8px;
  background: #f5f7fa;
}
.page-card {
  border: 1px solid #dbe4f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}
.summary-card,
.filter-card {
  margin-bottom: 12px;
}
.summary-line {
  color: #475569;
  font-size: 13px;
  line-height: 1.8;
}
.category-title {
  margin-top: 14px;
  color: #0f172a;
  font-size: 24px;
  font-weight: 700;
}
.filter-row + .filter-row {
  margin-top: 14px;
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
.filter-row-range {
  display: flex;
  align-items: center;
  gap: 12px;
}
.range-label {
  color: #334155;
  font-weight: 600;
  flex: 0 0 auto;
}
.range-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
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
.goods-table {
  width: 100%;
}
.name-link {
  padding: 0;
}
.store-count {
  color: #16c2a3;
  font-weight: 700;
}
.process-btn {
  border-color: #16c2a3;
  color: #16c2a3;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
</style>
