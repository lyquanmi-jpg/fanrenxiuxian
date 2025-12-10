// ==========================
// 存档系统：本地存储游戏进度
// ==========================

Game.Save = {
  // 存档版本号（用于兼容性检查）
  SAVE_VERSION: "1.0.0",
  SAVE_KEY: "fanrenxiuxian_save",

  // 保存游戏
  save: function() {
      try {
          const saveData = {
              version: this.SAVE_VERSION,
              timestamp: Date.now(),
              state: {
                  // 玩家数据
                  player: JSON.parse(JSON.stringify(Game.State.player)),
                  // 背包
                  inventory: JSON.parse(JSON.stringify(Game.State.inventory)),
                  // 装备
                  equipment: JSON.parse(JSON.stringify(Game.State.equipment)),
                  // 游戏进度
                  progress: JSON.parse(JSON.stringify(Game.State.progress)),
                  // 修炼经验
                  cultivationExp: Game.State.cultivationExp,
                  // 已学会的技能
                  learnedSkills: JSON.parse(JSON.stringify(Game.State.learnedSkills)),
                  // 失败感计数器
                  failureCount: Game.State.failureCount,
                  // 一次性护身符标记
                  hasOneTimeProtection: Game.State.hasOneTimeProtection,
                  // NPC 关系数据
                  relationships: JSON.parse(JSON.stringify(Game.State.relationships || {}))
              }
          };

          const jsonString = JSON.stringify(saveData);
          localStorage.setItem(this.SAVE_KEY, jsonString);
          
          console.log("存档成功");
          return true;
      } catch (error) {
          console.error("存档失败：", error);
          alert("存档失败：" + error.message);
          return false;
      }
  },

  // 加载游戏
  load: function() {
      try {
          const jsonString = localStorage.getItem(this.SAVE_KEY);
          if (!jsonString) {
              console.log("没有找到存档");
              return false;
          }

          const saveData = JSON.parse(jsonString);
          
          // 版本兼容性检查
          if (!saveData.version) {
              console.warn("检测到旧版本存档，尝试兼容...");
              // 可以在这里添加旧版本兼容逻辑
          }

          // 恢复状态数据
          if (saveData.state) {
              // 恢复玩家数据（合并，保留默认值）
              if (saveData.state.player) {
                  Object.assign(Game.State.player, saveData.state.player);
              }
              
              // 恢复背包
              if (saveData.state.inventory) {
                  Game.State.inventory = saveData.state.inventory;
              }
              
              // 恢复装备
              if (saveData.state.equipment) {
                  Game.State.equipment = saveData.state.equipment;
              }
              
              // 恢复游戏进度
              if (saveData.state.progress) {
                  Object.assign(Game.State.progress, saveData.state.progress);
              }
              
              // 恢复修炼经验
              if (saveData.state.cultivationExp !== undefined) {
                  Game.State.cultivationExp = saveData.state.cultivationExp;
              }
              
              // 恢复已学会的技能
              if (saveData.state.learnedSkills) {
                  Game.State.learnedSkills = saveData.state.learnedSkills;
              }
              
              // 恢复失败感计数器
              if (saveData.state.failureCount !== undefined) {
                  Game.State.failureCount = saveData.state.failureCount;
              }
              
              // 恢复一次性护身符标记
              if (saveData.state.hasOneTimeProtection !== undefined) {
                  Game.State.hasOneTimeProtection = saveData.state.hasOneTimeProtection;
              }
              
              // 恢复 NPC 关系数据
              if (saveData.state.relationships) {
                  Game.State.relationships = saveData.state.relationships;
              } else {
                  // 兼容旧存档：如果没有 relationships，初始化为空对象
                  Game.State.relationships = {};
              }
          }

          console.log("读档成功");
          return true;
      } catch (error) {
          console.error("读档失败：", error);
          alert("读档失败：" + error.message);
          return false;
      }
  },

  // 删除存档
  clear: function() {
      try {
          localStorage.removeItem(this.SAVE_KEY);
          console.log("存档已删除");
          return true;
      } catch (error) {
          console.error("删除存档失败：", error);
          return false;
      }
  },

  // 检查是否有存档
  hasSave: function() {
      try {
          const jsonString = localStorage.getItem(this.SAVE_KEY);
          if (!jsonString) {
              return false;
          }
          
          const saveData = JSON.parse(jsonString);
          return saveData && saveData.state && saveData.state.progress;
      } catch (error) {
          console.error("检查存档失败：", error);
          return false;
      }
  },

  // 获取存档信息（用于显示）
  getSaveInfo: function() {
      try {
          const jsonString = localStorage.getItem(this.SAVE_KEY);
          if (!jsonString) {
              return null;
          }
          
          const saveData = JSON.parse(jsonString);
          if (!saveData || !saveData.state || !saveData.state.progress) {
              return null;
          }
          
          const progress = saveData.state.progress;
          const chapter = progress.currentChapter || 1;
          const eventId = progress.currentEventId || "ch1_intro_1";
          
          // 尝试从事件ID推断地点
          let location = "未知地点";
          if (eventId.includes("station")) {
              location = "地铁站";
          } else if (eventId.includes("rental")) {
              location = "出租屋";
          } else if (eventId.includes("street")) {
              location = "街道";
          } else if (eventId.includes("factory")) {
              location = "废弃工厂";
          }
          
          return {
              chapter: chapter,
              location: location,
              eventId: eventId,
              timestamp: saveData.timestamp || 0
          };
      } catch (error) {
          console.error("获取存档信息失败：", error);
          return null;
      }
  }
};

