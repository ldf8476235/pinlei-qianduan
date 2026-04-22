<template>
  <div class="p-2 gmroi-goods-list-page">
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
            @change="handleQuery"
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
          <el-select v-model="queryForm.currentGmroi" clearable placeholder="全部" style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="成功商品" value="1" />
            <el-option label="沉睡商品" value="2" />
            <el-option label="问题商品" value="3" />
            <el-option label="吸客商品" value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="对比日期四象限">
          <el-select v-model="queryForm.compareGmroi" clearable placeholder="全部" style="width: 180px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="成功商品" value="1" />
            <el-option label="沉睡商品" value="2" />
            <el-option label="问题商品" value="3" />
            <el-option label="吸客商品" value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="GMROI区间">
          <el-checkbox-group v-model="queryForm.gmroiRanges" @change="handleQuery">
            <el-checkbox label="0">全部</el-checkbox>
            <el-checkbox label="1">GMROI&lt;=1</el-checkbox>
            <el-checkbox label="2">1&lt;GMROI&lt;=2</el-checkbox>
            <el-checkbox label="3">2&lt;GMROI&lt;=3</el-checkbox>
            <el-checkbox label="4">GMROI&gt;3</el-checkbox>
          </el-checkbox-group>
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
        @sort-change="handleSortChange"
      >
        <el-table-column label="商品编码" prop="productNo" min-width="130" fixed="left" align="left" sortable="custom" show-overflow-tooltip />

        <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button link type="primary" class="name-link" @click="handleGoodsDetail(row)">
              {{ row.productName || '--' }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="当前状态" prop="productStatus" min-width="110" fixed="left" align="left" sortable="custom" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.productStatus || row.productStatusNo || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="销售门店数" prop="storeNum" min-width="120" fixed="left" align="center" sortable="custom">
          <template #default="{ row }">
            <span class="store-count">{{ formatNumber(row.storeNum, 0) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="GMROI角色" align="center">
          <el-table-column label="GMROI角色-本期" prop="currentGmroiRoleName" min-width="130" align="left" sortable="custom" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="['role-badge', `is-${resolveRoleClass(row.currentGmroiRole)}`]">
                {{ row.currentGmroiRoleName || '--' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="GMROI角色-对比日期" prop="compareGmroiRoleName" min-width="150" align="left" sortable="custom" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="['role-badge', `is-${resolveRoleClass(row.compareGmroiRole)}`]">
                {{ row.compareGmroiRoleName || '--' }}
              </span>
            </template>
          </el-table-column>
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
          <el-table-column label="季节性商品" prop="seasonableFlagName" min-width="110" align="left" sortable="custom" show-overflow-tooltip>
            <template #default="{ row }">{{ row.seasonableFlagName || row.seasonableFlag || '--' }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="操作" min-width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleProcess(row)">处理</el-button>
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

    <el-dialog v-model="processDialogVisible" title="商品处理" width="520px" destroy-on-close>
      <div class="process-tip">选中商品的销售门店需按照以下要求进行处理!</div>
      <el-form :model="processForm" label-width="110px" class="dialog-form">
        <el-form-item label="处理方案" required>
          <el-select v-model="processForm.plan" clearable placeholder="请选择" style="width: 100%">
            <el-option label="下架淘汰" value="remove" />
            <el-option label="观察调整" value="observe" />
            <el-option label="保留跟踪" value="retain" />
          </el-select>
        </el-form-item>
        <el-form-item label="门店需完成日期" required>
          <el-date-picker v-model="processForm.finishDate" type="date" placeholder="请选择" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button @click="handleSaveProcess">暂存</el-button>
          <el-button type="primary" @click="handleDispatchProcess">下发</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Sort } from 'element-plus';
import { getGmroiSalesList } from '@/api/gmroi';
import type { GmroiSalesListItemVO } from '@/api/gmroi/types';

type SortOrder = 'ascending' | 'descending' | null;

interface GoodsRow extends GmroiSalesListItemVO {
  activity?: string;
  seasonableFlag?: string;
  seasonableFlagName?: string;
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

const queryForm = reactive({
  status: ['normal', 'observe', 'optimize'] as string[],
  promotion: '',
  currentGmroi: '',
  compareGmroi: '',
  gmroiRanges: ['0'] as string[],
  pageNum: 1,
  pageSize: 10
});

const sortState = reactive<{ prop: string; order: SortOrder }>({
  prop: 'sales',
  order: 'descending'
});

const tableLoading = ref(false);
const total = ref(0);
const tableRows = ref<GoodsRow[]>([]);
const processDialogVisible = ref(false);
const processForm = reactive({
  plan: '',
  finishDate: ''
});

const loadTableList = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载商品清单');
    return;
  }
  tableLoading.value = true;
  try {
    const res = await getGmroiSalesList({
      sessionId: sessionId.value,
      status: queryForm.status,
      promotion: queryForm.promotion || undefined,
      currentGmroi: queryForm.currentGmroi || undefined,
      compareGmroi: queryForm.compareGmroi || undefined,
      gmroiList: queryForm.gmroiRanges,
      page: queryForm.pageNum,
      size: queryForm.pageSize,
      order: sortState.prop || 'sales',
      orderType: sortState.order === 'ascending' ? 'asc' : 'desc'
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
  queryForm.status = ['normal', 'observe', 'optimize'];
  queryForm.promotion = '';
  queryForm.currentGmroi = '';
  queryForm.compareGmroi = '';
  queryForm.gmroiRanges = ['0'];
  queryForm.pageNum = 1;
  queryForm.pageSize = 10;
  sortState.prop = 'sales';
  sortState.order = 'descending';
  await loadTableList();
};

const handleExport = () => {
  ElMessage.info('导出功能待接入真实接口');
};

const handleGoodsDetail = (row: GoodsRow) => {
  router.push({
    path: '/gmroi/analysis/detail',
    query: {
      ...route.query,
      productNo: row.productNo,
      productName: row.productName
    }
  });
};

const handleProcess = (row: GoodsRow) => {
  processForm.plan = '';
  processForm.finishDate = '';
  processDialogVisible.value = true;
};

const handleSaveProcess = () => {
  processDialogVisible.value = false;
  ElMessage.success('商品处理已暂存');
};

const handleDispatchProcess = () => {
  processDialogVisible.value = false;
  ElMessage.success('商品处理已下发');
};

const resolveRoleClass = (value?: string) => {
  if (value === '1') return 'success';
  if (value === '2') return 'sleep';
  if (value === '4') return 'attract';
  return 'problem';
};

const getSortValue = (row: GoodsRow, prop: string) => {
  if (prop === 'productStatus') return row.productStatus || row.productStatusNo || '';
  if (prop === 'seasonableFlagName') return row.seasonableFlagName || row.seasonableFlag || '';
  return (row as Record<string, unknown>)[prop];
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
  if (['Y', '1', '是'].includes(value)) return '是';
  if (['N', '0', '否'].includes(value)) return '否';
  return value;
};

onMounted(async () => {
  await loadTableList();
});
</script>

<style scoped lang="scss">
.gmroi-goods-list-page {
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

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
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

.name-link {
  padding: 0;
  font-weight: 600;
}

.store-count {
  color: #0f766e;
  font-weight: 700;
}

.goods-table {
  width: 100%;
}

.goods-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: #0f172a;
  font-weight: 600;
}

.goods-table :deep(.cell) {
  text-align: center;
}

.goods-table :deep(.el-table__body tr:nth-child(2n)) td {
  background: #fbfdff;
}

.goods-table :deep(.el-table__body td) {
  color: #334155;
}

.goods-table :deep(.el-table__fixed-left),
.goods-table :deep(.el-table__fixed-right) {
  box-shadow: 0 0 12px rgba(15, 23, 42, 0.06);
}

.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.role-badge.is-success {
  background: rgba(33, 183, 168, 0.12);
  color: #0f766e;
}

.role-badge.is-sleep {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.role-badge.is-attract {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}

.role-badge.is-problem {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.dialog-form {
  margin-top: 8px;
}

.process-tip {
  background: rgba(33, 183, 168, 0.12);
  color: #0f766e;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
