/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mock the browser object
global.browser = {
  runtime: {
    sendMessage: jest.fn(() => Promise.resolve({}))
  }
};

// Mock console.log to prevent test output pollution
const originalConsoleLog = console.log;
console.log = jest.fn();

// Load the blocked.js script globally for all tests
require('../blocked.js');

describe('hashCode32', () => {
  test('should return a 32-bit integer hash code for a string', () => {
    expect(window.hashCode32('test')).toBe(3556498);
    expect(window.hashCode32('password')).toBe(1216985755);
    expect(window.hashCode32('')).toBe(0);
  });
});

describe('processBlockInfo', () => {
  let themeLink, customStyle, blockedURL, blockedURLLink, blockedSet, keywordMatched, keywordMatch, passwordInput, passwordSubmit, customMsgDiv, customMsg, unblockTime, delaySecsElement;

  // Store original setInterval and setTimeout to restore them later
  let originalSetInterval, originalSetTimeout;
  let originalReloadBlockedPage;

  // Mock window.location properties and methods
  let mockHrefValue = '';

  beforeEach(() => {
    // Reset the DOM before each test
    document.body.innerHTML = `
      <link id="themeLink" rel="stylesheet" href="">
      <style id="customStyle"></style>
      <div id="ivbBlockedURL"></div>
      <a id="ivbBlockedURLLink"></a>
      <div id="ivbBlockedSet"></div>
      <div id="ivbKeywordMatched" style="display: none;"><span id="ivbKeywordMatch"></span></div>
      <input id="ivbPasswordInput" type="password">
      <button id="ivbPasswordSubmit"></button>
      <div id="ivbCustomMsgDiv" style="display: none;"><span id="ivbCustomMsg"></span></div>
      <div id="ivbUnblockTime"></div>
      <div id="ivbDelaySeconds"></div>
    `;

    themeLink = document.getElementById("themeLink");
    customStyle = document.getElementById("customStyle");
    blockedURL = document.getElementById("ivbBlockedURL");
    blockedURLLink = document.getElementById("ivbBlockedURLLink");
    blockedSet = document.getElementById("ivbBlockedSet");
    keywordMatched = document.getElementById("ivbKeywordMatched");
    keywordMatch = document.getElementById("ivbKeywordMatch");
    passwordInput = document.getElementById("ivbPasswordInput");
    passwordSubmit = document.getElementById("ivbPasswordSubmit");
    customMsgDiv = document.getElementById("ivbCustomMsgDiv");
    customMsg = document.getElementById("ivbCustomMsg");
    unblockTime = document.getElementById("ivbUnblockTime");
    delaySecsElement = document.getElementById("ivbDelaySeconds");

    // Clear all mocks before each test
    jest.clearAllMocks();
    console.log.mockClear(); // Clear console.log calls from blocked.js initial load

    // Mock window.location.href getter and setter
    // This is a simplified mock for href that doesn't involve Object.defineProperty on window.location
    // as that causes issues with JSDOM's non-configurable properties.
    // We'll just directly manipulate mockHrefValue and assert on it.
    mockHrefValue = ''; // Reset for each test

    // Explicitly mock setInterval and setTimeout
    originalSetInterval = window.setInterval;
    originalSetTimeout = window.setTimeout;
    window.setInterval = jest.fn();
    window.setTimeout = jest.fn();

    // Mock reloadBlockedPage
    originalReloadBlockedPage = window.reloadBlockedPage;
    window.reloadBlockedPage = jest.fn();
  });

  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = '';
    // Restore original timers
    window.setInterval = originalSetInterval;
    window.setTimeout = originalSetTimeout;
    // Restore original reloadBlockedPage
    window.reloadBlockedPage = originalReloadBlockedPage;
  });

  test('should not do anything if info is null or undefined', () => {
    window.processBlockInfo(null);
    // Expect no changes to the DOM or console.log not to be called with info.blockedSet
    expect(console.log).not.toHaveBeenCalledWith('[IVB]' + undefined);
  });

  test('should set blocked URL and set name', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      blockedSetName: 'My Test Set Name'
    };
    window.processBlockInfo(info);

    expect(blockedURL.innerText).toBe('http://example.com');
    expect(blockedURLLink.getAttribute('href')).toBe('http://example.com');
    expect(blockedSet.innerText).toBe('My Test Set Name');
    expect(document.title).toContain('(My Test Set Name)');
    expect(console.log).toHaveBeenCalledWith('[IVB]Test Set');
  });

  test('should truncate long blocked URL', () => {
    const longUrl = 'http://thisisaverylongurlthatshouldbetruncatedbythefunction.com/some/path/to/a/resource';
    const info = {
      blockedURL: longUrl,
      blockedSet: 'Test Set'
    };
    window.processBlockInfo(info);

    expect(blockedURL.innerText).toBe(longUrl.substring(0, 57) + '...');
  });

  test('should apply theme and custom style', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      theme: 'dark',
      customStyle: 'body { background-color: black; }'
    };
    window.processBlockInfo(info);

    expect(themeLink.href).toContain('/themes/dark.css');
    expect(customStyle.innerText).toBe('body { background-color: black; }');
  });

  test('should disable blocked URL link if disableLink is true', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      disableLink: true
    };
    window.processBlockInfo(info);

    expect(blockedURLLink.hasAttribute('href')).toBe(false);
  });

  test('should display keyword match if provided', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      keywordMatch: 'badword'
    };
    window.processBlockInfo(info);

    expect(keywordMatched.style.display).toBe('');
    expect(keywordMatch.innerText).toBe('badword');
  });

  test('should hide keyword match if not provided', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set'
    };
    window.processBlockInfo(info);

    expect(keywordMatched.style.display).toBe('none');
  });

  test('should set up password input and submit button', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      password: 'mysecret'
    };
    window.processBlockInfo(info);

    expect(document.activeElement).toBe(passwordInput);
    expect(passwordSubmit.onclick).toBeInstanceOf(Function);
  });

  test('should display custom message if provided', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      customMsg: 'This is a custom message.'
    };
    window.processBlockInfo(info);

    expect(customMsgDiv.style.display).toBe('');
    expect(customMsg.innerText).toBe('This is a custom message.');
  });

  test('should hide custom message if not provided', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set'
    };
    window.processBlockInfo(info);

    expect(customMsgDiv.style.display).toBe('none');
  });

  test('should display unblock time if provided', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      unblockTime: '10:00 AM'
    };
    window.processBlockInfo(info);

    expect(unblockTime.innerText).toBe('10:00 AM');
  });

  test('should start countdown timer if delaySecs is provided', () => {
    const info = {
      blockedURL: 'http://example.com',
      blockedSet: 'Test Set',
      delaySecs: 5
    };
    window.processBlockInfo(info);

    expect(parseInt(delaySecsElement.innerText)).toBe(5);
    expect(window.setInterval).toHaveBeenCalledTimes(1);
    expect(window.setInterval).toHaveBeenCalledWith(expect.any(Function), 1000, expect.any(Object));

    // Manually call the callback function passed to setInterval
    const callback = window.setInterval.mock.calls[0][0];
    const countdownObject = window.setInterval.mock.calls[0][2];

    callback(countdownObject);
    expect(parseInt(delaySecsElement.innerText)).toBe(4); // After one tick
  });


});
