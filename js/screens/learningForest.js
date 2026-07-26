"use strict";

/* =========================================================
   学びの森 Ver1.9
   算数の広場・第1〜7問の詳しい学び直し
   ========================================================= */

(() => {
    const STORAGE_KEY = "summerGuildLearningForest";

    const lessonCatalog = [
        { number: 1, group: 1, title: "兄と弟のお金", ready: true, id: "math-wasa-01" },
        { number: 2, group: 1, title: "3人で分けたおこづかい", ready: true, id: "math-wasa-02" },
        { number: 3, group: 1, title: "姉と妹のお金", ready: true, id: "math-wasa-03" },
        { number: 4, group: 1, title: "3つの容器の水", ready: true, id: "math-volume-04" },
        { number: 5, group: 2, title: "はがきと切手", ready: true, id: "math-difference-05" },
        { number: 6, group: 2, title: "ケーキの買い物", ready: true, id: "math-savings-06" },
        { number: 7, group: 2, title: "えん筆の本数と代金", ready: true, id: "math-difference-07" },
        { number: 8, group: 2, title: "あめの入れ方" },
        { number: 9, group: 3, title: "折り紙の余りと不足" },
        { number: 10, group: 3, title: "あめを配る人数と個数" },
        { number: 11, group: 3, title: "ノートの余りと不足" },
        { number: 12, group: 3, title: "クッキーを分ける" },
        { number: 13, group: 3, title: "長いすと5年生" },
        { number: 14, group: 4, title: "あめとガム" },
        { number: 15, group: 4, title: "シュークリームとケーキ" },
        { number: 16, group: 4, title: "じゃんけんの得点" },
        { number: 17, group: 4, title: "おはじきの増減" },
        { number: 18, group: 5, title: "ジュースとお茶" },
        { number: 19, group: 5, title: "2種類のおもり" },
        { number: 20, group: 5, title: "コイン投げの得点" },
        { number: 21, group: 5, title: "的当てゲーム" },
        { number: 22, group: 6, title: "道の両側の桜" },
        { number: 23, group: 6, title: "桜を増やして植え直す" },
        { number: 24, group: 7, title: "電柱の最初から最後まで" },
        { number: 25, group: 7, title: "電柱の間に木を植える" },
        { number: 26, group: 8, title: "池のまわりの花" }
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
            makeStep("2番は、3人の関係を一本分ずつ整理する問題だ。まず妹を基準の『1本分』として考えよう。", renderLesson2Problem),
            makeStep("妹の金額を1本分にする。金額はまだ分からなくていい。", () => renderLesson2Diagram("sister")),
            makeStep("兄は妹の2倍だから、同じ長さを2本並べる。", () => renderLesson2Diagram("brother")),
            makeStep("姉は妹と同じ1本分に、さらに80円多い。3人を並べると、同じ長さが全部で4本と、余分な80円になる。", () => renderLesson2Diagram("all")),
            makeStep("合計1000円を同じ4本分にするには、最初に何を外せばよいかな？", renderLesson2Choice, true),
            makeStep("そうだ。余分な80円を先に外そう。黄色の80円を『外す』場所へ動かしてみよう。", () => renderGenericDrag({ total: 1000, token: 80, result: 920, success: "1000−80＝920。これで同じ長さ4本分だけになった。▽を押して続けよう。" }), true),
            makeStep("920円は同じ4本分。妹の1本分はいくらになる？", () => renderGenericNumber({ title: "妹の1本分を求めよう", formula: "920 ÷ 4 ＝", expected: "230", success: "妹は230円。1本分が分かったぞ。▽を押して続けよう。", hint: "920円を、同じ4本に等しく分けよう。" }), true),
            makeStep("兄は妹の2倍。230円の2倍はいくらになる？", () => renderGenericNumber({ title: "兄の金額を求めよう", formula: "230 × 2 ＝", expected: "460", success: "兄は460円。妹2本分だ。▽を押して続けよう。", hint: "妹の230円を2本分にしよう。" }), true),
            makeStep("姉は妹より80円多い。230円に80円を足すといくら？", () => renderGenericNumber({ title: "姉の金額を求めよう", formula: "230 ＋ 80 ＝", expected: "310", success: "姉は310円。3人の金額が全部そろった。▽を押して続けよう。", hint: "妹の230円に、多い80円を戻そう。" }), true),
            makeStep("最後に、式を正しい順番に並べて、考え方を確かめよう。", () => renderGenericOrder({ formulas: ["1000−80＝920", "920÷4＝230", "230×2＝460", "230＋80＝310"], success: "全部つながった。▽を押して、2番の学びをまとめよう。", hint: "まず余分な80円を外し、次に1本分を求めよう。" }), true),
            makeStep("よくできた。『余分な分を外す→同じ本数で分ける→それぞれの関係へ戻す』。これが2番の学びだ。", renderLesson2Summary)
        ];
    }

    function createLesson3Steps() {
        return [
            makeStep("3番は、妹の分から姉の分を組み立てて、同じ場所を見比べる問題だ。", renderLesson3Problem),
            makeStep("妹の金額はまだ分からない。そこで、妹の金額を赤い1本分で表そう。姉は、その1本分より500円多い。", () => renderLesson3Diagram("difference")),
            makeStep("もう一つの条件は『姉は妹の3倍より100円少ない』。だから100円を足すと、妹の3本分ぴったりになる。", () => renderLesson3Diagram("before-add")),
            makeStep("黄色の100円を、500円の右隣へ動かして、妹の3本分ぴったりにしよう。", renderLesson3Drag, true),
            makeStep("上の赤い1本分は妹そのもの。だから、その右側の『500円＋100円』は――ここは妹2本分だよね。", renderLesson3AlignedDiagram),
            makeStep("500＋100＝600円。その600円が妹2本分だ。妹の1本分はいくらになる？", () => renderGenericNumber({ title: "妹の1本分を求めよう", formula: "600 ÷ 2 ＝", expected: "300", success: "妹は300円。600円を2本に分けると、1本分が出た。▽を押して続けよう。", hint: "500円＋100円の600円は、赤い2本分だったね。" }), true),
            makeStep("姉は妹より500円多い。300円に500円を足すといくら？", () => renderGenericNumber({ title: "姉の金額を求めよう", formula: "300 ＋ 500 ＝", expected: "800", success: "姉は800円。妹の3倍より100円少ないことも確かめられる。▽を押して続けよう。", hint: "妹の300円に、多い500円を足そう。" }), true),
            makeStep("最後に、気付いた順番で式を並べよう。", () => renderGenericOrder({ formulas: ["500＋100＝600", "600円＝妹2本分", "600÷2＝300", "300＋500＝800"], success: "『600円＝妹2本分』が見つかったから、全部つながった。▽を押して、3番の学びをまとめよう。", hint: "まず500円と100円を合わせて、妹2本分を作ろう。" }), true),
            makeStep("よくできた。分からない金額を1本分にして、同じ位置をぴったりそろえると、『600円が妹2本分』だと見つけられる。", renderLesson3Summary)
        ];
    }

    function createLesson4Steps() {
        return [
            makeStep("4番は、問題文の日本語を一つずつ絵に変えながら考える問題だ。まずは、問題文を原文のまま読んでみよう。", renderLesson4Problem),
            makeStep("ギルドマスター：『同じかさだけ水が入る3つの容器』というのは、A・B・Cのどれも、満タンまで入る水の量が同じという意味だ。", () => renderLesson4Containers("equal")),
            makeStep("主人公：『あれ？ Aがいっぱいになったあと、どうしてBは4分の1で止めて、Cにも入れたんだろう？』", () => renderLesson4Containers("question")),
            makeStep("ギルドマスター：『いいところに気付いたね。でも、問題文には水を入れた順番は書かれていないんだ。書いてあるのは、全部移し終えたあとの状態だけだよ。』", () => renderLesson4Containers("final")),
            makeStep("主人公：『なるほど。AにもBにもCにも、少しずつ入れたのかもしれないんだね。順番ではなく、最後の状態を見ればいいんだ。』", () => renderLesson4Containers("final")),
            makeStep("ギルドマスター：『そう。では、満タンのAを4分の4と考えよう。Bは4分の1、Cは4分の3だ。』", renderLesson4Fractions),
            makeStep("3つを合わせると、4分の4＋4分の1＋4分の3。分子の合計はいくつになる？", renderLesson4FractionCheck, true),
            makeStep("4分の8は、同じ容器2個分だ。その2個分が16L。容器1個分は何Lかな？", () => renderGenericNumber({ title: "容器1個分を求めよう", formula: "16 ÷ 2 ＝", expected: "8", unit: "L", success: "容器1個には8L入る。問題文の日本語から、最後の状態を正しく絵にできたね。▽を押して続けよう。", hint: "16Lは、同じ容器2個分だったね。" }), true),
            makeStep("最後に、文章から計算へ変えた順番を並べて確かめよう。", () => renderGenericOrder({ formulas: ["A＝4/4、B＝1/4、C＝3/4", "4/4＋1/4＋3/4＝8/4", "8/4＝容器2個分", "16÷2＝8"], success: "日本語を絵に変え、分数を容器の個数へ変えたから、答えまでつながった。▽を押して、4番の学びをまとめよう。", hint: "まず、A・B・Cの最後の状態を分数で表すところから始めよう。" }), true),
            makeStep("よくできた。文章題では、書いてあることと書いていないことを分け、言葉を一つずつ絵に変えることが大切だ。", renderLesson4Summary)
        ];
    }

    function createLesson5Steps() {
        return [
            makeStep("5番も、まずは問題文を原文のまま読んでみよう。どの言葉が、解き方を教えてくれているかな。", renderLesson5Problem),
            makeStep("主人公：『50円と80円と420円……。数字は見えるけど、どこに反応したらいいんだろう？』", () => renderLesson5Keywords(false)),
            makeStep("ギルドマスター：『ポイントは、“同じ枚数ずつ買った”と、“1枚あたりの値段の差が30円”ってところだね。この言葉に反応できるのが大切だな。』", () => renderLesson5Keywords(true)),
            makeStep("はがき1枚は50円、切手1枚は80円。1枚ずつ買うたびに、代金にはいくらの差ができるかな？", renderLesson5PriceChoice, true),
            makeStep("そう。1枚なら30円差、2枚なら60円差、3枚なら90円差。『同じ枚数』だから、この30円の差が同じ回数だけ積み重なるんだ。", renderLesson5DifferenceGrowth),
            makeStep("主人公：『なるほど！ 420円の中に、1枚ごとの差の30円が何回あるかを考えればいいんだ！』", renderLesson5UnknownCount),
            makeStep("420円の差は、30円の差が何回分かな？", () => renderGenericNumber({ title: "買った枚数を求めよう", formula: "420 ÷ 30 ＝", expected: "14", unit: "枚", success: "14枚。同じ枚数ずつ買ったので、はがきも切手も14枚ずつだ。▽を押して続けよう。", hint: "合計の差420円の中に、1枚ごとの差30円がいくつあるか考えよう。" }), true),
            makeStep("最後に、問題文の言葉から式へつなげた順番を並べよう。", () => renderGenericOrder({ formulas: ["同じ枚数ずつ買った", "80−50＝30（1枚ごとの差）", "420円＝30円の差が何回分か", "420÷30＝14"], success: "『同じ枚数』と『1枚ごとの差』に反応できたから、420÷30につながった。▽を押して、5番の学びをまとめよう。", hint: "まず『同じ枚数』に注目し、次に1枚ごとの差を求めよう。" }), true),
            makeStep("よくできた。文章題では、数字だけでなく、数字どうしを結びつける言葉に反応することが大切だ。", renderLesson5Summary)
        ];
    }

    function createLesson6Steps() {
        return [
            makeStep("6番も、まずは問題文を原文のまま読んでみよう。分からない『いくつか』より、数と金額がはっきり分かるところを探すんだ。", renderLesson6Problem),
            makeStep("主人公：『代金は予定と同じ金額……。ここが同じってことは、300円でいくつか買う予定の金額と、250円で実際にいくつか買った金額が一緒ってことだね。』", () => renderLesson6SameTotal(false)),
            makeStep("ギルドマスター：『そうだね、そこがポイントだ。予定と実際では、個数は違っても、使った代金の合計は同じなんだ。』", () => renderLesson6SameTotal(true)),
            makeStep("主人公：『でも、“いくつか”ばっかりじゃ、どこから考えたらいいか分からないや……。』", renderLesson6Unknowns),
            makeStep("ギルドマスター：『でも、数と金額がはっきり分かるところがあるよ。“250円のケーキが、2個多く買えた”ってところだ。』", renderLesson6TwoExtra),
            makeStep("主人公：『あ、そしたら500円って数字が出るね。』2個多く買うために必要な金額を求めよう。", () => renderGenericNumber({ title: "多く買えた2個分を求めよう", formula: "250 × 2 ＝", expected: "500", success: "そうだね。2個多く買うには500円の余裕が必要だ。▽を押して続けよう。", hint: "250円のケーキ2個分だから、250×2だね。" }), true),
            makeStep("主人公：『予定では300円のケーキを買うつもりだった。でも250円のを買ったら、全部で500円の余裕ができたってことだ。』", renderLesson6SavingBridge),
            makeStep("ギルドマスター：『そそ！ それがポイントだ。1個につき、いくら安く買えたのかな？』", renderLesson6UnitDifferenceChoice, true),
            makeStep("主人公：『1個につき50円安かったのを積み重ねていったら、500円の余裕ができたってことだ！』", renderLesson6SavingsStack),
            makeStep("主人公：『ということは……50円が何回分集まったら500円になるかを考えればいいんだ！』", () => renderGenericNumber({ title: "最初に買う予定だった個数を求めよう", formula: "500 ÷ 50 ＝", expected: "10", unit: "個", success: "10個。最初は300円のケーキを10個買うつもりだったんだ。▽を押して続けよう。", hint: "500円の中に、1個ごとの50円の差が何回あるか考えよう。" }), true),
            makeStep("最後に、分かる数字から考えた順番を並べて確かめよう。", () => renderGenericOrder({ formulas: ["250×2＝500（2個分の余裕）", "300−250＝50（1個ごとの余裕）", "500円＝50円が何回分か", "500÷50＝10"], success: "『いくつか』は後回しにして、はっきり分かる2個分の500円から考えたから、答えまでつながった。▽を押して、6番の学びをまとめよう。", hint: "まず、実際に2個多く買えたことで必要になった金額を求めよう。" }), true),
            makeStep("よくできた。分からない『いくつか』からではなく、数と金額がはっきりしているところから考える。1個ごとの50円の差が積み重なって500円になったんだ。", renderLesson6Summary)
        ];
    }

    function createLesson7Steps() {
        return [
            makeStep("7番も、まずは問題文を原文のまま読んでみよう。今回は『1本ごとの差』『9本多い』『代金は220円高い』を、順番に絵へ変えていくよ。", renderLesson7Problem),
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
            makeStep("近道の式を、意味がつながる順番に並べてみよう。", () => renderGenericOrder({ formulas: ["80×9＝720（ゆかさんが多い分）", "720＋220＝940（ひっくり返してさらに進む差）", "100−80＝20（1本ごとの差）", "940÷20＝47"], success: "47本。さっきゆっくり考えたことを、一気にまとめた式になっているね。▽を押して、7番の学びをまとめよう。", hint: "まず9本分を金額にし、次に最後の220円を足そう。" }), true),
            makeStep("主人公：『なるほど！ さっきゆっくり考えたことを、一気に計算しただけなんだ！』 ギルドマスター：『その通り。近道は、理解してから使うと、一番力になる。』", renderLesson7Summary)
        ];
    }

    const lessonFactories = {
        1: createLesson1Steps,
        2: createLesson2Steps,
        3: createLesson3Steps,
        4: createLesson4Steps,
        5: createLesson5Steps,
        6: createLesson6Steps,
        7: createLesson7Steps
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
    }

    function close() {
        closeMemo();
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

        if (text) text.textContent = "夏期講習プリントの1〜26番から、学び直したい問題を選ぼう。1〜3番は詳しい解説を始められるぞ。";
        if (mark) {
            mark.hidden = true;
            mark.textContent = "▼";
            mark.classList.remove("is-finish");
        }
        if (dialogue) dialogue.classList.add("is-locked");
        if (back) back.disabled = true;
        if (restartButton) restartButton.disabled = true;

        renderLessonSelect();
    }

    function startLesson(number) {
        const lesson = lessonCatalog.find((item) => item.number === number);
        if (!lesson || !lesson.ready) {
            const text = document.getElementById("learningText");
            if (text) text.textContent = `${number}番「${lesson?.title || "この問題"}」は、ただいま詳しい解説を準備中だ。1番から学び直してみよう。`;
            return;
        }

        selectedLesson = lesson;
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
                    <h2>算数の学び直し　全26問</h2>
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
                                            aria-label="${lesson.number}番 ${lesson.title}${lesson.ready ? "" : " 準備中"}">
                                            <strong>${lesson.number}</strong>
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
                <p class="learning-problem-label">今日の問題</p>
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
                        saveCompletion();
                        completeInteractiveStep("全部つながった。▽を押して、今日の学びをまとめよう。");
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
                <p class="learning-summary-label">今日の学び</p>
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
                <p class="learning-problem-label">2番の問題</p>
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
            label: "2番の学び",
            points: ["姉だけが多い80円を先に外す", "残った920円を同じ4本に分ける", "1本分230円から兄と姉の金額を作る"],
            formulas: ["1000−80＝920", "920÷4＝230", "230×2＝460", "230＋80＝310"],
            answer: "兄 460円　姉 310円　妹 230円"
        });
    }

    function renderLesson3Problem() {
        setBoard(`
            <article class="learning-problem-card">
                <p class="learning-problem-label">3番の問題</p>
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
            label: "3番の学び",
            points: ["妹の分を赤い1本で表す", "500円＋100円の真下に、同じ大きさの妹2本分をそろえる", "600円を2で割って妹を求め、500円を足して姉を求める"],
            formulas: ["500＋100＝600", "600円＝妹2本分", "600÷2＝300", "300＋500＝800"],
            answer: "姉 800円　妹 300円"
        });
    }


    function renderLesson4Problem() {
        setBoard(`
            <article class="learning-problem-card lesson4-problem-card">
                <p class="learning-problem-label">4番の問題（原文）</p>
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
            label: "4番の学び",
            points: ["最初に問題文を原文のまま読む", "『同じかさだけ入る』を『満タンまで入る量が同じ』へ翻訳する", "順番は書かれていないので、最後の状態だけを使う", "4/4＋1/4＋3/4＝8/4＝容器2個分と考える"],
            formulas: ["4/4＋1/4＋3/4＝8/4", "8/4＝容器2個分", "16÷2＝8"],
            answer: "容器1つには 8L 入る"
        });
    }

    function renderLesson5Problem() {
        setBoard(`
            <article class="learning-problem-card lesson5-problem-card">
                <p class="learning-problem-label">5番の問題（原文）</p>
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
            label: "5番の学び",
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
                <p class="learning-problem-label">6番の問題（原文）</p>
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
            label: "6番の学び",
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
            label: "7番の学び",
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
                if (good) { slots.forEach((item) => item.classList.add('correct')); saveCompletion(); completeInteractiveStep(success); }
                else { if (feedback) feedback.textContent = hint; window.setTimeout(() => renderGenericOrder({ formulas, success, hint }), 900); }
            }
        }));
    }

    function renderGenericSummary({ label, points, formulas, answer }) {
        const completed = selectedLesson?.id && getState().completedLessons?.includes(selectedLesson.id);
        setBoard(`<div class="learning-summary-card"><p class="learning-summary-label">${label}</p><ol>${points.map((point) => `<li>${point}</li>`).join('')}</ol><div class="learning-summary-formulas">${formulas.map((formula) => `<span>${formula}</span>`).join('')}</div><p class="learning-summary-answer">${answer}</p><p class="learning-complete-mark">${completed ? '✓ 学び直し完了' : '最後まで取り組みました'}</p></div>`);
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

    function saveCompletion() {
        if (!selectedLesson?.id) return;
        const state = getState();
        const list = Array.isArray(state.completedLessons) ? state.completedLessons : [];
        if (!list.includes(selectedLesson.id)) list.push(selectedLesson.id);
        state.completedLessons = list;
        state.lastCompletedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

    window.LearningForest = { init, open, close };
})();
