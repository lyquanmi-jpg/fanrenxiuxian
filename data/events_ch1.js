// ==========================
// 第一章事件数据（重写版）
// 《灯火初醒》
// ==========================

Game.Events_ch1 = [
    // ===== 1. 到达南昌：火车站 + 第一次消息 =====
    {
      id: "ch1_intro_1",
      type: "story",
      speaker: "旁白",
      text:
        "南昌站的自动门缓缓合上，阴冷的雨气从门缝里灌进来。\n\n" +
        "你拖着行李箱走出车站，大雨把站前广场的霓虹灯拧成一片晕开的色块。\n\n" +
        "手机震了一下，是一个备注为【红姐】的微信弹出：\n" +
        "「到了没？今晚有局，我带你认认南昌这帮奇怪的人。」",
      options: [
        {
          text: "先按导航去出租屋，安顿一下再说",
          next: "ch1_rental_1",
          effects: { exp: 5 }
        },
        {
          text: "在车站广场晃一圈，感受一下这座城市",
          next: "ch1_station_walk_1",
          effects: { exp: 5 }
        }
      ]
    },
  
    // ===== 1.1 车站小探索：简单拉时长 + 给点钱/药 =====
    {
      id: "ch1_station_walk_1",
      type: "story",
      speaker: "旁白",
      text:
        "你没有立刻走，而是拐到广场一侧的遮雨棚下。\n\n" +
        "外地口音、行李箱、外卖员的电动车、迟来的出租车喇叭声……" +
        "这座城市看起来和很多地方都差不多，又好像哪里有一点不一样。\n\n" +
        "你顺手在便利摊买了一瓶饮料，盯着雨帘发呆了一会儿，" +
        "脑子里闪过一句话：——如果一切只剩下上班和房租，那我来这里干嘛？",
      options: [
        {
          text: "摇摇头，还是先去出租屋吧",
          next: "ch1_rental_1",
          effects: { money: -5, hp: 5 }
        },
        {
          text: "给红姐回个消息：先别急，等我安顿好",
          next: "ch1_rental_1",
          effects: { exp: 5 }
        }
      ]
    },
  
    // ===== 2. 出租屋：现实落差 + 第一次灵力暗示 =====
    {
      id: "ch1_rental_1",
      type: "story",
      speaker: "旁白",
      text:
        "出租屋在一条有点旧的小巷尽头。\n\n" +
        "实景比照片暗了一整度，房间的墙角略微发潮，窗外是偶尔驶过的车灯。\n\n" +
        "你把行李箱放到墙边，整个人坐到床上，弹簧发出一点没睡醒的吱呀声。\n\n" +
        "安静下来之后，你突然觉得胸口有点发热，像是熬夜太多留下的心悸，又像是……什么在轻轻敲门。",
      options: [
        {
          text: "闭上眼睛，认真感受一下这股异样的感觉",
          next: "ch1_awaken_hint_1",
          effects: { exp: 10, mp: 5 }
        },
        {
          text: "在房间里翻找一下，看看有没有能用的东西",
          next: "ch1_rental_find_item",
          effects: { exp: 5 }
        },
        {
          text: "算了，当自己是太累了，下楼去便利店",
          next: "ch1_convenience_store_visit",
          effects: { hp: 5 }
        },
        {
          text: "躺一会儿刷手机，再考虑要不要去找红姐",
          next: "ch1_rental_scroll_1",
          effects: { mp: 5 }
        }
      ]
    },
    {
      id: "ch1_rental_find_item",
      type: "story",
      speaker: "旁白",
      text:
        "你在房间里翻找起来。\n\n" +
        "抽屉里有一些前任租客留下的杂物：几根数据线、一个旧手机壳、还有一把看起来有点锈的水果刀。\n\n" +
        "你拿起那把水果刀，突然感觉它似乎和体内的那股力量产生了某种共鸣。\n\n" +
        "虽然看起来很普通，但你觉得它可能有点用。",
      options: [
        {
          text: "收下这把水果刀",
          next: "ch1_rental_1",
          effects: { item: { id: "starter_sword", count: 1 }, exp: 10 }
        },
        {
          text: "算了，还是感受一下体内的力量",
          next: "ch1_awaken_hint_1",
          effects: { exp: 10, mp: 5 }
        }
      ],
      // 动态修改选项文本（如果已有装备）
      dynamicOptions: function() {
          const hasSword = Game.State.getItemCount("starter_sword") > 0;
          
          if (hasSword) {
              // 如果已有水果刀，修改第一个选项的文本
              return [
                  {
                      text: "你已经有了这把水果刀",
                      next: "ch1_rental_1",
                      effects: { exp: 5 },
                      disabled: true
                  },
                  {
                      text: "算了，还是感受一下体内的力量",
                      next: "ch1_awaken_hint_1",
                      effects: { exp: 10, mp: 5 }
                  }
              ];
          }
          return null; // 使用默认选项
      }
    },
  
    {
      id: "ch1_rental_scroll_1",
      type: "story",
      speaker: "旁白",
      text:
        "你刷着短视频，算法迅速给你推送了“南昌美食一日游”“打工人的租房血泪史”。\n\n" +
        "每个视频都很吵，但合上声音之后，你只剩下自己心跳的回音。\n\n" +
        "胸口那股发热的感觉不但没退，反而更清晰了一点。",
      options: [
        {
          text: "不对劲，再次集中注意力，试着感受那股力量",
          next: "ch1_awaken_hint_1",
          effects: { exp: 10 }
        },
        {
          text: "还是先出去转转，活动一下",
          next: "ch1_street_explore",
          effects: { exp: 5 }
        },
        {
          text: "去附近的废弃工厂看看（可以练级）",
          next: "ch1_training_area_hub"
        }
      ]
    },
  
    // ===== 2.1 觉醒暗示：但先不直接开挂 =====
    {
      id: "ch1_awaken_hint_1",
      type: "story",
      speaker: "旁白",
      text:
        "你关掉手机，把注意力慢慢收回来。\n\n" +
        "那股发热感像有了形状，从心口一点一点流向四肢，又顺着背脊往上，" +
        "在脑后停了一下，像有人按了一下开关。\n\n" +
        "你突然听见窗外雨声变得很清楚，连楼下巷子里说话的声音都隐约可辨。\n\n" +
        "——这不是单纯的疲劳。\n" +
        "有某种东西，在这座陌生城市里悄悄回应了你。",
      options: [
        {
          text: "继续顺着这股感觉引导下去",
          next: "ch1_awaken_hint_2",
          effects: { exp: 15, mp: 10 }
        },
        {
          text: "有点怕，还是先出去走走，看点正常东西",
          next: "ch1_street_explore",
          effects: { hp: 5 }
        }
      ]
    },
  
    {
      id: "ch1_awaken_hint_2",
      type: "story",
      speaker: "旁白",
      text:
        "你尝试在心里描出那股力量的流向。\n\n" +
        "它并不听话，却也没有抗拒，只是被你轻轻碰到就往四周散开，" +
        "像是这间破旧出租屋里，突然多了一盏你看不见的灯。\n\n" +
        "你睁开眼，世界没什么区别，但你知道——有什么已经不一样了。",
      options: [
        {
          text: "记下这种感觉，改天问问红姐",
          next: "ch1_rental_to_evening",
          effects: { exp: 10 }
        },
        {
          text: "趁天还没黑，下楼看看周围的街区",
          next: "ch1_street_explore",
          effects: { exp: 5 }
        }
      ]
    },
  
    {
      id: "ch1_rental_to_evening",
      type: "story",
      speaker: "旁白",
      text:
        "时间在你反复琢磨这股力量中慢慢过去。\n\n" +
        "窗外的雨声由密转疏，天色从灰白熬成深蓝，城市开始亮起一盏一盏灯。\n\n" +
        "手机再次震动，是红姐发来的新消息：\n" +
        "「差不多了吧？晚上八点，老地方见。」",
      options: [
        {
          text: "整理一下自己，准备去找红姐",
          next: "ch1_party_1",
          effects: { exp: 5 }
        },
        {
          text: "先下楼去便利店补点东西",
          next: "ch1_convenience_store_visit"
        }
      ]
    },
  
    // ===== 3. 楼下便利店 + 商店入口 =====
    {
      id: "ch1_convenience_store_visit",
      type: "shop",
      shopId: "ch1_convenience_store",
      speaker: "旁白",
      text:
        "你打着伞走到楼下的便利店。\n\n" +
        "昏黄的灯光把货架照得暖洋洋的，老板一边看着电视剧，一边抬头问你：\n" +
        "「刚搬来的吧？要点什么？」\n\n" +
        "你扫了一眼货架，发现除了常见的止痛药和泡面，老板还悄悄从柜台下面拿出一枚包着黄符的灵石，意味深长地看了你一眼。\n\n" +
        "「这个……一般人用不上，但你应该知道是什么。」\n\n" +
        "这里可以买到一些简单的丹药和恢复用品，为接下来的夜晚做准备。",
      next: "ch1_after_convenience"
    },
  
    {
      id: "ch1_after_convenience",
      type: "story",
      speaker: "旁白",
      text:
        "你拎着塑料袋回到巷口，雨小了很多，路边水坑里倒映出一片片灯光。\n\n" +
        "你突然有点期待今晚会发生什么——不是公司群里的那种“临时开会”，而是……真正属于你的新剧情。",
      options: [
        {
          text: "回出租屋整理一下，再去赴约",
          next: "ch1_rental_to_evening",
          effects: { hp: 5 }
        },
        {
          text: "直接出发去找红姐",
          next: "ch1_party_1",
          effects: { exp: 5 }
        }
      ]
    },
  
    // ===== 4. 街区探索 + 小怪战斗 =====
    {
      id: "ch1_street_explore",
      type: "story",
      speaker: "旁白",
      text:
        "你沿着巷子走到主干道。\n\n" +
        "公交站牌下有人打着伞刷手机，电动车从你身边疾驰而过，" +
        "远处高楼的灯光像一整面发光的墙。\n\n" +
        "你忽然觉得，这座城市表面上很普通，但空气里混着一种说不清的躁动——" +
        "那股在你体内游走的东西，似乎也在外面找着什么共鸣。",
      options: [
        {
          text: "往人少的街角走走（可能有点危险）",
          next: "ch1_street_random_hub"
        },
        {
          text: "先记地图，等会儿从这边去找红姐",
          next: "ch1_rental_to_evening",
          effects: { exp: 5 }
        }
      ]
    },
  
    {
      id: "ch1_training_area_hub",
      type: "story",
      speaker: "旁白",
      text:
        "你走到附近一个废弃的工厂区。\n\n" +
        "这里已经很久没人来了，但空气中似乎还残留着某种能量波动。\n\n" +
        "你感觉到这里是个不错的练级地点，可以反复挑战阴影来提升实力。",
      options: [
        {
          text: "进入工厂深处，寻找阴影战斗",
          next: "ch1_training_battle"
        },
        {
          text: "在工厂外围探索，看看有没有遗漏的物品",
          next: "ch1_training_find_item"
        },
        {
          text: "离开这里，去其他地方",
          next: "ch1_street_explore"
        }
      ]
    },
    {
      id: "ch1_training_battle",
      type: "battle",
      speaker: "旁白",
      text:
        "你深入工厂，很快就有阴影从暗处浮现。\n\n" +
        "这些阴影似乎比街上的更强一些，但击败它们能获得不错的经验和金币。",
      enemyId: "subway_shadow",
      options: [
        {
          text: "战斗！",
          next: "ch1_training_after_battle"
        }
      ]
    },
    {
      id: "ch1_training_after_battle",
      type: "story",
      speaker: "旁白",
      text:
        "你击败了阴影，感觉体内的灵力更加活跃了。\n\n" +
        "这里似乎是个不错的练级地点，可以反复挑战来提升等级和获取金币。",
      options: [
        {
          text: "继续在这里练级（可重复）",
          next: "ch1_training_battle",
          effects: { exp: 5 }
        },
        {
          text: "在工厂里探索，寻找物品",
          next: "ch1_training_find_item"
        },
        {
          text: "离开工厂，去其他地方",
          next: "ch1_training_area_hub"
        },
        {
          text: "回出租屋休整",
          next: "ch1_rental_night_cultivate"
        }
      ]
    },
    {
      id: "ch1_training_find_item",
      type: "story",
      speaker: "旁白",
      text:
        "你在工厂外围仔细搜索，在一个废弃的储物柜里发现了一些东西。\n\n" +
        "虽然都是些旧物，但其中一件似乎还能用。",
      options: [
        {
          text: "找到一件旧外套，虽然破但还能穿",
          next: "ch1_training_area_hub",
          effects: { item: { id: "cheap_armor", count: 1 }, exp: 10 }
        },
        {
          text: "找到一个简单的护身符，似乎有点特殊",
          next: "ch1_training_area_hub",
          effects: { item: { id: "talisman", count: 1 }, exp: 10 }
        },
        {
          text: "只找到一些废料，卖了换点钱",
          next: "ch1_training_area_hub",
          effects: { gold: 10, exp: 5 }
        }
      ],
      // 动态修改选项文本（如果已有装备）
      dynamicOptions: function() {
          const hasArmor = Game.State.getItemCount("cheap_armor") > 0;
          const hasTalisman = Game.State.getItemCount("talisman") > 0;
          
          if (hasArmor || hasTalisman) {
              // 如果已有装备，修改对应选项的文本
              const newOptions = [];
              
              if (hasArmor) {
                  newOptions.push({
                      text: "你已经有了这件旧外套",
                      next: "ch1_training_area_hub",
                      effects: { exp: 5 },
                      disabled: true
                  });
              } else {
                  newOptions.push({
                      text: "找到一件旧外套，虽然破但还能穿",
                      next: "ch1_training_area_hub",
                      effects: { item: { id: "cheap_armor", count: 1 }, exp: 10 }
                  });
              }
              
              if (hasTalisman) {
                  newOptions.push({
                      text: "你已经有了这个护身符",
                      next: "ch1_training_area_hub",
                      effects: { exp: 5 },
                      disabled: true
                  });
              } else {
                  newOptions.push({
                      text: "找到一个简单的护身符，似乎有点特殊",
                      next: "ch1_training_area_hub",
                      effects: { item: { id: "talisman", count: 1 }, exp: 10 }
                  });
              }
              
              newOptions.push({
                  text: "只找到一些废料，卖了换点钱",
                  next: "ch1_training_area_hub",
                  effects: { gold: 10, exp: 5 }
              });
              
              return newOptions;
          }
          return null; // 使用默认选项
      }
    },
    {
      id: "ch1_street_random_hub",
      type: "story",
      speaker: "旁白",
      text:
        "你沿着人少的路往前走，路灯把你的影子拉得很长。\n\n" +
        "前面分成了三条小路：一条通向老旧居民楼，一条通向天桥，一条往河边走去。\n\n" +
        "直觉告诉你，每条路的故事都不太一样。",
      options: [
        { text: "去老旧居民楼后面的小巷看看", next: "ch1_event_unlucky_fall" },
        { text: "上天桥晃一圈，吹吹风", next: "ch1_event_lucky_money" },
        { text: "往河边走走，看看夜景", next: "ch1_event_riverside_hint" },
        { text: "注意到街边有个算命摊，过去看看", next: "ch1_event_fortune_teller" },
        { text: "去附近的废弃工厂练级", next: "ch1_training_area_hub" },
        { text: "在附近的小巷里探索", next: "ch1_explore_random" }
      ]
    },
    // ===== 随机探索事件（好运/霉运） =====
    {
      id: "ch1_explore_random",
      type: "story",
      speaker: "旁白",
      text:
        "你拐进一条不起眼的小巷，想看看能不能发现什么。\n\n" +
        "这里比主街安静得多，只有偶尔传来的脚步声和远处车辆的鸣笛。",
      options: [
        { text: "继续探索", next: "ch1_explore_random_result" }
      ]
    },
    {
      id: "ch1_explore_random_result",
      type: "story",
      speaker: "旁白",
      text: "",
      options: [],
      // 动态生成随机结果
      dynamicText: function() {
          // 随机选择好运或霉运事件
          const random = Math.random();
          if (random < 0.5) {
              // 好运事件（50%概率）
              const luckyEvents = [
                  "ch1_event_lucky_talisman_water",
                  "ch1_event_lucky_spirit_stone",
                  "ch1_event_lucky_old_man"
              ];
              const selectedEvent = luckyEvents[Math.floor(Math.random() * luckyEvents.length)];
              return selectedEvent;
          } else {
              // 霉运事件（50%概率）
              const unluckyEvents = [
                  "ch1_event_unlucky_electric",
                  "ch1_event_unlucky_ball",
                  "ch1_event_unlucky_rat"
              ];
              const selectedEvent = unluckyEvents[Math.floor(Math.random() * unluckyEvents.length)];
              return selectedEvent;
          }
      }
    },
    // 好运事件1：捡到瓶装符水
    {
      id: "ch1_event_lucky_talisman_water",
      type: "story",
      speaker: "旁白",
      text:
        "你在巷子角落里发现了一个小瓶子，里面装着淡蓝色的液体。\n\n" +
        "瓶身上贴着张黄纸符，虽然已经有些褪色，但依然能感受到微弱的灵力波动。\n\n" +
        "看起来是某个散修留下的符水，虽然不是什么珍贵的东西，但对你来说也算是个小收获。",
      options: [
        {
          text: "收下这瓶符水",
          next: "ch1_street_random_hub",
          effects: { item: { id: "bottled_talisman_water", count: 1 }, exp: 5 }
        }
      ]
    },
    // 好运事件2：捡到破碎灵石碎片
    {
      id: "ch1_event_lucky_spirit_stone",
      type: "story",
      speaker: "旁白",
      text:
        "你在一堆废弃的杂物中发现了一块发着微光的碎片。\n\n" +
        "拿起来仔细一看，是一块破碎的灵石碎片，虽然已经残破不堪，但依然能感受到其中蕴含的微弱灵力。\n\n" +
        "你试着将它贴近胸口，感觉体内的灵力似乎活跃了一些。\n\n" +
        "虽然效果微弱，但装备后应该能缓慢恢复灵力。",
      options: [
        {
          text: "收下这块灵石碎片",
          next: "ch1_street_random_hub",
          effects: { item: { id: "broken_spirit_stone", count: 1 }, exp: 8 }
        }
      ],
      // 防止重复获得
      dynamicOptions: function() {
          const hasStone = Game.State.getItemCount("broken_spirit_stone") > 0;
          if (hasStone) {
              return [
                  {
                      text: "你已经有了这块灵石碎片",
                      next: "ch1_street_random_hub",
                      effects: { exp: 3 },
                      disabled: true
                  }
              ];
          }
          return null;
      }
    },
    // 好运事件3：遇到散修遛狗大爷
    {
      id: "ch1_event_lucky_old_man",
      type: "story",
      speaker: "旁白",
      text:
        "你走到巷口，看到一个老大爷正在遛狗。\n\n" +
        "那只狗看起来普通，但老大爷身上却散发着一种说不出的气息——" +
        "不是灵力，更像是……某种沉淀了很久的修行者的感觉。\n\n" +
        "他注意到你在看他，笑了笑，从口袋里掏出一张黄纸符：\n" +
        "「小伙子，看你身上有点灵气，这个给你。虽然不是什么好东西，但关键时刻能挡一次灾。」\n\n" +
        "你接过符纸，感觉上面确实有微弱的灵力波动。",
      options: [
        {
          text: "道谢后收下护身符",
          next: "ch1_street_random_hub",
          effects: { item: { id: "one_time_protection_talisman", count: 1 }, exp: 10 }
        }
      ],
      // 防止重复获得
      dynamicOptions: function() {
          const hasTalisman = Game.State.getItemCount("one_time_protection_talisman") > 0;
          const hasProtection = Game.State.hasOneTimeProtection;
          if (hasTalisman || hasProtection) {
              return [
                  {
                      text: "大爷摆摆手：\"你已经有了，好好用吧。\"",
                      next: "ch1_street_random_hub",
                      effects: { exp: 5 },
                      disabled: true
                  }
              ];
          }
          return null;
      }
    },
    // 霉运事件1：被路灯漏电电了一下
    {
      id: "ch1_event_unlucky_electric",
      type: "story",
      speaker: "旁白",
      text:
        "你路过一根路灯杆时，突然感觉手上一阵刺痛。\n\n" +
        "「嘶——」你赶紧缩回手，发现路灯杆上有轻微的漏电。\n\n" +
        "虽然只是轻微的电流，但奇怪的是，你感觉体内的灵力似乎被这股电流激活了，" +
        "反而变得活跃了一些。\n\n" +
        "看来修仙体质对电确实比较敏感……虽然被电了一下，但灵力反而增加了。",
      options: [
        {
          text: "揉揉手，继续往前走",
          next: "ch1_street_random_hub",
          effects: { hp: -10, mp: 5, exp: 5 }
        }
      ]
    },
    // 霉运事件2：被小孩踢球撞了
    {
      id: "ch1_event_unlucky_ball",
      type: "story",
      speaker: "旁白",
      text:
        "你正走着，突然听到一声「小心！」\n\n" +
        "还没反应过来，一个足球就砸到了你身上，紧接着一个小孩冲过来捡球，" +
        "不小心撞到了你。\n\n" +
        "「对不起对不起！」小孩捡起球就跑，你摸了摸被撞的地方，" +
        "发现口袋里的零钱掉了几块。\n\n" +
        "虽然没什么大碍，但确实有点倒霉。",
      options: [
        {
          text: "捡起掉落的零钱，继续往前走",
          next: "ch1_street_random_hub",
          effects: { gold: -15, exp: 3 }
        }
      ]
    },
    // 霉运事件3：被老鼠吓到
    {
      id: "ch1_event_unlucky_rat",
      type: "story",
      speaker: "旁白",
      text:
        "你走到一个垃圾桶旁边，突然从里面窜出一只大老鼠。\n\n" +
        "虽然你已经是修仙者了，但突然出现的黑影还是让你吓了一跳，" +
        "整个人往后退了一步。\n\n" +
        "老鼠很快跑掉了，但你心里却有种说不出的挫败感——" +
        "堂堂修仙者，居然被一只老鼠吓到了。\n\n" +
        "这种失败感可能会影响你接下来的战斗心态。",
      options: [
        {
          text: "摇摇头，继续往前走",
          next: "ch1_street_random_hub",
          effects: { failureCount: 1, exp: 2 }
        }
      ]
    },
    {
      id: "ch1_event_unlucky_fall",
      type: "story",
      speaker: "旁白",
      text:
        "小巷的台阶被雨水打得很滑，你一脚踩空，整个人差点狗吃屎地摔下去。\n\n" +
        "好在你及时抓住了扶手，还是磕掉了一点皮，口袋里的零钱也撒了一地。\n\n" +
        "你一边捡钱，一边暗暗发誓以后修炼到某个境界，一定要给这里铺符文防滑砖。",
      options: [
        {
          text: "拍拍身上的灰，继续往前走",
          next: "ch1_street_battle_intro",
          effects: { hp: -15, gold: -10, exp: 5 }
        },
        {
          text: "觉得今天运气不太行，还是先回出租屋",
          next: "ch1_rental_night_cultivate",
          effects: { hp: -10, gold: -5 }
        }
      ]
    },
    {
      id: "ch1_event_lucky_money",
      type: "story",
      speaker: "旁白",
      text:
        "天桥上风很大，你靠在栏杆上看车流，突然有人从你身边匆匆跑过，" +
        "裤兜里掉出一个红色小信封，居然没人发现。\n\n" +
        "你捡起来，里面只有几张零钱和一张写着\"愿新生活顺利\"的小纸条。\n\n" +
        "你犹豫了一下，还是把信封收好——毕竟，新生活确实需要一点好运。",
      options: [
        {
          text: "把钱收下，顺便感谢这份来路不明的祝福",
          next: "ch1_street_battle_intro",
          effects: { gold: 30, exp: 10 }
        }
      ]
    },
    {
      id: "ch1_event_riverside_hint",
      type: "story",
      speaker: "旁白",
      text:
        "河边的风比街上冷一些，水面上漂着零散的灯光倒影。\n\n" +
        "你靠在栏杆上站了一会儿，发现胸口那团灵力在这里更安静，也更清晰。\n\n" +
        "你隐约感觉到：这座城市的水系里藏着某种古老的东西，只是现在还够不到。",
      options: [
        {
          text: "记下这种感觉，哪天来这里专门修炼一次",
          next: "ch1_street_battle_intro",
          effects: { exp: 10, mp: 5 }
        }
      ]
    },
    {
      id: "ch1_event_fortune_teller",
      type: "story",
      speaker: "旁白",
      text:
        "街角摆着一个简陋的算命摊，一个看起来五十多岁的男人坐在小马扎上，" +
        "面前摆着几本旧书和一张手写的\"看相算命\"牌子。\n\n" +
        "你走近时，他突然抬起头，眼神里闪过一丝你从未见过的精光。\n\n" +
        "「小伙子，」他压低声音说，「你身上有股气，不一般啊。」\n\n" +
        "你愣了一下，他摆摆手：\n" +
        "「别紧张，我也是散修，在这末法时代混口饭吃。看你刚觉醒，送你一句话：」\n\n" +
        "「修炼要稳，但该拼命的时候也别怂。今晚你可能会遇到点麻烦，」" +
        "他顿了顿，「不过，你命里有贵人。」\n\n" +
        "他看了看你，从书堆里抽出一本破旧的小册子：\n" +
        "「这本《基础灵力弹》是我年轻时偶然得到的，现在也用不上了，送给你吧。" +
        "学会后可以在战斗中使用，消耗灵力造成更高伤害。」",
      options: [
        {
          text: "接受这本功法秘籍",
          next: "ch1_event_fortune_teller_get_book",
          effects: { exp: 15, mp: 10 }
        },
        {
          text: "道谢后离开，心里多了几分底气",
          next: "ch1_street_battle_intro",
          effects: { exp: 15, mp: 10 }
        }
      ],
      // 动态修改选项文本（如果已学会或已有）
      dynamicOptions: function() {
          const hasBook = Game.State.getItemCount("spell_book_qi_blast") > 0;
          const hasSkill = Game.State.hasSkill("qi_blast");
          
          if (hasSkill || hasBook) {
              // 如果已学会或已有，修改第一个选项的文本
              return [
                  {
                      text: hasSkill ? "你已经学会了这个技能" : "你已经有这本技能书了",
                      next: "ch1_street_battle_intro",
                      effects: { exp: 15, mp: 10 },
                      disabled: true
                  },
                  {
                      text: "道谢后离开，心里多了几分底气",
                      next: "ch1_street_battle_intro",
                      effects: { exp: 15, mp: 10 }
                  }
              ];
          }
          return null; // 使用默认选项
      }
    },
    {
      id: "ch1_event_fortune_teller_get_book",
      type: "story",
      speaker: "旁白",
      text:
        "你接过那本破旧的小册子，封面上用毛笔写着《基础灵力弹》几个字。\n\n" +
        "「记住，」算命先生说，「法术不是越多越好，把一门练精了，比学十门半吊子强。」\n\n" +
        "你点点头，把书收好。\n\n" +
        "（提示：你可以在背包中使用这本技能书来学习技能，学会后可以在战斗中使用。）",
      options: [
        {
          text: "道谢后离开",
          next: "ch1_street_battle_intro",
          effects: { item: { id: "spell_book_qi_blast", count: 1 }, exp: 10 }
        }
      ]
    },
    {
      id: "ch1_street_battle_intro",
      type: "story",
      speaker: "旁白",
      text:
        "走到一个路灯有点坏的小路口时，你打了个冷战。\n\n" +
        "明明雨声还在，街道却突然安静了一瞬。\n\n" +
        "你看到路灯下的影子似乎比行人本身更慢一拍，" +
        "有一个黑影从地面上悄悄抬起头，对着你扭曲出一个笑。",
      options: [
        {
          text: "这不对劲……准备战斗！",
          next: "ch1_street_battle"
        },
        {
          text: "当自己眼花了，快速离开这里",
          next: "ch1_rental_to_evening",
          effects: { hp: -5, exp: 5 }
        }
      ]
    },
  
    {
      id: "ch1_street_battle",
      type: "battle",
      speaker: "旁白",
      text:
        "阴影从地面上撕裂开来，像是所有加班人的负面情绪揉到了一起。\n\n" +
        "【地铁加班阴影】向你扑来！",
      enemyId: "subway_shadow",
      options: [
        {
          text: "战斗！",
          next: "ch1_after_street_battle"
        }
      ]
    },
  
    {
      id: "ch1_after_street_battle",
      type: "story",
      speaker: "旁白",
      text:
        "你几乎是凭本能挥出那一下，体内那股力量在关键时刻帮了你一把。\n\n" +
        "阴影被斩开之后像雾一样散掉，只留下路灯下正常的地面和一点冷汗。\n\n" +
        "你喘了几口气，发现自己并没有那么害怕，反而有种奇怪的兴奋——" +
        "原来“无趣生活”之外，真有别的东西存在。",
      options: [
        {
          text: "记下这次战斗，回去好好整理一下状态",
          next: "ch1_rental_night_cultivate",
          effects: { exp: 20, gold: 25 }
        },
        {
          text: "去废弃工厂继续练级，提升实力",
          next: "ch1_training_area_hub",
          effects: { exp: 5 }
        },
        {
          text: "既然都这样了，今晚更要去见见红姐",
          next: "ch1_party_1",
          effects: { exp: 10, gold: 20 }
        }
      ]
    },
  
    // ===== 5. 修炼提示入口 =====
    {
      id: "ch1_rental_night_cultivate",
      type: "story",
      speaker: "旁白",
      text:
        "回到出租屋，你把湿衣服挂在椅背上，整个人慢慢冷静下来。\n\n" +
        "那场和阴影的战斗像梦一样，你却能清楚记得每一个动作背后灵力流动的轨迹。\n\n" +
        "你试着盘腿坐好，照着网文里写的那样调整呼吸。\n" +
        "意外的是——那股力量真的会回应你。\n\n" +
        "（提示：你可以通过菜单进行修炼，或者去废弃工厂练级提升实力）",
      options: [
        {
          text: "继续打坐修炼一会儿",
          next: "ch1_cultivate_intro",
          effects: { exp: 10, mp: 10 }
        },
        {
          text: "去废弃工厂练级，提升实力",
          next: "ch1_training_area_hub"
        },
        {
          text: "先整理一下背包和装备",
          next: "ch1_menu_hint"
        },
        {
          text: "时间差不多了，去赴红姐的约",
          next: "ch1_party_1"
        }
      ]
    },
  
    {
      id: "ch1_cultivate_intro",
      type: "story",
      speaker: "旁白",
      text:
        "你闭上眼，呼吸变得平稳，灵力在身体里绕了一圈又一圈。\n\n" +
        "它似乎还很稚嫩，但已经不再是完全不可控的陌生存在。\n\n" +
        "你隐约意识到，这可能就是所谓的【灵根】在苏醒。\n\n" +
        "（提示：你可以随时通过【菜单】中的「修炼」标签来进行修炼，缓慢提升自身实力。）",
      options: [
        {
          text: "记住这个感觉，停止修炼",
          next: "ch1_menu_hint",
          effects: { exp: 10 }
        }
      ]
    },
  
    {
      id: "ch1_menu_hint",
      type: "story",
      speaker: "旁白",
      text:
        "你起身活动了一下筋骨，顺手翻了翻背包，把刚买的东西和随身物品整理好。\n\n" +
        "你突然意识到：\n" +
        "——在这个充满未知的城市里，你需要时刻掌握自己的状态。\n\n" +
        "你拿起手机，界面上仿佛多了一层你以前注意不到的『面板』：\n" +
        "境界、等级、气血、灵力、装备、丹药、修炼……一目了然。\n\n" +
        "（提示：点击右上角的「菜单」按钮，可以打开玩家菜单，查看状态、背包、装备与修炼。）",
      options: [
        {
          text: "关闭界面，准备去见红姐",
          next: "ch1_party_1"
        },
        {
          text: "再在附近街区走一圈，熟悉环境",
          next: "ch1_street_explore"
        }
      ]
    },
  
    // ===== 6. 酒吧初见红姐 =====
    {
      id: "ch1_party_1",
      type: "story",
      speaker: "旁白",
      text:
        "晚上八点，你按着导航来到一家藏在巷子深处的清吧。\n\n" +
        "门口的霓虹灯写着一个有点俗气的名字，但从门缝里透出的光和音乐，" +
        "让你隐约觉得这里比照片上看起来有趣得多。",
      options: [
        {
          text: "推门进去，寻找红姐的身影",
          next: "ch1_party_2",
          effects: { exp: 5 }
        }
      ]
    },
  
    {
      id: "ch1_party_2",
      type: "story",
      speaker: "旁白",
      text:
        "你刚推门，音乐一下子涌了出来。\n\n" +
        "人群不算多，却刚好把空间填得刚刚好。\n\n" +
        "灯光在一圈圈打，人群间有笑声、碰杯声，还有一声非常熟悉的：\n" +
        "「这边——！」\n\n" +
        "你顺着声音看过去，一个穿着简洁却极其显眼的女孩朝你挥手，" +
        "笑得像整条吧台的灯都被她点亮——那就是红姐。",
      options: [
        {
          text: "走过去，和红姐打招呼",
          next: "ch1_party_3",
          effects: { exp: 10 }
        }
      ]
    },
  
    {
      id: "ch1_party_3",
      type: "story",
      speaker: "旁白",
      text:
        "「来了啊，新南昌人？」红姐一边把你拉到座位上，一边利落地替你挡掉一杯酒。\n\n" +
        "「这是春夏、小梦、天才哥……」她像主持人一样给每个人做着介绍，" +
        "又像导演一样随手把你塞进这群人的对话里。\n\n" +
        "你很快发现，她总是那个最吵的，却也是那个随时在照顾别人情绪的人。",
      options: [
        {
          text: "顺着她的节奏打招呼，融入这桌人",
          next: "ch1_party_chat_1",
          effects: { exp: 10 }
        },
        {
          text: "一边寒暄，一边默默观察红姐的状态",
          next: "ch1_party_observe_1",
          effects: { exp: 15 }
        }
      ]
    },
  
    {
      id: "ch1_party_chat_1",
      type: "story",
      speaker: "旁白",
      text:
        "在她的牵线下，你很快知道了几个人的大致情况——\n" +
        "谁刚离职，谁又被客户折腾得想出家，谁看起来很酷其实是个社恐。\n\n" +
        "红姐像一台永不宕机的社交服务器，" +
        "在不同话题间来回切换，哪一桌冷场她就往哪一桌跑。\n\n" +
        "你不知不觉也被她的节奏带得放松下来。",
      options: [
        {
          text: "在她忙完一圈后，找机会单独和她说几句",
          next: "ch1_party_talk_private"
        }
      ]
    },
  
    {
      id: "ch1_party_observe_1",
      type: "story",
      speaker: "旁白",
      text:
        "你发现一个细节——\n" +
        "红姐笑起来的时候眼角会先弯，可当她收回笑意时，眼神会空一秒。\n\n" +
        "她给别人倒酒、帮人换歌、帮人挡住无聊的话题，" +
        "像是在这间小小的场子里维持着某种秩序。\n\n" +
        "但每当音乐声稍微低下来，你都能看到她下意识地又把音量调高一点。",
      options: [
        {
          text: "等她忙完一圈，找个角落单独聊聊",
          next: "ch1_party_talk_private",
          effects: { exp: 10 }
        }
      ]
    },
  
    {
      id: "ch1_party_talk_private",
      type: "story",
      speaker: "旁白",
      text:
        "人群稍微散开一点的时候，你和红姐靠在吧台旁边。\n\n" +
        "她给自己倒了半杯酒，给你换成了果汁。\n\n" +
        "「感觉怎么样？」她问。\n\n" +
        "你说出了心里话：\n" +
        "「城市挺亮的，就是……怕自己活成背景灯。」\n\n" +
        "她愣了一下，突然笑了出来：「那我们挺像的。」",
      options: [
        {
          text: "顺着她的话问下去：你也是这样觉得的吗？",
          next: "ch1_party_deep_talk",
          effects: { exp: 15 }
        }
      ]
    },
  
    {
      id: "ch1_party_deep_talk",
      type: "story",
      speaker: "旁白",
      text:
        "「我讨厌无聊的生活。」红姐晃着杯子，看着杯壁上的灯光。\n\n" +
        "「白天大家都当我普通打工人，文件、会议、Excel……" +
        "晚上至少还能让我觉得自己是这条街上最闪的灯。」\n\n" +
        "她笑得有点自嘲，却没有停下来。\n" +
        "「不过——」她顿了顿，目光从杯子移到你身上，" +
        "「灯太亮了，也会被自己照得看不见路。」",
      options: [
        {
          text: "你认真看着她：你不觉得累吗？",
          next: "ch1_party_deep_talk_2",
          effects: { exp: 10 }
        }
      ]
    },
  
    {
      id: "ch1_party_deep_talk_2",
      type: "story",
      speaker: "旁白",
      text:
        "她想了想，没有立刻开玩笑带过去。\n\n" +
        "「累啊。」她很坦白。\n" +
        "「但如果我躺平，大家就觉得——啊，她也不过如此。」\n\n" +
        "她抬手理了一下头发，把那点脆弱压回去，重新换上一脸轻松的表情。\n" +
        "「行了，别聊这么丧，你今天第一次来南昌，" +
        "我得让你记住这座城市晚上还是有点意思的。」",
      options: [
        {
          text: "顺口接一句：我记住的可能是你。",
          next: "ch1_party_react_to_joke",
          effects: { exp: 10 }
        },
        {
          text: "只是点点头，把这份坦白记在心里",
          next: "ch1_party_before_demon_entry",
          effects: { exp: 5 }
        }
      ]
    },
  
    {
      id: "ch1_party_react_to_joke",
      type: "story",
      speaker: "旁白",
      text:
        "你半开玩笑地说了一句，她愣了半秒，随即笑得更大声。\n\n" +
        "「会说话啊你。」她用指节轻轻敲了下你的杯子。\n" +
        "「那你可要活久一点，别刚记住我就被南昌卷走了。」\n\n" +
        "这句玩笑很轻，但你能听出里面藏着一些认真。",
      options: [
        {
          text: "你没有再拆开，只是把杯子举了举",
          next: "ch1_party_before_demon_entry",
          effects: { exp: 5 }
        }
      ]
    },
  
    // ===== 7. 夜宵摊 / 小店商店入口（可选） =====
    {
      id: "ch1_night_stall_visit",
      type: "shop",
      shopId: "ch1_night_stall",
      speaker: "旁白",
      text:
        "你跟着众人从酒吧出来，街角的夜宵摊冒着热腾腾的雾气。\n\n" +
        "碳火的味道、辣椒和孜然的香味混在一起，" +
        "让你突然意识到自己好像还没吃晚饭。\n\n" +
        "摊主一边翻串，一边招呼你点单，这里也能买到一些简单的丹药和补给。",
      next: "ch1_party_before_demon_entry"
    },
  
    // ===== 8. 心魔前导：电话 + 废弃地铁站 =====
    {
      id: "ch1_party_before_demon_entry",
      type: "story",
      speaker: "旁白",
      text:
        "聚会进行到一半，红姐的手机突然响了。\n\n" +
        "她看了一眼来电显示，笑意收了收，走到一旁接电话。\n\n" +
        "你看着她的背影——灯光从她身上划过，她的影子在地上拉得很长，" +
        "长到像另一个人。",
      options: [
        {
          text: "等她回来，看看她会说什么",
          next: "ch1_party_before_demon"
        },
        {
          text: "先去夜宵摊边吃边等",
          next: "ch1_night_stall_visit"
        }
      ]
    },
  
    {
      id: "ch1_party_before_demon",
      type: "story",
      speaker: "旁白",
      text:
        "几分钟后，红姐回到你身边，脸上的笑意已经重新戴好，" +
        "但你能看出那是刚刚调整好的表情。\n\n" +
        "「有个地方最近总出事。」她压低声音说，" +
        "「得去看一眼。你要不要跟我去见识一下真正的南昌夜生活？」\n\n" +
        "她说“夜生活”的时候，眼神不像是在说玩乐，更像是在说另一层世界。",
      options: [
        {
          text: "直接跟她一起去（硬核）",
          next: "ch1_heart_demon_trigger"
        },
        {
          text: "先回出租屋整理一下装备和丹药，再去",
          next: "ch1_prepare_before_demon"
        }
      ]
    },
  
    {
      id: "ch1_prepare_before_demon",
      type: "story",
      speaker: "旁白",
      text:
        "你说想先准备一下，红姐点点头。\n\n" +
        "「可以，给你半个小时。我在楼下等你。」\n\n" +
        "你回到出租屋，打开菜单，检查自己的状态和背包，" +
        "脑子里反复回放着刚才那通电话后她的表情变化。\n\n" +
        "你隐隐有种预感：接下来的战斗不会轻松。\n" +
        "如果你完全没修炼、身上也没带药，这一战可能会很硬。\n\n" +
        "（提示：现在是整理期，可以去便利店补给、进行修炼、调整装备。）",
      options: [
        {
          text: "去便利店补些丹药和食物",
          next: "ch1_convenience_store_visit"
        },
        {
          text: "再修炼一会儿，让自己心里踏实点",
          next: "ch1_rental_night_cultivate"
        },
        {
          text: "去废弃工厂快速练级，提升实力",
          next: "ch1_training_area_hub"
        },
        {
          text: "觉得差不多了，去找红姐会合",
          next: "ch1_heart_demon_trigger"
        }
      ]
    },
  
    // ===== 9. 心魔触发：废弃地铁站入口 =====
    {
      id: "ch1_heart_demon_trigger",
      type: "story",
      speaker: "旁白",
      text:
        "你和红姐来到一处已经封闭的地铁站入口。\n\n" +
        "铁栅栏上挂着“施工中”的牌子，周围却一点施工的痕迹都没有，" +
        "只有被雨淋得发亮的台阶向下延伸。\n\n" +
        "「最近这里总有人说听到奇怪的声音。」红姐说，" +
        "「笑声、音乐，还有……像是开派对的那种吵闹。」\n\n" +
        "她顿了顿，看向你：\n" +
        "「可这站，早就废弃了。」",
      options: [
        {
          text: "点头，跟着她一步步走下去",
          next: "ch1_heart_demon_trigger_2"
        }
      ]
    },
  
    {
      id: "ch1_heart_demon_trigger_2",
      type: "story",
      speaker: "旁白",
      text:
        "你们走下台阶，雨声被隔绝在身后，空气变得湿冷而安静。\n\n" +
        "越往下走，你越觉得胸口那股力量在躁动，" +
        "好像有人在你耳边说话，却听不清内容。\n\n" +
        "灯光逐渐变暗，最后只剩下一盏忽明忽暗的应急灯，" +
        "把整个站台照成一块灰色的空场。\n\n" +
        "红姐停下脚步，深吸一口气：\n" +
        "「等会儿不管看到什么，先跟着我。」\n\n" +
        "你握紧拳头，感受着体内灵力的流动。\n" +
        "如果之前没有好好准备，现在可能已经来不及了——" +
        "但既然走到了这里，就只能硬着头皮上。",
      options: [
        {
          text: "点头，准备战斗",
          next: "ch1_heart_demon_battle_intro"
        }
      ]
    },
  
    // ===== 10. 心魔战：引导 + boss =====
    {
      id: "ch1_heart_demon_battle_intro",
      type: "story",
      speaker: "旁白",
      text:
        "她话音刚落，最后一盏应急灯“啪”的一声熄灭。\n\n" +
        "黑暗中，音乐声忽然响起——不是现实中的，而像是从你们头顶和脚下同时传来。\n\n" +
        "欢呼、笑声、碰杯声，一切你在酒吧里听到过的声音都被放大、扭曲，" +
        "在这片没有人的站台回荡。\n\n" +
        "一团比夜色更深的阴影从远处缓缓浮现，" +
        "而你看到，在阴影的中心，是一个和红姐极其相似的轮廓，" +
        "却笑得比她刚才任何一次都要夸张。",
      options: [
        {
          text: "「……这就是你的心魔？」",
          next: "ch1_heart_demon_battle"
        }
      ]
    },
  
    {
      id: "ch1_heart_demon_battle",
      type: "battle",
      speaker: "旁白",
      text:
        "阴影张开双臂，像要把整座站台都变成永远不会打烊的派对。\n\n" +
        "【夜宴心魔·初现】盯上了你和红姐！",
      enemyId: "heart_demon_ch1",
      options: [
        {
          text: "战斗！",
          next: "ch1_after_heart_demon"
        }
      ]
    },
  
    // ===== 11. 战后：觉醒 + 境界提升 =====
    {
      id: "ch1_after_heart_demon",
      type: "story",
      speaker: "旁白",
      text:
        "不知过了多久，站台上的声音终于一点一点安静下来。\n\n" +
        "最后一片阴影被你和红姐合力击碎，散作无数细小的光点，" +
        "其中一部分落入她体内，另一部分，落进了你心口。\n\n" +
        "你感觉体内的灵力像被重新洗过一遍，变得更清澈，也更听话。\n\n" +
        "红姐走过来，手还在微微发抖，却笑了出来：\n" +
        "「第一次见面就陪我打这么大的仗，" +
        "你这个新南昌人……挺合我眼缘。」",
      options: [
        {
          text: "询问她：刚刚那个……真的是你的心魔吗？",
          next: "ch1_after_heart_demon_2",
          effects: { exp: 100, level: 1, gold: 80 }
        }
      ]
    },
  
    {
      id: "ch1_after_heart_demon_2",
      type: "story",
      speaker: "旁白",
      text:
        "她靠在一根柱子上，长长吐出一口气。\n\n" +
        "「嗯。」她没有否认。\n" +
        "「讨厌无聊，讨厌被遗忘，讨厌别人觉得我不过如此……" +
        "久而久之，这种东西就会长成一团怪物。」\n\n" +
        "她抬眼看向你，夜色里眼睛很亮：\n" +
        "「不过你运气也挺好，第一次下场就觉醒了灵根，" +
        "还没被吓跑。」",
      options: [
        {
          text: "你笑笑：被生活吓过的人，不怕再吓一次。",
          next: "ch1_party_end",
          effects: { exp: 20 }
        }
      ]
    },
  
    // ===== 12. 第一章结束，进入第二章入口 =====
    {
      id: "ch1_party_end",
      type: "story",
      speaker: "旁白",
      text:
        "回到地面的时候，雨已经停了。\n\n" +
        "城市的灯还亮着，但你知道，" +
        "从今晚起，你看到的世界已经和大多数人不一样。\n\n" +
        "出租屋依旧潮湿，房租不会因为你的觉醒而打折，" +
        "公司明早照样要你打卡。\n\n" +
        "可你胸口那团光不再安分，它提醒你——\n" +
        "这座城市还有另一层夜色，等待你和红姐一起去探索。\n\n" +
        "【第一章 · 灯火初醒】结束。\n" +
        "新的故事，正要开始。",
      options: [
        {
          text: "继续游戏（进入第二章）",
          next: "ch2_intro_1"
        }
      ]
    }
  ];
  