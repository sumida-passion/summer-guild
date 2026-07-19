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


/* =========================================================
   3. 初期化
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initDeveloperMode();
});


function initDeveloperMode() {
    const gameTitle =
        document.getElementById("gameTitle");

    const developerPanel =
        document.getElementById("developerPanel");


    /*
      必要なHTML要素が存在しない場合は、
      ゲーム本体を止めずに開発者モードだけ無効にする。
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
      CSSがまだ読み込まれていない状態でも、
      起動時に開発者パネルが見えないようにする。
    */

    developerPanel.hidden = true;

    developerPanel.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
      開発者パネルの中身を作る。
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
      Escキーでも閉じられるようにする。
      キーボードのある端末での開発用。
    */

    document.addEventListener(
        "keydown",
        handleDeveloperKeydown
    );


    console.log(
        "Developer Mode 準備完了"
    );
}


/* =========================================================
   4. 開発者パネルを作る
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
    const currentTime = Date.now();


    /*
      最初のタップ
    */

    if (developerTapCounter === 0) {
        developerFirstTapTime = currentTime;
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
        developerFirstTapTime = currentTime;
    }


    developerTapCounter += 1;


    /*
      指定回数に到達したら開く。
    */

    if (
        developerTapCounter
        >= DEVELOPER_TAP_COUNT
    ) {
        developerTapCounter = 0;
        developerFirstTapTime = 0;

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
      パネル内の閉じるボタンへフォーカスする。
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


    /*
      連続タップの状態も初期化する。
    */

    developerTapCounter = 0;
    developerFirstTapTime = 0;


    console.log(
        "Developer Mode OFF"
    );
}


/* =========================================================
   8. キーボード操作
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
   9. 開発者モード状態の取得
   ========================================================= */

/*
  将来、app.jsや他の機能から

  isDeveloperModeActive()

  と呼び出して、開発者モード中かどうかを
  確認できるようにしておく。
*/

function isDeveloperModeActive() {
    return developerModeActive;
}
