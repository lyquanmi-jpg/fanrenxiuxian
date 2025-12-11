# 游戏架构原则文档

本文档定义了游戏开发的核心架构原则，所有代码修改必须遵循这些原则。

## 1. UI 与逻辑分离 (Separation of Concerns)

### 原则
- **`ui.js` 只负责渲染 DOM**，绝对不能在里面修改 `state.js` 中的核心数值
- **逻辑修改必须在 `game.js` 或 `battle.js` 中完成**，然后通知 UI 更新

### 正确示例
```javascript
// ✅ 正确：在 game.js 中修改状态
Game.Game.onCultivateClick = function() {
    const result = Game.State.doCultivate();
    if (result.success) {
        Game.UI.updateUI(); // 通知 UI 更新
        Game.UI.showMessage(result.message);
    }
};

// ✅ 正确：在 ui.js 中只读取状态并渲染
Game.UI.updateStatusBar = function() {
    const player = Game.State.player;
    const stats = Game.State.getTotalStats();
    // 只读取，不修改
    document.getElementById("hp").textContent = `${player.hp}/${stats.maxHp}`;
};
```

### 错误示例
```javascript
// ❌ 错误：在 ui.js 中直接修改状态
Game.UI.onCultivateClick = function() {
    Game.State.player.energy -= 10; // 禁止！
    Game.State.cultivationExp += 5; // 禁止！
};

// ❌ 错误：在 ui.js 中修改进度
Game.UI.selectChapter = function(chapterId) {
    Game.State.progress.currentEventId = "ch1_intro_1"; // 禁止！
};
```

### 修复方法
如果需要在 UI 中触发状态修改，应该调用 `game.js` 中的方法：

```javascript
// ✅ 正确：UI 调用 game.js 的方法
Game.UI.selectChapter = function(chapterId) {
    Game.Game.resetChapterProgress(chapterId); // 由 game.js 处理逻辑
};
```

---

## 2. 单一数据源 (Single Source of Truth)

### 原则
- **所有游戏状态必须统一存储在 `state.js` 的 `Game.State` 对象中**
- **严禁分散在各个变量里**，否则存读档功能会崩溃

### 状态存储位置
所有状态必须存储在 `Game.State` 对象中：

```javascript
Game.State = {
    player: { ... },           // 玩家属性
    inventory: {},             // 背包
    equipment: {},             // 装备
    progress: { ... },          // 游戏进度
    relationships: {},         // NPC 关系
    cultivationExp: 0,         // 修炼经验
    learnedSkills: [],        // 已学会的技能
    // ... 其他状态
};
```

### 正确示例
```javascript
// ✅ 正确：所有状态都在 Game.State 中
Game.State.player.hp = 100;
Game.State.inventory["item_id"] = 5;
Game.State.progress.currentChapter = 1;
```

### 错误示例
```javascript
// ❌ 错误：分散存储状态
let playerHp = 100; // 禁止！
let currentChapter = 1; // 禁止！
const inventory = {}; // 禁止！

// ❌ 错误：在函数内部维护状态
Game.Battle.currentBattle = { ... }; // 如果这是持久状态，应该移到 Game.State
```

### 初始化方法
如果需要初始化状态，应该在 `state.js` 中提供方法：

```javascript
// ✅ 正确：在 state.js 中提供初始化方法
Game.State.initRelationships = function() {
    if (!this.relationships) {
        this.relationships = {};
    }
    return this.relationships;
};

// ✅ 正确：在 game.js 中调用初始化方法
Game.Game.startNewGame = function() {
    Game.State.initRelationships();
    // ...
};
```

---

## 3. 配置化思维 (Configuration-Driven)

### 原则
- **新功能应该做成可配置的**，而不是硬编码
- **配置数据应该放在 `data/` 目录下**，而不是写死在代码里

### 正确示例
```javascript
// ✅ 正确：在 data/tribulation.js 中配置雷劫
Game.TribulationConfig = {
    levels: [
        {
            id: "tribulation_1",
            name: "一重雷劫",
            damage: 100,
            successReward: { exp: 1000, realm: "qi_refining" }
        },
        // ...
    ]
};

// ✅ 正确：在代码中读取配置
Game.Game.attemptTribulation = function(levelId) {
    const config = Game.TribulationConfig.levels.find(l => l.id === levelId);
    if (!config) return { success: false };
    
    const damage = config.damage;
    // 使用配置数据
};
```

### 错误示例
```javascript
// ❌ 错误：硬编码数值
Game.Game.attemptTribulation = function() {
    const damage = 100; // 禁止硬编码！
    const rewardExp = 1000; // 禁止硬编码！
    // ...
};

// ❌ 错误：配置数据写在逻辑代码中
Game.Game.attemptTribulation = function() {
    const tribulationData = {
        damage: 100,
        reward: { exp: 1000 }
    }; // 应该移到 data/ 目录
};
```

### 配置文件的组织
- **游戏核心配置**：`data/core.js` - 境界、经验曲线等
- **物品配置**：`data/items.js` - 物品属性、效果等
- **NPC 配置**：`data/npcs.js` - NPC 数据、关系等
- **敌人配置**：`data/enemies.js` - 敌人属性、掉落等
- **事件配置**：`data/events_*.js` - 剧情事件
- **新功能配置**：`data/[功能名].js` - 如 `data/tribulation.js`

---

## 代码检查清单

在提交代码前，请检查：

- [ ] `ui.js` 中是否直接修改了 `Game.State` 的属性？
- [ ] 是否有状态变量存储在 `Game.State` 之外？
- [ ] 新功能是否使用了配置文件，而不是硬编码？
- [ ] 所有状态修改是否通过 `state.js` 或 `game.js` 的方法？
- [ ] UI 更新是否在状态修改后正确调用？

---

## 常见问题

### Q: 如果 UI 需要临时存储一些显示状态（如弹窗是否打开），应该放在哪里？
A: UI 相关的临时状态可以放在 `Game.UI` 对象中，但不应该影响游戏逻辑状态。例如：
```javascript
Game.UI = {
    isMenuOpen: false,  // UI 临时状态，不影响存档
    currentTab: "status"  // UI 临时状态
};
```

### Q: 战斗中的临时状态（如当前回合数）应该放在哪里？
A: 如果需要在战斗结束后保留，应该放在 `Game.State.battleBuffs` 或类似的地方。如果只是战斗过程中的临时状态，可以放在 `Game.Battle` 对象中，但要注意在战斗结束后清理。

### Q: 如何确保配置文件的加载顺序？
A: 在 `index.html` 中按依赖顺序加载：
```html
<script src="data/core.js"></script>  <!-- 基础配置 -->
<script src="data/items.js"></script>  <!-- 依赖 core.js -->
<script src="data/npcs.js"></script>  <!-- 依赖 core.js -->
```

---

## 更新日志

- 2024-01-XX: 初始版本，定义三大核心原则

