"use strict";

/*
 * Summer Guild Project State Generator
 *
 * このスクリプトは、リポジトリの現在状態を読み取り、
 * 次の2ファイルを自動生成します。
 *
 * docs/GPT_PROJECT_STATE.md
 * docs/PROJECT_STATE.json
 *
 * 取得する情報：
 * ・正確なファイル名とパス
 * ・大文字／小文字
 * ・フォルダ構造
 * ・画像ファイル一覧
 * ・JavaScript一覧
 * ・CSS一覧
 * ・index.html内の読み込み順
 * ・存在しない参照ファイル
 * ・大文字小文字の衝突候補
 * ・Gitのブランチとコミット情報
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");


/* =========================================================
   1. 基本設定
   ========================================================= */

const ROOT_DIR = path.resolve(__dirname, "..");

const DOCS_DIR = path.join(
    ROOT_DIR,
    "docs"
);

const MARKDOWN_OUTPUT = path.join(
    DOCS_DIR,
    "GPT_PROJECT_STATE.md"
);

const JSON_OUTPUT = path.join(
    DOCS_DIR,
    "PROJECT_STATE.json"
);

const PROJECT_NOTES_FILE = path.join(
    DOCS_DIR,
    "PROJECT_NOTES.md"
);


/*
 * 自動生成ファイル自身は走査対象から除外します。
 * 自分自身を読み込み続ける循環を防ぐためです。
 */
const EXCLUDED_RELATIVE_PATHS = new Set([
    "docs/GPT_PROJECT_STATE.md",
    "docs/PROJECT_STATE.json"
]);


/*
 * 走査しないフォルダ。
 */
const EXCLUDED_DIRECTORY_NAMES = new Set([
    ".git",
    "node_modules"
]);


const IMAGE_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".avif",
    ".ico"
]);

const AUDIO_EXTENSIONS = new Set([
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a",
    ".aac",
    ".flac"
]);

const VIDEO_EXTENSIONS = new Set([
    ".mp4",
    ".webm",
    ".mov",
    ".m4v"
]);


/* =========================================================
   2. 補助関数
   ========================================================= */

function normalizePath(filePath) {

    return filePath
        .split(path.sep)
        .join("/");

}


function getRelativePath(absolutePath) {

    return normalizePath(
        path.relative(
            ROOT_DIR,
            absolutePath
        )
    );

}


function readTextFile(filePath) {

    try {

        return fs.readFileSync(
            filePath,
            "utf8"
        );

    } catch (error) {

        return "";

    }

}


function getGitValue(args, fallback = "") {

    try {

        return execFileSync(
            "git",
            args,
            {
                cwd: ROOT_DIR,
                encoding: "utf8",
                stdio: [
                    "ignore",
                    "pipe",
                    "ignore"
                ]
            }
        ).trim();

    } catch (error) {

        return fallback;

    }

}


function escapeMarkdownTable(value) {

    return String(value)
        .replace(/\|/g, "\\|")
        .replace(/\r?\n/g, " ");

}


/* =========================================================
   3. 全ファイル走査
   ========================================================= */

function collectFiles(
    currentDirectory,
    result = []
) {

    const entries = fs.readdirSync(
        currentDirectory,
        {
            withFileTypes: true
        }
    );

    entries.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name,
                "en",
                {
                    sensitivity: "case"
                }
            )
    );

    for (const entry of entries) {

        if (
            entry.isDirectory()
            && EXCLUDED_DIRECTORY_NAMES.has(
                entry.name
            )
        ) {

            continue;

        }


        const absolutePath = path.join(
            currentDirectory,
            entry.name
        );


        if (entry.isDirectory()) {

            collectFiles(
                absolutePath,
                result
            );

            continue;

        }


        if (!entry.isFile()) {

            continue;

        }


        const relativePath =
            getRelativePath(
                absolutePath
            );


        if (
            EXCLUDED_RELATIVE_PATHS.has(
                relativePath
            )
        ) {

            continue;

        }


        const stats = fs.statSync(
            absolutePath
        );


        result.push({

            path: relativePath,

            name: entry.name,

            extension:
                path.extname(
                    entry.name
                ).toLowerCase(),

            sizeBytes:
                stats.size

        });

    }


    return result;

}


/* =========================================================
   4. フォルダ一覧作成
   ========================================================= */

function collectDirectories(files) {

    const directories =
        new Set();


    for (const file of files) {

        const parts =
            file.path.split("/");


        parts.pop();


        let current = "";


        for (const part of parts) {

            current =
                current
                    ? `${current}/${part}`
                    : part;


            directories.add(
                current
            );

        }

    }


    return Array.from(
        directories
    ).sort(
        (a, b) =>
            a.localeCompare(
                b,
                "en",
                {
                    sensitivity: "case"
                }
            )
    );

}


/* =========================================================
   5. ツリー構造作成
   ========================================================= */

function createTree(files) {

    const root = {};


    for (const file of files) {

        const parts =
            file.path.split("/");


        let current =
            root;


        parts.forEach(
            (part, index) => {

                const isFile =
                    index
                    === parts.length - 1;


                if (isFile) {

                    current[part] =
                        null;

                    return;

                }


                if (
                    !current[part]
                    || typeof current[part]
                        !== "object"
                ) {

                    current[part] = {};

                }


                current =
                    current[part];

            }
        );

    }


    return root;

}


function renderTreeNode(
    node,
    prefix = ""
) {

    const entries =
        Object.entries(node);


    const lines = [];


    entries.forEach(
        ([name, child], index) => {

            const isLast =
                index
                === entries.length - 1;


            const connector =
                isLast
                    ? "└── "
                    : "├── ";


            const isDirectory =
                child !== null;


            lines.push(
                `${prefix}${connector}${name}${isDirectory ? "/" : ""}`
            );


            if (isDirectory) {

                const childPrefix =
                    `${prefix}${isLast ? "    " : "│   "}`;


                lines.push(
                    ...renderTreeNode(
                        child,
                        childPrefix
                    )
                );

            }

        }
    );


    return lines;

}


/* =========================================================
   6. index.htmlの参照取得
   ========================================================= */

function extractAttributeValues(
    html,
    tagName,
    attributeName
) {

    const values = [];

    const tagPattern =
        new RegExp(
            `<${tagName}\\b[^>]*>`,
            "gi"
        );


    const attributePattern =
        new RegExp(
            `${attributeName}\\s*=\\s*["']([^"']+)["']`,
            "i"
        );


    const tags =
        html.match(
            tagPattern
        ) || [];


    for (const tag of tags) {

        const match =
            tag.match(
                attributePattern
            );


        if (match) {

            values.push(
                match[1]
            );

        }

    }


    return values;

}


function cleanLocalReference(reference) {

    if (
        typeof reference !== "string"
    ) {

        return null;

    }


    const trimmed =
        reference.trim();


    if (
        trimmed === ""
        || trimmed.startsWith("#")
        || trimmed.startsWith("data:")
        || trimmed.startsWith("http://")
        || trimmed.startsWith("https://")
        || trimmed.startsWith("//")
        || trimmed.startsWith("mailto:")
        || trimmed.startsWith("tel:")
        || trimmed.startsWith("javascript:")
    ) {

        return null;

    }


    const withoutQuery =
        trimmed.split("?")[0];


    const withoutHash =
        withoutQuery.split("#")[0];


    const withoutLeadingSlash =
        withoutHash.replace(
            /^\/+/,
            ""
        );


    try {

        return decodeURIComponent(
            withoutLeadingSlash
        );

    } catch (error) {

        return withoutLeadingSlash;

    }

}


function analyzeIndexHtml(filePathSet) {

    const indexPath =
        path.join(
            ROOT_DIR,
            "index.html"
        );


    if (
        !fs.existsSync(
            indexPath
        )
    ) {

        return {

            exists: false,

            stylesheets: [],

            scripts: [],

            images: [],

            manifestFiles: [],

            allLocalReferences: [],

            missingReferences: []

        };

    }


    const html =
        readTextFile(
            indexPath
        );


    const links =
        extractAttributeValues(
            html,
            "link",
            "href"
        );


    const scripts =
        extractAttributeValues(
            html,
            "script",
            "src"
        );


    const images =
        extractAttributeValues(
            html,
            "img",
            "src"
        );


    const stylesheets =
        links.filter(
            value =>
                /\.css(?:[?#].*)?$/i.test(
                    value
                )
        );


    const manifestFiles =
        links.filter(
            value =>
                /\.webmanifest(?:[?#].*)?$/i.test(
                    value
                )
                || /manifest\.json(?:[?#].*)?$/i.test(
                    value
                )
        );


    const allRawReferences = [
        ...stylesheets,
        ...scripts,
        ...images,
        ...manifestFiles
    ];


    const allLocalReferences =
        allRawReferences
            .map(
                cleanLocalReference
            )
            .filter(Boolean);


    const missingReferences =
        Array.from(
            new Set(
                allLocalReferences.filter(
                    reference =>
                        !filePathSet.has(
                            reference
                        )
                )
            )
        );


    return {

        exists: true,

        stylesheets,

        scripts,

        images,

        manifestFiles,

        allLocalReferences,

        missingReferences

    };

}


/* =========================================================
   7. 大文字小文字の衝突確認
   ========================================================= */

function findCaseCollisions(files) {

    const pathGroups =
        new Map();


    for (const file of files) {

        const lowerPath =
            file.path.toLowerCase();


        if (
            !pathGroups.has(
                lowerPath
            )
        ) {

            pathGroups.set(
                lowerPath,
                []
            );

        }


        pathGroups
            .get(lowerPath)
            .push(
                file.path
            );

    }


    return Array.from(
        pathGroups.values()
    ).filter(
        group =>
            group.length > 1
    );

}


/* =========================================================
   8. PROJECT_NOTES.md取得
   ========================================================= */

function getProjectNotes() {

    if (
        !fs.existsSync(
            PROJECT_NOTES_FILE
        )
    ) {

        return {

            exists: false,

            content:
                "まだ `docs/PROJECT_NOTES.md` は作成されていません。"

        };

    }


    const content =
        readTextFile(
            PROJECT_NOTES_FILE
        ).trim();


    return {

        exists: true,

        content:
            content
            || "PROJECT_NOTES.mdは空です。"

    };

}


/* =========================================================
   9. データ生成
   ========================================================= */

function buildProjectState() {

    const files =
        collectFiles(
            ROOT_DIR
        );


    const filePathSet =
        new Set(
            files.map(
                file =>
                    file.path
            )
        );


    const directories =
        collectDirectories(
            files
        );


    const images =
        files.filter(
            file =>
                IMAGE_EXTENSIONS.has(
                    file.extension
                )
        );


    const audio =
        files.filter(
            file =>
                AUDIO_EXTENSIONS.has(
                    file.extension
                )
        );


    const video =
        files.filter(
            file =>
                VIDEO_EXTENSIONS.has(
                    file.extension
                )
        );


    const javascript =
        files.filter(
            file =>
                file.extension === ".js"
        );


    const css =
        files.filter(
            file =>
                file.extension === ".css"
        );


    const html =
        files.filter(
            file =>
                file.extension === ".html"
        );


    const json =
        files.filter(
            file =>
                file.extension === ".json"
                || file.extension
                    === ".webmanifest"
        );


    const indexHtml =
        analyzeIndexHtml(
            filePathSet
        );


    const tree =
        createTree(
            files
        );


    const treeLines = [
        "summer-guild/",
        ...renderTreeNode(
            tree
        )
    ];


    const caseCollisions =
        findCaseCollisions(
            files
        );


    const projectNotes =
        getProjectNotes();


    const branch =
        getGitValue(
            [
                "rev-parse",
                "--abbrev-ref",
                "HEAD"
            ],
            process.env.GITHUB_REF_NAME
                || "unknown"
        );


    const commitHash =
        getGitValue(
            [
                "rev-parse",
                "HEAD"
            ],
            process.env.GITHUB_SHA
                || "unknown"
        );


    const shortCommitHash =
        commitHash !== "unknown"
            ? commitHash.slice(0, 7)
            : "unknown";


    const latestCommitMessage =
        getGitValue(
            [
                "log",
                "-1",
                "--pretty=%s"
            ],
            "unknown"
        );


    const repository =
        process.env.GITHUB_REPOSITORY
        || getGitValue(
            [
                "config",
                "--get",
                "remote.origin.url"
            ],
            "unknown"
        );


    return {

        generator: {

            name:
                "Summer Guild Project State Generator",

            version:
                "1.0.0",

            generatedAt:
                new Date()
                    .toISOString(),

            excludedGeneratedFiles: [
                "docs/GPT_PROJECT_STATE.md",
                "docs/PROJECT_STATE.json"
            ]

        },


        git: {

            repository,

            branch,

            commitHash,

            shortCommitHash,

            latestCommitMessage

        },


        summary: {

            fileCount:
                files.length,

            directoryCount:
                directories.length,

            imageCount:
                images.length,

            audioCount:
                audio.length,

            videoCount:
                video.length,

            javascriptCount:
                javascript.length,

            cssCount:
                css.length,

            htmlCount:
                html.length,

            dataFileCount:
                json.length

        },


        directories,


        files:
            files.map(
                file =>
                    file.path
            ),


        fileDetails:
            files,


        assets: {

            images:
                images.map(
                    file =>
                        file.path
                ),

            audio:
                audio.map(
                    file =>
                        file.path
                ),

            video:
                video.map(
                    file =>
                        file.path
                )

        },


        sourceFiles: {

            javascript:
                javascript.map(
                    file =>
                        file.path
                ),

            css:
                css.map(
                    file =>
                        file.path
                ),

            html:
                html.map(
                    file =>
                        file.path
                ),

            data:
                json.map(
                    file =>
                        file.path
                )

        },


        indexHtml,


        warnings: {

            missingIndexReferences:
                indexHtml
                    .missingReferences,

            caseCollisions

        },


        tree: {

            lines:
                treeLines,

            text:
                treeLines.join("\n")

        },


        projectNotes

    };

}


/* =========================================================
   10. Markdown生成
   ========================================================= */

function renderPathList(paths) {

    if (
        !paths
        || paths.length === 0
    ) {

        return "_該当ファイルなし_";

    }


    return paths
        .map(
            filePath =>
                `- \`${filePath}\``
        )
        .join("\n");

}


function renderNumberedList(paths) {

    if (
        !paths
        || paths.length === 0
    ) {

        return "_該当ファイルなし_";

    }


    return paths
        .map(
            (filePath, index) =>
                `${index + 1}. \`${filePath}\``
        )
        .join("\n");

}


function renderWarnings(state) {

    const sections = [];


    if (
        state.warnings
            .missingIndexReferences
            .length === 0
    ) {

        sections.push(
            "### index.htmlの参照切れ\n\n参照切れは検出されませんでした。"
        );

    } else {

        sections.push(
            [
                "### index.htmlの参照切れ",
                "",
                "以下のパスは、`index.html`から参照されていますが、リポジトリ内に同一表記のファイルが見つかりません。",
                "",
                renderPathList(
                    state.warnings
                        .missingIndexReferences
                )
            ].join("\n")
        );

    }


    if (
        state.warnings
            .caseCollisions
            .length === 0
    ) {

        sections.push(
            "### 大文字・小文字の衝突候補\n\n衝突候補は検出されませんでした。"
        );

    } else {

        const collisionText =
            state.warnings
                .caseCollisions
                .map(
                    group =>
                        group
                            .map(
                                filePath =>
                                    `- \`${filePath}\``
                            )
                            .join("\n")
                )
                .join("\n\n");


        sections.push(
            [
                "### 大文字・小文字の衝突候補",
                "",
                "WindowsやmacOSでは同一扱いでも、GitHub Pages上では別ファイルになる可能性があります。",
                "",
                collisionText
            ].join("\n")
        );

    }


    return sections.join("\n\n");

}


function renderMarkdown(state) {

    const generatedAt =
        state.generator
            .generatedAt;


    const lines = [

        "# Summer Guild｜GPT Project State",

        "",

        "> このファイルは自動生成されています。",

        "> ファイル名・フォルダ名・大文字小文字は、ここに記録された表記を正として扱います。",

        "",

        "## 1. 生成情報",

        "",

        "| 項目 | 内容 |",

        "|---|---|",

        `| 生成日時（UTC） | ${escapeMarkdownTable(generatedAt)} |`,

        `| リポジトリ | ${escapeMarkdownTable(state.git.repository)} |`,

        `| ブランチ | \`${escapeMarkdownTable(state.git.branch)}\` |`,

        `| コミット | \`${escapeMarkdownTable(state.git.shortCommitHash)}\` |`,

        `| 最新コミット | ${escapeMarkdownTable(state.git.latestCommitMessage)} |`,

        "",

        "## 2. プロジェクト概要",

        "",

        "| 種類 | 数 |",

        "|---|---:|",

        `| 全ファイル | ${state.summary.fileCount} |`,

        `| フォルダ | ${state.summary.directoryCount} |`,

        `| 画像 | ${state.summary.imageCount} |`,

        `| 音声 | ${state.summary.audioCount} |`,

        `| 動画 | ${state.summary.videoCount} |`,

        `| JavaScript | ${state.summary.javascriptCount} |`,

        `| CSS | ${state.summary.cssCount} |`,

        `| HTML | ${state.summary.htmlCount} |`,

        "",

        "## 3. 全体フォルダ構造",

        "",

        "```text",

        state.tree.text,

        "```",

        "",

        "※自動生成される次の2ファイル自身は、循環防止のためツリーから除外しています。",

        "",

        "- `docs/GPT_PROJECT_STATE.md`",

        "- `docs/PROJECT_STATE.json`",

        "",

        "## 4. index.htmlの読み込み順",

        "",

        "### CSS",

        "",

        renderNumberedList(
            state.indexHtml
                .stylesheets
        ),

        "",

        "### JavaScript",

        "",

        renderNumberedList(
            state.indexHtml
                .scripts
        ),

        "",

        "### 画像参照",

        "",

        renderNumberedList(
            state.indexHtml
                .images
        ),

        "",

        "### Manifest",

        "",

        renderNumberedList(
            state.indexHtml
                .manifestFiles
        ),

        "",

        "## 5. JavaScriptファイル一覧",

        "",

        renderPathList(
            state.sourceFiles
                .javascript
        ),

        "",

        "## 6. CSSファイル一覧",

        "",

        renderPathList(
            state.sourceFiles
                .css
        ),

        "",

        "## 7. HTML・データファイル一覧",

        "",

        "### HTML",

        "",

        renderPathList(
            state.sourceFiles
                .html
        ),

        "",

        "### JSON・Web Manifest",

        "",

        renderPathList(
            state.sourceFiles
                .data
        ),

        "",

        "## 8. 画像アセット一覧",

        "",

        renderPathList(
            state.assets
                .images
        ),

        "",

        "## 9. 音声アセット一覧",

        "",

        renderPathList(
            state.assets
                .audio
        ),

        "",

        "## 10. 動画アセット一覧",

        "",

        renderPathList(
            state.assets
                .video
        ),

        "",

        "## 11. 自動検査",

        "",

        renderWarnings(
            state
        ),

        "",

        "## 12. 開発メモ",

        "",

        state.projectNotes
            .content,

        "",

        "---",

        "",

        "この設計図を新しいGPTスレッドの冒頭で共有すると、現在のファイル構成と正確なパスを引き継げます。",

        ""

    ];


    return lines.join("\n");

}


/* =========================================================
   11. 出力
   ========================================================= */

function writeOutputs(state) {

    fs.mkdirSync(
        DOCS_DIR,
        {
            recursive: true
        }
    );


    fs.writeFileSync(
        JSON_OUTPUT,
        `${JSON.stringify(
            state,
            null,
            2
        )}\n`,
        "utf8"
    );


    fs.writeFileSync(
        MARKDOWN_OUTPUT,
        renderMarkdown(
            state
        ),
        "utf8"
    );

}


/* =========================================================
   12. 実行
   ========================================================= */

function main() {

    try {

        const state =
            buildProjectState();


        writeOutputs(
            state
        );


        console.log(
            "Project state files were generated successfully."
        );


        console.log(
            "Generated:"
        );


        console.log(
            "- docs/GPT_PROJECT_STATE.md"
        );


        console.log(
            "- docs/PROJECT_STATE.json"
        );


        console.log(
            `Files scanned: ${state.summary.fileCount}`
        );


        if (
            state.warnings
                .missingIndexReferences
                .length > 0
        ) {

            console.warn(
                `Warning: ${state.warnings.missingIndexReferences.length} missing index reference(s) detected.`
            );

        }


        if (
            state.warnings
                .caseCollisions
                .length > 0
        ) {

            console.warn(
                `Warning: ${state.warnings.caseCollisions.length} case collision group(s) detected.`
            );

        }

    } catch (error) {

        console.error(
            "Project state generation failed."
        );


        console.error(
            error
        );


        process.exitCode = 1;

    }

}


main();
