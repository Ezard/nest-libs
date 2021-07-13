import { chunkArray } from './utils';

describe('utils', () => {
  describe('chunkArray', () => {
    it('should return a single chunk if the number of items is less than the chunk size', () => {
      const items = ['foo'];
      const chunkSize = 5;

      const result = chunkArray(items, chunkSize);

      expect(result).toStrictEqual([['foo']]);
    });

    it('should return a single chunk if the number of items is equal to the chunk size', () => {
      const items = ['foo', 'bar'];
      const chunkSize = 2;

      const result = chunkArray(items, chunkSize);

      expect(result).toStrictEqual([['foo', 'bar']]);
    });

    it('should return a multiple chunks if the number of items is greater than the chunk size', () => {
      const items = ['foo', 'bar', 'baz'];
      const chunkSize = 2;

      const result = chunkArray(items, chunkSize);

      expect(result).toStrictEqual([['foo', 'bar'], ['baz']]);
    });
  });
});
