// ==========================
// 配方系统：炼丹/炼器配方定义
// ==========================

Game.Recipes = {
  byId: {},
  byType: {
    alchemy: [],  // 炼丹配方
    crafting: []  // 炼器配方
  },

  // 初始化：将所有配方注册到 byId 和 byType
  init: function() {
      this.byId = {};
      this.byType.alchemy = [];
      this.byType.crafting = [];

      // 注册所有配方
      const allRecipes = [
          // ===== 炼丹配方 =====
          {
              id: "recipe_small_healing_pill",
              name: "小还丹",
              type: "alchemy",
              description: "基础的疗伤丹药，能快速恢复气血。",
              icon: "💊",
              materials: [
                  { itemId: "spirit_herb", count: 2 },
                  { itemId: "monster_core", count: 1 }
              ],
              result: {
                  itemId: "small_healing_pill",
                  count: 1
              },
              spiritStonesCost: 0  // 不需要消耗灵石
          },
          {
              id: "recipe_qi_gathering_pill",
              name: "聚气丹",
              type: "alchemy",
              description: "恢复灵力的基础丹药，修仙者常用。",
              icon: "💊",
              materials: [
                  { itemId: "spirit_herb", count: 3 }
              ],
              result: {
                  itemId: "qi_gathering_pill",
                  count: 1
              },
              spiritStonesCost: 2  // 需要消耗2灵石
          },
          {
              id: "recipe_energy_pill",
              name: "回神丹",
              type: "alchemy",
              description: "恢复精力的丹药，让你重新焕发活力。",
              icon: "💊",
              materials: [
                  { itemId: "spirit_herb", count: 2 },
                  { itemId: "crystal_fragment", count: 1 }
              ],
              result: {
                  itemId: "energy_restoration_pill",
                  count: 1
              },
              spiritStonesCost: 1
          },

          // ===== 炼器配方 =====
          {
              id: "recipe_refined_iron_sword",
              name: "精铁剑",
              type: "crafting",
              description: "用精铁锻造的法剑，比初级法剑更锋利。",
              icon: "⚔️",
              materials: [
                  { itemId: "iron_essence", count: 3 },
                  { itemId: "monster_core", count: 1 }
              ],
              result: {
                  itemId: "refined_iron_sword",
                  count: 1
              },
              spiritStonesCost: 5
          },
          {
              id: "recipe_formation_disk",
              name: "一阶阵盘",
              type: "crafting",
              description: "基础的阵法材料，可用于布置简单阵法。",
              icon: "🔮",
              materials: [
                  { itemId: "iron_essence", count: 2 },
                  { itemId: "crystal_fragment", count: 1 }
              ],
              result: {
                  itemId: "formation_material",
                  count: 1
              },
              spiritStonesCost: 3
          },
          {
              id: "recipe_spirit_armor",
              name: "灵甲",
              type: "crafting",
              description: "用灵木和妖丹制作的护甲，提供不错的防御。",
              icon: "🛡️",
              materials: [
                  { itemId: "spirit_wood", count: 2 },
                  { itemId: "monster_core", count: 1 },
                  { itemId: "iron_essence", count: 1 }
              ],
              result: {
                  itemId: "spirit_armor",
                  count: 1
              },
              spiritStonesCost: 8
          },

          // ===== 突破丹药配方 =====
          {
              id: "recipe_foundation_pill",
              name: "筑基丹",
              type: "alchemy",
              description: "突破炼气桎梏的逆天丹药，是踏入筑基期的关键。",
              icon: "💎",
              materials: [
                  { itemId: "monster_core", count: 2 },
                  { itemId: "spirit_herb", count: 5 }
              ],
              result: {
                  itemId: "foundation_pill",
                  count: 1
              },
              spiritStonesCost: 10
          },
          {
              id: "recipe_golden_core_pill",
              name: "金丹",
              type: "alchemy",
              description: "凝聚天地精华的至宝，是突破筑基期的必备之物。",
              icon: "💎",
              materials: [
                  { itemId: "monster_core", count: 5 },
                  { itemId: "spirit_herb", count: 10 },
                  { itemId: "crystal_fragment", count: 3 }
              ],
              result: {
                  itemId: "golden_core_pill",
                  count: 1
              },
              spiritStonesCost: 30
          },
          {
              id: "recipe_nascent_soul_pill",
              name: "元婴丹",
              type: "alchemy",
              description: "孕育元婴的绝世丹药，是突破金丹期的无上至宝。",
              icon: "💎",
              materials: [
                  { itemId: "monster_core", count: 10 },
                  { itemId: "spirit_wood", count: 5 },
                  { itemId: "crystal_fragment", count: 5 }
              ],
              result: {
                  itemId: "nascent_soul_pill",
                  count: 1
              },
              spiritStonesCost: 50
          },
          {
              id: "recipe_deity_pill",
              name: "化神丹",
              type: "alchemy",
              description: "逆天改命的终极丹药，传说中能助修仙者踏入化神之境。",
              icon: "💎",
              materials: [
                  { itemId: "monster_core", count: 20 },
                  { itemId: "spirit_wood", count: 10 },
                  { itemId: "crystal_fragment", count: 10 },
                  { itemId: "iron_essence", count: 10 }
              ],
              result: {
                  itemId: "deity_pill",
                  count: 1
              },
              spiritStonesCost: 100
          }
      ];

      // 注册配方
      allRecipes.forEach(recipe => {
          this.byId[recipe.id] = recipe;
          this.byType[recipe.type].push(recipe);
      });

      console.log(`配方系统初始化完成：${allRecipes.length} 个配方`);
  },

  // 获取配方
  get: function(recipeId) {
      return this.byId[recipeId] || null;
  },

  // 获取指定类型的所有配方
  getByType: function(type) {
      return this.byType[type] || [];
  }
};

// 自动初始化
Game.Recipes.init();

