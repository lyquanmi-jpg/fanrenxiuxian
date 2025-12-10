// ==========================
// NPC 羁绊数据结构
// ==========================

// 初始好感度：0
// 初始羁绊等级：0
// 羁绊等级门槛：
// Level 1: 30 (解锁支援技能)
// Level 2: 70 (支援概率增加，支援技能强化)
// Level 3: 150 (解锁专属光环，支援技能再强化)
// Level MAX: 300 (解锁 '满血复活' 终极支援)

const npcData = {
    // 主线队友（已经有光环，主要靠好感度解锁额外支援强度）
    "红姐": {
        name: "红姐",
        location: "地铁站/Livehouse附近",
        type: "main_combat",
        affinity: 200, // 初始较高
        bondLevel: 3,
        profile: "绛幕护道者，稳定的心域守护者。",
        supportSkills: ["赤绡护幕（群体减伤）", "稳固心域（消除负面状态）", "心念暴击（高额伤害）"],
        // 战斗数据（普通状态）
        hp: 200,
        maxHp: 200,
        attack: 25,
        defense: 10,
        skills: [
            {
                name: "红酒泼洒",
                damageRate: 1.5,
                rate: 0.3,
                text: "红姐泼出一杯红酒，酒液化作利刃！"
            }
        ],
        loot: {
            exp: 50,
            money: 100,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【魅影真君】红姐",
            description: "卸下都市伪装，她周身缠绕着绯红的灵气，这才是她在修仙界的真面目。",
            hp: 1500,
            maxHp: 1500,
            attack: 60,
            defense: 30,
            skills: [
                {
                    name: "绯红深渊",
                    damageRate: 2.5,
                    rate: 0.4,
                    text: "巨大的绯红法相从天而降，碾碎一切！"
                }
            ],
            loot: {
                exp: 1000,
                money: 5000,
                spiritStones: 10,
                items: [
                    { id: "artifact_red_wine_glass", count: 1 }
                ]
            }
        }
    },
    "春夏": {
        name: "春夏",
        location: "Livehouse/酒吧",
        type: "main_control",
        affinity: 180,
        bondLevel: 3,
        profile: "幻光门幻舞术修，控场与情绪引导大师。",
        supportSkills: ["幻舞干扰（大幅降低敌方命中）", "情绪爆发（群体增益）", "节奏打击（额外伤害和眩晕）"],
        // 战斗数据（普通状态）
        hp: 120,
        maxHp: 120,
        attack: 18,
        defense: 8,
        skills: [
            {
                name: "幻舞干扰",
                damageRate: 1.3,
                rate: 0.3,
                text: "春夏施展幻舞，干扰敌人的判断！"
            }
        ],
        loot: {
            exp: 40,
            money: 80,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【幻梦蝶后】春夏",
            description: "幻梦蝶后现世，精神风暴席卷一切。",
            hp: 1800,
            maxHp: 1800,
            attack: 70,
            defense: 25,
            skills: [
                {
                    name: "精神风暴",
                    damageRate: 2.8,
                    rate: 0.5,
                    text: "精神风暴席卷而来，摧毁一切理智！"
                }
            ],
            loot: {
                exp: 1200,
                money: 6000,
                spiritStones: 12,
                items: [
                    { id: "artifact_phantom_ribbon", count: 1 }
                ]
            }
        }
    },
    // 新增羁绊 NPC 列表
    "白猫": {
        name: "白猫",
        location: "夜市烧烤摊",
        type: "social_neutral", // 容易通过送礼提升好感
        affinity: 0,
        bondLevel: 0,
        profile: "深夜烧烤达人，以食物安抚人心。",
        supportSkills: ["灵魂烤串（回复 MaxHP 15%）", "深夜暖意（永久 +1 灵性）"],
        // 战斗数据（普通状态）
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 5,
        skills: [
            {
                name: "烤串攻击",
                damageRate: 1.2,
                rate: 0.25,
                text: "白猫扔出一串烤串！"
            }
        ],
        loot: {
            exp: 30,
            money: 50,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【食仙·饕餮】白猫",
            description: "食仙真身现世，吞噬天地之力觉醒！",
            hp: 1500,
            maxHp: 1500,
            attack: 60,
            defense: 20,
            skills: [
                {
                    name: "吞噬天地",
                    damageRate: 2.5,
                    rate: 0.4,
                    text: "饕餮张开巨口，吞噬一切！"
                }
            ],
            loot: {
                exp: 1000,
                money: 5000,
                spiritStones: 10,
                items: [
                    { id: "artifact_dragon_tooth_skewer", count: 1 }
                ]
            }
        }
    },
    "彬彬": {
        name: "彬彬",
        location: "足浴中心/澡堂",
        type: "passive_support", // 倾向于支持，不爱战斗
        affinity: 0,
        bondLevel: 0,
        profile: "浴皇大帝，擅长用水汽和温度稳定心神。",
        supportSkills: ["浴皇安宁（单回合免伤 50%）", "心神洗涤（降低影值）"],
        // 战斗数据（普通状态）
        hp: 110,
        maxHp: 110,
        attack: 16,
        defense: 7,
        skills: [
            {
                name: "水汽护体",
                damageRate: 1.1,
                rate: 0.2,
                text: "彬彬用水汽形成护盾！"
            }
        ],
        loot: {
            exp: 35,
            money: 60,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【水德星君】彬彬",
            description: "水德星君现世，沸腾之海淹没一切！",
            hp: 1600,
            maxHp: 1600,
            attack: 65,
            defense: 22,
            skills: [
                {
                    name: "沸腾之海",
                    damageRate: 2.6,
                    rate: 0.45,
                    text: "沸腾的海水席卷而来，无处可逃！"
                }
            ],
            loot: {
                exp: 1100,
                money: 5500,
                spiritStones: 11,
                items: [
                    { id: "artifact_bath_emperor_robe", count: 1 }
                ]
            }
        }
    },
    "小微姐": {
        name: "小微姐",
        location: "赣江大道（摩托）",
        type: "combat_aggressive", // 战斗狂，挑战不掉好感
        affinity: 0,
        bondLevel: 0,
        profile: "速度与力量的象征，摩托上的心域骑士。",
        supportSkills: ["风驰电掣（对敌方造成高额伤害）", "极限闪避（玩家下次攻击必定命中且暴击）"],
        // 战斗数据（普通状态）
        hp: 130,
        maxHp: 130,
        attack: 20,
        defense: 6,
        skills: [
            {
                name: "风驰电掣",
                damageRate: 1.4,
                rate: 0.3,
                text: "小微姐骑着摩托冲撞而来！"
            }
        ],
        loot: {
            exp: 45,
            money: 90,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【极速暴走】小微姐",
            description: "极速暴走形态，风雷之力觉醒！",
            hp: 2000,
            maxHp: 2000,
            attack: 75,
            defense: 28,
            skills: [
                {
                    name: "风雷连击",
                    damageRate: 2.7,
                    rate: 0.5,
                    text: "风雷之力连续爆发，无处可逃！"
                }
            ],
            loot: {
                exp: 1300,
                money: 6500,
                spiritStones: 13,
                items: [
                    { id: "artifact_wind_thunder_ring", count: 1 }
                ]
            }
        }
    },
    "V姐": {
        name: "V姐",
        location: "酒吧/KTV",
        type: "social_passive", // 需要耐心交谈和送礼
        affinity: 0,
        bondLevel: 0,
        profile: "用酒液麻痹痛苦，在微醺中洞察心域。",
        supportSkills: ["微醺祝福（玩家暴击率提升 10%）", "灵魂对视（降低敌方防御）"],
        // 战斗数据（普通状态）
        hp: 120,
        maxHp: 120,
        attack: 17,
        defense: 6,
        skills: [
            {
                name: "酒液攻击",
                damageRate: 1.3,
                rate: 0.25,
                text: "V姐泼出酒液！"
            }
        ],
        loot: {
            exp: 40,
            money: 80,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【酒吞童子】V姐",
            description: "酒吞童子现世，醉生梦死之力觉醒！",
            hp: 1700,
            maxHp: 1700,
            attack: 68,
            defense: 24,
            skills: [
                {
                    name: "醉生梦死",
                    damageRate: 2.6,
                    rate: 0.45,
                    text: "醉生梦死的力量笼罩一切，让人沉沦！"
                }
            ],
            loot: {
                exp: 1150,
                money: 5750,
                spiritStones: 11,
                items: []
            }
        }
    },
    "白米饭": {
        name: "白米饭小姐",
        location: "健身房/运动场",
        type: "combat_neutral", // 专注于自身修炼
        affinity: 0,
        bondLevel: 0,
        profile: "极致的体魄修炼者，力量与耐力的化身。",
        supportSkills: ["体魄强化（永久 +2 MaxHp）", "战意爆发（提供临时的额外减伤）"],
        // 战斗数据（普通状态）
        hp: 150,
        maxHp: 150,
        attack: 19,
        defense: 10,
        skills: [
            {
                name: "体魄冲击",
                damageRate: 1.5,
                rate: 0.3,
                text: "白米饭用强健的体魄冲击！"
            }
        ],
        loot: {
            exp: 50,
            money: 100,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【力之巨神】白米饭",
            description: "力之巨神现世，认真一拳可破天地！",
            hp: 2500,
            maxHp: 2500,
            attack: 90,
            defense: 35,
            skills: [
                {
                    name: "认真一拳",
                    damageRate: 3.0,
                    rate: 0.5,
                    text: "认真一拳，天地为之震动！"
                }
            ],
            loot: {
                exp: 1500,
                money: 7500,
                spiritStones: 15,
                items: [
                    { id: "artifact_training_armor", count: 1 }
                ]
            }
        }
    },
    "阳阳": {
        name: "阳阳",
        location: "大学城/咖啡馆",
        type: "social_neutral",
        affinity: 0,
        bondLevel: 0,
        profile: "镜头下的光影记录者，记录心域的瞬间。",
        supportSkills: ["光影记录（战斗额外经验 +50%）", "瞬间定格（敌人下回合无法行动）"],
        // 战斗数据（普通状态）
        hp: 110,
        maxHp: 110,
        attack: 16,
        defense: 6,
        skills: [
            {
                name: "光影捕捉",
                damageRate: 1.2,
                rate: 0.25,
                text: "阳阳用镜头捕捉光影！"
            }
        ],
        loot: {
            exp: 35,
            money: 60,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【光影主宰】阳阳",
            description: "光影主宰现世，时间定格之力觉醒！",
            hp: 1700,
            maxHp: 1700,
            attack: 70,
            defense: 23,
            skills: [
                {
                    name: "时间定格",
                    damageRate: 2.7,
                    rate: 0.5,
                    text: "时间被定格，一切静止！"
                }
            ],
            loot: {
                exp: 1200,
                money: 6000,
                spiritStones: 12,
                items: [
                    { id: "artifact_truth_lens", count: 1 }
                ]
            }
        }
    },
    "欧文": {
        name: "欧文",
        location: "漫画工作室",
        type: "passive_support",
        affinity: 0,
        bondLevel: 0,
        profile: "将心象具现于纸面，灵性与创意的修仙者。",
        supportSkills: ["心象具现（永久 +1 灵性，永久 +1 悟性点）", "灵感涌现（玩家下次技能威力翻倍）"],
        // 战斗数据（普通状态）
        hp: 105,
        maxHp: 105,
        attack: 15,
        defense: 5,
        skills: [
            {
                name: "心象具现",
                damageRate: 1.2,
                rate: 0.25,
                text: "欧文将心象具现为攻击！"
            }
        ],
        loot: {
            exp: 30,
            money: 50,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【神笔马良】欧文",
            description: "神笔马良现世，绘世成真之力觉醒！",
            hp: 1600,
            maxHp: 1600,
            attack: 65,
            defense: 21,
            skills: [
                {
                    name: "绘世成真",
                    damageRate: 2.6,
                    rate: 0.45,
                    text: "画中的世界成为现实，一切皆有可能！"
                }
            ],
            loot: {
                exp: 1100,
                money: 5500,
                spiritStones: 11,
                items: [
                    { id: "artifact_painting_plate", count: 1 }
                ]
            }
        }
    },
    "JOJO姐": {
        name: "JOJO姐",
        location: "舞蹈室/Livehouse",
        type: "combat_aggressive",
        affinity: 0,
        bondLevel: 0,
        profile: "火辣的身姿与爆发力，心火燃烧的修仙者。",
        supportSkills: ["心火灼烧（对敌方造成持续 2 回合的 DOT 伤害）", "致命一击（高概率暴击伤害）"],
        // 战斗数据（普通状态）
        hp: 140,
        maxHp: 140,
        attack: 20,
        defense: 7,
        skills: [
            {
                name: "心火舞",
                damageRate: 1.5,
                rate: 0.3,
                text: "JOJO姐跳起心火之舞！"
            }
        ],
        loot: {
            exp: 50,
            money: 100,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【红莲舞圣】JOJO姐",
            description: "红莲舞圣现世，业火红莲焚尽一切！",
            hp: 2200,
            maxHp: 2200,
            attack: 85,
            defense: 30,
            skills: [
                {
                    name: "业火红莲",
                    damageRate: 2.9,
                    rate: 0.5,
                    text: "业火红莲绽放，焚尽一切罪恶！"
                }
            ],
            loot: {
                exp: 1400,
                money: 7000,
                spiritStones: 14,
                items: [
                    { id: "artifact_burning_whip", count: 1 }
                ]
            }
        }
    },
    "奇奇": {
        name: "奇奇",
        location: "校园/科技园",
        type: "combat_hostile", // 挑战掉落经验和装备，但极易掉好感，需谨慎挑战
        affinity: 0,
        bondLevel: 0,
        profile: "病娇系心域控制者，情绪极其不稳定。",
        supportSkills: ["情绪支配（小概率导致敌人自残）", "狂热守护（玩家获得大量临时 HP）"],
        // 战斗数据（普通状态）
        hp: 125,
        maxHp: 125,
        attack: 18,
        defense: 6,
        skills: [
            {
                name: "情绪爆发",
                damageRate: 1.4,
                rate: 0.3,
                text: "奇奇情绪爆发，攻击力提升！"
            }
        ],
        loot: {
            exp: 45,
            money: 90,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【鲜血魔女】奇奇",
            description: "鲜血魔女现世，处决之力觉醒！",
            hp: 1900,
            maxHp: 1900,
            attack: 75,
            defense: 26,
            skills: [
                {
                    name: "处决",
                    damageRate: 2.8,
                    rate: 0.5,
                    text: "处决！鲜血飞溅！"
                }
            ],
            loot: {
                exp: 1250,
                money: 6250,
                spiritStones: 12,
                items: [
                    { id: "artifact_scissor_guillotine", count: 1 }
                ]
            }
        }
    },
    "琪琪": {
        name: "琪琪",
        location: "科研机构/实验室",
        type: "social_passive",
        affinity: 0,
        bondLevel: 0,
        profile: "理性与科技的结合，分析心域结构。",
        supportSkills: ["理性分析（降低敌方所有属性 10%）", "精准打击（玩家下次攻击造成真实伤害）"],
        // 战斗数据（普通状态）
        hp: 115,
        maxHp: 115,
        attack: 17,
        defense: 6,
        skills: [
            {
                name: "理性分析",
                damageRate: 1.3,
                rate: 0.25,
                text: "琪琪进行理性分析，找出弱点！"
            }
        ],
        loot: {
            exp: 40,
            money: 80,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【机械降神】琪琪",
            description: "机械降神现世，歼星炮之力觉醒！",
            hp: 1800,
            maxHp: 1800,
            attack: 72,
            defense: 25,
            skills: [
                {
                    name: "歼星炮",
                    damageRate: 2.9,
                    rate: 0.5,
                    text: "歼星炮发射，毁灭一切！"
                }
            ],
            loot: {
                exp: 1200,
                money: 6000,
                spiritStones: 12,
                items: [
                    { id: "artifact_quantum_glasses", count: 1 }
                ]
            }
        }
    },
    "阿澈": {
        name: "阿澈",
        location: "网吧/奶茶店",
        type: "social_neutral",
        affinity: 0,
        bondLevel: 0,
        profile: "退役的电竞心流控制者，善于累积资源。",
        supportSkills: ["资源累积（战斗额外金币 +50%）", "反击预言（反击敌人下次伤害）"],
        // 战斗数据（普通状态）
        hp: 120,
        maxHp: 120,
        attack: 18,
        defense: 6,
        skills: [
            {
                name: "键盘连击",
                damageRate: 1.3,
                rate: 0.3,
                text: "阿澈快速敲击键盘，发动连击！"
            }
        ],
        loot: {
            exp: 40,
            money: 80,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【全知者】阿澈",
            description: "全知者现世，降维打击之力觉醒！",
            hp: 1700,
            maxHp: 1700,
            attack: 68,
            defense: 22,
            skills: [
                {
                    name: "降维打击",
                    damageRate: 2.7,
                    rate: 0.5,
                    text: "降维打击！维度被压缩！"
                }
            ],
            loot: {
                exp: 1150,
                money: 5750,
                spiritStones: 11,
                items: [
                    { id: "artifact_keyboard_warrior_badge", count: 1 }
                ]
            }
        }
    },
    "肉山鸟哥": {
        name: "肉山鸟哥",
        location: "健身房/烧烤摊",
        type: "combat_aggressive",
        affinity: 0,
        bondLevel: 0,
        profile: "肉体与心域的极致防御，坚不可摧的壁垒。",
        supportSkills: ["嘲讽（敌人下回合攻击玩家必定 Miss）", "肉山壁垒（玩家获得临时护盾，吸收 50 点伤害）"],
        // 战斗数据（普通状态）
        hp: 150,
        maxHp: 150,
        attack: 16,
        defense: 12,
        skills: [
            {
                name: "肉山冲击",
                damageRate: 1.3,
                rate: 0.25,
                text: "肉山鸟哥用庞大的身躯冲击！"
            }
        ],
        loot: {
            exp: 50,
            money: 100,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【肉山壁垒】肉山鸟哥",
            description: "肉山壁垒现世，坚不可摧的防御！",
            hp: 2400,
            maxHp: 2400,
            attack: 65,
            defense: 40,
            skills: [
                {
                    name: "绝对防御",
                    damageRate: 1.5,
                    rate: 0.3,
                    text: "绝对防御！所有攻击无效！"
                }
            ],
            loot: {
                exp: 1400,
                money: 7000,
                spiritStones: 14,
                items: []
            }
        }
    },
    "冬瓜哥": {
        name: "冬瓜哥",
        location: "媒体公司/咖啡馆",
        type: "combat_passive",
        affinity: 0,
        bondLevel: 0,
        profile: "毒舌与心念的结合，用言语精准打击弱点。",
        supportSkills: ["毒舌 Debuff（敌方攻击力降低 20%）", "精准破防（玩家下次攻击无视敌方防御）"],
        // 战斗数据（普通状态）
        hp: 110,
        maxHp: 110,
        attack: 17,
        defense: 5,
        skills: [
            {
                name: "毒舌攻击",
                damageRate: 1.3,
                rate: 0.3,
                text: "冬瓜哥用毒舌攻击！"
            }
        ],
        loot: {
            exp: 35,
            money: 60,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【言灵法师】冬瓜哥",
            description: "言灵法师现世，唇枪舌剑之力觉醒！",
            hp: 1600,
            maxHp: 1600,
            attack: 66,
            defense: 20,
            skills: [
                {
                    name: "唇枪舌剑",
                    damageRate: 2.6,
                    rate: 0.45,
                    text: "唇枪舌剑，言语化作利刃！"
                }
            ],
            loot: {
                exp: 1100,
                money: 5500,
                spiritStones: 11,
                items: [
                    { id: "artifact_venom_microphone", count: 1 }
                ]
            }
        }
    },
    
    // ==========================
    // 第一组：都市精英
    // ==========================
    "文婷": {
        name: "文婷",
        location: "金融中心/交易所",
        type: "social_neutral",
        affinity: 0,
        bondLevel: 0,
        profile: "精通量化交易的天才，眼中万物皆数据。",
        supportSkills: ["风险对冲（战斗失败不掉钱）", "杠杆打击（根据持有金币附加伤害）", "牛市信号（全体暴击率大幅提升）"],
        // 战斗数据（普通状态）
        hp: 120,
        maxHp: 120,
        attack: 18,
        defense: 6,
        skills: [
            {
                name: "硬币投掷",
                damageRate: 1.2,
                rate: 0.3,
                text: "文婷投掷硬币攻击！"
            }
        ],
        loot: {
            exp: 40,
            money: 100,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【金钱主宰】文婷",
            description: "金钱主宰现世，市场崩盘之力觉醒！",
            hp: 2200,
            maxHp: 2200,
            attack: 70,
            defense: 25,
            skills: [
                {
                    name: "崩盘熔断",
                    damageRate: 2.8,
                    rate: 0.4,
                    text: "市场崩盘！所有资产瞬间蒸发！"
                },
                {
                    name: "恶意收购",
                    damageRate: 2.0,
                    rate: 0.3,
                    text: "恶意收购！吸取你的生命力！"
                }
            ],
            loot: {
                exp: 1300,
                money: 6500,
                spiritStones: 13,
                items: [
                    { id: "weapon_quant_ruler", count: 1 }
                ]
            }
        }
    },
    "桃汁": {
        name: "桃汁",
        location: "网络咖啡厅/黑客空间",
        type: "passive_support",
        affinity: 0,
        bondLevel: 0,
        profile: "极度社恐的黑客少女，擅长在网络中隐身。",
        supportSkills: ["存在消除（大幅提升玩家闪避）", "防火墙（抵挡一次致命伤害）", "DDOS攻击（使敌人瘫痪一回合）"],
        // 战斗数据（普通状态）
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 5,
        skills: [
            {
                name: "下线遁",
                damageRate: 1.0,
                rate: 0.2,
                text: "桃汁突然下线，躲避攻击！"
            }
        ],
        loot: {
            exp: 30,
            money: 50,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【绝对领域】桃汁",
            description: "绝对领域现世，AT力场展开！",
            hp: 2500,
            maxHp: 2500,
            attack: 50,
            defense: 35,
            skills: [
                {
                    name: "AT力场",
                    damageRate: 1.5,
                    rate: 0.3,
                    text: "AT力场展开！所有攻击被阻挡！"
                },
                {
                    name: "社交恐惧波",
                    damageRate: 2.5,
                    rate: 0.4,
                    text: "社交恐惧波扩散！精神伤害！"
                }
            ],
            loot: {
                exp: 1400,
                money: 7000,
                spiritStones: 14,
                items: [
                    { id: "armor_social_cloak", count: 1 }
                ]
            }
        }
    },
    "小D": {
        name: "小D",
        location: "花店/植物园",
        type: "social_passive",
        affinity: 0,
        bondLevel: 0,
        profile: "经营花店的温柔姐姐，拥有治愈人心的力量。",
        supportSkills: ["草药包扎（回复 20% HP）", "花语祝福（清除所有负面状态）", "生命绽放（满血复活一次）"],
        // 战斗数据（普通状态）
        hp: 150,
        maxHp: 150,
        attack: 15,
        defense: 8,
        skills: [
            {
                name: "修剪枝叶",
                damageRate: 1.1,
                rate: 0.25,
                text: "小D用剪刀修剪，造成轻微伤害！"
            }
        ],
        loot: {
            exp: 50,
            money: 100,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【生命织造者】小D",
            description: "生命织造者现世，万物生长之力觉醒！",
            hp: 3000,
            maxHp: 3000,
            attack: 40,
            defense: 30,
            skills: [
                {
                    name: "荆棘缠绕",
                    damageRate: 1.8,
                    rate: 0.35,
                    text: "荆棘缠绕！持续伤害！"
                },
                {
                    name: "万物生长",
                    damageRate: 2.0,
                    rate: 0.3,
                    text: "万物生长！生命之力爆发！"
                }
            ],
            loot: {
                exp: 1600,
                money: 8000,
                spiritStones: 16,
                items: [
                    { id: "accessory_heal_sachet", count: 1 }
                ]
            }
        }
    },
    
    // ==========================
    // 第二组：夜行者
    // ==========================
    "骏十七": {
        name: "骏十七",
        location: "深夜街头/摩托车行",
        type: "combat_neutral",
        affinity: 0,
        bondLevel: 0,
        profile: "在深夜街头游荡的冷面骑手，像冰块一样冷。",
        supportSkills: ["急冻光环（降低敌方速度）", "冰封凝视（概率冻结敌人）", "绝对零度（对敌方造成真实伤害）"],
        // 战斗数据（普通状态）
        hp: 140,
        maxHp: 140,
        attack: 22,
        defense: 7,
        skills: [
            {
                name: "冷眼",
                damageRate: 1.3,
                rate: 0.3,
                text: "骏十七投来冰冷的眼神！"
            }
        ],
        loot: {
            exp: 45,
            money: 90,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【寒冰君王】十七",
            description: "寒冰君王现世，绝对零度之力觉醒！",
            hp: 1900,
            maxHp: 1900,
            attack: 85,
            defense: 28,
            skills: [
                {
                    name: "冰凌雨",
                    damageRate: 2.7,
                    rate: 0.45,
                    text: "冰凌雨从天而降！无处可逃！"
                },
                {
                    name: "深寒之咬",
                    damageRate: 2.9,
                    rate: 0.4,
                    text: "深寒之咬！冻结一切！"
                }
            ],
            loot: {
                exp: 1250,
                money: 6250,
                spiritStones: 12,
                items: [
                    { id: "weapon_zero_gaze", count: 1 }
                ]
            }
        }
    },
    "李成": {
        name: "李成",
        location: "健身房/训练场",
        type: "combat_aggressive",
        affinity: 0,
        bondLevel: 0,
        profile: "退役特种兵，身手矫健，眼神锐利。",
        supportSkills: ["战术指导（提升玩家命中与攻击）", "火力掩护（反击敌方伤害）", "绝地反攻（血量越低伤害越高）"],
        // 战斗数据（普通状态）
        hp: 160,
        maxHp: 160,
        attack: 20,
        defense: 10,
        skills: [
            {
                name: "擒拿",
                damageRate: 1.4,
                rate: 0.3,
                text: "李成使用擒拿术！"
            }
        ],
        loot: {
            exp: 50,
            money: 100,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【战场武神】李成",
            description: "战场武神现世，战术核显之力觉醒！",
            hp: 2400,
            maxHp: 2400,
            attack: 75,
            defense: 32,
            skills: [
                {
                    name: "战术核显",
                    damageRate: 2.8,
                    rate: 0.5,
                    text: "战术核显！暴击伤害！"
                },
                {
                    name: "弱点看破",
                    damageRate: 2.5,
                    rate: 0.4,
                    text: "弱点看破！无视防御！"
                }
            ],
            loot: {
                exp: 1450,
                money: 7250,
                spiritStones: 14,
                items: [
                    { id: "armor_tactical_vest", count: 1 }
                ]
            }
        }
    },
    "爱坤": {
        name: "爱坤",
        location: "Livehouse/街头舞台",
        type: "social_neutral",
        affinity: 0,
        bondLevel: 0,
        profile: "热爱唱跳的街头偶像，自带 BGM 的男人。",
        supportSkills: ["动感节拍（提升全队速度）", "噪音干扰（降低敌方命中）", "舞台高潮（全屏眩晕+伤害）"],
        // 战斗数据（普通状态）
        hp: 110,
        maxHp: 110,
        attack: 18,
        defense: 5,
        skills: [
            {
                name: "麦克风投掷",
                damageRate: 1.2,
                rate: 0.3,
                text: "爱坤投掷麦克风！"
            }
        ],
        loot: {
            exp: 35,
            money: 60,
            spiritStones: 1
        },
        // 二阶段真身
        trueForm: {
            name: "【雷霆偶像】爱坤",
            description: "雷霆偶像现世，电音轰炸之力觉醒！",
            hp: 1800,
            maxHp: 1800,
            attack: 90,
            defense: 24,
            skills: [
                {
                    name: "电音轰炸",
                    damageRate: 2.9,
                    rate: 0.5,
                    text: "电音轰炸！眩晕+伤害！"
                },
                {
                    name: "闪电舞步",
                    damageRate: 2.6,
                    rate: 0.45,
                    text: "闪电舞步！多段伤害！"
                }
            ],
            loot: {
                exp: 1200,
                money: 6000,
                spiritStones: 12,
                items: [
                    { id: "accessory_rhythm_core", count: 1 }
                ]
            }
        }
    }
};