"use strict";

/* =========================================================
   算数ギルド Ver2.0
   ・ギルドクエスト1〜10（各10問・四択・一度だけ攻略）
   ・不正解でそのクエストの1問目へ戻る
   ・再挑戦時は選択肢のみシャッフル
   ・ギルドテスト1／2（各20問ランダム・何度でも挑戦）
   ・テスト1合格5回で「見習い」＆クエスト6解放
   ・テスト2合格5回で「徒弟」
   ========================================================= */

const MATH_GUILD_STORAGE_KEY = "summerGuildMathGuildV1";
const MATH_GUILD_PASS_ACCURACY = 90;

const MATH_GUILD_TITLES = [
    "素人", "見習い", "徒弟", "下級職人", "中級職人", "上級職人",
    "名取", "皆伝", "師範", "大師範", "ギルドマスター"
];

function q(expression, answer, wrong) {
    return { expression, answer, choices: [answer, ...wrong] };
}

const MATH_GUILD_QUESTS = [
    {
        id: 1,
        title: "小数点の位置Ⅰ",
        subtitle: "小数×整数の基本",
        questions: [
            q("0.7 × 5", "3.5", ["35", "0.35", "350"]),
            q("0.6 × 9", "5.4", ["54", "0.54", "0.054"]),
            q("0.8 × 4", "3.2", ["32", "0.32", "0.032"]),
            q("0.3 × 7", "2.1", ["21", "0.21", "0.021"]),
            q("0.9 × 6", "5.4", ["54", "0.54", "0.054"]),
            q("0.4 × 8", "3.2", ["32", "0.32", "0.032"]),
            q("0.5 × 7", "3.5", ["35", "0.35", "0.035"]),
            q("0.2 × 9", "1.8", ["18", "0.18", "0.018"]),
            q("0.7 × 8", "5.6", ["56", "0.56", "0.056"]),
            q("0.6 × 5", "3", ["30", "0.3", "0.03"])
        ]
    },
    {
        id: 2,
        title: "小数点の位置Ⅱ",
        subtitle: "2けたの整数をかける",
        questions: [
            q("0.7 × 5", "3.5", ["35", "0.35", "350"]),
            q("0.6 × 9", "5.4", ["54", "0.54", "0.054"]),
            q("0.8 × 4", "3.2", ["32", "0.32", "0.032"]),
            q("0.3 × 7", "2.1", ["21", "0.21", "0.021"]),
            q("0.7 × 8", "5.6", ["56", "0.56", "0.056"]),
            q("0.7 × 56", "39.2", ["392", "3.92", "0.392"]),
            q("0.6 × 24", "14.4", ["144", "1.44", "0.144"]),
            q("0.8 × 35", "28", ["280", "2.8", "0.28"]),
            q("0.4 × 72", "28.8", ["288", "2.88", "0.288"]),
            q("0.9 × 43", "38.7", ["387", "3.87", "0.387"])
        ]
    },
    {
        id: 3,
        title: "小数点の位置Ⅲ",
        subtitle: "百分の一の位まである小数",
        questions: [
            q("0.7 × 56", "39.2", ["392", "3.92", "0.392"]),
            q("0.6 × 24", "14.4", ["144", "1.44", "0.144"]),
            q("0.8 × 35", "28", ["280", "2.8", "0.28"]),
            q("0.4 × 72", "28.8", ["288", "2.88", "0.288"]),
            q("0.9 × 43", "38.7", ["387", "3.87", "0.387"]),
            q("0.16 × 5", "0.8", ["8", "0.08", "80"]),
            q("0.27 × 4", "1.08", ["10.8", "0.108", "108"]),
            q("0.35 × 6", "2.1", ["21", "0.21", "0.021"]),
            q("0.48 × 5", "2.4", ["24", "0.24", "0.024"]),
            q("0.72 × 3", "2.16", ["21.6", "0.216", "216"])
        ]
    },
    {
        id: 4,
        title: "小数×小数Ⅰ",
        subtitle: "小数どうしのかけ算",
        questions: [
            q("0.16 × 5", "0.8", ["8", "0.08", "80"]),
            q("0.27 × 4", "1.08", ["10.8", "0.108", "108"]),
            q("0.35 × 6", "2.1", ["21", "0.21", "0.021"]),
            q("0.48 × 5", "2.4", ["24", "0.24", "0.024"]),
            q("0.72 × 3", "2.16", ["21.6", "0.216", "216"]),
            q("0.4 × 1.7", "0.68", ["6.8", "0.068", "68"]),
            q("0.3 × 0.5", "0.15", ["1.5", "0.015", "15"]),
            q("1.2 × 0.6", "0.72", ["7.2", "0.072", "72"]),
            q("2.5 × 0.4", "1", ["10", "0.1", "0.01"]),
            q("0.8 × 0.9", "0.72", ["7.2", "0.072", "72"])
        ]
    },
    {
        id: 5,
        title: "小数×小数Ⅱ",
        subtitle: "少し複雑な小数のかけ算",
        questions: [
            q("0.4 × 1.7", "0.68", ["6.8", "0.068", "68"]),
            q("0.3 × 0.5", "0.15", ["1.5", "0.015", "15"]),
            q("1.2 × 0.6", "0.72", ["7.2", "0.072", "72"]),
            q("2.5 × 0.4", "1", ["10", "0.1", "0.01"]),
            q("0.8 × 0.9", "0.72", ["7.2", "0.072", "72"]),
            q("3.26 × 25", "81.5", ["815", "8.15", "0.815"]),
            q("2.7 × 4.6", "12.42", ["124.2", "1.242", "1242"]),
            q("0.72 × 3.5", "2.52", ["25.2", "0.252", "252"]),
            q("4.08 × 1.5", "6.12", ["61.2", "0.612", "612"]),
            q("0.36 × 0.25", "0.09", ["0.9", "0.009", "9"])
        ]
    },
    {
        id: 6,
        title: "小数×整数・発展",
        subtitle: "けた数の多いかけ算と文章題",
        questions: [
            q("0.715 × 8", "5.72", ["57.2", "0.572", "572"]),
            q("3.84 × 70", "268.8", ["26.88", "2688", "2.688"]),
            q("0.235 × 54", "12.69", ["126.9", "1.269", "1269"]),
            q("6.93 × 7", "48.51", ["485.1", "4.851", "4851"]),
            q("0.218 × 65", "14.17", ["141.7", "1.417", "1417"]),
            q("96 × 0.37", "35.52", ["355.2", "3.552", "3552"]),
            q("65 × 0.046", "2.99", ["29.9", "0.299", "299"]),
            q("67 × 2.4", "160.8", ["16.08", "1608", "1.608"]),
            q("1mで78gの針金が5.2mあります。重さは？", "405.6g", ["40.56g", "4056g", "83.2g"]),
            q("1袋3.45kgの砂糖が28袋あります。全部で？", "96.6kg", ["9.66kg", "966kg", "31.45kg"])
        ]
    },
    {
        id: 7,
        title: "小数×小数・発展",
        subtitle: "複雑な計算と面積",
        questions: [
            q("0.37 × 0.04", "0.0148", ["0.148", "1.48", "0.00148"]),
            q("0.64 × 5.7", "3.648", ["36.48", "0.3648", "364.8"]),
            q("0.15 × 0.44", "0.066", ["0.66", "6.6", "0.0066"]),
            q("1.17 × 0.81", "0.9477", ["9.477", "0.09477", "94.77"]),
            q("0.045 × 9.2", "0.414", ["4.14", "0.0414", "41.4"]),
            q("6.03 × 4.08", "24.6024", ["246.024", "2.46024", "2460.24"]),
            q("3.54 × 6.3", "22.302", ["223.02", "2.2302", "2230.2"]),
            q("9.6 × 0.025", "0.24", ["2.4", "0.024", "24"]),
            q("たて7.5cm、横3.8cmの長方形の面積は？", "28.5cm²", ["2.85cm²", "285cm²", "22.6cm²"]),
            q("1辺5.3cmの正方形の面積は？", "28.09cm²", ["10.6cm²", "2.809cm²", "280.9cm²"])
        ]
    },
    {
        id: 8,
        title: "積・商の性質",
        subtitle: "1より大きい数・小さい数を見抜く",
        questions: [
            q("68より積が大きくなるのは？", "68 × 1.02", ["68 × 0.7", "68 × 1", "68 × 0.99"]),
            q("68より積が小さくなるのは？", "68 × 0.99", ["68 × 1.02", "68 × 1", "68 × 1.4"]),
            q("積が、かけられる数より小さくなるのは？", "35 × 0.91", ["46 × 1.3", "19.5 × 1.04", "2.1 × 1.95"]),
            q("積が、かけられる数より大きくなるのは？", "1.87 × 1.2", ["30.2 × 0.98", "0.14 × 0.19", "0.06 × 0.09"]),
            q("18より商が大きくなるのは？", "18 ÷ 0.9", ["18 ÷ 1", "18 ÷ 1.2", "18 ÷ 2"]),
            q("18より商が小さくなるのは？", "18 ÷ 1.2", ["18 ÷ 0.9", "18 ÷ 0.06", "18 ÷ 1"]),
            q("2.16より商が小さくなるのは？", "2.16 ÷ 2.4", ["2.16 ÷ 0.96", "2.16 ÷ 0.04", "2.16 ÷ 0.8"]),
            q("商が、わられる数より大きくなるのは？", "19.2 ÷ 0.97", ["5.4 ÷ 1.1", "0.83 ÷ 0.83", "49 ÷ 1.01"]),
            q("3.24 × 1.53と等しいのは？", "0.324 × 15.3", ["32.4 × 15.3", "32.4 × 0.153", "0.324 × 0.153"]),
            q("16.74 ÷ 3.6と等しいのは？", "167.4 ÷ 36", ["167.4 ÷ 0.36", "1.674 ÷ 36", "1674 ÷ 36"])
        ]
    },
    {
        id: 9,
        title: "小数のわり算Ⅰ",
        subtitle: "小数÷整数・整数÷小数",
        questions: [
            q("0.6 ÷ 2", "0.3", ["3", "0.03", "30"]),
            q("5.6 ÷ 7", "0.8", ["8", "0.08", "80"]),
            q("0.54 ÷ 9", "0.06", ["0.6", "6", "0.006"]),
            q("15 ÷ 4", "3.75", ["37.5", "0.375", "375"]),
            q("8 ÷ 0.2", "40", ["4", "0.4", "400"]),
            q("6 ÷ 1.5", "4", ["0.4", "40", "9"]),
            q("56 ÷ 0.8", "70", ["7", "0.7", "700"]),
            q("10 ÷ 2.5", "4", ["0.4", "40", "25"]),
            q("15Lの米が12.3kgです。1Lの重さは？", "0.82kg", ["8.2kg", "1.22kg", "0.082kg"]),
            q("45mの針金を12人で等分します。1人分は？", "3.75m", ["37.5m", "0.375m", "5.4m"])
        ]
    },
    {
        id: 10,
        title: "小数のわり算Ⅱ",
        subtitle: "小数÷小数・概数・あまり",
        questions: [
            q("0.9 ÷ 0.3", "3", ["0.3", "30", "0.03"]),
            q("6.3 ÷ 0.7", "9", ["0.9", "90", "0.09"]),
            q("9.1 ÷ 1.3", "7", ["0.7", "70", "11.83"]),
            q("0.39 ÷ 1.3", "0.3", ["3", "0.03", "30"]),
            q("2.8 ÷ 0.04", "70", ["7", "0.7", "700"]),
            q("0.54 ÷ 0.09", "6", ["0.6", "60", "0.06"]),
            q("9.58 ÷ 2.7（商を10分の1の位までの概数）", "3.5", ["3.4", "3.6", "35"]),
            q("0.847 ÷ 0.61（上から2けたの概数）", "1.4", ["1.3", "1.38", "14"]),
            q("47.5 ÷ 2.6（商を一の位まで。あまりも答える）", "18 あまり 0.7", ["18 あまり 7", "1 あまり 0.7", "18.2"]),
            q("16mのテープを0.35mずつ切ると、何本とれて何mあまる？", "45本、0.25m", ["45本、0.025m", "46本、0.1m", "44本、0.6m"])
        ]
    }
];

let mathGuildState = {
    mode: "",
    questId: 0,
    testNumber: 0,
    questions: [],
    index: 0,
    correctCount: 0,
    startedAt: 0,
    locked: false
};

function getMathGuildProgress() {
    const fallback = {
        completedQuests: {},
        test1Passes: 0,
        test1Attempts: 0,
        test1BestTime: null,
        test1BestAccuracy: 0,
        test2Passes: 0,
        test2Attempts: 0,
        test2BestTime: null,
        test2BestAccuracy: 0
    };
    try {
        const saved = JSON.parse(localStorage.getItem(MATH_GUILD_STORAGE_KEY) || "null");
        if (!saved || typeof saved !== "object") return fallback;
        return {
            completedQuests: saved.completedQuests && typeof saved.completedQuests === "object" ? saved.completedQuests : {},
            test1Passes: nonNegativeInteger(saved.test1Passes),
            test1Attempts: nonNegativeInteger(saved.test1Attempts),
            test1BestTime: finiteOrNull(saved.test1BestTime ?? saved.bestTime),
            test1BestAccuracy: percent(saved.test1BestAccuracy ?? saved.bestAccuracy),
            test2Passes: nonNegativeInteger(saved.test2Passes),
            test2Attempts: nonNegativeInteger(saved.test2Attempts),
            test2BestTime: finiteOrNull(saved.test2BestTime),
            test2BestAccuracy: percent(saved.test2BestAccuracy)
        };
    } catch (error) {
        console.warn("算数ギルドの保存データを読み込めませんでした。", error);
        return fallback;
    }
}

function nonNegativeInteger(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
}

function finiteOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    return Number.isFinite(Number(value)) ? Number(value) : null;
}

function percent(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
}

function saveMathGuildProgress(progress) {
    localStorage.setItem(MATH_GUILD_STORAGE_KEY, JSON.stringify(progress));
}

function getMathGuildTitle(progress = getMathGuildProgress()) {
    if (progress.test2Passes >= 5) return MATH_GUILD_TITLES[2];
    if (progress.test1Passes >= 5) return MATH_GUILD_TITLES[1];
    return MATH_GUILD_TITLES[0];
}

function isQuestUnlocked(questId, progress) {
    if (questId === 1) return true;
    if (questId <= 5) return Boolean(progress.completedQuests[String(questId - 1)]);
    if (questId === 6) return progress.test1Passes >= 5;
    return Boolean(progress.completedQuests[String(questId - 1)]);
}

function areQuestRangeComplete(progress, start, end) {
    for (let id = start; id <= end; id += 1) {
        if (!progress.completedQuests[String(id)]) return false;
    }
    return true;
}

function shuffle(items) {
    const copied = [...items];
    for (let i = copied.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
    }
    return copied;
}

function uniqueQuestions(questions) {
    const seen = new Set();
    return questions.filter((question) => {
        const key = `${question.expression}::${question.answer}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function openMathGuild() {
    renderMathGuildHome();
    if (typeof changeScreen === "function") changeScreen("mathguild");
}

function renderMathGuildHome() {
    stopMathGuildMusic();
    const container = document.getElementById("mathGuildContent");
    if (!container) return;
    const progress = getMathGuildProgress();
    const test1Unlocked = areQuestRangeComplete(progress, 1, 5);
    const test2Unlocked = areQuestRangeComplete(progress, 6, 10);

    const questCards = MATH_GUILD_QUESTS.map((quest) => {
        const complete = Boolean(progress.completedQuests[String(quest.id)]);
        const unlocked = isQuestUnlocked(quest.id, progress);
        let lockedText = `クエスト${quest.id - 1}クリアで解放`;
        if (quest.id === 6) lockedText = "ギルドテスト1に5回合格で解放";
        const status = complete ? "COMPLETE" : unlocked ? "挑戦できます" : lockedText;
        return `
            <article class="math-guild-card ${complete ? "is-complete" : ""} ${unlocked ? "" : "is-locked"}">
                <div class="math-guild-card-number">QUEST ${quest.id}</div>
                <div class="math-guild-card-body">
                    <h3>${quest.title}</h3>
                    <p>${quest.subtitle}</p>
                    <small>${status}</small>
                </div>
                <button type="button" data-math-quest="${quest.id}" ${(!unlocked || complete) ? "disabled" : ""}>${complete ? "攻略済み" : unlocked ? "挑戦する" : "未解放"}</button>
            </article>`;
    }).join("");

    const test1Status = test1Unlocked
        ? `合格 ${Math.min(progress.test1Passes, 5)} / 5回`
        : "クエスト1〜5を攻略すると解放";
    const test2Status = test2Unlocked
        ? `合格 ${Math.min(progress.test2Passes, 5)} / 5回`
        : "クエスト6〜10を攻略すると解放";

    container.innerHTML = `
        <div class="math-guild-summary">
            <div><span>現在の称号</span><strong>${getMathGuildTitle(progress)}</strong></div>
            <div><span>ギルドテスト1</span><strong>${test1Status}</strong></div>
            <div><span>ギルドテスト2</span><strong>${test2Status}</strong></div>
        </div>
        <div class="math-guild-list">${questCards}</div>
        ${renderTestCard(1, test1Unlocked, test1Status, progress.test1BestAccuracy)}
        ${renderTestCard(2, test2Unlocked, test2Status, progress.test2BestAccuracy)}
        ${progress.test2Passes >= 5 ? `<div class="math-guild-rankup-note">称号「徒弟」認定済み。ギルドクエスト11は今後追加予定です。</div>` : ""}`;

    container.querySelectorAll("[data-math-quest]").forEach((button) => {
        button.addEventListener("click", () => startMathGuildQuest(Number(button.dataset.mathQuest)));
    });
    container.querySelectorAll("[data-math-test]").forEach((button) => {
        button.addEventListener("click", () => startMathGuildTest(Number(button.dataset.mathTest)));
    });
}

function renderTestCard(testNumber, unlocked, status, bestAccuracy) {
    const ranges = testNumber === 1 ? "クエスト1〜5" : "クエスト6〜10";
    const title = testNumber === 1 ? "小数のかけ算・総合試験" : "小数のかけ算・わり算 総合試験";
    return `
        <article class="math-guild-test-card ${unlocked ? "" : "is-locked"}">
            <div>
                <span>GUILD TEST ${testNumber}</span>
                <h3>${title}</h3>
                <p>${ranges}からランダムで20問。正解率90％以上で合格です。</p>
                <small>${status}${bestAccuracy ? `／最高正解率 ${bestAccuracy}%` : ""}</small>
            </div>
            <button type="button" data-math-test="${testNumber}" ${unlocked ? "" : "disabled"}>試験を受ける</button>
        </article>`;
}

function startMathGuildQuest(questId) {
    const progress = getMathGuildProgress();
    const quest = MATH_GUILD_QUESTS.find((item) => item.id === questId);
    if (!quest || !isQuestUnlocked(questId, progress) || progress.completedQuests[String(questId)]) return;
    mathGuildState = {
        mode: "quest",
        questId,
        testNumber: 0,
        questions: quest.questions.map((question) => ({ ...question })),
        index: 0,
        correctCount: 0,
        startedAt: Date.now(),
        locked: false
    };
    playMathGuildMusic("quest");
    renderMathGuildQuestion();
}

function startMathGuildTest(testNumber) {
    const progress = getMathGuildProgress();
    const startId = testNumber === 1 ? 1 : 6;
    const endId = testNumber === 1 ? 5 : 10;
    if (!areQuestRangeComplete(progress, startId, endId)) return;
    const pool = uniqueQuestions(MATH_GUILD_QUESTS
        .filter((quest) => quest.id >= startId && quest.id <= endId)
        .flatMap((quest) => quest.questions.map((question) => ({ ...question }))));
    mathGuildState = {
        mode: "test",
        questId: 0,
        testNumber,
        questions: shuffle(pool).slice(0, 20),
        index: 0,
        correctCount: 0,
        startedAt: Date.now(),
        locked: false
    };
    playMathGuildMusic("test");
    renderMathGuildQuestion();
}

function renderMathGuildQuestion(message = "") {
    const container = document.getElementById("mathGuildContent");
    const question = mathGuildState.questions[mathGuildState.index];
    if (!container || !question) return;
    const total = mathGuildState.questions.length;
    const modeLabel = mathGuildState.mode === "test" ? `GUILD TEST ${mathGuildState.testNumber}` : `GUILD QUEST ${mathGuildState.questId}`;
    const choices = shuffle(question.choices).map((choice) => `
        <button type="button" class="math-answer-button" data-math-answer="${escapeAttribute(choice)}">${choice}</button>`).join("");
    container.innerHTML = `
        <div class="math-play-panel">
            <header>
                <span>${modeLabel}</span>
                <strong>${mathGuildState.index + 1} / ${total}</strong>
            </header>
            <div class="math-progress-track"><i style="width:${((mathGuildState.index) / total) * 100}%"></i></div>
            <p class="math-play-guide">正しい答えを選んでください</p>
            <div class="math-expression">${question.expression} ＝ ?</div>
            <div class="math-answer-grid">${choices}</div>
            <div class="math-feedback" aria-live="polite">${message}</div>
            <button type="button" class="math-quit-button" id="quitMathGuildPlay">算数ギルドへ戻る</button>
        </div>`;
    container.querySelectorAll("[data-math-answer]").forEach((button) => {
        button.addEventListener("click", () => answerMathGuildQuestion(button.dataset.mathAnswer));
    });
    document.getElementById("quitMathGuildPlay")?.addEventListener("click", renderMathGuildHome);
}

function playMathGuildMusic(mode) {
    const player = window.QuestMusicPlayer;
    if (!player) return;

    if (
        mode === "quest"
        && typeof player.playMathGuildQuest === "function"
    ) {
        player.playMathGuildQuest({ restart: true });
    } else if (
        mode === "test"
        && typeof player.playMathGuildTest === "function"
    ) {
        player.playMathGuildTest({ restart: true });
    }
}

function stopMathGuildMusic() {
    const player = window.QuestMusicPlayer;
    if (
        player
        && typeof player.stop === "function"
    ) {
        player.stop();
    }
}

function escapeAttribute(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function answerMathGuildQuestion(selected) {
    if (mathGuildState.locked) return;
    mathGuildState.locked = true;
    const question = mathGuildState.questions[mathGuildState.index];
    const correct = String(selected) === String(question.answer);

    if (mathGuildState.mode === "quest") {
        if (!correct) {
            mathGuildState.index = 0;
            mathGuildState.correctCount = 0;
            setTimeout(() => {
                mathGuildState.locked = false;
                renderMathGuildQuestion("不正解。クエストの最初から再挑戦！");
            }, 650);
            return;
        }
        mathGuildState.correctCount += 1;
        mathGuildState.index += 1;
        if (mathGuildState.index >= mathGuildState.questions.length) {
            finishMathGuildQuest();
            return;
        }
        setTimeout(() => {
            mathGuildState.locked = false;
            renderMathGuildQuestion("正解！");
        }, 300);
        return;
    }

    if (correct) mathGuildState.correctCount += 1;
    mathGuildState.index += 1;
    if (mathGuildState.index >= mathGuildState.questions.length) {
        finishMathGuildTest();
        return;
    }
    setTimeout(() => {
        mathGuildState.locked = false;
        renderMathGuildQuestion(correct ? "正解！" : `不正解。正解は ${question.answer}`);
    }, 300);
}

function finishMathGuildQuest() {
    stopMathGuildMusic();
    const progress = getMathGuildProgress();
    progress.completedQuests[String(mathGuildState.questId)] = true;
    saveMathGuildProgress(progress);
    const totalGp = typeof addGp === "function" ? addGp(5) : null;
    const container = document.getElementById("mathGuildContent");
    let nextText;
    if (mathGuildState.questId === 5) nextText = "ギルドテスト1が解放されました。";
    else if (mathGuildState.questId === 10) nextText = "ギルドテスト2が解放されました。";
    else nextText = `ギルドクエスト${mathGuildState.questId + 1}が解放されました。`;
    container.innerHTML = `
        <div class="math-result-panel is-clear">
            <span>QUEST COMPLETE</span>
            <h2>ギルドクエスト${mathGuildState.questId} 攻略！</h2>
            <p>10問連続正解を達成しました。</p>
            <div class="math-result-reward">獲得報酬 <strong>5 GP</strong></div>
            <p>${nextText}</p>
            ${totalGp !== null ? `<small>所持GP：${totalGp}</small>` : ""}
            <button type="button" id="finishMathGuildBack">算数ギルドへ戻る</button>
        </div>`;
    document.getElementById("finishMathGuildBack")?.addEventListener("click", renderMathGuildHome);
    if (typeof refreshGameDisplays === "function") refreshGameDisplays();
}

function finishMathGuildTest() {
    stopMathGuildMusic();
    const testNumber = mathGuildState.testNumber;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - mathGuildState.startedAt) / 1000));
    const accuracy = Math.round((mathGuildState.correctCount / mathGuildState.questions.length) * 100);
    const passed = accuracy >= MATH_GUILD_PASS_ACCURACY;
    const accuracyPoint = accuracy === 100 ? 2 : accuracy >= 90 ? 1 : 0;
    const speedPoint = elapsedSeconds <= 180 ? 2 : elapsedSeconds <= 300 ? 1 : 0;
    const reward = accuracyPoint * speedPoint;
    const progress = getMathGuildProgress();
    const passKey = `test${testNumber}Passes`;
    const attemptKey = `test${testNumber}Attempts`;
    const bestTimeKey = `test${testNumber}BestTime`;
    const bestAccuracyKey = `test${testNumber}BestAccuracy`;
    const previousPasses = progress[passKey];
    progress[attemptKey] += 1;
    if (passed) progress[passKey] += 1;
    progress[bestAccuracyKey] = Math.max(progress[bestAccuracyKey], accuracy);
    if (passed && (progress[bestTimeKey] === null || elapsedSeconds < progress[bestTimeKey])) progress[bestTimeKey] = elapsedSeconds;
    saveMathGuildProgress(progress);
    const totalGp = reward > 0 && typeof addGp === "function" ? addGp(reward) : (typeof getGp === "function" ? getGp() : null);
    const rankedUp = previousPasses < 5 && progress[passKey] >= 5;
    const oldTitle = testNumber === 1 ? MATH_GUILD_TITLES[0] : MATH_GUILD_TITLES[1];
    const newTitle = testNumber === 1 ? MATH_GUILD_TITLES[1] : MATH_GUILD_TITLES[2];
    const unlockText = testNumber === 1 ? "ギルドクエスト6が解放されました。" : "ギルドクエスト11は今後追加予定です。";
    const container = document.getElementById("mathGuildContent");
    container.innerHTML = `
        <div class="math-result-panel ${passed ? "is-clear" : "is-failed"}">
            <span>${passed ? "TEST PASSED" : "TEST COMPLETE"}</span>
            <h2>${passed ? `ギルドテスト${testNumber} 合格！` : "もう一度修行しよう"}</h2>
            <div class="math-test-stats">
                <div><small>正解</small><strong>${mathGuildState.correctCount} / ${mathGuildState.questions.length}</strong></div>
                <div><small>正解率</small><strong>${accuracy}%</strong></div>
                <div><small>タイム</small><strong>${formatMathGuildTime(elapsedSeconds)}</strong></div>
            </div>
            <p>合格回数：${Math.min(progress[passKey], 5)} / 5回</p>
            <div class="math-result-reward">獲得報酬 <strong>${reward} GP</strong></div>
            ${rankedUp ? `<div class="math-rankup"><small>RANK UP</small><strong>${oldTitle} → ${newTitle}</strong><p>新しい称号が認定されました。${unlockText}</p></div>` : ""}
            ${totalGp !== null ? `<small>所持GP：${totalGp}</small>` : ""}
            <button type="button" id="finishMathGuildBack">算数ギルドへ戻る</button>
        </div>`;
    document.getElementById("finishMathGuildBack")?.addEventListener("click", renderMathGuildHome);
    if (typeof refreshGameDisplays === "function") refreshGameDisplays();
}

function formatMathGuildTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remain = seconds % 60;
    return minutes > 0 ? `${minutes}分${String(remain).padStart(2, "0")}秒` : `${remain}秒`;
}

window.MathGuild = {
    open: openMathGuild,
    render: renderMathGuildHome,
    getProgress: getMathGuildProgress,
    getTitle: getMathGuildTitle,
    titles: [...MATH_GUILD_TITLES]
};
