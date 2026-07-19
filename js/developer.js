"use strict";

/* =========================================================
   夏休みギルド Ver0.3.1
   developer.js

   開発者モード
   Player Scale Editor
   ========================================================= */


/* =========================================================
   1. 隠しコマンド設定
   ========================================================= */

const DEVELOPER_TAP_COUNT = 10;

const DEVELOPER_TAP_TIME_LIMIT = 4000;


/* =========================================================
   2. Scale設定
   ========================================================= */

const PLAYER_SCALE_STEP = 0.05;

const PLAYER_SCALE_MIN = 0.50;

const PLAYER_SCALE_MAX = 3.00;


/* =========================================================
   3. 状態
   ========================================================= */

let developerModeActive = false;

let developerModeInitialized = false;

let developerTapCounter = 0;

let developerFirstTapTime = 0;


/* =========================================================
   4. 初期化
   ========================================================= */

function initDeveloperMode() {

    if (developerModeInitialized) {

        console.warn(
            "Developer Modeはすでに初期化されています。"
        );

        return;

    }


    const gameTitle =
        document.getElementById("gameTitle");


    const developerPanel =
        document.getElementById(
            "developerPanel"
        );


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


    developerPanel.hidden = true;

    developerPanel.setAttribute(
        "aria-hidden",
        "true"
    );


    developerPanel.classList.remove(
        "developer-panel-open"
    );


    buildDeveloperPanel();


    gameTitle.addEventListener(
        "click",
        handleDeveloperTitleTap
    );


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
   5. Developer Panelの作成
   ========================================================= */

function buildDeveloperPanel() {

    const developerPanel =
        document.getElementById(
            "developerPanel"
        );


    if (!developerPanel) {
        return;
    }


    developerPanel.innerHTML = `

        <div class="developer-panel-header">

            <div>

                <p class="developer-kicker">
                    SUMMER GUILD EDITOR
                </p>

                <h2>
                    開発者モード
                </h2>

            </div>


            <button
                id="closeDeveloperMode"
                class="developer-close-button"
                type="button"
                aria-label="開発者モードを閉じる"
            >
                ×
            </button>

        </div>


        <div id="developerContent">

            <section class="developer-editor-section">

                <div class="developer-section-heading">

                    <span class="developer-section-icon">
                        👤
                    </span>

                    <div>

                        <h3>
                            Player
                        </h3>

                        <p>
                            主人公の表示倍率
                        </p>

                    </div>

                </div>


                <div class="developer-control">

                    <div class="developer-control-label">

                        <span>
                            Scale
                        </span>

                        <span class="developer-save-status">
                            自動保存
                        </span>

                    </div>


                    <div class="developer-stepper">

                        <button
                            id="decreasePlayerScale"
                            class="developer-step-button"
                            type="button"
                            aria-label="主人公を小さくする"
                        >
                            −
                        </button>


                        <output
                            id="playerScaleValue"
                            class="developer-value"
                            aria-live="polite"
                        >
                            1.65
                        </output>


                        <button
                            id="increasePlayerScale"
                            class="developer-step-button"
                            type="button"
                            aria-label="主人公を大きくする"
                        >
                            ＋
                        </button>

                    </div>


                    <p class="developer-control-note">
                        0.05ずつ変更します
                    </p>

                </div>


                <button
                    id="resetPlayerScale"
                    class="developer-secondary-button"
                    type="button"
                >
                    Scaleを初期値へ戻す
                </button>

            </section>


            <p class="developer-next-message">
                X・Y位置調整とsettings.json出力は、
                次の段階で追加します。
            </p>


            <button
                id="exitDeveloperMode"
                class="developer-exit-button"
                type="button"
            >
                開発者モードを終了
            </button>

        </div>

    `;


    bindDeveloperPanelButtons();

    updateDeveloperValues();

}


/* =========================================================
   6. パネル内ボタンの設定
   ========================================================= */

function bindDeveloperPanelButtons() {

    const closeButton =
        document.getElementById(
            "closeDeveloperMode"
        );


    const exitButton =
        document.getElementById(
            "exitDeveloperMode"
        );


    const decreaseScaleButton =
        document.getElementById(
            "decreasePlayerScale"
        );


    const increaseScaleButton =
        document.getElementById(
            "increasePlayerScale"
        );


    const resetScaleButton =
        document.getElementById(
            "resetPlayerScale"
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


    if (decreaseScaleButton) {

        decreaseScaleButton.addEventListener(
            "click",
            () => {
                changePlayerScale(
                    -PLAYER_SCALE_STEP
                );
            }
        );

    }


    if (increaseScaleButton) {

        increaseScaleButton.addEventListener(
            "click",
            () => {
                changePlayerScale(
                    PLAYER_SCALE_STEP
                );
            }
        );

    }


    if (resetScaleButton) {

        resetScaleButton.addEventListener(
            "click",
            resetPlayerScale
        );

    }

}


/* =========================================================
   7. Scale変更
   ========================================================= */

function changePlayerScale(amount) {

    if (
        typeof getPlayerSettings
        !== "function"
    ) {

        console.error(
            "getPlayerSettings() が見つかりません。"
        );

        return;

    }


    if (
        typeof updatePlayerSettings
        !== "function"
    ) {

        console.error(
            "updatePlayerSettings() が見つかりません。"
        );

        return;

    }


    const playerSettings =
        getPlayerSettings();


    const currentScale =
        Number(playerSettings.scale);


    const safeCurrentScale =
        Number.isFinite(currentScale)
            ? currentScale
            : 1.65;


    const nextScale =
        clampNumber(

            safeCurrentScale + amount,

            PLAYER_SCALE_MIN,

            PLAYER_SCALE_MAX

        );


    updatePlayerSettings({

        scale: roundToTwoDecimals(
            nextScale
        )

    });


    updateDeveloperValues();

}


/* =========================================================
   8. Scale初期化
   ========================================================= */

function resetPlayerScale() {

    const defaultScale =
        Number(
            DEFAULT_SETTINGS.player.scale
        );


    updatePlayerSettings({

        scale: defaultScale

    });


    updateDeveloperValues();

}


/* =========================================================
   9. 表示値更新
   ========================================================= */

function updateDeveloperValues() {

    const scaleOutput =
        document.getElementById(
            "playerScaleValue"
        );


    if (!scaleOutput) {
        return;
    }


    const playerSettings =
        getPlayerSettings();


    const scale =
        Number(playerSettings.scale);


    scaleOutput.textContent =
        Number.isFinite(scale)
            ? scale.toFixed(2)
            : "1.65";

}


/* =========================================================
   10. タイトル10回タップ
   ========================================================= */

function handleDeveloperTitleTap() {

    if (developerModeActive) {
        return;
    }


    const currentTime =
        Date.now();


    if (developerTapCounter === 0) {

        developerFirstTapTime =
            currentTime;

    }


    if (
        currentTime - developerFirstTapTime
        > DEVELOPER_TAP_TIME_LIMIT
    ) {

        developerTapCounter = 0;

        developerFirstTapTime =
            currentTime;

    }


    developerTapCounter += 1;


    if (
        developerTapCounter
        >= DEVELOPER_TAP_COUNT
    ) {

        resetDeveloperTapState();

        openDeveloperMode();

    }

}


/* =========================================================
   11. 開く
   ========================================================= */

function openDeveloperMode() {

    const developerPanel =
        document.getElementById(
            "developerPanel"
        );


    if (
        !developerPanel
        || developerModeActive
    ) {

        return;

    }


    developerModeActive = true;


    updateDeveloperValues();


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


    const closeButton =
        document.getElementById(
            "closeDeveloperMode"
        );


    if (closeButton) {

        closeButton.focus({
            preventScroll: true
        });

    }


    console.log(
        "Developer Mode ON"
    );

}


/* =========================================================
   12. 閉じる
   ========================================================= */

function closeDeveloperMode() {

    const developerPanel =
        document.getElementById(
            "developerPanel"
        );


    if (
        !developerPanel
        || !developerModeActive
    ) {

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


    console.log(
        "Developer Mode OFF"
    );

}


/* =========================================================
   13. タップ状態初期化
   ========================================================= */

function resetDeveloperTapState() {

    developerTapCounter = 0;

    developerFirstTapTime = 0;

}


/* =========================================================
   14. キーボード操作
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
   15. 補助関数
   ========================================================= */

function clampNumber(
    value,
    minimum,
    maximum
) {

    return Math.min(
        Math.max(value, minimum),
        maximum
    );

}


function roundToTwoDecimals(value) {

    return Math.round(
        value * 100
    ) / 100;

}


/* =========================================================
   16. 開発者モード状態取得
   ========================================================= */

function isDeveloperModeActive() {

    return developerModeActive;

}
