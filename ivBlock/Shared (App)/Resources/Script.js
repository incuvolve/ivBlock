document.body.classList.remove('no-js');

function show(platform, enabled, useSettingsInsteadOfPreferences) {
    document.body.classList.add(`platform-${platform}`);

    if (useSettingsInsteadOfPreferences) {
        document.getElementById('msg-mac-on').innerText = document.getElementById('str-mac-on-settings').innerText;
        document.getElementById('msg-mac-off').innerText = document.getElementById('str-mac-off-settings').innerText;
        document.getElementById('msg-mac-unknown').innerText = document.getElementById('str-mac-unknown-settings').innerText;
        document.getElementById('btn-open-prefs').innerText = document.getElementById('str-open-settings').innerText;
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
