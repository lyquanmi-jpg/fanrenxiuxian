// ==========================
// 事件聚合：将所有章节事件整合到统一注册表
// ==========================

Game.EventRegistry = {
  byId: {}
};

// 注册所有章节事件
function registerEvents(eventsArray, chapterName) {
  eventsArray.forEach(event => {
      if (Game.EventRegistry.byId[event.id]) {
          console.warn(`警告：事件 ID ${event.id} 已存在，将被覆盖`);
      }
      Game.EventRegistry.byId[event.id] = event;
  });
  console.log(`已注册 ${eventsArray.length} 个 ${chapterName} 事件`);
}

// 注册各章节
registerEvents(Game.Events_ch1 || [], "第一章");
registerEvents(Game.Events_ch2 || [], "第二章");
registerEvents(Game.Events_ch3 || [], "第三章");
registerEvents(Game.Events_ch4 || [], "第四章");
registerEvents(Game.Events_ch5 || [], "第五章");
registerEvents(Game.Events_ch6 || [], "第六章");
registerEvents(Game.Events_ch7 || [], "第七章");
registerEvents(Game.Events_ch8 || [], "第八章");
registerEvents(Game.Events_ch9 || [], "第九章");

console.log(`事件注册完成，共 ${Object.keys(Game.EventRegistry.byId).length} 个事件`);