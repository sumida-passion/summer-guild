"use strict";

/* =========================================================
   夏休みギルド Ver0.3.1
   settings.js

   ゲーム設定
   LocalStorage
   プレイヤー設定の反映
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

    version: "0.3.1",

    player: {

        x: 50,

        y: -7,

        scale: 1.65,

        rotation: 0,

        visible: true

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
   5. 保存済み設定を初期設定へ統合
   ========================================================= */

function mergeSettings(
    defaultSettings,
    savedSettings
) {

    const merged =
        cloneSettings(defaultSettings);


    if (
        !savedSettings
        || typeof savedSettings !== "object"
    ) {

        return merged;

    }


    if (
        savedSettings.player
        && typeof savedSettings.player === "object"
    ) {

        Object.assign(
            merged.player,
            savedSettings.player
        );

    }


    return merged;

}


/* =========================================================
   6. 読み込み
   ========================================================= */

function loadSettings() {

    const json =
        localStorage.getItem(
            SETTINGS_STORAGE_KEY
        );


    if (!json) {

        Settings =
            cloneSettings(DEFAULT_SETTINGS);

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

    } catch (error) {

        console.warn(
            "設定の読み込みに失敗しました。初期設定を使用します。",
            error
        );


        Settings =
            cloneSettings(DEFAULT_SETTINGS);

    }


    return Settings;

}


/* =========================================================
   7. 保存
   ========================================================= */

function saveSettings() {

    try {

        localStorage.setItem(

            SETTINGS_STORAGE_KEY,

            JSON.stringify(Settings)

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
   8. 初期化 -->
   ========================================================= */

function resetSettings() {

    Settings =
        cloneSettings(DEFAULT_SETTINGS);


    saveSettings();

    applyAllSettings();

}


/* =========================================================
   9. プレイヤー設定取得
   ========================================================= */

function getPlayerSettings() {

    return Settings.player;

}


/* =========================================================
   10. プレイヤー設定更新
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
   11. プレイヤー設定を画面へ反映
   ========================================================= */

function applyPlayerSettings() {

    const playerSettings =
        getPlayerSettings();


    if (!playerSettings) {
        return;
    }


    const scale =
        Number(playerSettings.scale);


    if (Number.isFinite(scale)) {

        document.documentElement.style.setProperty(

            "--player-scale",

            scale.toFixed(2)

        );

    }


    const player =
        document.getElementById("player");


    if (player) {

        player.style.display =
            playerSettings.visible
                ? ""
                : "none";

    }

}


/* =========================================================
   12. すべての設定を反映
   ========================================================= */

function applyAllSettings() {

    applyPlayerSettings();

}


/* =========================================================
   13. JSON文字列取得
   ========================================================= */

function getSettingsJson() {

    return JSON.stringify(
        Settings,
        null,
        2
    );

}
