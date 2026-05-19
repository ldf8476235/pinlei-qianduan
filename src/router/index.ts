import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    redirect: '/login',
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '/',
    redirect: '/category/tree'
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/abc',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis',
        component: () => import('@/views/abc/analysis.vue'),
        name: 'AbcAnalysis',
        meta: { title: 'ABC结构分析', activeMenu: '/category/diagnosis/detail' }
      },
      {
        path: 'analysis/detail',
        component: () => import('@/views/abc/goods-list.vue'),
        name: 'AbcGoodsList',
        meta: { title: '品类ABC商品清单', activeMenu: '/category/diagnosis/detail' }
      },
      {
        path: 'goods-list',
        component: () => import('@/views/abc/goods-list.vue'),
        name: 'AbcGoodsListLegacy',
        meta: { title: '品类ABC商品清单', activeMenu: '/category/diagnosis/detail' }
      }
    ]
  },
  {
    path: '/gross-contribution',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis',
        component: () => import('@/views/gross-contribution/analysis.vue'),
        name: 'GrossContributionAnalysis',
        meta: { title: '毛利贡献率分析', activeMenu: '/category/diagnosis/detail' }
      },
      {
        path: 'analysis/detail',
        component: () => import('@/views/gross-contribution/goods-list.vue'),
        name: 'GrossContributionGoodsList',
        meta: { title: '\u54c1\u7c7b\u6bdb\u5229\u8d21\u732e\u7387\u5546\u54c1\u6e05\u5355', activeMenu: '/category/diagnosis/detail' }
      }
    ]
  },
  {
    path: '/gmroi',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis',
        component: () => import('@/views/gmroi/analysis.vue'),
        name: 'GmroiAnalysis',
        meta: { title: 'GMROI分析', activeMenu: '/category/diagnosis/detail' }
      },
      {
        path: 'analysis/detail',
        component: () => import('@/views/gmroi/goods-list.vue'),
        name: 'GmroiGoodsList',
        meta: { title: 'GMROI商品明细', activeMenu: '/category/diagnosis/detail' }
      }
    ]
  },
  {
    path: '/supplier',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis',
        component: () => import('@/views/supplier/analysis.vue'),
        name: 'SupplierAnalysis',
        meta: { title: '供应商分析', activeMenu: '/category/diagnosis/detail' }
      },
      {
        path: 'analysis/detail',
        component: () => import('@/views/supplier/detail.vue'),
        name: 'SupplierDetail',
        meta: { title: '供应商明细', activeMenu: '/category/diagnosis/detail' }
      }
    ]
  },
  {
    path: '/price-band',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis/detail',
        component: () => import('@/views/price-band/detail.vue'),
        name: 'PriceBandDetail',
        meta: { title: '价格带商品明细', activeMenu: '/category/diagnosis/detail' }
      }
    ]
  },
  {
    path: '/brand',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis/detail',
        component: () => import('@/views/brand/detail.vue'),
        name: 'BrandDetail',
        meta: { title: '品牌商品明细', activeMenu: '/category/diagnosis/detail' }
      }
    ]
  },
  {
    path: '/spec',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis/detail',
        component: () => import('@/views/category/diagnosis/detail/spec-detail.vue'),
        name: 'SpecDetail',
        meta: { title: '品类规格清单', activeMenu: '/category/diagnosis/detail' }
      }
    ]
  },
  {
    path: '/category',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'analysis',
        component: () => import('@/views/category/analysis/index.vue'),
        name: 'CategoryAnalysis',
        meta: { title: '品类分析', activeMenu: '/category/analysis' }
      },
      {
        path: 'diagnosis',
        component: () => import('@/views/category/diagnosis/index.vue'),
        name: 'CategoryDiagnosis',
        meta: { title: '品类诊断' }
      },
      {
        path: 'diagnosis/record',
        component: () => import('@/views/category/diagnosis/record/index.vue'),
        name: 'CategoryDiagnosisRecord',
        meta: { title: '品类诊断记录', activeMenu: '/category/diagnosis' }
      },
      {
        path: 'diagnosis/detail',
        component: () => import('@/views/category/diagnosis/detail/index.vue'),
        name: 'CategoryDiagnosisDetail',
        meta: { title: '品类诊断详情', activeMenu: '/category/diagnosis' }
      },
      {
        path: 'check/detail',
        component: () => import('@/views/category/diagnosis/detail/all-class-check.vue'),
        name: 'CategoryCheckDetail',
        meta: { title: '全类检测详情', activeMenu: '/category/check' }
      }
    ]
  }
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteRecordRaw[] = [

];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;
