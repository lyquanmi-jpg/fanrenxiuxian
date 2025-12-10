// ==========================
// 敌人数据：心魔、怪物等
// ==========================

Game.Enemies = {
  byId: {
      // 普通小怪
      "subway_shadow": {
          id: "subway_shadow",
          name: "地铁上的阴影",
          description: "地铁中聚集的负面情绪形成的阴影",
          hp: 85,
          maxHp: 85,
          mp: 25,
          attack: 12,
          defense: 5,
          exp: 40,
          gold: 20,
          spiritStones: 1,  // 掉落1枚灵石（必掉）
          // 掉落列表：{ itemId: 掉落概率(0-1) }
          drops: {
              "shadow_cloak": 0.15  // 阴影斗篷，15%概率
          }
      },
      "overtime_anxiety": {
          id: "overtime_anxiety",
          name: "加班焦虑",
          description: "由工作压力形成的焦虑心魔",
          hp: 80,
          maxHp: 80,
          mp: 30,
          attack: 12,
          defense: 5,
          exp: 50,
          gold: 25,
          spiritStones: 1,  // 掉落1枚灵石（必掉）
          drops: {
              "anxiety_bracelet": 0.12  // 焦虑手环，12%概率
          }
      },
      "client_monster": {
          id: "client_monster",
          name: "甲方怪",
          description: "来自甲方的怨念形成的怪物",
          hp: 120,
          maxHp: 120,
          mp: 40,
          attack: 15,
          defense: 8,
          exp: 80,
          gold: 40,
          spiritStones: 2,  // 掉落2枚灵石（必掉）
          drops: {
              "client_contract_shield": 0.20  // 甲方合同盾，20%概率
          }
      },

      // 第一章心魔BOSS
      "heart_demon_ch1": {
          id: "heart_demon_ch1",
          name: "夜宴心魔·初现",
          description: "从废弃地铁站中诞生的强大心魔，散发着令人不安的气息",
          hp: 240,
          maxHp: 240,
          mp: 80,
          attack: 23,
          defense: 13,
          exp: 150,
          gold: 80,
          spiritStones: 10,  // BOSS掉落10枚灵石
          // 三阶段机制
          phases: [
              {
                  name: "阶段1：喧嚣",
                  hpThreshold: 0.7,  // >70% HP
                  line: "「热闹……你们不是喜欢热闹的吗？」",
                  skill: {
                      name: "噪声侵蚀",
                      effect: "reduceHitRate",
                      value: 0.20  // 降低命中20%
                  }
              },
              {
                  name: "阶段2：恐惧",
                  hpThreshold: 0.3,  // 70%-30% HP
                  line: "「为什么要离开我……你们都会走的。」",
                  skill: {
                      name: "阴影笼罩",
                      effect: "reduceMP",
                      value: 10  // 减少10点MP
                  }
              },
              {
                  name: "阶段3：绝望",
                  hpThreshold: 0.0,  // <30% HP
                  line: "「别……别丢下我一个人……」",
                  skill: {
                      name: "撕裂幻象",
                      effect: "doubleAttack",  // 连击2次
                      value: 2
                  }
              }
          ],
          // BOSS掉落：更高概率，更好装备
          drops: {
              "night_party_mask": 0.35,  // 夜宴面具，35%概率
              "heart_demon_core": 0.25   // 心魔核心，25%概率
          }
      },

      // NPC 心魔 BOSS（后续章节使用）
      "red_sister_demon": {
          id: "red_sister_demon",
          name: "红姐的心魔",
          description: "红姐内心深处的阴影",
          hp: 300,
          maxHp: 300,
          mp: 100,
          attack: 25,
          defense: 15,
          exp: 200,
          gold: 100,
          spiritStones: 8  // 掉落8枚灵石
      },
      "chunxia_demon": {
          id: "chunxia_demon",
          name: "春夏的心魔",
          description: "春夏内心深处的阴影",
          hp: 350,
          maxHp: 350,
          mp: 120,
          attack: 28,
          defense: 18,
          exp: 250,
          gold: 120,
          spiritStones: 10  // 掉落10枚灵石
      },

      // 最终 BOSS
      "owen_demon": {
          id: "owen_demon",
          name: "欧文的心魔",
          description: "欧文内心最深的黑暗，最终BOSS",
          hp: 1000,
          maxHp: 1000,
          mp: 300,
          attack: 50,
          defense: 30,
          exp: 1000,
          gold: 500,
          spiritStones: 50  // 最终BOSS掉落50枚灵石
      }
  }
};