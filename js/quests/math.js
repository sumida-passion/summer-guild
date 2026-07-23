"use strict";

/* =========================================================
   算数ギルド Ver3.0
   ・ギルドクエスト1〜20（各10問・四択・一度だけ攻略）
   ・不正解でそのクエストの1問目へ戻る
   ・再挑戦時は選択肢のみシャッフル
   ・5クエストごとにギルドテスト（各20問ランダム・何度でも挑戦）
   ・各テスト合格5回で称号昇格＆次の5クエスト解放
   ・ギルドテスト4は小数のかけ算・わり算全範囲の最終ボス
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
    },
    {
        id: 11,
        title: "小数÷整数",
        subtitle: "商の小数点を正しく置く",
        questions: [
            q("2.8 ÷ 4", "0.7", ["7", "0.07", "1.4"]),
            q("5.6 ÷ 7", "0.8", ["8", "0.08", "1.25"]),
            q("7.2 ÷ 9", "0.8", ["8", "0.08", "1.8"]),
            q("0.54 ÷ 6", "0.09", ["0.9", "9", "0.009"]),
            q("8.64 ÷ 8", "1.08", ["10.8", "0.108", "1.8"]),
            q("56.81 ÷ 13", "4.37", ["43.7", "0.437", "4.73"]),
            q("19.2 ÷ 6", "3.2", ["32", "0.32", "2.3"]),
            q("0.735 ÷ 5", "0.147", ["1.47", "0.0147", "0.157"]),
            q("4.2Lのジュースを6人で等分。1人分は？", "0.7L", ["7L", "0.07L", "1.4L"]),
            q("12.6mのリボンを7等分。1本の長さは？", "1.8m", ["18m", "0.18m", "5.6m"])
        ]
    },
    {
        id: 12,
        title: "整数÷小数",
        subtitle: "わる数を整数に直して考える",
        questions: [
            q("8 ÷ 0.2", "40", ["4", "0.4", "400"]),
            q("6 ÷ 1.5", "4", ["0.4", "40", "9"]),
            q("56 ÷ 0.8", "70", ["7", "0.7", "700"]),
            q("91 ÷ 1.4", "65", ["6.5", "650", "127.4"]),
            q("270 ÷ 0.36", "750", ["75", "7.5", "7500"]),
            q("24 ÷ 0.6", "40", ["4", "0.4", "144"]),
            q("15 ÷ 2.5", "6", ["0.6", "60", "37.5"]),
            q("42 ÷ 0.07", "600", ["60", "6", "6000"]),
            q("12kgの米を0.4kgずつ袋に入れる。何袋？", "30袋", ["3袋", "300袋", "4.8袋"]),
            q("18mのひもを1.2mずつ切る。何本？", "15本", ["1.5本", "150本", "21.6本"])
        ]
    },
    {
        id: 13,
        title: "小数÷小数",
        subtitle: "小数点を同じだけ動かす",
        questions: [
            q("0.9 ÷ 0.3", "3", ["0.3", "30", "0.03"]),
            q("6.3 ÷ 0.7", "9", ["0.9", "90", "0.09"]),
            q("9.1 ÷ 1.3", "7", ["0.7", "70", "11.83"]),
            q("0.39 ÷ 1.3", "0.3", ["3", "0.03", "30"]),
            q("53.6 ÷ 0.8", "67", ["6.7", "670", "42.88"]),
            q("4.284 ÷ 1.26", "3.4", ["34", "0.34", "5.544"]),
            q("2.8 ÷ 0.04", "70", ["7", "0.7", "700"]),
            q("0.54 ÷ 0.09", "6", ["0.6", "60", "0.06"]),
            q("3.75kgの小麦粉を0.25kgずつ分ける。何袋？", "15袋", ["1.5袋", "150袋", "0.9375袋"]),
            q("7.2mは0.45mの何倍？", "16倍", ["1.6倍", "160倍", "3.24倍"])
        ]
    },
    {
        id: 14,
        title: "商の大きさ",
        subtitle: "1より大きい数・小さい数でわる",
        questions: [
            q("18より商が大きくなるのは？", "18 ÷ 0.9", ["18 ÷ 1", "18 ÷ 1.2", "18 ÷ 2"]),
            q("18より商が小さくなるのは？", "18 ÷ 1.2", ["18 ÷ 0.9", "18 ÷ 0.06", "18 ÷ 1"]),
            q("2.16より商が小さくなるのは？", "2.16 ÷ 2.4", ["2.16 ÷ 0.96", "2.16 ÷ 0.04", "2.16 ÷ 0.8"]),
            q("商が、わられる数より大きくなるのは？", "19.2 ÷ 0.97", ["5.4 ÷ 1.1", "0.83 ÷ 0.83", "49 ÷ 1.01"]),
            q("商がわられる数と等しくなるのは？", "7.5 ÷ 1", ["7.5 ÷ 0.5", "7.5 ÷ 1.5", "7.5 ÷ 0.1"]),
            q("12 ÷ 0.6 の商は12より？", "大きい", ["小さい", "等しい", "0になる"]),
            q("12 ÷ 1.5 の商は12より？", "小さい", ["大きい", "等しい", "決められない"]),
            q("5.4 ÷ 0.09 の商として正しいものは？", "60", ["0.6", "6", "600"]),
            q("同じ12mを分けるとき、最も本数が多いのは？", "0.3mずつ", ["0.6mずつ", "1.2mずつ", "3mずつ"]),
            q("同じ9Lを分けるとき、最も容器数が少ないのは？", "1.5Lずつ", ["0.9Lずつ", "0.5Lずつ", "0.3Lずつ"])
        ]
    },
    {
        id: 15,
        title: "商を概数で表す",
        subtitle: "四捨五入して指定された位まで求める",
        questions: [
            q("9.58 ÷ 2.7（商を10分の1の位までの概数）", "3.5", ["3.4", "3.6", "35"]),
            q("0.847 ÷ 0.61（上から2けたの概数）", "1.4", ["1.3", "1.38", "14"]),
            q("7 ÷ 3（商を10分の1の位までの概数）", "2.3", ["2.2", "2.4", "23"]),
            q("16 ÷ 7（商を100分の1の位までの概数）", "2.29", ["2.28", "2.3", "22.9"]),
            q("25.6 ÷ 3.7（商を10分の1の位までの概数）", "6.9", ["6.8", "7", "69"]),
            q("4.73 ÷ 1.8（商を100分の1の位までの概数）", "2.63", ["2.62", "2.64", "26.3"]),
            q("31.5 ÷ 6.8（上から2けたの概数）", "4.6", ["4.5", "4.63", "46"]),
            q("0.92 ÷ 0.27（上から2けたの概数）", "3.4", ["3.3", "3.41", "34"]),
            q("13Lで8.7kg。1Lあたりを10分の1kgまでの概数で", "0.7kg", ["0.6kg", "0.67kg", "7kg"]),
            q("17.5mを6人で等分。1人分を100分の1mまでの概数で", "2.92m", ["2.91m", "2.9m", "29.2m"])
        ]
    },
    {
        id: 16,
        title: "あまりのあるわり算",
        subtitle: "商とあまりの小数点を正しく読む",
        questions: [
            q("47.5 ÷ 2.6（商を一の位まで。あまりも）", "18 あまり 0.7", ["18 あまり 7", "1 あまり 0.7", "18.2"]),
            q("18.7 ÷ 3.2（商を一の位まで。あまりも）", "5 あまり 2.7", ["5 あまり 0.27", "6 あまり 0.5", "5.8"]),
            q("9.4 ÷ 1.5（商を一の位まで。あまりも）", "6 あまり 0.4", ["6 あまり 4", "5 あまり 1.9", "6.2"]),
            q("7.83 ÷ 0.6（商を一の位まで。あまりも）", "13 あまり 0.03", ["13 あまり 0.3", "12 あまり 0.63", "13.05"]),
            q("23.6 ÷ 4.5（商を一の位まで。あまりも）", "5 あまり 1.1", ["5 あまり 0.11", "4 あまり 5.6", "5.2"]),
            q("5.2 ÷ 0.8（商を一の位まで。あまりも）", "6 あまり 0.4", ["6 あまり 4", "5 あまり 1.2", "6.5"]),
            q("16mを0.35mずつ切る。何本とれて何mあまる？", "45本、0.25m", ["45本、0.025m", "46本、0.1m", "44本、0.6m"]),
            q("12.5Lを0.8Lずつ入れる。満杯は何本、何Lあまる？", "15本、0.5L", ["15本、0.05L", "16本、0.3L", "14本、1.3L"]),
            q("8.9kgを1.2kgずつ分ける。何袋、何kgあまる？", "7袋、0.5kg", ["7袋、0.05kg", "8袋、0.7kg", "6袋、1.7kg"]),
            q("15.4mを2.3mずつ切る。何本、何mあまる？", "6本、1.6m", ["6本、0.16m", "7本、0.7m", "5本、3.9m"])
        ]
    },
    {
        id: 17,
        title: "わり算総合Ⅰ",
        subtitle: "小数点・商の大きさ・概数を組み合わせる",
        questions: [
            q("36.4 ÷ 7", "5.2", ["52", "0.52", "4.2"]),
            q("72 ÷ 0.24", "300", ["30", "3", "3000"]),
            q("6.615 ÷ 1.05", "6.3", ["63", "0.63", "6.03"]),
            q("3.96 ÷ 0.12", "33", ["3.3", "330", "0.33"]),
            q("14.2 ÷ 3.1（10分の1の位までの概数）", "4.6", ["4.5", "4.58", "46"]),
            q("0.675 ÷ 0.28（上から2けたの概数）", "2.4", ["2.3", "2.41", "24"]),
            q("24より商が大きくなるのは？", "24 ÷ 0.8", ["24 ÷ 1", "24 ÷ 1.2", "24 ÷ 3"]),
            q("16.74 ÷ 3.6と等しいのは？", "167.4 ÷ 36", ["167.4 ÷ 0.36", "1.674 ÷ 36", "1674 ÷ 36"]),
            q("9kgの米を0.75kgずつ分ける。何袋？", "12袋", ["1.2袋", "120袋", "6.75袋"]),
            q("18.9kmを7時間で進む。時速は？", "2.7km", ["27km", "0.27km", "11.9km"])
        ]
    },
    {
        id: 18,
        title: "わり算総合Ⅱ",
        subtitle: "積と商の関係・逆算・複合計算",
        questions: [
            q("3.24 × 1.53と等しいのは？", "0.324 × 15.3", ["32.4 × 15.3", "32.4 × 0.153", "0.324 × 0.153"]),
            q("16.74 ÷ 3.6と等しいのは？", "167.4 ÷ 36", ["167.4 ÷ 0.36", "1.674 ÷ 36", "1674 ÷ 36"]),
            q("□ × 0.8 = 6.4　□は？", "8", ["0.8", "5.12", "80"]),
            q("□ ÷ 1.5 = 4.2　□は？", "6.3", ["2.8", "0.63", "63"]),
            q("7.2 ÷ □ = 9　□は？", "0.8", ["8", "0.08", "64.8"]),
            q("誤って3.6でかけるところを3.6でわり、答えが5になった。正しい答えは？", "64.8", ["18", "1.8", "12.96"]),
            q("誤って0.4でわるところを0.4でかけ、答えが3.2になった。正しい答えは？", "20", ["8", "1.28", "2"]),
            q("(4.8 ÷ 0.6) × 1.25", "10", ["1", "100", "8.25"]),
            q("18.6 ÷ (0.5 × 3)", "12.4", ["1.24", "124", "27.9"]),
            q("2.4 × 3.5 ÷ 0.7", "12", ["1.2", "120", "8.4"])
        ]
    },
    {
        id: 19,
        title: "文章題総合",
        subtitle: "場面を式にして答える",
        questions: [
            q("7.5kgで3600円の米。1kgの値段は？", "480円", ["48円", "4800円", "27000円"]),
            q("1.8Lで6人分のスープ。1人分は？", "0.3L", ["3L", "0.03L", "10.8L"]),
            q("時速4.5kmで2.4時間歩く。道のりは？", "10.8km", ["1.08km", "6.9km", "18.75km"]),
            q("12.6m²の壁を1.8Lで塗れる。1Lで何m²？", "7m²", ["0.7m²", "14.4m²", "22.68m²"]),
            q("5.4kgの果物を0.45kgずつ箱詰め。何箱？", "12箱", ["1.2箱", "120箱", "2.43箱"]),
            q("18mの布から2.4mの布を何枚とれ、何mあまる？", "7枚、1.2m", ["7枚、0.12m", "8枚、1.2m", "6枚、3.6m"]),
            q("1個0.35kgの荷物を24個。全部で？", "8.4kg", ["84kg", "0.84kg", "24.35kg"]),
            q("13.5Lを6本に等分。1本分は？", "2.25L", ["22.5L", "0.225L", "7.5L"]),
            q("84kmを1.6時間で進む。時速は？", "52.5km", ["5.25km", "134.4km", "82.4km"]),
            q("4.8mのリボンを0.35mずつ切る。何本とれ、何mあまる？", "13本、0.25m", ["13本、0.025m", "14本、0.1m", "12本、0.6m"])
        ]
    },
    {
        id: 20,
        title: "実力試験への挑戦",
        subtitle: "小数のかけ算・わり算を完全攻略",
        questions: [
            q("0.48 × 3.5", "1.68", ["16.8", "0.168", "168"]),
            q("7.56 ÷ 0.24", "31.5", ["3.15", "315", "0.315"]),
            q("23.8 ÷ 6.4（10分の1の位までの概数）", "3.7", ["3.6", "3.72", "37"]),
            q("31.7 ÷ 2.8（商を一の位まで。あまりも）", "11 あまり 0.9", ["11 あまり 9", "10 あまり 3.7", "11.3"]),
            q("積が最も大きいのは？", "4.2 × 1.5", ["4.2 × 0.9", "4.2 × 1", "4.2 × 0.15"]),
            q("商が最も大きいのは？", "8.4 ÷ 0.4", ["8.4 ÷ 1", "8.4 ÷ 1.4", "8.4 ÷ 4"]),
            q("誤って2.5でかけるところを2.5でわり、答えが4.8。正しい答えは？", "30", ["12", "1.92", "7.3"]),
            q("1本0.75Lの水を8本用意し、0.4Lずつ配る。何人分？", "15人分", ["1.5人分", "150人分", "12人分"]),
            q("ある整数を0.6でわると商が一の位で12、あまり0.4。元の数は？", "7.6", ["72.4", "7.24", "20.4"]),
            q("3.6kgの粉を0.25kgずつ袋詰め。満杯は何袋、何kgあまる？", "14袋、0.1kg", ["14袋、0.01kg", "15袋、0.15kg", "13袋、0.35kg"])
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
    const fallback = { completedQuests: {} };
    for (let testNumber = 1; testNumber <= 4; testNumber += 1) {
        fallback[`test${testNumber}Passes`] = 0;
        fallback[`test${testNumber}Attempts`] = 0;
        fallback[`test${testNumber}BestTime`] = null;
        fallback[`test${testNumber}BestAccuracy`] = 0;
    }
    try {
        const saved = JSON.parse(localStorage.getItem(MATH_GUILD_STORAGE_KEY) || "null");
        if (!saved || typeof saved !== "object") return fallback;
        const progress = {
            completedQuests: saved.completedQuests && typeof saved.completedQuests === "object" ? saved.completedQuests : {}
        };
        for (let testNumber = 1; testNumber <= 4; testNumber += 1) {
            progress[`test${testNumber}Passes`] = nonNegativeInteger(saved[`test${testNumber}Passes`]);
            progress[`test${testNumber}Attempts`] = nonNegativeInteger(saved[`test${testNumber}Attempts`]);
            progress[`test${testNumber}BestTime`] = finiteOrNull(saved[`test${testNumber}BestTime`] ?? (testNumber === 1 ? saved.bestTime : null));
            progress[`test${testNumber}BestAccuracy`] = percent(saved[`test${testNumber}BestAccuracy`] ?? (testNumber === 1 ? saved.bestAccuracy : 0));
        }
        return progress;
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
    if (progress.test4Passes >= 5) return MATH_GUILD_TITLES[4];
    if (progress.test3Passes >= 5) return MATH_GUILD_TITLES[3];
    if (progress.test2Passes >= 5) return MATH_GUILD_TITLES[2];
    if (progress.test1Passes >= 5) return MATH_GUILD_TITLES[1];
    return MATH_GUILD_TITLES[0];
}

function isQuestUnlocked(questId, progress) {
    if (questId === 1) return true;
    if (questId <= 5) return Boolean(progress.completedQuests[String(questId - 1)]);
    if (questId === 6) return progress.test1Passes >= 5;
    if (questId <= 10) return Boolean(progress.completedQuests[String(questId - 1)]);
    if (questId === 11) return progress.test2Passes >= 5;
    if (questId <= 15) return Boolean(progress.completedQuests[String(questId - 1)]);
    if (questId === 16) return progress.test3Passes >= 5;
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

    const questCard = (quest) => {
        const complete = Boolean(progress.completedQuests[String(quest.id)]);
        const unlocked = isQuestUnlocked(quest.id, progress);
        let lockedText = `クエスト${quest.id - 1}クリアで解放`;
        if (quest.id === 6) lockedText = "ギルドテスト1に5回合格で解放";
        if (quest.id === 11) lockedText = "ギルドテスト2に5回合格で解放";
        if (quest.id === 16) lockedText = "ギルドテスト3に5回合格で解放";
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
    };

    const sections = [];
    for (let group = 0; group < 4; group += 1) {
        const startId = group * 5 + 1;
        const endId = startId + 4;
        const testNumber = group + 1;
        const unlocked = areQuestRangeComplete(progress, startId, endId);
        const status = unlocked
            ? `合格 ${Math.min(progress[`test${testNumber}Passes`], 5)} / 5回`
            : `クエスト${startId}〜${endId}を攻略すると解放`;
        const cards = MATH_GUILD_QUESTS.filter((quest) => quest.id >= startId && quest.id <= endId).map(questCard).join("");
        sections.push(`<div class="math-guild-list">${cards}</div>${renderTestCard(testNumber, unlocked, status, progress[`test${testNumber}BestAccuracy`])}`);
    }

    container.innerHTML = `
        <div class="math-guild-summary">
            <div><span>現在の称号</span><strong>${getMathGuildTitle(progress)}</strong></div>
            <div><span>攻略クエスト</span><strong>${Object.values(progress.completedQuests).filter(Boolean).length} / 20</strong></div>
            <div><span>最終ボス</span><strong>${progress.test4Passes >= 5 ? "小数マスター認定" : "未認定"}</strong></div>
        </div>
        ${sections.join("")}
        ${progress.test4Passes >= 5 ? `<div class="math-guild-rankup-note">最終ボス撃破。「小数マスター」認定済みです。</div>` : ""}`;

    container.querySelectorAll("[data-math-quest]").forEach((button) => {
        button.addEventListener("click", () => startMathGuildQuest(Number(button.dataset.mathQuest)));
    });
    container.querySelectorAll("[data-math-test]").forEach((button) => {
        button.addEventListener("click", () => startMathGuildTest(Number(button.dataset.mathTest)));
    });
}

function renderTestCard(testNumber, unlocked, status, bestAccuracy) {
    const ranges = {
        1: "クエスト1〜5",
        2: "クエスト6〜10",
        3: "クエスト11〜15",
        4: "クエスト1〜20"
    };
    const titles = {
        1: "小数のかけ算・基礎試験",
        2: "小数のかけ算・わり算 総合試験",
        3: "小数のわり算・基礎試験",
        4: "最終ボス　小数演算・実力試験"
    };
    return `
        <article class="math-guild-test-card ${unlocked ? "" : "is-locked"}">
            <div>
                <span>GUILD TEST ${testNumber}${testNumber === 4 ? " / FINAL BOSS" : ""}</span>
                <h3>${titles[testNumber]}</h3>
                <p>${ranges[testNumber]}からランダムで20問。正解率90％以上で合格です。</p>
                <small>${status}${bestAccuracy ? `／最高正解率 ${bestAccuracy}%` : ""}</small>
            </div>
            <button type="button" data-math-test="${testNumber}" ${unlocked ? "" : "disabled"}>${testNumber === 4 ? "最終ボスに挑む" : "試験を受ける"}</button>
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
    const ranges = {
        1: [1, 5],
        2: [6, 10],
        3: [11, 15],
        4: [16, 20]
    };
    const unlockRange = ranges[testNumber];
    if (!unlockRange || !areQuestRangeComplete(progress, unlockRange[0], unlockRange[1])) return;
    const poolRange = testNumber === 4 ? [1, 20] : unlockRange;
    const pool = uniqueQuestions(MATH_GUILD_QUESTS
        .filter((quest) => quest.id >= poolRange[0] && quest.id <= poolRange[1])
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
    if ([5, 10, 15, 20].includes(mathGuildState.questId)) {
        nextText = `ギルドテスト${mathGuildState.questId / 5}が解放されました。`;
    } else {
        nextText = `ギルドクエスト${mathGuildState.questId + 1}が解放されました。`;
    }
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
    const oldTitle = MATH_GUILD_TITLES[Math.max(0, testNumber - 1)];
    const newTitle = MATH_GUILD_TITLES[testNumber];
    const unlockText = testNumber < 4
        ? `ギルドクエスト${testNumber * 5 + 1}が解放されました。`
        : "最終ボスを撃破し、「小数マスター」に認定されました。";
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
