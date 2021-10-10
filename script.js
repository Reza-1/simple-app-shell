//strict mode
"use strict";

//##########################################################
//basic global vars
const appVersion = "1";
//global array with all pages
let appPages = new Array();

//status messages
const msgS01 = "Online";
const msgS02 = "Offline";
const msgS03 = "Yes - available Offline";
const msgS04 = "No - <a href=\"index.htm\">Load in Cache</a>";
const msgS05 = "Update available - <a href=\"index.htm\">Load</a>";


//##########################################################
//register the serviceworker
if ("serviceWorker" in navigator) {
	window.addEventListener("load", function () {
		navigator.serviceWorker.register("/serviceworker.js").then(function (registration) {
			updateViaCache: "none";    //bypass http cache
			// Registration was successful
			//console.log("ServiceWorker registration successful with scope: ", registration.scope);
			//check for update
			registration.addEventListener("updatefound", function () {
				document.getElementById("supdate").innerHTML = msgS05;
			});
		}).catch(function (err) {
			// registration failed :(
			//console.log("ServiceWorker registration failed: ", err);
		});
	});
}
//##########################################################


//##########################################################
//set div page display from none to block based on hash
function showPage() {
	//set first page for no hashid given
	let divID = appPages[0].getAttribute("id");
	//get page div id from hash
	if ((location.hash !== "") && (location.hash !== undefined)) { divID = location.hash.substring(1); }
	//hide all pages first
	let pageID1;
	for (let i = 0; i < appPages.length; i++) {
		pageID1 = appPages[i].getAttribute("id");
		document.getElementById(pageID1).style.display = "none";
	}
	//only show pages for existing IDs (whitelist)
	let whitelistPage = false;
	let pageID2;
	for (let n = 0; n < appPages.length; n++) {
		pageID2 = appPages[n].getAttribute("id");
		if (divID === pageID2) { whitelistPage = true; }
	}
	//set first page for id not whitelisted
	if (!whitelistPage) { divID = appPages[0].getAttribute("id"); }
	//show page and scroll to top
	document.getElementById(divID).style.display = "block";
	document.body.scrollTop = 0; 			//Chrome, Safari
	document.documentElement.scrollTop = 0;	//Firefox, IE
}


//##########################################################
//set app status for network, chaching
//Note: update is handled in SW registration
function setAppStatus() {
	//set network status initial and listener
	if (window.navigator.onLine) { document.getElementById("snet").innerHTML = msgS01; } else { document.getElementById("snet").innerHTML = msgS02; }
	window.addEventListener("online", function (e) { document.getElementById("snet").innerHTML = msgS01; });
	window.addEventListener("offline", function (e) { document.getElementById("snet").innerHTML = msgS02; });
	//set cache status (considered as chached if index.htm found)
	try {
		caches.match("/index.htm").then(function (cacheResponse) {
			//console.log('#####cacheResponse ', cacheResponse);
			if (cacheResponse) {
				document.getElementById("scache").innerHTML = msgS03;
			} else {
				document.getElementById("scache").innerHTML = msgS04;
			}
		});
	} catch (err) {
		//console.log('#####cacheError ', err);
		document.getElementById("scache").innerHTML = "-";
	}
}


//##########################################################
//init app, set version, check deep links, show start page
function initApp() {
	//fill array with pages
	appPages = document.querySelectorAll("div.page");
	//show start page or deep link page
	showPage();
	//init handler for hash navigation
	window.addEventListener("hashchange", showPage);
	//set version
	document.getElementById("version").innerHTML = appVersion;
	let footerVer = document.querySelectorAll("span.fversion");
	for (let i = 0; i < footerVer.length; i++) {
		footerVer[i].innerHTML = appVersion;
	}
	//set app status
	setAppStatus();
}

initApp();

//##########################################################
//
//            YOUR CODE MAY BE INCLUDED HERE
//
//##########################################################