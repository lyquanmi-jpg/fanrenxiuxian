// ==========================
// 状态管理：玩家数据、背包、装备等
// ==========================

Game.State = {
  // 玩家基础信息
  player: {
      name: "玩家",
      realm: "mortal",  // 当前境界ID
      level: 1,
      exp: 0,
      hp: 120,
      maxHp: 120,
      mp: 50,
      maxMp: 50,
      attack: 15,
      defense: 8,
      critRate: 0.1,
      critDamage: 1.5,
      money: 2000,  // 人民币，用于世俗消费
      spiritStones: 0,  // 灵石，用于修仙交易
      energy: 100,  // 当前精力
      maxEnergy: 100,  // 最大精力
      isBottleneck: false  // 是否遇到瓶颈（需要突破境界）
  },

  // 背包（物品ID -> 数量）
  inventory: {},

  // 装备（槽位 -> 物品ID）
  equipment: {
      weapon: null,
      armor: null,
      accessory: null
  },

  // 游戏进度
  progress: {
      currentChapter: 1,
      currentEventId: "ch1_intro_1",
      defeatedDemons: [],  // 已击败的心魔ID列表
      unlockedAreas: ["南昌·地铁站"],  // 已解锁的区域
      metNpcs: []  // 已遇到的NPC列表
  },

  // 修炼相关
  cultivationExp: 0,

  // 已学会的技能
  learnedSkills: [],

  // 失败感计数器（影响心魔战台词）
  failureCount: 0,

  // 一次性护身符标记（是否装备了一次性护身符）
  hasOneTimeProtection: false,

  // 战斗临时状态（debuff/buff等）
  battleBuffs: {
      hitRateReduction: 0,  // 命中率降低（0-1，例如0.2表示降低20%）
      hitRateReductionTurns: 0,  // 命中率降低剩余回合数
      defenseBonus: 0,  // 防御加成（0-1，例如0.5表示提升50%）
      defenseBonusTurns: 0  // 防御加成剩余回合数
  },

  // NPC 关系数据
  relationships: {},

  // 游戏标志位（用于解锁机制、剧情分支等）
  flags: {},

  // 神兽/灵宠数据
  pet: {
      active: false,  // 是否激活
      id: null,  // 神兽ID
      level: 1,  // 等级
      exp: 0,  // 经验值
      name: "",  // 当前名字（可能被玩家改名）
      affinity: 0  // 好感度
  },

  // 初始化 relationships（确保单一数据源）
  initRelationships: function() {
      if (!this.relationships) {
          this.relationships = {};
      }
      return this.relationships;
  },

  // 初始化 flags（确保单一数据源）
  initFlags: function() {
      if (!this.flags) {
          this.flags = {};
      }
      return this.flags;
  },

  // 添加物品到背包
  addItem: function(itemId, count) {
      if (!Game.Items.byId[itemId]) {
          console.error(`物品 ${itemId} 不存在`);
          return false;
      }
      if (!this.inventory[itemId]) {
          this.inventory[itemId] = 0;
      }
      this.inventory[itemId] += count;
      console.log(`获得物品：${Game.Items.byId[itemId].name} x${count}`);
      return true;
  },

  // 从背包移除物品
  removeItem: function(itemId, count) {
      if (!this.inventory[itemId] || this.inventory[itemId] < count) {
          console.error(`物品 ${itemId} 数量不足`);
          return false;
      }
      this.inventory[itemId] -= count;
      if (this.inventory[itemId] <= 0) {
          delete this.inventory[itemId];
      }
      return true;
  },

  // 检查物品数量
  getItemCount: function(itemId) {
      return this.inventory[itemId] || 0;
  },

  // 改变气血
  changeHP: function(amount) {
      this.player.hp = Math.max(0, Math.min(this.player.maxHp, this.player.hp + amount));
      return this.player.hp;
  },

  // 改变灵力
  changeMP: function(amount) {
      this.player.mp = Math.max(0, Math.min(this.player.maxMp, this.player.mp + amount));
      return this.player.mp;
  },

  // 添加经验并处理升级
  addExp: function(amount) {
      this.player.exp += amount;
      let leveledUp = false;

      // 检查是否升级
      while (true) {
          const expNeeded = Game.CoreConfig.expCurve(this.player.level);
          if (this.player.exp >= expNeeded) {
              this.player.exp -= expNeeded;
              this.player.level++;
              leveledUp = true;
              // 升级时提升属性
              this.player.maxHp += 10;
              this.player.hp = this.player.maxHp;
              this.player.maxMp += 5;
              this.player.mp = this.player.maxMp;
              this.player.attack += 2;
              this.player.defense += 1;
              console.log(`升级！当前等级：${this.player.level}`);
          } else {
              break;
          }
      }

      // 检查是否突破境界
      this.checkRealmBreakthrough();

      return { leveledUp, newLevel: this.player.level };
  },

  // 检查境界突破（经验值满后设置瓶颈，不自动突破）
  checkRealmBreakthrough: function() {
      const currentRealm = Game.CoreConfig.realms.find(r => r.id === this.player.realm);
      if (!currentRealm) return;
      
      const currentRealmIndex = Game.CoreConfig.realms.indexOf(currentRealm);
      
      // 检查是否有下一境界
      if (currentRealmIndex < Game.CoreConfig.realms.length - 1) {
          const nextRealm = Game.CoreConfig.realms[currentRealmIndex + 1];
          const maxLevel = currentRealm.maxLevel || 10; // 默认10级，如果配置中没有maxLevel
          
          // 判定条件：达到当前境界最大等级，且经验值已满（或溢出）
          // 检查当前等级是否达到最大等级
          const reachedMaxLevel = this.player.level >= maxLevel;
          
          // 检查经验值是否已满（计算下一级所需经验）
          const expForNextLevel = Game.CoreConfig.expCurve(this.player.level + 1);
          const expFull = this.player.exp >= expForNextLevel;
          
          if (reachedMaxLevel && expFull) {
              // 达到瓶颈，设置瓶颈标志，不自动突破
              if (!this.player.isBottleneck) {
                  this.player.isBottleneck = true;
                  console.log(`你感觉境界已到瓶颈（${currentRealm.name} ${maxLevel}层圆满），需要主动突破才能进入 ${nextRealm.name}。`);
              }
          } else if (this.player.isBottleneck && (!reachedMaxLevel || !expFull)) {
              // 如果之前设置了瓶颈，但条件不满足，清除瓶颈标志
              this.player.isBottleneck = false;
          }
      }
  },

  // 尝试突破境界（只有在遇到瓶颈时才能调用）
  attemptBreakthrough: function() {
      if (!this.player.isBottleneck) {
          return { success: false, reason: "no_bottleneck", message: "你尚未遇到瓶颈，无法突破境界。" };
      }

      const currentRealm = Game.CoreConfig.realms.find(r => r.id === this.player.realm);
      if (!currentRealm) {
          return { success: false, reason: "invalid_realm", message: "当前境界配置错误。" };
      }

      // 检查是否有突破配置
      if (!currentRealm.breakthrough) {
          return { success: false, reason: "max_realm", message: "你已经达到最高境界，无法继续突破。" };
      }

      const breakthrough = currentRealm.breakthrough;
      const nextRealm = Game.CoreConfig.realms.find(r => r.id === breakthrough.nextRealm);
      
      if (!nextRealm) {
          return { success: false, reason: "invalid_next_realm", message: "下一境界配置错误。" };
      }

      // 检查是否需要道具
      if (breakthrough.reqItem) {
          const itemCount = this.getItemCount(breakthrough.reqItem);
          if (itemCount < 1) {
              const item = Game.Items.byId[breakthrough.reqItem];
              const itemName = item ? item.name : breakthrough.reqItem;
              return { 
                  success: false, 
                  reason: "missing_item", 
                  itemName: itemName,
                  message: `突破需要 ${itemName} x1，但你的背包中没有该物品。` 
              };
          }
      }

      // 消耗道具
      if (breakthrough.reqItem) {
          if (!this.removeItem(breakthrough.reqItem, 1)) {
              return { success: false, reason: "item_consume_failed", message: "消耗道具失败。" };
          }
          console.log(`消耗了 ${Game.Items.byId[breakthrough.reqItem]?.name || breakthrough.reqItem} x1`);
      }

      // 概率判定
      const success = Math.random() < breakthrough.baseChance;

      if (success) {
          // 突破成功
          this.player.realm = nextRealm.id;
          console.log(`境界突破成功！当前境界：${nextRealm.name}`);
          
          // 突破时大幅提升属性（根据境界不同，提升幅度不同）
          const realmIndex = Game.CoreConfig.realms.indexOf(nextRealm);
          const hpBonus = 50 + realmIndex * 20;  // 境界越高，提升越多
          const mpBonus = 30 + realmIndex * 15;
          const attackBonus = 10 + realmIndex * 5;
          const defenseBonus = 5 + realmIndex * 3;
          
          this.player.maxHp += hpBonus;
          this.player.hp = this.player.maxHp;  // 回满气血
          this.player.maxMp += mpBonus;
          this.player.mp = this.player.maxMp;  // 回满灵力
          this.player.attack += attackBonus;
          this.player.defense += defenseBonus;
          
          // 清除瓶颈标志
          this.player.isBottleneck = false;
          
          // 清空溢出的经验
          this.player.exp = 0;

          return { 
              success: true, 
              message: `恭喜！你成功突破到 ${nextRealm.name}！\n\n气血上限 +${hpBonus}，灵力上限 +${mpBonus}，攻击 +${attackBonus}，防御 +${defenseBonus}。`,
              newRealm: nextRealm.name
          };
      } else {
          // 突破失败
          const damageRate = breakthrough.failDamageRate || 0.5;
          const damage = Math.floor(this.player.hp * damageRate);
          this.player.hp = Math.max(1, this.player.hp - damage);  // 至少保留1点气血
          
          console.log(`境界突破失败！受到反噬，损失 ${damage} 点气血。`);

          return { 
              success: false, 
              reason: "breakthrough_failed",
              message: `突破失败！你受到反噬，损失了 ${damage} 点气血。\n\n不要灰心，继续修炼，下次一定能成功！`,
              damage: damage
          };
      }
  },

  // 装备物品（使用 slot 参数）
  equipItem: function(slot, itemId) {
      const item = Game.Items.byId[itemId];
      if (!item || item.type !== "equipment") {
          console.error(`物品 ${itemId} 不能装备`);
          return false;
      }

      // 检查物品类型是否匹配槽位
      if (item.slot !== slot) {
          console.error(`物品 ${itemId} 不能装备到 ${slot} 槽位`);
          return false;
      }

      // 如果该槽位已有装备，先卸下（退回背包）
      if (this.equipment[slot]) {
          const oldItemId = this.equipment[slot];
          this.unequipItem(slot);
      }

      // 检查背包中是否有该物品
      if (!this.removeItem(itemId, 1)) {
          return false;
      }

      // 装备
      this.equipment[slot] = itemId;
      this.applyEquipmentStats(item);
      console.log(`装备了：${item.name}`);
      return true;
  },

  // 卸下装备
  unequipItem: function(slot) {
      const itemId = this.equipment[slot];
      if (!itemId) return false;

      const item = Game.Items.byId[itemId];
      this.removeEquipmentStats(item);
      this.addItem(itemId, 1);
      this.equipment[slot] = null;
      console.log(`卸下了：${item.name}`);
      return true;
  },

  // 应用装备属性（不再直接修改，装备属性在 getTotalStats 中计算）
  applyEquipmentStats: function(item) {
      // 只处理 maxHp 和 maxMp，因为这些会影响当前值
      if (!item.stats) return;
      
      // 根据品质计算实际属性
      const quality = item.quality || "common";
      const actualStats = Game.Items.calculateStatsWithQuality(item.stats, quality);
      
      if (actualStats.maxHp) {
          this.player.maxHp += actualStats.maxHp;
          this.player.hp = Math.min(this.player.hp + actualStats.maxHp, this.player.maxHp);
      }
      if (actualStats.maxMp) {
          this.player.maxMp += actualStats.maxMp;
          this.player.mp = Math.min(this.player.mp + actualStats.maxMp, this.player.maxMp);
      }
  },

  // 移除装备属性
  removeEquipmentStats: function(item) {
      if (!item.stats) return;
      
      // 根据品质计算实际属性
      const quality = item.quality || "common";
      const actualStats = Game.Items.calculateStatsWithQuality(item.stats, quality);
      
      if (actualStats.maxHp) {
          this.player.maxHp -= actualStats.maxHp;
          this.player.hp = Math.min(this.player.hp, this.player.maxHp);
      }
      if (actualStats.maxMp) {
          this.player.maxMp -= actualStats.maxMp;
          this.player.mp = Math.min(this.player.mp, this.player.maxMp);
      }
  },

  // 获取当前有效属性（包含装备加成）
  getEffectiveStats: function() {
      const base = {
          hp: this.player.hp,
          maxHp: this.player.maxHp,
          mp: this.player.mp,
          maxMp: this.player.maxMp,
          attack: this.player.attack,
          defense: this.player.defense,
          critRate: this.player.critRate || 0,
          critDamage: this.player.critDamage || 1.5
      };

      // 应用灵兽好感度加成（暴击率）
      if (this.pet && this.pet.active && this.pet.id) {
          const bonuses = Game.Pets.getAffinityBonuses(this.pet.id);
          bonuses.forEach(bonus => {
              if (bonus.effect.critRate) {
                  base.critRate += bonus.effect.critRate;
              }
          });
      }

      return base;
  },

  // 获取总属性（基础属性 + 装备加成 + 套装效果）
  getTotalStats: function() {
      const base = {
          maxHp: this.player.maxHp,
          maxMp: this.player.maxMp,
          attack: this.player.attack,
          defense: this.player.defense,
          critRate: this.player.critRate || 0,
          critDamage: this.player.critDamage || 1.5
      };

      // 计算装备加成（只计算 attack 和 defense，maxHp/maxMp 已经在装备时直接加到基础值了）
      for (let slot in this.equipment) {
          const itemId = this.equipment[slot];
          if (itemId) {
              const item = Game.Items.byId[itemId];
              if (item && item.stats) {
                  // 根据品质计算实际属性
                  const quality = item.quality || "common";
                  const actualStats = Game.Items.calculateStatsWithQuality(item.stats, quality);
                  
                  if (actualStats.attack) base.attack += actualStats.attack;
                  if (actualStats.defense) base.defense += actualStats.defense;
                  if (actualStats.critRate) base.critRate += actualStats.critRate;
                  if (actualStats.critDamage) base.critDamage += actualStats.critDamage;
              }
          }
      }

      // 应用战斗Buff（防御加成）
      if (this.battleBuffs && this.battleBuffs.defenseBonus > 0) {
          base.defense = Math.floor(base.defense * (1 + this.battleBuffs.defenseBonus));
      }

      // 计算套装效果
      const setEffects = this.getSetEffects();
      if (setEffects.maxHp) base.maxHp += setEffects.maxHp;
      if (setEffects.maxMp) base.maxMp += setEffects.maxMp;
      if (setEffects.attack) base.attack += setEffects.attack;
      if (setEffects.defense) base.defense += setEffects.defense;
      if (setEffects.critRate) base.critRate += setEffects.critRate;
      if (setEffects.critDamage) base.critDamage += setEffects.critDamage;

      // 套装特殊效果（存储在 stats 对象中，供战斗系统使用）
      if (setEffects.hpRegen) base.hpRegen = setEffects.hpRegen;
      if (setEffects.skillDamageBoost) base.skillDamageBoost = setEffects.skillDamageBoost;
      if (setEffects.comboChance) base.comboChance = setEffects.comboChance;

      // 应用灵兽好感度加成
      if (this.pet && this.pet.active && this.pet.id) {
          const bonuses = Game.Pets.getAffinityBonuses(this.pet.id);
          bonuses.forEach(bonus => {
              if (bonus.effect.critRate) {
                  base.critRate += bonus.effect.critRate;
              }
          });
      }

      return base;
  },

  // 获取套装效果
  getSetEffects: function() {
      const effects = {};
      
      // 统计各套装的装备数量
      const setCounts = {};
      for (let slot in this.equipment) {
          const itemId = this.equipment[slot];
          if (itemId) {
              const item = Game.Items.byId[itemId];
              if (item && item.setId) {
                  setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
              }
          }
      }

      // 套装【市井烟火】(3件套)
      const cityLifeCount = setCounts['set_city_life'] || 0;
      if (cityLifeCount >= 2) {
          effects.maxHp = (effects.maxHp || 0) + 200;
      }
      if (cityLifeCount >= 3) {
          effects.hpRegen = 0.05;  // 每次攻击回复 5% 已损生命值
      }

      // 套装【心流涌动】(3件套)
      const mindFlowCount = setCounts['set_mind_flow'] || 0;
      if (mindFlowCount >= 2) {
          effects.maxMp = (effects.maxMp || 0) + 100;
      }
      if (mindFlowCount >= 3) {
          effects.skillDamageBoost = 0.3;  // 技能伤害提升 30%
      }

      // 套装【极速暴走】(3件套)
      const speedForceCount = setCounts['set_speed_force'] || 0;
      if (speedForceCount >= 2) {
          effects.attack = (effects.attack || 0) + 20;
      }
      if (speedForceCount >= 3) {
          effects.comboChance = 0.3;  // 普通攻击有 30% 概率触发连击
      }

      // 套装【都市传说】(3件套)
      const urbanLegendCount = setCounts['set_urban_legend'] || 0;
      if (urbanLegendCount >= 2) {
          effects.moneyBonus = 0.5;  // 战斗金币收益+50%
      }
      if (urbanLegendCount >= 3) {
          effects.hpRegen = (effects.hpRegen || 0) + 0.1;  // 每回合回复 10% 已损生命值
      }

      // 套装【赛博夜行】(3件套)
      const cyberNightCount = setCounts['set_cyber_night'] || 0;
      if (cyberNightCount >= 2) {
          effects.critRate = (effects.critRate || 0) + 0.2;  // 暴击率+20%
      }
      if (cyberNightCount >= 3) {
          effects.stunChance = 0.25;  // 攻击有 25% 概率造成眩晕
      }

      return effects;
  },

  // 获取套装信息（用于 UI 显示）
  getSetInfo: function() {
      const setInfo = {};
      
      // 统计各套装的装备数量
      const setCounts = {};
      const setNames = {
          'set_city_life': '市井烟火',
          'set_mind_flow': '心流涌动',
          'set_speed_force': '极速暴走',
          'set_urban_legend': '都市传说',
          'set_cyber_night': '赛博夜行'
      };
      
      for (let slot in this.equipment) {
          const itemId = this.equipment[slot];
          if (itemId) {
              const item = Game.Items.byId[itemId];
              if (item && item.setId) {
                  setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
              }
          }
      }

      // 构建套装信息
      for (let setId in setCounts) {
          const count = setCounts[setId];
          const setName = setNames[setId] || setId;
          setInfo[setId] = {
              name: setName,
              count: count,
              total: 3
          };
      }

      return setInfo;
  },

  // 获取被动效果（从装备中）
  getPassiveEffects: function() {
      const passives = {
          mpRegen: 0  // 每回合恢复的MP
      };

      // 检查所有装备的被动效果
      for (let slot in this.equipment) {
          const itemId = this.equipment[slot];
          if (itemId) {
              const item = Game.Items.byId[itemId];
              if (item && item.passive) {
                  if (item.passive.mpRegen) {
                      passives.mpRegen += item.passive.mpRegen;
                  }
              }
          }
      }

      return passives;
  },

  // 检查是否可以修炼（检查精力值）
  canCultivate: function() {
      return this.player.energy >= 10;
  },

  // 执行修炼（消耗精力值）
  doCultivate: function() {
      if (!this.canCultivate()) {
          return { success: false, message: "你精神恍惚，无法集中注意力修炼，先休息一下或补充点精力吧。" };
      }

      // 检查灵石是否充足
      if (this.player.spiritStones < 1) {
          return { 
              success: false, 
              message: "灵石不足！修仙乃逆天而行，无资源寸步难行。请去城市探索或战斗获取灵石。" 
          };
      }

      // 消耗10点精力和1枚灵石
      this.player.energy = Math.max(0, this.player.energy - 10);
      this.player.spiritStones = Math.max(0, this.player.spiritStones - 1);
      
      const gainedExp = 3;
      const gainedCultivationExp = 5;
      const gainedMpMax = 2;

      this.cultivationExp += gainedCultivationExp;
      this.player.maxMp += gainedMpMax;
      this.player.mp = Math.min(this.player.mp + gainedMpMax, this.player.maxMp);
      this.addExp(gainedExp);

      const messages = [
          "你在出租屋打坐了一会儿，灵海微微发热。",
          "你按照红姐教的方法调息，感觉灵力在体内流转。",
          "你静心打坐，感受着周围的灵气。",
          "你盘腿而坐，尝试引导体内的灵力。"
      ];
      const message = messages[Math.floor(Math.random() * messages.length)];

      return {
          success: true,
          gainedExp: gainedExp,
          gainedCultivationExp: gainedCultivationExp,
          gainedMpMax: gainedMpMax,
          message: message,
          energyUsed: 10,
          spiritStonesUsed: 1,
          remainingEnergy: this.player.energy,
          remainingSpiritStones: this.player.spiritStones
      };
  },

  // 休息恢复精力
  rest: function() {
      const energyRestored = 30;
      const oldEnergy = this.player.energy;
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + energyRestored);
      const actualRestored = this.player.energy - oldEnergy;
      
      // 恢复50%的最大气血
      const hpRestored = Math.floor(this.player.maxHp * 0.5);
      const oldHp = this.player.hp;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + hpRestored);
      const actualHpRestored = this.player.hp - oldHp;
      
      // 恢复50%的最大灵力
      const mpRestored = Math.floor(this.player.maxMp * 0.5);
      const oldMp = this.player.mp;
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRestored);
      const actualMpRestored = this.player.mp - oldMp;
      
      console.log(`你休息了一会儿，恢复了 ${actualRestored} 点精力，${actualHpRestored} 点气血，${actualMpRestored} 点灵力。`);
      
      return {
          success: true,
          energyRestored: actualRestored,
          hpRestored: actualHpRestored,
          mpRestored: actualMpRestored,
          currentEnergy: this.player.energy,
          maxEnergy: this.player.maxEnergy,
          message: `你回到出租屋睡了一觉，精力和伤势都恢复了不少。`
      };
  },

  // 检查是否已学会技能
  hasSkill: function(skillId) {
      return this.learnedSkills.indexOf(skillId) !== -1;
  },

  // 学习技能
  learnSkill: function(skillId) {
      if (this.hasSkill(skillId)) {
          console.warn(`技能 ${skillId} 已经学会`);
          return false;
      }
      this.learnedSkills.push(skillId);
      console.log(`学会了技能：${skillId}`);
      return true;
  },

  // 使用消耗品或技能书
  useItem: function(itemId) {
      const item = Game.Items.byId[itemId];
      if (!item) {
          console.error(`物品 ${itemId} 不存在`);
          return false;
      }

      // 处理技能书
      if (item.type === "skill_book") {
          if (this.hasSkill(item.skill.id)) {
              console.warn(`技能 ${item.skill.name} 已经学会，无法重复学习`);
              return { success: false, message: "你已经学会这个技能了" };
          }

          if (!this.removeItem(itemId, 1)) {
              return false;
          }

          this.learnSkill(item.skill.id);
          console.log(`学习了技能：${item.skill.name}`);
          return { success: true, item: item, skill: item.skill, message: `你学会了技能：${item.skill.name}` };
      }

      // 处理消耗品
      if (item.type !== "consumable") {
          console.error(`物品 ${itemId} 不能使用`);
          return false;
      }

      if (!this.removeItem(itemId, 1)) {
          return false;
      }

      // 应用效果
      if (item.effect) {
          if (item.effect.hp) {
              this.changeHP(item.effect.hp);
          }
          if (item.effect.mp) {
              this.changeMP(item.effect.mp);
          }
          // 处理直接恢复精力
          if (item.effect.energy) {
              this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + item.effect.energy);
              console.log(`恢复了 ${item.effect.energy} 点精力`);
          }
          // 处理一次性护身符
          if (item.effect.equipOneTimeProtection) {
              this.hasOneTimeProtection = true;
              console.log("装备了一次性护身符，下次受到伤害时将自动抵挡");
          }
      }

      console.log(`使用了：${item.name}`);
      return { success: true, item: item, effect: item.effect };
  },

  // 出售物品（返回原价的60%）
  sellItem: function(itemId, count) {
      const item = Game.Items.byId[itemId];
      if (!item) {
          console.error(`物品 ${itemId} 不存在`);
          return false;
      }

      // 素材物品不可出售
      if (item.type === "material") {
          console.error(`素材物品 ${itemId} 不可出售`);
          return false;
      }

      if (!this.removeItem(itemId, count)) {
          return false;
      }

      // 计算出售价格（原价的60%）
      const sellPrice = Math.floor(item.price * 0.6 * count);
      
      // Todo: 根据物品类型判断使用 money 还是 spiritStones
      // 目前默认使用 money（人民币）
      // 凡人物品交易用 money，修仙物品交易用 spiritStones
      this.player.money += sellPrice;

      console.log(`出售了：${item.name} x${count}，获得 ${sellPrice} 人民币`);
      return { item: item, count: count, money: sellPrice };
  }
};