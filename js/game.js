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

      // 渲染初始事件
      this.goToEvent("ch1_intro_1");
  },

  // 跳转到指定事件
  goToEvent: function(eventId) {
      const event = Game.EventRegistry.byId[eventId];
      if (!event) {
          console.error(`事件 ${eventId} 不存在`);
          return;
      }

      console.log(`进入事件：${eventId}`);

      // 更新当前事件ID
      Game.State.progress.currentEventId = eventId;

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
      
      // 检查是否需要动态修改文本（针对技能书事件）
      if (event.id === "ch1_event_fortune_teller_get_book") {
          const hasBook = Game.State.getItemCount("spell_book_qi_blast") > 0;
          const hasSkill = Game.State.hasSkill("qi_blast");
          
          if (hasSkill) {
              // 如果已学会技能，修改文本
              const modifiedEvent = Object.assign({}, event);
              modifiedEvent.text = 
                  "你接过那本破旧的小册子，但发现你已经学会了这个技能。\n\n" +
                  "「看来你已经掌握了，」算命先生点点头，「那这本书对你来说就没用了。」\n\n" +
                  "他把书收了回去。";
              // 移除添加物品的效果
              if (modifiedEvent.options && modifiedEvent.options[0] && modifiedEvent.options[0].effects) {
                  delete modifiedEvent.options[0].effects.item;
              }
              Game.UI.renderTextEvent(modifiedEvent, (event, option) => {
                  this.handleOptionSelect(modifiedEvent, option);
              });
              this.updateUI();
              return;
          } else if (hasBook) {
              // 如果已有技能书，修改文本
              const modifiedEvent = Object.assign({}, event);
              modifiedEvent.text = 
                  "你接过那本破旧的小册子，但发现你背包里已经有一本了。\n\n" +
                  "「你已经有了，」算命先生说，「好好修炼吧。」";
              // 移除添加物品的效果
              if (modifiedEvent.options && modifiedEvent.options[0] && modifiedEvent.options[0].effects) {
                  delete modifiedEvent.options[0].effects.item;
              }
              Game.UI.renderTextEvent(modifiedEvent, (event, option) => {
                  this.handleOptionSelect(modifiedEvent, option);
              });
              this.updateUI();
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
      if (effects.gold) {
          Game.State.player.gold += effects.gold;
      }
      if (effects.money) {
          Game.State.player.gold += effects.money;
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

      this.updateUI();
  },

  // 更新UI
  updateUI: function() {
      Game.UI.renderPlayerStatus(Game.State);
      
      const realm = Game.CoreConfig.realms.find(r => r.id === Game.State.player.realm);
      if (realm) {
          Game.UI.updateRealmInfo(realm.name);
      }

      // 更新章节信息
      const chapter = `第${Game.State.progress.currentChapter}章`;
      Game.UI.updateChapterInfo(chapter, "南昌");
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
              console.log(`出售了物品：${itemId} x${count}，获得 ${result.gold} 金币`);
          }
      }
  },

  // 修炼点击
  lastCultivateMessage: "",
  onCultivateClick: function() {
      const result = Game.State.doCultivate();
      if (result.success) {
          this.lastCultivateMessage = result.message;
          this.updateUI();
          Game.UI.renderMenuContent();
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
      victoryText += `获得经验：${battleResult.exp}\n`;
      victoryText += `获得金币：${battleResult.gold}\n`;
      
      if (battleResult.droppedItems.length > 0) {
          victoryText += `\n【掉落物品】\n`;
          battleResult.droppedItems.forEach(item => {
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
  }
};