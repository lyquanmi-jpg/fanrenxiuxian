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
        }
    },

    // 打开商店（使用新的 UI 系统）
    open: function(shopId, onClose) {
        const shop = this.shops[shopId];
        if (!shop) {
            console.error(`商店 ${shopId} 不存在`);
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
    buy: function(itemId, customPrice) {
        const item = Game.Items.byId[itemId];
        if (!item) {
            console.error(`物品 ${itemId} 不存在`);
            return false;
        }

        const price = customPrice !== undefined ? customPrice : item.price;
        // Todo: 根据物品类型判断使用 money 还是 spiritStones
        // 目前默认使用 money（人民币）
        if ((Game.State.player.money || 0) < price) {
            console.log("人民币不足");
            return false;
        }

        Game.State.player.money = (Game.State.player.money || 0) - price;
        Game.State.addItem(itemId, 1);
        console.log(`购买了：${item.name}`);

        // 刷新UI
        Game.UI.renderPlayerStatus(Game.State);
        Game.UI.refreshShopView();
        
        // 自动存档（购买物品后）
        Game.Save.save();

        return true;
    }
};