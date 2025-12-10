// ==========================
// 社交系统：NPC 羁绊与交互
// ==========================

Game.Social = {
  // 羁绊等级门槛
  BOND_THRESHOLDS: {
    1: 30,   // Level 1: 解锁支援技能
    2: 70,   // Level 2: 支援概率增加，支援技能强化
    3: 150,  // Level 3: 解锁专属光环，支援技能再强化
    MAX: 300 // Level MAX: 解锁 '满血复活' 终极支援
  },

  // 获取 NPC 数据
  getNPCData: function(npcId) {
      // 从 npcs.js 中获取
      if (typeof npcData !== 'undefined' && npcData[npcId]) {
          return npcData[npcId];
      }
      // 如果 npcData 未定义，尝试从 Game.NPCs
      if (Game.NPCs && Game.NPCs.byId && Game.NPCs.byId[npcId]) {
          return Game.NPCs.byId[npcId];
      }
      console.error(`NPC ${npcId} 不存在`);
      return null;
  },

  // 解锁 NPC
  meetNPC: function(npcId) {
      // 强制初始化，防止报错
      if (!Game.State.relationships) {
          Game.State.relationships = {};
      }

      // 从配置中读取初始数据
      const npc = this.getNPCData(npcId);
      if (!npc) {
          console.error(`未找到 NPC 配置: ${npcId}`);
          return false;
      }

      // 如果还没认识，才添加
      if (!Game.State.relationships[npcId]) {
          Game.State.relationships[npcId] = {
              affinity: npc.affinity || 0,  // 读取默认好感
              bondLevel: npc.bondLevel || 0,
              met: true
          };
          console.log(`成功结识 NPC: ${npcId} (${npc.name})`);
          
          // 立即刷新UI
          if (Game.UI && Game.UI.renderMenuContent) {
              Game.UI.renderMenuContent();
          }
          return true;
      } else {
          // 如果已存在，确保 met 标记为 true
          Game.State.relationships[npcId].met = true;
          console.log(`NPC ${npcId} 已存在，更新 met 标记`);
          return true;
      }
  },

  // 改变好感度
  changeAffinity: function(npcId, amount) {
      if (!Game.State.relationships) {
          Game.State.relationships = {};
      }

      if (!Game.State.relationships[npcId]) {
          this.meetNPC(npcId);
      }

      const relationship = Game.State.relationships[npcId];
      const oldAffinity = relationship.affinity;
      relationship.affinity = Math.max(0, Math.min(1000, relationship.affinity + amount));

      // 检查羁绊等级升级
      const oldLevel = relationship.bondLevel;
      let newLevel = 0;
      if (relationship.affinity >= this.BOND_THRESHOLDS.MAX) {
          newLevel = 'MAX';
      } else if (relationship.affinity >= this.BOND_THRESHOLDS[3]) {
          newLevel = 3;
      } else if (relationship.affinity >= this.BOND_THRESHOLDS[2]) {
          newLevel = 2;
      } else if (relationship.affinity >= this.BOND_THRESHOLDS[1]) {
          newLevel = 1;
      }

      relationship.bondLevel = newLevel;

      // 如果升级了，显示提示
      if (newLevel !== oldLevel && newLevel !== relationship.bondLevel) {
          const npc = this.getNPCData(npcId);
          if (npc) {
              console.log(`【羁绊升级】与 ${npc.name} 的羁绊等级提升到 Level ${newLevel === 'MAX' ? 'MAX' : newLevel}！`);
          }
      }

      return {
          oldAffinity: oldAffinity,
          newAffinity: relationship.affinity,
          oldLevel: oldLevel,
          newLevel: newLevel,
          leveledUp: newLevel !== oldLevel
      };
  },

  // 计算送礼效果
  getGiftEffect: function(npcId, itemId) {
      const npc = this.getNPCData(npcId);
      if (!npc) return null;

      const item = Game.Items.byId[itemId];
      if (!item) return null;

      // 基础好感度增加（根据物品价格）
      let baseAffinity = Math.floor(item.price * 0.5);
      
      // 特殊物品可能有额外加成
      if (itemId === "gift_general") {
          baseAffinity = 20; // 通用礼盒固定值
      }

      // 根据 NPC 类型调整
      if (npc.type === "social_neutral" || npc.type === "social_passive") {
          baseAffinity = Math.floor(baseAffinity * 1.5); // 社交型 NPC 更容易提升好感
      }

      return {
          affinity: baseAffinity,
          message: `${npc.name} 收到了你的礼物，好感度 +${baseAffinity}`
      };
  },

  // 计算切磋后的好感度变化
  getCombatReaction: function(npcId, isWin) {
      const npc = this.getNPCData(npcId);
      if (!npc) return null;

      let affinityChange = 0;
      let message = "";

      // 根据 NPC 类型调整数值
      switch (npc.type) {
          case "combat_aggressive":
              // 战斗狂：无论胜负都增加好感（胜利更多）
              if (isWin) {
                  affinityChange = 25;
                  message = "你的实力赢得了对方的尊重！";
              } else {
                  affinityChange = 5;
                  message = "对方觉得你还需要努力。";
              }
              break;

          case "combat_neutral":
              // 中性战斗：胜利增加，失败减少
              affinityChange = isWin ? 20 : -10;
              message = isWin 
                  ? "你的实力赢得了对方的尊重！"
                  : "对方对你的弱小感到失望。";
              break;

          case "combat_hostile":
              // 敌对战斗：胜利大幅增加，失败大幅减少
              affinityChange = isWin ? 30 : -20;
              message = isWin
                  ? "你的实力赢得了对方的尊重！"
                  : "对方对你的弱小感到失望。";
              break;

          case "passive_support":
          case "social_passive":
              // 被动/社交型：不喜欢战斗，失败大幅减少
              affinityChange = isWin ? 5 : -15;
              message = isWin
                  ? `${npc.name} 虽然不喜欢战斗，但认可你的实力。`
                  : `${npc.name} 对你发起战斗感到不满。`;
              break;

          case "main_combat":
          case "main_control":
              // 主线队友：胜利增加，失败减少
              affinityChange = isWin ? 20 : -10;
              message = isWin
                  ? "你的实力赢得了对方的尊重！"
                  : "对方对你的弱小感到失望。";
              break;

          default:
              // 默认：胜利增加，失败减少
              affinityChange = isWin ? 20 : -10;
              message = isWin
                  ? "你的实力赢得了对方的尊重！"
                  : "对方对你的弱小感到失望。";
              break;
      }

      return {
          affinity: affinityChange,
          message: message
      };
  },

  // 获取所有已解锁且好感度 > 0 的 NPC 列表
  getSupportNPCs: function() {
      if (!Game.State.relationships) {
          return [];
      }

      const supportNPCs = [];
      for (let npcId in Game.State.relationships) {
          const relationship = Game.State.relationships[npcId];
          if (relationship.met && relationship.affinity > 0 && relationship.bondLevel > 0) {
              const npc = this.getNPCData(npcId);
              if (npc) {
                  supportNPCs.push({
                      id: npcId,
                      npc: npc,
                      relationship: relationship
                  });
              }
          }
      }

      return supportNPCs;
  },

  // 计算支援触发概率
  getSupportChance: function(npcId) {
      const relationship = Game.State.relationships[npcId];
      if (!relationship) return 0;

      // 基础概率：好感度 * 0.1%
      let baseChance = relationship.affinity * 0.001;

      // 根据羁绊等级增加概率
      if (relationship.bondLevel === 'MAX') {
          baseChance *= 2.0;
      } else if (relationship.bondLevel >= 3) {
          baseChance *= 1.5;
      } else if (relationship.bondLevel >= 2) {
          baseChance *= 1.2;
      }

      return Math.min(baseChance, 0.5); // 最大 50% 概率
  },

  // 执行支援效果
  executeSupport: function(npcId, battle) {
      const npc = this.getNPCData(npcId);
      const relationship = Game.State.relationships[npcId];
      if (!npc || !relationship) return null;

      const bondLevel = relationship.bondLevel;
      let effect = null;

      // 根据羁绊等级执行不同的支援效果
      if (bondLevel === 'MAX' || bondLevel >= 3) {
          // Level 3 或 MAX：强力支援
          const healAmount = Math.floor(battle.playerStats.maxHp * 0.2);
          Game.State.changeHP(healAmount);
          battle.playerStats = Game.State.getEffectiveStats();
          effect = {
              type: "heal",
              amount: healAmount,
              message: `${npc.name} 为你恢复了 ${healAmount} 点气血！`
          };
      } else if (bondLevel >= 2) {
          // Level 2：中等支援
          const healAmount = Math.floor(battle.playerStats.maxHp * 0.15);
          Game.State.changeHP(healAmount);
          battle.playerStats = Game.State.getEffectiveStats();
          effect = {
              type: "heal",
              amount: healAmount,
              message: `${npc.name} 为你恢复了 ${healAmount} 点气血！`
          };
      } else if (bondLevel >= 1) {
          // Level 1：基础支援
          const healAmount = Math.floor(battle.playerStats.maxHp * 0.1);
          Game.State.changeHP(healAmount);
          battle.playerStats = Game.State.getEffectiveStats();
          effect = {
              type: "heal",
              amount: healAmount,
              message: `${npc.name} 为你恢复了 ${healAmount} 点气血！`
          };
      }

      return effect;
  },

  // 检查是否有满级羁绊 NPC（用于绝境复活）
  hasMaxBondNPC: function() {
      if (!Game.State.relationships) {
          return false;
      }

      for (let npcId in Game.State.relationships) {
          const relationship = Game.State.relationships[npcId];
          if (relationship.met && relationship.bondLevel === 'MAX') {
              return true;
          }
      }

      return false;
  },

  // 获取满级羁绊 NPC（用于绝境复活）
  getMaxBondNPC: function() {
      if (!Game.State.relationships) {
          return null;
      }

      for (let npcId in Game.State.relationships) {
          const relationship = Game.State.relationships[npcId];
          if (relationship.met && relationship.bondLevel === 'MAX') {
              const npc = this.getNPCData(npcId);
              if (npc) {
                  return {
                      id: npcId,
                      npc: npc,
                      relationship: relationship
                  };
              }
          }
      }

      return null;
  }
};

