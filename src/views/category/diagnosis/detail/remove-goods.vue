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
      <el-alert v-if="loadError" type="error" :closable="false" class="tip-alert" :title="loadError" />

      <div class="table-title">建议淘汰商品清单</div>

      <el-table
        v-loading="loading"
        :data="tableRows"
        border
        stripe
        class="goods-table"
        empty-text="暂无建议淘汰商品数据"
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
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="modelDialogVisible"
      class="obsolescence-model-dialog"
      width="1040px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <template #header>
        <div class="model-dialog-header">
          <div class="model-dialog-title">淘汰模型设置</div>
          <el-button class="dialog-close-btn" text :icon="Close" @click="modelDialogVisible = false" />
        </div>
      </template>

      <div class="model-dialog-body">
        <div class="model-section">
          <div class="section-title">
            <span class="section-bar" />
            <span>淘汰选品范围</span>
          </div>

          <div class="range-grid">
            <div class="field-block">
              <div class="field-label required">商品状态</div>
              <div class="select-with-badge">
                <el-select v-model="modelForm.productStatus" class="control-full" popper-class="model-popper">
                  <el-option v-for="item in modelStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <span class="select-badge">+2</span>
              </div>
            </div>

            <div class="field-block">
              <div class="field-label">首次销售日期早于</div>
              <el-date-picker
                v-model="modelForm.firstSaleDateBefore"
                class="control-full"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                :prefix-icon="Calendar"
              />
            </div>

            <div class="field-block">
              <div class="field-label">排除商品</div>
              <el-select v-model="modelForm.excludeGoods" class="control-full" placeholder="请选择状态" popper-class="model-popper">
                <el-option v-for="item in excludeGoodsOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <div class="field-block">
              <div class="field-label required">
                <span>最多淘汰商品个数</span>
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </div>
              <el-input-number
                v-model="modelForm.maxRemoveCount"
                class="control-number"
                :min="0"
                :step="1"
                controls-position="right"
              />
            </div>
          </div>
        </div>

        <div class="model-section logic-section">
          <div class="section-title">
            <span class="section-bar" />
            <span>淘汰选品逻辑</span>
          </div>

          <div class="logic-stack">
            <div class="logic-card" :class="{ 'is-disabled': !modelForm.abcEnabled }">
              <div class="logic-head">
                <el-checkbox v-model="modelForm.abcEnabled">ABC维度</el-checkbox>
              </div>
              <div class="logic-fields">
                <div class="logic-field">
                  <div class="field-label required">ABC类型</div>
                  <el-select v-model="modelForm.abcType" class="control-full" :disabled="!modelForm.abcEnabled">
                    <el-option v-for="item in abcTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label required">本期类别</div>
                  <el-select v-model="modelForm.currentAbc" class="control-full" :disabled="!modelForm.abcEnabled">
                    <el-option v-for="item in abcLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label required">对比日期类别</div>
                  <el-select v-model="modelForm.compareAbc" class="control-full" :disabled="!modelForm.abcEnabled">
                    <el-option v-for="item in abcLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
            </div>

            <div class="logic-card" :class="{ 'is-disabled': !modelForm.grossContributionEnabled }">
              <div class="logic-head">
                <el-checkbox v-model="modelForm.grossContributionEnabled">毛利贡献率维度</el-checkbox>
              </div>
              <div class="logic-fields logic-fields-two">
                <div class="logic-field">
                  <div class="field-label required">本期角色</div>
                  <el-select v-model="modelForm.currentGrossRole" class="control-full" :disabled="!modelForm.grossContributionEnabled">
                    <el-option v-for="item in grossRoleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label required">对比日期角色</div>
                  <el-select v-model="modelForm.compareGrossRole" class="control-full" :disabled="!modelForm.grossContributionEnabled">
                    <el-option v-for="item in grossRoleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
            </div>

            <div class="logic-card" :class="{ 'is-disabled': !modelForm.grossReturnEnabled }">
              <div class="logic-head">
                <el-checkbox v-model="modelForm.grossReturnEnabled">毛利回报率维度</el-checkbox>
              </div>
              <div class="logic-fields logic-fields-two">
                <div class="logic-field">
                  <div class="field-label required">本期角色</div>
                  <el-select v-model="modelForm.currentGmroiRole" class="control-full" :disabled="!modelForm.grossReturnEnabled">
                    <el-option v-for="item in gmroiRoleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label required">对比日期角色</div>
                  <el-select v-model="modelForm.compareGmroiRole" class="control-full" :disabled="!modelForm.grossReturnEnabled">
                    <el-option v-for="item in gmroiRoleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
            </div>

            <div class="logic-card user-demand-card" :class="{ 'is-disabled': !modelForm.userDemandEnabled }">
              <div class="logic-head">
                <el-checkbox v-model="modelForm.userDemandEnabled">用户需求维度</el-checkbox>
                <el-tooltip content="选择此维度后，价格区间、品牌、规格、标签中至少选择一组，否则无法提交。" placement="top">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="logic-hint" :class="{ 'is-error': modelForm.userDemandEnabled }">
                选择此维度，则四组需求条件中至少已选择一组，否则无法提交。
              </div>
              <div class="logic-fields user-demand-fields">
                <div class="logic-field">
                  <div class="field-label">所属价格区间</div>
                  <el-select
                    v-model="modelForm.priceBandList"
                    class="control-full"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    clearable
                    filterable
                    placeholder="请选择所属价格区间"
                    :disabled="!modelForm.userDemandEnabled"
                  >
                    <el-option v-for="item in priceBandOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label">所属品牌</div>
                  <el-select
                    v-model="modelForm.brandList"
                    class="control-full"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    clearable
                    filterable
                    placeholder="请选择所属品牌"
                    :disabled="!modelForm.userDemandEnabled"
                  >
                    <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label">所属规格</div>
                  <el-select
                    v-model="modelForm.specList"
                    class="control-full"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    clearable
                    filterable
                    placeholder="请选择所属规格"
                    :disabled="!modelForm.userDemandEnabled"
                  >
                    <el-option v-for="item in specOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label">所属标签</div>
                  <el-select
                    v-model="modelForm.tagType"
                    class="control-full"
                    clearable
                    filterable
                    placeholder="请选择标签类型"
                    :disabled="!modelForm.userDemandEnabled"
                    @change="handleTagTypeChange"
                  >
                    <el-option v-for="item in tagTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
                <div class="logic-field">
                  <div class="field-label">标签明细</div>
                  <el-select
                    v-model="modelForm.tagList"
                    class="control-full"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    clearable
                    filterable
                    placeholder="请选择标签"
                    :disabled="!modelForm.userDemandEnabled || !modelForm.tagType"
                  >
                    <el-option v-for="item in currentTagOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="secondary-action" @click="handleResetModel">重置</el-button>
          <el-button class="primary-action" type="primary" @click="handleConfirmModel">确定</el-button>
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
import { Calendar, Close, QuestionFilled } from '@element-plus/icons-vue';
import { getBrandFilterOptions, getPriceBandRangeSummary, getSpecFilterOptions, getTagTypes } from '@/api/category/diagnosis/analysis';
import { queryObsoleteGoodsList } from '@/api/category/diagnosis/detail';
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
const priceBandOptions = ref<OptionVO[]>([]);
const brandOptions = ref<OptionVO[]>([]);
const specOptions = ref<OptionVO[]>([]);
const tagTypeOptions = ref<OptionVO[]>([]);
const tagOptionMap = ref<Record<string, OptionVO[]>>({});
const route = useRoute();
const loading = ref(false);
const loadError = ref('');
const modelDialogVisible = ref(false);
const processDialogVisible = ref(false);
const modelStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '上架', value: 'on' },
  { label: '下架', value: 'off' }
];
const excludeGoodsOptions = [
  { label: '请选择状态', value: '' },
  { label: '已淘汰商品', value: 'removed' },
  { label: '待处理商品', value: 'pending' }
];
const abcTypeOptions = [{ label: '销售额ABC', value: 'sales' }];
const abcLevelOptions = [
  { label: 'A类', value: 'A' },
  { label: 'B类', value: 'B' },
  { label: 'C类', value: 'C' }
];
const grossRoleOptions = [{ label: '问题商品(低销低毛)', value: '3' }];
const gmroiRoleOptions = [{ label: '问题商品(低毛低周转)', value: '3' }];

const sortState = reactive<{ prop: string; order: SortOrder }>({
  prop: 'sales',
  order: 'ascending'
});

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const initialModelForm = () => ({
  productStatus: 'all',
  firstSaleDateBefore: '',
  excludeGoods: '',
  maxRemoveCount: 474 as number | undefined,
  abcEnabled: true,
  abcType: 'sales',
  currentAbc: 'C',
  compareAbc: 'C',
  grossContributionEnabled: true,
  currentGrossRole: '3',
  compareGrossRole: '3',
  grossReturnEnabled: true,
  currentGmroiRole: '3',
  compareGmroiRole: '3',
  userDemandEnabled: false,
  priceBandList: [] as string[],
  brandList: [] as string[],
  specList: [] as string[],
  tagType: '',
  tagList: [] as string[]
});

const modelForm = reactive(initialModelForm());

const processForm = reactive({
  plan: '',
  finishDate: '',
  row: null as RemoveGoodsRow | null
});

const sessionId = computed(() => String(route.query.sessionId || ''));
const currentTagOptions = computed(() => tagOptionMap.value[modelForm.tagType] || []);

const loadStatusOptions = async () => {
  const res: any = await getCategoryFilterOptions();
  statusOptions.value = Array.isArray(res?.classSalesStatusNo)
    ? res.classSalesStatusNo.map((item: any) => ({
        label: String(item.label || item.value || ''),
        value: String(item.value || '')
      }))
    : [];
};

const toOption = (value: unknown, label?: unknown): OptionVO | null => {
  const optionValue = String(value ?? '').trim();
  const optionLabel = String(label ?? value ?? '').trim();
  if (!optionValue || !optionLabel) return null;
  return { value: optionValue, label: optionLabel };
};

const compactOptions = (items: Array<OptionVO | null>) => {
  const optionMap = new Map<string, OptionVO>();
  items.forEach((item) => {
    if (!item) return;
    optionMap.set(String(item.value), item);
  });
  return Array.from(optionMap.values());
};

const readPayload = (res: any) => res?.data?.data || res?.data || {};

const loadUserDemandOptions = async () => {
  if (!sessionId.value) return;
  const [priceRes, brandRes, specRes, tagRes] = await Promise.allSettled([
    getPriceBandRangeSummary(sessionId.value),
    getBrandFilterOptions(sessionId.value),
    getSpecFilterOptions(sessionId.value),
    getTagTypes(sessionId.value)
  ]);

  if (priceRes.status === 'fulfilled') {
    const payload = readPayload(priceRes.value);
    const rows = Array.isArray(payload.list) ? payload.list : [];
    priceBandOptions.value = compactOptions(rows.map((row: any) => toOption(row.priceBand, row.priceBand)));
  }

  if (brandRes.status === 'fulfilled') {
    const payload = readPayload(brandRes.value);
    const rows = Array.isArray(payload.brandList) ? payload.brandList : [];
    brandOptions.value = compactOptions(rows.map((row: any) => toOption(row.brandName || row.brandNo, row.brandName || row.brandNo)));
  }

  if (specRes.status === 'fulfilled') {
    const payload = readPayload(specRes.value);
    const rows = Array.isArray(payload.specList) ? payload.specList : [];
    specOptions.value = compactOptions(rows.map((row: any) => toOption(row.specName || row.specNo, row.specName || row.specNo)));
  }

  if (tagRes.status === 'fulfilled') {
    const rows = Array.isArray(readPayload(tagRes.value)) ? readPayload(tagRes.value) : [];
    const nextTagOptionMap: Record<string, OptionVO[]> = {};
    tagTypeOptions.value = compactOptions(
      rows.map((row: any) => {
        const tagType = String(row.tagType || '').trim();
        nextTagOptionMap[tagType] = compactOptions(
          (Array.isArray(row.tagList) ? row.tagList : []).map((tag: any) => toOption(tag.tagNo || tag.tagName, tag.tagName || tag.tagNo))
        );
        return toOption(tagType, row.tagTypeName || tagType);
      })
    );
    tagOptionMap.value = nextTagOptionMap;
  }
};

const handleSortChange = ({ prop, order }: { prop: string; order: Sort['order'] }) => {
  sortState.prop = prop || 'sales';
  sortState.order = (order as SortOrder) || 'ascending';
  pagination.pageNum = 1;
  void loadObsoleteGoods();
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
  modelDialogVisible.value = false;
  ElMessage.success('已重置为默认配置');
};

const handleConfirmModel = () => {
  if (modelForm.abcEnabled && (!modelForm.abcType || !modelForm.currentAbc || !modelForm.compareAbc)) {
    ElMessage.error('请先完善ABC维度必填项');
    return;
  }
  if (modelForm.grossContributionEnabled && (!modelForm.currentGrossRole || !modelForm.compareGrossRole)) {
    ElMessage.error('请先完善毛利贡献率维度必填项');
    return;
  }
  if (modelForm.grossReturnEnabled && (!modelForm.currentGmroiRole || !modelForm.compareGmroiRole)) {
    ElMessage.error('请先完善毛利回报率维度必填项');
    return;
  }
  if (modelForm.userDemandEnabled && !hasUserDemandSelection()) {
    ElMessage.error('用户需求维度至少选择一组价格区间、品牌、规格或标签');
    return;
  }
  modelDialogVisible.value = false;
  pagination.pageNum = 1;
  void loadObsoleteGoods();
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

const getEnabledObsoleteTypes = () => {
  const types: string[] = [];
  if (modelForm.abcEnabled) types.push('abc');
  if (modelForm.grossContributionEnabled) types.push('gross');
  if (modelForm.grossReturnEnabled) types.push('gmroi');
  if (modelForm.userDemandEnabled) types.push('userDemand');
  return types;
};

const hasUserDemandSelection = () =>
  modelForm.priceBandList.length > 0 || modelForm.brandList.length > 0 || modelForm.specList.length > 0 || modelForm.tagList.length > 0;

const handleTagTypeChange = () => {
  modelForm.tagList = [];
};

const normalizeResponseRows = (records: any[]) =>
  records.map((row) => ({
    ...row,
    handleStatus: row.dealStatusName || row.handleStatus || '未处理',
    currentContributionRole: row.currentGrossRoleName || row.currentContributionRole || row.currentGrossRole || '--',
    compareContributionRole: row.compareGrossRoleName || row.compareContributionRole || row.compareGrossRole || '--',
    currentGmroiRole: row.currentGmroiRoleName || row.currentGmroiRole || '--',
    compareGmroiRole: row.compareGmroiRoleName || row.compareGmroiRole || '--',
    activitySku: row.activitySku ?? row.activity,
    productTags: row.allTagName || row.productTags
  }));

const buildQueryPayload = () => ({
  sessionId: sessionId.value,
  productStatus: modelForm.productStatus && modelForm.productStatus !== 'all' ? [modelForm.productStatus] : [],
  firstSaleDate: modelForm.firstSaleDateBefore || '',
  obsoleteProductType: modelForm.excludeGoods ? [modelForm.excludeGoods] : [],
  obsoleteSku: modelForm.maxRemoveCount || 0,
  obsoleteType: getEnabledObsoleteTypes(),
  abcType: modelForm.abcType,
  currentAbc: modelForm.currentAbc,
  compareAbc: modelForm.compareAbc,
  currentGrossRole: modelForm.currentGrossRole,
  compareGrossRole: modelForm.compareGrossRole,
  currentGmroiRole: modelForm.currentGmroiRole,
  compareGmroiRole: modelForm.compareGmroiRole,
  priceBandList: modelForm.userDemandEnabled ? modelForm.priceBandList : [],
  brandList: modelForm.userDemandEnabled ? modelForm.brandList : [],
  specList: modelForm.userDemandEnabled ? modelForm.specList : [],
  tagType: modelForm.userDemandEnabled ? modelForm.tagType : '',
  tagList: modelForm.userDemandEnabled ? modelForm.tagList : [],
  page: pagination.pageNum,
  size: pagination.pageSize,
  order: sortState.prop || 'sales',
  orderType: sortState.order === 'descending' ? 'desc' : 'asc'
});

const loadObsoleteGoods = async () => {
  if (!sessionId.value) {
    loadError.value = '缺少 sessionId，无法加载建议淘汰商品';
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    const res: any = await queryObsoleteGoodsList(buildQueryPayload());
    const data = res?.data?.data || res?.data || {};
    const records = Array.isArray(data.records) ? data.records : [];
    tableRows.value = normalizeResponseRows(records);
    pagination.total = Number(data.total || 0);
    pagination.pageNum = Number(data.current || pagination.pageNum);
    pagination.pageSize = Number(data.size || pagination.pageSize);
  } catch (error: any) {
    tableRows.value = [];
    pagination.total = 0;
    loadError.value = error?.message || '建议淘汰商品加载失败';
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  void loadObsoleteGoods();
};

const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  void loadObsoleteGoods();
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
  await loadUserDemandOptions();
  await loadObsoleteGoods();
});

watch(
  () => route.query.sessionId,
  async () => {
    pagination.pageNum = 1;
    await loadUserDemandOptions();
    await loadObsoleteGoods();
  }
);

watch(
  () => modelForm.userDemandEnabled,
  (enabled) => {
    if (enabled) return;
    modelForm.priceBandList = [];
    modelForm.brandList = [];
    modelForm.specList = [];
    modelForm.tagType = '';
    modelForm.tagList = [];
  }
);
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
  background: rgba(249, 115, 22, 0.12);
  color: #c2410c;
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

.obsolescence-model-dialog {
  :deep(.el-dialog) {
    border-radius: 18px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 0;
  }

  :deep(.el-dialog__body) {
    max-height: calc(100vh - 190px);
    overflow-y: auto;
    padding: 0 28px 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 0 28px 28px;
  }
}

.model-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 0;
}

.model-dialog-title {
  color: #111827;
  font-size: 20px;
  font-weight: 700;
}

.dialog-close-btn {
  color: #9ca3af;
  font-size: 18px;
}

.dialog-close-btn:hover {
  color: #6b7280;
}

.model-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.model-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.section-bar {
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: #14b8a6;
}

.range-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.field-block,
.logic-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.field-label.required::before {
  color: #ef4444;
  content: '*';
  font-weight: 700;
}

.help-icon {
  color: #9ca3af;
  font-size: 14px;
}

.select-with-badge {
  position: relative;
}

.select-badge {
  position: absolute;
  top: 50%;
  right: 42px;
  color: #14b8a6;
  font-size: 12px;
  pointer-events: none;
  transform: translateY(-50%);
}

.control-full,
.control-number {
  width: 100%;
}

:deep(.control-full .el-input__wrapper),
:deep(.control-full .el-select__wrapper),
:deep(.control-number .el-input__wrapper) {
  border: 1px solid #d9e2ec;
  border-radius: 12px;
  box-shadow: none;
}

:deep(.control-full .el-input__wrapper:hover),
:deep(.control-full .el-select__wrapper:hover),
:deep(.control-number .el-input__wrapper:hover),
:deep(.control-full .el-input__wrapper.is-focus),
:deep(.control-full .el-select__wrapper.is-focused),
:deep(.control-number .el-input__wrapper.is-focus) {
  border-color: #14b8a6;
  box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.12);
}

.logic-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logic-card {
  border: 1px solid #e5eaf2;
  border-radius: 16px;
  padding: 16px 18px 18px;
  background: #fff;
}

.logic-card.is-disabled {
  background: #f8fafc;
}

.logic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.logic-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.logic-fields-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.user-demand-card {
  padding-bottom: 18px;
}

.logic-hint {
  margin: -4px 0 14px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}

.logic-hint.is-error {
  color: #ef4444;
}

.user-demand-fields {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner),
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #14b8a6;
  border-color: #14b8a6;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #111827;
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

.secondary-action {
  border-color: #d1d5db;
  color: #111827;
}

.primary-action {
  background: #14b8a6;
  border-color: #14b8a6;
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
