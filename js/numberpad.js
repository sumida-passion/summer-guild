"use strict";

/* =========================================================
   勉強ギルド 共通数字入力装置
   numberpad.js Ver1.0.0

   使用画像

   assets/ui/buttons/
   ├── numberpad_bg.png
   ├── wood_button.png
   ├── wood_button_pressed.png
   └── wood_panel.png


   基本的な使い方

   NumberPad.open({

       container:
           document.getElementById("表示する場所"),

       title:
           "数字を入力",

       maxLength:
           2,

       value:
           "",

       onChange(value) {
           console.log(value);
       },

       onDigit(digit, value) {
           console.log(digit, value);
       },

       onBackspace(value) {
           console.log(value);
       }

   });


   現在の値を取得

   const value =
       NumberPad.getValue();


   値を空にする

   NumberPad.clear();


   閉じる

   NumberPad.close();
   ========================================================= */


(function initializeNumberPad(
    windowObject,
    documentObject
) {

    /*
      同じJavaScriptが二重に読み込まれた場合は、
      最初に作成されたNumberPadを使用する。
    */

    if (windowObject.NumberPad) {

        return;

    }


    /* =====================================================
       1. 固定設定
       ===================================================== */

    const NUMBER_PAD_VERSION =
        "1.0.0";


    const NUMBER_PAD_STYLE_ID =
        "studyGuildNumberPadStyles";


    const NUMBER_PAD_ROOT_ID =
        "studyGuildNumberPad";


    const NUMBER_PAD_ASSET_PATH =
        "assets/ui/buttons/";


    const NUMBER_PAD_IMAGES = {

        background:
            `${NUMBER_PAD_ASSET_PATH}numberpad_bg.png`,

        button:
            `${NUMBER_PAD_ASSET_PATH}wood_button.png`,

        buttonPressed:
            `${NUMBER_PAD_ASSET_PATH}wood_button_pressed.png`,

        panel:
            `${NUMBER_PAD_ASSET_PATH}wood_panel.png`

    };


    const DEFAULT_OPTIONS = {

        container:
            null,

        title:
            "数字を入力",

        maxLength:
            2,

        value:
            "",

        showDisplay:
            true,

        showClear:
            true,

        showConfirm:
            false,

        confirmText:
            "決定",

        clearText:
            "消す",

        backspaceText:
            "←",

        disabled:
            false,

        className:
            "",

        ariaLabel:
            "数字入力",

        onOpen:
            null,

        onClose:
            null,

        onChange:
            null,

        onDigit:
            null,

        onBackspace:
            null,

        onClear:
            null,

        onConfirm:
            null

    };


    /* =====================================================
       2. 内部状態
       ===================================================== */

    const state = {

        isOpen:
            false,

        value:
            "",

        disabled:
            false,

        options:
            {
                ...DEFAULT_OPTIONS
            },

        root:
            null,

        display:
            null,

        title:
            null,

        buttonArea:
            null,

        cleanupFunctions:
            []

    };


    /* =====================================================
       3. 共通処理
       ===================================================== */

    function isFunction(
        value
    ) {

        return typeof value
            === "function";

    }


    function callCallback(
        callback,
        ...argumentsList
    ) {

        if (!isFunction(callback)) {

            return;

        }


        try {

            callback(
                ...argumentsList
            );

        } catch (error) {

            console.error(
                "NumberPadのコールバック処理でエラーが発生しました。",
                error
            );

        }

    }


    function normalizeMaxLength(
        value
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
            || number < 1
        ) {

            return 1;

        }


        return Math.floor(number);

    }


    function normalizeNumericValue(
        value,
        maxLength
    ) {

        const normalized =
            String(
                value ?? ""
            )
                .replace(
                    /[^0-9]/g,
                    ""
                )
                .slice(
                    0,
                    maxLength
                );


        return normalized;

    }


    function resolveContainer(
        container
    ) {

        if (
            container
            instanceof HTMLElement
        ) {

            return container;

        }


        if (
            typeof container
            === "string"
        ) {

            const matchedElement =
                documentObject.querySelector(
                    container
                );


            if (matchedElement) {

                return matchedElement;

            }

        }


        return documentObject.body;

    }


    function removeAllEventListeners() {

        state
            .cleanupFunctions
            .forEach(
                (
                    cleanup
                ) => {

                    try {

                        cleanup();

                    } catch (error) {

                        console.warn(
                            "NumberPadのイベント解除に失敗しました。",
                            error
                        );

                    }

                }
            );


        state.cleanupFunctions =
            [];

    }


    function registerEvent(
        element,
        eventName,
        listener,
        options
    ) {

        if (!element) {

            return;

        }


        element.addEventListener(
            eventName,
            listener,
            options
        );


        state.cleanupFunctions.push(
            () => {

                element.removeEventListener(
                    eventName,
                    listener,
                    options
                );

            }
        );

    }


    /* =====================================================
       4. CSS
       ===================================================== */

    function installStyles() {

        const existingStyle =
            documentObject.getElementById(
                NUMBER_PAD_STYLE_ID
            );


        if (existingStyle) {

            return;

        }


        const style =
            documentObject.createElement(
                "style"
            );


        style.id =
            NUMBER_PAD_STYLE_ID;


        style.textContent = `

            /* =============================================
               NumberPad 全体
               ============================================= */

            .study-guild-numberpad {
                box-sizing: border-box;

                position: relative;

                display: flex;
                flex-direction: column;

                width: min(28vw, 290px);
                min-width: 210px;
                max-width: 100%;

                padding: 20px;

                border: 0;
                border-radius: 24px;

                background-color: #9b5f2d;
                background-image:
                    url("${NUMBER_PAD_IMAGES.background}");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 100%;

                box-shadow:
                    0 12px 20px rgba(44, 22, 5, 0.34),
                    inset 0 1px 2px rgba(255, 244, 210, 0.38);

                user-select: none;
                -webkit-user-select: none;

                touch-action: manipulation;

                isolation: isolate;
            }


            .study-guild-numberpad,
            .study-guild-numberpad * {
                box-sizing: border-box;
            }


            .study-guild-numberpad.is-disabled {
                opacity: 0.62;
                pointer-events: none;
            }


            /* =============================================
               上部
               ============================================= */

            .study-guild-numberpad__header {
                display: flex;
                flex-direction: column;
                gap: 8px;

                margin-bottom: 12px;
            }


            .study-guild-numberpad__title {
                margin: 0;

                color: #3b1d09;

                font-family:
                    "Hiragino Maru Gothic ProN",
                    "Yu Gothic",
                    sans-serif;

                font-size: clamp(15px, 2vw, 20px);
                font-weight: 800;
                line-height: 1.2;
                text-align: center;

                text-shadow:
                    0 1px 0 rgba(255, 232, 185, 0.78);
            }


            /* =============================================
               数字表示欄
               ============================================= */

            .study-guild-numberpad__display {
                display: flex;
                align-items: center;
                justify-content: flex-end;

                width: 100%;
                min-height: 52px;

                padding: 7px 14px;

                border: 0;
                border-radius: 12px;

                background-color: #d59a58;
                background-image:
                    url("${NUMBER_PAD_IMAGES.panel}");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 100%;

                box-shadow:
                    inset 0 3px 5px rgba(50, 21, 3, 0.38),
                    0 1px 0 rgba(255, 231, 180, 0.5);

                color: #301605;

                font-family:
                    "Arial Rounded MT Bold",
                    "Hiragino Maru Gothic ProN",
                    sans-serif;

                font-size: clamp(24px, 3vw, 34px);
                font-weight: 900;
                line-height: 1;
                letter-spacing: 0.06em;

                overflow: hidden;
            }


            .study-guild-numberpad__display:empty::before {
                content: "—";

                opacity: 0.46;
            }


            /* =============================================
               ボタン配置
               ============================================= */

            .study-guild-numberpad__keys {
                display: grid;
                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );

                gap: 9px;

                width: 100%;
            }


            .study-guild-numberpad__key {
                position: relative;

                display: flex;
                align-items: center;
                justify-content: center;

                width: 100%;
                min-width: 0;
                aspect-ratio: 1 / 0.82;

                padding: 0;

                border: 0;
                border-radius: 10px;

                background-color: transparent;
                background-image:
                    url("${NUMBER_PAD_IMAGES.button}");
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100% 100%;

                box-shadow:
                    0 4px 5px rgba(51, 24, 5, 0.32);

                color: #2b1406;

                font-family:
                    "Arial Rounded MT Bold",
                    "Hiragino Maru Gothic ProN",
                    sans-serif;

                font-size: clamp(23px, 3vw, 34px);
                font-weight: 900;
                line-height: 1;

                text-shadow:
                    0 1px 0 rgba(255, 225, 167, 0.72);

                cursor: pointer;

                touch-action: manipulation;

                -webkit-tap-highlight-color:
                    transparent;

                transition:
                    transform 55ms ease,
                    filter 55ms ease,
                    box-shadow 55ms ease;
            }


            .study-guild-numberpad__key:hover {
                filter: brightness(1.04);
            }


            .study-guild-numberpad__key:active,
            .study-guild-numberpad__key.is-pressed {
                transform:
                    translateY(3px)
                    scale(0.98);

                background-image:
                    url("${NUMBER_PAD_IMAGES.buttonPressed}");

                box-shadow:
                    0 1px 2px rgba(51, 24, 5, 0.3);

                filter: brightness(0.97);
            }


            .study-guild-numberpad__key:focus-visible {
                outline:
                    4px solid
                    rgba(255, 238, 154, 0.96);

                outline-offset:
                    1px;
            }


            .study-guild-numberpad__key--function {
                font-size: clamp(15px, 2vw, 22px);
            }


            .study-guild-numberpad__key--zero {
                grid-column: span 2;

                aspect-ratio: auto;
                min-height: 58px;

                background-size: 100% 100%;
            }


            .study-guild-numberpad__key--confirm {
                grid-column:
                    1 / -1;

                aspect-ratio: auto;
                min-height: 55px;
            }


            /* =============================================
               小さい画面
               ============================================= */

            @media (
                max-width: 760px
            ) {

                .study-guild-numberpad {
                    width: min(42vw, 260px);
                    min-width: 190px;

                    padding: 16px;
                }


                .study-guild-numberpad__keys {
                    gap: 7px;
                }


                .study-guild-numberpad__display {
                    min-height: 46px;
                }

            }


            @media (
                max-height: 620px
            ) {

                .study-guild-numberpad {
                    padding: 13px;
                }


                .study-guild-numberpad__header {
                    gap: 5px;
                    margin-bottom: 8px;
                }


                .study-guild-numberpad__display {
                    min-height: 40px;
                    padding:
                        5px
                        11px;
                }


                .study-guild-numberpad__keys {
                    gap: 6px;
                }


                .study-guild-numberpad__key {
                    aspect-ratio: 1 / 0.7;
                }


                .study-guild-numberpad__key--zero,
                .study-guild-numberpad__key--confirm {
                    min-height: 45px;
                }

            }

        `;


        documentObject.head.appendChild(
            style
        );

    }


    /* =====================================================
       5. HTML作成
       ===================================================== */

    function createDigitButton(
        digit
    ) {

        return `
            <button
                class="study-guild-numberpad__key"
                type="button"
                data-numberpad-action="digit"
                data-numberpad-digit="${digit}"
                aria-label="${digit}"
            >
                ${digit}
            </button>
        `;

    }


    function createNumberPadHtml(
        options
    ) {

        const clearButton =
            options.showClear
                ? `
                    <button
                        class="
                            study-guild-numberpad__key
                            study-guild-numberpad__key--function
                        "
                        type="button"
                        data-numberpad-action="clear"
                        aria-label="入力をすべて消す"
                    >
                        ${options.clearText}
                    </button>
                `
                : "";


        const confirmButton =
            options.showConfirm
                ? `
                    <button
                        class="
                            study-guild-numberpad__key
                            study-guild-numberpad__key--function
                            study-guild-numberpad__key--confirm
                        "
                        type="button"
                        data-numberpad-action="confirm"
                        aria-label="${options.confirmText}"
                    >
                        ${options.confirmText}
                    </button>
                `
                : "";


        const display =
            options.showDisplay
                ? `
                    <div
                        id="studyGuildNumberPadDisplay"
                        class="study-guild-numberpad__display"
                        role="status"
                        aria-live="polite"
                        aria-label="入力中の数字"
                    ></div>
                `
                : "";


        return `
            <section
                id="${NUMBER_PAD_ROOT_ID}"
                class="
                    study-guild-numberpad
                    ${options.className}
                "
                aria-label="${options.ariaLabel}"
            >

                <div class="study-guild-numberpad__header">

                    <p class="study-guild-numberpad__title">
                        ${options.title}
                    </p>

                    ${display}

                </div>


                <div class="study-guild-numberpad__keys">

                    ${createDigitButton(7)}
                    ${createDigitButton(8)}
                    ${createDigitButton(9)}

                    ${createDigitButton(4)}
                    ${createDigitButton(5)}
                    ${createDigitButton(6)}

                    ${createDigitButton(1)}
                    ${createDigitButton(2)}
                    ${createDigitButton(3)}

                    <button
                        class="
                            study-guild-numberpad__key
                            study-guild-numberpad__key--zero
                        "
                        type="button"
                        data-numberpad-action="digit"
                        data-numberpad-digit="0"
                        aria-label="0"
                    >
                        0
                    </button>

                    <button
                        class="
                            study-guild-numberpad__key
                            study-guild-numberpad__key--function
                        "
                        type="button"
                        data-numberpad-action="backspace"
                        aria-label="一文字戻す"
                    >
                        ${options.backspaceText}
                    </button>

                    ${clearButton}

                    ${confirmButton}

                </div>

            </section>
        `;

    }


    /* =====================================================
       6. 表示更新
       ===================================================== */

    function updateDisplay() {

        if (!state.display) {

            return;

        }


        state.display.textContent =
            state.value;

    }


    function updateDisabledState() {

        if (!state.root) {

            return;

        }


        state.root.classList.toggle(
            "is-disabled",
            state.disabled
        );


        state.root
            .querySelectorAll(
                "button"
            )
            .forEach(
                (
                    button
                ) => {

                    button.disabled =
                        state.disabled;

                }
            );

    }


    function notifyChange(
        source
    ) {

        updateDisplay();


        callCallback(
            state.options.onChange,
            state.value,
            {
                source,
                numberPad:
                    NumberPad
            }
        );

    }


    /* =====================================================
       7. 数字入力
       ===================================================== */

    function inputDigit(
        digit
    ) {

        if (
            !state.isOpen
            || state.disabled
        ) {

            return state.value;

        }


        const normalizedDigit =
            String(digit)
                .replace(
                    /[^0-9]/g,
                    ""
                )
                .slice(
                    0,
                    1
                );


        if (normalizedDigit === "") {

            return state.value;

        }


        if (
            state.value.length
            >= state.options.maxLength
        ) {

            return state.value;

        }


        state.value +=
            normalizedDigit;


        notifyChange(
            "digit"
        );


        callCallback(
            state.options.onDigit,
            normalizedDigit,
            state.value,
            {
                numberPad:
                    NumberPad
            }
        );


        return state.value;

    }


    function backspace() {

        if (
            !state.isOpen
            || state.disabled
        ) {

            return state.value;

        }


        if (state.value.length === 0) {

            return state.value;

        }


        state.value =
            state.value.slice(
                0,
                -1
            );


        notifyChange(
            "backspace"
        );


        callCallback(
            state.options.onBackspace,
            state.value,
            {
                numberPad:
                    NumberPad
            }
        );


        return state.value;

    }


    function clearValue() {

        if (
            !state.isOpen
            || state.disabled
        ) {

            return state.value;

        }


        state.value =
            "";


        notifyChange(
            "clear"
        );


        callCallback(
            state.options.onClear,
            state.value,
            {
                numberPad:
                    NumberPad
            }
        );


        return state.value;

    }


    function confirmValue() {

        if (
            !state.isOpen
            || state.disabled
        ) {

            return state.value;

        }


        callCallback(
            state.options.onConfirm,
            state.value,
            {
                numberPad:
                    NumberPad
            }
        );


        return state.value;

    }


    /* =====================================================
       8. ボタンイベント
       ===================================================== */

    function handleButtonAction(
        event
    ) {

        const button =
            event.target.closest(
                "[data-numberpad-action]"
            );


        if (
            !button
            || !state.root
            || !state.root.contains(button)
        ) {

            return;

        }


        event.preventDefault();


        const action =
            button.dataset
                .numberpadAction;


        if (action === "digit") {

            inputDigit(
                button.dataset
                    .numberpadDigit
            );

            return;

        }


        if (action === "backspace") {

            backspace();

            return;

        }


        if (action === "clear") {

            clearValue();

            return;

        }


        if (action === "confirm") {

            confirmValue();

        }

    }


    function addPressedEffect(
        event
    ) {

        const button =
            event.target.closest(
                ".study-guild-numberpad__key"
            );


        if (!button) {

            return;

        }


        button.classList.add(
            "is-pressed"
        );

    }


    function removePressedEffects() {

        if (!state.root) {

            return;

        }


        state.root
            .querySelectorAll(
                ".is-pressed"
            )
            .forEach(
                (
                    button
                ) => {

                    button.classList.remove(
                        "is-pressed"
                    );

                }
            );

    }


    function bindEvents() {

        if (!state.root) {

            return;

        }


        registerEvent(
            state.root,
            "click",
            handleButtonAction
        );


        registerEvent(
            state.root,
            "pointerdown",
            addPressedEffect
        );


        registerEvent(
            state.root,
            "pointerup",
            removePressedEffects
        );


        registerEvent(
            state.root,
            "pointercancel",
            removePressedEffects
        );


        registerEvent(
            state.root,
            "pointerleave",
            removePressedEffects
        );

    }


    /* =====================================================
       9. 開く・閉じる
       ===================================================== */

    function open(
        suppliedOptions = {}
    ) {

        close(
            false
        );


        installStyles();


        const mergedOptions = {

            ...DEFAULT_OPTIONS,

            ...suppliedOptions

        };


        mergedOptions.maxLength =
            normalizeMaxLength(
                mergedOptions.maxLength
            );


        const container =
            resolveContainer(
                mergedOptions.container
            );


        state.options =
            mergedOptions;


        state.value =
            normalizeNumericValue(
                mergedOptions.value,
                mergedOptions.maxLength
            );


        state.disabled =
            Boolean(
                mergedOptions.disabled
            );


        container.insertAdjacentHTML(
            "beforeend",
            createNumberPadHtml(
                mergedOptions
            )
        );


        state.root =
            documentObject.getElementById(
                NUMBER_PAD_ROOT_ID
            );


        if (!state.root) {

            console.error(
                "NumberPadの表示に失敗しました。"
            );

            return null;

        }


        state.display =
            state.root.querySelector(
                ".study-guild-numberpad__display"
            );


        state.title =
            state.root.querySelector(
                ".study-guild-numberpad__title"
            );


        state.buttonArea =
            state.root.querySelector(
                ".study-guild-numberpad__keys"
            );


        state.isOpen =
            true;


        bindEvents();

        updateDisplay();

        updateDisabledState();


        callCallback(
            state.options.onOpen,
            {
                value:
                    state.value,

                root:
                    state.root,

                numberPad:
                    NumberPad
            }
        );


        return state.root;

    }


    function close(
        notify = true
    ) {

        const oldOptions =
            state.options;


        const oldValue =
            state.value;


        removeAllEventListeners();


        if (
            state.root
            && state.root.parentNode
        ) {

            state.root.parentNode.removeChild(
                state.root
            );

        }


        state.isOpen =
            false;

        state.root =
            null;

        state.display =
            null;

        state.title =
            null;

        state.buttonArea =
            null;


        if (notify) {

            callCallback(
                oldOptions.onClose,
                {
                    value:
                        oldValue,

                    numberPad:
                        NumberPad
                }
            );

        }


        return true;

    }


    /* =====================================================
       10. 外部操作
       ===================================================== */

    function setValue(
        value,
        notify = true
    ) {

        state.value =
            normalizeNumericValue(
                value,
                state.options.maxLength
            );


        updateDisplay();


        if (notify) {

            callCallback(
                state.options.onChange,
                state.value,
                {
                    source:
                        "setValue",

                    numberPad:
                        NumberPad
                }
            );

        }


        return state.value;

    }


    function getValue() {

        return state.value;

    }


    function setDisabled(
        disabled
    ) {

        state.disabled =
            Boolean(disabled);


        updateDisabledState();


        return state.disabled;

    }


    function setTitle(
        title
    ) {

        state.options.title =
            String(
                title ?? ""
            );


        if (state.title) {

            state.title.textContent =
                state.options.title;

        }


        return state.options.title;

    }


    function isOpen() {

        return state.isOpen;

    }


    function getRoot() {

        return state.root;

    }


    function destroy() {

        close(
            false
        );


        const style =
            documentObject.getElementById(
                NUMBER_PAD_STYLE_ID
            );


        if (style) {

            style.remove();

        }


        return true;

    }


    /* =====================================================
       11. 公開API
       ===================================================== */

    const NumberPad = {

        version:
            NUMBER_PAD_VERSION,

        open,

        mount:
            open,

        close,

        destroy,

        input:
            inputDigit,

        inputDigit,

        backspace,

        clear:
            clearValue,

        confirm:
            confirmValue,

        setValue,

        getValue,

        setDisabled,

        setTitle,

        isOpen,

        getRoot

    };


    windowObject.NumberPad =
        NumberPad;


})(
    window,
    document
);
