// ==========================
// 神兽/灵宠系统：数据定义
// ==========================

Game.Pets = {
  byId: {
      "white_tiger_cub": {
          id: "white_tiger_cub",
          name: "小白",  // 初始名字
          trueName: "庚金白虎·幼崽",  // 觉醒名字
          description: "一只看起来有点凶萌的白色小猫，眼神里透着威严。",
          baseAttack: 10,  // 基础攻击
          growthRate: 1.5,  // 升级成长率（每级增加 baseAttack * growthRate）
          skill: {
              name: "虎啸",
              effect: "damage",  // 纯伤害或带晕眩
              rate: 0.3,  // 30% 概率触发特殊技能
              damageMultiplier: 1.5  // 技能伤害倍率
          },
          // 好感度加成配置
          affinityBonuses: [
              {
                  threshold: 50,
                  name: "白虎之瞳",
                  effect: { critRate: 0.05 },
                  description: "主角暴击率 +5%"
              },
              {
                  threshold: 100,
                  name: "兽王威压",
                  effect: { startShield: 0.1 },
                  description: "战斗开始时获得 10% 最大气血的护盾"
              }
          ]
      }
  },

  // 获取神兽数据
  get: function(petId) {
      return this.byId[petId] || null;
  },

  // 计算神兽当前攻击力
  calculateAttack: function(petId, level) {
      const pet = this.get(petId);
      if (!pet) return 0;
      
      return Math.floor(pet.baseAttack + (level - 1) * pet.baseAttack * pet.growthRate);
  },

  // 喂食物品给灵兽（支持批量）
  feed: function(itemId, amount) {
      const pet = Game.State.pet;
      if (!pet || !pet.active) {
          return { success: false, message: "灵兽未激活" };
      }

      const item = Game.Items.byId[itemId];
      if (!item) {
          return { success: false, message: "物品不存在" };
      }

      // 检查物品数量
      const itemCount = Game.State.getItemCount(itemId);
      if (itemCount < 1) {
          return { success: false, message: "物品数量不足" };
      }

      // 过滤掉任务物品和关键道具
      if (item.type === "quest" || itemId === "spell_book_qi_blast" || itemId === "foundation_pill") {
          return { success: false, message: "该物品无法喂食" };
      }

      // 确定实际喂食数量
      const actualAmount = Math.min(amount || 1, itemCount);
      if (actualAmount < 1) {
          return { success: false, message: "喂食数量无效" };
      }

      // 计算单个物品的经验值（物品价格 / 10，最低1点）
      const expPerItem = Math.max(1, Math.floor((item.price || 10) / 10));
      
      // 检查等级限制
      const playerLevel = Game.State.player.level;
      const isLevelCapped = pet.level >= playerLevel;

      // 智能批量处理
      let totalExpGain = 0;
      let totalAffinityGain = 0;
      let actualConsumed = 0;
      let levelUpCount = 0;
      const initialLevel = pet.level;

      for (let i = 0; i < actualAmount; i++) {
          // 检查是否达到等级上限
          if (pet.level >= playerLevel) {
              // 达到上限，只加好感度
              pet.affinity = (pet.affinity || 0) + 1;
              totalAffinityGain += 1;
              actualConsumed += 1;
              Game.State.removeItem(itemId, 1);
          } else {
              // 未达到上限，加经验和好感度
              pet.exp = (pet.exp || 0) + expPerItem;
              pet.affinity = (pet.affinity || 0) + 1;
              totalExpGain += expPerItem;
              totalAffinityGain += 1;
              actualConsumed += 1;
              
              // 检查是否升级
              const maxExp = pet.level * 100;
              if (pet.exp >= maxExp) {
                  pet.level += 1;
                  pet.exp = 0;
                  levelUpCount += 1;
                  
                  // 如果升级后达到上限，停止消耗剩余物品
                  if (pet.level >= playerLevel) {
                      break;
                  }
              }
              
              Game.State.removeItem(itemId, 1);
          }
      }

      // 构建反馈消息
      let message = "";
      if (actualAmount === 1) {
          if (isLevelCapped) {
              message = `${pet.name || "小白"}一口吞下了【${item.name}】，【${item.name}】化作点点灵光消散了。\n\n小白的境界受限于主人，无法继续突破。好感度+1。`;
          } else {
              let levelUpMessage = levelUpCount > 0 ? `\n\n🎉 ${pet.name || "小白"}升级了！当前等级：Lv.${pet.level}` : "";
              message = `${pet.name || "小白"}一口吞下了【${item.name}】，【${item.name}】化作点点灵光消散了。经验+${expPerItem}，好感度+1。${levelUpMessage}`;
          }
      } else {
          let levelUpMessage = levelUpCount > 0 ? `\n\n🎉 ${pet.name || "小白"}升级了${levelUpCount}次！当前等级：Lv.${pet.level}` : "";
          if (isLevelCapped && pet.level >= playerLevel) {
              message = `${pet.name || "小白"}一口气吞下了 ${actualConsumed} 个【${item.name}】！\n\n小白的境界受限于主人，无法继续突破。好感度+${totalAffinityGain}。${levelUpMessage}`;
          } else {
              message = `${pet.name || "小白"}一口气吞下了 ${actualConsumed} 个【${item.name}】！经验+${totalExpGain}，好感度+${totalAffinityGain}。${levelUpMessage}`;
          }
      }

      // 保存游戏
      if (Game.Save) {
          Game.Save.save();
      }

      return { success: true, message: message, consumed: actualConsumed };
  },

  // 获取好感度加成效果
  getAffinityBonuses: function(petId) {
      const pet = this.get(petId);
      if (!pet || !pet.affinityBonuses) return [];
      
      const petState = Game.State.pet;
      if (!petState || !petState.active) return [];
      
      const affinity = petState.affinity || 0;
      return pet.affinityBonuses.filter(bonus => affinity >= bonus.threshold);
  }
};

