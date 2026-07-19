"use strict";

/* =========================================================
   夏休みギルド Ver0.3
   app.js

   ゲーム全体の起動
   画面切り替え
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

document.addEventListener("DOMContentLoaded", () => {
    initGame();
});


function initGame() {

    /*
      保存済み設定を読み込む。
    */

    if (typeof loadSettings === "function") {
        loadSettings();
    } else {
        console.warn(
            "loadSettings() が見つかりません。settings.jsを確認してください。"
        );
    }


    /*
      Developer Modeを初期化する。
    */

    if (typeof initDeveloperMode === "function") {
        initDeveloperMode();
    } else {
        console.warn(
            "initDeveloperMode() が見つかりません。developer.jsを確認してください。"
        );
    }


    /*
      ゲーム本体を初期化する。
    */

    bindButtons();

    showScreenImmediately("title");

    registerServiceWorker();


    console.log(
        "夏休みギルド Ver0.3 起動"
    );
}


/* =========================================================
   4. ボタン設定
   ========================================================= */

function bindButtons() {

    const startButton =
        document.getElementById("startButton");

    const gotoGuildHallButton =
        document.getElementById("gotoGuildHall");

    const backRoomButton =
        document.getElementById("backRoom");


    /*
      タイトル
      ↓
      自分の部屋
    */

    if (startButton) {

        startButton.addEventListener(
            "click",
            () => {
                changeScreen("room");
            }
        );

    } else {

        console.warn(
            "#startButton が見つかりません。"
        );

    }


    /*
      自分の部屋
      ↓
      ギルドホール
    */

    if (gotoGuildHallButton) {

        gotoGuildHallButton.addEventListener(
            "click",
            () => {
                changeScreen("guildhall");
            }
        );

    } else {

        console.warn(
            "#gotoGuildHall が見つかりません。"
        );

    }


    /*
      ギルドホール
      ↓
      自分の部屋
    */

    if (backRoomButton) {

        backRoomButton.addEventListener(
            "click",
            () => {
                changeScreen("room");
            }
        );

    } else {

        console.warn(
            "#backRoom が見つかりません。"
        );

    }

}


/* =========================================================
   5. 暗転付き画面切り替え
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
   6. 画面表示
   ========================================================= */

function activateScreen(screenName) {

    const targetScreenId =
        SCREENS[screenName];


    const screens =
        document.querySelectorAll(".screen");


    screens.forEach((screen) => {

        screen.classList.remove(
            "active"
        );

        screen.setAttribute(
            "aria-hidden",
            "true"
        );

    });


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


/*
  起動時などに、
  暗転なしで即座に表示する。
*/

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
   7. 待機処理
   ========================================================= */

function wait(milliseconds) {

    return new Promise((resolve) => {

        window.setTimeout(
            resolve,
            milliseconds
        );

    });

}


/* =========================================================
   8. Service Worker登録
   ========================================================= */

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {

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
                    await navigator.serviceWorker.register(
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
