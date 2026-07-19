"use strict";

/* =========================================================
   夏休みギルド Ver0.3.1
   app.js

   ゲーム全体の起動
   画面切り替え
   設定反映
   Developer Mode初期化
   PWA登録
   ========================================================= */


/* =========================================================
   1. 画面一覧
   ========================================================= */

const SCREENS = {

    title: "title-screen",

    room: "room-screen",

    guildhall: "guildhall-screen"

};


/* =========================================================
   2. 基本設定
   ========================================================= */

const SCENE_FADE_TIME = 350;

let isSceneChanging = false;


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

    showScreenImmediately("title");

    registerServiceWorker();


    console.log(
        "夏休みギルド Ver0.3.1 起動"
    );

}


/* =========================================================
   5. ボタン設定
   ========================================================= */

function bindButtons() {

    const startButton =
        document.getElementById(
            "startButton"
        );


    const gotoGuildHallButton =
        document.getElementById(
            "gotoGuildHall"
        );


    const backRoomButton =
        document.getElementById(
            "backRoom"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            () => {

                changeScreen("room");

            }
        );

    }


    if (gotoGuildHallButton) {

        gotoGuildHallButton.addEventListener(
            "click",
            () => {

                changeScreen(
                    "guildhall"
                );

            }
        );

    }


    if (backRoomButton) {

        backRoomButton.addEventListener(
            "click",
            () => {

                changeScreen("room");

            }
        );

    }

}


/* =========================================================
   6. 暗転付き画面切り替え
   ========================================================= */

async function changeScreen(screenName) {

    if (!SCREENS[screenName]) {

        console.error(
            `画面が登録されていません: ${screenName}`
        );

        return;

    }


    if (isSceneChanging) {
        return;
    }


    isSceneChanging = true;


    document.body.classList.add(
        "scene-changing"
    );


    await wait(
        SCENE_FADE_TIME
    );


    activateScreen(
        screenName
    );


    window.scrollTo(
        0,
        0
    );


    document.body.classList.remove(
        "scene-changing"
    );


    await wait(
        SCENE_FADE_TIME
    );


    isSceneChanging = false;

}


/* =========================================================
   7. 画面表示
   ========================================================= */

function activateScreen(screenName) {

    const targetScreenId =
        SCREENS[screenName];


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

        return;

    }


    targetScreen.classList.add(
        "active"
    );


    targetScreen.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   8. 即時表示
   ========================================================= */

function showScreenImmediately(screenName) {

    if (!SCREENS[screenName]) {

        console.error(
            `画面が登録されていません: ${screenName}`
        );

        return;

    }


    document.body.classList.remove(
        "scene-changing"
    );


    activateScreen(
        screenName
    );

}


/* =========================================================
   9. 待機処理
   ========================================================= */

function wait(milliseconds) {

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
   10. Service Worker登録
   ========================================================= */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
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
