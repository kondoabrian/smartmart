// =========================================================
// SMARTMART SERVICE WORKER
// =========================================================

const CACHE_NAME = "smartmart-v1";


// =========================================================
// INSTALL
// =========================================================

self.addEventListener("install", function(event) {

    console.log("SmartMart service worker installed.");

    self.skipWaiting();

});


// =========================================================
// ACTIVATE
// =========================================================

self.addEventListener("activate", function(event) {

    console.log("SmartMart service worker activated.");

    event.waitUntil(
        caches.keys().then(function(cacheNames) {

            return Promise.all(

                cacheNames.map(function(cacheName) {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                })

            );

        })
    );

    self.clients.claim();

});


// =========================================================
// FETCH
// =========================================================

self.addEventListener("fetch", function(event) {

    // Only handle normal GET requests.
    // We do not cache POST requests such as checkout,
    // add-to-cart or admin actions.

    if (event.request.method !== "GET") {

        return;

    }


    event.respondWith(

        fetch(event.request)

            .then(function(response) {

                return response;

            })

            .catch(function() {

                return caches.match(event.request);

            })

    );

});