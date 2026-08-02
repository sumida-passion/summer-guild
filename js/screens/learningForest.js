"use strict";

/* =========================================================
   学びの森 Ver2.4
   算数の広場・第1〜10問＋第11〜13問「勉強の仕方」
   ========================================================= */

(() => {
    const STORAGE_KEY = "summerGuildLearningForest";
    const DAILY_BONUS_GP = 3;

    const lessonCatalog = [
        { number: 1, group: 1, label: "1-1", title: "兄と弟のお金", ready: true, id: "math-wasa-01" },
        { number: 2, group: 1, label: "1-2", title: "3人で分けたおこづかい", ready: true, id: "math-wasa-02" },
        { number: 3, group: 1, label: "1-3", title: "姉と妹のお金", ready: true, id: "math-wasa-03" },
        { number: 4, group: 1, label: "1-4", title: "3つの容器の水", ready: true, id: "math-volume-04" },
        { number: 5, group: 2, label: "2-1", title: "はがきと切手", ready: true, id: "math-difference-05" },
        { number: 6, group: 2, label: "2-2", title: "ケーキの買い物", ready: true, id: "math-savings-06" },
        { number: 7, group: 2, label: "2-3", title: "えん筆の本数と代金", ready: true, id: "math-difference-07" },
        { number: 8, group: 2, label: "2-4", title: "あめの入れ方", ready: true, id: "math-repacking-08" },
        { number: 9, group: 3, label: "3-1", title: "折り紙の余りと不足", ready: true, id: "math-distribution-09" },
        { number: 10, group: 3, label: "3-2", title: "あめを配る人数と個数", ready: true, id: "math-distribution-10" },
        { number: 11, group: 3, label: "3-3", title: "ノートの余りと不足", ready: true, id: "math-study-method-11" },
        { number: 12, group: 3, label: "3-4", title: "クッキーを分ける", ready: true, id: "math-study-method-12" },
        { number: 13, group: 3, label: "3-5", title: "長いすと5年生", ready: true, id: "math-study-method-13" },
        { number: 14, group: 4, label: "4-1", title: "あめとガム", ready: true, id: "math-hypothesis-14" },
        { number: 15, group: 4, label: "4-2", title: "シュークリームとケーキ", ready: true, id: "math-hypothesis-15" },
        { number: 16, group: 4, label: "4-3", title: "じゃんけんの得点", ready: true, id: "math-hypothesis-16" },
        { number: 17, group: 4, label: "4-4", title: "おはじきの増減", ready: true, id: "math-hypothesis-17" },
        { number: 18, group: 5, label: "5-1", title: "ジュースとお茶", ready: true, id: "math-hypothesis-18" },
        { number: 19, group: 5, label: "5-2", title: "2種類のおもり", ready: true, id: "math-hypothesis-19" },
        { number: 20, group: 5, label: "5-3", title: "コイン投げの得点", ready: true, id: "math-hypothesis-20" },
        { number: 21, group: 5, label: "5-4", title: "的当てゲーム", ready: true, id: "math-hypothesis-21" },
        { number: 22, group: 6, label: "6-1", title: "道の両側の桜", ready: true, id: "math-interval-22" },
        { number: 23, group: 6, label: "6-2", title: "桜を増やして植え直す", ready: true, id: "math-interval-23" },
        { number: 24, group: 10, label: "10-1", title: "6ずつ増える数列", ready: true, id: "math-sequence-24" },
        { number: 25, group: 10, label: "10-2", title: "奇数の数列", ready: true, id: "math-sequence-25" },
        { number: 26, group: 10, label: "10-3", title: "7ずつ増える数列", ready: true, id: "math-sequence-26" },
        { number: 27, group: 11, label: "11-1", title: "4ずつ増える数列", ready: true, id: "math-sequence-27" },
        { number: 28, group: 11, label: "11-2", title: "5ずつ増える数列", ready: true, id: "math-sequence-28" },
        { number: 29, group: 11, label: "11-3", title: "85は何番目", ready: true, id: "math-sequence-29" }
    ];

    let currentStep = 0;
    let currentSteps = [];
    let selectedLesson = null;
    let initialized = false;
    let memoOpen = false;
    let memoStrokes = [];
    let activeStroke = null;
    let canvasContext = null;
    let resizeTimer = 0;

    function getLessonLabel(number) {
        return lessonCatalog.find((item) => item.number === Number(number))?.label || String(number);
    }

    function updateLearningExitButton() {
        const button = document.getElementById("backGuildHallFromLearning");
        if (!button) return;
        button.textContent = selectedLesson ? "問題一覧へ戻る" : "ギルドホールへ戻る";
        button.dataset.destination = selectedLesson ? "lesson-list" : "guildhall";
    }

    function makeStep(text, boardRenderer, interactive = false) {
        return { text, board: boardRenderer, interactive, initiallyInteractive: interactive };
    }

    function createLesson1Steps() {
        return [
            makeStep("ここは、分からなかったことを、分かるところまでゆっくり組み立て直す場所だ。", renderWelcome),
            makeStep("今日はこの問題を、一緒に絵にして考えてみよう。兄は弟より180円多く、2人の合計は1700円だ。", () => renderProblem(false)),
            makeStep("まず弟の持っているお金を、一本のテープで表す。長さはまだ分からなくていい。", () => renderTapeDiagram("younger")),
            makeStep("兄は弟と同じ分に、さらに180円を足した長さになる。動いたところをよく見てみよう。", () => renderTapeDiagram("older")),
            makeStep("2人の合計1700円には、この『多い180円』も入っている。最初に何を取り除けば、同じ長さが2本になるかな？", renderFirstChoice, true),
            makeStep("そうだ。1700円から180円を取り除くと、弟と同じ長さが2本だけ残る。180円の札を外へ動かしてみよう。", renderDragExercise, true),
            makeStep("残った1520円は、同じ長さ2本分だ。だから2で割る。メモパッドを使って計算してもいいぞ。", () => renderNumberExercise("younger"), true),
            makeStep("弟は760円。兄はそこに180円を足す。兄はいくらになる？", () => renderNumberExercise("older"), true),
            makeStep("最後に、考え方を自分で確かめよう。式を正しい順番に並べてみるんだ。", renderOrderExercise, true),
            makeStep("よくできた。『違う分を先に外す→同じ2本に分ける→多い方へ戻す』。これが今日の学びだ。", renderSummary)
        ];
    }

    function createLesson2Steps() {
        return [
            makeStep("1-2は、3人の関係を一本分ずつ整理する問題だ。まず妹を基準の『1本分』として考えよう。", renderLesson2Problem),
            makeStep("妹の金額を1本分にする。金額はまだ分からなくていい。", () => renderLesson2Diagram("sister")),
            makeStep("兄は妹の2倍だから、同じ長さを2本並べる。", () => renderLesson2Diagram("brother")),
            makeStep("姉は妹と同じ1本分に、さらに80円多い。3人を並べると、同じ長さが全部で4本と、余分な80円になる。", () => renderLesson2Diagram("all")),
            makeStep("合計1000円を同じ4本分にするには、最初に何を外せばよいかな？", renderLesson2Choice, true),
            makeStep("そうだ。余分な80円を先に外そう。黄色の80円を『外す』場所へ動かしてみよう。", () => renderGenericDrag({ total: 1000, token: 80, result: 920, success: "1000−80＝920。これで同じ長さ4本分だけになった。▽を押して続けよう。" }), true),
            makeStep("920円は同じ4本分。妹の1本分はいくらになる？", () => renderGenericNumber({ title: "妹の1本分を求めよう", formula: "920 ÷ 4 ＝", expected: "230", success: "妹は230円。1本分が分かったぞ。▽を押して続けよう。", hint: "920円を、同じ4本に等しく分けよう。" }), true),
            makeStep("兄は妹の2倍。230円の2倍はいくらになる？", () => renderGenericNumber({ title: "兄の金額を求めよう", formula: "230 × 2 ＝", expected: "460", success: "兄は460円。妹2本分だ。▽を押して続けよう。", hint: "妹の230円を2本分にしよう。" }), true),
            makeStep("姉は妹より80円多い。230円に80円を足すといくら？", () => renderGenericNumber({ title: "姉の金額を求めよう", formula: "230 ＋ 80 ＝", expected: "310", success: "姉は310円。3人の金額が全部そろった。▽を押して続けよう。", hint: "妹の230円に、多い80円を戻そう。" }), true),
            makeStep("最後に、式を正しい順番に並べて、考え方を確かめよう。", () => renderGenericOrder({ formulas: ["1000−80＝920", "920÷4＝230", "230×2＝460", "230＋80＝310"], success: "全部つながった。▽を押して、1-2の学びをまとめよう。", hint: "まず余分な80円を外し、次に1本分を求めよう。" }), true),
            makeStep("よくできた。『余分な分を外す→同じ本数で分ける→それぞれの関係へ戻す』。これが1-2の学びだ。", renderLesson2Summary)
        ];
    }

    function createLesson3Steps() {
        return [
            makeStep("1-3は、妹の分から姉の分を組み立てて、同じ場所を見比べる問題だ。", renderLesson3Problem),
            makeStep("妹の金額はまだ分からない。そこで、妹の金額を赤い1本分で表そう。姉は、その1本分より500円多い。", () => renderLesson3Diagram("difference")),
            makeStep("もう一つの条件は『姉は妹の3倍より100円少ない』。だから100円を足すと、妹の3本分ぴったりになる。", () => renderLesson3Diagram("before-add")),
            makeStep("黄色の100円を、500円の右隣へ動かして、妹の3本分ぴったりにしよう。", renderLesson3Drag, true),
            makeStep("上の赤い1本分は妹そのもの。だから、その右側の『500円＋100円』は――ここは妹2本分だよね。", renderLesson3AlignedDiagram),
            makeStep("500＋100＝600円。その600円が妹2本分だ。妹の1本分はいくらになる？", () => renderGenericNumber({ title: "妹の1本分を求めよう", formula: "600 ÷ 2 ＝", expected: "300", success: "妹は300円。600円を2本に分けると、1本分が出た。▽を押して続けよう。", hint: "500円＋100円の600円は、赤い2本分だったね。" }), true),
            makeStep("姉は妹より500円多い。300円に500円を足すといくら？", () => renderGenericNumber({ title: "姉の金額を求めよう", formula: "300 ＋ 500 ＝", expected: "800", success: "姉は800円。妹の3倍より100円少ないことも確かめられる。▽を押して続けよう。", hint: "妹の300円に、多い500円を足そう。" }), true),
            makeStep("最後に、気付いた順番で式を並べよう。", () => renderGenericOrder({ formulas: ["500＋100＝600", "600円＝妹2本分", "600÷2＝300", "300＋500＝800"], success: "『600円＝妹2本分』が見つかったから、全部つながった。▽を押して、1-3の学びをまとめよう。", hint: "まず500円と100円を合わせて、妹2本分を作ろう。" }), true),
            makeStep("よくできた。分からない金額を1本分にして、同じ位置をぴったりそろえると、『600円が妹2本分』だと見つけられる。", renderLesson3Summary)
        ];
    }

    function createLesson4Steps() {
        return [
            makeStep("1-4は、問題文の日本語を一つずつ絵に変えながら考える問題だ。まずは、問題文を原文のまま読んでみよう。", renderLesson4Problem),
            makeStep("ギルドマスター：『同じかさだけ水が入る3つの容器』というのは、A・B・Cのどれも、満タンまで入る水の量が同じという意味だ。", () => renderLesson4Containers("equal")),
            makeStep("主人公：『あれ？ Aがいっぱいになったあと、どうしてBは4分の1で止めて、Cにも入れたんだろう？』", () => renderLesson4Containers("question")),
            makeStep("ギルドマスター：『いいところに気付いたね。でも、問題文には水を入れた順番は書かれていないんだ。書いてあるのは、全部移し終えたあとの状態だけだよ。』", () => renderLesson4Containers("final")),
            makeStep("主人公：『なるほど。AにもBにもCにも、少しずつ入れたのかもしれないんだね。順番ではなく、最後の状態を見ればいいんだ。』", () => renderLesson4Containers("final")),
            makeStep("ギルドマスター：『そう。では、満タンのAを4分の4と考えよう。Bは4分の1、Cは4分の3だ。』", renderLesson4Fractions),
            makeStep("3つを合わせると、4分の4＋4分の1＋4分の3。分子の合計はいくつになる？", renderLesson4FractionCheck, true),
            makeStep("4分の8は、同じ容器2個分だ。その2個分が16L。容器1個分は何Lかな？", () => renderGenericNumber({ title: "容器1個分を求めよう", formula: "16 ÷ 2 ＝", expected: "8", unit: "L", success: "容器1個には8L入る。問題文の日本語から、最後の状態を正しく絵にできたね。▽を押して続けよう。", hint: "16Lは、同じ容器2個分だったね。" }), true),
            makeStep("最後に、文章から計算へ変えた順番を並べて確かめよう。", () => renderGenericOrder({ formulas: ["A＝4/4、B＝1/4、C＝3/4", "4/4＋1/4＋3/4＝8/4", "8/4＝容器2個分", "16÷2＝8"], success: "日本語を絵に変え、分数を容器の個数へ変えたから、答えまでつながった。▽を押して、1-4の学びをまとめよう。", hint: "まず、A・B・Cの最後の状態を分数で表すところから始めよう。" }), true),
            makeStep("よくできた。文章題では、書いてあることと書いていないことを分け、言葉を一つずつ絵に変えることが大切だ。", renderLesson4Summary)
        ];
    }

    function createLesson5Steps() {
        return [
            makeStep("2-1も、まずは問題文を原文のまま読んでみよう。どの言葉が、解き方を教えてくれているかな。", renderLesson5Problem),
            makeStep("主人公：『50円と80円と420円……。数字は見えるけど、どこに反応したらいいんだろう？』", () => renderLesson5Keywords(false)),
            makeStep("ギルドマスター：『ポイントは、“同じ枚数ずつ買った”と、“1枚あたりの値段の差が30円”ってところだね。この言葉に反応できるのが大切だな。』", () => renderLesson5Keywords(true)),
            makeStep("はがき1枚は50円、切手1枚は80円。1枚ずつ買うたびに、代金にはいくらの差ができるかな？", renderLesson5PriceChoice, true),
            makeStep("そう。1枚なら30円差、2枚なら60円差、3枚なら90円差。『同じ枚数』だから、この30円の差が同じ回数だけ積み重なるんだ。", renderLesson5DifferenceGrowth),
            makeStep("主人公：『なるほど！ 420円の中に、1枚ごとの差の30円が何回あるかを考えればいいんだ！』", renderLesson5UnknownCount),
            makeStep("420円の差は、30円の差が何回分かな？", () => renderGenericNumber({ title: "買った枚数を求めよう", formula: "420 ÷ 30 ＝", expected: "14", unit: "枚", success: "14枚。同じ枚数ずつ買ったので、はがきも切手も14枚ずつだ。▽を押して続けよう。", hint: "合計の差420円の中に、1枚ごとの差30円がいくつあるか考えよう。" }), true),
            makeStep("最後に、問題文の言葉から式へつなげた順番を並べよう。", () => renderGenericOrder({ formulas: ["同じ枚数ずつ買った", "80−50＝30（1枚ごとの差）", "420円＝30円の差が何回分か", "420÷30＝14"], success: "『同じ枚数』と『1枚ごとの差』に反応できたから、420÷30につながった。▽を押して、2-1の学びをまとめよう。", hint: "まず『同じ枚数』に注目し、次に1枚ごとの差を求めよう。" }), true),
            makeStep("よくできた。文章題では、数字だけでなく、数字どうしを結びつける言葉に反応することが大切だ。", renderLesson5Summary)
        ];
    }

    function createLesson6Steps() {
        return [
            makeStep("2-2も、まずは問題文を原文のまま読んでみよう。分からない『いくつか』より、数と金額がはっきり分かるところを探すんだ。", renderLesson6Problem),
            makeStep("主人公：『代金は予定と同じ金額……。ここが同じってことは、300円でいくつか買う予定の金額と、250円で実際にいくつか買った金額が一緒ってことだね。』", () => renderLesson6SameTotal(false)),
            makeStep("ギルドマスター：『そうだね、そこがポイントだ。予定と実際では、個数は違っても、使った代金の合計は同じなんだ。』", () => renderLesson6SameTotal(true)),
            makeStep("主人公：『でも、“いくつか”ばっかりじゃ、どこから考えたらいいか分からないや……。』", renderLesson6Unknowns),
            makeStep("ギルドマスター：『でも、数と金額がはっきり分かるところがあるよ。“250円のケーキが、2個多く買えた”ってところだ。』", renderLesson6TwoExtra),
            makeStep("主人公：『あ、そしたら500円って数字が出るね。』2個多く買うために必要な金額を求めよう。", () => renderGenericNumber({ title: "多く買えた2個分を求めよう", formula: "250 × 2 ＝", expected: "500", success: "そうだね。2個多く買うには500円の余裕が必要だ。▽を押して続けよう。", hint: "250円のケーキ2個分だから、250×2だね。" }), true),
            makeStep("主人公：『予定では300円のケーキを買うつもりだった。でも250円のを買ったら、全部で500円の余裕ができたってことだ。』", renderLesson6SavingBridge),
            makeStep("ギルドマスター：『そそ！ それがポイントだ。1個につき、いくら安く買えたのかな？』", renderLesson6UnitDifferenceChoice, true),
            makeStep("主人公：『1個につき50円安かったのを積み重ねていったら、500円の余裕ができたってことだ！』", renderLesson6SavingsStack),
            makeStep("主人公：『ということは……50円が何回分集まったら500円になるかを考えればいいんだ！』", () => renderGenericNumber({ title: "最初に買う予定だった個数を求めよう", formula: "500 ÷ 50 ＝", expected: "10", unit: "個", success: "10個。最初は300円のケーキを10個買うつもりだったんだ。▽を押して続けよう。", hint: "500円の中に、1個ごとの50円の差が何回あるか考えよう。" }), true),
            makeStep("最後に、分かる数字から考えた順番を並べて確かめよう。", () => renderGenericOrder({ formulas: ["250×2＝500（2個分の余裕）", "300−250＝50（1個ごとの余裕）", "500円＝50円が何回分か", "500÷50＝10"], success: "『いくつか』は後回しにして、はっきり分かる2個分の500円から考えたから、答えまでつながった。▽を押して、2-2の学びをまとめよう。", hint: "まず、実際に2個多く買えたことで必要になった金額を求めよう。" }), true),
            makeStep("よくできた。分からない『いくつか』からではなく、数と金額がはっきりしているところから考える。1個ごとの50円の差が積み重なって500円になったんだ。", renderLesson6Summary)
        ];
    }

    function createLesson7Steps() {
        return [
            makeStep("2-3も、まずは問題文を原文のまま読んでみよう。今回は『1本ごとの差』『9本多い』『代金は220円高い』を、順番に絵へ変えていくよ。", renderLesson7Problem),
            makeStep("主人公：『100円と80円だから、2人が1本ずつ買うたびに、あきらくんの代金が20円ずつ多くなるね。』", renderLesson7UnitDifference),
            makeStep("ギルドマスター：『そう。まずは9本の違いをいったん置いて、2人が同じ本数買ったときだけを考えよう。220円の差は、20円の差が何回積み重なったものかな？』", () => renderGenericNumber({ title: "220円の差ができる回数", formula: "220 ÷ 20 ＝", expected: "11", unit: "回", success: "11回。2人が11本ずつなら、あきらくんの代金が220円高くなる。▽を押して続けよう。", hint: "1回ごとの差は20円。220円の中に20円が何回あるか考えよう。" }), true),
            makeStep("まず2人とも11本ずつ買った場面を置こう。この時点では、あきらくんの代金が220円高い。", () => renderLesson7CountState("equal")),
            makeStep("でも問題文には『ゆかさんのほうが9本多い』と書いてある。ゆかさんだけに9本を足すと、その9本分はいくらになる？", () => renderGenericNumber({ title: "ゆかさんの多い9本分", formula: "80 × 9 ＝", expected: "720", unit: "円", success: "720円。ゆかさんだけに720円分が加わる。▽を押して続けよう。", hint: "ゆかさんのえん筆は1本80円。それが9本だね。" }), true),
            makeStep("11本ずつのときは、あきらくんが220円高かった。そこへゆかさんだけ720円分を足すと、今度はゆかさんが500円高くなる。", () => renderLesson7CountState("yuka-ahead")),
            makeStep("ギルドマスター：『ここから2人とも同じ本数ずつ増やせば、9本差は変わらないね。』1回増えるたび、あきらくんは20円ずつ追いつく。", renderLesson7KeepGap),
            makeStep("主人公：『ゆかさんが500円高いところから、最後はあきらくんが220円高くなるんだ。だから、差を全部で720円ひっくり返せばいいんだね。』", renderLesson7Turnaround),
            makeStep("720円分の差を、1回20円ずつひっくり返すには、あと何回必要かな？", () => renderGenericNumber({ title: "追加で一緒に買う回数", formula: "720 ÷ 20 ＝", expected: "36", unit: "回", success: "36回。9本差を保ったまま、2人とも36本ずつ増やせばよい。▽を押して続けよう。", hint: "ひっくり返す差は720円。1回ごとに20円ずつ変わるよ。" }), true),
            makeStep("最初の11本に、あとから一緒に増やした36本を足す。あきらくんは何本買ったかな？", () => renderGenericNumber({ title: "あきらくんの本数", formula: "11 ＋ 36 ＝", expected: "47", unit: "本", success: "47本。ゆっくり考える道筋で答えまでたどり着いた。▽を押して、近道も見てみよう。", hint: "最初に同じ本数として置いた11本と、追加した36本を合わせよう。" }), true),
            makeStep("ギルドマスター：『ここまで分かったら、同じことを短くまとめる近道も使えるよ。』", renderLesson7ShortcutIntro),
            makeStep("ゆかさんのほうが9本多いということは、80×9＝720円分、ゆかさんが多いということだね。", () => renderLesson7Shortcut("extra")),
            makeStep("720円多いところから、最後はあきらくんが220円多く終わった。つまり、720円分をひっくり返し、さらに220円進んだんだ。", () => renderLesson7Shortcut("turn")),
            makeStep("だから、あきらくんが作った差は720＋220＝940円。1回の差が20円なので、940円分を20円で割れば買った回数が出る。", () => renderLesson7Shortcut("formula")),
            makeStep("近道の式を、意味がつながる順番に並べてみよう。", () => renderGenericOrder({ formulas: ["80×9＝720（ゆかさんが多い分）", "720＋220＝940（ひっくり返してさらに進む差）", "100−80＝20（1本ごとの差）", "940÷20＝47"], success: "47本。さっきゆっくり考えたことを、一気にまとめた式になっているね。▽を押して、2-3の学びをまとめよう。", hint: "まず9本分を金額にし、次に最後の220円を足そう。" }), true),
            makeStep("主人公：『なるほど！ さっきゆっくり考えたことを、一気に計算しただけなんだ！』 ギルドマスター：『その通り。近道は、理解してから使うと、一番力になる。』", renderLesson7Summary)
        ];
    }

    function createLesson8Steps() {
        return [
            makeStep("2-4も、まずは問題文を原文のまま読んでみよう。今回は、最後に見えている『6ふくろ多くできた』から考えていくよ。", renderLesson8Problem),
            makeStep("主人公：『最後の形では、4個入りの袋が、最初より6袋多くできたんだね。』", () => renderLesson8FinalBags(false)),
            makeStep("ギルドマスター：『そう。では、増えた6袋には、あめが全部で何個入っているかな？』", () => renderGenericNumber({ title: "増えた6袋に入ったあめ", formula: "6 × 4 ＝", expected: "24", unit: "個", success: "24個。最後には、24個分の余裕ができたと考えられるね。▽を押して続けよう。", hint: "増えた袋は6袋で、1袋に4個ずつ入っているよ。" }), true),
            makeStep("主人公：『つまり、最後には24個分の余裕ができたってことなんだ！』", () => renderLesson8FinalBags(true)),
            makeStep("ギルドマスター：『では、その24個の余裕は、どうやって生まれたんだろう？』6個入りの袋を、4個入りに詰め替える場面を見よう。", () => renderLesson8Repacking(false)),
            makeStep("主人公：『6個を4個に入れ替えると、1袋につき2個ずつ余裕が生まれるんだね。』", () => renderLesson8Repacking(true)),
            makeStep("最後の24個の余裕は、1回につき2個ずつ生まれた。何回、詰め替えたことになるかな？", () => renderGenericNumber({ title: "詰め替えた回数", formula: "24 ÷ 2 ＝", expected: "12", unit: "回", success: "12回。つまり、もともとは6個入りの袋が12袋あったんだ。▽を押して続けよう。", hint: "24個の中に、1回で生まれる2個の余裕が何回あるか考えよう。" }), true),
            makeStep("主人公：『12回詰め替えたということは、もともとは6個入りが12袋あったってことだね。』", renderLesson8OriginalBags),
            makeStep("もともとの1袋には6個ずつ入っていた。あめは全部で何個かな？", () => renderGenericNumber({ title: "あめの全部の数", formula: "12 × 6 ＝", expected: "72", unit: "個", success: "72個。最後に見えている6袋から、もとの数まで逆にたどれたね。▽を押して、効率のよい式も見てみよう。", hint: "もともとは12袋で、1袋に6個ずつ入っていたよ。" }), true),
            makeStep("ギルドマスター：『ここまで分かったら、さっき考えたことを式だけで短く表せるよ。』", renderLesson8ShortcutIntro),
            makeStep("まず、1袋を詰め替えるたびに生まれる余裕を求める。", () => renderLesson8Shortcut("unit")),
            makeStep("次に、増えた6袋に入ったあめの数を求める。", () => renderLesson8Shortcut("extra")),
            makeStep("24個の余裕が、1回2個ずつ何回生まれたかを求める。", () => renderLesson8Shortcut("count")),
            makeStep("最後に、もとの12袋に6個ずつ入っていたことから、全部の数を求める。", () => renderLesson8Shortcut("answer")),
            makeStep("効率のよい式を、意味がつながる順番に並べてみよう。", () => renderGenericOrder({ formulas: ["6−4＝2（1回の詰め替えで生まれる余裕）", "4×6＝24（増えた6袋に入ったあめ）", "24÷2＝12（もとの袋の数）", "12×6＝72（あめの全部の数）"], success: "72個。ゆっくり考えた道筋を、式だけで短く表せたね。▽を押して、2-4の学びをまとめよう。", hint: "まず1袋ごとの余裕、次に増えた6袋分、そして元の袋数を求めよう。" }), true),
            makeStep("主人公：『なるほど！ さっき考えたことを、式だけで短く書いたんだ！』 ギルドマスター：『その通り。式は、考え方を短く表したものなんだ。』", renderLesson8Summary)
        ];
    }


    function createLesson9Steps() {
        return [
            makeStep("3-1も、まずは問題文を原文のまま読んでみよう。今回は『余り』と『不足』が、どうつながっているかを絵にして考えるよ。", renderLesson9Problem),
            makeStep("3枚ずつ配り終えると、折り紙が6枚残る。この6枚は、まだ子どもたちへ配れる折り紙だ。", () => renderLesson9Distribution("three")),
            makeStep("3枚ずつから4枚ずつへ変えるには、子ども1人につき、あと何枚必要かな？", () => renderGenericChoice({ question: "1人につき増やす枚数は？", choices: [{ value: "1", label: "1枚" }, { value: "2", label: "2枚" }, { value: "7", label: "7枚" }], correct: "1", success: "そう。4−3＝1だから、1人につきあと1枚必要だ。▽を押して続けよう。", hint: "3枚から4枚へ増える分を考えよう。" }), true),
            makeStep("余っていた6枚を、子どもへ1枚ずつ配ると、6人分は3枚から4枚にできる。", () => renderLesson9Distribution("use-six")),
            makeStep("でも問題文には『2枚足りません』とある。つまり、余っていた6枚を全部使っても、さらに2枚必要だったんだ。", () => renderLesson9Distribution("short-two")),
            makeStep("4枚ずつ配るために、全員へ追加したかった折り紙は全部で何枚かな？", () => renderGenericNumber({ title: "全員へ追加する折り紙", formula: "6 ＋ 2 ＝", expected: "8", unit: "枚", success: "8枚。余っていた6枚を使い、さらに2枚必要だったからだね。▽を押して続けよう。", hint: "余っていた6枚から、足りない2枚のところまで進むよ。" }), true),
            makeStep("この8枚は、子ども全員へ1枚ずつ追加するための枚数だ。1人に1枚ずつで8枚必要なら、子どもは何人かな？", () => renderGenericNumber({ title: "子どもの人数", formula: "8 ÷ 1 ＝", expected: "8", unit: "人", success: "8人。全員へ1枚ずつ追加するために8枚必要だったんだ。▽を押して、確かめよう。", hint: "1人につき1枚ずつ追加するよ。" }), true),
            makeStep("3枚ずつ配る場合と4枚ずつ配る場合で、折り紙の全部の枚数が同じになるか確かめよう。", renderLesson9Check),
            makeStep("ゆっくり考えた道筋を、効率のよい式へまとめよう。", () => renderLesson9Shortcut("intro")),
            makeStep("まず、1人につき増える枚数は4−3＝1枚。余りから不足まで必要な枚数は6＋2＝8枚だ。", () => renderLesson9Shortcut("steps")),
            makeStep("だから、（6＋2）÷（4−3）＝8人。式を意味がつながる順番に並べよう。", () => renderGenericOrder({ formulas: ["4−3＝1（1人につき増やす枚数）", "6＋2＝8（全員へ追加する枚数）", "8÷1＝8（子どもの人数）"], success: "8人。余りと不足の間を、1人分の差で分けた式になっているね。▽を押して、3-1の学びをまとめよう。", hint: "まず1人分の差、次に余りと不足を合わせよう。" }), true),
            makeStep("主人公：『余った6枚と足りない2枚は反対なのに、ここでは足すんだね。』 ギルドマスター：『余った6枚を全部使い、さらに2枚必要だからだよ。』", renderLesson9Summary)
        ];
    }

    function createLesson10Steps() {
        return [
            makeStep("3-2も、まずは問題文を原文のまま読んでみよう。今度は『余り』が2つ出てくるよ。", renderLesson10Problem),
            makeStep("1人6個ずつ配ると、あめが15個残る。", () => renderLesson10Distribution("six")),
            makeStep("1人8個ずつ配ると、残るあめは5個になる。余りは何個減ったかな？", () => renderGenericNumber({ title: "余りの減った数", formula: "15 − 5 ＝", expected: "10", unit: "個", success: "10個。多く配ったぶん、余りが15個から5個へ減ったんだ。▽を押して続けよう。", hint: "最初の余り15個と、あとの余り5個を比べよう。" }), true),
            makeStep("6個ずつから8個ずつへ変えると、子ども1人につき何個多く配ることになるかな？", () => renderGenericChoice({ question: "1人につき増えるあめは？", choices: [{ value: "1", label: "1個" }, { value: "2", label: "2個" }, { value: "10", label: "10個" }], correct: "2", success: "そう。8−6＝2だから、1人につき2個ずつ多く配った。▽を押して続けよう。", hint: "6個から8個へ増える分だよ。" }), true),
            makeStep("余りが10個減ったのは、子ども全員へ2個ずつ多く配ったからだ。", () => renderLesson10Distribution("difference")),
            makeStep("10個の中に、1人分の2個が何回あるかな？", () => renderGenericNumber({ title: "子どもの人数", formula: "10 ÷ 2 ＝", expected: "5", unit: "人", success: "5人。5人へ2個ずつ多く配ると、余りが10個減るね。▽を押して続けよう。", hint: "減った10個を、1人分の2個ずつに分けよう。" }), true),
            makeStep("子どもが5人と分かった。6個ずつ配って15個余るとき、あめは全部で何個かな？", () => renderGenericNumber({ title: "あめの全部の数", formula: "6 × 5 ＋ 15 ＝", expected: "45", unit: "個", success: "45個。8個ずつ配る場合でも同じになるか確かめよう。▽を押して続けよう。", hint: "5人へ6個ずつ配った分に、余り15個を足そう。" }), true),
            makeStep("8×5＋5も45。どちらの配り方でも全部のあめは同じ45個になる。", renderLesson10Check),
            makeStep("ゆっくり考えたことを、効率のよい式へまとめよう。", () => renderLesson10Shortcut("intro")),
            makeStep("余りの差は15−5＝10個。1人分の差は8−6＝2個。だから（15−5）÷（8−6）＝5人だ。", () => renderLesson10Shortcut("steps")),
            makeStep("式を意味がつながる順番に並べよう。", () => renderGenericOrder({ formulas: ["15−5＝10（余りの差）", "8−6＝2（1人につき増える個数）", "10÷2＝5（子どもの人数）", "6×5＋15＝45（あめの全部の数）"], success: "子どもは5人、あめは45個。余りどうしの差から人数を求められたね。▽を押して、3-2の学びをまとめよう。", hint: "余りの差、1人分の差、人数、全部の数の順だよ。" }), true),
            makeStep("ギルドマスター：『余りどうしなら引き算。前の問題のように余りと不足なら足し算。言葉の違いを図にすると、式の理由が見えるんだ。』", renderLesson10Summary)
        ];
    }


    function createLesson11Steps() {
        const steps = [];
        const state = getState();
        if (!state.studyMethodTutorialSeen) {
            steps.push(makeStep("ここまで本当によく頑張ったね。今日からは、問題を解くだけじゃなくて、『勉強の仕方』もレベルアップしていこう。", renderStudyMethodTutorial, true));
        }
        return steps.concat([
            makeStep("まずは問題文を読む。まだ電卓も計算も使わない。何が起きている問題なのか、言葉をつかもう。", () => renderStudyMethodProblem(11)),
            makeStep("問題をやさしい言葉に言い換えて、意味が合うように空欄を完成させよう。全部合うまで次へは進まないよ。", () => renderUnderstandingCloze({
                lesson: 11,
                sentences: [
                    { before: "3冊ずつ配ると、ノートが", answer: "16冊余る", choices: ["16冊余る", "16冊足りない", "子どもが16人"] },
                    { before: "5冊ずつ配るには、ノートが", answer: "20冊足りない", choices: ["20冊余る", "20冊足りない", "5冊足りない"] },
                    { before: "1人分の配る数は、3冊から5冊へ", answer: "2冊増える", choices: ["2冊増える", "2冊減る", "8冊増える"] },
                    { before: "余りの16冊を全部使っても、さらに", answer: "20冊必要", choices: ["20冊必要", "16冊余る", "36人必要"] }
                ],
                hint: "もう一度、問題文の『余る』『足りない』『3冊ずつ』『5冊ずつ』を見てみよう。",
                success: "問題の意味を正しく言い換えられた。次は、分かったことをノートに残そう。▽を押して続けよう。"
            }), true),
            makeStep("ノートを開こう。黄色は板書だから必ず写す。緑は、ノートの取り方のコツだ。", () => renderNotebookPrompt({
                title: "学びの森 3-3",
                lines: ["3冊ずつ → 16冊余る", "5冊ずつ → 20冊足りない"],
                advice: "このあと式を書き足すので、ここは1行空けよう。",
                detail: "問題文を全部写さず、大切な数字と言葉だけを短く書こう。"
            }), true),
            makeStep("図にすると、余っていた16冊を使い切っても、さらに20冊必要になる。余りと不足の間は全部で36冊だ。", () => renderStudyDifferenceDiagram({ lesson: 11, stage: "whole" })),
            makeStep("1人分は3冊から5冊へ、2冊増える。ノートへ式を書き足そう。", () => renderNotebookPrompt({
                title: "ノートに書き足す",
                lines: ["1人分の差　5−3＝2冊", "全体の差　16＋20＝36冊"],
                advice: "式の終わりに『冊』をつけると、何を求めた式か分かりやすい。",
                detail: "白い説明の中でも、あとで自分を助けると思った言葉は書いていい。"
            }), true),
            makeStep("全体の差36冊を、1人分の差2冊ずつに分ける。子どもは何人かな？", () => renderGenericNumber({ title: "子どもの人数", formula: "36 ÷ 2 ＝", expected: "18", unit: "人", success: "18人。意味を理解してから計算したので、36÷2が何を表すかも説明できるね。▽を押して続けよう。", hint: "全体で必要な36冊を、1人につき増える2冊ずつに分けよう。" }), true),
            makeStep("子どもが18人と分かった。3冊ずつ配って16冊余るとき、ノートは全部で何冊かな？", () => renderGenericNumber({ title: "ノートの全部の数", formula: "3 × 18 ＋ 16 ＝", expected: "70", unit: "冊", success: "70冊。答えを出したら、もう一つの配り方でも確かめよう。▽を押して続けよう。", hint: "18人へ3冊ずつ配った分に、余り16冊を足そう。" }), true),
            makeStep("答えを問題へ戻して確認する。3冊ずつでも5冊ずつでも、全部のノートは70冊になる。", () => renderStudyVerification({ left: "3×18＋16", right: "5×18−20", answer: "70冊" })),
            makeStep("ゆっくり考えた道筋は、一つの効率のよい式にもまとめられる。", () => renderStudyShortcut({ formula: "（16＋20）÷（5−3）＝18人", notes: ["余り＋不足＝全体の差", "多い数−少ない数＝1人分の差"] })),
            makeStep("今日の気づきに一番近いものを選ぼう。", () => renderInsightChoice({
                choices: ["数字をすぐ電卓へ入れる前に、問題の意味を言い換える", "式だけを覚えれば、問題文は読まなくてよい", "ノートには答えだけを書けばよい"],
                correct: 0,
                success: "その通り。理解→ノート→図→計算→確認の順で進むと、勉強の力そのものが育つ。"
            }), true),
            makeStep("今日の問題は『余る』と『足りない』が出てきたね。これから同じ仲間の問題が続く。答えではなく、『あ、このタイプだ』と気づく力を育てよう。", () => renderStudySummary({
                lesson: 11,
                points: ["問題をやさしい言葉に言い換える", "黄色の板書を写し、緑の助言でノートを整える", "『余る・足りない問題』という仲間に気づく"],
                answer: "子ども18人　ノート70冊"
            }))
        ]);
    }

    function createLesson12Steps() {
        return [
            makeStep("3-4は、3-3で練習した勉強の進め方を、自分の力で使う問題だ。今回は案内を少し減らすよ。", () => renderStudyMethodProblem(12)),
            makeStep("問題の意味が合うように、空欄を完成させよう。", () => renderUnderstandingCloze({
                lesson: 12,
                sentences: [
                    { before: "4個ずつ分けると、クッキーが", answer: "9個余る", choices: ["9個余る", "9個足りない", "4人余る"] },
                    { before: "6個ずつ分けるには、クッキーが", answer: "5個足りない", choices: ["5個余る", "5個足りない", "6個足りない"] },
                    { before: "1人分の差は", answer: "2個", choices: ["2個", "10個", "14個"] },
                    { before: "余っている9個は、1人4個から6個へ増やすために", answer: "使える", choices: ["使える", "使えない", "捨てる"] }
                ],
                hint: "まず『4個ずつで9個余る』場面を考えよう。その9個は、みんなへ追加して配れるクッキーだよ。",
                success: "問題の意味を整理できた。自分のノートへ、必要な情報を書こう。▽を押して続けよう。"
            }), true),
            makeStep("ノートへ、問題番号と必要な条件を書こう。今回は書く内容を自分で選んでみよう。", () => renderNotebookPrompt({
                title: "学びの森 3-4",
                lines: ["4個ずつ → 9個余る", "6個ずつ → 5個足りない"],
                advice: "式を書き足せるように、下を少し空けておこう。",
                detail: "板書は必ず写す。説明は、自分に必要だと思うところを選んで書く。"
            }), true),
            makeStep("4個ずつ配り終わると、手元にはクッキーが9個残っている。", () => renderLesson12CookieFlow("surplus")),
            makeStep("ギルドマスター：『せっかく9個あるんだ。まず、みんなへもう1個ずつ足してみよう。』これで1人5個ずつになる。", () => renderLesson12CookieFlow("five")),
            makeStep("ギルドマスター：『まだ全員6個にはなっていないね。もう1個ずつ足してみよう。』ところが、途中でクッキーがなくなった。", () => renderLesson12CookieFlow("six-short")),
            makeStep("あと5個あれば、全員が6個ずつになる。最初に使えた9個と、あと必要な5個を合わせると、追加分は全部で14個だ。", () => renderLesson12CookieFlow("total")),
            makeStep("ノートへ、自分で見つけた2つの差を書き足そう。", () => renderNotebookPrompt({
                title: "考えた式",
                lines: ["1人分の差　6−4＝2個", "追加に必要な全部　9＋5＝14個"],
                advice: "9個は実際に使えた分、5個はあと必要だった分、と言葉も一緒に書こう。",
                detail: "『余り＋不足』と暗記するより、6個ずつにするための追加分を全部集めた式だと考えよう。"
            }), true),
            makeStep("全体の差14個を、1人分の差2個ずつに分けよう。何人に分ける問題かな？", () => renderGenericNumber({ title: "分ける人数", formula: "14 ÷ 2 ＝", expected: "7", unit: "人", success: "7人。次はクッキーの全部の数を求めよう。▽を押して続けよう。", hint: "14個の中に、1人分の2個が何回あるか考えよう。" }), true),
            makeStep("4個ずつ7人へ分けて9個余る。クッキーは全部で何個かな？", () => renderGenericNumber({ title: "クッキーの全部の数", formula: "4 × 7 ＋ 9 ＝", expected: "37", unit: "個", success: "37個。もう一つの条件にも合うか確かめよう。▽を押して続けよう。", hint: "7人へ4個ずつ分けた数に、余り9個を足そう。" }), true),
            makeStep("6個ずつなら、6×7＝42個必要。37個では5個足りない。両方の条件に合っている。", () => renderStudyVerification({ left: "4×7＋9", right: "6×7−5", answer: "37個" })),
            makeStep("効率のよい式を、自分の考えとつなげて確認しよう。", () => renderStudyShortcut({ formula: "（9＋5）÷（6−4）＝7人", notes: ["9＋5＝14個", "6−4＝2個"] })),
            makeStep("今日できたことに一番近いものを選ぼう。", () => renderInsightChoice({
                choices: ["3-3の手順を使って、自分で必要な情報と式を整理した", "問題文を読まずに数字を組み合わせた", "答えが出たので確認はしなかった"],
                correct: 0,
                success: "その力が、教室で先生の話を聞き、自分のノートを作る力につながっていく。"
            }), true),
            makeStep("3-3と3-4は、どちらも『余る・足りない問題』の仲間だったね。前の問題と同じ考え方に気づけたことが、本当のレベルアップだ。", () => renderStudySummary({
                lesson: 12,
                points: ["必要な条件を短くノートへ書く", "1人分の差と全体の差を見つける", "前の問題と同じ仲間だと気づく"],
                answer: "7人　クッキー37個"
            }))
        ];
    }


    function createLesson13Steps() {
        return [
            makeStep("3-5も、3-3・3-4と同じ『余る・足りない問題』の仲間だ。でも今回は、『最後の長いすだけ1人』という新しい条件が一つ増えているよ。", () => renderLesson13Problem()),
            makeStep("まず問題の意味を、やさしい言葉へ言い換えよう。", () => renderUnderstandingCloze({
                lesson: 13,
                sentences: [
                    { before: "4人ずつ座ると、長いすに座れない人が", answer: "31人いる", choices: ["31人いる", "31人余る", "4人いる"] },
                    { before: "6人ずつ座ると、最後の長いすには", answer: "1人だけ座る", choices: ["1人だけ座る", "6人座る", "31人座る"] },
                    { before: "最後の長いすは、6人満席と比べて", answer: "5人少ない", choices: ["5人少ない", "1人少ない", "6人多い"] },
                    { before: "4人ずつの世界から6人ずつへ変えると、長いす1脚につき", answer: "2人多く座れる", choices: ["2人多く座れる", "2人少なく座れる", "10人多く座れる"] }
                ],
                hint: "『座れない31人』『最後は1人』『6人満席ならあと5人』という言葉を、一つずつ確かめよう。",
                success: "条件を正しく整理できた。次は、長いすの世界を図で比べよう。▽を押して続けよう。"
            }), true),
            makeStep("ノートへ、二つの座り方を短く書こう。", () => renderNotebookPrompt({
                title: "学びの森 3-5",
                lines: ["4人ずつ → 31人座れない", "6人ずつ → 最後の長いすは1人"],
                advice: "今回は『最後だけ1人』を忘れないよう、丸で囲んでおこう。",
                detail: "前の問題と同じところ、新しく増えた条件を分けて書くと見やすい。"
            }), true),
            makeStep("4人ずつ座った世界では、すべての長いすに4人ずつ座り、それでも31人が立ったままだ。", () => renderLesson13BenchDiagram("four")),
            makeStep("6人ずつ座った世界では、最後の長いすだけ1人。6人満席と比べると、そこには5人分の空席がある。", () => renderLesson13BenchDiagram("six")),
            makeStep("二つの世界の差をそろえよう。4人ずつでは31人が座れず、6人ずつの世界では満席より5人少ない。合わせて36人分の違いになる。", () => renderLesson13BenchDiagram("difference")),
            makeStep("長いす1脚については、4人から6人へ2人多く座れる。36人分の違いの中に、2人分が何回あるかな？", () => renderGenericNumber({
                title: "長いすの数",
                formula: "（31 ＋ 5）÷（6 − 4）＝",
                expected: "18",
                unit: "脚",
                success: "18脚。『31＋5』は、二つの座り方の間にある36人分の差だ。▽を押して続けよう。",
                hint: "座れない31人と、最後の空席5人分を合わせて36人。1脚につき2人多く座れる。"
            }), true),
            makeStep("長いすは18脚。4人ずつ18脚へ座り、さらに31人が座れない。5年生は全部で何人かな？", () => renderGenericNumber({
                title: "5年生の人数",
                formula: "4 × 18 ＋ 31 ＝",
                expected: "103",
                unit: "人",
                success: "103人。次は、6人ずつの条件にも合うか確かめよう。▽を押して続けよう。",
                hint: "18脚に4人ずつ座った人数へ、座れなかった31人を足そう。"
            }), true),
            makeStep("6人ずつなら、最初の17脚は満席で、最後の1脚だけ1人。6×17＋1＝103人となり、両方の条件に合う。", () => renderStudyVerification({
                left: "4×18＋31",
                right: "6×17＋1",
                answer: "103人"
            })),
            makeStep("3-3から3-5を並べると、全部同じ仲間だと分かる。違うのは、最後の条件だけだ。", () => renderDistributionFamilyBoard()),
            makeStep("今日の気づきに一番近いものを選ぼう。", () => renderInsightChoice({
                choices: ["新しい問題でも、前に見た『余る・足りない問題』の仲間だと考える", "問題ごとに式だけを別々に暗記する", "『最後だけ1人』という条件は使わなくてよい"],
                correct: 0,
                success: "その通り。勉強ができる人は、問題を一問ずつ暗記せず、『これは前にも見た仲間だ』と気づいて考える。"
            }), true),
            makeStep("新しい問題に出会ったら、『これはどの仲間かな？』と考えてみよう。問題を仲間分けする力は、次の学びへの地図になる。", () => renderStudySummary({
                lesson: 13,
                points: ["前の問題と同じ仲間を見つける", "新しく増えた条件だけを丁寧に読む", "二つの世界の差をそろえて考える"],
                answer: "長いす18脚　5年生103人"
            }))
        ];
    }

    function renderLesson13Problem() {
        setBoard(`
            <article class="learning-problem-card study-method-problem">
                <p class="learning-problem-label">3-5の問題</p>
                <p>5年生が長いすに4人ずつ座ると、31人が座れません。</p>
                <p>6人ずつ座ると、最後の長いすには1人だけ座ります。</p>
                <p>長いすは何脚あり、5年生は何人いますか。</p>
                <div class="study-no-calculator">同じ仲間を探す　新しい条件を見つける</div>
            </article>
        `);
    }

    function renderLesson13BenchDiagram(stage) {
        const content = {
            four: {
                title: "4人ずつの世界",
                top: "各長いすに4人",
                bottom: "＋ 座れない31人",
                note: "31人分、まだ席が必要"
            },
            six: {
                title: "6人ずつの世界",
                top: "ほとんどの長いすに6人",
                bottom: "最後だけ1人",
                note: "6人満席より5人少ない"
            },
            difference: {
                title: "二つの世界の間",
                top: "座れない31人",
                bottom: "＋ 最後の空席5人分",
                note: "全部で36人分の違い"
            }
        }[stage];
        setBoard(`
            <section class="bench-lesson-board">
                <header><small>3-5　余る・足りない問題</small><h3>${content.title}</h3></header>
                <div class="bench-row" aria-hidden="true">
                    <div class="bench-seat">${stage === "four" ? "👤👤👤👤" : "👤👤👤👤👤👤"}</div>
                    <div class="bench-seat">${stage === "difference" ? "31人" : stage === "six" ? "👤👤👤👤👤👤" : "👤👤👤👤"}</div>
                    <div class="bench-seat is-last">${stage === "six" ? "👤＋空席5" : stage === "difference" ? "空席5" : "👤👤👤👤"}</div>
                </div>
                <div class="bench-equation">
                    <b>${content.top}</b>
                    <span>${content.bottom}</span>
                </div>
                <p>${content.note}</p>
            </section>
        `);
    }

    function renderDistributionFamilyBoard() {
        setBoard(`
            <section class="distribution-family-board">
                <header><small>問題を仲間分けする</small><h3>余る・足りない問題</h3></header>
                <div class="distribution-family-grid">
                    <article><b>3-3</b><span>余る</span><span>足りない</span></article>
                    <article><b>3-4</b><span>余る</span><span>足りない</span></article>
                    <article><b>3-5</b><span>座れない</span><span>最後だけ1人</span></article>
                </div>
                <p>配る・座る場面は違っても、二つの世界の差を比べる同じ仲間。</p>
            </section>
        `);
    }


    function renderHypothesisBoard({ label, title, hypothesis, reality, difference, unitChange, conclusion, note = "" }) {
        setBoard(`
            <section class="learning-summary-card">
                <p class="learning-summary-label">${label}　仮説を立てて考える</p>
                <h3>${title}</h3>
                <ol>
                    <li><strong>仮説</strong>　${hypothesis}</li>
                    <li><strong>現実</strong>　${reality}</li>
                    <li><strong>差</strong>　${difference}</li>
                    <li><strong>1回の変化</strong>　${unitChange}</li>
                </ol>
                <p class="learning-summary-answer">${conclusion}</p>
                ${note ? `<p>${note}</p>` : ""}
            </section>
        `);
    }

    function renderHypothesisProblem({ label, lines }) {
        setBoard(`
            <article class="learning-problem-card hypothesis-problem">
                <p class="learning-problem-label">${label}の問題</p>
                ${lines.map(line => `<p>${line}</p>`).join("")}
                <div class="study-no-calculator">まだ式を考えない　まず問題を読む</div>
                <button type="button" class="notebook-done-button hypothesis-problem-next">わかった！</button>
            </article>
        `);
        board().querySelector(".hypothesis-problem-next")?.addEventListener("click", () => {
            completeInteractiveStep("問題を読めたね。▽を押して、考え方を学ぼう。");
        });
    }

    function createLesson14Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。大丈夫。まだ式は考えなくていいよ。", () => renderHypothesisProblem({
                label: "4-1",
                lines: [
                    "1個30円のあめと1個110円のガムを合わせて15個買うと、代金の合計は1170円です。",
                    "このとき、あめとガムをそれぞれ何個買いましたか。"
                ]
            }), true),
            makeStep("4-1からは、式を先に覚えるのではなく、『考えやすい世界』を作って考える練習だ。", () => renderHypothesisBoard({
                label: "4-1",
                title: "あめとガム",
                hypothesis: "まず、全部あめだった世界を作る。",
                reality: "実際の1170円と比べる。",
                difference: "実際の方が高い分を見つける。",
                unitChange: "あめ1個をガム1個へ変えると、110−30＝80円高くなる。",
                conclusion: "差額の中に80円が何回あるかを考える。"
            })),
            makeStep("ギルドマスター：『まず、一番考えやすい世界を作ってみよう。』今回は、15個全部あめだった世界だ。", () => renderHypothesisBoard({
                label: "4-1",
                title: "仮説",
                hypothesis: "全部あめなら30×15＝450円",
                reality: "本当は、あめとガムが混ざって1170円。",
                difference: "まだ計算しない。",
                unitChange: "まだ見ない。",
                conclusion: "最初は、考えやすい世界を一つ作ればよい。"
            })),
            makeStep("ギルドマスター：『実際とは何が違うかな？』全部あめの450円と、実際の1170円との差はいくら？", () => renderGenericNumber({
                title: "実際との差",
                formula: "1170 − 450 ＝",
                expected: "720",
                unit: "円",
                success: "720円高い。この差は、あめがガムへ変わった分の合計だ。▽を押して続けよう。",
                hint: "実際の1170円から、全部あめの450円を引こう。"
            }), true),
            makeStep("ギルドマスター：『その違いは1回でどれくらい変わる？』あめ30円がガム110円へ変わると、いくら高くなる？", () => renderGenericNumber({
                title: "1個変わるときの差",
                formula: "110 − 30 ＝",
                expected: "80",
                unit: "円",
                success: "80円。あめ1個をガム1個へ変えるたび、代金は80円高くなる。▽を押して続けよう。",
                hint: "ガム110円から、あめ30円を引こう。"
            }), true),
            makeStep("ギルドマスター：『その違いは何回起きているかな？』720円の中に80円はいくつある？", () => renderGenericNumber({
                title: "ガムの個数",
                formula: "720 ÷ 80 ＝",
                expected: "9",
                unit: "個",
                success: "ガムは9個。全部15個だから、残りがあめだ。▽を押して続けよう。",
                hint: "720円を、1回分の80円で分けよう。"
            }), true),
            makeStep("全部で15個、ガムが9個。あめは何個かな？", () => renderGenericNumber({
                title: "あめの個数",
                formula: "15 − 9 ＝",
                expected: "6",
                unit: "個",
                success: "あめは6個。30×6＋110×9＝1170円で、問題の条件にも合う。▽を押して続けよう。",
                hint: "全部15個から、ガム9個を引こう。"
            }), true),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["全部あめ＝450円", "1170−450＝720円", "110−30＝80円", "720÷80＝ガム9個"],
                success: "仮説→現実→差→何回分、の順で考えられた。▽を押してまとめよう。",
                hint: "まず『全部あめ』から始めよう。"
            }), true),
            makeStep("今日は答えの出し方よりも、考え方を学んだね。考えやすい仮説を立てると、式はあとから自然に生まれる。", () => renderHypothesisBoard({
                label: "4-1",
                title: "今日の考え方",
                hypothesis: "全部あめ＝450円",
                reality: "本当は1170円",
                difference: "720円高い",
                unitChange: "1個80円",
                conclusion: "ガム9個、あめ6個"
            }))
        ];
    }

    function createLesson15Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。大丈夫。まだ式は考えなくていいよ。", () => renderHypothesisProblem({
                label: "4-2",
                lines: [
                    "1個180円のシュークリームと1個330円のケーキを合わせて18個買い、100円の箱につめたら、代金が4990円になりました。",
                    "このとき、ケーキは何個買いましたか。"
                ]
            }), true),
            makeStep("箱代100円は、シュークリームとケーキの代金とは別だね。まず、お菓子だけの代金を確かめよう。", () => renderGenericNumber({
                title: "お菓子だけの代金",
                formula: "4990 − 100 ＝",
                expected: "4890",
                unit: "円",
                success: "お菓子18個の代金は4890円。ここから、考えやすい世界を作っていこう。▽を押して続けよう。",
                hint: "合計4990円から、箱代100円を引こう。"
            }), true),
            makeStep("4-2も、まず一番考えやすい世界を作ろう。今回は、全部シュークリームだった世界だけで考える。", () => renderHypothesisBoard({
                label: "4-2",
                title: "シュークリームとケーキ",
                hypothesis: "全部シュークリーム",
                reality: "実際はシュークリームとケーキ",
                difference: "代金の差を見る",
                unitChange: "1個変わると150円高くなる",
                conclusion: "差が150円の何回分かを考える。"
            })),
            makeStep("ギルドマスター：『まず、一番考えやすい世界を作ってみよう。』全部シュークリームなら、代金は3240円だ。", () => renderHypothesisBoard({
                label: "4-2",
                title: "仮説",
                hypothesis: "全部シュークリーム＝3240円",
                reality: "まだ比べない",
                difference: "まだ求めない",
                unitChange: "まだ見ない",
                conclusion: "考えやすい世界を先に作った。"
            })),
            makeStep("ギルドマスター：『実際とは何が違うかな？』本当の代金4890円は、全部シュークリームよりいくら高い？", () => renderGenericNumber({
                title: "実際との差",
                formula: "4890 − 3240 ＝",
                expected: "1650",
                unit: "円",
                success: "1650円高い。この差は、シュークリームがケーキへ変わった分だ。▽を押して続けよう。",
                hint: "実際の4890円から、仮説の3240円を引こう。"
            }), true),
            makeStep("ギルドマスター：『その違いは1回でどれくらい変わる？』シュークリーム1個をケーキ1個へ変えると、150円高くなる。", () => renderHypothesisBoard({
                label: "4-2",
                title: "1回の変化",
                hypothesis: "シュークリーム1個",
                reality: "ケーキ1個",
                difference: "150円高い",
                unitChange: "1回＝150円",
                conclusion: "1650円は、150円が何回分か。"
            })),
            makeStep("ギルドマスター：『その違いは何回起きているかな？』1650円の中に150円はいくつある？", () => renderGenericNumber({
                title: "ケーキの個数",
                formula: "1650 ÷ 150 ＝",
                expected: "11",
                unit: "個",
                success: "11個。ケーキへ変わった回数は11回だった。▽を押して続けよう。",
                hint: "1650円を、1回分の150円で分けよう。"
            }), true),
            makeStep("最後に、式が生まれた順番を並べよう。", () => renderGenericOrder({
                formulas: ["全部シュークリーム＝3240円", "4890−3240＝1650円", "1個変わると150円高い", "1650÷150＝11個"],
                success: "式を先に覚えず、考えた順番から式を作れた。▽を押してまとめよう。",
                hint: "最初は全部シュークリームの世界だ。"
            }), true),
            makeStep("実は全部ケーキだった世界から考えても答えは出せるよ。でも、まずは自分が考えやすい仮説を一つ立てればいい。", () => renderHypothesisBoard({
                label: "4-2",
                title: "発展",
                hypothesis: "全部シュークリームから考えた",
                reality: "全部ケーキからでも考えられる",
                difference: "仮説は一つではない",
                unitChange: "大切なのは考え始められること",
                conclusion: "ケーキは11個",
                note: "今回は、全部シュークリームの考え方だけで最後まで解いた。"
            }))
        ];
    }

    function createLesson16Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。大丈夫。まだ式は考えなくていいよ。", () => renderHypothesisProblem({
                label: "4-3",
                lines: [
                    "じゃんけんをして、勝ったら7点もらい、負けたら3点ひかれるゲームをします。",
                    "全部で15回ゲームをしたところ、あいこはなく、得点が55点になりました。勝ったのは何回ですか。"
                ]
            }), true),
            makeStep("4-3は、全部勝った世界を作って考える。", () => renderHypothesisBoard({
                label: "4-3",
                title: "じゃんけんの得点",
                hypothesis: "15回全部勝ち",
                reality: "実際は55点",
                difference: "点数の差を見る",
                unitChange: "勝ちが負けへ変わると10点下がる",
                conclusion: "差が10点の何回分かを考える。"
            })),
            makeStep("ギルドマスター：『まず、一番考えやすい世界を作ってみよう。』15回全部勝ったら、7×15＝105点だ。", () => renderHypothesisBoard({
                label: "4-3",
                title: "仮説",
                hypothesis: "全部勝ち＝105点",
                reality: "実際は55点",
                difference: "これから比べる",
                unitChange: "まだ見ない",
                conclusion: "一番高い点になる世界を作った。"
            })),
            makeStep("ギルドマスター：『実際とは何が違うかな？』105点より実際の55点は、何点低い？", () => renderGenericNumber({
                title: "仮説と現実の差",
                formula: "105 − 55 ＝",
                expected: "50",
                unit: "点",
                success: "50点低い。負けがある分だけ、全部勝ちより点数が下がっている。▽を押して続けよう。",
                hint: "全部勝ち105点から、実際55点を引こう。"
            }), true),
            makeStep("ギルドマスター：『その違いは1回でどれくらい変わる？』勝ちは7点、負けは−3点。勝ち1回が負け1回へ変わると何点変わる？", () => renderGenericNumber({
                title: "1回変わるときの差",
                formula: "7 − (−3) ＝",
                expected: "10",
                unit: "点",
                success: "10点。勝ち1回が負け1回へ変わると、合計点は10点下がる。▽を押して続けよう。",
                hint: "7点から−3点へ変わる差は10点だ。"
            }), true),
            makeStep("ギルドマスター：『その違いは何回起きているかな？』50点低いのは、10点の変化が何回分？", () => renderGenericNumber({
                title: "負けた回数",
                formula: "50 ÷ 10 ＝",
                expected: "5",
                unit: "回",
                success: "負けは5回。15回のうち残りが勝ちだ。▽を押して続けよう。",
                hint: "50点を、1回分の10点で分けよう。"
            }), true),
            makeStep("全部で15回、負けが5回。勝ちは何回かな？", () => renderGenericNumber({
                title: "勝った回数",
                formula: "15 − 5 ＝",
                expected: "10",
                unit: "回",
                success: "勝ちは10回。これで勝ちと負けの回数が分かった。▽を押して続けよう。",
                hint: "全部15回から、負け5回を引こう。"
            }), true),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["全部勝ち＝105点", "105−55＝50点", "勝ち→負けで10点変化", "50÷10＝負け5回"],
                success: "仮説と現実の差から、負けた回数を見つけられた。▽を押してまとめよう。",
                hint: "まず全部勝ちの世界を作ろう。"
            }), true),
            makeStep("今日は答えの出し方よりも、考え方を学んだね。実は仮説は一つじゃない。大切なのは、『どの仮説が正しいか』ではなく、『考えやすい仮説を立てて考え始めること』なんだ。", () => renderHypothesisBoard({
                label: "4-3",
                title: "第4章のまとめ",
                hypothesis: "仮説を立てる",
                reality: "現実と比べる",
                difference: "違いを見る",
                unitChange: "違いが何回分か考える",
                conclusion: "考え方から、式を自然に生み出す。"
            }))
        ];
    }


    function renderTwoTypeObjects({ label, title, total, firstCount, firstLabel, secondLabel, firstIcon, secondIcon, note }) {
        const first = Number(firstCount);
        const count = Number(total);
        const objects = Array.from({ length: count }, (_, index) => {
            const isFirst = index < first;
            return `<span class="two-type-object ${isFirst ? "is-first" : "is-second"}"><b>${isFirst ? firstIcon : secondIcon}</b><small>${isFirst ? firstLabel : secondLabel}</small></span>`;
        }).join("");
        setBoard(`
            <section class="two-type-board">
                <header><small>${label}</small><h3>${title}</h3></header>
                <div class="two-type-object-grid">${objects}</div>
                <p>${note}</p>
            </section>
        `);
    }

    function renderWeightBoxBoard({ stage }) {
        const showRemoved = stage === "removed" || stage === "all-light" || stage === "answer";
        const heavyCount = stage === "answer" ? 9 : 0;
        const objects = Array.from({ length: 20 }, (_, index) => {
            const heavy = index < heavyCount;
            return `<span class="weight-object ${heavy ? "is-heavy" : "is-light"}"><b>●</b><small>${heavy ? "230g" : "120g"}</small></span>`;
        }).join("");
        setBoard(`
            <section class="weight-box-board ${showRemoved ? "box-is-removed" : ""}">
                <header><small>5-2</small><h3>箱と20個のおもり</h3></header>
                <div class="weight-scene">
                    <div class="weight-box"><strong>箱</strong><span>140g</span>${showRemoved ? "<em>先に外す</em>" : ""}</div>
                    <div class="weight-total"><span>${stage === "start" ? "全部で3530g" : "おもりだけ3390g"}</span></div>
                </div>
                <div class="weight-object-grid">${objects}</div>
                <p>${stage === "start"
                    ? "3530gには、箱140gも入っている。"
                    : stage === "removed"
                        ? "3530−140＝3390g。ここから20個のおもりだけで考える。"
                        : stage === "all-light"
                            ? "全部120gなら、120×20＝2400g。"
                            : "230gが9個、120gが11個。合わせて20個。"}</p>
            </section>
        `);
    }

    function createLesson17Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。まだ式は考えなくて大丈夫だよ。", () => renderHypothesisProblem({
                label: "4-4",
                lines: [
                    "勝てばおはじきを3個もらい、負ければ2個とられるというゲームをします。",
                    "はじめ30個のおはじきを持っていましたが、15回ゲームをしたところ、持っているおはじきの数は35個になっていました。",
                    "このとき、勝った回数は何回ですか。"
                ]
            }), true),
            makeStep("4-4も、まず一番考えやすい世界を作ろう。今回は15回全部負けた世界だ。", () => renderHypothesisBoard({
                label: "4-4",
                title: "おはじきの増減",
                hypothesis: "15回全部負け",
                reality: "実際は35個",
                difference: "おはじきの差を見る",
                unitChange: "負けが勝ちへ変わると5個増える",
                conclusion: "差が5個の何回分かを考える。"
            })),
            makeStep("最初は30個。15回全部負けると、2個ずつ15回とられる。残りはいくつ？", () => renderGenericNumber({
                title: "全部負けた世界",
                formula: "30 − 2 × 15 ＝",
                expected: "0",
                unit: "個",
                success: "全部負けなら0個になる。けれど実際は35個残っている。▽を押して続けよう。",
                hint: "2個ずつ15回、合計30個とられる。"
            }), true),
            makeStep("仮説では0個、実際は35個。この二つの世界には35個の差がある。", () => renderHypothesisBoard({
                label: "4-4",
                title: "仮説と現実",
                hypothesis: "全部負け＝0個",
                reality: "実際＝35個",
                difference: "35個多い",
                unitChange: "次に1回の変化を見る",
                conclusion: "勝ちへ変わった分だけ増えている。"
            })),
            makeStep("負け1回を勝ち1回へ変えると、2個とられなくなり、さらに3個もらえる。合わせて何個増える？", () => renderGenericNumber({
                title: "1回変わるときの差",
                formula: "2 ＋ 3 ＝",
                expected: "5",
                unit: "個",
                success: "1回変わるごとに5個増える。▽を押して続けよう。",
                hint: "とられなくなる2個と、もらえる3個を合わせよう。"
            }), true),
            makeStep("35個の差は、5個の変化が何回分かな？", () => renderGenericNumber({
                title: "勝った回数",
                formula: "35 ÷ 5 ＝",
                expected: "7",
                unit: "回",
                success: "勝ちは7回。▽を押して、考えた順番を確かめよう。",
                hint: "35個を、1回分の5個で分けよう。"
            }), true),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["全部負け＝0個", "実際との差＝35個", "負け→勝ちで5個増える", "35÷5＝勝ち7回"],
                success: "仮説と現実の差から、勝った回数を見つけられた。▽を押してまとめよう。",
                hint: "まず15回全部負けた世界を作ろう。"
            }), true),
            makeStep("4-4も、第4章の『仮説→現実→差→差が何回分』で解けたね。", () => renderGenericSummary({
                label: "4-4の学び",
                points: ["15回全部負けた世界を作る", "実際の35個との差を見る", "負けが勝ちへ変わると5個増える"],
                formulas: ["30−2×15＝0", "2＋3＝5", "35÷5＝7"],
                answer: "勝った回数 7回"
            }))
        ];
    }

    function createLesson18Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。まだ式は考えなくて大丈夫だよ。", () => renderHypothesisProblem({
                label: "5-1",
                lines: [
                    "1本160円のジュースと1本120円のお茶を合わせて18本買うと、代金の合計は2400円になりました。",
                    "このとき、ジュースとお茶をそれぞれ何本買いましたか。"
                ]
            }), true),
            makeStep("18本全部を、安い120円のお茶だったことにしてみよう。", () => renderTwoTypeObjects({
                label: "5-1",
                title: "まず全部お茶の世界",
                total: 18,
                firstCount: 0,
                firstLabel: "ジュース",
                secondLabel: "お茶",
                firstIcon: "J",
                secondIcon: "茶",
                note: "18本全部がお茶なら、120×18＝2160円。"
            })),
            makeStep("実際は2400円。全部お茶の2160円より、いくら高い？", () => renderGenericNumber({
                title: "実際との差",
                formula: "2400 − 2160 ＝",
                expected: "240",
                unit: "円",
                success: "実際は240円高い。この差は、お茶がジュースへ変わった分だ。▽を押して続けよう。",
                hint: "実際の2400円から、全部お茶の2160円を引こう。"
            }), true),
            makeStep("お茶1本をジュース1本へ替えると、何円高くなる？", () => renderGenericNumber({
                title: "1本変わるときの差",
                formula: "160 − 120 ＝",
                expected: "40",
                unit: "円",
                success: "1本替えるごとに40円高くなる。▽を押して続けよう。",
                hint: "ジュース160円とお茶120円の差を求めよう。"
            }), true),
            makeStep("240円の差は、40円の変化が何本分かな？", () => renderGenericNumber({
                title: "ジュースの本数",
                formula: "240 ÷ 40 ＝",
                expected: "6",
                unit: "本",
                success: "ジュースは6本。残りがお茶だ。▽を押して続けよう。",
                hint: "240円を、1本分の40円で分けよう。"
            }), true),
            makeStep("全部で18本、ジュースが6本。お茶は何本？", () => renderGenericNumber({
                title: "お茶の本数",
                formula: "18 − 6 ＝",
                expected: "12",
                unit: "本",
                success: "お茶は12本。18本を色分けして確かめよう。▽を押して続けよう。",
                hint: "全部18本からジュース6本を引こう。"
            }), true),
            makeStep("6本をジュース、残り12本をお茶に替えると、実際の買い方になる。", () => renderTwoTypeObjects({
                label: "5-1",
                title: "実際の18本",
                total: 18,
                firstCount: 6,
                firstLabel: "ジュース",
                secondLabel: "お茶",
                firstIcon: "J",
                secondIcon: "茶",
                note: "160×6＋120×12＝960＋1440＝2400円。"
            })),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["全部お茶＝2160円", "2400−2160＝240円", "160−120＝40円", "240÷40＝ジュース6本"],
                success: "全部を一方だと仮定して、差から本数を見つけられた。▽を押してまとめよう。",
                hint: "最初は18本全部をお茶にする。"
            }), true),
            makeStep("第5章でも、第4章で覚えた考え方が使えたね。", () => renderGenericSummary({
                label: "5-1の学び",
                points: ["18本全部をお茶だと仮定する", "実際との差240円を求める", "1本の差40円で割る"],
                formulas: ["120×18＝2160", "2400−2160＝240", "160−120＝40", "240÷40＝6"],
                answer: "ジュース6本　お茶12本"
            }))
        ];
    }

    function createLesson19Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。まだ式は考えなくて大丈夫だよ。", () => renderHypothesisProblem({
                label: "5-2",
                lines: [
                    "1個120gのおもりと1個230gのおもりを合わせて20個用意し、140gの箱に入れて重さをはかると、重さの合計は3530gでした。",
                    "このとき、120gのおもりは何個ですか。"
                ]
            }), true),
            makeStep("この3530gには、20個のおもりだけでなく箱140gも入っている。まず箱を分けて考えよう。", () => renderWeightBoxBoard({ stage: "start" })),
            makeStep("箱140gを取り除くと、おもりだけの重さはいくつ？", () => renderGenericNumber({
                title: "おもりだけの重さ",
                formula: "3530 − 140 ＝",
                expected: "3390",
                unit: "g",
                success: "おもり20個だけの重さは3390g。ここから仮説を作ろう。▽を押して続けよう。",
                hint: "全部の重さから箱140gを引こう。"
            }), true),
            makeStep("箱を先に外せた。ここから20個全部を軽い120gのおもりだと仮定する。", () => renderWeightBoxBoard({ stage: "removed" })),
            makeStep("20個全部が120gなら、重さは何g？", () => renderGenericNumber({
                title: "全部120gの世界",
                formula: "120 × 20 ＝",
                expected: "2400",
                unit: "g",
                success: "全部120gなら2400g。実際のおもりは3390gだ。▽を押して続けよう。",
                hint: "120gのおもりが20個あると考えよう。"
            }), true),
            makeStep("実際の3390gは、全部120gの2400gより何g重い？", () => renderGenericNumber({
                title: "実際との差",
                formula: "3390 − 2400 ＝",
                expected: "990",
                unit: "g",
                success: "実際は990g重い。この差は、120gが230gへ変わった分だ。▽を押して続けよう。",
                hint: "実際3390gから、仮説2400gを引こう。"
            }), true),
            makeStep("120gのおもり1個を230gへ替えると、何g重くなる？", () => renderGenericNumber({
                title: "1個変わるときの差",
                formula: "230 − 120 ＝",
                expected: "110",
                unit: "g",
                success: "1個替えるごとに110g重くなる。▽を押して続けよう。",
                hint: "230gと120gの差を求めよう。"
            }), true),
            makeStep("990gの差は、110gの変化が何個分かな？", () => renderGenericNumber({
                title: "230gのおもり",
                formula: "990 ÷ 110 ＝",
                expected: "9",
                unit: "個",
                success: "230gのおもりは9個。求めたいのは120gのおもりだ。▽を押して続けよう。",
                hint: "990gを、1個分の110gで分けよう。"
            }), true),
            makeStep("全部で20個、230gが9個。120gのおもりは何個？", () => renderGenericNumber({
                title: "120gのおもり",
                formula: "20 − 9 ＝",
                expected: "11",
                unit: "個",
                success: "120gのおもりは11個。色分けして確かめよう。▽を押して続けよう。",
                hint: "全部20個から、230gの9個を引こう。"
            }), true),
            makeStep("20個を色分けすると、230gが9個、120gが11個になる。", () => renderWeightBoxBoard({ stage: "answer" })),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["3530−140＝3390g", "全部120g＝2400g", "3390−2400＝990g", "990÷110＝230gが9個"],
                success: "箱を先に外し、その後は同じ仮説の流れで解けた。▽を押してまとめよう。",
                hint: "最初に箱140gを取り除こう。"
            }), true),
            makeStep("5-2では、仮説を立てる前に、問題に混ざった箱の重さを整理したことが大切だ。", () => renderGenericSummary({
                label: "5-2の学び",
                points: ["最初に箱140gを取り除く", "20個全部を120gだと仮定する", "差990gを1個の差110gで割る"],
                formulas: ["3530−140＝3390", "120×20＝2400", "3390−2400＝990", "990÷110＝9", "20−9＝11"],
                answer: "120gのおもり 11個"
            }))
        ];
    }


    function createLesson20Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。まだ式は考えなくて大丈夫だよ。", () => renderHypothesisProblem({
                label: "5-3",
                lines: [
                    "コインを投げて、表が出たら6点もらい、うらが出たら3点ひかれるゲームをします。",
                    "全部で20回ゲームをしたところ、得点が39点になりました。表が出たのは何回ですか。"
                ]
            }), true),
            makeStep("まず、20回全部うらだった世界を作ってみよう。", () => renderHypothesisBoard({
                label: "5-3",
                title: "コイン投げの得点",
                hypothesis: "20回全部うら",
                reality: "実際は39点",
                difference: "仮説と実際の差を見る",
                unitChange: "うら1回が表1回へ変わると9点増える",
                conclusion: "差が9点の何回分かを考える。"
            })),
            makeStep("20回全部うらなら、3点ずつひかれる。得点はいくつになる？", () => renderGenericNumber({
                title: "全部うらの世界",
                formula: "3 × 20 ＝",
                expected: "60",
                unit: "点ひかれる",
                success: "60点ひかれるので、全部うらなら−60点。実際は39点だ。▽を押して続けよう。",
                hint: "3点ひかれることを、−3点として20回分考えよう。"
            }), true),
            makeStep("全部うらの−60点から、実際の39点まで何点増えている？", () => renderGenericNumber({
                title: "仮説と実際の差",
                formula: "39 − (−60) ＝",
                expected: "99",
                unit: "点",
                success: "実際は99点高い。この99点は、うらが表へ変わった分だ。▽を押して続けよう。",
                hint: "−60点から39点までの差を考えよう。"
            }), true),
            makeStep("うら1回を表1回へ変えると、−3点から＋6点になる。何点増える？", () => renderGenericNumber({
                title: "1回変わるときの差",
                formula: "6 − (−3) ＝",
                expected: "9",
                unit: "点",
                success: "1回変わるごとに9点増える。▽を押して続けよう。",
                hint: "3点ひかれなくなり、さらに6点もらえるので、3＋6でも考えられる。"
            }), true),
            makeStep("99点の差は、9点の変化が何回分かな？", () => renderGenericNumber({
                title: "表が出た回数",
                formula: "99 ÷ 9 ＝",
                expected: "11",
                unit: "回",
                success: "表は11回。残り9回がうらだ。▽を押して続けよう。",
                hint: "99点を、1回分の9点で分けよう。"
            }), true),
            makeStep("表11回、うら9回で、本当に39点になるか確かめよう。", () => renderScoreCheckBoard({
                label: "5-3",
                first: "表 11回 × 6点＝66点",
                second: "うら 9回 × −3点＝−27点",
                total: "66−27＝39点",
                note: "問題の得点39点と一致する。"
            })),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["全部うら＝−60点", "39−(−60)＝99点", "表とうらの差＝9点", "99÷9＝表11回"],
                success: "全部うらの仮説から、表の回数を見つけられた。▽を押してまとめよう。",
                hint: "まず20回全部うらだった世界を作ろう。"
            }), true),
            makeStep("5-3も『全部一方だったら』と考えると、得点の増減を整理できる。", () => renderGenericSummary({
                label: "5-3の学び",
                points: ["20回全部うらだと仮定する", "実際の39点との差99点を求める", "うらが表へ変わると1回9点増える"],
                formulas: ["−3×20＝−60", "39−(−60)＝99", "6−(−3)＝9", "99÷9＝11"],
                answer: "表が出た回数 11回"
            }))
        ];
    }

    function createLesson21Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。最初の持ち点も大切な条件だよ。", () => renderHypothesisProblem({
                label: "5-4",
                lines: [
                    "的に当たると5点もらえ、はずれると1点ひかれるゲームをします。",
                    "はじめの持ち点を10点として、このゲームを25回したところ、得点が81点になりました。",
                    "このとき、的に当たったのは何回ですか。"
                ]
            }), true),
            makeStep("まず、最後の81点から、はじめの持ち点10点を分けよう。ゲーム25回で増えた得点はいくつ？", () => renderGenericNumber({
                title: "ゲームで増えた得点",
                formula: "81 − 10 ＝",
                expected: "71",
                unit: "点",
                success: "ゲーム25回による増減は71点。ここから全部はずれの世界を作ろう。▽を押して続けよう。",
                hint: "最後の得点81点から、最初から持っていた10点を引こう。"
            }), true),
            makeStep("25回全部はずれだったと仮定すると、ゲームによる得点は何点？", () => renderGenericNumber({
                title: "全部はずれの世界",
                formula: "1 × 25 ＝",
                expected: "25",
                unit: "点ひかれる",
                success: "25点ひかれるので、全部はずれなら−25点。実際のゲーム分は71点だ。▽を押して続けよう。",
                hint: "1回につき1点ひかれるので、−1点が25回だ。"
            }), true),
            makeStep("仮説の−25点から、実際の71点まで何点増えている？", () => renderGenericNumber({
                title: "仮説と実際の差",
                formula: "71 − (−25) ＝",
                expected: "96",
                unit: "点",
                success: "実際は96点高い。この差は、はずれが当たりへ変わった分だ。▽を押して続けよう。",
                hint: "−25点から71点までの差を考えよう。"
            }), true),
            makeStep("はずれ1回を当たり1回へ変えると、−1点から＋5点になる。何点増える？", () => renderGenericNumber({
                title: "1回変わるときの差",
                formula: "5 − (−1) ＝",
                expected: "6",
                unit: "点",
                success: "1回変わるごとに6点増える。▽を押して続けよう。",
                hint: "1点ひかれなくなり、さらに5点もらえるので、1＋5でも考えられる。"
            }), true),
            makeStep("96点の差は、6点の変化が何回分かな？", () => renderGenericNumber({
                title: "的に当たった回数",
                formula: "96 ÷ 6 ＝",
                expected: "16",
                unit: "回",
                success: "当たりは16回。残り9回がはずれだ。▽を押して続けよう。",
                hint: "96点を、1回分の6点で分けよう。"
            }), true),
            makeStep("最初の10点も入れて、本当に81点になるか確かめよう。", () => renderScoreCheckBoard({
                label: "5-4",
                first: "当たり 16回 × 5点＝80点",
                second: "はずれ 9回 × −1点＝−9点",
                total: "10＋80−9＝81点",
                note: "問題の得点81点と一致する。"
            })),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["81−10＝ゲーム分71点", "全部はずれ＝−25点", "71−(−25)＝96点", "96÷6＝当たり16回"],
                success: "最初の持ち点を分けてから、全部はずれの仮説で解けた。▽を押してまとめよう。",
                hint: "最初に81点から持ち点10点を引こう。"
            }), true),
            makeStep("5-4では、仮説を作る前に『最初から持っていた10点』を分けたことが大切だ。", () => renderGenericSummary({
                label: "5-4の学び",
                points: ["最後の81点から持ち点10点を分ける", "25回全部はずれだと仮定する", "はずれが当たりへ変わると6点増える"],
                formulas: ["81−10＝71", "−1×25＝−25", "71−(−25)＝96", "96÷6＝16"],
                answer: "的に当たった回数 16回"
            }))
        ];
    }

    function createLesson22Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。道の『両側』と、木と木の間にできる『区間』に注目しよう。", () => renderHypothesisProblem({
                label: "6-1",
                lines: [
                    "240mの道の両側に、桜の木が8mおきに植えてあります。",
                    "桜の木は全部で何本植えてありますか。"
                ]
            }), true),
            makeStep("まず、区間と木の本数の関係を小さな図で見てみよう。1区間をはさむ木は何本あるかな？", () => renderRoadTreeBoard({ stage: "pattern-1" })),
            makeStep("1区間なら木は2本。では、2区間ならどうなる？", () => renderRoadTreeBoard({ stage: "pattern-2" })),
            makeStep("2区間なら木は3本。では、3区間なら？", () => renderRoadTreeBoard({ stage: "pattern-3" })),
            makeStep("1区間で2本、2区間で3本、3区間で4本。木の本数は、いつも区間数より1本多いね。", () => renderRoadTreeBoard({ stage: "rule" })),
            makeStep("それでは実際の240mの道を考えよう。240mを8mずつに分けると、いくつの区間ができる？", () => renderGenericNumber({
                title: "片側の区間数",
                formula: "240 ÷ 8 ＝",
                expected: "30",
                unit: "区間",
                success: "30区間だね。次は、その30区間をはさむ木の本数を考えよう。▽を押して続けよう。",
                hint: "道の長さ240mを、1区間8mで分けよう。"
            }), true),
            makeStep("8mの区間が30個続いている。区間数より木は1本多いから、片側には何本ある？", () => renderRoadTreeBoard({ stage: "thirty-intervals" })),
            makeStep("片側の木は何本になる？", () => renderGenericNumber({
                title: "片側の木の本数",
                formula: "30 ＋ 1 ＝",
                expected: "31",
                unit: "本",
                success: "片側は31本。けれど、問題には『道の両側』と書いてあったね。▽を押して続けよう。",
                hint: "木の本数は、区間数より1本多い。"
            }), true),
            makeStep("『道の両側』とは、同じ31本の並びが道路をはさんで2列あるということだ。", () => renderRoadTreeBoard({ stage: "both-sides" })),
            makeStep("片側31本が2列ある。桜の木は全部で何本？", () => renderGenericNumber({
                title: "両側の木の本数",
                formula: "31 × 2 ＝",
                expected: "62",
                unit: "本",
                success: "正解は62本。区間、片側、両側の順に考えられたね。▽を押して続けよう。",
                hint: "片側31本が、道路をはさんで2列ある。"
            }), true),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["240÷8＝30区間", "30＋1＝片側31本", "道の両側にも木がある", "31×2＝62本"],
                success: "区間→片側の本数→道の両側→全部の本数の順で考えられた。▽を押してまとめよう。",
                hint: "最初は片側の区間数を求め、その次に片側の木の本数を求めよう。"
            }), true),
            makeStep("6-1では、木が道のはしからはしまで並ぶので、木の本数は区間数より1本多くなる。", () => renderGenericSummary({
                label: "6-1の学び",
                points: ["1区間なら木2本、2区間なら木3本、3区間なら木4本", "240÷8で片側30区間、30＋1で片側31本", "同じ並びが道の両側にあるので、最後に2倍する"],
                formulas: ["240÷8＝30", "30＋1＝31", "31×2＝62"],
                answer: "桜の木は全部で62本"
            }))
        ];
    }

    function createLesson23Steps() {
        return [
            makeStep("まずは実際の問題文を読もう。これは、さっきの6-1の続きの問題だよ。", () => renderHypothesisProblem({
                label: "6-2",
                lines: [
                    "新しく20本の桜の木を増やして、両はしの木はそのままで、等しい間隔になるように植えかえることにしました。",
                    "何mおきに植えればよいですか。"
                ]
            }), true),
            makeStep("これは6-1の続きだよ。240mの道に8mおきで植えたとき、桜は両側合わせて62本だったね。", () => renderRoadTreeBoard({ stage: "recap-62" })),
            makeStep("その62本に、新しく20本を増やす。全部で何本になる？", () => renderGenericNumber({
                title: "増やしたあとの本数",
                formula: "62 ＋ 20 ＝",
                expected: "82",
                unit: "本",
                success: "両側合わせて82本。道路の両側に同じ本数ずつ植えるよ。▽を押して続けよう。",
                hint: "さっきの答え62本に、新しい20本を足そう。"
            }), true),
            makeStep("両側合わせて82本なので、片側には何本ある？", () => renderGenericNumber({
                title: "片側の本数",
                formula: "82 ÷ 2 ＝",
                expected: "41",
                unit: "本",
                success: "片側は41本。両はしの木はそのままだから、次は区間数を考えよう。▽を押して続けよう。",
                hint: "道路をはさんだ2列に、同じ本数ずつ植える。"
            }), true),
            makeStep("木が41本なら、その間にできる区間はいくつかな？ 6-1とは反対に、木の本数から1を引こう。", () => renderRoadTreeBoard({ stage: "replant" })),
            makeStep("片側41本なら、区間はいくつ？", () => renderGenericNumber({
                title: "植えかえ後の区間数",
                formula: "41 − 1 ＝",
                expected: "40",
                unit: "区間",
                success: "区間は40個。240mを40区間に等しく分けよう。▽を押して続けよう。",
                hint: "両端に木があるので、区間数は木の本数より1少ない。"
            }), true),
            makeStep("240mを40区間に等しく分けると、1区間は何m？", () => renderGenericNumber({
                title: "新しい間隔",
                formula: "240 ÷ 40 ＝",
                expected: "6",
                unit: "m",
                success: "6mおきに植えればよい。▽を押して続けよう。",
                hint: "道の長さ240mを、40区間で分けよう。"
            }), true),
            makeStep("6mおきなら、240÷6＝40区間。木は片側41本になり、両側で82本になるね。", () => renderRoadTreeBoard({ stage: "replant-answer" })),
            makeStep("最後に、考えた順番を並べよう。", () => renderGenericOrder({
                formulas: ["62＋20＝全部82本", "82÷2＝片側41本", "41−1＝40区間", "240÷40＝6m"],
                success: "6-1の答えを受け継ぎ、本数から区間数へ戻して新しい間隔を求められた。▽を押してまとめよう。",
                hint: "まず、もとの62本に20本を増やそう。"
            }), true),
            makeStep("6-2では、6-1で求めた62本から出発し、木の本数から区間数へ戻すときに1を引くことがポイントだ。", () => renderGenericSummary({
                label: "6-2の学び",
                points: ["6-1の答え62本に20本を増やして82本", "道の両側なので片側41本", "木41本なら40区間。240mを40区間に分ける"],
                formulas: ["62＋20＝82", "82÷2＝41", "41−1＝40", "240÷40＝6"],
                answer: "6mおきに植える"
            }))
        ];
    }


    function createLesson24Steps() {
        return [
            makeStep("まずは10-1の問題文を読もう。前半は図で意味をつかみ、後半は塾で使う公式につなげるよ。", () => renderSequenceProblem({
                label: "10-1",
                sequence: "2、8、14、20、26、32、……",
                ordinal: "30番目"
            }), true),
            makeStep("数と数の間を見よう。2から8、8から14へ、いくつずつ増えているかな？", () => renderSequenceBoard({ label: "10-1", values: [2, 8, 14, 20], difference: 6, stage: "difference" })),
            makeStep("1番目の2は、もう最初の場所にいる。1番目から2番目へ進むのは1回だね。", () => renderSequenceBoard({ label: "10-1", values: [2, 8, 14, 20], difference: 6, stage: "positions" })),
            makeStep("では、1番目から30番目まで『＋6』をする回数は何回かな？", () => renderGenericChoice({
                question: "30番目まで進む回数は？",
                choices: [{ value: "30", label: "30回" }, { value: "29", label: "29回" }],
                correct: "29",
                success: "そう。最初の2を1番目として置いているので、進むのは30−1＝29回だ。▽を押して続けよう。",
                hint: "1番目から2番目は1回、1番目から3番目は2回。順番より1回少ないよ。"
            }), true),
            makeStep("＋6を29回すると、最初の2からどれだけ増える？", () => renderGenericNumber({
                title: "増える全部の数",
                formula: "6 × 29 ＝",
                expected: "174",
                unit: "",
                success: "174増える。最後に、最初の数2を足そう。▽を押して続けよう。",
                hint: "増える数6を、29回分かけよう。"
            }), true),
            makeStep("最初の2に174を足すと、30番目はいくつ？", () => renderGenericNumber({
                title: "30番目の数",
                formula: "2 ＋ 174 ＝",
                expected: "176",
                unit: "",
                success: "30番目は176。図で考えた理由がつながったね。▽を押して、公式にしよう。",
                hint: "最初の数2を忘れずに足そう。"
            }), true),
            makeStep("ここからは『公式で考えよう』。今の考え方は、毎回この形にまとめられる。", () => renderSequenceFormulaBoard({
                label: "10-1", first: 2, difference: 6, ordinal: 30, expression: "2＋6×（30−1）＝176", stage: "formula"
            })),
            makeStep("公式のどこに何を入れたか、順番に確かめよう。", () => renderSequenceFormulaBoard({
                label: "10-1", first: 2, difference: 6, ordinal: 30, expression: "2＋6×29＝176", stage: "substitute"
            })),
            makeStep("最後に、理解から公式までの順番を並べよう。", () => renderGenericOrder({
                formulas: ["数の差は6", "30番目まで進むのは30−1＝29回", "6×29＝174", "2＋174＝176"],
                success: "図で理解したことが、2＋6×（30−1）という公式になった。▽を押してまとめよう。",
                hint: "最初に増え方を見つけ、次に進む回数を考えよう。"
            }), true),
            makeStep("10-1では、公式を先に暗記せず、『順番より1回少なく進む』ことから公式の意味を理解した。", () => renderGenericSummary({
                label: "10-1の学び",
                points: ["2、8、14…は6ずつ増える", "1番目から30番目へ進むのは29回", "最初の数＋増える数×（順番−1）で求められる"],
                formulas: ["6×29＝174", "2＋174＝176", "2＋6×（30−1）＝176"],
                answer: "30番目の数は176"
            }))
        ];
    }

    function createLesson25Steps() {
        return [
            makeStep("10-2を読もう。10-1と同じタイプだと見抜けるかがポイントだよ。", () => renderSequenceProblem({
                label: "10-2",
                sequence: "1、3、5、7、9、11、13、……",
                ordinal: "25番目"
            }), true),
            makeStep("まず増え方を確かめよう。この数列はいくつずつ増えている？", () => renderSequenceBoard({ label: "10-2", values: [1, 3, 5, 7, 9], difference: 2, stage: "difference" })),
            makeStep("この問題も『最初の数＋増える数×（順番−1）』に当てはまるね。3つの数字を整理しよう。", () => renderSequenceFormulaBoard({
                label: "10-2", first: 1, difference: 2, ordinal: 25, expression: "1＋2×（25−1）", stage: "identify"
            })),
            makeStep("25番目まで進む回数はいくつ？", () => renderGenericNumber({
                title: "進む回数",
                formula: "25 − 1 ＝",
                expected: "24",
                unit: "回",
                success: "24回。公式の（順番−1）の部分だね。▽を押して続けよう。",
                hint: "最初の1が1番目なので、進む回数は1つ少ない。"
            }), true),
            makeStep("公式に当てはめて計算しよう。25番目はいくつ？", () => renderGenericNumber({
                title: "25番目の数",
                formula: "1 ＋ 2 × 24 ＝",
                expected: "49",
                unit: "",
                success: "25番目は49。今回は公式を使って速く解けたね。▽を押して続けよう。",
                hint: "先に2×24＝48、それから最初の1を足そう。"
            }), true),
            makeStep("1、3、5、7…は奇数の並びでもある。でも、今回はどんな等間隔の数列にも使える公式で解いた。", () => renderSequenceFormulaBoard({
                label: "10-2", first: 1, difference: 2, ordinal: 25, expression: "1＋2×（25−1）＝49", stage: "answer"
            })),
            makeStep("公式で解く手順を並べよう。", () => renderGenericOrder({
                formulas: ["最初の数は1", "増える数は2", "順番−1は25−1＝24", "1＋2×24＝49"],
                success: "問題の形を見抜き、必要な数字を公式へ入れられた。▽を押してまとめよう。",
                hint: "最初の数、増える数、順番−1の順に整理しよう。"
            }), true),
            makeStep("10-2では、10-1で理解した公式を自分で使う練習をした。", () => renderGenericSummary({
                label: "10-2の学び",
                points: ["同じ差で増える数列だと見抜く", "最初の数・増える数・求める順番を探す", "順番−1を忘れず公式へ入れる"],
                formulas: ["25−1＝24", "1＋2×24＝49"],
                answer: "25番目の数は49"
            }))
        ];
    }

    function createLesson26Steps() {
        return [
            makeStep("10-3を読もう。99番目のように大きな順番でも、同じ公式で考えられるよ。", () => renderSequenceProblem({
                label: "10-3",
                sequence: "3、10、17、24、31、38、……",
                ordinal: "99番目"
            }), true),
            makeStep("まず何を探す？ 隣り合う数の差を調べよう。", () => renderSequenceBoard({ label: "10-3", values: [3, 10, 17, 24, 31], difference: 7, stage: "difference" })),
            makeStep("最初の数は3、増える数は7、求めるのは99番目。公式へ入れよう。", () => renderSequenceFormulaBoard({
                label: "10-3", first: 3, difference: 7, ordinal: 99, expression: "3＋7×（99−1）", stage: "identify"
            })),
            makeStep("99番目まで進む回数はいくつ？", () => renderGenericNumber({
                title: "進む回数",
                formula: "99 − 1 ＝",
                expected: "98",
                unit: "回",
                success: "98回。次は7×98を工夫して計算しよう。▽を押して続けよう。",
                hint: "求める順番から1を引こう。"
            }), true),
            makeStep("98は100−2と考えられる。7×98を工夫すると？", () => renderSequenceFormulaBoard({
                label: "10-3", first: 3, difference: 7, ordinal: 99, expression: "7×98＝7×100−7×2＝700−14＝686", stage: "calculation"
            })),
            makeStep("増えた分は686。最初の3を足すと99番目はいくつ？", () => renderGenericNumber({
                title: "99番目の数",
                formula: "3 ＋ 686 ＝",
                expected: "689",
                unit: "",
                success: "99番目は689。大きな順番でも、公式なら同じ流れで解けたね。▽を押して続けよう。",
                hint: "増えた686に、最初の数3を足そう。"
            }), true),
            makeStep("10-1から10-3まで、公式を使うときの共通手順を整理しよう。", () => renderSequenceFormulaBoard({
                label: "今回覚える技", first: "最初の数", difference: "増える数", ordinal: "順番", expression: "答え＝最初の数＋増える数×（順番−1）", stage: "master"
            })),
            makeStep("最後に、公式で考える手順を並べよう。", () => renderGenericOrder({
                formulas: ["最初の数3を見つける", "増える数7を見つける", "99−1＝98回", "3＋7×98＝689"],
                success: "理解してから公式を使い、大きな順番も速く求められた。▽を押してまとめよう。",
                hint: "最初の数と増える数を見つけてから、順番−1を使おう。"
            }), true),
            makeStep("公式は魔法の暗記ではなく、図で理解した『最初から何回進むか』を短く表したものだ。", () => renderGenericSummary({
                label: "10-1〜10-3 今回覚える技",
                points: ["最初の数を見つける", "いくつずつ増えるかを調べる", "求める順番より1回少なく進む", "公式へ当てはめて計算する"],
                formulas: ["答え＝最初の数＋増える数×（順番−1）", "3＋7×（99−1）＝689"],
                answer: "99番目の数は689"
            }))
        ];
    }


    function createLesson27Steps() {
        return [
            makeStep("11-1を読もう。10番台で覚えた公式を、この問題でも使える形だと見抜こう。", () => renderSequenceProblem({
                label: "11-1",
                sequence: "1、5、9、13、17、21、……",
                ordinal: "50番目"
            }), true),
            makeStep("まず隣り合う数の差を確かめよう。いくつずつ増えているかな？", () => renderSequenceBoard({
                label: "11-1", values: [1, 5, 9, 13, 17], difference: 4, stage: "difference"
            })),
            makeStep("この問題も同じ公式に当てはまる。最初の数、増える数、求める順番を整理しよう。", () => renderSequenceFormulaBoard({
                label: "11-1", first: 1, difference: 4, ordinal: 50, expression: "1＋4×（50−1）", stage: "identify"
            })),
            makeStep("50番目まで進む回数はいくつ？", () => renderGenericNumber({
                title: "進む回数",
                formula: "50 − 1 ＝",
                expected: "49",
                unit: "回",
                success: "49回。公式の（順番−1）の部分だ。▽を押して続けよう。",
                hint: "最初の1が1番目なので、進む回数は1つ少ない。"
            }), true),
            makeStep("公式に当てはめて、50番目の数を求めよう。", () => renderGenericNumber({
                title: "50番目の数",
                formula: "1 ＋ 4 × 49 ＝",
                expected: "197",
                unit: "",
                success: "50番目は197。同じ形だと見抜けば、公式で速く解ける。▽を押して続けよう。",
                hint: "4×49＝196。最後に最初の数1を足そう。"
            }), true),
            makeStep("解き方の順番を並べて、公式の使い方を確認しよう。", () => renderGenericOrder({
                formulas: ["最初の数は1", "増える数は4", "50−1＝49回", "1＋4×49＝197"],
                success: "必要な3つを見つけて、公式へ正しく入れられた。▽を押してまとめよう。",
                hint: "最初の数、増える数、順番−1の順に整理しよう。"
            }), true),
            makeStep("11-1では、問題の形を見抜いて、前に学んだ公式をそのまま使った。", () => renderGenericSummary({
                label: "11-1の学び",
                points: ["同じ差で増える数列だと見抜く", "最初の数1・増える数4・順番50を整理する", "順番より1少ない49回分を足す"],
                formulas: ["50−1＝49", "1＋4×49＝197"],
                answer: "50番目の数は197"
            }))
        ];
    }

    function createLesson28Steps() {
        return [
            makeStep("11-2を読もう。今度は、自分で公式に必要な3つを見つけよう。", () => renderSequenceProblem({
                label: "11-2",
                sequence: "1、6、11、16、21、26、……",
                ordinal: "40番目"
            }), true),
            makeStep("まず増える数を見つけよう。6−1と11−6を比べるとどうなる？", () => renderSequenceBoard({
                label: "11-2", values: [1, 6, 11, 16, 21], difference: 5, stage: "difference"
            })),
            makeStep("公式に入れる3つを確認しよう。最初の数は1、増える数は5、求めるのは40番目だ。", () => renderSequenceFormulaBoard({
                label: "11-2", first: 1, difference: 5, ordinal: 40, expression: "1＋5×（40−1）", stage: "identify"
            })),
            makeStep("40番目まで進む回数を求めよう。", () => renderGenericNumber({
                title: "進む回数",
                formula: "40 − 1 ＝",
                expected: "39",
                unit: "回",
                success: "39回。次は5を39回分足した大きさを考えよう。▽を押して続けよう。",
                hint: "順番から1を引こう。"
            }), true),
            makeStep("公式に当てはめると、40番目はいくつ？", () => renderGenericNumber({
                title: "40番目の数",
                formula: "1 ＋ 5 × 39 ＝",
                expected: "196",
                unit: "",
                success: "40番目は196。自分で3つの数字を見つけて解けたね。▽を押して続けよう。",
                hint: "5×39＝195。そこへ最初の数1を足そう。"
            }), true),
            makeStep("公式を使う手順を、もう一度自分の言葉で並べよう。", () => renderGenericOrder({
                formulas: ["最初の数1を見つける", "増える数5を見つける", "40−1＝39回", "1＋5×39＝196"],
                success: "問題を見て、公式に必要な数字を自分で選べた。▽を押してまとめよう。",
                hint: "数列の最初、隣り合う差、求める順番を見よう。"
            }), true),
            makeStep("11-2では、公式を教えてもらうだけでなく、必要な数字を自分で見つけて当てはめた。", () => renderGenericSummary({
                label: "11-2の学び",
                points: ["最初の数・増える数・順番を自分で探す", "進む回数は40−1＝39回", "公式を使って速く正確に求める"],
                formulas: ["1＋5×（40−1）", "1＋5×39＝196"],
                answer: "40番目の数は196"
            }))
        ];
    }

    function createLesson29Steps() {
        return [
            makeStep("11-3を読もう。今回は『何番目の数か』を求める、これまでとは逆向きの問題だ。", () => renderSequencePositionProblem({
                label: "11-3",
                sequence: "4、7、10、13、16、……",
                target: 85
            }), true),
            makeStep("まず増え方を確かめよう。この数列は1回進むごとにいくつ増える？", () => renderSequenceBoard({
                label: "11-3", values: [4, 7, 10, 13, 16], difference: 3, stage: "positions"
            })),
            makeStep("最初の4から85まで、全部でいくつ増えたかを考えよう。", () => renderGenericNumber({
                title: "最初から増えた数",
                formula: "85 − 4 ＝",
                expected: "81",
                unit: "",
                success: "81増えた。次に、＋3が何回分あるかを求めよう。▽を押して続けよう。",
                hint: "求めたい85から、最初の数4を引こう。"
            }), true),
            makeStep("81の中に、1回分の増え方3はいくつある？", () => renderGenericNumber({
                title: "進んだ回数",
                formula: "81 ÷ 3 ＝",
                expected: "27",
                unit: "回",
                success: "27回進んだ。でも、最初の4はすでに1番目だったね。▽を押して続けよう。",
                hint: "全部の増えた数81を、1回分の3で分けよう。"
            }), true),
            makeStep("最初の4が1番目なので、27回進んだ先は何番目？", () => renderGenericNumber({
                title: "85の順番",
                formula: "27 ＋ 1 ＝",
                expected: "28",
                unit: "番目",
                success: "85は28番目。進んだ回数に、最初の1番目を足すんだ。▽を押して公式にしよう。",
                hint: "進んだ回数27に、最初の位置1を足そう。"
            }), true),
            makeStep("ここからは『公式で考えよう』。何番目かを求めるときは、今の逆算をこの形にまとめられる。", () => renderSequencePositionFormulaBoard({
                label: "11-3",
                target: 85,
                first: 4,
                difference: 3,
                expression: "（85−4）÷3＋1＝28"
            })),
            makeStep("もとの公式へ85を入れて考えても、同じ答えになる。", () => renderSequenceReverseEquationBoard({
                label: "11-3",
                expressionLines: ["85＝4＋3×（順番−1）", "85−4＝3×（順番−1）", "81÷3＝順番−1", "27＋1＝28番目"]
            })),
            makeStep("逆向きの問題を解く順番を並べよう。", () => renderGenericOrder({
                formulas: ["85−4＝81", "81÷3＝27回", "最初の4は1番目", "27＋1＝28番目"],
                success: "最初の数を引き、増える数で割り、最後に1を足す流れがつながった。▽を押してまとめよう。",
                hint: "まず最初の数を引いて、何回進んだかを求めよう。"
            }), true),
            makeStep("11-3では、数を求める公式を逆向きに使って、『何番目か』を求めた。", () => renderGenericSummary({
                label: "11-1〜11-3 今回覚える技",
                points: ["ある順番の数は、最初の数＋増える数×（順番−1）", "何番目かは、最初の数を引いて増える数で割る", "最後に、最初の1番目を足す"],
                formulas: ["数＝最初の数＋増える数×（順番−1）", "順番＝（その数−最初の数）÷増える数＋1", "（85−4）÷3＋1＝28"],
                answer: "85は28番目"
            }))
        ];
    }

    const lessonFactories = {
        1: createLesson1Steps,
        2: createLesson2Steps,
        3: createLesson3Steps,
        4: createLesson4Steps,
        5: createLesson5Steps,
        6: createLesson6Steps,
        7: createLesson7Steps,
        8: createLesson8Steps,
        9: createLesson9Steps,
        10: createLesson10Steps,
        11: createLesson11Steps,
        12: createLesson12Steps,
        13: createLesson13Steps,
        14: createLesson14Steps,
        15: createLesson15Steps,
        16: createLesson16Steps,
        17: createLesson17Steps,
        18: createLesson18Steps,
        19: createLesson19Steps,
        20: createLesson20Steps,
        21: createLesson21Steps,
        22: createLesson22Steps,
        23: createLesson23Steps,
        24: createLesson24Steps,
        25: createLesson25Steps,
        26: createLesson26Steps,
        27: createLesson27Steps,
        28: createLesson28Steps,
        29: createLesson29Steps
    };

    function init() {
        if (initialized) return;
        initialized = true;

        bind("learningDialogue", "click", advance);
        bind("learningDialogue", "keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                advance();
            }
        });
        bind("learningBackStep", "click", goBack);
        bind("learningRestart", "click", restart);
        bind("learningOpenMemo", "click", openMemo);
        bind("learningMemoClose", "click", closeMemo);
        bind("learningMemoUndo", "click", undoMemo);
        bind("learningMemoClear", "click", clearMemo);

        setupCanvas();
        window.addEventListener("resize", scheduleCanvasResize);
    }

    function open() {
        init();
        syncLearningPlayer();
        closeMemo();
        showLessonSelect();
        updateLearningExitButton();
        if (window.QuestMusicPlayer && typeof window.QuestMusicPlayer.playLearningForest === "function") {
            window.QuestMusicPlayer.playLearningForest();
        }
    }

    function close() {
        closeMemo();
        if (window.QuestMusicPlayer && typeof window.QuestMusicPlayer.stop === "function") {
            window.QuestMusicPlayer.stop();
        }
    }

    function renderStep() {
        const step = currentSteps[currentStep];
        const text = document.getElementById("learningText");
        const mark = document.getElementById("learningNextMark");
        const dialogue = document.getElementById("learningDialogue");
        const back = document.getElementById("learningBackStep");
        const restartButton = document.getElementById("learningRestart");
        const isFinal = currentStep === currentSteps.length - 1;

        if (text) text.textContent = step.text;
        if (mark) {
            mark.hidden = Boolean(step.interactive);
            mark.textContent = isFinal ? "問題一覧へ" : "▼";
            mark.classList.toggle("is-finish", isFinal);
        }
        if (dialogue) dialogue.classList.toggle("is-locked", Boolean(step.interactive));
        if (back) back.disabled = currentStep === 0;
        if (restartButton) restartButton.disabled = false;

        step.board();
    }

    function advance() {
        if (!selectedLesson) return;
        if (currentSteps[currentStep].interactive) return;
        if (currentStep >= currentSteps.length - 1) {
            showLessonSelect();
            return;
        }
        currentStep += 1;
        renderStep();
    }

    function completeInteractiveStep(message) {
        const text = document.getElementById("learningText");
        const mark = document.getElementById("learningNextMark");
        const dialogue = document.getElementById("learningDialogue");

        currentSteps[currentStep].interactive = false;
        if (text && message) text.textContent = message;
        if (mark) mark.hidden = false;
        if (dialogue) dialogue.classList.remove("is-locked");
    }

    function goBack() {
        if (!selectedLesson || currentStep <= 0) return;
        restoreInteractiveFlags();
        currentStep -= 1;
        renderStep();
    }

    function restart() {
        if (!selectedLesson) {
            showLessonSelect();
            return;
        }
        restoreInteractiveFlags();
        currentStep = 0;
        clearMemo();
        renderStep();
    }

    function restoreInteractiveFlags() {
        currentSteps.forEach((step) => {
            step.interactive = Boolean(step.initiallyInteractive);
        });
    }


    function showLessonSelect() {
        selectedLesson = null;
        currentStep = 0;
        restoreInteractiveFlags();
        closeMemo();

        const text = document.getElementById("learningText");
        const mark = document.getElementById("learningNextMark");
        const dialogue = document.getElementById("learningDialogue");
        const back = document.getElementById("learningBackStep");
        const restartButton = document.getElementById("learningRestart");

        if (text) text.textContent = "夏期講習プリントの実装済み問題から、学び直したい番号を選ぼう。6-2の次は10-1だ。テキストと同じ番号だから迷わず見直せるぞ。";
        if (mark) {
            mark.hidden = true;
            mark.textContent = "▼";
            mark.classList.remove("is-finish");
        }
        if (dialogue) dialogue.classList.add("is-locked");
        if (back) back.disabled = true;
        if (restartButton) restartButton.disabled = true;

        renderLessonSelect();
        updateLearningExitButton();
    }

    function startLesson(number) {
        const lesson = lessonCatalog.find((item) => item.number === number);
        if (!lesson || !lesson.ready) {
            const text = document.getElementById("learningText");
            if (text) text.textContent = `${getLessonLabel(number)}「${lesson?.title || "この問題"}」は、ただいま詳しい解説を準備中だ。1-1から学び直してみよう。`;
            return;
        }

        selectedLesson = lesson;
        updateLearningExitButton();
        currentSteps = lessonFactories[number]();
        currentStep = 0;
        clearMemo();
        restoreInteractiveFlags();
        renderStep();
    }

    function renderLessonSelect() {
        const state = getState();
        const completed = new Set(Array.isArray(state.completedLessons) ? state.completedLessons : []);
        const groups = [...new Set(lessonCatalog.map((lesson) => lesson.group))];

        setBoard(`
            <section class="lesson-select" aria-label="夏期講習プリント問題一覧">
                <header class="lesson-select-header">
                    <span>SUMMER COURSE REVIEW</span>
                    <h2>算数の学び直し　実装済み26問</h2>
                    <p>プリントと同じ番号を選んでください</p>
                </header>
                <div class="lesson-group-list">
                    ${groups.map((group) => `
                        <div class="lesson-group">
                            <p class="lesson-group-title">大問 ${group}</p>
                            <div class="lesson-number-grid">
                                ${lessonCatalog.filter((lesson) => lesson.group === group).map((lesson) => {
                                    const done = lesson.id && completed.has(lesson.id);
                                    return `
                                        <button
                                            type="button"
                                            class="lesson-number-button ${lesson.ready ? "is-ready" : "is-preparing"} ${done ? "is-complete" : ""}"
                                            data-lesson-number="${lesson.number}"
                                            aria-label="${lesson.label} ${lesson.title}${lesson.ready ? "" : " 準備中"}">
                                            <strong>${lesson.label}</strong>
                                            <span class="lesson-button-title">${lesson.title}</span>
                                            <em>${done ? "✓" : lesson.ready ? "▶" : "…"}</em>
                                        </button>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </section>
        `);

        board().querySelectorAll("[data-lesson-number]").forEach((button) => {
            button.addEventListener("click", () => startLesson(Number(button.dataset.lessonNumber)));
        });
    }

    function renderWelcome() {
        setBoard(`
            <div class="learning-board-title">
                <span>LEARNING FOREST</span>
                <h2>算数の広場</h2>
                <p>分からなかった場所は、学び直しの入口。</p>
            </div>
        `);
    }

    function renderProblem(showAnswer) {
        setBoard(`
            <article class="learning-problem-card">
                <p class="learning-problem-label">1-1の問題</p>
                <p>兄は弟より <strong>180円多く</strong> 持っています。</p>
                <p>2人の持っているお金を合わせると <strong>1700円</strong> です。</p>
                <p>2人はそれぞれいくら持っていますか。</p>
                ${showAnswer ? '<p class="learning-answer">兄 940円　弟 760円</p>' : ''}
            </article>
        `);
    }

    function renderTapeDiagram(stage) {
        const showOlder = stage === "older";
        setBoard(`
            <div class="tape-lesson">
                <div class="tape-row">
                    <span class="tape-name">弟</span>
                    <div class="tape same-part"><span>まだ分からない同じ分</span></div>
                </div>
                <div class="tape-row ${showOlder ? "animate-row" : "is-muted"}">
                    <span class="tape-name">兄</span>
                    <div class="tape same-part"><span>弟と同じ分</span></div>
                    ${showOlder ? '<div class="tape extra-part pop-extra"><span>＋180円</span></div>' : ''}
                </div>
                ${showOlder ? '<div class="tape-brace"><span>2人合わせて 1700円</span></div>' : ''}
            </div>
        `);
    }

    function renderFirstChoice() {
        setBoard(`
            <div class="learning-check-card">
                <p>最初に取り除くものはどれ？</p>
                <div class="learning-choice-grid">
                    <button type="button" data-choice="1700">1700円</button>
                    <button type="button" data-choice="180">多い180円</button>
                    <button type="button" data-choice="2">2人</button>
                </div>
                <p class="learning-feedback" aria-live="polite"></p>
            </div>
        `);
        board().querySelectorAll("[data-choice]").forEach((button) => {
            button.addEventListener("click", () => {
                const feedback = board().querySelector(".learning-feedback");
                if (button.dataset.choice === "180") {
                    button.classList.add("correct");
                    completeInteractiveStep("そうだ。違っている180円を先に外せば、同じ長さが2本になる。▽を押して続けよう。");
                } else {
                    button.classList.add("wrong");
                    if (feedback) feedback.textContent = "同じ長さを2本にするには、兄だけが多く持つ部分を探そう。";
                }
            });
        });
    }

    function renderDragExercise() {
        setBoard(`
            <div class="drag-lesson">
                <p class="drag-instruction">黄色の180円を、下の「外す」場所まで動かそう</p>
                <div class="drag-equation">
                    <span>1700円</span><span>−</span>
                    <button class="drag-token" type="button" aria-label="180円を動かす">180円</button>
                    <span>＝</span><strong>1520円</strong>
                </div>
                <div class="drag-drop-zone">ここへ外す</div>
                <p class="learning-feedback" aria-live="polite"></p>
            </div>
        `);

        const token = board().querySelector(".drag-token");
        const zone = board().querySelector(".drag-drop-zone");
        if (!token || !zone) return;

        let dragging = false;
        let startX = 0;
        let startY = 0;

        token.addEventListener("pointerdown", (event) => {
            dragging = true;
            startX = event.clientX;
            startY = event.clientY;
            token.setPointerCapture(event.pointerId);
            token.classList.add("dragging");
        });
        token.addEventListener("pointermove", (event) => {
            if (!dragging) return;
            token.style.transform = `translate(${event.clientX - startX}px, ${event.clientY - startY}px) scale(1.05)`;
        });
        token.addEventListener("pointerup", (event) => {
            if (!dragging) return;
            dragging = false;
            token.releasePointerCapture(event.pointerId);
            const pointX = event.clientX;
            const pointY = event.clientY;
            const rect = zone.getBoundingClientRect();
            const inside = pointX >= rect.left && pointX <= rect.right && pointY >= rect.top && pointY <= rect.bottom;
            if (inside) {
                token.style.transform = "";
                token.classList.remove("dragging");
                token.classList.add("dropped");
                zone.classList.add("accepted");
                zone.textContent = "180円を外した！";
                completeInteractiveStep("1700−180＝1520。これで弟と同じ分が2本だけ残った。▽を押して続けよう。");
            } else {
                token.style.transform = "";
                token.classList.remove("dragging");
                const feedback = board().querySelector(".learning-feedback");
                if (feedback) feedback.textContent = "黄色の札を、点線の枠の中まで運んでみよう。";
            }
        });
    }

    function renderNumberExercise(kind) {
        const younger = kind === "younger";
        const expected = younger ? "760" : "940";
        const formula = younger ? "1520 ÷ 2 ＝" : "760 ＋ 180 ＝";
        setBoard(`
            <div class="number-lesson">
                <p>${younger ? "弟の金額を求めよう" : "兄の金額を求めよう"}</p>
                <div class="number-formula"><span>${formula}</span><strong class="number-display">＿</strong><span>円</span></div>
                <div class="learning-numberpad">
                    ${[1,2,3,4,5,6,7,8,9,"消す",0,"決定"].map((value) => `<button type="button" data-number="${value}">${value}</button>`).join("")}
                </div>
                <p class="learning-feedback" aria-live="polite"></p>
            </div>
        `);

        let value = "";
        const display = board().querySelector(".number-display");
        const feedback = board().querySelector(".learning-feedback");
        board().querySelectorAll("[data-number]").forEach((button) => {
            button.addEventListener("click", () => {
                const key = button.dataset.number;
                if (key === "消す") value = value.slice(0, -1);
                else if (key === "決定") {
                    if (value === expected) {
                        display.textContent = value;
                        display.classList.add("correct-answer");
                        completeInteractiveStep(`${younger ? "弟は760円。" : "兄は940円。"} 計算の意味までしっかりつながった。▽を押して続けよう。`);
                    } else {
                        if (feedback) feedback.textContent = younger ? "1520円は同じ2本分。2で等しく分けよう。" : "弟の760円に、多い180円を戻そう。";
                    }
                    return;
                } else if (value.length < 5) value += key;
                display.textContent = value || "＿";
            });
        });
    }

    function renderOrderExercise() {
        setBoard(`
            <div class="order-lesson">
                <p>式を上から順に並べよう</p>
                <div class="order-slots">
                    <button type="button" data-slot="0">① ここへ置く</button>
                    <button type="button" data-slot="1">② ここへ置く</button>
                    <button type="button" data-slot="2">③ ここへ置く</button>
                </div>
                <div class="order-cards">
                    <button type="button" data-order="2">760＋180＝940</button>
                    <button type="button" data-order="0">1700−180＝1520</button>
                    <button type="button" data-order="1">1520÷2＝760</button>
                </div>
                <p class="learning-feedback" aria-live="polite"></p>
            </div>
        `);

        const selected = [];
        const slots = [...board().querySelectorAll("[data-slot]")];
        const cards = [...board().querySelectorAll("[data-order]")];
        cards.forEach((card) => {
            card.addEventListener("click", () => {
                if (card.disabled || selected.length >= 3) return;
                selected.push(Number(card.dataset.order));
                const slot = slots[selected.length - 1];
                slot.textContent = card.textContent;
                slot.classList.add("filled");
                card.disabled = true;
                if (selected.length === 3) {
                    const good = selected.every((value, index) => value === index);
                    const feedback = board().querySelector(".learning-feedback");
                    if (good) {
                        slots.forEach((item) => item.classList.add("correct"));
                        const dailyBonus = saveCompletion();
                        completeInteractiveStep(dailyBonus
                            ? `全部つながった。学びの森デイリーボーナス ${dailyBonus}GPを獲得！ ▽を押して、今日の学びをまとめよう。`
                            : "全部つながった。▽を押して、今日の学びをまとめよう。");
                    } else {
                        if (feedback) feedback.textContent = "順番をもう一度考えよう。まず『違う180円』を外すところからだ。";
                        window.setTimeout(() => renderOrderExercise(), 900);
                    }
                }
            });
        });
    }

    function renderSummary() {
        const completed = selectedLesson?.id && getState().completedLessons?.includes(selectedLesson.id);
        setBoard(`
            <div class="learning-summary-card">
                <p class="learning-summary-label">1-1の学び</p>
                <ol>
                    <li><strong>違っている分</strong>の180円を先に外す</li>
                    <li>残った1520円を<strong>同じ2本</strong>に分ける</li>
                    <li>多い方へ180円を戻す</li>
                </ol>
                <div class="learning-summary-formulas">
                    <span>1700−180＝1520</span>
                    <span>1520÷2＝760</span>
                    <span>760＋180＝940</span>
                </div>
                <p class="learning-summary-answer">兄 940円　弟 760円</p>
                <p class="learning-complete-mark">${completed ? "✓ 学び直し完了" : "最後まで取り組みました"}</p>
            </div>
        `);
    }

    function renderLesson2Problem() {
        setBoard(`
            <article class="learning-problem-card">
                <p class="learning-problem-label">1-2の問題</p>
                <p>1000円を兄・姉・妹の3人で分けます。</p>
                <p>兄は妹の <strong>2倍</strong>、姉は妹より <strong>80円多く</strong> もらいました。</p>
                <p>3人はそれぞれ何円もらいましたか。</p>
            </article>
        `);
    }

    function renderLesson2Diagram(stage) {
        const brother = stage === "brother" || stage === "all";
        const all = stage === "all";
        setBoard(`
            <div class="relation-diagram relation-three">
                <div class="relation-row"><span>妹</span><div class="unit-tape">1本分</div></div>
                ${brother ? '<div class="relation-row pop-row"><span>兄</span><div class="unit-tape">1本</div><div class="unit-tape">1本</div><b>＝2倍</b></div>' : ''}
                ${all ? '<div class="relation-row pop-row"><span>姉</span><div class="unit-tape">1本分</div><div class="extra-chip">＋80円</div></div>' : ''}
                ${all ? '<p class="relation-total">合計1000円 ＝ 同じ4本分 ＋ 80円</p>' : ''}
            </div>
        `);
    }

    function renderLesson2Choice() {
        renderGenericChoice({
            question: "最初に取り除くものはどれ？",
            choices: [{ value: "1000", label: "合計1000円" }, { value: "80", label: "余分な80円" }, { value: "4", label: "同じ4本" }],
            correct: "80",
            success: "そうだ。姉だけが多い80円を外せば、同じ長さ4本分になる。▽を押して続けよう。",
            hint: "兄・姉・妹を、同じ長さのテープだけにそろえるには何を外すか考えよう。"
        });
    }

    function renderLesson2Summary() {
        renderGenericSummary({
            label: "1-2の学び",
            points: ["姉だけが多い80円を先に外す", "残った920円を同じ4本に分ける", "1本分230円から兄と姉の金額を作る"],
            formulas: ["1000−80＝920", "920÷4＝230", "230×2＝460", "230＋80＝310"],
            answer: "兄 460円　姉 310円　妹 230円"
        });
    }

    function renderLesson3Problem() {
        setBoard(`
            <article class="learning-problem-card">
                <p class="learning-problem-label">1-3の問題</p>
                <p>姉は妹より <strong>500円多く</strong> 持っています。</p>
                <p>姉は妹の <strong>3倍より100円少ない</strong> そうです。</p>
                <p>2人はそれぞれ何円持っていますか。</p>
            </article>
        `);
    }

    function renderLesson3Diagram(stage) {
        if (stage === "difference") {
            setBoard(`
                <div class="lesson3-tape-board is-difference">
                    <div class="lesson3-line">
                        <span class="lesson3-label">妹</span>
                        <div class="lesson3-red-unit">妹の1本分</div>
                    </div>
                    <div class="lesson3-line pop-row">
                        <span class="lesson3-label">姉</span>
                        <div class="lesson3-red-unit">妹と同じ1本分</div>
                        <div class="lesson3-money-block money-500">＋500円</div>
                    </div>
                </div>
            `);
            return;
        }

        setBoard(`
            <div class="lesson3-tape-board is-before-add">
                <div class="lesson3-line">
                    <span class="lesson3-label">妹</span>
                    <div class="lesson3-red-unit">妹の1本分</div>
                </div>
                <div class="lesson3-line pop-row">
                    <span class="lesson3-label">姉</span>
                    <div class="lesson3-red-unit">妹と同じ1本分</div>
                    <div class="lesson3-money-block money-500">＋500円</div>
                    <div class="lesson3-money-block money-100 is-empty">ここに＋100円</div>
                </div>
                <p class="lesson3-equation-note">姉 ＋ 100円 ＝ 妹の3本分</p>
            </div>
        `);
    }

    function renderLesson3Drag() {
        setBoard(`
            <div class="lesson3-drag-board">
                <p class="drag-instruction">黄色の100円を、500円の右隣へ足そう</p>
                <div class="lesson3-line lesson3-drag-line">
                    <span class="lesson3-label">姉</span>
                    <div class="lesson3-red-unit">妹の1本分</div>
                    <div class="lesson3-money-block money-500">＋500円</div>
                    <div class="lesson3-money-block money-100 lesson3-return-zone">ここへ足す</div>
                </div>
                <button class="drag-token" type="button">＋100円</button>
                <p class="learning-feedback" aria-live="polite"></p>
            </div>
        `);
        setupPointerDrag(board().querySelector('.drag-token'), board().querySelector('.lesson3-return-zone'), () => {
            renderLesson3AlignedDiagram();
            completeInteractiveStep("ぴったりそろった。500円と100円の真下に、妹の赤い2本分が現れた。▽を押して、同じ大きさを確かめよう。");
        }, "黄色の100円を、500円のすぐ右にある点線の枠まで運んでみよう。");
    }

    function lesson3AlignedMarkup() {
        return `
            <div class="lesson3-aligned-wrap">
                <div class="lesson3-aligned-grid" aria-label="500円と100円が妹2本分に対応する図">
                    <span class="lesson3-grid-label top-label">姉＋100</span>
                    <div class="lesson3-red-unit grid-base">妹1本分</div>
                    <div class="lesson3-money-block money-500 grid-500">＋500円</div>
                    <div class="lesson3-money-block money-100 grid-100">＋100円</div>

                    <span class="lesson3-grid-label bottom-label">同じ長さ</span>
                    <div class="lesson3-base-guide" aria-hidden="true"></div>
                    <div class="lesson3-two-units">
                        <div class="lesson3-red-unit compact">妹1本分</div>
                        <div class="lesson3-red-unit compact">妹1本分</div>
                    </div>
                    <div class="lesson3-two-unit-caption">ここは 妹の2本分</div>
                </div>
                <p class="lesson3-discovery">500円＋100円 ＝ 妹の2本分</p>
            </div>
        `;
    }

    function renderLesson3AlignedDiagram() {
        setBoard(lesson3AlignedMarkup());
    }

    function renderLesson3Summary() {
        renderGenericSummary({
            label: "1-3の学び",
            points: ["妹の分を赤い1本で表す", "500円＋100円の真下に、同じ大きさの妹2本分をそろえる", "600円を2で割って妹を求め、500円を足して姉を求める"],
            formulas: ["500＋100＝600", "600円＝妹2本分", "600÷2＝300", "300＋500＝800"],
            answer: "姉 800円　妹 300円"
        });
    }


    function renderLesson4Problem() {
        setBoard(`
            <article class="learning-problem-card lesson4-problem-card">
                <p class="learning-problem-label">1-4の問題（原文）</p>
                <p>同じかさだけ水が入る3つの容器A、B、Cを用意し、バケツに入った16Lの水を全部3つの容器へ移しました。</p>
                <p>Aは満タン、Bは容器の <strong>1/4</strong>、Cは容器の <strong>3/4</strong> まで水が入りました。</p>
                <p>容器1つには何Lの水が入りますか。</p>
            </article>
        `);
    }

    function renderLesson4Containers(stage) {
        const question = stage === "question";
        const finalState = stage === "final" || question;
        setBoard(`
            <div class="lesson4-container-board ${question ? "is-question" : ""}">
                <p class="lesson4-board-caption">${stage === "equal" ? "満タンまで入る量は、3つとも同じ" : "全部移し終えたあとの状態"}</p>
                <div class="lesson4-container-row">
                    ${lesson4ContainerMarkup("A", finalState ? 1 : 0, finalState ? "満タン＝4/4" : "同じ大きさ")}
                    ${lesson4ContainerMarkup("B", finalState ? .25 : 0, finalState ? "1/4" : "同じ大きさ")}
                    ${lesson4ContainerMarkup("C", finalState ? .75 : 0, finalState ? "3/4" : "同じ大きさ")}
                </div>
                ${stage === "equal" ? '<div class="lesson4-equal-signs">A ＝ B ＝ C　<span>入る水の量が同じ</span></div>' : ''}
                ${question ? '<div class="lesson4-question-bubble">なぜBは1/4で止めたの？<br>まだ入るのに、なぜCへ？</div>' : ''}
                ${stage === "final" ? '<p class="lesson4-final-note">順番は書かれていない。使うのは、この最後の状態。</p>' : ''}
            </div>
        `);
    }

    function lesson4ContainerMarkup(label, fill, note) {
        const percent = Math.round(fill * 100);
        return `
            <div class="lesson4-vessel-wrap">
                <strong>${label}</strong>
                <div class="lesson4-vessel" aria-label="容器${label} ${note}">
                    <div class="lesson4-water" style="height:${percent}%"></div>
                    <div class="lesson4-quarter-line q1"></div>
                    <div class="lesson4-quarter-line q2"></div>
                    <div class="lesson4-quarter-line q3"></div>
                </div>
                <span>${note}</span>
            </div>
        `;
    }

    function renderLesson4Fractions() {
        setBoard(`
            <div class="lesson4-fraction-board">
                <div class="lesson4-fraction-cards">
                    <div><b>A</b><span class="fraction-stack"><strong>4</strong><i></i><strong>4</strong></span><small>満タン</small></div>
                    <span>＋</span>
                    <div><b>B</b><span class="fraction-stack"><strong>1</strong><i></i><strong>4</strong></span><small>4分の1</small></div>
                    <span>＋</span>
                    <div><b>C</b><span class="fraction-stack"><strong>3</strong><i></i><strong>4</strong></span><small>4分の3</small></div>
                </div>
                <p>満タンは「4つに分けたうちの4つ分」だから、4/4と表せる。</p>
            </div>
        `);
    }

    function renderLesson4FractionCheck() {
        renderGenericChoice({
            question: "4＋1＋3はいくつ？",
            choices: [{ value: "6", label: "6" }, { value: "8", label: "8" }, { value: "12", label: "12" }],
            correct: "8",
            success: "そうだ。4/4＋1/4＋3/4＝8/4。これは容器2個分だ。▽を押して続けよう。",
            hint: "分母の4はそのままにして、分子の4・1・3を足そう。"
        });
    }

    function renderLesson4Summary() {
        renderGenericSummary({
            label: "1-4の学び",
            points: ["最初に問題文を原文のまま読む", "『同じかさだけ入る』を『満タンまで入る量が同じ』へ翻訳する", "順番は書かれていないので、最後の状態だけを使う", "4/4＋1/4＋3/4＝8/4＝容器2個分と考える"],
            formulas: ["4/4＋1/4＋3/4＝8/4", "8/4＝容器2個分", "16÷2＝8"],
            answer: "容器1つには 8L 入る"
        });
    }

    function renderLesson5Problem() {
        setBoard(`
            <article class="learning-problem-card lesson5-problem-card">
                <p class="learning-problem-label">2-1の問題（原文）</p>
                <p>1枚50円のはがきと、1枚80円の切手を同じ枚数ずつ買ったら、はがきと切手の代金の差は420円になりました。</p>
                <p>はがきは何枚買いましたか。</p>
            </article>
        `);
    }

    function renderLesson5Keywords(reveal) {
        setBoard(`
            <div class="lesson5-keyword-board ${reveal ? "is-revealed" : ""}">
                <p class="lesson5-keyword-line">1枚50円のはがきと、1枚80円の切手を
                    <mark>同じ枚数ずつ買った</mark>
                </p>
                <p class="lesson5-keyword-line">代金の差は <strong>420円</strong></p>
                ${reveal ? `
                    <div class="lesson5-reaction-points">
                        <span>反応する言葉①<br><b>同じ枚数ずつ</b></span>
                        <span>反応する言葉②<br><b>1枚ごとの差</b></span>
                    </div>
                ` : '<p class="lesson5-search-note">数字だけでなく、数字を結びつける言葉を探そう</p>'}
            </div>
        `);
    }

    function renderLesson5PriceChoice() {
        renderGenericChoice({
            question: "1枚ずつ買ったときの、代金の差はいくら？",
            choices: [
                { value: "30", label: "80−50＝30円" },
                { value: "130", label: "80＋50＝130円" },
                { value: "420", label: "420円" }
            ],
            correct: "30",
            success: "そうだ。切手は、はがきより1枚につき30円高い。▽を押して続けよう。",
            hint: "『差』なので、80円と50円を引いて比べよう。"
        });
    }

    function renderLesson5DifferenceGrowth() {
        setBoard(`
            <div class="lesson5-growth-board">
                <div class="lesson5-growth-row"><b>1枚ずつ</b><span>50円</span><span>80円</span><strong>差 30円</strong></div>
                <div class="lesson5-growth-row"><b>2枚ずつ</b><span>100円</span><span>160円</span><strong>差 60円</strong></div>
                <div class="lesson5-growth-row"><b>3枚ずつ</b><span>150円</span><span>240円</span><strong>差 90円</strong></div>
                <div class="lesson5-growth-arrow">1枚増えるたびに、差も30円ずつ増える</div>
            </div>
        `);
    }

    function renderLesson5UnknownCount() {
        setBoard(`
            <div class="lesson5-count-board">
                <div class="lesson5-difference-strip">
                    <span>30円</span><span>30円</span><span>30円</span><span>…</span><span>30円</span>
                </div>
                <div class="lesson5-total-brace">全部合わせた差 ＝ 420円</div>
                <p>30円の差が、何回分ある？</p>
                <strong>420 ÷ 30</strong>
            </div>
        `);
    }

    function renderLesson5Summary() {
        renderGenericSummary({
            label: "2-1の学び",
            points: [
                "問題文は最初に原文のまま読む",
                "『同じ枚数ずつ』という言葉に反応する",
                "80−50＝30で、1枚あたりの値段の差を求める",
                "420円の中に30円の差が何回あるかを考える"
            ],
            formulas: ["80−50＝30", "420÷30＝14"],
            answer: "はがきは 14枚 買った"
        });
    }

    function renderLesson6Problem() {
        setBoard(`
            <article class="learning-problem-card lesson6-problem-card">
                <p class="learning-problem-label">2-2の問題（原文）</p>
                <p>1個300円のケーキを何個か買うつもりでお店に行きましたが、実際には1個250円のケーキを何個か買いました。</p>
                <p>代金は予定と同じ金額で、予定していた個数よりも2個多く買えました。</p>
                <p>はじめ、300円のケーキを何個買うつもりでお店に行きましたか。</p>
            </article>
        `);
    }

    function renderLesson6SameTotal(reveal) {
        setBoard(`
            <div class="lesson6-same-total ${reveal ? "is-revealed" : ""}">
                <div class="lesson6-plan-box"><small>予定</small><b>300円 × いくつか</b></div>
                <span class="lesson6-equals">＝</span>
                <div class="lesson6-plan-box"><small>実際</small><b>250円 × いくつか</b></div>
                <p>${reveal ? "個数は違っても、代金の合計は同じ" : "『代金は予定と同じ金額』を絵にすると……"}</p>
            </div>
        `);
    }

    function renderLesson6Unknowns() {
        setBoard(`
            <div class="lesson6-unknown-board">
                <span>300円 × <b>いくつか</b></span>
                <span>250円 × <b>いくつか</b></span>
                <p>分からない数から、無理に考え始めなくていい</p>
            </div>
        `);
    }

    function renderLesson6TwoExtra() {
        setBoard(`
            <div class="lesson6-two-extra">
                <p>はっきり分かるところ</p>
                <div class="lesson6-cakes"><span>250円</span><span>250円</span></div>
                <strong>予定より 2個 多く買えた</strong>
                <small>この2個分なら、金額を出せる</small>
            </div>
        `);
    }

    function renderLesson6SavingBridge() {
        setBoard(`
            <div class="lesson6-saving-bridge">
                <div><small>予定の1個</small><b>300円</b></div>
                <span>→</span>
                <div><small>実際の1個</small><b>250円</b></div>
                <p>安く買った分を全部集めると <strong>500円</strong> の余裕</p>
            </div>
        `);
    }

    function renderLesson6UnitDifferenceChoice() {
        renderGenericChoice({
            question: "ケーキ1個につき、いくら安く買えた？",
            choices: [
                { value: "50", label: "300−250＝50円" },
                { value: "250", label: "250円" },
                { value: "550", label: "300＋250＝550円" }
            ],
            correct: "50",
            success: "そう。1個買うたびに50円ずつ余裕ができる。▽を押して続けよう。",
            hint: "予定の300円と、実際の250円の差を求めよう。"
        });
    }

    function renderLesson6SavingsStack() {
        setBoard(`
            <div class="lesson6-savings-stack">
                <div class="lesson6-saving-chips"><span>50円</span><span>50円</span><span>50円</span><span>…</span><span>50円</span></div>
                <div class="lesson6-saving-total">積み重なった余裕 ＝ 500円</div>
                <p>1個につき50円安い × 最初に買う予定だった個数</p>
            </div>
        `);
    }

    function renderLesson6Summary() {
        renderGenericSummary({
            label: "2-2の学び",
            points: [
                "問題文は最初に原文のまま読む",
                "『代金は予定と同じ』から、予定と実際の合計金額が等しいと読む",
                "分からない『いくつか』は後回しにし、はっきり分かる2個分から考える",
                "1個ごとの50円の余裕が何回集まって500円になったかを考える"
            ],
            formulas: ["250×2＝500", "300−250＝50", "500÷50＝10"],
            answer: "はじめは 10個 買うつもりだった"
        });
    }

    function renderLesson7Problem() {
        setBoard(`
            <article class="learning-problem-card lesson7-problem-card">
                <h3>問題</h3>
                <p>あきらくんは1本100円のえん筆を何本か、ゆかさんは1本80円のえん筆を何本か買いました。</p>
                <p>あきらくんは、ゆかさんより9本少なく買いましたが、代金はゆかさんより220円高くなりました。</p>
                <p>あきらくんは、えん筆を何本買いましたか。</p>
            </article>
        `);
    }

    function renderLesson7UnitDifference() {
        setBoard(`
            <div class="lesson7-unit-board">
                <div><small>あきら</small><b>1本 100円</b></div>
                <span>−</span>
                <div><small>ゆか</small><b>1本 80円</b></div>
                <strong>＝ 20円</strong>
                <p>2人が1本ずつ買うたびに、あきらくんの代金が20円ずつ多くなる</p>
            </div>
        `);
    }

    function renderLesson7CountState(mode) {
        const yukaAhead = mode === "yuka-ahead";
        setBoard(`
            <div class="lesson7-state-board ${yukaAhead ? "is-yuka-ahead" : ""}">
                <div class="lesson7-person-row">
                    <b>あきら</b><span class="lesson7-pencil-count">11本</span><strong>1100円</strong>
                </div>
                <div class="lesson7-person-row">
                    <b>ゆか</b><span class="lesson7-pencil-count">${yukaAhead ? "20本" : "11本"}</span><strong>${yukaAhead ? "1600円" : "880円"}</strong>
                </div>
                ${yukaAhead ? `<div class="lesson7-nine-extra">ゆかさんだけ ＋9本（720円）</div><p>1600−1100＝500円<br><b>今は、ゆかさんが500円高い</b></p>` : `<p>1100−880＝220円<br><b>あきらくんが220円高い</b></p>`}
            </div>
        `);
    }

    function renderLesson7KeepGap() {
        setBoard(`
            <div class="lesson7-gap-board">
                <div class="lesson7-gap-pair"><span>あきら 11本</span><span>ゆか 20本</span><b>9本差</b></div>
                <div class="lesson7-down-arrow">↓ 2人とも1本ずつ増やす</div>
                <div class="lesson7-gap-pair"><span>あきら 12本</span><span>ゆか 21本</span><b>9本差のまま</b></div>
                <p>本数の差は変わらず、代金の差だけが1回につき20円ずつ動く</p>
            </div>
        `);
    }

    function renderLesson7Turnaround() {
        setBoard(`
            <div class="lesson7-turn-board">
                <div class="lesson7-side yuka">ゆかが高い<br><b>500円</b></div>
                <div class="lesson7-turn-line"><span>500円</span><i></i><span>220円</span></div>
                <div class="lesson7-side akira">あきらが高い<br><b>220円</b></div>
                <strong>500 ＋ 220 ＝ 720円</strong>
                <p>720円分の差を、20円ずつひっくり返す</p>
            </div>
        `);
    }

    function renderLesson7ShortcutIntro() {
        setBoard(`
            <div class="lesson7-shortcut-title">
                <small>第2段階</small>
                <h3>早く解ける方法</h3>
                <p>ゆっくり理解した道筋を、短い式にまとめてみよう</p>
            </div>
        `);
    }

    function renderLesson7Shortcut(stage) {
        const extra = stage === "extra" || stage === "turn" || stage === "formula";
        const turn = stage === "turn" || stage === "formula";
        const formula = stage === "formula";
        setBoard(`
            <div class="lesson7-shortcut-board">
                <div class="lesson7-shortcut-step ${extra ? "is-active" : ""}"><span>ゆかさんのほうが9本多い</span><b>80 × 9 ＝ 720円</b><small>ゆかさんが多い分</small></div>
                <div class="lesson7-shortcut-arrow">↓</div>
                <div class="lesson7-shortcut-step ${turn ? "is-active" : ""}"><span>720円分をひっくり返し、さらに220円進む</span><b>720 ＋ 220 ＝ 940円</b><small>あきらくんが作った差</small></div>
                <div class="lesson7-shortcut-arrow">↓</div>
                <div class="lesson7-shortcut-step ${formula ? "is-active" : ""}"><span>1回の差は20円</span><b>940 ÷ 20 ＝ 47</b><small>答え 47本</small></div>
            </div>
        `);
    }

    function renderLesson7Summary() {
        renderGenericSummary({
            label: "2-3の学び",
            points: [
                "まず原文を読み、『1本ごとの差』『9本多い』『220円高い』に反応する",
                "じっくり考えるときは、220÷20＝11から場面を一つずつ動かす",
                "2人とも同じ本数ずつ増やせば、9本差は変わらない",
                "近道は、ゆかさんの多い720円分と最後の220円を合わせて考える",
                "近道は、理解してから使うと一番力になる"
            ],
            formulas: ["220÷20＝11", "80×9＝720", "720÷20＝36", "11＋36＝47", "近道：940÷20＝47"],
            answer: "あきらくんは 47本 買った"
        });
    }

    function renderLesson8Problem() {
        setBoard(`
            <article class="learning-problem-card lesson8-problem-card">
                <h3>問題</h3>
                <p>あめが1ふくろに6個ずつ入っています。</p>
                <p>これを1ふくろに4個ずつにして入れると、6ふくろ多くできます。</p>
                <p>あめは全部で何個ありますか。</p>
            </article>
        `);
    }

    function renderLesson8FinalBags(reveal) {
        setBoard(`
            <div class="lesson8-final-board ${reveal ? "is-revealed" : ""}">
                <div class="lesson8-bag-row">
                    ${Array.from({ length: 6 }, (_, index) => `<span class="lesson8-bag"><b>4個</b><small>増えた袋${index + 1}</small></span>`).join("")}
                </div>
                <strong>6袋 × 4個 ＝ ${reveal ? "24個" : "？個"}</strong>
                <p>${reveal ? "最後には、24個分の余裕が生まれた" : "最後に増えた6袋には、何個入っている？"}</p>
            </div>
        `);
    }

    function renderLesson8Repacking(reveal) {
        setBoard(`
            <div class="lesson8-repack-board ${reveal ? "is-revealed" : ""}">
                <div class="lesson8-repack-step"><small>もとの1袋</small><b>● ● ● ● ● ●</b><strong>6個</strong></div>
                <div class="lesson8-repack-arrow">→ 詰め替える →</div>
                <div class="lesson8-repack-step"><small>新しい1袋</small><b>● ● ● ●</b><strong>4個</strong></div>
                <div class="lesson8-spare"><small>1回で生まれる余裕</small><b>${reveal ? "● ●" : "？"}</b><strong>${reveal ? "2個" : "6−4"}</strong></div>
                <p>${reveal ? "袋を1つ詰め替えるたびに、2個ずつ余裕が生まれる" : "6個から4個にすると、いくつ余る？"}</p>
            </div>
        `);
    }

    function renderLesson8OriginalBags() {
        setBoard(`
            <div class="lesson8-original-board">
                <strong>24 ÷ 2 ＝ 12回</strong>
                <div class="lesson8-original-arrow">↓</div>
                <div class="lesson8-original-bags">${Array.from({ length: 12 }, () => `<span>6個</span>`).join("")}</div>
                <p>12回詰め替えた ＝ もともとは6個入りが12袋</p>
            </div>
        `);
    }

    function renderLesson8ShortcutIntro() {
        setBoard(`
            <div class="lesson8-shortcut-title">
                <small>第2段階</small>
                <h3>効率のよい式</h3>
                <p>ゆっくり考えた道筋を、式だけで短く表そう</p>
            </div>
        `);
    }

    function renderLesson8Shortcut(stage) {
        const stages = ["unit", "extra", "count", "answer"];
        const activeIndex = stages.indexOf(stage);
        const rows = [
            ["1回の詰め替えで生まれる余裕", "6 − 4 ＝ 2"],
            ["増えた6袋に入ったあめ", "4 × 6 ＝ 24"],
            ["もとの袋の数", "24 ÷ 2 ＝ 12"],
            ["あめの全部の数", "12 × 6 ＝ 72"]
        ];
        setBoard(`
            <div class="lesson8-shortcut-board">
                ${rows.map((row, index) => `<div class="lesson8-shortcut-step ${index <= activeIndex ? "is-active" : ""}"><span>${row[0]}</span><b>${row[1]}</b></div>${index < rows.length - 1 ? '<div class="lesson8-shortcut-arrow">↓</div>' : ''}`).join("")}
            </div>
        `);
    }

    function renderLesson8Summary() {
        renderGenericSummary({
            label: "2-4の学び",
            points: [
                "まず問題文を原文のまま読み、『6ふくろ多くできた』に反応する",
                "増えた6袋は、4×6＝24個分の余裕を表す",
                "6個入りを4個入りにすると、1回につき2個の余裕が生まれる",
                "24÷2＝12から、もとの袋は12袋だと分かる",
                "式は、ゆっくり考えた道筋を短く表したもの"
            ],
            formulas: ["6−4＝2", "4×6＝24", "24÷2＝12", "12×6＝72"],
            answer: "あめは全部で 72個"
        });
    }

    function renderGenericChoice({ question, choices, correct, success, hint }) {
        setBoard(`<div class="learning-check-card"><p>${question}</p><div class="learning-choice-grid">${choices.map((choice) => `<button type="button" data-choice="${choice.value}">${choice.label}</button>`).join("")}</div><p class="learning-feedback" aria-live="polite"></p></div>`);
        board().querySelectorAll('[data-choice]').forEach((button) => {
            button.addEventListener('click', () => {
                const feedback = board().querySelector('.learning-feedback');
                if (button.dataset.choice === correct) {
                    button.classList.add('correct');
                    completeInteractiveStep(success);
                } else {
                    button.classList.add('wrong');
                    if (feedback) feedback.textContent = hint;
                }
            });
        });
    }

    function renderGenericDrag({ total, token, result, success }) {
        setBoard(`<div class="drag-lesson"><p class="drag-instruction">黄色の${token}円を、下の「外す」場所まで動かそう</p><div class="drag-equation"><span>${total}円</span><span>−</span><button class="drag-token" type="button">${token}円</button><span>＝</span><strong>${result}円</strong></div><div class="drag-drop-zone">ここへ外す</div><p class="learning-feedback" aria-live="polite"></p></div>`);
        setupPointerDrag(board().querySelector('.drag-token'), board().querySelector('.drag-drop-zone'), () => {
            const zone = board().querySelector('.drag-drop-zone');
            zone.textContent = `${token}円を外した！`;
            zone.classList.add('accepted');
            completeInteractiveStep(success);
        }, `黄色の${token}円を、点線の枠の中まで運んでみよう。`);
    }

    function setupPointerDrag(token, zone, onSuccess, hint) {
        if (!token || !zone) return;
        let dragging = false;
        let startX = 0;
        let startY = 0;
        token.addEventListener('pointerdown', (event) => {
            dragging = true; startX = event.clientX; startY = event.clientY;
            token.setPointerCapture(event.pointerId); token.classList.add('dragging');
        });
        token.addEventListener('pointermove', (event) => {
            if (!dragging) return;
            token.style.transform = `translate(${event.clientX - startX}px, ${event.clientY - startY}px) scale(1.05)`;
        });
        token.addEventListener('pointerup', (event) => {
            if (!dragging) return;
            dragging = false;
            try { token.releasePointerCapture(event.pointerId); } catch (_) {}
            const rect = zone.getBoundingClientRect();
            const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
            token.style.transform = ''; token.classList.remove('dragging');
            if (inside) { token.classList.add('dropped'); onSuccess(); }
            else { const feedback = board().querySelector('.learning-feedback'); if (feedback) feedback.textContent = hint; }
        });
    }

    function renderGenericNumber({ title, formula, expected, success, hint, unit = "円" }) {
        setBoard(`<div class="number-lesson"><p>${title}</p><div class="number-formula"><span>${formula}</span><strong class="number-display">＿</strong><span>${unit}</span></div><div class="learning-numberpad">${[1,2,3,4,5,6,7,8,9,"消す",0,"決定"].map((value) => `<button type="button" data-number="${value}">${value}</button>`).join("")}</div><p class="learning-feedback" aria-live="polite"></p></div>`);
        let value = '';
        const display = board().querySelector('.number-display');
        const feedback = board().querySelector('.learning-feedback');
        board().querySelectorAll('[data-number]').forEach((button) => button.addEventListener('click', () => {
            const key = button.dataset.number;
            if (key === '消す') value = value.slice(0, -1);
            else if (key === '決定') {
                if (value === expected) { display.textContent = value; display.classList.add('correct-answer'); completeInteractiveStep(success); }
                else if (feedback) feedback.textContent = hint;
                return;
            } else if (value.length < 6) value += key;
            display.textContent = value || '＿';
        }));
    }

    function renderGenericOrder({ formulas, success, hint }) {
        const shuffled = formulas.map((formula, index) => ({ formula, index })).sort(() => Math.random() - .5);
        setBoard(`<div class="order-lesson order-four"><p>式を上から順に並べよう</p><div class="order-slots">${formulas.map((_, index) => `<button type="button" data-slot="${index}">${index + 1} ここへ置く</button>`).join('')}</div><div class="order-cards">${shuffled.map((item) => `<button type="button" data-order="${item.index}">${item.formula}</button>`).join('')}</div><p class="learning-feedback" aria-live="polite"></p></div>`);
        const selected = [];
        const slots = [...board().querySelectorAll('[data-slot]')];
        board().querySelectorAll('[data-order]').forEach((card) => card.addEventListener('click', () => {
            if (card.disabled || selected.length >= formulas.length) return;
            selected.push(Number(card.dataset.order));
            const slot = slots[selected.length - 1]; slot.textContent = card.textContent; slot.classList.add('filled'); card.disabled = true;
            if (selected.length === formulas.length) {
                const good = selected.every((value, index) => value === index);
                const feedback = board().querySelector('.learning-feedback');
                if (good) { slots.forEach((item) => item.classList.add('correct')); const dailyBonus = saveCompletion(); completeInteractiveStep(dailyBonus ? `${success} 学びの森デイリーボーナス ${dailyBonus}GPを獲得！` : success); }
                else { if (feedback) feedback.textContent = hint; window.setTimeout(() => renderGenericOrder({ formulas, success, hint }), 900); }
            }
        }));
    }


    function renderScoreCheckBoard({ label, first, second, total, note }) {
        setBoard(`
            <section class="hypothesis-board">
                <header><small>${label}</small><h3>答えを確かめよう</h3></header>
                <div class="hypothesis-flow">
                    <div><span>当たり・表</span><b>${first}</b></div>
                    <div><span>はずれ・うら</span><b>${second}</b></div>
                    <div><span>合計</span><b>${total}</b></div>
                </div>
                <p>${note}</p>
            </section>
        `);
    }

    function renderRoadTreeBoard({ stage }) {
        const makeRow = ({ interval = "8m", count = 7, suffix = "" } = {}) => `
            <div style="display:flex;align-items:center;justify-content:center;gap:0;max-width:760px;margin:8px auto;">
                ${Array.from({ length: count }, (_, index) => `
                    <span style="display:flex;align-items:center;">
                        <b style="font-size:29px;line-height:1;">🌸</b>
                        ${index < count - 1 ? `<i style="display:inline-flex;align-items:center;justify-content:center;width:54px;border-top:4px solid #f1e4b5;font-style:normal;font-weight:800;font-size:14px;color:#fff;">${interval}</i>` : ""}
                    </span>
                `).join("")}
                ${suffix ? `<strong style="margin-left:12px;font-size:18px;color:#f6e7b7;">${suffix}</strong>` : ""}
            </div>`;

        const patternData = {
            "pattern-1": { count: 2, title: "1区間をはさむ木", note: "1区間　→　木2本" },
            "pattern-2": { count: 3, title: "2区間をはさむ木", note: "2区間　→　木3本" },
            "pattern-3": { count: 4, title: "3区間をはさむ木", note: "3区間　→　木4本" }
        };

        if (patternData[stage]) {
            const data = patternData[stage];
            setBoard(`
                <section class="hypothesis-board">
                    <header><small>6-1</small><h3>${data.title}</h3></header>
                    ${makeRow({ count: data.count })}
                    <div class="hypothesis-flow">
                        <div><span>区間</span><b>${data.count - 1}個</b></div>
                        <div><span>木</span><b>${data.count}本</b></div>
                    </div>
                    <p>${data.note}</p>
                </section>
            `);
            return;
        }

        if (stage === "rule") {
            setBoard(`
                <section class="hypothesis-board">
                    <header><small>6-1</small><h3>区間と木の本数のきまり</h3></header>
                    <div class="hypothesis-flow">
                        <div><span>1区間</span><b>木2本</b></div>
                        <div><span>2区間</span><b>木3本</b></div>
                        <div><span>3区間</span><b>木4本</b></div>
                    </div>
                    <p style="font-size:27px;font-weight:900;">木の本数 ＝ 区間数 ＋ 1</p>
                </section>
            `);
            return;
        }

        if (stage === "thirty-intervals") {
            setBoard(`
                <section class="hypothesis-board">
                    <header><small>6-1</small><h3>8mの区間が30個</h3></header>
                    ${makeRow({ suffix: "……240mまで続く" })}
                    <div class="hypothesis-flow">
                        <div><span>道の長さ</span><b>240m</b></div>
                        <div><span>間隔</span><b>8mおき</b></div>
                        <div><span>区間</span><b>30個</b></div>
                    </div>
                    <p>木の本数は区間数より1本多い。30＋1は？</p>
                </section>
            `);
            return;
        }

        if (stage === "both-sides" || stage === "recap-62") {
            const isRecap = stage === "recap-62";
            setBoard(`
                <section class="hypothesis-board">
                    <header><small>${isRecap ? "6-2" : "6-1"}</small><h3>${isRecap ? "6-1を振り返ろう" : "これが『道の両側』"}</h3></header>
                    ${makeRow({ suffix: "30区間・31本" })}
                    <div style="height:34px;display:flex;align-items:center;justify-content:center;margin:0 auto;color:#f7e8b6;font-weight:900;letter-spacing:8px;">道路　道路　道路　道路　道路</div>
                    ${makeRow({ suffix: "30区間・31本" })}
                    <div class="hypothesis-flow">
                        <div><span>片側</span><b>31本</b></div>
                        <div><span>もう片側</span><b>31本</b></div>
                        ${isRecap ? '<div><span>両側</span><b>62本</b></div>' : ""}
                    </div>
                    <p>${isRecap ? "240m・8mおきでは、両側合わせて62本だった。" : "同じ31本の並びが、道路をはさんで2列ある。"}</p>
                </section>
            `);
            return;
        }

        const replant = stage === "replant" || stage === "replant-answer";
        if (replant) {
            const answered = stage === "replant-answer";
            setBoard(`
                <section class="hypothesis-board">
                    <header><small>6-2</small><h3>${answered ? "6mおきに植えかえた並び" : "木41本の間にできる区間"}</h3></header>
                    ${makeRow({ interval: answered ? "6m" : "？m", suffix: answered ? "40区間・41本" : "41本" })}
                    <div class="hypothesis-flow">
                        <div><span>片側の木</span><b>41本</b></div>
                        <div><span>区間</span><b>${answered ? "40個" : "木より1少ない"}</b></div>
                        ${answered ? '<div><span>間隔</span><b>6mおき</b></div>' : ""}
                    </div>
                    <p>${answered ? "240m÷40区間＝6m" : "両はしに木があるので、区間数は41−1。"}</p>
                </section>
            `);
        }
    }


    function renderSequenceProblem({ label, sequence, ordinal }) {
        setBoard(`
            <article class="learning-problem-card">
                <p class="learning-problem-label">${label}の問題</p>
                <p><strong>${sequence}</strong>と、あるきまりにしたがって数がならんでいます。</p>
                <p>このとき、<strong>${ordinal}</strong>の数を求めなさい。</p>
                <button type="button" class="learning-confirm-button">問題を読んだ</button>
            </article>
        `);
        const button = board().querySelector('.learning-confirm-button');
        if (button) button.addEventListener('click', () => completeInteractiveStep('問題の条件を確認できた。▽を押して続けよう。'));
    }


    function renderSequencePositionProblem({ label, sequence, target }) {
        setBoard(`
            <article class="learning-problem-card">
                <p class="learning-problem-label">${label}の問題</p>
                <p><strong>${sequence}</strong>と、あるきまりにしたがって数がならんでいます。</p>
                <p>このとき、<strong>${target}は何番目の数ですか。</strong></p>
                <button type="button" class="learning-confirm-button">問題を読んだ</button>
            </article>
        `);
        const button = board().querySelector('.learning-confirm-button');
        if (button) button.addEventListener('click', () => completeInteractiveStep('今回は数ではなく、順番を求める問題だ。▽を押して続けよう。'));
    }

    function renderSequencePositionFormulaBoard({ label, target, first, difference, expression }) {
        setBoard(`
            <section class="hypothesis-board">
                <header><small>${label}</small><h3>何番目かの公式</h3></header>
                <p style="font-size:27px;font-weight:900;color:#fff7c2;margin:12px 0;">順番 ＝（その数 − 最初の数）÷ 増える数 ＋ 1</p>
                <div class="hypothesis-flow">
                    <div><span>その数</span><b>${target}</b></div>
                    <div><span>最初の数</span><b>${first}</b></div>
                    <div><span>増える数</span><b>${difference}</b></div>
                </div>
                <p style="font-size:31px;font-weight:900;color:#b9f5c8;margin-top:16px;">${expression}</p>
                <p>最初の数を引く → 増える数で割る → 最初の1番目を足す。</p>
            </section>
        `);
    }

    function renderSequenceReverseEquationBoard({ label, expressionLines }) {
        setBoard(`
            <section class="hypothesis-board">
                <header><small>${label}</small><h3>もとの公式を逆向きに考える</h3></header>
                <p style="font-size:24px;font-weight:900;color:#fff7c2;margin:10px 0;">数 ＝ 最初の数 ＋ 増える数 ×（順番 − 1）</p>
                <div style="display:grid;gap:8px;max-width:720px;margin:14px auto;">
                    ${expressionLines.map((line, index) => `<p style="font-size:${index === expressionLines.length - 1 ? '30px' : '25px'};font-weight:900;color:${index === expressionLines.length - 1 ? '#b9f5c8' : '#ffffff'};margin:0;">${line}</p>`).join('')}
                </div>
                <p>公式の意味が分かっていれば、逆向きの問題にも使える。</p>
            </section>
        `);
    }

    function renderSequenceBoard({ label, values, difference, stage }) {
        const arrows = values.slice(0, -1).map(() => `<span style="display:inline-flex;flex-direction:column;align-items:center;min-width:58px;"><small style="color:#ffe78a;font-weight:900;">＋${difference}</small><b style="font-size:25px;">→</b></span>`);
        const row = values.map((value, index) => `${index ? arrows[index - 1] : ''}<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;min-width:62px;"><b style="font-size:34px;color:#fff7c2;">${value}</b>${stage === 'positions' ? `<small style="color:#b9f5c8;">${index + 1}番目</small>` : ''}</span>`).join('');
        setBoard(`
            <section class="hypothesis-board">
                <header><small>${label}</small><h3>${stage === 'positions' ? '順番と進む回数' : '増え方を見つけよう'}</h3></header>
                <div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;margin:18px auto;">${row}</div>
                <div class="hypothesis-flow">
                    <div><span>1回進むごとに</span><b>＋${difference}</b></div>
                    ${stage === 'positions' ? '<div><span>1番目→4番目</span><b>3回進む</b></div>' : '<div><span>隣り合う数の差</span><b>いつも同じ</b></div>'}
                </div>
                <p>${stage === 'positions' ? '求める順番まで進む回数は、順番より1回少ない。' : `この数列は、毎回${difference}ずつ増える。`}</p>
            </section>
        `);
    }

    function renderSequenceFormulaBoard({ label, first, difference, ordinal, expression, stage }) {
        const title = stage === 'master' ? '公式で考えよう' : stage === 'calculation' ? 'かけ算を工夫しよう' : stage === 'answer' ? '公式で速く解けた' : '公式に当てはめよう';
        setBoard(`
            <section class="hypothesis-board">
                <header><small>${label}</small><h3>${title}</h3></header>
                <p style="font-size:28px;font-weight:900;color:#fff7c2;margin:12px 0;">答え ＝ 最初の数 ＋ 増える数 ×（順番 − 1）</p>
                <div class="hypothesis-flow">
                    <div><span>最初の数</span><b>${first}</b></div>
                    <div><span>増える数</span><b>${difference}</b></div>
                    <div><span>求める順番</span><b>${ordinal}</b></div>
                </div>
                <p style="font-size:${stage === 'calculation' ? '25px' : '31px'};font-weight:900;color:#b9f5c8;margin-top:16px;">${expression}</p>
                <p>${stage === 'master' ? '①最初の数　②増える数　③順番−1　④最初の数を足す' : '図で考えた「進む回数」を、（順番−1）で表している。'}</p>
            </section>
        `);
    }

    function renderGenericSummary({ label, points, formulas, answer }) {
        const completed = selectedLesson?.id && getState().completedLessons?.includes(selectedLesson.id);
        setBoard(`<div class="learning-summary-card"><p class="learning-summary-label">${label}</p><ol>${points.map((point) => `<li>${point}</li>`).join('')}</ol><div class="learning-summary-formulas">${formulas.map((formula) => `<span>${formula}</span>`).join('')}</div><p class="learning-summary-answer">${answer}</p><p class="learning-complete-mark">${completed ? '✓ 学び直し完了' : '最後まで取り組みました'}</p></div>`);
    }


    function renderLesson9Problem() {
        setBoard(`
            <article class="learning-problem-card lesson9-problem-card">
                <p class="learning-problem-label">3-1の問題</p>
                <p>折り紙を子どもたちに分けようと思います。</p>
                <p>1人に3枚ずつ分けようとすると6枚あまり、1人に4枚ずつ分けようとすると2枚足りません。</p>
                <p>子どもは何人いますか。</p>
            </article>
        `);
    }

    function renderLesson9Distribution(stage) {
        const cards = Array.from({ length: 8 }, (_, index) => {
            const extra = stage === "use-six" && index < 6;
            const short = stage === "short-two" && index >= 6;
            return `<span class="distribution-child ${extra ? "has-extra" : ""} ${short ? "is-short" : ""}"><small>子ども${index + 1}</small><b>● ● ●${extra ? " ●" : ""}${short ? " ＋？" : ""}</b></span>`;
        }).join("");
        const note = stage === "three"
            ? "3枚ずつ配ったあと、6枚余っている"
            : stage === "use-six"
                ? "余った6枚で、6人へ1枚ずつ追加できた"
                : "残り2人にも1枚ずつ必要なので、さらに2枚足りない";
        setBoard(`
            <div class="distribution-board lesson9-distribution">
                <div class="distribution-children">${cards}</div>
                <div class="distribution-stock">
                    <strong>${stage === "three" ? "余り 6枚" : stage === "use-six" ? "6枚を配った" : "さらに 2枚必要"}</strong>
                    <p>${note}</p>
                </div>
            </div>
        `);
    }

    function renderLesson9Check() {
        setBoard(`
            <div class="distribution-check-board">
                <div><small>3枚ずつ配る</small><b>3 × 8 ＋ 6</b><strong>＝30枚</strong></div>
                <span>＝</span>
                <div><small>4枚ずつ配る</small><b>4 × 8 − 2</b><strong>＝30枚</strong></div>
                <p>どちらも30枚。だから子ども8人で合っている。</p>
            </div>
        `);
    }

    function renderLesson9Shortcut(stage) {
        setBoard(`
            <div class="distribution-shortcut-board ${stage === "steps" ? "is-revealed" : ""}">
                <small>第2段階</small>
                <h3>効率のよい式</h3>
                <div><span>1人分の差</span><b>4 − 3 ＝ 1枚</b></div>
                <div><span>余りから不足まで</span><b>6 ＋ 2 ＝ 8枚</b></div>
                <strong>（6＋2）÷（4−3）＝8人</strong>
            </div>
        `);
    }

    function renderLesson9Summary() {
        renderGenericSummary({
            label: "3-1の学び",
            points: ["3枚から4枚へは、1人につき1枚増える", "余った6枚を使っても、さらに2枚必要なので6＋2", "全員へ1枚ずつ追加する8枚から、子どもは8人"],
            formulas: ["4−3＝1", "6＋2＝8", "8÷1＝8"],
            answer: "子どもは8人"
        });
    }

    function renderLesson10Problem() {
        setBoard(`
            <article class="learning-problem-card lesson10-problem-card">
                <p class="learning-problem-label">3-2の問題</p>
                <p>子ども会に集まった子どもたちにあめを配るのに、1人6個ずつにすると15個あまり、1人8個ずつにすると5個あまります。</p>
                <p>子どもは何人いますか。また、あめは何個ありますか。</p>
            </article>
        `);
    }

    function renderLesson10Distribution(stage) {
        const perChild = stage === "six" ? 6 : 8;
        const children = Array.from({ length: 5 }, (_, index) => `
            <span class="distribution-child ${stage === "difference" ? "has-extra" : ""}">
                <small>子ども${index + 1}</small>
                <b>${Array.from({ length: perChild }, () => "●").join(" ")}</b>
                ${stage === "difference" ? "<em>＋2個</em>" : ""}
            </span>
        `).join("");
        setBoard(`
            <div class="distribution-board lesson10-distribution">
                <div class="distribution-children">${children}</div>
                <div class="distribution-stock">
                    <strong>${stage === "six" ? "6個ずつ・余り15個" : "1人につき2個多く配る"}</strong>
                    <p>${stage === "difference" ? "5人へ2個ずつ多く配ると、余りは10個減る" : "全員へ6個ずつ配った場面"}</p>
                </div>
            </div>
        `);
    }

    function renderLesson10Check() {
        setBoard(`
            <div class="distribution-check-board">
                <div><small>6個ずつ配る</small><b>6 × 5 ＋ 15</b><strong>＝45個</strong></div>
                <span>＝</span>
                <div><small>8個ずつ配る</small><b>8 × 5 ＋ 5</b><strong>＝45個</strong></div>
                <p>どちらも45個。子どもは5人、あめは45個。</p>
            </div>
        `);
    }

    function renderLesson10Shortcut(stage) {
        setBoard(`
            <div class="distribution-shortcut-board ${stage === "steps" ? "is-revealed" : ""}">
                <small>第2段階</small>
                <h3>効率のよい式</h3>
                <div><span>余りの差</span><b>15 − 5 ＝ 10個</b></div>
                <div><span>1人分の差</span><b>8 − 6 ＝ 2個</b></div>
                <strong>（15−5）÷（8−6）＝5人</strong>
            </div>
        `);
    }

    function renderLesson10Summary() {
        renderGenericSummary({
            label: "3-2の学び",
            points: ["余り15個と余り5個の差は10個", "6個から8個へは、1人につき2個増える", "10÷2＝5人。6×5＋15＝45個"],
            formulas: ["15−5＝10", "8−6＝2", "10÷2＝5", "6×5＋15＝45"],
            answer: "子どもは5人　あめは45個"
        });
    }


    function renderStudyMethodTutorial() {
        setBoard(`
            <section class="study-method-tutorial">
                <header><small>LEARNING FOREST Ver.2</small><h3>勉強の仕方をレベルアップ</h3></header>
                <div class="study-color-rule is-yellow"><b>黄色＝板書</b><span>先生が黒板に書いたもの。必ずノートへ写す。</span></div>
                <div class="study-color-rule is-white"><b>白＝説明</b><span>あとで自分を助けると思った内容は、自分で選んで書く。</span></div>
                <div class="study-color-rule is-green"><b>緑＝ノートのコツ</b><span>1行空ける、縦をそろえる、単位を書くなどの学び方。</span></div>
                <button type="button" class="study-confirm-button">わかった！</button>
            </section>
        `);
        board().querySelector('.study-confirm-button')?.addEventListener('click', () => {
            const state = getState();
            state.studyMethodTutorialSeen = true;
            state.studyMethodTutorialSeenAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            completeInteractiveStep("これから黄色・白・緑を見分けながら、勉強の仕方を練習しよう。▽を押して続けよう。");
        });
    }

    function renderStudyMethodProblem(lesson) {
        const is11 = lesson === 11;
        setBoard(`
            <article class="learning-problem-card study-method-problem">
                <p class="learning-problem-label">${getLessonLabel(lesson)}の問題</p>
                <p>${is11 ? 'ノートを子どもたちに3冊ずつ配ると16冊余り、5冊ずつ配ると20冊足りません。' : 'クッキーを子どもたちに4個ずつ分けると9個余り、6個ずつ分けると5個足りません。'}</p>
                <p>${is11 ? '子どもは何人いますか。また、ノートは全部で何冊ありますか。' : '子どもは何人いますか。また、クッキーは全部で何個ありますか。'}</p>
                <div class="study-no-calculator">まだ計算しない　まず意味をつかむ</div>
            </article>
        `);
    }

    function renderUnderstandingCloze({ sentences, hint, success }) {
        setBoard(`
            <section class="understanding-cloze">
                <header><small>STEP 1</small><h3>問題の意味を言い換える</h3></header>
                <div class="cloze-sentences">
                    ${sentences.map((item, index) => `<label><span>${item.before}</span><select data-cloze="${index}"><option value="">選ぶ</option>${item.choices.map(choice => `<option value="${choice}">${choice}</option>`).join('')}</select></label>`).join('')}
                </div>
                <button type="button" class="cloze-submit">決定</button>
                <p class="learning-feedback" aria-live="polite"></p>
            </section>
        `);
        board().querySelector('.cloze-submit')?.addEventListener('click', () => {
            const selects = [...board().querySelectorAll('[data-cloze]')];
            const allCorrect = selects.every((select, index) => select.value === sentences[index].answer);
            selects.forEach((select, index) => select.classList.toggle('wrong', select.value !== sentences[index].answer));
            if (allCorrect) {
                selects.forEach(select => { select.classList.add('correct'); select.disabled = true; });
                completeInteractiveStep(success);
            } else {
                const feedback = board().querySelector('.learning-feedback');
                if (feedback) feedback.textContent = hint;
            }
        });
    }

    function renderNotebookPrompt({ title, lines, advice, detail }) {
        setBoard(`
            <section class="notebook-training">
                <header><small>NOTEBOOK TIME</small><h3>ノートへ書こう</h3></header>
                <div class="board-copy is-yellow"><b>${title}</b>${lines.map(line => `<span>${line}</span>`).join('')}</div>
                <div class="teacher-explanation is-white"><b>ギルドマスターの説明</b><span>${detail}</span></div>
                <div class="notebook-advice is-green"><b>ノートのコツ</b><span>${advice}</span></div>
                <button type="button" class="notebook-done-button">ノートに書いた</button>
            </section>
        `);
        board().querySelector('.notebook-done-button')?.addEventListener('click', () => {
            openMemo();
            completeInteractiveStep("書けたね。メモパッドを閉じたら、▽を押して次へ進もう。");
        });
    }

    function renderLesson12CookieFlow(stage) {
        const configs = {
            surplus: {
                title: "4個ずつ配ったあと",
                note: "手元に9個余っている",
                rows: [
                    { label: "子どもA", count: 4 },
                    { label: "子どもB", count: 4 },
                    { label: "子どもC", count: 4 }
                ],
                footer: "この9個は、みんなへ追加して配るために使える。"
            },
            five: {
                title: "まず1個ずつ足す",
                note: "1人5個ずつになる",
                rows: [
                    { label: "子どもA", count: 5, added: 1 },
                    { label: "子どもB", count: 5, added: 1 },
                    { label: "子どもC", count: 5, added: 1 }
                ],
                footer: "余っていた9個から、みんなへ1個ずつ配っている。"
            },
            "six-short": {
                title: "もう1個ずつ足す",
                note: "6個ずつにしたいが、途中でなくなる",
                rows: [
                    { label: "子どもA", count: 6, added: 2 },
                    { label: "子どもB", count: 6, added: 2 },
                    { label: "子どもC", count: 5, added: 1, short: true }
                ],
                footer: "全員を6個ずつにするには、あと5個必要だった。"
            },
            total: {
                title: "6個ずつにする追加分",
                note: "使えた9個 ＋ あと必要な5個",
                rows: [],
                footer: "9＋5＝14個"
            }
        };
        const config = configs[stage] || configs.surplus;
        const cookie = '<span class="lesson12-cookie" aria-hidden="true">●</span>';
        setBoard(`
            <section class="lesson12-cookie-flow">
                <header><small>THINK STEP BY STEP</small><h3>${config.title}</h3></header>
                <p class="lesson12-flow-note">${config.note}</p>
                ${config.rows.length ? `
                    <div class="lesson12-cookie-rows">
                        ${config.rows.map(row => `
                            <div class="lesson12-cookie-row${row.short ? ' is-short' : ''}">
                                <b>${row.label}</b>
                                <div>${Array.from({ length: row.count }, (_, index) => `<span class="lesson12-cookie${index >= 4 ? ' is-added' : ''}" aria-hidden="true">●</span>`).join('')}</div>
                                <span>${row.count}個${row.short ? '（あと1個）' : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="lesson12-total-flow">
                        <div><b>9個</b><span>実際に使えた分</span></div>
                        <strong>＋</strong>
                        <div><b>5個</b><span>あと必要だった分</span></div>
                    </div>
                `}
                <p class="lesson12-flow-footer">${config.footer}</p>
            </section>
        `);
    }

    function renderStudyDifferenceDiagram({ lesson }) {
        const is11 = lesson === 11;
        const left = is11 ? 16 : 9;
        const right = is11 ? 20 : 5;
        const total = left + right;
        const unit = is11 ? 2 : 2;
        setBoard(`
            <section class="study-difference-diagram">
                <header><small>DIAGRAM</small><h3>余りから不足までをつなぐ</h3></header>
                <div class="difference-track">
                    <div class="difference-part surplus"><b>${left}</b><span>余っている分</span></div>
                    <div class="difference-arrow">＋</div>
                    <div class="difference-part shortage"><b>${right}</b><span>さらに必要な分</span></div>
                </div>
                <div class="difference-total">全体の差　${left}＋${right}＝<strong>${total}${is11 ? '冊' : '個'}</strong></div>
                <div class="difference-unit">1人分の差　${is11 ? '5−3' : '6−4'}＝<strong>${unit}${is11 ? '冊' : '個'}</strong></div>
            </section>
        `);
    }

    function renderStudyVerification({ left, right, answer }) {
        setBoard(`
            <section class="study-verification">
                <header><small>CHECK</small><h3>答えを問題へ戻す</h3></header>
                <div><span>最初の条件</span><b>${left}＝${answer}</b></div>
                <div><span>もう一つの条件</span><b>${right}＝${answer}</b></div>
                <p>両方が同じ答えになるので、条件に合っている。</p>
            </section>
        `);
    }

    function renderStudyShortcut({ formula, notes }) {
        setBoard(`
            <section class="study-shortcut">
                <header><small>SHORT FORM</small><h3>効率のよい式</h3></header>
                ${notes.map(note => `<p>${note}</p>`).join('')}
                <strong>${formula}</strong>
                <div class="notebook-advice is-green"><b>ノートのコツ</b><span>近道の式も、何を表す数字か分かる言葉と一緒に残そう。</span></div>
            </section>
        `);
    }

    function renderInsightChoice({ choices, correct, success }) {
        setBoard(`
            <section class="study-insight-choice">
                <header><small>REFLECTION</small><h3>今日の気づき</h3></header>
                <div>${choices.map((choice, index) => `<button type="button" data-insight="${index}">${choice}</button>`).join('')}</div>
                <p class="learning-feedback" aria-live="polite"></p>
            </section>
        `);
        board().querySelectorAll('[data-insight]').forEach(button => button.addEventListener('click', () => {
            const index = Number(button.dataset.insight);
            if (index === correct) {
                button.classList.add('correct');
                const dailyBonus = saveCompletion();
                completeInteractiveStep(dailyBonus ? `${success} 学びの森デイリーボーナス ${dailyBonus}GPを獲得！ ▽を押してまとめよう。` : `${success} ▽を押してまとめよう。`);
            } else {
                button.classList.add('wrong');
                const feedback = board().querySelector('.learning-feedback');
                if (feedback) feedback.textContent = "答えだけでなく、次の授業でも使える『勉強の仕方』を選ぼう。";
            }
        }));
    }

    function renderStudySummary({ lesson, points, answer }) {
        const completed = selectedLesson?.id && getState().completedLessons?.includes(selectedLesson.id);
        setBoard(`
            <section class="learning-summary-card study-method-summary">
                <p class="learning-summary-label">${getLessonLabel(lesson)}　勉強の仕方</p>
                <ol>${points.map(point => `<li>${point}</li>`).join('')}</ol>
                <p class="learning-summary-answer">${answer}</p>
                <p class="study-real-exp">本当の経験値は、君自身についている。</p>
                <p class="learning-complete-mark">${completed ? '✓ 学び直し完了' : '最後まで取り組みました'}</p>
            </section>
        `);
    }

    function setBoard(html) {
        const target = board();
        if (target) target.innerHTML = html;
    }

    function board() {
        return document.getElementById("learningBlackboard");
    }

    function syncLearningPlayer() {
        const source = document.getElementById("player");
        const target = document.getElementById("learningPlayer");
        if (!source || !target) return;
        target.innerHTML = "";
        source.querySelectorAll("img").forEach((image) => {
            const clone = image.cloneNode(true);
            clone.removeAttribute("id");
            clone.hidden = image.hidden || !image.getAttribute("src");
            target.appendChild(clone);
        });
    }

    function setupCanvas() {
        const canvas = document.getElementById("learningMemoCanvas");
        if (!canvas) return;
        canvasContext = canvas.getContext("2d", { alpha: true });
        resizeCanvas();

        canvas.addEventListener("pointerdown", startStroke);
        canvas.addEventListener("pointermove", drawStroke);
        canvas.addEventListener("pointerup", endStroke);
        canvas.addEventListener("pointercancel", endStroke);
    }

    function startStroke(event) {
        if (!memoOpen) return;
        const canvas = event.currentTarget;
        canvas.setPointerCapture(event.pointerId);
        activeStroke = [canvasPoint(canvas, event)];
        memoStrokes.push(activeStroke);
        redrawMemo();
    }

    function drawStroke(event) {
        if (!activeStroke) return;
        activeStroke.push(canvasPoint(event.currentTarget, event));
        redrawMemo();
    }

    function endStroke(event) {
        if (!activeStroke) return;
        try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (_) {}
        activeStroke = null;
    }

    function canvasPoint(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height
        };
    }

    function redrawMemo() {
        const canvas = document.getElementById("learningMemoCanvas");
        if (!canvasContext || !canvas) return;
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.lineCap = "round";
        canvasContext.lineJoin = "round";
        canvasContext.strokeStyle = "#2e342f";
        canvasContext.lineWidth = Math.max(2, canvas.width / 360);
        memoStrokes.forEach((stroke) => {
            if (!stroke.length) return;
            canvasContext.beginPath();
            stroke.forEach((point, index) => {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;
                if (index === 0) canvasContext.moveTo(x, y);
                else canvasContext.lineTo(x, y);
            });
            if (stroke.length === 1) {
                const point = stroke[0];
                canvasContext.lineTo(point.x * canvas.width + 0.1, point.y * canvas.height + 0.1);
            }
            canvasContext.stroke();
        });
    }

    function resizeCanvas() {
        const canvas = document.getElementById("learningMemoCanvas");
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
        redrawMemo();
    }

    function scheduleCanvasResize() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(resizeCanvas, 100);
    }

    function openMemo() {
        const panel = document.getElementById("learningMemoPanel");
        if (!panel) return;
        memoOpen = true;
        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");
        requestAnimationFrame(resizeCanvas);
    }

    function closeMemo() {
        const panel = document.getElementById("learningMemoPanel");
        memoOpen = false;
        if (!panel) return;
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");
    }

    function undoMemo() {
        memoStrokes.pop();
        redrawMemo();
    }

    function clearMemo() {
        memoStrokes = [];
        activeStroke = null;
        redrawMemo();
    }

    function todayKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }

    function saveCompletion() {
        if (!selectedLesson?.id) return 0;
        const state = getState();
        const list = Array.isArray(state.completedLessons) ? state.completedLessons : [];
        if (!list.includes(selectedLesson.id)) list.push(selectedLesson.id);
        state.completedLessons = list;
        state.lastCompletedAt = new Date().toISOString();

        let dailyBonus = 0;
        const today = todayKey();
        if (state.dailyBonusDate !== today && typeof addGp === "function") {
            dailyBonus = DAILY_BONUS_GP;
            addGp(dailyBonus);
            state.dailyBonusDate = today;
            state.dailyBonusClaimedAt = new Date().toISOString();
            if (typeof refreshGameDisplays === "function") refreshGameDisplays();
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return dailyBonus;
    }

    function getState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    function bind(id, eventName, handler) {
        const element = document.getElementById(id);
        if (element) element.addEventListener(eventName, handler);
    }

    window.LearningForest = {
        init,
        open,
        close,
        hasActiveLesson: () => Boolean(selectedLesson),
        returnToLessonSelect: () => {
            if (!selectedLesson) return false;
            showLessonSelect();
            return true;
        }
    };
})();
