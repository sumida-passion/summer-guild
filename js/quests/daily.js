"use strict";

/* =========================================================
   夏休みギルド Ver0.4.0
   daily.js

   今日のクエスト一覧
   ・百マス計算カード表示
   ・初回／繰り返し報酬表示
   ・今日の挑戦回数表示
   ・百マス計算開始
   ========================================================= */


/* =========================================================
   1. デイリークエスト定義
   ========================================================= */

const DAILY_QUESTS = [

    {

        id:
            "hyakumasu",

        title:
            "百マス計算",

        description:
            "たてとよこの数字を足して、100マスを完成させよう。",

        firstReward:
            10,

        repeatReward:
            1,

        perfectReward:
            1,

        firstPerfectBonus:
            2

    },

    {
        id: "review-training",
        title: "ふりかえりの修行",
        description: "国語・算数・理科・社会から、今日ふりかえりたい学びを自分で選ぼう。",
        firstReward: 0,
        repeatReward: 0,
        perfectReward: 0,
        firstPerfectBonus: 0
    }

];


/* =========================================================
   2. クエストボード描画
   ========================================================= */

function renderDailyQuestList() {

    const questList =
        document.getElementById(
            "dailyQuestList"
        );


    if (!questList) {

        console.error(
            "dailyQuestListが見つかりません。"
        );

        return false;

    }


    const cards =
        DAILY_QUESTS
            .map(
                createDailyQuestCardHtml
            )
            .join("");


    questList.innerHTML =
        cards;


    bindDailyQuestButtons();


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


    return true;

}


/* =========================================================
   3. クエストカード作成
   ========================================================= */

function createDailyQuestCardHtml(
    quest
) {

    if (quest.id === "review-training") {
        const status = typeof window.getReviewDailyBonusStatus === "function"
            ? window.getReviewDailyBonusStatus()
            : { basic:false, standard:false, challenge:false };
        const remaining = [status.basic, status.standard, status.challenge].filter(done => !done).length;
        return `
        <article class="quest-card" data-quest-id="${quest.id}">
            <div class="quest-card-info">
                <h3 class="quest-title">${quest.title}</h3>
                <p class="quest-description">${quest.description}</p>
                <p class="quest-reward">基礎・標準・挑戦：各レベル本日初回 +2GP ＋ 成績GP</p>
                <p class="quest-status">初回ボーナス残り ${remaining}/3</p>
            </div>
            <button class="game-button quest-start-button" type="button" data-open-review>選んで挑戦</button>
        </article>`;
    }

    const playCount =
        typeof getQuestChallengeCount
        === "function"
            ? getQuestChallengeCount(
                quest.id
            )
            : 0;


    const firstClearDone =
        playCount > 0;


    const statusText =
        firstClearDone
            ? `今日 ${playCount}回挑戦`
            : "今日まだ未挑戦";


    const statusClass =
        firstClearDone
            ? " completed"
            : "";


    const rewardText =
        firstClearDone
            ? `次のクリア：${quest.repeatReward}GP`
            : `今日初回：${quest.firstReward}GP`;


    return `
        <article
            class="quest-card${statusClass}"
            data-quest-id="${quest.id}"
        >

            <div class="quest-card-info">

                <h3 class="quest-title">
                    ${quest.title}
                </h3>

                <p class="quest-description">
                    ${quest.description}
                </p>

                <p class="quest-reward">
                    ${rewardText}
                </p>

                <p class="quest-status">
                    ${statusText}
                </p>

            </div>

            <button
                class="game-button quest-start-button"
                type="button"
                data-start-quest="${quest.id}"
            >
                挑戦する
            </button>

        </article>
    `;

}


/* =========================================================
   4. 挑戦ボタン設定
   ========================================================= */

function bindDailyQuestButtons() {

    document.querySelectorAll("[data-open-review]").forEach((button) => {
        button.addEventListener("click", () => {
            if (typeof window.openReviewTraining === "function") {
                window.openReviewTraining();
            }
        });
    });

    const buttons =
        document.querySelectorAll(
            "[data-start-quest]"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                async () => {

                    const questId =
                        button.getAttribute(
                            "data-start-quest"
                        );


                    if (
                        typeof startQuest
                        !== "function"
                    ) {

                        console.error(
                            "startQuest()が見つかりません。"
                        );

                        return;

                    }


                    button.disabled =
                        true;


                    const started =
                        await startQuest(
                            questId
                        );


                    if (!started) {

                        button.disabled =
                            false;

                    }

                }
            );

        }
    );

}


/* =========================================================
   5. windowへ公開
   ========================================================= */

window.renderDailyQuestList =
    renderDailyQuestList;


/* =========================================================
   6. 初期表示への対応
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const questBoardScreen =
            document.getElementById(
                "questboard-screen"
            );


        if (
            questBoardScreen
            && questBoardScreen
                .classList
                .contains(
                    "active"
                )
        ) {

            renderDailyQuestList();

        }

    }
);
