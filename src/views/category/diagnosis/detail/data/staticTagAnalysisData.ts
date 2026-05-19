export interface StaticTagMetric {
  tagName: string;
  sku: number;
}
export type StaticTagAnalysisData = Record<string, Record<string, StaticTagMetric[]>>;
export const STATIC_TAG_ANALYSIS_DATA: StaticTagAnalysisData = {
  "面膜": {
    "功效": [
      {
        "tagName": "补水保湿",
        "sku": 196
      },
      {
        "tagName": "舒缓修护",
        "sku": 86
      },
      {
        "tagName": "美白",
        "sku": 82
      },
      {
        "tagName": "抗皱紧致",
        "sku": 46
      },
      {
        "tagName": "清洁净化",
        "sku": 43
      },
      {
        "tagName": "控油祛痘",
        "sku": 18
      },
      {
        "tagName": "热敷舒缓",
        "sku": 7
      },
      {
        "tagName": "提亮",
        "sku": 6
      },
      {
        "tagName": "多效修护",
        "sku": 5
      },
      {
        "tagName": "去角质焕肤",
        "sku": 2
      }
    ],
    "成分": [
      {
        "tagName": "积雪草提取物",
        "sku": 200
      },
      {
        "tagName": "多肽（胜肽）",
        "sku": 87
      },
      {
        "tagName": "烟酰胺",
        "sku": 86
      },
      {
        "tagName": "水杨酸",
        "sku": 52
      },
      {
        "tagName": "玻尿酸",
        "sku": 35
      },
      {
        "tagName": "天然植物提取物",
        "sku": 17
      },
      {
        "tagName": "透明质酸",
        "sku": 12
      },
      {
        "tagName": "绿豆泥提取物",
        "sku": 2
      }
    ],
    "质地": [
      {
        "tagName": "面膜液",
        "sku": 316
      },
      {
        "tagName": "膏状 / 乳霜状",
        "sku": 69
      },
      {
        "tagName": "凝胶 / 啫喱状",
        "sku": 56
      },
      {
        "tagName": "发热芯",
        "sku": 20
      },
      {
        "tagName": "粉状面膜",
        "sku": 10
      },
      {
        "tagName": "精华液状",
        "sku": 8
      },
      {
        "tagName": "水晶膜状",
        "sku": 6
      },
      {
        "tagName": "啫喱状",
        "sku": 2
      },
      {
        "tagName": "冻干精华片",
        "sku": 2
      },
      {
        "tagName": "泡泡面膜",
        "sku": 2
      }
    ],
    "肤质": [
      {
        "tagName": "所有肤质",
        "sku": 361
      },
      {
        "tagName": "混合性肌肤",
        "sku": 64
      },
      {
        "tagName": "敏感性肌肤",
        "sku": 42
      },
      {
        "tagName": "油性肌肤",
        "sku": 9
      },
      {
        "tagName": "无对应肤质",
        "sku": 9
      },
      {
        "tagName": "多种肤质",
        "sku": 3
      },
      {
        "tagName": "儿童肤质",
        "sku": 2
      },
      {
        "tagName": "痘痘肌肤质",
        "sku": 1
      }
    ],
    "包装": [
      {
        "tagName": "盒装",
        "sku": 318
      },
      {
        "tagName": "袋装",
        "sku": 114
      },
      {
        "tagName": "瓶装",
        "sku": 42
      },
      {
        "tagName": "罐装",
        "sku": 17
      }
    ],
    "人群": [
      {
        "tagName": "通用",
        "sku": 354
      },
      {
        "tagName": "敏感肌",
        "sku": 72
      },
      {
        "tagName": "痘痘肌",
        "sku": 45
      },
      {
        "tagName": "肌肤干燥人群",
        "sku": 8
      },
      {
        "tagName": "熬夜人群",
        "sku": 5
      },
      {
        "tagName": "出油人群",
        "sku": 3
      },
      {
        "tagName": "孕妇慎用",
        "sku": 2
      },
      {
        "tagName": "儿童",
        "sku": 2
      }
    ]
  },
  "食品": {
    "功效": [
      {
        "tagName": "休闲零食",
        "sku": 1407
      },
      {
        "tagName": "补充水分",
        "sku": 141
      },
      {
        "tagName": "快速饱腹",
        "sku": 141
      },
      {
        "tagName": "补充蛋白质",
        "sku": 75
      },
      {
        "tagName": "现代饮用",
        "sku": 28
      },
      {
        "tagName": "补充维生素",
        "sku": 27
      },
      {
        "tagName": "提神醒脑",
        "sku": 5
      },
      {
        "tagName": "能量供给",
        "sku": 2
      },
      {
        "tagName": "厨房调味",
        "sku": 2
      },
      {
        "tagName": "辅助保护化学性肝损伤",
        "sku": 1
      }
    ],
    "成分": [
      {
        "tagName": "基础原料类",
        "sku": 349
      },
      {
        "tagName": "油脂类",
        "sku": 349
      },
      {
        "tagName": "原料核心类",
        "sku": 233
      },
      {
        "tagName": "肉类核心类",
        "sku": 207
      },
      {
        "tagName": "面饼配方类",
        "sku": 133
      },
      {
        "tagName": "水果核心类",
        "sku": 112
      },
      {
        "tagName": "膨松剂类",
        "sku": 109
      },
      {
        "tagName": "甜味剂类",
        "sku": 103
      },
      {
        "tagName": "基础成型类",
        "sku": 103
      },
      {
        "tagName": "白砂糖，葡萄糖浆",
        "sku": 99
      },
      {
        "tagName": "精选坚果",
        "sku": 97
      },
      {
        "tagName": "纯净水，白砂糖，营养强化剂",
        "sku": 78
      },
      {
        "tagName": "可可液块，可可脂",
        "sku": 72
      },
      {
        "tagName": "凝胶成型类",
        "sku": 42
      },
      {
        "tagName": "茶叶提取物，纯净水",
        "sku": 38
      },
      {
        "tagName": "多种维生素，矿物质",
        "sku": 33
      },
      {
        "tagName": "工业标准化酒酿",
        "sku": 30
      },
      {
        "tagName": "生牛乳",
        "sku": 21
      },
      {
        "tagName": "活性益生菌，益生元",
        "sku": 20
      },
      {
        "tagName": "浓缩果汁，纯净水",
        "sku": 18
      },
      {
        "tagName": "乳制品核心类",
        "sku": 17
      },
      {
        "tagName": "蛋白质核心类",
        "sku": 13
      },
      {
        "tagName": "大米",
        "sku": 2
      },
      {
        "tagName": "香辛料类",
        "sku": 2
      },
      {
        "tagName": "水飞蓟",
        "sku": 1
      }
    ],
    "配方": [
      {
        "tagName": "面粉基底",
        "sku": 349
      },
      {
        "tagName": "甜味体系",
        "sku": 240
      },
      {
        "tagName": "原料基底",
        "sku": 239
      },
      {
        "tagName": "原料核心类",
        "sku": 233
      },
      {
        "tagName": "调味体系",
        "sku": 207
      },
      {
        "tagName": "油脂体系",
        "sku": 135
      },
      {
        "tagName": "坚果基底",
        "sku": 97
      },
      {
        "tagName": "基底体系",
        "sku": 78
      },
      {
        "tagName": "可可脂基底",
        "sku": 72
      },
      {
        "tagName": "凝胶剂（成型核心）",
        "sku": 43
      },
      {
        "tagName": "乳或稀奶油为原料",
        "sku": 38
      },
      {
        "tagName": "维生素核心",
        "sku": 33
      },
      {
        "tagName": "工业款",
        "sku": 30
      },
      {
        "tagName": "益生元",
        "sku": 20
      },
      {
        "tagName": "风味调节",
        "sku": 12
      },
      {
        "tagName": "原生态配方",
        "sku": 2
      },
      {
        "tagName": "草本复合配方",
        "sku": 1
      }
    ],
    "口感": [
      {
        "tagName": "酥松绵密",
        "sku": 349
      },
      {
        "tagName": "咸香浓郁",
        "sku": 330
      },
      {
        "tagName": "肉质薄而紧实",
        "sku": 207
      },
      {
        "tagName": "硬脆 / 软糯",
        "sku": 202
      },
      {
        "tagName": "酸甜平衡",
        "sku": 145
      },
      {
        "tagName": "Q 弹爽滑",
        "sku": 133
      },
      {
        "tagName": "清爽 / 绵密",
        "sku": 116
      },
      {
        "tagName": "酥脆易碎",
        "sku": 109
      },
      {
        "tagName": "丝滑细腻",
        "sku": 72
      },
      {
        "tagName": "绵密顺滑",
        "sku": 42
      },
      {
        "tagName": "温和醇厚",
        "sku": 38
      },
      {
        "tagName": "酒香浓郁",
        "sku": 30
      },
      {
        "tagName": "自然甜味",
        "sku": 20
      },
      {
        "tagName": "果香浓郁真实",
        "sku": 18
      },
      {
        "tagName": "奶香浓郁",
        "sku": 12
      },
      {
        "tagName": "饱满弹牙",
        "sku": 2
      },
      {
        "tagName": "醇厚挂味",
        "sku": 2
      },
      {
        "tagName": "根据产品特性定制适中，口感良好，质地均匀，无不良味道，易于接受，回味舒适",
        "sku": 1
      },
      {
        "tagName": "口感清爽",
        "sku": 1
      }
    ],
    "包装": [
      {
        "tagName": "袋装",
        "sku": 1195
      },
      {
        "tagName": "盒装",
        "sku": 245
      },
      {
        "tagName": "瓶装",
        "sku": 222
      },
      {
        "tagName": "罐装",
        "sku": 164
      },
      {
        "tagName": "铁盒",
        "sku": 3
      }
    ]
  },
  "彩妆": {
    "包装": [
      {
        "tagName": "盒装",
        "sku": 1667
      },
      {
        "tagName": "瓶装",
        "sku": 46
      },
      {
        "tagName": "袋装",
        "sku": 8
      }
    ],
    "功效": [
      {
        "tagName": "唇部着色,滋润保湿",
        "sku": 243
      },
      {
        "tagName": "眼部修饰,塑造眼部立体",
        "sku": 233
      },
      {
        "tagName": "定妆控油",
        "sku": 174
      },
      {
        "tagName": "均匀肤色，遮盖暗沉",
        "sku": 172
      },
      {
        "tagName": "打造面部立体",
        "sku": 164
      },
      {
        "tagName": "提亮肤色",
        "sku": 164
      },
      {
        "tagName": "异味遮盖",
        "sku": 146
      },
      {
        "tagName": "增添香气",
        "sku": 146
      },
      {
        "tagName": "空间淡香",
        "sku": 146
      },
      {
        "tagName": "眉毛修饰,定型持久",
        "sku": 122
      },
      {
        "tagName": "辅助睡眠",
        "sku": 111
      },
      {
        "tagName": "缓解疲劳",
        "sku": 111
      },
      {
        "tagName": "美化修饰,提升气色",
        "sku": 106
      },
      {
        "tagName": "滋润保湿,提升气色",
        "sku": 68
      },
      {
        "tagName": "修饰睫毛",
        "sku": 46
      },
      {
        "tagName": "修饰指甲外观",
        "sku": 44
      },
      {
        "tagName": "修饰唇形",
        "sku": 40
      },
      {
        "tagName": "保湿持妆",
        "sku": 33
      },
      {
        "tagName": "修饰本甲",
        "sku": 19
      }
    ],
    "质地": [
      {
        "tagName": "液状",
        "sku": 473
      },
      {
        "tagName": "粉状",
        "sku": 450
      },
      {
        "tagName": "乳液状",
        "sku": 169
      },
      {
        "tagName": "蜡状",
        "sku": 161
      },
      {
        "tagName": "膏状",
        "sku": 161
      },
      {
        "tagName": "哑光膏状",
        "sku": 96
      },
      {
        "tagName": "霜状",
        "sku": 69
      },
      {
        "tagName": "乳霜状",
        "sku": 46
      },
      {
        "tagName": "膏蜡状",
        "sku": 33
      },
      {
        "tagName": "柔雾膏状",
        "sku": 28
      },
      {
        "tagName": "树脂质地",
        "sku": 15
      },
      {
        "tagName": "香料",
        "sku": 9
      },
      {
        "tagName": "果冻凝胶状",
        "sku": 6
      },
      {
        "tagName": "布质",
        "sku": 4
      },
      {
        "tagName": "石质",
        "sku": 3
      }
    ],
    "肤质": [
      {
        "tagName": "所有肤质",
        "sku": 1629
      },
      {
        "tagName": "油性",
        "sku": 90
      },
      {
        "tagName": "混合性肤质",
        "sku": 90
      },
      {
        "tagName": "油",
        "sku": 1
      },
      {
        "tagName": "混油皮",
        "sku": 1
      },
      {
        "tagName": "干",
        "sku": 1
      },
      {
        "tagName": "混干皮",
        "sku": 1
      }
    ],
    "人群": [
      {
        "tagName": "所有",
        "sku": 1721
      }
    ]
  },
  "内裤": {
    "包装": [
      {
        "tagName": "散装",
        "sku": 345
      },
      {
        "tagName": "卡装",
        "sku": 207
      },
      {
        "tagName": "盒装",
        "sku": 44
      },
      {
        "tagName": "袋装",
        "sku": 32
      },
      {
        "tagName": "三款",
        "sku": 1
      }
    ],
    "材质": [
      {
        "tagName": "棉混纺",
        "sku": 212
      },
      {
        "tagName": "莫代尔",
        "sku": 154
      },
      {
        "tagName": "纯棉",
        "sku": 137
      },
      {
        "tagName": "优质面料",
        "sku": 54
      },
      {
        "tagName": "蕾丝",
        "sku": 28
      },
      {
        "tagName": "冰丝",
        "sku": 26
      },
      {
        "tagName": "锦纶+氨纶",
        "sku": 11
      },
      {
        "tagName": "涤纶/尼龙混纺",
        "sku": 6
      },
      {
        "tagName": "纤维",
        "sku": 1
      }
    ],
    "功效": [
      {
        "tagName": "亲肤舒适",
        "sku": 267
      },
      {
        "tagName": "通风透气",
        "sku": 150
      },
      {
        "tagName": "抑制真菌",
        "sku": 82
      },
      {
        "tagName": "舒适无痕",
        "sku": 30
      },
      {
        "tagName": "美观装饰",
        "sku": 29
      },
      {
        "tagName": "凉感顺滑",
        "sku": 23
      },
      {
        "tagName": "支撑塑形",
        "sku": 12
      },
      {
        "tagName": "舒适打底",
        "sku": 11
      },
      {
        "tagName": "透气舒适",
        "sku": 6
      },
      {
        "tagName": "专业防晒",
        "sku": 6
      },
      {
        "tagName": "高弹支撑",
        "sku": 5
      },
      {
        "tagName": "保暖打底",
        "sku": 4
      },
      {
        "tagName": "吸湿降温",
        "sku": 4
      }
    ],
    "人群": [
      {
        "tagName": "女性",
        "sku": 317
      },
      {
        "tagName": "男性",
        "sku": 312
      }
    ]
  },
  "洗护": {
    "包装": [
      {
        "tagName": "瓶装",
        "sku": 462
      },
      {
        "tagName": "盒装",
        "sku": 85
      },
      {
        "tagName": "袋装",
        "sku": 8
      }
    ],
    "功效": [
      {
        "tagName": "基础清洁类",
        "sku": 198
      },
      {
        "tagName": "柔顺顺滑类",
        "sku": 151
      },
      {
        "tagName": "控油去屑类",
        "sku": 60
      },
      {
        "tagName": "修护滋养类",
        "sku": 50
      },
      {
        "tagName": "头发颜色修饰",
        "sku": 47
      },
      {
        "tagName": "强韧防脱类",
        "sku": 25
      },
      {
        "tagName": "造型固定",
        "sku": 24
      }
    ],
    "成分": [
      {
        "tagName": "保湿滋养成分",
        "sku": 328
      },
      {
        "tagName": "调理成分",
        "sku": 172
      },
      {
        "tagName": "功能活性成分",
        "sku": 42
      },
      {
        "tagName": "清洁成分（表面活性剂）",
        "sku": 13
      }
    ],
    "配方": [
      {
        "tagName": "调理型配方",
        "sku": 339
      },
      {
        "tagName": "植物皂苷类配方",
        "sku": 85
      },
      {
        "tagName": "氨基酸类配方",
        "sku": 63
      },
      {
        "tagName": "去屑型配方",
        "sku": 61
      },
      {
        "tagName": "硫酸盐类配方",
        "sku": 7
      }
    ],
    "香型": [
      {
        "tagName": "清新自然调",
        "sku": 193
      },
      {
        "tagName": "花果香甜润调",
        "sku": 112
      },
      {
        "tagName": "中性简约调",
        "sku": 108
      },
      {
        "tagName": "草本植萃调",
        "sku": 97
      },
      {
        "tagName": "馥郁奢华调",
        "sku": 45
      }
    ],
    "发质": [
      {
        "tagName": "中性头皮",
        "sku": 222
      },
      {
        "tagName": "油性头皮",
        "sku": 202
      },
      {
        "tagName": "干性头皮",
        "sku": 61
      },
      {
        "tagName": "敏感头皮",
        "sku": 26
      },
      {
        "tagName": "粗硬发质",
        "sku": 17
      },
      {
        "tagName": "干枯发质",
        "sku": 16
      },
      {
        "tagName": "通用发质",
        "sku": 7
      },
      {
        "tagName": "所有发质",
        "sku": 4
      }
    ],
    "人群": [
      {
        "tagName": "通用",
        "sku": 329
      },
      {
        "tagName": "头屑困扰人群",
        "sku": 82
      },
      {
        "tagName": "染烫受损人群",
        "sku": 75
      },
      {
        "tagName": "脱发 / 发量稀疏人群",
        "sku": 59
      },
      {
        "tagName": "敏感头皮人群",
        "sku": 6
      },
      {
        "tagName": "有遮白需求人群",
        "sku": 4
      }
    ]
  },
  "家清": {
    "功效": [
      {
        "tagName": "深层清洁，去除污渍，呵护衣物纤维",
        "sku": 127
      },
      {
        "tagName": "清洁护理，满足特定清洁需求",
        "sku": 54
      },
      {
        "tagName": "杀菌消毒，清洁手部，预防细菌",
        "sku": 29
      },
      {
        "tagName": "持久留香，衣物柔顺，防静电",
        "sku": 28
      },
      {
        "tagName": "快速去除油污，清洁餐具，易冲洗无残留",
        "sku": 21
      },
      {
        "tagName": "深层清洁内衣污渍，抑菌除味，呵护私密健康",
        "sku": 20
      },
      {
        "tagName": "清洁家居表面，去除污渍，抑菌防护",
        "sku": 9
      },
      {
        "tagName": "强力去除厨房油污，快速溶解，易清洁",
        "sku": 4
      },
      {
        "tagName": "漂白衣物，去除黄渍，增白亮色",
        "sku": 2
      },
      {
        "tagName": "清洁地板污渍，光亮养护，抑菌防滑",
        "sku": 1
      }
    ],
    "成分": [
      {
        "tagName": "表面活性剂，植物提取物，护色因子，抑菌成分",
        "sku": 146
      },
      {
        "tagName": "专用清洁成分，植物提取物",
        "sku": 86
      },
      {
        "tagName": "香氛因子，柔顺剂，抗静电剂",
        "sku": 28
      },
      {
        "tagName": "油污分解剂，表面活性剂",
        "sku": 11
      },
      {
        "tagName": "表面活性剂，抑菌成分",
        "sku": 10
      },
      {
        "tagName": "酒精/季铵盐类消毒剂",
        "sku": 9
      },
      {
        "tagName": "食品级表面活性剂，植物提取物，柠檬精华",
        "sku": 3
      },
      {
        "tagName": "漂白剂，护色因子，表面活性剂",
        "sku": 2
      }
    ],
    "香型": [
      {
        "tagName": "自然香型",
        "sku": 251
      },
      {
        "tagName": "柠檬香型",
        "sku": 24
      },
      {
        "tagName": "玫瑰香型",
        "sku": 12
      },
      {
        "tagName": "樱花香型",
        "sku": 5
      },
      {
        "tagName": "木棉香型",
        "sku": 1
      },
      {
        "tagName": "莲花香型",
        "sku": 1
      },
      {
        "tagName": "檀香香型",
        "sku": 1
      }
    ],
    "质地": [
      {
        "tagName": "液体/固体",
        "sku": 146
      },
      {
        "tagName": "液体",
        "sku": 112
      },
      {
        "tagName": "颗粒状",
        "sku": 28
      },
      {
        "tagName": "凝胶状",
        "sku": 9
      }
    ],
    "配方": [
      {
        "tagName": "温和配方，低刺激，易漂洗",
        "sku": 124
      },
      {
        "tagName": "专用配方，高效清洁",
        "sku": 89
      },
      {
        "tagName": "长效留香配方，温和不刺激",
        "sku": 28
      },
      {
        "tagName": "强效清洁配方，环保无害",
        "sku": 22
      },
      {
        "tagName": "内衣专用配方，温和不刺激，易漂洗",
        "sku": 15
      },
      {
        "tagName": "高效杀菌配方，温和保湿",
        "sku": 9
      },
      {
        "tagName": "婴儿专用配方，无刺激，安全温和",
        "sku": 4
      },
      {
        "tagName": "高效漂白配方，温和护色",
        "sku": 2
      },
      {
        "tagName": "食品级配方，安全无害，环保可降解",
        "sku": 2
      }
    ],
    "包装": [
      {
        "tagName": "瓶装",
        "sku": 199
      },
      {
        "tagName": "袋装",
        "sku": 51
      },
      {
        "tagName": "罐装",
        "sku": 24
      },
      {
        "tagName": "盒装",
        "sku": 21
      }
    ],
    "人群": [
      {
        "tagName": "成人专用",
        "sku": 232
      },
      {
        "tagName": "全家适用",
        "sku": 50
      },
      {
        "tagName": "追求衣物香味和柔顺度的人群",
        "sku": 5
      },
      {
        "tagName": "女士专用",
        "sku": 5
      },
      {
        "tagName": "婴幼儿专用",
        "sku": 3
      }
    ]
  },
  "护肤": {
    "功效": [
      {
        "tagName": "补水保湿",
        "sku": 316
      },
      {
        "tagName": "抗氧化",
        "sku": 228
      },
      {
        "tagName": "提亮美白",
        "sku": 218
      },
      {
        "tagName": "舒缓修护",
        "sku": 218
      },
      {
        "tagName": "修复屏障",
        "sku": 217
      },
      {
        "tagName": "深层滋养",
        "sku": 127
      },
      {
        "tagName": "改善干燥",
        "sku": 127
      },
      {
        "tagName": "延缓衰老",
        "sku": 108
      },
      {
        "tagName": "舒缓敏感",
        "sku": 107
      },
      {
        "tagName": "抗皱紧致",
        "sku": 106
      },
      {
        "tagName": "淡化细纹",
        "sku": 106
      },
      {
        "tagName": "控油平衡",
        "sku": 104
      },
      {
        "tagName": "收缩毛孔",
        "sku": 104
      },
      {
        "tagName": "紧致肌肤",
        "sku": 102
      },
      {
        "tagName": "抗初老",
        "sku": 102
      },
      {
        "tagName": "控油祛痘",
        "sku": 99
      },
      {
        "tagName": "淡化暗沉",
        "sku": 98
      },
      {
        "tagName": "提亮肤色",
        "sku": 87
      }
    ],
    "成分": [
      {
        "tagName": "透明质酸",
        "sku": 346
      },
      {
        "tagName": "泛醇",
        "sku": 326
      },
      {
        "tagName": "甘油",
        "sku": 290
      },
      {
        "tagName": "玻尿酸",
        "sku": 219
      },
      {
        "tagName": "尿囊素",
        "sku": 210
      },
      {
        "tagName": "玫瑰精油",
        "sku": 122
      },
      {
        "tagName": "维生素E",
        "sku": 122
      },
      {
        "tagName": "角鲨烷",
        "sku": 122
      },
      {
        "tagName": "维生素B5",
        "sku": 117
      },
      {
        "tagName": "芦荟提取物",
        "sku": 117
      },
      {
        "tagName": "辅酶Q10",
        "sku": 117
      },
      {
        "tagName": "视黄醇",
        "sku": 116
      },
      {
        "tagName": "多肽",
        "sku": 116
      },
      {
        "tagName": "玻色因",
        "sku": 113
      },
      {
        "tagName": "胶原蛋白",
        "sku": 113
      },
      {
        "tagName": "维生素C衍生物",
        "sku": 112
      },
      {
        "tagName": "绿茶提取物",
        "sku": 112
      },
      {
        "tagName": "神经酰胺",
        "sku": 107
      },
      {
        "tagName": "金盏花提取物",
        "sku": 102
      },
      {
        "tagName": "茶树精油",
        "sku": 101
      },
      {
        "tagName": "水杨酸",
        "sku": 101
      },
      {
        "tagName": "金缕梅",
        "sku": 101
      },
      {
        "tagName": "传明酸",
        "sku": 95
      },
      {
        "tagName": "谷胱甘肽",
        "sku": 95
      },
      {
        "tagName": "积雪草苷",
        "sku": 93
      },
      {
        "tagName": "熊果苷",
        "sku": 92
      },
      {
        "tagName": "维生素C",
        "sku": 92
      },
      {
        "tagName": "烟酰胺",
        "sku": 92
      }
    ],
    "肤质": [
      {
        "tagName": "干性肌肤",
        "sku": 152
      },
      {
        "tagName": "油性肌肤",
        "sku": 143
      },
      {
        "tagName": "中性肌肤",
        "sku": 132
      },
      {
        "tagName": "油性+混合性肌肤",
        "sku": 127
      },
      {
        "tagName": "敏感性+干性肌肤",
        "sku": 127
      },
      {
        "tagName": "混合性肌肤",
        "sku": 127
      },
      {
        "tagName": "所有肤质",
        "sku": 124
      },
      {
        "tagName": "敏感性肌肤",
        "sku": 123
      },
      {
        "tagName": "所有肤质+敏感性肌肤",
        "sku": 122
      },
      {
        "tagName": "干性+中性肌肤",
        "sku": 110
      }
    ],
    "配方": [
      {
        "tagName": "抗氧：绿茶提取物+辅酶Q10，抗氧化",
        "sku": 257
      },
      {
        "tagName": "滋养：角鲨烷+维生素E，深层滋养",
        "sku": 254
      },
      {
        "tagName": "保湿：玻尿酸+神经酰胺，深层补水",
        "sku": 247
      },
      {
        "tagName": "修护：泛醇+维生素B5，修复肌肤",
        "sku": 244
      },
      {
        "tagName": "美白：烟酰胺+维生素C，提亮肤色",
        "sku": 243
      },
      {
        "tagName": "舒缓：积雪草+尿囊素，修复屏障",
        "sku": 241
      },
      {
        "tagName": "控油：水杨酸+金缕梅，调节水油",
        "sku": 230
      },
      {
        "tagName": "抗皱：视黄醇+多肽，淡化细纹",
        "sku": 223
      }
    ],
    "人群": [
      {
        "tagName": "熟龄肌",
        "sku": 117
      },
      {
        "tagName": "混合肌人群",
        "sku": 116
      },
      {
        "tagName": "油性肌肤需控油人群",
        "sku": 115
      },
      {
        "tagName": "敏感肌",
        "sku": 113
      },
      {
        "tagName": "肌肤松弛需抗皱人群",
        "sku": 113
      },
      {
        "tagName": "肌肤敏感需修护人群",
        "sku": 108
      },
      {
        "tagName": "肌肤缺水需保湿人群",
        "sku": 107
      },
      {
        "tagName": "年轻肌肤需基础护理人群",
        "sku": 105
      },
      {
        "tagName": "油皮人群",
        "sku": 103
      },
      {
        "tagName": "通用",
        "sku": 98
      },
      {
        "tagName": "干皮人群",
        "sku": 97
      },
      {
        "tagName": "肌肤暗沉需美白人群",
        "sku": 95
      }
    ]
  },
  "小百货": {
    "功效": [
      {
        "tagName": "防滑/防皱",
        "sku": 195
      },
      {
        "tagName": "分类收纳",
        "sku": 191
      },
      {
        "tagName": "基础承载收纳",
        "sku": 149
      },
      {
        "tagName": "便捷高效使用",
        "sku": 130
      },
      {
        "tagName": "保暖舒适",
        "sku": 118
      },
      {
        "tagName": "学习用具",
        "sku": 95
      },
      {
        "tagName": "强力去污",
        "sku": 64
      },
      {
        "tagName": "充电传输",
        "sku": 59
      },
      {
        "tagName": "保鲜",
        "sku": 49
      },
      {
        "tagName": "清洁护理",
        "sku": 46
      },
      {
        "tagName": "防晒防雨",
        "sku": 45
      },
      {
        "tagName": "宠物用具",
        "sku": 43
      },
      {
        "tagName": "持久芳香",
        "sku": 41
      },
      {
        "tagName": "礼品包装",
        "sku": 34
      },
      {
        "tagName": "场景化防护适配",
        "sku": 33
      },
      {
        "tagName": "健康调理辅助",
        "sku": 29
      },
      {
        "tagName": "深层清洁",
        "sku": 23
      },
      {
        "tagName": "基础音频播放",
        "sku": 23
      },
      {
        "tagName": "基础降温散热",
        "sku": 23
      },
      {
        "tagName": "高效防护",
        "sku": 17
      },
      {
        "tagName": "LED补光",
        "sku": 14
      },
      {
        "tagName": "基础成像反射",
        "sku": 13
      },
      {
        "tagName": "基础盛取转运",
        "sku": 13
      },
      {
        "tagName": "保护衣物",
        "sku": 9
      },
      {
        "tagName": "头发造型",
        "sku": 6
      },
      {
        "tagName": "稳定供电",
        "sku": 5
      },
      {
        "tagName": "多功能固定",
        "sku": 4
      },
      {
        "tagName": "刮削果皮",
        "sku": 3
      },
      {
        "tagName": "方便安全",
        "sku": 3
      },
      {
        "tagName": "补水保湿",
        "sku": 3
      },
      {
        "tagName": "便捷高效烹饪",
        "sku": 1
      }
    ],
    "材质": [
      {
        "tagName": "优质塑料",
        "sku": 159
      },
      {
        "tagName": "EVA材质",
        "sku": 152
      },
      {
        "tagName": "棉柔材质",
        "sku": 120
      },
      {
        "tagName": "橡胶防滑底",
        "sku": 119
      },
      {
        "tagName": "塑料金属",
        "sku": 88
      },
      {
        "tagName": "植物精油",
        "sku": 75
      },
      {
        "tagName": "天然木材",
        "sku": 74
      },
      {
        "tagName": "釉下彩工艺",
        "sku": 64
      },
      {
        "tagName": "优质陶瓷",
        "sku": 64
      },
      {
        "tagName": "食品级PE材质",
        "sku": 61
      },
      {
        "tagName": "合金材质",
        "sku": 60
      },
      {
        "tagName": "TPE线材",
        "sku": 59
      },
      {
        "tagName": "锌合金接口",
        "sku": 59
      },
      {
        "tagName": "肉类",
        "sku": 40
      },
      {
        "tagName": "不锈钢材质",
        "sku": 38
      },
      {
        "tagName": "铜版纸",
        "sku": 34
      },
      {
        "tagName": "涤纶面料",
        "sku": 33
      },
      {
        "tagName": "PP材质",
        "sku": 32
      },
      {
        "tagName": "ABS材质",
        "sku": 31
      },
      {
        "tagName": "亚克力材质",
        "sku": 29
      },
      {
        "tagName": "尼龙材质",
        "sku": 24
      },
      {
        "tagName": "活性炭",
        "sku": 20
      },
      {
        "tagName": "铁粉",
        "sku": 20
      },
      {
        "tagName": "塑料挂钩",
        "sku": 20
      },
      {
        "tagName": "医用脱脂棉",
        "sku": 20
      },
      {
        "tagName": "HDPE高密度聚乙烯",
        "sku": 19
      },
      {
        "tagName": "冰丝面料",
        "sku": 13
      },
      {
        "tagName": "玻璃材质",
        "sku": 13
      },
      {
        "tagName": "表面活性剂",
        "sku": 12
      },
      {
        "tagName": "天然提取物",
        "sku": 11
      },
      {
        "tagName": "陶瓷材质",
        "sku": 10
      },
      {
        "tagName": "细密网布",
        "sku": 9
      },
      {
        "tagName": "氯化钙",
        "sku": 7
      },
      {
        "tagName": "耐用材质",
        "sku": 7
      },
      {
        "tagName": "锌锰材质",
        "sku": 5
      },
      {
        "tagName": "植物纤维",
        "sku": 3
      },
      {
        "tagName": "PVC材质",
        "sku": 3
      },
      {
        "tagName": "凝胶类",
        "sku": 3
      },
      {
        "tagName": "镀镍钢线",
        "sku": 3
      },
      {
        "tagName": "PVA聚乙烯醇胶体",
        "sku": 2
      },
      {
        "tagName": "水胶体敷料",
        "sku": 1
      },
      {
        "tagName": "碘伏",
        "sku": 1
      },
      {
        "tagName": "胶粘剂",
        "sku": 1
      },
      {
        "tagName": "中药提取物",
        "sku": 1
      },
      {
        "tagName": "吡虫啉成分",
        "sku": 1
      },
      {
        "tagName": "凝胶饵剂",
        "sku": 1
      },
      {
        "tagName": "多种成分",
        "sku": 1
      },
      {
        "tagName": "调味料",
        "sku": 1
      }
    ],
    "人群": [
      {
        "tagName": "通用",
        "sku": 840
      },
      {
        "tagName": "家庭用户",
        "sku": 254
      },
      {
        "tagName": "女性",
        "sku": 160
      },
      {
        "tagName": "男士",
        "sku": 117
      },
      {
        "tagName": "学生，办公人员，学习工作者",
        "sku": 50
      },
      {
        "tagName": "宠物",
        "sku": 44
      },
      {
        "tagName": "婴幼儿专用，温和安全",
        "sku": 13
      }
    ],
    "分类": [
      {
        "tagName": "鞋履类",
        "sku": 250
      },
      {
        "tagName": "餐饮器具类",
        "sku": 148
      },
      {
        "tagName": "家居日用类",
        "sku": 130
      },
      {
        "tagName": "收纳整理类",
        "sku": 122
      },
      {
        "tagName": "数码配件类",
        "sku": 120
      },
      {
        "tagName": "清洁用品类",
        "sku": 113
      },
      {
        "tagName": "文具用品类",
        "sku": 103
      },
      {
        "tagName": "个人护理类",
        "sku": 100
      },
      {
        "tagName": "厨房用品类",
        "sku": 83
      },
      {
        "tagName": "防护用品类",
        "sku": 61
      },
      {
        "tagName": "宠物用品类",
        "sku": 44
      },
      {
        "tagName": "空气清新类",
        "sku": 43
      },
      {
        "tagName": "个护美妆类",
        "sku": 38
      },
      {
        "tagName": "礼品包装类",
        "sku": 35
      },
      {
        "tagName": "个护保健类",
        "sku": 30
      },
      {
        "tagName": "沐浴清洁类",
        "sku": 30
      },
      {
        "tagName": "驱蚊防护类",
        "sku": 18
      },
      {
        "tagName": "医疗护理类",
        "sku": 10
      }
    ]
  }
};

export const STATIC_TAG_CATEGORY_ALIASES: Record<string, string[]> = {
  洗化: ['洗护', '家清'],
  洗化部: ['洗护', '家清'],
  洗护: ['洗护'],
  家清: ['家清'],
  护肤: ['护肤'],
  面膜: ['面膜'],
  彩妆: ['彩妆'],
  食品: ['食品'],
  内裤: ['内裤'],
  小百货: ['小百货']
};
