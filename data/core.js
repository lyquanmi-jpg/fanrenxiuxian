// ==========================
// 核心配置：世界观、境界、属性定义
// ==========================

window.Game = window.Game || {};

Game.CoreConfig = {
    // 修仙境界列表（从低到高）
    realms: [
        { 
            id: "mortal", 
            name: "凡人境", 
            expRequired: 0,
            maxLevel: 5,  // 凡人境最高5级
            // 凡人 -> 炼气：容易，无需特殊道具
            breakthrough: { 
                nextRealm: "qi_refining", 
                baseChance: 1.0  // 100% 成功率
            } 
        },
        { 
            id: "qi_refining", 
            name: "炼气期", 
            expRequired: 100,
            maxLevel: 10,  // 炼气期最高10级（十层圆满）
            // 炼气 -> 筑基：困难，必须筑基丹
            breakthrough: { 
                nextRealm: "foundation", 
                reqItem: "foundation_pill",  // 关联物品ID
                baseChance: 0.6,             // 60% 基础成功率
                failDamageRate: 0.5          // 失败扣除 50% 当前气血
            } 
        },
        { 
            id: "foundation", 
            name: "筑基期", 
            expRequired: 500,
            maxLevel: 20,  // 筑基期最高20级
            // 筑基 -> 金丹：非常困难，需要金丹
            breakthrough: { 
                nextRealm: "golden_core", 
                reqItem: "golden_core_pill", 
                baseChance: 0.4,            // 40% 基础成功率
                failDamageRate: 0.6         // 失败扣除 60% 当前气血
            } 
        },
        { 
            id: "golden_core", 
            name: "金丹期", 
            expRequired: 2000,
            maxLevel: 30,  // 金丹期最高30级
            // 金丹 -> 元婴：极其困难，需要元婴丹
            breakthrough: { 
                nextRealm: "nascent_soul", 
                reqItem: "nascent_soul_pill", 
                baseChance: 0.3,            // 30% 基础成功率
                failDamageRate: 0.7         // 失败扣除 70% 当前气血
            } 
        },
        { 
            id: "nascent_soul", 
            name: "元婴期", 
            expRequired: 8000,
            maxLevel: 40,  // 元婴期最高40级
            // 元婴 -> 化神：逆天难度，需要化神丹
            breakthrough: { 
                nextRealm: "deity", 
                reqItem: "deity_pill", 
                baseChance: 0.2,            // 20% 基础成功率
                failDamageRate: 0.8         // 失败扣除 80% 当前气血
            } 
        },
        { 
            id: "deity", 
            name: "化神期", 
            expRequired: 30000,
            maxLevel: 50,  // 化神期最高50级
            // 最高境界，无法继续突破
            breakthrough: null
        }
    ],

    // 属性类型
    attributes: {
        hp: "气血",
        mp: "灵力",
        attack: "攻击",
        defense: "防御",
        critRate: "暴击率",
        critDamage: "暴击伤害"
    },

    // 默认初始属性
    defaultStats: {
        hp: 120,
        maxHp: 120,
        mp: 50,
        maxMp: 50,
        attack: 15,
        defense: 8,
        critRate: 0.1,
        critDamage: 1.5,
        spiritStones: 3  // 初始3枚灵石（新手福利，给3次修炼机会）
    },

    // 经验升级曲线（每级所需经验）
    expCurve: function(level) {
        return level * 100 + (level - 1) * 50;
    },

    // NPC 信息（世界观设定）
    npcs: {
        "红姐": {
            name: "红姐",
            identity: "夜宴楼·魅影真君",
            description: "派对达人，隐藏身份是修仙界的魅影真君"
        },
        "春夏": {
            name: "春夏",
            identity: "万象宗·气运行者",
            description: "社交悍匪，真实身份是气运行者"
        },
        "小梦": {
            name: "小梦",
            identity: "梦灵殿·心海守护者",
            description: "知心姐姐，实际上是心海守护者"
        },
        "天才哥": {
            name: "天才哥",
            identity: "机缘阁·算道天才",
            description: "万事通，算道天才"
        },
        "小D": {
            name: "小D",
            identity: "药王谷·灵植医修",
            description: "温柔御姐，灵植医修"
        },
        "桃汁": {
            name: "桃汁",
            identity: "灵果山·木灵剑修",
            description: "美少女，木灵剑修"
        },
        "欧文": {
            name: "欧文",
            identity: "画魂峰·阵图炼师",
            description: "漫画师/游戏策划，阵图炼师，最终BOSS是欧文的心魔"
        }
    }
};