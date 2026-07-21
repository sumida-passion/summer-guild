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


    const totalReward =
        hasRewardOverride
            ? rewardOverride
            : baseReward
                + earnedPerfectReward
                + earnedFirstPerfectBonus;


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
                ? 0
                : earnedPerfectReward,

        firstPerfectBonus:
            hasRewardOverride
                ? 0
                : earnedFirstPerfectBonus,

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
