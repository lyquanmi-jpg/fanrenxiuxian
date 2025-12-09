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
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 10,
      defense: 5,
      critRate: 0.05,
      critDamage: 1.5,
      gold: 100
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
  dailyCultivateCount: 0,

  // 已学会的技能
  learnedSkills: [],

  // 失败感计数器（影响心魔战台词）
  failureCount: 0,

  // 一次性护身符标记（是否装备了一次性护身符）
  hasOneTimeProtection: false,

  // 战斗临时状态（debuff等）
  battleBuffs: {
      hitRateReduction: 0,  // 命中率降低（0-1，例如0.2表示降低20%）
      hitRateReductionTurns: 0  // 命中率降低剩余回合数
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

  // 检查境界突破
  checkRealmBreakthrough: function() {
      const currentRealm = Game.CoreConfig.realms.find(r => r.id === this.player.realm);
      const currentRealmIndex = Game.CoreConfig.realms.indexOf(currentRealm);
      
      if (currentRealmIndex < Game.CoreConfig.realms.length - 1) {
          const nextRealm = Game.CoreConfig.realms[currentRealmIndex + 1];
          if (this.player.level >= nextRealm.expRequired / 100) {  // 简化判断
              this.player.realm = nextRealm.id;
              console.log(`境界突破！当前境界：${nextRealm.name}`);
              // 突破时大幅提升属性
              this.player.maxHp += 50;
              this.player.hp = this.player.maxHp;
              this.player.maxMp += 30;
              this.player.mp = this.player.maxMp;
              this.player.attack += 10;
              this.player.defense += 5;
          }
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
      return {
          hp: this.player.hp,
          maxHp: this.player.maxHp,
          mp: this.player.mp,
          maxMp: this.player.maxMp,
          attack: this.player.attack,
          defense: this.player.defense,
          critRate: this.player.critRate,
          critDamage: this.player.critDamage
      };
  },

  // 获取总属性（基础属性 + 装备加成）
  getTotalStats: function() {
      const base = {
          maxHp: this.player.maxHp,
          maxMp: this.player.maxMp,
          attack: this.player.attack,
          defense: this.player.defense
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
              }
          }
      }

      return base;
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

  // 检查是否可以修炼
  canCultivate: function() {
      return this.dailyCultivateCount < 10;
  },

  // 执行修炼
  doCultivate: function() {
      if (!this.canCultivate()) {
          return { success: false, message: "今天状态不佳，修炼收获有限，明天再试吧。" };
      }

      this.dailyCultivateCount++;
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
          message: message
      };
  },

  // 重置每日修炼次数
  resetDailyCultivateCount: function() {
      this.dailyCultivateCount = 0;
      console.log("修炼次数已重置");
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
          if (item.effect.resetCultivateCount) {
              this.resetDailyCultivateCount();
              if (item.effect.gainCultivationExp) {
                  this.cultivationExp += item.effect.gainCultivationExp;
              }
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

      if (!this.removeItem(itemId, count)) {
          return false;
      }

      // 计算出售价格（原价的60%）
      const sellPrice = Math.floor(item.price * 0.6 * count);
      this.player.gold += sellPrice;

      console.log(`出售了：${item.name} x${count}，获得 ${sellPrice} 金币`);
      return { item: item, count: count, gold: sellPrice };
  }
};