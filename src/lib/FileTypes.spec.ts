import { describe, expect, it } from 'vitest';
import { FileTypes } from './FileTypes';

describe('FileTypes', () => {
  it('should return the correct MIME type for a known filename with extension', () => {
    expect(FileTypes.getMimeByFilename('image.jpg')).toBe('image/jpeg');
  });

  it('should return application/octet-stream for a filename without a dot', () => {
    expect(FileTypes.getMimeByFilename('jpg')).toBe('application/octet-stream');
  });

  it('should return application/octet-stream for a filename ending with a dot', () => {
    expect(FileTypes.getMimeByFilename('filenameendingwithdot.')).toBe('application/octet-stream');
  });
});
