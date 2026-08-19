# Debugging ivBlock Safari Extension

## Overview

This guide covers debugging the ivBlock Safari extension on macOS, including common crash scenarios and how to attach Xcode for debugging.

## Enable Safari Development Features

Run these commands in **Terminal** (not Xcode):

```bash
# Allow unsigned extensions during development
defaults write com.apple.Safari AllowUnsignedExtensions -bool true

# Enable Safari's internal debug menu
defaults write com.apple.Safari IncludeInternalDebugMenu -bool true
```

After running these commands, **restart Safari** for changes to take effect.

To verify the settings:
```bash
defaults read com.apple.Safari AllowUnsignedExtensions
defaults read com.apple.Safari IncludeInternalDebugMenu
```

To revert (disable unsigned extensions):
```bash
defaults delete com.apple.Safari AllowUnsignedExtensions
defaults delete com.apple.Safari IncludeInternalDebugMenu
```

## Debugging Methods

### 1. Safari Web Inspector (Recommended for JavaScript)

**For Extension Background Script:**
1. Open Safari
2. Go to **Develop** → **Web Extension Background Pages** → **ivBlock**
3. The Web Inspector shows console logs, network requests, and allows breakpoints

**For Extension Pages (blocked.html, options.html, etc.):**
1. Navigate to the extension page
2. Right-click → **Inspect Element**
3. Or use **Develop** → **Show Web Inspector**

**Console Logs:**
All ivBlock logs are prefixed with `[ivBlock]`. Filter in the console:
```javascript
// In Web Inspector console, filter by:
[ivBlock]
```

### 2. Attach Xcode Debugger

Use Xcode to catch Safari crashes and view native stack traces.

**Steps:**
1. Open Xcode
2. Go to **Debug** → **Attach to Process by PID or Name...**
3. Type `Safari` and select it
4. Xcode will attach to the running Safari process
5. When Safari crashes, Xcode will pause with a backtrace

**View Threads and Stack:**
- When paused, check the **Debug Navigator** (⌘7) for thread list
- View the stack trace in the main editor area

### 3. macOS Crash Reports

**Console.app:**
1. Open **Console.app** (`/Applications/Utilities/Console.app`)
2. Filter by "Safari" in the search box
3. Crashes appear under "Crash Reports" in the sidebar

**Manual Access:**
```bash
# Open crash reports directory
open ~/Library/Logs/DiagnosticReports/

# View recent Safari crashes
ls -lt ~/Library/Logs/DiagnosticReports/ | grep Safari | head
```

Crash reports are named: `Safari_<timestamp>_<machine>.crash`

### 4. Add Diagnostic Logging

Add logging to trace execution flow:

```javascript
// In JavaScript files
console.log("[ivBlock] Debug checkpoint: function called with:", variable);
console.warn("[ivBlock] Warning: unexpected state");
console.error("[ivBlock] Error occurred:", error);
```

**Enable Diagnostic Mode:**
- Open options page
- Enable diagnostic mode (if available)
- Check background console for verbose logs

## Common Issues

### Safari Crashes on Override Link Click

**Symptom:** Safari quits unexpectedly when clicking the blocked URL link after override.

**Cause:** Extension pages calling `browser.tabs.update()` on themselves can crash Safari.

**Solution:** Use `window.location.href` for navigation within extension pages:
```javascript
// ✓ Correct
window.location.href = blockedURL;

// ✗ Crashes Safari
browser.tabs.update(tabId, { url: blockedURL });
```

### Multiple Tabs Navigate to Wrong Tab

**Symptom:** When multiple blocked tabs are open, clicking a link navigates the wrong tab.

**Cause:** Global `gTabId` variable gets overwritten by each new blocked page.

**Solution:** Capture tabId in a closure:
```javascript
let capturedURL = info.blockedURL;
blockedURLLink.addEventListener("click", function(e) {
    e.preventDefault();
    window.location.href = capturedURL;
});
```

## Testing Workflow

1. **Build in Xcode** (⌘B)
2. **Enable extension** in Safari Preferences → Extensions
3. **Open Web Inspector** for background page
4. **Test the feature** (e.g., trigger override, click blocked link)
5. **Check console** for `[ivBlock]` logs
6. **If crash occurs:**
   - Check Xcode debugger (if attached)
   - Review crash report in Console.app
   - Add more logging and rebuild

## Troubleshooting

### Extension Not Loading
- Ensure `AllowUnsignedExtensions` is set (see above)
- Restart Safari after setting
- Check Safari Preferences → Extensions → ivBlock is enabled

### No Console Output
- Verify Web Inspector is connected to correct context
- Background page vs extension page have separate inspectors
- Check filter isn't hiding `[ivBlock]` logs

### Can't Attach Xcode
- Safari must be running first
- Try quitting Safari and relaunching, then attach immediately
- Ensure Xcode has permissions (System Preferences → Security & Privacy)

## Useful Commands

```bash
# View Safari processes
ps aux | grep Safari

# Kill Safari completely
killall Safari

# View extension files in Derived Data
open ~/Library/Developer/Xcode/DerivedData/

# Clean build
# In Xcode: Product → Clean Build Folder (⇧⌘K)
```

## Resources

- [Safari App Extension Documentation](https://developer.apple.com/documentation/safariservices/safari_app_extensions)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Safari Extension Best Practices](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
