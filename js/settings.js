"use strict";

/* =========================================================
   夏休みギルド Ver0.4.0
   settings.js

   ゲーム設定
   LocalStorage
   プレイヤー設定
   GP
   デイリークエスト達成記録
   JSON出力
   ========================================================= */


/* =========================================================
   1. LocalStorageキー
   ========================================================= */

const SETTINGS_STORAGE_KEY =
    "summerGuildSettings";


/* =========================================================
   2. 初期設定
   ========================================================= */

const DEFAULT_SETTINGS = {

    version: "0.4.0",


    /*
      主人公の表示設定
    */

    player: {

        x: 50,

        y: -7,

        scale: 1.2,

        rotation: 0,

        visible: true,

        /*
          着せ替えレイヤー。
          すべてbase.pngと同じキャンバス・座標で重ねる。
        */
        equipment: {

            capes: "",

            bottoms:
                "assets/characters/player/clothes/bottoms/default_bottoms.png",

            tops:
                "assets/characters/player/clothes/tops/default_tops.png",

            shoes: "",

            outer: "",

            gloves: "",

            head: "",

            accessories: ""

        }

    },


    /*
      ゲーム全体の進行データ
    */

    game: {

        gp: 0

    },


    /*
      ギルドショップ

      owned：
      購入済みアイテムIDを保存する。
    */

    shop: {

        owned: {},

        inventory: {
            dogFood: 0
        }

    },

    pet: {
        welcomeShown: false
    },


    /*
      デイリークエストの進行データ

      date：
      達成記録が属する日付

      completed：
      その日に達成したクエスト
    */

    daily: {

        date: "",

        completed: {}

    }

};


/* =========================================================
   3. 現在の設定
   ========================================================= */

let Settings =
    cloneSettings(DEFAULT_SETTINGS);


/* =========================================================
   4. 設定の複製
   ========================================================= */

function cloneSettings(source) {

    return JSON.parse(
        JSON.stringify(source)
    );

}


/* =========================================================
   5. 今日の日付キー取得
   ========================================================= */

/*
  端末の現地時刻を使って、

  2026-07-20

  のような文字列を作る。
*/

function getLocalDateKey() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   6. 数値の安全確認
   ========================================================= */

function getSafeNumber(
    value,
    fallback
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return fallback;

    }


    return number;

}


/* =========================================================
   7. 保存済み設定を初期設定へ統合
   ========================================================= */

function mergeSettings(
    defaultSettings,
    savedSettings
) {

    const merged =
        cloneSettings(
            defaultSettings
        );


    if (
        !savedSettings
        || typeof savedSettings !== "object"
    ) {

        return merged;

    }


    /*
      主人公設定
    */

    if (
        savedSettings.player
        && typeof savedSettings.player === "object"
    ) {

        Object.assign(
            merged.player,
            savedSettings.player
        );


        const savedEquipment =
            savedSettings.player.equipment;


        merged.player.equipment =
            cloneSettings(
                DEFAULT_SETTINGS.player.equipment
            );


        if (
            savedEquipment
            && typeof savedEquipment === "object"
            && !Array.isArray(savedEquipment)
        ) {

            for (
                const layerName
                of Object.keys(
                    merged.player.equipment
                )
            ) {

                if (
                    typeof savedEquipment[layerName]
                    === "string"
                ) {

                    merged.player.equipment[layerName] =
                        savedEquipment[layerName];

                }

            }

        }

    }


    /*
      ゲーム進行データ
    */

    if (
        savedSettings.game
        && typeof savedSettings.game === "object"
    ) {

        merged.game.gp =
            Math.max(
                0,
                Math.floor(
                    getSafeNumber(
                        savedSettings.game.gp,
                        0
                    )
                )
            );

    }


    /*
      ギルドショップデータ
    */

    if (
        savedSettings.shop
        && typeof savedSettings.shop === "object"
        && savedSettings.shop.owned
        && typeof savedSettings.shop.owned === "object"
        && !Array.isArray(
            savedSettings.shop.owned
        )
    ) {

        merged.shop.owned = {

            ...savedSettings.shop.owned

        };

    }

    if (savedSettings.shop && savedSettings.shop.inventory) {
        merged.shop.inventory.dogFood = Math.max(0, Math.floor(getSafeNumber(savedSettings.shop.inventory.dogFood, 0)));
    }

    if (savedSettings.pet && typeof savedSettings.pet === "object") {
        merged.pet.welcomeShown = Boolean(savedSettings.pet.welcomeShown);
    }


    /*
      デイリークエストデータ
    */

    if (
        savedSettings.daily
        && typeof savedSettings.daily === "object"
    ) {

        if (
            typeof savedSettings.daily.date
            === "string"
        ) {

            merged.daily.date =
                savedSettings.daily.date;

        }


        if (
            savedSettings.daily.completed
            && typeof savedSettings.daily.completed
                === "object"
            && !Array.isArray(
                savedSettings.daily.completed
            )
        ) {

            merged.daily.completed = {

                ...savedSettings
                    .daily
                    .completed

            };

        }

    }


    /*
      常に現在のバージョンへ更新する。
    */

    merged.version =
        DEFAULT_SETTINGS.version;


    return merged;

}


/* =========================================================
   8. デイリー記録の日付確認
   ========================================================= */

/*
  保存されている日付が今日と違う場合は、
  デイリークエストの達成記録だけをリセットする。

  GPはリセットしない。
*/

function refreshDailyProgress() {

    const today =
        getLocalDateKey();


    if (
        !Settings.daily
        || typeof Settings.daily !== "object"
    ) {

        Settings.daily =
            cloneSettings(
                DEFAULT_SETTINGS.daily
            );

    }


    if (
        Settings.daily.date !== today
    ) {

        Settings.daily.date =
            today;


        Settings.daily.completed = {};


        return true;

    }


    if (
        !Settings.daily.completed
        || typeof Settings.daily.completed
            !== "object"
        || Array.isArray(
            Settings.daily.completed
        )
    ) {

        Settings.daily.completed = {};


        return true;

    }


    return false;

}


/* =========================================================
   9. 読み込み
   ========================================================= */

function loadSettings() {

    const json =
        localStorage.getItem(
            SETTINGS_STORAGE_KEY
        );


    if (!json) {

        Settings =
            cloneSettings(
                DEFAULT_SETTINGS
            );


        refreshDailyProgress();


        saveSettings();


        return Settings;

    }


    try {

        const savedSettings =
            JSON.parse(json);


        Settings =
            mergeSettings(
                DEFAULT_SETTINGS,
                savedSettings
            );


        const dailyWasReset =
            refreshDailyProgress();


        if (dailyWasReset) {

            saveSettings();

        }

    } catch (error) {

        console.warn(
            "設定の読み込みに失敗しました。初期設定を使用します。",
            error
        );


        Settings =
            cloneSettings(
                DEFAULT_SETTINGS
            );


        refreshDailyProgress();


        saveSettings();

    }


    return Settings;

}


/* =========================================================
   10. 保存
   ========================================================= */

function saveSettings() {

    try {

        localStorage.setItem(

            SETTINGS_STORAGE_KEY,

            JSON.stringify(
                Settings
            )

        );


        return true;

    } catch (error) {

        console.error(
            "設定の保存に失敗しました。",
            error
        );


        return false;

    }

}


/* =========================================================
   11. 全設定の初期化
   ========================================================= */

function resetSettings() {

    Settings =
        cloneSettings(
            DEFAULT_SETTINGS
        );


    refreshDailyProgress();


    saveSettings();

    applyAllSettings();

}


/* =========================================================
   12. プレイヤー設定取得
   ========================================================= */

function getPlayerSettings() {

    return Settings.player;

}


/* =========================================================
   13. プレイヤー設定更新
   ========================================================= */

function updatePlayerSettings(values) {

    if (
        !values
        || typeof values !== "object"
    ) {

        return;

    }


    Object.assign(
        Settings.player,
        values
    );


    saveSettings();

    applyPlayerSettings();

}


/* =========================================================
   14. プレイヤー設定を画面へ反映
   ========================================================= */

function applyPlayerSettings() {

    const playerSettings =
        getPlayerSettings();


    if (!playerSettings) {

        return;

    }


    const player =
        document.getElementById(
            "player"
        );


    if (!player) {

        return;

    }


    const x =
        Number(
            playerSettings.x
        );


    const y =
        Number(
            playerSettings.y
        );


    const scale =
        Number(
            playerSettings.scale
        );


    const rotation =
        Number(
            playerSettings.rotation
        );


    /*
      X位置

      画面左端を0、
      中央を50、
      右端を100とする。
    */

    if (
        Number.isFinite(x)
    ) {

        player.style.left =
            `${x}%`;

    }


    /*
      Y位置

      画面下端を基準に
      bottomで指定する。
    */

    if (
        Number.isFinite(y)
    ) {

        player.style.bottom =
            `${y}%`;

    }


    /*
      ScaleとRotation
    */

    const safeScale =
        Number.isFinite(scale)
            ? scale
            : DEFAULT_SETTINGS
                .player
                .scale;


    const safeRotation =
        Number.isFinite(rotation)
            ? rotation
            : DEFAULT_SETTINGS
                .player
                .rotation;


    player.style.transform = `

        translateX(-50%)

        scale(${safeScale})

        rotate(${safeRotation}deg)

    `;


    /*
      表示・非表示
    */

    player.style.display =
        playerSettings.visible
            ? ""
            : "none";

}


/* =========================================================
   15. 全設定を反映
   ========================================================= */

function applyAllSettings() {

    applyPlayerSettings();

    applyPlayerEquipment();

}


/* =========================================================
   16. 着せ替え設定
   ========================================================= */

const PLAYER_EQUIPMENT_LAYERS = [

    "capes",
    "bottoms",
    "tops",
    "shoes",
    "outer",
    "gloves",
    "head",
    "accessories"

];


function getPlayerEquipment() {

    if (
        !Settings.player.equipment
        || typeof Settings.player.equipment !== "object"
        || Array.isArray(Settings.player.equipment)
    ) {

        Settings.player.equipment =
            cloneSettings(
                DEFAULT_SETTINGS.player.equipment
            );

    }


    return cloneSettings(
        Settings.player.equipment
    );

}


function getWearableShopItem(itemId) {

    const safeItemId =
        typeof itemId === "string"
            ? itemId.trim()
            : "";


    const items =
        Array.isArray(window.GUILD_SHOP_ITEMS)
            ? window.GUILD_SHOP_ITEMS
            : [];


    return items.find(
        (item) =>
            item
            && item.id === safeItemId
            && item.wearable === true
            && item.layers
            && typeof item.layers === "object"
    ) || null;

}


function isFullSetShopItem(item) {

    return Boolean(
        item
        && item.equipmentType === "fullset"
    );

}


function getActiveFullSetShopItem() {

    const items =
        Array.isArray(window.GUILD_SHOP_ITEMS)
            ? window.GUILD_SHOP_ITEMS
            : [];


    return items.find(
        (item) =>
            isFullSetShopItem(item)
            && item.wearable === true
            && item.layers
            && typeof item.layers === "object"
            && isShopItemEquipped(item.id)
    ) || null;

}


function createEmptyPlayerEquipment() {

    const equipment = {};


    for (
        const layerName
        of PLAYER_EQUIPMENT_LAYERS
    ) {

        equipment[layerName] = "";

    }


    return equipment;

}


function isRockNRollBottomsEquipped() {

    const equipment =
        getPlayerEquipment();


    return equipment.bottoms
        === "assets/characters/player/clothes/bottoms/rocknroll_bottoms.PNG";

}


function equipShopItem(itemId) {

    const item =
        getWearableShopItem(itemId);


    if (!item) {

        return {
            success: false,
            reason: "not-wearable"
        };

    }


    if (!isShopItemOwned(item.id)) {

        return {
            success: false,
            reason: "not-owned"
        };

    }


    /*
      黒雷のロックボトムスはブーツ込みの画像。
      装備中は単品の靴を重ねられないようにする。
      ボトムスも同時に変更する一式装備は対象外。
    */
    if (
        item.category === "shoes"
        && isRockNRollBottomsEquipped()
    ) {

        return {
            success: false,
            reason: "rocknroll-bottoms-includes-shoes"
        };

    }


    if (isFullSetShopItem(item)) {

        /*
          全身固定装備は、base.png以外の全装備を解除してから
          指定された1枚の全身レイヤーだけを表示する。
        */
        Settings.player.equipment =
            createEmptyPlayerEquipment();

    } else if (getActiveFullSetShopItem()) {

        /*
          全身固定装備中に通常装備を選んだ場合は、
          いつもの服へ戻してから選択した単品を重ねる。
        */
        Settings.player.equipment =
            cloneSettings(
                DEFAULT_SETTINGS.player.equipment
            );

    }


    /*
      ロックボトムスを着た瞬間、現在の靴を外す。
      元の靴は自動復元せず、外れた状態を維持する。
    */
    if (item.id === "rocknroll_bottoms") {

        Settings.player.equipment.shoes = "";

    }


    for (
        const layerName
        of PLAYER_EQUIPMENT_LAYERS
    ) {

        const layerPath =
            item.layers[layerName];


        if (
            typeof layerPath === "string"
            && layerPath.trim() !== ""
        ) {

            Settings.player.equipment[layerName] =
                layerPath.trim();

        }

    }


    saveSettings();
    applyPlayerEquipment();


    return {
        success: true,
        itemId: item.id,
        equipmentType:
            isFullSetShopItem(item)
                ? "fullset"
                : "normal"
    };

}


function resetPlayerEquipment() {

    Settings.player.equipment =
        cloneSettings(
            DEFAULT_SETTINGS.player.equipment
        );


    saveSettings();
    applyPlayerEquipment();


    return true;

}


function isShopItemEquipped(itemId) {

    const item =
        getWearableShopItem(itemId);


    if (!item) {

        return false;

    }


    const equipment =
        getPlayerEquipment();


    const layerEntries =
        Object.entries(item.layers)
            .filter(
                ([layerName, layerPath]) =>
                    PLAYER_EQUIPMENT_LAYERS.includes(layerName)
                    && typeof layerPath === "string"
                    && layerPath.trim() !== ""
            );


    if (layerEntries.length === 0) {

        return false;

    }


    const ownLayersMatch =
        layerEntries.every(
            ([layerName, layerPath]) =>
                equipment[layerName] === layerPath.trim()
        );


    if (!ownLayersMatch) {

        return false;

    }


    if (!isFullSetShopItem(item)) {

        return true;

    }


    const ownLayerNames =
        new Set(
            layerEntries.map(([layerName]) => layerName)
        );


    return PLAYER_EQUIPMENT_LAYERS.every(
        (layerName) =>
            ownLayerNames.has(layerName)
            || !equipment[layerName]
    );

}


function applyPlayerEquipment() {

    const equipment =
        getPlayerEquipment();


    for (
        const layerName
        of PLAYER_EQUIPMENT_LAYERS
    ) {

        const image =
            document.querySelector(
                `[data-player-layer="${layerName}"]`
            );


        if (!image) {

            continue;

        }


        const layerPath =
            typeof equipment[layerName] === "string"
                ? equipment[layerName].trim()
                : "";


        if (layerPath === "") {

            image.hidden = true;
            image.removeAttribute("src");

        } else {

            image.src = layerPath;
            image.hidden = false;

        }

    }

}


/* =========================================================
   16. 現在のGP取得
   ========================================================= */

function getGp() {

    if (
        !Settings.game
        || typeof Settings.game !== "object"
    ) {

        Settings.game =
            cloneSettings(
                DEFAULT_SETTINGS.game
            );

    }


    return Math.max(
        0,
        Math.floor(
            getSafeNumber(
                Settings.game.gp,
                0
            )
        )
    );

}


/* =========================================================
   17. GP加算
   ========================================================= */

function addGp(amount) {

    const safeAmount =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    amount,
                    0
                )
            )
        );


    Settings.game.gp =
        getGp()
        + safeAmount;


    saveSettings();


    return Settings.game.gp;

}


/* =========================================================
   18. GP消費
   ========================================================= */

/*
  将来のショップ用。

  GPが足りない場合はfalseを返す。
*/

function spendGp(amount) {

    const safeAmount =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    amount,
                    0
                )
            )
        );


    const currentGp =
        getGp();


    if (
        currentGp < safeAmount
    ) {

        return false;

    }


    Settings.game.gp =
        currentGp
        - safeAmount;


    saveSettings();


    return true;

}




/* =========================================================
   19. ギルドショップ購入済み確認
   ========================================================= */

function isShopItemOwned(
    itemId
) {

    if (
        typeof itemId !== "string"
        || itemId.trim() === ""
    ) {

        return false;

    }


    if (
        !Settings.shop
        || typeof Settings.shop !== "object"
    ) {

        Settings.shop =
            cloneSettings(
                DEFAULT_SETTINGS.shop
            );

    }


    if (
        !Settings.shop.owned
        || typeof Settings.shop.owned !== "object"
        || Array.isArray(
            Settings.shop.owned
        )
    ) {

        Settings.shop.owned = {};

    }


    return Boolean(
        Settings.shop.owned[
            itemId.trim()
        ]
    );

}


/* =========================================================
   20. ギルドショップ購入処理
   ========================================================= */

function buyShopItem(
    itemId,
    price
) {

    const safeItemId =
        typeof itemId === "string"
            ? itemId.trim()
            : "";


    const safePrice =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    price,
                    0
                )
            )
        );


    if (safeItemId === "") {

        return {

            success: false,

            reason: "invalid-item",

            totalGp: getGp()

        };

    }


    if (
        isShopItemOwned(
            safeItemId
        )
    ) {

        return {

            success: false,

            reason: "already-owned",

            totalGp: getGp()

        };

    }


    if (
        getGp() < safePrice
    ) {

        return {

            success: false,

            reason: "not-enough-gp",

            totalGp: getGp()

        };

    }


    if (
        !spendGp(
            safePrice
        )
    ) {

        return {

            success: false,

            reason: "not-enough-gp",

            totalGp: getGp()

        };

    }


    Settings.shop.owned[
        safeItemId
    ] = {

        purchased: true,

        purchasedAt:
            new Date()
                .toISOString(),

        price:
            safePrice

    };


    saveSettings();


    return {

        success: true,

        reason: "purchased",

        itemId:
            safeItemId,

        price:
            safePrice,

        totalGp:
            getGp()

    };

}


/* =========================================================
   21. 購入済みアイテム一覧取得
   ========================================================= */

function getOwnedShopItems() {

    if (
        !Settings.shop
        || typeof Settings.shop !== "object"
        || !Settings.shop.owned
        || typeof Settings.shop.owned !== "object"
    ) {

        return {};

    }


    return cloneSettings(
        Settings.shop.owned
    );

}

/* =========================================================
   22. デイリークエスト達成確認
   ========================================================= */

function isDailyQuestCompleted(
    questId
) {

    refreshDailyProgress();


    if (
        typeof questId !== "string"
        || questId.trim() === ""
    ) {

        return false;

    }


    return Boolean(
        Settings
            .daily
            .completed[
                questId
            ]
    );

}


/* =========================================================
   20. デイリークエスト達成登録
   ========================================================= */

/*
  その日に初めて達成した場合だけ、
  GPを加算する。

  戻り値：

  {
      firstClear: true,
      reward: 10,
      totalGp: 10
  }

  同じ日に再度クリアした場合：

  {
      firstClear: false,
      reward: 0,
      totalGp: 10
  }
*/

function completeDailyQuest(
    questId,
    reward
) {

    refreshDailyProgress();


    if (
        typeof questId !== "string"
        || questId.trim() === ""
    ) {

        console.error(
            "クエストIDが正しくありません。"
        );


        return {

            firstClear: false,

            reward: 0,

            totalGp: getGp()

        };

    }


    const safeQuestId =
        questId.trim();


    const safeReward =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    reward,
                    0
                )
            )
        );


    /*
      本日すでに達成している場合は、
      報酬を二重に渡さない。
    */

    if (
        isDailyQuestCompleted(
            safeQuestId
        )
    ) {

        return {

            firstClear: false,

            reward: 0,

            totalGp: getGp()

        };

    }


    Settings.daily.completed[
        safeQuestId
    ] = {

        completed: true,

        completedAt:
            new Date()
                .toISOString(),

        reward:
            safeReward

    };


    Settings.game.gp =
        getGp()
        + safeReward;


    saveSettings();


    return {

        firstClear: true,

        reward:
            safeReward,

        totalGp:
            getGp()

    };

}


/* =========================================================
   21. 本日の達成クエスト一覧取得
   ========================================================= */

function getDailyCompletedQuests() {

    refreshDailyProgress();


    return cloneSettings(
        Settings.daily.completed
    );

}


/* =========================================================
   22. GP表示の更新
   ========================================================= */

function updateGpDisplay() {

    const gpDisplay =
        document.getElementById(
            "gpDisplay"
        );


    if (gpDisplay) {

        gpDisplay.textContent =
            `所持GP：${getGp()}`;

    }


    const totalGpText =
        document.getElementById(
            "totalGpText"
        );


    if (totalGpText) {

        totalGpText.textContent =
            `所持GP：${getGp()}`;

    }

}


/* =========================================================
   23. JSON文字列取得
   ========================================================= */

function getSettingsJson() {

    return JSON.stringify(
        Settings,
        null,
        2
    );

}


/* =========================================================
   24. JSONをクリップボードへコピー
   ========================================================= */

async function copySettingsJson() {

    const json =
        getSettingsJson();


    try {

        if (
            navigator.clipboard
            && window.isSecureContext
        ) {

            await navigator
                .clipboard
                .writeText(
                    json
                );


            return true;

        }


        /*
          Clipboard APIが使えない場合の
          代替処理。
        */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            json;


        textarea.setAttribute(
            "readonly",
            ""
        );


        textarea.style.position =
            "fixed";


        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.select();


        const copied =
            document.execCommand(
                "copy"
            );


        textarea.remove();


        return copied;

    } catch (error) {

        console.error(
            "settings.jsonのコピーに失敗しました。",
            error
        );


        return false;

    }

}


/* =========================================================
   25. settings.jsonをダウンロード
   ========================================================= */

function downloadSettingsJson() {

    try {

        const json =
            getSettingsJson();


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "settings.json";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        return true;

    } catch (error) {

        console.error(
            "settings.jsonのダウンロードに失敗しました。",
            error
        );


        return false;

    }

}
/* =========================================================
   26. クエスト繰り返し挑戦システム
   Ver0.4.1 追記

   ・初回報酬
   ・2回目以降の報酬
   ・パーフェクト報酬
   ・今日初パーフェクト報酬
   ・今日の挑戦回数
   ・累計挑戦回数
   ========================================================= */


/* =========================================================
   26-1. 新しい初期データを追加
   ========================================================= */

DEFAULT_SETTINGS.game.statistics = {

    totalPlayCount: 0,

    totalQuestClear: 0,

    totalPerfect: 0

};


DEFAULT_SETTINGS.daily.totalPlayCount = 0;


/* =========================================================
   26-2. 保存済み統計データの読み込み対応
   ========================================================= */

/*
  既存のmergeSettingsを残したまま、
  新しい統計データも読み込めるように拡張する。
*/

const originalMergeSettings =
    mergeSettings;


mergeSettings = function (
    defaultSettings,
    savedSettings
) {

    const merged =
        originalMergeSettings(
            defaultSettings,
            savedSettings
        );


    /*
      累計統計
    */

    if (
        savedSettings
        && savedSettings.game
        && savedSettings.game.statistics
        && typeof savedSettings.game.statistics
            === "object"
    ) {

        merged.game.statistics = {

            totalPlayCount:
                Math.max(
                    0,
                    Math.floor(
                        getSafeNumber(
                            savedSettings
                                .game
                                .statistics
                                .totalPlayCount,
                            0
                        )
                    )
                ),

            totalQuestClear:
                Math.max(
                    0,
                    Math.floor(
                        getSafeNumber(
                            savedSettings
                                .game
                                .statistics
                                .totalQuestClear,
                            0
                        )
                    )
                ),

            totalPerfect:
                Math.max(
                    0,
                    Math.floor(
                        getSafeNumber(
                            savedSettings
                                .game
                                .statistics
                                .totalPerfect,
                            0
                        )
                    )
                )

        };

    }


    /*
      今日の挑戦回数
    */

    if (
        savedSettings
        && savedSettings.daily
    ) {

        merged.daily.totalPlayCount =
            Math.max(
                0,
                Math.floor(
                    getSafeNumber(
                        savedSettings
                            .daily
                            .totalPlayCount,
                        0
                    )
                )
            );

    }


    return merged;

};


/* =========================================================
   26-3. 日付変更時の挑戦回数リセット
   ========================================================= */

const originalRefreshDailyProgress =
    refreshDailyProgress;


refreshDailyProgress = function () {

    const previousDate =
        Settings.daily
            ? Settings.daily.date
            : "";


    const today =
        getLocalDateKey();


    const wasReset =
        originalRefreshDailyProgress();


    /*
      日付が変わった場合、
      今日の挑戦回数も0に戻す。

      累計挑戦回数は残す。
    */

    if (
        previousDate !== today
    ) {

        Settings.daily.totalPlayCount = 0;

    }


    if (
        !Number.isFinite(
            Number(
                Settings.daily
                    .totalPlayCount
            )
        )
    ) {

        Settings.daily.totalPlayCount = 0;

    }


    return wasReset;

};


/* =========================================================
   26-4. 統計データの安全確認
   ========================================================= */

function ensureQuestStatistics() {

    if (
        !Settings.game
        || typeof Settings.game !== "object"
    ) {

        Settings.game =
            cloneSettings(
                DEFAULT_SETTINGS.game
            );

    }


    if (
        !Settings.game.statistics
        || typeof Settings.game.statistics
            !== "object"
    ) {

        Settings.game.statistics =
            cloneSettings(
                DEFAULT_SETTINGS
                    .game
                    .statistics
            );

    }


    if (
        !Settings.daily
        || typeof Settings.daily !== "object"
    ) {

        Settings.daily =
            cloneSettings(
                DEFAULT_SETTINGS.daily
            );

    }


    if (
        !Settings.daily.completed
        || typeof Settings.daily.completed
            !== "object"
        || Array.isArray(
            Settings.daily.completed
        )
    ) {

        Settings.daily.completed = {};

    }


    Settings.daily.totalPlayCount =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    Settings.daily
                        .totalPlayCount,
                    0
                )
            )
        );


    Settings.game.statistics.totalPlayCount =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    Settings.game
                        .statistics
                        .totalPlayCount,
                    0
                )
            )
        );


    Settings.game.statistics.totalQuestClear =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    Settings.game
                        .statistics
                        .totalQuestClear,
                    0
                )
            )
        );


    Settings.game.statistics.totalPerfect =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    Settings.game
                        .statistics
                        .totalPerfect,
                    0
                )
            )
        );

}


/* =========================================================
   26-5. クエスト別の今日の記録を取得
   ========================================================= */

function getDailyQuestRecord(
    questId
) {

    refreshDailyProgress();

    ensureQuestStatistics();


    if (
        typeof questId !== "string"
        || questId.trim() === ""
    ) {

        return null;

    }


    const safeQuestId =
        questId.trim();


    const currentRecord =
        Settings.daily.completed[
            safeQuestId
        ];


    /*
      旧形式との互換対応。

      以前の保存形式がtrueや単純なオブジェクトでも、
      新形式へ安全に変換する。
    */

    if (
        !currentRecord
        || typeof currentRecord !== "object"
        || Array.isArray(
            currentRecord
        )
    ) {

        Settings.daily.completed[
            safeQuestId
        ] = {

            playCount: 0,

            clearCount: 0,

            perfectCount: 0,

            firstReward: false,

            firstPerfect: false,

            lastCompletedAt: ""

        };

    }


    const record =
        Settings.daily.completed[
            safeQuestId
        ];


    record.playCount =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    record.playCount,
                    0
                )
            )
        );


    record.clearCount =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    record.clearCount,
                    0
                )
            )
        );


    record.perfectCount =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    record.perfectCount,
                    0
                )
            )
        );


    record.firstReward =
        Boolean(
            record.firstReward
        );


    record.firstPerfect =
        Boolean(
            record.firstPerfect
        );


    if (
        typeof record.lastCompletedAt
        !== "string"
    ) {

        record.lastCompletedAt = "";

    }


    return record;

}


/* =========================================================
   26-6. 今日の挑戦回数取得
   ========================================================= */

function getTodayChallengeCount() {

    refreshDailyProgress();

    ensureQuestStatistics();


    return Settings.daily
        .totalPlayCount;

}


/* =========================================================
   26-7. 累計挑戦回数取得
   ========================================================= */

function getTotalChallengeCount() {

    ensureQuestStatistics();


    return Settings.game
        .statistics
        .totalPlayCount;

}


/* =========================================================
   26-8. クエストごとの今日の挑戦回数取得
   ========================================================= */

function getQuestChallengeCount(
    questId
) {

    const record =
        getDailyQuestRecord(
            questId
        );


    if (!record) {

        return 0;

    }


    return record.playCount;

}


/* =========================================================
   26-9. クエスト完了・報酬計算
   ========================================================= */

/*
  使用例：

  completeQuestAttempt({

      questId: "hyakumasu",

      firstReward: 10,

      repeatReward: 1,

      isPerfect: true,

      perfectReward: 1,

      firstPerfectBonus: 2

  });


  戻り値の例：

  {
      success: true,
      questId: "hyakumasu",
      playCount: 1,
      todayChallengeCount: 1,
      totalChallengeCount: 1,
      firstClear: true,
      perfect: true,
      firstPerfect: true,
      baseReward: 10,
      perfectReward: 1,
      firstPerfectBonus: 2,
      reward: 13,
      totalGp: 13
  }
*/

function completeQuestAttempt(options) {

    refreshDailyProgress();

    ensureQuestStatistics();


    if (
        !options
        || typeof options !== "object"
    ) {

        console.error(
            "クエスト完了データがありません。"
        );


        return {

            success: false,

            reward: 0,

            totalGp: getGp()

        };

    }


    const questId =
        typeof options.questId === "string"
            ? options.questId.trim()
            : "";


    if (questId === "") {

        console.error(
            "クエストIDが正しくありません。"
        );


        return {

            success: false,

            reward: 0,

            totalGp: getGp()

        };

    }


    const firstReward =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    options.firstReward,
                    0
                )
            )
        );


    const repeatReward =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    options.repeatReward,
                    0
                )
            )
        );


    const perfectReward =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    options.perfectReward,
                    0
                )
            )
        );


    const firstPerfectBonus =
        Math.max(
            0,
            Math.floor(
                getSafeNumber(
                    options.firstPerfectBonus,
                    0
                )
            )
        );


    const isPerfect =
        Boolean(
            options.isPerfect
        );


    const record =
        getDailyQuestRecord(
            questId
        );


    const firstClear =
        !record.firstReward;


    const isFirstPerfect =
        isPerfect
        && !record.firstPerfect;


    /*
      基本報酬

      今日初回：
      firstReward

      今日2回目以降：
      repeatReward
    */

    const baseReward =
        firstClear
            ? firstReward
            : repeatReward;


    /*
      パーフェクト報酬
    */

    const earnedPerfectReward =
        isPerfect
            ? perfectReward
            : 0;


    /*
      今日初パーフェクト報酬
    */

    const earnedFirstPerfectBonus =
        isFirstPerfect
            ? firstPerfectBonus
            : 0;


    const hasRewardOverride =
        Number.isFinite(
            Number(
                options.rewardOverride
            )
        );


    const rewardOverride =
        hasRewardOverride
            ? Math.max(
                0,
                Math.floor(
                    Number(
                        options.rewardOverride
                    )
                )
            )
            : 0;


    const hasPerformanceRewardOverride =
        Number.isFinite(
            Number(
                options.performanceRewardOverride
            )
        );


    const performanceRewardOverride =
        hasPerformanceRewardOverride
            ? Math.max(
                0,
                Math.floor(
                    Number(
                        options.performanceRewardOverride
                    )
                )
            )
            : 0;


    const totalReward =
        hasRewardOverride
            ? rewardOverride
            : baseReward
                + (
                    hasPerformanceRewardOverride
                        ? performanceRewardOverride
                        : earnedPerfectReward
                            + earnedFirstPerfectBonus
                );


    /*
      今日のクエスト別記録
    */

    record.playCount += 1;

    record.clearCount += 1;

    record.firstReward = true;

    record.lastCompletedAt =
        new Date()
            .toISOString();


    if (isPerfect) {

        record.perfectCount += 1;

        record.firstPerfect = true;

    }


    /*
      今日・累計の挑戦回数
    */

    Settings.daily.totalPlayCount += 1;

    Settings.game
        .statistics
        .totalPlayCount += 1;

    Settings.game
        .statistics
        .totalQuestClear += 1;


    if (isPerfect) {

        Settings.game
            .statistics
            .totalPerfect += 1;

    }


    /*
      GPを加算
    */

    Settings.game.gp =
        getGp()
        + totalReward;


    saveSettings();

    updateGpDisplay();

    updateChallengeCountDisplay();


    return {

        success: true,

        questId,

        playCount:
            record.playCount,

        todayChallengeCount:
            getTodayChallengeCount(),

        totalChallengeCount:
            getTotalChallengeCount(),

        firstClear,

        perfect:
            isPerfect,

        firstPerfect:
            isFirstPerfect,

        baseReward:
            hasRewardOverride
                ? rewardOverride
                : baseReward,

        perfectReward:
            hasRewardOverride
            || hasPerformanceRewardOverride
                ? 0
                : earnedPerfectReward,

        firstPerfectBonus:
            hasRewardOverride
            || hasPerformanceRewardOverride
                ? 0
                : earnedFirstPerfectBonus,

        performanceReward:
            hasPerformanceRewardOverride
                ? performanceRewardOverride
                : 0,

        reward:
            totalReward,

        totalGp:
            getGp()

    };

}


/* =========================================================
   26-10. 挑戦回数表示の更新
   ========================================================= */

/*
  HTMLに該当IDが存在する場合だけ表示する。

  今は存在しなくてもエラーにならない。
  後ほどindex.html側へ追加する。
*/

function updateChallengeCountDisplay() {

    const todayChallengeCount =
        getTodayChallengeCount();


    const totalChallengeCount =
        getTotalChallengeCount();


    const todayElements = [

        document.getElementById(
            "todayChallengeCount"
        ),

        document.getElementById(
            "questBoardTodayChallengeCount"
        ),

        document.getElementById(
            "resultTodayChallengeCount"
        )

    ];


    for (
        const element
        of todayElements
    ) {

        if (element) {

            element.textContent =
                String(
                    todayChallengeCount
                );

        }

    }


    const totalElements = [

        document.getElementById(
            "totalChallengeCount"
        ),

        document.getElementById(
            "questBoardTotalChallengeCount"
        ),

        document.getElementById(
            "resultTotalChallengeCount"
        )

    ];


    for (
        const element
        of totalElements
    ) {

        if (element) {

            element.textContent =
                String(
                    totalChallengeCount
                );

        }

    }

}


/* =========================================================
   26-11. 全設定反映へ挑戦回数表示を追加
   ========================================================= */

const originalApplyAllSettings =
    applyAllSettings;


applyAllSettings = function () {

    originalApplyAllSettings();

    updateGpDisplay();

    updateChallengeCountDisplay();

};


/* =========================================================
   22. 黒犬・消耗品
   ========================================================= */
function getDogFoodCount() {
    return Math.max(0, Math.floor(getSafeNumber(Settings.shop?.inventory?.dogFood, 0)));
}

function addDogFood(amount = 1) {
    if (!Settings.shop.inventory) Settings.shop.inventory = { dogFood: 0 };
    Settings.shop.inventory.dogFood = getDogFoodCount() + Math.max(0, Math.floor(getSafeNumber(amount, 0)));
    saveSettings();
    return Settings.shop.inventory.dogFood;
}

function consumeDogFood() {
    const count = getDogFoodCount();
    if (count < 1) return false;
    Settings.shop.inventory.dogFood = count - 1;
    saveSettings();
    return true;
}

function hasShownBlackDogWelcome() {
    return Boolean(Settings.pet?.welcomeShown);
}

function markBlackDogWelcomeShown() {
    if (!Settings.pet) Settings.pet = { welcomeShown: false };
    Settings.pet.welcomeShown = true;
    saveSettings();
}

function isBlackDogCostumeEquipped() {
    return Settings.player?.equipment?.outer === "assets/characters/player/clothes/outer/blackdog_fullset.PNG";
}
