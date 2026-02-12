# Test Strategy for ivBlock Safari Web Extension

This document outlines a strategy for creating unit and UI tests for the ivBlock Safari Web Extension, differentiating between the core web extension logic (LeechBlockNG/ivBlockCore) and the native Safari wrapper components.

## 1. What things can be tested?

### Core Modules (ivBlockCore - JavaScript)

The `ivBlockCore` directory contains the JavaScript-based web extension logic. Many of these components already have existing Jest tests (e.g., `ivBlockCore/tests/*.test.js`).

*   **Business Logic:**
    *   **Blocking Rules:** Correct evaluation of site blocking rules based on time periods, time limits, and patterns.
    *   **Time Tracking:** Accurate tracking of time spent on sites, rollover logic, and time limit enforcement.
    *   **Override Logic:** Correct handling of temporary overrides and password protection.
    *   **Configuration Management:** Saving, loading, and validating extension options.
*   **Utility Functions:**
    *   URL parsing and manipulation.
    *   Date and time calculations.
    *   String localization (e.g., ensuring `__MSG_*__` placeholders are correctly prepared for display).
*   **Interactions with Browser APIs (Mocked):**
    *   `chrome.storage` / `browser.storage`: Mocking read/write operations for extension settings and data.
    *   `chrome.alarms` / `browser.alarms`: Testing scheduling and execution of timed events.
    *   Message passing (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`): Verifying communication between different parts of the web extension (background script, content scripts, popup, options page).
*   **UI Logic (within web components):**
    *   Event handling for popup, options, and other HTML pages (e.g., button clicks, form submissions).
    *   Dynamic content updates within these web pages based on extension state.

### UI Tests (Safari Extension - Swift/JavaScript Interaction)

These tests focus on the native wrapper and the interaction between the Swift application/extension and the web content.

*   **Localization Display:**
    *   Verifying that localized strings (from `messages.json`) are correctly retrieved by Swift and passed to JavaScript for display on `Main.html` and other web views.
    *   Ensuring the correct locale is detected and used.
*   **State Representation:**
    *   Confirming that the native Swift code accurately reflects the extension's enabled/disabled state and passes it to the JavaScript for UI updates (e.g., `state-on`, `state-off` classes on `Main.html`).
*   **Native-to-JavaScript Communication:**
    *   Testing the `WKScriptMessageHandler` implementation in `SafariWebExtensionHandler.swift` to ensure native messages (e.g., `open-preferences`) are correctly received and processed.
*   **JavaScript-to-Native Communication:**
    *   Testing that JavaScript calls (e.g., `webkit.messageHandlers.controller.postMessage("open-preferences")`) are correctly handled by the native `ViewController.swift`.
*   **User Interface Flow:**
    *   Verifying that interactions on the `Main.html` splash screen (e.g., clicking "Quit and Open Safari Extensions Preferences…") trigger the expected native actions (e.g., opening Safari settings).
    *   Basic rendering tests for `popup.html` and `options.html` within the Safari Web Extension environment to ensure they display without major layout issues.

## 2. Where do I have to implement them in Xcode so that they can be run?

Xcode provides dedicated targets for different types of tests.

*   **For Swift/Native Logic:**
    *   **Unit Test Target:** Create a new "Unit Testing Bundle" target within the Xcode project (e.g., `ivBlockAppTests` for `Shared (App)`). This is where Swift code in `ViewController.swift` (and other native files) can be tested in isolation. For example, testing the `localizedMessages` dictionary construction.
*   **For UI Interactions:**
    *   **UI Test Target:** Create a new "UI Testing Bundle" target (e.g., `ivBlockAppUITests`). This allows for black-box testing of the application's UI, simulating user interactions and asserting on visible elements. This would be used to verify the `Main.html` splash screen's content and button actions.
*   **For ivBlockCore (JavaScript) Tests:**
    *   The existing Jest tests (`ivBlockCore/tests/*.test.js`) should continue to be run via `npm test` or `jest` from the command line. These are best kept separate from Xcode's native test runner due to their JavaScript nature.
    *   **Integration:** If desired, a "Run Script" phase can be added to a build target in Xcode to execute `npm test` as part of the build process, failing the build if tests do not pass. This integrates JavaScript test results into the Xcode workflow, but doesn't run them *within* Xcode's native test runner.

## 3. How is the test strategy for Safari extensions in particular?

The nature of Safari Web Extensions (wrapping a web extension in a native app/extension) requires a hybrid testing approach:

*   **Isolate Web Extension Logic:** Maximize test coverage for the core `ivBlockCore` JavaScript logic using existing tools like Jest. These tests are fast and cover the primary functionality of the extension.
*   **Focus Native Tests on Integration:** Use Xcode's native Unit and UI tests to ensure the Safari wrapper correctly hosts the web content, handles native-to-JavaScript and JavaScript-to-native communication, and manages localized resources.
*   **End-to-End UI Testing (Limited):** UI tests can verify critical user flows like the activation splash screen and basic interaction with the extension's popup/options pages if they are rendered within a `WKWebView`. However, extensive UI testing of the web content itself should primarily be handled by JavaScript-based testing frameworks or manual testing due to the complexity of inspecting web view content from XCUITests.
*   **Localization Testing:** Implement dedicated tests (both unit and UI) to verify that all user-facing strings are correctly localized based on the device's language settings, ensuring that `messages.json` files are properly bundled and accessed.

## 4. The tests should not be part of the app itself, where do I store them so that they are not shipped/bundled with the app.

*   **Xcode Test Targets:** Any code within an Xcode **Unit Test Target** or **UI Test Target** is explicitly designed *not* to be bundled with the final application package (.app or .ipa). These targets produce separate test bundles that are run by the Xcode test runner.
*   **ivBlockCore (JavaScript) Tests:** The `ivBlockCore/tests/` directory is external to the native Xcode project structure in terms of deployment. The files within this directory are part of the development and build process for the web extension, but they are not included in the `ivBlockCore` build output that gets copied into the native Safari extension's bundle. Therefore, they are not shipped with the final Safari app or extension.

This strategy ensures comprehensive testing while adhering to the distinct environments of web extensions and native iOS/macOS applications.