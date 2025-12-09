// ==========================
// 战斗系统：回合制战斗
// ==========================

Game.Battle = {
  currentBattle: null,
  isAutoBattle: false,  // 是否正在自动战斗
  autoBattleTimer: null,  // 自动战斗定时器

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
          onEnd: options.onEnd || null
      };

      console.log(`战斗开始：${enemy.name}`);
      this.renderBattle();
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

      // 敌人攻击（根据阶段决定攻击次数）
      let attackCount = 1;
      if (skillUsed && skillUsed.effect === "doubleAttack") {
          attackCount = skillUsed.value; // 连击次数
      }

      let totalDamage = 0;
      for (let i = 0; i < attackCount; i++) {
          let damage = enemy.attack - player.defense;
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

      console.log(`${enemy.name} 对你造成了 ${totalDamage} 点伤害${attackCount > 1 ? `（连击${attackCount}次）` : ''}`);

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

  // 结束战斗
  endBattle: function(playerWon) {
      // 停止自动战斗
      this.stopAutoBattle();
      
      const battle = this.currentBattle;
      const enemy = Game.Enemies.byId[battle.enemy.id];
      const battleResult = {
          won: playerWon,
          exp: 0,
          gold: 0,
          droppedItems: []
      };

      if (playerWon) {
          // 玩家胜利：获得经验和金币
          Game.State.addExp(enemy.exp);
          Game.State.player.gold += enemy.gold;
          battleResult.exp = enemy.exp;
          battleResult.gold = enemy.gold;
          console.log(`战斗胜利！获得 ${enemy.exp} 经验，${enemy.gold} 金币`);
          
          // 处理掉落
          if (enemy.drops) {
              for (let itemId in enemy.drops) {
                  const dropChance = enemy.drops[itemId];
                  if (Math.random() < dropChance) {
                      // 检查是否已有该装备（防止重复获得）
                      if (Game.State.getItemCount(itemId) === 0) {
                          Game.State.addItem(itemId, 1);
                          const item = Game.Items.byId[itemId];
                          if (item) {
                              battleResult.droppedItems.push(item);
                              console.log(`获得掉落：${item.name}`);
                          }
                      } else {
                          console.log(`已有装备 ${itemId}，不再重复获得`);
                      }
                  }
              }
          }
      } else {
          // 玩家失败：不在这里恢复HP，让失败界面处理
          console.log("战斗失败...");
      }

      // 保存战斗结果到 battle 对象，供回调使用
      battle.result = battleResult;

      // 调用回调
      if (battle.onEnd) {
          battle.onEnd(playerWon, battleResult);
      }

      this.currentBattle = null;
  },

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