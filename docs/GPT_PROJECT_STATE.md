# Summer Guild｜GPT Project State

> このファイルは自動生成されています。
> ファイル名・フォルダ名・大文字小文字は、ここに記録された表記を正として扱います。

## 1. 生成情報

| 項目 | 内容 |
|---|---|
| 生成日時（UTC） | 2026-07-22T06:07:48.224Z |
| リポジトリ | unknown |
| ブランチ | `unknown` |
| コミット | `unknown` |
| 最新コミット | unknown |

## 2. プロジェクト概要

| 種類 | 数 |
|---|---:|
| 全ファイル | 145 |
| フォルダ | 66 |
| 画像 | 46 |
| 音声 | 9 |
| 動画 | 0 |
| JavaScript | 26 |
| CSS | 4 |
| HTML | 1 |

## 3. 全体フォルダ構造

```text
summer-guild/
├── .github/
│   └── workflows/
│       ├── .gitkeep
│       └── generate-project-map.yml
├── assets/
│   ├── app-icons/
│   │   ├── .gitkeep
│   │   ├── apple-touch-icon.png
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── audio/
│   │   ├── bgm/
│   │   │   ├── .gitkeep
│   │   │   ├── Afternoon in the Academy.mp3
│   │   │   ├── Bloom in the Garden.mp3
│   │   │   ├── Candlelit Banquet.mp3
│   │   │   ├── Harbor Breeze.mp3
│   │   │   ├── Morning Light in the Guild.mp3
│   │   │   ├── Sunlight Through Leaves.mp3
│   │   │   ├── The Quiet Court.mp3
│   │   │   └── Thunder in the Hall.mp3
│   │   ├── quests/
│   │   │   ├── .gitkeep
│   │   │   └── The Moment Before the Shot.mp3
│   │   └── sfx/
│   │       └── .gitkeep
│   ├── backgrounds/
│   │   ├── facilities/
│   │   │   └── .gitkeep
│   │   ├── guild-hall/
│   │   │   ├── .gitkeep
│   │   │   └── guildhall.png
│   │   ├── guilds/
│   │   │   ├── .gitkeep
│   │   │   ├── guildhall.png
│   │   │   └── guildshop_bg.png
│   │   ├── home/
│   │   │   ├── .gitkeep
│   │   │   └── room.png
│   │   ├── masters/
│   │   │   └── .gitkeep
│   │   ├── special/
│   │   │   └── .gitkeep
│   │   └── title/
│   │       ├── .gitkeep
│   │       └── title.PNG
│   ├── characters/
│   │   ├── masters/
│   │   │   ├── japanese/
│   │   │   │   └── .gitkeep
│   │   │   ├── math/
│   │   │   │   └── .gitkeep
│   │   │   ├── science/
│   │   │   │   └── .gitkeep
│   │   │   └── social/
│   │   │       └── .gitkeep
│   │   └── player/
│   │       ├── accessories/
│   │       │   ├── .gitkeep
│   │       │   └── neckwarmer_acc.PNG
│   │       ├── base/
│   │       │   ├── .gitkeep
│   │       │   └── base.png
│   │       ├── clothes/
│   │       │   ├── .gitkeep
│   │       │   ├── bottoms/
│   │       │   │   ├── .gitkeep
│   │       │   │   ├── battle_bottoms.PNG
│   │       │   │   ├── bluejeans_bottoms.PNG
│   │       │   │   ├── cycling_bottoms.PNG
│   │       │   │   ├── default_bottoms.png
│   │       │   │   ├── doctor_bottoms.PNG
│   │       │   │   ├── kyudo_bottoms.PNG
│   │       │   │   ├── longskirtgrey_bottoms.PNG
│   │       │   │   ├── rocknroll_bottoms.PNG
│   │       │   │   ├── schooluniform_bottoms.PNG
│   │       │   │   ├── stripe_bottoms.PNG
│   │       │   │   └── tennis_bottoms.PNG
│   │       │   ├── capes/
│   │       │   │   ├── .gitkeep
│   │       │   │   ├── kokugoguild_capes.PNG
│   │       │   │   └── rikaguild_capes.PNG
│   │       │   ├── gloves/
│   │       │   │   └── .gitkeep
│   │       │   ├── outer/
│   │       │   │   ├── .gitkeep
│   │       │   │   └── cloudstrife_outerset.PNG
│   │       │   ├── shoes/
│   │       │   │   ├── .gitkeep
│   │       │   │   ├── doctor_shoes.PNG
│   │       │   │   ├── kyudo_shoes.PNG
│   │       │   │   └── schooluniform_shoes.PNG
│   │       │   └── tops/
│   │       │       ├── .gitkeep
│   │       │       ├── battle_tops.PNG
│   │       │       ├── border_tops.PNG
│   │       │       ├── cycling_tops.PNG
│   │       │       ├── default_tops.png
│   │       │       ├── doctor_tops.PNG
│   │       │       ├── foody_tops.PNG
│   │       │       ├── kyudo_tops.PNG
│   │       │       ├── lightning_tops.PNG
│   │       │       ├── mountainparker_tops.PNG
│   │       │       ├── rocknroll_tops.PNG
│   │       │       ├── schooluniform_tops.PNG
│   │       │       ├── schooluniformsummer_tops.PNG
│   │       │       └── tennis_tops.PNG
│   │       ├── face/
│   │       │   └── .gitkeep
│   │       ├── hands/
│   │       │   └── .gitkeep
│   │       ├── head/
│   │       │   ├── .gitkeep
│   │       │   ├── glasses_head.PNG
│   │       │   └── google_head.PNG
│   │       └── templates/
│   │           └── .gitkeep
│   ├── items/
│   │   ├── consumables/
│   │   │   └── .gitkeep
│   │   ├── decorations/
│   │   │   └── .gitkeep
│   │   └── furniture/
│   │       └── .gitkeep
│   └── ui/
│       ├── buttons/
│       │   ├── .gitkeep
│       │   ├── numberpad_bg.png
│       │   ├── wood_button_pressed.png
│       │   ├── wood_button.png
│       │   └── wood_panel.png
│       ├── effects/
│       │   └── .gitkeep
│       ├── frames/
│       │   └── .gitkeep
│       └── icons/
│           └── .gitkeep
├── css/
│   ├── common.css
│   ├── components/
│   │   └── .gitkeep
│   ├── developer.css
│   ├── layout.css
│   └── screens/
│       ├── .gitkeep
│       └── common.css
├── data/
│   ├── achievements/
│   │   └── .gitkeep
│   ├── exams/
│   │   └── .gitkeep
│   ├── facilities/
│   │   └── .gitkeep
│   ├── items/
│   │   ├── .gitkeep
│   │   └── items.js
│   ├── masters/
│   │   └── .gitkeep
│   ├── quests/
│   │   └── .gitkeep
│   ├── rewards/
│   │   └── .gitkeep
│   └── shop/
│       ├── .gitkeep
│       └── music.js
├── docs/
│   ├── .gitkeep
│   ├── asset-guide.md
│   ├── development-log.md
│   └── game-rules.md
├── index.html
├── js/
│   ├── app.js
│   ├── components/
│   │   └── .gitkeep
│   ├── developer.js
│   ├── numberpad.js
│   ├── quests/
│   │   ├── cleaning.js
│   │   ├── daily.js
│   │   ├── engine.js
│   │   ├── exercise.js
│   │   ├── hyakumasu.js
│   │   ├── kanji.js
│   │   ├── math.js
│   │   ├── music.js
│   │   ├── reading.js
│   │   ├── science.js
│   │   └── society.js
│   ├── screens/
│   │   ├── .gitkeep
│   │   ├── musicShop.js
│   │   ├── shop.js
│   │   └── wardrobe.js
│   ├── settings.js
│   ├── storage.js
│   └── systems/
│       ├── .gitkeep
│       ├── musicPlayer.js
│       ├── questEngine.js
│       └── questMusicPlayer.js
├── manifest.webmanifest
├── project-index.json
├── README.md
├── saves/
│   └── .gitkeep
├── service-worker.js
├── tests/
│   └── .gitkeep
└── tools/
    └── generateProjectState.js
```

※自動生成される次の2ファイル自身は、循環防止のためツリーから除外しています。

- `docs/GPT_PROJECT_STATE.md`
- `docs/PROJECT_STATE.json`

## 4. index.htmlの読み込み順

### CSS

1. `css/common.css?v=20260721-1`
2. `css/layout.css?v=20260722-2`
3. `css/developer.css?v=20260721-1`

### JavaScript

1. `js/settings.js?v=20260722-3`
2. `data/items/items.js?v=20260722-2`
3. `data/shop/music.js?v=20260721-1`
4. `js/systems/musicPlayer.js?v=20260721-1`
5. `js/systems/questMusicPlayer.js?v=20260721-1`
6. `js/screens/shop.js?v=20260721-1`
7. `js/screens/musicShop.js?v=20260721-1`
8. `js/screens/wardrobe.js?v=20260722-2`
9. `js/systems/questEngine.js?v=20260722-3`
10. `js/quests/daily.js?v=20260721-1`
11. `js/numberpad.js?v=20260721-1`
12. `js/quests/hyakumasu.js?v=20260722-3`
13. `js/developer.js?v=20260721-1`
14. `js/app.js?v=20260722-3`

### 画像参照

1. `assets/characters/player/base/base.png`
2. `assets/characters/player/clothes/bottoms/default_bottoms.png`
3. `assets/characters/player/clothes/tops/default_tops.png`

### Manifest

1. `manifest.webmanifest?v=20260721-1`

## 5. JavaScriptファイル一覧

- `data/items/items.js`
- `data/shop/music.js`
- `js/app.js`
- `js/developer.js`
- `js/numberpad.js`
- `js/quests/cleaning.js`
- `js/quests/daily.js`
- `js/quests/engine.js`
- `js/quests/exercise.js`
- `js/quests/hyakumasu.js`
- `js/quests/kanji.js`
- `js/quests/math.js`
- `js/quests/music.js`
- `js/quests/reading.js`
- `js/quests/science.js`
- `js/quests/society.js`
- `js/screens/musicShop.js`
- `js/screens/shop.js`
- `js/screens/wardrobe.js`
- `js/settings.js`
- `js/storage.js`
- `js/systems/musicPlayer.js`
- `js/systems/questEngine.js`
- `js/systems/questMusicPlayer.js`
- `service-worker.js`
- `tools/generateProjectState.js`

## 6. CSSファイル一覧

- `css/common.css`
- `css/developer.css`
- `css/layout.css`
- `css/screens/common.css`

## 7. HTML・データファイル一覧

### HTML

- `index.html`

### JSON・Web Manifest

- `manifest.webmanifest`
- `project-index.json`

## 8. 画像アセット一覧

- `assets/app-icons/apple-touch-icon.png`
- `assets/app-icons/icon-192.png`
- `assets/app-icons/icon-512.png`
- `assets/backgrounds/guild-hall/guildhall.png`
- `assets/backgrounds/guilds/guildhall.png`
- `assets/backgrounds/guilds/guildshop_bg.png`
- `assets/backgrounds/home/room.png`
- `assets/backgrounds/title/title.PNG`
- `assets/characters/player/accessories/neckwarmer_acc.PNG`
- `assets/characters/player/base/base.png`
- `assets/characters/player/clothes/bottoms/battle_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/bluejeans_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/cycling_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/default_bottoms.png`
- `assets/characters/player/clothes/bottoms/doctor_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/kyudo_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/longskirtgrey_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/rocknroll_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/schooluniform_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/stripe_bottoms.PNG`
- `assets/characters/player/clothes/bottoms/tennis_bottoms.PNG`
- `assets/characters/player/clothes/capes/kokugoguild_capes.PNG`
- `assets/characters/player/clothes/capes/rikaguild_capes.PNG`
- `assets/characters/player/clothes/outer/cloudstrife_outerset.PNG`
- `assets/characters/player/clothes/shoes/doctor_shoes.PNG`
- `assets/characters/player/clothes/shoes/kyudo_shoes.PNG`
- `assets/characters/player/clothes/shoes/schooluniform_shoes.PNG`
- `assets/characters/player/clothes/tops/battle_tops.PNG`
- `assets/characters/player/clothes/tops/border_tops.PNG`
- `assets/characters/player/clothes/tops/cycling_tops.PNG`
- `assets/characters/player/clothes/tops/default_tops.png`
- `assets/characters/player/clothes/tops/doctor_tops.PNG`
- `assets/characters/player/clothes/tops/foody_tops.PNG`
- `assets/characters/player/clothes/tops/kyudo_tops.PNG`
- `assets/characters/player/clothes/tops/lightning_tops.PNG`
- `assets/characters/player/clothes/tops/mountainparker_tops.PNG`
- `assets/characters/player/clothes/tops/rocknroll_tops.PNG`
- `assets/characters/player/clothes/tops/schooluniform_tops.PNG`
- `assets/characters/player/clothes/tops/schooluniformsummer_tops.PNG`
- `assets/characters/player/clothes/tops/tennis_tops.PNG`
- `assets/characters/player/head/glasses_head.PNG`
- `assets/characters/player/head/google_head.PNG`
- `assets/ui/buttons/numberpad_bg.png`
- `assets/ui/buttons/wood_button_pressed.png`
- `assets/ui/buttons/wood_button.png`
- `assets/ui/buttons/wood_panel.png`

## 9. 音声アセット一覧

- `assets/audio/bgm/Afternoon in the Academy.mp3`
- `assets/audio/bgm/Bloom in the Garden.mp3`
- `assets/audio/bgm/Candlelit Banquet.mp3`
- `assets/audio/bgm/Harbor Breeze.mp3`
- `assets/audio/bgm/Morning Light in the Guild.mp3`
- `assets/audio/bgm/Sunlight Through Leaves.mp3`
- `assets/audio/bgm/The Quiet Court.mp3`
- `assets/audio/bgm/Thunder in the Hall.mp3`
- `assets/audio/quests/The Moment Before the Shot.mp3`

## 10. 動画アセット一覧

_該当ファイルなし_

## 11. 自動検査

### index.htmlの参照切れ

参照切れは検出されませんでした。

### 大文字・小文字の衝突候補

衝突候補は検出されませんでした。

## 12. 開発メモ

まだ `docs/PROJECT_NOTES.md` は作成されていません。

---

この設計図を新しいGPTスレッドの冒頭で共有すると、現在のファイル構成と正確なパスを引き継げます。
