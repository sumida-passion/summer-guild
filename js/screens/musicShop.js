"use strict";

/* =========================================================
   夏休みギルド 音楽家招待画面
   ========================================================= */

let activeGuildShopTab = "items";
let previewingGuildMusicId = "";

function setGuildShopTab(tabName) {
    activeGuildShopTab = tabName === "music" ? "music" : "items";

    document.querySelectorAll("[data-guildshop-tab]").forEach((button) => {
        const active = button.dataset.guildshopTab === activeGuildShopTab;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
    });

    const itemList = document.getElementById("guildShopItemList");
    const musicList = document.getElementById("guildMusicList");

    if (itemList) {
        itemList.hidden = activeGuildShopTab !== "items";
    }

    if (musicList) {
        musicList.hidden = activeGuildShopTab !== "music";
    }

    if (activeGuildShopTab === "music") {
        renderGuildMusicShop();
    } else if (window.GuildMusicPlayer) {
        window.GuildMusicPlayer.stopPreview();
        window.GuildMusicPlayer.resume();
        previewingGuildMusicId = "";
    }
}

function bindGuildShopTabs() {
    document.querySelectorAll("[data-guildshop-tab]").forEach((button) => {
        if (button.dataset.guildshopTabBound === "true") {
            return;
        }

        button.addEventListener("click", () => {
            setGuildShopTab(button.dataset.guildshopTab);
        });

        button.dataset.guildshopTabBound = "true";
    });
}

function renderGuildMusicShop() {
    const list = document.getElementById("guildMusicList");
    const player = window.GuildMusicPlayer;

    if (!list || !player) {
        return false;
    }

    const selectedId = player.getSelectedId();

    list.innerHTML = player.getTracks().map((track) => {
        const owned = player.isOwned(track);
        const selected = selectedId === track.id;
        const previewing = previewingGuildMusicId === track.id;
        const actionText = selected
            ? "現在演奏中"
            : owned
                ? "この演奏を流す"
                : `${track.price} GPで招待`;

        return `
            <article class="music-shop-card${selected ? " selected" : ""}">
                <div class="music-shop-copy">
                    <h3>${escapeMusicShopHtml(track.title)}</h3>
                    <p>${escapeMusicShopHtml(track.description)}</p>
                </div>
                <div class="music-shop-actions">
                    <button
                        type="button"
                        class="music-preview-button"
                        data-music-preview="${escapeMusicShopHtml(track.id)}">
                        ${previewing ? "■ 試聴を停止" : "▶ 15秒試聴"}
                    </button>
                    <button
                        type="button"
                        class="music-action-button"
                        data-music-action="${escapeMusicShopHtml(track.id)}"
                        ${selected ? "disabled" : ""}>
                        ${actionText}
                    </button>
                </div>
            </article>
        `;
    }).join("");

    bindGuildMusicButtons();
    return true;
}

function bindGuildMusicButtons() {
    document.querySelectorAll("[data-music-preview]").forEach((button) => {
        button.addEventListener("click", async () => {
            const trackId = button.dataset.musicPreview;

            if (previewingGuildMusicId === trackId) {
                window.GuildMusicPlayer.stopPreview();
                window.GuildMusicPlayer.resume();
                previewingGuildMusicId = "";
                renderGuildMusicShop();
                return;
            }

            previewingGuildMusicId = trackId;
            renderGuildMusicShop();

            const started = await window.GuildMusicPlayer.preview(trackId);
            if (!started) {
                previewingGuildMusicId = "";
                renderGuildMusicShop();
                showMusicShopDialog("試聴できませんでした。もう一度ボタンを押してください。", "お知らせ");
            }
        });
    });

    document.querySelectorAll("[data-music-action]").forEach((button) => {
        button.addEventListener("click", () => {
            handleGuildMusicAction(button.dataset.musicAction);
        });
    });
}

function handleGuildMusicAction(trackId) {
    const player = window.GuildMusicPlayer;
    const track = player.findTrack(trackId);

    if (!track) {
        return;
    }

    if (player.isOwned(track)) {
        player.select(track.id).then(() => renderGuildMusicShop());
        return;
    }

    showMusicShopConfirm(track);
}

function inviteGuildMusicians(track) {
    if (typeof buyShopItem !== "function") {
        showMusicShopDialog("招待機能を利用できません。", "お知らせ");
        return;
    }

    const result = buyShopItem(track.id, track.price);

    if (!result || result.success !== true) {
        if (result && result.reason === "not-enough-gp") {
            const shortage = Math.max(0, track.price - result.totalGp);
            showMusicShopDialog(`あと ${shortage} GP 必要です。\n所持GP：${result.totalGp}`, "GPが足りません");
        } else {
            showMusicShopDialog("演奏家を招待できませんでした。", "お知らせ");
        }
        return;
    }

    window.GuildMusicPlayer.select(track.id).then(() => {
        renderGuildMusicShop();
        if (typeof updateGuildShopGpDisplay === "function") {
            updateGuildShopGpDisplay();
        }
        showMusicShopDialog(`${track.title}へ招待状を送りました。\n演奏家たちがギルドホールへ到着しました！`, "招待しました");
    });
}

function ensureMusicShopDialog() {
    let overlay = document.getElementById("musicShopDialogOverlay");

    if (overlay) {
        return overlay;
    }

    overlay = document.createElement("div");
    overlay.id = "musicShopDialogOverlay";
    overlay.className = "guildshop-dialog-overlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <section class="guildshop-dialog" role="dialog" aria-modal="true" aria-labelledby="musicShopDialogTitle">
            <p class="guildshop-dialog-label">MUSIC GUILD</p>
            <h3 id="musicShopDialogTitle">お知らせ</h3>
            <p id="musicShopDialogMessage" class="guildshop-dialog-message"></p>
            <div id="musicShopDialogActions" class="guildshop-dialog-actions"></div>
        </section>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function openMusicShopDialog(title, message, actions) {
    const overlay = ensureMusicShopDialog();
    overlay.querySelector("#musicShopDialogTitle").textContent = title;
    overlay.querySelector("#musicShopDialogMessage").textContent = message;

    const actionsElement = overlay.querySelector("#musicShopDialogActions");
    actionsElement.innerHTML = "";

    actions.forEach((action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = action.label;
        if (action.cancel) {
            button.className = "guildshop-dialog-cancel";
        }
        button.addEventListener("click", () => {
            closeMusicShopDialog();
            if (typeof action.onClick === "function") {
                action.onClick();
            }
        });
        actionsElement.appendChild(button);
    });

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => overlay.classList.add("is-open"));
}

function closeMusicShopDialog() {
    const overlay = document.getElementById("musicShopDialogOverlay");
    if (!overlay) {
        return;
    }
    overlay.classList.remove("is-open");
    window.setTimeout(() => {
        overlay.hidden = true;
        overlay.setAttribute("aria-hidden", "true");
    }, 220);
}

function showMusicShopDialog(message, title) {
    openMusicShopDialog(title || "お知らせ", message, [
        { label: "閉じる" }
    ]);
}

function showMusicShopConfirm(track) {
    openMusicShopDialog(
        "演奏家を招待しますか？",
        `${track.title}\n招待に必要なGP：${track.price} GP`,
        [
            { label: "戻る", cancel: true },
            { label: "招待する", onClick: () => inviteGuildMusicians(track) }
        ]
    );
}

function escapeMusicShopHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("guildmusicpreviewend", () => {
    previewingGuildMusicId = "";
    if (activeGuildShopTab === "music") {
        renderGuildMusicShop();
    }
});

document.addEventListener("guildmusicchange", () => {
    if (activeGuildShopTab === "music") {
        renderGuildMusicShop();
    }
});

window.initMusicShop = function initMusicShop() {
    bindGuildShopTabs();
    setGuildShopTab(activeGuildShopTab);
};
window.renderGuildMusicShop = renderGuildMusicShop;
