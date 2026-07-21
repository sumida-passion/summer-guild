"use strict";

/* =========================================================
   夏休みギルド ギルドホールBGM再生管理

   方針
   ・部屋／ギルドホール／ギルドショップでは同じ曲を流し続ける
   ・画面タップや画面切り替えでは再生位置を先頭へ戻さない
   ・アプリが背景へ移動した時点で必ず一時停止する
   ・試聴後は、選択中BGMの元の再生位置へ戻る
   ========================================================= */

const GUILD_MUSIC_STORAGE_KEY = "summerGuildMusicSelection";
const DEFAULT_GUILD_MUSIC_ID = "music_beginning_hall";
const GUILD_MUSIC_SCREENS = new Set(["room", "guildhall", "guildshop"]);

let guildMusicCurrentScreen = "title";
let guildMusicPreviewTimer = null;
let guildMusicPreviewing = false;
let selectedPlaybackPosition = 0;
let resumeWhenVisible = false;

function getGuildMusicTracks() {
    return Array.isArray(window.GUILD_MUSIC_TRACKS)
        ? window.GUILD_MUSIC_TRACKS
        : [];
}

function findGuildMusicTrack(trackId) {
    return getGuildMusicTracks().find((track) => track && track.id === trackId) || null;
}

function isGuildMusicOwned(track) {
    if (!track) {
        return false;
    }

    if (track.defaultOwned === true || Number(track.price) === 0) {
        return true;
    }

    return typeof isShopItemOwned === "function"
        ? isShopItemOwned(track.id)
        : false;
}

function getSelectedGuildMusicId() {
    try {
        const saved = window.localStorage.getItem(GUILD_MUSIC_STORAGE_KEY);
        const track = findGuildMusicTrack(saved);

        if (track && isGuildMusicOwned(track)) {
            return track.id;
        }
    } catch (error) {
        console.warn("BGM選択情報を読み込めませんでした。", error);
    }

    return DEFAULT_GUILD_MUSIC_ID;
}

function saveSelectedGuildMusicId(trackId) {
    try {
        window.localStorage.setItem(GUILD_MUSIC_STORAGE_KEY, trackId);
        return true;
    } catch (error) {
        console.warn("BGM選択情報を保存できませんでした。", error);
        return false;
    }
}

function getGuildMusicAudio() {
    return document.getElementById("guildMusicAudio");
}

function getTrackUrl(track) {
    return track ? new URL(track.file, document.baseURI).href : "";
}

function isTrackLoaded(audio, track) {
    return Boolean(audio && track && audio.src === getTrackUrl(track));
}

function rememberSelectedPlaybackPosition() {
    const audio = getGuildMusicAudio();
    const selectedTrack = findGuildMusicTrack(getSelectedGuildMusicId());

    if (!audio || !selectedTrack || guildMusicPreviewing || !isTrackLoaded(audio, selectedTrack)) {
        return;
    }

    if (Number.isFinite(audio.currentTime)) {
        selectedPlaybackPosition = Math.max(0, audio.currentTime);
    }
}

function seekAudio(audio, startTime) {
    const targetTime = Math.max(0, Number(startTime) || 0);

    const seek = () => {
        try {
            audio.currentTime = targetTime;
        } catch (error) {
            console.warn("BGMの再生位置を設定できませんでした。", error);
        }
    };

    if (audio.readyState >= 1) {
        seek();
    } else {
        audio.addEventListener("loadedmetadata", seek, { once: true });
    }
}

/*
 * 曲が変わる時だけsrcを差し替える。
 * 同じ曲ならcurrentTimeへ触れないため、画面タップで先頭に戻らない。
 */
function ensureGuildMusicTrack(track, startTime = 0) {
    const audio = getGuildMusicAudio();

    if (!audio || !track) {
        return false;
    }

    if (!isTrackLoaded(audio, track)) {
        audio.src = track.file;
        audio.load();
        seekAudio(audio, startTime);
        return true;
    }

    return false;
}

function stopGuildMusicPreview(options = {}) {
    const shouldResume = options.resume === true;

    if (guildMusicPreviewTimer) {
        window.clearTimeout(guildMusicPreviewTimer);
        guildMusicPreviewTimer = null;
    }

    const wasPreviewing = guildMusicPreviewing;
    guildMusicPreviewing = false;

    const audio = getGuildMusicAudio();
    if (audio && wasPreviewing) {
        audio.pause();
    }

    if (shouldResume && wasPreviewing && GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen)) {
        playSelectedGuildMusic();
    }
}

async function playSelectedGuildMusic(options = {}) {
    if (!GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen) || guildMusicPreviewing) {
        return false;
    }

    if (document.visibilityState === "hidden") {
        return false;
    }

    const track = findGuildMusicTrack(getSelectedGuildMusicId());
    const audio = getGuildMusicAudio();

    if (!track || !audio) {
        return false;
    }

    const forceRestart = options.restart === true;
    const loadedNow = ensureGuildMusicTrack(
        track,
        forceRestart ? 0 : selectedPlaybackPosition
    );

    if (forceRestart && !loadedNow) {
        seekAudio(audio, 0);
        selectedPlaybackPosition = 0;
    }

    audio.loop = true;
    audio.volume = 0.55;

    if (!audio.paused) {
        return true;
    }

    try {
        await audio.play();
        return true;
    } catch (error) {
        /* iPad Safariの自動再生制限時は、次の操作で再試行する。 */
        return false;
    }
}

function pauseGuildMusic() {
    rememberSelectedPlaybackPosition();

    const audio = getGuildMusicAudio();
    if (audio) {
        audio.pause();
    }
}

async function selectGuildMusic(trackId) {
    const track = findGuildMusicTrack(trackId);

    if (!track || !isGuildMusicOwned(track)) {
        return false;
    }

    stopGuildMusicPreview();
    saveSelectedGuildMusicId(track.id);
    selectedPlaybackPosition = 0;

    const audio = getGuildMusicAudio();
    if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
    }

    if (GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen)) {
        await playSelectedGuildMusic({ restart: true });
    }

    document.dispatchEvent(new CustomEvent("guildmusicchange", {
        detail: { trackId: track.id }
    }));

    return true;
}

async function previewGuildMusic(trackId) {
    const track = findGuildMusicTrack(trackId);
    const audio = getGuildMusicAudio();

    if (!track || !audio) {
        return false;
    }

    rememberSelectedPlaybackPosition();
    stopGuildMusicPreview();
    guildMusicPreviewing = true;

    audio.pause();
    audio.src = track.file;
    audio.load();
    seekAudio(audio, track.previewStart || 0);
    audio.loop = false;
    audio.volume = 0.72;

    try {
        await audio.play();
    } catch (error) {
        guildMusicPreviewing = false;
        return false;
    }

    guildMusicPreviewTimer = window.setTimeout(() => {
        guildMusicPreviewTimer = null;
        guildMusicPreviewing = false;
        audio.pause();

        if (GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen)) {
            playSelectedGuildMusic();
        }

        document.dispatchEvent(new CustomEvent("guildmusicpreviewend"));
    }, 15000);

    return true;
}

function handleGuildMusicScreenChange(screenName) {
    guildMusicCurrentScreen = screenName;

    if (GUILD_MUSIC_SCREENS.has(screenName)) {
        playSelectedGuildMusic();
    } else {
        stopGuildMusicPreview();
        pauseGuildMusic();
    }
}

function pauseForBackground() {
    const audio = getGuildMusicAudio();
    resumeWhenVisible = Boolean(
        audio
        && !audio.paused
        && GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen)
    );

    stopGuildMusicPreview();
    pauseGuildMusic();
}

function resumeAfterBackground() {
    if (!resumeWhenVisible) {
        return;
    }

    resumeWhenVisible = false;

    if (GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen)) {
        playSelectedGuildMusic();
    }
}

function initGuildMusicPlayer() {
    const audio = getGuildMusicAudio();

    if (audio && audio.dataset.guildMusicBound !== "true") {
        audio.addEventListener("timeupdate", rememberSelectedPlaybackPosition);
        audio.dataset.guildMusicBound = "true";
    }

    /*
     * iPadのホーム画面アプリ／Safariが背景へ移った瞬間に停止する。
     * これにより、アプリを閉じた後も延々と再生される状態を防ぐ。
     */
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            pauseForBackground();
        } else {
            resumeAfterBackground();
        }
    });

    window.addEventListener("pagehide", pauseForBackground);

    /*
     * 自動再生制限で開始できなかった時だけ、次のタップで再試行する。
     * 同じ曲を再読み込みしないため、再生位置は先頭へ戻らない。
     */
    document.addEventListener("pointerdown", () => {
        if (GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen) && !guildMusicPreviewing) {
            playSelectedGuildMusic();
        }
    }, { passive: true });
}

window.GuildMusicPlayer = {
    init: initGuildMusicPlayer,
    handleScreenChange: handleGuildMusicScreenChange,
    getTracks: getGuildMusicTracks,
    findTrack: findGuildMusicTrack,
    isOwned: isGuildMusicOwned,
    getSelectedId: getSelectedGuildMusicId,
    select: selectGuildMusic,
    preview: previewGuildMusic,
    stopPreview: () => stopGuildMusicPreview(),
    resume: playSelectedGuildMusic,
    pause: pauseGuildMusic
};
