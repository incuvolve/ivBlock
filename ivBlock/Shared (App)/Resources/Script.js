// Remove no-js class immediately to show content
if (document.body) {
    document.body.classList.remove('no-js');
} else {
    // Fallback if body isn't ready yet
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (document.body) {
                document.body.classList.remove('no-js');
            }
        });
    }
}

// Make show function available globally
window.show = function(platform, enabled, useSettingsInsteadOfPreferences) {
    // Ensure no-js class is removed
    if (document.body) {
        document.body.classList.remove('no-js');
    }
    
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
};

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

// Wait for DOM to be ready before attaching event listener
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.querySelector("button.open-preferences");
        if (btn) {
            btn.addEventListener("click", openPreferences);
        }
    });
} else {
    const btn = document.querySelector("button.open-preferences");
    if (btn) {
        btn.addEventListener("click", openPreferences);
    }
}
