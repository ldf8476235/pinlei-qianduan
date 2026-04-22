<template>
  <div class="p-2 gross-goods-list-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期：{{ currentDateRangeText }}；对比日期：{{ compareDateRangeText }}</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="category-title">{{ categoryTitle }}</div>
    </el-card>

    <el-card shadow="hover" class="page-card filter-card">
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
            <el-option label="正常" value="normal" />
            <el-option label="观察" value="observe" />
            <el-option label="待优化" value="optimize" />
          </el-select>
        </el-form-item>

        <el-form-item label="本期促销">
          <el-select v-model="queryForm.promotion" clearable placeholder="全部" style="width: 140px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>

        <el-form-item label="本期四象限">
          <el-select v-model="queryForm.currentGross" clearable placeholder="全部" style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="领跑商品" value="leading" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="利润商品" value="profit" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>

        <el-form-item label="对比日期四象限">
          <el-select v-model="queryForm.compareGross" clearable placeholder="全部" style="width: 180px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="领跑商品" value="leading" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="利润商品" value="profit" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>

        <el-form-item class="filter-actions">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <div class="card-title-wrap">
            <span class="card-title">品类毛利贡献率商品清单</span>
          </div>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        :data="displayRows"
        border
        stripe
        height="560"
        class="goods-table"
        :row-class-name="getRowClassName"
        @sort-change="handleSortChange"
      >
        <el-table-column label="商品编码" prop="productNo" min-width="130" fixed="left" align="left" sortable="custom" show-overflow-tooltip />

        <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" align="left" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.__isSummary">{{ row.productName || '--' }}</span>
            <el-button v-else link type="primary" class="name-link" @click="handleGoodsDetail(row)">
              {{ row.productName || '--' }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="当前状态" prop="productStatus" min-width="110" fixed="left" align="left" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.productStatus || row.productStatusNo || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="销售门店数" prop="storeNum" min-width="120" fixed="left" align="center" sortable="custom">
          <template #default="{ row }">
            <span class="store-count">{{ formatNumber(row.storeNum, 0) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="毛利贡献率角色" align="center">
          <el-table-column label="本期" prop="currentGrossRoleName" min-width="150" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.__isSummary">--</span>
              <span v-else :class="['role-badge', `is-${resolveRoleClass(row.currentGrossRole)}`]">
                {{ row.currentGrossRoleName || '--' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="对比日期" prop="compareGrossRoleName" min-width="170" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.__isSummary">--</span>
              <span v-else :class="['role-badge', `is-${resolveRoleClass(row.compareGrossRole)}`]">
                {{ row.compareGrossRoleName || '--' }}
              </span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售量" align="center">
          <el-table-column label="总计" prop="saleQuantity" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantity, 0) }}</template>
          </el-table-column>
          <el-table-column label="PSD" prop="saleQuantityPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售额" align="center">
          <el-table-column label="总计" prop="sales" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.sales) }}</template>
          </el-table-column>
          <el-table-column label="占比" prop="salesPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
          </el-table-column>
          <el-table-column label="PSD" prop="salesPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.salesPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利额" align="center">
          <el-table-column label="总计" prop="gross" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.gross) }}</template>
          </el-table-column>
          <el-table-column label="占比" prop="grossPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
          </el-table-column>
          <el-table-column label="PSD" prop="grossPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.grossPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利率" prop="grossRate" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
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

        <el-table-column label="本期新品" prop="newProduct" min-width="100" align="left" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFlagText(row.newProduct) }}</template>
        </el-table-column>

        <el-table-column label="重点商品" prop="keyProduct" min-width="100" align="left" show-overflow-tooltip>
          <template #default="{ row }">{{ formatFlagText(row.keyProduct) }}</template>
        </el-table-column>

        <el-table-column label="季节性商品" prop="seasonableFlagName" min-width="110" align="left" show-overflow-tooltip>
          <template #default="{ row }">{{ row.seasonableFlagName || row.seasonableFlag || '--' }}</template>
        </el-table-column>

        <el-table-column label="操作" min-width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="!row.__isSummary" type="primary" link @click="handleProcess(row)">处理</el-button>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <GoodsProcessDialog
      v-model="processDialogVisible"
      @save="handleSaveProcess"
      @dispatch="handleDispatchProcess"
    />
  </div>
</template>

<script setup name="GrossContributionGoodsList" lang="ts">
import GoodsProcessDialog from '@/components/GoodsProcessDialog/index.vue';
import type { Sort } from 'element-plus';
import { getGrossSalesList } from '@/api/gross-contribution';

interface GoodsRow {
  __isSummary?: boolean;
  productNo?: string;
  productName?: string;
  productStatus?: string;
  productStatusNo?: string;
  storeNum?: number;
  currentGrossRole?: string;
  currentGrossRoleName?: string;
  compareGrossRole?: string;
  compareGrossRoleName?: string;
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

interface QueryForm {
  status: string[];
  promotion: string;
  currentGross: string;
  compareGross: string;
  pageNum: number;
  pageSize: number;
}

type SortOrder = 'ascending' | 'descending' | null;

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));

const resolveQueryValue = (value: string | string[] | null | undefined, fallback: string) => {
  if (Array.isArray(value)) return String(value[0] || fallback);
  return String(value || fallback);
};

const currentDateRangeText = computed(() => {
  const start = resolveQueryValue(route.query.startDate as string | string[] | null | undefined, '2024-01-01');
  const end = resolveQueryValue(route.query.endDate as string | string[] | null | undefined, '2024-01-31');
  return `${start} ~ ${end}`;
});

const compareDateRangeText = computed(() => {
  const start = resolveQueryValue(route.query.compareStartDate as string | string[] | null | undefined, '2023-12-01');
  const end = resolveQueryValue(route.query.compareEndDate as string | string[] | null | undefined, '2023-12-31');
  return `${start} ~ ${end}`;
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

const queryForm = reactive<QueryForm>({
  status: [],
  promotion: '',
  currentGross: '',
  compareGross: '',
  pageNum: 1,
  pageSize: 10
});

const sortState = reactive<{
  prop: string;
  order: SortOrder;
}>({
  prop: 'sales',
  order: 'descending'
});

const tableLoading = ref(false);
const total = ref(0);
const tableRows = ref<GoodsRow[]>([]);
const processDialogVisible = ref(false);

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const sumBy = (rows: GoodsRow[], key: keyof GoodsRow) => rows.reduce((sum, row) => sum + toNumber(row[key]), 0);

const averageBy = (rows: GoodsRow[], key: keyof GoodsRow) => {
  if (!rows.length) return 0;
  return sumBy(rows, key) / rows.length;
};

const safeDivide = (numerator: number, denominator: number) => {
  if (!denominator) return 0;
  return numerator / denominator;
};

const buildSummaryRow = (rows: GoodsRow[]): GoodsRow => {
  const totalSales = sumBy(rows, 'sales');
  const totalGross = sumBy(rows, 'gross');
  return {
    __isSummary: true,
    productNo: '合计',
    productName: '当前页汇总',
    productStatus: '--',
    storeNum: sumBy(rows, 'storeNum'),
    saleQuantity: sumBy(rows, 'saleQuantity'),
    saleQuantityPsd: sumBy(rows, 'saleQuantityPsd'),
    sales: totalSales,
    salesPer: rows.length ? 1 : 0,
    salesPsd: sumBy(rows, 'salesPsd'),
    gross: totalGross,
    grossPer: rows.length ? 1 : 0,
    grossPsd: sumBy(rows, 'grossPsd'),
    grossRate: safeDivide(totalGross, totalSales),
    stockQuantity: sumBy(rows, 'stockQuantity'),
    turnoverRate: averageBy(rows, 'turnoverRate'),
    turnoverDays: averageBy(rows, 'turnoverDays'),
    stockSalesRate: averageBy(rows, 'stockSalesRate'),
    contributionRate: rows.length ? 1 : 0,
    gmroi: averageBy(rows, 'gmroi'),
    salesRate: averageBy(rows, 'salesRate'),
    activity: '--',
    firstSaleDate: '--',
    newProduct: '--',
    keyProduct: '--',
    seasonableFlagName: '--'
  };
};

const loadTableList = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载商品清单');
    return;
  }
  tableLoading.value = true;
  try {
    const res = await getGrossSalesList({
      sessionId: sessionId.value,
      status: queryForm.status.length ? queryForm.status : undefined,
      promotion: queryForm.promotion || undefined,
      currentGross: queryForm.currentGross || undefined,
      compareGross: queryForm.compareGross || undefined,
      page: queryForm.pageNum,
      size: queryForm.pageSize,
      order: 'sales',
      orderType: 'desc'
    });
    const page = (res as any)?.result || (res as any)?.data?.result || {};
    tableRows.value = Array.isArray(page.records) ? page.records : [];
    total.value = Number(page.total || 0);
  } finally {
    tableLoading.value = false;
  }
};

const handleQuery = async () => {
  queryForm.pageNum = 1;
  await loadTableList();
};

const handleReset = async () => {
  queryForm.status = [];
  queryForm.promotion = '';
  queryForm.currentGross = '';
  queryForm.compareGross = '';
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  await loadTableList();
};

const handleExport = () => {
  ElMessage.info('导出功能后续对接真实接口');
};

const handleGoodsDetail = (_row: GoodsRow) => {
  ElMessage.info('商品详情跳转功能待接入');
};

const handleProcess = (_row: GoodsRow) => {
  processDialogVisible.value = true;
};

const handleSaveProcess = () => {
  ElMessage.success('商品处理已暂存');
};

const handleDispatchProcess = () => {
  ElMessage.success('商品处理已下发');
};

const resolveRoleClass = (value?: string) => {
  if (value === '1' || value === 'leading') return 'leading';
  if (value === '2' || value === 'attracting') return 'attracting';
  if (value === '4' || value === 'profit') return 'profit';
  return 'problem';
};

const getSortValue = (row: GoodsRow, prop: string) => {
  if (prop === 'productStatus') return row.productStatus || row.productStatusNo || '';
  if (prop === 'seasonableFlagName') return row.seasonableFlagName || row.seasonableFlag || '';
  return (row as Record<string, unknown>)[prop];
};

const sortedRows = computed(() => {
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

const summaryRow = computed(() => buildSummaryRow(sortedRows.value));

const displayRows = computed(() => [summaryRow.value, ...sortedRows.value]);

const getRowClassName = ({ row }: { row: GoodsRow }) => {
  return row.__isSummary ? 'summary-row' : '';
};

const handleSortChange = ({ prop, order }: { prop: string; order: Sort['order'] }) => {
  sortState.prop = prop || 'sales';
  sortState.order = order as SortOrder;
};

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
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
  await loadTableList();
});
</script>

<style scoped lang="scss">
.gross-goods-list-page {
  background: linear-gradient(180deg, #f7fbff 0%, #f5f7fa 180px), #f5f7fa;
  min-height: calc(100vh - 84px);
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
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
}

.category-title {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
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
  gap: 16px;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
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

.table-card :deep(.el-card__body) {
  padding-top: 8px;
}

.goods-table {
  width: 100%;
}

.goods-table :deep(.el-table__header-wrapper thead tr:first-child th) {
  background: #eef4fb;
  color: #0f172a;
  font-weight: 700;
}

.goods-table :deep(.el-table__header-wrapper thead tr:nth-child(2) th) {
  background: #f8fbff;
  color: #334155;
  font-weight: 600;
}

.goods-table :deep(.el-table__header th) {
  border-bottom-color: #d9e3ef;
}

.goods-table :deep(.cell) {
  font-size: 13px;
}

.goods-table :deep(.el-table__body td) {
  color: #334155;
}

.goods-table :deep(.el-table__body tr:hover > td) {
  background: #f6fbff;
}

.goods-table :deep(.summary-row > td) {
  background: #eefbf7 !important;
  font-weight: 700;
  color: #0f172a;
}

.goods-table :deep(.el-table__fixed-left),
.goods-table :deep(.el-table__fixed-right) {
  box-shadow: 0 0 18px rgba(15, 23, 42, 0.06);
}

.goods-table :deep(.el-table__fixed-right-patch) {
  background: #eef4fb;
}

.store-count {
  color: #0f9f9a;
  font-weight: 700;
}

.name-link {
  padding: 0;
  font-weight: 600;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid transparent;
}

.role-badge.is-leading {
  color: #1478a6;
  background: rgba(39, 176, 214, 0.12);
  border-color: rgba(39, 176, 214, 0.22);
}

.role-badge.is-attracting {
  color: #c14b28;
  background: rgba(240, 107, 79, 0.12);
  border-color: rgba(240, 107, 79, 0.22);
}

.role-badge.is-profit {
  color: #7b62d4;
  background: rgba(182, 156, 255, 0.14);
  border-color: rgba(182, 156, 255, 0.22);
}

.role-badge.is-problem {
  color: #c53232;
  background: rgba(229, 62, 62, 0.1);
  border-color: rgba(229, 62, 62, 0.18);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

@media (max-width: 1200px) {
  .filter-actions {
    margin-left: 0;
  }
}

@media (max-width: 992px) {
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
