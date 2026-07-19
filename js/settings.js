"use strict";

/* =========================================================
   夏休みギルド Ver0.3.2
   settings.js

   ゲーム設定
   LocalStorage
   プレイヤー設定の反映
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

    version: "0.3.2",

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
        typeof savedSettings.version === "string"
    ) {

        merged.version =
            savedSettings.version;

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


    /*
      現在のゲームバージョンへ更新する。
    */

    merged.version =
        DEFAULT_SETTINGS.version;


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
   8. 全設定の初期化
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


    const player =
        document.getElementById(
            "player"
        );


    if (!player) {
        return;
    }


    const x =
        Number(playerSettings.x);


    const y =
        Number(playerSettings.y);


    const scale =
        Number(playerSettings.scale);


    const rotation =
        Number(playerSettings.rotation);


    /*
      X位置
      画面左端を0、中央を50、右端を100とする。
    */

    if (Number.isFinite(x)) {

        player.style.left =
            `${x}%`;

    }


    /*
      Y位置
      画面下端を基準にbottomで指定する。
    */

    if (Number.isFinite(y)) {

        player.style.bottom =
            `${y}%`;

    }


    /*
      ScaleとRotation
    */

    const safeScale =
        Number.isFinite(scale)
            ? scale
            : DEFAULT_SETTINGS.player.scale;


    const safeRotation =
        Number.isFinite(rotation)
            ? rotation
            : DEFAULT_SETTINGS.player.rotation;


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
   12. 全設定を反映
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


/* =========================================================
   14. JSONをクリップボードへコピー
   ========================================================= */

async function copySettingsJson() {

    const json =
        getSettingsJson();


    try {

        if (
            navigator.clipboard
            && window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                json
            );

            return true;

        }


        /*
          Clipboard APIが使えない場合の代替処理。
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
   15. settings.jsonをダウンロード
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
