const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Mock browser API
const browserMock = {
    storage: {
        local: {
            get: jest.fn(() => Promise.resolve({ sync: false, numSets: "2", setName1: "Set One", setName2: "Set Two" })),
            set: jest.fn(() => Promise.resolve()),
        },
        sync: {
            get: jest.fn(() => Promise.resolve({ sync: true, numSets: "2", setName1: "Set One", setName2: "Set Two" })),
            set: jest.fn(() => Promise.resolve()),
        },
    },
    runtime: {
        sendMessage: jest.fn(),
        getURL: jest.fn((url) => `chrome-extension://test/${url}`),
    },
    tabs: {
        remove: jest.fn(),
    },
};

let dom;
let window;
let document;
let $; // To hold the jQuery instance

const addSitesHtmlPath = path.resolve(__dirname, '../add-sites.html');
let addSitesHtml = fs.readFileSync(addSitesHtmlPath, 'utf8');

// Remove link and script tags from HTML to prevent JSDOM from trying to load them
addSitesHtml = addSitesHtml.replace(/<link[^>]*>/g, '');
addSitesHtml = addSitesHtml.replace(/<script[^>]*>[^<]*<\/script>/g, '');

const jqueryPath = path.resolve(__dirname, '../jquery-ui/jquery.min.js');
const jqueryCode = fs.readFileSync(jqueryPath, 'utf8');

const jqueryUiPath = path.resolve(__dirname, '../jquery-ui/jquery-ui.min.js');
const jqueryUiCode = fs.readFileSync(jqueryUiPath, 'utf8');

const commonJsPath = path.resolve(__dirname, '../common.js');
const commonJsCode = fs.readFileSync(commonJsPath, 'utf8');

const addSitesJsPath = path.resolve(__dirname, '../add-sites.js');
let addSitesJsCode = fs.readFileSync(addSitesJsPath, 'utf8');

// Remove the focus event listener from add-sites.js for testing purposes
addSitesJsCode = addSitesJsCode.replace('document.addEventListener("focus", refreshPage);', '');

describe('add-sites.js', () => {
    let jqueryButtonSpy;
    let jqueryClickSpy;
    let jqueryHtmlSpy;
    let jqueryHideSpy;
    let jqueryShowSpy;
    let jqueryDialogSpy;
    let jqueryValSpy;

    beforeAll((done) => {
        // Create a new JSDOM instance for the entire test suite
        dom = new JSDOM(addSitesHtml, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost', // Set a base URL for getURL to work
        });
        window = dom.window;
        document = window.document;

        // Expose browser mock to the JSDOM window
        window.browser = browserMock;

        // Manually inject jQuery
        const jqueryScript = document.createElement('script');
        jqueryScript.textContent = jqueryCode;
        document.body.appendChild(jqueryScript);

        // Set $ to the loaded jQuery instance
        $ = window.jQuery;

        // Inject jQuery UI
        const jqueryUiScript = document.createElement('script');
        jqueryUiScript.textContent = jqueryUiCode;
        document.body.appendChild(jqueryUiScript);

        // Inject common.js
        const commonJsScript = document.createElement('script');
        commonJsScript.textContent = commonJsCode;
        document.body.appendChild(commonJsScript);

        // Inject add-sites.js
        const addSitesJsScript = document.createElement('script');
        addSitesJsScript.textContent = addSitesJsCode;
        document.body.appendChild(addSitesJsScript);

        done();
    });

    beforeEach((done) => {
        // Clear mocks before each test
        jest.clearAllMocks();

        // Reset the DOM to its initial state
        document.body.innerHTML = dom.window.document.body.innerHTML; // Reset to original HTML content

        // Re-get jQuery instance and re-spy on its methods as the DOM is reset
        $ = window.jQuery;
        jqueryButtonSpy = jest.spyOn($.fn, 'button');
        jqueryClickSpy = jest.spyOn($.fn, 'click');
        jqueryHtmlSpy = jest.spyOn($.fn, 'html');
        jqueryHideSpy = jest.spyOn($.fn, 'hide');
        jqueryShowSpy = jest.spyOn($.fn, 'show');
        jqueryDialogSpy = jest.spyOn($.fn, 'dialog');
        jqueryValSpy = jest.spyOn($.fn, 'val');

		// Manually initialize the dialogs for each test
		$("div[id^='alert']").dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				OK: function () { $(this).dialog("close"); }
			}
		});

        // Manually trigger DOMContentLoaded to re-initialize the application for each test
        const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
        document.dispatchEvent(event);

        done();
    });

    afterAll(() => {
        // Clean up JSDOM resources after all tests are done
        dom.window.close();
    });

    afterEach(() => {
        // Restore all spies after each test
        jest.restoreAllMocks();
    });

    // Helper to simulate a click on a DOM element
    const simulateClick = (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            // Create a new MouseEvent and dispatch it
            const clickEvent = new window.MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            });
            element.dispatchEvent(clickEvent);
        } else {
            console.warn(`Element not found for selector: ${selector}`);
        }
    };

    describe('onCancel', () => {
        it('should send a message to close the page when cancel button is clicked', async () => {
            // Ensure the form is visible for interaction
            document.getElementById('form').style.display = 'block';

            // Simulate click on the cancel button
            simulateClick('#cancel');

            // Expect sendMessage to be called once by closePage
            expect(browserMock.runtime.sendMessage).toHaveBeenCalledTimes(1);
            expect(browserMock.runtime.sendMessage).toHaveBeenCalledWith({ type: 'close' });
        });
    });

    describe('onAddSites', () => {
        it('should send a message to add sites when addSites button is clicked', async () => {
            // Mock the values in the form
            document.getElementById('sites').value = 'site1.com\nsite2.com';
            document.getElementById('blockSet').innerHTML = '<option value="1" selected>Block Set 1</option>';
            document.getElementById('blockSet').value = '1';

            // Ensure the form is visible for interaction
            document.getElementById('form').style.display = 'block';

            // Spy on the form's submit event to prevent default behavior
            const form = document.getElementById('form');
            const submitSpy = jest.fn((event) => event.preventDefault());
            form.addEventListener('submit', submitSpy);

            // Simulate click on the addSites button
            simulateClick('#addSites');

            expect(submitSpy).toHaveBeenCalledTimes(1); // Ensure form submission was attempted and prevented
            // Expect sendMessage to be called twice: once by onAddSites, once by closePage
            expect(browserMock.runtime.sendMessage).toHaveBeenCalledTimes(2);
            expect(browserMock.runtime.sendMessage).toHaveBeenCalledWith({
                type: 'add-sites',
                sites: 'site1.com site2.com', // cleanSites from common.js should process this
                set: '1'
            });
            expect(jqueryHideSpy).toHaveBeenCalledWith({ effect: "fade", complete: expect.any(Function) });

            form.removeEventListener('submit', submitSpy);
        });
    });

    describe('initForm and refreshPage', () => {
        it('should initialize the form and populate block sets on page load', async () => {
            // The beforeEach hook already triggers DOMContentLoaded and calls refreshPage
            // We need to wait for the async operations (browser.storage.local.get) to complete
            await new Promise(resolve => setTimeout(resolve, 0)); // Allow promises to resolve

            expect(browserMock.storage.local.get).toHaveBeenCalledWith("sync");
            expect(browserMock.storage.local.get).toHaveBeenCalledWith(); // Called after sync check
            expect(jqueryHtmlSpy).toHaveBeenCalledWith(""); // Clear blockSet
            expect(jqueryButtonSpy).toHaveBeenCalledTimes(6); // addSites and cancel buttons
            expect(jqueryClickSpy).toHaveBeenCalledTimes(2); // addSites and cancel buttons
            // Update expectation to include set names
            expect(document.getElementById('blockSet').innerHTML).toContain('<option value="1">Block Set 1 (Set One)</option>');
            expect(document.getElementById('blockSet').innerHTML).toContain('<option value="2">Block Set 2 (Set Two)</option>');
            expect(jqueryShowSpy).toHaveBeenCalled(); // Show the form
        });

        it('should handle errors during options retrieval', async () => {
            browserMock.storage.local.get.mockImplementationOnce(() => Promise.reject(new Error('Storage error')));

            // Manually re-trigger DOMContentLoaded to re-initialize the application for this test
            const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
            document.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 0)); // Allow promises to resolve

            // Expect the dialog to be opened
            expect(jqueryDialogSpy).toHaveBeenCalledWith("open");
        });
    });
});

// Mock the cleanSites function from common.js
// This is a temporary mock to allow add-sites.test.js to run independently
// In a real scenario, common.js should be properly tested and imported.
function cleanSites(sites) {
    return sites.replace(/\s+/g, ' ').trim();
}

// Mock the cleanOptions function from common.js
function cleanOptions(options) {
    // This is a simplified mock. In a real scenario, common.js should be properly tested and imported.
    return options;
}

// Mock the setTheme function from common.js
function setTheme(theme) {
    // This is a simplified mock. In a real scenario, common.js should be properly tested and imported.
    return;
}

// Mock the log and warn functions
function log(message) {
    // console.log(message);
}

function warn(message) {
    // console.warn(message);
}

// Mock getElement function
function getElement(id) {
    return document.getElementById(id);
}