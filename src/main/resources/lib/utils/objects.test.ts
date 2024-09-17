import {emptyToUndefined} from './objects';

describe('emptyToUndefined', () => {
    it('should return `undefined` if the input is `null` or `undefined`', () => {
        expect(emptyToUndefined(null)).toBe(undefined);
        expect(emptyToUndefined(undefined)).toBe(undefined);
    });

    it('should return `undefined` if the input array is empty', () => {
        expect(emptyToUndefined([])).toBe(undefined);
    });

    it('should return same input array if it is not empty', () => {
        expect(emptyToUndefined(['1'])).toEqual(['1']);
        expect(emptyToUndefined([undefined])).toEqual([undefined]);
        expect(emptyToUndefined([1, 2])).toEqual([1, 2]);
    });
});
