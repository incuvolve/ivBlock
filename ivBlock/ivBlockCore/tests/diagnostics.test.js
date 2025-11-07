/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser API
const browserMock = {
    storage: {
        local: {
            get: jest.fn(() => Promise.resolve({ numSets: "2", setName1: "Set One", setName2: "Set Two", sync: false, theme: "default" }))
        },
        sync: {
            get: jest.fn(() => Promise.resolve({ numSets: "2", setName1: "Set One", setName2: "Set Two", sync: true, theme: "default" }))
        }
    },
    runtime: {
        sendMessage: jest.fn()
    }
};

// Mock jQuery
const mockJQuery = {
    val: jest.fn(),
    button: jest.fn().mockReturnThis(),
    click: jest.fn().mockReturnThis(),
    keydown: jest.fn().mockReturnThis(),
    dialog: jest.fn().mockReturnThis(),
    show: jest.fn().mockReturnThis(),
    effect: jest.fn().mockReturnThis(),
};

// Mock the global jQuery function
const jQueryMock = jest.fn(() => mockJQuery);

// Create a context for vm.runInContext
const context = vm.createContext({
    document: global.document,
    window: global.window,
    browser: browserMock,
    console: global.console,
    setTimeout: global.setTimeout,
    setInterval: global.setInterval,
    clearTimeout: global.clearTimeout,
    clearInterval: global.clearInterval,
    Promise: global.Promise,
    $: jQueryMock,
});

// Load common.js into the context to get cleanOptions and getParsedURL
const commonJsPath = path.resolve(__dirname, '../common.js');
const commonJsCode = fs.readFileSync(commonJsPath, 'utf8');
vm.runInContext(commonJsCode, context);

// Load diagnostics.js into the context
const diagnosticsJsPath = path.resolve(__dirname, '../diagnostics.js');
const diagnosticsJsCode = fs.readFileSync(diagnosticsJsPath, 'utf8');
vm.runInContext(diagnosticsJsCode, context);

// Expose functions from the context to global scope
global.initForm = context.initForm;
global.initializePage = context.initializePage;
global.testURL = context.testURL;

// Expose mocks for assertions
global.browser = browserMock;
global.$ = jQueryMock;
global.mockJQuery = mockJQuery;
global.getParsedURL = context.getParsedURL; // Expose getParsedURL from common.js
global.cleanOptions = context.cleanOptions; // Expose cleanOptions from common.js
global.setTheme = context.setTheme; // Expose setTheme from common.js

describe('diagnostics.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock jQuery values
        mockJQuery.val.mockReturnValue('');
        // Reset gOptions in the context
        context.gOptions = null;
    });

    describe('testURL', () => {
        let getParsedURLSpy;

        beforeEach(() => {
            // Spy on context.getParsedURL
            getParsedURLSpy = jest.spyOn(context, 'getParsedURL');
        });

        afterEach(() => {
            getParsedURLSpy.mockRestore();
        });

        it('should return if gOptions is null', () => {
            context.gOptions = null;
            expect(() => global.testURL()).not.toThrow();
            expect(mockJQuery.val).not.toHaveBeenCalled();
        });

        it('should show alert for bad URL format', () => {
            context.gOptions = { numSets: "1" };
            mockJQuery.val.mockReturnValue('bad-url');
            // Mock getParsedURL to return a page that is null
            getParsedURLSpy.mockReturnValue({ page: null }); // Use the spy

            global.testURL();

            expect(mockJQuery.val).toHaveBeenCalledWith(); // Called to get URL
            expect(getParsedURLSpy).toHaveBeenCalledWith('bad-url'); // Use the spy
            expect(mockJQuery.dialog).toHaveBeenCalledWith('open'); // For alertBadTestURL
        });

        it('should generate results for valid URL', () => {
            context.gOptions = {
                numSets: "1",
                setName1: "Test Set",
                regexpBlock1: "example\.com",
                regexpAllow1: "google\.com",
                referRE1: "referrer\.com",
            };
            mockJQuery.val.mockReturnValue('http://www.example.com');
            getParsedURLSpy.mockReturnValue({ page: 'http://www.example.com' }); // Use the spy

            global.testURL();

            expect(mockJQuery.val).toHaveBeenCalledWith();
            expect(getParsedURLSpy).toHaveBeenCalledWith('http://www.example.com'); // Use the spy
            expect(mockJQuery.val).toHaveBeenCalledWith(expect.stringContaining('====== Block Set 1 (Test Set)'));
            expect(mockJQuery.val).toHaveBeenCalledWith(expect.stringContaining('BLOCK: example.com'));
            expect(mockJQuery.val).toHaveBeenCalledWith(expect.stringContaining('ALLOW: -'));
            expect(mockJQuery.val).toHaveBeenCalledWith(expect.stringContaining('REFER: -'));
            expect(mockJQuery.effect).toHaveBeenCalledWith({ effect: "highlight" });
        });

        it('should generate results for valid URL with no matches', () => {
            context.gOptions = {
                numSets: "1",
                setName1: "Test Set",
                regexpBlock1: "nomatch\.com",
                regexpAllow1: "nomatch\.com",
                referRE1: "nomatch\.com",
            };
            mockJQuery.val.mockReturnValue('http://www.example.com');
            getParsedURLSpy.mockReturnValue({ page: 'http://www.example.com' }); // Use the spy

            global.testURL();

            expect(mockJQuery.val).toHaveBeenCalledWith(expect.stringContaining('BLOCK: -'));
            expect(mockJQuery.val).toHaveBeenCalledWith(expect.stringContaining('ALLOW: -'));
            expect(mockJQuery.val).toHaveBeenCalledWith(expect.stringContaining('REFER: -'));
        });
    });

    // Placeholder tests for functions that require more complex DOM/jQuery UI mocking
    describe('Complex diagnostics.js functions (placeholders)', () => {
        it('initForm should initialize jQuery UI widgets and clear fields', () => {
            expect(() => global.initForm()).not.toThrow();
            expect(mockJQuery.button).toHaveBeenCalled();
            expect(mockJQuery.click).toHaveBeenCalled();
            expect(mockJQuery.keydown).toHaveBeenCalled();
            expect(mockJQuery.val).toHaveBeenCalledWith(""); // For #url and #results
        });

        it('initializePage should fetch options and initialize form', async () => {
            expect(() => global.initializePage()).not.toThrow();
            expect(browserMock.storage.local.get).toHaveBeenCalled();
            // This test would require mocking browser.storage.local.get().then() to return options
            // and then asserting on initForm and setTheme calls.
        });
    });
});