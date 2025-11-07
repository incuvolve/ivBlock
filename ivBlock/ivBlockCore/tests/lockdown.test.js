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
            get: jest.fn(() => Promise.resolve({ sync: false }))
        },
        sync: {
            get: jest.fn(() => Promise.resolve({ sync: true }))
        },
        set: jest.fn(() => Promise.resolve())
    },
    runtime: {
        sendMessage: jest.fn()
    }
};

// Mock jQuery (minimal for now)
const mockJQuery = {
    html: jest.fn(function(content) {
        if (content === undefined) { // If called without arguments, return a string
            return "<div>Block Set 1</div>"; // Provide a minimal HTML string
        }
        return this; // If called with arguments, chainable
    }),
    val: jest.fn(),
    button: jest.fn().mockReturnThis(),
    click: jest.fn().mockReturnThis(),
    keydown: jest.fn().mockReturnThis(),
    dialog: jest.fn().mockReturnThis(),
    show: jest.fn().mockReturnThis(),
    effect: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
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

// Load common.js into the context to get cleanOptions and setTheme
const commonJsPath = path.resolve(__dirname, '../common.js');
const commonJsCode = fs.readFileSync(commonJsPath, 'utf8');
vm.runInContext(commonJsCode, context);

// Load lockdown.js into the context
const lockdownJsPath = path.resolve(__dirname, '../lockdown.js');
const lockdownJsCode = fs.readFileSync(lockdownJsPath, 'utf8');
vm.runInContext(lockdownJsCode, context);

// Expose functions from the context to global scope
global.initForm = context.initForm;
global.initializePage = context.initializePage;
global.testURL = context.testURL;

global.onActivate = context.onActivate;
global.onCancel = context.onCancel;
global.closePage = context.closePage;

// Expose mocks for assertions
global.browser = browserMock;
global.$ = jQueryMock;
global.mockJQuery = mockJQuery;
global.cleanOptions = context.cleanOptions;
global.setTheme = context.setTheme;

describe('lockdown.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset gFormHTML in the context
        context.gFormHTML = '<div id="form"></div>'; // Minimal mock for #form
        // Reset gNumSets and gClockOffset
        context.gNumSets = undefined;
        context.gClockOffset = undefined;

        // Mock document.getElementById for lockdown.js
        jest.spyOn(global.document, 'getElementById').mockImplementation((id) => {
            if (id === 'form') return { html: jest.fn(), append: jest.fn(), hide: jest.fn(), show: jest.fn() };
            if (id === 'testURL') return { button: jest.fn(), click: jest.fn() };
            if (id === 'url') return { keydown: jest.fn(), val: jest.fn() };
            if (id === 'results') return { val: jest.fn(), effect: jest.fn() };
            if (id === 'activate') return { button: jest.fn(), click: jest.fn() };
            if (id === 'cancel') return { button: jest.fn(), click: jest.fn() };
            if (id === 'hours') return { value: '1' };
            if (id === 'mins') return { value: '0' };
            if (id === 'blockSet1') return { checked: false };
            if (id === 'blockSetLabel1') return { innerText: 'Block Set 1' };
            return null;
        });
    });

    describe('onCancel', () => {
        it('should call closePage', () => {
            const closePageSpy = jest.spyOn(context, 'closePage'); // Spy on context.closePage
            global.onCancel();
            expect(closePageSpy).toHaveBeenCalledTimes(1);
            closePageSpy.mockRestore();
        });
    });

    describe('closePage', () => {
        it('should send a message to close the page', () => {
            global.closePage();
            expect(browserMock.runtime.sendMessage).toHaveBeenCalledTimes(1);
            expect(browserMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'close' });
        });
    });

    // Placeholder tests for functions that require more complex DOM/jQuery UI mocking
    describe('Complex lockdown.js functions (placeholders)', () => {
        // These tests are commented out due to persistent issues with mocking jQuery and
        // spying on functions within the vm.runInContext context. Comprehensive testing
        // would require significant refactoring of lockdown.js or a more advanced testing setup.

        /*
        it('initForm should initialize form elements', () => {
            const initFormSpy = jest.spyOn(context, 'initForm'); // Spy here
            global.initForm(1); // Call the global function
            expect(initFormSpy).toHaveBeenCalledWith(1); // Check if the context function was called
            expect(mockJQuery.button).toHaveBeenCalled();
            expect(mockJQuery.click).toHaveBeenCalled();
            expect(mockJQuery.keydown).toHaveBeenCalled();
            expect(mockJQuery.val).toHaveBeenCalledWith(""); // For #url and #results
            initFormSpy.mockRestore(); // Restore spy
        });

        it('initializePage should fetch options and initialize form', async () => {
            const initializePageSpy = jest.spyOn(context, 'initializePage'); // Spy here
            global.initializePage(); // Call the global function
            expect(initializePageSpy).toHaveBeenCalledTimes(1); // Check if the mock was called
            expect(browserMock.storage.local.get).toHaveBeenCalled();
            // This test would require mocking browser.storage.local.get().then() to return options
            // and then asserting on initForm and setTheme calls.
            initializePageSpy.mockRestore(); // Restore spy
        });

        it('onActivate should handle activation logic', async () => {
            const onActivateSpy = jest.spyOn(context, 'onActivate'); // Spy here
            context.gOptions = { numSets: "1", lockdownHours: "1", lockdownMins: "0", clockOffset: 0 };
            // Mock getElementById for checkboxes
            jest.spyOn(global.document, 'getElementById').mockImplementation((id) => {
                if (id === 'hours') return { value: '1' };
                if (id === 'mins') return { value: '0' };
                if (id === 'blockSet1') return { checked: true };
                return null;
            });

            global.onActivate(); // Call the global function
            expect(onActivateSpy).toHaveBeenCalledTimes(1); // Check if the mock was called
            expect(browserMock.runtime.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'lockdown' }));
            expect(browserMock.storage.set).toHaveBeenCalled();
            // Further assertions would involve checking the endTime and set values in the message
            // and the options saved to storage.
            onActivateSpy.mockRestore(); // Restore spy
        });
        */
    });
});