const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const optionsHtmlPath = path.resolve(__dirname, '../options.html');
const optionsHtml = fs.readFileSync(optionsHtmlPath, 'utf8');

const jqueryPath = path.resolve(__dirname, '../jquery-ui/jquery.min.js');
const jqueryCode = fs.readFileSync(jqueryPath, 'utf8');

const commonJsPath = path.resolve(__dirname, '../common.js');
const commonJsCode = fs.readFileSync(commonJsPath, 'utf8');

const optionsJsPath = path.resolve(__dirname, '../options.js');
const optionsJsCode = fs.readFileSync(optionsJsPath, 'utf8');

let dom;
let window;
let document;

// Mock browser APIs
const browser = {
    storage: {
        local: {
            get: jest.fn(() => Promise.resolve({ numSets: 4, simplified: true })),
            set: jest.fn(() => Promise.resolve()),
        },
        sync: {
            get: jest.fn(() => Promise.resolve({})),
            set: jest.fn(() => Promise.resolve()),
        },
    },
    runtime: {
        getManifest: () => ({ version: '1.2.3' }),
        sendMessage: jest.fn(),
        getPlatformInfo: jest.fn(() => Promise.resolve({ os: 'mac' })),
    },
    tabs: {
        create: jest.fn(),
    },
    permissions: {
        request: jest.fn(),
    },
};

describe('options.js tests', () => {

    beforeEach((done) => {
        dom = new JSDOM(optionsHtml, { runScripts: 'dangerously', resources: 'usable' });
        window = dom.window;
        document = window.document;
        window.browser = browser;

        // Modify the optionsHtml to remove the default value from numSets input
        const modifiedOptionsHtml = optionsHtml.replace('<input id="numSets" type="text" size="2" title="Default: 6">', '<input id="numSets" type="text" size="2">');

        dom = new JSDOM(modifiedOptionsHtml, { runScripts: 'dangerously', resources: 'usable' });
        window = dom.window;
        document = window.document;
        window.browser = browser;

        // Set initial value for numSets input (this will be overwritten by retrieveOptions)
        document.getElementById('numSets').value = '6';

        // Mock global variables and functions from options.js and common.js
        window.MAX_SETS = 10;
        window.DEFAULT_BLOCK_URL = "blocked.html";
        window.DELAYED_BLOCK_URL = "delayed.html";
        window.PASSWORD_BLOCK_URL = "password.html";
        window.ALL_DAY_TIMES = "0000-2400";

        window.GENERAL_OPTIONS = {
            "numSets": { type: "string", id: "numSets" },
            "simplified": { type: "boolean", id: "simplified" },
            "accessPreventTimes": { type: "string", id: "accessPreventTimes" },
            "overrideMins": { type: "string", id: "overrideMins" },
            "overrideLimitNum": { type: "string", id: "overrideLimitNum" },
            "warnSecs": { type: "string", id: "warnSecs" },
            "saveSecs": { type: "string", id: "saveSecs" },
            "processTabsSecs": { type: "string", id: "processTabsSecs" },
            "clockOffset": { type: "string", id: "clockOffset" },
            "ignoreJumpSecs": { type: "string", id: "ignoreJumpJumpSecs" },
            "password": { type: "string", id: "accessPassword" },
            "orp": { type: "string", id: "overridePassword" },
            "hpp": { type: "boolean", id: "hidePassword" },
            "oa": { type: "string", id: "optionsAccess" },
            "oc": { type: "string", id: "overrideCode" },
            "ocm": { type: "boolean", id: "overrideConfirm" },
            "theme": { type: "string", id: "theme" },
            "customStyle": { type: "string", id: "customStyle" },
            "contextMenu": { type: "boolean", id: "contextMenu" },
            "matchSubdomains": { type: "boolean", id: "matchSubdomains" },
            "disableLink": { type: "boolean", id: "disableLink" },
            "clockTimeFormat": { type: "string", id: "clockTimeFormat" },
            "allFocused": { type: "boolean", id: "allFocused" },
            "useDocFocus": { type: "boolean", id: "useDocFocus" },
            "accessCodeImage": { type: "boolean", id: "accessCodeImage" },
            "syncStorage": { type: "boolean", id: "syncStorage" },
            "autoExportSync": { type: "boolean", id: "autoExportSync" },
            "allowLBWebsite": { type: "boolean", id: "allowLBWebsite" },
            "diagMode": { type: "boolean", id: "diagMode" },
            "timerVisible": { type: "boolean", id: "timerVisible" },
            "timerSize": { type: "string", id: "timerSize" },
            "timerLocation": { type: "string", id: "timerLocation" },
            "timerBadge": { type: "boolean", id: "timerBadge" },
            "warnImmediate": { type: "boolean", id: "warnImmediate" },
            "processActiveTabs": { type: "boolean", id: "processActiveTabs" },
        };

        window.PER_SET_OPTIONS = {
            "setName": { type: "string", id: "setName" },
            "sites": { type: "string", id: "sites" },
            "times": { type: "string", id: "times" },
            "limitMins": { type: "string", id: "limitMins" },
            "limitPeriod": { type: "string", id: "limitPeriod" },
            "rollover": { type: "boolean", id: "rollover" },
            "countFocus": { type: "boolean", id: "countFocus" },
            "countAudio": { type: "boolean", id: "countAudio" },
            "conjMode": { type: "boolean", id: "conjMode" },
            "days": { type: "array", id: "day", def: [false, false, false, false, false, false, false] },
            "blockURL": { type: "string", id: "blockURL" },
            "customMsg": { type: "string", id: "customMsg" },
            "incogMode": { type: "string", id: "incogMode" },
            "applyFilter": { type: "boolean", id: "applyFilter" },
            "filterName": { type: "string", id: "filterName" },
            "filterMute": { type: "boolean", id: "filterMute" },
            "closeTab": { type: "boolean", id: "closeTab" },
            "activeBlock": { type: "boolean", id: "activeBlock" },
            "showKeyword": { type: "boolean", id: "showKeyword" },
            "titleOnly": { type: "boolean", id: "titleOnly" },
            "delayFirst": { type: "boolean", id: "delayFirst" },
            "delayAllowMins": { type: "string", id: "delayAllowMins" },
            "delaySecs": { type: "string", id: "delaySecs" },
            "delayAutoLoad": { type: "boolean", id: "delayAutoLoad" },
            "delayCancel": { type: "boolean", id: "delayCancel" },
            "reloadSecs": { type: "string", id: "reloadSecs" },
            "addHistory": { type: "boolean", id: "addHistory" },
            "allowOverride": { type: "boolean", id: "allowOverride" },
            "allowOverLock": { type: "boolean", id: "allowOverLock" },
            "disable": { type: "boolean", id: "disable" },
            "showTimer": { type: "boolean", id: "showTimer" },
            "allowRefers": { type: "boolean", id: "allowRefers" },
            "allowKeywords": { type: "boolean", id: "allowKeywords" },
            "waitSecs": { type: "string", id: "waitSecs" },
            "prevOpts": { type: "boolean", id: "prevOpts" },
            "prevGenOpts": { type: "boolean", id: "prevGenOpts" },
            "prevAddons": { type: "boolean", id: "prevAddons" },
            "prevSupport": { type: "boolean", id: "prevSupport" },
            "prevDebugging": { type: "boolean", id: "prevDebugging" },
            "prevOverride": { type: "boolean", id: "prevOverride" },
            "limitOffset": { type: "string", id: "limitOffset" },
            "sitesURL": { type: "string", id: "sitesURL" },
            "regexpBlock": { type: "string", id: "regexpBlock" },
            "regexpAllow": { type: "string", id: "regexpAllow" },
            "ignoreHash": { type: "boolean", id: "ignoreHash" },
            "passwordRequire": { type: "string", id: "passwordRequire" },
            "passwordSetSpec": { type: "string", id: "passwordSetSpec" },
        };

        window.SUB_OPTIONS = {
            "applyFilter": ["filterName", "filterMute"],
            "allowOverride": ["allowOverLock"]
        };

        window.gFormHTML = ""; // Temporarily set to empty to prevent reset

        // Mock functions from common.js
        window.cleanSites = jest.fn((sites) => sites.replace(/\s+/g, ' ').trim().split(' ').sort().join(' '));
        window.formatTime = jest.fn();
        window.getCleanURL = jest.fn();
        window.checkTimePeriodsFormat = jest.fn((time) => time !== 'invalid-time');
        window.allTrue = jest.fn();
        window.hashCode32 = jest.fn();
        window.checkPosNumberFormat = jest.fn((num) => parseFloat(num) > 0);
        window.checkPosIntFormat = jest.fn((num) => parseInt(num) > 0);
        window.checkPosNegIntFormat = jest.fn((num) => !isNaN(parseInt(num)));
        window.checkBlockURLFormat = jest.fn((url) => url !== 'invalid-url');
        window.cleanTimePeriods = jest.fn((time) => time);
        window.getMinPeriods = jest.fn(() => []);
        window.getTimePeriodStart = jest.fn();
        window.updateRolloverTime = jest.fn();
        window.encodeDays = jest.fn();
        window.decodeDays = jest.fn();
        window.createAccessCode = jest.fn();
        window.getRegExpSites = jest.fn(() => ({ block: '', allow: '', refer: '', keyword: '' }));

        // Mock functions from options.js that are called by other functions
        window.updateBlockSetName = jest.fn();
        window.updatePasswordPageOptions = jest.fn();
        window.updateSubOptions = jest.fn();
        window.updateMoveSetButtons = jest.fn();
        window.disableSetOptions = jest.fn();
        window.disableGeneralOptions = jest.fn();
        window.disableImportOptions = jest.fn();
        window.disableNonAndroidOptions = jest.fn();
        window.confirmAccess = jest.fn();
        window.initAccessControlPrompt = jest.fn();
        window.displayAccessCode = jest.fn();
        window.accessPasswordShow = jest.fn();
        window.showClockOffsetTime = jest.fn();
        window.compileExportOptions = jest.fn();
        window.applyImportOptions = jest.fn();
        window.downloadBlobFile = jest.fn();
        window.exportOptions = jest.fn();
        window.importOptions = jest.fn();
        window.exportOptionsJSON = jest.fn();
        window.exportOptionsSync = jest.fn();
        window.importOptionsSync = jest.fn();
        window.openDiagnostics = jest.fn();
        window.swapSetOptions = jest.fn();
        window.resetSetOptions = jest.fn();
        window.cleanOptions = jest.fn((options) => options);
        window.cleanTimeData = jest.fn((options) => options);

        try {
            const jqueryScript = window.document.createElement('script');
            jqueryScript.textContent = jqueryCode;
            window.document.head.appendChild(jqueryScript);

            // Mock jQuery UI functions
            window.$.fn.dialog = jest.fn(() => ({ on: jest.fn() }));
            window.$.fn.tabs = jest.fn();
            window.$.fn.button = jest.fn();
            window.$.fn.effect = jest.fn();
            window.$.fn.html = jest.fn(function(content) {
                if (content !== undefined) {
                    // If content is provided, it's a setter, so do nothing
                    return this;
                } else {
                    // If no content, it's a getter, return the actual HTML
                    return this[0].innerHTML;
                }
            });

            const commonScript = window.document.createElement('script');
            commonScript.textContent = commonJsCode;
            window.document.head.appendChild(commonScript);

            const optionsScript = window.document.createElement('script');
            // Remove the DOMContentLoaded listener from options.js to prevent automatic initialization
            optionsScript.textContent = optionsJsCode.replace('document.addEventListener("DOMContentLoaded", retrieveOptions);', '');
            window.document.head.appendChild(optionsScript);
        } catch (e) {
            console.error(e);
        }

        window.addEventListener('load', () => {
            // We need to manually trigger DOMContentLoaded because we are not in a browser
            window.document.dispatchEvent(new window.Event('DOMContentLoaded', {
                bubbles: true,
                cancelable: true,
            }));
            done();
        });
    });

    describe('isTrue', () => {
        it('should return true for "true" (case-insensitive)', () => {
            expect(window.isTrue('true')).toBe(true);
            expect(window.isTrue('True')).toBe(true);
            expect(window.isTrue('TRUE')).toBe(true);
        });

        it('should return false for other strings', () => {
            expect(window.isTrue('false')).toBe(false);
            expect(window.isTrue('t')).toBe(false);
            expect(window.isTrue('')).toBe(false);
            expect(window.isTrue(' ')).toBe(false);
        });
    });

    describe('initForm', () => {
        it('should create the correct number of block sets', () => {
            window.MAX_SETS = 10;
            window.initForm(3);
            const tabs = document.querySelectorAll('[id^=tabBlockSet]');
            expect(tabs.length).toBe(3);
        });

        it('should show simplified options', () => {
            window.MAX_SETS = 10;
            window.initForm(1);
            window.showSimplifiedOptions(true);
            expect(document.querySelector('.simplifiable').style.display).toBe('none');
        });

        it('should show full options', () => {
            window.MAX_SETS = 10;
            window.initForm(1);
            window.showSimplifiedOptions(false);
            expect(document.querySelector('.simplifiable').style.display).toBe('');
        });
    });

    describe('saveOptions', () => {
        it('should return false for invalid time format', () => {
            window.MAX_SETS = 10;
            window.initForm(1);
            document.getElementById('times1').value = 'invalid-time';
            expect(window.saveOptions({ data: { closeOptions: false } })).toBe(false);
        });

        it('should return false for invalid limitMins format', () => {
            window.MAX_SETS = 10;
            window.initForm(1);
            document.getElementById('limitMins1').value = '-10';
            expect(window.saveOptions({ data: { closeOptions: false } })).toBe(false);
        });

        it('should return false for invalid delaySecs format', () => {
            window.MAX_SETS = 10;
            window.initForm(1);
            document.getElementById('delaySecs1').value = 'abc';
            expect(window.saveOptions({ data: { closeOptions: false } })).toBe(false);
        });
    });

    describe('retrieveOptions', () => {
        it('should populate the form with the stored options', async () => {
            await window.retrieveOptions();
            expect(document.getElementById('numSets').value).toBe('6');
        });
    });
});
