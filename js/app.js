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

    mathguild:
        "mathguild-screen",

    socialguild:
        "socialguild-screen",

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


    if (
        window.GuildMusicPlayer
        && typeof window.GuildMusicPlayer.init
            === "function"
    ) {

        window.GuildMusicPlayer.init();

    }


    if (
        window.QuestMusicPlayer
        && typeof window.QuestMusicPlayer.init
            === "function"
    ) {

        window.QuestMusicPlayer.init();

    }


    if (
        typeof window.initMusicShop
        === "function"
    ) {

        window.initMusicShop();

    }

    if (window.BlackDogPet && typeof window.BlackDogPet.init === "function") {
        window.BlackDogPet.init();
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
      算数ギルド
    */

    bindActionButton(
        [
            "gotoMathGuild"
        ],
        () => {
            if (window.MathGuild && typeof window.MathGuild.open === "function") {
                window.MathGuild.open();
            }
        }
    );


    bindScreenButton(
        [
            "backGuildHallFromMath"
        ],
        "guildhall"
    );


    /* ギルドホール → 社会ギルド */
    bindActionButton(["gotoSocialGuild"], () => {
        if (window.SocialGuild && typeof window.SocialGuild.open === "function") {
            window.SocialGuild.open();
        }
    });

    bindScreenButton(["backGuildHallFromSocial"], "guildhall");


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


    if (
        typeof window.initMusicShop
        === "function"
    ) {

        window.initMusicShop();

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


    if (
        resultData
        && resultData.questId === "hyakumasu"
    ) {

        await playHyakumasuResultSequence(
            resultData
        );

    }

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


    resetHyakumasuResultLayout();


    const resultWindowElement =
        document.querySelector(
            "#result-screen .result-window"
        );


    if (resultWindowElement) {

        resultWindowElement.classList.toggle(
            "review-result-window",
            typeof safeData.questId === "string"
                && safeData.questId.startsWith("review-")
        );

    }


    const resultMessageElement =
        document.getElementById(
            "resultMessage"
        );
    const rewardPanelElement =
        document.querySelector(
            "#result-screen .reward-panel"
        );
    const totalGpElement =
        document.getElementById(
            "totalGpText"
        );
    const resultBackButton =
        document.getElementById(
            "resultBackQuestBoard"
        );


    if (resultMessageElement) {

        resultMessageElement.classList.remove(
            "hyakumasu-result-sequence"
        );

    }


    if (rewardPanelElement) {

        rewardPanelElement.hidden = false;
        rewardPanelElement.classList.remove(
            "reward-panel-final"
        );

    }


    if (totalGpElement) {

        totalGpElement.hidden = false;

    }


    if (resultBackButton) {

        resultBackButton.hidden = false;
        resultBackButton.classList.remove(
            "result-back-ready"
        );

    }


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
   13-2. 百マス計算 結果査定演出
   ========================================================= */

function waitForResultStep(
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


function formatHyakumasuResultTime(
    secondsValue
) {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                Number(secondsValue) || 0
            )
        );


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    return minutes > 0
        ? `${minutes}分${seconds}秒`
        : `${seconds}秒`;

}


function createResultPointTable(
    rows,
    currentValue
) {

    return `
        <div class="result-point-table">
            ${rows.map(
                (row) => `
                    <div class="result-point-row ${row.value === currentValue ? "current" : ""}">
                        <span>${row.label}</span>
                        <strong>${row.value} pt</strong>
                        ${row.value === currentValue ? '<em>今回</em>' : ''}
                    </div>
                `
            ).join("")}
        </div>
    `;

}


function getHyakumasuNearMessage(
    data
) {

    const messages = [];
    const elapsedSeconds =
        Math.max(
            0,
            Math.floor(
                Number(data.elapsedSeconds) || 0
            )
        );
    const correctCount =
        Math.max(
            0,
            Math.floor(
                Number(data.correctCount) || 0
            )
        );


    if (
        elapsedSeconds > 120
        && elapsedSeconds <= 135
    ) {

        messages.push(
            `あと${elapsedSeconds - 120}秒でスピードポイント3！`
        );

    } else if (
        elapsedSeconds > 240
        && elapsedSeconds <= 270
    ) {

        messages.push(
            `あと${elapsedSeconds - 240}秒でスピードポイント2！`
        );

    }


    if (
        correctCount < 100
        && correctCount >= 95
    ) {

        messages.push(
            `あと${100 - correctCount}問で全問正解！`
        );

    } else if (
        correctCount <= 70
        && correctCount >= 66
    ) {

        messages.push(
            `あと${71 - correctCount}問で正解率ポイント2！`
        );

    } else if (
        correctCount <= 60
        && correctCount >= 56
    ) {

        messages.push(
            `あと${61 - correctCount}問で正解率ポイント1！`
        );

    }


    return messages;

}



function resetHyakumasuResultLayout() {

    const resultWindow =
        document.querySelector(
            "#result-screen .result-window"
        );
    const rightWindow =
        document.getElementById(
            "hyakumasuRewardWindow"
        );


    if (
        !resultWindow
        || !rightWindow
    ) {

        return;

    }


    const label =
        rightWindow.querySelector(
            ".result-label"
        );
    const title =
        rightWindow.querySelector(
            "#resultTitle"
        );
    const rewardPanel =
        rightWindow.querySelector(
            ".reward-panel"
        );
    const totalGpText =
        rightWindow.querySelector(
            "#totalGpText"
        );
    const backButton =
        rightWindow.querySelector(
            "#resultBackQuestBoard"
        );
    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if (label) {
        resultWindow.insertBefore(
            label,
            resultMessage
        );
    }

    if (title) {
        resultWindow.insertBefore(
            title,
            resultMessage
        );
    }

    if (rewardPanel) {
        resultWindow.appendChild(
            rewardPanel
        );
    }

    if (totalGpText) {
        resultWindow.appendChild(
            totalGpText
        );
    }

    if (backButton) {
        resultWindow.appendChild(
            backButton
        );
    }


    rightWindow.remove();
    resultWindow.classList.remove(
        "hyakumasu-two-window"
    );

}


function createHyakumasuTwoWindowLayout() {

    resetHyakumasuResultLayout();


    const resultWindow =
        document.querySelector(
            "#result-screen .result-window"
        );
    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if (
        !resultWindow
        || !resultMessage
    ) {

        return null;

    }


    const rightWindow =
        document.createElement(
            "section"
        );

    rightWindow.id =
        "hyakumasuRewardWindow";
    rightWindow.className =
        "hyakumasu-reward-window";


    const movableSelectors = [
        ".result-label",
        "#resultTitle",
        ".reward-panel",
        "#totalGpText",
        "#resultBackQuestBoard"
    ];


    movableSelectors.forEach(
        (selector) => {

            const element =
                resultWindow.querySelector(
                    `:scope > ${selector}`
                );


            if (element) {

                rightWindow.appendChild(
                    element
                );

            }

        }
    );


    const summary =
        document.createElement(
            "div"
        );

    summary.id =
        "hyakumasuRewardSummary";
    summary.className =
        "hyakumasu-reward-summary";


    const rewardPanel =
        rightWindow.querySelector(
            ".reward-panel"
        );


    if (rewardPanel) {

        rightWindow.insertBefore(
            summary,
            rewardPanel
        );

    } else {

        rightWindow.appendChild(
            summary
        );

    }


    resultWindow.appendChild(
        rightWindow
    );
    resultWindow.classList.add(
        "hyakumasu-two-window"
    );


    return summary;

}


async function playHyakumasuResultSequence(
    resultData
) {

    const container =
        document.getElementById(
            "resultMessage"
        );
    const rewardPanel =
        document.querySelector(
            "#result-screen .reward-panel"
        );
    const totalGpText =
        document.getElementById(
            "totalGpText"
        );
    const backButton =
        document.getElementById(
            "resultBackQuestBoard"
        );
    const rewardSummary =
        createHyakumasuTwoWindowLayout();


    if (!container) {

        return;

    }


    const raw =
        resultData.rawCompletionData
        && typeof resultData.rawCompletionData === "object"
            ? resultData.rawCompletionData
            : {};
    const accuracyPoint =
        Math.max(
            0,
            Math.floor(
                Number(raw.accuracyPoint) || 0
            )
        );
    const speedPoint =
        Math.max(
            1,
            Math.floor(
                Number(raw.speedPoint) || 1
            )
        );
    const performanceReward =
        accuracyPoint * speedPoint;
    const dailyReward =
        resultData.firstClear
            ? Math.max(
                0,
                Math.floor(
                    Number(resultData.baseReward) || 0
                )
            )
            : 0;
    const totalReward =
        Math.max(
            0,
            Math.floor(
                Number(resultData.reward) || 0
            )
        );
    const totalGp =
        Math.max(
            0,
            Math.floor(
                Number(resultData.totalGp) || 0
            )
        );
    const previousGp =
        Math.max(
            0,
            totalGp - totalReward
        );
    const accuracyPercent =
        Math.max(
            0,
            Math.min(
                100,
                Math.floor(
                    Number(raw.accuracyPercent)
                    || (
                        Number(resultData.correctCount) || 0
                    )
                )
            )
        );
    const nearMessages =
        getHyakumasuNearMessage(
            resultData
        );
    const incorrectAnswers =
        Array.isArray(raw.incorrectAnswers)
            ? raw.incorrectAnswers
            : [];


    container.innerHTML = "";
    container.classList.add(
        "hyakumasu-result-sequence"
    );


    if (rewardPanel) {

        rewardPanel.hidden = true;

    }


    if (totalGpText) {

        totalGpText.hidden = true;

    }


    if (backButton) {

        backButton.hidden = true;

    }


    const leftSteps = [
        {
            className: "time",
            html: `
                <span class="result-step-icon">⏱</span>
                <div>
                    <small>タイム</small>
                    <strong>${formatHyakumasuResultTime(resultData.elapsedSeconds)}</strong>
                    ${createResultPointTable(
                        [
                            { label: "120秒以内", value: 3 },
                            { label: "240秒以内", value: 2 },
                            { label: "240秒超", value: 1 }
                        ],
                        speedPoint
                    )}
                </div>
            `
        },
        {
            className: "accuracy",
            html: `
                <span class="result-step-icon">📖</span>
                <div>
                    <small>正解率</small>
                    <strong>${accuracyPercent}％（${resultData.correctCount || 0} / ${resultData.totalQuestions || 100}）</strong>
                    ${createResultPointTable(
                        [
                            { label: "100％", value: 3 },
                            { label: "71〜99％", value: 2 },
                            { label: "61〜70％", value: 1 },
                            { label: "60％以下", value: 0 }
                        ],
                        accuracyPoint
                    )}
                </div>
            `
        }
    ];


    const rightSteps = [
        {
            className: "daily",
            html: `
                <span class="result-step-icon">🌞</span>
                <div>
                    <small>デイリー初回</small>
                    <strong>${resultData.firstClear ? `今日初クリア　+${dailyReward}GP` : "今日は受け取り済み"}</strong>
                </div>
            `
        },
        {
            className: "calculation",
            html: `
                <span class="result-step-icon">🧮</span>
                <div>
                    <small>ギルド査定</small>
                    <strong>${accuracyPoint} × ${speedPoint} ＝ ${performanceReward}GP</strong>
                    <p>正解率ポイント × スピードポイント</p>
                </div>
            `
        }
    ];


    for (
        const step
        of leftSteps
    ) {

        const card =
            document.createElement(
                "section"
            );

        card.className =
            `result-step-card ${step.className}`;
        card.innerHTML =
            step.html;
        container.appendChild(
            card
        );

        await waitForResultStep(
            420
        );

    }


    if (rewardSummary) {

        for (
            const step
            of rightSteps
        ) {

            const card =
                document.createElement(
                    "section"
                );

            card.className =
                `result-step-card ${step.className}`;
            card.innerHTML =
                step.html;
            rewardSummary.appendChild(
                card
            );

            await waitForResultStep(
                360
            );

        }

    }


    if (nearMessages.length > 0) {

        const nearCard =
            document.createElement(
                "section"
            );

        nearCard.className =
            "result-step-card near";
        nearCard.innerHTML = `
            <span class="result-step-icon">✨</span>
            <div>
                <small>おしい！</small>
                <strong>${nearMessages.join("<br>")}</strong>
            </div>
        `;
        container.appendChild(
            nearCard
        );

        await waitForResultStep(
            360
        );

    }


    const mistakeCard =
        document.createElement(
            "section"
        );

    mistakeCard.className =
        "result-step-card mistakes";


    if (incorrectAnswers.length === 0) {

        mistakeCard.innerHTML = `
            <span class="result-step-icon">🌟</span>
            <div>
                <small>まちがい</small>
                <strong>全問正解！</strong>
                <p>まちがえた問題はありません。</p>
            </div>
        `;

    } else {

        const mistakeRows =
            incorrectAnswers
                .map(
                    (item) => `
                        <li>
                            <strong>${item.rowNumber}＋${item.columnNumber}</strong>
                            <span>入力 ${item.userAnswer} → 正解 ${item.correctAnswer}</span>
                        </li>
                    `
                )
                .join("");

        mistakeCard.innerHTML = `
            <span class="result-step-icon">📝</span>
            <div class="result-mistakes-content">
                <small>まちがえた問題　${incorrectAnswers.length}問</small>
                <ul class="result-mistake-list">
                    ${mistakeRows}
                </ul>
            </div>
        `;

    }


    container.appendChild(
        mistakeCard
    );


    await waitForResultStep(
        360
    );


    if (rewardPanel) {

        rewardPanel.hidden = false;
        rewardPanel.classList.add(
            "reward-panel-final"
        );

    }


    setTextIfExists(
        "rewardText",
        `+${totalReward}GP`
    );


    if (totalGpText) {

        totalGpText.hidden = false;
        totalGpText.textContent =
            `所持GP：${previousGp}`;

    }


    await waitForResultStep(
        320
    );


    const countDuration = 760;
    const countStartedAt =
        performance.now();


    await new Promise(
        (resolve) => {

            function updateCount(
                now
            ) {

                const progress =
                    Math.min(
                        1,
                        (
                            now - countStartedAt
                        )
                        / countDuration
                    );
                const currentGp =
                    Math.round(
                        previousGp
                        + (
                            totalGp - previousGp
                        )
                        * progress
                    );


                if (totalGpText) {

                    totalGpText.textContent =
                        `所持GP：${currentGp}`;

                }


                if (progress < 1) {

                    window.requestAnimationFrame(
                        updateCount
                    );

                } else {

                    resolve();

                }

            }


            window.requestAnimationFrame(
                updateCount
            );

        }
    );


    if (backButton) {

        backButton.hidden = false;
        backButton.classList.add(
            "result-back-ready"
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


    if (
        window.GuildMusicPlayer
        && typeof window.GuildMusicPlayer.handleScreenChange
            === "function"
    ) {

        window.GuildMusicPlayer.handleScreenChange(
            screenName
        );

    }

    if (window.BlackDogPet && typeof window.BlackDogPet.handleScreenChange === "function") {
        window.BlackDogPet.handleScreenChange(screenName);
    }


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

    if (!("serviceWorker" in navigator)) {
        console.warn("このブラウザはService Workerに対応していません。");
        setupManualUpdateButton(null);
        return;
    }

    const BUILD_VERSION = "2026.07.22-mathguild1";
    const RELOAD_KEY = `summerGuildSwReloaded:${BUILD_VERSION}`;

    const reloadOnceForNewWorker = () => {
        if (sessionStorage.getItem(RELOAD_KEY) === "1") {
            return;
        }

        sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
        "controllerchange",
        reloadOnceForNewWorker
    );

    navigator.serviceWorker.addEventListener(
        "message",
        (event) => {
            if (event.data?.type === "SUMMER_GUILD_SW_ACTIVATED") {
                reloadOnceForNewWorker();
            }
        }
    );

    window.addEventListener(
        "load",
        async () => {
            try {
                const registration = await navigator.serviceWorker.register(
                    "./service-worker.js",
                    {
                        updateViaCache: "none"
                    }
                );

                console.log(
                    "Service Worker登録成功:",
                    registration.scope
                );

                setupManualUpdateButton(registration);
                watchForServiceWorkerUpdate(registration);

                await registration.update();

                if (registration.waiting) {
                    registration.waiting.postMessage({
                        type: "SKIP_WAITING"
                    });
                }
            } catch (error) {
                console.error("Service Worker登録失敗:", error);
                setupManualUpdateButton(null);
            }
        },
        { once: true }
    );
}


function watchForServiceWorkerUpdate(registration) {

    registration.addEventListener(
        "updatefound",
        () => {
            const worker = registration.installing;

            if (!worker) {
                return;
            }

            setUpdateStatus("最新版を準備しています…");

            worker.addEventListener(
                "statechange",
                () => {
                    if (
                        worker.state === "installed"
                        && navigator.serviceWorker.controller
                    ) {
                        setUpdateStatus("最新版へ切り替えます…");
                        worker.postMessage({ type: "SKIP_WAITING" });
                    }
                }
            );
        }
    );
}


function setupManualUpdateButton(registration) {

    const button = document.getElementById("checkUpdateButton");

    if (!button || button.dataset.bound === "true") {
        return;
    }

    button.dataset.bound = "true";

    button.addEventListener(
        "click",
        async () => {
            if (!registration) {
                setUpdateStatus("更新確認を利用できません");
                return;
            }

            button.disabled = true;
            setUpdateStatus("最新版を確認しています…");

            try {
                await registration.update();

                if (registration.waiting) {
                    setUpdateStatus("最新版へ切り替えます…");
                    registration.waiting.postMessage({
                        type: "SKIP_WAITING"
                    });
                    return;
                }

                setUpdateStatus("最新版です");
            } catch (error) {
                console.error("更新確認に失敗:", error);
                setUpdateStatus("通信後にもう一度お試しください");
            } finally {
                window.setTimeout(() => {
                    button.disabled = false;
                }, 1200);
            }
        }
    );
}


function setUpdateStatus(message) {

    const status = document.getElementById("updateStatusText");

    if (!status) {
        return;
    }

    status.textContent = message;
}

