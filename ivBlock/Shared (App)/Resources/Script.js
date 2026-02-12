console.log("Script.js loaded.");
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
        console.log("Localized Messages object is present.");
        console.log("Localized Messages - safariExtSettingsIOS:", localizedMessages.safariExtSettingsIOS);

        if (localizedMessages.extensionName) {
            document.getElementById('extension-name').innerText = localizedMessages.extensionName;
        }

        document.getElementById('splash-ios-message').innerText = localizedMessages.safariExtSettingsIOS;
        
        // Dynamically set messages based on platform and state
        if (platform === 'mac') {
            console.log("Platform is 'mac'. Applying Mac-specific messages.");
            console.log("Localized Messages - safariExtSettingsMacOn:", localizedMessages.safariExtSettingsMacOn);
            console.log("Localized Messages - safariExtSettingsMacOff:", localizedMessages.safariExtSettingsMacOff);
            console.log("Localized Messages - safariExtSettingsMacUnknown:", localizedMessages.safariExtSettingsMacUnknown);
            console.log("Localized Messages - quitAndOpenSafariSettings:", localizedMessages.quitAndOpenSafariSettings);
            console.log("Localized Messages - safariExtPrefsMacOn:", localizedMessages.safariExtPrefsMacOn);
            console.log("Localized Messages - safariExtPrefsMacOff:", localizedMessages.safariExtPrefsMacOff);
            console.log("Localized Messages - safariExtPrefsMacUnknown:", localizedMessages.safariExtPrefsMacUnknown);
            console.log("Localized Messages - quitAndOpenSafariExtPrefs:", localizedMessages.quitAndOpenSafariExtPrefs);

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
        } else if (platform === 'ios') {
            console.log("Platform is 'ios'. iOS specific messages are handled by setting 'splash-ios-message'.");
            // If more dynamic messages are needed for iOS, they would be added here.
        } else {
            console.log("Unknown platform:", platform);
        }
    } else {
        console.error("localizedMessages object is null or undefined, cannot apply messages.");
    }


    // Display current language for debugging
    if (localizedMessages && localizedMessages.currentLocaleIdentifier) {
        console.log(`Current Language (from localizedMessages): ${localizedMessages.currentLocaleIdentifier}`);
    } else {
        console.warn("localizedMessages or currentLocaleIdentifier is missing/empty, cannot determine current language.");
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
