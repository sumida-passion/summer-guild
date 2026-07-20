"use strict";

/* =========================================================
   夏休みギルド Ver0.4.3
   hyakumasu.js

   百マス計算クエスト

   ・10×10の足し算
   ・一画面に全マス表示
   ・縦横スクロールなし
   ・正方形マス
   ・画面サイズに合わせて自動調整
   ・0～18の入力
   ・iPad Safari対応
   ・初回10GP
   ・2回目以降1GP
   ・挑戦回数保存
   ========================================================= */


/* =========================================================
   1. クエスト設定
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
  「1」は、

  1
  10～18

  の両方になり得るため、
  2桁目を少しだけ待つ。
*/

const HYAKUMASU_SECOND_DIGIT_WAIT =
    800;


/*
  正方形マスの最小・最大サイズ。
*/

const HYAKUMASU_MIN_CELL_SIZE =
    30;


const HYAKUMASU_MAX_CELL_SIZE =
    58;


/* =========================================================
   2. 状態
   ========================================================= */

let hyakumasuState = {

    rowNumbers: [],

    columnNumbers: [],

    answers: [],

    startedAt: 0,

    finished: false,

    context: null,

    moveTimers: [],

    resizeTimer: null

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


    installHyakumasuStyles();


    container.innerHTML =
        createHyakumasuHtml();


    bindHyakumasuEvents();

    updateHyakumasuChallengeDisplay();


    /*
      DOMの描画後に、
      画面へ収まる最大サイズを計算する。
    */

    window.requestAnimationFrame(
        () => {

            fitHyakumasuToScreen();

            focusFirstAnswer();

        }
    );


    return true;

}


/* =========================================================
   5. 初期状態
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
            ).fill(null),

        resizeTimer:
            null

    };

}


/* =========================================================
   6. ランダム数字
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
                Math.random()
                * 10
            )
        );

    }


    return numbers;

}


/* =========================================================
   7. HTML生成
   ========================================================= */

function createHyakumasuHtml() {

    const columnHeaders =
        hyakumasuState
            .columnNumbers
            .map(
                (number) => {

                    return `
                        <th
                            class="hyakumasu-number-cell"
                            scope="col"
                        >
                            ${number}
                        </th>
                    `;

                }
            )
            .join("");


    const bodyRows =
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
                                        <td
                                            class="hyakumasu-answer-cell"
                                        >
                                            <input
                                                id="hyakumasuAnswer${answerIndex}"
                                                class="hyakumasu-cell-input"
                                                type="text"
                                                inputmode="numeric"
                                                maxlength="2"
                                                autocomplete="off"
                                                autocorrect="off"
                                                autocapitalize="off"
                                                spellcheck="false"
                                                enterkeyhint="next"
                                                data-answer-index="${answerIndex}"
                                                aria-label="${rowNumber}たす${columnNumber}"
                                            >
                                        </td>
                                    `;

                                }
                            )
                            .join("");


                    return `
                        <tr>

                            <th
                                class="hyakumasu-number-cell"
                                scope="row"
                            >
                                ${rowNumber}
                            </th>

                            ${answerCells}

                        </tr>
                    `;

                }
            )
            .join("");


    return `
        <div
            id="hyakumasuGame"
            class="hyakumasu-game"
        >

            <header class="hyakumasu-game-header">

                <p class="hyakumasu-progress">
                    今日の百マス挑戦：
                    <span id="hyakumasuTodayCount">0</span>回
                </p>

                <h2 class="hyakumasu-game-title">
                    百マス計算
                </h2>

                <p class="hyakumasu-game-instruction">
                    左と上の数字を足して、
                    100マスを全部うめよう。
                </p>

            </header>


            <div
                id="hyakumasuTableArea"
                class="hyakumasu-table-area"
            >

                <table
                    id="hyakumasuTable"
                    class="hyakumasu-table"
                    aria-label="百マス計算"
                >

                    <thead>

                        <tr>

                            <th
                                class="hyakumasu-corner-cell"
                                scope="col"
                            >
                                ＋
                            </th>

                            ${columnHeaders}

                        </tr>

                    </thead>


                    <tbody>
                        ${bodyRows}
                    </tbody>

                </table>

            </div>


            <p
                id="hyakumasuMessage"
                class="hyakumasu-message"
                aria-live="polite"
            ></p>


            <div class="hyakumasu-actions">

                <button
                    id="hyakumasuSubmitButton"
                    class="game-button"
                    type="button"
                >
                    採点する
                </button>


                <button
                    id="cancelHyakumasu"
                    class="game-button hyakumasu-cancel-button"
                    type="button"
                >
                    クエストボードへ戻る
                </button>

            </div>

        </div>
    `;

}


/* =========================================================
   8. 百マス専用CSS
   ========================================================= */

/*
  既存のlayout.cssと競合しても、
  百マス画面だけ正しく表示できるようにする。

  同じstyleタグは一度しか作らない。
*/

function installHyakumasuStyles() {

    if (
        document.getElementById(
            "hyakumasuRuntimeStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "hyakumasuRuntimeStyles";


    style.textContent = `
        #quest-screen {
            padding: 8px !important;
            overflow: hidden !important;
        }

        #quest-screen .quest-container {
            box-sizing: border-box !important;

            display: block !important;

            width: min(94vw, 1120px) !important;
            height: min(91vh, 820px) !important;
            max-width: 94vw !important;
            max-height: 91vh !important;

            margin: auto !important;
            padding: 12px 18px !important;

            overflow: hidden !important;
        }

        .hyakumasu-game {
            --hyakumasu-cell-size: 42px;
            --hyakumasu-cell-gap: 3px;

            box-sizing: border-box;

            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto auto;

            width: 100%;
            height: 100%;

            min-width: 0;
            min-height: 0;

            overflow: hidden;

            text-align: center;
        }

        .hyakumasu-game-header {
            flex: none;

            margin: 0 0 7px;
            padding: 0;

            text-align: center;
        }

        .hyakumasu-game .hyakumasu-progress {
            margin: 0 0 3px;

            font-size: clamp(14px, 1.55vw, 20px);
            line-height: 1.2;

            color: #ffe08a;
        }

        .hyakumasu-game-title {
            margin: 0 0 2px !important;

            font-size: clamp(30px, 3.8vw, 48px) !important;
            line-height: 1.08;

            color: #fff1c4;
        }

        .hyakumasu-game-instruction {
            margin: 0;

            font-size: clamp(14px, 1.65vw, 20px);
            line-height: 1.25;

            color: #eddcb8;
        }

        .hyakumasu-table-area {
            box-sizing: border-box;

            display: flex;
            align-items: center;
            justify-content: center;

            width: 100%;
            min-width: 0;
            min-height: 0;

            margin: 0;
            padding: 1px;

            overflow: hidden !important;
        }

        .hyakumasu-table {
            width: auto !important;
            min-width: 0 !important;
            max-width: 100% !important;

            margin: 0 auto !important;

            border-collapse: separate !important;
            border-spacing:
                var(--hyakumasu-cell-gap)
                var(--hyakumasu-cell-gap) !important;

            table-layout: fixed !important;
        }

        .hyakumasu-table th,
        .hyakumasu-table td {
            box-sizing: border-box !important;

            width: var(--hyakumasu-cell-size) !important;
            min-width: var(--hyakumasu-cell-size) !important;
            max-width: var(--hyakumasu-cell-size) !important;

            height: var(--hyakumasu-cell-size) !important;
            min-height: var(--hyakumasu-cell-size) !important;
            max-height: var(--hyakumasu-cell-size) !important;

            margin: 0 !important;
            padding: 0 !important;

            overflow: hidden !important;
        }

        .hyakumasu-corner-cell,
        .hyakumasu-number-cell {
            border: 1px solid rgba(228, 178, 105, 0.45);
            border-radius: 5px;

            text-align: center;
            vertical-align: middle;

            font-size:
                clamp(
                    17px,
                    calc(var(--hyakumasu-cell-size) * 0.55),
                    30px
                );

            font-weight: 800;
            line-height: 1;

            color: #fff5d7;

            background:
                linear-gradient(
                    to bottom,
                    rgba(83, 46, 25, 0.98),
                    rgba(46, 25, 14, 0.98)
                );
        }

        .hyakumasu-corner-cell {
            color: #ffe49a;
        }

        .hyakumasu-answer-cell {
            border: 0 !important;
            background: transparent !important;
        }

        .hyakumasu-cell-input {
            box-sizing: border-box !important;

            display: block !important;

            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;

            height: 100% !important;
            min-height: 0 !important;
            max-height: none !important;

            margin: 0 !important;
            padding: 0 1px !important;

            border: 1px solid rgba(111, 77, 52, 0.7) !important;
            border-radius: 5px !important;

            text-align: center !important;

            font-family: inherit !important;
            font-size:
                clamp(
                    16px,
                    calc(var(--hyakumasu-cell-size) * 0.5),
                    28px
                ) !important;

            font-weight: 800 !important;
            line-height: 1 !important;

            color: #2b1a11 !important;
            background: #fffdf7 !important;

            outline: none !important;

            appearance: none !important;
            -webkit-appearance: none !important;

            -webkit-user-select: text;
            user-select: text;
        }

        .hyakumasu-cell-input:focus {
            border-color: #4d9fff !important;

            box-shadow:
                inset 0 0 0 2px rgba(77, 159, 255, 0.45) !important;
        }

        .hyakumasu-cell-input.correct {
            border-color: #68b35e !important;

            color: #194719 !important;
            background: #ddf6d9 !important;
        }

        .hyakumasu-cell-input.incorrect {
            border-color: #d55e4c !important;

            color: #7a2017 !important;
            background: #ffe1da !important;
        }

        .hyakumasu-cell-input:disabled {
            opacity: 1 !important;

            -webkit-text-fill-color:
                currentColor !important;
        }

        .hyakumasu-game .hyakumasu-message {
            box-sizing: border-box;

            min-height: 1.35em;

            margin: 2px 0 3px;

            font-size: clamp(13px, 1.5vw, 18px);
            line-height: 1.25;
        }

        .hyakumasu-game .hyakumasu-actions {
            display: flex;
            align-items: center;
            justify-content: center;

            gap: 14px;

            margin: 0;
            padding: 0;

            flex-wrap: nowrap;
        }

        .hyakumasu-game .hyakumasu-actions button {
            min-width: 170px;

            padding: 9px 22px;

            font-size: clamp(15px, 1.8vw, 21px);
        }

        @media (max-height: 700px) {

            #quest-screen .quest-container {
                height: 93vh !important;

                padding: 7px 12px !important;
            }

            .hyakumasu-game-header {
                margin-bottom: 3px;
            }

            .hyakumasu-game-title {
                font-size: clamp(27px, 3.3vw, 38px) !important;
            }

            .hyakumasu-game-instruction {
                font-size: clamp(12px, 1.4vw, 16px);
            }

            .hyakumasu-game .hyakumasu-actions button {
                padding: 6px 18px;
            }

        }
    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   9. 一画面に収まるセルサイズ計算
   ========================================================= */

function fitHyakumasuToScreen() {

    const game =
        document.getElementById(
            "hyakumasuGame"
        );


    const tableArea =
        document.getElementById(
            "hyakumasuTableArea"
        );


    if (
        !game
        || !tableArea
    ) {

        return;

    }


    /*
      見出し1列＋答え10列。
    */

    const totalColumns =
        HYAKUMASU_SIZE + 1;


    /*
      見出し1行＋答え10行。
    */

    const totalRows =
        HYAKUMASU_SIZE + 1;


    /*
      セル間の隙間。

      11セルの場合、
      tableのborder-spacingは概ね12個分必要。
    */

    const gap =
        3;


    const horizontalGapTotal =
        gap
        * (
            totalColumns + 1
        );


    const verticalGapTotal =
        gap
        * (
            totalRows + 1
        );


    const availableWidth =
        Math.max(
            0,
            tableArea.clientWidth
            - horizontalGapTotal
            - 4
        );


    const availableHeight =
        Math.max(
            0,
            tableArea.clientHeight
            - verticalGapTotal
            - 4
        );


    const cellByWidth =
        Math.floor(
            availableWidth
            / totalColumns
        );


    const cellByHeight =
        Math.floor(
            availableHeight
            / totalRows
        );


    const calculatedSize =
        Math.min(
            cellByWidth,
            cellByHeight,
            HYAKUMASU_MAX_CELL_SIZE
        );


    const safeSize =
        Math.max(
            HYAKUMASU_MIN_CELL_SIZE,
            calculatedSize
        );


    game.style.setProperty(
        "--hyakumasu-cell-size",
        `${safeSize}px`
    );


    game.style.setProperty(
        "--hyakumasu-cell-gap",
        `${gap}px`
    );

}


/* =========================================================
   10. イベント設定
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

                    placeCursorAtEnd(
                        input
                    );

                }
            );


            input.addEventListener(
                "pointerup",
                () => {

                    window.setTimeout(
                        () => {

                            placeCursorAtEnd(
                                input
                            );

                        },
                        0
                    );

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


    window.addEventListener(
        "resize",
        handleHyakumasuResize
    );


    window.addEventListener(
        "orientationchange",
        handleHyakumasuResize
    );

}


/* =========================================================
   11. リサイズ
   ========================================================= */

function handleHyakumasuResize() {

    if (
        hyakumasuState.resizeTimer
    ) {

        window.clearTimeout(
            hyakumasuState.resizeTimer
        );

    }


    hyakumasuState.resizeTimer =
        window.setTimeout(
            () => {

                fitHyakumasuToScreen();

            },
            120
        );

}


/* =========================================================
   12. 入力処理
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
                -2
            );

    }


    /*
      00、01などを通常の整数へ直す。
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
      答えは0～18。

      19以上になった場合は、
      最後に押した1桁を残す。
    */

    if (
        value !== ""
        && Number(value) > 18
    ) {

        value =
            value.slice(
                -1
            );

    }


    input.value =
        value;


    hyakumasuState.answers[
        index
    ] =
        value;


    placeCursorAtEnd(
        input
    );


    clearHyakumasuMessage();


    if (
        value === ""
    ) {

        return;

    }


    /*
      10～18の入力が完了した場合。
    */

    if (
        value.length === 2
    ) {

        moveToNextAnswer(
            index
        );


        return;

    }


    const numericValue =
        Number(value);


    /*
      0と2～9は、
      有効な2桁の先頭にはならない。
    */

    if (
        numericValue === 0
        || numericValue >= 2
    ) {

        moveToNextAnswer(
            index
        );


        return;

    }


    /*
      1だけは、10～18の可能性があるため待つ。
    */

    scheduleMoveAfterOneDigit(
        index
    );

}


/* =========================================================
   13. 「1」の2桁目待機
   ========================================================= */

function scheduleMoveAfterOneDigit(
    index
) {

    hyakumasuState.moveTimers[
        index
    ] =
        window.setTimeout(
            () => {

                const input =
                    document.getElementById(
                        `hyakumasuAnswer${index}`
                    );


                if (
                    !input
                    || input.disabled
                ) {

                    return;

                }


                if (
                    input.value === "1"
                ) {

                    moveToNextAnswer(
                        index
                    );

                }

            },
            HYAKUMASU_SECOND_DIGIT_WAIT
        );

}


/* =========================================================
   14. 次のマス
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
        currentIndex >= lastIndex
    ) {

        return;

    }


    window.setTimeout(
        () => {

            focusAnswerByIndex(
                currentIndex + 1
            );

        },
        0
    );

}


/* =========================================================
   15. タイマー
   ========================================================= */

function clearMoveTimer(
    index
) {

    const timer =
        hyakumasuState
            .moveTimers[
                index
            ];


    if (!timer) {

        return;

    }


    window.clearTimeout(
        timer
    );


    hyakumasuState.moveTimers[
        index
    ] =
        null;

}


function clearAllMoveTimers() {

    hyakumasuState
        .moveTimers
        .forEach(
            (
                timer,
                index
            ) => {

                if (!timer) {

                    return;

                }


                window.clearTimeout(
                    timer
                );


                hyakumasuState.moveTimers[
                    index
                ] =
                    null;

            }
        );

}


/* =========================================================
   16. キーボード操作
   ========================================================= */

function handleHyakumasuKeydown(
    event,
    index
) {

    const lastIndex =
        HYAKUMASU_SIZE
        * HYAKUMASU_SIZE
        - 1;


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


        return;

    }


    if (
        event.key === "ArrowRight"
        && index < lastIndex
    ) {

        event.preventDefault();

        clearMoveTimer(
            index
        );

        focusAnswerByIndex(
            index + 1
        );


        return;

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
            index
            - HYAKUMASU_SIZE
        );


        return;

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
            index
            + HYAKUMASU_SIZE
        );


        return;

    }


    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        clearMoveTimer(
            index
        );


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
   17. カーソルを末尾へ
   ========================================================= */

function placeCursorAtEnd(
    input
) {

    if (!input) {

        return;

    }


    window.requestAnimationFrame(
        () => {

            try {

                const position =
                    input.value.length;


                input.setSelectionRange(
                    position,
                    position
                );

            } catch (error) {

                /*
                  未対応ブラウザでは何もしない。
                */

            }

        }
    );

}


/* =========================================================
   18. 採点
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
                userAnswer
                === correctAnswer
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
        correctCount
        === totalQuestions;


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
   19. メッセージ
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
   20. フォーカス
   ========================================================= */

function focusFirstAnswer() {

    window.setTimeout(
        () => {

            focusAnswerByIndex(
                0
            );

        },
        120
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


    try {

        input.focus({
            preventScroll: true
        });

    } catch (error) {

        input.focus();

    }


    placeCursorAtEnd(
        input
    );

}


/* =========================================================
   21. 挑戦回数
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
   22. 中止
   ========================================================= */

function cancelHyakumasuQuest() {

    resetHyakumasuQuest();

}


/* =========================================================
   23. 初期化
   ========================================================= */

function resetHyakumasuQuest() {

    clearAllMoveTimers();


    if (
        hyakumasuState.resizeTimer
    ) {

        window.clearTimeout(
            hyakumasuState.resizeTimer
        );

    }


    window.removeEventListener(
        "resize",
        handleHyakumasuResize
    );


    window.removeEventListener(
        "orientationchange",
        handleHyakumasuResize
    );


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

        moveTimers: [],

        resizeTimer: null

    };

}


/* =========================================================
   24. 外部開始
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
   25. 自動登録
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        registerHyakumasuQuest();

    }
);


/* =========================================================
   26. window公開
   ========================================================= */

window.startHyakumasu =
    startHyakumasu;


window.cancelHyakumasu =
    cancelHyakumasuQuest;
/* =========================================================
   27. ソフトウェアキーボード用・上段追従バー
   Ver0.4.4 追記

   ・入力中だけ上段の数字を画面上部へ表示
   ・左と上を見る百マス本来の視線移動は維持
   ・現在入力中の列だけ、少し明るく表示
   ・既存の入力、採点、報酬処理は変更しない
   ========================================================= */


/* =========================================================
   27-1. 既存の開始処理を拡張
   ========================================================= */

const originalStartHyakumasuQuestForFloatingHeader =
    startHyakumasuQuest;


startHyakumasuQuest = function (
    context
) {

    const started =
        originalStartHyakumasuQuestForFloatingHeader(
            context
        );


    if (
        started === false
    ) {

        return false;

    }


    /*
      百マス本体のHTMLが作られたあとで、
      上段追従バーを追加する。
    */

    window.requestAnimationFrame(
        () => {

            initializeHyakumasuFloatingHeader();

        }
    );


    return started;

};


/* =========================================================
   27-2. 既存の初期化処理を拡張
   ========================================================= */

const originalResetHyakumasuQuestForFloatingHeader =
    resetHyakumasuQuest;


resetHyakumasuQuest = function () {

    removeHyakumasuFloatingHeaderEvents();


    originalResetHyakumasuQuestForFloatingHeader();

};


/* =========================================================
   27-3. 上段追従バー初期化
   ========================================================= */

function initializeHyakumasuFloatingHeader() {

    installHyakumasuFloatingHeaderStyles();


    const game =
        document.getElementById(
            "hyakumasuGame"
        );


    const tableArea =
        document.getElementById(
            "hyakumasuTableArea"
        );


    if (
        !game
        || !tableArea
    ) {

        return;

    }


    /*
      再初期化時に古いバーが残っていた場合は削除する。
    */

    const oldHeader =
        document.getElementById(
            "hyakumasuFloatingHeader"
        );


    if (
        oldHeader
    ) {

        oldHeader.remove();

    }


    const floatingHeader =
        document.createElement(
            "div"
        );


    floatingHeader.id =
        "hyakumasuFloatingHeader";


    floatingHeader.className =
        "hyakumasu-floating-header";


    floatingHeader.hidden =
        true;


    floatingHeader.setAttribute(
        "aria-hidden",
        "true"
    );


    floatingHeader.innerHTML =
        createHyakumasuFloatingHeaderHtml();


    /*
      百マス表の直前へ入れる。

      position:fixedなので通常レイアウトの高さには
      影響しない。
    */

    tableArea.parentNode.insertBefore(
        floatingHeader,
        tableArea
    );


    bindHyakumasuFloatingHeaderEvents();

}


/* =========================================================
   27-4. 追従バーHTML
   ========================================================= */

function createHyakumasuFloatingHeaderHtml() {

    const columnCells =
        hyakumasuState
            .columnNumbers
            .map(
                (
                    number,
                    columnIndex
                ) => {

                    return `
                        <th
                            class="hyakumasu-floating-number-cell"
                            scope="col"
                            data-floating-column="${columnIndex}"
                        >
                            ${number}
                        </th>
                    `;

                }
            )
            .join("");


    return `
        <div class="hyakumasu-floating-header-inner">

            <table
                class="hyakumasu-floating-table"
                aria-label="百マス計算の上段数字"
            >

                <tbody>

                    <tr>

                        <th
                            class="hyakumasu-floating-corner-cell"
                            scope="col"
                        >
                            ＋
                        </th>

                        ${columnCells}

                    </tr>

                </tbody>

            </table>

        </div>
    `;

}


/* =========================================================
   27-5. 追従バー用CSS
   ========================================================= */

function installHyakumasuFloatingHeaderStyles() {

    if (
        document.getElementById(
            "hyakumasuFloatingHeaderStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "hyakumasuFloatingHeaderStyles";


    style.textContent = `

        .hyakumasu-floating-header[hidden] {
            display: none !important;
        }


        .hyakumasu-floating-header {
            box-sizing: border-box;

            position: fixed;

            top:
                calc(
                    env(safe-area-inset-top, 0px)
                    + 5px
                );

            left: 50%;

            z-index: 1000;

            display: flex;
            align-items: center;
            justify-content: center;

            width: auto;
            max-width: calc(100vw - 18px);

            margin: 0;
            padding: 5px 7px;

            border:
                1px solid
                rgba(239, 194, 118, 0.55);

            border-radius: 9px;

            background:
                linear-gradient(
                    to bottom,
                    rgba(75, 42, 24, 0.96),
                    rgba(38, 22, 14, 0.96)
                );

            box-shadow:
                0 5px 14px
                rgba(0, 0, 0, 0.3);

            opacity: 0;

            pointer-events: none;

            transform:
                translateX(-50%)
                translateY(-8px);

            transition:
                opacity 120ms ease,
                transform 120ms ease;
        }


        .hyakumasu-floating-header.visible {
            opacity: 1;

            transform:
                translateX(-50%)
                translateY(0);
        }


        .hyakumasu-floating-header-inner {
            box-sizing: border-box;

            width: auto;
            max-width: 100%;

            margin: 0;
            padding: 0;

            overflow: hidden;
        }


        .hyakumasu-floating-table {
            width: auto !important;

            margin: 0 !important;

            border-collapse: separate !important;

            border-spacing:
                var(--hyakumasu-cell-gap)
                0 !important;

            table-layout: fixed !important;
        }


        .hyakumasu-floating-table th {
            box-sizing: border-box !important;

            width:
                var(--hyakumasu-cell-size) !important;

            min-width:
                var(--hyakumasu-cell-size) !important;

            max-width:
                var(--hyakumasu-cell-size) !important;

            height:
                calc(
                    var(--hyakumasu-cell-size)
                    * 0.78
                ) !important;

            min-height:
                calc(
                    var(--hyakumasu-cell-size)
                    * 0.78
                ) !important;

            max-height:
                calc(
                    var(--hyakumasu-cell-size)
                    * 0.78
                ) !important;

            margin: 0 !important;
            padding: 0 !important;

            border:
                1px solid
                rgba(228, 178, 105, 0.42);

            border-radius: 5px;

            text-align: center;
            vertical-align: middle;

            font-size:
                clamp(
                    16px,
                    calc(
                        var(--hyakumasu-cell-size)
                        * 0.48
                    ),
                    27px
                );

            font-weight: 800;
            line-height: 1;

            color: #fff5d7;

            background:
                linear-gradient(
                    to bottom,
                    rgba(93, 53, 29, 0.98),
                    rgba(50, 28, 17, 0.98)
                );

            transition:
                border-color 100ms ease,
                background 100ms ease,
                box-shadow 100ms ease;
        }


        .hyakumasu-floating-table
        .hyakumasu-floating-corner-cell {
            color: #ffe49a;
        }


        .hyakumasu-floating-table
        .hyakumasu-floating-number-cell.active {
            border-color:
                rgba(255, 224, 138, 0.95);

            color: #fff9df;

            background:
                linear-gradient(
                    to bottom,
                    rgba(139, 89, 36, 0.99),
                    rgba(76, 43, 20, 0.99)
                );

            box-shadow:
                inset 0 0 0 2px
                rgba(255, 218, 112, 0.32);
        }


        @media (max-height: 700px) {

            .hyakumasu-floating-header {
                top:
                    calc(
                        env(safe-area-inset-top, 0px)
                        + 3px
                    );

                padding: 3px 5px;
            }


            .hyakumasu-floating-table th {
                height:
                    calc(
                        var(--hyakumasu-cell-size)
                        * 0.7
                    ) !important;

                min-height:
                    calc(
                        var(--hyakumasu-cell-size)
                        * 0.7
                    ) !important;

                max-height:
                    calc(
                        var(--hyakumasu-cell-size)
                        * 0.7
                    ) !important;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   27-6. 入力欄と追従バーを接続
   ========================================================= */

function bindHyakumasuFloatingHeaderEvents() {

    removeHyakumasuFloatingHeaderEvents();


    const inputs =
        Array.from(
            document.querySelectorAll(
                ".hyakumasu-cell-input"
            )
        );


    if (
        inputs.length === 0
    ) {

        return;

    }


    const focusHandlers = [];


    inputs.forEach(
        (
            input,
            index
        ) => {

            const focusHandler =
                () => {

                    showHyakumasuFloatingHeader(
                        index
                    );

                };


            const blurHandler =
                () => {

                    window.setTimeout(
                        hideHyakumasuFloatingHeaderIfNecessary,
                        80
                    );

                };


            input.addEventListener(
                "focus",
                focusHandler
            );


            input.addEventListener(
                "blur",
                blurHandler
            );


            focusHandlers.push({

                input,

                focusHandler,

                blurHandler

            });

        }
    );


    const viewport =
        window.visualViewport;


    const viewportHandler =
        () => {

            updateHyakumasuFloatingHeaderForViewport();

        };


    if (
        viewport
    ) {

        viewport.addEventListener(
            "resize",
            viewportHandler
        );


        viewport.addEventListener(
            "scroll",
            viewportHandler
        );

    }


    hyakumasuState
        .floatingHeaderCleanup =
        () => {

            focusHandlers.forEach(
                (
                    handlers
                ) => {

                    handlers.input
                        .removeEventListener(
                            "focus",
                            handlers.focusHandler
                        );


                    handlers.input
                        .removeEventListener(
                            "blur",
                            handlers.blurHandler
                        );

                }
            );


            if (
                viewport
            ) {

                viewport.removeEventListener(
                    "resize",
                    viewportHandler
                );


                viewport.removeEventListener(
                    "scroll",
                    viewportHandler
                );

            }

        };

}


/* =========================================================
   27-7. 追従バー表示
   ========================================================= */

function showHyakumasuFloatingHeader(
    answerIndex
) {

    const header =
        document.getElementById(
            "hyakumasuFloatingHeader"
        );


    if (
        !header
    ) {

        return;

    }


    const columnIndex =
        answerIndex
        % HYAKUMASU_SIZE;


    updateHyakumasuFloatingActiveColumn(
        columnIndex
    );


    header.hidden =
        false;


    header.setAttribute(
        "aria-hidden",
        "false"
    );


    window.requestAnimationFrame(
        () => {

            header.classList.add(
                "visible"
            );

        }
    );

}


/* =========================================================
   27-8. 現在列の表示
   ========================================================= */

function updateHyakumasuFloatingActiveColumn(
    columnIndex
) {

    const cells =
        document.querySelectorAll(
            ".hyakumasu-floating-number-cell"
        );


    cells.forEach(
        (
            cell
        ) => {

            const cellColumn =
                Number(
                    cell.dataset
                        .floatingColumn
                );


            cell.classList.toggle(
                "active",
                cellColumn === columnIndex
            );

        }
    );

}


/* =========================================================
   27-9. キーボード状態に合わせる
   ========================================================= */

function updateHyakumasuFloatingHeaderForViewport() {

    const activeElement =
        document.activeElement;


    const inputIsActive =
        activeElement
        && activeElement
            .classList
        && activeElement
            .classList
            .contains(
                "hyakumasu-cell-input"
            );


    if (
        inputIsActive
    ) {

        const answerIndex =
            Number(
                activeElement
                    .dataset
                    .answerIndex
            );


        if (
            Number.isFinite(
                answerIndex
            )
        ) {

            showHyakumasuFloatingHeader(
                answerIndex
            );

        }


        return;

    }


    hideHyakumasuFloatingHeader();

}


/* =========================================================
   27-10. 必要な場合だけ非表示
   ========================================================= */

function hideHyakumasuFloatingHeaderIfNecessary() {

    const activeElement =
        document.activeElement;


    if (
        activeElement
        && activeElement.classList
        && activeElement
            .classList
            .contains(
                "hyakumasu-cell-input"
            )
    ) {

        return;

    }


    hideHyakumasuFloatingHeader();

}


/* =========================================================
   27-11. 追従バー非表示
   ========================================================= */

function hideHyakumasuFloatingHeader() {

    const header =
        document.getElementById(
            "hyakumasuFloatingHeader"
        );


    if (
        !header
    ) {

        return;

    }


    header.classList.remove(
        "visible"
    );


    header.setAttribute(
        "aria-hidden",
        "true"
    );


    window.setTimeout(
        () => {

            if (
                !header.classList
                    .contains(
                        "visible"
                    )
            ) {

                header.hidden =
                    true;

            }

        },
        140
    );

}


/* =========================================================
   27-12. イベント解除
   ========================================================= */

function removeHyakumasuFloatingHeaderEvents() {

    if (
        hyakumasuState
        && typeof hyakumasuState
            .floatingHeaderCleanup
            === "function"
    ) {

        hyakumasuState
            .floatingHeaderCleanup();

    }


    if (
        hyakumasuState
    ) {

        hyakumasuState
            .floatingHeaderCleanup =
            null;

    }

}
