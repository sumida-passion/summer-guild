"use strict";

/* =========================================================
   夏休みギルド Service Worker

   目的：
   ・ホーム画面版でも最新版のHTML / JS / CSSを取得する
   ・通信できない時は直前に取得したファイルを使う
   ・LocalStorage（GP・衣装・招待済み楽団など）には触れない
   ========================================================= */

const SW_VERSION = "2026.07.22-mathguild1";
const CACHE_PREFIX = "summer-guild-";
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${SW_VERSION}`;

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();

        await Promise.all(
            cacheNames
                .filter((name) => (
                    name.startsWith(CACHE_PREFIX)
                    && name !== RUNTIME_CACHE
                ))
                .map((name) => caches.delete(name))
        );

        await self.clients.claim();

        const clients = await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
        });

        clients.forEach((client) => {
            client.postMessage({
                type: "SUMMER_GUILD_SW_ACTIVATED",
                version: SW_VERSION
            });
        });
    })());
});

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    /*
      Safari / iPadの音声Rangeリクエストはブラウザへ任せる。
      Service Workerが200応答へ置き換えると、MP3再生が不安定になるため。
    */
    if (
        request.headers.has("range")
        || request.destination === "audio"
        || request.destination === "video"
    ) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request, true));
        return;
    }

    if (
        request.destination === "script"
        || request.destination === "style"
        || request.destination === "document"
        || url.pathname.endsWith(".webmanifest")
    ) {
        event.respondWith(networkFirst(request, false));
        return;
    }

    if (
        request.destination === "image"
        || request.destination === "font"
    ) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    event.respondWith(networkFirst(request, false));
});

async function networkFirst(request, isNavigation) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        const response = await fetch(request, {
            cache: "no-store"
        });

        if (response && response.ok) {
            await cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        if (isNavigation) {
            const fallback = await cache.match("./index.html")
                || await cache.match("./");

            if (fallback) {
                return fallback;
            }
        }

        return new Response(
            "オフラインのため、このファイルを読み込めませんでした。",
            {
                status: 503,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8"
                }
            }
        );
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    const networkPromise = fetch(request, {
        cache: "no-store"
    }).then(async (response) => {
        if (response && response.ok) {
            await cache.put(request, response.clone());
        }

        return response;
    }).catch(() => null);

    if (cached) {
        eventWaitUntilSafely(networkPromise);
        return cached;
    }

    const response = await networkPromise;

    if (response) {
        return response;
    }

    return new Response("", { status: 504 });
}

function eventWaitUntilSafely(promise) {
    promise.catch(() => {});
}
