// ==========================
// 制造系统：炼丹/炼器核心逻辑
// ==========================

Game.Crafting = {
  // 检查是否可以制造（检查材料和灵石）
  canCraft: function(recipeId) {
      const recipe = Game.Recipes.get(recipeId);
      if (!recipe) {
          console.error(`配方 ${recipeId} 不存在`);
          return { canCraft: false, reason: "配方不存在" };
      }

      // 检查材料
      for (let i = 0; i < recipe.materials.length; i++) {
          const material = recipe.materials[i];
          const haveCount = Game.State.getItemCount(material.itemId);
          if (haveCount < material.count) {
              return {
                  canCraft: false,
                  reason: `材料不足：需要 ${material.count} 个 ${Game.Items.byId[material.itemId]?.name || material.itemId}，当前只有 ${haveCount} 个`
              };
          }
      }

      // 检查灵石
      if (recipe.spiritStonesCost > 0) {
          const haveStones = Game.State.player.spiritStones || 0;
          if (haveStones < recipe.spiritStonesCost) {
              return {
                  canCraft: false,
                  reason: `灵石不足：需要 ${recipe.spiritStonesCost} 枚灵石，当前只有 ${haveStones} 枚`
              };
          }
      }

      return { canCraft: true };
  },

  // 执行制造
  craft: function(recipeId) {
      const recipe = Game.Recipes.get(recipeId);
      if (!recipe) {
          console.error(`配方 ${recipeId} 不存在`);
          return { success: false, message: "配方不存在" };
      }

      // 检查是否可以制造
      const check = this.canCraft(recipeId);
      if (!check.canCraft) {
          return { success: false, message: check.reason };
      }

      // 扣除材料
      for (let i = 0; i < recipe.materials.length; i++) {
          const material = recipe.materials[i];
          if (!Game.State.removeItem(material.itemId, material.count)) {
              console.error(`扣除材料失败：${material.itemId} x${material.count}`);
              return { success: false, message: "扣除材料失败" };
          }
      }

      // 扣除灵石
      if (recipe.spiritStonesCost > 0) {
          Game.State.player.spiritStones = Math.max(0, (Game.State.player.spiritStones || 0) - recipe.spiritStonesCost);
      }

      // 添加成品
      const resultItem = Game.Items.byId[recipe.result.itemId];
      if (!resultItem) {
          console.error(`成品物品 ${recipe.result.itemId} 不存在`);
          return { success: false, message: "成品物品不存在" };
      }

      Game.State.addItem(recipe.result.itemId, recipe.result.count || 1);

      // 自动存档
      Game.Save.save();

      // 刷新UI
      Game.UI.renderPlayerStatus(Game.State);
      if (Game.UI.refreshCraftingView) {
          Game.UI.refreshCraftingView();
      }

      const resultItemName = resultItem.name;
      const resultCount = recipe.result.count || 1;
      const message = `制造成功！获得 ${resultItemName} x${resultCount}`;

      console.log(`制造成功：${recipe.name} -> ${resultItemName} x${resultCount}`);

      return {
          success: true,
          message: message,
          recipe: recipe,
          result: resultItem
      };
  },

  // 获取玩家拥有的材料数量
  getMaterialCount: function(itemId) {
      return Game.State.getItemCount(itemId);
  }
};

