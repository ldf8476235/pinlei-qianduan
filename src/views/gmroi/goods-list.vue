<template>
  <div class="p-2 gmroi-goods-list-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="summary-line">数据日期:2024/10/01至2024/12/08 ｜ 对比日期:2023/10/01至2023/12/08</div>
      <div class="summary-line">组织: 华南大区 ｜ 业态: 标准店 ｜ 门店: 全部门店</div>

      <div class="filter-header">
        <div class="filter-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">004洗化部（一级品类）</span>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">*金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出 Excel</el-button>
        </div>
      </div>

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="当前状态">
          <el-select v-model="queryForm.statusList" multiple collapse-tags collapse-tags-tooltip clearable style="width: 220px" @change="handleStatusChange">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-select v-model="queryForm.currentQuadrant" clearable style="width: 170px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="成功商品" value="success" />
            <el-option label="沉睡商品" value="sleeping" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比日期四象限">
          <el-select v-model="queryForm.compareQuadrant" clearable style="width: 170px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="成功商品" value="success" />
            <el-option label="沉睡商品" value="sleeping" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="gmroi-checkbox-row">
        <span class="checkbox-label">GMROI区间</span>
        <el-checkbox-group v-model="queryForm.gmroiRanges" @change="handleRangeChange">
          <el-checkbox v-for="item in gmroiRangeOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类GMROI商品清单</span>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="tableRows" border stripe class="goods-table" height="560">
        <el-table-column label="基础属性" align="center">
          <el-table-column label="商品编码" prop="goodsCode" min-width="120" fixed="left" align="left" sortable show-overflow-tooltip />
          <el-table-column label="商品名称" prop="goodsName" min-width="220" fixed="left" align="left" sortable show-overflow-tooltip />
          <el-table-column label="当前状态" prop="statusLabel" min-width="110" align="left" sortable show-overflow-tooltip />
          <el-table-column label="销售门店数" min-width="110" align="right" sortable :sort-method="sortNumber('storeCount')">
            <template #header>
              <el-tooltip content="商品在本期有销售记录的门店数量" placement="top">
                <span>销售门店数</span>
              </el-tooltip>
            </template>
            <template #default="{ row }">{{ formatNumber(row.storeCount, 0) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="GMROI与销售业绩" align="center">
          <el-table-column label="GMROI角色(本期)" min-width="140" align="left">
            <template #header>
              <el-tooltip content="商品在本期所处的GMROI经营象限" placement="top">
                <span>GMROI角色(本期)</span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <span :class="['role-text', `is-${row.currentQuadrant}`]">{{ row.currentQuadrantLabel || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="GMROI角色(对比日期)" min-width="160" align="left">
            <template #header>
              <el-tooltip content="商品在对比日期所处的GMROI经营象限" placement="top">
                <span>GMROI角色(对比日期)</span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <span :class="['role-text', `is-${row.compareQuadrant}`]">{{ row.compareQuadrantLabel || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售量(总计)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQuantityTotal')">
            <template #default="{ row }">{{ formatNumber(row.saleQuantityTotal, 0) }}</template>
          </el-table-column>
          <el-table-column label="销售量(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQuantityPsd')">
            <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
          </el-table-column>
          <el-table-column label="销售额(总计)" min-width="130" align="right" sortable :sort-method="sortNumber('salesAmountTotal')">
            <template #default="{ row }">{{ formatNumber(row.salesAmountTotal) }}</template>
          </el-table-column>
          <el-table-column label="销售额(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountShare')">
            <template #default="{ row }">{{ formatPercent(row.salesAmountShare) }}</template>
          </el-table-column>
          <el-table-column label="销售额(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountPsd')">
            <template #default="{ row }">{{ formatNumber(row.salesAmountPsd) }}</template>
          </el-table-column>
          <el-table-column label="毛利额(总计)" min-width="130" align="right" sortable :sort-method="sortNumber('grossAmountTotal')">
            <template #default="{ row }">{{ formatNumber(row.grossAmountTotal) }}</template>
          </el-table-column>
          <el-table-column label="毛利额(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountShare')">
            <template #default="{ row }">{{ formatPercent(row.grossAmountShare) }}</template>
          </el-table-column>
          <el-table-column label="毛利额(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountPsd')">
            <template #default="{ row }">{{ formatNumber(row.grossAmountPsd) }}</template>
          </el-table-column>
          <el-table-column label="毛利率" min-width="100" align="right" sortable :sort-method="sortNumber('grossRate')">
            <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
          </el-table-column>
          <el-table-column label="当前库存数量" min-width="120" align="right" sortable :sort-method="sortNumber('inventoryQty')">
            <template #default="{ row }">{{ formatNumber(row.inventoryQty, 0) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="库存&经营分析" align="center">
          <el-table-column label="PSD" min-width="100" align="right" sortable :sort-method="sortNumber('psd')">
            <template #default="{ row }">{{ formatNumber(row.psd) }}</template>
          </el-table-column>
          <el-table-column label="库存周转率" min-width="120" align="right" sortable :sort-method="sortNumber('turnoverRate')">
            <template #default="{ row }">{{ formatNumber(row.turnoverRate) }}</template>
          </el-table-column>
          <el-table-column label="库存周转天数" min-width="130" align="right" sortable :sort-method="sortNumber('turnoverDays')">
            <template #default="{ row }">{{ formatNumber(row.turnoverDays) }}</template>
          </el-table-column>
          <el-table-column label="库销比" min-width="100" align="right" sortable :sort-method="sortNumber('inventorySalesRatio')">
            <template #default="{ row }">{{ formatNumber(row.inventorySalesRatio) }}</template>
          </el-table-column>
          <el-table-column label="毛利贡献率" min-width="120" align="right" sortable :sort-method="sortNumber('grossContributionRate')">
            <template #default="{ row }">{{ formatPercent(row.grossContributionRate) }}</template>
          </el-table-column>
          <el-table-column label="GMROI" min-width="100" align="right" sortable :sort-method="sortNumber('gmroi')">
            <template #default="{ row }">{{ formatNumber(row.gmroi) }}</template>
          </el-table-column>
          <el-table-column label="销售率" min-width="100" align="right" sortable :sort-method="sortNumber('sellThroughRate')">
            <template #default="{ row }">{{ formatPercent(row.sellThroughRate) }}</template>
          </el-table-column>
          <el-table-column label="本期促销" min-width="100" align="left" show-overflow-tooltip>
            <template #default="{ row }">{{ row.promotionLabel || '-' }}</template>
          </el-table-column>
          <el-table-column label="首次销售日期" min-width="130" align="left" sortable show-overflow-tooltip prop="firstSaleDate" />
          <el-table-column label="本期新品" min-width="100" align="left" show-overflow-tooltip>
            <template #default="{ row }">{{ row.newProductLabel || '-' }}</template>
          </el-table-column>
          <el-table-column label="重点商品" min-width="100" align="left" show-overflow-tooltip>
            <template #default="{ row }">{{ row.keyProductLabel || '-' }}</template>
          </el-table-column>
          <el-table-column label="季节性商品" min-width="110" align="left" show-overflow-tooltip>
            <template #default="{ row }">{{ row.seasonalLabel || '-' }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="操作" width="92" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleProcess(row)">处理</el-button>
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
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup name="GmroiGoodsList" lang="ts">
interface GoodsRow {
  goodsCode: string;
  goodsName: string;
  status: string;
  statusLabel: string;
  currentQuadrant: string;
  currentQuadrantLabel: string;
  compareQuadrant: string;
  compareQuadrantLabel: string;
  storeCount: number;
  saleQuantityTotal: number;
  saleQuantityPsd: number;
  salesAmountTotal: number;
  salesAmountShare: number;
  salesAmountPsd: number;
  grossAmountTotal: number;
  grossAmountShare: number;
  grossAmountPsd: number;
  grossRate: number;
  inventoryQty: number;
  psd: number;
  turnoverRate: number;
  turnoverDays: number;
  inventorySalesRatio: number;
  grossContributionRate: number;
  gmroi: number;
  sellThroughRate: number;
  promotion: string;
  promotionLabel: string;
  firstSaleDate: string;
  newProductLabel: string;
  keyProductLabel: string;
  seasonalLabel: string;
}

interface QueryForm {
  statusList: string[];
  promotion: string;
  currentQuadrant: string;
  compareQuadrant: string;
  gmroiRanges: string[];
  pageNum: number;
  pageSize: number;
}

const allRangeValue = 'all';

const statusOptions = [
  { label: '正常', value: 'normal' },
  { label: '观察', value: 'observe' },
  { label: '待优化', value: 'optimize' }
];

const gmroiRangeOptions = [
  { label: '全部', value: allRangeValue },
  { label: 'GMROI<=1', value: 'lte1' },
  { label: '1<GMROI<=2', value: 'between1and2' },
  { label: '2<GMROI<=3', value: 'between2and3' },
  { label: 'GMROI>3', value: 'gt3' }
];

const initialQueryForm = (): QueryForm => ({
  statusList: ['normal', 'observe'],
  promotion: '',
  currentQuadrant: '',
  compareQuadrant: '',
  gmroiRanges: [allRangeValue],
  pageNum: 1,
  pageSize: 10
});

const queryForm = reactive<QueryForm>(initialQueryForm());
const tableLoading = ref(false);
const total = ref(0);
const tableRows = ref<GoodsRow[]>([]);

const mockRows: GoodsRow[] = [
  {
    goodsCode: '690323450011',
    goodsName: '柔顺洗发露 750ml',
    status: 'normal',
    statusLabel: '正常',
    currentQuadrant: 'success',
    currentQuadrantLabel: '成功商品',
    compareQuadrant: 'success',
    compareQuadrantLabel: '成功商品',
    storeCount: 58,
    saleQuantityTotal: 1520,
    saleQuantityPsd: 8.12,
    salesAmountTotal: 86240,
    salesAmountShare: 14.2,
    salesAmountPsd: 460.11,
    grossAmountTotal: 32771,
    grossAmountShare: 16.85,
    grossAmountPsd: 174.98,
    grossRate: 36.0,
    inventoryQty: 420,
    psd: 4.26,
    turnoverRate: 3.8,
    turnoverDays: 27.6,
    inventorySalesRatio: 0.88,
    grossContributionRate: 11.36,
    gmroi: 3.42,
    sellThroughRate: 82.4,
    promotion: 'Y',
    promotionLabel: '是',
    firstSaleDate: '2024-01-15',
    newProductLabel: '否',
    keyProductLabel: '是',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690323450022',
    goodsName: '抑菌洗手液 300ml',
    status: 'observe',
    statusLabel: '观察',
    currentQuadrant: 'sleeping',
    currentQuadrantLabel: '沉睡商品',
    compareQuadrant: 'success',
    compareQuadrantLabel: '成功商品',
    storeCount: 47,
    saleQuantityTotal: 1096,
    saleQuantityPsd: 5.84,
    salesAmountTotal: 64820,
    salesAmountShare: 11.8,
    salesAmountPsd: 345.56,
    grossAmountTotal: 18150,
    grossAmountShare: 9.33,
    grossAmountPsd: 96.81,
    grossRate: 28.0,
    inventoryQty: 510,
    psd: 2.88,
    turnoverRate: 1.4,
    turnoverDays: 43.8,
    inventorySalesRatio: 1.24,
    grossContributionRate: 6.29,
    gmroi: 1.86,
    sellThroughRate: 67.2,
    promotion: 'N',
    promotionLabel: '否',
    firstSaleDate: '2023-10-08',
    newProductLabel: '否',
    keyProductLabel: '否',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690323450033',
    goodsName: '便携湿巾 8片装',
    status: 'normal',
    statusLabel: '正常',
    currentQuadrant: 'attracting',
    currentQuadrantLabel: '吸客商品',
    compareQuadrant: 'attracting',
    compareQuadrantLabel: '吸客商品',
    storeCount: 56,
    saleQuantityTotal: 1250,
    saleQuantityPsd: 6.98,
    salesAmountTotal: 31800,
    salesAmountShare: 3.7,
    salesAmountPsd: 177.65,
    grossAmountTotal: 4770,
    grossAmountShare: 2.45,
    grossAmountPsd: 26.65,
    grossRate: 15.0,
    inventoryQty: 860,
    psd: 4.8,
    turnoverRate: 3.2,
    turnoverDays: 54.9,
    inventorySalesRatio: 1.37,
    grossContributionRate: 1.65,
    gmroi: 1.27,
    sellThroughRate: 58.5,
    promotion: 'Y',
    promotionLabel: '是',
    firstSaleDate: '2023-12-01',
    newProductLabel: '否',
    keyProductLabel: '是',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690323450044',
    goodsName: '家用清洁喷雾 600ml',
    status: 'optimize',
    statusLabel: '待优化',
    currentQuadrant: 'problem',
    currentQuadrantLabel: '问题商品',
    compareQuadrant: 'sleeping',
    compareQuadrantLabel: '沉睡商品',
    storeCount: 19,
    saleQuantityTotal: 166,
    saleQuantityPsd: 0.88,
    salesAmountTotal: 9360,
    salesAmountShare: 2.4,
    salesAmountPsd: 49.79,
    grossAmountTotal: 1030,
    grossAmountShare: 0.53,
    grossAmountPsd: 5.48,
    grossRate: 11.0,
    inventoryQty: 680,
    psd: 3.62,
    turnoverRate: 0.9,
    turnoverDays: 93.1,
    inventorySalesRatio: 2.74,
    grossContributionRate: 0.36,
    gmroi: 0.42,
    sellThroughRate: 31.4,
    promotion: 'N',
    promotionLabel: '否',
    firstSaleDate: '2022-08-09',
    newProductLabel: '否',
    keyProductLabel: '否',
    seasonalLabel: '是'
  },
  {
    goodsCode: '690323450055',
    goodsName: '香氛洗衣液 1kg',
    status: 'normal',
    statusLabel: '正常',
    currentQuadrant: 'success',
    currentQuadrantLabel: '成功商品',
    compareQuadrant: 'sleeping',
    compareQuadrantLabel: '沉睡商品',
    storeCount: 36,
    saleQuantityTotal: 518,
    saleQuantityPsd: 2.76,
    salesAmountTotal: 35260,
    salesAmountShare: 6.2,
    salesAmountPsd: 187.71,
    grossAmountTotal: 11283,
    grossAmountShare: 5.80,
    grossAmountPsd: 60.07,
    grossRate: 32.0,
    inventoryQty: 280,
    psd: 1.49,
    turnoverRate: 2.95,
    turnoverDays: 33.9,
    inventorySalesRatio: 0.96,
    grossContributionRate: 3.92,
    gmroi: 2.41,
    sellThroughRate: 74.8,
    promotion: 'Y',
    promotionLabel: '是',
    firstSaleDate: '2024-03-11',
    newProductLabel: '是',
    keyProductLabel: '否',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690323450066',
    goodsName: '天然香皂 120g',
    status: 'observe',
    statusLabel: '观察',
    currentQuadrant: 'sleeping',
    currentQuadrantLabel: '沉睡商品',
    compareQuadrant: 'problem',
    compareQuadrantLabel: '问题商品',
    storeCount: 28,
    saleQuantityTotal: 362,
    saleQuantityPsd: 1.93,
    salesAmountTotal: 18620,
    salesAmountShare: 2.9,
    salesAmountPsd: 99.23,
    grossAmountTotal: 7060,
    grossAmountShare: 3.62,
    grossAmountPsd: 37.61,
    grossRate: 37.92,
    inventoryQty: 340,
    psd: 1.81,
    turnoverRate: 2.02,
    turnoverDays: 49.5,
    inventorySalesRatio: 1.12,
    grossContributionRate: 2.45,
    gmroi: 2.08,
    sellThroughRate: 61.7,
    promotion: 'N',
    promotionLabel: '否',
    firstSaleDate: '2024-02-28',
    newProductLabel: '是',
    keyProductLabel: '否',
    seasonalLabel: '否'
  }
];

const getGMROIDetailList = async () => {
  tableLoading.value = true;
  try {
    // TODO: replace with real backend request for GMROI detail list.
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const statusSet = queryForm.statusList.length ? new Set(queryForm.statusList) : null;
    const ranges = queryForm.gmroiRanges.includes(allRangeValue) ? [] : queryForm.gmroiRanges;
    const filtered = mockRows.filter((item) => {
      const matchStatus = !statusSet || statusSet.has(item.status);
      const matchPromotion = !queryForm.promotion || item.promotion === queryForm.promotion;
      const matchCurrent = !queryForm.currentQuadrant || item.currentQuadrant === queryForm.currentQuadrant;
      const matchCompare = !queryForm.compareQuadrant || item.compareQuadrant === queryForm.compareQuadrant;
      const matchRange =
        !ranges.length ||
        ranges.some((range) => {
          if (range === 'lte1') return item.gmroi <= 1;
          if (range === 'between1and2') return item.gmroi > 1 && item.gmroi <= 2;
          if (range === 'between2and3') return item.gmroi > 2 && item.gmroi <= 3;
          if (range === 'gt3') return item.gmroi > 3;
          return true;
        });
      return matchStatus && matchPromotion && matchCurrent && matchCompare && matchRange;
    });
    total.value = filtered.length;
    const start = (queryForm.pageNum - 1) * queryForm.pageSize;
    const end = start + queryForm.pageSize;
    tableRows.value = filtered.slice(start, end);
  } finally {
    tableLoading.value = false;
  }
};

const handleQuery = async () => {
  queryForm.pageNum = 1;
  await getGMROIDetailList();
};

const handlePageChange = async () => {
  await getGMROIDetailList();
};

const handleReset = async () => {
  Object.assign(queryForm, initialQueryForm());
  await getGMROIDetailList();
};

const handleStatusChange = async (value: string[]) => {
  if (!value.length) {
    queryForm.statusList = [];
  }
  await handleQuery();
};

const handleRangeChange = async (value: string[]) => {
  if (!value.length) {
    queryForm.gmroiRanges = [allRangeValue];
  } else if (value.includes(allRangeValue) && value.length > 1) {
    queryForm.gmroiRanges = [allRangeValue];
  } else if (!value.includes(allRangeValue) && value.length === gmroiRangeOptions.length - 1) {
    queryForm.gmroiRanges = [allRangeValue];
  }
  await handleQuery();
};

const handleExport = () => {
  // TODO: replace with RuoYi native download integration after backend API is ready.
  ElMessage.info('导出入口已预留，后续可直接接若依原生导出逻辑');
};

const handleProcess = (row: GoodsRow) => {
  ElMessage.info(`处理入口已预留：${row.goodsName}`);
};

const sortNumber = (field: keyof GoodsRow) => {
  return (a: GoodsRow, b: GoodsRow) => Number(a[field] || 0) - Number(b[field] || 0);
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
  return `${num.toFixed(2)}%`;
};

onMounted(async () => {
  await getGMROIDetailList();
});
</script>

<style scoped lang="scss">
.gmroi-goods-list-page {
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

.summary-line {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
}

.filter-header,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.filter-header-left {
  display: flex;
  align-items: center;
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

.gmroi-checkbox-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.checkbox-label {
  font-size: 14px;
  color: var(--el-text-color-primary);
  min-width: 70px;
}

.goods-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.goods-table :deep(.cell) {
  font-size: 13px;
}

.goods-table :deep(.el-table__body td) {
  color: var(--el-text-color-regular);
}

.role-text {
  font-weight: 600;
}

.role-text.is-success {
  color: #27b0d6;
}

.role-text.is-sleeping {
  color: #f06b4f;
}

.role-text.is-attracting {
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
