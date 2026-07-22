"use strict";

/* =========================================================
   算数ギルド Ver1.0
   ・ギルドクエスト1〜5（各10問・四択・一度だけ攻略）
   ・不正解でそのクエストの1問目へ戻る
   ・再挑戦時は選択肢のみシャッフル
   ・ギルドテスト1（20問ランダム・何度でも挑戦）
   ・テスト合格5回で称号「見習い」
   ========================================================= */

const MATH_GUILD_STORAGE_KEY = "summerGuildMathGuildV1";
const MATH_GUILD_PASS_ACCURACY = 90;

const MATH_GUILD_TITLES = [
    "素人", "見習い", "徒弟", "下級職人", "中級職人", "上級職人",
    "名取", "皆伝", "師範", "大師範", "ギルドマスター"
];

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
    }
];

function q(expression, answer, wrong) {
    return { expression, answer, choices: [answer, ...wrong] };
}

let mathGuildState = {
    mode: "",
    questId: 0,
    questions: [],
    index: 0,
    correctCount: 0,
    startedAt: 0,
    locked: false
};

function getMathGuildProgress() {
    const fallback = { completedQuests: {}, test1Passes: 0, test1Attempts: 0, bestTime: null, bestAccuracy: 0 };
    try {
        const saved = JSON.parse(localStorage.getItem(MATH_GUILD_STORAGE_KEY) || "null");
        if (!saved || typeof saved !== "object") return fallback;
        return {
            completedQuests: saved.completedQuests && typeof saved.completedQuests === "object" ? saved.completedQuests : {},
            test1Passes: Math.max(0, Math.floor(Number(saved.test1Passes) || 0)),
            test1Attempts: Math.max(0, Math.floor(Number(saved.test1Attempts) || 0)),
            bestTime: Number.isFinite(Number(saved.bestTime)) ? Number(saved.bestTime) : null,
            bestAccuracy: Math.max(0, Math.min(100, Number(saved.bestAccuracy) || 0))
        };
    } catch (error) {
        console.warn("算数ギルドの保存データを読み込めませんでした。", error);
        return fallback;
    }
}

function saveMathGuildProgress(progress) {
    localStorage.setItem(MATH_GUILD_STORAGE_KEY, JSON.stringify(progress));
}

function getMathGuildTitle(progress = getMathGuildProgress()) {
    return progress.test1Passes >= 5 ? MATH_GUILD_TITLES[1] : MATH_GUILD_TITLES[0];
}

function isQuestUnlocked(questId, progress) {
    return questId === 1 || Boolean(progress.completedQuests[String(questId - 1)]);
}

function areAllQuestsComplete(progress) {
    return MATH_GUILD_QUESTS.every((quest) => Boolean(progress.completedQuests[String(quest.id)]));
}

function shuffle(items) {
    const copied = [...items];
    for (let i = copied.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
    }
    return copied;
}

function openMathGuild() {
    renderMathGuildHome();
    if (typeof changeScreen === "function") changeScreen("mathguild");
}

function renderMathGuildHome() {
    const container = document.getElementById("mathGuildContent");
    if (!container) return;
    const progress = getMathGuildProgress();
    const allComplete = areAllQuestsComplete(progress);
    const questCards = MATH_GUILD_QUESTS.map((quest) => {
        const complete = Boolean(progress.completedQuests[String(quest.id)]);
        const unlocked = isQuestUnlocked(quest.id, progress);
        const status = complete ? "COMPLETE" : unlocked ? "挑戦できます" : `クエスト${quest.id - 1}クリアで解放`;
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

    const testStatus = allComplete
        ? `合格 ${Math.min(progress.test1Passes, 5)} / 5回`
        : "クエスト1〜5を攻略すると解放";

    container.innerHTML = `
        <div class="math-guild-summary">
            <div><span>現在の称号</span><strong>${getMathGuildTitle(progress)}</strong></div>
            <div><span>ギルドテスト1</span><strong>${testStatus}</strong></div>
        </div>
        <div class="math-guild-list">${questCards}</div>
        <article class="math-guild-test-card ${allComplete ? "" : "is-locked"}">
            <div>
                <span>GUILD TEST 1</span>
                <h3>小数のかけ算・総合試験</h3>
                <p>クエスト1〜5からランダムで20問。正解率90％以上で合格です。</p>
                <small>${testStatus}${progress.bestAccuracy ? `／最高正解率 ${progress.bestAccuracy}%` : ""}</small>
            </div>
            <button type="button" id="startMathGuildTest" ${allComplete ? "" : "disabled"}>試験を受ける</button>
        </article>
        ${progress.test1Passes >= 5 ? `<div class="math-guild-rankup-note">称号「見習い」認定済み。ギルドクエスト6は今後追加予定です。</div>` : ""}`;

    container.querySelectorAll("[data-math-quest]").forEach((button) => {
        button.addEventListener("click", () => startMathGuildQuest(Number(button.dataset.mathQuest)));
    });
    const testButton = document.getElementById("startMathGuildTest");
    if (testButton) testButton.addEventListener("click", startMathGuildTest);
}

function startMathGuildQuest(questId) {
    const progress = getMathGuildProgress();
    const quest = MATH_GUILD_QUESTS.find((item) => item.id === questId);
    if (!quest || !isQuestUnlocked(questId, progress) || progress.completedQuests[String(questId)]) return;
    mathGuildState = {
        mode: "quest",
        questId,
        questions: quest.questions.map((question) => ({ ...question })),
        index: 0,
        correctCount: 0,
        startedAt: Date.now(),
        locked: false
    };
    renderMathGuildQuestion();
}

function startMathGuildTest() {
    const progress = getMathGuildProgress();
    if (!areAllQuestsComplete(progress)) return;
    const pool = MATH_GUILD_QUESTS.flatMap((quest) => quest.questions.map((question) => ({ ...question })));
    mathGuildState = {
        mode: "test",
        questId: 0,
        questions: shuffle(pool).slice(0, 20),
        index: 0,
        correctCount: 0,
        startedAt: Date.now(),
        locked: false
    };
    renderMathGuildQuestion();
}

function renderMathGuildQuestion(message = "") {
    const container = document.getElementById("mathGuildContent");
    const question = mathGuildState.questions[mathGuildState.index];
    if (!container || !question) return;
    const total = mathGuildState.questions.length;
    const modeLabel = mathGuildState.mode === "test" ? "GUILD TEST 1" : `GUILD QUEST ${mathGuildState.questId}`;
    const choices = shuffle(question.choices).map((choice) => `
        <button type="button" class="math-answer-button" data-math-answer="${choice}">${choice}</button>`).join("");
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
    const progress = getMathGuildProgress();
    progress.completedQuests[String(mathGuildState.questId)] = true;
    saveMathGuildProgress(progress);
    const totalGp = typeof addGp === "function" ? addGp(5) : null;
    const container = document.getElementById("mathGuildContent");
    const nextText = mathGuildState.questId < 5 ? `ギルドクエスト${mathGuildState.questId + 1}が解放されました。` : "ギルドテスト1が解放されました。";
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
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - mathGuildState.startedAt) / 1000));
    const accuracy = Math.round((mathGuildState.correctCount / mathGuildState.questions.length) * 100);
    const passed = accuracy >= MATH_GUILD_PASS_ACCURACY;
    const accuracyPoint = accuracy === 100 ? 2 : accuracy >= 90 ? 1 : 0;
    const speedPoint = elapsedSeconds <= 180 ? 2 : elapsedSeconds <= 300 ? 1 : 0;
    const reward = accuracyPoint * speedPoint;
    const progress = getMathGuildProgress();
    const previousPasses = progress.test1Passes;
    progress.test1Attempts += 1;
    if (passed) progress.test1Passes += 1;
    progress.bestAccuracy = Math.max(progress.bestAccuracy, accuracy);
    if (passed && (progress.bestTime === null || elapsedSeconds < progress.bestTime)) progress.bestTime = elapsedSeconds;
    saveMathGuildProgress(progress);
    const totalGp = reward > 0 && typeof addGp === "function" ? addGp(reward) : (typeof getGp === "function" ? getGp() : null);
    const rankedUp = previousPasses < 5 && progress.test1Passes >= 5;
    const container = document.getElementById("mathGuildContent");
    container.innerHTML = `
        <div class="math-result-panel ${passed ? "is-clear" : "is-failed"}">
            <span>${passed ? "TEST PASSED" : "TEST COMPLETE"}</span>
            <h2>${passed ? "ギルド試験 合格！" : "もう一度修行しよう"}</h2>
            <div class="math-test-stats">
                <div><small>正解</small><strong>${mathGuildState.correctCount} / 20</strong></div>
                <div><small>正解率</small><strong>${accuracy}%</strong></div>
                <div><small>タイム</small><strong>${formatMathGuildTime(elapsedSeconds)}</strong></div>
            </div>
            <p>合格回数：${Math.min(progress.test1Passes, 5)} / 5回</p>
            <div class="math-result-reward">獲得報酬 <strong>${reward} GP</strong></div>
            ${rankedUp ? `<div class="math-rankup"><small>RANK UP</small><strong>素人 → 見習い</strong><p>新しい称号が認定されました。</p></div>` : ""}
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
