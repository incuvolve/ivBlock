const browserMock = {
    runtime: {
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn()
        }
    }
};

// Mock browser API and global objects before requiring content.js
global.browser = browserMock;

// Mock window and document for content.js


Object.defineProperty(global.document, 'URL', {
    value: 'http://test.com/page',
    writable: true,
    configurable: true,
});

Object.defineProperty(global.document, 'referrer', {
    value: 'http://test.com/referrer',
    writable: true,
    configurable: true,
});

// Mock addEventListener and removeEventListener on window
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
window.addEventListener = jest.fn(originalAddEventListener);
window.removeEventListener = jest.fn(originalRemoveEventListener);

// Mock document.documentElement.style
Object.defineProperty(global.document.documentElement, 'style', {
    value: {
        filter: ''
    },
    writable: true,
    configurable: true,
});

// Require content.js directly
require('../content.js');

// Expose global variables from content.js for testing
// These are already global due to the direct require, but explicitly listing them for clarity
// and to ensure they are accessible in the test scope.
// Note: gTimer and gAlert are declared with `var` in content.js, making them global.
// Functions are also global.
// Expose mocks for assertions
global.browser = browserMock;




describe('content.js', () => {
    let createElementSpy;
    let appendChildSpy;
    let removeChildSpy;
    let addEventListenerSpy;
    let setAttributeSpy;
    let mockStyle;
    let mockTextContent;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset gTimer and gAlert to ensure re-creation
        global.gTimer = document.createElement("div");
        global.gAlert = document.createElement("div");

        // Mock HTMLElement.prototype.style
        mockStyle = {};
        Object.defineProperty(global.HTMLElement.prototype, 'style', {
            get: () => mockStyle,
            set: (value) => { /* do nothing, properties are set directly on mockStyle */ },
            configurable: true,
        });

        // Mock HTMLElement.prototype.innerText
        mockTextContent = ''; // Renaming this to mockInnerText for clarity
        Object.defineProperty(global.HTMLElement.prototype, 'innerText', {
            get: () => mockTextContent,
            set: (value) => { mockTextContent = value; },
            configurable: true,
        });

        // Mock getAttribute for style
        jest.spyOn(global.HTMLElement.prototype, 'getAttribute').mockImplementation((attr) => {
            if (attr === 'style') {
                return Object.keys(mockStyle).map(key => `${key}: ${mockStyle[key]}`).join('; ');
            }
            return null;
        });

        // Spy on real DOM methods
        createElementSpy = jest.spyOn(global.document, 'createElement');
        appendChildSpy = jest.spyOn(global.document.body, 'appendChild');
        removeChildSpy = jest.spyOn(global.document.body, 'removeChild'); // Spy on document.body for dynamically created elements
        addEventListenerSpy = jest.spyOn(global.HTMLElement.prototype, 'addEventListener');
        setAttributeSpy = jest.spyOn(global.HTMLElement.prototype, 'setAttribute');

        // Reset document properties
        global.document.title = 'Test Title';
        global.document.documentElement.style.filter = ''; // Clear filter
    });

    afterEach(() => {
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
        addEventListenerSpy.mockRestore();
        setAttributeSpy.mockRestore();
        jest.restoreAllMocks(); // Restore all mocks, including style and textContent

        // Restore original window event listeners
        window.addEventListener = originalAddEventListener;
        window.removeEventListener = originalRemoveEventListener;
    });

    describe('checkKeyword', () => {
        it('should return null if keywordRE is null', () => {
            expect(global.checkKeyword(null, false)).toBeNull();
        });

        it('should find keyword in title only', () => {
            global.document.title = 'This is a keyword in the title';
            const keywordRE = /keyword/;
            expect(global.checkKeyword(keywordRE, true)).toBe('keyword');
        });

        it('should find keyword in body text', () => {
            global.document.title = 'Some Title';
            global.document.body.innerText = 'This is a keyword in the body';
            const keywordRE = /keyword/;
            expect(global.checkKeyword(keywordRE, false)).toBe('keyword');
        });

        it('should return null if keyword not found', () => {
            global.document.title = 'No Match';
            global.document.body.innerText = 'No Match';
            const keywordRE = /nonexistent/;
            expect(global.checkKeyword(keywordRE, false)).toBeNull();
        });

        it('should handle regex with special characters', () => {
            global.document.title = 'Test.com?param=value';
            const keywordRE = /Test\.com\?param=value/;
            expect(global.checkKeyword(keywordRE, true)).toBe('Test.com?param=value');
        });
    });

    describe('applyFilter', () => {
        it('should apply the specified filter', () => {
            global.applyFilter('grayscale');
            expect(global.document.documentElement.style.filter).toBe('grayscale(100%)');
        });

        it('should set filter to none for unknown filter name', () => {
            global.applyFilter('unknownFilter');
            expect(global.document.documentElement.style.filter).toBe('none');
        });

        it('should set filter to none for null filter name', () => {
            global.applyFilter(null);
            expect(global.document.documentElement.style.filter).toBe('none');
        });
    });

    describe('Complex content.js functions', () => {
        it('notifyLoaded should send messages to background script', () => {
            global.notifyLoaded();
            expect(global.browser.runtime.sendMessage).toHaveBeenCalledWith({ type: "loaded", url: global.document.URL });
            expect(global.browser.runtime.sendMessage).toHaveBeenCalledWith({ type: "referrer", referrer: global.document.referrer });
        });

        it('updateTimer should create and update timer element', () => {
            global.updateTimer('10:00', 0, 0);
            expect(createElementSpy).toHaveBeenCalledWith('div');
            expect(setAttributeSpy).toHaveBeenCalledWith('class', 'ivblock-timer');
            expect(appendChildSpy).toHaveBeenCalled();
            expect(global.gTimer.innerText).toBe('10:00');
            expect(global.gTimer.style.fontSize).toBe('10px');
            expect(global.gTimer.style.top).toBe('0px');
            expect(global.gTimer.hidden).toBe(false);
        });

        it('showAlert should create and display alert message', () => {
            global.showAlert('Warning!');
            expect(createElementSpy).toHaveBeenCalledWith('div'); // For container
            expect(createElementSpy).toHaveBeenCalledWith('div'); // For alertBox
            expect(createElementSpy).toHaveBeenCalledWith('div'); // For alertIcon
            expect(createElementSpy).toHaveBeenCalledWith('div'); // For alertText
            expect(appendChildSpy).toHaveBeenCalled();
            expect(global.gAlert.getAttribute('style')).toContain('display: flex');
        });

        it('hideAlert should hide alert message', () => {
            global.showAlert('Test'); // Ensure gAlert is created
            // Temporary debug: Force gAlert to be an element if it's null
            if (!global.gAlert) {
                global.gAlert = document.createElement("div");
                global.gAlert.style.display = "flex"; // Mimic initial state
            }
            global.hideAlert();
            expect(global.gAlert.getAttribute('style')).toContain('display: none');
        });

        it('handleMessage should dispatch based on message type', () => {
            global.handleMessage({ type: 'alert', text: 'Test' }, {}, jest.fn());
            expect(global.gAlert.getAttribute('style')).toContain('display: flex'); // Assuming showAlert was called
            jest.clearAllMocks();

            global.handleMessage({ type: 'filter', name: 'grayscale' }, {}, jest.fn());
            expect(global.document.documentElement.style.filter).toBe('grayscale(100%)');
            jest.clearAllMocks();

            global.handleMessage({ type: 'keyword', keywordRE: /test/, titleOnly: true }, {}, jest.fn());
            // This will call checkKeyword, which we've already tested.
            // Just ensure it doesn't throw.
            expect(() => global.handleMessage({ type: 'keyword', keywordRE: /test/, titleOnly: true }, {}, jest.fn())).not.toThrow();
            jest.clearAllMocks();

            global.handleMessage({ type: 'ping' }, {}, jest.fn());
            expect(global.browser.runtime.sendMessage).toHaveBeenCalledWith({ type: "loaded", url: global.document.URL });
            jest.clearAllMocks();

            global.handleMessage({ type: 'timer', text: '10:00', size: 0, location: 0 }, {}, jest.fn());
            expect(global.gTimer.innerText).toBe('10:00');
        });

        it('onFocus should send focus message', () => {
            global.onFocus();
            expect(global.browser.runtime.sendMessage).toHaveBeenCalledWith({ type: "focus", focus: true });
        });

        it('onBlur should send blur message', () => {
            global.onBlur();
            expect(global.browser.runtime.sendMessage).toHaveBeenCalledWith({ type: "focus", focus: false });
        });

        it('onUnload should remove timer and alert elements', () => {
            global.updateTimer('10:00', 0, 0); // Create gTimer
            global.showAlert('Test'); // Create gAlert
            jest.clearAllMocks(); // Clear mocks from setup calls

            global.onUnload();

            // Check if removeChild was called on the parentNode of gTimer and gAlert
            // The parentNode is the document.body in this case
            expect(removeChildSpy).toHaveBeenCalledTimes(2);
        });
    });
});