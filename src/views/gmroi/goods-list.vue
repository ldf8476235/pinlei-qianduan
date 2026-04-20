<template>
  <div class="p-2 gmroi-goods-list-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">GMROI 商品清单</span>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
        </div>
      </div>

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="当前状态">
          <el-select v-model="queryForm.statusList" multiple clearable style="width: 220px" @change="loadTable">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期促销">
          <el-select v-model="queryForm.promotion" clearable style="width: 160px" @change="loadTable">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期四象限">
          <el-select v-model="queryForm.currentGmroi" clearable style="width: 170px" @change="loadTable">
            <el-option label="全部" value="" />
            <el-option label="成功商品" value="1" />
            <el-option label="沉睡商品" value="2" />
            <el-option label="吸客商品" value="4" />
            <el-option label="问题商品" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比四象限">
          <el-select v-model="queryForm.compareGmroi" clearable style="width: 170px" @change="loadTable">
            <el-option label="全部" value="" />
            <el-option label="成功商品" value="1" />
            <el-option label="沉睡商品" value="2" />
            <el-option label="吸客商品" value="4" />
            <el-option label="问题商品" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTable">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-title">GMROI 商品清单</div>
      </template>

      <el-table :data="tableRows" border stripe height="560">
        <el-table-column label="商品编码" prop="productNo" min-width="120" fixed="left" />
        <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" show-overflow-tooltip />
        <el-table-column label="当前状态" prop="productStatus" min-width="100" />
        <el-table-column label="门店数" min-width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.storeNum, 0) }}
          </template>
        </el-table-column>
        <el-table-column label="GMROI角色(本期/对比)" min-width="200">
          <template #default="{ row }"> {{ row.currentGmroiRoleName || '-' }} / {{ row.compareGmroiRoleName || '-' }} </template>
        </el-table-column>
        <el-table-column label="销售额" min-width="120" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.sales) }}
          </template>
        </el-table-column>
        <el-table-column label="毛利率" min-width="100" align="right">
          <template #default="{ row }">
            {{ formatPercent(row.grossRate) }}
          </template>
        </el-table-column>
        <el-table-column label="库存数量" min-width="110" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.stockQuantity) }}
          </template>
        </el-table-column>
        <el-table-column label="库存周转率" min-width="110" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.turnoverRate) }}
          </template>
        </el-table-column>
        <el-table-column label="库存周转天数" min-width="120" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.turnoverDays) }}
          </template>
        </el-table-column>
        <el-table-column label="库存销比" min-width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.stockSalesRate) }}
          </template>
        </el-table-column>
        <el-table-column label="毛利贡献率" min-width="120" align="right">
          <template #default="{ row }">
            {{ formatPercent(row.contributionRate) }}
          </template>
        </el-table-column>
        <el-table-column label="GMROI" min-width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.gmroi) }}
          </template>
        </el-table-column>
        <el-table-column label="销售率" min-width="100" align="right">
          <template #default="{ row }">
            {{ formatPercent(row.salesRate) }}
          </template>
        </el-table-column>
        <el-table-column label="本期促销" prop="activity" min-width="90" />
        <el-table-column label="首次销售日期" prop="firstSaleDate" min-width="130" />
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          @size-change="loadTable"
          @current-change="loadTable"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getGmroiSalesList } from '@/api/gmroi';
import type { GmroiSalesListItemVO } from '@/api/gmroi/types';

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));
const queryForm = reactive({
  statusList: [] as string[],
  promotion: '',
  currentGmroi: '',
  compareGmroi: '',
  gmroiRanges: ['0'] as string[],
  pageNum: 1,
  pageSize: 10
});

const statusOptions = [
  { label: '正常', value: 'normal' },
  { label: '观察', value: 'observe' },
  { label: '待优化', value: 'optimize' }
];

const tableRows = ref<GmroiSalesListItemVO[]>([]);
const total = ref(0);

const loadTable = async () => {
  if (!sessionId.value) return;
  const res = await getGmroiSalesList({
    sessionId: sessionId.value,
    status: queryForm.statusList,
    promotion: queryForm.promotion || undefined,
    currentGmroi: queryForm.currentGmroi || undefined,
    compareGmroi: queryForm.compareGmroi || undefined,
    gmroiList: queryForm.gmroiRanges,
    page: queryForm.pageNum,
    size: queryForm.pageSize,
    order: 'sales',
    orderType: 'desc'
  });
  const page = res.data.result;
  tableRows.value = page.records || [];
  total.value = Number(page.total || 0);
};

const handleReset = async () => {
  queryForm.statusList = [];
  queryForm.promotion = '';
  queryForm.currentGmroi = '';
  queryForm.compareGmroi = '';
  queryForm.gmroiRanges = ['0'];
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  await loadTable();
};

const formatNumber = (value: unknown, digits = 2) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString('zh-CN', { maximumFractionDigits: digits }) : '-';
};

const formatPercent = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : '-';
};

onMounted(loadTable);
</script>

<style scoped lang="scss">
.gmroi-goods-list-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgb(15 23 42 / 4%);
}

.filter-card,
.table-card {
  margin-bottom: 12px;
}

.filter-header,
.page-title-wrap,
.page-actions {
  display: flex;
  align-items: center;
}

.filter-header {
  justify-content: space-between;
  gap: 12px;
}

.page-title-wrap {
  gap: 8px;
}

.page-title-line {
  width: 3px;
  height: 16px;
  background: var(--el-color-primary);
  border-radius: 999px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.unit-text,
.page-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.filter-form {
  margin-top: 14px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
