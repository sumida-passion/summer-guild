"use strict";

/* =========================================================
   夏休みギルド Ver0.3
   settings.js

   ゲーム内設定管理
   Developer Mode
   LocalStorage
   ========================================================= */


/* =========================================================
   1. LocalStorageキー
   ========================================================= */

const SETTINGS_STORAGE_KEY = "summerGuildSettings";


/* =========================================================
   2. 初期設定
   ========================================================= */

const DEFAULT_SETTINGS = {

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

let Settings = structuredClone(DEFAULT_SETTINGS);


/* =========================================================
   4. 読み込み
   ========================================================= */

function loadSettings() {

    const json =
        localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!json) {

        Settings = structuredClone(DEFAULT_SETTINGS);

        return;
    }

    try {

        Settings = JSON.parse(json);

    }

    catch (error) {

        console.warn(
            "設定の読み込みに失敗しました。初期設定を使用します。"
        );

        Settings = structuredClone(DEFAULT_SETTINGS);

    }

}


/* =========================================================
   5. 保存
   ========================================================= */

function saveSettings() {

    localStorage.setItem(

        SETTINGS_STORAGE_KEY,

        JSON.stringify(Settings)

    );

}


/* =========================================================
   6. 初期化
   ========================================================= */

function resetSettings() {

    Settings = structuredClone(DEFAULT_SETTINGS);

    saveSettings();

}


/* =========================================================
   7. プレイヤー取得
   ========================================================= */

function getPlayerSettings() {

    return Settings.player;

}


/* =========================================================
   8. プレイヤー更新
   ========================================================= */

function updatePlayerSettings(values) {

    Object.assign(

        Settings.player,

        values

    );

    saveSettings();

}
