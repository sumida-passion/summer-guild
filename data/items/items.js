"use strict";

/* =========================================================
   ギルドショップ商品マスター

   新しい商品は、この配列へ1件追加する。
   idは重複させない。
   ========================================================= */

window.GUILD_SHOP_ITEMS = [

    {
        id: "green_tshirt",
        name: "森風の緑Tシャツ",
        price: 20
    },

    {
        id: "lightning_tshirt",
        name: "稲妻のTシャツ",
        price: 30,
        wearable: true,
        layers: {
            tops: "assets/characters/player/clothes/tops/lightning_tops.PNG"
        }
    },

    {
        id: "doctor_white_coat",
        name: "癒やし手の白衣",
        price: 80
    },

    {
        id: "black_dog_costume",
        name: "黒い犬の着ぐるみ",
        price: 120
    },

    {
        id: "kyudo_uniform",
        name: "静心の弓道着",
        price: 180,
        wearable: true,
        layers: {
            bottoms: "assets/characters/player/clothes/bottoms/kyudo_bottoms.PNG",
            tops: "assets/characters/player/clothes/tops/kyudo_tops.PNG",
            shoes: "assets/characters/player/clothes/shoes/kyudo_shoes.PNG"
        }
    },

    {
        id: "barbarian_outfit",
        name: "荒野の戦士装備",
        price: 300
    }

];
