// ==========================
// UI 渲染层：所有 DOM 操作
// ==========================

Game.UI = {
  // 渲染文本事件
  renderTextEvent: function(event, onOptionSelect) {
      const textEl = document.getElementById("event-text");
      const optionsEl = document.getElementById("event-options");

      if (!textEl || !optionsEl) {
          console.error("UI 元素不存在");
          return;
      }

      // 显示文本
      let displayText = event.text || "";
      if (event.speaker && event.speaker !== "旁白") {
          displayText = `${event.speaker}：\n\n${displayText}`;
      }
      textEl.textContent = displayText;

      // 清空选项
      optionsEl.innerHTML = "";

      // 检查是否有动态选项
      let optionsToRender = event.options;
      if (event.dynamicOptions && typeof event.dynamicOptions === "function") {
          const dynamicOpts = event.dynamicOptions();
          if (dynamicOpts) {
              optionsToRender = dynamicOpts;
          }
      }

      // 创建选项按钮
      if (optionsToRender && optionsToRender.length > 0) {
          optionsToRender.forEach((option, index) => {
              const btn = document.createElement("button");
              btn.className = "option-btn";
              btn.textContent = option.text;
              if (option.disabled) {
                  btn.disabled = true;
                  btn.style.opacity = "0.6";
                  btn.style.cursor = "not-allowed";
              } else {
                  btn.onclick = () => {
                      if (onOptionSelect) {
                          onOptionSelect(event, option);
                      }
                  };
              }
              optionsEl.appendChild(btn);
          });
      }
  },

  // 渲染玩家状态
  renderPlayerStatus: function(state) {
      const statusEl = document.getElementById("player-status");
      const compactEl = document.getElementById("status-compact");
      if (!statusEl) return;

      const player = state.player;
      const realm = Game.CoreConfig.realms.find(r => r.id === player.realm);

      // 更新详细状态栏
      statusEl.innerHTML = `
          <div class="status-item">
              <div class="status-label">境界</div>
              <div class="status-value">${realm ? realm.name : "未知"}</div>
          </div>
          <div class="status-item">
              <div class="status-label">等级</div>
              <div class="status-value">Lv.${player.level}</div>
          </div>
          <div class="status-item">
              <div class="status-label">气血</div>
              <div class="status-value">${player.hp}/${player.maxHp}</div>
          </div>
          <div class="status-item">
              <div class="status-label">灵力</div>
              <div class="status-value">${player.mp}/${player.maxMp}</div>
          </div>
          <div class="status-item">
              <div class="status-label">攻击</div>
              <div class="status-value">${player.attack}</div>
          </div>
          <div class="status-item">
              <div class="status-label">防御</div>
              <div class="status-value">${player.defense}</div>
          </div>
          <div class="status-item">
              <div class="status-label">金币</div>
              <div class="status-value">${player.gold}</div>
          </div>
          <div class="status-item">
              <div class="status-label">经验</div>
              <div class="status-value">${player.exp}</div>
          </div>
      `;

      // 更新压缩状态栏（手机端）
      if (compactEl) {
          compactEl.innerHTML = `
              <div class="status-compact-item">
                  <span class="status-label">${realm ? realm.name : "未知"}</span>
                  <span class="status-value">Lv.${player.level}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">❤</span>
                  <span class="status-value">${player.hp}/${player.maxHp}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">★</span>
                  <span class="status-value">${player.mp}/${player.maxMp}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">攻</span>
                  <span class="status-value">${player.attack}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">防</span>
                  <span class="status-value">${player.defense}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">¥</span>
                  <span class="status-value">${player.gold}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">经</span>
                  <span class="status-value">${player.exp}</span>
              </div>
          `;
      }
  },

  // 更新章节和地点信息
  updateChapterInfo: function(chapter, location) {
      const chapterEl = document.getElementById("current-chapter");
      const locationEl = document.getElementById("current-location");
      if (chapterEl) chapterEl.textContent = chapter;
      if (locationEl) locationEl.textContent = location;
  },

  // 更新境界信息
  updateRealmInfo: function(realmName) {
      const realmEl = document.getElementById("current-realm");
      if (realmEl) realmEl.textContent = realmName;
  },

  // 显示战斗界面（占位）
  showBattleView: function(battleState, onActionSelect) {
      // TODO: 实现战斗界面
      console.log("显示战斗界面", battleState);
  },

  // 显示商店界面（占位）
  showShopView: function(shopState, onBuy) {
      // TODO: 实现商店界面
      console.log("显示商店界面", shopState);
  },

  // 打开玩家菜单
  openPlayerMenu: function(tabName) {
      const overlay = document.getElementById("player-menu-overlay");
      if (!overlay) return;

      overlay.style.display = "flex";
      this.switchMenuTab(tabName || "status");
      this.renderMenuContent();
  },

  // 关闭玩家菜单
  closePlayerMenu: function() {
      const overlay = document.getElementById("player-menu-overlay");
      if (overlay) {
          overlay.style.display = "none";
      }
  },

  // 切换菜单标签
  switchMenuTab: function(tabName) {
      // 移除所有 active
      document.querySelectorAll(".menu-tab").forEach(tab => {
          tab.classList.remove("active");
      });
      document.querySelectorAll(".menu-tab-content").forEach(content => {
          content.classList.remove("active");
      });

      // 激活指定标签
      const tab = document.querySelector(`.menu-tab[data-tab="${tabName}"]`);
      const content = document.getElementById(`menu-tab-${tabName}`);
      if (tab) tab.classList.add("active");
      if (content) content.classList.add("active");
  },

  // 渲染菜单内容
  renderMenuContent: function() {
      this.renderStatusTab();
      this.renderInventoryTab();
      this.renderEquipmentTab();
      this.renderCultivateTab();
  },

  // 渲染状态标签页
  renderStatusTab: function() {
      const content = document.getElementById("menu-tab-status");
      if (!content) return;

      const player = Game.State.player;
      const realm = Game.CoreConfig.realms.find(r => r.id === player.realm);
      const totalStats = Game.State.getTotalStats();

      content.innerHTML = `
          <div class="status-info-item">
              <div class="status-info-label">境界</div>
              <div class="status-info-value">${realm ? realm.name : "未知"}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">等级</div>
              <div class="status-info-value">Lv.${player.level}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">气血</div>
              <div class="status-info-value">${player.hp} / ${totalStats.maxHp}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">灵力</div>
              <div class="status-info-value">${player.mp} / ${totalStats.maxMp}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">攻击力</div>
              <div class="status-info-value">${totalStats.attack}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">防御力</div>
              <div class="status-info-value">${totalStats.defense}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">金币</div>
              <div class="status-info-value">${player.gold}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">经验值</div>
              <div class="status-info-value">${player.exp}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">修炼经验</div>
              <div class="status-info-value">${Game.State.cultivationExp}</div>
          </div>
          ${Game.State.learnedSkills.length > 0 ? `
          <div class="status-info-item" style="border-top: 1px solid #333; margin-top: 8px; padding-top: 8px;">
              <div class="status-info-label">已学会的技能</div>
              <div class="status-info-value" style="font-size: 12px; line-height: 1.6;">
                  ${Game.State.learnedSkills.map(skillId => {
                      const skill = Game.Battle.getSkillData(skillId);
                      return skill ? `${skill.name} (消耗${skill.mpCost}MP)` : skillId;
                  }).join('<br>')}
              </div>
          </div>
          ` : ""}
      `;
  },

  // 渲染背包标签页
  renderInventoryTab: function() {
      const content = document.getElementById("menu-tab-inventory");
      if (!content) return;

      const inventory = Game.State.inventory;
      if (Object.keys(inventory).length === 0) {
          content.innerHTML = '<div style="text-align: center; color: #888; padding: 40px;">背包为空</div>';
          return;
      }

      let html = "";
      for (let itemId in inventory) {
          const item = Game.Items.byId[itemId];
          if (!item) continue;

          const count = inventory[itemId];
          const sellPrice = Math.floor(item.price * 0.6);
          
          // 获取品质信息
          let qualityInfo = null;
          let qualityDisplay = "";
          if (item.type === "equipment" && item.quality) {
              qualityInfo = Game.Items.getQuality(item.quality);
              qualityDisplay = `<span style="color: ${qualityInfo.color}; font-weight: bold;">[${qualityInfo.name}]</span> `;
          }
          
          html += `
              <div class="inventory-item">
                  <div class="inventory-item-info">
                      <div class="inventory-item-name">${qualityDisplay}${item.name}</div>
                      <div class="inventory-item-desc">${item.description || ""}</div>
                      ${item.type === "equipment" && item.stats ? `
                      <div style="font-size: 11px; color: #4a9eff; margin-top: 4px;">
                          ${Object.keys(item.stats).map(stat => {
                              const quality = item.quality || "common";
                              const actualStats = Game.Items.calculateStatsWithQuality(item.stats, quality);
                              const value = actualStats[stat];
                              if (typeof value === "number") {
                                  const statNames = { attack: "攻击", defense: "防御", maxHp: "气血上限", maxMp: "灵力上限", critRate: "暴击率" };
                                  return `${statNames[stat] || stat}: +${value}`;
                              }
                              return "";
                          }).filter(s => s).join(" | ")}
                      </div>
                      ` : ""}
                      <div style="font-size: 11px; color: #888; margin-top: 4px;">出售价格: ${sellPrice} 金币/个</div>
                  </div>
                  <div class="inventory-item-count">x${count}</div>
                  <div class="inventory-item-actions">
                      ${item.type === "equipment" ? `<button class="inventory-action-btn" onclick="Game.Game.onEquipItemFromMenu('${item.slot}', '${itemId}')">装备</button>` : ""}
                      ${item.type === "consumable" ? `<button class="inventory-action-btn" onclick="Game.Game.onItemUseFromMenu('${itemId}')">使用</button>` : ""}
                      ${item.type === "skill_book" ? `<button class="inventory-action-btn" onclick="Game.Game.onItemUseFromMenu('${itemId}')" style="background-color: ${Game.State.hasSkill(item.skill.id) ? '#555' : '#ffaa00'}; color: #fff; ${Game.State.hasSkill(item.skill.id) ? 'cursor: not-allowed; opacity: 0.6;' : ''}" ${Game.State.hasSkill(item.skill.id) ? 'disabled' : ''}>${Game.State.hasSkill(item.skill.id) ? '已学会' : '学习'}</button>` : ""}
                      <button class="inventory-action-btn" onclick="Game.Game.onItemSellFromMenu('${itemId}', ${count})" style="background-color: #4a9eff; color: #fff;">出售</button>
                  </div>
              </div>
          `;
      }

      content.innerHTML = html;
  },

  // 渲染装备标签页
  renderEquipmentTab: function() {
      const content = document.getElementById("menu-tab-equipment");
      if (!content) return;

      const equipment = Game.State.equipment;
      const slotNames = {
          weapon: "武器",
          armor: "护甲",
          accessory: "饰品"
      };

      let html = "";
      for (let slot in slotNames) {
          const itemId = equipment[slot];
          const item = itemId ? Game.Items.byId[itemId] : null;

          // 获取品质信息
          let qualityDisplay = "";
          if (item && item.quality) {
              const qualityInfo = Game.Items.getQuality(item.quality);
              qualityDisplay = `<span style="color: ${qualityInfo.color}; font-weight: bold;">[${qualityInfo.name}]</span> `;
          }
          
          html += `
              <div class="equipment-slot">
                  <div class="equipment-slot-label">${slotNames[slot]}</div>
                  <div class="equipment-slot-item">
                      <div>
                          ${item ? `
                              <div class="equipment-slot-item-name">${qualityDisplay}${item.name}</div>
                              ${item.stats ? `
                              <div style="font-size: 11px; color: #4a9eff; margin-top: 4px;">
                                  ${Object.keys(item.stats).map(stat => {
                                      const quality = item.quality || "common";
                                      const actualStats = Game.Items.calculateStatsWithQuality(item.stats, quality);
                                      const value = actualStats[stat];
                                      if (typeof value === "number") {
                                          const statNames = { attack: "攻击", defense: "防御", maxHp: "气血上限", maxMp: "灵力上限", critRate: "暴击率" };
                                          return `${statNames[stat] || stat}: +${value}`;
                                      }
                                      return "";
                                  }).filter(s => s).join(" | ")}
                              </div>
                              ` : ""}
                          ` : '<div class="equipment-slot-empty">未装备</div>'}
                      </div>
                      <div class="equipment-slot-actions">
                          ${item ? `<button class="inventory-action-btn" onclick="Game.Game.onUnequipItem('${slot}')">卸下</button>` : ""}
                      </div>
                  </div>
              </div>
          `;
      }

      content.innerHTML = html;
  },

  // 渲染修炼标签页
  renderCultivateTab: function() {
      const content = document.getElementById("menu-tab-cultivate");
      if (!content) return;

      const player = Game.State.player;
      const realm = Game.CoreConfig.realms.find(r => r.id === player.realm);
      const canCultivate = Game.State.canCultivate();
      const lastCultivateMessage = Game.Game.lastCultivateMessage || "";

      content.innerHTML = `
          <div class="cultivate-info">
              <div class="status-info-item">
                  <div class="status-info-label">当前境界</div>
                  <div class="status-info-value">${realm ? realm.name : "未知"}</div>
              </div>
              <div class="status-info-item">
                  <div class="status-info-label">修炼经验</div>
                  <div class="status-info-value">${Game.State.cultivationExp}</div>
              </div>
              <div class="status-info-item">
                  <div class="status-info-label">今日修炼次数</div>
                  <div class="status-info-value">${Game.State.dailyCultivateCount} / 10</div>
              </div>
          </div>
          <button class="cultivate-btn" ${!canCultivate ? "disabled" : ""} onclick="Game.Game.onCultivateClick()">
              ${canCultivate ? "打坐修炼" : "今天状态不佳，修炼收获有限，明天再试吧。"}
          </button>
          ${lastCultivateMessage ? `<div class="cultivate-message">${lastCultivateMessage}</div>` : ""}
      `;
  },

  // 显示商店界面
  showShopView: function(shopConfig, onBuy, onClose) {
      const overlay = document.getElementById("shop-overlay");
      const shopName = document.getElementById("shop-name");
      const shopGold = document.getElementById("shop-current-gold");
      const shopItemsList = document.getElementById("shop-items-list");

      if (!overlay) return;

      overlay.style.display = "flex";
      if (shopName) shopName.textContent = shopConfig.name || "商店";
      if (shopGold) shopGold.textContent = Game.State.player.gold;

      if (shopItemsList) {
          let html = "";
          shopConfig.items.forEach(shopItem => {
              const itemId = shopItem.itemId || shopItem;
              const price = shopItem.price || Game.Items.byId[itemId]?.price || 0;
              const item = Game.Items.byId[itemId];
              if (!item) return;

              const canAfford = Game.State.player.gold >= price;
              html += `
                  <div class="shop-item-card">
                      <div class="shop-item-card-info">
                          <div class="shop-item-card-name">${item.name}</div>
                          <div class="shop-item-card-desc">${item.description || ""}</div>
                          <div class="shop-item-card-price">${price} 金币</div>
                      </div>
                      <button class="shop-item-card-btn" ${!canAfford ? "disabled" : ""} onclick="if(Game.Shop.buy('${itemId}', ${price})) { Game.UI.refreshShopView(); }">
                          购买
                      </button>
                  </div>
              `;
          });
          shopItemsList.innerHTML = html;
      }

      // 绑定关闭按钮
      const closeBtn = document.getElementById("btn-close-shop");
      if (closeBtn) {
          closeBtn.onclick = () => {
              if (onClose) onClose();
              overlay.style.display = "none";
          };
      }
  },

  // 刷新商店界面
  refreshShopView: function() {
      const shopGold = document.getElementById("shop-current-gold");
      if (shopGold) shopGold.textContent = Game.State.player.gold;

      // 重新渲染购买按钮状态
      const shopItemsList = document.getElementById("shop-items-list");
      if (shopItemsList) {
          const buttons = shopItemsList.querySelectorAll(".shop-item-card-btn");
          buttons.forEach(btn => {
              const price = parseInt(btn.textContent.match(/\d+/)?.[0] || "0");
              btn.disabled = Game.State.player.gold < price;
          });
      }

      // 刷新状态栏
      this.renderPlayerStatus(Game.State);
  },

  // 显示修炼界面（占位，现在在菜单中）
  showCultivateView: function(onCultivate) {
      this.openPlayerMenu("cultivate");
  }
};