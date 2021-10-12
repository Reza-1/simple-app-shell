//########################################
// serviceworker for Simple App Shell
// Version: v1
//########################################

const cacheName = 'simple_appshell_v1';
const urlsToCache = [
	'/',
	'/index.htm',
	'/styles.css',
	'/script.js',
	'/img/apple-touch-icon.png',
	'/img/favicon.ico',
	'/img/icon_144.png',
	'/img/icon_192.png',
	'/img/icon_512.png',
	'/img/icon_maskable.png',
	'/manifest.json'
];

//########################################
//setup the cache
self.addEventListener('install', function (event) {
	// wait till preload finishes
	event.waitUntil(preLoad());
	console.log("service worker installed & loaded cache");
});

async function preLoad() {
	// open the cache
	const cache = await caches.open(cacheName);
	// fetch and add all pre-defined URLs to cache
	await cache.addAll(urlsToCache);
	//if SW itself is update this makes it take effect immediately for all open tabs
	return self.skipWaiting(); 
}

//########################################
//delete old cache
self.addEventListener('activate', function (event) {
	//console.log('SW activate');
	event.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (key) {
				if (key !== cacheName) {
					//console.log('Delete cache: ', key);
					return caches.delete(key);
				}
			}));
		}).then(function () {
			//console.log('SW claim', cacheName);
			return self.clients.claim();
		})
	);
});


//########################################
//fetch cache first , then network

self.addEventListener('fetch', function (event) {
	console.log('SW fetch: ', event.request.url);

	//first option
	//event.respondWith( cacheFirstThenNetwork(event) );

	//second option
	cacheThenUpdate(event); // ToDo fix the error in console
});

//strategy : cache first then network
async function cacheFirstThenNetwork(event) {
	const response  = await caches.match(event.request);
	return response || fetch(event.request);   
}

//strategy: cache then update cache
//ref : https://serviceworke.rs/strategy-cache-and-update_service-worker_doc.html
function cacheThenUpdate(event) {
	//using respondWith to answer immediately, without waiting for the network response 
	event.respondWith(readFromCache(event.request));
	//using waitUntil to keep service worker alive until the cache is updated.
	event.waitUntil(updateCache(event.request));
}

async function readFromCache(request) {
	try {
		console.log("reading from cache for "+request.url);
		const cache = await caches.open(cacheName);
		const matching = await cache.match(request);
		return matching || Promise.reject('no-match');
	} catch (error) {
		console.error("error in readFromCache",error);
		return Promise.reject('no-match');
	}

}

async function updateCache(request) {
	try {
		console.log("updating cache for "+request.url);
	    const cache = await caches.open(cacheName);
	    const response = await fetch(request);
		return cache.put(request, response.clone());
	} catch (error) {
		console.error("error in updateCache for: ",request, "error:", error);
	}
  }
