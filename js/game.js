// ==========================
// 游戏主控：事件流程、选项处理
// ==========================

Game.Game = {
  // 开始新游戏
  startNewGame: function() {
      console.log("开始新游戏");
      
      // 初始化状态
      Game.State.progress.currentEventId = "ch1_intro_1";
      Game.State.progress.currentChapter = 1;

      // 必须确保 relationships 对象存在，否则 meetNPC 会报错或无效
      Game.State.initRelationships();
      
      // 初始化 flags
      Game.State.initFlags();

      // 初始化 NPC 关系（从 npcs.js 同步初始数据）
      this.initNPCRelationships();

      // 新游戏：先播放序章事件
      this.goToEvent("ch1_intro_1");
  },

  // 重置章节进度（保留属性、背包和人脉数据，仅重置剧情点）
  resetChapterProgress: function(chapterId) {
      if (chapterId === 1) {
          Game.State.progress.currentEventId = "ch1_intro_1";
          Game.State.progress.currentChapter = 1;
          // 切换到剧情模式
          this.goToEvent("ch1_intro_1");
      }
  },

  // 初始化 NPC 关系
  initNPCRelationships: function() {
      Game.State.initRelationships();

      // 如果 npcData 存在，同步初始数据
      if (typeof npcData !== 'undefined') {
          for (let npcId in npcData) {
              const npc = npcData[npcId];
              if (!Game.State.relationships[npcId]) {
                  // 红姐特殊设定：确保好感度为200（满值）
                  let initialAffinity = npc.affinity || 0;
                  if (npcId === "红姐") {
                      initialAffinity = 200;
                  }
                  
                  Game.State.relationships[npcId] = {
                      affinity: initialAffinity,
                      bondLevel: npc.bondLevel || 0,
                      met: initialAffinity > 0 || npc.bondLevel > 0 // 如果初始有好感或等级，视为已解锁
                  };
              } else {
                  // 如果已存在，确保红姐的好感度为200
                  if (npcId === "红姐" && Game.State.relationships[npcId].affinity < 200) {
                      Game.State.relationships[npcId].affinity = 200;
                  }
                  // 确保 met 标记正确
                  if (Game.State.relationships[npcId].affinity > 0 || Game.State.relationships[npcId].bondLevel > 0) {
                      Game.State.relationships[npcId].met = true;
                  }
              }
          }
      }
  },

  // 跳转到指定事件
  goToEvent: function(eventId) {
      const event = Game.EventRegistry.byId[eventId];
      if (!event) {
          console.error(`事件 ${eventId} 不存在`);
          return;
      }

      // 检查精力：如果精力为0，且不是休息或剧情对话类事件，提示并阻止
      const player = Game.State.player;
      if (player.energy <= 0) {
          // 允许的事件类型：休息、商店（可以买药）、剧情对话（无消耗）
          const allowedTypes = ["story", "shop"];
          const isRestEvent = eventId.includes("rest") || eventId.includes("rental") || 
                              (event.options && event.options.some(opt => opt.text && opt.text.includes("休息")));
          
          if (!allowedTypes.includes(event.type) && !isRestEvent) {
              alert("精力耗尽，寸步难行，请回家休息。");
              // 可以强制跳转到出租屋或提供休息选项
              // 这里暂时只提示，不强制跳转，让玩家自己选择
              return;
          }
      }

      console.log(`进入事件：${eventId}`);

      // 更新当前事件ID
      Game.State.progress.currentEventId = eventId;
      
      // 自动存档（剧情跳转后）
      Game.Save.save();

      // 切换到剧情模式（显示事件区域）
      Game.UI.showStoryMode();

      // 根据事件类型处理
      switch (event.type) {
          case "story":
              this.handleStoryEvent(event);
              break;
          case "battle":
              this.handleBattleEvent(event);
              break;
          case "shop":
              this.handleShopEvent(event);
              break;
          case "cultivate":
              this.handleCultivateEvent(event);
              break;
          default:
              console.warn(`未知事件类型：${event.type}`);
              this.handleStoryEvent(event);
      }
  },

  // 处理剧情事件
  handleStoryEvent: function(event) {
      // 处理动态随机探索事件
      if (event.id === "ch1_explore_random_result") {
          if (event.dynamicText && typeof event.dynamicText === "function") {
              const nextEventId = event.dynamicText();
              this.goToEvent(nextEventId);
              return;
          }
      }
      
      // 检查是否需要动态修改文本（针对装备事件）
      if (event.id === "ch1_rental_find_item") {
          const hasSword = Game.State.getItemCount("starter_sword") > 0;
          if (hasSword) {
              const modifiedEvent = Object.assign({}, event);
              modifiedEvent.text = 
                  "你在房间里翻找起来。\n\n" +
                  "抽屉里有一些前任租客留下的杂物：几根数据线、一个旧手机壳、还有一把看起来有点锈的水果刀。\n\n" +
                  "你拿起那把水果刀，但发现你背包里已经有一把了。\n\n" +
                  "你把它放回原处。";
              Game.UI.renderTextEvent(modifiedEvent, (event, option) => {
                  this.handleOptionSelect(modifiedEvent, option);
              });
              this.updateUI();
              return;
          }
      }
      
      if (event.id === "ch1_training_find_item") {
          const hasArmor = Game.State.getItemCount("cheap_armor") > 0;
          const hasTalisman = Game.State.getItemCount("talisman") > 0;
          if (hasArmor && hasTalisman) {
              const modifiedEvent = Object.assign({}, event);
              modifiedEvent.text = 
                  "你在工厂外围仔细搜索，在一个废弃的储物柜里发现了一些东西。\n\n" +
                  "虽然都是些旧物，但你已经有了这些装备，没有再拿的必要了。";
              Game.UI.renderTextEvent(modifiedEvent, (event, option) => {
                  this.handleOptionSelect(modifiedEvent, option);
              });
              this.updateUI();
              return;
          } else if (hasArmor || hasTalisman) {
              const modifiedEvent = Object.assign({}, event);
              let newText = "你在工厂外围仔细搜索，在一个废弃的储物柜里发现了一些东西。\n\n";
              if (hasArmor) {
                  newText += "你看到一件旧外套，但你已经有了。";
              }
              if (hasTalisman) {
                  newText += "你看到一个简单的护身符，但你已经有了。";
              }
              newText += "\n\n虽然都是些旧物，但其中一件似乎还能用。";
              modifiedEvent.text = newText;
              Game.UI.renderTextEvent(modifiedEvent, (event, option) => {
                  this.handleOptionSelect(modifiedEvent, option);
              });
              this.updateUI();
              return;
          }
      }

      // 检查是否有直接跳转（event.next）且没有选项
      if (event.next && (!event.options || event.options.length === 0)) {
          // 应用事件效果
          if (event.effects) {
              this.applyEffects(event.effects);
          }
          // 直接跳转到下一个事件
          setTimeout(() => {
              this.goToEvent(event.next);
          }, 100);
          this.updateUI();
          return;
      }

      Game.UI.renderTextEvent(event, (event, option) => {
          this.handleOptionSelect(event, option);
      });
      this.updateUI();
  },

  // 处理战斗事件
  handleBattleEvent: function(event) {
      if (!event.enemyId) {
          console.error("战斗事件缺少 enemyId");
          return;
      }

      // 先显示战斗前的文本
      const textEl = document.getElementById("event-text");
      if (textEl) {
          textEl.textContent = event.text || "战斗开始！";
      }

      // 开始战斗
      Game.Battle.start(event.enemyId, {
          onEnd: (playerWon, battleResult) => {
              // 战斗结束后的处理
              if (playerWon) {
                  // 显示战斗胜利界面
                  this.showBattleVictoryScreen(event, battleResult);
              } else {
                  // 战斗失败：显示失败界面
                  this.showBattleDefeatScreen(event);
              }
          }
      });
  },

  // 处理商店事件
  handleShopEvent: function(event) {
      this.openShopFromEvent(event);
  },

  // 处理修炼事件
  handleCultivateEvent: function(event) {
      // TODO: 实现修炼界面
      console.log("进入修炼界面");
      Game.UI.showCultivateView();
  },

  // 处理选项选择
  handleOptionSelect: function(event, option) {
      // 优先执行自定义 action（如果存在）
      if (option.action && typeof option.action === "function") {
          option.action();
      }

      // 执行选项效果
      if (option.effects) {
          this.applyEffects(option.effects);
      }

      // 跳转到下一个事件
      if (option.next) {
          setTimeout(() => {
              this.goToEvent(option.next);
          }, 100);
      }
  },

  // 应用效果
  applyEffects: function(effects) {
      if (effects.exp) {
          Game.State.addExp(effects.exp);
      }
      if (effects.hp) {
          Game.State.changeHP(effects.hp);
      }
      if (effects.mp) {
          Game.State.changeMP(effects.mp);
      }
      // 处理精力值变化
      if (effects.energy) {
          Game.State.player.energy = Math.max(0, Math.min(
              Game.State.player.maxEnergy, 
              Game.State.player.energy + effects.energy
          ));
          console.log(`精力 ${effects.energy > 0 ? '+' : ''}${effects.energy}，当前：${Game.State.player.energy}/${Game.State.player.maxEnergy}`);
      }
      // 兼容旧代码：effects.gold 转换为 money
      if (effects.gold) {
          Game.State.player.money = (Game.State.player.money || 0) + effects.gold;
      }
      if (effects.money) {
          Game.State.player.money = (Game.State.player.money || 0) + effects.money;
      }
      if (effects.failureCount) {
          Game.State.failureCount += effects.failureCount;
          console.log(`失败感 +${effects.failureCount}，当前：${Game.State.failureCount}`);
      }
      if (effects.item) {
          const item = Game.Items.byId[effects.item.id];
          if (!item) {
              console.warn(`物品 ${effects.item.id} 不存在`);
              return;
          }
          
          // 检查技能书：如果已经学会技能，不再给书
          if (item.type === "skill_book" && item.skill) {
              if (Game.State.hasSkill(item.skill.id)) {
                  console.log(`技能 ${item.skill.name} 已学会，不再获得技能书`);
                  return; // 不添加物品
              }
              // 检查背包中是否已有该技能书
              if (Game.State.getItemCount(effects.item.id) > 0) {
                  console.log(`技能书 ${item.name} 已存在，不再重复获得`);
                  return; // 不添加物品
              }
          }
          
          // 检查装备：如果已有该装备，不再重复获得
          if (item.type === "equipment") {
              if (Game.State.getItemCount(effects.item.id) > 0) {
                  console.log(`装备 ${item.name} 已存在，不再重复获得`);
                  return; // 不添加物品
              }
          }
          
          Game.State.addItem(effects.item.id, effects.item.count || 1);
      }
      
      // 处理 flag 设置（用于解锁机制）
      if (effects.flag) {
          Game.State.initFlags();
          Game.State.flags[effects.flag] = true;
          console.log(`设置标志位：${effects.flag} = true`);
      }

      this.updateUI();
  },

  // 更新UI
  updateUI: function() {
      Game.UI.renderPlayerStatus(Game.State);
      
      const realm = Game.CoreConfig.realms.find(r => r.id === Game.State.player.realm);
      if (realm) {
          // 如果有瓶颈，在境界名称后添加提示
          const realmName = Game.State.player.isBottleneck ? `${realm.name} (瓶颈)` : realm.name;
          Game.UI.updateRealmInfo(realmName);
      }

      // 更新章节信息
      const chapter = `第${Game.State.progress.currentChapter}章`;
      Game.UI.updateChapterInfo(chapter, "南昌");
      
      // 更新行动按钮状态
      Game.UI.updateActionButtons();
  },

  // 从菜单装备物品
  onEquipItemFromMenu: function(slot, itemId) {
      if (Game.State.equipItem(slot, itemId)) {
          this.updateUI();
          Game.UI.renderMenuContent();
          console.log(`装备了物品：${itemId}`);
      }
  },

  // 卸下装备
  onUnequipItem: function(slot) {
      if (Game.State.unequipItem(slot)) {
          this.updateUI();
          Game.UI.renderMenuContent();
          console.log(`卸下了装备：${slot}`);
      }
  },

  // 从菜单使用物品
  onItemUseFromMenu: function(itemId) {
      const item = Game.Items.byId[itemId];
      if (!item) {
          console.error(`物品 ${itemId} 不存在`);
          return;
      }

      // 处理技能书
      if (item.type === "skill_book") {
          if (Game.State.hasSkill(item.skill.id)) {
              alert("你已经学会这个技能了，无法重复学习！");
              return;
          }
      }

      // 处理消耗品
      if (item.type === "consumable" && item.type !== "skill_book") {
          if (item.type !== "consumable") {
              console.error(`物品 ${itemId} 不能使用`);
              return;
          }
      }

      const result = Game.State.useItem(itemId);
      if (result && result.success) {
          this.updateUI();
          Game.UI.renderMenuContent();
          console.log(`使用了物品：${itemId}`);
          
          // 如果是技能书，显示学习提示
          if (result.skill) {
              alert(result.message || `你学会了技能：${result.skill.name}！\n${result.skill.description}`);
              Game.UI.renderMenuContent();
          }
          
          // 如果是灵石，显示特殊提示
          if (result.effect && result.effect.resetCultivateCount) {
              this.lastCultivateMessage = "一阵清凉从丹田扩散开来，你感觉今天的疲惫被灵石剥离，仿佛还能再修炼十遍。";
              Game.UI.renderMenuContent();
          }
      } else if (result && !result.success) {
          alert(result.message || "无法使用该物品");
      }
  },

  // 从菜单出售物品
  onItemSellFromMenu: function(itemId, count) {
      const item = Game.Items.byId[itemId];
      if (!item) {
          console.error(`物品 ${itemId} 不存在`);
          return;
      }

      // 确认出售
      const sellPrice = Math.floor(item.price * 0.6 * count);
      if (confirm(`确定要出售 ${item.name} x${count} 吗？\n将获得 ${sellPrice} 金币（原价的60%）`)) {
          const result = Game.State.sellItem(itemId, count);
          if (result) {
              this.updateUI();
              Game.UI.renderMenuContent();
              console.log(`出售了物品：${itemId} x${count}，获得 ¥${result.money || 0} 人民币`);
              // 自动存档（出售物品后）
              Game.Save.save();
          }
      }
  },

  // 修炼点击
  lastCultivateMessage: "",
  onCultivateClick: function() {
      const player = Game.State.player;
      
      // 如果遇到瓶颈，执行突破
      if (player.isBottleneck) {
          this.onAttemptBreakthrough();
          return;
      }
      
      // 否则执行普通修炼
      const result = Game.State.doCultivate();
      if (result.success) {
          this.lastCultivateMessage = result.message;
          this.updateUI();
          Game.UI.renderMenuContent();
          // 自动存档（修炼后）
          Game.Save.save();
      } else {
          this.lastCultivateMessage = result.message;
          Game.UI.renderMenuContent();
      }
  },

  // 显示战斗胜利界面
  showBattleVictoryScreen: function(event, battleResult) {
      const textEl = document.getElementById("event-text");
      const optionsEl = document.getElementById("event-options");

      if (!textEl || !optionsEl) return;

      // 更新UI
      this.updateUI();

      // 构建胜利文本
      let victoryText = "战斗胜利！\n\n";
      if (battleResult && battleResult.exp) {
          victoryText += `获得经验：${battleResult.exp}\n`;
      }
      // 兼容旧代码：gold 或 money
      const money = battleResult?.money || battleResult?.gold || 0;
      if (money > 0) {
          // 注意：奖励已经在 endBattle 中应用，这里只显示
          victoryText += `获得人民币：¥${money}\n`;
      }
      
      const droppedItems = battleResult?.droppedItems || battleResult?.items || [];
      if (droppedItems.length > 0) {
          victoryText += `\n【掉落物品】\n`;
          droppedItems.forEach(item => {
              victoryText += `• ${item.name}\n`;
          });
      } else {
          victoryText += `\n（未获得掉落物品）\n`;
      }

      textEl.textContent = victoryText;

      optionsEl.innerHTML = "";

      // 继续按钮
      const continueBtn = document.createElement("button");
      continueBtn.className = "option-btn";
      continueBtn.textContent = "继续";
      continueBtn.onclick = () => {
          // 继续游戏流程
          if (event.options && event.options.length > 0) {
              const nextEventId = event.options[0].next;
              if (nextEventId) {
                  this.goToEvent(nextEventId);
              }
          }
      };
      optionsEl.appendChild(continueBtn);
  },

  // 显示战斗失败界面
  showBattleDefeatScreen: function(event) {
      const textEl = document.getElementById("event-text");
      const optionsEl = document.getElementById("event-options");

      if (!textEl || !optionsEl) return;

      // 恢复部分HP（避免完全死亡）
      Game.State.changeHP(Math.floor(Game.State.player.maxHp * 0.3));
      this.updateUI();

      textEl.textContent = "战斗失败...\n\n你被击败了，意识逐渐模糊...\n\n不知过了多久，你醒了过来，发现自己还活着，但伤势不轻。\n\n看来需要重新准备一下了。";

      optionsEl.innerHTML = "";

      // 重新挑战按钮
      const retryBtn = document.createElement("button");
      retryBtn.className = "option-btn";
      retryBtn.textContent = "重新挑战";
      retryBtn.onclick = () => {
          // 重新开始这场战斗
          this.handleBattleEvent(event);
      };
      optionsEl.appendChild(retryBtn);

      // 返回上一个事件（如果有的话）
      if (event.fallbackEventId) {
          const backBtn = document.createElement("button");
          backBtn.className = "option-btn";
          backBtn.textContent = "返回";
          backBtn.onclick = () => {
              this.goToEvent(event.fallbackEventId);
          };
          optionsEl.appendChild(backBtn);
      } else {
          // 如果没有fallback，提供返回出租屋的选项
          const homeBtn = document.createElement("button");
          homeBtn.className = "option-btn";
          homeBtn.textContent = "回出租屋休整";
          homeBtn.onclick = () => {
              // 跳转到出租屋相关事件
              this.goToEvent("ch1_rental_night_cultivate");
          };
          optionsEl.appendChild(homeBtn);
      }
  },

  // 从事件打开商店
  openShopFromEvent: function(event) {
      const shopId = event.shopId;
      if (!shopId) {
          console.error("商店事件缺少 shopId");
          return;
      }

      Game.Shop.open(shopId, () => {
          // 商店关闭后，跳转到 next 事件
          if (event.next) {
              this.goToEvent(event.next);
          }
      });
  },

  // 打工赚钱
  onWorkClick: function() {
      const player = Game.State.player;
      
      // 检查精力是否足够
      if (player.energy < 20) {
          alert("太累了，先休息一下吧。");
          return;
      }
      
      // 消耗20点精力
      player.energy = Math.max(0, player.energy - 20);
      
      // 获得300~500随机人民币
      const moneyEarned = 300 + Math.floor(Math.random() * 201); // 300-500
      player.money = (player.money || 0) + moneyEarned;
      
      // 随机打工趣事文案
      const workMessages = [
          "送了一晚上外卖，腿都跑断了",
          "在网吧当网管，顺便蹭了会儿网",
          "帮人写代码，头发掉了一把",
          "在便利店值夜班，看了不少深夜故事",
          "跑腿送文件，顺便熟悉了南昌的大街小巷",
          "在餐厅端盘子，学会了看人脸色",
          "做临时工搬货，练出了一身力气"
      ];
      const message = workMessages[Math.floor(Math.random() * workMessages.length)];
      
      alert(`${message}\n\n获得 ¥${moneyEarned} 人民币\n消耗 20 点精力`);
      
      this.updateUI();
      // 自动存档（打工后）
      Game.Save.save();
  },

  // 回家休息
  onRestClick: function() {
      const result = Game.State.rest();
      if (result && result.success) {
          alert(result.message || "回到出租屋睡了一觉，精神好多了。");
          this.updateUI();
          // 刷新主界面
          Game.UI.refreshHome();
          // 自动存档（休息后）
          Game.Save.save();
      }
  },

  // 尝试突破境界
  onAttemptBreakthrough: function() {
      const result = Game.State.attemptBreakthrough();
      
      // 显示结果消息
      if (result.success) {
          alert(result.message || "恭喜！你成功突破了境界！");
      } else {
          // 根据失败原因显示不同提示
          if (result.reason === "missing_item") {
              const itemName = result.itemName || "所需物品";
              alert(`${result.message}\n\n提示：你可以在"炼丹/炼器"界面制造突破丹药。`);
          } else {
              alert(result.message || "无法突破境界。");
          }
      }
      
      // 自动存档（突破后）
      Game.Save.save();
      this.updateUI();
      Game.UI.renderMenuContent();
      Game.UI.renderHomeCards();  // 刷新主界面卡片（更新按钮状态）
  },

  // 城市探索
  onExploreCity: function() {
      const player = Game.State.player;
      
      // 检查精力是否足够
      if (player.energy < 15) {
          alert("太累了，先休息一下吧。");
          return;
      }

      // 消耗精力
      player.energy = Math.max(0, player.energy - 15);
      this.updateUI();

      // 随机事件
      const rand = Math.random();
      if (rand < 0.5) {
          // 50% 概率：偶遇 NPC
          this.encounterNPC();
      } else if (rand < 0.8) {
          // 30% 概率：遭遇战斗
          this.encounterCombat();
      } else {
          // 20% 概率：捡漏/奇遇
          this.encounterTreasure();
      }

      // 刷新主界面（如果当前在主界面）
      Game.UI.refreshHome();
      // 自动存档
      Game.Save.save();
  },

  // 偶遇 NPC
  encounterNPC: function() {
      // 获取所有未解锁或已解锁的 NPC
      const availableNPCs = [];
      if (typeof npcData !== 'undefined') {
          for (let npcId in npcData) {
              availableNPCs.push(npcId);
          }
      }

      if (availableNPCs.length === 0) {
          alert("你在城市中闲逛，但没有遇到任何人。");
          return;
      }

      // 随机选择一个 NPC
      const randomNPCId = availableNPCs[Math.floor(Math.random() * availableNPCs.length)];
      const npc = Game.Social.getNPCData(randomNPCId);
      
      if (!npc) {
          alert("你在城市中闲逛，但没有遇到任何人。");
          return;
      }

      // 务必先解锁 NPC（存入数据），这样交互界面才能读到好感度，人脉列表里才会出现
      if (Game.Social && Game.Social.meetNPC) {
          Game.Social.meetNPC(randomNPCId);
      }

      // 显示 NPC 交互界面
      Game.UI.showNPCInteraction(randomNPCId);
  },

  // 遭遇战斗
  encounterCombat: function() {
      // 随机选择一个普通敌人（可以从 enemies.js 中选择）
      const commonEnemies = ["street_thug", "shadow_creature"]; // 示例敌人ID
      const randomEnemyId = commonEnemies[Math.floor(Math.random() * commonEnemies.length)];
      
      // 检查敌人是否存在
      let enemyId = randomEnemyId;
      if (!Game.Enemies.byId[enemyId]) {
          // 如果敌人不存在，使用第一个可用的敌人
          const enemyIds = Object.keys(Game.Enemies.byId);
          if (enemyIds.length > 0) {
              enemyId = enemyIds[0];
          } else {
              alert("没有可用的敌人数据。");
              return;
          }
      }

      Game.Battle.start(enemyId, {
          onEnd: (playerWon, battleResult) => {
              // 构建战斗结束事件
              const endEvent = {
                  text: playerWon 
                      ? `战斗胜利！\n\n你击败了敌人，获得了战利品。\n\n战斗结束，你收拾好战利品，重新回到了喧闹的街头。`
                      : `战斗失败...\n\n你被击败了，但幸运的是敌人没有继续追击。\n\n你拖着疲惫的身体回到了街头。`,
                  options: [{
                      text: "离开战斗现场，返回出租屋",
                      action: function() {
                          Game.Game.returnToHome();
                      }
                  }]
              };

              // 使用 renderTextEvent 显示结果
              Game.UI.renderTextEvent(endEvent, (event, option) => {
                  this.handleOptionSelect(event, option);
              });
          }
      });
  },

  // 捡漏/奇遇
  encounterTreasure: function() {
      const rand = Math.random();
      let treasureEvent = null;

      if (rand < 0.7) {
          // 70% 概率：获得金钱
          const money = 50 + Math.floor(Math.random() * 150); // 50-200
          treasureEvent = {
              text: `你在路边捡到了一个钱包，获得 ¥${money} 人民币！\n\n你继续在街头探索...`,
                  options: [{
                      text: "收入囊中，返回出租屋",
                      action: function() {
                          Game.State.player.money = (Game.State.player.money || 0) + money;
                          Game.Game.returnToHome();
                      }
                  }]
          };
      } else {
          // 30% 概率：获得道具
          const commonItems = ["basic_pill_hp", "basic_pill_mp", "instant_noodles"];
          const randomItemId = commonItems[Math.floor(Math.random() * commonItems.length)];
          if (Game.Items.byId[randomItemId]) {
              const item = Game.Items.byId[randomItemId];
              treasureEvent = {
                  text: `你在角落里发现了一个 ${item.name}！\n\n你继续在街头探索...`,
                  options: [{
                      text: "收入囊中，返回出租屋",
                      action: function() {
                          Game.State.addItem(randomItemId, 1);
                          Game.Game.returnToHome();
                      }
                  }]
              };
          } else {
              // 如果物品不存在，给金钱
              const money = 50 + Math.floor(Math.random() * 100);
              treasureEvent = {
                  text: `你在路边捡到了 ¥${money} 人民币！\n\n你继续在街头探索...`,
                  options: [{
                      text: "收入囊中，返回出租屋",
                      action: function() {
                          Game.State.player.money = (Game.State.player.money || 0) + money;
                          Game.Game.returnToHome();
                      }
                  }]
              };
          }
      }

      // 使用 renderTextEvent 显示结果
      if (treasureEvent) {
          Game.UI.renderTextEvent(treasureEvent, (event, option) => {
              this.handleOptionSelect(event, option);
          });
      }
      this.updateUI();
  },

  // NPC 交互：闲聊
  onNPCChat: function(npcId) {
      const player = Game.State.player;
      if (player.energy < 5) {
          alert("太累了，先休息一下吧。");
          return;
      }

      player.energy = Math.max(0, player.energy - 5);
      const result = Game.Social.changeAffinity(npcId, 5);
      const npc = Game.Social.getNPCData(npcId);
      
      alert(`你与 ${npc.name} 闲聊了一会儿，好感度 +5\n当前好感度：${result.newAffinity}`);
      
      this.updateUI();
      Game.Save.save();
  },

  // NPC 交互：送礼
  onNPCGift: function(npcId, itemId) {
      const item = Game.Items.byId[itemId];
      if (!item) {
          alert("物品不存在");
          return;
      }

      if (Game.State.getItemCount(itemId) <= 0) {
          alert("你没有这个物品");
          return;
      }

      // 移除物品
      Game.State.removeItem(itemId, 1);

      // 计算送礼效果
      const effect = Game.Social.getGiftEffect(npcId, itemId);
      if (effect) {
          const result = Game.Social.changeAffinity(npcId, effect.affinity);
          const npc = Game.Social.getNPCData(npcId);
          
          let message = effect.message;
          if (result.leveledUp) {
              message += `\n【羁绊升级】与 ${npc.name} 的羁绊等级提升到 Level ${result.newLevel === 'MAX' ? 'MAX' : result.newLevel}！`;
          }
          
          alert(message);
      }

      this.updateUI();
      Game.UI.renderMenuContent();
      Game.Save.save();
  },

  // NPC 交互：切磋
  onNPCCombat: function(npcId) {
      const npc = Game.Social.getNPCData(npcId);
      if (!npc) return;

      // 使用 NPC 数据中的战斗属性（如果存在）
      const tempEnemy = {
          id: `npc_${npcId}`,
          name: npc.name,
          hp: npc.hp || 100,
          maxHp: npc.maxHp || npc.hp || 100,
          attack: npc.attack || 20,
          defense: npc.defense || 10,
          exp: (npc.loot && npc.loot.exp) || 30,
          gold: (npc.loot && npc.loot.money) || 0,
          skills: npc.skills || []  // 传递技能数据
      };

      // 临时注册敌人
      if (!Game.Enemies.byId[tempEnemy.id]) {
          Game.Enemies.byId[tempEnemy.id] = tempEnemy;
      }

      Game.Battle.start(tempEnemy.id, {
          onEnd: (playerWon, battleResult) => {
              // 计算切磋后的好感度变化
              const reaction = Game.Social.getCombatReaction(npcId, playerWon);
              if (reaction) {
                  const result = Game.Social.changeAffinity(npcId, reaction.affinity);
                  alert(reaction.message);
                  if (result.leveledUp) {
                      alert(`【羁绊升级】与 ${npc.name} 的羁绊等级提升到 Level ${result.newLevel === 'MAX' ? 'MAX' : result.newLevel}！`);
                  }
              }

              // 清理临时敌人
              delete Game.Enemies.byId[tempEnemy.id];

              this.updateUI();
              Game.Save.save();
          }
      });
  },

  // 返回出租屋主界面
  returnToHome: function() {
      // 更新UI
      this.updateUI();
      // 显示主界面
      Game.UI.showHome();
      // 刷新主界面卡片（更新按钮状态）
      Game.UI.refreshHome();
  }
};