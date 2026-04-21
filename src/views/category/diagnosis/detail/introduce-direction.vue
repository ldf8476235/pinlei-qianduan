<template>
  <div class="introduce-direction-page">
    <div class="page-shell">
      <div class="page-header">
        <div class="title-wrap">
          <h2 class="page-title">建议引品方向</h2>
          <button class="ai-link" type="button">AI选品 &gt;</button>
        </div>
        <div class="header-actions">
          <el-button circle class="icon-btn">
            <el-icon><Download /></el-icon>
          </el-button>
        </div>
      </div>

      <section class="hero-section">
        <div class="hero-orbit orbit-one"></div>
        <div class="hero-orbit orbit-two"></div>
        <div class="hero-orbit orbit-three"></div>

        <div class="node demand-node">
          <div class="side-tags side-tags-left">
            <span>价格</span>
            <span>品牌</span>
            <span>规格</span>
            <span>标签</span>
          </div>
          <div class="node-ball teal-ball">用户需求</div>
        </div>

        <div class="node supplier-node">
          <div class="node-ball gold-ball">供应商贡献</div>
          <div class="side-tags side-tags-right">
            <span>单品贡献</span>
            <span>毛利率</span>
          </div>
        </div>

        <div class="target-center">
          <div class="target-ring outer-ring">
            <div class="target-ring inner-ring">
              <span>引品目标</span>
            </div>
          </div>
        </div>

        <div class="node bottom-node">
          <div class="node-ball dark-ball">小分类 SKU配置</div>
        </div>

        <div class="connector connector-left"></div>
        <div class="connector connector-right"></div>
        <div class="connector connector-bottom"></div>
      </section>

      <section class="table-section">
        <el-table :data="tableRows" border stripe class="introduce-table">
          <el-table-column label="顺序" prop="orderNo" min-width="80" align="center" sortable />
          <el-table-column label="价格区间" prop="priceBand" min-width="130" align="center" sortable />
          <el-table-column label="品牌" prop="brand" min-width="120" align="center" sortable />
          <el-table-column label="规格" prop="spec" min-width="120" align="center" sortable />
          <el-table-column label="产品形态" prop="form" min-width="120" align="center" sortable />
          <el-table-column label="原料" prop="ingredient" min-width="120" align="center" sortable />
          <el-table-column label="功效" prop="effect" min-width="120" align="center" sortable />
          <el-table-column label="香型" prop="fragrance" min-width="120" align="center" sortable />
          <el-table-column label="包装" prop="packageType" min-width="120" align="center" sortable />
          <el-table-column label="人群" prop="targetGroup" min-width="120" align="center" sortable />
          <el-table-column label="产地" prop="origin" min-width="120" align="center" sortable />
          <el-table-column label="供应商" prop="supplier" min-width="150" align="center" sortable />
          <el-table-column label="小分类" prop="subCategory" min-width="130" align="center" sortable />
        </el-table>
      </section>
    </div>

    <div class="floating-actions">
      <button type="button" class="floating-btn">
        <el-icon><Grid /></el-icon>
      </button>
      <button type="button" class="floating-btn help-btn">?</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Grid } from '@element-plus/icons-vue';

const tableRows = [
  {
    orderNo: 1,
    priceBand: '24.81-39.72',
    brand: '立白',
    spec: '500g/瓶',
    form: '液体',
    ingredient: '植物洁净因子',
    effect: '去渍洁净',
    fragrance: '清新花香',
    packageType: '按压瓶',
    targetGroup: '家庭通用',
    origin: '广东',
    supplier: '广州立白企业集团',
    subCategory: '洗衣液'
  },
  {
    orderNo: 2,
    priceBand: '39.72-54.63',
    brand: '云南白药',
    spec: '180g/支',
    form: '膏体',
    ingredient: '草本精华',
    effect: '清新护龈',
    fragrance: '薄荷香型',
    packageType: '软管装',
    targetGroup: '成人',
    origin: '云南',
    supplier: '云南白药集团',
    subCategory: '牙膏'
  },
  {
    orderNo: 3,
    priceBand: '54.63-69.54',
    brand: '心相印',
    spec: '4层*10包',
    form: '抽纸',
    ingredient: '原生木浆',
    effect: '柔韧亲肤',
    fragrance: '无香',
    packageType: '家庭分享装',
    targetGroup: '母婴家庭',
    origin: '福建',
    supplier: '恒安集团',
    subCategory: '面巾纸'
  }
];
</script>

<style scoped lang="scss">
.introduce-direction-page {
  position: relative;
  min-height: 100%;
  border-radius: 20px;
  background:
    radial-gradient(circle at 18% 20%, rgba(111, 244, 220, 0.22) 0, rgba(111, 244, 220, 0) 28%),
    radial-gradient(circle at 86% 18%, rgba(255, 212, 122, 0.2) 0, rgba(255, 212, 122, 0) 24%),
    radial-gradient(circle at 50% 100%, rgba(113, 234, 255, 0.14) 0, rgba(113, 234, 255, 0) 28%),
    linear-gradient(180deg, #eefcf8 0%, #f8fffd 52%, #f2fbf8 100%);
  overflow: hidden;
}

.introduce-direction-page::before,
.introduce-direction-page::after {
  position: absolute;
  inset: auto;
  content: '';
  border-radius: 50%;
  border: 1px solid rgba(32, 170, 150, 0.08);
  pointer-events: none;
}

.introduce-direction-page::before {
  width: 560px;
  height: 560px;
  left: -140px;
  top: 120px;
}

.introduce-direction-page::after {
  width: 660px;
  height: 660px;
  right: -180px;
  top: -40px;
}

.page-shell {
  position: relative;
  z-index: 1;
  padding: 24px 28px 28px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-title {
  margin: 0;
  color: #152133;
  font-size: 24px;
  font-weight: 700;
}

.ai-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #18b6a0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.icon-btn {
  border-color: rgba(24, 182, 160, 0.18);
  color: #18b6a0;
  background: rgba(255, 255, 255, 0.78);
}

.hero-section {
  position: relative;
  display: flex;
  min-height: 420px;
  align-items: center;
  justify-content: center;
}

.hero-orbit {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(24, 182, 160, 0.12);
}

.orbit-one {
  width: 520px;
  height: 520px;
}

.orbit-two {
  width: 420px;
  height: 420px;
}

.orbit-three {
  width: 320px;
  height: 320px;
}

.target-center {
  position: relative;
  z-index: 2;
}

.target-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.outer-ring {
  width: 210px;
  height: 210px;
  background: linear-gradient(180deg, rgba(24, 182, 160, 0.18) 0%, rgba(24, 182, 160, 0.08) 100%);
  box-shadow: inset 0 0 0 18px rgba(255, 255, 255, 0.88);
}

.inner-ring {
  width: 138px;
  height: 138px;
  background: linear-gradient(180deg, #ffffff 0%, #f3fbf8 100%);
  box-shadow:
    inset 0 0 0 10px rgba(24, 182, 160, 0.14),
    0 16px 34px rgba(24, 182, 160, 0.15);
  color: #152133;
  font-size: 24px;
  font-weight: 700;
}

.node {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
}

.demand-node {
  top: 52px;
  left: calc(50% - 330px);
}

.supplier-node {
  top: 58px;
  right: calc(50% - 338px);
}

.bottom-node {
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
}

.node-ball {
  display: flex;
  width: 118px;
  height: 118px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
}

.teal-ball {
  background: linear-gradient(180deg, #1ad0bb 0%, #0ea897 100%);
  color: #ffffff;
}

.gold-ball {
  background: linear-gradient(180deg, #ffd36f 0%, #f4b238 100%);
  color: #352700;
}

.dark-ball {
  width: 148px;
  height: 148px;
  background: linear-gradient(180deg, #1b2230 0%, #06090f 100%);
  color: #ffffff;
}

.side-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-tags span {
  border-radius: 999px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  color: #526070;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.connector {
  position: absolute;
  z-index: 1;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(24, 182, 160, 0.08) 0%, rgba(24, 182, 160, 0.28) 50%, rgba(24, 182, 160, 0.08) 100%);
}

.connector-left,
.connector-right {
  top: 160px;
  width: 180px;
  height: 2px;
}

.connector-left {
  left: calc(50% - 250px);
}

.connector-right {
  right: calc(50% - 250px);
}

.connector-bottom {
  bottom: 142px;
  width: 2px;
  height: 84px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, rgba(24, 182, 160, 0.08) 0%, rgba(24, 182, 160, 0.28) 50%, rgba(24, 182, 160, 0.08) 100%);
}

.table-section {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
  padding: 18px 18px 14px;
}

.introduce-table :deep(.el-table__header th) {
  background: #f4f7fb;
  color: #182233;
  font-weight: 700;
  text-align: center;
}

.introduce-table :deep(.cell) {
  font-size: 13px;
  text-align: center;
}

.introduce-table :deep(.el-table__body td) {
  color: #425168;
}

.floating-actions {
  position: absolute;
  top: 148px;
  right: 18px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.floating-btn {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
  color: #18b6a0;
  font-size: 20px;
  cursor: pointer;
}

.help-btn {
  color: #ffffff;
  background: linear-gradient(180deg, #1ad0bb 0%, #12aa98 100%);
  font-size: 22px;
  font-weight: 700;
}

@media (max-width: 1400px) {
  .demand-node {
    left: calc(50% - 290px);
  }

  .supplier-node {
    right: calc(50% - 294px);
  }

  .connector-left,
  .connector-right {
    width: 130px;
  }
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-section {
    min-height: 560px;
  }

  .demand-node,
  .supplier-node,
  .bottom-node {
    position: static;
    transform: none;
  }

  .hero-section {
    flex-direction: column;
    gap: 24px;
  }

  .target-center {
    order: 2;
  }

  .demand-node {
    order: 1;
  }

  .supplier-node {
    order: 3;
  }

  .bottom-node {
    order: 4;
  }

  .connector,
  .hero-orbit {
    display: none;
  }

  .floating-actions {
    top: auto;
    right: 14px;
    bottom: 18px;
  }
}

@media (max-width: 768px) {
  .page-shell {
    padding: 18px 16px 22px;
  }

  .title-wrap {
    flex-wrap: wrap;
  }

  .demand-node,
  .supplier-node {
    flex-direction: column;
  }

  .side-tags {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
