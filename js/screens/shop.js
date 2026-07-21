"use strict";

/* =========================================================
   夏休みギルド Ver0.5.0
   shop.js

   ギルドショップ画面
   商品一覧・購入確認・購入済み表示
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
            "商品情報を確認できませんでした。"
        );

        return;

    }


    if (
        typeof isShopItemOwned === "function"
        && isShopItemOwned(item.id)
    ) {

        showGuildShopMessage(
            `${item.name}は購入済みです。`
        );

        return;

    }


    const confirmed =
        window.confirm(
            `${item.name}\n${item.price} GP\n\n購入しますか？`
        );


    if (!confirmed) {

        return;

    }


    purchaseGuildShopItem(item);

}


function purchaseGuildShopItem(item) {

    if (
        typeof buyShopItem !== "function"
    ) {

        showGuildShopMessage(
            "購入機能を利用できません。"
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

            showGuildShopMessage(
                `GPが足りません。\n必要：${item.price} GP\n所持：${result.totalGp} GP`
            );

        } else if (
            result
            && result.reason === "already-owned"
        ) {

            showGuildShopMessage(
                `${item.name}は購入済みです。`
            );

        } else {

            showGuildShopMessage(
                "購入できませんでした。"
            );

        }


        updateGuildShopGpDisplay();

        return false;

    }


    showGuildShopMessage(
        `${item.name}を購入しました！\n残り ${result.totalGp} GP`
    );


    renderGuildShop();

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


function showGuildShopMessage(message) {

    window.alert(
        String(message || "")
    );

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
