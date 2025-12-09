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

  // 开始游戏
  Game.Game.startNewGame();

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

  // 菜单标签切换
  document.querySelectorAll(".menu-tab").forEach(tab => {
      tab.addEventListener("click", function() {
          const tabName = this.getAttribute("data-tab");
          Game.UI.switchMenuTab(tabName);
          Game.UI.renderMenuContent();
      });
  });

  console.log("游戏启动完成");
});