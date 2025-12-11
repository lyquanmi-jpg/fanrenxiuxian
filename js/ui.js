// ==========================
// UI 渲染层：所有 DOM 操作
// ==========================

Game.UI = {
  // 显示主界面（出租屋）
  showHome: function() {
      const homeEl = document.getElementById("game-home");
      const eventAreaEl = document.getElementById("event-area");
      const eventOptionsEl = document.getElementById("event-options");
      const returnHomeBtn = document.getElementById("btn-return-home");

      // 隐藏事件区域，显示主界面
      if (homeEl) homeEl.style.display = "block";
      if (eventAreaEl) eventAreaEl.style.display = "none";
      if (eventOptionsEl) eventOptionsEl.style.display = "none";
      
      // 隐藏返回按钮（因为已经在首页了，不需要返回）
      if (returnHomeBtn) returnHomeBtn.style.display = "none";

      // 渲染主界面卡片
      this.renderHomeCards();
  },

  // 渲染主界面卡片
  renderHomeCards: function() {
      const homeGrid = document.getElementById("home-grid");
      if (!homeGrid) return;

      homeGrid.innerHTML = "";

      const player = Game.State.player;
      const realm = Game.CoreConfig.realms.find(r => r.id === player.realm);
      const realmName = realm ? realm.name : "未知境界";

      // 卡片数据
      const cards = [
          {
              icon: player.isBottleneck ? "⚡" : "🧘",
              title: player.isBottleneck ? "闭关突破" : "打坐修炼",
              desc: player.isBottleneck ? this.getBreakthroughDesc() : `消耗: 10精力 + 1灵石`,
              onClick: () => Game.Game.onCultivateClick(),
              disabled: player.isBottleneck ? this.isBreakthroughDisabled() : (player.energy < 10 || player.spiritStones < 1)
          },
          {
              icon: "🏙️",
              title: "城市探索",
              desc: "精力消耗: 15",
              onClick: () => Game.Game.onExploreCity(),
              disabled: player.energy < 15
          },
          {
              icon: "🛌",
              title: "休息回神",
              desc: "恢复精力",
              onClick: () => Game.Game.onRestClick(),
              disabled: false
          },
          {
              icon: "📖",
              title: "剧情章节",
              desc: "继续主线剧情",
              onClick: () => this.showChapterSelect(),
              disabled: false
          },
          {
              icon: "🐾",
              title: Game.State.pet.active ? "灵兽互动" : "空荡荡的猫窝",
              desc: Game.State.pet.active ? `与${Game.State.pet.name || "小白"}互动` : "还没有灵兽",
              onClick: () => this.showPetInteraction(),
              disabled: !Game.State.pet.active
          },
          {
              icon: "⚒️",
              title: "炼丹/炼器",
              desc: "使用素材制造丹药和装备",
              onClick: () => this.showCraftingModal(),
              disabled: false
          }
      ];

      // 创建卡片
      cards.forEach(card => {
          const cardEl = document.createElement("div");
          cardEl.className = "home-card";
          if (card.disabled) {
              cardEl.classList.add("disabled");
          }

          cardEl.innerHTML = `
              <div class="home-card-icon">${card.icon}</div>
              <div class="home-card-title">${card.title}</div>
              <div class="home-card-desc">${card.desc}</div>
          `;

          if (!card.disabled && card.onClick) {
              cardEl.onclick = card.onClick;
              cardEl.style.cursor = "pointer";
          } else {
              cardEl.style.cursor = "not-allowed";
          }

          homeGrid.appendChild(cardEl);
      });

  },

  // 显示章节选择界面
  showChapterSelect: function() {
      const overlay = document.createElement("div");
      overlay.id = "chapter-select-overlay";
      overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
      `;

      const container = document.createElement("div");
      container.style.cssText = `
          background: #1a1a1a;
          border: 2px solid #4a9eff;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
      `;

      const currentChapter = Game.State.progress.currentChapter || 1;
      const chapters = [
          { id: 1, name: "第一章：初入都市", description: "可重复挑战刷取灵灵草", unlocked: true }
      ];

      let html = `
          <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4a9eff;">选择章节</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
      `;

      chapters.forEach(chapter => {
          const isUnlocked = chapter.unlocked && chapter.id <= currentChapter;
          html += `
              <button class="ui-button ${!isUnlocked ? 'secondary' : ''}" 
                      ${!isUnlocked ? 'disabled' : ''} 
                      onclick="Game.UI.selectChapter(${chapter.id}); Game.UI.closeChapterSelect();"
                      style="width: 100%; padding: 15px; font-size: 16px; ${!isUnlocked ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                  <div style="text-align: left;">
                      <div style="font-weight: bold; margin-bottom: 4px;">${chapter.name} ${!isUnlocked ? '(未解锁)' : ''}</div>
                      ${chapter.description && isUnlocked ? `<div style="font-size: 12px; color: #888; font-style: italic;">${chapter.description}</div>` : ''}
                  </div>
              </button>
          `;
      });

      html += `
              <button class="ui-button secondary" onclick="Game.UI.closeChapterSelect();" style="width: 100%; padding: 15px; font-size: 16px; margin-top: 10px;">
                  取消
              </button>
          </div>
      `;

      container.innerHTML = html;
      overlay.appendChild(container);
      document.body.appendChild(overlay);
  },

  // 选择章节
  selectChapter: function(chapterId) {
      if (chapterId === 1) {
          // 通知 game.js 重置剧情点（UI 层不直接修改状态）
          Game.Game.resetChapterProgress(1);
          
          // 切换到剧情模式
          this.showStoryMode();
          
          // 跳转到序章
          Game.Game.goToEvent("ch1_intro_1");
      }
  },

  // 关闭章节选择界面
  closeChapterSelect: function() {
      const overlay = document.getElementById("chapter-select-overlay");
      if (overlay) {
          overlay.remove();
      }
  },

  // 显示剧情模式（隐藏主界面，显示事件区域）
  showStoryMode: function() {
      const homeEl = document.getElementById("game-home");
      const eventAreaEl = document.getElementById("event-area");
      const eventOptionsEl = document.getElementById("event-options");
      const returnHomeBtn = document.getElementById("btn-return-home");

      if (homeEl) homeEl.style.display = "none";
      if (eventAreaEl) eventAreaEl.style.display = "block";
      if (eventOptionsEl) eventOptionsEl.style.display = "block";
      
      // 显示返回按钮（让玩家可以随时返回主界面）
      if (returnHomeBtn) returnHomeBtn.style.display = "inline-block";
  },

  // 渲染文本事件
  renderTextEvent: function(event, onOptionSelect) {
      // 确保处于剧情模式
      this.showStoryMode();

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

      // 计算精力百分比，用于颜色显示
      const energyPercent = (player.energy / player.maxEnergy) * 100;
      const energyColor = energyPercent <= 30 ? "#ff4444" : energyPercent <= 60 ? "#ffaa44" : "#4a9eff";
      
      // 境界显示，如果有瓶颈则高亮
      const realmDisplay = realm ? (player.isBottleneck ? `<span style="color: #ffaa00; font-weight: bold;">${realm.name} (瓶颈)</span>` : realm.name) : "未知";

      // 更新详细状态栏
      statusEl.innerHTML = `
          <div class="status-item">
              <div class="status-label">境界</div>
              <div class="status-value">${realmDisplay}</div>
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
              <div class="status-label">精力</div>
              <div class="status-value" style="color: ${energyColor};">${player.energy}/${player.maxEnergy}</div>
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
              <div class="status-label">人民币</div>
              <div class="status-value">¥${player.money || 0}</div>
          </div>
          <div class="status-item">
              <div class="status-label">灵石</div>
              <div class="status-value">💎${player.spiritStones || 0}</div>
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
                  <span class="status-label">${realmDisplay}</span>
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
                  <span class="status-label" style="color: ${energyColor};">⚡</span>
                  <span class="status-value" style="color: ${energyColor};">${player.energy}/${player.maxEnergy}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">¥</span>
                  <span class="status-value">${player.money || 0}</span>
              </div>
              <div class="status-compact-item">
                  <span class="status-label">💎</span>
                  <span class="status-value">${player.spiritStones || 0}</span>
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

  // 显示战斗界面（文字战报弹窗）
  showBattleView: function(battleState) {
      const overlay = document.getElementById("battle-overlay");
      if (!overlay) {
          console.error("战斗弹窗元素不存在");
          return;
      }

      // 显示弹窗
      overlay.style.display = "flex";
      
      // 初始化战斗界面
      const enemyNameEl = document.getElementById("battle-enemy-name");
      const enemyHpBarEl = document.getElementById("battle-enemy-hp-bar");
      const enemyHpTextEl = document.getElementById("battle-enemy-hp-text");
      const battleLogEl = document.getElementById("battle-log");
      const skipBtn = document.getElementById("battle-skip-btn");
      const resultBtnContainer = document.getElementById("battle-result-btn-container");
      
      if (enemyNameEl) enemyNameEl.textContent = battleState.enemy.name;
      
      // 初始化血条
      this.updateBattleHpBar(battleState);
      
      // 清空战报
      if (battleLogEl) {
          battleLogEl.innerHTML = "";
      }
      
      // 显示跳过按钮
      if (skipBtn) {
          skipBtn.style.display = "block";
          skipBtn.onclick = () => {
              Game.Battle.skip();
          };
      }
      
      // 隐藏结算按钮
      if (resultBtnContainer) {
          resultBtnContainer.style.display = "none";
          resultBtnContainer.innerHTML = "";
      }
      
      // 初始化操作栏
      this.initBattleActionPanel();
      
      // 开始逐行显示战报
      this.displayBattleLog(battleState.battleLog || []);
  },
  
  // 初始化战斗操作栏
  initBattleActionPanel: function() {
      const battle = Game.Battle.currentBattle;
      if (!battle) return; // 保护：如果没有战斗，直接返回
      
      const actionPanel = document.getElementById("battle-action-panel");
      if (!actionPanel) return;
      
      // 清空操作栏
      while (actionPanel.firstChild) {
          actionPanel.removeChild(actionPanel.firstChild);
      }
      
      // 固定按钮：普通攻击
      const attackBtn = document.createElement("button");
      attackBtn.id = "battle-action-attack";
      attackBtn.className = "battle-action-btn";
      attackBtn.textContent = "⚔️ 普通攻击";
      attackBtn.onclick = () => {
          Game.Battle.executePlayerAction('attack');
      };
      actionPanel.appendChild(attackBtn);
      
      // 动态遍历：所有已学技能
      const learnedSkills = Game.State.learnedSkills || [];
      learnedSkills.forEach(skillId => {
          const skill = Game.Battle.getSkillData(skillId);
          if (!skill) return;
          
          const skillBtn = document.createElement("button");
          skillBtn.id = `battle-action-skill-${skillId}`;
          skillBtn.className = "battle-action-btn";
          
          // 根据技能类型添加样式类
          const skillType = skill.type || "damage";
          if (skillType === "heal") {
              skillBtn.classList.add("btn-heal");
          } else if (skillType === "buff") {
              skillBtn.classList.add("btn-buff");
          }
          
          // 技能按钮文本（简化显示）
          const skillIcon = skillType === "heal" ? "💚" : skillType === "buff" ? "🛡️" : "🔥";
          skillBtn.textContent = `${skillIcon} ${skill.name}`;
          skillBtn.title = `${skill.description || skill.name} (消耗${skill.mpCost}MP)`;
          
          skillBtn.onclick = () => {
              Game.Battle.useSkillInManualBattle(skillId);
          };
          
          actionPanel.appendChild(skillBtn);
      });
      
      // 固定按钮：快速结束
      const skipBtn = document.createElement("button");
      skipBtn.id = "battle-action-skip";
      skipBtn.className = "battle-action-btn";
      skipBtn.textContent = "⚡ 快速结束";
      skipBtn.style.cssText = `
          background: linear-gradient(135deg, #ff9800, #f57c00);
      `;
      skipBtn.onclick = () => {
          Game.Battle.skip();
      };
      actionPanel.appendChild(skipBtn);
      
      // 初始状态：禁用按钮（等待玩家回合）
      this.disablePlayerActions();
  },

  // 更新战斗血条
  updateBattleHpBar: function(battleState) {
      const enemyHpBarEl = document.getElementById("battle-enemy-hp-bar");
      const enemyHpTextEl = document.getElementById("battle-enemy-hp-text");
      const playerHpBarEl = document.getElementById("battle-player-hp-bar");
      const playerHpTextEl = document.getElementById("battle-player-hp-text");
      
      const enemy = battleState.enemy;
      const player = battleState.playerStats;
      
      // 更新敌人血条
      if (enemyHpBarEl && enemyHpTextEl) {
          const hpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
          enemyHpBarEl.style.width = hpPercent + "%";
          enemyHpTextEl.textContent = `${Math.max(0, enemy.hp)}/${enemy.maxHp}`;
      }
      
      // 更新玩家血条
      if (playerHpBarEl && playerHpTextEl) {
          const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
          playerHpBarEl.style.width = hpPercent + "%";
          playerHpTextEl.textContent = `HP: ${Math.max(0, player.hp)}/${player.maxHp}  MP: ${player.mp}/${player.maxMp}`;
      }
  },

  // 更新战报显示（实时添加新行，带延迟）
  updateBattleLog: function(logArray) {
      const battleLogEl = document.getElementById("battle-log");
      if (!battleLogEl) return;
      
      // 获取当前已显示的行数
      const currentLines = battleLogEl.children.length;
      
      // 只添加新行（避免重复显示）
      if (logArray.length > currentLines) {
          const newLines = logArray.slice(currentLines);
          newLines.forEach((line, index) => {
              setTimeout(() => {
                  // 如果正在跳过，不延迟显示
                  if (Game.Battle.isSkipping) {
                      return;
                  }
                  
                  const lineEl = document.createElement("div");
                  lineEl.className = "battle-log-line";
                  lineEl.textContent = line;
                  battleLogEl.appendChild(lineEl);
                  battleLogEl.scrollTop = battleLogEl.scrollHeight;
                  
                  // 更新血条（每行都更新，确保实时）
                  if (Game.Battle.currentBattle) {
                      this.updateBattleHpBar(Game.Battle.currentBattle);
                  }
                  
                  // 检查是否是战斗结束的日志，如果是，隐藏跳过按钮并确保滚动到底部
                  if (line.includes("【战斗胜利】") || line.includes("【战斗失败】")) {
                      const skipBtn = document.getElementById("battle-skip-btn");
                      if (skipBtn) {
                          skipBtn.style.display = "none";
                      }
                      // 确保滚动到底部
                      setTimeout(() => {
                          battleLogEl.scrollTop = battleLogEl.scrollHeight;
                      }, 100);
                  }
              }, index * 300); // 每行间隔300ms（加快速度）
          });
      }
  },

  // 立即更新战报显示（跳过模式）
  updateBattleLogImmediate: function(logArray) {
      const battleLogEl = document.getElementById("battle-log");
      if (!battleLogEl) return;
      
      // 清空并重新渲染所有日志
      battleLogEl.innerHTML = "";
      logArray.forEach(line => {
          const lineEl = document.createElement("div");
          lineEl.className = "battle-log-line";
          lineEl.textContent = line;
          battleLogEl.appendChild(lineEl);
      });
      battleLogEl.scrollTop = battleLogEl.scrollHeight;
      
      // 更新血条
      if (Game.Battle.currentBattle) {
          this.updateBattleHpBar(Game.Battle.currentBattle);
      }
  },

  // 逐行显示战报（带延迟效果）
  displayBattleLog: function(logArray) {
      const battleLogEl = document.getElementById("battle-log");
      if (!battleLogEl) return;
      
      // 清空现有内容
      battleLogEl.innerHTML = "";
      
      // 逐行添加，每行间隔500ms
      logArray.forEach((line, index) => {
          setTimeout(() => {
              const lineEl = document.createElement("div");
              lineEl.className = "battle-log-line";
              lineEl.textContent = line;
              battleLogEl.appendChild(lineEl);
              battleLogEl.scrollTop = battleLogEl.scrollHeight;
              
              // 更新血条（每行都更新，确保实时）
              if (Game.Battle.currentBattle) {
                  this.updateBattleHpBar(Game.Battle.currentBattle);
              }
          }, index * 500);
      });
  },

  // 显示战斗结算按钮和战利品面板（使用 DOM API，修复点击失效问题）
  showBattleResultButton: function(playerWon, battleResult, onClick) {
      const resultBtnContainer = document.getElementById("battle-result-btn-container");
      const skipBtn = document.getElementById("battle-skip-btn");
      const battleLogEl = document.getElementById("battle-log");
      
      // 隐藏跳过按钮和操作栏
      if (skipBtn) {
          skipBtn.style.display = "none";
      }
      this.disablePlayerActions();
      
      // 确保日志滚动到底部
      if (battleLogEl) {
          battleLogEl.scrollTop = battleLogEl.scrollHeight;
      }
      
      if (!resultBtnContainer) return;
      
      // 清空容器（使用 DOM API）
      while (resultBtnContainer.firstChild) {
          resultBtnContainer.removeChild(resultBtnContainer.firstChild);
      }
      
      // 显示容器
      resultBtnContainer.style.display = "block";
      
      // 创建战利品面板（仅胜利时显示）
      if (playerWon && battleResult) {
          const lootPanel = document.createElement("div");
          lootPanel.className = "battle-loot-panel";
          lootPanel.style.cssText = `
              background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(45, 90, 160, 0.1));
              border: 2px solid #4a9eff;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 15px;
              text-align: center;
          `;
          
          const lootTitle = document.createElement("div");
          lootTitle.textContent = "【战利品清单】";
          lootTitle.style.cssText = `
              font-size: 20px;
              font-weight: bold;
              color: #4a9eff;
              margin-bottom: 15px;
          `;
          lootPanel.appendChild(lootTitle);
          
          const lootList = document.createElement("div");
          lootList.style.cssText = `
              display: flex;
              flex-direction: column;
              gap: 10px;
          `;
          
          // 经验值
          if (battleResult.exp > 0) {
              const expItem = document.createElement("div");
              expItem.style.cssText = `
                  font-size: 16px;
                  color: #fff;
                  background: rgba(74, 158, 255, 0.2);
                  padding: 8px;
                  border-radius: 4px;
              `;
              expItem.textContent = `+${battleResult.exp} 经验`;
              lootList.appendChild(expItem);
          }
          
          // 货币
          if (battleResult.money > 0) {
              const moneyItem = document.createElement("div");
              moneyItem.style.cssText = `
                  font-size: 16px;
                  color: #fff;
                  background: rgba(74, 158, 255, 0.2);
                  padding: 8px;
                  border-radius: 4px;
              `;
              moneyItem.textContent = `+¥${battleResult.money} 人民币`;
              lootList.appendChild(moneyItem);
          }
          
          // 灵石
          if (battleResult.spiritStones > 0) {
              const spiritStonesItem = document.createElement("div");
              spiritStonesItem.style.cssText = `
                  font-size: 16px;
                  color: #fff;
                  background: rgba(255, 215, 0, 0.3);
                  padding: 8px;
                  border-radius: 4px;
              `;
              spiritStonesItem.textContent = `+💎${battleResult.spiritStones} 灵石`;
              lootList.appendChild(spiritStonesItem);
          }
          
          // 掉落物品
          if (battleResult.droppedItems && battleResult.droppedItems.length > 0) {
              battleResult.droppedItems.forEach(item => {
                  const itemEl = document.createElement("div");
                  itemEl.style.cssText = `
                      font-size: 16px;
                      color: #fff;
                      background: rgba(74, 158, 255, 0.2);
                      padding: 8px;
                      border-radius: 4px;
                  `;
                  itemEl.textContent = `获得：${item.name}`;
                  lootList.appendChild(itemEl);
              });
          }
          
          if (lootList.children.length === 0) {
              const noLoot = document.createElement("div");
              noLoot.textContent = "没有获得任何奖励";
              noLoot.style.cssText = `
                  font-size: 14px;
                  color: #999;
                  font-style: italic;
              `;
              lootList.appendChild(noLoot);
          }
          
          lootPanel.appendChild(lootList);
          resultBtnContainer.appendChild(lootPanel);
      }
      
      // 检查是否有二阶段挑战（仅 NPC 战斗且胜利时）
      let hasTrueForm = false;
      let npcId = null;
      if (playerWon && battleResult && battleResult.isNPC && battleResult.npcId) {
          npcId = battleResult.npcId;
          const npc = Game.Social.getNPCData(npcId);
          if (npc && npc.trueForm) {
              hasTrueForm = true;
          }
      }

      // 创建按钮容器（如果有二阶段，需要两个按钮）
      const buttonWrapper = document.createElement("div");
      buttonWrapper.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 10px;
      `;

      // 如果有二阶段挑战，先显示挑战按钮
      if (hasTrueForm) {
          const challengeBtn = document.createElement("button");
          challengeBtn.className = "battle-result-btn";
          challengeBtn.style.cssText = `
              width: 100%;
              padding: 15px;
              font-size: 18px;
              font-weight: bold;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              background: linear-gradient(135deg, #ff4444, #8b0000);
              color: #fff;
          `;
          challengeBtn.textContent = "⚠️ 挑战真身 (高难)";
          
          challengeBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // 先执行奖励结算（普通状态）
              if (onClick && typeof onClick === 'function') {
                  onClick();
              }
              
              // 延迟一下，然后开始真身战斗
              setTimeout(() => {
                  // 显示提示
                  alert("你竟敢挑战本座真身？");
                  
                  // 开始真身战斗
                  Game.Battle.challengeTrueForm(npcId);
              }, 500);
          };
          
          buttonWrapper.appendChild(challengeBtn);
      }

      // 创建结算按钮（使用 DOM API）
      const resultBtn = document.createElement("button");
      resultBtn.className = "battle-result-btn";
      resultBtn.style.cssText = `
          width: 100%;
          padding: 15px;
          font-size: 18px;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          ${playerWon 
              ? 'background: linear-gradient(135deg, #4a9eff, #2d5aa0); color: #fff;' 
              : 'background: linear-gradient(135deg, #ff4444, #8b0000); color: #fff;'
          }
      `;
      resultBtn.textContent = playerWon ? "收入囊中" : "离开";
      
      // 绑定点击事件（使用闭包确保作用域正确）
      resultBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // 第一步：先关闭弹窗（给玩家反馈）
          this.closeBattleView();
          
          // 第二步：执行回调（发放奖励）
          if (onClick && typeof onClick === 'function') {
              onClick();
          }
      };
      
      buttonWrapper.appendChild(resultBtn);
      resultBtnContainer.appendChild(buttonWrapper);
  },
  
  // 启用玩家操作按钮
  enablePlayerActions: function() {
      const battle = Game.Battle.currentBattle;
      if (!battle) return; // 保护：如果没有战斗，直接返回
      
      const attackBtn = document.getElementById("battle-action-attack");
      const actionPanel = document.getElementById("battle-action-panel");
      
      if (attackBtn) {
          attackBtn.disabled = false;
          attackBtn.style.opacity = "1";
          attackBtn.style.cursor = "pointer";
      }
      
      // 更新所有技能按钮状态
      const learnedSkills = Game.State.learnedSkills || [];
      learnedSkills.forEach(skillId => {
          const skillBtn = document.getElementById(`battle-action-skill-${skillId}`);
          if (skillBtn) {
              const skill = Game.Battle.getSkillData(skillId);
              if (skill && battle.playerStats.mp >= skill.mpCost) {
                  skillBtn.disabled = false;
                  skillBtn.style.opacity = "1";
                  skillBtn.style.cursor = "pointer";
              } else {
                  skillBtn.disabled = true;
                  skillBtn.style.opacity = "0.5";
                  skillBtn.style.cursor = "not-allowed";
              }
          }
      });
      
      if (actionPanel) {
          actionPanel.style.display = "flex";
      }
  },
  
  // 禁用玩家操作按钮
  disablePlayerActions: function() {
      const attackBtn = document.getElementById("battle-action-attack");
      const skillBtn = document.getElementById("battle-action-skill");
      const actionPanel = document.getElementById("battle-action-panel");
      
      if (attackBtn) {
          attackBtn.disabled = true;
          attackBtn.style.opacity = "0.5";
          attackBtn.style.cursor = "not-allowed";
      }
      
      // 禁用所有技能按钮
      const learnedSkills = Game.State.learnedSkills || [];
      learnedSkills.forEach(skillId => {
          const skillBtn = document.getElementById(`battle-action-skill-${skillId}`);
          if (skillBtn) {
              skillBtn.disabled = true;
              skillBtn.style.opacity = "0.5";
              skillBtn.style.cursor = "not-allowed";
          }
      });
      
      if (actionPanel) {
          actionPanel.style.display = "none";
      }
  },

  // 关闭战斗界面
  closeBattleView: function() {
      const overlay = document.getElementById("battle-overlay");
      if (overlay) {
          overlay.style.display = "none";
      }
      
      // 清理状态
      const resultBtnContainer = document.getElementById("battle-result-btn-container");
      const skipBtn = document.getElementById("battle-skip-btn");
      if (resultBtnContainer) {
          resultBtnContainer.style.display = "none";
          resultBtnContainer.innerHTML = "";
      }
      if (skipBtn) {
          skipBtn.style.display = "block";
      }
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
      this.renderSocialTab();
  },

  // 渲染状态标签页
  renderStatusTab: function() {
      const content = document.getElementById("menu-tab-status");
      if (!content) return;

      const player = Game.State.player;
      const realm = Game.CoreConfig.realms.find(r => r.id === player.realm);
      const totalStats = Game.State.getTotalStats();
      
      // 计算精力百分比，用于颜色显示
      const energyPercent = (player.energy / player.maxEnergy) * 100;
      const energyColor = energyPercent <= 30 ? "#ff4444" : energyPercent <= 60 ? "#ffaa44" : "#4a9eff";
      
      // 境界显示，如果有瓶颈则高亮
      const realmDisplay = realm ? (player.isBottleneck ? `<span style="color: #ffaa00; font-weight: bold;">${realm.name} (瓶颈)</span>` : realm.name) : "未知";

      content.innerHTML = `
          <div class="status-info-item">
              <div class="status-info-label">境界</div>
              <div class="status-info-value">${realmDisplay}</div>
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
              <div class="status-info-label">精力</div>
              <div class="status-info-value" style="color: ${energyColor};">${player.energy} / ${player.maxEnergy}</div>
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
              <div class="status-info-label">人民币</div>
              <div class="status-info-value">¥${player.money || 0}</div>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">灵石</div>
              <div class="status-info-value">💎${player.spiritStones || 0}</div>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
              <button class="ui-button" onclick="Game.UI.manualSave()" style="width: 100%; margin-bottom: 10px;">
                  💾 手动存档
              </button>
              <button class="ui-button secondary" onclick="Game.UI.resetProgress()" style="width: 100%;">
                  🔄 重置进度
              </button>
          </div>
          <div class="status-info-item">
              <div class="status-info-label">灵石</div>
              <div class="status-info-value">💎${player.spiritStones || 0}</div>
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
                      ${item.type === "material" ? `
                      <div style="font-size: 11px; color: #88ff88; margin-top: 4px; font-style: italic;">
                          💎 用于炼丹或炼器的基础材料
                      </div>
                      ` : ""}
                      <div style="font-size: 11px; color: #888; margin-top: 4px;">${item.type === "material" ? "不可出售" : `出售价格: ¥${sellPrice}/个`}</div>
                  </div>
                  <div class="inventory-item-count">x${count}</div>
                  <div class="inventory-item-actions">
                      ${item.type === "equipment" ? `<button class="inventory-action-btn" onclick="Game.Game.onEquipItemFromMenu('${item.slot}', '${itemId}')">装备</button>` : ""}
                      ${item.type === "consumable" ? `<button class="inventory-action-btn" onclick="Game.Game.onItemUseFromMenu('${itemId}')">使用</button>` : ""}
                      ${item.type === "skill_book" ? `<button class="inventory-action-btn" onclick="Game.Game.onItemUseFromMenu('${itemId}')" style="background-color: ${Game.State.hasSkill(item.skill.id) ? '#555' : '#ffaa00'}; color: #fff; ${Game.State.hasSkill(item.skill.id) ? 'cursor: not-allowed; opacity: 0.6;' : ''}" ${Game.State.hasSkill(item.skill.id) ? 'disabled' : ''}>${Game.State.hasSkill(item.skill.id) ? '已学会' : '学习'}</button>` : ""}
                      ${item.type !== "material" ? `<button class="inventory-action-btn" onclick="Game.Game.onItemSellFromMenu('${itemId}', ${count})" style="background-color: #4a9eff; color: #fff;">出售</button>` : ""}
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

      // 获取套装信息
      const setInfo = Game.State.getSetInfo();
      const setNames = {
          'set_city_life': '市井烟火',
          'set_mind_flow': '心流涌动',
          'set_speed_force': '极速暴走',
          'set_urban_legend': '都市传说',
          'set_cyber_night': '赛博夜行'
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

          // 获取套装信息
          let setDisplay = "";
          if (item && item.setId) {
              const setName = setNames[item.setId] || item.setId;
              const setCount = setInfo[item.setId] ? setInfo[item.setId].count : 0;
              setDisplay = `<span style="color: #ffaa00; font-size: 11px; margin-left: 5px;">【${setName}】(${setCount}/3)</span>`;
          }
          
          html += `
              <div class="equipment-slot">
                  <div class="equipment-slot-label">${slotNames[slot]}</div>
                  <div class="equipment-slot-item">
                      <div>
                          ${item ? `
                              <div class="equipment-slot-item-name">${qualityDisplay}${item.name}${setDisplay}</div>
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

      // 显示套装效果
      const setEffects = Game.State.getSetEffects();
      const activeSets = [];
      
      // 检查已激活的套装效果
      if (setInfo['set_city_life']) {
          const count = setInfo['set_city_life'].count;
          if (count >= 2) {
              activeSets.push({
                  name: '市井烟火',
                  count: count,
                  effects: [
                      count >= 2 ? '2件: +200 HP' : '',
                      count >= 3 ? '3件: 每次攻击回复 5% 已损生命值' : ''
                  ].filter(e => e)
              });
          }
      }
      
      if (setInfo['set_mind_flow']) {
          const count = setInfo['set_mind_flow'].count;
          if (count >= 2) {
              activeSets.push({
                  name: '心流涌动',
                  count: count,
                  effects: [
                      count >= 2 ? '2件: +100 MP' : '',
                      count >= 3 ? '3件: 技能伤害提升 30%' : ''
                  ].filter(e => e)
              });
          }
      }
      
      if (setInfo['set_speed_force']) {
          const count = setInfo['set_speed_force'].count;
          if (count >= 2) {
              activeSets.push({
                  name: '极速暴走',
                  count: count,
                  effects: [
                      count >= 2 ? '2件: +20 攻击' : '',
                      count >= 3 ? '3件: 普通攻击有 30% 概率触发连击' : ''
                  ].filter(e => e)
              });
          }
      }

      if (setInfo['set_urban_legend']) {
          const count = setInfo['set_urban_legend'].count;
          if (count >= 2) {
              activeSets.push({
                  name: '都市传说',
                  count: count,
                  effects: [
                      count >= 2 ? '2件: 战斗金币收益+50%' : '',
                      count >= 3 ? '3件: 每回合回复 10% 已损生命值' : ''
                  ].filter(e => e)
              });
          }
      }

      if (setInfo['set_cyber_night']) {
          const count = setInfo['set_cyber_night'].count;
          if (count >= 2) {
              activeSets.push({
                  name: '赛博夜行',
                  count: count,
                  effects: [
                      count >= 2 ? '2件: 暴击率+20%' : '',
                      count >= 3 ? '3件: 攻击有 25% 概率造成眩晕' : ''
                  ].filter(e => e)
              });
          }
      }

      // 添加套装效果显示
      if (activeSets.length > 0) {
          html += `
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #4a9eff;">
                  <div style="color: #4a9eff; font-size: 16px; font-weight: bold; margin-bottom: 10px;">已激活套装效果：</div>
          `;
          
          activeSets.forEach(set => {
              html += `
                  <div style="background: rgba(74, 158, 255, 0.1); border-left: 3px solid #4a9eff; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                      <div style="color: #ffaa00; font-weight: bold; margin-bottom: 5px;">【${set.name}】(${set.count}/3)</div>
                      ${set.effects.map(effect => `<div style="color: #88ff88; font-size: 12px; margin-left: 10px; margin-top: 3px;">• ${effect}</div>`).join('')}
                  </div>
              `;
          });
          
          html += `</div>`;
      }

      content.innerHTML = html;
  },

  // 渲染人脉标签页
  renderSocialTab: function() {
      const content = document.getElementById("menu-tab-social");
      if (!content) return;

      // 确保 relationships 对象存在（如果不存在，由 state.js 初始化）
      if (!Game.State.relationships) {
          Game.State.initRelationships();
      }

      // 获取所有已结识的 NPC（met 为 true 的）
      const metNPCs = [];
      for (let npcId in Game.State.relationships) {
          const relationship = Game.State.relationships[npcId];
          if (relationship && relationship.met) {
              const npc = Game.Social.getNPCData(npcId);
              if (npc) {
                  metNPCs.push({
                      id: npcId,
                      npc: npc,
                      relationship: relationship
                  });
              }
          }
      }

      // 如果列表为空，显示提示
      if (metNPCs.length === 0) {
      content.innerHTML = `
              <div style="text-align: center; color: #888; padding: 40px; line-height: 1.8;">
                  <div style="font-size: 18px; margin-bottom: 10px;">你在这个城市还没什么熟人</div>
                  <div style="font-size: 14px;">快去探索或推进剧情吧</div>
              </div>
          `;
          return;
      }

      // 渲染 NPC 列表
      let html = "";
      metNPCs.forEach(({ id, npc, relationship }) => {
          const affinity = relationship.affinity || 0;
          const bondLevel = relationship.bondLevel || 0;
          
          // 计算好感度百分比（用于进度条）
          const maxAffinity = 300; // MAX 等级的好感度
          const affinityPercent = Math.min(100, (affinity / maxAffinity) * 100);
          
          // 羁绊等级显示
          let bondLevelDisplay = "";
          if (bondLevel === 'MAX') {
              bondLevelDisplay = '<span style="color: #ffaa00; font-weight: bold;">MAX</span>';
          } else if (bondLevel >= 3) {
              bondLevelDisplay = `<span style="color: #4a9eff;">Level ${bondLevel}</span>`;
          } else if (bondLevel >= 2) {
              bondLevelDisplay = `<span style="color: #88ff88;">Level ${bondLevel}</span>`;
          } else if (bondLevel >= 1) {
              bondLevelDisplay = `<span style="color: #ffff88;">Level ${bondLevel}</span>`;
          } else {
              bondLevelDisplay = '<span style="color: #888;">未解锁</span>';
          }

          html += `
              <div class="social-npc-card" style="
                  background: #1a1a1a;
                  border: 1px solid #333;
                  border-radius: 8px;
                  padding: 15px;
                  margin-bottom: 15px;
              ">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <div style="font-size: 18px; font-weight: bold; color: #4a9eff;">${npc.name}</div>
                      <div style="font-size: 14px;">${bondLevelDisplay}</div>
              </div>
                  ${npc.profile ? `<div style="font-size: 12px; color: #888; margin-bottom: 10px;">${npc.profile}</div>` : ""}
                  <div style="margin-bottom: 8px;">
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                          <span style="color: #888;">好感度</span>
                          <span style="color: #4a9eff;">${affinity} / ${maxAffinity}</span>
              </div>
                      <div style="
                          width: 100%;
                          height: 8px;
                          background: #333;
                          border-radius: 4px;
                          overflow: hidden;
                      ">
                          <div style="
                              width: ${affinityPercent}%;
                              height: 100%;
                              background: linear-gradient(90deg, #4a9eff, #88ff88);
                              transition: width 0.3s;
                          "></div>
          </div>
                  </div>
                  ${npc.supportSkills && npc.supportSkills.length > 0 ? `
                  <div style="font-size: 11px; color: #888; margin-top: 8px;">
                      <div style="margin-bottom: 4px;">支援技能：</div>
                      ${npc.supportSkills.map(skill => `<div style="margin-left: 10px;">• ${skill}</div>`).join("")}
                  </div>
                  ` : ""}
                  <div style="margin-top: 10px;">
                      <button class="ui-button" style="width: 100%; padding: 8px; font-size: 12px;" onclick="Game.UI.showNPCDetail('${id}')">
                          查看详情
          </button>
                  </div>
              </div>
      `;
      });

      content.innerHTML = html;
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
      
      // 检查商店是否有灵石商品，决定显示哪种货币
      const hasSpiritStoneItems = shopConfig.items.some(shopItem => {
          const itemId = shopItem.itemId || shopItem;
          const item = Game.Items.byId[itemId];
          const currency = shopItem.currency || item?.currency || "money";
          return currency === "spiritStones";
      });
      
      // 显示货币（如果商店有灵石商品，显示两种货币）
      if (shopGold) {
          if (hasSpiritStoneItems) {
              shopGold.innerHTML = `人民币: ¥${Game.State.player.money || 0} | 灵石: 💎${Game.State.player.spiritStones || 0}`;
          } else {
              shopGold.textContent = `¥${Game.State.player.money || 0}`;
          }
      }

      if (shopItemsList) {
          let html = "";
          shopConfig.items.forEach(shopItem => {
              const itemId = shopItem.itemId || shopItem;
              const price = shopItem.price || Game.Items.byId[itemId]?.price || 0;
              const item = Game.Items.byId[itemId];
              if (!item) return;

              // 确定使用的货币类型
              const currency = shopItem.currency || item.currency || "money";
              const canAfford = currency === "spiritStones" 
                  ? (Game.State.player.spiritStones || 0) >= price
                  : (Game.State.player.money || 0) >= price;
              
              // 根据货币类型设置价格显示样式
              const priceText = currency === "spiritStones" 
                  ? `<span style="color: #4a9eff; font-weight: bold;">💎${price} 灵石</span>`
                  : `<span style="color: #ffaa00;">¥${price}</span>`;
              
              html += `
                  <div class="shop-item-card">
                      <div class="shop-item-card-info">
                          <div class="shop-item-card-name">${item.name}</div>
                          <div class="shop-item-card-desc">${item.description || ""}</div>
                          <div class="shop-item-card-price">${priceText}</div>
                      </div>
                      <button class="shop-item-card-btn" ${!canAfford ? "disabled" : ""} onclick="if(Game.Shop.buy('${itemId}', ${price}, '${currency}')) { Game.UI.refreshShopView(); }">
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
      const shopItemsList = document.getElementById("shop-items-list");
      
      // 检查是否有灵石商品
      const hasSpiritStoneItems = shopItemsList && Array.from(shopItemsList.querySelectorAll(".shop-item-card")).some(card => {
          const priceEl = card.querySelector(".shop-item-card-price");
          return priceEl && priceEl.innerHTML.includes("灵石");
      });
      
      // 更新货币显示
      if (shopGold) {
          if (hasSpiritStoneItems) {
              shopGold.innerHTML = `人民币: ¥${Game.State.player.money || 0} | 灵石: 💎${Game.State.player.spiritStones || 0}`;
          } else {
              shopGold.textContent = `¥${Game.State.player.money || 0}`;
          }
      }

      // 重新渲染购买按钮状态
      if (shopItemsList) {
          const buttons = shopItemsList.querySelectorAll(".shop-item-card-btn");
          buttons.forEach(btn => {
              const priceEl = btn.parentElement.querySelector(".shop-item-card-price");
              if (!priceEl) return;
              
              // 判断货币类型
              const isSpiritStone = priceEl.innerHTML.includes("灵石");
              const priceText = priceEl.textContent || "";
              const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0");
              
              // 根据货币类型检查是否足够
              if (isSpiritStone) {
                  btn.disabled = (Game.State.player.spiritStones || 0) < price;
              } else {
                  btn.disabled = (Game.State.player.money || 0) < price;
              }
          });
      }

      // 刷新状态栏
      this.renderPlayerStatus(Game.State);
  },

  // 显示修炼界面（占位，现在在菜单中）
  showCultivateView: function(onCultivate) {
      this.openPlayerMenu("cultivate");
  },

  // 手动存档
  manualSave: function() {
      if (Game.Save.save()) {
          alert("存档成功！");
      } else {
          alert("存档失败，请重试。");
      }
  },

  // 重置进度
  resetProgress: function() {
      if (confirm("确定要重置游戏进度吗？此操作不可恢复！")) {
          // 清除存档
          Game.Save.clear();
          // 清除所有 localStorage（确保完全重置）
          localStorage.clear();
          // 刷新页面，触发 main.js 的初始加载逻辑
          alert("进度已重置，页面将刷新。");
          location.reload();
      }
  },

  // 刷新主界面（如果当前在主界面）
  refreshHome: function() {
      const homeEl = document.getElementById("game-home");
      if (homeEl && homeEl.style.display !== "none") {
          this.renderHomeCards();
      }
  },

  // 获取突破描述信息
  getBreakthroughDesc: function() {
      const player = Game.State.player;
      const currentRealm = Game.CoreConfig.realms.find(r => r.id === player.realm);
      if (!currentRealm || !currentRealm.breakthrough) {
          return "已达到最高境界";
      }

      const breakthrough = currentRealm.breakthrough;
      const chanceText = (breakthrough.baseChance * 100).toFixed(0) + "%";
      
      if (breakthrough.reqItem) {
          const item = Game.Items.byId[breakthrough.reqItem];
          const itemName = item ? item.name : breakthrough.reqItem;
          const haveCount = Game.State.getItemCount(breakthrough.reqItem);
          const hasItem = haveCount >= 1;
          
          if (hasItem) {
              return `突破几率: ${chanceText} | 需要: ${itemName} x1 (已拥有)`;
          } else {
              return `突破几率: ${chanceText} | 需要: ${itemName} x1 (未拥有)`;
          }
      } else {
          return `突破几率: ${chanceText}`;
      }
  },

  // 检查突破是否可用
  isBreakthroughDisabled: function() {
      const player = Game.State.player;
      const currentRealm = Game.CoreConfig.realms.find(r => r.id === player.realm);
      if (!currentRealm || !currentRealm.breakthrough) {
          return true;
      }

      const breakthrough = currentRealm.breakthrough;
      if (breakthrough.reqItem) {
          const haveCount = Game.State.getItemCount(breakthrough.reqItem);
          return haveCount < 1;
      }

      return false;
  },

  // 更新都市行动按钮和突破按钮的显示状态
  updateActionButtons: function() {
      const player = Game.State.player;
      
      // 更新打工按钮的可用状态（根据精力）
      const workBtn = document.getElementById("btn-work");
      if (workBtn) {
          workBtn.disabled = player.energy < 20;
          if (player.energy < 20) {
              workBtn.style.opacity = "0.6";
              workBtn.style.cursor = "not-allowed";
          } else {
              workBtn.style.opacity = "1";
              workBtn.style.cursor = "pointer";
          }
      }
  },

  // 显示 NPC 详情页（菜单入口）
  showNPCDetail: function(npcId) {
      const npc = Game.Social.getNPCData(npcId);
      if (!npc) {
          console.error(`NPC ${npcId} 不存在`);
          return;
      }

      if (!Game.State.relationships) {
          Game.State.relationships = {};
      }

      const relationship = Game.State.relationships[npcId] || {
          affinity: 0,
          bondLevel: 0,
          met: false
      };

      // 创建详情弹窗
      const overlay = document.createElement("div");
      overlay.id = "npc-detail-overlay";
      overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
          box-sizing: border-box;
      `;

      const container = document.createElement("div");
      container.className = "npc-modal-container";
      container.style.cssText = `
          background: #1a1a1a;
          border: 2px solid #4a9eff;
          border-radius: 8px;
          max-width: 500px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      `;
      
      // 创建内容区域（可滚动）
      const contentArea = document.createElement("div");
      contentArea.className = "npc-modal-content";
      contentArea.style.cssText = `
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px;
          -webkit-overflow-scrolling: touch;
          min-height: 0;
      `;
      
      // 创建按钮区域（固定在底部）
      const buttonArea = document.createElement("div");
      buttonArea.className = "npc-modal-buttons";
      buttonArea.style.cssText = `
          flex-shrink: 0;
          padding: 16px 20px;
          border-top: 1px solid #333;
          background: #1a1a1a;
          display: flex;
          flex-direction: column;
          gap: 10px;
      `;

      // 计算好感度进度
      const maxAffinity = 300;
      const affinityPercent = Math.min(100, (relationship.affinity / maxAffinity) * 100);

      const bondLevelText = relationship.bondLevel === 'MAX' ? 'MAX' : 
                           relationship.bondLevel > 0 ? `Level ${relationship.bondLevel}` : '未解锁';

      // 检查是否可以切磋（好感度>=200 或 红姐）
      const canCombat = relationship.affinity >= 200 || npcId === "红姐";

      // 1. 计算支援概率
      const chance = Game.Social.getSupportChance(npcId);
      const chanceText = (chance * 100).toFixed(1) + "%";

      // 获取当前羁绊等级（数字形式）
      const currentBondLevel = relationship.bondLevel === 'MAX' ? 999 : 
                               (typeof relationship.bondLevel === 'number' ? relationship.bondLevel : 0);

      // 2. 渲染头部
      let html = `
          <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4a9eff; margin-bottom: 10px;">${npc.name}</h2>
              <div style="color: #999; font-size: 14px; margin-bottom: 10px;">${npc.profile || ''}</div>
              <div style="margin-top: 10px; color: #fff; margin-bottom: 10px;">
                  <div>好感度：${relationship.affinity} / ${maxAffinity}</div>
                  <div>羁绊等级：${bondLevelText}</div>
              </div>
              <div style="background: #333; border-radius: 4px; height: 8px; overflow: hidden; margin-top: 10px;">
                  <div style="background: linear-gradient(90deg, #4a9eff, #88ff88); height: 100%; width: ${affinityPercent}%; transition: width 0.3s;"></div>
              </div>
      `;

      // 3. 渲染概率提示
      html += `<div style="color: #4a9eff; font-weight: bold; margin: 15px 0; font-size: 14px; text-align: center; padding: 8px; background: rgba(74, 158, 255, 0.1); border-radius: 4px;">当前支援概率: <span style="color: #88ff88; font-size: 16px;">${chanceText}</span></div>`;

      // 4. 渲染技能列表
      if (npc.supportSkills && npc.supportSkills.length > 0) {
          html += `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">`;
          html += `<div style="color: #4a9eff; font-size: 14px; font-weight: bold; margin-bottom: 10px;">支援技能：</div>`;
          
          npc.supportSkills.forEach((skill, index) => {
              const unlockLevel = index + 1;
              const isUnlocked = unlockLevel <= currentBondLevel;
              
              if (isUnlocked) {
                  // 已解锁样式：亮色 + ✅
                  html += `<div style="color: #88ff88; margin: 5px 0; padding: 6px; background: rgba(136, 255, 136, 0.1); border-left: 3px solid #88ff88; border-radius: 3px; font-size: 13px;">✅ [Lv.${unlockLevel}] ${skill}</div>`;
              } else {
                  // 未解锁样式：灰色 + 🔒
                  html += `<div style="color: #666; margin: 5px 0; padding: 6px; opacity: 0.6; font-size: 13px;">🔒 [Lv.${unlockLevel}] ??? (未解锁)</div>`;
              }
          });
          
          html += `</div>`;
      }

      html += `</div>`;

      // 5. 添加按钮 HTML
      const buttonHtml = `
          <button class="ui-button" 
                  ${!canCombat ? "disabled" : ""} 
                  onclick="${canCombat ? `Game.Game.onNPCCombat('${npcId}'); Game.UI.closeNPCDetail();` : ''}" 
                  style="width: 100%; padding: 12px; font-size: 16px; min-height: 44px; ${!canCombat ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
              ⚔️ 切磋${!canCombat ? ' (好感度不足，无法切磋)' : ''}
          </button>
          <button class="ui-button secondary" onclick="Game.UI.closeNPCDetail();" style="width: 100%; padding: 12px; font-size: 16px; min-height: 44px;">
              关闭
          </button>
      `;

      // 设置内容区域 HTML
      contentArea.innerHTML = html;
      
      // 设置按钮区域 HTML
      buttonArea.innerHTML = buttonHtml;
      
      // 组装结构
      container.appendChild(contentArea);
      container.appendChild(buttonArea);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
  },

  // 关闭 NPC 详情页
  closeNPCDetail: function() {
      const overlay = document.getElementById("npc-detail-overlay");
      if (overlay) {
          overlay.remove();
      }
  },

  // 显示 NPC 交互界面（探索偶遇专用）
  showNPCInteraction: function(npcId) {
      const npc = Game.Social.getNPCData(npcId);
      if (!npc) {
          console.error(`NPC ${npcId} 不存在`);
          return;
      }

      if (!Game.State.relationships) {
          Game.State.relationships = {};
      }

      const relationship = Game.State.relationships[npcId] || {
          affinity: 0,
          bondLevel: 0,
          met: false
      };

      // 创建交互弹窗
      const overlay = document.createElement("div");
      overlay.id = "npc-interaction-overlay";
      overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
      `;

      const container = document.createElement("div");
      container.style.cssText = `
          background: #1a1a1a;
          border: 2px solid #4a9eff;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
      `;

      // 计算好感度进度
      const maxAffinity = 300;
      const affinityPercent = Math.min(100, (relationship.affinity / maxAffinity) * 100);

      const bondLevelText = relationship.bondLevel === 'MAX' ? 'MAX' : 
                           relationship.bondLevel > 0 ? `Level ${relationship.bondLevel}` : '未解锁';

      // 互斥标记（用于控制闲聊和送礼按钮）
      let interactionUsed = false;

      // 创建按钮容器
      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
      buttonContainer.id = "npc-interaction-buttons";

      // 创建闲聊按钮
      const chatBtn = document.createElement("button");
      chatBtn.className = "ui-button";
      chatBtn.id = "npc-chat-btn";
      chatBtn.style.cssText = "width: 100%; padding: 12px; font-size: 16px;";
      chatBtn.textContent = "💬 闲聊 (消耗5精力，+5好感)";
      chatBtn.onclick = () => {
          if (!interactionUsed) {
              interactionUsed = true;
              chatBtn.disabled = true;
              giftBtn.disabled = true;
              chatBtn.style.opacity = "0.5";
              giftBtn.style.opacity = "0.5";
              
              const hintText = document.createElement("div");
              hintText.style.cssText = "color: #888; font-size: 12px; text-align: center; margin-top: 5px; font-style: italic;";
              hintText.textContent = "（你们交流得很愉快，但他/她似乎还有别的事，下次再聊吧。）";
              buttonContainer.appendChild(hintText);
              
              Game.Game.onNPCChat(npcId);
          }
      };
      buttonContainer.appendChild(chatBtn);

      // 创建送礼按钮
      const giftBtn = document.createElement("button");
      giftBtn.className = "ui-button";
      giftBtn.id = "npc-gift-btn";
      giftBtn.style.cssText = "width: 100%; padding: 12px; font-size: 16px;";
      giftBtn.textContent = "🎁 送礼 (大幅+好感)";
      giftBtn.onclick = () => {
          if (!interactionUsed) {
              interactionUsed = true;
              chatBtn.disabled = true;
              giftBtn.disabled = true;
              chatBtn.style.opacity = "0.5";
              giftBtn.style.opacity = "0.5";
              
              const hintText = document.createElement("div");
              hintText.style.cssText = "color: #888; font-size: 12px; text-align: center; margin-top: 5px; font-style: italic;";
              hintText.textContent = "（你们交流得很愉快，但他/她似乎还有别的事，下次再聊吧。）";
              buttonContainer.appendChild(hintText);
              
              Game.UI.showGiftMenu(npcId);
          }
      };
      buttonContainer.appendChild(giftBtn);

      // 创建切磋按钮（始终可用）
      const combatBtn = document.createElement("button");
      combatBtn.className = "ui-button";
      combatBtn.style.cssText = "width: 100%; padding: 12px; font-size: 16px;";
      combatBtn.textContent = "⚔️ 切磋 (触发战斗)";
      combatBtn.onclick = () => {
          Game.Game.onNPCCombat(npcId);
          this.closeNPCInteraction();
      };
      buttonContainer.appendChild(combatBtn);

      // 创建离开按钮
      const leaveBtn = document.createElement("button");
      leaveBtn.className = "ui-button secondary";
      leaveBtn.style.cssText = "width: 100%; padding: 12px; font-size: 16px;";
      leaveBtn.textContent = "👋 离开";
      leaveBtn.onclick = () => {
          this.closeNPCInteraction();
      };
      buttonContainer.appendChild(leaveBtn);

      container.innerHTML = `
          <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4a9eff; margin-bottom: 10px;">${npc.name}</h2>
              <div style="color: #999; font-size: 14px; margin-bottom: 10px;">${npc.profile || ''}</div>
              <div style="margin-top: 10px; color: #fff; margin-bottom: 10px;">
                  <div>好感度：${relationship.affinity} / ${maxAffinity}</div>
                  <div>羁绊等级：${bondLevelText}</div>
              </div>
              <div style="background: #333; border-radius: 4px; height: 8px; overflow: hidden; margin-top: 10px;">
                  <div style="background: linear-gradient(90deg, #4a9eff, #88ff88); height: 100%; width: ${affinityPercent}%; transition: width 0.3s;"></div>
              </div>
          </div>
      `;
      container.appendChild(buttonContainer);

      overlay.appendChild(container);
      document.body.appendChild(overlay);
  },

  // 关闭 NPC 交互界面
  closeNPCInteraction: function() {
      const overlay = document.getElementById("npc-interaction-overlay");
      if (overlay) {
          overlay.remove();
      }
  },

  // 显示送礼菜单
  showGiftMenu: function(npcId) {
      const inventory = Game.State.inventory;
      const giftableItems = [];

      // 查找可送礼的物品（消耗品或通用礼物）
      for (let itemId in inventory) {
          if (inventory[itemId] > 0) {
              const item = Game.Items.byId[itemId];
              if (item && (item.type === "consumable" || itemId === "gift_general")) {
                  giftableItems.push({ id: itemId, item: item, count: inventory[itemId] });
              }
          }
      }

      if (giftableItems.length === 0) {
          alert("你没有可以赠送的物品。");
          return;
      }

      let message = "选择要赠送的物品：\n\n";
      giftableItems.forEach((gift, index) => {
          message += `${index + 1}. ${gift.item.name} x${gift.count}\n`;
      });

      const choice = prompt(message);
      if (!choice) return;

      const index = parseInt(choice) - 1;
      if (isNaN(index) || index < 0 || index >= giftableItems.length) {
          alert("无效的选择。");
          return;
      }

      const selectedGift = giftableItems[index];
      Game.Game.onNPCGift(npcId, selectedGift.id);
      this.closeNPCInteraction();
  },

  // 显示制造界面（炼丹/炼器）
  showCraftingModal: function() {
      // 创建遮罩层
      const overlay = document.createElement("div");
      overlay.id = "crafting-overlay";
      overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
          box-sizing: border-box;
      `;

      // 创建容器
      const container = document.createElement("div");
      container.className = "crafting-modal-container";
      container.style.cssText = `
          background: #1a1a1a;
          border: 2px solid #4a9eff;
          border-radius: 8px;
          max-width: 800px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      `;

      // 创建头部
      const header = document.createElement("div");
      header.style.cssText = `
          flex-shrink: 0;
          padding: 16px 20px;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1a1a1a;
      `;
      header.innerHTML = `
          <h2 style="color: #4a9eff; margin: 0; font-size: 18px;">⚒️ 炼丹/炼器</h2>
          <button class="menu-close-btn" onclick="Game.UI.closeCraftingModal()" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">×</button>
      `;

      // 创建内容区域（可滚动）
      const content = document.createElement("div");
      content.className = "crafting-content";
      content.style.cssText = `
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px;
          -webkit-overflow-scrolling: touch;
          min-height: 0;
          display: flex;
          gap: 20px;
      `;

      // 左侧：配方列表
      const recipeList = document.createElement("div");
      recipeList.style.cssText = `
          flex: 1;
          min-width: 300px;
      `;

      // 右侧：配方详情
      const recipeDetail = document.createElement("div");
      recipeDetail.id = "crafting-recipe-detail";
      recipeDetail.style.cssText = `
          flex: 1;
          min-width: 300px;
          background: #2a2a2a;
          border-radius: 8px;
          padding: 20px;
      `;

      content.appendChild(recipeList);
      content.appendChild(recipeDetail);

      // 渲染配方列表
      this.renderCraftingRecipeList(recipeList, recipeDetail);

      // 组装
      container.appendChild(header);
      container.appendChild(content);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
  },

  // 渲染配方列表
  renderCraftingRecipeList: function(container, detailContainer) {
      if (!container) return;

      // 分类显示
      const alchemyRecipes = Game.Recipes.getByType("alchemy");
      const craftingRecipes = Game.Recipes.getByType("crafting");

      let html = `
          <div style="margin-bottom: 20px;">
              <h3 style="color: #4a9eff; font-size: 16px; margin-bottom: 10px;">💊 炼丹配方</h3>
              <div style="display: flex; flex-direction: column; gap: 8px;">
      `;

      alchemyRecipes.forEach(recipe => {
          const canCraft = Game.Crafting.canCraft(recipe.id);
          html += `
              <div class="crafting-recipe-item" 
                   onclick="Game.UI.selectCraftingRecipe('${recipe.id}')"
                   style="
                       padding: 12px;
                       background: ${canCraft.canCraft ? '#2a2a2a' : '#1a1a1a'};
                       border: 1px solid ${canCraft.canCraft ? '#4a9eff' : '#444'};
                       border-radius: 6px;
                       cursor: pointer;
                       transition: all 0.15s ease;
                       opacity: ${canCraft.canCraft ? '1' : '0.6'};
                   ">
                  <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 20px;">${recipe.icon || '⚒️'}</span>
                      <div style="flex: 1;">
                          <div style="color: ${canCraft.canCraft ? '#fff' : '#888'}; font-weight: bold; font-size: 14px;">${recipe.name}</div>
                          <div style="color: #888; font-size: 12px; margin-top: 4px;">${recipe.description}</div>
                      </div>
                  </div>
              </div>
          `;
      });

      html += `
              </div>
          </div>
          <div>
              <h3 style="color: #4a9eff; font-size: 16px; margin-bottom: 10px;">⚔️ 炼器配方</h3>
              <div style="display: flex; flex-direction: column; gap: 8px;">
      `;

      craftingRecipes.forEach(recipe => {
          const canCraft = Game.Crafting.canCraft(recipe.id);
          html += `
              <div class="crafting-recipe-item" 
                   onclick="Game.UI.selectCraftingRecipe('${recipe.id}')"
                   style="
                       padding: 12px;
                       background: ${canCraft.canCraft ? '#2a2a2a' : '#1a1a1a'};
                       border: 1px solid ${canCraft.canCraft ? '#4a9eff' : '#444'};
                       border-radius: 6px;
                       cursor: pointer;
                       transition: all 0.15s ease;
                       opacity: ${canCraft.canCraft ? '1' : '0.6'};
                   ">
                  <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 20px;">${recipe.icon || '⚒️'}</span>
                      <div style="flex: 1;">
                          <div style="color: ${canCraft.canCraft ? '#fff' : '#888'}; font-weight: bold; font-size: 14px;">${recipe.name}</div>
                          <div style="color: #888; font-size: 12px; margin-top: 4px;">${recipe.description}</div>
                      </div>
                  </div>
              </div>
          `;
      });

      html += `
              </div>
          </div>
      `;

      container.innerHTML = html;

      // 默认选择第一个配方
      if (alchemyRecipes.length > 0) {
          this.selectCraftingRecipe(alchemyRecipes[0].id);
      } else if (craftingRecipes.length > 0) {
          this.selectCraftingRecipe(craftingRecipes[0].id);
      }
  },

  // 选择配方（显示详情）
  selectCraftingRecipe: function(recipeId) {
      const recipe = Game.Recipes.get(recipeId);
      if (!recipe) return;

      const detailContainer = document.getElementById("crafting-recipe-detail");
      if (!detailContainer) return;

      const canCraft = Game.Crafting.canCraft(recipeId);
      const resultItem = Game.Items.byId[recipe.result.itemId];

      // 构建材料需求显示
      let materialsHtml = `<div style="margin-top: 15px;"><div style="color: #4a9eff; font-size: 14px; font-weight: bold; margin-bottom: 10px;">材料需求：</div>`;
      
      recipe.materials.forEach(material => {
          const materialItem = Game.Items.byId[material.itemId];
          const haveCount = Game.Crafting.getMaterialCount(material.itemId);
          const enough = haveCount >= material.count;
          const materialName = materialItem ? materialItem.name : material.itemId;
          
          materialsHtml += `
              <div style="
                  padding: 8px;
                  margin-bottom: 6px;
                  background: ${enough ? 'rgba(74, 158, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
                  border-left: 3px solid ${enough ? '#4a9eff' : '#ff4444'};
                  border-radius: 3px;
                  font-size: 13px;
              ">
                  <span style="color: ${enough ? '#88ff88' : '#ff8888'};">
                      ${enough ? '✅' : '❌'}
                  </span>
                  <span style="color: ${enough ? '#fff' : '#888'};">
                      ${materialName}: ${haveCount}/${material.count}
                  </span>
                  ${!enough ? `<span style="color: #ff8888; margin-left: 8px;">(不足)</span>` : `<span style="color: #88ff88; margin-left: 8px;">(充足)</span>`}
              </div>
          `;
      });

      // 灵石需求
      if (recipe.spiritStonesCost > 0) {
          const haveStones = Game.State.player.spiritStones || 0;
          const enough = haveStones >= recipe.spiritStonesCost;
          materialsHtml += `
              <div style="
                  padding: 8px;
                  margin-bottom: 6px;
                  background: ${enough ? 'rgba(74, 158, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
                  border-left: 3px solid ${enough ? '#4a9eff' : '#ff4444'};
                  border-radius: 3px;
                  font-size: 13px;
              ">
                  <span style="color: ${enough ? '#88ff88' : '#ff8888'};">
                      ${enough ? '✅' : '❌'}
                  </span>
                  <span style="color: ${enough ? '#fff' : '#888'};">
                      💎 灵石: ${haveStones}/${recipe.spiritStonesCost}
                  </span>
                  ${!enough ? `<span style="color: #ff8888; margin-left: 8px;">(不足)</span>` : `<span style="color: #88ff88; margin-left: 8px;">(充足)</span>`}
              </div>
          `;
      }

      materialsHtml += `</div>`;

      // 成品信息
      let resultHtml = "";
      if (resultItem) {
          resultHtml = `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
                  <div style="color: #4a9eff; font-size: 14px; font-weight: bold; margin-bottom: 10px;">制造结果：</div>
                  <div style="padding: 12px; background: rgba(74, 158, 255, 0.1); border-radius: 6px;">
                      <div style="color: #88ff88; font-size: 16px; font-weight: bold; margin-bottom: 6px;">
                          ${recipe.icon || '⚒️'} ${resultItem.name} x${recipe.result.count || 1}
                      </div>
                      <div style="color: #999; font-size: 12px;">${resultItem.description || ''}</div>
                  </div>
              </div>
          `;
      }

      detailContainer.innerHTML = `
          <div style="color: #4a9eff; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
              ${recipe.icon || '⚒️'} ${recipe.name}
          </div>
          <div style="color: #999; font-size: 14px; margin-bottom: 15px; line-height: 1.6;">
              ${recipe.description}
          </div>
          ${materialsHtml}
          ${resultHtml}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
              <button 
                  id="craft-btn-${recipeId}"
                  onclick="Game.UI.executeCraft('${recipeId}')"
                  style="
                      width: 100%;
                      padding: 14px;
                      font-size: 16px;
                      font-weight: bold;
                      border: none;
                      border-radius: 8px;
                      cursor: ${canCraft.canCraft ? 'pointer' : 'not-allowed'};
                      background: ${canCraft.canCraft ? 'linear-gradient(135deg, #4a9eff, #2d5aa0)' : '#555'};
                      color: #fff;
                      transition: all 0.15s ease;
                      opacity: ${canCraft.canCraft ? '1' : '0.6'};
                  "
                  ${!canCraft.canCraft ? 'disabled' : ''}
              >
                  ${canCraft.canCraft ? '⚒️ 开始制造' : '❌ 材料不足'}
              </button>
          </div>
      `;

      // 更新选中状态
      document.querySelectorAll(".crafting-recipe-item").forEach(item => {
          item.style.background = "#1a1a1a";
          item.style.borderColor = "#444";
      });
      const selectedItem = document.querySelector(`[onclick="Game.UI.selectCraftingRecipe('${recipeId}')"]`);
      if (selectedItem) {
          selectedItem.style.background = "#2a2a2a";
          selectedItem.style.borderColor = "#4a9eff";
      }
  },

  // 执行制造
  executeCraft: function(recipeId) {
      const result = Game.Crafting.craft(recipeId);
      
      if (result.success) {
          alert(result.message);
          // 刷新界面
          const overlay = document.getElementById("crafting-overlay");
          if (overlay) {
              const recipeList = overlay.querySelector(".crafting-content > div:first-child");
              const recipeDetail = document.getElementById("crafting-recipe-detail");
              if (recipeList && recipeDetail) {
                  this.renderCraftingRecipeList(recipeList, recipeDetail);
                  // 重新选择当前配方
                  this.selectCraftingRecipe(recipeId);
              }
          }
      } else {
          alert(result.message || "制造失败");
      }
  },

  // 刷新制造界面
  refreshCraftingView: function() {
      const overlay = document.getElementById("crafting-overlay");
      if (!overlay) return;

      const recipeList = overlay.querySelector(".crafting-content > div:first-child");
      const recipeDetail = document.getElementById("crafting-recipe-detail");
      if (recipeList && recipeDetail) {
          // 获取当前选中的配方
          const craftBtn = recipeDetail.querySelector("button");
          let currentRecipeId = null;
          if (craftBtn && craftBtn.id) {
              currentRecipeId = craftBtn.id.replace("craft-btn-", "");
          }

          this.renderCraftingRecipeList(recipeList, recipeDetail);
          
          // 恢复选中状态
          if (currentRecipeId) {
              this.selectCraftingRecipe(currentRecipeId);
          }
      }
  },

  // 关闭制造界面
  closeCraftingModal: function() {
      const overlay = document.getElementById("crafting-overlay");
      if (overlay) {
          overlay.remove();
      }
      // 刷新主界面，确保按钮状态更新（如突破按钮）
      this.renderHomeCards();
  },

  // 显示灵兽互动界面
  showPetInteraction: function() {
      const pet = Game.State.pet;
      if (!pet.active || !pet.id) {
          alert("你还没有灵兽。");
          return;
      }

      const petData = Game.Pets.get(pet.id);
      if (!petData) {
          alert("灵兽数据错误。");
          return;
      }

      const petName = pet.name || petData.name;
      const petLevel = pet.level || 1;
      const petAttack = Game.Pets.calculateAttack(pet.id, petLevel);
      const petAffinity = pet.affinity || 0;
      const maxExp = petLevel * 100;
      const isLevelCapped = petLevel >= Game.State.player.level;

      let html = `
          <div class="modal-container" style="max-width: 400px;">
              <div class="modal-header">
                  <h2>🐾 ${petName}</h2>
              </div>
              <div class="modal-content" style="padding: 20px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                      <div style="font-size: 48px;">🐱</div>
                      <div style="margin-top: 10px; color: #888;">${petData.description}</div>
                  </div>
                  
                  <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                      <div style="margin-bottom: 8px;"><strong>等级：</strong> Lv.${petLevel} ${isLevelCapped ? '<span style="color: #ffaa00;">(已达上限)</span>' : ''}</div>
                      <div style="margin-bottom: 8px;"><strong>攻击力：</strong> ${petAttack}</div>
                      <div style="margin-bottom: 8px;"><strong>技能：</strong> ${petData.skill.name} (${(() => {
                          const baseRate = petData.skill.rate || 0.3;
                          // 好感度每10点增加0.5%触发率，最高增加10%
                          const affinityBonus = Math.min(0.1, Math.floor(petAffinity / 10) * 0.005);
                          const totalRate = baseRate + affinityBonus;
                          const bonusText = affinityBonus > 0 ? ` (+${(affinityBonus * 100).toFixed(1)}%)` : '';
                          return `${(totalRate * 100).toFixed(1)}%${bonusText}`;
                      })()} 概率触发)</div>
                      <div style="margin-bottom: 8px;"><strong>经验值：</strong> ${pet.exp || 0} / ${maxExp}</div>
                      <div><strong>好感度：</strong> ${petAffinity}</div>
                  </div>

                  <div style="color: #4a9eff; font-size: 14px; margin-bottom: 15px;">
                      ${petData.trueName ? `真实身份：${petData.trueName}` : ""}
                  </div>

                  <div style="background: #1a1a2e; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #4a9eff;">
                      <div style="color: #4a9eff; font-weight: bold; margin-bottom: 10px; font-size: 16px;">【羁绊加成】</div>
                      ${(() => {
                          const bonuses = Game.Pets.getAffinityBonuses(pet.id);
                          let html = '';
                          if (petData.affinityBonuses) {
                              petData.affinityBonuses.forEach(bonus => {
                                  const isUnlocked = petAffinity >= bonus.threshold;
                                  const icon = isUnlocked ? '✅' : '🔒';
                                  const color = isUnlocked ? '#4cff4c' : '#666';
                                  html += `<div style="color: ${color}; margin: 5px 0; font-size: 14px;">${icon} [${bonus.threshold}好感] ${bonus.description}</div>`;
                              });
                          }
                          if (html === '') {
                              html = '<div style="color: #888; font-size: 12px;">暂无羁绊加成</div>';
                          }
                          return html;
                      })()}
                      <div style="color: #888; font-size: 12px; margin-top: 10px;">
                          投喂灵气可提升好感，解锁强力助战效果。
                      </div>
                  </div>

                  <div style="text-align: center; color: #888; font-size: 12px; margin-bottom: 15px;">
                      灵兽会在战斗中自动助战，无需手动操作。
                  </div>

                  <div style="display: flex; gap: 10px; margin-top: 20px;">
                      <button class="ui-button" onclick="Game.UI.showPetFeedMenu()" style="flex: 1;">🥣 投喂灵气</button>
                  </div>
              </div>
              <div style="padding: 15px; border-top: 1px solid #333;">
                  <button class="ui-button secondary" onclick="Game.UI.closeModal()" style="width: 100%;">关闭</button>
              </div>
          </div>
      `;

      const modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.innerHTML = html;
      document.body.appendChild(modal);

      // 点击遮罩关闭
      modal.addEventListener("click", function(e) {
          if (e.target === modal) {
              document.body.removeChild(modal);
          }
      });
  },

  // 显示喂食菜单
  showPetFeedMenu: function() {
      const pet = Game.State.pet;
      if (!pet || !pet.active) {
          alert("灵兽未激活");
          return;
      }

      // 获取背包中所有可喂食的物品
      const feedableItems = [];
      const inventory = Game.State.inventory || {};
      
      for (let itemId in inventory) {
          if (inventory[itemId] > 0) {
              const item = Game.Items.byId[itemId];
              if (item && item.type !== "quest" && itemId !== "spell_book_qi_blast" && itemId !== "foundation_pill") {
                  // 计算经验值
                  const expGain = Math.max(1, Math.floor((item.price || 10) / 10));
                  feedableItems.push({
                      id: itemId,
                      name: item.name,
                      count: inventory[itemId],
                      expGain: expGain
                  });
              }
          }
      }

      if (feedableItems.length === 0) {
          alert("背包中没有可喂食的物品。");
          return;
      }

      let html = `
          <div class="modal-container" style="max-width: 450px;">
              <div class="modal-header">
                  <h2>🥣 投喂灵气</h2>
              </div>
              <div class="modal-content" style="padding: 20px; max-height: 400px; overflow-y: auto;">
                  <div style="margin-bottom: 15px; color: #888; font-size: 14px;">
                      选择要喂给${pet.name || "小白"}的物品。物品会转化为经验值和好感度。
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
      `;

      feedableItems.forEach(item => {
          const onClickHandler = item.count > 1 
              ? `Game.UI.feedPetItemWithAmount('${item.id}', ${item.count})`
              : `Game.UI.feedPetItem('${item.id}')`;
          html += `
              <button class="ui-button" onclick="${onClickHandler}" style="text-align: left; justify-content: space-between; display: flex; padding: 12px;">
                  <span><strong>${item.name}</strong> x${item.count}</span>
                  <span style="color: #4a9eff;">+${item.expGain} 经验/个</span>
              </button>
          `;
      });

      html += `
                  </div>
              </div>
              <div style="padding: 15px; border-top: 1px solid #333;">
                  <button class="ui-button secondary" onclick="Game.UI.closeModal()" style="width: 100%;">返回</button>
              </div>
          </div>
      `;

      const modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.innerHTML = html;
      document.body.appendChild(modal);

      // 点击遮罩关闭
      modal.addEventListener("click", function(e) {
          if (e.target === modal) {
              document.body.removeChild(modal);
          }
      });
  },

  // 喂食物品（单个）
  feedPetItem: function(itemId) {
      const result = Game.Pets.feed(itemId, 1);
      
      if (result.success) {
          alert(result.message);
          // 关闭喂食菜单
          this.closeModal();
          // 刷新灵兽界面
          setTimeout(() => {
              this.showPetInteraction();
          }, 100);
      } else {
          alert(result.message);
      }
  },

  // 喂食物品（批量）
  feedPetItemWithAmount: function(itemId, maxCount) {
      const item = Game.Items.byId[itemId];
      if (!item) {
          alert("物品不存在");
          return;
      }

      const currentCount = Game.State.getItemCount(itemId);
      if (currentCount < 1) {
          alert("物品数量不足");
          return;
      }

      // 使用 prompt 询问数量
      const input = prompt(`请输入投喂数量 (1-${currentCount})：`, currentCount);
      if (input === null) {
          return; // 用户取消
      }

      const amount = parseInt(input);
      if (isNaN(amount) || amount < 1 || amount > currentCount) {
          alert(`输入无效，请输入 1-${currentCount} 之间的数字。`);
          return;
      }

      const result = Game.Pets.feed(itemId, amount);
      
      if (result.success) {
          alert(result.message);
          // 关闭喂食菜单
          this.closeModal();
          // 刷新灵兽界面
          setTimeout(() => {
              this.showPetInteraction();
          }, 100);
      } else {
          alert(result.message);
      }
  },

  // 关闭模态框（通用）
  closeModal: function() {
      const modals = document.querySelectorAll(".modal-overlay");
      modals.forEach(modal => {
          if (modal.parentNode) {
              modal.parentNode.removeChild(modal);
          }
      });
  }
};