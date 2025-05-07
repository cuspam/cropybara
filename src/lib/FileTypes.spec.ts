import { describe, expect, it } from 'vitest';
import { FileTypes } from './FileTypes';

describe('FileTypes', () => {
  describe('getMimeByFilename', () => {
    it('should return the correct MIME type for a known filename with extension', () => {
      expect(FileTypes.getMimeByFilename('image.jpg')).toBe('image/jpeg');
    });

    it('should return application/octet-stream for a filename without a dot', () => {
      expect(FileTypes.getMimeByFilename('jpg')).toBe('application/octet-stream');
    });

    it('should return application/octet-stream for a filename ending with a dot', () => {
      expect(FileTypes.getMimeByFilename('filenameendingwithdot.')).toBe(
        'application/octet-stream',
      );
    });
  });

  describe('isZipArchive', () => {
    it('should return true for a valid zip file based on MIME type and filename', () => {
      const file = new File([''], 'archive.zip', { type: 'application/zip' });
      expect(FileTypes.isZipArchive(file)).toBe(true);
    });

    it('should return false for a non-zip file with different MIME type', () => {
      const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
      expect(FileTypes.isZipArchive(file)).toBe(false);
    });

    it('should return true for a zip filename but incorrect MIME type', () => {
      const file = new File([''], 'archive.zip', { type: 'application/pdf' });
      expect(FileTypes.isZipArchive(file)).toBe(true);
    });

    it('should return true for a non-zip filename but correct MIME type', () => {
      const file = new File([''], 'archive.cbz', { type: 'application/zip' });
      expect(FileTypes.isZipArchive(file)).toBe(true);
    });

    it('should return false for a file with no type or extension', () => {
      const file = new File([''], 'unknownfile', { type: '' });
      expect(FileTypes.isZipArchive(file)).toBe(false);
    });
  });
});
