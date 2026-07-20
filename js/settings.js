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

        scale: 1.65,

        rotation: 0,

        visible: true

    },


    /*
      ゲーム全体の進行データ
    */

    game: {

        gp: 0

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
   19. デイリークエスト達成確認
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
