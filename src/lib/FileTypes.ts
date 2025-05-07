export class FileTypes {
  public static mapping: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    jfif: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    zip: 'application/zip',
  };

  protected static readonly defaultMime = 'application/octet-stream';

  public static getMimeByFilename(filename: string): string {
    const ext = filename.split('.');
    if (ext.length > 1) {
      return this.mapping[ext.pop()!.toLowerCase()] ?? this.defaultMime;
    } else {
      return this.defaultMime;
    }
  }

  public static isZipArchive(file: File): boolean {
    return [file.type, this.getMimeByFilename(file.name)].includes(this.mapping.zip);
  }
}
