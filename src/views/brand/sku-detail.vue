<template>
  <div class="p-2 brand-sku-detail-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期：{{ currentDateRangeText }}；对比日期：{{ compareDateRangeText }}</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="category-title">{{ categoryTitle }}</div>
      <div class="brand-subtitle">品牌：{{ selectedBrandName }}</div>
    </el-card>

    <el-card shadow="hover" class="page-card filter-card">
      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="品牌类型">
          <el-select
            v-model="queryForm.brandType"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            disabled
            placeholder="全部"
            style="width: 220px"
          >
            <el-option v-for="item in fixedBrandTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="品牌">
          <el-select
            v-model="queryForm.brandName"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            disabled
            placeholder="全部"
            style="width: 240px"
          >
            <el-option v-for="item in fixedBrandNameOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="新销品牌">
          <el-select v-model="queryForm.newSaleBrand" disabled placeholder="全部" style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
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
            <el-option label="全部" value="-1" />
            <el-option label="上架" value="0" />
            <el-option label="下架" value="1" />
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
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品牌SKU商品清单</span>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-alert v-if="tableError" class="mb-[12px]" :title="tableError" type="error" show-icon :closable="false" />

      <el-table
        v-loading="tableLoading"
        :data="displayRows"
        border
        stripe
        height="560"
        class="goods-table"
        :empty-text="tableError || '暂无品牌SKU商品明细数据'"
        @sort-change="handleSortChange"
      >
        <el-table-column label="商品编码" prop="productNo" min-width="130" fixed="left" align="left" sortable="custom" show-overflow-tooltip />

        <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" align="left" sortable="custom" show-overflow-tooltip />

        <el-table-column label="当前状态" prop="productStatus" min-width="120" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.productStatus || row.productStatusNo || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="销售门店数" prop="storeNum" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">
            <el-button
              v-if="Number(row.storeNum) > 0"
              link
              type="primary"
              class="drilldown-number"
              @click="handleStoreDrilldown(row)"
            >
              {{ formatNumber(row.storeNum, 0) }}
            </el-button>
            <span v-else class="store-count">{{ formatNumber(row.storeNum, 0) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="销售量指标" align="center">
          <el-table-column label="销售量-总计" prop="saleQuantity" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantity, 0) }}</template>
          </el-table-column>
          <el-table-column label="销售量-PSD" prop="saleQuantityPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售额指标" align="center">
          <el-table-column label="销售额-总计" prop="sales" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.sales) }}</template>
          </el-table-column>
          <el-table-column label="销售额-占比" prop="salesPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
          </el-table-column>
          <el-table-column label="销售额-PSD" prop="salesPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.salesPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利额&毛利效率" align="center">
          <el-table-column label="毛利额-总计" prop="gross" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.gross) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-占比" prop="grossPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-PSD" prop="grossPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.grossPsd) }}</template>
          </el-table-column>
          <el-table-column label="毛利率" prop="grossRate" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="库存经营全量" align="center">
          <el-table-column label="当前库存数量" prop="stockQuantity" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.stockQuantity, 0) }}</template>
          </el-table-column>
          <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.turnoverRate) }}</template>
          </el-table-column>
          <el-table-column label="库存周转天数" prop="turnoverDays" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.turnoverDays) }}</template>
          </el-table-column>
          <el-table-column label="库销比" prop="stockSalesRate" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.stockSalesRate) }}</template>
          </el-table-column>
          <el-table-column label="毛利贡献率" prop="contributionRate" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.contributionRate) }}</template>
          </el-table-column>
          <el-table-column label="GMROI" prop="gmroi" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.gmroi) }}</template>
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
          <el-table-column label="规格" prop="spec" min-width="110" align="left" sortable="custom" show-overflow-tooltip />
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { Sort } from 'element-plus';
import { getBrandSkuDetails } from '@/api/category/diagnosis/analysis';

type SortOrder = 'ascending' | 'descending' | null;

interface GoodsRow {
  [key: string]: unknown;
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
  spec?: string;
}

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));

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
  if (levelNumber >= 1 && levelNumber <= 5) {
    return `${['', '一级', '二级', '三级', '四级', '五级'][levelNumber]}品类`;
  }
  return '一级品类';
};

const categoryTitle = computed(() => {
  const categoryId = resolveQueryValue(route.query.categoryId as string | string[] | null | undefined, '004');
  const categoryName = resolveQueryValue(route.query.categoryName as string | string[] | null | undefined, '洗化部');
  const categoryLevel = resolveQueryValue(route.query.categoryLevel as string | string[] | null | undefined, '1');
  return `${categoryId}${categoryName}（${formatCategoryLevelName(categoryLevel)}）`;
});

const selectedBrandName = computed(() => resolveQueryValue(route.query.brandName as string | string[] | null | undefined, '全部品牌'));

const resolveQueryList = (value: string | string[] | null | undefined) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const queryForm = reactive({
  brandType: [] as string[],
  brandName: [] as string[],
  newSaleBrand: '',
  status: ['-1', '0', '1'] as string[],
  promotion: '',
  pageNum: 1,
  pageSize: 10
});

const fixedBrandTypeOptions = computed(() => (queryForm.brandType.length ? queryForm.brandType : ['全部']));
const fixedBrandNameOptions = computed(() => (queryForm.brandName.length ? queryForm.brandName : ['全部']));

const sortState = reactive<{ prop: string; order: SortOrder }>({
  prop: 'sales',
  order: 'descending'
});

const tableLoading = ref(false);
const tableError = ref('');
const total = ref(0);
const tableRows = ref<GoodsRow[]>([]);

const loadTableList = async () => {
  if (!sessionId.value) {
    tableError.value = '缺少 sessionId，无法加载品牌SKU商品清单';
    tableRows.value = [];
    total.value = 0;
    return;
  }
  if (!selectedBrandName.value || selectedBrandName.value === '全部品牌') {
    tableError.value = '缺少品牌信息，无法加载品牌SKU商品清单';
    tableRows.value = [];
    total.value = 0;
    return;
  }

  tableLoading.value = true;
  tableError.value = '';
  try {
    const res = await getBrandSkuDetails({
      sessionId: sessionId.value,
      brandList: queryForm.brandName.length ? queryForm.brandName : [selectedBrandName.value],
      status: queryForm.status.includes('-1') ? undefined : queryForm.status,
      promotion: queryForm.promotion || undefined,
      page: queryForm.pageNum,
      size: queryForm.pageSize,
      order: sortState.prop || 'sales',
      orderType: sortState.order === 'ascending' ? 'asc' : 'desc'
    });
    const page = (res as any)?.data || {};
    tableRows.value = Array.isArray(page.records) ? page.records : [];
    total.value = Number(page.total || 0);
  } catch (error: any) {
    tableRows.value = [];
    total.value = 0;
    tableError.value = error?.message || '品牌SKU商品清单加载失败';
  } finally {
    tableLoading.value = false;
  }
};

const syncQueryFormFromRoute = () => {
  queryForm.brandType = resolveQueryList((route.query.brandType || route.query.brandTypeList) as string | string[] | null | undefined);
  queryForm.brandName = resolveQueryList((route.query.brandName || route.query.brandList) as string | string[] | null | undefined);
  queryForm.newSaleBrand = resolveQueryValue(route.query.newSaleBrand as string | string[] | null | undefined, '');
};

const handleQuery = async () => {
  queryForm.pageNum = 1;
  await loadTableList();
};

const handlePageChange = async (page: number) => {
  queryForm.pageNum = page;
  await loadTableList();
};

const handleSizeChange = async (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  await loadTableList();
};

const handleExport = () => {
  ElMessage.info('导出功能待接入');
};

const handleStoreDrilldown = (row: GoodsRow) => {
  if (!row.productNo) {
    ElMessage.warning('缺少商品编码，无法查看销售门店明细');
    return;
  }
  router.push({
    path: '/product-store/detail',
    query: {
      ...route.query,
      productNo: row.productNo,
      productName: row.productName || '',
      brandName: selectedBrandName.value || '',
      spec: row.spec || '',
      source: 'brand'
    }
  });
};

const getSortValue = (row: GoodsRow, prop: string) => {
  if (prop === 'productStatus') return row.productStatus || row.productStatusNo || '';
  if (prop === 'seasonableFlagName') return row.seasonableFlagName || row.seasonableFlag || '';
  return row[prop];
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
  sortState.order = (order as SortOrder) || 'descending';
  void loadTableList();
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
  () => {
    syncQueryFormFromRoute();
    queryForm.pageNum = 1;
    void loadTableList();
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.brand-sku-detail-page {
  background: linear-gradient(180deg, #f7fbff 0%, #f5f7fa 180px), #f5f7fa;
  min-height: calc(100vh - 84px);
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
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
}

.category-title {
  margin-top: 14px;
  color: #0f172a;
  font-size: 22px;
  font-weight: 700;
}

.brand-subtitle {
  margin-top: 8px;
  color: #0f9f9a;
  font-size: 14px;
  font-weight: 600;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
  width: 100%;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 18px;
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
  gap: 12px;
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
  font-size: 13px;
  color: #64748b;
}

.goods-table {
  width: 100%;
}

.drilldown-number {
  padding: 0;
  font-weight: 700;
}

.store-count {
  color: #0f9f9a;
  font-weight: 700;
}

.goods-table :deep(.el-table__header th) {
  background: #fff3e8;
  color: #111827;
  font-weight: 700;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
}
</style>
