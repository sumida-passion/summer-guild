"use strict";

/* =========================================================
   夏休みギルド Ver0.5.1
   shop.js

   ギルドショップ画面
   商品一覧・購入確認・購入済み表示
   ゲーム内ダイアログ
   ========================================================= */

function renderGuildShop() {

    const list =
        document.getElementById(
            "guildShopItemList"
        );

    if (!list) {

        return false;

    }


    const items =
        Array.isArray(window.GUILD_SHOP_ITEMS)
            ? window.GUILD_SHOP_ITEMS
            : [];


    if (items.length === 0) {

        list.innerHTML = `
            <p class="shop-empty-message">
                ただいま商品を準備しています
            </p>
        `;

        updateGuildShopGpDisplay();

        return true;

    }


    list.innerHTML =
        items
            .map(
                (item) =>
                    createGuildShopItemHtml(item)
            )
            .join("");


    bindGuildShopItemButtons();

    updateGuildShopGpDisplay();

    return true;

}


function createGuildShopItemHtml(item) {

    const itemId =
        getSafeShopText(item && item.id);

    const itemName =
        getSafeShopText(item && item.name);

    const price =
        getSafeShopPrice(item && item.price);

    const owned =
        typeof isShopItemOwned === "function"
            ? isShopItemOwned(itemId)
            : false;


    return `
        <button
            class="shop-item-button${owned ? " owned" : ""}"
            type="button"
            data-shop-item-id="${escapeShopHtml(itemId)}"
            ${owned ? "disabled" : ""}>

            <span class="shop-item-name">
                ${escapeShopHtml(itemName)}
            </span>

            <span class="shop-item-price">
                ${owned ? "購入済み" : `${price} GP`}
            </span>

        </button>
    `;

}


function bindGuildShopItemButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-shop-item-id]"
        );


    buttons.forEach(
        (button) => {

            if (
                button.dataset
                    .summerGuildShopBound
                === "true"
            ) {

                return;

            }


            button.addEventListener(
                "click",
                handleGuildShopItemClick
            );


            button.dataset
                .summerGuildShopBound =
                "true";

        }
    );

}


function handleGuildShopItemClick(event) {

    const button =
        event.currentTarget;

    const itemId =
        button
            && button.dataset
            ? button.dataset.shopItemId
            : "";

    const item =
        findGuildShopItem(itemId);


    if (!item) {

        showGuildShopMessage(
            "商品情報を確認できませんでした。",
            "お知らせ"
        );

        return;

    }


    if (
        typeof isShopItemOwned === "function"
        && isShopItemOwned(item.id)
    ) {

        showGuildShopMessage(
            `${item.name}は購入済みです。`,
            "購入済み"
        );

        return;

    }


    showGuildShopConfirm(
        item,
        () => purchaseGuildShopItem(item)
    );

}


function purchaseGuildShopItem(item) {

    if (
        typeof buyShopItem !== "function"
    ) {

        showGuildShopMessage(
            "購入機能を利用できません。",
            "お知らせ"
        );

        return false;

    }


    const result =
        buyShopItem(
            item.id,
            item.price
        );


    if (!result || result.success !== true) {

        if (
            result
            && result.reason === "not-enough-gp"
        ) {

            const shortage =
                Math.max(
                    0,
                    getSafeShopPrice(item.price)
                    - getSafeShopPrice(result.totalGp)
                );


            showGuildShopMessage(
                `あと ${shortage} GP 必要です。\n所持GP：${result.totalGp}`,
                "GPが足りません"
            );

        } else if (
            result
            && result.reason === "already-owned"
        ) {

            showGuildShopMessage(
                `${item.name}は購入済みです。`,
                "購入済み"
            );

        } else {

            showGuildShopMessage(
                "購入できませんでした。",
                "お知らせ"
            );

        }


        updateGuildShopGpDisplay();

        return false;

    }


    renderGuildShop();


    showGuildShopMessage(
        `${item.name}を手に入れました！\n残り ${result.totalGp} GP`,
        "購入しました"
    );


    return true;

}


function findGuildShopItem(itemId) {

    const items =
        Array.isArray(window.GUILD_SHOP_ITEMS)
            ? window.GUILD_SHOP_ITEMS
            : [];


    return items.find(
        (item) =>
            item
            && item.id === itemId
    ) || null;

}


function updateGuildShopGpDisplay() {

    const display =
        document.getElementById(
            "guildShopGpDisplay"
        );


    if (!display) {

        return false;

    }


    const gp =
        typeof getGp === "function"
            ? getGp()
            : 0;


    display.textContent =
        `所持GP：${gp}`;


    return true;

}


/* =========================================================
   ゲーム内ダイアログ
   ========================================================= */

function ensureGuildShopDialog() {

    let overlay =
        document.getElementById(
            "guildShopDialogOverlay"
        );


    if (overlay) {

        return overlay;

    }


    overlay =
        document.createElement("div");

    overlay.id =
        "guildShopDialogOverlay";

    overlay.className =
        "guildshop-dialog-overlay";

    overlay.hidden = true;

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );


    overlay.innerHTML = `
        <section
            class="guildshop-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guildShopDialogTitle"
            aria-describedby="guildShopDialogMessage">

            <p class="guildshop-dialog-label">
                GUILD SHOP
            </p>

            <h3 id="guildShopDialogTitle">
                お知らせ
            </h3>

            <p
                id="guildShopDialogMessage"
                class="guildshop-dialog-message">
            </p>

            <div class="guildshop-dialog-actions">

                <button
                    id="guildShopDialogCancel"
                    class="guildshop-dialog-cancel"
                    type="button">
                    やめる
                </button>

                <button
                    id="guildShopDialogConfirm"
                    class="guildshop-dialog-confirm"
                    type="button">
                    購入する
                </button>

            </div>

        </section>
    `;


    document.body.appendChild(overlay);


    overlay.addEventListener(
        "click",
        (event) => {

            if (event.target === overlay) {

                closeGuildShopDialog();

            }

        }
    );


    return overlay;

}


function openGuildShopDialog(options = {}) {

    const overlay =
        ensureGuildShopDialog();

    const title =
        document.getElementById(
            "guildShopDialogTitle"
        );

    const message =
        document.getElementById(
            "guildShopDialogMessage"
        );

    const cancelButton =
        document.getElementById(
            "guildShopDialogCancel"
        );

    const confirmButton =
        document.getElementById(
            "guildShopDialogConfirm"
        );


    if (
        !overlay
        || !title
        || !message
        || !cancelButton
        || !confirmButton
    ) {

        return false;

    }


    title.textContent =
        String(options.title || "お知らせ");

    message.textContent =
        String(options.message || "");


    const isConfirm =
        typeof options.onConfirm === "function";


    cancelButton.hidden =
        !isConfirm;

    cancelButton.textContent =
        String(options.cancelLabel || "やめる");

    confirmButton.textContent =
        String(
            options.confirmLabel
            || (isConfirm ? "購入する" : "閉じる")
        );


    cancelButton.onclick =
        closeGuildShopDialog;

    confirmButton.onclick = () => {

        closeGuildShopDialog();


        if (isConfirm) {

            options.onConfirm();

        }

    };


    overlay.hidden = false;

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "guildshop-dialog-open"
    );


    window.requestAnimationFrame(
        () => {

            overlay.classList.add("is-open");

            confirmButton.focus();

        }
    );


    return true;

}


function closeGuildShopDialog() {

    const overlay =
        document.getElementById(
            "guildShopDialogOverlay"
        );


    if (!overlay || overlay.hidden) {

        return false;

    }


    overlay.classList.remove("is-open");

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "guildshop-dialog-open"
    );


    window.setTimeout(
        () => {

            if (
                !overlay.classList.contains(
                    "is-open"
                )
            ) {

                overlay.hidden = true;

            }

        },
        220
    );


    return true;

}


function showGuildShopConfirm(item, onConfirm) {

    openGuildShopDialog({

        title:
            getSafeShopText(item.name),

        message:
            `${getSafeShopPrice(item.price)} GP\n\nこの品を購入しますか？`,

        confirmLabel:
            "購入する",

        cancelLabel:
            "やめる",

        onConfirm

    });

}


function showGuildShopMessage(
    message,
    title = "お知らせ"
) {

    openGuildShopDialog({

        title,
        message,
        confirmLabel: "閉じる"

    });

}


function getSafeShopText(value) {

    if (
        typeof value !== "string"
    ) {

        return "";

    }


    return value.trim();

}


function getSafeShopPrice(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return 0;

    }


    return Math.max(
        0,
        Math.floor(number)
    );

}


function escapeShopHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


window.renderGuildShop =
    renderGuildShop;

window.updateGuildShopGpDisplay =
    updateGuildShopGpDisplay;
