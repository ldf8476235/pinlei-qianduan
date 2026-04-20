<template>
  <div class="p-2 gross-goods-list-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="filter-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">{{ title }}</span>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
        </div>
      </div>

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="当前状态">
          <el-select v-model="queryForm.status" clearable style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="观察" value="observe" />
            <el-option label="待优化" value="optimize" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期促销">
          <el-select v-model="queryForm.promotion" clearable style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期四象限">
          <el-select v-model="queryForm.currentGross" clearable style="width: 170px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="领跑商品" value="leading" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="利润商品" value="profit" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比四象限">
          <el-select v-model="queryForm.compareGross" clearable style="width: 170px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="领跑商品" value="leading" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="利润商品" value="profit" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类毛利贡献率商品清单</span>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="tableRows" border stripe class="goods-table" height="560">
        <el-table-column label="商品编码" prop="productNo" min-width="120" fixed="left" align="left" show-overflow-tooltip />
        <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" align="left" show-overflow-tooltip />
        <el-table-column label="当前状态" prop="productStatus" min-width="100" align="left" />
        <el-table-column label="门店数" min-width="100" align="right">
          <template #default="{ row }">{{ formatNumber(row.storeNum, 0) }}</template>
        </el-table-column>
        <el-table-column label="毛利角色(本期/对比)" min-width="200" align="left">
          <template #default="{ row }">
            <div class="role-cell">
              <span :class="['role-text', `is-${resolveRoleClass(row.currentGrossRole)}`]">{{ row.currentGrossRoleName || '-' }}</span>
              <span class="role-separator">/</span>
              <span :class="['role-text', `is-${resolveRoleClass(row.compareGrossRole)}`]">{{ row.compareGrossRoleName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="销售量(总计)" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.saleQuantity, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量(PSD)" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
        </el-table-column>
        <el-table-column label="销售额(总计)" min-width="130" align="right">
          <template #default="{ row }">{{ formatNumber(row.sales) }}</template>
        </el-table-column>
        <el-table-column label="销售额(占比)" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
        </el-table-column>
        <el-table-column label="销售额(PSD)" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.salesPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(总计)" min-width="130" align="right">
          <template #default="{ row }">{{ formatNumber(row.gross) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(占比)" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(PSD)" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.grossPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利率" min-width="100" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="库存数量" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.stockQuantity, 0) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.turnoverRate) }}</template>
        </el-table-column>
        <el-table-column label="库存周转天数" min-width="130" align="right">
          <template #default="{ row }">{{ formatNumber(row.turnoverDays) }}</template>
        </el-table-column>
        <el-table-column label="库存销比" min-width="100" align="right">
          <template #default="{ row }">{{ formatNumber(row.stockSalesRate) }}</template>
        </el-table-column>
        <el-table-column label="毛利贡献率" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.contributionRate) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" min-width="100" align="right">
          <template #default="{ row }">{{ formatNumber(row.gmroi) }}</template>
        </el-table-column>
        <el-table-column label="销售率" min-width="100" align="right">
          <template #default="{ row }">{{ formatPercent(row.salesRate) }}</template>
        </el-table-column>
        <el-table-column label="本期促销" min-width="90" align="left">
          <template #default="{ row }">{{ row.activity || '-' }}</template>
        </el-table-column>
        <el-table-column label="首次销售日期" min-width="130" align="left" prop="firstSaleDate" />
        <el-table-column label="品类" min-width="120" align="left" show-overflow-tooltip prop="className" />
        <el-table-column label="品牌" min-width="120" align="left" show-overflow-tooltip prop="brandName" />
        <el-table-column label="供应商" min-width="160" align="left" show-overflow-tooltip prop="productVendorName" />
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
  </div>
</template>

<script setup name="GrossContributionGoodsList" lang="ts">
import { getGrossSalesList } from '@/api/gross-contribution';

interface GoodsRow {
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
  className?: string;
  brandName?: string;
  productVendorName?: string;
}

interface QueryForm {
  status: string;
  promotion: string;
  currentGross: string;
  compareGross: string;
  pageNum: number;
  pageSize: number;
}

const route = useRoute();
const title = computed(() => String(route.query.categoryName || '毛利贡献率商品清单'));
const sessionId = computed(() => String(route.query.sessionId || ''));

const queryForm = reactive<QueryForm>({
  status: '',
  promotion: '',
  currentGross: '',
  compareGross: '',
  pageNum: 1,
  pageSize: 10
});
const tableLoading = ref(false);
const total = ref(0);
const tableRows = ref<GoodsRow[]>([]);

const loadTableList = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载商品清单');
    return;
  }
  tableLoading.value = true;
  try {
    const res = await getGrossSalesList({
      sessionId: sessionId.value,
      status: queryForm.status ? [queryForm.status] : undefined,
      promotion: queryForm.promotion || undefined,
      currentGross: queryForm.currentGross || undefined,
      compareGross: queryForm.compareGross || undefined,
      page: queryForm.pageNum,
      size: queryForm.pageSize,
      order: 'sales',
      orderType: 'desc'
    });
    const page = res?.result || {};
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
  queryForm.status = '';
  queryForm.promotion = '';
  queryForm.currentGross = '';
  queryForm.compareGross = '';
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  await loadTableList();
};

const resolveRoleClass = (value?: string) => {
  if (value === '1' || value === 'leading') return 'leading';
  if (value === '2' || value === 'attracting') return 'attracting';
  if (value === '4' || value === 'profit') return 'profit';
  return 'problem';
};

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}%`;
};

onMounted(async () => {
  await loadTableList();
});
</script>

<style scoped lang="scss">
.gross-goods-list-page {
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

.page-title-wrap {
  display: flex;
  align-items: center;
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
  line-height: 1;
}

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

.unit-text {
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

.role-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-separator {
  color: var(--el-text-color-secondary);
}

.role-text {
  font-weight: 600;
}

.role-text.is-leading {
  color: #27b0d6;
}

.role-text.is-attracting {
  color: #f06b4f;
}

.role-text.is-profit {
  color: #b69cff;
}

.role-text.is-problem {
  color: #e53e3e;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
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
}
</style>
