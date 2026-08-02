"use strict";

(() => {
    const ASSET = "assets/characters/pet/";
    const NORMAL_STATES = ["base", "base", "happy", "sleepy", "talking"];
    const SPOTS = [
        { left: "18%", bottom: "27%" },
        { left: "34%", bottom: "24%" },
        { left: "54%", bottom: "26%" },
        { left: "68%", bottom: "29%" },
        { left: "82%", bottom: "25%" }
    ];
    const NORMAL_MESSAGES = [
        "きいろのトリが、こちらを見ている。",
        "部屋の中をきょろきょろ見回している。",
        "勉強しているのを応援しているようだ。",
        "小さく羽を動かしている。",
        "何か話しかけたそうにしている。",
        "少し眠そうにしている。"
    ];

    let tapStage = 0;
    let tapResetTimer = 0;
    let foodTimer = 0;
    let joyTimer = 0;

    function owned() {
        return typeof isShopItemOwned === "function"
            && isShopItemOwned("yellow_bird_pet");
    }

    function random(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function ensureUi() {
        const room = document.getElementById("room-screen");

        if (!room || document.getElementById("yellowBirdLayer")) {
            return;
        }

        const layer = document.createElement("div");
        layer.id = "yellowBirdLayer";
        layer.hidden = true;
        layer.innerHTML = `
          <img
              id="yellowBirdImage"
              class="yellowbird-asset"
              alt="きいろのトリ"
              draggable="false">`;

        room.appendChild(layer);

        const image = document.getElementById("yellowBirdImage");
        image.addEventListener("click", handleTap);
    }

    function setState(state) {
        const image = document.getElementById("yellowBirdImage");

        if (image) {
            image.src = `${ASSET}piyo_${state}.PNG`;
        }
    }

    function render() {
        ensureUi();

        const layer = document.getElementById("yellowBirdLayer");

        if (!layer) {
            return;
        }

        clearTimeout(foodTimer);
        clearTimeout(joyTimer);

        if (!owned()) {
            layer.hidden = true;
            return;
        }

        layer.hidden = false;

        const spot = random(SPOTS);
        layer.style.left = spot.left;
        layer.style.bottom = spot.bottom;

        setState(random(NORMAL_STATES));
        tapStage = 0;
    }

    function message(text, title = "きいろのトリ") {
        if (typeof openGuildShopDialog === "function") {
            openGuildShopDialog({
                title,
                message: text,
                confirmLabel: "閉じる"
            });
        } else {
            alert(text);
        }
    }

    function handleTap() {
        clearTimeout(tapResetTimer);

        if (tapStage === 0) {
            message(random(NORMAL_MESSAGES));
            tapStage = 1;
            tapResetTimer = setTimeout(() => {
                tapStage = 0;
            }, 12000);
            return;
        }

        tapStage = 0;

        const gp = typeof getGp === "function" ? getGp() : 0;
        const canFeed = gp >= 8;

        if (typeof openGuildShopDialog === "function") {
            openGuildShopDialog({
                title: "トリにえさをあげますか？",
                message: canFeed
                    ? `トリのえさ：8GP\n所持GP：${gp}`
                    : `トリのえさには8GP必要です。\n所持GP：${gp}`,
                confirmLabel: canFeed ? "あげる" : "閉じる",
                cancelLabel: "やめる",
                onConfirm: canFeed ? feed : undefined
            });
        }
    }

    function feed() {
        if (typeof spendGp !== "function" || !spendGp(8)) {
            message("GPが足りません。トリのえさには8GP必要です。");
            return;
        }

        setState("food");
        message("きいろのトリは、うれしそうにえさを食べている！");

        clearTimeout(foodTimer);
        clearTimeout(joyTimer);

        foodTimer = setTimeout(() => {
            setState("joy");

            joyTimer = setTimeout(() => {
                setState(random(NORMAL_STATES));
            }, 8000);
        }, 8000);
    }

    function showWelcome() {
        if (
            typeof hasShownYellowBirdWelcome === "function"
            && hasShownYellowBirdWelcome()
        ) {
            return;
        }

        if (typeof markYellowBirdWelcomeShown === "function") {
            markYellowBirdWelcomeShown();
        }

        message(
            "🐤 きいろのトリがギルドに住み始めました。\n\n"
            + "・部屋の中を自由に過ごします。\n"
            + "・2回タップすると、8GPでえさをあげられます。",
            "新しい仲間が増えました！"
        );
    }

    function handleScreenChange(name) {
        if (name === "room") {
            render();

            if (owned()) {
                showWelcome();
            }
        } else {
            clearTimeout(tapResetTimer);
            clearTimeout(foodTimer);
            clearTimeout(joyTimer);
            tapStage = 0;
        }
    }

    window.YellowBirdPet = {
        init: ensureUi,
        render,
        showWelcome,
        handleScreenChange
    };
})();
