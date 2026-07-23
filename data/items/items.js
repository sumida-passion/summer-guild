"use strict";

/* =========================================================
   ギルドショップ商品マスター

   ・ショップに並ぶのは、この配列へ登録した商品だけ。
   ・通常衣装は単品販売し、自由な上下コーディネートを楽しむ。
   ・ギルドマントは認定報酬のため、ここには登録しない。
   ・equipmentType: "fullset" は、ほかの全装備レイヤーと同時装備できない。
   ========================================================= */

window.GUILD_SHOP_ITEMS = [
    { id: "black_dog_pet", name: "黒犬を迎える", price: 100, pet: true },
    { id: "dog_food", name: "黒犬の餌", price: 3, repeatable: true, consumable: "dogFood" },
    { id: "dog_blanket", name: "犬用の毛布", price: 20, petDecoration: true },
    { id: "dog_toy_ball", name: "犬用ボール", price: 12, petDecoration: true },
    { id: "dog_toy_bone", name: "犬用の骨", price: 12, petDecoration: true },
    { id: "dog_toy_rope", name: "犬用ロープ", price: 12, petDecoration: true },
    { id: "lightning_tshirt", name: "稲妻のTシャツ", price: 30, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/lightning_tops.PNG" } },

    { id: "border_tops", name: "旅人のボーダーシャツ", price: 12, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/border_tops.PNG" } },

    { id: "foody_tops", name: "街歩きのフーディー", price: 18, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/foody_tops.PNG" } },

    { id: "mountainparker_tops", name: "山風のマウンテンパーカー", price: 30, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/mountainparker_tops.PNG" } },

    { id: "cycling_tops", name: "風走りのサイクルトップス", price: 22, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/cycling_tops.PNG" } },

    { id: "tennis_tops", name: "白庭のテニストップス", price: 22, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/tennis_tops.PNG" } },

    { id: "doctor_tops", name: "癒やし手の白衣トップス", price: 25, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/doctor_tops.PNG" } },

    { id: "schooluniform_tops", name: "学び舎の冬制服トップス", price: 24, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/schooluniform_tops.PNG" } },

    { id: "schooluniformsummer_tops", name: "学び舎の夏制服トップス", price: 20, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/schooluniformsummer_tops.PNG" } },

    { id: "battle_tops", name: "荒野の戦士トップス", price: 35, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/battle_tops.PNG" } },

    { id: "rocknroll_tops", name: "黒雷のロックトップス", price: 28, wearable: true,
      category: "tops", layers: { tops: "assets/characters/player/clothes/tops/rocknroll_tops.PNG" } },

    { id: "bluejeans_bottoms", name: "青空のブルージーンズ", price: 16, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/bluejeans_bottoms.PNG" } },

    { id: "longskirtgrey_bottoms", name: "灰色のロングスカート", price: 16, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/longskirtgrey_bottoms.PNG" } },

    { id: "stripe_bottoms", name: "冒険者のストライプパンツ", price: 18, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/stripe_bottoms.PNG" } },

    { id: "cycling_bottoms", name: "風走りのサイクルパンツ", price: 20, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/cycling_bottoms.PNG" } },

    { id: "tennis_bottoms", name: "白庭のテニスボトムス", price: 20, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/tennis_bottoms.PNG" } },

    { id: "doctor_bottoms", name: "癒やし手の白衣パンツ", price: 22, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/doctor_bottoms.PNG" } },

    { id: "schooluniform_bottoms", name: "学び舎の制服ボトムス", price: 22, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/schooluniform_bottoms.PNG" } },

    { id: "battle_bottoms", name: "荒野の戦士ボトムス", price: 35, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/battle_bottoms.PNG" } },

    { id: "rocknroll_bottoms", name: "黒雷のロックボトムス", price: 28, wearable: true,
      category: "bottoms", layers: { bottoms: "assets/characters/player/clothes/bottoms/rocknroll_bottoms.PNG" } },

    { id: "doctor_shoes", name: "癒やし手の白い靴", price: 14, wearable: true,
      category: "shoes", layers: { shoes: "assets/characters/player/clothes/shoes/doctor_shoes.PNG" } },

    { id: "schooluniform_shoes", name: "学び舎のローファー", price: 14, wearable: true,
      category: "shoes", layers: { shoes: "assets/characters/player/clothes/shoes/schooluniform_shoes.PNG" } },

    { id: "glasses_head", name: "知恵のメガネ", price: 10, wearable: true,
      category: "head", layers: { head: "assets/characters/player/head/glasses_head.PNG" } },

    { id: "google_head", name: "冒険家のゴーグル", price: 15, wearable: true,
      category: "head", layers: { head: "assets/characters/player/head/google_head.PNG" } },

    { id: "neckwarmer_acc", name: "夜風のネックウォーマー", price: 14, wearable: true,
      category: "accessories", layers: { accessories: "assets/characters/player/accessories/neckwarmer_acc.PNG" } },

    /* 既存の一式商品。購入済みデータとの互換性を保つためIDを維持。 */
    { id: "kyudo_uniform", name: "静心の弓道着", price: 180, wearable: true,
      category: "set", layers: {
          bottoms: "assets/characters/player/clothes/bottoms/kyudo_bottoms.PNG",
          tops: "assets/characters/player/clothes/tops/kyudo_tops.PNG",
          shoes: "assets/characters/player/clothes/shoes/kyudo_shoes.PNG"
      } },

    /*
      全身固定装備。装備時は通常の全レイヤーを外し、
      ほかの装備を選ぶと全身固定装備が解除される。
    */
    { id: "meteor_swordsman_fullset", name: "流星の剣士装備", price: 300, wearable: true,
      category: "fullset", equipmentType: "fullset", layers: {
          outer: "assets/characters/player/clothes/outer/cloudstrife_outerset.PNG"
      } },

    { id: "black_dog_costume", name: "黒い犬の着ぐるみ", price: 120, wearable: true,
      category: "fullset", equipmentType: "fullset", layers: {
          outer: "assets/characters/player/clothes/outer/blackdog_fullset.PNG"
      } }
];
