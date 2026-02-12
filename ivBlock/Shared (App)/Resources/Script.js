console.log("Script.js started executing.");
document.body.classList.remove('no-js');

function show(platform, enabled, useSettingsInsteadOfPreferences, localizedMessages) {
    document.body.classList.remove('no-js');

    console.log("show function called.");
    console.log("Platform:", platform);
    console.log("Enabled:", enabled);
    console.log("Use Settings Instead Of Preferences:", useSettingsInsteadOfPreferences);
    console.log("Localized Messages (raw):", localizedMessages);

    // Apply localized messages to static elements
    if (localizedMessages) {
        document.getElementById('splash-noscript-message').innerText = localizedMessages.jsRequiredMessage;
        document.getElementById('splash-ios-message').innerText = localizedMessages.safariExtSettingsIOS;
        
        // Dynamically set messages based on platform and state
        if (platform === 'mac') {
            if (useSettingsInsteadOfPreferences) {
                document.getElementById('splash-mac-on-message').innerText = localizedMessages.safariExtSettingsMacOn;
                document.getElementById('splash-mac-off-message').innerText = localizedMessages.safariExtSettingsMacOff;
                document.getElementById('splash-mac-unknown-message').innerText = localizedMessages.safariExtSettingsMacUnknown;
                document.getElementById('splash-open-preferences-button').innerText = localizedMessages.quitAndOpenSafariSettings;
            } else {
                document.getElementById('splash-mac-on-message').innerText = localizedMessages.safariExtPrefsMacOn;
                document.getElementById('splash-mac-off-message').innerText = localizedMessages.safariExtPrefsMacOff;
                document.getElementById('splash-mac-unknown-message').innerText = localizedMessages.safariExtPrefsMacUnknown;
                document.getElementById('splash-open-preferences-button').innerText = localizedMessages.quitAndOpenSafariExtPrefs;
            }
        }
    } else {
        console.error("localizedMessages object is null or undefined, cannot apply messages.");
    }

    // Display current language for debugging
    if (localizedMessages && localizedMessages.currentLocaleIdentifier) {
        document.getElementById('current-language-display').innerText = `Current Language: ${localizedMessages.currentLocaleIdentifier}`;
    } else {
        console.warn("localizedMessages or currentLocaleIdentifier is missing/empty, cannot display current language on splash screen.");
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
