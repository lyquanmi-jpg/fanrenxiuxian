// ==========================
// 物品数据：消耗品、装备等
// ==========================

Game.Items = {
  // 装备品质系统
  Quality: {
      common: { id: "common", name: "普通", color: "#ffffff", multiplier: 1.0 },      // 白色
      good: { id: "good", name: "不错", color: "#4cff4c", multiplier: 1.2 },          // 绿色
      rare: { id: "rare", name: "稀有", color: "#4c9eff", multiplier: 1.5 },        // 蓝色
      epic: { id: "epic", name: "传说", color: "#ff9e4c", multiplier: 2.0 },         // 橙色
      legendary: { id: "legendary", name: "传奇", color: "#ff4c4c", multiplier: 3.0 } // 红色
  },

  // 获取品质信息
  getQuality: function(qualityId) {
      return this.Quality[qualityId] || this.Quality.common;
  },

  // 根据品质计算实际属性
  calculateStatsWithQuality: function(baseStats, qualityId) {
      const quality = this.getQuality(qualityId);
      const multiplier = quality.multiplier;
      
      const result = {};
      for (let stat in baseStats) {
          if (typeof baseStats[stat] === "number") {
              result[stat] = Math.floor(baseStats[stat] * multiplier);
          } else {
              result[stat] = baseStats[stat];
          }
      }
      return result;
  },

  byId: {
      // 消耗品
      "basic_pill_hp": {
          id: "basic_pill_hp",
          name: "止痛灵片",
          type: "consumable",
          description: "加班人手必备，算半个凡人修仙常备丹。",
          price: 30,
          effect: { hp: 40 }
      },
      "basic_pill_mp": {
          id: "basic_pill_mp",
          name: "提神丹",
          type: "consumable",
          description: "便利店常见提神用品，略微恢复灵力。",
          price: 30,
          effect: { mp: 30 }
      },
      "instant_noodles": {
          id: "instant_noodles",
          name: "泡面",
          type: "consumable",
          description: "最基础的恢复道具，回复少量气血。",
          price: 15,
          effect: { hp: 20 }
      },
      "spirit_stone_reset": {
          id: "spirit_stone_reset",
          name: "灵石·静心符",
          type: "consumable",
          description: "末法时代难得一见的灵石符箓，可以强行抚平一天的疲惫，让你重新进入修炼状态。",
          price: 80,
          effect: { resetCultivateCount: true, gainCultivationExp: 5 }
      },
      "gift_general": {
          id: "gift_general",
          name: "心意礼盒",
          type: "consumable",
          description: "通用礼物，可以增加 NPC 好感度。",
          price: 30,
          effect: {} // 效果将由 NPC 交互系统处理
      },
      "spell_book_qi_blast": {
          id: "spell_book_qi_blast",
          name: "《基础灵力弹》",
          type: "skill_book",
          description: "一本破旧的功法秘籍，记载着基础的灵力攻击法术。使用后可学会消耗灵力的攻击技能。",
          price: 0,
          skill: {
              id: "qi_blast",
              name: "灵力弹",
              mpCost: 15,
              damageMultiplier: 1.5,
              description: "消耗15点灵力，造成1.5倍攻击力的伤害"
          }
      },
      "red_potion": {
          id: "red_potion",
          name: "红药水",
          type: "consumable",
          description: "回复 50 点气血",
          price: 20,
          effect: { hp: 50 }
      },
      "blue_potion": {
          id: "blue_potion",
          name: "蓝药水",
          type: "consumable",
          description: "回复 30 点灵力",
          price: 25,
          effect: { mp: 30 }
      },
      "coffee": {
          id: "coffee",
          name: "咖啡",
          type: "consumable",
          description: "提神醒脑，回复 20 点气血和 10 点灵力",
          price: 15,
          effect: { hp: 20, mp: 10 }
      },
      "milk_tea": {
          id: "milk_tea",
          name: "奶茶",
          type: "consumable",
          description: "甜腻的奶茶，回复 30 点气血",
          price: 18,
          effect: { hp: 30 }
      },
      "pork_rib_rice": {
          id: "pork_rib_rice",
          name: "排骨饭",
          type: "consumable",
          description: "南昌特色，回复 60 点气血",
          price: 25,
          effect: { hp: 60 }
      },

      // 装备 - 武器
      "starter_sword": {
          id: "starter_sword",
          name: "二手水果刀",
          type: "equipment",
          slot: "weapon",
          description: "从租房原房东那里扒拉出来的二手水果刀，被你当成了法器胚子。",
          price: 50,
          quality: "common",  // 白色普通
          stats: { attack: 5 }
      },
      "basic_sword": {
          id: "basic_sword",
          name: "基础法剑",
          type: "equipment",
          slot: "weapon",
          description: "最基础的法器，略微提升攻击力",
          price: 100,
          quality: "common",  // 白色普通
          stats: { attack: 5 }
      },
      "spirit_sword": {
          id: "spirit_sword",
          name: "灵剑",
          type: "equipment",
          slot: "weapon",
          description: "蕴含灵力的剑，大幅提升攻击力",
          price: 500,
          quality: "good",  // 绿色不错
          stats: { attack: 15, critRate: 0.1 }
      },

      // 装备 - 防具
      "cheap_armor": {
          id: "cheap_armor",
          name: "地摊货外套",
          type: "equipment",
          slot: "armor",
          description: "在夜市买的便宜外套，聊胜于无的防护。",
          price: 40,
          quality: "common",  // 白色普通
          stats: { defense: 3, maxHp: 15 }
      },
      "basic_armor": {
          id: "basic_armor",
          name: "基础道袍",
          type: "equipment",
          slot: "armor",
          description: "简单的道袍，略微提升防御",
          price: 80,
          quality: "common",  // 白色普通
          stats: { defense: 5, maxHp: 20 }
      },
      "spirit_robe": {
          id: "spirit_robe",
          name: "灵袍",
          type: "equipment",
          slot: "armor",
          description: "蕴含灵力的道袍，提升防御和气血上限",
          price: 400,
          quality: "good",  // 绿色不错
          stats: { defense: 12, maxHp: 50 }
      },

      // 装备 - 饰品
      "phone_case": {
          id: "phone_case",
          name: "手机壳·灵器化",
          type: "equipment",
          slot: "accessory",
          description: "被灵力加持的手机壳，提升暴击率",
          price: 200,
          quality: "good",  // 绿色不错
          stats: { critRate: 0.15 }
      },
      "earphone": {
          id: "earphone",
          name: "耳机·精神防御",
          type: "equipment",
          slot: "accessory",
          description: "能抵御精神攻击的耳机",
          price: 300,
          quality: "good",  // 绿色不错
          stats: { defense: 8, maxMp: 30 }
      },
      "talisman": {
          id: "talisman",
          name: "护身符",
          type: "equipment",
          slot: "accessory",
          description: "简单的护身符，提升气血和灵力上限",
          price: 150,
          quality: "common",  // 白色普通
          stats: { maxHp: 30, maxMp: 20 }
      },
      
      // 新探索事件物品
      "bottled_talisman_water": {
          id: "bottled_talisman_water",
          name: "瓶装符水",
          type: "consumable",
          description: "路边捡到的符水，看起来是某个散修留下的，能恢复少量气血。",
          price: 20,
          effect: { hp: 30 }
      },
      "broken_spirit_stone": {
          id: "broken_spirit_stone",
          name: "破碎灵石碎片",
          type: "equipment",
          slot: "accessory",
          description: "一块破碎的灵石碎片，虽然残破，但依然能缓慢恢复灵力。装备后每回合恢复1点灵力。",
          price: 0,
          quality: "common",  // 白色普通
          stats: {},
          passive: { mpRegen: 1 }  // 每回合恢复1点MP
      },
      "one_time_protection_talisman": {
          id: "one_time_protection_talisman",
          name: "散修护身符（一次性）",
          type: "consumable",
          description: "遛狗大爷给你的护身符，能在战斗中抵挡一次伤害。使用后装备，受到伤害时自动触发。",
          price: 0,
          effect: { equipOneTimeProtection: true }  // 装备一次性护身符
      },
      
      // 敌人掉落装备
      "shadow_cloak": {
          id: "shadow_cloak",
          name: "阴影斗篷",
          type: "equipment",
          slot: "armor",
          description: "从地铁阴影中凝聚而成的斗篷，散发着微弱的负面情绪。能提升防御和灵力上限。",
          price: 120,
          quality: "good",  // 绿色不错（小怪掉落）
          stats: { defense: 6, maxMp: 25 }
      },
      "anxiety_bracelet": {
          id: "anxiety_bracelet",
          name: "焦虑手环",
          type: "equipment",
          slot: "accessory",
          description: "由加班焦虑凝聚而成的手环，虽然带来压力，但也能激发潜能。提升攻击和暴击率。",
          price: 100,
          quality: "good",  // 绿色不错（小怪掉落）
          stats: { attack: 4, critRate: 0.08 }
      },
      "client_contract_shield": {
          id: "client_contract_shield",
          name: "甲方合同盾",
          type: "equipment",
          slot: "armor",
          description: "由甲方怨念形成的防护装备，虽然沉重但防御力不错。提升大量防御和气血上限。",
          price: 180,
          quality: "rare",  // 蓝色稀有（中等敌人掉落）
          stats: { defense: 10, maxHp: 40 }
      },
      "night_party_mask": {
          id: "night_party_mask",
          name: "夜宴面具",
          type: "equipment",
          slot: "accessory",
          description: "从夜宴心魔中诞生的面具，散发着永不停止的派对气息。大幅提升暴击率和灵力上限。",
          price: 350,
          quality: "epic",  // 橙色传说（BOSS掉落）
          stats: { critRate: 0.20, maxMp: 40, attack: 3 }
      },
      "heart_demon_core": {
          id: "heart_demon_core",
          name: "心魔核心",
          type: "equipment",
          slot: "accessory",
          description: "心魔被击败后留下的核心，蕴含着强大的负面情绪力量。提升攻击、防御和气血上限。",
          price: 400,
          quality: "legendary",  // 红色传奇（BOSS核心掉落）
          stats: { attack: 8, defense: 6, maxHp: 50 }
      },
      "artifact_red_wine_glass": {
          id: "artifact_red_wine_glass",
          name: "绯红酒杯",
          type: "equipment",
          slot: "accessory",
          description: "红姐的随身法宝，蕴含着令人迷醉的危险力量。大幅提升攻击力，并具有吸血效果。",
          price: 2000,
          quality: "legendary",  // 红色传奇（真身掉落）
          stats: { attack: 20, maxHp: 200 }  // 攻击+20，气血+200（吸血效果暂用HP代替）
      },
      
      // ==========================
      // 套装【市井烟火】(3件套)
      // ==========================
      "artifact_dragon_tooth_skewer": {
          id: "artifact_dragon_tooth_skewer",
          name: "龙牙烤串刀",
          type: "equipment",
          slot: "weapon",
          description: "白猫的专属神器，用龙牙制成的烤串刀，散发着诱人的香气。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 60, critRate: 0.1 },
          setId: "set_city_life"
      },
      "artifact_bath_emperor_robe": {
          id: "artifact_bath_emperor_robe",
          name: "浴皇大帝袍",
          type: "equipment",
          slot: "armor",
          description: "彬彬的专属神器，浴皇大帝的御用道袍，水汽缭绕。",
          price: 3000,
          quality: "legendary",
          stats: { defense: 40, maxHp: 300 },
          setId: "set_city_life"
      },
      "artifact_keyboard_warrior_badge": {
          id: "artifact_keyboard_warrior_badge",
          name: "键盘侠徽章",
          type: "equipment",
          slot: "accessory",
          description: "阿澈的专属神器，键盘侠的象征，能提升反应速度。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 10, critRate: 0.05 },
          setId: "set_city_life"
      },
      
      // ==========================
      // 套装【心流涌动】(3件套)
      // ==========================
      "artifact_phantom_ribbon": {
          id: "artifact_phantom_ribbon",
          name: "幻舞飘带",
          type: "equipment",
          slot: "weapon",
          description: "春夏的专属神器，如幻如梦的飘带，舞动时能迷惑敌人。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 50, critRate: 0.1 },
          setId: "set_mind_flow"
      },
      "artifact_painting_plate": {
          id: "artifact_painting_plate",
          name: "画魂板甲",
          type: "equipment",
          slot: "armor",
          description: "欧文的专属神器，将心象具现的板甲，防御力惊人。",
          price: 3000,
          quality: "legendary",
          stats: { defense: 30, maxMp: 100 },
          setId: "set_mind_flow"
      },
      "artifact_truth_lens": {
          id: "artifact_truth_lens",
          name: "真理镜头",
          type: "equipment",
          slot: "accessory",
          description: "阳阳的专属神器，能捕捉真实瞬间的镜头，提升洞察力。",
          price: 3000,
          quality: "legendary",
          stats: { critRate: 0.15, critDamage: 0.1 },
          setId: "set_mind_flow"
      },
      
      // ==========================
      // 套装【极速暴走】(3件套)
      // ==========================
      "artifact_burning_whip": {
          id: "artifact_burning_whip",
          name: "灼热舞鞭",
          type: "equipment",
          slot: "weapon",
          description: "JOJO姐的专属神器，燃烧着心火的舞鞭，攻击力极高。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 70 },
          setId: "set_speed_force"
      },
      "artifact_training_armor": {
          id: "artifact_training_armor",
          name: "甚至练出了铠甲",
          type: "equipment",
          slot: "armor",
          description: "白米饭的专属神器，极致修炼后形成的铠甲，防御力惊人。",
          price: 3000,
          quality: "legendary",
          stats: { defense: 50 },
          setId: "set_speed_force"
      },
      "artifact_wind_thunder_ring": {
          id: "artifact_wind_thunder_ring",
          name: "风雷机车戒",
          type: "equipment",
          slot: "accessory",
          description: "小微姐的专属神器，风雷之力凝聚的戒指，提升速度和闪避。",
          price: 3000,
          quality: "legendary",
          stats: { critRate: 0.1, critDamage: 0.1 },
          setId: "set_speed_force"
      },
      
      // ==========================
      // 散件神器（独立强力装备）
      // ==========================
      "artifact_venom_microphone": {
          id: "artifact_venom_microphone",
          name: "毒舌麦克风",
          type: "equipment",
          slot: "weapon",
          description: "冬瓜哥的专属神器，能发出毒舌攻击的麦克风，附带沉默效果。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 55 },
          specialEffect: "silence"  // 沉默效果
      },
      "artifact_scissor_guillotine": {
          id: "artifact_scissor_guillotine",
          name: "剪刀断头台",
          type: "equipment",
          slot: "weapon",
          description: "奇奇的专属神器，危险的剪刀，攻击力极高但会消耗自身生命。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 80 },
          specialEffect: "selfDamage"  // 扣除自身10% HP上限
      },
      "artifact_quantum_glasses": {
          id: "artifact_quantum_glasses",
          name: "量子眼镜",
          type: "equipment",
          slot: "accessory",
          description: "琪琪的专属神器，能看穿一切防御的量子眼镜。",
          price: 3000,
          quality: "legendary",
          stats: { critRate: 0.2 }  // 破防+20% 用暴击率表示
      },
      
      // ==========================
      // 套装【都市传说】(3件套)
      // ==========================
      "weapon_quant_ruler": {
          id: "weapon_quant_ruler",
          name: "量化计算尺",
          type: "equipment",
          slot: "weapon",
          description: "文婷的专属神器，能精确计算并偷取金币的量化工具。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 55 },
          setId: "set_urban_legend",
          specialEffect: "stealMoney"  // 每次攻击偷取 10-20 金币
      },
      "armor_social_cloak": {
          id: "armor_social_cloak",
          name: "社恐隐身衣",
          type: "equipment",
          slot: "armor",
          description: "桃汁的专属神器，能让穿戴者隐身的社恐神器。",
          price: 3000,
          quality: "legendary",
          stats: { defense: 35 },
          setId: "set_urban_legend",
          specialEffect: "dodge"  // 闪避+15%
      },
      "accessory_heal_sachet": {
          id: "accessory_heal_sachet",
          name: "治愈香囊",
          type: "equipment",
          slot: "accessory",
          description: "小D的专属神器，散发着治愈香气的香囊。",
          price: 3000,
          quality: "legendary",
          stats: { maxHp: 400 },
          setId: "set_urban_legend",
          passive: { hpRegen: 20 }  // 每回合回血 20
      },
      
      // ==========================
      // 套装【赛博夜行】(3件套)
      // ==========================
      "weapon_zero_gaze": {
          id: "weapon_zero_gaze",
          name: "零度凝视",
          type: "equipment",
          slot: "weapon",
          description: "骏十七的专属神器，冰冷的凝视能冻结一切。",
          price: 3000,
          quality: "legendary",
          stats: { attack: 75 },
          setId: "set_cyber_night",
          specialEffect: "freeze"  // 攻击有 20% 概率冰冻敌人
      },
      "armor_tactical_vest": {
          id: "armor_tactical_vest",
          name: "战术背心",
          type: "equipment",
          slot: "armor",
          description: "李成的专属神器，军用级战术背心，提供强大防护。",
          price: 3000,
          quality: "legendary",
          stats: { defense: 45 },
          setId: "set_cyber_night",
          specialEffect: "critResist"  // 暴击抗性+20%
      },
      "accessory_rhythm_core": {
          id: "accessory_rhythm_core",
          name: "律动核心",
          type: "equipment",
          slot: "accessory",
          description: "爱坤的专属神器，电音律动的核心，提升暴击伤害。",
          price: 3000,
          quality: "legendary",
          stats: { critDamage: 0.5 },
          setId: "set_cyber_night"
      }
  },

  // 根据类型获取物品列表
  getByType: function(type) {
      const result = [];
      for (let id in this.byId) {
          if (this.byId[id].type === type) {
              result.push(this.byId[id]);
          }
      }
      return result;
  }
};