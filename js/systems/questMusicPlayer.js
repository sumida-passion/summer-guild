"use strict";

/* =========================================================
   夏休みギルド クエスト専用BGM再生管理

   方針
   ・ギルドホールの招待BGMとは別系統で管理する
   ・百マス計算の開始から採点・中止まで流す
   ・マスのタップでは再読み込みせず、そのまま流し続ける
   ・アプリが背景へ移った時点で必ず一時停止する
   ========================================================= */

const HYAKUMASU_MUSIC_FILE =
    "assets/audio/quests/The Moment Before the Shot.mp3";

let questMusicAudio = null;
let questMusicMode = "";
let questMusicResumeWhenVisible = false;

function getQuestMusicAudio() {

    if (questMusicAudio) {
        return questMusicAudio;
    }

    questMusicAudio = new Audio();
    questMusicAudio.preload = "auto";
    questMusicAudio.loop = true;
    questMusicAudio.volume = 0.58;

    return questMusicAudio;

}

function getQuestMusicUrl(filePath) {

    return new URL(
        filePath,
        document.baseURI
    ).href;

}

async function playQuestMusic(
    mode,
    filePath,
    options = {}
) {

    if (
        document.visibilityState
        === "hidden"
    ) {
        return false;
    }

    const audio =
        getQuestMusicAudio();

    const targetUrl =
        getQuestMusicUrl(
            filePath
        );

    const isSameMusic =
        questMusicMode === mode
        && audio.src === targetUrl;

    if (!isSameMusic) {

        audio.pause();
        audio.src = filePath;
        audio.load();

        questMusicMode = mode;

    }

    if (
        options.restart === true
    ) {

        try {
            audio.currentTime = 0;
        } catch (error) {
            console.warn(
                "クエストBGMを先頭へ戻せませんでした。",
                error
            );
        }

    }

    audio.loop = true;
    audio.volume = 0.58;

    if (!audio.paused) {
        return true;
    }

    try {

        await audio.play();
        return true;

    } catch (error) {

        /*
         * iPad Safariで再生が保留された場合は、
         * 次のユーザー操作時にもう一度開始できるようにする。
         */
        return false;

    }

}

function playHyakumasuMusic(
    options = {}
) {

    return playQuestMusic(
        "hyakumasu",
        HYAKUMASU_MUSIC_FILE,
        options
    );

}

function pauseQuestMusic() {

    if (!questMusicAudio) {
        return;
    }

    questMusicAudio.pause();

}

function stopQuestMusic() {

    if (!questMusicAudio) {
        questMusicMode = "";
        return;
    }

    questMusicAudio.pause();

    try {
        questMusicAudio.currentTime = 0;
    } catch (error) {
        console.warn(
            "クエストBGMを停止位置へ戻せませんでした。",
            error
        );
    }

    questMusicAudio.removeAttribute(
        "src"
    );

    questMusicAudio.load();
    questMusicMode = "";
    questMusicResumeWhenVisible = false;

}

function pauseQuestMusicForBackground() {

    questMusicResumeWhenVisible = Boolean(
        questMusicAudio
        && !questMusicAudio.paused
        && questMusicMode
    );

    pauseQuestMusic();

}

function resumeQuestMusicAfterBackground() {

    if (
        !questMusicResumeWhenVisible
        || !questMusicMode
    ) {
        return;
    }

    questMusicResumeWhenVisible = false;

    if (
        questMusicMode
        === "hyakumasu"
    ) {
        playHyakumasuMusic();
    }

}

function initQuestMusicPlayer() {

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState
                === "hidden"
            ) {

                pauseQuestMusicForBackground();

            } else {

                resumeQuestMusicAfterBackground();

            }

        }
    );

    window.addEventListener(
        "pagehide",
        pauseQuestMusicForBackground
    );

    window.addEventListener(
        "beforeunload",
        stopQuestMusic
    );

    /*
     * 自動再生制限で開始できなかった場合だけ、
     * 百マス画面での次のタップを再生開始のきっかけにする。
     * 同じ曲は読み込み直さないので、再生中のタップでは先頭へ戻らない。
     */
    document.addEventListener(
        "pointerdown",
        () => {

            if (
                questMusicMode
                === "hyakumasu"
                && questMusicAudio
                && questMusicAudio.paused
                && document.visibilityState
                    !== "hidden"
            ) {
                playHyakumasuMusic();
            }

        },
        {
            passive: true
        }
    );

}

window.QuestMusicPlayer = {
    init:
        initQuestMusicPlayer,
    playHyakumasu:
        playHyakumasuMusic,
    pause:
        pauseQuestMusic,
    stop:
        stopQuestMusic,
    isPlaying() {
        return Boolean(
            questMusicAudio
            && !questMusicAudio.paused
        );
    }
};
