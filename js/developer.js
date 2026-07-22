"use strict";

/* =========================================================
   夏休みギルド Ver0.3.2
   developer.js

   開発者モード
   Player Position Editor
   settings.json出力
   ========================================================= */


/* =========================================================
   1. 隠しコマンド設定
   ========================================================= */

const DEVELOPER_TAP_COUNT = 10;

const DEVELOPER_TAP_TIME_LIMIT = 4000;


/* =========================================================
   2. プレイヤー調整値
   ========================================================= */

const PLAYER_SCALE_STEP = 0.05;

const PLAYER_SCALE_MIN = 0.50;

const PLAYER_SCALE_MAX = 3.00;


const PLAYER_X_STEP = 1;

const PLAYER_X_MIN = 0;

const PLAYER_X_MAX = 100;


const PLAYER_Y_STEP = 1;

const PLAYER_Y_MIN = -40;

const PLAYER_Y_MAX = 60;


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
        document.getElementById(
            "gameTitle"
        );


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
   5. Developer Panel作成
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
                            主人公の大きさと位置
                        </p>

                    </div>

                </div>


                <!-- Scale -->

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
                        >
                            −
                        </button>


                        <output
                            id="playerScaleValue"
                            class="developer-value"
                            aria-live="polite"
                        >
                            1.20
                        </output>


                        <button
                            id="increasePlayerScale"
                            class="developer-step-button"
                            type="button"
                        >
                            ＋
                        </button>

                    </div>

                </div>


                <!-- X位置 -->

                <div class="developer-control">

                    <div class="developer-control-label">

                        <span>
                            X位置
                        </span>

                        <span class="developer-control-unit">
                            %
                        </span>

                    </div>


                    <div class="developer-stepper">

                        <button
                            id="decreasePlayerX"
                            class="developer-step-button"
                            type="button"
                            aria-label="主人公を左へ動かす"
                        >
                            ←
                        </button>


                        <output
                            id="playerXValue"
                            class="developer-value"
                            aria-live="polite"
                        >
                            50
                        </output>


                        <button
                            id="increasePlayerX"
                            class="developer-step-button"
                            type="button"
                            aria-label="主人公を右へ動かす"
                        >
                            →
                        </button>

                    </div>

                </div>


                <!-- Y位置 -->

                <div class="developer-control">

                    <div class="developer-control-label">

                        <span>
                            Y位置
                        </span>

                        <span class="developer-control-unit">
                            %
                        </span>

                    </div>


                    <div class="developer-stepper">

                        <button
                            id="decreasePlayerY"
                            class="developer-step-button"
                            type="button"
                            aria-label="主人公を下へ動かす"
                        >
                            ↓
                        </button>


                        <output
                            id="playerYValue"
                            class="developer-value"
                            aria-live="polite"
                        >
                            -7
                        </output>


                        <button
                            id="increasePlayerY"
                            class="developer-step-button"
                            type="button"
                            aria-label="主人公を上へ動かす"
                        >
                            ↑
                        </button>

                    </div>

                </div>


                <button
                    id="resetPlayerPosition"
                    class="developer-secondary-button"
                    type="button"
                >
                    Playerを初期位置へ戻す
                </button>

            </section>


            <!-- JSON出力 -->

            <section class="developer-export-section">

                <div class="developer-section-heading">

                    <span class="developer-section-icon">
                        📄
                    </span>

                    <div>

                        <h3>
                            settings.json
                        </h3>

                        <p>
                            現在の調整値を書き出す
                        </p>

                    </div>

                </div>


                <div class="developer-export-buttons">

                    <button
                        id="copySettingsJson"
                        class="developer-copy-button"
                        type="button"
                    >
                        JSONをコピー
                    </button>


                    <button
                        id="downloadSettingsJson"
                        class="developer-download-button"
                        type="button"
                    >
                        settings.jsonを保存
                    </button>

                </div>


                <p
                    id="developerExportMessage"
                    class="developer-export-message"
                    aria-live="polite"
                >
                    GitHubへ反映するときに使用します。
                </p>

            </section>


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
   6. ボタン設定
   ========================================================= */

function bindDeveloperPanelButtons() {

    bindClick(
        "closeDeveloperMode",
        closeDeveloperMode
    );


    bindClick(
        "exitDeveloperMode",
        closeDeveloperMode
    );


    bindClick(
        "decreasePlayerScale",
        () => {

            changePlayerSetting(
                "scale",
                -PLAYER_SCALE_STEP,
                PLAYER_SCALE_MIN,
                PLAYER_SCALE_MAX,
                2
            );

        }
    );


    bindClick(
        "increasePlayerScale",
        () => {

            changePlayerSetting(
                "scale",
                PLAYER_SCALE_STEP,
                PLAYER_SCALE_MIN,
                PLAYER_SCALE_MAX,
                2
            );

        }
    );


    bindClick(
        "decreasePlayerX",
        () => {

            changePlayerSetting(
                "x",
                -PLAYER_X_STEP,
                PLAYER_X_MIN,
                PLAYER_X_MAX,
                0
            );

        }
    );


    bindClick(
        "increasePlayerX",
        () => {

            changePlayerSetting(
                "x",
                PLAYER_X_STEP,
                PLAYER_X_MIN,
                PLAYER_X_MAX,
                0
            );

        }
    );


    bindClick(
        "decreasePlayerY",
        () => {

            changePlayerSetting(
                "y",
                -PLAYER_Y_STEP,
                PLAYER_Y_MIN,
                PLAYER_Y_MAX,
                0
            );

        }
    );


    bindClick(
        "increasePlayerY",
        () => {

            changePlayerSetting(
                "y",
                PLAYER_Y_STEP,
                PLAYER_Y_MIN,
                PLAYER_Y_MAX,
                0
            );

        }
    );


    bindClick(
        "resetPlayerPosition",
        resetPlayerPosition
    );


    bindClick(
        "copySettingsJson",
        handleCopySettingsJson
    );


    bindClick(
        "downloadSettingsJson",
        handleDownloadSettingsJson
    );

}


/* =========================================================
   7. 共通クリック登録
   ========================================================= */

function bindClick(
    elementId,
    callback
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.addEventListener(
            "click",
            callback
        );

    }

}


/* =========================================================
   8. プレイヤー値変更
   ========================================================= */

function changePlayerSetting(
    propertyName,
    amount,
    minimum,
    maximum,
    decimalPlaces
) {

    const playerSettings =
        getPlayerSettings();


    const currentValue =
        Number(
            playerSettings[propertyName]
        );


    const safeCurrentValue =
        Number.isFinite(currentValue)
            ? currentValue
            : Number(
                DEFAULT_SETTINGS
                    .player[propertyName]
            );


    const nextValue =
        clampNumber(

            safeCurrentValue + amount,

            minimum,

            maximum

        );


    const multiplier =
        10 ** decimalPlaces;


    const roundedValue =
        Math.round(
            nextValue * multiplier
        ) / multiplier;


    updatePlayerSettings({

        [propertyName]:
            roundedValue

    });


    updateDeveloperValues();

}


/* =========================================================
   9. Player初期化
   ========================================================= */

function resetPlayerPosition() {

    updatePlayerSettings({

        x:
            DEFAULT_SETTINGS.player.x,

        y:
            DEFAULT_SETTINGS.player.y,

        scale:
            DEFAULT_SETTINGS.player.scale

    });


    updateDeveloperValues();


    showExportMessage(
        "Playerを初期値へ戻しました。",
        "success"
    );

}


/* =========================================================
   10. 表示値更新
   ========================================================= */

function updateDeveloperValues() {

    const playerSettings =
        getPlayerSettings();


    setOutputValue(
        "playerScaleValue",
        Number(
            playerSettings.scale
        ).toFixed(2)
    );


    setOutputValue(
        "playerXValue",
        Math.round(
            Number(playerSettings.x)
        )
    );


    setOutputValue(
        "playerYValue",
        Math.round(
            Number(playerSettings.y)
        )
    );

}


/* =========================================================
   11. output更新
   ========================================================= */

function setOutputValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            String(value);

    }

}


/* =========================================================
   12. JSONコピー
   ========================================================= */

async function handleCopySettingsJson() {

    const success =
        await copySettingsJson();


    if (success) {

        showExportMessage(
            "settings.jsonの内容をコピーしました。",
            "success"
        );

    } else {

        showExportMessage(
            "コピーできませんでした。",
            "error"
        );

    }

}


/* =========================================================
   13. JSONダウンロード
   ========================================================= */

function handleDownloadSettingsJson() {

    const success =
        downloadSettingsJson();


    if (success) {

        showExportMessage(
            "settings.jsonを書き出しました。",
            "success"
        );

    } else {

        showExportMessage(
            "書き出しに失敗しました。",
            "error"
        );

    }

}


/* =========================================================
   14. 出力メッセージ
   ========================================================= */

function showExportMessage(
    message,
    status
) {

    const messageElement =
        document.getElementById(
            "developerExportMessage"
        );


    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;


    messageElement.dataset.status =
        status;


    window.setTimeout(
        () => {

            messageElement.textContent =
                "GitHubへ反映するときに使用します。";


            delete messageElement.dataset.status;

        },
        3000
    );

}


/* =========================================================
   15. タイトル10回タップ
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
   16. 開く
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


    console.log(
        "Developer Mode ON"
    );

}


/* =========================================================
   17. 閉じる
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
   18. 補助処理
   ========================================================= */

function resetDeveloperTapState() {

    developerTapCounter = 0;

    developerFirstTapTime = 0;

}


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


/* =========================================================
   19. キーボード
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
   20. 状態取得
   ========================================================= */

function isDeveloperModeActive() {

    return developerModeActive;

}
