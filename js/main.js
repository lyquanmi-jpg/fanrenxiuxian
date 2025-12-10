// ==========================
// 入口文件：初始化游戏
// ==========================

document.addEventListener("DOMContentLoaded", function() {
  console.log("游戏初始化...");
  
  // 检查必要的数据是否加载
  if (!Game.CoreConfig) {
      console.error("核心配置未加载");
      return;
  }
  if (!Game.EventRegistry || Object.keys(Game.EventRegistry.byId).length === 0) {
      console.error("事件数据未加载");
      return;
  }

  // 初始化UI
  Game.UI.renderPlayerStatus(Game.State);
  const realm = Game.CoreConfig.realms.find(r => r.id === Game.State.player.realm);
  if (realm) {
      Game.UI.updateRealmInfo(realm.name);
  }

  // 检查存档
  if (Game.Save.hasSave()) {
      const saveInfo = Game.Save.getSaveInfo();
      if (saveInfo) {
          const message = `检测到本地存档（第${saveInfo.chapter}章 - ${saveInfo.location}），是否继续游戏？`;
          if (confirm(message)) {
              // 加载存档
              if (Game.Save.load()) {
                  // 恢复UI
                  Game.UI.renderPlayerStatus(Game.State);
                  const savedRealm = Game.CoreConfig.realms.find(r => r.id === Game.State.player.realm);
                  if (savedRealm) {
                      Game.UI.updateRealmInfo(savedRealm.name);
                  }
                  // 读档后：默认进入主界面
                  Game.UI.showHome();
                  console.log("已加载存档，继续游戏");
              } else {
                  // 读档失败，开始新游戏
                  console.log("读档失败，开始新游戏");
                  Game.Game.startNewGame();
              }
          } else {
              // 用户选择开始新游戏
              Game.Game.startNewGame();
          }
      } else {
          // 存档信息获取失败，开始新游戏
          console.log("存档信息获取失败，开始新游戏");
          Game.Game.startNewGame();
      }
  } else {
      // 没有存档，开始新游戏
      Game.Game.startNewGame();
  }

  // 状态栏折叠交互（仅手机端）
  const statusToggle = document.querySelector(".status-toggle");
  const statusPanel = document.querySelector(".game-status-panel");
  if (statusToggle && statusPanel) {
      statusToggle.addEventListener("click", function() {
          statusPanel.classList.toggle("expanded");
      });
  }

  // 菜单按钮绑定
  const menuBtn = document.getElementById("btn-open-menu");
  const closeMenuBtn = document.getElementById("btn-close-menu");
  if (menuBtn) {
      menuBtn.addEventListener("click", function() {
          Game.UI.openPlayerMenu("status");
      });
  }
  if (closeMenuBtn) {
      closeMenuBtn.addEventListener("click", function() {
          Game.UI.closePlayerMenu();
      });
  }

  // 返回首页按钮绑定
  const returnHomeBtn = document.getElementById("btn-return-home");
  if (returnHomeBtn) {
      returnHomeBtn.addEventListener("click", function() {
          Game.Game.returnToHome();
      });
  }

  // 菜单标签切换
  document.querySelectorAll(".menu-tab").forEach(tab => {
      tab.addEventListener("click", function() {
          const tabName = this.getAttribute("data-tab");
          Game.UI.switchMenuTab(tabName);
          Game.UI.renderMenuContent();
      });
  });

  // 初始化都市行动按钮和突破按钮的显示状态
  Game.UI.updateActionButtons();
  
  // 定期更新行动按钮状态（每2秒）
  setInterval(function() {
      Game.UI.updateActionButtons();
  }, 2000);

  console.log("游戏启动完成");
});