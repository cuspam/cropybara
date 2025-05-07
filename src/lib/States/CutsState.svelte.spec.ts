import { describe, expect, it } from 'vitest';
import { CutsState } from '$lib/States/CutsState.svelte';

describe('CutsState', () => {
  describe('constructor', () => {
    it('should initialize cuts on creation', () => {
      const cuts = new CutsState(50, 400, 1000, 5);
      expect(cuts.cuts).toStrictEqual([400, 800]);
    });

    it('should throw an error if min distance is greater than max distance', () => {
      expect(() => new CutsState(500, 400, 1000, 5)).toThrowError();
    });

    it.each([0, -1, Number.NaN])(
      'should throw an error if minDistance has incorrect value: %s',
      (value) => {
        expect(() => new CutsState(value, 400, 1000, 5)).toThrowError();
      }
    );

    it.each([0, -1, Number.NaN])(
      'should throw an error if maxDistance has incorrect value: %s',
      (value) => {
        expect(() => new CutsState(50, value, 1000, 5)).toThrowError();
      }
    );

    it.each([0, -1, Number.NaN])(
      'should throw an error if height has incorrect value: %s',
      (value) => {
        expect(() => new CutsState(300, 400, value, 5)).toThrowError();
      }
    );

    it.each([0, -1, Number.NaN])(
      'should throw an error if divisor has incorrect value: %s',
      (value) => {
        expect(() => new CutsState(300, 400, 1000, value)).toThrowError();
      }
    );
  });

  describe('move', () => {
    it('should allow move cuts', () => {
      const cuts = new CutsState(50, 400, 1000, 5);

      cuts.move(1, 700);
      expect(cuts.cuts).toStrictEqual([400, 700]);

      cuts.move(0, 300);
      expect(cuts.cuts).toStrictEqual([300, 700]);
    });

    it('should enforce limits with cascading effect', () => {
      const cuts = new CutsState(100, 150, 1000, 10);
      expect(cuts.cuts).toStrictEqual([150, 300, 450, 600, 750, 900]);

      cuts.move(1, 160);
      expect(cuts.cuts).toStrictEqual([150, 250, 400, 550, 700, 850]);
    });

    it('should enforce min distance limit', () => {
      const cuts = new CutsState(350, 400, 1000, 5);

      cuts.move(1, 420);
      expect(cuts.cuts).toStrictEqual([400, 750]);
    });

    it('should enforce max distance limit', () => {
      const cuts = new CutsState(50, 400, 1000, 5);

      cuts.move(1, 850);
      expect(cuts.cuts).toStrictEqual([400, 800]);
    });

    it('should create new cuts at a bottom and remove if it becomes redundant', () => {
      const cuts = new CutsState(50, 400, 1000, 5);

      cuts.move(1, 450);
      expect(cuts.cuts).toStrictEqual([400, 450, 850]);

      cuts.move(1, 600);
      expect(cuts.cuts).toStrictEqual([400, 600]);
    });

    it('should not create new cuts if it is not needed', () => {
      const cuts = new CutsState(50, 2000, 1000, 5);
      expect(cuts.cuts).length(0);
    });

    it('should apply divisor to the positions of cuts', () => {
      const cuts = new CutsState(50, 399, 1000, 5);
      expect(cuts.cuts).toStrictEqual([395, 790]);
    });
  });

  describe('cleanup', () => {
    it('should return false and not change cuts if none are redundant', () => {
      const cuts = new CutsState(100, 200, 1000, 1);
      const initialState = [...cuts.cuts]; // Copy initial state

      expect(cuts.cleanup()).toBe(false);
      expect(cuts.cuts).toStrictEqual(initialState);
    });

    it('should remove a single redundant cut in the middle and return true', () => {
      const cuts = new CutsState(100, 300, 1000, 1); // [300, 600, 900]
      cuts.move(1, 400); // [300, 400, 700]
      cuts.move(2, 500); // [300, 400, 500, 800]

      expect(cuts.cleanup()).toBe(true);
      expect(cuts.cuts).toStrictEqual([300, 500, 800]);
    });

    it('should remove a redundant first cut and return true', () => {
      const cuts = new CutsState(100, 300, 1000, 1); // [300, 600, 900]
      cuts.move(0, 100); // [100, 400, 700]
      cuts.move(1, 300); // [100, 300, 600, 900]

      expect(cuts.cleanup()).toBe(true);
      expect(cuts.cuts).toStrictEqual([300, 600, 900]);
    });

    it('should remove multiple adjacent redundant cuts and return true', () => {
      const cuts = new CutsState(50, 300, 1000, 1); // [300, 600, 900]
      cuts.move(1, 350); // [300, 350, 650, 950]
      cuts.move(2, 400); // [300, 350, 400, 700]
      cuts.move(3, 500); // [300, 350, 400, 500, 800]

      expect(cuts.cleanup()).toBe(true);
      expect(cuts.cuts).toStrictEqual([300, 500, 800]);
    });
  });
});
