const fs = require('fs');
const path = require('path');
const vm = require('vm');

const commonJsPath = path.resolve(__dirname, '../common.js');
const commonJsCode = fs.readFileSync(commonJsPath, 'utf8');

const context = {};
vm.createContext(context);
vm.runInContext(commonJsCode, context);

const {
    cleanSites,
    formatTime,
    getCleanURL,
    checkTimePeriodsFormat,
    allTrue,
    hashCode32
} = context;

describe('common.js tests', () => {
    describe('cleanSites', () => {
        it('should remove extra whitespace and sort sites', () => {
            const sites = '  site2.com   site1.com  site3.com  ';
            const expected = 'site1.com site2.com site3.com';
            expect(cleanSites(sites)).toBe(expected);
        });

        it('should handle an empty string', () => {
            expect(cleanSites('')).toBe('');
        });

        it('should handle a single site', () => {
            expect(cleanSites('  site1.com  ')).toBe('site1.com');
        });
    });

    describe('formatTime', () => {
        it('should format seconds into HH:MM:SS', () => {
            expect(formatTime(3661)).toBe('01:01:01');
        });

        it('should handle 0 seconds', () => {
            expect(formatTime(0)).toBe('00:00:00');
        });

        it('should handle negative seconds', () => {
            expect(formatTime(-3661)).toBe('-01:01:01');
        });
    });

    describe('getCleanURL', () => {
        it('should remove view-source: prefix', () => {
            const url = 'view-source:http://example.com';
            const expected = 'http://example.com';
            expect(getCleanURL(url)).toBe(expected);
        });

        it('should remove about:reader?url= prefix and decode URL', () => {
            const url = 'about:reader?url=http%3A%2F%2Fexample.com';
            const expected = 'http://example.com';
            expect(getCleanURL(url)).toBe(expected);
        });

        it('should return the same url if no prefix is present', () => {
            const url = 'http://example.com';
            expect(getCleanURL(url)).toBe(url);
        });
    });

    describe('checkTimePeriodsFormat', () => {
        it('should return true for valid time periods', () => {
            expect(checkTimePeriodsFormat('0900-1700')).toBe(true);
            expect(checkTimePeriodsFormat('0900-1700,1800-2000')).toBe(true);
        });

        it('should return false for invalid time periods', () => {
            expect(checkTimePeriodsFormat('0900-1700,')).toBe(false);
            expect(checkTimePeriodsFormat('09:00-17:00')).toBe(false);
            expect(checkTimePeriodsFormat('900-1700')).toBe(false);
        });
    });

    describe('allTrue', () => {
        it('should return true if all elements are true', () => {
            expect(allTrue([true, true, true])).toBe(true);
        });

        it('should return false if any element is false', () => {
            expect(allTrue([true, false, true])).toBe(false);
        });

        it('should return false for non-array input', () => {
            expect(allTrue('not an array')).toBe(false);
        });
    });

    describe('hashCode32', () => {
        it('should generate a 32-bit integer hash', () => {
            const str = 'hello world';
            // This is the expected hash for 'hello world' from the original C# implementation of this function
            expect(hashCode32(str)).toBe(1794106052);
        });

        it('should generate a different hash for a different string', () => {
            const str1 = 'hello world';
            const str2 = 'hello world!';
            expect(hashCode32(str1)).not.toBe(hashCode32(str2));
        });
    });
});
