"use strict";

/* =========================================================
   夏休みギルド ギルドホールBGM再生管理
   ========================================================= */

const GUILD_MUSIC_STORAGE_KEY = "summerGuildMusicSelection";
const DEFAULT_GUILD_MUSIC_ID = "music_beginning_hall";
const GUILD_MUSIC_SCREENS = new Set(["guildhall", "guildshop"]);

let guildMusicCurrentScreen = "title";
let guildMusicPreviewTimer = null;
let guildMusicPreviewing = false;

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

function stopGuildMusicPreview() {
    if (guildMusicPreviewTimer) {
        window.clearTimeout(guildMusicPreviewTimer);
        guildMusicPreviewTimer = null;
    }

    guildMusicPreviewing = false;

    const audio = getGuildMusicAudio();
    if (audio) {
        audio.pause();
    }
}

function loadGuildMusicTrack(track, startTime = 0) {
    const audio = getGuildMusicAudio();

    if (!audio || !track) {
        return false;
    }

    const expected = new URL(track.file, document.baseURI).href;

    if (audio.src !== expected) {
        audio.src = track.file;
        audio.load();
    }

    const seek = () => {
        try {
            audio.currentTime = Math.max(0, Number(startTime) || 0);
        } catch (error) {
            console.warn("BGMの再生位置を設定できませんでした。", error);
        }
    };

    if (audio.readyState >= 1) {
        seek();
    } else {
        audio.addEventListener("loadedmetadata", seek, { once: true });
    }

    return true;
}

async function playSelectedGuildMusic() {
    if (!GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen) || guildMusicPreviewing) {
        return false;
    }

    const track = findGuildMusicTrack(getSelectedGuildMusicId());
    const audio = getGuildMusicAudio();

    if (!track || !audio) {
        return false;
    }

    loadGuildMusicTrack(track, 0);
    audio.loop = true;
    audio.volume = 0.55;

    try {
        await audio.play();
        return true;
    } catch (error) {
        /* iPad Safariの自動再生制限時は、次のタップで再試行する。 */
        return false;
    }
}

function pauseGuildMusic() {
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

    if (GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen)) {
        await playSelectedGuildMusic();
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

    stopGuildMusicPreview();
    guildMusicPreviewing = true;

    loadGuildMusicTrack(track, track.previewStart || 0);
    audio.loop = false;
    audio.volume = 0.72;

    try {
        await audio.play();
    } catch (error) {
        guildMusicPreviewing = false;
        return false;
    }

    guildMusicPreviewTimer = window.setTimeout(async () => {
        guildMusicPreviewTimer = null;
        guildMusicPreviewing = false;
        audio.pause();

        if (GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen)) {
            await playSelectedGuildMusic();
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

function initGuildMusicPlayer() {
    const resumeFromTap = () => {
        if (GUILD_MUSIC_SCREENS.has(guildMusicCurrentScreen) && !guildMusicPreviewing) {
            playSelectedGuildMusic();
        }
    };

    document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element
            ? event.target.closest("#gotoGuildHall, #gotoGuildShop, #backGuildHallFromShop")
            : null;

        if (target) {
            const track = findGuildMusicTrack(getSelectedGuildMusicId());
            const audio = getGuildMusicAudio();

            if (track && audio && !guildMusicPreviewing) {
                loadGuildMusicTrack(track, 0);
                audio.loop = true;
                audio.volume = 0.55;
                audio.play().catch(() => {});
            }
        } else {
            resumeFromTap();
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
    stopPreview: stopGuildMusicPreview,
    resume: playSelectedGuildMusic
};
