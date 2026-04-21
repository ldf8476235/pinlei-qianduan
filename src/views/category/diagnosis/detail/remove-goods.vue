<template>
  <div class="remove-goods-page">
    <el-card shadow="hover" class="page-card">
      <template #header>
        <div class="page-header">
          <div>
            <div class="page-title">建议淘汰商品</div>
            <div class="dimension-tags">
              <span class="dimension-tag">ABC维度</span>
              <span class="dimension-tag">毛利贡献率维度</span>
              <span class="dimension-tag">毛利回报率维度</span>
            </div>
          </div>
          <div class="header-actions">
            <span class="unit-text">金额单位：元</span>
            <el-button type="primary" plain @click="modelDialogVisible = true">设置淘汰模型</el-button>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        class="tip-alert"
        title="淘汰依据: 查询日期范围下, 商品状态异常(每日无库存、无销量) 或业绩贡献低等维度"
      />

      <div class="table-title">建议淘汰商品清单</div>

      <el-table
        :data="displayRows"
        border
        stripe
        class="goods-table"
        @sort-change="handleSortChange"
      >
        <el-table-column label="商品信息" align="center">
          <el-table-column label="商品编码" prop="productNo" min-width="130" fixed="left" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="商品名称" prop="productName" min-width="220" fixed="left" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="处理状态" prop="handleStatus" min-width="110" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="当前状态" prop="productStatus" min-width="110" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="销售门店数" prop="storeNum" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">
              <span class="store-count">{{ formatNumber(row.storeNum, 0) }}</span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="ABC类别" align="center">
          <el-table-column label="销售额ABC类别-本期" prop="currentSalesAbc" min-width="150" align="center" sortable="custom" />
          <el-table-column label="销售额ABC类别-对比日期" prop="compareSalesAbc" min-width="160" align="center" sortable="custom" />
        </el-table-column>

        <el-table-column label="毛利额类别" align="center">
          <el-table-column label="毛利额ABC类别-本期" prop="currentGrossAbc" min-width="150" align="center" sortable="custom" />
          <el-table-column label="毛利额ABC类别-对比日期" prop="compareGrossAbc" min-width="160" align="center" sortable="custom" />
        </el-table-column>

        <el-table-column label="综合贡献类别" align="center">
          <el-table-column label="综合贡献ABC类别-本期" prop="currentContributionAbc" min-width="160" align="center" sortable="custom" />
          <el-table-column label="综合贡献ABC类别-对比日期" prop="compareContributionAbc" min-width="170" align="center" sortable="custom" />
        </el-table-column>

        <el-table-column label="毛利贡献率角色" align="center">
          <el-table-column label="毛利贡献率角色-本期" prop="currentContributionRole" min-width="150" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="毛利贡献率角色-对比日期" prop="compareContributionRole" min-width="160" align="left" sortable="custom" show-overflow-tooltip />
        </el-table-column>

        <el-table-column label="GMROI角色" align="center">
          <el-table-column label="GMROI角色-本期" prop="currentGmroiRole" min-width="130" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="GMROI角色-对比日期" prop="compareGmroiRole" min-width="140" align="left" sortable="custom" show-overflow-tooltip />
        </el-table-column>

        <el-table-column label="销售指标" align="center">
          <el-table-column label="销售量-总计" prop="saleQuantity" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantity, 2) }}</template>
          </el-table-column>
          <el-table-column label="销售量-PSD" prop="saleQuantityPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd, 4) }}</template>
          </el-table-column>
          <el-table-column label="销售额-总计" prop="sales" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.sales, 2) }}</template>
          </el-table-column>
          <el-table-column label="销售额-占比" prop="salesPer" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
          </el-table-column>
          <el-table-column label="销售额-PSD" prop="salesPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.salesPsd, 4) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-总计" prop="gross" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.gross, 2) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-对比增长" prop="grossGrowth" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossGrowth) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-占比" prop="grossPer" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-PSD" prop="grossPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.grossPsd, 4) }}</template>
          </el-table-column>
          <el-table-column label="毛利率-总计" prop="grossRate" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
          </el-table-column>
          <el-table-column label="毛利率-对比增长" prop="grossRateGrowth" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossRateGrowth) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="库存指标" align="center">
          <el-table-column label="当前库存数量" prop="stockQuantity" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.stockQuantity, 2) }}</template>
          </el-table-column>
          <el-table-column label="库存周转率" prop="turnoverRate" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.turnoverRate, 4) }}</template>
          </el-table-column>
          <el-table-column label="库存周转天数" prop="turnoverDays" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.turnoverDays, 4) }}</template>
          </el-table-column>
          <el-table-column label="库销比" prop="stockSalesRate" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.stockSalesRate, 2) }}</template>
          </el-table-column>
          <el-table-column label="毛利贡献率" prop="contributionRate" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.contributionRate) }}</template>
          </el-table-column>
          <el-table-column label="GMROI" prop="gmroi" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.gmroi, 4) }}</template>
          </el-table-column>
          <el-table-column label="销售率" prop="salesRate" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.salesRate) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="其他信息" align="center">
          <el-table-column label="本期促销SKU" prop="activitySku" min-width="110" align="center" sortable="custom" />
          <el-table-column label="首次销售日期" prop="firstSaleDate" min-width="130" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="本期新品" prop="newProduct" min-width="100" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="重点商品" prop="keyProduct" min-width="100" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="季节性商品" prop="seasonableFlagName" min-width="110" align="left" sortable="custom" show-overflow-tooltip />
          <el-table-column label="商品标签" prop="productTags" min-width="160" align="left" sortable="custom" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="tag-list">
                <span v-for="(tag, index) in normalizeTags(row.productTags)" :key="`${tag}-${index}`" class="tag-chip">
                  <i class="tag-dot" :class="tagColorClass(index)" />
                  <span>{{ tag }}</span>
                </span>
                <span v-if="normalizeTags(row.productTags).length === 0">--</span>
              </div>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="操作" min-width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openProcessDialog(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
        />
      </div>
    </el-card>

    <el-dialog v-model="modelDialogVisible" title="淘汰模型设置" width="760px" destroy-on-close>
      <div class="dialog-section-title">淘汰选品范围</div>
      <el-form :model="modelForm" label-width="128px" class="dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="商品状态">
              <el-select v-model="modelForm.productStatusList" multiple clearable placeholder="请选择" style="width: 100%">
                <el-option v-for="item in statusOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="首次销售日期早于">
              <el-date-picker v-model="modelForm.firstSaleDateBefore" type="date" placeholder="请选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排除商品">
              <el-select v-model="modelForm.excludeGoods" clearable placeholder="请选择" style="width: 100%">
                <el-option label="无" value="" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最多淘汰商品个数">
              <el-input-number v-model="modelForm.maxRemoveCount" :min="0" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="dialog-section-title logic-title">淘汰选品逻辑</div>
        <el-checkbox-group v-model="modelForm.logicDimensions" class="logic-group">
          <el-checkbox label="ABC维度" />
          <el-checkbox label="毛利贡献率维度" />
          <el-checkbox label="毛利回报率维度" />
          <el-checkbox label="用户需求维度" />
        </el-checkbox-group>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleResetModel">重置</el-button>
          <el-button type="primary" @click="handleConfirmModel">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="processDialogVisible" title="商品处理" width="520px" destroy-on-close>
      <div class="process-tip">选中商品的销售门店需按照以下要求进行处理!</div>
      <el-form :model="processForm" label-width="110px" class="dialog-form">
        <el-form-item label="处理方案">
          <el-select v-model="processForm.plan" clearable placeholder="请选择处理方案" style="width: 100%">
            <el-option label="下架淘汰" value="remove" />
            <el-option label="观察调整" value="observe" />
            <el-option label="保留跟踪" value="retain" />
          </el-select>
        </el-form-item>
        <el-form-item label="门店需完成日期">
          <el-date-picker v-model="processForm.finishDate" type="date" placeholder="请选择日期" style="width: 100%" />
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
import { getCategoryFilterOptions } from '@/api/category/tree';
import type { OptionVO } from '@/api/category/tree/types';

type SortOrder = 'ascending' | 'descending' | null;

interface RemoveGoodsRow {
  productNo?: string;
  productName?: string;
  handleStatus?: string;
  productStatus?: string;
  storeNum?: number;
  currentSalesAbc?: string;
  compareSalesAbc?: string;
  currentGrossAbc?: string;
  compareGrossAbc?: string;
  currentContributionAbc?: string;
  compareContributionAbc?: string;
  currentContributionRole?: string;
  compareContributionRole?: string;
  currentGmroiRole?: string;
  compareGmroiRole?: string;
  saleQuantity?: number;
  saleQuantityPsd?: number;
  sales?: number;
  salesPer?: number;
  salesPsd?: number;
  gross?: number;
  grossGrowth?: number;
  grossPer?: number;
  grossPsd?: number;
  grossRate?: number;
  grossRateGrowth?: number;
  stockQuantity?: number;
  turnoverRate?: number;
  turnoverDays?: number;
  stockSalesRate?: number;
  contributionRate?: number;
  gmroi?: number;
  salesRate?: number;
  activitySku?: number;
  firstSaleDate?: string;
  newProduct?: string;
  keyProduct?: string;
  seasonableFlagName?: string;
  productTags?: string[] | string;
}

const tableRows = ref<RemoveGoodsRow[]>([]);
const statusOptions = ref<OptionVO[]>([]);
const modelDialogVisible = ref(false);
const processDialogVisible = ref(false);

const sortState = reactive<{ prop: string; order: SortOrder }>({
  prop: 'sales',
  order: 'descending'
});

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const initialModelForm = () => ({
  productStatusList: [] as string[],
  firstSaleDateBefore: '',
  excludeGoods: '',
  maxRemoveCount: undefined as number | undefined,
  logicDimensions: ['ABC维度', '毛利贡献率维度', '毛利回报率维度'] as string[]
});

const modelForm = reactive(initialModelForm());

const processForm = reactive({
  plan: '',
  finishDate: '',
  row: null as RemoveGoodsRow | null
});

const getSortValue = (row: RemoveGoodsRow, prop: string) => (row as Record<string, unknown>)[prop];

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

const loadStatusOptions = async () => {
  const res: any = await getCategoryFilterOptions();
  statusOptions.value = Array.isArray(res?.classSalesStatusNo)
    ? res.classSalesStatusNo.map((item: any) => ({
        label: String(item.label || item.value || ''),
        value: String(item.value || '')
      }))
    : [];
};

const handleSortChange = ({ prop, order }: { prop: string; order: Sort['order'] }) => {
  sortState.prop = prop || 'sales';
  sortState.order = (order as SortOrder) || 'descending';
};

const normalizeTags = (value: string[] | string | undefined) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const tagColorClass = (index: number) => ['is-teal', 'is-orange', 'is-violet', 'is-rose'][index % 4];

const openProcessDialog = (row: RemoveGoodsRow) => {
  processForm.row = row;
  processForm.plan = '';
  processForm.finishDate = '';
  processDialogVisible.value = true;
};

const handleResetModel = () => {
  Object.assign(modelForm, initialModelForm());
};

const handleConfirmModel = () => {
  modelDialogVisible.value = false;
  ElMessage.success('淘汰模型设置已暂存');
};

const handleSaveProcess = () => {
  processDialogVisible.value = false;
  ElMessage.success('商品处理已暂存');
};

const handleDispatchProcess = () => {
  processDialogVisible.value = false;
  ElMessage.success('商品处理已下发');
};

const handleExport = () => {
  ElMessage.info('导出功能待接入真实接口');
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
  if (!Number.isFinite(num)) return '--';
  const actual = Math.abs(num) <= 1 ? num * 100 : num;
  return `${actual.toFixed(2)}%`;
};

onMounted(async () => {
  await loadStatusOptions();
});
</script>

<style scoped lang="scss">
.remove-goods-page {
  min-height: 100%;
}

.page-card {
  border: 1px solid #dbe4f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  color: #0f172a;
  font-size: 22px;
  font-weight: 700;
}

.dimension-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.dimension-tag {
  border-radius: 999px;
  padding: 6px 14px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  font-size: 13px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.tip-alert {
  margin-bottom: 14px;
}

.table-title {
  margin-bottom: 12px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
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

.goods-table :deep(.cell) {
  font-size: 13px;
}

.goods-table :deep(.el-table__body td) {
  color: #334155;
}

.goods-table :deep(.el-table__body tr:hover > td) {
  background: #f6fbff;
}

.store-count {
  color: #0f9f9a;
  font-weight: 700;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 12px;
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tag-dot.is-teal {
  background: #14b8a6;
}

.tag-dot.is-orange {
  background: #f59e0b;
}

.tag-dot.is-violet {
  background: #8b5cf6;
}

.tag-dot.is-rose {
  background: #f43f5e;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-section-title {
  margin-bottom: 14px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.logic-title {
  margin-top: 6px;
}

.dialog-form {
  padding-top: 4px;
}

.logic-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.process-tip {
  margin-bottom: 16px;
  border-radius: 10px;
  padding: 10px 14px;
  background: rgba(34, 197, 94, 0.08);
  color: #16a34a;
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
