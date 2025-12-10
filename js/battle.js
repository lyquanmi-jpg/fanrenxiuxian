// ==========================
// 战斗系统：回合制战斗
// ==========================

Game.Battle = {
  currentBattle: null,
  isAutoBattle: false,  // 是否正在自动战斗
  autoBattleTimer: null,  // 自动战斗定时器
  isSkipping: false,  // 是否正在跳过战斗
  battleTimers: [],  // 存储所有战斗相关的定时器，用于清理
  supportTriggeredThisTurn: false,  // 本回合是否已触发支援
  revivalTriggeredThisBattle: false,  // 本场战斗是否已触发复活

  // 开始战斗
  start: function(enemyId, options) {
      // 停止之前的自动战斗（如果有）
      this.stopAutoBattle();
      const enemy = Game.Enemies.byId[enemyId];
      if (!enemy) {
          console.error(`敌人 ${enemyId} 不存在`);
          return;
      }

      this.currentBattle = {
          enemy: {
              id: enemyId,
              name: enemy.name,
              hp: enemy.hp,
              maxHp: enemy.maxHp,
              attack: enemy.attack,
              defense: enemy.defense
          },
          playerStats: Game.State.getEffectiveStats(),
          turn: 0,
          battleLog: [],  // 战报数组
          onEnd: options.onEnd || null
      };

      console.log(`战斗开始：${enemy.name}`);
      
      // 显示战斗弹窗
      Game.UI.showBattleView(this.currentBattle);
      
      // 开始自动战斗（简化版：自动播放战报）
      this.startAutoBattleLog();
  },

  // 开始手动回合制战斗
  startAutoBattleLog: function() {
      const battle = this.currentBattle;
      if (!battle) return;
      
      // 重置跳过标记
      this.isSkipping = false;
      
      // 重置战斗状态标记
      this.supportTriggeredThisTurn = false;
      this.revivalTriggeredThisBattle = false;
      
      // 清空所有定时器
      this.clearAllTimers();
      
      // 清空战报
      battle.battleLog = [];
      
      // 添加战斗开始信息
      this.addBattleLog(`【战斗开始】`, true);
      this.addBattleLog(`${battle.enemy.name} 出现在你面前！`, true);
      
      // 开始玩家回合（手动模式）
      this.startPlayerTurn();
  },

  // 开始玩家回合（手动模式）
  startPlayerTurn: function() {
      const battle = this.currentBattle;
      if (!battle) return;
      
      // 检查战斗是否结束
      if (battle.enemy.hp <= 0) {
          this.showBattleResult(true);
          return;
      }
      
      if (battle.playerStats.hp <= 0) {
          this.showBattleResult(false);
          return;
      }
      
      battle.turn++;
      this.addBattleLog(`【第 ${battle.turn} 回合】`, true);
      this.addBattleLog(`轮到你了！`, true);
      
      // 重置支援触发标记
      this.supportTriggeredThisTurn = false;
      
      // 检查 NPC 支援（回合支援）
      this.checkNPCSupport();
      
      // 更新UI，启用玩家操作按钮
      Game.UI.enablePlayerActions();
      
      // 更新血条
      Game.UI.updateBattleHpBar(battle);
  },
  
  // 检查 NPC 支援
  checkNPCSupport: function() {
      if (this.supportTriggeredThisTurn) return; // 本回合已触发，不再触发
      
      const supportNPCs = Game.Social.getSupportNPCs();
      if (supportNPCs.length === 0) return;

      // 遍历所有支援 NPC，计算触发概率
      for (let i = 0; i < supportNPCs.length; i++) {
          const supportNPC = supportNPCs[i];
          const chance = Game.Social.getSupportChance(supportNPC.id);
          
          if (Math.random() < chance) {
              // 触发支援
              this.triggerNPCSupport(supportNPC);
              this.supportTriggeredThisTurn = true;
              break; // 一回合最多触发一次
          }
      }
  },
  
      // 触发 NPC 支援
  triggerNPCSupport: function(supportNPC) {
      const battle = this.currentBattle;
      if (!battle) return;

      const npc = supportNPC.npc;
      const relationship = supportNPC.relationship;
      
      // 打印醒目的战报
      this.addBattleLog(`【${npc.name}】突然闪现战场："别怕，有我在！"`, false);
      
      // 执行支援效果
      const effect = Game.Social.executeSupport(supportNPC.id, battle);
      if (effect) {
          this.addBattleLog(effect.message, false);
      }
      
      // 更新血条
      Game.UI.updateBattleHpBar(battle);
  },
  
  // 检查绝境复活（满级羁绊特权）
  checkRevival: function() {
      if (this.revivalTriggeredThisBattle) return false; // 本场战斗已触发过，不再触发
      
      const maxBondNPC = Game.Social.getMaxBondNPC();
      if (!maxBondNPC) return false;

      const battle = this.currentBattle;
      if (!battle || battle.playerStats.hp > 0) return false;

      // 触发复活
      this.revivalTriggeredThisBattle = true;
      const npc = maxBondNPC.npc;
      
      // 强制保留 1 点 HP
      Game.State.changeHP(1);
      battle.playerStats = Game.State.getEffectiveStats();
      
      // 恢复 50% HP
      const healAmount = Math.floor(battle.playerStats.maxHp * 0.5);
      Game.State.changeHP(healAmount);
      battle.playerStats = Game.State.getEffectiveStats();
      
      // 打印复活剧情
      this.addBattleLog(`在你意识模糊时，【${npc.name}】为你挡下了致命一击，并喂你服下一颗丹药！`, false);
      this.addBattleLog(`【绝境复活】恢复了 ${healAmount} 点气血！`, false);
      
      // 更新血条
      Game.UI.updateBattleHpBar(battle);
      
      return true;
  },

  // 执行玩家行动（由UI按钮触发）
  executePlayerAction: function(actionType) {
      const battle = this.currentBattle;
      if (!battle) return;
      
      // 禁用玩家操作按钮
      Game.UI.disablePlayerActions();
      
      if (actionType === 'attack') {
          // 普通攻击
          this.playerNormalAttack(false);
      } else if (actionType === 'skill') {
          // 技能攻击（使用 qi_blast）
          const hasQiBlast = Game.State.hasSkill("qi_blast");
          const skill = hasQiBlast ? this.getSkillData("qi_blast") : null;
          
          if (!skill) {
              this.addBattleLog(`你还没有学会任何技能！`, true);
              Game.UI.enablePlayerActions();
              return;
          }
          
          if (battle.playerStats.mp < skill.mpCost) {
              this.addBattleLog(`灵力不足，无法使用 ${skill.name}！`, true);
              Game.UI.enablePlayerActions();
              return;
          }
          
          // 消耗MP
          Game.State.changeMP(-skill.mpCost);
          battle.playerStats = Game.State.getEffectiveStats();
          
          // 计算技能伤害
          let damage = Math.floor(battle.playerStats.attack * skill.damageMultiplier) - battle.enemy.defense;
          if (damage < 1) damage = 1;
          
          // 暴击判定
          const isCrit = Math.random() < battle.playerStats.critRate;
          if (isCrit) {
              damage = Math.floor(damage * battle.playerStats.critDamage);
              this.addBattleLog(`你凝聚灵气，发射了一枚【${skill.name}】！`, false);
              this.addBattleLog(`暴击！对 ${battle.enemy.name} 造成了 ${damage} 点伤害！`, false);
          } else {
              this.addBattleLog(`你凝聚灵气，发射了一枚【${skill.name}】！`, false);
              this.addBattleLog(`对 ${battle.enemy.name} 造成了 ${damage} 点伤害！`, false);
          }
          
          battle.enemy.hp -= damage;
          battle.enemy.hp = Math.max(0, battle.enemy.hp);
          
          this.addBattleLog(`消耗了 ${skill.mpCost} 点灵力。`, false);
          
          // 更新血条
          Game.UI.updateBattleHpBar(battle);
          
          // 检查敌人是否死亡
          if (battle.enemy.hp <= 0) {
              setTimeout(() => {
                  this.showBattleResult(true);
              }, 1000);
              return;
          }
      }
      
      // 延迟后进入敌人回合
      setTimeout(() => {
          this.startEnemyTurn();
      }, 1000);
  },
  
  // 开始敌人回合
  startEnemyTurn: function() {
      const battle = this.currentBattle;
      if (!battle) return;
      
      // 检查战斗是否结束
      if (battle.enemy.hp <= 0) {
          this.showBattleResult(true);
          return;
      }
      
      if (battle.playerStats.hp <= 0) {
          this.showBattleResult(false);
          return;
      }
      
      // 延迟1000ms模拟思考
      setTimeout(() => {
          this.enemyTurnInAutoBattle(false);
          
          // 更新血条
          Game.UI.updateBattleHpBar(battle);
          
          // 检查玩家是否死亡
          if (battle.playerStats.hp <= 0) {
              setTimeout(() => {
                  this.showBattleResult(false);
              }, 1000);
              return;
          }
          
          // 如果玩家存活，继续玩家回合
          setTimeout(() => {
              this.startPlayerTurn();
          }, 1000);
      }, 1000);
  },

  // 玩家回合（自动战斗）
  playerTurnInAutoBattle: function(skipMode) {
      const battle = this.currentBattle;
      const player = battle.playerStats;
      const enemy = battle.enemy;
      
      // 检查是否学会 qi_blast 技能，30%概率使用
      const hasQiBlast = Game.State.hasSkill("qi_blast");
      const skill = hasQiBlast ? this.getSkillData("qi_blast") : null;
      const useSkill = hasQiBlast && skill && Math.random() < 0.3 && player.mp >= skill.mpCost;
      
      if (useSkill && skill) {
          // 使用技能攻击
          // 消耗MP
          Game.State.changeMP(-skill.mpCost);
          battle.playerStats = Game.State.getEffectiveStats();
          
          // 计算技能伤害（使用技能的伤害倍数）
          let damage = Math.floor(player.attack * skill.damageMultiplier) - enemy.defense;
          if (damage < 1) damage = 1;
          
          // 暴击判定
          const isCrit = Math.random() < player.critRate;
          if (isCrit) {
              damage = Math.floor(damage * player.critDamage);
              this.addBattleLog(`你凝聚灵气，发射了一枚【${skill.name}】！`, skipMode);
              this.addBattleLog(`暴击！对 ${enemy.name} 造成了 ${damage} 点伤害！`, skipMode);
          } else {
              this.addBattleLog(`你凝聚灵气，发射了一枚【${skill.name}】！`, skipMode);
              this.addBattleLog(`对 ${enemy.name} 造成了 ${damage} 点伤害！`, skipMode);
          }
          
          enemy.hp -= damage;
          enemy.hp = Math.max(0, enemy.hp);
          
          this.addBattleLog(`消耗了 ${skill.mpCost} 点灵力。`, skipMode);
      } else {
          // 使用普攻
          this.playerNormalAttack(skipMode);
      }
      
      // 注意：战斗结束检查在 battleTurnLoop 中进行，这里不需要检查
  },

  // 玩家普通攻击
  playerNormalAttack: function(skipMode) {
      const battle = this.currentBattle;
      const player = battle.playerStats;
      const enemy = battle.enemy;
      
      // 检查命中率
      let hitChance = 1.0;
      if (Game.State.battleBuffs.hitRateReductionTurns > 0) {
          hitChance = 1.0 - Game.State.battleBuffs.hitRateReduction;
          Game.State.battleBuffs.hitRateReductionTurns--;
          if (Game.State.battleBuffs.hitRateReductionTurns <= 0) {
              Game.State.battleBuffs.hitRateReduction = 0;
          }
      }
      
      // 判定是否命中
      if (Math.random() > hitChance) {
          this.addBattleLog(`你挥出一拳，但被 ${enemy.name} 闪避了！`, false);
          return;
      }
      
      // 计算伤害
      let damage = player.attack - enemy.defense;
      if (damage < 1) damage = 1;
      
      // 暴击判定
      const isCrit = Math.random() < player.critRate;
      if (isCrit) {
          damage = Math.floor(damage * player.critDamage);
          this.addBattleLog(`你挥出一拳，暴击！对 ${enemy.name} 造成了 ${damage} 点伤害！`, false);
      } else {
          this.addBattleLog(`你挥出一拳，对 ${enemy.name} 造成了 ${damage} 点伤害！`, false);
      }
      
      enemy.hp -= damage;
      enemy.hp = Math.max(0, enemy.hp);
  },

  // 敌人回合（自动战斗）
  enemyTurnInAutoBattle: function(skipMode) {
      const battle = this.currentBattle;
      const enemyData = Game.Enemies.byId[battle.enemy.id];
      const enemy = battle.enemy;
      const player = battle.playerStats;
      
      // 应用被动效果（每回合恢复MP）
      const passives = Game.State.getPassiveEffects();
      if (passives.mpRegen > 0) {
          Game.State.changeMP(passives.mpRegen);
          battle.playerStats = Game.State.getEffectiveStats();
          this.addBattleLog(`【被动效果】恢复了 ${passives.mpRegen} 点灵力`, skipMode);
      }
      
      // 检查心魔boss的阶段机制
      let attackLine = "";
      let skillUsed = null;
      let protectionUsed = false;
      
      if (battle.enemy.id === "heart_demon_ch1" && enemyData.phases) {
          const hpPercent = enemy.hp / enemy.maxHp;
          let currentPhase = null;
          
          for (let i = 0; i < enemyData.phases.length; i++) {
              const phase = enemyData.phases[i];
              if (hpPercent > phase.hpThreshold) {
                  currentPhase = phase;
                  break;
              }
          }
          
          if (!currentPhase && enemyData.phases.length > 0) {
              currentPhase = enemyData.phases[enemyData.phases.length - 1];
          }
          
          if (currentPhase) {
              attackLine = currentPhase.line;
              if (currentPhase.skill) {
                  skillUsed = currentPhase.skill;
              }
          }
      } else {
          if (enemyData && enemyData.attackLines && enemyData.attackLines.length > 0) {
              const randomIndex = Math.floor(Math.random() * enemyData.attackLines.length);
              attackLine = enemyData.attackLines[randomIndex];
          }
      }
      
      // 显示敌人台词
      if (attackLine) {
          this.addBattleLog(`${enemy.name}：${attackLine}`, skipMode);
      }
      
      // 应用阶段技能效果
      if (skillUsed) {
          if (skillUsed.effect === "reduceHitRate") {
              Game.State.battleBuffs.hitRateReduction = skillUsed.value;
              Game.State.battleBuffs.hitRateReductionTurns = 3;
              this.addBattleLog(`【${skillUsed.name}】你的命中率降低了 ${skillUsed.value * 100}%！（持续3回合）`, skipMode);
          } else if (skillUsed.effect === "reduceMP") {
              Game.State.changeMP(-skillUsed.value);
              battle.playerStats = Game.State.getEffectiveStats();
              this.addBattleLog(`【${skillUsed.name}】你的灵力减少了 ${skillUsed.value} 点！`, skipMode);
          }
      }
      
      // 敌人攻击：检查是否有技能系统（NPC 或敌人数据中的 skills）
      let enemySkill = null;
      let useSkill = false;
      
      // 优先检查 NPC 数据中的 skills（用于 NPC 切磋）
      if (battle.enemy.id && battle.enemy.id.startsWith("npc_")) {
          const npcId = battle.enemy.id.replace("npc_", "");
          const npc = Game.Social.getNPCData(npcId);
          if (npc && npc.skills && npc.skills.length > 0) {
              // 随机选择一个技能，根据 rate 判断是否使用
              const availableSkills = npc.skills.filter(skill => Math.random() < skill.rate);
              if (availableSkills.length > 0) {
                  enemySkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                  useSkill = true;
              }
          }
      }
      
      // 如果没有 NPC 技能，检查敌人数据中的 skills
      if (!useSkill && enemyData && enemyData.skills && enemyData.skills.length > 0) {
          const availableSkills = enemyData.skills.filter(skill => Math.random() < skill.rate);
          if (availableSkills.length > 0) {
              enemySkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
              useSkill = true;
          }
      }
      
      // 敌人攻击
      let attackCount = 1;
      if (skillUsed && skillUsed.effect === "doubleAttack") {
          attackCount = skillUsed.value;
      }
      
      let totalDamage = 0;
      let damageMultiplier = 1.0;
      
      // 如果使用技能，应用伤害倍率
      if (useSkill && enemySkill) {
          damageMultiplier = enemySkill.damageRate;
          this.addBattleLog(enemySkill.text, skipMode);
      }
      
      for (let i = 0; i < attackCount; i++) {
          let damage = Math.floor((enemy.attack - player.defense) * damageMultiplier);
          if (damage < 1) damage = 1;
          
          // 检查一次性护身符
          if (i === 0 && Game.State.hasOneTimeProtection) {
              totalDamage = 0;
              Game.State.hasOneTimeProtection = false;
              protectionUsed = true;
              this.addBattleLog(`【护身符触发】一次性护身符发出微光，完全抵挡了 ${enemy.name} 的攻击！`, skipMode);
              break;
          }
          
          totalDamage += damage;
      }
      
      // 应用伤害
      if (totalDamage > 0) {
          Game.State.changeHP(-totalDamage);
          battle.playerStats = Game.State.getEffectiveStats();
          if (useSkill && enemySkill) {
              this.addBattleLog(`${enemy.name} 对你造成了 ${totalDamage} 点伤害！【${enemySkill.name}】`, skipMode);
          } else {
              this.addBattleLog(`${enemy.name} 对你造成了 ${totalDamage} 点伤害${attackCount > 1 ? `（连击${attackCount}次）` : ''}！`, skipMode);
          }
      }
      
      // 检查玩家是否死亡（在敌人回合后）
      if (battle.playerStats.hp <= 0 && !skipMode) {
          // 检查绝境复活（满级羁绊特权）
          if (this.checkRevival()) {
              return; // 已触发复活，继续战斗
          }
          // 如果不是跳过模式，需要等待日志显示完成后再显示结果
          // 如果是跳过模式，会在 calculateBattleToEnd 中处理
          return; // 返回，让 battleTurnLoop 检查并调用 showBattleResult
      }
      
      // 不再显示重复的状态信息，只显示关键动作
      // 删除重复的状态日志
  },

  // 添加战报到日志
  addBattleLog: function(message, immediate) {
      const battle = this.currentBattle;
      if (!battle) return;
      
      battle.battleLog.push(message);
      
      // 如果正在跳过或立即显示，直接更新UI
      if (this.isSkipping || immediate) {
          Game.UI.updateBattleLogImmediate(battle.battleLog);
      } else {
          // 否则延迟显示
          Game.UI.updateBattleLog(battle.battleLog);
      }
  },

  // 清理所有定时器
  clearAllTimers: function() {
      this.battleTimers.forEach(timer => clearTimeout(timer));
      this.battleTimers = [];
  },

  // 跳过战斗：瞬间计算到结束
  skip: function() {
      if (!this.currentBattle) return;
      
      this.isSkipping = true;
      this.clearAllTimers();
      
      // 立即计算到战斗结束
      this.calculateBattleToEnd();
  },

  // 计算战斗到结束（跳过模式）
  calculateBattleToEnd: function() {
      const battle = this.currentBattle;
      if (!battle) return;
      
      // 继续战斗直到结束
      while (battle.enemy.hp > 0 && battle.playerStats.hp > 0) {
          battle.turn++;
          
          // 玩家回合
          this.playerTurnInAutoBattle(true); // true 表示跳过模式
          
          // 如果敌人已死，跳出
          if (battle.enemy.hp <= 0) break;
          
          // 敌人回合
          this.enemyTurnInAutoBattle(true); // true 表示跳过模式
          
          // 如果玩家已死，跳出
          if (battle.playerStats.hp <= 0) break;
          
          // 防止无限循环
          if (battle.turn > 100) {
              this.addBattleLog(`【战斗超时】战斗超过100回合，强制结束。`, true);
              break;
          }
      }
      
      // 显示结果
      const playerWon = battle.enemy.hp <= 0;
      this.showBattleResult(playerWon);
  },

  // 显示战斗结果（不自动关闭）
  showBattleResult: function(playerWon) {
      const battle = this.currentBattle;
      if (!battle) return;
      
      // 清理所有定时器，停止战斗循环
      this.clearAllTimers();
      
      // 确保血条正确显示
      if (!playerWon) {
          battle.playerStats.hp = 0;
      } else {
          battle.enemy.hp = 0;
      }
      
      // 更新血条
      Game.UI.updateBattleHpBar(battle);
      
      // 添加结果日志
      if (playerWon) {
          this.addBattleLog(`【战斗胜利】`, true);
          this.addBattleLog(`你击败了 ${battle.enemy.name}！`, true);
          
          // 计算奖励
          const enemy = Game.Enemies.byId[battle.enemy.id];
          if (enemy) {
              if (enemy.exp > 0) {
                  this.addBattleLog(`获得经验：${enemy.exp}`, true);
              }
              if (enemy.gold) {
                  this.addBattleLog(`获得人民币：¥${enemy.gold}`, true);
              }
          }
      } else {
          this.addBattleLog(`【战斗失败】`, true);
          this.addBattleLog(`你被 ${battle.enemy.name} 击败了...`, true);
      }
      
      // 显示结算按钮（使用闭包保存战斗结果）
      const battleResult = this.prepareBattleResult(playerWon);
      Game.UI.showBattleResultButton(playerWon, battleResult, () => {
          this.endBattle(playerWon, battleResult);
      });
  },

  // 准备战斗结果（在显示按钮前计算好）
  prepareBattleResult: function(playerWon) {
      const battle = this.currentBattle;
      if (!battle) return null;
      
      const enemy = Game.Enemies.byId[battle.enemy.id];
      const battleResult = {
          won: playerWon,
          exp: 0,
          money: 0,  // 改为 money 而不是 gold
          droppedItems: [],
          enemyId: battle.enemy.id,  // 保存敌人ID，用于检查二阶段
          isNPC: false,
          npcId: null
      };

      // 检查是否是 NPC 战斗
      if (battle.enemy.id && battle.enemy.id.startsWith("npc_")) {
          battleResult.isNPC = true;
          battleResult.npcId = battle.enemy.id.replace("npc_", "");
          
          if (playerWon) {
              const npc = Game.Social.getNPCData(battleResult.npcId);
              if (npc && npc.loot) {
                  battleResult.exp = npc.loot.exp || 0;
                  battleResult.money = npc.loot.money || 0;
                  
                  // 处理掉落物品
                  if (npc.loot.items) {
                      npc.loot.items.forEach(drop => {
                          if (Math.random() < (drop.rate || 1.0)) {
                              const item = Game.Items.byId[drop.id];
                              if (item) {
                                  Game.State.addItem(drop.id, 1);
                                  battleResult.droppedItems.push(item);
                              }
                          }
                      });
                  }
              }
          }
      } else if (playerWon && enemy) {
          battleResult.exp = enemy.exp || 0;
          battleResult.money = enemy.gold || 0;  // enemy.gold 实际是 money
          battleResult.spiritStones = enemy.spiritStones || 0;  // 灵石掉落
          
          // 处理灵石掉落
          if (battleResult.spiritStones > 0) {
              Game.State.player.spiritStones = (Game.State.player.spiritStones || 0) + battleResult.spiritStones;
          }
          
          // 处理掉落
          if (enemy.drops) {
              for (let itemId in enemy.drops) {
                  const dropChance = enemy.drops[itemId];
                  if (Math.random() < dropChance) {
                      const item = Game.Items.byId[itemId];
                      if (item) {
                          Game.State.addItem(itemId, 1);
                          battleResult.droppedItems.push(item);
                      }
                  }
              }
          }
      }
      
      return battleResult;
  },
  
  // 挑战 NPC 真身（二阶段）
  challengeTrueForm: function(npcId) {
      const npc = Game.Social.getNPCData(npcId);
      if (!npc || !npc.trueForm) {
          console.error(`NPC ${npcId} 没有真身数据`);
          return;
      }

      const trueForm = npc.trueForm;
      
      // 创建真身敌人数据
      const trueFormEnemy = {
          id: `npc_${npcId}_trueform`,
          name: trueForm.name,
          hp: trueForm.hp,
          maxHp: trueForm.maxHp,
          attack: trueForm.attack,
          defense: trueForm.defense,
          exp: trueForm.loot.exp || 0,
          gold: trueForm.loot.money || 0,
          spiritStones: trueForm.loot.spiritStones || 0,
          skills: trueForm.skills || [],
          drops: {}
      };

      // 处理掉落物品
      if (trueForm.loot.items) {
          trueForm.loot.items.forEach(drop => {
              // 支持 count 属性（必掉）或 rate 属性（概率掉落）
              if (drop.count !== undefined) {
                  // 必掉，直接添加到掉落列表
                  trueFormEnemy.drops[drop.id] = 1.0;  // 100% 概率
              } else {
                  // 概率掉落
                  trueFormEnemy.drops[drop.id] = drop.rate || 1.0;
              }
          });
      }

      // 临时注册真身敌人
      if (!Game.Enemies.byId[trueFormEnemy.id]) {
          Game.Enemies.byId[trueFormEnemy.id] = trueFormEnemy;
      }

      // 显示真身描述
      this.addBattleLog(`【真身显现】${trueForm.description}`, true);
      
      // 开始真身战斗
      Game.Battle.start(trueFormEnemy.id, {
          onEnd: (playerWon, battleResult) => {
              // 真身战斗胜利后，不再显示挑战按钮
              if (playerWon) {
                  // 计算切磋后的好感度变化（真身战斗胜利大幅增加好感）
                  const reaction = Game.Social.getCombatReaction(npcId, true);
                  if (reaction) {
                      // 真身胜利额外增加好感
                      const result = Game.Social.changeAffinity(npcId, reaction.affinity + 30);
                      alert(`你击败了${trueForm.name}！\n${reaction.message}\n额外获得30点好感度！`);
                      if (result.leveledUp) {
                          alert(`【羁绊升级】与 ${npc.name} 的羁绊等级提升到 Level ${result.newLevel === 'MAX' ? 'MAX' : result.newLevel}！`);
                      }
                  }
              } else {
                  // 真身战斗失败，大幅减少好感
                  const reaction = Game.Social.getCombatReaction(npcId, false);
                  if (reaction) {
                      const result = Game.Social.changeAffinity(npcId, reaction.affinity - 20);
                      alert(`你被${trueForm.name}击败了...\n${reaction.message}\n额外扣除20点好感度。`);
                  }
              }

              // 清理临时敌人
              delete Game.Enemies.byId[trueFormEnemy.id];

              Game.Game.updateUI();
              Game.Save.save();
          }
      });
  },
  
  // 结束战斗（由结算按钮调用）
  endBattle: function(playerWon, battleResult) {
      // 停止所有战斗相关的定时器
      this.clearAllTimers();
      this.isSkipping = false; // 重置跳过状态

      // 应用实际奖励
      if (playerWon && battleResult) {
          Game.State.addExp(battleResult.exp);
          Game.State.player.money = (Game.State.player.money || 0) + battleResult.money;
          // 灵石和掉落物品已经在 prepareBattleResult 中处理了
          let logMsg = `战斗胜利！获得 ${battleResult.exp} 经验`;
          if (battleResult.money > 0) {
              logMsg += `，¥${battleResult.money} 人民币`;
          }
          if (battleResult.spiritStones > 0) {
              logMsg += `，💎${battleResult.spiritStones} 灵石`;
          }
          console.log(logMsg);
      } else {
          console.log("战斗失败...");
      }

      // 调用原始的 onEnd 回调，传递完整的 battleResult 对象
      if (this.currentBattle && this.currentBattle.onEnd) {
          // battleResult 已经包含 exp, money, droppedItems，直接传递
          this.currentBattle.onEnd(playerWon, battleResult);
      }

      this.currentBattle = null; // 清空当前战斗状态
      Game.UI.closeBattleView(); // 关闭战斗弹窗
      Game.Game.updateUI(); // 更新主界面UI
      
      // 自动存档（战斗结束后）
      Game.Save.save();
  },

  // 渲染战斗界面
  renderBattle: function(showEnemyLine) {
      const textEl = document.getElementById("event-text");
      const optionsEl = document.getElementById("event-options");

      if (!textEl || !optionsEl) return;

      const battle = this.currentBattle;
      const enemy = battle.enemy;
      const player = battle.playerStats;
      const enemyData = Game.Enemies.byId[battle.enemy.id];

      // 构建战斗信息文本
      let displayText = `战斗进行中...\n\n`;
      
      // 如果传入了敌人台词，显示它
      if (showEnemyLine && enemyData && enemyData.attackLines && enemyData.attackLines.length > 0) {
          displayText += `${enemy.name}：\n${showEnemyLine}\n\n`;
      }
      
      displayText += `${enemy.name}\nHP: ${enemy.hp}/${enemy.maxHp}\n\n`;
      displayText += `你的状态\nHP: ${player.hp}/${player.maxHp}\nMP: ${player.mp}/${player.maxMp}`;

      // 显示战斗信息
      textEl.textContent = displayText;

      // 清空选项
      optionsEl.innerHTML = "";

      // 创建战斗行动按钮
      const attackBtn = document.createElement("button");
      attackBtn.className = "option-btn";
      attackBtn.textContent = "攻击";
      attackBtn.onclick = () => this.playerAttack();
      optionsEl.appendChild(attackBtn);

      // 技能攻击按钮（如果有已学会的技能）
      const learnedSkills = Game.State.learnedSkills;
      if (learnedSkills.length > 0) {
          learnedSkills.forEach(skillId => {
              const skill = this.getSkillData(skillId);
              if (skill && player.mp >= skill.mpCost) {
                  const skillBtn = document.createElement("button");
                  skillBtn.className = "option-btn";
                  skillBtn.textContent = `${skill.name} (消耗${skill.mpCost}MP)`;
                  skillBtn.onclick = () => this.playerSkillAttack(skillId);
                  optionsEl.appendChild(skillBtn);
              }
          });
      }

      // 使用道具按钮
      const itemBtn = document.createElement("button");
      itemBtn.className = "option-btn";
      itemBtn.textContent = "使用道具";
      itemBtn.onclick = () => this.showItemMenu();
      optionsEl.appendChild(itemBtn);

      // 防御按钮
      const defendBtn = document.createElement("button");
      defendBtn.className = "option-btn";
      defendBtn.textContent = "防御";
      defendBtn.onclick = () => this.playerDefend();
      optionsEl.appendChild(defendBtn);

      // 自动战斗按钮
      const autoBtn = document.createElement("button");
      autoBtn.className = "option-btn";
      autoBtn.textContent = this.isAutoBattle ? "停止自动战斗" : "自动战斗";
      autoBtn.style.backgroundColor = this.isAutoBattle ? "#8b0000" : "#2d5016";
      autoBtn.onclick = () => {
          if (this.isAutoBattle) {
              this.stopAutoBattle();
          } else {
              this.startAutoBattle();
          }
      };
      optionsEl.appendChild(autoBtn);
  },

  // 获取技能数据
  getSkillData: function(skillId) {
      // 从所有物品中查找包含该技能的技能书
      for (let itemId in Game.Items.byId) {
          const item = Game.Items.byId[itemId];
          if (item.type === "skill_book" && item.skill && item.skill.id === skillId) {
              return item.skill;
          }
      }
      return null;
  },

  // 玩家攻击
  playerAttack: function() {
      const battle = this.currentBattle;
      const player = battle.playerStats;
      const enemy = battle.enemy;

      // 检查命中率降低debuff
      let hitChance = 1.0;
      if (Game.State.battleBuffs.hitRateReductionTurns > 0) {
          hitChance = 1.0 - Game.State.battleBuffs.hitRateReduction;
          // 减少剩余回合数
          Game.State.battleBuffs.hitRateReductionTurns--;
          if (Game.State.battleBuffs.hitRateReductionTurns <= 0) {
              Game.State.battleBuffs.hitRateReduction = 0;
          }
      }

      // 判定是否命中
      if (Math.random() > hitChance) {
          const textEl = document.getElementById("event-text");
          if (textEl) {
              textEl.textContent = `战斗进行中...\n\n你的攻击被 ${enemy.name} 闪避了！\n\n${enemy.name}\nHP: ${enemy.hp}/${enemy.maxHp}\n\n你的状态\nHP: ${player.hp}/${player.maxHp}\nMP: ${player.mp}/${player.maxMp}`;
          }
          // 未命中，直接进入敌人回合
          setTimeout(() => {
              this.enemyTurn();
          }, 1500);
          return;
      }

      // 计算伤害
      let damage = player.attack - enemy.defense;
      if (damage < 1) damage = 1;

      // 暴击判定
      if (Math.random() < player.critRate) {
          damage = Math.floor(damage * player.critDamage);
          console.log("暴击！");
      }

      enemy.hp -= damage;
      enemy.hp = Math.max(0, enemy.hp);

      console.log(`你对 ${enemy.name} 造成了 ${damage} 点伤害`);

      // 检查敌人是否被击败
      if (enemy.hp <= 0) {
          this.stopAutoBattle(); // 停止自动战斗
          this.endBattle(true);
          return;
      }

      // 敌人回合
      this.enemyTurn();
  },

  // 玩家技能攻击
  playerSkillAttack: function(skillId) {
      const battle = this.currentBattle;
      const player = battle.playerStats;
      const enemy = battle.enemy;
      const skill = this.getSkillData(skillId);

      if (!skill) {
          console.error(`技能 ${skillId} 不存在`);
          return;
      }

      // 检查MP是否足够
      if (player.mp < skill.mpCost) {
          const textEl = document.getElementById("event-text");
          if (textEl) {
              textEl.textContent = `战斗进行中...\n\n灵力不足，无法使用 ${skill.name}！\n需要 ${skill.mpCost} 点灵力，当前只有 ${player.mp} 点。`;
          }
          setTimeout(() => {
              this.renderBattle();
          }, 1500);
          return;
      }

      // 消耗MP（先扣除，再更新状态）
      Game.State.changeMP(-skill.mpCost);
      // 更新战斗中的玩家状态（必须在扣除MP后立即更新）
      battle.playerStats = Game.State.getEffectiveStats();
      // 更新UI状态栏显示
      Game.Game.updateUI();

      // 计算技能伤害（基于攻击力的倍数，使用更新后的状态）
      const updatedPlayer = battle.playerStats;
      let damage = Math.floor(updatedPlayer.attack * skill.damageMultiplier) - enemy.defense;
      if (damage < 1) damage = 1;

      // 暴击判定
      if (Math.random() < updatedPlayer.critRate) {
          damage = Math.floor(damage * updatedPlayer.critDamage);
          console.log("技能暴击！");
      }

      enemy.hp -= damage;
      enemy.hp = Math.max(0, enemy.hp);

      const textEl = document.getElementById("event-text");
      if (textEl) {
          textEl.textContent = `战斗进行中...\n\n你使用了 ${skill.name}！\n对 ${enemy.name} 造成了 ${damage} 点伤害！\n消耗了 ${skill.mpCost} 点灵力。\n\n当前灵力：${battle.playerStats.mp}/${battle.playerStats.maxMp}`;
      }

      console.log(`你使用 ${skill.name} 对 ${enemy.name} 造成了 ${damage} 点伤害，消耗 ${skill.mpCost} MP，剩余 ${battle.playerStats.mp} MP`);

      // 检查敌人是否被击败
      if (enemy.hp <= 0) {
          this.stopAutoBattle(); // 停止自动战斗
          setTimeout(() => {
              this.endBattle(true);
          }, 1500);
          return;
      }

      // 敌人回合
      setTimeout(() => {
          this.enemyTurn();
          // 如果正在自动战斗，在敌人回合后继续自动战斗循环
          if (this.isAutoBattle && this.currentBattle) {
              const battle = this.currentBattle;
              battle.playerStats = Game.State.getEffectiveStats();
              // 检查战斗是否结束
              if (battle.playerStats.hp <= 0) {
                  this.stopAutoBattle();
                  return; // enemyTurn 会处理失败
              }
              if (battle.enemy.hp <= 0) {
                  this.stopAutoBattle();
                  return; // 会在 enemyTurn 后处理
              }
              // 继续自动战斗
              setTimeout(() => {
                  if (this.isAutoBattle && this.currentBattle) {
                      this.autoBattleLoop();
                  }
              }, 500);
          }
      }, 1500);
  },

  // 玩家防御
  playerDefend: function() {
      console.log("你选择了防御，下回合受到的伤害减半");
      // TODO: 实现防御逻辑
      this.enemyTurn();
  },

  // 敌人回合
  enemyTurn: function() {
      const battle = this.currentBattle;
      const enemyData = Game.Enemies.byId[battle.enemy.id];
      const enemy = battle.enemy;
      const player = battle.playerStats;

      // 应用被动效果（每回合恢复MP）
      const passives = Game.State.getPassiveEffects();
      if (passives.mpRegen > 0) {
          Game.State.changeMP(passives.mpRegen);
          battle.playerStats = Game.State.getEffectiveStats();
          console.log(`被动效果：恢复了 ${passives.mpRegen} 点灵力`);
      }

      // 检查心魔boss的阶段机制
      let currentPhase = null;
      let attackLine = "";
      let skillUsed = null;
      let protectionUsed = false;
      
      if (battle.enemy.id === "heart_demon_ch1" && enemyData.phases) {
          const hpPercent = enemy.hp / enemy.maxHp;
          
          // 确定当前阶段
          for (let i = 0; i < enemyData.phases.length; i++) {
              const phase = enemyData.phases[i];
              if (hpPercent > phase.hpThreshold) {
                  currentPhase = phase;
                  break;
              }
          }
          
          // 如果没找到阶段（HP很低），使用最后一个阶段
          if (!currentPhase && enemyData.phases.length > 0) {
              currentPhase = enemyData.phases[enemyData.phases.length - 1];
          }
          
          if (currentPhase) {
              attackLine = currentPhase.line;
              // 使用阶段技能
              if (currentPhase.skill) {
                  skillUsed = currentPhase.skill;
              }
          }
      } else {
          // 其他敌人的普通台词逻辑（保留原有逻辑）
          if (enemyData && enemyData.attackLines && enemyData.attackLines.length > 0) {
              const randomIndex = Math.floor(Math.random() * enemyData.attackLines.length);
              attackLine = enemyData.attackLines[randomIndex];
          }
      }

      // 应用阶段技能效果
      if (skillUsed) {
          if (skillUsed.effect === "reduceHitRate") {
              // 降低命中率
              Game.State.battleBuffs.hitRateReduction = skillUsed.value;
              Game.State.battleBuffs.hitRateReductionTurns = 3; // 持续3回合
              console.log(`${enemy.name} 使用了 ${skillUsed.name}！你的命中率降低了 ${skillUsed.value * 100}%！`);
          } else if (skillUsed.effect === "reduceMP") {
              // 减少MP
              Game.State.changeMP(-skillUsed.value);
              battle.playerStats = Game.State.getEffectiveStats();
              console.log(`${enemy.name} 使用了 ${skillUsed.name}！你的灵力减少了 ${skillUsed.value} 点！`);
          }
      }

      // 敌人攻击：检查是否有技能系统（NPC 或敌人数据中的 skills）
      let enemySkill = null;
      let useSkill = false;
      
      // 优先检查 NPC 数据中的 skills（用于 NPC 切磋）
      if (battle.enemy.id && battle.enemy.id.startsWith("npc_")) {
          const npcId = battle.enemy.id.replace("npc_", "");
          const npc = Game.Social.getNPCData(npcId);
          if (npc && npc.skills && npc.skills.length > 0) {
              // 随机选择一个技能，根据 rate 判断是否使用
              const availableSkills = npc.skills.filter(skill => Math.random() < skill.rate);
              if (availableSkills.length > 0) {
                  enemySkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                  useSkill = true;
              }
          }
      }
      
      // 如果没有 NPC 技能，检查敌人数据中的 skills
      if (!useSkill && enemyData && enemyData.skills && enemyData.skills.length > 0) {
          const availableSkills = enemyData.skills.filter(skill => Math.random() < skill.rate);
          if (availableSkills.length > 0) {
              enemySkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
              useSkill = true;
          }
      }

      // 敌人攻击（根据阶段决定攻击次数）
      let attackCount = 1;
      if (skillUsed && skillUsed.effect === "doubleAttack") {
          attackCount = skillUsed.value; // 连击次数
      }

      let totalDamage = 0;
      let damageMultiplier = 1.0;
      
      // 如果使用技能，应用伤害倍率
      if (useSkill && enemySkill) {
          damageMultiplier = enemySkill.damageRate;
          console.log(enemySkill.text);
      }

      for (let i = 0; i < attackCount; i++) {
          let damage = Math.floor((enemy.attack - player.defense) * damageMultiplier);
          if (damage < 1) damage = 1;
          
          // 检查一次性护身符（只对第一次攻击有效）
          if (i === 0 && Game.State.hasOneTimeProtection) {
              totalDamage = 0;
              Game.State.hasOneTimeProtection = false;
              protectionUsed = true;
              console.log("一次性护身符触发，抵挡了本次攻击！");
              break;
          }
          
          totalDamage += damage;
      }

      // 应用伤害
      if (totalDamage > 0) {
          Game.State.changeHP(-totalDamage);
      }
      battle.playerStats = Game.State.getEffectiveStats();

      if (useSkill && enemySkill) {
          console.log(`${enemy.name} 对你造成了 ${totalDamage} 点伤害！【${enemySkill.name}】`);
      } else {
      console.log(`${enemy.name} 对你造成了 ${totalDamage} 点伤害${attackCount > 1 ? `（连击${attackCount}次）` : ''}`);
      }

      // 显示攻击台词和伤害
      const textEl = document.getElementById("event-text");
      const optionsEl = document.getElementById("event-options");
      
      if (textEl && optionsEl) {
          let displayText = `战斗进行中...\n\n`;
          
          // 显示被动效果
          if (passives.mpRegen > 0) {
              displayText += `【被动效果】恢复了 ${passives.mpRegen} 点灵力\n\n`;
          }
          
          if (attackLine) {
              displayText += `${enemy.name}：\n${attackLine}\n\n`;
          }
          
          // 显示技能使用
          if (skillUsed) {
              displayText += `【${skillUsed.name}】`;
              if (skillUsed.effect === "reduceHitRate") {
                  displayText += `你的命中率降低了 ${skillUsed.value * 100}%！（持续3回合）\n\n`;
              } else if (skillUsed.effect === "reduceMP") {
                  displayText += `你的灵力减少了 ${skillUsed.value} 点！\n\n`;
              } else if (skillUsed.effect === "doubleAttack") {
                  displayText += `${enemy.name} 发动了连击！\n\n`;
              }
          }
          
          if (protectionUsed) {
              displayText += `【护身符触发】一次性护身符发出微光，完全抵挡了 ${enemy.name} 的攻击！\n\n`;
          } else if (totalDamage > 0) {
              displayText += `${enemy.name} 对你造成了 ${totalDamage} 点伤害${attackCount > 1 ? `（连击${attackCount}次）` : ''}！\n\n`;
          }
          
          displayText += `${enemy.name}\nHP: ${enemy.hp}/${enemy.maxHp}\n\n`;
          displayText += `你的状态\nHP: ${battle.playerStats.hp}/${battle.playerStats.maxHp}\nMP: ${battle.playerStats.mp}/${battle.playerStats.maxMp}`;
          
          textEl.textContent = displayText;
          
          // 清空选项，显示"继续"按钮
          optionsEl.innerHTML = "";
          const continueBtn = document.createElement("button");
          continueBtn.className = "option-btn";
          continueBtn.textContent = "继续战斗";
          continueBtn.onclick = () => {
              // 检查玩家是否被击败
              if (battle.playerStats.hp <= 0) {
                  this.endBattle(false);
                  return;
              }
              // 继续战斗（不显示台词）
              this.renderBattle();
          };
          optionsEl.appendChild(continueBtn);
      }

      // 检查玩家是否被击败
      if (battle.playerStats.hp <= 0) {
          this.stopAutoBattle(); // 停止自动战斗
          // 延迟一下再结束战斗，让玩家看到台词
          setTimeout(() => {
              this.endBattle(false);
          }, 1000);
          return;
      }
      
      // 如果正在自动战斗，在敌人回合后继续自动战斗循环
      if (this.isAutoBattle && this.currentBattle) {
          const battle = this.currentBattle;
          battle.playerStats = Game.State.getEffectiveStats();
          // 检查战斗是否结束
          if (battle.playerStats.hp <= 0 || battle.enemy.hp <= 0) {
              this.stopAutoBattle();
              return; // 会在其他地方处理结束
          }
          // 继续自动战斗
          setTimeout(() => {
              if (this.isAutoBattle && this.currentBattle) {
                  this.autoBattleLoop();
              }
          }, 500);
      }
  },

  // 显示道具菜单
  showItemMenu: function() {
      const textEl = document.getElementById("event-text");
      const optionsEl = document.getElementById("event-options");

      if (!textEl || !optionsEl) return;

      // 获取玩家背包中的消耗品
      const inventory = Game.State.inventory;
      const consumables = [];

      for (let itemId in inventory) {
          const item = Game.Items.byId[itemId];
          if (item && item.type === "consumable" && inventory[itemId] > 0) {
              consumables.push({ item: item, count: inventory[itemId] });
          }
      }

      if (consumables.length === 0) {
          textEl.textContent = "战斗进行中...\n\n你没有可用的消耗品！";
          optionsEl.innerHTML = "";
          const backBtn = document.createElement("button");
          backBtn.className = "option-btn";
          backBtn.textContent = "返回";
          backBtn.onclick = () => this.renderBattle();
          optionsEl.appendChild(backBtn);
          return;
      }

      // 显示道具列表
      textEl.textContent = "战斗进行中...\n\n选择要使用的道具：";
      optionsEl.innerHTML = "";

      consumables.forEach(({ item, count }) => {
          const btn = document.createElement("button");
          btn.className = "option-btn";
          btn.textContent = `${item.name} x${count}`;
          btn.onclick = () => this.useItemInBattle(item.id);
          optionsEl.appendChild(btn);
      });

      // 返回按钮
      const backBtn = document.createElement("button");
      backBtn.className = "option-btn";
      backBtn.textContent = "返回";
      backBtn.onclick = () => this.renderBattle();
      optionsEl.appendChild(backBtn);
  },

  // 在战斗中使用道具
  useItemInBattle: function(itemId) {
      const item = Game.Items.byId[itemId];
      if (!item || item.type !== "consumable") {
          console.error(`物品 ${itemId} 不能使用`);
          return;
      }

      if (Game.State.getItemCount(itemId) <= 0) {
          console.error(`物品 ${itemId} 数量不足`);
          this.renderBattle();
          return;
      }

      // 使用道具
      const result = Game.State.useItem(itemId);
      if (result) {
          // 更新战斗中的玩家状态
          this.currentBattle.playerStats = Game.State.getEffectiveStats();
          
          // 显示使用效果
          const textEl = document.getElementById("event-text");
          const optionsEl = document.getElementById("event-options");
          
          if (textEl && optionsEl) {
              const effectText = [];
              if (result.effect) {
                  if (result.effect.hp) {
                      effectText.push(`恢复了 ${result.effect.hp > 0 ? '+' : ''}${result.effect.hp} 点气血`);
                  }
                  if (result.effect.mp) {
                      effectText.push(`恢复了 ${result.effect.mp > 0 ? '+' : ''}${result.effect.mp} 点灵力`);
                  }
              }
              
              textEl.textContent = `战斗进行中...\n\n使用了：${item.name}\n${effectText.join('\n')}\n\n敌人回合！`;
              
              // 清空选项，准备敌人回合
              optionsEl.innerHTML = "";
              
              // 延迟后进入敌人回合
              setTimeout(() => {
                  this.enemyTurn();
              }, 1500);
          }
      }
  },

  // 结束战斗（由结算按钮调用，已合并到上面的新版本）
  // 注意：这个函数已被上面的 endBattle 替代，如果上面没有，则使用这个

  // 开始自动战斗
  startAutoBattle: function() {
      if (this.isAutoBattle) {
          return; // 已经在自动战斗中
      }

      this.isAutoBattle = true;
      console.log("开始自动战斗");

      // 更新界面显示自动战斗状态
      this.renderBattle();

      // 开始自动战斗循环
      this.autoBattleLoop();
  },

  // 停止自动战斗
  stopAutoBattle: function() {
      if (!this.isAutoBattle) {
          return;
      }

      this.isAutoBattle = false;
      if (this.autoBattleTimer) {
          clearTimeout(this.autoBattleTimer);
          this.autoBattleTimer = null;
      }
      console.log("停止自动战斗");

      // 更新界面
      if (this.currentBattle) {
          this.renderBattle();
      }
  },

  // 自动战斗循环
  autoBattleLoop: function() {
      if (!this.isAutoBattle || !this.currentBattle) {
          return;
      }

      const battle = this.currentBattle;
      const player = battle.playerStats;
      const enemy = battle.enemy;

      // 检查战斗是否结束
      if (enemy.hp <= 0) {
          this.stopAutoBattle();
          this.endBattle(true);
          return;
      }

      if (player.hp <= 0) {
          this.stopAutoBattle();
          this.endBattle(false);
          return;
      }

      // 随机选择行动：普攻或技能
      const learnedSkills = Game.State.learnedSkills;
      const availableSkills = [];

      // 收集可用的技能（MP足够）
      if (learnedSkills.length > 0) {
          learnedSkills.forEach(skillId => {
              const skill = this.getSkillData(skillId);
              if (skill && player.mp >= skill.mpCost) {
                  availableSkills.push(skillId);
              }
          });
      }

      // 决定使用什么攻击
      let action = null;
      if (availableSkills.length > 0 && Math.random() < 0.6) {
          // 60%概率使用技能（如果有可用技能）
          const randomSkillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
          action = () => {
              this.playerSkillAttack(randomSkillId);
              // 技能攻击后会自动进入敌人回合
          };
      } else {
          // 使用普攻
          action = () => {
              this.playerAttack();
              // 普攻后会自动进入敌人回合
          };
      }

      // 执行行动
      action();

      // 注意：由于 playerAttack 和 playerSkillAttack 会调用 enemyTurn，
      // 而 enemyTurn 在显示完敌人攻击后也会继续自动战斗循环，
      // 所以这里不需要再设置定时器
  }
};