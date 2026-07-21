"use strict";

/* =========================================================
   夏休みギルド Ver0.4.0
   app.js

   ゲーム全体の起動
   画面切り替え
   クエスト画面への接続
   GP・挑戦回数表示
   Developer Mode初期化
   PWA登録
   ========================================================= */


/* =========================================================
   1. 画面一覧
   ========================================================= */

const SCREENS = {

    title:
        "title-screen",

    room:
        "room-screen",

    guildhall:
        "guildhall-screen",

    guildshop:
        "guildshop-screen",

    questboard:
        "questboard-screen",

    quest:
        "quest-screen",

    result:
        "result-screen"

};


/* =========================================================
   2. 基本設定
   ========================================================= */

const SCENE_FADE_TIME =
    350;


let isSceneChanging =
    false;


let currentScreenName =
    "title";


/* =========================================================
   3. ゲーム起動
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initGame();

    }
);


/* =========================================================
   4. 初期化
   ========================================================= */

function initGame() {

    /*
      保存済み設定を読み込む。
    */

    if (
        typeof loadSettings
        === "function"
    ) {

        loadSettings();

    } else {

        console.warn(
            "loadSettings() が見つかりません。"
        );

    }


    /*
      読み込んだ設定を画面へ反映する。
    */

    if (
        typeof applyAllSettings
        === "function"
    ) {

        applyAllSettings();

    } else {

        console.warn(
            "applyAllSettings() が見つかりません。"
        );

    }


    /*
      Developer Modeを初期化する。
    */

    if (
        typeof initDeveloperMode
        === "function"
    ) {

        initDeveloperMode();

    } else {

        console.warn(
            "initDeveloperMode() が見つかりません。"
        );

    }


    bindButtons();


    showScreenImmediately(
        "title"
    );


    registerServiceWorker();


    console.log(
        "夏休みギルド Ver0.4.0 起動"
    );

}


/* =========================================================
   5. ボタン設定
   ========================================================= */

function bindButtons() {

    /*
      タイトル
      ↓
      部屋
    */

    bindScreenButton(
        [
            "startButton"
        ],
        "room"
    );


    /*
      部屋
      ↓
      ギルドホール
    */

    bindScreenButton(
        [
            "gotoGuildHall"
        ],
        "guildhall"
    );


    /*
      部屋
      ↓
      着せ替え
    */

    bindActionButton(
        [
            "openWardrobe"
        ],
        () => {

            if (
                typeof window.openWardrobe
                === "function"
            ) {

                window.openWardrobe();

            }

        }
    );


    bindActionButton(
        [
            "closeWardrobe"
        ],
        () => {

            if (
                typeof window.closeWardrobe
                === "function"
            ) {

                window.closeWardrobe();

            }

        }
    );


    /*
      ギルドホール
      ↓
      部屋
    */

    bindScreenButton(
        [
            "backRoom"
        ],
        "room"
    );




    /*
      ギルドホール
      ↓
      ギルドショップ
    */

    bindActionButton(
        [
            "gotoGuildShop"
        ],
        openGuildShop
    );


    /*
      ギルドショップ
      ↓
      ギルドホール
    */

    bindScreenButton(
        [
            "backGuildHallFromShop"
        ],
        "guildhall"
    );


    /*
      ギルドホール
      ↓
      クエストボード

      HTML側のID表記に多少違いがあっても
      接続できるように候補を持たせている。
    */

    bindActionButton(
        [
            "gotoQuestBoard",
            "openQuestBoard",
            "questBoardButton",
            "dailyQuestButton"
        ],
        openQuestBoard
    );


    /*
      クエストボード
      ↓
      ギルドホール
    */

    bindScreenButton(
        [
            "backGuildHall"
        ],
        "guildhall"
    );


    /*
      クエスト画面
      ↓
      クエストボード

      百マス計算を途中でやめるボタン。
    */

    bindActionButton(
        [
            "cancelQuest",
            "cancelHyakumasu",
            "backQuestBoard"
        ],
        cancelCurrentQuest
    );


    /*
      結果画面
      ↓
      クエストボード
    */

    bindActionButton(
        [
            "resultBackQuestBoard",
            "backToQuestBoard",
            "resultContinueButton",
            "resultReturnButton"
        ],
        returnToQuestBoard
    );


    /*
      結果画面
      ↓
      もう一度同じクエスト

      HTMLに該当ボタンがある場合だけ接続する。
    */

    bindActionButton(
        [
            "retryQuestButton",
            "retryHyakumasuButton"
        ],
        retryCurrentQuest
    );

}


/* =========================================================
   6. 画面移動ボタン接続
   ========================================================= */

function bindScreenButton(
    elementIds,
    screenName
) {

    bindActionButton(
        elementIds,
        () => {

            changeScreen(
                screenName
            );

        }
    );

}


/* =========================================================
   7. 汎用ボタン接続
   ========================================================= */

/*
  elementIdsの中で実際に存在する要素へ
  クリック処理を設定する。

  同じ処理を二重登録しないよう、
  datasetで登録済みを記録する。
*/

function bindActionButton(
    elementIds,
    handler
) {

    if (
        !Array.isArray(
            elementIds
        )
        || typeof handler
            !== "function"
    ) {

        return;

    }


    for (
        const elementId
        of elementIds
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (!element) {

            continue;

        }


        if (
            element.dataset
                .summerGuildBound
            === "true"
        ) {

            continue;

        }


        element.addEventListener(
            "click",
            handler
        );


        element.dataset
            .summerGuildBound =
            "true";

    }

}




/* =========================================================
   8. ギルドショップを開く
   ========================================================= */

async function openGuildShop() {

    if (
        typeof window.renderGuildShop
        === "function"
    ) {

        window.renderGuildShop();

    }


    await changeScreen(
        "guildshop"
    );

}


/* =========================================================
   9. クエストボードを開く
   ========================================================= */

async function openQuestBoard() {

    refreshGameDisplays();


    /*
      daily.jsまたはquestEngine.js側に
      一覧描画機能ができた場合は、
      ここから呼び出す。
    */

    renderQuestBoardIfAvailable();


    await changeScreen(
        "questboard"
    );

}


/* =========================================================
   9. クエストボード描画
   ========================================================= */

function renderQuestBoardIfAvailable() {

    /*
      これから作るdaily.jsの関数候補。

      実際に存在する最初の関数だけを使う。
    */

    const rendererCandidates = [

        window.renderDailyQuestList,

        window.renderQuestBoard,

        window.updateQuestBoard

    ];


    for (
        const renderer
        of rendererCandidates
    ) {

        if (
            typeof renderer
            === "function"
        ) {

            renderer();

            return;

        }

    }


    /*
      オブジェクト形式で作られた場合にも対応。
    */

    if (
        window.DailyQuest
        && typeof window.DailyQuest.render
            === "function"
    ) {

        window.DailyQuest.render();

        return;

    }


    if (
        window.QuestManager
        && typeof window.QuestManager.renderBoard
            === "function"
    ) {

        window.QuestManager
            .renderBoard();

    }

}


/* =========================================================
   10. クエストを開始
   ========================================================= */

/*
  questEngine.jsやdaily.jsから利用できる共通入口。

  使用例：

  startQuest("hyakumasu");
*/

async function startQuest(
    questId
) {

    if (
        typeof questId !== "string"
        || questId.trim() === ""
    ) {

        console.error(
            "開始するクエストIDがありません。"
        );

        return false;

    }


    const safeQuestId =
        questId.trim();


    let started =
        false;


    /*
      QuestManager方式
    */

    if (
        window.QuestManager
        && typeof window.QuestManager.start
            === "function"
    ) {

        const result =
            window.QuestManager.start(
                safeQuestId
            );


        started =
            result !== false;

    }


    /*
      QuestEngine方式
    */

    else if (
        window.QuestEngine
        && typeof window.QuestEngine.start
            === "function"
    ) {

        const result =
            window.QuestEngine.start(
                safeQuestId
            );


        started =
            result !== false;

    }


    /*
      百マス単独方式
    */

    else if (
        safeQuestId === "hyakumasu"
        && typeof window.startHyakumasu
            === "function"
    ) {

        const result =
            window.startHyakumasu();


        started =
            result !== false;

    }


    if (!started) {

        console.error(
            `クエストを開始できませんでした: ${safeQuestId}`
        );

        return false;

    }


    await changeScreen(
        "quest"
    );


    return true;

}


/* =========================================================
   11. 現在のクエストを中止
   ========================================================= */

async function cancelCurrentQuest() {

    /*
      QuestEngine側に中止処理があれば呼び出す。
    */

    if (
        window.QuestEngine
        && typeof window.QuestEngine.cancel
            === "function"
    ) {

        window.QuestEngine.cancel();

    } else if (
        typeof window.cancelHyakumasu
        === "function"
    ) {

        window.cancelHyakumasu();

    }


    renderQuestBoardIfAvailable();


    await changeScreen(
        "questboard"
    );

}


/* =========================================================
   12. 結果画面を表示
   ========================================================= */

/*
  questEngine.jsから使う共通関数。

  resultData例：

  {
      message: "百マス計算クリア！",
      reward: 10,
      totalGp: 10,
      todayChallengeCount: 1,
      totalChallengeCount: 1
  }
*/

async function showQuestResult(
    resultData = {}
) {

    updateResultScreen(
        resultData
    );


    refreshGameDisplays();


    await changeScreen(
        "result"
    );

}


/* =========================================================
   13. 結果画面の内容更新
   ========================================================= */

function updateResultScreen(
    resultData
) {

    const safeData =
        resultData
        && typeof resultData === "object"
            ? resultData
            : {};


    setTextIfExists(
        "resultMessage",
        safeData.message
        || "クエストを達成しました。"
    );


    const reward =
        Number.isFinite(
            Number(
                safeData.reward
            )
        )
            ? Math.max(
                0,
                Math.floor(
                    Number(
                        safeData.reward
                    )
                )
            )
            : 0;


    setTextIfExists(
        "rewardText",
        `+${reward}GP`
    );


    const totalGp =
        Number.isFinite(
            Number(
                safeData.totalGp
            )
        )
            ? Math.max(
                0,
                Math.floor(
                    Number(
                        safeData.totalGp
                    )
                )
            )
            : (
                typeof getGp
                === "function"
                    ? getGp()
                    : 0
            );


    setTextIfExists(
        "totalGpText",
        `所持GP：${totalGp}`
    );


    if (
        safeData.todayChallengeCount
        !== undefined
    ) {

        setTextIfExists(
            "resultTodayChallengeCount",
            String(
                safeData
                    .todayChallengeCount
            )
        );

    }


    if (
        safeData.totalChallengeCount
        !== undefined
    ) {

        setTextIfExists(
            "resultTotalChallengeCount",
            String(
                safeData
                    .totalChallengeCount
            )
        );

    }

}


/* =========================================================
   14. 結果画面からクエストボードへ戻る
   ========================================================= */

async function returnToQuestBoard() {

    refreshGameDisplays();

    renderQuestBoardIfAvailable();


    await changeScreen(
        "questboard"
    );

}


/* =========================================================
   15. 同じクエストへ再挑戦
   ========================================================= */

async function retryCurrentQuest() {

    let questId =
        "hyakumasu";


    if (
        window.QuestEngine
        && typeof window.QuestEngine
            .getCurrentQuestId
            === "function"
    ) {

        const currentQuestId =
            window.QuestEngine
                .getCurrentQuestId();


        if (
            typeof currentQuestId
            === "string"
            && currentQuestId.trim()
                !== ""
        ) {

            questId =
                currentQuestId.trim();

        }

    }


    await startQuest(
        questId
    );

}


/* =========================================================
   16. 画面表示用データ更新
   ========================================================= */

function refreshGameDisplays() {

    if (
        typeof updateGpDisplay
        === "function"
    ) {

        updateGpDisplay();

    }


    if (
        typeof updateChallengeCountDisplay
        === "function"
    ) {

        updateChallengeCountDisplay();

    }

}


/* =========================================================
   17. 要素がある場合だけ文字を変更
   ========================================================= */

function setTextIfExists(
    elementId,
    text
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return false;

    }


    element.textContent =
        String(text);


    return true;

}


/* =========================================================
   18. 暗転付き画面切り替え
   ========================================================= */

async function changeScreen(
    screenName
) {

    if (
        !SCREENS[
            screenName
        ]
    ) {

        console.error(
            `画面が登録されていません: ${screenName}`
        );

        return false;

    }


    if (
        isSceneChanging
    ) {

        return false;

    }


    if (
        currentScreenName
        === screenName
    ) {

        refreshGameDisplays();

        return true;

    }


    isSceneChanging =
        true;


    document.body.classList.add(
        "scene-changing"
    );


    await wait(
        SCENE_FADE_TIME
    );


    const activated =
        activateScreen(
            screenName
        );


    if (!activated) {

        document.body.classList.remove(
            "scene-changing"
        );


        isSceneChanging =
            false;


        return false;

    }


    window.scrollTo(
        0,
        0
    );


    refreshGameDisplays();


    document.body.classList.remove(
        "scene-changing"
    );


    await wait(
        SCENE_FADE_TIME
    );


    isSceneChanging =
        false;


    return true;

}


/* =========================================================
   19. 画面表示
   ========================================================= */

function activateScreen(
    screenName
) {

    const targetScreenId =
        SCREENS[
            screenName
        ];


    const screens =
        document.querySelectorAll(
            ".screen"
        );


    screens.forEach(
        (screen) => {

            screen.classList.remove(
                "active"
            );


            screen.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );


    const targetScreen =
        document.getElementById(
            targetScreenId
        );


    if (!targetScreen) {

        console.error(
            `画面要素が見つかりません: ${targetScreenId}`
        );

        return false;

    }


    targetScreen.classList.add(
        "active"
    );


    targetScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    currentScreenName =
        screenName;


    return true;

}


/* =========================================================
   20. 即時表示
   ========================================================= */

function showScreenImmediately(
    screenName
) {

    if (
        !SCREENS[
            screenName
        ]
    ) {

        console.error(
            `画面が登録されていません: ${screenName}`
        );

        return false;

    }


    document.body.classList.remove(
        "scene-changing"
    );


    isSceneChanging =
        false;


    const activated =
        activateScreen(
            screenName
        );


    if (activated) {

        refreshGameDisplays();

    }


    return activated;

}


/* =========================================================
   21. 待機処理
   ========================================================= */

function wait(
    milliseconds
) {

    return new Promise(
        (resolve) => {

            window.setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* =========================================================
   22. Service Worker登録
   ========================================================= */

function registerServiceWorker() {

    if (
        !(
            "serviceWorker"
            in navigator
        )
    ) {

        console.warn(
            "このブラウザはService Workerに対応していません。"
        );

        return;

    }


    window.addEventListener(
        "load",
        async () => {

            try {

                const registration =
                    await navigator
                        .serviceWorker
                        .register(
                            "./service-worker.js"
                        );


                console.log(
                    "Service Worker登録成功:",
                    registration.scope
                );

            } catch (error) {

                console.error(
                    "Service Worker登録失敗:",
                    error
                );

            }

        }
    );

}
