<template>
  <div class="tag-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">标签分析</span>
            <el-button link type="primary" class="detail-link" @click="handleDetail">详情 &gt;</el-button>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card tab-card">
      <div class="tag-tabs">
        <el-button
          v-for="item in tabItems"
          :key="item.value"
          :type="activeTagType === item.value ? 'primary' : 'default'"
          :plain="activeTagType !== item.value"
          class="tag-tab-btn"
          @click="handleTabChange(item.value)"
        >
          {{ item.label }}
        </el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card cloud-card" v-loading="cloudLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">本期各标签销售贡献</span>
        </div>
      </template>
      <div class="cloud-wrap">
        <div v-if="cloudWords.length" class="cloud-stage">
          <el-tooltip
            v-for="item in cloudWords"
            :key="item.key"
            placement="top"
            raw-content
            :content="item.tooltip"
          >
            <span class="cloud-word" :style="item.style">{{ item.name }}</span>
          </el-tooltip>
        </div>
        <div v-else class="cloud-empty">暂无标签分析数据</div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <ul class="summary-list">
        <li v-for="item in summaryItems" :key="item">{{ item }}</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup name="TagAnalysis" lang="ts">
import { getCategoryDiagnosisTagSalesShare, getCategoryDiagnosisTagTypes } from '@/api/category/diagnosis/detail';
import type { TagSalesSkuItemResponse, TagTypeGroupResponse } from '@/api/category/diagnosis/detail/types';
import { useRequest } from '@/hooks/useRequest';

interface CloudWordItem {
  key: string;
  name: string;
  tooltip: string;
  style: Record<string, string>;
}

const handleDetail = () => {
  ElMessage.info('当前为内嵌页，详情入口保持在页面内展示');
};

const tabGroups = ref<TagTypeGroupResponse[]>([]);
const activeTagType = ref('');
const cloudWords = ref<CloudWordItem[]>([]);

const summaryItems = [
  '标签为植物精华、熏香配方、自然配方、天然配方、香氛配方的商品销售额相对较好，客户购买意向高。',
  '标签为小苍兰香氛、杀菌留香珠、玫瑰留香技术、母婴酵素配方、运动型配方的商品销售额相对较差，客户购买意向低。'
];

const tabItems = computed(() =>
  tabGroups.value
    .filter((item) => Boolean(item?.tagType))
    .map((item) => ({
      label: item.tagTypeName || item.tagType || '-',
      value: item.tagType || ''
    }))
);

const typesRequest = useRequest(async (sessionId: string) => await getCategoryDiagnosisTagTypes(sessionId), {
  onSuccess: (res) => {
    tabGroups.value = Array.isArray(res?.data) ? res.data.filter((item) => Boolean(item?.tagType)) : [];
    activeTagType.value = tabGroups.value[0]?.tagType || '';
    cloudWords.value = [];
    if (activeTagType.value) {
      void loadCloud();
    }
  }
});

const cloudRequest = useRequest(async (params: { sessionId: string; tagType: string }) => await getCategoryDiagnosisTagSalesShare(params.sessionId, params.tagType), {
  onSuccess: (res) => {
    cloudWords.value = buildCloudWords((res?.data?.salesAndSkuList || []) as TagSalesSkuItemResponse[]);
  }
});

const cloudLoading = computed(() => typesRequest.loading.value || cloudRequest.loading.value);

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));

const colorPool = ['#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#0f766e'];

const buildCloudWords = (items: TagSalesSkuItemResponse[]) => {
  const sorted = [...items].sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0));
  const maxSales = Math.max(...sorted.map((item) => Number(item.sales || 0)), 1);
  const stageWidth = 1000;
  const stageHeight = 500;
  const centerX = stageWidth / 2;
  const centerY = stageHeight / 2;
  return sorted.map((item, index) => {
    const sales = Number(item.sales || 0);
    const size = 16 + (sales / maxSales) * 22;
    const angle = index * 0.85;
    const radius = 20 + index * 18;
    const x = Math.max(60, Math.min(stageWidth - 60, centerX + Math.cos(angle) * radius));
    const y = Math.max(40, Math.min(stageHeight - 40, centerY + Math.sin(angle) * radius * 0.72));
    const color = colorPool[index % colorPool.length];
    return {
      key: `${item.tagName || 'tag'}-${index}`,
      name: item.tagName || '-',
      tooltip: `标签名称<br/>销售额：${formatAmount(sales)} 元<br/>SKU：${formatAmount(item.sku, 0)}<br/>SKU占比：${formatPercent(item.skuPer)}`,
      style: {
        left: `${(x / stageWidth) * 100}%`,
        top: `${(y / stageHeight) * 100}%`,
        fontSize: `${size.toFixed(0)}px`,
        color,
        transform: `translate(-50%, -50%) rotate(${(index % 5 - 2) * 4}deg)`
      }
    };
  });
};

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};

const loadCloud = async () => {
  if (!sessionId.value || !activeTagType.value) return;
  await cloudRequest.run({ sessionId: sessionId.value, tagType: activeTagType.value });
};

const handleTabChange = async (tagType: string) => {
  if (activeTagType.value === tagType) return;
  activeTagType.value = tagType;
  await loadCloud();
};

onMounted(async () => {
  if (!sessionId.value) return;
  await typesRequest.run(sessionId.value);
});

watch(
  () => route.query.sessionId,
  async () => {
    tabGroups.value = [];
    activeTagType.value = '';
    cloudWords.value = [];
    if (sessionId.value) {
      await typesRequest.run(sessionId.value);
    }
  }
);
</script>

<style scoped lang="scss">
.tag-analysis-page {
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card,
.tab-card,
.cloud-card,
.summary-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
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
  color: #0f172a;
}

.detail-link {
  padding-left: 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.tag-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-tab-btn {
  min-width: 82px;
  border-radius: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.cloud-wrap {
  width: 100%;
  overflow: hidden;
}

.cloud-empty {
  height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.72) 0%, rgba(255, 255, 255, 1) 100%);
  color: #94a3b8;
  font-size: 14px;
}

.cloud-stage {
  position: relative;
  width: 100%;
  height: 520px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.72) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 16px;
}

.cloud-word {
  position: absolute;
  white-space: nowrap;
  font-weight: 600;
  cursor: default;
  user-select: none;
}

.summary-card {
  background: #fff;
}

.summary-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.9;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-actions {
    flex-wrap: wrap;
  }

  .cloud-stage {
    height: 420px;
  }

  .cloud-empty {
    height: 420px;
  }
}
</style>
