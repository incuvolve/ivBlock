/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var gBlockedURL;
var gBlockedSet;
var gHashCode;

// Create 32-bit integer hash code from string
//
function hashCode32(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return hash;
}

// Processes info for blocking page
//
function processBlockInfo(info) {
	if (!info) return;

	gBlockedURL = info.blockedURL;
	gBlockedSet = info.blockedSet;
	console.log('[IVB]' + info.blockedSet);
	gHashCode = info.password ? hashCode32(info.password) : 0;

	// Set theme
	let themeLink = document.getElementById("themeLink");
	if (themeLink) {
		themeLink.href = "/themes/" + (info.theme ? `${info.theme}.css` : "default.css");
	}

	// Set custom style
	let customStyle = document.getElementById("customStyle");
	if (customStyle) {
		customStyle.innerText = info.customStyle;
	}

	let blockedURL = document.getElementById("ivbBlockedURL");
	if (info.blockedURL && blockedURL) {
		if (info.blockedURL.length > 60) {
			blockedURL.innerText = info.blockedURL.substring(0, 57) + "...";
		} else {
			blockedURL.innerText = info.blockedURL;
		}
	}

	let blockedURLLink = document.getElementById("ivbBlockedURLLink");
	if (info.blockedURL && blockedURLLink && !info.disableLink) {
		blockedURLLink.setAttribute("href", info.blockedURL);
	}

	let blockedSet = document.getElementById("ivbBlockedSet");
	if (info.blockedSet && blockedSet) {
		if (info.blockedSetName) {
			blockedSet.innerText = info.blockedSetName;
		} else {
			blockedSet.innerText += " " + info.blockedSet;
		}
		document.title += " (" + blockedSet.innerText + ")";
	}

	let keywordMatched = document.getElementById("ivbKeywordMatched");
	let keywordMatch = document.getElementById("ivbKeywordMatch");
	if (keywordMatched && keywordMatch) {
		if (info.keywordMatch) {
			keywordMatch.innerText = info.keywordMatch;
			keywordMatched.style.display = "";
		} else {
			keywordMatched.style.display = "none";
		}
	}

	let passwordInput = document.getElementById("ivbPasswordInput");
	let passwordSubmit = document.getElementById("ivbPasswordSubmit");
	if (passwordInput && passwordSubmit) {
		passwordInput.focus();
		passwordSubmit.onclick = onSubmitPassword;
	}

	let customMsgDiv = document.getElementById("ivbCustomMsgDiv");
	let customMsg = document.getElementById("ivbCustomMsg");
	if (customMsgDiv && customMsg) {
		if (info.customMsg) {
			customMsg.innerText = info.customMsg;
			customMsgDiv.style.display = "";
		} else {
			customMsgDiv.style.display = "none";
		}
	}

	let unblockTime = document.getElementById("ivbUnblockTime");
	if (info.unblockTime && unblockTime) {
		unblockTime.innerText = info.unblockTime;
	}

	let delaySecs = document.getElementById("ivbDelaySeconds");
	if (info.delaySecs && delaySecs) {
		delaySecs.innerText = info.delaySecs;

		// Start countdown timer
		let countdown = {
			delaySecs: info.delaySecs,
			delayCancel: info.delayCancel
		};
		countdown.interval = window.setInterval(onCountdownTimer, 1000, countdown);
	}

	if (info.reloadSecs) {
		// Reload blocked page after specified time
		window.setTimeout(reloadBlockedPage, info.reloadSecs * 1000);
	}
}

// Handle countdown on delaying page
//
function onCountdownTimer(countdown) {
	// Cancel countdown if document not focused
	if (countdown.delayCancel && !document.hasFocus()) {
		// Clear countdown timer
		window.clearInterval(countdown.interval);

		// Strike through countdown text
		let countdownText = document.getElementById("ivbCountdownText");
		if (countdownText) {
			countdownText.style.textDecoration = "line-through";
		}

		return;
	}

	countdown.delaySecs--;

	// Update countdown seconds on page
	let delaySecs = document.getElementById("ivbDelaySeconds");
	if (delaySecs) {
		delaySecs.innerText = countdown.delaySecs;
	}

	if (countdown.delaySecs == 0) {
		// Clear countdown timer
		window.clearInterval(countdown.interval);

		// Notify extension that delay countdown has completed
		let message = {
			type: "delayed",
			blockedURL: gBlockedURL,
			blockedSet: gBlockedSet
		};
		browser.runtime.sendMessage(message);
	}
}

// Handle submit button on password page
//
function onSubmitPassword() {
	let passwordInput = document.getElementById("ivbPasswordInput");
	if (hashCode32(passwordInput.value) == gHashCode) {
		// Notify extension that password was successfully entered
		let message = {
			type: "password",
			blockedURL: gBlockedURL,
			blockedSet: gBlockedSet
		};
		browser.runtime.sendMessage(message);
	} else {
		// Clear input field and flash background
		passwordInput.value = "";
		passwordInput.classList.add("error");
		window.setTimeout(() => { passwordInput.classList.remove("error"); }, 400);
	}
}

// Attempt to reload blocked page
//
function reloadBlockedPage() {
	if (gBlockedURL) {
		document.location.href = gBlockedURL;
	}
}

// Request block info from extension
browser.runtime.sendMessage({ type: "blocked" }).then(processBlockInfo);

// Expose functions for testing purposes
window.hashCode32 = hashCode32;
window.processBlockInfo = processBlockInfo;