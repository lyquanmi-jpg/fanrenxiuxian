// ==========================
// 商店系统
// ==========================

Game.Shop = {
    // 商店配置
    shops: {
        "ch1_convenience_store": {
            id: "ch1_convenience_store",
            name: "出租屋楼下便利店",
            items: [
                { itemId: "basic_pill_hp", price: 30 },
                { itemId: "basic_pill_mp", price: 30 },
                { itemId: "instant_noodles", price: 15 }
            ]
        },
        // 隐藏版便利店（解锁后可用）
        "convenience_store_unlocked": {
            id: "convenience_store_unlocked",
            name: "出租屋楼下便利店",
            items: [
                // 凡人商品
                { itemId: "basic_pill_hp", price: 30 },
                { itemId: "basic_pill_mp", price: 30 },
                { itemId: "instant_noodles", price: 15 },
                // 修仙商品（隐藏货架）
                { itemId: "qi_gathering_pill", price: 5, currency: "spiritStones" },
                { itemId: "beginner_sword", price: 15, currency: "spiritStones" },
                { itemId: "formation_material", price: 8, currency: "spiritStones" },
                { itemId: "monster_core", price: 3, currency: "spiritStones" },  // 妖丹，3灵石（测试用）
                { itemId: "spell_book_rejuvenation", price: 200, currency: "money" },  // 《回春术》，200元
                { itemId: "spell_book_iron_body", price: 10, currency: "spiritStones" }  // 《金刚护体》，10灵石
            ]
        },
        "ch1_night_stall": {
            id: "ch1_night_stall",
            name: "派对附近的夜宵摊",
            items: [
                { itemId: "basic_pill_hp", price: 35 },
                { itemId: "instant_noodles", price: 18 }
            ]
        },
        "wuyi_plaza": {
            id: "wuyi_plaza",
            name: "八一广场奶茶店",
            items: ["coffee", "milk_tea", "red_potion"]
        },
        "honggutan_bar": {
            id: "honggutan_bar",
            name: "红谷滩清吧",
            items: ["red_potion", "blue_potion", "pork_rib_rice"]
        },
        "spirit_market": {
            id: "spirit_market",
            name: "灵器市场",
            items: ["basic_sword", "basic_armor", "talisman", "phone_case", "earphone"]
        },
        "cultivator_shop": {
            id: "cultivator_shop",
            name: "修仙者坊市",
            items: [
                { itemId: "qi_gathering_pill", price: 5, currency: "spiritStones" },
                { itemId: "beginner_sword", price: 15, currency: "spiritStones" },
                { itemId: "formation_material", price: 8, currency: "spiritStones" },
                { itemId: "spirit_restoration_pill", price: 12, currency: "spiritStones" }
            ]
        }
    },

    // 打开商店（使用新的 UI 系统）
    open: function(shopId, onClose) {
        // 特殊处理：便利店根据解锁状态选择商品列表
        let actualShopId = shopId;
        if (shopId === "ch1_convenience_store") {
            // 检查是否解锁了隐藏渠道
            if (Game.State.flags && Game.State.flags.convenienceStoreUnlocked) {
                actualShopId = "convenience_store_unlocked";
            }
        }
        
        const shop = this.shops[actualShopId];
        if (!shop) {
            console.error(`商店 ${actualShopId} 不存在`);
            return;
        }

        // 转换商店数据格式
        const shopConfig = {
            id: shop.id,
            name: shop.name,
            items: shop.items.map(shopItem => {
                // 支持两种格式：字符串 itemId 或对象 { itemId, price }
                if (typeof shopItem === "string") {
                    const item = Game.Items.byId[shopItem];
                    return {
                        itemId: shopItem,
                        price: item ? item.price : 0
                    };
                } else {
                    return shopItem;
                }
            })
        };

        Game.UI.showShopView(shopConfig, null, onClose);
    },

    // 购买物品
    buy: function(itemId, customPrice, currency) {
        const item = Game.Items.byId[itemId];
        if (!item) {
            console.error(`物品 ${itemId} 不存在`);
            return false;
        }

        const price = customPrice !== undefined ? customPrice : item.price;
        // 确定使用的货币类型：优先使用传入的 currency，其次使用物品配置的 currency，最后默认使用 money
        const useCurrency = currency || item.currency || "money";
        
        // 检查货币是否充足
        if (useCurrency === "spiritStones") {
            if ((Game.State.player.spiritStones || 0) < price) {
                console.log("灵石不足");
                return false;
            }
            Game.State.player.spiritStones = (Game.State.player.spiritStones || 0) - price;
            console.log(`使用 ${price} 灵石购买了：${item.name}`);
        } else {
            if ((Game.State.player.money || 0) < price) {
                console.log("人民币不足");
                return false;
            }
            Game.State.player.money = (Game.State.player.money || 0) - price;
            console.log(`使用 ¥${price} 购买了：${item.name}`);
        }

        Game.State.addItem(itemId, 1);

        // 刷新UI
        Game.UI.renderPlayerStatus(Game.State);
        Game.UI.refreshShopView();
        
        // 自动存档（购买物品后）
        Game.Save.save();

        return true;
    }
};