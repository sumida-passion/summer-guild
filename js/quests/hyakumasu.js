"use strict";

/* =========================================================
   夏休みギルド Ver0.5.0
   hyakumasu.js

   百マス計算クエスト

   ・10×10の足し算
   ・答えマスはinputではなくbutton
   ・共通NumberPadで入力
   ・ソフトウェアキーボードを開かない
   ・Floating Headerを廃止
   ・一画面に表とNumberPadを表示
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


const HYAKUMASU_CELL_COUNT =
    HYAKUMASU_SIZE
    * HYAKUMASU_SIZE;


/*
  「1」は、

  1
  10～18

  の両方になり得るため、
  2桁目を少しだけ待つ。
*/

const HYAKUMASU_SECOND_DIGIT_WAIT =
    650;


/*
  正方形マスの最小・最大サイズ。
*/

const HYAKUMASU_MIN_CELL_SIZE =
    27;


const HYAKUMASU_MAX_CELL_SIZE =
    54;


/* =========================================================
   2. 状態
   ========================================================= */

let hyakumasuState =
    createEmptyHyakumasuState();


function createEmptyHyakumasuState() {

    return {

        rowNumbers: [],

        columnNumbers: [],

        answers: [],

        startedAt: 0,

        finished: false,

        context: null,

        activeIndex:
            -1,

        pendingAdvanceTimer:
            null,

        resizeTimer:
            null,

        numberPadOpened:
            false

    };

}


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

    resetHyakumasuRuntimeOnly();


    hyakumasuState =
        createInitialHyakumasuState(
            context
        );


    const container =
        context
        && typeof context.getContainer
            === "function"
            ? context.getContainer()
            : null;


    if (!container) {

        console.error(
            "百マス計算の表示先が見つかりません。"
        );

        return false;

    }


    if (
        !window.NumberPad
        || typeof window.NumberPad.open
            !== "function"
    ) {

        console.error(
            "NumberPadが見つかりません。numberpad.jsを先に読み込んでください。"
        );

        container.innerHTML = `
            <div class="hyakumasu-load-error">
                数字入力パッドを読み込めませんでした。
            </div>
        `;

        return false;

    }


    installHyakumasuStyles();


    container.innerHTML =
        createHyakumasuHtml();


    bindHyakumasuEvents();


    updateHyakumasuChallengeDisplay();


    const opened =
        openHyakumasuNumberPad();


    if (!opened) {

        setHyakumasuMessage(
            "数字入力パッドを表示できませんでした。",
            "incorrect"
        );

        return false;

    }


    window.requestAnimationFrame(
        () => {

            fitHyakumasuToScreen();

            activateHyakumasuCell(
                0,
                {
                    synchronizePad:
                        true
                }
            );

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
                HYAKUMASU_CELL_COUNT
            ).fill(""),

        startedAt:
            Date.now(),

        finished:
            false,

        context,

        activeIndex:
            -1,

        pendingAdvanceTimer:
            null,

        resizeTimer:
            null,

        numberPadOpened:
            false

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

    return `
        <div
            id="hyakumasuGame"
            class="hyakumasu-game"
        >

            <header class="hyakumasu-game-header">

                <div class="hyakumasu-header-main">

                    <div>

                        <p class="hyakumasu-progress">
                            今日の百マス挑戦：
                            <span id="hyakumasuTodayCount">0</span>回
                        </p>

                        <h2 class="hyakumasu-game-title">
                            百マス計算
                        </h2>

                    </div>

                    <p class="hyakumasu-game-instruction">
                        左と上の数字を足して、
                        100マスを全部うめよう。
                    </p>

                </div>

            </header>


            <div class="hyakumasu-play-area">

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

                                ${createHyakumasuColumnHeaders()}

                            </tr>

                        </thead>

                        <tbody>
                            ${createHyakumasuBodyRows()}
                        </tbody>

                    </table>

                </div>


                <aside class="hyakumasu-control-area">

                    <div
                        id="hyakumasuCurrentFormula"
                        class="hyakumasu-current-formula"
                        aria-live="polite"
                    >
                        マスを選んでください
                    </div>

                    <div
                        id="hyakumasuNumberPadArea"
                        class="hyakumasu-numberpad-area"
                    ></div>

                </aside>

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


function createHyakumasuColumnHeaders() {

    return hyakumasuState
        .columnNumbers
        .map(
            (
                number,
                columnIndex
            ) => {

                return `
                    <th
                        id="hyakumasuColumnHeader${columnIndex}"
                        class="hyakumasu-number-cell hyakumasu-column-header"
                        scope="col"
                        data-column-index="${columnIndex}"
                    >
                        ${number}
                    </th>
                `;

            }
        )
        .join("");

}


function createHyakumasuBodyRows() {

    return hyakumasuState
        .rowNumbers
        .map(
            (
                rowNumber,
                rowIndex
            ) => {

                return `
                    <tr>

                        <th
                            id="hyakumasuRowHeader${rowIndex}"
                            class="hyakumasu-number-cell hyakumasu-row-header"
                            scope="row"
                            data-row-index="${rowIndex}"
                        >
                            ${rowNumber}
                        </th>

                        ${createHyakumasuAnswerCells(
                            rowNumber,
                            rowIndex
                        )}

                    </tr>
                `;

            }
        )
        .join("");

}


function createHyakumasuAnswerCells(
    rowNumber,
    rowIndex
) {

    return hyakumasuState
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

                        <button
                            id="hyakumasuAnswer${answerIndex}"
                            class="hyakumasu-cell-input"
                            type="button"
                            data-answer-index="${answerIndex}"
                            data-row-index="${rowIndex}"
                            data-column-index="${columnIndex}"
                            aria-label="${rowNumber}たす${columnNumber}の答え、未入力"
                            aria-pressed="false"
                        ></button>

                    </td>
                `;

            }
        )
        .join("");

}


/* =========================================================
   8. NumberPad表示
   ========================================================= */

function openHyakumasuNumberPad() {

    const container =
        document.getElementById(
            "hyakumasuNumberPadArea"
        );


    if (!container) {

        return false;

    }


    const root =
        window.NumberPad.open({

            container,

            title:
                "マスを選んで入力",

            maxLength:
                2,

            value:
                "",

            showDisplay:
                true,

            showClear:
                false,

            showConfirm:
                false,

            backspaceText:
                "←",

            ariaLabel:
                "百マス計算の数字入力パッド",

            className:
                "hyakumasu-numberpad",

            onChange:
                handleHyakumasuNumberPadChange,

            onDigit:
                handleHyakumasuNumberPadDigit,

            onBackspace:
                handleHyakumasuNumberPadBackspace

        });


    hyakumasuState.numberPadOpened =
        Boolean(root);


    return hyakumasuState
        .numberPadOpened;

}


/* =========================================================
   9. 百マス専用CSS
   ========================================================= */

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
            padding: 7px !important;
            overflow: hidden !important;
        }


        #quest-screen .quest-container {
            box-sizing: border-box !important;

            display: block !important;

            width: min(97vw, 1220px) !important;
            height: min(94vh, 840px) !important;
            max-width: 97vw !important;
            max-height: 94vh !important;

            margin: auto !important;
            padding: 10px 14px !important;

            overflow: hidden !important;
        }


        .hyakumasu-load-error {
            padding: 30px;
            color: #ffe6dd;
            font-size: 20px;
            text-align: center;
        }


        .hyakumasu-game {
            --hyakumasu-cell-size: 40px;
            --hyakumasu-cell-gap: 3px;

            box-sizing: border-box;

            display: grid;
            grid-template-rows:
                auto
                minmax(0, 1fr)
                auto
                auto;

            width: 100%;
            height: 100%;

            min-width: 0;
            min-height: 0;

            overflow: hidden;

            text-align: center;
        }


        .hyakumasu-game-header {
            margin: 0 0 5px;
            padding: 0;
        }


        .hyakumasu-header-main {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;

            min-width: 0;
        }


        .hyakumasu-game .hyakumasu-progress {
            margin: 0 0 1px;

            font-size:
                clamp(
                    12px,
                    1.25vw,
                    17px
                );

            line-height: 1.15;

            color: #ffe08a;
        }


        .hyakumasu-game-title {
            margin: 0 !important;

            font-size:
                clamp(
                    24px,
                    3vw,
                    39px
                ) !important;

            line-height: 1.05;

            color: #fff1c4;
        }


        .hyakumasu-game-instruction {
            margin: 0;

            font-size:
                clamp(
                    12px,
                    1.35vw,
                    17px
                );

            line-height: 1.25;

            color: #eddcb8;
        }


        .hyakumasu-play-area {
            box-sizing: border-box;

            display: grid;
            grid-template-columns:
                minmax(0, 1fr)
                auto;

            align-items: center;
            gap: 12px;

            width: 100%;
            min-width: 0;
            min-height: 0;

            overflow: hidden;
        }


        .hyakumasu-table-area {
            box-sizing: border-box;

            display: flex;
            align-items: center;
            justify-content: center;

            width: 100%;
            min-width: 0;
            min-height: 0;
            height: 100%;

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

            width:
                var(--hyakumasu-cell-size) !important;

            min-width:
                var(--hyakumasu-cell-size) !important;

            max-width:
                var(--hyakumasu-cell-size) !important;

            height:
                var(--hyakumasu-cell-size) !important;

            min-height:
                var(--hyakumasu-cell-size) !important;

            max-height:
                var(--hyakumasu-cell-size) !important;

            margin: 0 !important;
            padding: 0 !important;

            overflow: hidden !important;
        }


        .hyakumasu-corner-cell,
        .hyakumasu-number-cell {
            border:
                1px solid
                rgba(
                    228,
                    178,
                    105,
                    0.45
                );

            border-radius: 5px;

            text-align: center;
            vertical-align: middle;

            font-size:
                clamp(
                    15px,
                    calc(
                        var(--hyakumasu-cell-size)
                        * 0.52
                    ),
                    28px
                );

            font-weight: 800;
            line-height: 1;

            color: #fff5d7;

            background:
                linear-gradient(
                    to bottom,
                    rgba(
                        83,
                        46,
                        25,
                        0.98
                    ),
                    rgba(
                        46,
                        25,
                        14,
                        0.98
                    )
                );

            transition:
                border-color 90ms ease,
                background 90ms ease,
                box-shadow 90ms ease;
        }


        .hyakumasu-corner-cell {
            color: #ffe49a;
        }


        .hyakumasu-number-cell.active-axis {
            border-color:
                rgba(
                    255,
                    224,
                    138,
                    0.98
                );

            color: #fffbe8;

            background:
                linear-gradient(
                    to bottom,
                    rgba(
                        139,
                        89,
                        36,
                        0.99
                    ),
                    rgba(
                        76,
                        43,
                        20,
                        0.99
                    )
                );

            box-shadow:
                inset 0 0 0 2px
                rgba(
                    255,
                    218,
                    112,
                    0.28
                );
        }


        .hyakumasu-answer-cell {
            border: 0 !important;
            background: transparent !important;
        }


        .hyakumasu-cell-input {
            box-sizing: border-box !important;

            display: flex !important;
            align-items: center;
            justify-content: center;

            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;

            height: 100% !important;
            min-height: 0 !important;
            max-height: none !important;

            margin: 0 !important;
            padding: 0 1px !important;

            border:
                1px solid
                rgba(
                    111,
                    77,
                    52,
                    0.7
                ) !important;

            border-radius: 5px !important;

            font-family: inherit !important;

            font-size:
                clamp(
                    14px,
                    calc(
                        var(--hyakumasu-cell-size)
                        * 0.48
                    ),
                    27px
                ) !important;

            font-weight: 800 !important;
            line-height: 1 !important;

            color: #2b1a11 !important;
            background: #fffdf7 !important;

            outline: none !important;

            appearance: none !important;
            -webkit-appearance: none !important;

            cursor: pointer;

            user-select: none;
            -webkit-user-select: none;

            touch-action: manipulation;

            -webkit-tap-highlight-color:
                transparent;

            transition:
                border-color 80ms ease,
                background 80ms ease,
                box-shadow 80ms ease,
                transform 60ms ease;
        }


        .hyakumasu-cell-input:active:not(:disabled) {
            transform: scale(0.94);
        }


        .hyakumasu-cell-input.active {
            border-color: #4d9fff !important;

            background: #eef7ff !important;

            box-shadow:
                inset 0 0 0 2px
                rgba(
                    77,
                    159,
                    255,
                    0.45
                ) !important;
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
            cursor: default;
        }


        .hyakumasu-control-area {
            box-sizing: border-box;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            gap: 7px;

            width: min(25vw, 270px);
            min-width: 190px;
            max-width: 270px;

            min-height: 0;

            overflow: hidden;
        }


        .hyakumasu-current-formula {
            box-sizing: border-box;

            display: flex;
            align-items: center;
            justify-content: center;

            width: 100%;
            min-height: 38px;

            padding: 6px 9px;

            border:
                1px solid
                rgba(
                    235,
                    194,
                    112,
                    0.55
                );

            border-radius: 10px;

            color: #fff1c4;

            background:
                rgba(
                    47,
                    28,
                    17,
                    0.88
                );

            font-size:
                clamp(
                    14px,
                    1.7vw,
                    21px
                );

            font-weight: 800;
            line-height: 1.1;
        }


        .hyakumasu-numberpad-area {
            box-sizing: border-box;

            display: flex;
            align-items: center;
            justify-content: center;

            width: 100%;
            min-width: 0;
            min-height: 0;

            overflow: hidden;
        }


        .hyakumasu-numberpad-area
        .study-guild-numberpad {
            width: 100%;
            min-width: 0;
            max-width: 255px;

            padding: 14px;

            border-radius: 18px;
        }


        .hyakumasu-numberpad-area
        .study-guild-numberpad__header {
            gap: 5px;
            margin-bottom: 8px;
        }


        .hyakumasu-numberpad-area
        .study-guild-numberpad__title {
            font-size:
                clamp(
                    13px,
                    1.5vw,
                    17px
                );
        }


        .hyakumasu-numberpad-area
        .study-guild-numberpad__display {
            min-height: 41px;

            padding: 5px 10px;

            font-size:
                clamp(
                    20px,
                    2.4vw,
                    29px
                );
        }


        .hyakumasu-numberpad-area
        .study-guild-numberpad__keys {
            gap: 6px;
        }


        .hyakumasu-numberpad-area
        .study-guild-numberpad__key {
            min-height: 0;

            font-size:
                clamp(
                    19px,
                    2.5vw,
                    29px
                );
        }


        .hyakumasu-numberpad-area
        .study-guild-numberpad__key--zero {
            min-height: 48px;
        }


        .hyakumasu-game .hyakumasu-message {
            box-sizing: border-box;

            min-height: 1.25em;

            margin: 2px 0 3px;

            font-size:
                clamp(
                    12px,
                    1.35vw,
                    17px
                );

            line-height: 1.2;
        }


        .hyakumasu-game
        .hyakumasu-message.correct {
            color: #c9ffc0;
        }


        .hyakumasu-game
        .hyakumasu-message.incorrect {
            color: #ffd0c8;
        }


        .hyakumasu-game .hyakumasu-actions {
            display: flex;
            align-items: center;
            justify-content: center;

            gap: 12px;

            margin: 0;
            padding: 0;

            flex-wrap: nowrap;
        }


        .hyakumasu-game
        .hyakumasu-actions button {
            min-width: 155px;

            padding: 7px 18px;

            font-size:
                clamp(
                    14px,
                    1.55vw,
                    19px
                );
        }


        @media (
            max-width: 850px
        ) {

            #quest-screen .quest-container {
                width: 98vw !important;
                max-width: 98vw !important;

                padding: 7px 8px !important;
            }


            .hyakumasu-play-area {
                gap: 7px;
            }


            .hyakumasu-control-area {
                width: min(27vw, 215px);
                min-width: 175px;
            }


            .hyakumasu-numberpad-area
            .study-guild-numberpad {
                max-width: 205px;
                padding: 11px;
            }


            .hyakumasu-numberpad-area
            .study-guild-numberpad__keys {
                gap: 5px;
            }

        }


        @media (
            max-height: 700px
        ) {

            #quest-screen .quest-container {
                height: 97vh !important;
                max-height: 97vh !important;

                padding: 5px 9px !important;
            }


            .hyakumasu-game-header {
                margin-bottom: 2px;
            }


            .hyakumasu-game-title {
                font-size:
                    clamp(
                        21px,
                        2.7vw,
                        32px
                    ) !important;
            }


            .hyakumasu-header-main {
                gap: 16px;
            }


            .hyakumasu-current-formula {
                min-height: 32px;
                padding: 4px 7px;
            }


            .hyakumasu-numberpad-area
            .study-guild-numberpad {
                padding: 10px;
            }


            .hyakumasu-numberpad-area
            .study-guild-numberpad__header {
                gap: 3px;
                margin-bottom: 5px;
            }


            .hyakumasu-numberpad-area
            .study-guild-numberpad__display {
                min-height: 34px;
                padding: 3px 8px;
            }


            .hyakumasu-numberpad-area
            .study-guild-numberpad__keys {
                gap: 4px;
            }


            .hyakumasu-numberpad-area
            .study-guild-numberpad__key--zero {
                min-height: 40px;
            }


            .hyakumasu-game
            .hyakumasu-actions button {
                padding: 5px 15px;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   10. 一画面に収まるセルサイズ計算
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


    const totalColumns =
        HYAKUMASU_SIZE + 1;


    const totalRows =
        HYAKUMASU_SIZE + 1;


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
   11. イベント設定
   ========================================================= */

function bindHyakumasuEvents() {

    const cells =
        document.querySelectorAll(
            ".hyakumasu-cell-input"
        );


    cells.forEach(
        (
            cell
        ) => {

            cell.addEventListener(
                "click",
                handleHyakumasuCellClick
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
            handleHyakumasuCancelButton
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
   12. マス選択
   ========================================================= */

function handleHyakumasuCellClick(
    event
) {

    if (
        hyakumasuState.finished
    ) {

        return;

    }


    const answerIndex =
        Number(
            event.currentTarget
                .dataset
                .answerIndex
        );


    activateHyakumasuCell(
        answerIndex,
        {
            synchronizePad:
                true
        }
    );

}


function activateHyakumasuCell(
    answerIndex,
    options = {}
) {

    if (
        hyakumasuState.finished
    ) {

        return false;

    }


    if (
        !Number.isInteger(
            answerIndex
        )
        || answerIndex < 0
        || answerIndex
            >= HYAKUMASU_CELL_COUNT
    ) {

        return false;

    }


    const settings = {

        synchronizePad:
            true,

        ...options

    };


    clearHyakumasuAdvanceTimer();


    hyakumasuState.activeIndex =
        answerIndex;


    updateHyakumasuActiveCell();


    updateHyakumasuActiveAxes();


    updateHyakumasuCurrentFormula();


    if (
        settings.synchronizePad
    ) {

        synchronizeHyakumasuNumberPad();

    }


    clearHyakumasuMessage();


    return true;

}


/* =========================================================
   13. 選択表示
   ========================================================= */

function updateHyakumasuActiveCell() {

    const cells =
        document.querySelectorAll(
            ".hyakumasu-cell-input"
        );


    cells.forEach(
        (
            cell
        ) => {

            const answerIndex =
                Number(
                    cell.dataset
                        .answerIndex
                );


            const isActive =
                answerIndex
                === hyakumasuState
                    .activeIndex;


            cell.classList.toggle(
                "active",
                isActive
            );


            cell.setAttribute(
                "aria-pressed",
                isActive
                    ? "true"
                    : "false"
            );

        }
    );

}


function updateHyakumasuActiveAxes() {

    const activeIndex =
        hyakumasuState
            .activeIndex;


    const rowIndex =
        activeIndex >= 0
            ? Math.floor(
                activeIndex
                / HYAKUMASU_SIZE
            )
            : -1;


    const columnIndex =
        activeIndex >= 0
            ? activeIndex
                % HYAKUMASU_SIZE
            : -1;


    document
        .querySelectorAll(
            ".hyakumasu-row-header"
        )
        .forEach(
            (
                header
            ) => {

                header.classList.toggle(
                    "active-axis",
                    Number(
                        header.dataset
                            .rowIndex
                    ) === rowIndex
                );

            }
        );


    document
        .querySelectorAll(
            ".hyakumasu-column-header"
        )
        .forEach(
            (
                header
            ) => {

                header.classList.toggle(
                    "active-axis",
                    Number(
                        header.dataset
                            .columnIndex
                    ) === columnIndex
                );

            }
        );

}


function updateHyakumasuCurrentFormula() {

    const element =
        document.getElementById(
            "hyakumasuCurrentFormula"
        );


    if (!element) {

        return;

    }


    const answerIndex =
        hyakumasuState
            .activeIndex;


    if (
        answerIndex < 0
        || answerIndex
            >= HYAKUMASU_CELL_COUNT
    ) {

        element.textContent =
            "マスを選んでください";

        return;

    }


    const rowIndex =
        Math.floor(
            answerIndex
            / HYAKUMASU_SIZE
        );


    const columnIndex =
        answerIndex
        % HYAKUMASU_SIZE;


    const rowNumber =
        hyakumasuState
            .rowNumbers[
                rowIndex
            ];


    const columnNumber =
        hyakumasuState
            .columnNumbers[
                columnIndex
            ];


    const answer =
        hyakumasuState
            .answers[
                answerIndex
            ];


    element.textContent =
        answer === ""
            ? `${rowNumber} ＋ ${columnNumber} ＝ ？`
            : `${rowNumber} ＋ ${columnNumber} ＝ ${answer}`;

}


/* =========================================================
   14. NumberPad同期
   ========================================================= */

function synchronizeHyakumasuNumberPad() {

    if (
        !window.NumberPad
        || typeof window.NumberPad.setValue
            !== "function"
    ) {

        return;

    }


    const answerIndex =
        hyakumasuState
            .activeIndex;


    if (
        answerIndex < 0
        || answerIndex
            >= HYAKUMASU_CELL_COUNT
    ) {

        return;

    }


    /*
      notify=falseで設定し、
      onChangeの再発火を防ぐ。
    */

    window.NumberPad.setValue(
        hyakumasuState
            .answers[
                answerIndex
            ],
        false
    );


    updateHyakumasuNumberPadTitle();

}


function updateHyakumasuNumberPadTitle() {

    if (
        !window.NumberPad
        || typeof window.NumberPad.setTitle
            !== "function"
    ) {

        return;

    }


    const answerIndex =
        hyakumasuState
            .activeIndex;


    if (
        answerIndex < 0
        || answerIndex
            >= HYAKUMASU_CELL_COUNT
    ) {

        window.NumberPad.setTitle(
            "マスを選んで入力"
        );

        return;

    }


    const rowIndex =
        Math.floor(
            answerIndex
            / HYAKUMASU_SIZE
        );


    const columnIndex =
        answerIndex
        % HYAKUMASU_SIZE;


    window.NumberPad.setTitle(
        `${hyakumasuState.rowNumbers[rowIndex]} ＋ ${hyakumasuState.columnNumbers[columnIndex]}`
    );

}


/* =========================================================
   15. NumberPad入力
   ========================================================= */

function handleHyakumasuNumberPadChange(
    value
) {

    if (
        hyakumasuState.finished
    ) {

        return;

    }


    const answerIndex =
        hyakumasuState
            .activeIndex;


    if (
        answerIndex < 0
        || answerIndex
            >= HYAKUMASU_CELL_COUNT
    ) {

        return;

    }


    const normalizedValue =
        normalizeHyakumasuAnswerValue(
            value
        );


    hyakumasuState.answers[
        answerIndex
    ] =
        normalizedValue;


    updateHyakumasuCellValue(
        answerIndex
    );


    updateHyakumasuCurrentFormula();


    clearHyakumasuCellJudgement(
        answerIndex
    );


    clearHyakumasuMessage();


    if (
        normalizedValue
        !== String(
            value ?? ""
        )
    ) {

        window.NumberPad.setValue(
            normalizedValue,
            false
        );

    }

}


function handleHyakumasuNumberPadDigit(
    digit,
    value
) {

    if (
        hyakumasuState.finished
    ) {

        return;

    }


    const answerIndex =
        hyakumasuState
            .activeIndex;


    if (
        answerIndex < 0
        || answerIndex
            >= HYAKUMASU_CELL_COUNT
    ) {

        return;

    }


    const normalizedValue =
        normalizeHyakumasuAnswerValue(
            value
        );


    if (
        normalizedValue
        !== String(
            value ?? ""
        )
    ) {

        hyakumasuState.answers[
            answerIndex
        ] =
            normalizedValue;


        updateHyakumasuCellValue(
            answerIndex
        );


        updateHyakumasuCurrentFormula();


        window.NumberPad.setValue(
            normalizedValue,
            false
        );

    }


    clearHyakumasuAdvanceTimer();


    if (
        normalizedValue === ""
    ) {

        return;

    }


    if (
        normalizedValue.length >= 2
    ) {

        scheduleHyakumasuAdvance(
            answerIndex,
            70
        );

        return;

    }


    const numericValue =
        Number(
            normalizedValue
        );


    if (
        numericValue === 0
        || numericValue >= 2
    ) {

        scheduleHyakumasuAdvance(
            answerIndex,
            70
        );

        return;

    }


    if (
        numericValue === 1
    ) {

        scheduleHyakumasuAdvance(
            answerIndex,
            HYAKUMASU_SECOND_DIGIT_WAIT
        );

    }

}


function handleHyakumasuNumberPadBackspace(
    value
) {

    /*
      値の反映自体はonChangeで完了している。
      ここでは「1」の自動移動予約だけを解除する。
    */

    clearHyakumasuAdvanceTimer();

}


/* =========================================================
   16. 値の正規化
   ========================================================= */

function normalizeHyakumasuAnswerValue(
    value
) {

    let normalizedValue =
        String(
            value ?? ""
        )
            .replace(
                /[^0-9]/g,
                ""
            )
            .slice(
                0,
                2
            );


    if (
        normalizedValue.length === 2
        && normalizedValue.startsWith(
            "0"
        )
    ) {

        normalizedValue =
            String(
                Number(
                    normalizedValue
                )
            );

    }


    if (
        normalizedValue !== ""
        && Number(
            normalizedValue
        ) > 18
    ) {

        normalizedValue =
            normalizedValue.slice(
                -1
            );

    }


    return normalizedValue;

}


/* =========================================================
   17. マス表示更新
   ========================================================= */

function updateHyakumasuCellValue(
    answerIndex
) {

    const cell =
        document.getElementById(
            `hyakumasuAnswer${answerIndex}`
        );


    if (!cell) {

        return;

    }


    const value =
        hyakumasuState
            .answers[
                answerIndex
            ];


    cell.textContent =
        value;


    cell.setAttribute(
        "aria-label",
        createHyakumasuCellAriaLabel(
            answerIndex,
            value
        )
    );

}


function createHyakumasuCellAriaLabel(
    answerIndex,
    value
) {

    const rowIndex =
        Math.floor(
            answerIndex
            / HYAKUMASU_SIZE
        );


    const columnIndex =
        answerIndex
        % HYAKUMASU_SIZE;


    const rowNumber =
        hyakumasuState
            .rowNumbers[
                rowIndex
            ];


    const columnNumber =
        hyakumasuState
            .columnNumbers[
                columnIndex
            ];


    return value === ""
        ? `${rowNumber}たす${columnNumber}の答え、未入力`
        : `${rowNumber}たす${columnNumber}の答え、${value}`;

}


function clearHyakumasuCellJudgement(
    answerIndex
) {

    const cell =
        document.getElementById(
            `hyakumasuAnswer${answerIndex}`
        );


    if (!cell) {

        return;

    }


    cell.classList.remove(
        "correct",
        "incorrect"
    );

}


/* =========================================================
   18. 自動移動
   ========================================================= */

function scheduleHyakumasuAdvance(
    currentIndex,
    delay
) {

    clearHyakumasuAdvanceTimer();


    hyakumasuState.pendingAdvanceTimer =
        window.setTimeout(
            () => {

                hyakumasuState
                    .pendingAdvanceTimer =
                    null;


                if (
                    hyakumasuState.finished
                    || hyakumasuState
                        .activeIndex
                        !== currentIndex
                ) {

                    return;

                }


                moveToNextHyakumasuCell(
                    currentIndex
                );

            },
            delay
        );

}


function clearHyakumasuAdvanceTimer() {

    if (
        !hyakumasuState
            .pendingAdvanceTimer
    ) {

        return;

    }


    window.clearTimeout(
        hyakumasuState
            .pendingAdvanceTimer
    );


    hyakumasuState
        .pendingAdvanceTimer =
        null;

}


function moveToNextHyakumasuCell(
    currentIndex
) {

    if (
        currentIndex
        < HYAKUMASU_CELL_COUNT - 1
    ) {

        activateHyakumasuCell(
            currentIndex + 1,
            {
                synchronizePad:
                    true
            }
        );

        return;

    }


    if (
        countUnansweredHyakumasuCells()
        === 0
    ) {

        setHyakumasuMessage(
            "100マスすべて入力できました。採点してみよう。",
            "correct"
        );

    }

}


/* =========================================================
   19. 未入力
   ========================================================= */

function countUnansweredHyakumasuCells() {

    return hyakumasuState
        .answers
        .filter(
            (
                answer
            ) => {

                return answer === "";

            }
        )
        .length;

}


function activateFirstEmptyHyakumasuCell() {

    const emptyIndex =
        hyakumasuState
            .answers
            .findIndex(
                (
                    answer
                ) => {

                    return answer === "";

                }
            );


    if (
        emptyIndex < 0
    ) {

        return false;

    }


    return activateHyakumasuCell(
        emptyIndex,
        {
            synchronizePad:
                true
        }
    );

}


/* =========================================================
   20. リサイズ
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

                hyakumasuState.resizeTimer =
                    null;


                fitHyakumasuToScreen();

            },
            120
        );

}


/* =========================================================
   21. 採点
   ========================================================= */

async function submitHyakumasuAnswers() {

    if (
        hyakumasuState.finished
    ) {

        return;

    }


    clearHyakumasuAdvanceTimer();


    const unansweredCount =
        countUnansweredHyakumasuCells();


    if (
        unansweredCount > 0
    ) {

        setHyakumasuMessage(
            `まだ${unansweredCount}マス残っています。`,
            "incorrect"
        );


        activateFirstEmptyHyakumasuCell();


        return;

    }


    let correctCount =
        0;


    const cells =
        document.querySelectorAll(
            ".hyakumasu-cell-input"
        );


    cells.forEach(
        (
            cell,
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


            cell.classList.remove(
                "correct",
                "incorrect",
                "active"
            );


            cell.setAttribute(
                "aria-pressed",
                "false"
            );


            if (
                userAnswer
                === correctAnswer
            ) {

                correctCount += 1;


                cell.classList.add(
                    "correct"
                );

            } else {

                cell.classList.add(
                    "incorrect"
                );

            }


            cell.disabled =
                true;

        }
    );


    hyakumasuState.finished =
        true;


    hyakumasuState.activeIndex =
        -1;


    updateHyakumasuActiveAxes();


    const isPerfect =
        correctCount
        === HYAKUMASU_CELL_COUNT;


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
        window.NumberPad
        && typeof window.NumberPad.setDisabled
            === "function"
    ) {

        window.NumberPad.setDisabled(
            true
        );

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

            totalQuestions:
                HYAKUMASU_CELL_COUNT,

            elapsedSeconds

        });

}


/* =========================================================
   22. メッセージ
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
   23. 挑戦回数
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
   24. キャンセル
   ========================================================= */

function handleHyakumasuCancelButton() {

    clearHyakumasuAdvanceTimer();


    if (
        typeof cancelCurrentQuest
        === "function"
    ) {

        cancelCurrentQuest();

        return;

    }


    cancelHyakumasuQuest();

}


function cancelHyakumasuQuest() {

    resetHyakumasuQuest();

}


/* =========================================================
   25. 初期化・後始末
   ========================================================= */

function resetHyakumasuRuntimeOnly() {

    clearHyakumasuAdvanceTimer();


    if (
        hyakumasuState.resizeTimer
    ) {

        window.clearTimeout(
            hyakumasuState.resizeTimer
        );


        hyakumasuState.resizeTimer =
            null;

    }


    window.removeEventListener(
        "resize",
        handleHyakumasuResize
    );


    window.removeEventListener(
        "orientationchange",
        handleHyakumasuResize
    );


    if (
        window.NumberPad
        && typeof window.NumberPad.close
            === "function"
        && window.NumberPad.isOpen
        && window.NumberPad.isOpen()
    ) {

        window.NumberPad.close(
            false
        );

    }

}


function resetHyakumasuQuest() {

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


    resetHyakumasuRuntimeOnly();


    if (container) {

        container.innerHTML =
            "";

    }


    hyakumasuState =
        createEmptyHyakumasuState();

}


/* =========================================================
   26. 外部開始
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
   27. 自動登録
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        registerHyakumasuQuest();

    }
);


/* =========================================================
   28. window公開
   ========================================================= */

window.startHyakumasu =
    startHyakumasu;


window.cancelHyakumasu =
    cancelHyakumasuQuest;
