import {match} from './match';

describe('match', () => {
  describe('include', () => {
    describe('glob', () => {
      it('should match', () => {
        const fn = match({include: '*.ts'});
        expect(fn('abc.ts')).toBeTruthy();
      });

      it('should not match', () => {
        const fn = match({include: '*.ts'});
        expect(fn('abc.js')).toBeFalsy();
      });
    });

    describe('regexp', () => {
      it('should match', () => {
        const fn = match({include: /\.ts$/});
        expect(fn('abc.ts')).toBeTruthy();
      });

      it('should not match', () => {
        const fn = match({include: /\.ts$/});
        expect(fn('abc.js')).toBeFalsy();
      });
    });

    describe('function', () => {
      it('should match', () => {
        const fn = match({include: () => true});
        expect(fn('abc.ts')).toBeTruthy();
      });

      it('should not match', () => {
        const fn = match({include: () => false});
        expect(fn('abc.js')).toBeFalsy();
      });
    });
  });

  describe('exclude', () => {
    describe('glob', () => {
      it('should match', () => {
        const fn = match({exclude: '*.ts'});
        expect(fn('abc.js')).toBeTruthy();
      });

      it('should not match', () => {
        const fn = match({exclude: '*.ts'});
        expect(fn('abc.ts')).toBeFalsy();
      });
    });

    describe('regexp', () => {
      it('should match', () => {
        const fn = match({exclude: /\.ts$/});
        expect(fn('abc.js')).toBeTruthy();
      });

      it('should not match', () => {
        const fn = match({exclude: /\.ts$/});
        expect(fn('abc.ts')).toBeFalsy();
      });
    });

    describe('function', () => {
      it('should match', () => {
        const fn = match({exclude: () => false});
        expect(fn('abc.js')).toBeTruthy();
      });

      it('should not match', () => {
        const fn = match({exclude: () => true});
        expect(fn('abc.ts')).toBeFalsy();
      });
    });
  });
});
