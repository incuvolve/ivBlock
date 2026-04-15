# ivBlock – Copilot Instructions

## Overview

ivBlock is a Safari extension for iOS and macOS. It wraps the LeechBlock NG browser extension (a website blocker) in a native Swift host app using Apple's `safari-web-extension-converter` toolchain.

The repository has two main layers:
1. **Swift host app** (`ivBlock/` Xcode project) – minimal native shell that enables the Safari extension
2. **WebExtension core** (`ivBlock/ivBlockCore/`) – a Git submodule tracking the `integration` branch of `github.com/incuvolve/LeechBlockNG`

## Repository Structure

```
ivBlock/                          # Xcode project root
  ivBlock.xcodeproj/
  Shared (App)/                   # Cross-platform Swift app (WKWebView host)
    Resources/Base.lproj/Main.html  # Onboarding/enable-extension UI
    ViewController.swift
  Shared (Extension)/             # Safari extension handler (boilerplate bridge)
    SafariWebExtensionHandler.swift
  iOS (App)/                      # iOS-specific AppDelegate/SceneDelegate
  macOS (App)/                    # macOS-specific AppDelegate
  ivBlockCore/                    # Git submodule – WebExtension JS logic
localization/                     # Staged locale files (es, he, it, pt_BR, vi)
                                  # not yet merged into ivBlockCore/_locales/
```

## Submodule

`ivBlock/ivBlockCore` tracks branch `integration` on `github.com/incuvolve/LeechBlockNG`.

```bash
git submodule update --init --recursive   # initial checkout
git submodule update --remote             # pull latest from integration branch
```

ivBlock-specific changes to the extension core live in the `integration` branch of the submodule. Upstream LeechBlock NG updates are merged into that branch.

## Build

Open `ivBlock/ivBlock.xcodeproj` in Xcode. No separate build script exists; build and run via Xcode for iOS Simulator or macOS.

## Tests (WebExtension Core)

Tests live in `ivBlock/ivBlockCore/` and use Jest with jsdom.

```bash
cd ivBlock/ivBlockCore
npm install          # first time
npm test             # run all tests with coverage

# Run a single test file
npm test -- tests/common.test.js

# Run tests matching a name pattern
npm test -- --testNamePattern="cleanSites"

# Watch mode
npm test -- --watch
```

Coverage reports output to `ivBlock/ivBlockCore/coverage/`.

## Architecture: How the Two Layers Interact

The **Swift app** (`ViewController.swift`) loads `Main.html` via `WKWebView` to show an onboarding/enable-extension page. It calls `show('ios')` or `show('mac', isEnabled, supportsSettings)` via `evaluateJavaScript` after load.

The **`SafariWebExtensionHandler`** is boilerplate – it echoes messages back to the extension (`browser.runtime.sendNativeMessage`). No custom native ↔ JS communication is implemented beyond this.

The **WebExtension** (`ivBlockCore/`) runs entirely in the Safari extension process. All blocking logic, storage, and UI are in JavaScript. See `ivBlock/ivBlockCore/copilot-instructions.md` for full detail on the JS extension architecture.

## Localization

- Active locales (en, de): `ivBlock/ivBlockCore/_locales/`
- Staged locales (es, he, it, pt_BR, vi): top-level `localization/` directory

To add a new locale, copy the `messages.json` from `localization/<lang>/` into `ivBlock/ivBlockCore/_locales/<lang>/messages.json` and add corresponding entries to any HTML files that use `__MSG_key__` substitution.

HTML files use the WebExtension `__MSG_key__` format for static i18n; runtime strings use `browser.i18n.getMessage()`.

## Key Conventions

- **Log prefix**: All console output from the extension is prefixed with `[ivBlock]`
- **Promise style**: `.then()/.catch()` chains throughout; no `async/await` in the JS core
- **Options schema**: New options must be added to `GENERAL_OPTIONS` or `PER_SET_OPTIONS` in `ivBlockCore/common.js` before they can be stored or read
- **Per-set suffix**: Per-set storage keys are named with a numeric suffix (e.g. `sites1`, `times1`, `days2`), up to `MAX_SETS` (30)
- **Theme linking**: Themes are swapped at runtime by updating `<link id="themeLink">` href; files live in `ivBlockCore/themes/`
- **Blocking redirect URL**: The default block redirect is `blocked.html?$S&$U` where `$S` is the set index and `$U` is the blocked URL
