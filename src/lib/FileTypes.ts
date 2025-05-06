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

  public static getMimeByFilename(filename: string): string {
    const ext = filename.split('.').pop()!;
    return this.mapping[ext.toLowerCase()] ?? 'application/octet-stream';
  }

  public static isZipArchive(file: File): boolean {
    return [file.type, this.getMimeByFilename(file.name)].includes(this.mapping.zip);
  }
}
