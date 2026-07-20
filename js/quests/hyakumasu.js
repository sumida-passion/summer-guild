"use strict";

/* =========================================================
   夏休みギルド Ver0.4.1
   hyakumasu.js

   百マス計算クエスト
   ・10×10の足し算
   ・0～18の2桁入力対応
   ・1桁入力は少し待って自動移動
   ・2桁入力はすぐ自動移動
   ・100問採点
   ・初回10GP
   ・2回目以降1GP
   ・挑戦回数保存
   ========================================================= */


/* =========================================================
   1. 百マス計算設定
   ========================================================= */

const HYAKUMASU_QUEST = {

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

};


const HYAKUMASU_SIZE =
    10;


/*
  1桁の答えを入力したあと、
  次のマスへ移るまでの待ち時間。

  この間に2桁目を入力できる。
*/

const HYAKUMASU_SINGLE_DIGIT_WAIT =
    600;


/* =========================================================
   2. 百マス計算の状態
   ========================================================= */

let hyakumasuState = {

    rowNumbers: [],

    columnNumbers: [],

    answers: [],

    startedAt: 0,

    finished: false,

    context: null,

    moveTimers: []

};


/* =========================================================
   3. クエスト登録
   ========================================================= */

function registerHyakumasuQuest() {

    if (
        !window.QuestEngine
        || typeof window.QuestEngine.register
            !== "function"
    ) {

        console.error(
            "QuestEngineが見つかりません。"
        );

        return false;

    }


    return window.QuestEngine.register({

        id:
            HYAKUMASU_QUEST.id,

        title:
            HYAKUMASU_QUEST.title,

        description:
            HYAKUMASU_QUEST.description,

        firstReward:
            HYAKUMASU_QUEST.firstReward,

        repeatReward:
            HYAKUMASU_QUEST.repeatReward,

        perfectReward:
            HYAKUMASU_QUEST.perfectReward,

        firstPerfectBonus:
            HYAKUMASU_QUEST
                .firstPerfectBonus,

        start:
            startHyakumasuQuest,

        cancel:
            cancelHyakumasuQuest,

        reset:
            resetHyakumasuQuest

    });

}


/* =========================================================
   4. 百マス計算開始
   ========================================================= */

function startHyakumasuQuest(
    context
) {

    hyakumasuState =
        createInitialHyakumasuState(
            context
        );


    const container =
        context.getContainer();


    if (!container) {

        return false;

    }


    container.innerHTML =
        createHyakumasuHtml();


    bindHyakumasuEvents();

    updateHyakumasuChallengeDisplay();

    focusFirstAnswer();


    return true;

}


/* =========================================================
   5. 初期状態作成
   ========================================================= */

function createInitialHyakumasuState(
    context
) {

    const cellCount =
        HYAKUMASU_SIZE
        * HYAKUMASU_SIZE;


    return {

        rowNumbers:
            createRandomNumberList(
                HYAKUMASU_SIZE
            ),

        columnNumbers:
            createRandomNumberList(
                HYAKUMASU_SIZE
            ),

        answers:
            Array(
                cellCount
            ).fill(""),

        startedAt:
            Date.now(),

        finished:
            false,

        context,

        moveTimers:
            Array(
                cellCount
            ).fill(null)

    };

}


/* =========================================================
   6. ランダム数字作成
   ========================================================= */

function createRandomNumberList(
    length
) {

    const numbers = [];


    for (
        let index = 0;
        index < length;
        index += 1
    ) {

        numbers.push(
            Math.floor(
                Math.random() * 10
            )
        );

    }


    return numbers;

}


/* =========================================================
   7. 百マスHTML作成
   ========================================================= */

function createHyakumasuHtml() {

    const headerCells =
        hyakumasuState
            .columnNumbers
            .map(
                (number) => {

                    return `
                        <th class="hyakumasu-number-cell">
                            ${number}
                        </th>
                    `;

                }
            )
            .join("");


    const rows =
        hyakumasuState
            .rowNumbers
            .map(
                (
                    rowNumber,
                    rowIndex
                ) => {

                    const answerCells =
                        hyakumasuState
                            .columnNumbers
                            .map(
                                (
                                    columnNumber,
                                    columnIndex
                                ) => {

                                    const answerIndex =
                                        rowIndex
                                        * HYAKUMASU_SIZE
                                        + columnIndex;


                                    return `
                                        <td class="hyakumasu-answer-cell">

                                            <input
                                                class="hyakumasu-cell-input"
                                                id="hyakumasuAnswer${answerIndex}"
                                                data-answer-index="${answerIndex}"
                                                data-row-number="${rowNumber}"
                                                data-column-number="${columnNumber}"
                                                type="text"
                                                inputmode="numeric"
                                                maxlength="2"
                                                autocomplete="off"
                                                enterkeyhint="next"
                                                aria-label="${rowNumber}たす${columnNumber}"
                                            >

                                        </td>
                                    `;

                                }
                            )
                            .join("");


                    return `
                        <tr>

                            <th class="hyakumasu-number-cell">
                                ${rowNumber}
                            </th>

                            ${answerCells}

                        </tr>
                    `;

                }
            )
            .join("");


    return `
        <div class="hyakumasu-panel hyakumasu-panel-large">

            <div class="hyakumasu-header">

                <p class="hyakumasu-progress">
                    今日の百マス挑戦：
                    <span id="hyakumasuTodayCount">0</span>回
                </p>

                <h2>
                    百マス計算
                </h2>

                <p class="quest-instruction">
                    左と上の数字を足して、
                    100マスを全部うめよう。
                </p>

            </div>


            <div class="hyakumasu-table-wrapper">

                <table
                    class="hyakumasu-table"
                    aria-label="百マス計算"
                >

                    <thead>

                        <tr>

                            <th class="hyakumasu-corner-cell">
                                ＋
                            </th>

                            ${headerCells}

                        </tr>

                    </thead>


                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>


            <p
                id="hyakumasuMessage"
                class="hyakumasu-message"
                aria-live="polite">
            </p>


            <div class="hyakumasu-actions">

                <button
                    id="hyakumasuSubmitButton"
                    class="game-button"
                    type="button">
                    採点する
                </button>


                <button
                    id="cancelHyakumasu"
                    class="game-button hyakumasu-cancel-button"
                    type="button">
                    クエストボードへ戻る
                </button>

            </div>

        </div>
    `;

}


/* =========================================================
   8. イベント設定
   ========================================================= */

function bindHyakumasuEvents() {

    const inputs =
        document.querySelectorAll(
            ".hyakumasu-cell-input"
        );


    inputs.forEach(
        (
            input,
            index
        ) => {

            input.addEventListener(
                "input",
                () => {

                    handleHyakumasuInput(
                        input,
                        index
                    );

                }
            );


            input.addEventListener(
                "keydown",
                (event) => {

                    handleHyakumasuKeydown(
                        event,
                        index
                    );

                }
            );


            input.addEventListener(
                "focus",
                () => {

                    input.select();

                }
            );

        }
    );


    const submitButton =
        document.getElementById(
            "hyakumasuSubmitButton"
        );


    if (submitButton) {

        submitButton.addEventListener(
            "click",
            submitHyakumasuAnswers
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelHyakumasu"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                if (
                    typeof cancelCurrentQuest
                    === "function"
                ) {

                    cancelCurrentQuest();

                }

            }
        );

    }

}


/* =========================================================
   9. 入力処理
   ========================================================= */

function handleHyakumasuInput(
    input,
    index
) {

    if (
        hyakumasuState.finished
    ) {

        return;

    }


    clearMoveTimer(
        index
    );


    let value =
        String(
            input.value
        ).replace(
            /[^0-9]/g,
            ""
        );


    if (
        value.length > 2
    ) {

        value =
            value.slice(
                0,
                2
            );

    }


    /*
      00、01などが入力された場合は、
      通常の整数表記へ直す。
    */

    if (
        value.length === 2
        && value.startsWith("0")
    ) {

        value =
            String(
                Number(value)
            );

    }


    /*
      足し算の最大値は18。

      19以上になった場合は、
      最初の1桁だけを残す。
    */

    if (
        value !== ""
        && Number(value) > 18
    ) {

        value =
            value.charAt(0);

    }


    input.value =
        value;


    hyakumasuState.answers[
        index
    ] = value;


    clearHyakumasuMessage();


    if (
        value === ""
    ) {

        return;

    }


    /*
      2桁の答えが完成した場合は、
      すぐ次のマスへ移動する。

      例：
      15
      18
      10
    */

    if (
        value.length === 2
    ) {

        moveToNextAnswer(
            index
        );


        return;

    }


    /*
      1桁の場合は少しだけ待つ。

      その間に2桁目を入力すれば、
      同じマスに「15」などが入る。

      2桁目が入力されなければ、
      1桁の答えとして次へ進む。
    */

    hyakumasuState.moveTimers[
        index
    ] =
        window.setTimeout(
            () => {

                const latestInput =
                    document.getElementById(
                        `hyakumasuAnswer${index}`
                    );


                if (
                    !latestInput
                    || latestInput.disabled
                ) {

                    return;

                }


                const latestValue =
                    latestInput.value;


                if (
                    latestValue !== ""
                    && latestValue.length === 1
                ) {

                    moveToNextAnswer(
                        index
                    );

                }

            },
            HYAKUMASU_SINGLE_DIGIT_WAIT
        );

}


/* =========================================================
   10. 自動移動
   ========================================================= */

function moveToNextAnswer(
    currentIndex
) {

    clearMoveTimer(
        currentIndex
    );


    const lastIndex =
        HYAKUMASU_SIZE
        * HYAKUMASU_SIZE
        - 1;


    if (
        currentIndex < lastIndex
    ) {

        focusAnswerByIndex(
            currentIndex + 1
        );

    }

}


/* =========================================================
   11. 移動タイマー解除
   ========================================================= */

function clearMoveTimer(
    index
) {

    const timer =
        hyakumasuState
            .moveTimers[
                index
            ];


    if (timer) {

        window.clearTimeout(
            timer
        );


        hyakumasuState
            .moveTimers[
                index
            ] =
            null;

    }

}


function clearAllMoveTimers() {

    hyakumasuState
        .moveTimers
        .forEach(
            (
                timer,
                index
            ) => {

                if (timer) {

                    window.clearTimeout(
                        timer
                    );


                    hyakumasuState
                        .moveTimers[
                            index
                        ] =
                        null;

                }

            }
        );

}


/* =========================================================
   12. キーボード移動
   ========================================================= */

function handleHyakumasuKeydown(
    event,
    index
) {

    if (
        event.key === "Backspace"
        && event.currentTarget.value === ""
        && index > 0
    ) {

        clearMoveTimer(
            index
        );


        focusAnswerByIndex(
            index - 1
        );


        return;

    }


    if (
        event.key === "ArrowLeft"
        && index > 0
    ) {

        event.preventDefault();


        clearMoveTimer(
            index
        );


        focusAnswerByIndex(
            index - 1
        );

    }


    if (
        event.key === "ArrowRight"
        && index
            < HYAKUMASU_SIZE
                * HYAKUMASU_SIZE
                - 1
    ) {

        event.preventDefault();


        clearMoveTimer(
            index
        );


        focusAnswerByIndex(
            index + 1
        );

    }


    if (
        event.key === "ArrowUp"
        && index >= HYAKUMASU_SIZE
    ) {

        event.preventDefault();


        clearMoveTimer(
            index
        );


        focusAnswerByIndex(
            index - HYAKUMASU_SIZE
        );

    }


    if (
        event.key === "ArrowDown"
        && index
            < HYAKUMASU_SIZE
                * (
                    HYAKUMASU_SIZE
                    - 1
                )
    ) {

        event.preventDefault();


        clearMoveTimer(
            index
        );


        focusAnswerByIndex(
            index + HYAKUMASU_SIZE
        );

    }


    if (
        event.key === "Enter"
    ) {

        event.preventDefault();


        clearMoveTimer(
            index
        );


        const lastIndex =
            HYAKUMASU_SIZE
            * HYAKUMASU_SIZE
            - 1;


        if (
            index < lastIndex
        ) {

            focusAnswerByIndex(
                index + 1
            );

        } else {

            submitHyakumasuAnswers();

        }

    }

}


/* =========================================================
   13. 採点
   ========================================================= */

async function submitHyakumasuAnswers() {

    if (
        hyakumasuState.finished
    ) {

        return;

    }


    clearAllMoveTimers();


    const unansweredCount =
        hyakumasuState
            .answers
            .filter(
                (answer) =>
                    answer === ""
            )
            .length;


    if (
        unansweredCount > 0
    ) {

        setHyakumasuMessage(
            `まだ${unansweredCount}マス残っています。`,
            "incorrect"
        );


        focusFirstEmptyAnswer();


        return;

    }


    let correctCount =
        0;


    const inputs =
        document.querySelectorAll(
            ".hyakumasu-cell-input"
        );


    inputs.forEach(
        (
            input,
            index
        ) => {

            const rowIndex =
                Math.floor(
                    index
                    / HYAKUMASU_SIZE
                );


            const columnIndex =
                index
                % HYAKUMASU_SIZE;


            const correctAnswer =
                hyakumasuState
                    .rowNumbers[
                        rowIndex
                    ]
                +
                hyakumasuState
                    .columnNumbers[
                        columnIndex
                    ];


            const userAnswer =
                Number(
                    hyakumasuState
                        .answers[
                            index
                        ]
                );


            input.classList.remove(
                "correct",
                "incorrect"
            );


            if (
                userAnswer === correctAnswer
            ) {

                correctCount += 1;


                input.classList.add(
                    "correct"
                );

            } else {

                input.classList.add(
                    "incorrect"
                );

            }


            input.disabled =
                true;

        }
    );


    hyakumasuState.finished =
        true;


    const totalQuestions =
        HYAKUMASU_SIZE
        * HYAKUMASU_SIZE;


    const isPerfect =
        correctCount === totalQuestions;


    const elapsedSeconds =
        Math.max(
            0,
            Math.round(
                (
                    Date.now()
                    - hyakumasuState.startedAt
                )
                / 1000
            )
        );


    const submitButton =
        document.getElementById(
            "hyakumasuSubmitButton"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

    }


    if (
        !hyakumasuState.context
        || typeof hyakumasuState
            .context
            .complete
            !== "function"
    ) {

        console.error(
            "クエスト完了処理が見つかりません。"
        );


        return;

    }


    await hyakumasuState
        .context
        .complete({

            isPerfect,

            correctCount,

            totalQuestions,

            elapsedSeconds

        });

}


/* =========================================================
   14. メッセージ表示
   ========================================================= */

function setHyakumasuMessage(
    message,
    type = ""
) {

    const element =
        document.getElementById(
            "hyakumasuMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.classList.remove(
        "correct",
        "incorrect"
    );


    if (type) {

        element.classList.add(
            type
        );

    }

}


function clearHyakumasuMessage() {

    setHyakumasuMessage(
        ""
    );

}


/* =========================================================
   15. フォーカス処理
   ========================================================= */

function focusFirstAnswer() {

    window.setTimeout(
        () => {

            focusAnswerByIndex(
                0
            );

        },
        150
    );

}


function focusFirstEmptyAnswer() {

    const emptyIndex =
        hyakumasuState
            .answers
            .findIndex(
                (answer) =>
                    answer === ""
            );


    if (
        emptyIndex >= 0
    ) {

        focusAnswerByIndex(
            emptyIndex
        );

    }

}


function focusAnswerByIndex(
    index
) {

    const input =
        document.getElementById(
            `hyakumasuAnswer${index}`
        );


    if (!input) {

        return;

    }


    input.focus();

    input.select();

}


/* =========================================================
   16. 挑戦回数表示
   ========================================================= */

function updateHyakumasuChallengeDisplay() {

    const element =
        document.getElementById(
            "hyakumasuTodayCount"
        );


    if (!element) {

        return;

    }


    const todayCount =
        typeof getQuestChallengeCount
        === "function"
            ? getQuestChallengeCount(
                HYAKUMASU_QUEST.id
            )
            : 0;


    element.textContent =
        String(
            todayCount
        );

}


/* =========================================================
   17. 百マス計算中止
   ========================================================= */

function cancelHyakumasuQuest() {

    resetHyakumasuQuest();

}


/* =========================================================
   18. 百マス状態初期化
   ========================================================= */

function resetHyakumasuQuest() {

    clearAllMoveTimers();


    const container =
        hyakumasuState.context
        && typeof hyakumasuState
            .context
            .getContainer
            === "function"
            ? hyakumasuState
                .context
                .getContainer()
            : null;


    if (container) {

        container.innerHTML =
            "";

    }


    hyakumasuState = {

        rowNumbers: [],

        columnNumbers: [],

        answers: [],

        startedAt: 0,

        finished: false,

        context: null,

        moveTimers: []

    };

}


/* =========================================================
   19. 外部用開始関数
   ========================================================= */

function startHyakumasu() {

    if (
        !window.QuestEngine
        || typeof window.QuestEngine.start
            !== "function"
    ) {

        return false;

    }


    return window.QuestEngine.start(
        HYAKUMASU_QUEST.id
    );

}


/* =========================================================
   20. 自動登録
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        registerHyakumasuQuest();

    }
);


/* =========================================================
   21. windowへ公開
   ========================================================= */

window.startHyakumasu =
    startHyakumasu;


window.cancelHyakumasu =
    cancelHyakumasuQuest;
