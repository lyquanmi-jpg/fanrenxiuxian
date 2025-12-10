// ==========================
// 核心配置：世界观、境界、属性定义
// ==========================

window.Game = window.Game || {};

Game.CoreConfig = {
    // 修仙境界列表（从低到高）
    realms: [
        { id: "mortal", name: "凡人境", expRequired: 0 },
        { id: "qi_refining", name: "炼气期", expRequired: 100 },
        { id: "foundation", name: "筑基期", expRequired: 500 },
        { id: "golden_core", name: "金丹期", expRequired: 2000 },
        { id: "nascent_soul", name: "元婴期", expRequired: 8000 },
        { id: "deity", name: "化神期", expRequired: 30000 }
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