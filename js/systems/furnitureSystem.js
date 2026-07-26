"use strict";

/* =========================================================
   家具設置システム Ver1.0
   ・未購入 / 配送待ち / 設置済み
   ・通常購入は現実の日付が変わった後に設置
   ・管理者モードでは即時に状態変更
   ・全家具画像は部屋背景と同じキャンバス・原点で重ねる
   ========================================================= */

(function () {
    const STATUS = Object.freeze({
        UNOWNED: "unowned",
        PENDING: "pending",
        PLACED: "placed"
    });

    const FURNITURE = [
        { id: "furniture_magic_circle", name: "賢者の魔法陣", price: 200, image: "assets/items/furniture/magicCircle.PNG", layer: 10, description: "賢者だけが描けると伝わる神秘の魔法陣。部屋の床に、静かな魔力の気配を残す。" },
        { id: "furniture_magic_broom", name: "魔法のほうき", price: 250, image: "assets/items/furniture/magicBroom.PNG", layer: 12, description: "使い込まれた魔法使いのほうき。壁に立て掛けると、書斎に冒険の気配が生まれる。" },
        { id: "furniture_magic_crystal", name: "知恵の水晶", price: 300, image: "assets/items/furniture/magicCrystal.PNG", layer: 42, description: "古代の賢者が学びのために使ったと伝わる水晶。机の上で淡い光をたたえている。" },
        { id: "furniture_chair", name: "魔法使いの椅子", price: 300, image: "assets/items/furniture/chair.PNG", layer: 25, description: "長い読書と研究の時間を支えてきた、重厚な魔法使いの椅子。" },
        { id: "furniture_bookshelf", name: "魔導書の本棚", price: 350, image: "assets/items/furniture/bookshelf.PNG", layer: 20, description: "歴代のギルドマスターが集めた魔導書が静かに並ぶ本棚。" },
        { id: "furniture_star_globe", name: "星の地球儀", price: 350, image: "assets/items/furniture/starGlobe.PNG", layer: 22, description: "星々と世界の広がりを映し出す神秘の地球儀。見つめるたびに遠い場所へ思いが向かう。" },
        { id: "furniture_wisemen_desk", name: "魔法使いの机", price: 400, image: "assets/items/furniture/wisemenDesk.PNG", layer: 35, description: "数え切れない学びと研究が積み重ねられてきた、賢者のための大きな机。" },
        { id: "furniture_lightning_staff", name: "稲妻の杖", price: 400, image: "assets/items/furniture/staffofLightning.PNG", layer: 45, description: "稲妻の力を宿した上級魔法使いの杖。部屋の中でも強い存在感を放つ。" },
        { id: "furniture_table_clock", name: "時詠みの置時計", price: 450, image: "assets/items/furniture/GuildTableClock.PNG", layer: 44, description: "時を読む魔法使いが大切に使っていた置時計。今日も静かに時を刻み、学ぶ者を見守る。" }
    ];

    function getSettingsRoot() {
        // settings.js の Settings は let 宣言のため window.Settings にはならない。
        // 同じ classic script のグローバル lexical binding を直接参照する。
        if (typeof Settings !== "undefined" && Settings && typeof Settings === "object") {
            return Settings;
        }
        return null;
    }

    function ensureData() {
        const settings = getSettingsRoot();
        if (!settings) return null;
        if (!settings.furniture || typeof settings.furniture !== "object" || Array.isArray(settings.furniture)) {
            settings.furniture = { items: {}, deliveryNoticeDate: "" };
        }
        if (!settings.furniture.items || typeof settings.furniture.items !== "object" || Array.isArray(settings.furniture.items)) {
            settings.furniture.items = {};
        }
        return settings.furniture;
    }

    function getItem(id) { return FURNITURE.find((item) => item.id === id) || null; }

    function getState(id) {
        const data = ensureData();
        const saved = data && data.items[id];
        if (!saved || typeof saved !== "object") return { status: STATUS.UNOWNED, purchasedDate: "" };
        const status = Object.values(STATUS).includes(saved.status) ? saved.status : STATUS.UNOWNED;
        return { status, purchasedDate: typeof saved.purchasedDate === "string" ? saved.purchasedDate : "" };
    }

    function setState(id, status, purchasedDate = "") {
        const data = ensureData();
        if (!data || !getItem(id)) return false;
        data.items[id] = { status, purchasedDate };
        if (typeof saveSettings === "function") saveSettings();
        renderRoom();
        if (typeof renderGuildShop === "function") renderGuildShop();
        return true;
    }

    function isFurnitureItem(id) { return Boolean(getItem(id)); }
    function isOwned(id) { return getState(id).status !== STATUS.UNOWNED; }

    function purchase(item) {
        const state = getState(item.id);
        if (state.status !== STATUS.UNOWNED) {
            return { success: false, reason: "already-owned", totalGp: typeof getGp === "function" ? getGp() : 0 };
        }
        if (typeof spendGp !== "function" || !spendGp(item.price)) {
            return { success: false, reason: "not-enough-gp", totalGp: typeof getGp === "function" ? getGp() : 0 };
        }
        const saved = setState(item.id, STATUS.PENDING, typeof getLocalDateKey === "function" ? getLocalDateKey() : localDateKey());
        if (!saved) {
            // 保存できなかった場合はGPを戻し、「GPだけ減る」状態を防ぐ。
            if (typeof addGp === "function") addGp(item.price);
            return { success: false, reason: "save-failed", totalGp: typeof getGp === "function" ? getGp() : 0 };
        }
        return { success: true, status: STATUS.PENDING, totalGp: typeof getGp === "function" ? getGp() : 0 };
    }

    function localDateKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }

    function processDeliveries(showNotice) {
        const data = ensureData();
        if (!data) return [];
        const today = typeof getLocalDateKey === "function" ? getLocalDateKey() : localDateKey();
        const delivered = [];
        FURNITURE.forEach((item) => {
            const state = getState(item.id);
            if (state.status === STATUS.PENDING && state.purchasedDate && state.purchasedDate < today) {
                data.items[item.id] = { status: STATUS.PLACED, purchasedDate: state.purchasedDate };
                delivered.push(item);
            }
        });
        if (delivered.length) {
            if (typeof saveSettings === "function") saveSettings();
            renderRoom();
            if (showNotice && data.deliveryNoticeDate !== today) {
                data.deliveryNoticeDate = today;
                if (typeof saveSettings === "function") saveSettings();
                const names = delivered.map((item) => `・${item.name}`).join("\n");
                if (typeof showGuildShopMessage === "function") {
                    showGuildShopMessage(`家具をお届けしました。\n\n${names}\n\n部屋に設置されています。`, "お届けしました");
                } else {
                    window.alert(`家具をお届けしました。\n\n${names}`);
                }
            }
        }
        return delivered;
    }

    function ensureLayer() {
        const room = document.getElementById("room-screen");
        if (!room) return null;
        let layer = document.getElementById("furnitureLayer");
        if (!layer) {
            layer = document.createElement("div");
            layer.id = "furnitureLayer";
            layer.className = "furniture-layer";
            room.insertBefore(layer, document.getElementById("player"));
        }
        return layer;
    }

    function renderRoom() {
        const layer = ensureLayer();
        if (!layer) return false;
        layer.innerHTML = FURNITURE
            .filter((item) => getState(item.id).status === STATUS.PLACED)
            .sort((a,b) => a.layer - b.layer)
            .map((item) => `<img class="room-furniture room-furniture-${item.id}" src="${item.image}" alt="${item.name}" data-furniture-id="${item.id}" style="z-index:${item.layer}">`)
            .join("");
        return true;
    }

    function statusLabel(id) {
        const status = getState(id).status;
        if (status === STATUS.PENDING) return "配送待ち";
        if (status === STATUS.PLACED) return "設置済み";
        return "未購入";
    }

    function developerSet(id, status) {
        const purchased = status === STATUS.PENDING ? (typeof getLocalDateKey === "function" ? getLocalDateKey() : localDateKey()) : "";
        return setState(id, status, purchased);
    }

    function developerSetAll(status) {
        FURNITURE.forEach((item) => {
            const purchased = status === STATUS.PENDING ? (typeof getLocalDateKey === "function" ? getLocalDateKey() : localDateKey()) : "";
            ensureData().items[item.id] = { status, purchasedDate: purchased };
        });
        if (typeof saveSettings === "function") saveSettings();
        renderRoom();
        if (typeof renderGuildShop === "function") renderGuildShop();
    }

    function handleScreenChange(name) {
        if (name === "room") {
            processDeliveries(true);
            renderRoom();
        }
    }

    function init() {
        ensureData();
        processDeliveries(false);
        renderRoom();
    }

    window.FURNITURE_SHOP_ITEMS = FURNITURE.map((item) => ({ ...item, furniture: true }));
    window.FurnitureSystem = { STATUS, items: FURNITURE, init, renderRoom, handleScreenChange, processDeliveries, purchase, isFurnitureItem, isOwned, getState, statusLabel, developerSet, developerSetAll };
})();
