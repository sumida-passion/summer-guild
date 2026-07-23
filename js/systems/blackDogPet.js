"use strict";

(() => {
    const ASSET = "assets/characters/pet/";
    const STATES = ["base", "base", "base", "calm", "calm", "sleep"];
    const SPOTS = [
        { left: "12%", bottom: "5%" },
        { left: "29%", bottom: "6%" },
        { left: "61%", bottom: "5%" },
        { left: "73%", bottom: "12%" },
        { left: "45%", bottom: "3%" }
    ];
    const NORMAL_MESSAGES = [
        "今日は機嫌がいいみたいだ。",
        "勉強を頑張っているのを、じっと見ている。",
        "眠そうにしている。",
        "黒犬はあなたを静かに見つめている。",
        "居心地のいい場所を見つけたようだ。",
        "しっぽをゆっくり振っている。",
        "今日もギルドは平和だ。",
        "のんびりくつろいでいる。"
    ];
    const COSTUME_MESSAGES = [
        "自分と同じだと思っているみたいだ。",
        "大きな犬に少し驚いている。",
        "仲間が増えたと思っているようだ。",
        "いつもより近くに来たそうにしている。"
    ];
    const RARE_MESSAGE = "黒犬は何か言いたそうだ。";
    let tapStage = 0;
    let tapResetTimer = 0;
    let joyTimer = 0;

    function owned(id) { return typeof isShopItemOwned === "function" && isShopItemOwned(id); }
    function random(list) { return list[Math.floor(Math.random() * list.length)]; }
    function ensureUi() {
        const room = document.getElementById("room-screen");
        if (!room || document.getElementById("blackDogLayer")) return;
        const layer = document.createElement("div");
        layer.id = "blackDogLayer";
        layer.hidden = true;
        layer.innerHTML = `
          <img id="blackDogBlanket" class="blackdog-asset blackdog-under" alt="" hidden>
          <button id="blackDogButton" type="button" aria-label="黒犬"><img id="blackDogImage" class="blackdog-asset" alt="黒犬"></button>
          <img id="blackDogToy" class="blackdog-asset blackdog-over" alt="" hidden>`;
        room.appendChild(layer);
        document.getElementById("blackDogButton").addEventListener("click", handleTap);
    }
    function render() {
        ensureUi();
        const layer = document.getElementById("blackDogLayer");
        if (!layer) return;
        if (!owned("black_dog_pet")) { layer.hidden = true; return; }
        layer.hidden = false;
        const spot = random(SPOTS);
        layer.style.left = spot.left;
        layer.style.bottom = spot.bottom;
        const state = random(STATES);
        document.getElementById("blackDogImage").src = `${ASSET}blackdog_${state}.PNG`;
        const blanket = document.getElementById("blackDogBlanket");
        blanket.hidden = !owned("dog_blanket") || Math.random() > 0.55;
        blanket.src = `${ASSET}blanket.PNG`;
        const toys = [];
        if (owned("dog_toy_ball")) toys.push("dogtoy_ball.PNG");
        if (owned("dog_toy_bone")) toys.push("dogtoy_bone.PNG");
        if (owned("dog_toy_rope")) toys.push("dogtoy_rope.PNG");
        const toy = document.getElementById("blackDogToy");
        toy.hidden = toys.length === 0 || Math.random() > 0.55;
        if (!toy.hidden) toy.src = ASSET + random(toys);
        tapStage = 0;
    }
    function message(text, title="黒犬") {
        if (typeof openGuildShopDialog === "function") {
            openGuildShopDialog({ title, message: text, confirmLabel: "閉じる" });
        } else alert(text);
    }
    function handleTap() {
        clearTimeout(tapResetTimer);
        if (tapStage === 0) {
            const pool = [...NORMAL_MESSAGES];
            if (typeof isBlackDogCostumeEquipped === "function" && isBlackDogCostumeEquipped()) pool.push(...COSTUME_MESSAGES, ...COSTUME_MESSAGES);
            message(Math.random() < 0.01 ? RARE_MESSAGE : random(pool));
            tapStage = 1;
            tapResetTimer = setTimeout(() => { tapStage = 0; }, 12000);
            return;
        }
        tapStage = 0;
        const count = typeof getDogFoodCount === "function" ? getDogFoodCount() : 0;
        if (typeof openGuildShopDialog === "function") {
            openGuildShopDialog({
                title: "黒犬に餌をあげますか？",
                message: `餌の所持数：${count}個${count < 1 ? "\n\n餌はギルドショップで購入できます。" : ""}`,
                confirmLabel: count > 0 ? "はい" : "閉じる",
                cancelLabel: "いいえ",
                onConfirm: count > 0 ? feed : undefined
            });
        }
    }
    function feed() {
        if (typeof consumeDogFood !== "function" || !consumeDogFood()) return;
        const image = document.getElementById("blackDogImage");
        if (!image) return;
        image.src = `${ASSET}blackdog_joy.PNG`;
        clearTimeout(joyTimer);
        joyTimer = setTimeout(() => { image.src = `${ASSET}blackdog_${random(["base","calm"])}.PNG`; }, 30000);
    }
    function showWelcome() {
        if (typeof hasShownBlackDogWelcome === "function" && hasShownBlackDogWelcome()) return;
        if (typeof markBlackDogWelcomeShown === "function") markBlackDogWelcomeShown();
        message("🐶 黒犬がギルドに住み始めました。\n\n・餌をあげると喜びます。\n・毛布やおもちゃを置くと、お気に入りの場所が増えます。\n・部屋の中を自由に過ごします。", "新しい仲間が増えました！");
    }
    function handleScreenChange(name) {
        if (name === "room") { render(); if (owned("black_dog_pet")) showWelcome(); }
        else { clearTimeout(tapResetTimer); tapStage = 0; }
    }
    window.BlackDogPet = { init: ensureUi, render, showWelcome, handleScreenChange };
})();
