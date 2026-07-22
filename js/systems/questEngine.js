"use strict";

/* =========================================================
   夏休みギルド Ver0.4.0
   questEngine.js

   クエスト登録
   クエスト開始
   クエスト中止
   クエスト完了
   報酬処理
   結果画面への接続
   ========================================================= */


/* =========================================================
   1. QuestEngine本体
   ========================================================= */

const QuestEngine = (() => {

    /*
      登録済みクエスト。

      例：

      {
          hyakumasu: {
              id: "hyakumasu",
              title: "百マス計算",
              start: function,
              cancel: function
          }
      }
    */

    const quests = {};


    /*
      現在実行中のクエストID。
    */

    let currentQuestId = "";


    /*
      クエスト開始中かどうか。
    */

    let isQuestRunning = false;


    /*
      クエスト完了処理の二重実行防止。
    */

    let isCompleting = false;


/* =========================================================
   2. クエスト登録
   ========================================================= */

/*
  使用例：

  QuestEngine.register({

      id: "hyakumasu",

      title: "百マス計算",

      firstReward: 10,

      repeatReward: 1,

      perfectReward: 1,

      firstPerfectBonus: 2,

      start(context) {

          // クエスト画面を作る

      },

      cancel(context) {

          // 必要なら中止処理

      }

  });
*/

    function register(
        questDefinition
    ) {

        if (
            !questDefinition
            || typeof questDefinition
                !== "object"
        ) {

            console.error(
                "登録するクエスト情報がありません。"
            );

            return false;

        }


        const questId =
            normalizeQuestId(
                questDefinition.id
            );


        if (!questId) {

            console.error(
                "クエストIDが正しくありません。"
            );

            return false;

        }


        if (
            typeof questDefinition.start
            !== "function"
        ) {

            console.error(
                `クエスト開始処理がありません: ${questId}`
            );

            return false;

        }


        quests[questId] = {

            id:
                questId,

            title:
                getSafeText(
                    questDefinition.title,
                    questId
                ),

            description:
                getSafeText(
                    questDefinition.description,
                    ""
                ),

            firstReward:
                getSafeReward(
                    questDefinition.firstReward,
                    0
                ),

            repeatReward:
                getSafeReward(
                    questDefinition.repeatReward,
                    0
                ),

            perfectReward:
                getSafeReward(
                    questDefinition.perfectReward,
                    0
                ),

            firstPerfectBonus:
                getSafeReward(
                    questDefinition.firstPerfectBonus,
                    0
                ),

            start:
                questDefinition.start,

            cancel:
                typeof questDefinition.cancel
                === "function"
                    ? questDefinition.cancel
                    : null,

            reset:
                typeof questDefinition.reset
                === "function"
                    ? questDefinition.reset
                    : null

        };


        console.log(
            `クエスト登録完了: ${questId}`
        );


        return true;

    }


/* =========================================================
   3. クエスト登録解除
   ========================================================= */

    function unregister(
        questId
    ) {

        const safeQuestId =
            normalizeQuestId(
                questId
            );


        if (!safeQuestId) {

            return false;

        }


        if (
            currentQuestId
            === safeQuestId
        ) {

            cancel();

        }


        if (
            !quests[safeQuestId]
        ) {

            return false;

        }


        delete quests[
            safeQuestId
        ];


        return true;

    }


/* =========================================================
   4. クエスト取得
   ========================================================= */

    function getQuest(
        questId
    ) {

        const safeQuestId =
            normalizeQuestId(
                questId
            );


        if (!safeQuestId) {

            return null;

        }


        return quests[
            safeQuestId
        ] || null;

    }


/* =========================================================
   5. 登録済みクエスト一覧取得
   ========================================================= */

    function getRegisteredQuests() {

        return Object.values(
            quests
        ).map(
            (quest) => ({

                id:
                    quest.id,

                title:
                    quest.title,

                description:
                    quest.description,

                firstReward:
                    quest.firstReward,

                repeatReward:
                    quest.repeatReward,

                perfectReward:
                    quest.perfectReward,

                firstPerfectBonus:
                    quest.firstPerfectBonus

            })
        );

    }


/* =========================================================
   6. クエスト開始
   ========================================================= */

    function start(
        questId
    ) {

        const safeQuestId =
            normalizeQuestId(
                questId
            );


        if (!safeQuestId) {

            console.error(
                "開始するクエストIDがありません。"
            );

            return false;

        }


        const quest =
            getQuest(
                safeQuestId
            );


        if (!quest) {

            console.error(
                `未登録のクエストです: ${safeQuestId}`
            );

            return false;

        }


        /*
          別クエストが実行中なら、
          先に中止処理を行う。
        */

        if (
            isQuestRunning
            && currentQuestId
            && currentQuestId
                !== safeQuestId
        ) {

            cancel();

        }


        /*
          同じクエストへの再挑戦でも、
          前回状態を初期化する。
        */

        if (
            typeof quest.reset
            === "function"
        ) {

            try {

                quest.reset(
                    createQuestContext(
                        quest
                    )
                );

            } catch (error) {

                console.warn(
                    `クエスト初期化中にエラーが発生しました: ${safeQuestId}`,
                    error
                );

            }

        }


        currentQuestId =
            safeQuestId;


        isQuestRunning =
            true;


        isCompleting =
            false;


        const context =
            createQuestContext(
                quest
            );


        try {

            const result =
                quest.start(
                    context
                );


            if (
                result === false
            ) {

                currentQuestId = "";

                isQuestRunning = false;

                return false;

            }


            return true;

        } catch (error) {

            console.error(
                `クエスト開始中にエラーが発生しました: ${safeQuestId}`,
                error
            );


            currentQuestId = "";

            isQuestRunning = false;


            return false;

        }

    }


/* =========================================================
   7. クエスト中止
   ========================================================= */

    function cancel() {

        if (
            !currentQuestId
        ) {

            isQuestRunning = false;

            isCompleting = false;

            return true;

        }


        const quest =
            getQuest(
                currentQuestId
            );


        if (
            quest
            && typeof quest.cancel
                === "function"
        ) {

            try {

                quest.cancel(
                    createQuestContext(
                        quest
                    )
                );

            } catch (error) {

                console.warn(
                    `クエスト中止処理中にエラーが発生しました: ${currentQuestId}`,
                    error
                );

            }

        }


        if (
            quest
            && typeof quest.reset
                === "function"
        ) {

            try {

                quest.reset(
                    createQuestContext(
                        quest
                    )
                );

            } catch (error) {

                console.warn(
                    `クエスト初期化中にエラーが発生しました: ${currentQuestId}`,
                    error
                );

            }

        }


        currentQuestId = "";

        isQuestRunning = false;

        isCompleting = false;


        return true;

    }


/* =========================================================
   8. クエスト完了
   ========================================================= */

/*
  百マス側からの使用例：

  QuestEngine.complete({

      isPerfect: true,

      correctCount: 100,

      totalQuestions: 100,

      elapsedSeconds: 95

  });
*/

    async function complete(
        completionData = {}
    ) {

        if (
            isCompleting
        ) {

            return null;

        }


        if (
            !isQuestRunning
            || !currentQuestId
        ) {

            console.error(
                "実行中のクエストがありません。"
            );

            return null;

        }


        const quest =
            getQuest(
                currentQuestId
            );


        if (!quest) {

            console.error(
                "現在のクエスト情報が見つかりません。"
            );

            return null;

        }


        isCompleting =
            true;


        const safeCompletionData =
            completionData
            && typeof completionData
                === "object"
                ? completionData
                : {};


        const isPerfect =
            Boolean(
                safeCompletionData
                    .isPerfect
            );


        /*
          settings.jsへ結果を渡し、
          GPと挑戦回数を保存する。
        */

        let rewardResult;


        if (
            typeof completeQuestAttempt
            === "function"
        ) {

            rewardResult =
                completeQuestAttempt({

                    questId:
                        quest.id,

                    firstReward:
                        quest.firstReward,

                    repeatReward:
                        quest.repeatReward,

                    perfectReward:
                        quest.perfectReward,

                    firstPerfectBonus:
                        quest.firstPerfectBonus,

                    isPerfect,

                    rewardOverride:
                        safeCompletionData
                            .rewardOverride,

                    performanceRewardOverride:
                        safeCompletionData
                            .performanceRewardOverride

                });

        } else {

            console.error(
                "completeQuestAttempt() が見つかりません。"
            );


            rewardResult = {

                success: false,

                questId:
                    quest.id,

                reward: 0,

                totalGp:
                    typeof getGp
                    === "function"
                        ? getGp()
                        : 0,

                todayChallengeCount:
                    typeof getTodayChallengeCount
                    === "function"
                        ? getTodayChallengeCount()
                        : 0,

                totalChallengeCount:
                    typeof getTotalChallengeCount
                    === "function"
                        ? getTotalChallengeCount()
                        : 0,

                firstClear:
                    false,

                perfect:
                    isPerfect,

                firstPerfect:
                    false

            };

        }


        const resultData =
            createResultData(
                quest,
                safeCompletionData,
                rewardResult
            );


        /*
          クエストの画面状態を初期化する。

          currentQuestIdは、
          結果画面の「もう一度」で利用するため残す。
        */

        if (
            typeof quest.reset
            === "function"
        ) {

            try {

                quest.reset(
                    createQuestContext(
                        quest
                    )
                );

            } catch (error) {

                console.warn(
                    `クエスト終了後の初期化中にエラーが発生しました: ${quest.id}`,
                    error
                );

            }

        }


        isQuestRunning =
            false;


        /*
          app.jsの結果画面へ接続する。
        */

        if (
            typeof showQuestResult
            === "function"
        ) {

            await showQuestResult(
                resultData
            );

        } else {

            console.warn(
                "showQuestResult() が見つかりません。"
            );

        }


        isCompleting =
            false;


        return resultData;

    }


/* =========================================================
   9. 結果表示データ作成
   ========================================================= */

    function createResultData(
        quest,
        completionData,
        rewardResult
    ) {

        const correctCount =
            getSafeInteger(
                completionData.correctCount,
                0
            );


        const totalQuestions =
            getSafeInteger(
                completionData.totalQuestions,
                0
            );


        const elapsedSeconds =
            getSafeNumber(
                completionData.elapsedSeconds,
                0
            );


        const message =
            createResultMessage(
                quest,
                completionData,
                rewardResult,
                correctCount,
                totalQuestions
            );


        return {

            questId:
                quest.id,

            title:
                quest.title,

            message,

            reward:
                getSafeInteger(
                    rewardResult.reward,
                    0
                ),

            totalGp:
                getSafeInteger(
                    rewardResult.totalGp,
                    0
                ),

            todayChallengeCount:
                getSafeInteger(
                    rewardResult
                        .todayChallengeCount,
                    0
                ),

            totalChallengeCount:
                getSafeInteger(
                    rewardResult
                        .totalChallengeCount,
                    0
                ),

            questPlayCount:
                getSafeInteger(
                    rewardResult.playCount,
                    0
                ),

            firstClear:
                Boolean(
                    rewardResult.firstClear
                ),

            perfect:
                Boolean(
                    rewardResult.perfect
                ),

            firstPerfect:
                Boolean(
                    rewardResult.firstPerfect
                ),

            baseReward:
                getSafeInteger(
                    rewardResult.baseReward,
                    0
                ),

            perfectReward:
                getSafeInteger(
                    rewardResult.perfectReward,
                    0
                ),

            firstPerfectBonus:
                getSafeInteger(
                    rewardResult
                        .firstPerfectBonus,
                    0
                ),

            performanceReward:
                getSafeInteger(
                    rewardResult
                        .performanceReward,
                    0
                ),

            correctCount,

            totalQuestions,

            elapsedSeconds,

            rawCompletionData:
                completionData

        };

    }


/* =========================================================
   10. 結果メッセージ作成
   ========================================================= */

    function createResultMessage(
        quest,
        completionData,
        rewardResult,
        correctCount,
        totalQuestions
    ) {

        if (
            typeof completionData.message
            === "string"
            && completionData.message
                .trim() !== ""
        ) {

            return completionData
                .message
                .trim();

        }


        const messages = [];


        if (
            Boolean(
                rewardResult.perfect
            )
        ) {

            messages.push(
                `${quest.title}、全問正解！`
            );

        } else {

            messages.push(
                `${quest.title}を最後までやり切りました。`
            );

        }


        if (
            totalQuestions > 0
        ) {

            messages.push(
                `${correctCount}問／${totalQuestions}問正解`
            );

        }


        if (
            Boolean(
                rewardResult.firstClear
            )
        ) {

            messages.push(
                "今日の初回クリア報酬を獲得しました。"
            );

        } else {

            messages.push(
                "もう一度挑戦した記録が残りました。"
            );

        }


        if (
            Boolean(
                rewardResult.firstPerfect
            )
        ) {

            messages.push(
                "今日初めての全問正解です！"
            );

        }


        return messages.join(
            "\n"
        );

    }


/* =========================================================
   11. クエスト用コンテキスト作成
   ========================================================= */

/*
  各クエストへ渡す共通機能。

  hyakumasu.js側は、
  グローバル関数を直接探さずに
  context.complete()などを利用できる。
*/

    function createQuestContext(
        quest
    ) {

        return {

            questId:
                quest.id,

            title:
                quest.title,

            description:
                quest.description,

            rewards: {

                first:
                    quest.firstReward,

                repeat:
                    quest.repeatReward,

                perfect:
                    quest.perfectReward,

                firstPerfect:
                    quest.firstPerfectBonus

            },

            getContainer:
                getQuestContentContainer,

            clearContainer:
                clearQuestContentContainer,

            complete,

            cancel,

            getTodayPlayCount() {

                if (
                    typeof getQuestChallengeCount
                    === "function"
                ) {

                    return getQuestChallengeCount(
                        quest.id
                    );

                }


                return 0;

            },

            getTodayChallengeCount() {

                if (
                    typeof window
                        .getTodayChallengeCount
                    === "function"
                ) {

                    return window
                        .getTodayChallengeCount();

                }


                return 0;

            },

            getTotalChallengeCount() {

                if (
                    typeof window
                        .getTotalChallengeCount
                    === "function"
                ) {

                    return window
                        .getTotalChallengeCount();

                }


                return 0;

            }

        };

    }


/* =========================================================
   12. クエスト表示領域取得
   ========================================================= */

/*
  index.htmlのIDに多少違いがあっても
  対応できるよう候補を順番に探す。
*/

    function getQuestContentContainer() {

        const candidateIds = [

            "questContent",

            "questArea",

            "questGameArea",

            "questContainer",

            "hyakumasuContainer"

        ];


        for (
            const elementId
            of candidateIds
        ) {

            const element =
                document.getElementById(
                    elementId
                );


            if (element) {

                return element;

            }

        }


        /*
          IDがなくても、
          quest-container内へ表示できるようにする。
        */

        const classContainer =
            document.querySelector(
                "#quest-screen .quest-container"
            );


        if (
            classContainer
        ) {

            return classContainer;

        }


        console.error(
            "クエスト表示領域が見つかりません。"
        );


        return null;

    }


/* =========================================================
   13. クエスト表示領域初期化
   ========================================================= */

    function clearQuestContentContainer() {

        const container =
            getQuestContentContainer();


        if (!container) {

            return false;

        }


        container.innerHTML = "";


        return true;

    }


/* =========================================================
   14. 現在のクエストID取得
   ========================================================= */

    function getCurrentQuestId() {

        return currentQuestId;

    }


/* =========================================================
   15. 実行状態確認
   ========================================================= */

    function isRunning() {

        return isQuestRunning;

    }


/* =========================================================
   16. ID正規化
   ========================================================= */

    function normalizeQuestId(
        questId
    ) {

        if (
            typeof questId
            !== "string"
        ) {

            return "";

        }


        return questId
            .trim()
            .toLowerCase();

    }


/* =========================================================
   17. 安全文字列取得
   ========================================================= */

    function getSafeText(
        value,
        fallback
    ) {

        if (
            typeof value
            === "string"
            && value.trim()
                !== ""
        ) {

            return value.trim();

        }


        return fallback;

    }


/* =========================================================
   18. 安全な報酬値取得
   ========================================================= */

    function getSafeReward(
        value,
        fallback
    ) {

        return Math.max(
            0,
            getSafeInteger(
                value,
                fallback
            )
        );

    }


/* =========================================================
   19. 安全な整数取得
   ========================================================= */

    function getSafeInteger(
        value,
        fallback
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(
                number
            )
        ) {

            return Math.floor(
                Number(fallback) || 0
            );

        }


        return Math.floor(
            number
        );

    }


/* =========================================================
   20. 安全な数値取得
   ========================================================= */

    function getSafeNumber(
        value,
        fallback
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(
                number
            )
        ) {

            return Number(
                fallback
            ) || 0;

        }


        return number;

    }


/* =========================================================
   21. 公開機能
   ========================================================= */

    return {

        register,

        unregister,

        getQuest,

        getRegisteredQuests,

        start,

        cancel,

        complete,

        getCurrentQuestId,

        isRunning,

        getQuestContentContainer,

        clearQuestContentContainer

    };

})();


/* =========================================================
   22. windowへ公開
   ========================================================= */

window.QuestEngine =
    QuestEngine;
