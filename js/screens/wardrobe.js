"use strict";

/* =========================================================
   夏休みギルド Ver0.6.0
   wardrobe.js

   部屋の着せ替え画面
   購入済み装備だけを表示し、同一座標PNGを切り替える。
   ========================================================= */

function openWardrobe() {

    const overlay =
        document.getElementById("wardrobeOverlay");


    if (!overlay) {

        return false;

    }


    renderWardrobe();

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");

    requestAnimationFrame(
        () => overlay.classList.add("is-open")
    );

    document.body.classList.add("wardrobe-open");

    return true;

}


function closeWardrobe() {

    const overlay =
        document.getElementById("wardrobeOverlay");


    if (!overlay) {

        return false;

    }


    overlay.classList.remove("is-open");
    document.body.classList.remove("wardrobe-open");

    window.setTimeout(
        () => {
            overlay.hidden = true;
            overlay.setAttribute("aria-hidden", "true");
        },
        180
    );

    return true;

}


function renderWardrobe() {

    const list =
        document.getElementById("wardrobeItemList");


    if (!list) {

        return false;

    }


    const wearableItems =
        getOwnedWearableItems();


    const defaultEquipped =
        isDefaultOutfitEquipped();


    const defaultButton = `
        <button
            class="wardrobe-item-button${defaultEquipped ? " equipped" : ""}"
            type="button"
            data-wardrobe-default="true">

            <span>いつもの服</span>

            <span class="wardrobe-item-state">
                ${defaultEquipped ? "装備中" : "着る"}
            </span>

        </button>
    `;


    const itemButtons =
        wearableItems
            .map(
                (item) => {

                    const equipped =
                        typeof isShopItemEquipped === "function"
                        && isShopItemEquipped(item.id);


                    return `
                        <button
                            class="wardrobe-item-button${equipped ? " equipped" : ""}"
                            type="button"
                            data-wardrobe-item-id="${escapeWardrobeHtml(item.id)}">

                            <span>
                                ${escapeWardrobeHtml(item.name)}
                                ${item.equipmentType === "fullset" ? '<small class="wardrobe-fullset-label">全身固定</small>' : ''}
                            </span>

                            <span class="wardrobe-item-state">
                                ${equipped ? "装備中" : "着る"}
                            </span>

                        </button>
                    `;

                }
            )
            .join("");


    const emptyMessage =
        wearableItems.length === 0
            ? `
                <p class="wardrobe-empty-message">
                    まだ着替えられる服を持っていません。<br>
                    ギルドショップで手に入れよう。
                </p>
            `
            : "";


    list.innerHTML =
        defaultButton
        + itemButtons
        + emptyMessage;


    bindWardrobeButtons();

    return true;

}


function getOwnedWearableItems() {

    const items =
        Array.isArray(window.GUILD_SHOP_ITEMS)
            ? window.GUILD_SHOP_ITEMS
            : [];


    return items.filter(
        (item) =>
            item
            && item.wearable === true
            && item.layers
            && typeof item.layers === "object"
            && typeof isShopItemOwned === "function"
            && isShopItemOwned(item.id)
    );

}


function bindWardrobeButtons() {

    const defaultButton =
        document.querySelector("[data-wardrobe-default]");


    if (defaultButton) {

        defaultButton.addEventListener(
            "click",
            () => {

                if (
                    typeof resetPlayerEquipment
                    === "function"
                ) {

                    resetPlayerEquipment();
                    setWardrobeStatus("いつもの服に着替えました。");
                    renderWardrobe();

                }

            },
            { once: true }
        );

    }


    const itemButtons =
        document.querySelectorAll(
            "[data-wardrobe-item-id]"
        );


    itemButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const itemId =
                        button.dataset.wardrobeItemId || "";


                    if (
                        typeof equipShopItem
                        !== "function"
                    ) {

                        setWardrobeStatus(
                            "着せ替え機能を利用できません。"
                        );

                        return;

                    }


                    const result =
                        equipShopItem(itemId);


                    if (
                        !result
                        || result.success !== true
                    ) {

                        setWardrobeStatus(
                            "この服には着替えられませんでした。"
                        );

                        return;

                    }


                    const item =
                        findWardrobeItem(itemId);


                    setWardrobeStatus(
                        item
                            ? `${item.name}に着替えました。`
                            : "着替えました。"
                    );


                    renderWardrobe();

                },
                { once: true }
            );

        }
    );

}


function findWardrobeItem(itemId) {

    const items =
        Array.isArray(window.GUILD_SHOP_ITEMS)
            ? window.GUILD_SHOP_ITEMS
            : [];


    return items.find(
        (item) => item && item.id === itemId
    ) || null;

}


function isDefaultOutfitEquipped() {

    if (
        typeof getPlayerEquipment
        !== "function"
    ) {

        return true;

    }


    const equipment =
        getPlayerEquipment();


    return (
        equipment.bottoms
        === "assets/characters/player/clothes/bottoms/default_bottoms.png"
        && equipment.tops
        === "assets/characters/player/clothes/tops/default_tops.png"
        && !equipment.shoes
        && !equipment.outer
        && !equipment.capes
        && !equipment.gloves
        && !equipment.head
        && !equipment.accessories
    );

}


function setWardrobeStatus(message) {

    const status =
        document.getElementById("wardrobeStatus");


    if (status) {

        status.textContent =
            typeof message === "string"
                ? message
                : "";

    }

}


function escapeWardrobeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


window.openWardrobe = openWardrobe;
window.closeWardrobe = closeWardrobe;
window.renderWardrobe = renderWardrobe;
