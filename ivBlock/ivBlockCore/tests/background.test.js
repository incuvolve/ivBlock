const fs = require('fs');
const path = require('path');
const vm = require('vm');

const backgroundJsPath = path.resolve(__dirname, '../background.js');
const backgroundJsCode = fs.readFileSync(backgroundJsPath, 'utf8');

// Extract the testURL function
const testURLRegex = /function testURL\([^)]*\) \{[\s\S]*?\}/;
const testURLFunctionCode = backgroundJsCode.match(testURLRegex)[0];

const context = {};
vm.createContext(context);
vm.runInContext(testURLFunctionCode, context);

const { testURL: originalTestURL } = context;
const testURL = (...args) => !!originalTestURL(...args);

describe('background.js tests', () => {
    describe('testURL', () => {
        const blockRE = /example\.com/;
        const allowRE = /allowed\.example\.com/;
        const referRE = /referrer\.com/;

        it('should block a matching URL', () => {
            const url = 'http://example.com';
            expect(testURL(url, '', blockRE, null, null, false)).toBe(true);
        });

        it('should not block a non-matching URL', () => {
            const url = 'http://another-site.com';
            expect(testURL(url, '', blockRE, null, null, false)).toBe(false);
        });

        it('should not block an allowed URL, even if it matches the block pattern', () => {
            const url = 'http://allowed.example.com';
            expect(testURL(url, '', blockRE, allowRE, null, false)).toBe(false);
        });

        it('should block based on referrer when allowRefers is false', () => {
            const url = 'http://any-site.com';
            const referrer = 'http://referrer.com';
            expect(testURL(url, referrer, null, null, referRE, false)).toBe(true);
        });

        it('should not block based on referrer when allowRefers is true', () => {
            const url = 'http://example.com';
            const referrer = 'http://referrer.com';
            expect(testURL(url, referrer, blockRE, null, referRE, true)).toBe(false);
        });

        it('should block if block pattern matches and referrer does not, when allowRefers is true', () => {
            const url = 'http://example.com';
            const referrer = 'http://google.com';
            expect(testURL(url, referrer, blockRE, null, referRE, true)).toBe(true);
        });
    });
});