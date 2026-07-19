"use strict";

/* =========================================================
   夏休みギルド Ver0.3
   developer.js

   開発者モードの起動・終了・UI管理
   ========================================================= */


/* =========================================================
   1. 開発者モード基本設定
   ========================================================= */

/*
  タイトルを何回タップすると開くか
*/
const DEVELOPER_TAP_COUNT = 10;


/*
  何ミリ秒以内の連続タップを有効とするか

  4000 = 4秒
*/
const DEVELOPER_TAP_TIME_LIMIT = 4000;


/* =========================================================
   2. 開発者モードの状態
   ========================================================= */

let developerModeActive = false;

let developerTapCounter = 0;

let developerFirstTapTime = 0;

let developerModeInitialized = false;


/* =========================================================
   3. 初期化
   ========================================================= */

/*
  起動はapp.jsから行う。

  developer.js自身では
  DOMContentLoadedを監視しない。
*/

function initDeveloperMode() {

    /*
      二重初期化を防ぐ。
    */

    if (developerModeInitialized) {

        console.warn(
            "Developer Modeはすでに初期化されています。"
        );

        return;

    }


    const gameTitle =
        document.getElementById("gameTitle");

    const developerPanel =
        document.getElementById("developerPanel");


    /*
      必要なHTML要素が存在しない場合は、
      ゲーム本体を止めずに
      Developer Modeだけ無効にする。
    */

    if (!gameTitle) {

        console.warn(
            "Developer Mode: #gameTitle が見つかりません。"
        );

        return;

    }


    if (!developerPanel) {

        console.warn(
            "Developer Mode: #developerPanel が見つかりません。"
        );

        return;

    }


    /*
      起動時は完全に非表示にする。
    */

    developerPanel.hidden = true;

    developerPanel.setAttribute(
        "aria-hidden",
        "true"
    );

    developerPanel.classList.remove(
        "developer-panel-open"
    );


    /*
      Developer Panelの中身を作る。
    */

    buildDeveloperPanel();


    /*
      タイトルの連続タップを監視する。
    */

    gameTitle.addEventListener(
        "click",
        handleDeveloperTitleTap
    );


    /*
      キーボードが使える端末では
      Escキーでも閉じられるようにする。
    */

    document.addEventListener(
        "keydown",
        handleDeveloperKeydown
    );


    developerModeInitialized = true;


    console.log(
        "Developer Mode 準備完了"
    );

}


/* =========================================================
   4. Developer Panelを作る
   ========================================================= */

function buildDeveloperPanel() {

    const developerPanel =
        document.getElementById("developerPanel");


    if (!developerPanel) {
        return;
    }


    developerPanel.innerHTML = `

        <div class="developer-panel-header">

            <h2>
                ⚙ Developer Mode
            </h2>

            <button
                id="closeDeveloperMode"
                type="button"
                aria-label="開発者モードを閉じる"
            >
                ×
            </button>

        </div>


        <div id="developerContent">

            <p class="developer-status">
                開発者モードが起動しました。
            </p>

            <p class="developer-description">
                次の段階で、主人公の大きさと位置を
                画面上から調整できるようにします。
            </p>


            <div class="developer-placeholder">

                <strong>
                    Player Editor
                </strong>

                <span>
                    準備中
                </span>

            </div>


            <button
                id="exitDeveloperMode"
                type="button"
            >
                開発者モードを終了
            </button>

        </div>

    `;


    const closeButton =
        document.getElementById(
            "closeDeveloperMode"
        );

    const exitButton =
        document.getElementById(
            "exitDeveloperMode"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDeveloperMode
        );

    }


    if (exitButton) {

        exitButton.addEventListener(
            "click",
            closeDeveloperMode
        );

    }

}


/* =========================================================
   5. タイトル10回タップの判定
   ========================================================= */

function handleDeveloperTitleTap() {

    const currentTime =
        Date.now();


    /*
      Developer Modeがすでに開いている場合は
      タップ回数を数えない。
    */

    if (developerModeActive) {
        return;
    }


    /*
      最初のタップ。
    */

    if (developerTapCounter === 0) {

        developerFirstTapTime =
            currentTime;

    }


    /*
      制限時間を超えていた場合は、
      今回のタップを1回目として数え直す。
    */

    if (
        currentTime - developerFirstTapTime
        > DEVELOPER_TAP_TIME_LIMIT
    ) {

        developerTapCounter = 0;

        developerFirstTapTime =
            currentTime;

    }


    developerTapCounter += 1;


    /*
      指定回数に到達したら開く。
    */

    if (
        developerTapCounter
        >= DEVELOPER_TAP_COUNT
    ) {

        resetDeveloperTapState();

        openDeveloperMode();

    }

}


/* =========================================================
   6. 開発者モードを開く
   ========================================================= */

function openDeveloperMode() {

    const developerPanel =
        document.getElementById("developerPanel");


    if (!developerPanel) {
        return;
    }


    if (developerModeActive) {
        return;
    }


    developerModeActive = true;


    developerPanel.hidden = false;

    developerPanel.setAttribute(
        "aria-hidden",
        "false"
    );

    developerPanel.classList.add(
        "developer-panel-open"
    );


    document.body.classList.add(
        "developer-mode-active"
    );


    /*
      閉じるボタンへフォーカスする。
    */

    const closeButton =
        document.getElementById(
            "closeDeveloperMode"
        );


    if (closeButton) {

        closeButton.focus();

    }


    console.log(
        "Developer Mode ON"
    );

}


/* =========================================================
   7. 開発者モードを閉じる
   ========================================================= */

function closeDeveloperMode() {

    const developerPanel =
        document.getElementById("developerPanel");


    if (!developerPanel) {
        return;
    }


    if (!developerModeActive) {
        return;
    }


    developerModeActive = false;


    developerPanel.classList.remove(
        "developer-panel-open"
    );


    document.body.classList.remove(
        "developer-mode-active"
    );


    developerPanel.setAttribute(
        "aria-hidden",
        "true"
    );


    developerPanel.hidden = true;


    resetDeveloperTapState();


    /*
      タイトルへフォーカスを戻す。
      キーボード操作時のため。
    */

    const gameTitle =
        document.getElementById("gameTitle");


    if (gameTitle) {

        gameTitle.focus({
            preventScroll: true
        });

    }


    console.log(
        "Developer Mode OFF"
    );

}


/* =========================================================
   8. タップ状態の初期化
   ========================================================= */

function resetDeveloperTapState() {

    developerTapCounter = 0;

    developerFirstTapTime = 0;

}


/* =========================================================
   9. キーボード操作
   ========================================================= */

function handleDeveloperKeydown(event) {

    if (!developerModeActive) {
        return;
    }


    if (event.key === "Escape") {

        closeDeveloperMode();

    }

}


/* =========================================================
   10. 開発者モード状態の取得
   ========================================================= */

/*
  将来、app.jsや別の機能から

  isDeveloperModeActive()

  と呼び出して、
  Developer Mode中かどうかを確認できる。
*/

function isDeveloperModeActive() {

    return developerModeActive;

}
